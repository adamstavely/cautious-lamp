// Solve an APCA / WCAG target colour with apcach in sRGB, so the HEX and RGB
// the calculator shows are the colour that was solved (not a clipped P3 one),
// and check the hex really meets the target.
import { apcach, apcachToCss, calcContrast, crToBg, crToFg, inColorSpace, maxChroma } from 'apcach';

export const SRGB = 'srgb';
const MAX_CHROMA = 0.37;

/** Contrast of the produced hex against the reference, the way the target is measured */
export const achievedContrast = (hex, reference, position, model) =>
  position === 'bg'
    ? calcContrast(hex, reference, model, SRGB) // reference is the background
    : calcContrast(reference, hex, model, SRGB); // reference is the text

const meets = (achieved, target) => Math.abs(achieved) >= Math.abs(target) - 1e-9;

/**
 * @param {object} o
 * @param {string} o.reference   the fixed colour
 * @param {'bg'|'fg'} o.position whether the reference is the background or the text
 * @param {number} o.contrast    the target (APCA Lc or WCAG ratio)
 * @param {'apca'|'wcag'} o.model
 * @param {'auto'|'lighter'|'darker'} o.direction
 * @param {number|null} o.chroma the chroma asked for; null for "max chroma"
 * @param {number} [o.chromaCap] cap for max chroma
 * @param {number} o.hue
 * @returns {{ color: object, hex: string, achieved: number, meetsTarget: boolean,
 *   requestedChroma: number|null, reducedChroma: number|null }}
 *   `reducedChroma` is set when the requested chroma was lowered to stay in sRGB.
 */
export const solveInSrgb = ({ reference, position, contrast, model, direction = 'auto', chroma = null, chromaCap = MAX_CHROMA, hue }) => {
  const config = () => (position === 'bg' ? crToBg : crToFg)(reference, contrast, model, direction);
  let reducedChroma = null;
  let color;
  if (chroma === null) {
    color = apcach(config(), maxChroma(Math.min(chromaCap, MAX_CHROMA)), hue, 100, SRGB);
  } else {
    const requested = Math.min(Math.max(chroma, 0), MAX_CHROMA);
    color = apcach(config(), requested, hue, 100, SRGB);
    if (!inColorSpace(color, SRGB)) {
      // The requested chroma has no sRGB colour at this contrast: take the most it allows
      color = apcach(config(), maxChroma(requested), hue, 100, SRGB);
      reducedChroma = Math.round(Number(color.chroma) * 1000) / 1000;
    }
  }
  if (!Number.isFinite(color?.lightness)) throw new Error('apcach returned no lightness');

  // The hex is rounded to 8 bits a channel; if that dips under the target,
  // step the lightness away from the reference until it doesn't.
  let hex = apcachToCss(color, 'hex');
  let achieved = achievedContrast(hex, reference, position, model);
  const nudged = (c, delta) => {
    const next = { ...c, lightness: Math.min(1, Math.max(0, c.lightness + delta)) };
    const nextHex = apcachToCss(next, 'hex');
    return { next, nextHex, nextAchieved: achievedContrast(nextHex, reference, position, model) };
  };
  if (!meets(achieved, contrast)) {
    // Whichever way raises the contrast is away from the reference
    const step = Math.abs(nudged(color, 0.002).nextAchieved) >= Math.abs(nudged(color, -0.002).nextAchieved) ? 0.001 : -0.001;
    for (let i = 0; i < 100 && !meets(achieved, contrast); i++) {
      const { next, nextHex, nextAchieved } = nudged(color, step);
      if (next.lightness === color.lightness) break; // at black or white
      color = next;
      hex = nextHex;
      achieved = nextAchieved;
    }
  }
  return {
    color,
    hex,
    achieved,
    meetsTarget: meets(achieved, contrast),
    requestedChroma: chroma,
    reducedChroma,
  };
};
