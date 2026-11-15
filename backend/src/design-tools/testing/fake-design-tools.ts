import { DesignToolHttp, DesignToolRequest, DesignToolResponse } from '../design-tool-http';

export const FIGMA_KEY = 'AbCdEf1234567890';
export const PENPOT_FILE = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

/** A stand-in for the design tools' HTTP APIs: answers by URL, and records each request */
export function stubHttp(answer: (request: DesignToolRequest) => DesignToolResponse | undefined): DesignToolHttp & { requests: DesignToolRequest[] } {
  const requests: DesignToolRequest[] = [];
  const http = (async (request: DesignToolRequest) => {
    requests.push(request);
    return answer(request) ?? { status: 404, body: { message: 'Not found' } };
  }) as DesignToolHttp & { requests: DesignToolRequest[] };
  http.requests = requests;
  return http;
}

/**
 * A Figma file as GET /v1/files/:key, /nodes and /variables/local answer
 * for it: a Button component set with two variants, a text field, a toast,
 * a library component, colour/text/effect styles, and variables in a
 * two-mode collection (a colour that matches the seeded color.primary, an
 * alias, spacing, a radius, a font family, and two that don't map).
 */
export function figmaFixture() {
  const file = {
    name: 'Acme design system',
    version: '42',
    lastModified: '2026-11-01T10:00:00Z',
    components: {
      '1:1': { key: 'k1', name: 'Size=Small, State=Default', description: '', componentSetId: '1:0' },
      '1:2': { key: 'k2', name: 'Size=Large, State=Default', description: '', componentSetId: '1:0' },
      '2:1': { key: 'k3', name: 'Forms/Text Field', description: 'Single-line input' },
      '3:1': { key: 'k4', name: 'Toast', description: '' },
      '9:9': { key: 'k5', name: 'Library icon', description: '', remote: true },
    } as Record<string, any>,
    componentSets: {
      '1:0': { key: 's1', name: 'Button', description: 'Primary actions' },
    } as Record<string, any>,
    styles: {
      'S:fill1': { key: 'f1', name: 'Brand/Accent', styleType: 'FILL', description: 'Accent colour' },
      'S:text1': { key: 't1', name: 'Heading/XL', styleType: 'TEXT', description: '' },
      'S:fx1': { key: 'e1', name: 'Shadow/Card', styleType: 'EFFECT', description: '' },
    } as Record<string, any>,
  };
  const nodes: Record<string, any> = {
    'S:fill1': { document: { id: 'S:fill1', fills: [{ type: 'SOLID', color: { r: 1, g: 0.5, b: 0, a: 1 } }] } },
    'S:text1': { document: { id: 'S:text1', style: { fontFamily: 'Inter', fontWeight: 700, fontSize: 24, lineHeightPx: 32, lineHeightUnit: 'PIXELS' } } },
  };
  const variables: { status: number; body: any } = {
    status: 200,
    body: {
      status: 200,
      error: false,
      meta: {
        variableCollections: {
          'VC:1': { id: 'VC:1', name: 'Primitives', defaultModeId: 'm1', modes: [{ modeId: 'm1', name: 'Light' }, { modeId: 'm2', name: 'Dark' }] },
        },
        variables: {
          'V:1': { id: 'V:1', name: 'Color/Primary', resolvedType: 'COLOR', variableCollectionId: 'VC:1', scopes: ['ALL_SCOPES'], valuesByMode: { m1: { r: 0.3098, g: 0.2745, b: 0.898, a: 1 }, m2: { r: 1, g: 1, b: 1, a: 1 } } },
          'V:2': { id: 'V:2', name: 'Color/Link', resolvedType: 'COLOR', variableCollectionId: 'VC:1', scopes: ['ALL_SCOPES'], valuesByMode: { m1: { type: 'VARIABLE_ALIAS', id: 'V:1' } } },
          'V:3': { id: 'V:3', name: 'Spacing/md', resolvedType: 'FLOAT', variableCollectionId: 'VC:1', scopes: ['GAP'], valuesByMode: { m1: 16 } },
          'V:4': { id: 'V:4', name: 'Radius/sm', resolvedType: 'FLOAT', variableCollectionId: 'VC:1', scopes: ['CORNER_RADIUS'], valuesByMode: { m1: 6 } },
          'V:5': { id: 'V:5', name: 'Font family/Body', resolvedType: 'STRING', variableCollectionId: 'VC:1', scopes: ['FONT_FAMILY'], valuesByMode: { m1: 'Inter' } },
          'V:6': { id: 'V:6', name: 'Opacity/disabled', resolvedType: 'FLOAT', variableCollectionId: 'VC:1', scopes: ['OPACITY'], valuesByMode: { m1: 0.4 } },
          'V:7': { id: 'V:7', name: 'Is compact', resolvedType: 'BOOLEAN', variableCollectionId: 'VC:1', scopes: [], valuesByMode: { m1: true } },
          'V:8': { id: 'V:8', name: 'Library/Brand', resolvedType: 'COLOR', variableCollectionId: 'VC:9', remote: true, valuesByMode: { x: { r: 0, g: 0, b: 0, a: 1 } } },
        },
      },
    },
  };
  const http = stubHttp((request) => {
    const url = new URL(request.url);
    if (url.origin !== 'https://api.figma.com') return undefined;
    if (request.headers['X-Figma-Token'] !== 'figd_test') return { status: 403, body: { status: 403, err: 'Invalid token' } };
    if (url.pathname === `/v1/files/${FIGMA_KEY}`) return { status: 200, body: file };
    if (url.pathname === `/v1/files/${FIGMA_KEY}/nodes`) {
      const ids = (url.searchParams.get('ids') ?? '').split(',');
      return { status: 200, body: { name: file.name, nodes: Object.fromEntries(ids.map((id) => [id, nodes[id] ?? null])) } };
    }
    if (url.pathname === `/v1/files/${FIGMA_KEY}/variables/local`) return variables;
    return undefined;
  });
  return { file, nodes, variables, http };
}

