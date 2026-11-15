/**
 * Style dictionaries are the workspace item kind `style-dictionaries`
 * (docs/WORKSPACES.md): `{ name, description, format, tokens, url, tags }`,
 * where `tokens` is a W3C design-token (DTCG) document. The token editors
 * (Token studio, AI tokens) work on a flat list instead:
 * `{ id, name, category, $type, $value, $description }`, with `name` the
 * dotted path. These helpers convert between the two.
 *
 * A token's category is the first part of its name unless the editor gave it
 * another one; that is kept in `$extensions` so it survives the round trip.
 */

const EXTENSION = 'cautious-lamp';

/** Tag that marks a dictionary as retired (kept for reference, hidden by default) */
export const RETIRED_TAG = 'retired';

export const categoryFromName = (name) => String(name ?? '').split('.')[0] || 'other';

const isToken = (node) => node && typeof node === 'object' && !Array.isArray(node) && '$value' in node;

/** Flat editor tokens from a DTCG document (types inherit from groups) */
export function dtcgToTokens(dtcg) {
  const out = [];
  const walk = (node, path, inheritedType) => {
    if (!node || typeof node !== 'object' || Array.isArray(node)) return;
    if (isToken(node)) {
      const name = path.join('.');
      const token = {
        id: name,
        name,
        category: node.$extensions?.[EXTENSION]?.category || categoryFromName(name),
        $type: node.$type ?? inheritedType ?? 'string',
        $value: node.$value,
      };
      if (node.$description) token.$description = node.$description;
      out.push(token);
      return;
    }
    const groupType = node.$type ?? inheritedType;
    for (const [key, child] of Object.entries(node)) {
      if (!key.startsWith('$')) walk(child, [...path, key], groupType);
    }
  };
  walk(dtcg, [], null);
  return out;
}

/** A DTCG document from flat editor tokens */
export function tokensToDtcg(tokens) {
  const dtcg = {};
  for (const token of tokens ?? []) {
    const parts = String(token.name ?? '').split('.').filter(Boolean);
    if (!parts.length) continue;
    let group = dtcg;
    for (const part of parts.slice(0, -1)) {
      // A token and a group can't share a name; the group wins
      if (!group[part] || isToken(group[part])) group[part] = {};
      group = group[part];
    }
    const node = { $value: token.$value, $type: token.$type };
    if (token.$description) node.$description = token.$description;
    if (token.category && token.category !== categoryFromName(token.name)) {
      node.$extensions = { [EXTENSION]: { category: token.category } };
    }
    group[parts[parts.length - 1]] = node;
  }
  return dtcg;
}

/** Flat tokens of a saved dictionary */
export const dictionaryTokens = (dictionary) => dtcgToTokens(dictionary?.tokens ?? {});

export const isRetired = (dictionary) => (dictionary?.tags ?? []).includes(RETIRED_TAG);

/** Tags with the retired tag set or cleared */
export function withRetired(tags, retired) {
  const rest = (tags ?? []).filter((tag) => tag !== RETIRED_TAG);
  return retired ? [...rest, RETIRED_TAG] : rest;
}
