/**
 * Pure data helpers for the chart builder (views/ChartBuilder.vue): carrying
 * data between chart types, shared rows in multi-series data, waterfall bars,
 * the data table for every chart type, Sankey columns, heatmap steps, the
 * secondary encodings and the colour contrast checks.
 */
import { calculateContrast } from '../composables/useContrast.js';

// ---------------------------------------------------------------------------
// Chart types and the data store each one draws from

/**
 * Which store a chart type reads. Types in the same family share one store;
 * 'own' types (gauge, waterfall, …) have data no other type can use.
 */
const KINDS = {
  series: ['area', 'bar', 'horizontalBar', 'pie', 'doughnut', 'radar', 'polar'],
  multi: ['line', 'stackedBar', 'groupedBar', 'combo'],
  funnel: ['funnel'],
  points: ['scatter', 'bubble'],
};

export function dataKind(type) {
  return Object.keys(KINDS).find((kind) => KINDS[kind].includes(type)) || 'own';
}

export const isMultiSeries = (type) => dataKind(type) === 'multi';

/**
 * For each label in `next`, the index of the row it came from in `previous`
 * (-1 for a new row): matched by label first, then by position when the
 * length is unchanged (a renamed row keeps its values).
 */
export function alignIndices(previous, next) {
  const used = new Set();
  const matched = next.map((label) => {
    const index = previous.findIndex((old, i) => !used.has(i) && old === label);
    if (index >= 0) used.add(index);
    return index;
  });
  if (previous.length === next.length) {
    matched.forEach((index, j) => {
      if (index < 0 && !used.has(j)) {
        matched[j] = j;
        used.add(j);
      }
    });
  }
  return matched;
}

/** A store as labels plus series of values (and x/size for points). */
export function tableFrom(kind, store) {
  if (kind === 'multi') {
    const datasets = store || [];
    return {
      labels: (datasets[0]?.data || []).map((item) => item.label),
      series: datasets.map((dataset) => ({ label: dataset.label, values: dataset.data.map((item) => item.value) })),
    };
  }
  if (kind === 'points') {
    const rows = store || [];
    return {
      labels: rows.map((row) => row.label),
      series: [{ label: null, values: rows.map((row) => row.y) }],
      x: rows.map((row) => row.x),
      r: rows.map((row) => row.r),
    };
  }
  if (kind === 'series' || kind === 'funnel') {
    const rows = store || [];
    return { labels: rows.map((row) => row.label), series: [{ label: null, values: rows.map((row) => row.value) }] };
  }
  return null;
}

/**
 * Write a table into a store of `kind`. `current` is that store's present
 * value: rows that match by label keep what the table can't carry (other
 * series, x and size of points).
 */
export function storeFrom(kind, table, current) {
  const labels = table.labels;
  const first = table.series[0]?.values || [];
  const num = (value) => (Number.isFinite(value) ? value : 0);

  if (kind === 'multi') {
    const existing = current || [];
    if (table.series.length > 1 || existing.length === 0) {
      return table.series.map((series, k) => ({
        label: series.label || existing[k]?.label || `Series ${k + 1}`,
        data: labels.map((label, i) => ({ label, value: num(series.values[i]) })),
      }));
    }
    // One series in: it becomes the first dataset; the others stay, realigned to the rows
    const oldLabels = (existing[0]?.data || []).map((item) => item.label);
    const from = alignIndices(oldLabels, labels);
    return existing.map((dataset, k) => ({
      label: dataset.label,
      data: labels.map((label, i) => ({
        label,
        value: k === 0 ? num(first[i]) : from[i] >= 0 ? num(dataset.data[from[i]]?.value) : 0,
      })),
    }));
  }

  if (kind === 'points') {
    const existing = current || [];
    const from = alignIndices(existing.map((row) => row.label), labels);
    return labels.map((label, i) => {
      const old = from[i] >= 0 ? existing[from[i]] : null;
      return {
        label,
        x: Number.isFinite(table.x?.[i]) ? table.x[i] : Number.isFinite(old?.x) ? old.x : i + 1,
        y: num(first[i]),
        r: Number.isFinite(table.r?.[i]) ? table.r[i] : Number.isFinite(old?.r) ? old.r : 10,
      };
    });
  }

  return labels.map((label, i) => ({ label, value: num(first[i]) }));
}

// ---------------------------------------------------------------------------
// Multi-series rows: a point is a row shared by every dataset

export function addSharedRow(datasets, label) {
  const count = datasets[0]?.data.length ?? 0;
  const rowLabel = label ?? `Item ${count + 1}`;
  datasets.forEach((dataset) => dataset.data.push({ label: rowLabel, value: 0 }));
}

export function removeSharedRow(datasets, index) {
  if ((datasets[0]?.data.length ?? 0) <= 1) return;
  datasets.forEach((dataset) => dataset.data.splice(index, 1));
}

