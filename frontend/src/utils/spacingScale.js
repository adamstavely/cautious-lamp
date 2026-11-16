// Spacing scale maths: named ratios and steps that never collapse into each other.

/** Same names and ratios as the font scale tool */
export const SPACING_RATIOS = {
  'minor-third': 1.2,
  'major-third': 1.25,
  'perfect-fourth': 1.333,
  'perfect-fifth': 1.5,
  'golden-ratio': 1.618,
};

export const SPACING_RATIO_LABELS = {
  'minor-third': 'Minor Third (1.2)',
  'major-third': 'Major Third (1.25)',
  'perfect-fourth': 'Perfect Fourth (1.333)',
  'perfect-fifth': 'Perfect Fifth (1.5)',
  'golden-ratio': 'Golden Ratio (1.618)',
};

/** Step names and their power of the ratio */
const STEPS = [['xs', -2], ['sm', -1], ['base', 0], ['md', 1], ['lg', 2], ['xl', 3], ['2xl', 4], ['3xl', 5], ['4xl', 6], ['5xl', 7]];

/** Rounding grids tried in turn, coarsest first (px) */
const PRECISIONS = [1, 0.5, 0.25, 0.01];

const snap = (value, precision) => Number((Math.round(value / precision) * precision).toFixed(2));

/**
 * The scale rounded to whole pixels when that keeps every step distinct, and
 * otherwise to the coarsest finer grid (0.5, 0.25, 0.01px) that does. The base
 * step is always the base itself. `duplicates` names any steps that still
 * coincide (only possible with a ratio barely above 1).
 */
export const spacingScale = (base, ratio) => {
  const raw = STEPS.map(([name, power]) => [name, power === 0 ? base : base * ratio ** power]);
  let precision = PRECISIONS[PRECISIONS.length - 1];
  let values = [];
  for (const p of PRECISIONS) {
    values = raw.map(([name, v]) => [name, name === 'base' ? base : snap(v, p)]);
    precision = p;
    if (values.every(([, v], i) => i === 0 || v > values[i - 1][1])) break;
  }
  const duplicates = values.filter(([, v], i) => i > 0 && v <= values[i - 1][1]).map(([name]) => name);
  return { scale: Object.fromEntries(values), precision, duplicates };
};
