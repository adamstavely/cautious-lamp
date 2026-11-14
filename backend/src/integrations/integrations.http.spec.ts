import { INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { AuthGuard } from '../auth/auth.guard';
import { AuthPrincipal } from '../auth/principal';
import { AuthService } from '../auth/auth.service';
import { EsIndexService } from '../common/elasticsearch/es-index.service';
import { SecurityAuditService } from '../common/security/security-audit.service';
import { PhotosensitivityService } from '../photosensitivity/photosensitivity.service';
import { Permission } from '../rbac/rbac.service';
import { OpenReplayApiClient } from '../session-replay/openreplay-api.client';
import { SessionReplayService } from '../session-replay/session-replay.service';
import { ArgosApiClient } from '../visual-regression/argos-api.client';
import { createProjectServices, SYSTEM_CREATOR } from '../visual-regression/testing/services';
import { VisualRegressionService } from '../visual-regression/visual-regression.service';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';

const PEOPLE: Record<string, string[]> = { ops: [Permission.ADMIN_SYSTEM_HEALTH], designer: [Permission.COMPONENT_VIEW] };
const auth = {
  async resolve(credential?: string): Promise<AuthPrincipal | null> {
    const name = credential?.startsWith('tok-') ? credential.slice(4) : '';
    if (!PEOPLE[name]) return null;
    return { type: 'user', id: `usr_${name}`, email: `${name}@example.com`, name, roles: [], permissions: new Set(PEOPLE[name]), mustChangePassword: false };
  },
};

describe('Integrations status', () => {
  let app: INestApplication;
  let base: string;
  let services: ReturnType<typeof createProjectServices>;
  const iris = { status: jest.fn() };
  const esIndex = { assertAvailable: jest.fn() };
  const env = { ...process.env };

  beforeAll(async () => {
    jest.spyOn(ArgosApiClient.prototype, 'verifyConnection').mockResolvedValue(true);
    jest.spyOn(OpenReplayApiClient.prototype, 'verifyConnection').mockResolvedValue(true);
    services = createProjectServices();
    const moduleRef = await Test.createTestingModule({
      controllers: [IntegrationsController],
      providers: [
        IntegrationsService,
        { provide: EsIndexService, useValue: esIndex },
        { provide: PhotosensitivityService, useValue: iris },
        { provide: VisualRegressionService, useValue: services.visualRegression },
        { provide: SessionReplayService, useValue: services.sessionReplay },
        { provide: AuthService, useValue: auth },
        { provide: SecurityAuditService, useValue: { logPermissionDenied: async () => undefined } },
        { provide: APP_GUARD, useClass: AuthGuard },
      ],
    }).compile();
    app = moduleRef.createNestApplication({ logger: false });
    await app.listen(0, '127.0.0.1');
    base = (await app.getUrl()).replace('[::1]', '127.0.0.1');
  });

  afterAll(async () => {
    process.env = { ...env };
    jest.restoreAllMocks();
    await app.close();
  });

  const get = async (as: string, query = '') => {
    const res = await fetch(`${base}/api/v1/integrations/status${query}`, { headers: { Authorization: `Bearer tok-${as}` } });
    return { status: res.status, body: await res.json() };
  };

  it('needs admin:system_health', async () => {
    expect((await get('designer')).status).toBe(403);
    expect((await get('nobody')).status).toBe(401);
  });

  it('reports what is missing and how to fix it, without contacting anything', async () => {
    esIndex.assertAvailable.mockRejectedValue(new Error('down'));
    iris.status.mockResolvedValue({ executable: null, config: null, problem: "IRIS isn't installed: set IRIS_EXECUTABLE_PATH" });
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_AUTH_TOKEN;

    const { status, body } = await get('ops');
    expect(status).toBe(200);
    expect(body.connectionsChecked).toBe(false);
    const i = body.integrations;
    expect(i.elasticsearch.state).toBe('unreachable');
    expect(i.iris).toMatchObject({ state: 'not_configured', action: "IRIS isn't installed: set IRIS_EXECUTABLE_PATH" });
    expect(i.argos).toMatchObject({ state: 'not_configured', summary: 'No visual regression projects yet' });
    expect(i.openreplay).toMatchObject({ state: 'not_configured', summary: 'No session replay projects yet' });
    expect(i.altText.state).toBe('not_configured');
    expect(['ok', 'not_configured']).toContain(i.chromium.state);
    expect(ArgosApiClient.prototype.verifyConnection).not.toHaveBeenCalled();
  });

  it('counts connected projects, and with ?check=true names the ones that do not answer', async () => {
    esIndex.assertAvailable.mockResolvedValue(undefined);
    iris.status.mockResolvedValue({ executable: '/opt/iris/IrisApp', config: '/opt/iris/appsettings.json', problem: null });
    process.env.ANTHROPIC_API_KEY = 'sk-test';
    const now = new Date().toISOString();
    const vr = (id: string, name: string, token?: string) =>
      services.vrProjects.create({
        id, name, teamId: 't', workspaceId: null, createdBy: SYSTEM_CREATOR, argosProjectId: id, argosBranch: 'main',
        config: {}, createdAt: now, updatedAt: now, baselines: [], notifications: [],
        argosToken: token ? services.encryption.encrypt(token) : undefined,
      } as any);
    await vr('vrp_web', 'Web', 'tok-ok');
    await vr('vrp_docs', 'Docs', 'tok-down');
    await vr('vrp_none', 'Tokenless');
    await services.visualRegression.setWebhookSecret('vrp_web');
    await services.srProjects.create({ id: 'srp_1', name: 'Replay', teamId: 't', workspaceId: null, createdBy: SYSTEM_CREATOR, openreplayProjectKey: '7', createdAt: now, updatedAt: now } as any);

    const quick = (await get('ops')).body.integrations;
    expect(quick.iris.state).toBe('ok');
    expect(quick.argos).toMatchObject({ state: 'ok', summary: '2 of 3 visual regression project(s) connected to Argos', details: { webhookReady: 1 } });
    expect(quick.openreplay).toMatchObject({ state: 'not_configured', summary: 'None of the 1 session replay project(s) has OpenReplay credentials' });
    expect(quick.altText.state).toBe('ok');

    jest.mocked(ArgosApiClient.prototype.verifyConnection).mockImplementation(async function (this: { token: string }) {
      return this.token === 'tok-ok';
    });
    const checked = (await get('ops', '?check=true')).body;
    expect(checked.connectionsChecked).toBe(true);
    expect(checked.integrations.argos.state).toBe('unreachable');
    expect(checked.integrations.argos.details.unreachable).toEqual([{ projectId: 'vrp_docs', name: 'Docs', error: 'Argos did not answer' }]);
  });
});