export function setSharedRowLabel(datasets, index, label) {
  datasets.forEach((dataset) => {
    if (dataset.data[index]) dataset.data[index].label = label;
  });
}

// ---------------------------------------------------------------------------
// Waterfall

/**
 * Floating bars: the base and the total stand on 0; each change floats from
 * the running total before it to the running total after it.
 */
export function waterfallBars(base, changes) {
  const start = Number(base) || 0;
  const labels = ['Base'];
  const bars = [[0, start]];
  const kinds = ['total'];
  let running = start;
  changes.forEach((change) => {
    const value = Number(change.value) || 0;
    labels.push(change.label);
    bars.push([running, running + value]);
    kinds.push(value >= 0 ? 'increase' : 'decrease');
    running += value;
  });
  labels.push('Total');
  bars.push([0, running]);
  kinds.push('total');
  return { labels, bars, kinds, total: running };
}

// ---------------------------------------------------------------------------
// Gauge

export function gaugeSegments({ value, min, max, target }) {
  const range = max - min || 1;
  const clamp = (n) => Math.min(100, Math.max(0, n));
  const valuePercent = clamp(((value - min) / range) * 100);
  const targetPercent = clamp(((target - min) / range) * 100);
  return {
    valuePercent,
    targetPercent,
    aboveMax: value > max,
    belowMin: value < min,
  };
}

// ---------------------------------------------------------------------------
// Data table

const withUnit = (label, unit) => `${label}${unit ? ` (${unit})` : ''}`;

function treemapRows(node) {
  const rows = [];
  const walk = (current, parent) => {
    if (current.children?.length) current.children.forEach((child) => walk(child, current.name));
    else rows.push({ group: parent ?? '', label: current.name || 'Item', value: current.value || 0 });
  };
  if (node?.children?.length) node.children.forEach((child) => walk(child, node.name));
  else if (node) rows.push({ group: '', label: node.name || 'Item', value: node.value || 0 });
  return rows;
}

const nodeLabel = (nodes, id) => nodes.find((node) => node.id === id)?.label || id;

/**
 * The rows and columns of the data table for a chart type. `data` holds every
 * store (chartData, multiDatasetData, gaugeData, …). Each header's key names
 * the row property it shows.
 */
export function buildDataTable(type, data, { unit = '' } = {}) {
  const value = { key: 'value', label: withUnit('Value', unit) };
  const label = { key: 'label', label: 'Label' };

  switch (dataKind(type) === 'own' ? type : dataKind(type)) {
    case 'multi': {
      const datasets = data.multiDatasetData || [];
      const labels = (datasets[0]?.data || []).map((item) => item.label);
      return {
        headers: [label, ...datasets.map((dataset, k) => ({ key: `s${k}`, label: withUnit(dataset.label, unit) }))],
        rows: labels.map((rowLabel, i) => {
          const row = { label: rowLabel };
          datasets.forEach((dataset, k) => {
            row[`s${k}`] = dataset.data[i]?.value ?? 0;
          });
          return row;
        }),
      };
    }
    case 'points': {
      const bubble = type === 'bubble';
      return {
        headers: [label, { key: 'x', label: 'X' }, { key: 'y', label: withUnit('Y', unit) }, ...(bubble ? [{ key: 'r', label: 'Size' }] : [])],
        rows: (data.pointData || []).map((point) => ({ label: point.label, x: point.x, y: point.y, ...(bubble ? { r: point.r } : {}) })),
      };
    }
    case 'funnel':
      return { headers: [label, value], rows: (data.funnelData || []).map((item) => ({ label: item.label, value: item.value })) };
    case 'gauge': {
      const gauge = data.gaugeData;
      return {
        headers: [label, value, { key: 'min', label: withUnit('Min', unit) }, { key: 'max', label: withUnit('Max', unit) }, { key: 'target', label: withUnit('Target', unit) }],
        rows: [{ label: 'Value', value: gauge.value, min: gauge.min, max: gauge.max, target: gauge.target }],
      };
    }
    case 'waterfall': {
      const { base, changes } = data.waterfallData;
      const { total } = waterfallBars(base, changes);
      return {
        headers: [label, value],
        rows: [{ label: 'Base', value: base }, ...changes.map((c) => ({ label: c.label, value: c.value })), { label: 'Total', value: total }],
      };
    }
    case 'candlestick':
      return {
        headers: [{ key: 'label', label: 'Date' }, { key: 'open', label: withUnit('Open', unit) }, { key: 'high', label: withUnit('High', unit) }, { key: 'low', label: withUnit('Low', unit) }, { key: 'close', label: withUnit('Close', unit) }],
        rows: (data.candlestickData || []).map((item) => ({ label: item.date, open: item.open, high: item.high, low: item.low, close: item.close })),
      };
    case 'heatmap': {
      const { rows = [], columns = [], values = [] } = data.heatmapData || {};
      return {
        headers: [{ key: 'label', label: 'Row' }, ...columns.map((column, c) => ({ key: `c${c}`, label: withUnit(column, unit) }))],
        rows: rows.map((rowLabel, r) => {
          const row = { label: rowLabel };
          columns.forEach((_, c) => {
            row[`c${c}`] = values[r]?.[c] ?? 0;
          });
          return row;
        }),
      };
    }
    case 'treemap':
      return {
        headers: [{ key: 'group', label: 'Group' }, { key: 'label', label: 'Item' }, value],
        rows: treemapRows(data.treemapData),
      };
    case 'sankey': {
      const { nodes = [], links = [] } = data.sankeyData || {};
      return {
        headers: [{ key: 'source', label: 'From' }, { key: 'target', label: 'To' }, value],
        rows: links.map((link) => ({ label: `${nodeLabel(nodes, link.source)} → ${nodeLabel(nodes, link.target)}`, source: nodeLabel(nodes, link.source), target: nodeLabel(nodes, link.target), value: link.value })),
      };
    }
    case 'bulletGraph':
      return {
        headers: [label, value, { key: 'target', label: withUnit('Target', unit) }, { key: 'max', label: withUnit('Max', unit) }, { key: 'poor range', label: 'Poor Range' }, { key: 'fair range', label: 'Fair Range' }, { key: 'good range', label: 'Good Range' }],
        rows: (data.bulletGraphData || []).map((item) => ({
          label: item.label,
          value: item.value,
          target: item.target,
          max: item.max,
          'poor range': `0-${item.ranges.fair}`,
          'fair range': `${item.ranges.fair}-${item.ranges.good}`,
          'good range': `${item.ranges.good}-${item.ranges.excellent}`,
        })),
      };
    case 'chordDiagram': {
      const { nodes = [], links = [] } = data.chordDiagramData || {};
      return {
        headers: [label, value],
        rows: links.map((link) => ({ label: `${nodeLabel(nodes, link.source)} ↔ ${nodeLabel(nodes, link.target)}`, value: link.value })),
      };
    }
    default:
      return { headers: [label, value], rows: (data.chartData || []).map((item) => ({ label: item.label, value: item.value })) };
  }
}

