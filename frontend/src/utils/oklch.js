/**
 * OKLCH colours (as the Harmony palette writes them) to sRGB hex, computed
 * directly. Reading back getComputedStyle() doesn't work: current browsers
 * report oklch colours as "oklch(...)", not rgb().
 */

/** { L, C, H } from "oklch(L C H)" (L and C may be percentages), or null */
export function parseOklch(value) {
  const match = /oklch\(\s*([\d.]+)(%?)\s+([\d.]+)(%?)\s+([\d.]+)(?:deg)?/i.exec(String(value || ''));
  if (!match) return null;
  const L = match[2] ? parseFloat(match[1]) / 100 : parseFloat(match[1]);
  const C = match[4] ? (parseFloat(match[3]) / 100) * 0.4 : parseFloat(match[3]);
  const H = parseFloat(match[5]);
  return [L, C, H].every(Number.isFinite) ? { L, C, H } : null;
}

/** [r, g, b] (0–255, clipped to sRGB), or null when the value isn't OKLCH */
export function oklchToRgb(value) {
  const parsed = parseOklch(value);
  if (!parsed) return null;
  const { L, C, H } = parsed;
  const hRad = (H * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);

  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;

  const linear = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];

  return linear.map((channel) => {
    const c = Math.min(1, Math.max(0, channel));
    const encoded = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
    return Math.round(Math.min(1, Math.max(0, encoded)) * 255);
  });
}

export const rgbToHex = ([r, g, b]) => '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('').toUpperCase();

/** Hex for an OKLCH colour, or null */
export function oklchToHex(value) {
  const rgb = oklchToRgb(value);
  return rgb ? rgbToHex(rgb) : null;
}
