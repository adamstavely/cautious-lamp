import { DesignFileSnapshot, DesignToolComponent, DesignToolToken, TokenKind } from './design-tool.types';
import { DesignToolError, DesignToolHttp, errorMessageOf } from './design-tool-http';
import { colorToHex, kindInfo, numberKind, numberValue, px, tokenNameFor } from './token-mapping';

export const FIGMA_API = 'https://api.figma.com';

/** Style node ids per /nodes request, to keep URLs short */
const STYLE_BATCH = 50;

type Rgba = { r: number; g: number; b: number; a?: number };

interface FigmaFile {
  name: string;
  version: string;
  lastModified?: string;
  components?: Record<string, { key?: string; name: string; description?: string; componentSetId?: string; remote?: boolean }>;
  componentSets?: Record<string, { key?: string; name: string; description?: string; remote?: boolean }>;
  styles?: Record<string, { key?: string; name: string; styleType: string; description?: string; remote?: boolean }>;
}

interface FigmaVariable {
  id: string;
  name: string;
  variableCollectionId: string;
  resolvedType: 'BOOLEAN' | 'FLOAT' | 'STRING' | 'COLOR';
  valuesByMode: Record<string, unknown>;
  description?: string;
  remote?: boolean;
  scopes?: string[];
}

interface FigmaCollection {
  id: string;
  name: string;
  defaultModeId: string;
  modes?: Array<{ modeId: string; name: string }>;
  remote?: boolean;
}

/**
 * The file key from what people paste: a key, or a figma.com file, design,
 * proto or board URL (a branch URL gives the branch key).
 */
