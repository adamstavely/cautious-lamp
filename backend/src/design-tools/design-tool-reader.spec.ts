import { DesignToolReader } from './design-tool-reader';
import { DesignToolError, publicJsonHttp } from './design-tool-http';
import { figmaFileKey } from './figma.client';
import { penpotFileRef } from './penpot.client';
import { FIGMA_KEY, FIGMA_PLAN_ERROR, PENPOT_FILE, figmaFixture, penpotFixture } from './testing/fake-design-tools';

const byName = (tokens: Array<{ name: string }>) => Object.fromEntries(tokens.map((t) => [t.name, t]));

describe('Reading Figma files', () => {
  it('maps variables and colour and text styles to design-system tokens', async () => {
    const { http } = figmaFixture();
    const snapshot = await new DesignToolReader(http).read({ tool: 'figma', fileId: FIGMA_KEY }, 'figd_test');
    expect(snapshot).toMatchObject({ tool: 'figma', fileId: FIGMA_KEY, name: 'Acme design system', version: '42', variables: { status: 'read' } });

    const tokens = byName(snapshot.tokens);
    expect(tokens['color.primary']).toMatchObject({ value: '#4f46e5', type: 'color', category: 'colors', source: 'variable', designName: 'Color/Primary' });
    // An alias becomes a reference to the token its target maps to
    expect(tokens['color.link']).toMatchObject({ value: '{color.primary}' });
    expect(tokens['spacing.md']).toMatchObject({ value: '16px', type: 'dimension', category: 'spacing' });
    expect(tokens['border.radius.sm']).toMatchObject({ value: '6px', type: 'dimension', category: 'borders' });
    expect(tokens['typography.fontFamily.body']).toMatchObject({ value: 'Inter', type: 'fontFamily', category: 'typography' });
    // Styles: a solid fill, and a text style split into its type settings
    expect(tokens['color.brand.accent']).toMatchObject({ value: '#ff8000', source: 'style', description: 'Accent colour' });
    expect(tokens['typography.fontSize.heading.xl']).toMatchObject({ value: '24px', type: 'fontSize' });
    expect(tokens['typography.fontWeight.heading.xl']).toMatchObject({ value: '700' });
    expect(tokens['typography.lineHeight.heading.xl']).toMatchObject({ value: '32px' });
    expect(tokens['typography.fontFamily.heading.xl']).toMatchObject({ value: 'Inter' });
    // Booleans, unscoped opacities and library variables don't become tokens
    expect(Object.keys(tokens).some((n) => /opacity|compact|library/.test(n))).toBe(false);

    expect(snapshot.warnings.join('\n')).toMatch(/only its default mode \("Light"\)/);
    expect(snapshot.warnings.join('\n')).toMatch(/effect or grid style/);
  });

  it('reads component sets with their variants, and standalone components, with links to the nodes', async () => {
    const { http } = figmaFixture();
    const snapshot = await new DesignToolReader(http).read({ tool: 'figma', fileId: `https://www.figma.com/design/${FIGMA_KEY}/Acme?node-id=0-1` }, 'figd_test');
    expect(snapshot.components).toEqual([
      { id: '1:0', name: 'Button', description: 'Primary actions', variants: ['Size=Small, State=Default', 'Size=Large, State=Default'], kind: 'component-set', url: `https://www.figma.com/design/${FIGMA_KEY}/?node-id=1-0` },
      { id: '2:1', name: 'Text Field', path: 'Forms', description: 'Single-line input', variants: [], kind: 'component', url: `https://www.figma.com/design/${FIGMA_KEY}/?node-id=2-1` },
      { id: '3:1', name: 'Toast', variants: [], kind: 'component', url: `https://www.figma.com/design/${FIGMA_KEY}/?node-id=3-1` },
    ]);
  });

  it('sends the personal access token in X-Figma-Token to api.figma.com only', async () => {
    const { http } = figmaFixture();
    await new DesignToolReader(http).read({ tool: 'figma', fileId: FIGMA_KEY }, 'figd_test');
    expect(http.requests.map((r) => new URL(r.url).origin)).toEqual(expect.arrayContaining(['https://api.figma.com']));
    expect(new Set(http.requests.map((r) => new URL(r.url).origin)).size).toBe(1);
    expect(http.requests.every((r) => r.headers['X-Figma-Token'] === 'figd_test' && r.method === 'GET')).toBe(true);
  });

  it("says clearly when the plan doesn't include the variables API, and still reads styles", async () => {
    const fixture = figmaFixture();
    Object.assign(fixture.variables, FIGMA_PLAN_ERROR);
    const snapshot = await new DesignToolReader(fixture.http).read({ tool: 'figma', fileId: FIGMA_KEY }, 'figd_test');
    expect(snapshot.variables.status).toBe('unavailable');
    expect(snapshot.variables.message).toMatch(/Limited by Figma plan/);
    expect(snapshot.variables.message).toMatch(/Enterprise/);
    expect(snapshot.variables.message).toMatch(/file_variables:read/);
    expect(snapshot.warnings).toContain(snapshot.variables.message);
    expect(snapshot.tokens.map((t) => t.source)).toEqual(expect.arrayContaining(['style']));
    expect(snapshot.tokens.some((t) => t.source === 'variable')).toBe(false);
  });

  it('turns a refused token or a missing file into a readable error', async () => {
    const { http } = figmaFixture();
    const reader = new DesignToolReader(http);
    await expect(reader.read({ tool: 'figma', fileId: FIGMA_KEY }, 'wrong')).rejects.toThrow(/Figma refused the access token.*HTTP 403/);
    await expect(reader.read({ tool: 'figma', fileId: 'Zz0000000000000' }, 'figd_test')).rejects.toThrow(/no file with that key/);
    await expect(reader.read({ tool: 'figma', fileId: FIGMA_KEY }, undefined)).rejects.toThrow(/no Figma personal access token/);
  });

  it('takes the file key from a key, a file URL or a branch URL', () => {
    expect(figmaFileKey(FIGMA_KEY)).toBe(FIGMA_KEY);
    expect(figmaFileKey(`https://www.figma.com/file/${FIGMA_KEY}/Name`)).toBe(FIGMA_KEY);
    expect(figmaFileKey('f', `https://www.figma.com/design/${FIGMA_KEY}/Name/branch/BrAnCh12345?node-id=1`)).toBe('BrAnCh12345');
    expect(() => figmaFileKey('not a key')).toThrow(DesignToolError);
  });
});

