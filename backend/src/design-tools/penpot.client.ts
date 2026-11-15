import { DesignFileSnapshot, DesignToolComponent, DesignToolToken, TokenKind } from './design-tool.types';
import { DesignToolError, DesignToolHttp, errorMessageOf } from './design-tool-http';
import { hexWithOpacity, kindInfo, numberKind, numberValue, tokenNameFor } from './token-mapping';

export const PENPOT_DEFAULT_BASE = 'https://design.penpot.app';

const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';

/**
 * Where a Penpot file lives: its id, and the instance it is on. The id can be
 * a bare uuid or a workspace URL (`…/#/workspace?…&file-id=<id>` or
 * `…/#/workspace/<project>/<file>`); the instance comes from that URL, the
 * connection's file URL, PENPOT_BASE_URL, or design.penpot.app.
 */
export function penpotFileRef(fileId: string | undefined, fileUrl?: string): { base: string; id: string } {
  let id: string | undefined;
  let base: string | undefined;
  for (const raw of [fileId, fileUrl]) {
    const value = raw?.trim();
    if (!value) continue;
    const query = value.match(new RegExp(`file-id=(${UUID})`, 'i'));
    const path = value.match(new RegExp(`workspace/${UUID}/(${UUID})`, 'i'));
    const bare = value.match(new RegExp(`^(${UUID})$`, 'i'));
    id ??= (query ?? path ?? bare)?.[1]?.toLowerCase();
    if (!base && /^https?:\/\//i.test(value)) base = new URL(value).origin;
  }
  if (!id) throw new DesignToolError('The connection needs a Penpot file id (a uuid) or a Penpot workspace URL');
  return { base: base ?? process.env.PENPOT_BASE_URL?.replace(/\/+$/, '') ?? PENPOT_DEFAULT_BASE, id };
}

interface PenpotFile {
  id: string;
  name: string;
  revn?: number;
  vern?: number;
  modifiedAt?: string;
  data?: {
    colors?: Record<string, { id: string; name: string; path?: string; color?: string; opacity?: number }>;
    typographies?: Record<string, { id: string; name: string; path?: string; fontFamily?: string; fontSize?: string; fontWeight?: string; lineHeight?: string }>;
    components?: Record<string, PenpotComponent>;
    tokensLib?: unknown;
  };
}

interface PenpotComponent {
  id: string;
  name: string;
  path?: string;
  deleted?: boolean;
  variantId?: string;
  variantProperties?: Array<{ name: string; value: string }>;
}

/**
 * Reads a Penpot file with an access token, through the RPC API
 * (POST /api/rpc/command/get-file, `Authorization: Token …`, JSON):
 * library colours and typographies, design tokens when the file has them
 * in a readable form, and components (variants grouped by their variant
 * container). Penpot has no per-node links, so components carry no URL.
 */
export class PenpotClient {
  constructor(private readonly http: DesignToolHttp) {}

  async read(ref: { base: string; id: string }, token: string): Promise<DesignFileSnapshot> {
    const res = await this.http({
      url: `${ref.base}/api/rpc/command/get-file`,
      method: 'POST',
      headers: { Authorization: `Token ${token}` },
      body: { id: ref.id },
    });
    if (res.status < 200 || res.status >= 300) throw penpotError(res.status, errorMessageOf(res.body));
    const file = res.body as PenpotFile;
    if (!file || typeof file !== 'object' || !file.data) throw new DesignToolError('Penpot answered without the file contents');

    const warnings: string[] = [];
    const tokens = [...this.libraryTokens(file, warnings), ...this.designTokens(file, warnings)];
    return {
      tool: 'penpot',
      fileId: ref.id,
      name: file.name,
      version: String(file.revn ?? file.vern ?? ''),
      lastModified: file.modifiedAt,
      tokens,
      components: this.components(file),
      warnings,
      variables: { status: 'not-applicable' },
    };
  }

  private libraryTokens(file: PenpotFile, warnings: string[]): DesignToolToken[] {
    const tokens: DesignToolToken[] = [];
    let gradients = 0;
    for (const color of Object.values(file.data?.colors ?? {})) {
      if (!color.color) {
        gradients++;
        continue;
      }
      tokens.push(token_(color.id, full(color), 'color', hexWithOpacity(color.color, color.opacity), 'library-color'));
    }
    if (gradients) warnings.push(`${gradients} gradient or image colour(s) were skipped: only solid colours map to tokens`);
    for (const type of Object.values(file.data?.typographies ?? {})) {
      const name = full(type);
      if (type.fontFamily) tokens.push(token_(`${type.id}#fontFamily`, name, 'fontFamily', type.fontFamily, 'library-typography'));
      const size = Number(type.fontSize);
      if (type.fontSize && Number.isFinite(size)) tokens.push(token_(`${type.id}#fontSize`, name, 'fontSize', numberValue('fontSize', size), 'library-typography'));
      if (type.fontWeight) tokens.push(token_(`${type.id}#fontWeight`, name, 'fontWeight', String(type.fontWeight), 'library-typography'));
      const lineHeight = Number(type.lineHeight);
      if (type.lineHeight && Number.isFinite(lineHeight)) tokens.push(token_(`${type.id}#lineHeight`, name, 'lineHeight', numberValue('lineHeight', lineHeight), 'library-typography'));
    }
    return tokens;
  }

  /**
   * Penpot design tokens (sets of `{ name, type, value }`). The JSON form of
   * the token library isn't documented, so anything that doesn't look like
   * sets of tokens is reported instead of guessed at.
   */
  private designTokens(file: PenpotFile, warnings: string[]): DesignToolToken[] {
    const lib = file.data?.tokensLib as { sets?: unknown } | undefined;
    if (lib === undefined || lib === null) return [];
    const sets = lib.sets && typeof lib.sets === 'object' ? Object.values(lib.sets as Record<string, unknown>) : undefined;
    if (!sets) {
      warnings.push("This file has Penpot design tokens, but they weren't in a form the API could be read in; library colours and typographies were still read");
      return [];
    }
    const tokens: DesignToolToken[] = [];
    let skipped = 0;
    for (const set of sets) {
      const entries = (set as { tokens?: unknown })?.tokens;
      const list = Array.isArray(entries) ? entries : entries && typeof entries === 'object' ? Object.values(entries) : [];
      for (const entry of list as Array<{ id?: string; name?: string; type?: string; value?: unknown; description?: string }>) {
        const kind = entry?.name ? penpotTokenKind(entry.type, entry.name) : undefined;
        if (!kind || (typeof entry.value !== 'string' && typeof entry.value !== 'number')) {
          skipped++;
          continue;
        }
        const raw = String(entry.value).trim();
        // Penpot stores sizes as bare numbers ("24"); they are px
        const value = kind !== 'fontFamily' && /^-?\d*\.?\d+$/.test(raw) ? numberValue(kind, Number(raw)) : raw;
        tokens.push({ ...token_(entry.id ?? `token:${entry.name}`, entry.name!, kind, value, 'token'), ...(entry.description ? { description: entry.description } : {}) });
      }
    }
    // A reference names a Penpot token; point it at the token that one maps to
    const mapped = new Map(tokens.map((t) => [t.designName, t.name]));
    for (const token of tokens) {
      const ref = token.value.match(/^\{([^{}]+)\}$/);
      if (ref && mapped.has(ref[1])) token.value = `{${mapped.get(ref[1])}}`;
    }
    if (skipped) warnings.push(`${skipped} Penpot token(s) were skipped: their type doesn't map to colour, spacing, sizing, radius or typography tokens`);
    return tokens;
  }

  private components(file: PenpotFile): DesignToolComponent[] {
    const live = Object.values(file.data?.components ?? {}).filter((c) => !c.deleted);
    const sets = new Map<string, DesignToolComponent>();
    const out: DesignToolComponent[] = [];
    for (const component of live) {
      if (component.variantId) {
        let set = sets.get(component.variantId);
        if (!set) {
          set = { id: component.variantId, name: component.name, ...(component.path ? { path: component.path } : {}), variants: [], kind: 'component-set' };
          sets.set(component.variantId, set);
          out.push(set);
        }
        const props = (component.variantProperties ?? []).map((p) => `${p.name}=${p.value}`).join(', ');
        set.variants.push(props || component.name);
        continue;
      }
      out.push({ id: component.id, name: component.name, ...(component.path ? { path: component.path } : {}), variants: [], kind: 'component' });
    }
    return out;
  }
}

function penpotTokenKind(type: string | undefined, name: string): TokenKind | undefined {
  switch (type) {
    case 'color':
      return 'color';
    case 'spacing':
      return 'spacing';
    case 'borderRadius':
      return 'radius';
    case 'sizing':
    case 'dimension':
    case 'dimensions':
      return numberKind(name) ?? 'dimension';
    case 'fontSize':
    case 'fontSizes':
      return 'fontSize';
    case 'fontWeight':
    case 'fontWeights':
      return 'fontWeight';
    case 'fontFamily':
    case 'fontFamilies':
      return 'fontFamily';
    case 'lineHeight':
    case 'lineHeights':
      return 'lineHeight';
    default:
      return undefined;
  }
}

/** "Brand" in path "Colors" → "Colors/Brand" */
function full(item: { name: string; path?: string }): string {
  return item.path ? `${item.path}/${item.name}` : item.name;
}

function token_(id: string, designName: string, kind: TokenKind, value: string, source: DesignToolToken['source']): DesignToolToken {
  return { id, designName, name: tokenNameFor(kind, designName), value, kind, ...kindInfo(kind), source };
}

function penpotError(status: number, message: string | undefined): DesignToolError {
  const detail = message ? `: ${message}` : '';
  if (status === 401 || status === 403) {
    return new DesignToolError(`Penpot refused the access token (HTTP ${status}${detail}). Check the token is valid and its owner can open this file; self-hosted Penpot needs the enable-access-tokens flag.`, status);
  }
  if (status === 404) return new DesignToolError(`Penpot has no file with that id, or the token can't see it (HTTP 404${detail})`, status);
  return new DesignToolError(`Penpot answered HTTP ${status}${detail}`, status);
}