export function figmaFileKey(fileId: string | undefined, fileUrl?: string): string {
  for (const raw of [fileId, fileUrl]) {
    const value = raw?.trim();
    if (!value) continue;
    const fromUrl = value.match(/figma\.com\/(?:file|design|proto|board)\/([A-Za-z0-9]+)(?:\/[^/?#]*\/branch\/([A-Za-z0-9]+))?/);
    if (fromUrl) return fromUrl[2] ?? fromUrl[1];
    if (/^[A-Za-z0-9]{10,64}$/.test(value)) return value;
  }
  throw new DesignToolError('The connection needs a Figma file key or a figma.com file URL');
}

/** Opens a node in Figma */
export function figmaNodeUrl(fileKey: string, nodeId: string): string {
  return `https://www.figma.com/design/${fileKey}/?node-id=${encodeURIComponent(nodeId.replace(/:/g, '-'))}`;
}

/**
 * Reads a Figma file with a personal access token (X-Figma-Token):
 * components and component sets and colour and text styles from
 * GET /v1/files/:key and /nodes, and variables from
 * GET /v1/files/:key/variables/local. The variables API needs a full seat in
 * an Enterprise org and the file_variables:read scope; when Figma refuses it
 * the sync carries on with styles and says why variables are missing.
 */
export class FigmaClient {
  constructor(
    private readonly http: DesignToolHttp,
    private readonly base = FIGMA_API,
  ) {}

  async read(fileKey: string, token: string): Promise<DesignFileSnapshot> {
    const file = (await this.get(`/v1/files/${encodeURIComponent(fileKey)}`, token, 'the file')) as FigmaFile;
    const warnings: string[] = [];
    const components = this.components(fileKey, file);
    const styleTokens = await this.styleTokens(fileKey, file, token, warnings);
    const variables = await this.variableTokens(fileKey, token, warnings);
    return {
      tool: 'figma',
      fileId: fileKey,
      name: file.name,
      version: String(file.version ?? ''),
      lastModified: file.lastModified,
      // Variables first: they are what a file's tokens are usually defined as, styles often just apply them
      tokens: [...variables.tokens, ...styleTokens],
      components,
      warnings,
      variables: variables.status,
    };
  }

  private async get(path: string, token: string, what: string): Promise<unknown> {
    const res = await this.http({ url: `${this.base}${path}`, method: 'GET', headers: { 'X-Figma-Token': token } });
    if (res.status >= 200 && res.status < 300) return res.body;
    throw figmaError(res.status, errorMessageOf(res.body), what);
  }

  private components(fileKey: string, file: FigmaFile): DesignToolComponent[] {
    const sets = new Map<string, DesignToolComponent>();
    for (const [id, set] of Object.entries(file.componentSets ?? {})) {
      if (set.remote) continue;
      sets.set(id, { id, ...splitPath(set.name), description: set.description || undefined, variants: [], kind: 'component-set', url: figmaNodeUrl(fileKey, id) });
    }
    const standalone: DesignToolComponent[] = [];
    for (const [id, component] of Object.entries(file.components ?? {})) {
      if (component.remote) continue;
      const set = component.componentSetId ? sets.get(component.componentSetId) : undefined;
      if (set) set.variants.push(component.name);
      else standalone.push({ id, ...splitPath(component.name), description: component.description || undefined, variants: [], kind: 'component', url: figmaNodeUrl(fileKey, id) });
    }
    return [...sets.values(), ...standalone];
  }

  /** Colour (solid fill) and text styles, read from their nodes */
  private async styleTokens(fileKey: string, file: FigmaFile, token: string, warnings: string[]): Promise<DesignToolToken[]> {
    const styles = Object.entries(file.styles ?? {}).filter(([, style]) => !style.remote && (style.styleType === 'FILL' || style.styleType === 'TEXT'));
    const skipped = Object.values(file.styles ?? {}).filter((style) => !style.remote && style.styleType !== 'FILL' && style.styleType !== 'TEXT').length;
    if (skipped) warnings.push(`${skipped} effect or grid style(s) were skipped: only colour and text styles map to tokens`);
    const tokens: DesignToolToken[] = [];
    for (let i = 0; i < styles.length; i += STYLE_BATCH) {
      const batch = styles.slice(i, i + STYLE_BATCH);
      const ids = batch.map(([id]) => id).join(',');
      const res = (await this.get(`/v1/files/${encodeURIComponent(fileKey)}/nodes?ids=${encodeURIComponent(ids)}`, token, 'the style nodes')) as {
        nodes?: Record<string, { document?: Record<string, any> } | null>;
      };
      for (const [id, style] of batch) {
        const node = res.nodes?.[id]?.document;
        if (!node) {
          warnings.push(`Style "${style.name}" has no node in the file and was skipped`);
          continue;
        }
        if (style.styleType === 'FILL') {
          const fill = (node.fills as Array<{ type: string; color?: Rgba; opacity?: number; visible?: boolean }> | undefined)?.find((f) => f.visible !== false);
          if (!fill || fill.type !== 'SOLID' || !fill.color) {
            warnings.push(`Colour style "${style.name}" is not a solid colour and was skipped`);
            continue;
          }
          tokens.push(token_(`${id}`, style.name, 'color', colorToHex(fill.color, fill.opacity ?? 1), style.description, 'style'));
        } else {
          const type = node.style as { fontFamily?: string; fontWeight?: number; fontSize?: number; lineHeightPx?: number; lineHeightUnit?: string; lineHeightPercentFontSize?: number } | undefined;
          if (!type) {
            warnings.push(`Text style "${style.name}" has no type settings and was skipped`);
            continue;
          }
          if (type.fontFamily) tokens.push(token_(`${id}#fontFamily`, style.name, 'fontFamily', type.fontFamily, style.description, 'style'));
          if (typeof type.fontSize === 'number') tokens.push(token_(`${id}#fontSize`, style.name, 'fontSize', px(type.fontSize), style.description, 'style'));
          if (typeof type.fontWeight === 'number') tokens.push(token_(`${id}#fontWeight`, style.name, 'fontWeight', String(type.fontWeight), style.description, 'style'));
          if (type.lineHeightUnit === 'FONT_SIZE_%' && typeof type.lineHeightPercentFontSize === 'number') {
            tokens.push(token_(`${id}#lineHeight`, style.name, 'lineHeight', String(Number((type.lineHeightPercentFontSize / 100).toFixed(4))), style.description, 'style'));
          } else if (type.lineHeightUnit !== 'INTRINSIC_%' && typeof type.lineHeightPx === 'number') {
            tokens.push(token_(`${id}#lineHeight`, style.name, 'lineHeight', px(type.lineHeightPx), style.description, 'style'));
          }
        }
      }
    }
    return tokens;
  }

  /**
   * Local variables, at each collection's default mode. Aliases become
   * references to the token the target maps to (`{color.primary}`).
   */
  private async variableTokens(fileKey: string, token: string, warnings: string[]): Promise<{ tokens: DesignToolToken[]; status: DesignFileSnapshot['variables'] }> {
    const res = await this.http({ url: `${this.base}/v1/files/${encodeURIComponent(fileKey)}/variables/local`, method: 'GET', headers: { 'X-Figma-Token': token } });
    if (res.status === 403 || res.status === 401) {
      const reason = errorMessageOf(res.body) ?? `HTTP ${res.status}`;
      const message =
        `Figma didn't return variables ("${reason}"). The variables API is only open to full members of an Enterprise organization, ` +
        `with a token that has the file_variables:read scope. Colour and text styles were still read.`;
      warnings.push(message);
      return { tokens: [], status: { status: 'unavailable', message } };
    }
    if (res.status < 200 || res.status >= 300) throw figmaError(res.status, errorMessageOf(res.body), 'the variables');

    const meta = ((res.body as { meta?: unknown })?.meta ?? {}) as { variables?: Record<string, FigmaVariable>; variableCollections?: Record<string, FigmaCollection> };
    const variables = Object.values(meta.variables ?? {}).filter((v) => !v.remote);
    const collections = meta.variableCollections ?? {};

    // Name every variable first, so an alias can point at its target's token name
    const named = new Map<string, { variable: FigmaVariable; kind: TokenKind; name: string }>();
    let skipped = 0;
    for (const variable of variables) {
      const kind = variableKind(variable);
      if (!kind) {
        skipped++;
        continue;
      }
      named.set(variable.id, { variable, kind, name: tokenNameFor(kind, variable.name) });
    }
    if (skipped) warnings.push(`${skipped} variable(s) were skipped: booleans, text that isn't a font family, and numbers whose scope or name doesn't say what they size`);
    const multiMode = Object.values(collections).filter((c) => !c.remote && (c.modes?.length ?? 1) > 1);
    for (const collection of multiMode) {
      const mode = collection.modes?.find((m) => m.modeId === collection.defaultModeId)?.name ?? 'default';
      warnings.push(`Collection "${collection.name}" has ${collection.modes!.length} modes; only its default mode ("${mode}") was read`);
    }

    const tokens: DesignToolToken[] = [];
    for (const { variable, kind, name } of named.values()) {
      const collection = collections[variable.variableCollectionId];
      const raw = collection ? variable.valuesByMode[collection.defaultModeId] : Object.values(variable.valuesByMode)[0];
      const value = this.variableValue(raw, kind, named);
      if (value === undefined) {
        warnings.push(`Variable "${variable.name}" has a value that couldn't be read and was skipped`);
        continue;
      }
      tokens.push({ ...token_(variable.id, variable.name, kind, value, variable.description, 'variable'), name });
    }
    return { tokens, status: { status: 'read' } };
  }

  private variableValue(raw: unknown, kind: TokenKind, named: Map<string, { name: string }>): string | undefined {
    if (raw && typeof raw === 'object' && (raw as { type?: string }).type === 'VARIABLE_ALIAS') {
      const target = named.get((raw as { id: string }).id);
      return target ? `{${target.name}}` : undefined;
    }
    if (kind === 'color' && raw && typeof raw === 'object' && 'r' in raw) return colorToHex(raw as Rgba);
    if (typeof raw === 'number') return numberValue(kind, raw);
    if (typeof raw === 'string' && kind === 'fontFamily') return raw;
    return undefined;
  }
}

function variableKind(variable: FigmaVariable): TokenKind | undefined {
  if (variable.resolvedType === 'COLOR') return 'color';
  if (variable.resolvedType === 'FLOAT') return numberKind(variable.name, variable.scopes);
  if (variable.resolvedType === 'STRING' && ((variable.scopes ?? []).includes('FONT_FAMILY') || /font.?family|typeface/i.test(variable.name))) return 'fontFamily';
  return undefined;
}

function token_(id: string, designName: string, kind: TokenKind, value: string, description: string | undefined, source: DesignToolToken['source']): DesignToolToken {
  return { id, designName, name: tokenNameFor(kind, designName), value, kind, ...kindInfo(kind), ...(description ? { description } : {}), source };
}

/** "Forms/Inputs/Text field" → name "Text field", path "Forms/Inputs" */
function splitPath(full: string): { name: string; path?: string } {
  const parts = full.split('/').map((p) => p.trim()).filter(Boolean);
  const name = parts.pop() ?? full;
  return parts.length ? { name, path: parts.join('/') } : { name };
}

function figmaError(status: number, message: string | undefined, what: string): DesignToolError {
  const detail = message ? `: ${message}` : '';
  if (status === 401 || status === 403) {
    return new DesignToolError(`Figma refused the access token while reading ${what} (HTTP ${status}${detail}). Check the token is valid, has the file_content:read scope, and can open this file.`, status);
  }
  if (status === 404) return new DesignToolError(`Figma has no file with that key, or the token can't see it (HTTP 404${detail})`, status);
  if (status === 429) return new DesignToolError(`Figma is rate limiting this token (HTTP 429); try again in a minute`, status);
  return new DesignToolError(`Figma answered HTTP ${status} while reading ${what}${detail}`, status);
}