describe('Reading Penpot files', () => {
  it('maps library colours, typographies and design tokens, and groups variants', async () => {
    const { http } = penpotFixture();
    const snapshot = await new DesignToolReader(http).read({ tool: 'penpot', fileId: PENPOT_FILE }, 'penpot_test');
    expect(snapshot).toMatchObject({ tool: 'penpot', name: 'Acme Penpot', version: '17', variables: { status: 'not-applicable' } });

    const tokens = byName(snapshot.tokens);
    expect(tokens['color.primary']).toMatchObject({ value: '#4f46e5', source: 'library-color' });
    expect(tokens['color.overlay']).toMatchObject({ value: '#00000080' });
    expect(tokens['typography.fontSize.body']).toMatchObject({ value: '16px' });
    expect(tokens['typography.fontWeight.body']).toMatchObject({ value: '400' });
    expect(tokens['typography.lineHeight.body']).toMatchObject({ value: '1.5' });
    expect(tokens['spacing.lg']).toMatchObject({ value: '24px', source: 'token' });
    expect(tokens['border.radius.md']).toMatchObject({ value: '8px', category: 'borders' });
    expect(tokens['color.brand.link']).toMatchObject({ value: '{color.brand.base}' });
    expect(snapshot.warnings.join('\n')).toMatch(/gradient/);
    expect(snapshot.warnings.join('\n')).toMatch(/1 Penpot token\(s\) were skipped/);

    expect(snapshot.components).toEqual([
      { id: 'v1', name: 'Button', path: 'Actions', variants: ['Size=Small', 'Size=Large'], kind: 'component-set' },
      { id: 'card', name: 'Card', variants: [], kind: 'component' },
    ]);
  });

  it('calls the RPC get-file command with the access token, on the instance the URL names', async () => {
    const base = 'https://penpot.example.com';
    const { http } = penpotFixture(base);
    await new DesignToolReader(http).read({ tool: 'penpot', fileId: `${base}/#/workspace?team-id=x&file-id=${PENPOT_FILE}&page-id=y` }, 'penpot_test');
    expect(http.requests).toEqual([{ url: `${base}/api/rpc/command/get-file`, method: 'POST', headers: { Authorization: 'Token penpot_test' }, body: { id: PENPOT_FILE } }]);
  });

  it('reports a refused token and unreadable tokens without guessing', async () => {
    const fixture = penpotFixture();
    await expect(new DesignToolReader(fixture.http).read({ tool: 'penpot', fileId: PENPOT_FILE }, 'nope')).rejects.toThrow(/Penpot refused the access token/);
    fixture.file.data.tokensLib = { '~#tokens-lib': 'opaque' };
    const snapshot = await new DesignToolReader(fixture.http).read({ tool: 'penpot', fileId: PENPOT_FILE }, 'penpot_test');
    expect(snapshot.warnings.join('\n')).toMatch(/weren't in a form the API could be read in/);
    expect(snapshot.tokens.every((t) => t.source !== 'token')).toBe(true);
  });

  it('finds the file id in workspace URLs', () => {
    expect(penpotFileRef(PENPOT_FILE)).toEqual({ base: 'https://design.penpot.app', id: PENPOT_FILE });
    expect(penpotFileRef(`https://p.example.org/#/workspace/11111111-2222-3333-4444-555555555555/${PENPOT_FILE}`)).toEqual({ base: 'https://p.example.org', id: PENPOT_FILE });
    expect(() => penpotFileRef('abc')).toThrow(/Penpot file id/);
  });
});

describe('Adobe XD', () => {
  it('is refused with the reason', async () => {
    await expect(new DesignToolReader(figmaFixture().http).read({ tool: 'adobe-xd', fileId: 'x' }, 'k')).rejects.toThrow(/Adobe has discontinued/);
  });
});

describe('Egress', () => {
  const http = publicJsonHttp({ timeoutMs: 2000 });

  it.each([
    'http://127.0.0.1:9001/api/rpc/command/get-file',
    'http://10.1.2.3/v1/files/x',
    'http://169.254.169.254/latest/meta-data',
    'http://[::1]/x',
    'http://192.168.1.10:3449/api/rpc/command/get-file',
  ])('refuses %s before connecting', async (url) => {
    await expect(http({ url, method: 'GET', headers: {} })).rejects.toThrow(/Refused to contact .*private or internal/);
  });

  it('refuses non-http schemes', async () => {
    await expect(http({ url: 'file:///etc/passwd', method: 'GET', headers: {} })).rejects.toThrow(/Refused to contact/);
  });

  it('refuses a self-hosted Penpot on a private address with a readable reason', async () => {
    const reader = new DesignToolReader(http);
    await expect(reader.read({ tool: 'penpot', fileId: PENPOT_FILE, fileUrl: 'http://127.0.0.1:9001/' }, 'penpot_test')).rejects.toThrow(/Refused to contact 127\.0\.0\.1:9001/);
  });
});
