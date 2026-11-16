// Pure helpers for the Gradient generator: colour parsing, CSS for a stack of
// gradient layers, animation (keyframes and the properties they animate),
// stop reordering and the contrast check. Kept free of Vue so they can be tested.
import chroma from 'chroma-js';

/** Parses any CSS colour chroma understands (#rgb, #rgba, #rrggbb, rgb(), hsl(), names). */
export function parseColor(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const [r, g, b, a] = chroma(value.trim()).rgba();
    return { r, g, b, a };
  } catch {
    return null;
  }
}

const stopAlpha = (stop) => {
  const opacity = Number(stop?.opacity);
  return Number.isFinite(opacity) ? Math.min(1, Math.max(0, opacity / 100)) : 1;
};

const round = (n) => Math.round(n * 1000) / 1000;
const rgbaString = ({ r, g, b, a }) => `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${round(a)})`;

/** A stop's colour with its opacity applied, as rgba(); transparent when the colour can't be parsed. */
export function stopRgba(stop) {
  const rgba = parseColor(stop?.color);
  if (!rgba) return 'rgba(0, 0, 0, 0)';
  return rgbaString({ ...rgba, a: rgba.a * stopAlpha(stop) });
}

/** A stop's colour for CSS: the text the user typed when fully opaque, rgba() otherwise. */
export function stopCss(stop) {
  const rgba = parseColor(stop?.color);
  if (!rgba) return String(stop?.color ?? '');
  if (stopAlpha(stop) === 1) return stop.color.trim();
  return rgbaString({ ...rgba, a: rgba.a * stopAlpha(stop) });
}

/** Stops in position order (the order the gradient paints them). */
export function sortStops(stops) {
  return [...(stops || [])].sort((a, b) => (Number(a.position) || 0) - (Number(b.position) || 0));
}

/**
 * Moves the stop at `from` to `to`. Order is defined by position, so the stops
 * keep the same set of positions and the moved colour takes the target's place.
 * Returns a new array (stops are copied).
 */
export function moveStop(stops, from, to) {
  if (from === to || from < 0 || to < 0 || from >= stops.length || to >= stops.length) {
    return stops.map((stop) => ({ ...stop }));
  }
  const ordered = sortStops(stops).map((stop) => ({ ...stop }));
  const positions = ordered.map((stop) => stop.position);
  const [moved] = ordered.splice(from, 1);
  ordered.splice(to, 0, moved);
  return ordered.map((stop, index) => ({ ...stop, position: positions[index] }));
}

const addAngle = (degrees, offset) => (offset ? `calc(${Number(degrees) || 0}deg + ${offset})` : `${Number(degrees) || 0}deg`);

/** One layer as a CSS gradient. `angleOffset` (a CSS angle expression) rotates linear and conic layers. */
export function layerGradientCss(layer, { angleOffset } = {}) {
  const stops = sortStops(layer.colorStops)
    .map((stop) => `${stopCss(stop)} ${stop.position}%`)
    .join(', ');
  switch (layer.type) {
    case 'radial':
      return `radial-gradient(${layer.radialShape} ${layer.radialSize} at ${layer.radialPosition.x} ${layer.radialPosition.y}, ${stops})`;
    case 'conic':
      return `conic-gradient(from ${addAngle(layer.conicAngle, angleOffset)} at ${layer.conicPosition.x} ${layer.conicPosition.y}, ${stops})`;
    case 'linear':
      return `linear-gradient(${addAngle(layer.linearAngle, angleOffset)}, ${stops})`;
    default:
      return `linear-gradient(90deg, ${stops})`;
  }
}

/** Whether an animation type can move this layer (radial gradients have no angle). */
export function canAnimateLayer(type, layer) {
  if (!layer) return false;
  if (type === 'angle') return layer.type === 'linear' || layer.type === 'conic';
  return true;
}

const ANIMATIONS = {
  position: {
    property: '@property --gradient-shift {\n  syntax: \'<percentage>\';\n  inherits: false;\n  initial-value: 0%;\n}',
    keyframes: '@keyframes gradient-position {\n  0% { --gradient-shift: 0%; }\n  50% { --gradient-shift: 100%; }\n  100% { --gradient-shift: 0%; }\n}',
  },
  angle: {
    property: '@property --gradient-angle {\n  syntax: \'<angle>\';\n  inherits: false;\n  initial-value: 0deg;\n}',
    keyframes: '@keyframes gradient-angle {\n  from { --gradient-angle: 0deg; }\n  to { --gradient-angle: 360deg; }\n}',
  },
  color: {
    property: '',
    keyframes: '@keyframes gradient-color {\n  from { filter: hue-rotate(0deg); }\n  to { filter: hue-rotate(360deg); }\n}',
  },
};

/**
 * The CSS for a stack of layers (the first enabled layer paints on top, as in
 * CSS). With `animation` on, the layer at `animatedIndex` (an index into
 * `layers`) scrolls or rotates; colour animation cycles the hues of the whole
 * stack. Every layer stays in the stack while animating.
 *
 * Returns `{ declarations: [[property, value]…], atRules, animated }`.
 */
