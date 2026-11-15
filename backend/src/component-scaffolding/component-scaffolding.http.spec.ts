import { INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { AuthGuard } from '../auth/auth.guard';
import { AuthService } from '../auth/auth.service';
import { AuthPrincipal } from '../auth/principal';
import { SecurityAuditService } from '../common/security/security-audit.service';
import { DesignSystemService } from '../design-system/design-system.service';
import { designSystemStoreProviders } from '../design-system/testing/in-memory-stores';
import { Permission } from '../rbac/rbac.service';
import { ComponentScaffoldingController } from './component-scaffolding.controller';
import { ComponentScaffoldingService } from './component-scaffolding.service';

const PEOPLE: Record<string, Permission[]> = {
  maker: [Permission.COMPONENT_VIEW, Permission.COMPONENT_CREATE],
  viewer: [Permission.COMPONENT_VIEW],
};

const authStub = {
  async resolve(credential?: string): Promise<AuthPrincipal | null> {
    const name = credential?.startsWith('tok-') ? credential.slice(4) : '';
    if (!PEOPLE[name]) return null;
    return { type: 'user', id: `usr_${name}`, email: `${name}@example.com`, name, roles: [], permissions: new Set(PEOPLE[name]), mustChangePassword: false };
  },
};

/** Creating a component from a scaffold adds it to the design system, so it needs component:create like POST /components */
describe('Component scaffolding HTTP API', () => {
  let app: INestApplication;
  let base: string;
  let designSystem: DesignSystemService;

  const post = async (route: string, as: string | undefined, body: unknown) => {
    const res = await fetch(`${base}/api/v1/component-scaffolding${route}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(as ? { Authorization: `Bearer tok-${as}` } : {}) },
      body: JSON.stringify(body),
    });
    return { status: res.status, body: await res.json() };
  };

  const input = { name: 'Status Badge', description: 'Shows a status', category: 'display', props: [], events: [], slots: [] };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ComponentScaffoldingController],
      providers: [
        ComponentScaffoldingService,
        DesignSystemService,
        ...designSystemStoreProviders(),
        { provide: AuthService, useValue: authStub },
        { provide: SecurityAuditService, useValue: { logPermissionDenied: jest.fn(async () => undefined) } },
        { provide: APP_GUARD, useClass: AuthGuard },
      ],
    }).compile();
    app = moduleRef.createNestApplication({ logger: false });
    await app.listen(0, '127.0.0.1');
    base = (await app.getUrl()).replace('[::1]', '127.0.0.1');
    designSystem = moduleRef.get(DesignSystemService);
  });

  afterAll(async () => {
    await app?.close();
  });

  it('refuses callers without component:create and adds nothing', async () => {
    expect((await post('/create', undefined, input)).status).toBe(401);
    expect((await post('/create', 'viewer', input)).status).toBe(403);
    expect(designSystem.getComponentById('status-badge')).toBeUndefined();
  });

  it('still lets any signed-in caller generate files without registering them', async () => {
    expect((await post('/scaffold', 'viewer', input)).status).toBe(201);
    expect(designSystem.getComponentById('status-badge')).toBeUndefined();
  });

  it('registers the component for a component:create holder, once', async () => {
    const created = await post('/create', 'maker', input);
    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({ success: true, componentId: 'status-badge' });
    expect(designSystem.getComponentById('status-badge')).toMatchObject({ name: 'Status Badge' });
    expect((await post('/create', 'maker', input)).status).toBe(409);
  });
});