/** Figma's answer when the plan doesn't include the variables API */
export const FIGMA_PLAN_ERROR = { status: 403, body: { status: 403, error: true, message: 'Limited by Figma plan' } };

/**
 * A Penpot file as POST /api/rpc/command/get-file answers for it in JSON:
 * library colours (one a gradient), a typography, components (two variants
 * of Button, a deleted one, a Card) and design tokens in sets.
 */
export function penpotFixture(base = 'https://design.penpot.app') {
  const file = {
    id: PENPOT_FILE,
    name: 'Acme Penpot',
    revn: 17,
    modifiedAt: '2026-11-02T09:00:00Z',
    data: {
      colors: {
        c1: { id: 'c1', name: 'Primary', path: 'Colors', color: '#4F46E5', opacity: 1 },
        c2: { id: 'c2', name: 'Overlay', path: 'Colors', color: '#000000', opacity: 0.5 },
        c3: { id: 'c3', name: 'Sunset', path: 'Gradients', gradient: { type: 'linear' } },
      } as Record<string, any>,
      typographies: {
        t1: { id: 't1', name: 'Body', path: '', fontFamily: 'Inter', fontSize: '16', fontWeight: '400', lineHeight: '1.5' },
      } as Record<string, any>,
      components: {
        b1: { id: 'b1', name: 'Button', path: 'Actions', variantId: 'v1', variantProperties: [{ name: 'Size', value: 'Small' }] },
        b2: { id: 'b2', name: 'Button', path: 'Actions', variantId: 'v1', variantProperties: [{ name: 'Size', value: 'Large' }] },
        old: { id: 'old', name: 'Old badge', deleted: true },
        card: { id: 'card', name: 'Card', path: '' },
      } as Record<string, any>,
      tokensLib: {
        sets: {
          core: {
            name: 'core',
            tokens: {
              'spacing.lg': { id: 'tk1', name: 'spacing.lg', type: 'spacing', value: '24' },
              'radius.md': { id: 'tk2', name: 'radius.md', type: 'borderRadius', value: '8px' },
              'brand.link': { id: 'tk3', name: 'brand.link', type: 'color', value: '{brand.base}' },
              'brand.base': { id: 'tk4', name: 'brand.base', type: 'color', value: '#2563eb' },
              'shadow.card': { id: 'tk5', name: 'shadow.card', type: 'shadow', value: '0 1px 2px #000' },
            },
          },
        },
      } as any,
    },
  };
  const http = stubHttp((request) => {
    if (request.url !== `${base}/api/rpc/command/get-file`) return undefined;
    if (request.headers.Authorization !== 'Token penpot_test') return { status: 401, body: { type: 'authentication', code: 'authentication-required' } };
    if ((request.body as { id?: string })?.id !== PENPOT_FILE) return { status: 404, body: { type: 'not-found', code: 'object-not-found' } };
    return { status: 200, body: file };
  });
  return { file, http };
}
