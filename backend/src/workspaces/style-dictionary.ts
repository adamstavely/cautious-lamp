import { WorkspaceResource } from './workspace.types';

/** A token as Style Dictionary reads it */
export interface StyleDictionaryToken {
  value: string;
  type: string;
  comment?: string;
}

/** Nested groups of tokens, keyed by the parts of their dotted names */
export interface StyleDictionaryTree {
  [key: string]: StyleDictionaryToken | StyleDictionaryTree;
}

/** Where a token goes when its name is also a group (color.primary next to color.primary.hover) */
export const GROUP_TOKEN_KEY = 'DEFAULT';

/**
 * Workspace tokens as a Style Dictionary source file
 * (docs/GETTING_STARTED_TOKENS.md#style-dictionary): `color.primary` becomes
 * `{ color: { primary: { value, type, comment } } }`. A token whose name is
 * also a group goes under DEFAULT in that group. Tokens are taken in the order
 * given, so when two share a name the first wins (the caller puts the
 * workspace's own tokens first).
 */
export function toStyleDictionary(tokens: readonly WorkspaceResource[]): StyleDictionaryTree {
  // Null prototypes, so names like "__proto__.x" stay plain keys
  const root: StyleDictionaryTree = Object.create(null);
  const leaves = new WeakSet<object>();
  const isLeaf = (node: unknown): node is StyleDictionaryToken => typeof node === 'object' && node !== null && leaves.has(node);

  for (const token of tokens) {
    const path = String(token.name ?? '').split('.').map((part) => part.trim()).filter(Boolean);
    if (!path.length) continue;
    const leaf: StyleDictionaryToken = { value: String(token.value ?? ''), type: String(token.type ?? '') };
    if (typeof token.description === 'string' && token.description) leaf.comment = token.description;
    leaves.add(leaf);

    let node = root;
    for (const part of path.slice(0, -1)) {
      const next = node[part];
      if (next === undefined) {
        node = node[part] = Object.create(null) as StyleDictionaryTree;
      } else if (isLeaf(next)) {
        // A token here already: it becomes this group's DEFAULT
        const group: StyleDictionaryTree = Object.create(null);
        group[GROUP_TOKEN_KEY] = next;
        node = node[part] = group;
      } else {
        node = next as StyleDictionaryTree;
      }
    }

    const last = path[path.length - 1];
    const existing = node[last];
    if (existing === undefined) node[last] = leaf;
    else if (!isLeaf(existing) && (existing as StyleDictionaryTree)[GROUP_TOKEN_KEY] === undefined) {
      (existing as StyleDictionaryTree)[GROUP_TOKEN_KEY] = leaf;
    }
    // Otherwise a token with this name is already in the file
  }
  return root;
}