// ---------------------------------------------------------------------------
// Sankey and chord nodes

/**
 * Column of each Sankey node: its depth in the link graph (the longest chain
 * of links that leads to it). A link that closes a cycle is left out of the
 * layout, so a loop can't push nodes off to the right.
 */
export function sankeyColumns(nodes, links) {
  const ids = new Set(nodes.map((node) => node.id));
  const outgoing = new Map(nodes.map((node) => [node.id, []]));
  const incoming = new Set();
  links.forEach((link) => {
    if (link.source === link.target || !ids.has(link.source) || !ids.has(link.target)) return;
    outgoing.get(link.source).push(link.target);
    incoming.add(link.target);
  });

  // Depth-first from the sources (then any node left), dropping back edges
  const forward = new Map(nodes.map((node) => [node.id, []]));
  const state = new Map();
  const visit = (id) => {
    state.set(id, 'open');
    outgoing.get(id).forEach((next) => {
      if (state.get(next) === 'open') return; // closes a cycle
      forward.get(id).push(next);
      if (!state.has(next)) visit(next);
    });
    state.set(id, 'done');
  };
  const order = [...nodes.filter((node) => !incoming.has(node.id)), ...nodes];
  order.forEach((node) => {
    if (!state.has(node.id)) visit(node.id);
  });

  // Longest path over what is now acyclic
  const depth = new Map(nodes.map((node) => [node.id, 0]));
  for (let pass = 0; pass < nodes.length; pass++) {
    let changed = false;
    forward.forEach((targets, id) => {
      targets.forEach((target) => {
        if (depth.get(id) + 1 > depth.get(target)) {
          depth.set(target, depth.get(id) + 1);
          changed = true;
        }
      });
    });
    if (!changed) break;
  }
  return depth;
}

/** Rename a node's id and point its links at the new id. */
export function renameNodeId(graph, index, nextId) {
  const node = graph.nodes[index];
  if (!node) return;
  const previous = node.id;
  node.id = nextId;
  graph.links.forEach((link) => {
    if (link.source === previous) link.source = nextId;
    if (link.target === previous) link.target = nextId;
  });
}

// ---------------------------------------------------------------------------
// Heatmap steps

/** The step (0 … steps-1) a value falls in, splitting min…max into equal steps. */
export function heatmapStep(value, min, max, steps) {
  if (steps <= 1 || max === min) return 0;
  const ratio = (value - min) / (max - min);
  return Math.min(steps - 1, Math.max(0, Math.floor(ratio * steps)));
}

