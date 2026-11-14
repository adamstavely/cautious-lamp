import { h } from 'vue';

/**
 * SVG legends drawn inside the map, so they go out with PNG and SVG exports,
 * and the marker shapes the legends and the maps share. Text wears ink
 * tokens; only swatches and markers carry data colours.
 */

export const formatValue = (value) => (Number.isFinite(value) ? value.toLocaleString() : String(value ?? ''));

export const formatCompact = (value) => {
  if (!Number.isFinite(value)) return String(value ?? '');
  try {
    return new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(value);
  } catch {
    return formatValue(value);
  }
};

/** Marker shapes by category slot; "Other" (slot -1) is a diamond. */
export const SHAPES = ['circle', 'square', 'triangle'];
export const shapeFor = (slot) => (slot >= 0 ? SHAPES[slot % SHAPES.length] : 'diamond');

/**
 * Path for a marker centred on 0,0 with about the area of a circle of radius r.
 */
export function symbolPath(shape, r) {
  switch (shape) {
    case 'square': {
      const s = r * 0.886; // same area as the circle
      return `M${-s},${-s}H${s}V${s}H${-s}Z`;
    }
    case 'triangle': {
      const s = r * 1.347;
      const hgt = (s * Math.sqrt(3)) / 2;
      return `M0,${(-2 * hgt) / 3}L${s / 2},${hgt / 3}L${-s / 2},${hgt / 3}Z`;
    }
    case 'diamond': {
      const s = r * 1.253;
      return `M0,${-s}L${s},0L0,${s}L${-s},0Z`;
    }
    default:
      return `M${r},0A${r},${r} 0 1,1 ${-r},0A${r},${r} 0 1,1 ${r},0Z`;
  }
}

const textAttrs = { 'font-size': 11, 'dominant-baseline': 'middle', class: 'fill-ink-secondary' };
const CHAR = 6.2;
const ROW = 18;
const SWATCH = 18;

/** Rows of swatches: { label, swatch: (x, y) => VNode }. */
export const swatchSection = (title, rows) => ({
  width: Math.max(title ? title.length * CHAR : 0, SWATCH + 8 + Math.max(0, ...rows.map((r) => r.label.length)) * CHAR),
  height: (title ? ROW : 0) + rows.length * ROW,
  render: (x, y) => [
    title ? h('text', { x, y: y + ROW / 2, ...textAttrs, 'font-weight': 600 }, title) : null,
    ...rows.map((row, i) => {
      const top = y + (title ? ROW : 0) + i * ROW;
      return h('g', { key: `${title}-${i}` }, [row.swatch(x, top + 3), h('text', { x: x + SWATCH + 8, y: top + ROW / 2, ...textAttrs }, row.label)]);
    }),
  ],
});

/** Classes of a colour scale, highest first, with an optional "No data" row. */
export function classSection(classes, { title = '', noDataFill = null } = {}) {
  const label = (c, i) => {
    if (c.from === c.to) return formatCompact(c.from);
    // Custom breaks past the data leave an end class open
    if (i === 0 && c.from > c.to) return `< ${formatCompact(c.to)}`;
    if (i === classes.length - 1 && c.to < c.from) return `≥ ${formatCompact(c.from)}`;
    return `${formatCompact(c.from)} – ${formatCompact(c.to)}`;
  };
  const rows = classes
    .map((c, i) => ({ label: label(c, i), swatch: (x, y) => h('rect', { x, y, width: SWATCH, height: 12, rx: 2, fill: c.color }) }))
    .reverse();
  if (noDataFill) rows.push({ label: 'No data', swatch: (x, y) => h('rect', { x, y, width: SWATCH, height: 12, rx: 2, fill: noDataFill, class: 'stroke-line', 'stroke-width': 1 }) });
  return swatchSection(title, rows);
}

/** Category markers: { name, color, shape }. */
export function categorySection(items, { title = '' } = {}) {
  return swatchSection(title, items.map((item) => ({
    label: item.name,
    swatch: (x, y) => h('path', { d: symbolPath(item.shape, 5.5), transform: `translate(${x + SWATCH / 2}, ${y + 6})`, fill: item.color, class: 'stroke-surface-raised', 'stroke-width': 1 }),
  })));
}

/** Nested circles for proportional symbols, bottom-aligned, labels on the right. */
export function sizeSection(values, radiusOf, { title = '' } = {}) {
  const radii = values.map(radiusOf);
  const big = Math.max(0, ...radii);
  const labelWidth = Math.max(0, ...values.map((v) => formatCompact(v).length)) * CHAR;
  const titleH = title ? ROW + 6 : 0;
  // Circles too close to the one above for a readable label go unlabelled
  let lastTop = -Infinity;
  const labelled = radii.map((r) => {
    const top = big * 2 - 2 * r;
    if (top - lastTop < 12) return false;
    lastTop = top;
    return true;
  });
  return {
    width: Math.max(title ? title.length * CHAR : 0, big * 2 + 10 + labelWidth),
    height: titleH + big * 2 + 4,
    render: (x, y) => {
      const cx = x + big;
      const base = y + titleH + big * 2;
      return [
        title ? h('text', { x, y: y + ROW / 2, ...textAttrs, 'font-weight': 600 }, title) : null,
        ...values.map((v, i) => {
          const r = radii[i];
          const top = base - 2 * r;
          return h('g', { key: `size-${i}` }, [
            h('circle', { cx, cy: base - r, r, fill: 'none', class: 'stroke-ink-muted', 'stroke-width': 1 }),
            labelled[i] ? h('line', { x1: cx, y1: top, x2: cx + big + 6, y2: top, class: 'stroke-ink-muted', 'stroke-width': 0.75, 'stroke-dasharray': '2 2' }) : null,
            labelled[i] ? h('text', { x: cx + big + 10, y: top, ...textAttrs }, formatCompact(v)) : null,
          ]);
        }),
      ];
    },
  };
}

/** Line widths for a flow map. */
export function widthSection(values, widthOf, color, { title = '' } = {}) {
  return swatchSection(title, values.map((v) => ({
    label: formatCompact(v),
    swatch: (x, y) => h('line', { x1: x, y1: y + 6, x2: x + SWATCH, y2: y + 6, stroke: color, 'stroke-width': widthOf(v), 'stroke-linecap': 'round' }),
  })));
}

/**
 * Stack sections in one box in the map's bottom-left corner.
 * @param {Array<{ width: number, height: number, render: (x, y) => VNode[] }>} sections
 */
export function renderLegend(sections, mapHeight) {
  const parts = sections.filter(Boolean);
  if (!parts.length) return null;
  const pad = 8;
  const gap = 10;
  const width = Math.max(...parts.map((s) => s.width)) + pad * 2;
  const height = parts.reduce((sum, s) => sum + s.height, 0) + gap * (parts.length - 1) + pad * 2;
  const x = 12;
  const y = Math.max(12, mapHeight - height - 12);
  let offset = pad;
  const content = parts.flatMap((s) => {
    const nodes = s.render(pad, offset);
    offset += s.height + gap;
    return nodes;
  });
  return h('g', { transform: `translate(${x}, ${y})`, 'aria-hidden': 'true', class: 'pointer-events-none' }, [
    h('rect', { width, height, rx: 6, class: 'fill-surface-overlay stroke-line', 'fill-opacity': 0.92 }),
    ...content,
  ]);
}
