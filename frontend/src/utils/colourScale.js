// Colour maths for the color scale generator: WCAG contrast, finding a colour
// at a contrast, and building sequential, diverging and qualitative scales.
import chroma from 'chroma-js';

const channel = (v) => {
  const s = v / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

/** WCAG relative luminance (0–1) of any colour chroma can read; 0 when it can't */
export const luminance = (color) => {
  try {
    const [r, g, b] = chroma(color).rgb(false).map(channel);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  } catch {
    return 0;
  }
};

/** WCAG contrast ratio (1–21), unrounded */
export const contrastRatio = (a, b) => {
  if (!a || !b) return 1;
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};

/**
 * A colour with the base colour's hue and saturation whose contrast with the
 * background is at least `target`, and as close to it as the 8-bit hex grid
 * allows. Only candidates that meet the target are kept, so a 4.5 step never
 * lands at 4.49. When no lightness reaches the target (it's beyond what the
 * hue can do), the highest-contrast candidate is returned.
 */
export const findColorAtContrast = (baseColor, bgColor, targetRatio) => {
  const bgLum = luminance(bgColor);
  const [h, s] = chroma(baseColor).hsl();
  const hue = Number.isFinite(h) ? h : 0;
  const sat = Number.isFinite(s) ? s : 0;

  // Go towards whichever end (black or white) can give the most contrast,
  // preferring the side the base colour is already on.
  const darkMax = contrastRatio(chroma.hsl(hue, sat, 0).hex(), bgColor);
  const lightMax = contrastRatio(chroma.hsl(hue, sat, 1).hex(), bgColor);
  const baseIsLighter = luminance(baseColor) > bgLum;
  let lighter = baseIsLighter;
  if (lighter && lightMax < targetRatio && darkMax > lightMax) lighter = false;
  else if (!lighter && darkMax < targetRatio && lightMax > darkMax) lighter = true;

  const at = (l) => chroma.hsl(hue, sat, l).hex();
  // `far` is the lightness with the most contrast, `near` the least
  let far = lighter ? 1 : 0;
  let near = lighter ? 0 : 1;
  const farColor = at(far);
  if (contrastRatio(farColor, bgColor) < targetRatio) return farColor;

  let best = farColor;
  let bestRatio = contrastRatio(farColor, bgColor);
  for (let i = 0; i < 40; i++) {
    const mid = (far + near) / 2;
    const color = at(mid);
    const ratio = contrastRatio(color, bgColor);
    if (ratio >= targetRatio) {
      if (ratio < bestRatio) {
        best = color;
        bestRatio = ratio;
      }
      far = mid; // meets it: try less contrast
    } else {
      near = mid; // short of it: need more contrast
    }
  }
  return best;
};

/** Contrast targets evenly spaced from `from` to `to` */
const ramp = (from, to, count) =>
  Array.from({ length: count }, (_, i) => (count === 1 ? to : from + (to - from) * (i / (count - 1))));

/**
 * One base colour: steps from no contrast up to the target, with the base
 * colour itself at its natural place (the step whose contrast is nearest its
 * own). When the base has more contrast than the target, the scale runs up to
 * the base instead, so it is still included.
 */
export const singleColorSequentialScale = (baseColor, bgColor, targetRatio, steps) => {
  const base = chroma(baseColor).hex();
  const baseRatio = contrastRatio(base, bgColor);
  const top = Math.max(targetRatio, baseRatio);
  const targets = ramp(1, top, steps);
  let baseIndex = 0;
  targets.forEach((t, i) => {
    if (Math.abs(t - baseRatio) < Math.abs(targets[baseIndex] - baseRatio)) baseIndex = i;
  });
  return targets.map((t, i) => (i === baseIndex ? base : findColorAtContrast(base, bgColor, t)));
};

/**
 * A diverging scale over every stop. The stops split into a left arm, an
 * optional centre (the middle stop when there's an odd number of three or
 * more) and a right arm; with no centre stop the arms meet at the background.
 * Each arm climbs from the centre's contrast to the target at its outer end,
 * taking its hue from its own stops in order, so middle stops are honoured.
 */
export const divergingScale = (colors, bgColor, targetRatio, steps) => {
  const stops = colors.map((c) => chroma(c).hex());
  const hasCentre = stops.length >= 3 && stops.length % 2 === 1;
  const half = Math.floor(stops.length / 2);
  const centre = hasCentre ? stops[half] : chroma(bgColor).hex();
  // Each arm's stops, ordered from the centre outwards
  const leftStops = stops.slice(0, half).reverse();
  const rightStops = stops.slice(hasCentre ? half + 1 : half);
  const leftCount = Math.ceil(steps / 2) - 1;
  const rightCount = steps - 1 - leftCount;
  const centreRatio = Math.min(contrastRatio(centre, bgColor), targetRatio);

  const arm = (armStops, count) => {
    const hueAt = armStops.length > 1 ? chroma.scale(armStops).mode('lch') : () => chroma(armStops[0]);
    return Array.from({ length: count }, (_, i) => {
      const t = (i + 1) / count;
      const ratio = centreRatio + (targetRatio - centreRatio) * t;
      // Stops sit evenly along the arm: the first at its first step, the last at its end
      const pos = count > 1 ? i / (count - 1) : 1;
      return findColorAtContrast(hueAt(pos).hex(), bgColor, ratio);
    });
  };

  return [...arm(leftStops, leftCount).reverse(), centre, ...arm(rightStops, rightCount)];
};

const hueDistance = (a, b) => {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
};

/**
 * A qualitative palette: the user's colours exactly as given, never dropped.
 * When more steps are asked for, it adds new hues as far as possible from the
 * ones already there, at the palette's average lightness and chroma.
 */
export const qualitativeScale = (colors, steps) => {
  const palette = colors.map((c) => chroma(c).hex());
  if (palette.length === 0 || steps <= palette.length) return palette;
  const lch = palette.map((c) => chroma(c).lch());
  const avg = (i) => lch.reduce((sum, v) => sum + (Number.isFinite(v[i]) ? v[i] : 0), 0) / lch.length;
  const l = Math.min(80, Math.max(40, avg(0)));
  const c = Math.max(40, avg(1));
  const hues = lch.filter((v) => v[1] > 5 && Number.isFinite(v[2])).map((v) => v[2]);
  while (palette.length < steps) {
    let bestHue = 0;
    let bestGap = -1;
    for (let h = 0; h < 360; h += 1) {
      const gap = hues.length ? Math.min(...hues.map((x) => hueDistance(x, h))) : 360;
      if (gap > bestGap) {
        bestGap = gap;
        bestHue = h;
      }
    }
    hues.push(bestHue);
    // Bring it into sRGB by lowering chroma rather than clipping channels
    let ch = c;
    let color = chroma.lch(l, ch, bestHue);
    while (color.clipped() && ch > 0) {
      ch -= 2;
      color = chroma.lch(l, Math.max(0, ch), bestHue);
    }
    palette.push(color.hex());
  }
  return palette;
};
