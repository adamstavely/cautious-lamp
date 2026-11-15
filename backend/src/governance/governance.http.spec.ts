import { readdirSync, readFileSync } from 'fs';
import * as path from 'path';
import { ServicePrincipal } from '../auth/principal';
import { DesignSystemService } from '../design-system/design-system.service';
import { InMemoryStore } from '../reviews/testing/in-memory-store';
import { BUILTIN_RULES } from './builtin-rules';
import { GovernanceController } from './governance.controller';
import { META_STORE, MetaDoc, RULE_STORE, SCAN_STORE } from './governance-stores';
import { GovernanceScanScheduler } from './governance.scheduler';
import { GovernanceRule, ScanRecord } from './governance.types';
import { RulesService } from './rules.service';
import { ScansService } from './scans.service';
import { APPLICATION_DIRECTORY, DESIGN_SYSTEM_SOURCE, DesignSystemServiceSource } from './sources';
import { ADMIN_KEY, FakeApplications, FakeDesignSystem, authProviders, readScopeProviders, startApp, userKey, workspace } from './testing/fakes';

const customRule = {
  name: 'No lorem ipsum',
  description: 'Placeholder copy',
  category: 'custom',
  severity: 'warning',
  type: 'regex-absent',
  target: 'html',
  pattern: 'lorem ipsum',
  flags: 'i',
  message: 'Placeholder text',
};

