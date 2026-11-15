// WCAG 2.2 colour contrast for #rgb / #rrggbb colours.

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

export const isHexColor = (value) => typeof value === 'string' && HEX.test(value.trim());

/** #abc → #aabbcc, lower case; null when the value isn't a hex colour */
export const normalizeHex = (value) => {
  if (!isHexColor(value)) return null;
  const hex = value.trim().slice(1).toLowerCase();
  return `#${hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex}`;
};

const channel = (c) => {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

export const relativeLuminance = (value) => {
  const hex = normalizeHex(value);
  if (!hex) return null;
  const [r, g, b] = [1, 3, 5].map((i) => channel(parseInt(hex.slice(i, i + 2), 16)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** Contrast ratio between two colours (1–21), or null if either isn't a hex colour */
export const contrastRatio = (a, b) => {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  if (la === null || lb === null) return null;
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
};

/** The WCAG level body text meets at this ratio: 'AAA', 'AA' or 'Fail' */
export const wcagLevel = (ratio) => (ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'Fail');

/** Black or white, whichever reads better on the given background */
export const readableOn = (background) =>
  (contrastRatio('#ffffff', background) ?? 0) >= (contrastRatio('#000000', background) ?? 0) ? '#ffffff' : '#000000';
