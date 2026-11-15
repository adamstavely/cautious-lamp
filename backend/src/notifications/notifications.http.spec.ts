import { INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { AuthGuard } from '../auth/auth.guard';
import { AuthService } from '../auth/auth.service';
import { AuthPrincipal } from '../auth/principal';
import { ChangelogAggregationController } from '../changelog-aggregation/changelog-aggregation.controller';
import { ChangelogAggregationService } from '../changelog-aggregation/changelog-aggregation.service';
import { SecurityAuditService } from '../common/security/security-audit.service';
import { Permission } from '../rbac/rbac.service';
import { InMemoryStore } from '../reviews/testing/in-memory-store';
import { InMemoryQueryableStore } from '../workspaces/testing/in-memory-queryable-store';
import { WorkspaceAccessService } from '../workspaces/workspace-access.service';
import { WORKSPACE_STORE, WorkspaceDoc } from '../workspaces/workspace.types';
import { NotificationService } from './notification.service';
import { NotificationSettingsService } from './notification-settings.service';
import {
  CHANGELOG_STORE,
  ChangelogEntry,
  NOTIFICATION_SETTINGS_STORE,
  NOTIFICATION_STORE,
  Notification,
  NotificationSettingsDoc,
} from './notification.types';
import { NotificationsController } from './notifications.controller';

/** Who the tests sign in as: the token is `tok-<name>`, the user id `usr_<name>` */
const PEOPLE: Record<string, string[]> = {
  alice: [], // member of ws_alpha
  bob: [], // member of ws_beta
  carol: [], // member of ws_alpha and ws_beta
  superuser: [Permission.ADMIN_USERS],
};

const authStub = {
  async resolve(credential?: string): Promise<AuthPrincipal | null> {
    const name = credential?.startsWith('tok-') ? credential.slice(4) : '';
    if (!PEOPLE[name]) return null;
    return { type: 'user', id: `usr_${name}`, email: `${name}@example.com`, name, roles: [], permissions: new Set(PEOPLE[name]), mustChangePassword: false };
  },
};

function workspace(id: string, memberIds: string[]): WorkspaceDoc {
  return {
    id,
    name: id,
    members: memberIds.map((userId) => ({ userId, email: `${userId}@example.com`, name: userId, role: 'editor' })),
    memberIds,
  } as unknown as WorkspaceDoc;
}

/**
 * Notifications, notification settings and the changelog over HTTP with the
 * real guard and services on in-memory stores (the same compare-and-swap
 * semantics as Elasticsearch).
 */
describe('Notifications and changelog HTTP API', () => {
  let app: INestApplication;
  let base: string;
  let notificationStore: InMemoryStore<Notification>;
  let settingsStore: InMemoryQueryableStore<NotificationSettingsDoc>;
  let changelogStore: InMemoryStore<ChangelogEntry>;
  let changelog: ChangelogAggregationService;
  let notifications: NotificationService;

  const call = async (as: string | null, method: string, route: string, body?: unknown) => {
    const res = await fetch(`${base}/api/v1${route}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...(as ? { Authorization: `Bearer tok-${as}` } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    return { status: res.status, body: text ? JSON.parse(text) : undefined };
  };

  beforeEach(async () => {
    notificationStore = new InMemoryStore<Notification>();
    settingsStore = new InMemoryQueryableStore<NotificationSettingsDoc>();
    changelogStore = new InMemoryStore<ChangelogEntry>();
    const workspaces = new InMemoryQueryableStore<WorkspaceDoc>();
    await workspaces.create(workspace('ws_alpha', ['usr_alice', 'usr_carol']));
    await workspaces.create(workspace('ws_beta', ['usr_bob', 'usr_carol']));

    const moduleRef = await Test.createTestingModule({
      controllers: [NotificationsController, ChangelogAggregationController],
      providers: [
        NotificationService,
        NotificationSettingsService,
        ChangelogAggregationService,
        WorkspaceAccessService,
        { provide: NOTIFICATION_STORE, useValue: notificationStore },
        { provide: NOTIFICATION_SETTINGS_STORE, useValue: settingsStore },
        { provide: CHANGELOG_STORE, useValue: changelogStore },
        { provide: WORKSPACE_STORE, useValue: workspaces },
        { provide: AuthService, useValue: authStub },
        { provide: SecurityAuditService, useValue: { logPermissionDenied: jest.fn(async () => undefined) } },
        { provide: APP_GUARD, useClass: AuthGuard },
      ],
    }).compile();
    app = moduleRef.createNestApplication({ logger: false });
    await app.listen(0, '127.0.0.1');
    base = (await app.getUrl()).replace('[::1]', '127.0.0.1');
    changelog = moduleRef.get(ChangelogAggregationService);
    notifications = moduleRef.get(NotificationService);
  });

  afterEach(async () => {
    await app.close();
  });

  const notify = (userId: string, title = 'Hello') =>
    notifications.createNotification({ userId, type: 'request-updated', title, message: `${title} message` });

  describe('notifications', () => {
    it('requires sign-in', async () => {
      expect((await call(null, 'GET', '/notifications')).status).toBe(401);
    });

    it('stores notifications and lists only the caller\'s, newest first', async () => {
      await notify('usr_alice', 'First');
      await new Promise((r) => setTimeout(r, 5));
      await notify('usr_alice', 'Second');
      await notify('usr_bob', 'For Bob');
      expect(notificationStore.docs.size).toBe(3);

      const mine = await call('alice', 'GET', '/notifications');
      expect(mine.status).toBe(200);
      expect(mine.body.map((n: Notification) => n.title)).toEqual(['Second', 'First']);
      expect(mine.body.every((n: Notification) => n.userId === 'usr_alice' && n.read === false)).toBe(true);
      expect((await call('alice', 'GET', '/notifications/unread-count')).body).toEqual({ count: 2 });
      expect((await call('bob', 'GET', '/notifications')).body.map((n: Notification) => n.title)).toEqual(['For Bob']);
    });

    it("lets people mark only their own notifications read; anyone else's is not found", async () => {
      const alices = await notify('usr_alice');
      const bobs = await notify('usr_bob');

      const forbidden = await call('alice', 'PUT', `/notifications/${bobs.id}/read`);
      expect(forbidden.status).toBe(404);
      expect((await notificationStore.get(bobs.id))!.doc.read).toBe(false);
      expect((await call('alice', 'DELETE', `/notifications/${bobs.id}`)).status).toBe(404);
      expect(notificationStore.docs.has(bobs.id)).toBe(true);
      expect((await call('alice', 'PUT', '/notifications/ntf_missing/read')).status).toBe(404);

      const read = await call('alice', 'PUT', `/notifications/${alices.id}/read`);
      expect(read.status).toBe(200);
      expect(read.body).toMatchObject({ id: alices.id, read: true });
      expect((await notificationStore.get(alices.id))!.doc.readAt).toEqual(expect.any(String));
      expect((await call('alice', 'GET', '/notifications?unreadOnly=true')).body).toEqual([]);
    });

    it('marks all of the caller\'s notifications read and no one else\'s', async () => {
      await notify('usr_alice');
      await notify('usr_alice');
      const bobs = await notify('usr_bob');
      const res = await call('alice', 'PUT', '/notifications/read-all');
      expect(res.body).toEqual({ success: true, count: 2 });
      expect((await call('alice', 'GET', '/notifications/unread-count')).body).toEqual({ count: 0 });
      expect((await notificationStore.get(bobs.id))!.doc.read).toBe(false);
    });

    it('deletes the caller\'s own notification', async () => {
      const mine = await notify('usr_alice');
      expect((await call('alice', 'DELETE', `/notifications/${mine.id}`)).status).toBe(204);
      expect(notificationStore.docs.has(mine.id)).toBe(false);
    });
  });

  describe('settings', () => {
    it('starts with no subscriptions and default preferences', async () => {
      const res = await call('alice', 'GET', '/notifications/settings');
      expect(res.body).toEqual({
        subscriptions: [],
        preferences: {
          inApp: true,
          actions: ['created', 'updated', 'deprecated', 'deleted', 'status-changed'],
          breakingOnly: false,
          channels: { email: false, slack: false, webhook: false },
        },
      });
      expect(settingsStore.docs.size).toBe(0);
    });

    it('saves preferences per person and validates them', async () => {
      const saved = await call('alice', 'PUT', '/notifications/preferences', { breakingOnly: true, channels: { email: true } });
      expect(saved.status).toBe(200);
      expect(saved.body.preferences).toMatchObject({ inApp: true, breakingOnly: true, channels: { email: true, slack: false, webhook: false } });
      expect((await call('alice', 'GET', '/notifications/settings')).body.preferences.breakingOnly).toBe(true);
      expect((await call('bob', 'GET', '/notifications/settings')).body.preferences.breakingOnly).toBe(false);

      expect((await call('alice', 'PUT', '/notifications/preferences', { actions: ['exploded'] })).status).toBe(400);
      expect((await call('alice', 'PUT', '/notifications/preferences', { inApp: 'yes' })).status).toBe(400);
      expect((await call('alice', 'PUT', '/notifications/preferences', { userId: 'usr_bob' })).status).toBe(400);
    });

    it('adds and removes subscriptions, ignoring duplicates, and scopes removal to the caller', async () => {
      const first = await call('alice', 'POST', '/notifications/subscriptions', { type: 'component', entityId: 'button', entityName: 'Button' });
      expect(first.status).toBe(201);
      const again = await call('alice', 'POST', '/notifications/subscriptions', { type: 'component', entityId: 'button' });
      expect(again.body.id).toBe(first.body.id);
      await call('alice', 'POST', '/notifications/subscriptions', { type: 'token', entityId: '*' });

      const doc = (await settingsStore.get('usr_alice'))!.doc;
      expect(doc.topics.sort()).toEqual(['component:button', 'token:*']);
      expect((await call('alice', 'POST', '/notifications/subscriptions', { type: 'banner', entityId: 'x' })).status).toBe(400);

      expect((await call('bob', 'DELETE', `/notifications/subscriptions/${first.body.id}`)).status).toBe(404);
      expect((await call('alice', 'DELETE', `/notifications/subscriptions/${first.body.id}`)).status).toBe(204);
      expect((await settingsStore.get('usr_alice'))!.doc.topics).toEqual(['token:*']);
    });
  });

  describe('changelog', () => {
    const follow = (as: string, type: string, entityId: string) => call(as, 'POST', '/notifications/subscriptions', { type, entityId });
    const inbox = async (as: string) => (await call(as, 'GET', '/notifications')).body as Notification[];

    it('stores entries and notifies people following the item or its whole type, but not the author', async () => {
      await follow('alice', 'component', 'button');
      await follow('bob', 'component', '*');
      await follow('carol', 'token', '*');
      await follow('superuser', 'component', 'button');

      const entry = await changelog.recordChange(
        { type: 'component', entityId: 'button', entityName: 'Button', action: 'updated', changes: [{ description: 'Variant "dense" saved' }], link: '/components' },
        { id: 'usr_superuser', name: 'Sue' },
      );
      expect(changelogStore.docs.get(entry.id)?.doc).toMatchObject({ entityId: 'button', author: 'Sue', authorId: 'usr_superuser', audience: [] });

      const [alices] = await inbox('alice');
      expect(alices).toMatchObject({
        type: 'design-system-change',
        title: 'Component "Button" updated',
        changelogEntryId: entry.id,
        link: '/components',
        breaking: false,
      });
      expect(alices.message).toContain('Variant "dense" saved');
      expect(await inbox('bob')).toHaveLength(1);
      expect(await inbox('carol')).toHaveLength(0); // follows tokens only
      expect(await inbox('superuser')).toHaveLength(0); // made the change
    });

    it('only notifies members of the workspaces that can see a workspace item', async () => {
      await follow('alice', 'token', '*');
      await follow('bob', 'token', '*');
      await follow('carol', 'token', '*');
      await changelog.recordChange({ type: 'token', entityId: 'res_1', entityName: 'color.primary', action: 'created', workspaceId: 'ws_alpha', audience: ['ws_alpha'] });
      expect(await inbox('alice')).toHaveLength(1);
      expect(await inbox('bob')).toHaveLength(0);
      expect(await inbox('carol')).toHaveLength(1);
    });

    it('honours preferences: in-app off, breaking only, and which kinds of change', async () => {
      await follow('alice', 'pattern', '*');
      await follow('bob', 'pattern', '*');
      await follow('carol', 'pattern', '*');
      await call('alice', 'PUT', '/notifications/preferences', { inApp: false });
      await call('bob', 'PUT', '/notifications/preferences', { breakingOnly: true });
      await call('carol', 'PUT', '/notifications/preferences', { actions: ['deleted'] });

      await changelog.recordChange({ type: 'pattern', entityId: 'p1', entityName: 'Empty state', action: 'updated' });
      expect([(await inbox('alice')).length, (await inbox('bob')).length, (await inbox('carol')).length]).toEqual([0, 0, 0]);

      await changelog.recordChange({ type: 'pattern', entityId: 'p1', entityName: 'Empty state', action: 'deleted', breaking: true });
      expect([(await inbox('alice')).length, (await inbox('bob')).length, (await inbox('carol')).length]).toEqual([0, 1, 1]);
      expect((await inbox('bob'))[0]).toMatchObject({ title: 'Pattern "Empty state" removed', breaking: true });
    });

    it('lists entries the caller may see, with filters', async () => {
      await changelog.recordChange({ type: 'component', entityId: 'button', entityName: 'Button', action: 'created' });
      await changelog.recordChange({ type: 'token', entityId: 'res_a', entityName: 'alpha.token', action: 'deleted', breaking: true, workspaceId: 'ws_alpha', audience: ['ws_alpha'] });
      await changelog.recordChange({ type: 'token', entityId: 'res_b', entityName: 'beta.token', action: 'updated', workspaceId: 'ws_beta', audience: ['ws_beta'] });

      const names = async (as: string, query = '') => (await call(as, 'GET', `/changelog/entries${query}`)).body.map((e: ChangelogEntry) => e.entityName).sort();
      expect(await names('alice')).toEqual(['Button', 'alpha.token']);
      expect(await names('bob')).toEqual(['Button', 'beta.token']);
      expect(await names('carol')).toEqual(['Button', 'alpha.token', 'beta.token']);
      expect(await names('superuser')).toEqual(['Button', 'alpha.token', 'beta.token']);
      expect(await names('carol', '?type=token')).toEqual(['alpha.token', 'beta.token']);
      expect(await names('carol', '?breakingOnly=true')).toEqual(['alpha.token']);
      expect((await call('carol', 'GET', '/changelog/entries?type=nonsense')).status).toBe(400);

      const aggregated = await call('alice', 'GET', '/changelog/aggregated');
      expect(aggregated.body.summary).toMatchObject({ totalChanges: 2, breakingChanges: 1, componentsChanged: 1, tokensChanged: 1, newItems: 1 });
      expect((await call('bob', 'GET', '/changelog/components/button')).body).toHaveLength(1);
      expect((await call('bob', 'GET', '/changelog/tokens/res_a')).body).toEqual([]);
    });

    it('never fails the write that reported a change when storage fails', async () => {
      jest.spyOn(changelogStore, 'create').mockRejectedValueOnce(new Error('es down'));
      await expect(changelog.record({ type: 'component', entityId: 'x', entityName: 'X', action: 'created' })).resolves.toBeUndefined();
      expect(changelogStore.docs.size).toBe(0);
    });
  });
});
