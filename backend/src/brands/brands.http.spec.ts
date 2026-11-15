import { INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { AuthGuard } from '../auth/auth.guard';
import { AuthService } from '../auth/auth.service';
import { AuthPrincipal } from '../auth/principal';
import { SecurityAuditService } from '../common/security/security-audit.service';
import { DesignSystemService } from '../design-system/design-system.service';
import { Permission } from '../rbac/rbac.service';
import { InMemoryStore } from '../reviews/testing/in-memory-store';
import { BrandsController } from './brands.controller';
import { BrandsService } from './brands.service';
import { BRAND_STORE, BrandDoc } from './brands.types';
import { designSystemStoreProviders } from '../design-system/testing/in-memory-stores';

const PEOPLE: Record<string, string[]> = {
  viewer: [Permission.COMPONENT_VIEW],
  creator: [Permission.TOKEN_CREATE],
  editor: [Permission.TOKEN_CREATE, Permission.TOKEN_EDIT],
  owner: [Permission.TOKEN_CREATE, Permission.TOKEN_EDIT, Permission.TOKEN_DELETE],
};

const authStub = {
  async resolve(credential?: string): Promise<AuthPrincipal | null> {
    const name = credential?.startsWith('tok-') ? credential.slice(4) : '';
    if (!PEOPLE[name]) return null;
    return { type: 'user', id: `usr_${name}`, email: `${name}@example.com`, name, roles: [name], permissions: new Set(PEOPLE[name]), mustChangePassword: false };
  },
};

/** Brands through the real guard, controller and service, with in-memory storage */
describe('Brands HTTP API', () => {
  let app: INestApplication;
  let base: string;
  let store: InMemoryStore<BrandDoc>;

  const call = async (method: string, route: string, as: string, body?: unknown) => {
    const res = await fetch(`${base}/api/v1/brands${route}`, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer tok-${as}` },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    return { status: res.status, body: text ? JSON.parse(text) : undefined };
  };

  beforeAll(async () => {
    store = new InMemoryStore<BrandDoc>();
    const moduleRef = await Test.createTestingModule({
      controllers: [BrandsController],
      providers: [
        BrandsService,
        DesignSystemService,
        ...designSystemStoreProviders(),
        { provide: BRAND_STORE, useValue: store },
        { provide: AuthService, useValue: authStub },
        { provide: SecurityAuditService, useValue: { logPermissionDenied: jest.fn(async () => undefined) } },
        { provide: APP_GUARD, useClass: AuthGuard },
      ],
    }).compile();
    app = moduleRef.createNestApplication({ logger: false });
    await app.listen(0, '127.0.0.1');
    base = (await app.getUrl()).replace('[::1]', '127.0.0.1');
  });

  afterAll(async () => {
    await app?.close();
  });

  it('creates, lists, changes and deletes brands with their token overrides', async () => {
    expect((await call('GET', '', 'viewer')).body).toEqual({ brands: [], count: 0 });

    const created = await call('POST', '', 'creator', {
      name: '  Enterprise ',
      description: 'Sober colours',
      tokenOverrides: [{ token: 'color.primary', value: '#047857' }],
    });
    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({
      id: expect.stringMatching(/^brd_/),
      name: 'Enterprise',
      description: 'Sober colours',
      tokenOverrides: [{ token: 'color.primary', value: '#047857' }],
      createdBy: { id: 'usr_creator', name: 'creator' },
    });
    const id = created.body.id;
    expect(store.docs.get(id)?.doc.name).toBe('Enterprise');

    const listed = await call('GET', '', 'viewer');
    expect(listed.body.count).toBe(1);
    expect((await call('GET', `/${id}`, 'viewer')).body.name).toBe('Enterprise');

    const updated = await call('PUT', `/${id}`, 'editor', {
      tokenOverrides: [{ token: 'color.primary', value: '#065f46' }, { token: 'spacing.md', value: '1.25rem' }],
    });
    expect(updated.status).toBe(200);
    expect(updated.body.name).toBe('Enterprise');
    expect(updated.body.tokenOverrides).toHaveLength(2);
    expect(updated.body.updatedBy.id).toBe('usr_editor');

    expect((await call('DELETE', `/${id}`, 'owner')).status).toBe(200);
    expect((await call('GET', `/${id}`, 'viewer')).status).toBe(404);
    expect((await call('DELETE', `/${id}`, 'owner')).status).toBe(404);
  });

  it('needs token:create, token:edit and token:delete to change brands; reading stays open', async () => {
    expect((await call('POST', '', 'viewer', { name: 'Nope' })).status).toBe(403);
    const { body } = await call('POST', '', 'creator', { name: 'Consumer' });
    expect((await call('PUT', `/${body.id}`, 'creator', { name: 'Renamed' })).status).toBe(403);
    expect((await call('DELETE', `/${body.id}`, 'editor')).status).toBe(403);
    expect((await call('GET', `/${body.id}`, 'viewer')).status).toBe(200);
    expect((await call('GET', '', 'nobody')).status).toBe(401);
  });

  it('refuses unknown tokens, repeated tokens, duplicate names and unknown fields', async () => {
    expect((await call('POST', '', 'creator', { name: 'Bad', tokenOverrides: [{ token: 'color.nope', value: '#000' }] })).status).toBe(400);
    expect((await call('POST', '', 'creator', {
      name: 'Twice',
      tokenOverrides: [{ token: 'color.primary', value: '#000' }, { token: 'color.primary', value: '#111' }],
    })).status).toBe(400);
    expect((await call('POST', '', 'creator', { name: '' })).status).toBe(400);
    expect((await call('POST', '', 'creator', { name: 'Extra', components: 24 })).status).toBe(400);
    expect((await call('POST', '', 'creator', { name: 'Kids' })).status).toBe(201);
    expect((await call('POST', '', 'creator', { name: 'kids' })).status).toBe(409);
  });
});
