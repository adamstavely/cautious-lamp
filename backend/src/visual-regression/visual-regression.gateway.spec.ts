import { AuthService } from '../auth/auth.service';
import { AuthHarness, createAuthHarness, ADMIN_KEY } from '../auth/testing/harness';
import { TOKEN_TTL_SECONDS } from '../auth/token.service';
import { Role } from '../rbac/rbac.service';
import { InMemoryQueryableStore } from '../workspaces/testing/in-memory-queryable-store';
import { WorkspaceDoc } from '../workspaces/workspace.types';
import { ArgosApiClient } from './argos-api.client';
import { createProjectServices } from './testing/services';
import { VisualRegressionGateway } from './visual-regression.gateway';

const WS = 'ws_team';

function workspace(members: Array<{ id: string; email: string }>): WorkspaceDoc {
  const now = new Date().toISOString();
  return {
    id: WS,
    name: WS,
    description: '',
    slug: WS,
    ownerId: members[0].id,
    members: members.map((m, i) => ({
      userId: m.id,
      email: m.email,
      name: m.email,
      role: i === 0 ? 'owner' : 'viewer',
      addedAt: now,
      addedBy: { id: members[0].id, name: 'Owner' },
    })),
    memberIds: members.map((m) => m.id),
    settings: { allowExternalSharing: true, requireApprovalForSharing: false, defaultComponentStatus: 'in-progress' },
    metadata: {},
    createdAt: now,
    updatedAt: now,
    createdBy: { id: members[0].id, name: 'Owner' },
  };
}

/** A socket.io socket stand-in that records what the gateway does with it */
function socket(token: string, id = `sock-${token.slice(-8)}`) {
  const rooms = new Set<string>();
  return {
    id,
    handshake: { auth: { token }, headers: {} },
    data: {} as Record<string, unknown>,
    emit: jest.fn(),
    disconnect: jest.fn(),
    join: (room: string) => rooms.add(room),
    leave: (room: string) => rooms.delete(room),
    rooms,
  };
}
type FakeSocket = ReturnType<typeof socket>;

const received = (s: FakeSocket, event: string) => s.emit.mock.calls.filter(([name]) => name === event).map(([, payload]) => payload);

/**
 * Revocation on open WebSocket connections, through the real gateway,
 * AuthService (users, tokens and API keys over in-memory stores) and project access checks
 */
