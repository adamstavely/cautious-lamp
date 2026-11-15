import { INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { AuthGuard } from '../auth/auth.guard';
import { AuthService } from '../auth/auth.service';
import { AuthPrincipal } from '../auth/principal';
import { SecurityAuditService } from '../common/security/security-audit.service';
import { ContributionWorkflowController } from '../contribution-workflow/contribution-workflow.controller';
import { ContributionWorkflowService } from '../contribution-workflow/contribution-workflow.service';
import { DesignSystemService } from '../design-system/design-system.service';
import { CHANGE_RECORDER, ChangeInput } from '../notifications/notification.types';
import { ScansService } from '../governance/scans.service';
import { Permission } from '../rbac/rbac.service';
import { PatternsLibraryController } from './patterns-library.controller';
import { PatternsLibraryService } from './patterns-library.service';

const PEOPLE: Record<string, string[]> = {
  viewer: [Permission.COMPONENT_VIEW, Permission.PATTERN_VIEW],
  author: [Permission.PATTERN_CREATE, Permission.PATTERN_EDIT, Permission.PATTERN_DELETE, Permission.COMPONENT_CREATE, Permission.COMPONENT_APPROVE],
};

const authStub = {
  async resolve(credential?: string): Promise<AuthPrincipal | null> {
    const name = credential?.startsWith('tok-') ? credential.slice(4) : '';
    if (!PEOPLE[name]) return null;
    return { type: 'user', id: `usr_${name}`, email: `${name}@example.com`, name, roles: [name], permissions: new Set(PEOPLE[name]), mustChangePassword: false };
  },
};

/** Pattern and contribution-process writes need their permissions; reads stay open to anyone signed in */
describe('Pattern library and contribution workflow permissions', () => {
  let app: INestApplication;
  let base: string;
  /** Changes the pattern routes reported to the changelog */
  const recorded: ChangeInput[] = [];

  const call = async (method: string, route: string, as: string, body: unknown = {}) => {
    const res = await fetch(`${base}${route}`, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer tok-${as}` },
      body: method === 'GET' ? undefined : JSON.stringify(body),
    });
    return res.status;
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [PatternsLibraryController, ContributionWorkflowController],
      providers: [
        PatternsLibraryService,
        ContributionWorkflowService,
        { provide: DesignSystemService, useValue: { getAllComponents: async () => [] } },
        { provide: CHANGE_RECORDER, useValue: { record: async (change: ChangeInput) => void recorded.push(change) } },
        { provide: ScansService, useValue: {} },
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

  const writes: Array<[string, string]> = [
    ['POST', '/patterns-library/patterns'],
    ['PUT', '/patterns-library/patterns/p1'],
    ['DELETE', '/patterns-library/patterns/p1'],
    ['POST', '/contribution-workflow/guidelines'],
    ['POST', '/contribution-workflow/templates'],
    ['POST', '/contribution-workflow/checks'],
    ['POST', '/contribution-workflow/templates/t1/generate-pr'],
    ['POST', '/contribution-workflow/checks/run'],
  ];

  it.each(writes)('%s %s is refused without the permission and allowed with it', async (method, route) => {
    expect(await call(method, route, 'viewer')).toBe(403);
    expect(await call(method, route, 'author')).not.toBe(403);
    expect(await call(method, route, 'nobody')).toBe(401);
  });

  it('refuses a pattern without a name, description or valid category, so the list keeps working', async () => {
    expect(await call('POST', '/patterns-library/patterns', 'author', { name: 'x', description: 'y', category: 'nope' })).toBe(400);
    expect(await call('POST', '/patterns-library/patterns', 'author', { name: ' ', description: 'y', category: 'common' })).toBe(400);
    expect(await call('POST', '/patterns-library/patterns', 'author', { name: 'Card grid', description: 'Cards in a grid', category: 'common' })).toBe(201);
  });

  it('reports created, changed, deprecated and deleted patterns to the changelog', async () => {
    recorded.length = 0;
    const res = await fetch(`${base}/patterns-library/patterns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer tok-author' },
      body: JSON.stringify({ name: 'Stacked list', description: 'Rows of items', category: 'common' }),
    });
    const id = (await res.json()).id;
    await call('PUT', `/patterns-library/patterns/${id}`, 'author', { description: 'Rows' });
    await call('PUT', `/patterns-library/patterns/${id}`, 'author', { tags: ['deprecated'] });
    await call('DELETE', `/patterns-library/patterns/${id}`, 'author');
    await call('DELETE', `/patterns-library/patterns/${id}`, 'author'); // already gone: nothing recorded
    expect(recorded.map((c) => [c.type, c.entityId, c.action, c.breaking ?? false])).toEqual([
      ['pattern', id, 'created', false],
      ['pattern', id, 'updated', false],
      ['pattern', id, 'deprecated', false],
      ['pattern', id, 'deleted', true],
    ]);
  });

  it('keeps reads open to anyone signed in', async () => {
    expect(await call('GET', '/patterns-library/patterns', 'viewer')).toBe(200);
    expect(await call('GET', '/contribution-workflow/guidelines', 'viewer')).toBe(200);
  });
});
