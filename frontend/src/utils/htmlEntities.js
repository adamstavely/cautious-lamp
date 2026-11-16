/**
 * Decodes one HTML named character reference (&name;) using the browser's
 * own entity table, so all ~2,200 HTML named entities are known.
 *
 * Safe: `name` is restricted to letters and digits before it reaches the
 * parser, and it is decoded inside a detached <textarea>, whose content is
 * plain text (RCDATA): no elements are created, nothing loads or runs.
 */
const cache = new Map();
let decoder = null;

/** The decoded text for `name` (without & and ;), or null when it isn't an HTML named entity. */
export const decodeNamedEntity = (name) => {
  if (typeof name !== 'string' || !/^[a-zA-Z][a-zA-Z0-9]{0,31}$/.test(name)) return null;
  if (cache.has(name)) return cache.get(name);
  if (typeof document === 'undefined') return null;
  decoder ??= document.createElement('textarea');
  const reference = `&${name};`;
  decoder.innerHTML = reference;
  const decoded = decoder.value;
  // Unknown names stay as written. A legacy prefix match ("&notit;" -> "¬it;")
  // leaves extra text behind; every real entity decodes to one or two code points.
  const result = decoded !== reference && Array.from(decoded).length <= 2 ? decoded : null;
  cache.set(name, result);
  return result;
};