describe('Governance HTTP API', () => {
  const ruleStore = new InMemoryStore<GovernanceRule>();
  const scanStore = new InMemoryStore<ScanRecord>();
  const metaStore = new InMemoryStore<MetaDoc>();
  const applications = new FakeApplications([
    { id: 'app-1', name: 'Marketing Site' },
    { id: 'app-2', name: 'Admin', applicationUrl: 'http://127.0.0.1/' },
    { id: 'app-3', name: 'Picked rules', governanceRules: ['a11y-image-alt', 'rule-deleted-since'] },
  ]);
  const designSystem = new FakeDesignSystem(
    [
      { id: 'button', name: 'Button', code: { vue: '<template><button class="b">Go</button><img src="x.png"></template>\n<style>.b { color: #ff0000; }</style>' } },
      { id: 'card', name: 'card-item', code: { html: '<div><h1>Card</h1><h3>Sub</h3></div>' } },
    ],
    [{ name: 'red', value: '#00ff00' }],
  );
  let h: Awaited<ReturnType<typeof startApp>>;
  const call = (...args: Parameters<typeof h.call>) => h.call(...args);
  const admin = (method: string, route: string, body?: unknown) => h.call(method, route, body, ADMIN_KEY);

  beforeAll(async () => {
    h = await startApp({
      controllers: [GovernanceController],
      providers: [
        RulesService,
        ScansService,
        GovernanceScanScheduler,
        { provide: RULE_STORE, useValue: ruleStore },
        { provide: SCAN_STORE, useValue: scanStore },
        { provide: META_STORE, useValue: metaStore },
        { provide: APPLICATION_DIRECTORY, useValue: applications },
        ...readScopeProviders(),
        { provide: DESIGN_SYSTEM_SOURCE, useValue: designSystem },
        ...authProviders,
      ],
    });
  });

  afterAll(async () => {
    await h.app.close();
  });

  it('requires authentication', async () => {
    expect((await call('GET', '/governance/rules', undefined, null)).status).toBe(401);
  });

  it('seeds the built-in rules once', async () => {
    const res = await call('GET', '/governance/rules');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(BUILTIN_RULES.length);
    expect(res.body.rules.every((r: GovernanceRule) => r.builtIn && r.version === 1)).toBe(true);

    // A deleted built-in stays deleted: seeding doesn't run again
    expect((await admin('DELETE', '/governance/rules/ux-inline-styles')).status).toBe(204);
    await h.moduleRef.get(RulesService).ensureSeeded();
    const again = await call('GET', '/governance/rules');
    expect(again.body.total).toBe(BUILTIN_RULES.length - 1);
    expect((await call('GET', '/governance/rules/ux-inline-styles')).status).toBe(404);
  });

  it('needs admin:governance for every rule write', async () => {
    expect((await call('POST', '/governance/rules', customRule)).status).toBe(403);
    expect((await call('PUT', '/governance/rules/a11y-image-alt', customRule)).status).toBe(403);
    expect((await call('PATCH', '/governance/rules/a11y-image-alt', { enabled: false })).status).toBe(403);
    expect((await call('DELETE', '/governance/rules/a11y-image-alt')).status).toBe(403);
    expect((await call('POST', '/governance/rules/import', { rules: [] })).status).toBe(403);
    expect((await call('POST', '/governance/rules/test', { rule: customRule, sample: { html: 'x' } })).status).toBe(403);
    expect((await call('POST', '/compliance/scan-application', { applicationId: 'app-1', codebase: { html: 'x' } })).status).toBe(403);
    expect((await call('POST', '/governance/scans', { scope: 'application', applicationId: 'app-1', codebase: { html: 'x' } })).status).toBe(403);
  });

  it('creates, updates (with version checks), patches and deletes rules', async () => {
    const created = await admin('POST', '/governance/rules', customRule);
    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({ ...customRule, enabled: true, builtIn: false, version: 1, createdBy: 'service:admin-key' });
    const id = created.body.id;

    const updated = await admin('PUT', `/governance/rules/${id}`, { ...customRule, severity: 'error', version: 1 });
    expect(updated.body).toMatchObject({ severity: 'error', version: 2, createdAt: created.body.createdAt });
    const stale = await admin('PUT', `/governance/rules/${id}`, { ...customRule, version: 1 });
    expect(stale.status).toBe(409);

    const patched = await admin('PATCH', `/governance/rules/${id}`, { enabled: false });
    expect(patched.body).toMatchObject({ enabled: false, severity: 'error', version: 3 });

    expect((await call('GET', `/governance/rules/${id}`)).body.version).toBe(3);
    expect((await admin('DELETE', `/governance/rules/${id}`)).status).toBe(204);
    expect((await admin('DELETE', `/governance/rules/${id}`)).status).toBe(404);
    expect((await admin('PUT', '/governance/rules/nope', customRule)).status).toBe(404);
  });

  it('accepts no code: unknown fields such as scannerCode are rejected everywhere', async () => {
    const withCode = { ...customRule, scannerCode: 'return process.exit(1)' };
    expect((await admin('POST', '/governance/rules', withCode)).status).toBe(400);
    expect((await admin('PUT', '/governance/rules/a11y-image-alt', withCode)).status).toBe(400);
    expect((await admin('POST', '/governance/rules/import', { rules: [withCode] })).status).toBe(400);
    expect((await admin('POST', '/governance/rules/test', { rule: withCode, sample: { html: '' } })).status).toBe(400);
    const legacy = await admin('POST', '/compliance/scan', { scope: 'design-system', rules: [{ name: 'x', scannerCode: 'return []' }] });
    expect(legacy.status).toBe(400);
    expect((await admin('POST', '/governance/rules', { ...customRule, type: 'javascript' })).status).toBe(400);
    expect((await admin('POST', '/governance/rules', { ...customRule, builtin: 'eval', type: 'builtin' })).status).toBe(400);
  });

  it('source files contain no dynamic code execution', () => {
    const dirs = [__dirname, path.join(__dirname, '../accessibility-reports')];
    for (const dir of dirs) {
      for (const file of readdirSync(dir).filter((f) => f.endsWith('.ts') && !f.endsWith('.spec.ts'))) {
        const source = readFileSync(path.join(dir, file), 'utf8');
        expect([file, /new Function\s*\(/.test(source)]).toEqual([file, false]);
        expect([file, /\bvm\.(run|Script|compile)/.test(source)]).toEqual([file, false]);
      }
    }
  });

  it('rejects unsafe and oversized patterns, bad selectors and type/target mismatches', async () => {
    const post = (patch: object) => admin('POST', '/governance/rules', { ...customRule, ...patch });
    expect((await post({ pattern: '(a+)+$' })).body.message).toMatch(/catastrophic/);
    expect((await post({ pattern: '(x|xx)*y' })).status).toBe(400);
    expect((await post({ pattern: 'a'.repeat(301) })).status).toBe(400);
    expect((await post({ pattern: '(a)\\1' })).status).toBe(400);
    expect((await post({ flags: 'g' })).status).toBe(400);
    expect((await post({ type: 'selector-count', selector: 'div[', max: 0 })).body.message).toMatch(/Invalid CSS selector/);
    expect((await post({ type: 'selector-count', selector: 'div' })).body.message).toMatch(/min, max/);
    expect((await post({ type: 'token-usage', target: 'html', properties: ['color'] })).body.message).toMatch(/only target css/);
    expect((await post({ type: 'token-usage', target: 'css', properties: ['col;or'] })).status).toBe(400);
  });

  it('tests an unsaved rule against sample code without storing anything', async () => {
    const before = scanStore.docs.size;
    const res = await admin('POST', '/governance/rules/test', {
      rule: { ...customRule, pattern: undefined, type: 'selector-attribute', selector: 'img', attribute: 'alt' },
      sample: { html: '<img src="a"><img src="b" alt="">' },
    });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ outcome: 'fail', summary: { warnings: 1, total: 1 } });
    expect(scanStore.docs.size).toBe(before);
  });

  it('exports and re-imports rules', async () => {
    const exported = await call('GET', '/governance/rules/export');
    expect(exported.body.format).toBe('cautious-lamp-governance-rules');
    const imported = await admin('POST', '/governance/rules/import', {
      ...exported.body,
      rules: [...exported.body.rules.map((r: GovernanceRule) => (r.id === 'ds-important' ? { ...r, severity: 'error' } : r)), { ...customRule, id: 'imported-rule' }],
    });
    expect(imported.status).toBe(201);
    expect(imported.body).toEqual({ created: 1, updated: exported.body.rules.length, deleted: 0 });
    expect((await call('GET', '/governance/rules/ds-important')).body).toMatchObject({ severity: 'error', version: 2 });

    const invalid = await admin('POST', '/governance/rules/import', { rules: [{ ...customRule, pattern: '(a*)*' }] });
    expect(invalid.status).toBe(400);
    expect(invalid.body.message).toMatch(/^Rule 1 \(No lorem ipsum\)/);

    const replaced = await admin('POST', '/governance/rules/import', { rules: [{ ...customRule, id: 'imported-rule' }], mode: 'replace' });
    expect(replaced.body).toMatchObject({ updated: 1, deleted: exported.body.rules.length });
    expect((await call('GET', '/governance/rules')).body.total).toBe(1);

    // Put the built-ins back for the scan tests
    await admin('POST', '/governance/rules/import', { rules: exported.body.rules });
  });

  it('returns 400 for an application scan with nothing to scan, instead of a fake pass', async () => {
    const res = await admin('POST', '/governance/scans', { scope: 'application', applicationId: 'app-1' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Nothing to scan/);
    expect((await admin('POST', '/compliance/scan-application', { applicationId: 'app-1' })).status).toBe(400);
    expect((await admin('POST', '/governance/scans', { scope: 'application', applicationId: 'missing', codebase: { html: 'x' } })).status).toBe(404);
    expect((await admin('POST', '/governance/scans', { scope: 'application', applicationId: 'app-1', codebase: { html: 'x' }, url: 'https://example.com' })).status).toBe(400);
  });

  it('refuses to fetch private URLs', async () => {
    const res = await admin('POST', '/governance/scans', { scope: 'application', applicationId: 'app-2', url: 'http://127.0.0.1:9/' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/private or internal/);
  });

  it("scans the application's own URL when nothing is sent, like the scheduler", async () => {
    // app-2's URL is internal, so the fallback is visible as the same refusal (it was fetched, not skipped)
    const res = await admin('POST', '/governance/scans', { scope: 'application', applicationId: 'app-2' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/private or internal/);
  });

  it('runs only the rules an application picked, skipping ones deleted since', async () => {
    const res = await admin('POST', '/governance/scans', { scope: 'application', applicationId: 'app-3', codebase: { html: '<img src="a.png">' } });
    expect(res.status).toBe(201);
    expect(res.body.rules.map((r: { id: string }) => r.id)).toEqual(['a11y-image-alt']);
  });

  it('scans supplied code, stores the result with rule versions, and records the scan on the application', async () => {
    const html = '<main><h1>Hi</h1><img src="hero.png"><input placeholder="Email"><p style="color:red">x</p></main>';
    const res = await admin('POST', '/governance/scans', {
      scope: 'application',
      applicationId: 'app-1',
      codebase: { html, css: '.x { color: #123456 !important; }', file: 'index.html' },
      categories: ['accessibility', 'design-system'],
    });
    expect(res.status).toBe(201);
    const scan = res.body;
    expect(scan).toMatchObject({ scope: 'application', source: 'codebase', applicationId: 'app-1', applicationName: 'Marketing Site' });
    // Counts are the checks by status
    for (const [key, status] of [['passed', 'pass'], ['warnings', 'warning'], ['failed', 'error'], ['info', 'info']] as const) {
      expect(scan[key]).toBe(scan.checks.filter((c: { status: string }) => c.status === status).length);
    }
    const failing = scan.ruleResults.filter((r: { outcome: string }) => r.outcome === 'fail').map((r: { ruleId: string }) => r.ruleId);
    expect(failing).toEqual(expect.arrayContaining(['a11y-image-alt', 'a11y-form-labels', 'a11y-axe', 'ds-hardcoded-colors', 'ds-important']));
    expect(scan.rules.find((r: { id: string }) => r.id === 'ds-important')).toMatchObject({ version: expect.any(Number) });
    expect(scan.ruleResults.find((r: { ruleId: string }) => r.ruleId === 'ds-component-import')).toMatchObject({ outcome: 'skipped' });
    expect(scan.checks.find((c: { ruleId: string }) => c.ruleId === 'a11y-image-alt')).toMatchObject({ file: 'index.html', line: 1, status: 'error' });
    expect(applications.scans).toContainEqual(expect.objectContaining({ id: 'app-1', kind: 'governance' }));
    expect(scan.access).toEqual({ workspaceId: null });

    const history = await admin('GET', '/governance/scans?applicationId=app-1');
    expect(history.body.scans[0]).toMatchObject({ id: scan.id, summary: scan.summary });
    const stored = await admin('GET', `/governance/scans/${scan.id}`);
    expect(stored.body.checks).toHaveLength(scan.checks.length);
    expect((await admin('GET', '/governance/scans/scan-nope')).status).toBe(404);
    // app-1 has no workspace: its evidence is for governance admins only
    expect((await call('GET', '/governance/scans?applicationId=app-1')).body).toEqual({ scans: [], total: 0 });
    expect((await call('GET', `/governance/scans/${scan.id}`)).status).toBe(404);
  }, 30000);

  it('scans the design system itself with read access (the MCP server path)', async () => {
    const res = await call('POST', '/compliance/scan', { scope: 'design-system', categories: ['design-system'] });
    expect(res.status).toBe(200);
    expect(res.body.scope).toBe('design-system');
    const byComponent = (name: string) => res.body.checks.filter((c: { component?: string }) => c.component === name).map((c: { ruleId: string }) => c.ruleId);
    expect(byComponent('Button')).toContain('ds-hardcoded-colors');
    expect(byComponent('card-item')).toContain('ds-component-naming');
    expect((await call('POST', '/compliance/scan', { scope: 'design-system', codebase: { html: 'x' } })).status).toBe(400);
    expect((await call('POST', '/compliance/scan', { scope: 'design-system', ruleIds: ['nope'] })).status).toBe(400);
  }, 30000);

  it('scans just the components named in componentIds', async () => {
    const res = await call('POST', '/compliance/scan', { scope: 'design-system', componentIds: ['button'], categories: ['design-system'] });
    expect(res.status).toBe(200);
    const components = new Set(res.body.checks.map((c: { component?: string }) => c.component).filter(Boolean));
    expect([...components]).toEqual(['Button']);
    expect((await call('POST', '/compliance/scan', { scope: 'design-system', componentIds: ['button', 'nope'] })).status).toBe(404);
    expect((await admin('POST', '/compliance/scan', { scope: 'application', applicationId: 'app-1', componentIds: ['button'] })).status).toBe(400);
  }, 30000);

  it('serves the linter export without code', async () => {
    const res = await call('GET', '/rules/export?format=eslint');
    expect(res.status).toBe(200);
    expect(res.body.rules.length).toBeGreaterThan(0);
    expect(JSON.stringify(res.body)).not.toMatch(/scannerCode/);
  });
});

/**
 * Scans and scan history respect workspace boundaries (docs/GOVERNANCE.md),
 * through the real guard, ScansService, DesignSystemService and
 * ComponentAccessService. alice is a member of ws_alpha, bob of ws_beta.
 */
describe('Governance scan visibility', () => {
  const scanStore = new InMemoryStore<ScanRecord>();
  const applications = new FakeApplications([
    { id: 'app-alpha', name: 'Alpha app', workspaceId: 'ws_alpha' },
    { id: 'app-none', name: 'No workspace', workspaceId: null },
  ]);
  const naming = { scope: 'design-system', ruleIds: ['ds-component-naming'] };
  let h: Awaited<ReturnType<typeof startApp>>;
  const as = (name: string, method: string, route: string, body?: unknown) => h.call(method, route, body, userKey(name));
  const visibleIds = async (name: string, query = '') => (await as(name, 'GET', `/governance/scans${query}`)).body.scans.map((scan: ScanRecord) => scan.id);

  beforeAll(async () => {
    h = await startApp({
      controllers: [GovernanceController],
      providers: [
        RulesService,
        ScansService,
        GovernanceScanScheduler,
        { provide: RULE_STORE, useValue: new InMemoryStore<GovernanceRule>() },
        { provide: SCAN_STORE, useValue: scanStore },
        { provide: META_STORE, useValue: new InMemoryStore<MetaDoc>() },
        { provide: APPLICATION_DIRECTORY, useValue: applications },
        ...readScopeProviders([workspace('ws_alpha', 'alice'), workspace('ws_beta', 'bob')]),
        { provide: DESIGN_SYSTEM_SOURCE, inject: [DesignSystemService], useFactory: (ds: DesignSystemService) => new DesignSystemServiceSource(ds) },
        ...authProviders,
      ],
    });
    const designSystem = h.moduleRef.get(DesignSystemService);
    // Not PascalCase, so the naming rule reports it by name
    await designSystem.createComponent({ id: 'alpha-secret', name: 'alphaSecret', description: 'Alpha only', workspaceId: 'ws_alpha' });
  });

  afterAll(async () => {
    await h.app.close();
  });

  it("leaves a private component out of an outsider's design-system scan", async () => {
    const bob = await as('bob', 'POST', '/governance/scans', naming);
    expect(bob.status).toBe(201);
    expect(JSON.stringify(bob.body)).not.toMatch(/alphaSecret/);
    expect(bob.body.access).toEqual({ componentAudiences: [] });

    const alice = await as('alice', 'POST', '/compliance/scan', naming);
    expect(alice.status).toBe(200);
    expect(alice.body.checks.map((c: { component?: string }) => c.component)).toContain('alphaSecret');
    expect(alice.body.access).toEqual({ componentAudiences: [['ws_alpha']] });

    // Naming a component the caller can't read is a 404, as if it didn't exist
    expect((await as('bob', 'POST', '/compliance/scan', { ...naming, componentIds: ['alpha-secret'] })).status).toBe(404);
    const only = await as('alice', 'POST', '/compliance/scan', { ...naming, componentIds: ['alpha-secret'] });
    expect(only.status).toBe(200);
    expect(only.body.access).toEqual({ componentAudiences: [['ws_alpha']] });
  }, 30000);

  it('keeps stored design-system scans from readers who cannot see every component in them', async () => {
    const alice = await as('alice', 'POST', '/governance/scans', naming);
    expect((await as('bob', 'GET', `/governance/scans/${alice.body.id}`)).status).toBe(404);
    expect(await visibleIds('bob')).not.toContain(alice.body.id);
    // admin:governance doesn't open workspace components; admin:users does
    expect((await as('gov', 'GET', `/governance/scans/${alice.body.id}`)).status).toBe(404);
    expect((await as('super', 'GET', `/governance/scans/${alice.body.id}`)).status).toBe(200);
    expect((await as('alice', 'GET', `/governance/scans/${alice.body.id}`)).body.checks.length).toBe(alice.body.checks.length);

    const bob = await as('bob', 'POST', '/governance/scans', naming);
    expect(await visibleIds('alice')).toEqual(expect.arrayContaining([alice.body.id, bob.body.id]));
  }, 30000);

  it("scopes application scan history to the application's workspace", async () => {
    const scan = await as('gov', 'POST', '/governance/scans', { scope: 'application', applicationId: 'app-alpha', codebase: { html: '<img src="x.png">' }, ruleIds: ['a11y-image-alt'] });
    expect(scan.status).toBe(201);
    expect(scan.body.access).toEqual({ workspaceId: 'ws_alpha' });
    const unowned = await as('gov', 'POST', '/governance/scans', { scope: 'application', applicationId: 'app-none', codebase: { html: '<img src="x.png">' }, ruleIds: ['a11y-image-alt'] });

    expect(await visibleIds('alice', '?scope=application')).toEqual([scan.body.id]);
    expect((await as('alice', 'GET', `/governance/scans/${scan.body.id}`)).status).toBe(200);
    expect((await as('alice', 'GET', `/governance/scans/${unowned.body.id}`)).status).toBe(404);
    expect(await visibleIds('bob', '?scope=application')).toEqual([]);
    expect((await as('bob', 'GET', '/governance/scans?applicationId=app-alpha')).body.total).toBe(0);
    expect((await as('bob', 'GET', `/governance/scans/${scan.body.id}`)).status).toBe(404);
    expect(await visibleIds('gov', '?scope=application')).toEqual(expect.arrayContaining([scan.body.id, unowned.body.id]));
  });

  it('reads scans stored before access metadata existed as admin-only', async () => {
    const legacy = (id: string, scope: 'application' | 'design-system'): ScanRecord => ({
      id,
      scope,
      source: scope === 'application' ? 'codebase' : 'design-system',
      ...(scope === 'application' ? { applicationId: 'app-alpha', applicationName: 'Alpha app' } : {}),
      createdAt: '2026-01-01T00:00:00.000Z',
      createdBy: { type: 'user', id: 'usr_old', name: 'old' },
      rules: [],
      ruleResults: [],
      summary: { passed: 0, warnings: 0, errors: 0, info: 0, total: 0 },
      checks: [],
      truncated: false,
    });
    scanStore.forceWrite(legacy('scan-legacy-app', 'application'));
    scanStore.forceWrite(legacy('scan-legacy-ds', 'design-system'));

    expect((await as('alice', 'GET', '/governance/scans/scan-legacy-app')).status).toBe(404);
    expect((await as('gov', 'GET', '/governance/scans/scan-legacy-app')).status).toBe(200);
    expect((await as('alice', 'GET', '/governance/scans/scan-legacy-ds')).status).toBe(404);
    expect((await as('gov', 'GET', '/governance/scans/scan-legacy-ds')).status).toBe(404);
    expect((await as('super', 'GET', '/governance/scans/scan-legacy-ds')).status).toBe(200);
  });

  it('scans every component for the system, and stores who may read the result', async () => {
    const system: ServicePrincipal = { type: 'service', id: 'governance-scheduler', name: 'Scheduler', email: null, roles: [], permissions: new Set(), mustChangePassword: false };
    const scans = h.moduleRef.get(ScansService);
    const scan = await scans.scan({ scope: 'design-system', ruleIds: ['ds-component-naming'] }, system, { system: true });
    expect(scan.checks.map((c) => c.component)).toContain('alphaSecret');
    // Without `system`, the same service principal reads no workspace components
    expect(JSON.stringify(await scans.scan({ scope: 'design-system', ruleIds: ['ds-component-naming'] }, system))).not.toMatch(/alphaSecret/);
    expect((await as('bob', 'GET', `/governance/scans/${scan.id}`)).status).toBe(404);
    expect((await as('alice', 'GET', `/governance/scans/${scan.id}`)).status).toBe(200);
  }, 30000);
});
