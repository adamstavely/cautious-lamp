import { InMemoryStore } from '../reviews/testing/in-memory-store';
import { INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { APPLICATION_STORE, ApplicationDoc, APPLICATION_NAME_STORE, ApplicationNameClaim } from '../applications/application.types';
import { ApplicationsService } from '../applications/applications.service';
import { AuthGuard } from '../auth/auth.guard';
import { AuthService } from '../auth/auth.service';
import { AuthPrincipal } from '../auth/principal';
import { SecurityAuditService } from '../common/security/security-audit.service';
import { ComponentAccessService } from '../design-system/component-access.service';
import { DesignSystemService } from '../design-system/design-system.service';
import { Permission } from '../rbac/rbac.service';
import { SessionReplayService } from '../session-replay/session-replay.service';
import { VisualRegressionService } from '../visual-regression/visual-regression.service';
import { InMemoryQueryableStore } from '../workspaces/testing/in-memory-queryable-store';
import { WorkspaceAccessService } from '../workspaces/workspace-access.service';
import { WORKSPACE_STORE, WorkspaceDoc } from '../workspaces/workspace.types';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { designSystemStoreProviders } from '../design-system/testing/in-memory-stores';
import { COMPONENT_USAGE_STORE, UsageDoc } from './component-usage.types';

/** Who the tests sign in as: the token is `tok-<name>` */
const PEOPLE: Record<string, string[]> = {
  alice: [Permission.COMPONENT_VIEW], // member of ws_alpha
  bob: [Permission.COMPONENT_VIEW], // member of ws_beta only
  gov: [Permission.COMPONENT_VIEW, Permission.ADMIN_GOVERNANCE], // no memberships
};

const authStub = {
  async resolve(credential?: string): Promise<AuthPrincipal | null> {
    const name = credential?.startsWith('tok-') ? credential.slice(4) : '';
    if (!PEOPLE[name]) return null;
    return { type: 'user', id: `usr_${name}`, email: `${name}@example.com`, name, roles: [], permissions: new Set(PEOPLE[name]), mustChangePassword: false };
  },
};

function workspace(id: string, memberId: string): WorkspaceDoc {
  return {
    id,
    name: id,
    members: [{ userId: memberId, email: `${memberId}@example.com`, name: memberId, role: 'viewer' }],
    memberIds: [memberId],
  } as unknown as WorkspaceDoc;
}

function application(id: string, name: string, workspaceId: string | null): ApplicationDoc {
  const actor = { id: 'usr_admin', name: 'Admin' };
  return {
    id,
    name,
    description: '',
    workspaceId,
    registeredAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    lastScanned: '2026-02-01T00:00:00.000Z',
    registeredBy: actor,
    updatedBy: actor,
    capabilities: {
      governance: { enabled: false, rules: [], scanSchedule: 'manual' },
      visualRegression: { enabled: false },
      sessionReplay: { enabled: false },
    },
    metadata: {},
  };
}

/**
 * Analytics only reports on the applications the caller may see, through the
 * real guard, controller, AnalyticsService, ApplicationsService and workspace checks
 */
describe('Analytics HTTP API: application scope', () => {
  let app: INestApplication;
  let base: string;
  let shared: string;
  let deprecated: string;

  const get = async (as: string, route: string) => {
    const res = await fetch(`${base}/api/v1/analytics${route}`, { headers: { Authorization: `Bearer tok-${as}` } });
    return { status: res.status, body: await res.json() };
  };

  beforeAll(async () => {
    const workspaces = new InMemoryQueryableStore<WorkspaceDoc>();
    await workspaces.create(workspace('ws_alpha', 'usr_alice'));
    await workspaces.create(workspace('ws_beta', 'usr_bob'));
    const applications = new InMemoryQueryableStore<ApplicationDoc>();
    await applications.create(application('app_alpha', 'Alpha Secret App', 'ws_alpha'));
    await applications.create(application('app_beta', 'Beta App', 'ws_beta'));
    await applications.create(application('app_open', 'Unassigned App', null));

    const moduleRef = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        AnalyticsService,
        ApplicationsService,
        DesignSystemService,
        ...designSystemStoreProviders(),
        ComponentAccessService,
        WorkspaceAccessService,
        { provide: WORKSPACE_STORE, useValue: workspaces },
        { provide: APPLICATION_STORE, useValue: applications },
        { provide: APPLICATION_NAME_STORE, useValue: new InMemoryStore<ApplicationNameClaim>() },
        { provide: COMPONENT_USAGE_STORE, useValue: new InMemoryStore<UsageDoc>() },
        { provide: VisualRegressionService, useValue: {} },
        { provide: SessionReplayService, useValue: {} },
        { provide: AuthService, useValue: authStub },
        { provide: SecurityAuditService, useValue: { logPermissionDenied: jest.fn(async () => undefined) } },
        { provide: APP_GUARD, useClass: AuthGuard },
      ],
    }).compile();
    app = moduleRef.createNestApplication({ logger: false });
    await app.listen(0, '127.0.0.1');
    base = (await app.getUrl()).replace('[::1]', '127.0.0.1');

    // Usage recorded by scans: every application uses a production library
    // component; only Alpha's application still uses a deprecated one
    const designSystem = moduleRef.get(DesignSystemService);
    const sharedComponent = designSystem.getAllComponents().find((c) => !c.workspaceId && c.status === 'production')!;
    shared = sharedComponent.id;
    deprecated = (await designSystem.createComponent({ id: 'old-thing', name: 'OldThing', description: 'x', status: 'deprecated' })).id;
    const analytics = moduleRef.get(AnalyticsService);
    const tag = `<${sharedComponent.name.replace(/\s+/g, '')} />`;
    const scan = (applicationId: string, applicationName: string, html: string, target: string) =>
      analytics.recordApplicationScan({
        scanId: `scan-${applicationId}`,
        applicationId,
        applicationName,
        target,
        scannedAt: new Date().toISOString(),
        inputs: [{ html, css: '', javascript: '' }],
      });
    await scan('app_alpha', 'Alpha Secret App', `${tag}${tag}${tag}<OldThing />`, 'codebase:a.vue');
    await scan('app_beta', 'Beta App', tag, 'codebase:x.vue');
    await scan('app_open', 'Unassigned App', tag, 'codebase:y.vue');
  });

  afterAll(async () => {
    await app.close();
  });

  const routes = () => [
    '/summary',
    '/component-popularity',
    `/component/${shared}/usage`,
    '/application-adoption',
    '/usage-trends',
    '/cross-application-comparison',
    '/cross-application-comparison?applicationIds=app_alpha,app_beta',
    '/design-debt',
  ];

  it("never names another workspace's application", async () => {
    for (const route of routes()) {
      const res = await get('bob', route);
      expect(res.status).toBe(200);
      expect(JSON.stringify(res.body)).not.toMatch(/app_alpha|Alpha Secret App|a\.vue/);
    }
    expect((await get('bob', '/application-adoption')).body.map((a: { applicationId: string }) => a.applicationId).sort()).toEqual(['app_beta', 'app_open']);
    expect((await get('bob', '/cross-application-comparison?applicationIds=app_alpha,app_beta')).body.map((a: { applicationId: string }) => a.applicationId)).toEqual([
      'app_beta',
    ]);
    expect((await get('alice', '/application-adoption')).body.map((a: { applicationId: string }) => a.applicationId).sort()).toEqual([
      'app_alpha',
      'app_open',
    ]);
    expect((await get('gov', '/application-adoption')).body).toHaveLength(3);
  });

  it("leaves other workspaces' applications out of counts and denominators", async () => {
    const popularity = (await get('bob', '/component-popularity')).body.find((p: { componentId: string }) => p.componentId === shared);
    expect((await get('bob', '/summary')).body).toMatchObject({ usageDataAvailable: true, totalApplications: 2, scannedApplications: 2 });
    // Beta's and the unassigned application: 2 of 2, 2 uses
    expect(popularity).toMatchObject({ totalUsage: 2, applicationCount: 2, adoptionRate: 100 });
    const usage = (await get('bob', `/component/${shared}/usage`)).body;
    expect(usage).toMatchObject({ totalUsage: 2, applicationCount: 2 });

    const trends = (await get('bob', '/usage-trends')).body;
    expect(Math.max(...trends.map((t: { uniqueApplications: number }) => t.uniqueApplications))).toBe(2);

    expect((await get('bob', '/design-debt')).body).toMatchObject({ deprecatedComponentsInUse: 0 });
    expect((await get('alice', '/design-debt')).body).toMatchObject({ deprecatedComponentsInUse: 1 });
    expect((await get('gov', '/component-popularity')).body.find((p: { componentId: string }) => p.componentId === shared)).toMatchObject({
      totalUsage: 5,
      applicationCount: 3,
    });
  });

  it('refuses a timeframe it does not know', async () => {
    expect((await get('bob', '/component-popularity?timeframe=forever')).status).toBe(400);
  });
});
