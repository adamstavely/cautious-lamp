/**
 * Design-token files as flat lists. Reads W3C design-token (DTCG) JSON, where
 * a token is an object with `$value` (and `$type`, inherited from its groups),
 * and Tokens Studio JSON, where a token has `value` and `type` and a file can
 * hold several token sets (listed in `$metadata.tokenSetOrder`). Also takes
 * the design system's own tokens (`/api/v1/tokens`: `{ name, value, type }`).
 *
 * A flat token is `{ name, value, type, resolved }`: `name` is the dotted path
 * (`color.primary`), `value` what the file says (maybe an alias such as
 * `{color.blue.500}`), and `resolved` the value after following aliases (null
 * when an alias points nowhere or loops).
 */

const ALIAS = /^\{([^{}]+)\}$/;

const isTokenNode = (node) =>
  node && typeof node === 'object' && !Array.isArray(node) && ('$value' in node || ('value' in node && !isGroupLike(node.value)));

// A Tokens Studio group can have a child named "value"; a token's value is never a plain group of tokens
const isGroupLike = (value) => value && typeof value === 'object' && !Array.isArray(value) && Object.values(value).some((child) => isTokenNode(child));

function walk(node, path, inheritedType, out) {
  if (!node || typeof node !== 'object' || Array.isArray(node)) return;
  if (isTokenNode(node)) {
    const dtcg = '$value' in node;
    out.push({
      name: path.join('.'),
      value: dtcg ? node.$value : node.value,
      type: (dtcg ? node.$type : node.type) ?? inheritedType ?? null,
      description: (dtcg ? node.$description : node.description) ?? '',
    });
    return;
  }
  const groupType = node.$type ?? inheritedType;
  for (const [key, child] of Object.entries(node)) {
    if (key.startsWith('$')) continue;
    walk(child, [...path, key], groupType, out);
  }
}

/** Flat tokens from a parsed DTCG or Tokens Studio JSON document */
export function flattenTokenJson(json) {
  if (!json || typeof json !== 'object') throw new Error('A token file must be a JSON object.');
  const out = [];
  // Tokens Studio with several sets: each set's tokens sit at the top level of the names
  const setOrder = json.$metadata?.tokenSetOrder;
  if (Array.isArray(setOrder) && setOrder.length) {
    for (const set of setOrder) walk(json[set], [], null, out);
  } else {
    walk(json, [], null, out);
  }
  return resolveAliases(out);
}

/** Flat tokens from JSON text; throws a readable error when it isn't JSON */
export function parseTokenText(text) {
  let json;
  try {
    json = JSON.parse(text);
  } catch (error) {
    throw new Error(`Not valid JSON: ${error.message}`);
  }
  const tokens = flattenTokenJson(json);
  if (!tokens.length) throw new Error('No tokens found. Tokens need a "$value" (W3C format) or "value" (Tokens Studio).');
  return tokens;
}

/** The design system's tokens (`/api/v1/tokens`) in the same flat shape */
export function fromDesignSystemTokens(list) {
  return resolveAliases((list ?? []).map((token) => ({ name: token.name, value: token.value, type: token.type ?? null, description: token.description ?? '' })));
}

/** Adds `resolved` to each token, following `{alias}` references */
export function resolveAliases(tokens) {
  const byName = new Map(tokens.map((token) => [token.name, token]));
  const resolve = (value, seen) => {
    if (typeof value !== 'string') return value;
    const alias = ALIAS.exec(value.trim());
    if (!alias) return value;
    const name = alias[1].trim();
    if (seen.has(name)) return null;
    const target = byName.get(name);
    if (!target) return null;
    return resolve(target.value, new Set([...seen, name]));
  };
  return tokens.map((token) => ({ ...token, resolved: resolve(token.value, new Set([token.name])) }));
}

/** A value as comparable text: composite values as JSON, colours and units lower-cased */
export function valueKey(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value).trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Text for a value in tables */
export function formatTokenValue(value) {
  if (value === null || value === undefined) return '';
  return typeof value === 'object' ? JSON.stringify(value) : String(value);
}