describe('VisualRegressionGateway: credentials and access over the life of a connection', () => {
  let h: AuthHarness;
  let workspaces: InMemoryQueryableStore<WorkspaceDoc>;
  let gateway: VisualRegressionGateway;
  let projectId: string;
  let owner: { id: string; email: string; accessToken: string };
  let viewer: { id: string; email: string; accessToken: string };

  beforeEach(async () => {
    jest.spyOn(ArgosApiClient.prototype, 'verifyConnection').mockResolvedValue(true);
    jest.spyOn(ArgosApiClient.prototype, 'getProject').mockResolvedValue({ id: 'argos-1', name: 'a', repository: 'r', branch: 'main' });
    h = await createAuthHarness();
    const o = await h.createUser('owner@example.com', [Role.DESIGNER]);
    const v = await h.createUser('viewer@example.com', [Role.DESIGNER]);
    owner = { id: o.user.id, email: o.user.email, accessToken: o.accessToken };
    viewer = { id: v.user.id, email: v.user.email, accessToken: v.accessToken };

    workspaces = new InMemoryQueryableStore<WorkspaceDoc>();
    await workspaces.create(workspace([owner, viewer]));
    const services = createProjectServices(workspaces);
    const project = await services.visualRegression.createProject(
      'team',
      { name: 'Web', argosProjectId: 'argos-1', argosToken: 'tok' } as any,
      { workspaceId: WS, createdBy: { type: 'user', id: owner.id, name: 'Owner' } },
    );
    projectId = project.id;
    gateway = new VisualRegressionGateway(services.visualRegression, h.auth as AuthService);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    h.restoreEnv();
  });

  async function subscribed(token: string) {
    const s = socket(token);
    await gateway.handleConnection(s as any);
    expect(await gateway.handleSubscribeProject(s as any, { projectId })).toMatchObject({ success: true });
    await gateway.emitProjectUpdate(projectId, 'updated', { n: 1 });
    expect(received(s, 'project:update')).toHaveLength(1);
    return s;
  }

  it('stops sending to, and disconnects, a socket whose user signed out', async () => {
    const s = await subscribed(viewer.accessToken);
    await h.auth.logout((await h.principalFor(viewer.accessToken)) as any);

    await gateway.emitProjectUpdate(projectId, 'updated', { n: 2 });
    expect(received(s, 'project:update')).toHaveLength(1);
    expect(s.disconnect).toHaveBeenCalledWith(true);
    // The principal cached at connect no longer opens new subscriptions
    expect(await gateway.handleSubscribeProject(s as any, { projectId })).toMatchObject({ success: false });
  });

  it('stops sending to a disabled user, and refuses their next subscription', async () => {
    const s = socket(viewer.accessToken);
    await gateway.handleConnection(s as any);
    await h.users.update(viewer.id, { status: 'disabled' }, await h.principalFor(ADMIN_KEY));

    expect(await gateway.handleSubscribeProject(s as any, { projectId })).toMatchObject({ success: false });
    expect(s.rooms.size).toBe(0);
    expect(s.disconnect).toHaveBeenCalledWith(true);
  });

  it('removes a subscriber from the room when they leave the workspace', async () => {
    const s = await subscribed(viewer.accessToken);
    const stayed = await subscribed(owner.accessToken);
    const before = received(s, 'project:update').length;
    const stored = (await workspaces.get(WS))!;
    await workspaces.replace(
      { ...stored.doc, members: stored.doc.members.filter((m) => m.userId !== viewer.id), memberIds: [owner.id] },
      stored.version,
    );

    await gateway.emitProjectUpdate(projectId, 'updated', { n: 2 });
    expect(received(s, 'project:update')).toHaveLength(before);
    expect(received(s, 'subscription:revoked')).toEqual([{ room: `project:${projectId}` }]);
    expect(s.rooms.has(`project:${projectId}`)).toBe(false);
    expect(received(stayed, 'project:update')).toHaveLength(2);

    // Nothing more reaches them, and they can't subscribe again
    await gateway.emitProjectUpdate(projectId, 'updated', { n: 3 });
    expect(received(s, 'project:update')).toHaveLength(before);
    expect(await gateway.handleSubscribeProject(s as any, { projectId })).toMatchObject({ success: false });
    expect(s.disconnect).not.toHaveBeenCalled();
  });

  it('disconnects when the token expires, without a reconnect or a broadcast', async () => {
    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate', 'queueMicrotask'] });
    const s = await subscribed(viewer.accessToken);

    jest.advanceTimersByTime(TOKEN_TTL_SECONDS * 1000 - 60_000);
    expect(s.disconnect).not.toHaveBeenCalled();
    jest.advanceTimersByTime(61_000);
    expect(s.disconnect).toHaveBeenCalledWith(true);
    expect(received(s, 'error')).toEqual([{ message: 'Your session has expired. Sign in again.' }]);

    await gateway.emitProjectUpdate(projectId, 'updated', { n: 2 });
    expect(received(s, 'project:update')).toHaveLength(1);
  });

  it('refuses a connection on a temporary password', async () => {
    const pending = await h.createUser('new@example.com', [Role.DESIGNER], 'a long enough password', { temporaryPassword: true });
    const s = socket(pending.accessToken);
    await gateway.handleConnection(s as any);
    expect(received(s, 'error')).toEqual([expect.objectContaining({ code: 'PASSWORD_CHANGE_REQUIRED' })]);
    expect(s.disconnect).toHaveBeenCalledWith(true);
    expect(await gateway.handleSubscribeProject(s as any, { projectId })).toMatchObject({ success: false });
  });
});
