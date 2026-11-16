/**
 * A Power BI report theme (the JSON imported from View → Themes → Browse for
 * themes) built from a colour scale:
 *
 * - dataColors: every step, in order. Power BI uses them for series and
 *   categories, so a qualitative scale becomes the categorical palette and an
 *   ordered scale colours ordered categories step by step.
 * - minimum / center / maximum: the default gradient for conditional
 *   formatting. Power BI blends at most three stops in RGB, so only the first,
 *   middle (diverging scales) and last steps carry over to gradients.
 * - bad / neutral / good: a diverging scale's ends and midpoint, used by KPI
 *   and variance colouring.
 *
 * Colours are uppercase #RRGGBB, which every Power BI version accepts.
 */
const hex = (color) => {
  const value = String(color ?? '').trim();
  const short = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(value);
  if (short) return `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}`.toUpperCase();
  const long = /^#([0-9a-f]{6})(?:[0-9a-f]{2})?$/i.exec(value);
  return long ? `#${long[1]}`.toUpperCase() : null;
};

export function powerBiTheme({ name, type = 'sequential', colors = [] }) {
  const steps = colors.map(hex).filter(Boolean);
  if (!steps.length) throw new Error('The scale has no colours to export');
  const first = steps[0];
  const last = steps[steps.length - 1];
  const middle = steps[Math.floor((steps.length - 1) / 2)];
  const theme = { name: name || 'Custom color scale', dataColors: steps };

  if (type === 'sequential') {
    Object.assign(theme, { minimum: first, maximum: last });
  } else if (type === 'diverging') {
    Object.assign(theme, { minimum: first, center: middle, maximum: last, bad: first, neutral: middle, good: last });
  }
  return theme;
}

/** A file name Power BI and every OS accept, from the theme's name */
export function powerBiThemeFileName(name) {
  const base = String(name || 'color-scale').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'color-scale';
  return `${base}-power-bi-theme.json`;
}
