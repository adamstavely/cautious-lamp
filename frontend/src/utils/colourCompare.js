// Number display and colour difference for the Compare colors tool.
import chroma from 'chroma-js';

/** WCAG thresholds a contrast ratio is judged against */
export const CONTRAST_THRESHOLDS = [3, 4.5, 7];

/** The colour difference at which two colours count as distinguishable */
export const DELTA_E_SAFE = 11;

/**
 * A value to two decimals that never rounds up across a threshold: it is
 * truncated, so 4.4999 shows "4.49" next to a fail, never "4.50". (A tiny
 * epsilon keeps 1.15 from showing as 1.14 through float error, and a value
 * just under a threshold is still pinned below it.)
 */
export const formatBelowThreshold = (value, thresholds = [], decimals = 2) => {
  if (!Number.isFinite(value)) return '';
  const scale = 10 ** decimals;
  let shown = Math.floor(value * scale + 1e-9) / scale;
  for (const t of thresholds) {
    if (value < t && shown >= t) shown = (Math.round(t * scale) - 1) / scale;
  }
  return shown.toFixed(decimals);
};

export const formatContrastRatio = (ratio) => formatBelowThreshold(ratio, CONTRAST_THRESHOLDS);
export const formatDeltaE = (deltaE) => formatBelowThreshold(deltaE, [DELTA_E_SAFE]);

/** CIEDE2000 colour difference between two colours (anything chroma reads, or [r, g, b]) */
export const deltaE2000 = (a, b) => chroma.deltaE(chroma(a), chroma(b));