export function gradientStackCss(layers, { animation, animatedIndex = 0 } = {}) {
  const enabled = (layers || []).map((layer, index) => ({ layer, index })).filter(({ layer }) => layer.enabled);
  if (enabled.length === 0) return { declarations: [], atRules: '', animated: false };

  const type = animation?.enabled ? animation.type : null;
  const target = type ? layers[animatedIndex] : null;
  const animated = Boolean(type && (type === 'color' || (target?.enabled && canAnimateLayer(type, target))));
  const isTarget = (index) => animated && type !== 'color' && index === animatedIndex;

  const images = enabled.map(({ layer, index }) =>
    layerGradientCss(layer, { angleOffset: isTarget(index) && type === 'angle' ? 'var(--gradient-angle)' : undefined }));
  const declarations = [['background-image', images.join(', ')]];
  if (enabled.length > 1) {
    declarations.push(['background-blend-mode', enabled.map(({ layer }) => layer.blendMode || 'normal').join(', ')]);
  }
  if (animated && type === 'position') {
    declarations.push(['background-size', enabled.map(({ index }) => (isTarget(index) ? '200% 200%' : '100% 100%')).join(', ')]);
    declarations.push(['background-position', enabled.map(({ index }) => (isTarget(index) ? 'var(--gradient-shift) 50%' : '0% 0%')).join(', ')]);
  }
  if (animated) {
    const { duration = 3, direction = 'normal', iterationCount = 'infinite' } = animation;
    const timing = type === 'angle' || type === 'color' ? 'linear' : 'ease-in-out';
    declarations.push(['animation', `gradient-${type} ${duration}s ${timing} ${direction} ${iterationCount}`]);
  }
  const atRules = animated ? [ANIMATIONS[type].property, ANIMATIONS[type].keyframes].filter(Boolean).join('\n\n') : '';
  return { declarations, atRules, animated };
}

/** Looks up one declaration's value. */
export const declarationValue = (css, property) => css.declarations.find(([name]) => name === property)?.[1];

/** A layer's colour (with alpha) at `position` percent along its stops. */
export function sampleLayerColor(layer, position) {
  const stops = sortStops(layer?.colorStops).map((stop) => {
    const rgba = parseColor(stop.color) || { r: 0, g: 0, b: 0, a: 0 };
    return { position: Number(stop.position) || 0, rgba: { ...rgba, a: rgba.a * stopAlpha(stop) } };
  });
  if (stops.length === 0) return { r: 0, g: 0, b: 0, a: 0 };
  if (position <= stops[0].position) return stops[0].rgba;
  const last = stops[stops.length - 1];
  if (position >= last.position) return last.rgba;
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    if (position >= a.position && position <= b.position) {
      const range = b.position - a.position;
      const t = range > 0 ? (position - a.position) / range : 0;
      // Interpolate premultiplied, as browsers do, so a transparent stop doesn't tint.
      const alpha = a.rgba.a + (b.rgba.a - a.rgba.a) * t;
      const channel = (key) => (alpha > 0 ? (a.rgba[key] * a.rgba.a + (b.rgba[key] * b.rgba.a - a.rgba[key] * a.rgba.a) * t) / alpha : 0);
      return { r: channel('r'), g: channel('g'), b: channel('b'), a: alpha };
    }
  }
  return last.rgba;
}

/** Composites `top` (rgba) over an opaque `bottom`. */
export function compositeOver(top, bottom) {
  const a = top.a ?? 1;
  return {
    r: top.r * a + bottom.r * (1 - a),
    g: top.g * a + bottom.g * (1 - a),
    b: top.b * a + bottom.b * (1 - a),
  };
}

/**
 * The colour the enabled layers paint at `position`, composited over the
 * backdrop colour (normal blending). The first layer is on top, as in CSS.
 */
export function sampleStackColor(layers, position, background = '#ffffff') {
  let colour = parseColor(background) || { r: 255, g: 255, b: 255 };
  [...(layers || [])].filter((layer) => layer.enabled).reverse().forEach((layer) => {
    colour = compositeOver(sampleLayerColor(layer, position), colour);
  });
  return colour;
}

const luminance = ({ r, g, b }) => {
  const [lr, lg, lb] = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
};

export function contrastBetween(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/**
 * The worst contrast between the text colour and the gradient, sampled across
 * every visible layer and composited over `background`. Null when the text
 * colour can't be parsed.
 */
export function worstContrast(layers, textColor, background = '#ffffff', positions = [0, 12.5, 25, 37.5, 50, 62.5, 75, 87.5, 100]) {
  const text = parseColor(textColor);
  if (!text) return null;
  return Math.min(...positions.map((position) => {
    const fill = sampleStackColor(layers, position, background);
    // Text with alpha sits on the gradient too.
    return contrastBetween(compositeOver(text, fill), fill);
  }));
}

/** The midpoint colour of two stops, as hex (falls back to the first colour). */
export function mixColors(a, b, ratio = 0.5) {
  try {
    return chroma.mix(a, b, ratio, 'rgb').hex();
  } catch {
    return parseColor(a) ? chroma(a).hex() : '#6366f1';
  }
}

/** RGB channels 0..255 with alpha 0..1 (black when unparseable), for exports that need numbers. */
export function colorChannels(value) {
  return parseColor(value) || { r: 0, g: 0, b: 0, a: 1 };
}
