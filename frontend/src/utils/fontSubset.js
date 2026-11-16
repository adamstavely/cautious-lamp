/**
 * Google Fonts subsetting. The CSS APIs ignore `&subset=` (every request gets
 * the same unicode-range blocks, and browsers already download only the
 * blocks a page uses). A real subset comes from `&text=`: Google then serves
 * a font file holding only those characters.
 */

/** The distinct characters of `text`, in first-seen order, without line breaks or tabs. */
export const uniqueCharacters = (text) => {
  const seen = new Set();
  for (const ch of Array.from(String(text ?? ''))) {
    if (ch === '\n' || ch === '\r' || ch === '\t') continue;
    seen.add(ch);
  }
  return [...seen].join('');
};

/** css2 URL for one family and weight; with `text`, only those characters. */
export const buildSubsetUrl = (family, weight, text = '') => {
  if (!family) return '';
  const name = encodeURIComponent(family).replace(/%20/g, '+');
  const axis = weight ? `:wght@${encodeURIComponent(weight)}` : '';
  const chars = uniqueCharacters(text);
  const textParam = chars ? `&text=${encodeURIComponent(chars)}` : '';
  return `https://fonts.googleapis.com/css2?family=${name}${axis}${textParam}&display=swap`;
};