/** One legend block per colour, with the value range it stands for. */
export function heatmapLegendSteps(colors, min, max) {
  const steps = colors.length;
  const size = steps ? (max - min) / steps : 0;
  return colors.map((color, i) => ({ color, from: min + size * i, to: i === steps - 1 ? max : min + size * (i + 1) }));
}

/** Resize the heatmap grid to new row (or column) labels, keeping each label's values. */
export function realignHeatmap(heatmap, axis, nextLabels) {
  const values = heatmap.values || [];
  if (axis === 'rows') {
    const from = alignIndices(heatmap.rows, nextLabels);
    const width = heatmap.columns.length;
    heatmap.values = from.map((r) => (r >= 0 && values[r] ? [...values[r]] : Array.from({ length: width }, () => 0)));
    heatmap.rows = nextLabels;
  } else {
    const from = alignIndices(heatmap.columns, nextLabels);
    heatmap.values = heatmap.rows.map((_, r) => from.map((c) => (c >= 0 ? values[r]?.[c] ?? 0 : 0)));
    heatmap.columns = nextLabels;
  }
}

// ---------------------------------------------------------------------------
// Secondary encodings (a second visual channel besides colour)

export const ENCODINGS = {
  shape: 'Point shapes',
  lineStyle: 'Line styles (dashes)',
  pattern: 'Pattern fills',
  text: 'Value labels',
};

const ENCODINGS_BY_TYPE = {
  line: ['shape', 'lineStyle', 'text'],
  stackedBar: ['pattern', 'text'],
  groupedBar: ['pattern', 'text'],
  combo: ['pattern', 'text'],
  pie: ['pattern', 'text'],
  doughnut: ['pattern', 'text'],
  polar: ['pattern', 'text'],
};

export const encodingsFor = (type) => ENCODINGS_BY_TYPE[type] || [];

export const POINT_STYLES = ['circle', 'rect', 'triangle', 'rectRot', 'star', 'crossRot'];
export const DASHES = [[], [8, 4], [2, 3], [12, 4, 2, 4], [4, 4], [16, 6]];
/** The first series stays solid; the others get a pattern each. */
export const PATTERNS = [null, 'diagonal', 'dots', 'grid', 'horizontal', 'reverseDiagonal'];

export const pointStyleFor = (index) => POINT_STYLES[index % POINT_STYLES.length];
export const dashFor = (index) => DASHES[index % DASHES.length];
export const patternFor = (index) => PATTERNS[index % PATTERNS.length];

// ---------------------------------------------------------------------------
// Contrast

/** WCAG 1.4.11: graphical objects need 3:1 against what they sit on. */
export const GRAPHICAL_MIN = 3;
/** WCAG 1.4.3: text needs 4.5:1. */
export const TEXT_MIN = 4.5;

/**
 * Chart colours (bars, slices, lines) checked at 3:1 against the surface;
 * chart text colours (axes, title) at 4.5:1.
 */
export function chartContrastIssues(colors, surface, textColors = {}) {
  const issues = [];
  colors.forEach((color, index) => {
    const contrast = calculateContrast(color, surface);
    if (contrast && contrast.ratio < GRAPHICAL_MIN) {
      issues.push({ element: `Color ${index + 1} (${color})`, ratio: contrast.ratio, required: GRAPHICAL_MIN, type: 'graphical' });
    }
  });
  Object.entries(textColors).forEach(([name, color]) => {
    const contrast = calculateContrast(color, surface);
    if (contrast && contrast.ratio < TEXT_MIN) {
      issues.push({ element: `${name} text (${color})`, ratio: contrast.ratio, required: TEXT_MIN, type: 'text' });
    }
  });
  return issues;
}

// ---------------------------------------------------------------------------
// Image export of SVG charts

const PAINT = ['fill', 'stroke'];

/**
 * Copy each SVG element's computed fill and stroke onto its copy as
 * attributes. Rasterisers (html2canvas) draw an SVG on its own, without the
 * page's stylesheet, so colours that came from classes would be lost.
 */
export function inlineSvgPaint(sourceRoot, targetRoot, view = globalThis.window) {
  if (!sourceRoot || !targetRoot || !view?.getComputedStyle) return 0;
  const sources = sourceRoot.querySelectorAll('svg, svg *');
  const targets = targetRoot.querySelectorAll('svg, svg *');
  let painted = 0;
  sources.forEach((source, i) => {
    const target = targets[i];
    if (!target || target.tagName !== source.tagName) return;
    const style = view.getComputedStyle(source);
    PAINT.forEach((property) => {
      const value = style.getPropertyValue(property);
      if (value) {
        target.setAttribute(property, value);
        painted++;
      }
    });
  });
  return painted;
}
