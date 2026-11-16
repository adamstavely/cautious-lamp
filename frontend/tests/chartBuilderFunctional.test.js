import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick } from 'vue';

// The financial plugin's UMD build does not load under vitest, and jsdom has
// no canvas: stand in for both, so the page's data and options can be checked.
vi.mock('chartjs-chart-financial', async () => {
  const { BarController, BarElement } = await import('chart.js');
  class CandlestickController extends BarController { static id = 'candlestick'; }
  class CandlestickElement extends BarElement { static id = 'candlestick'; }
  return { CandlestickController, CandlestickElement };
});
vi.mock('vue-chartjs', () => {
  const stub = (name) => defineComponent({ name, props: ['data', 'options', 'type'], render() { return h('div', { 'data-chart': name }); } });
  return {
    Line: stub('Line'), Bar: stub('Bar'), Pie: stub('Pie'), Doughnut: stub('Doughnut'), Scatter: stub('Scatter'),
    Radar: stub('Radar'), Bubble: stub('Bubble'), PolarArea: stub('PolarArea'), Chart: stub('Chart'),
  };
});

import { mountView } from './helpers/mountView.js';
import ChartBuilder from '../src/views/ChartBuilder.vue';
import {
  alignIndices, chartContrastIssues, heatmapLegendSteps, heatmapStep, inlineSvgPaint, renameNodeId,
  sankeyColumns, storeFrom, tableFrom, waterfallBars,
} from '../src/utils/chartBuilderData.js';

let view;
const mount = async () => {
  view = await mountView(ChartBuilder);
  return view.state;
};
const setType = async (state, type) => {
  state.selectedChartType = type;
  await nextTick();
  await nextTick();
};

afterEach(() => {
  view?.unmount();
  view = null;
});

describe('chart type changes keep the user data (1)', () => {
  it('carries labels, values and title across compatible types', async () => {
    const state = await mount();
    expect(state.selectedChartType).toBe('line');
    state.multiDatasetData[0].data[0].value = 999;
    state.multiDatasetData[0].data[0].label = 'Mine';
    state.chartConfig.title = 'My sales';

    await setType(state, 'bar');
    expect(state.chartData[0]).toEqual({ label: 'Mine', value: 999 });
    expect(state.chartConfig.title).toBe('My sales');
    expect(state.dataNotice.message).toMatch(/one series/);

    await setType(state, 'pie');
    expect(state.chartData[0]).toEqual({ label: 'Mine', value: 999 });
    expect(state.chartDataForDisplay.labels[0]).toBe('Mine');

    state.chartData[0].value = 5;
    await setType(state, 'funnel');
    expect(state.funnelData[0]).toEqual({ label: 'Mine', value: 5 });
    expect(state.chartConfig.title).toBe('My sales');
  });

  it('keeps the other series when coming back to a multi-series type', async () => {
    const state = await mount();
    const seriesCount = state.multiDatasetData.length;
    expect(seriesCount).toBeGreaterThan(1);
    const secondSeries = state.multiDatasetData[1].data.map((item) => item.value);
    await setType(state, 'bar');
    state.chartData[0].value = 1;
    await setType(state, 'groupedBar');
    expect(state.multiDatasetData).toHaveLength(seriesCount);
    expect(state.multiDatasetData[0].data[0].value).toBe(1);
    expect(state.multiDatasetData[1].data.map((item) => item.value)).toEqual(secondSeries);
  });

  it('falls back to sample data (with a notice) only for types whose data cannot map', async () => {
    const state = await mount();
    state.chartConfig.title = 'Kept';
    await setType(state, 'gauge');
    expect(state.dataNotice.message).toMatch(/sample data/);
    expect(state.chartConfig.title).toBe('Kept');
    await setType(state, 'area');
    expect(state.chartData.length).toBeGreaterThan(0);
    expect(state.chartConfig.title).toBe('Kept');
  });

  it('loads samples on mount and from the button only', async () => {
    const state = await mount();
    expect(state.chartConfig.title).toBe('Line Graph Example');
    await setType(state, 'bar');
    state.chartData.splice(0, state.chartData.length, { label: 'Only', value: 3 });
    await setType(state, 'radar');
    expect(state.chartData).toEqual([{ label: 'Only', value: 3 }]);
    state.loadSampleData();
    expect(state.chartData.length).toBeGreaterThan(1);
    expect(state.chartConfig.title).toBe('Radar Chart Example');
  });

  it('tableFrom/storeFrom carry points and series both ways', () => {
    const points = storeFrom('points', tableFrom('series', [{ label: 'a', value: 4 }, { label: 'b', value: 6 }]), []);
    expect(points).toEqual([{ label: 'a', x: 1, y: 4, r: 10 }, { label: 'b', x: 2, y: 6, r: 10 }]);
    const back = storeFrom('series', tableFrom('points', points), []);
    expect(back).toEqual([{ label: 'a', value: 4 }, { label: 'b', value: 6 }]);
    // Coming back keeps each point's x and size
    const again = storeFrom('points', tableFrom('series', back), [{ label: 'a', x: 50, y: 0, r: 3 }, { label: 'b', x: 70, y: 0, r: 9 }]);
    expect(again.map((p) => [p.x, p.r])).toEqual([[50, 3], [70, 9]]);
    expect(alignIndices(['a', 'b', 'c'], ['a', 'c'])).toEqual([0, 2]);
  });
});

describe('multi-series points are shared rows (2)', () => {
  it('adds and removes a point in every dataset, keeping values aligned', async () => {
    const state = await mount();
    const before = state.multiDatasetData.map((d) => d.data.map((item) => item.value));
    state.addMultiDataItem(1);
    expect(state.multiDatasetData.every((d) => d.data.length === before[0].length + 1)).toBe(true);

    state.removeMultiDataItem(1, 0);
    state.multiDatasetData.forEach((dataset, k) => {
      expect(dataset.data.slice(0, before[k].length - 1).map((item) => item.value)).toEqual(before[k].slice(1));
    });

    state.setMultiRowLabel(0, 'Renamed');
    expect(state.multiDatasetData.every((d) => d.data[0].label === 'Renamed')).toBe(true);
    expect(state.dataTableHeaders.map((hd) => hd.label)).toEqual(['Label', ...state.multiDatasetData.map((d) => d.label)]);
    expect(state.sortedDataTable[0]).toMatchObject({ label: 'Renamed', s0: before[0][1], s1: before[1][1] });
  });
});

describe('waterfall floating bars (3)', () => {
  it('floats each change from the running total; base and total stand on 0', async () => {
    expect(waterfallBars(100, [{ label: 'Q1', value: 20 }, { label: 'Q2', value: -10 }]).bars)
      .toEqual([[0, 100], [100, 120], [120, 110], [0, 110]]);

    const state = await mount();
    await setType(state, 'waterfall');
    const data = state.chartDataForDisplay.datasets[0].data;
    expect(data[0]).toEqual([0, 100]);
    expect(data[1]).toEqual([100, 120]);
    expect(data[2]).toEqual([120, 110]);
    expect(data.at(-1)).toEqual([0, 135]);
    expect(state.sortedDataTable.at(-1)).toEqual({ label: 'Total', value: 135 });
  });
});

describe('data table for every chart type (4, 7)', () => {
  it('candlestick: date and OHLC columns', async () => {
    const state = await mount();
    await setType(state, 'candlestick');
    expect(state.dataTableHeaders.map((hd) => hd.label)).toEqual(['Date', 'Open', 'High', 'Low', 'Close']);
    expect(state.sortedDataTable[0]).toEqual({ label: '2024-01-01', open: 100, high: 110, low: 95, close: 105 });
  });

  it('heatmap: a row per heatmap row, a column per heatmap column', async () => {
    const state = await mount();
    await setType(state, 'heatmap');
    expect(state.dataTableHeaders.map((hd) => hd.label)).toEqual(['Row', 'Week 1', 'Week 2', 'Week 3', 'Week 4']);
    expect(state.sortedDataTable[1]).toEqual({ label: 'Tue', c0: 15, c1: 25, c2: 35, c3: 45 });
  });

  it('treemap: group, item and value for each leaf', async () => {
    const state = await mount();
    await setType(state, 'treemap');
    expect(state.dataTableHeaders.map((hd) => hd.label)).toEqual(['Group', 'Item', 'Value']);
    expect(state.sortedDataTable).toContainEqual({ group: 'Category B', label: 'Item B2', value: 20 });
    expect(state.sortedDataTable).toHaveLength(5);
  });

  it('sankey: from, to and value per link, by node label', async () => {
    const state = await mount();
    await setType(state, 'sankey');
    expect(state.dataTableHeaders.map((hd) => hd.label)).toEqual(['From', 'To', 'Value']);
    expect(state.sortedDataTable[0]).toMatchObject({ source: 'Source 1', target: 'Process 1', value: 30 });
  });

  it('scatter and bubble: x, y (and size) per point, in the table and the chart', async () => {
    const state = await mount();
    await setType(state, 'scatter');
    state.loadSampleData();
    state.pointData[0].x = 7;
    state.pointData[0].y = 9;
    await nextTick();
    expect(state.dataTableHeaders.map((hd) => hd.label)).toEqual(['Label', 'X', 'Y']);
    expect(state.sortedDataTable[0]).toEqual({ label: 'Point 1', x: 7, y: 9 });
    expect(state.scatterDataForDisplay.datasets[0].data[0]).toMatchObject({ x: 7, y: 9 });

    await setType(state, 'bubble');
    state.loadSampleData();
    await nextTick();
    expect(state.dataTableHeaders.map((hd) => hd.label)).toEqual(['Label', 'X', 'Y', 'Size']);
    expect(state.bubbleDataForDisplay.datasets[0].data[1]).toMatchObject({ x: 25, y: 50, r: 15 });
    expect(state.sortedDataTable[1]).toEqual({ label: 'B', x: 25, y: 50, r: 15 });

    const before = state.pointData.length;
    state.addPoint();
    expect(state.pointData).toHaveLength(before + 1);
    state.removePoint(0);
    expect(state.pointData[0].label).toBe('B');
  });
});

describe('secondary encoding (5)', () => {
  beforeEach(() => {
    // A fake 2D context so pattern fills can be made in jsdom
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => new Proxy({
      createPattern: () => ({ isPattern: true }),
    }, { get: (target, key) => (key in target ? target[key] : () => {}), set: () => true }));
  });

  it('offers only encodings the chart type can draw, and draws them', async () => {
    const state = await mount();
    expect(state.secondaryEncodingOptions.map((o) => o.value)).toEqual(['none', 'shape', 'lineStyle', 'text']);
    expect(state.colorOnlyEncoding).toBe(true);

    state.chartConfig.secondaryEncoding = 'shape';
    await nextTick();
    const styles = state.chartDataForDisplay.datasets.map((d) => d.pointStyle);
    expect(new Set(styles).size).toBe(styles.length);
    expect(state.colorOnlyEncoding).toBe(false);

    state.chartConfig.secondaryEncoding = 'lineStyle';
    await nextTick();
    expect(state.chartDataForDisplay.datasets[1].borderDash.length).toBeGreaterThan(0);

    state.chartConfig.secondaryEncoding = 'text';
    await nextTick();
    expect(state.chartOptions.plugins.valueLabels.display).toBe(true);
  });

  it('fills bars and slices with patterns, and resets an encoding the new type cannot draw', async () => {
    const state = await mount();
    state.chartConfig.secondaryEncoding = 'shape';
    await setType(state, 'groupedBar');
    expect(state.chartConfig.secondaryEncoding).toBe('none');
    state.chartConfig.secondaryEncoding = 'pattern';
    await nextTick();
    expect(state.chartDataForDisplay.datasets[1].backgroundColor).toEqual({ isPattern: true });

    await setType(state, 'pie');
    expect(state.chartConfig.secondaryEncoding).toBe('pattern');
    expect(state.chartDataForDisplay.datasets[0].backgroundColor[1]).toEqual({ isPattern: true });
  });

  it('removes the "Disable auto-update" option that nothing read', async () => {
    const state = await mount();
    expect('disableAutoUpdate' in state.chartConfig).toBe(false);
    expect(document.body.textContent).not.toContain('Disable auto-update');
  });
});

describe('sankey layout (6)', () => {
  it('puts nodes in columns by depth in the link graph', () => {
    const depth = sankeyColumns(
      [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }],
      [{ source: 'a', target: 'b' }, { source: 'b', target: 'c' }, { source: 'a', target: 'c' }, { source: 'c', target: 'a' }],
    );
    expect(depth.get('a')).toBe(0);
    expect(depth.get('b')).toBe(1);
    expect(depth.get('c')).toBe(2);
    expect(depth.get('d')).toBe(0);
  });

  it('renders links in the source node colour, the same on every render', async () => {
    const state = await mount();
    await setType(state, 'sankey');
    state.sankeyData.nodes = [{ id: 'in', label: 'In' }, { id: 'mid', label: 'Mid' }, { id: 'out', label: 'Out' }];
    state.sankeyData.links = [{ source: 'in', target: 'mid', value: 10 }, { source: 'mid', target: 'out', value: 10 }];
    await nextTick();
    const read = () => [...document.querySelectorAll('.chart-figure svg path')].map((p) => p.getAttribute('stroke'));
    const first = read();
    expect(first).toEqual(['#6366f180', '#8b5cf680']);
    state.chartKey++;
    await nextTick();
    expect(read()).toEqual(first);
    // Three columns: the nodes' x positions all differ
    const xs = [...document.querySelectorAll('.chart-figure svg rect')].map((r) => Number(r.getAttribute('x')));
    expect(new Set(xs).size).toBe(3);
  });

  it('keeps a node\'s links when its id is renamed', async () => {
    const graph = { nodes: [{ id: 'a' }, { id: 'b' }], links: [{ source: 'a', target: 'b' }, { source: 'b', target: 'a' }] };
    renameNodeId(graph, 0, 'z');
    expect(graph.links).toEqual([{ source: 'z', target: 'b' }, { source: 'b', target: 'z' }]);

    const state = await mount();
    await setType(state, 'sankey');
    state.renameNodeId(state.sankeyData, 0, 'Start');
    expect(state.sankeyData.links.filter((l) => l.source === 'Start')).toHaveLength(2);
  });
});

describe('gauge (8)', () => {
  it('draws the target and clamps a value above max, showing the real value', async () => {
    const state = await mount();
    await setType(state, 'gauge');
    state.gaugeData.value = 150;
    state.gaugeData.target = 80;
    await nextTick();
    const [valueRing, targetRing] = state.chartDataForDisplay.datasets;
    expect(valueRing.data).toEqual([100, 0]);
    expect(targetRing.label).toBe('Target');
    expect(targetRing.data[0] + targetRing.data[1] / 2).toBeCloseTo(80, 5);
    expect(state.chartOptions.plugins.gaugeReadout.text).toBe('150');
    expect(state.chartOptions.plugins.gaugeReadout.subtext).toMatch(/Above max/);
  });
});

describe('SVG chart image exports (9)', () => {
  it('copies computed fills and strokes onto the cloned SVG', () => {
    const make = () => {
      const div = document.createElement('div');
      div.innerHTML = '<svg><rect class="fill-ink"></rect><text class="fill-ink-on-accent">A</text></svg>';
      return div;
    };
    const source = make();
    const clone = make();
    vi.spyOn(window, 'getComputedStyle').mockImplementation((el) => ({
      getPropertyValue: (prop) => (prop === 'fill' ? (el.tagName === 'text' ? 'rgb(255, 255, 255)' : 'rgb(1, 2, 3)') : 'none'),
    }));
    inlineSvgPaint(source, clone);
    expect(clone.querySelector('rect').getAttribute('fill')).toBe('rgb(1, 2, 3)');
    expect(clone.querySelector('text').getAttribute('fill')).toBe('rgb(255, 255, 255)');
    expect(clone.querySelector('rect').getAttribute('stroke')).toBe('none');
  });
});

describe('minor fixes (10)', () => {
  it('holds chart colours to 3:1 and text to 4.5:1', () => {
    // #6366f1 is about 4.5:1 on white: a passing graphical colour
    expect(chartContrastIssues(['#6366f1'], '#ffffff')).toEqual([]);
    const [issue] = chartContrastIssues(['#fde68a'], '#ffffff');
    expect(issue).toMatchObject({ required: 3, type: 'graphical' });
    // Text at about 3.5:1 fails the 4.5:1 text minimum
    expect(chartContrastIssues([], '#ffffff', { Axis: '#8a8a8a' })[0]).toMatchObject({ required: 4.5, type: 'text' });
  });

  it('applies per-point custom colours to single-series bar, line, area, radar and horizontal bar', async () => {
    const state = await mount();
    for (const type of ['bar', 'horizontalBar', 'line', 'area', 'radar']) {
      await setType(state, type);
      if (type === 'line') continue; // line is multi-series: a colour per series
      state.chartConfig.colorScheme = 'custom';
      state.initializeCustomColors();
      state.customColors[1] = '#123456';
      await nextTick();
      const dataset = state.chartDataForDisplay.datasets[0];
      const colors = type === 'area' || type === 'radar' ? dataset.pointBackgroundColor : dataset.borderColor;
      expect(colors[1]).toBe('#123456');
    }
  });

  it('removing a heatmap row or column drops its values instead of shifting the rest', async () => {
    const state = await mount();
    await setType(state, 'heatmap');
    state.setHeatmapLabels('rows', 'Mon, Wed, Thu, Fri');
    expect(state.heatmapData.values[1]).toEqual([20, 30, 40, 50]);
    state.setHeatmapLabels('columns', 'Week 1, Week 3, Week 4');
    expect(state.heatmapData.values[0]).toEqual([10, 30, 40]);
    state.setHeatmapLabels('rows', 'Mon, New, Wed, Thu, Fri');
    expect(state.heatmapData.values[1]).toEqual([0, 0, 0]);
    expect(state.heatmapData.values[2]).toEqual([20, 40, 50]);
  });

  it('"Load sample data" fills bullet graphs and chord diagrams', async () => {
    const state = await mount();
    await setType(state, 'bulletGraph');
    state.bulletGraphData.splice(0);
    state.loadSampleData();
    expect(state.bulletGraphData).toHaveLength(3);
    expect(state.chartConfig.title).toBe('Bullet Graph Example');

    await setType(state, 'chordDiagram');
    state.chordDiagramData.links = [];
    state.loadSampleData();
    expect(state.chordDiagramData.links).toHaveLength(4);
  });

  it('steps the heatmap legend the same way as the cells', async () => {
    expect(heatmapStep(10, 10, 60, 5)).toBe(0);
    expect(heatmapStep(60, 10, 60, 5)).toBe(4);
    expect(heatmapStep(35, 10, 60, 5)).toBe(2);
    const steps = heatmapLegendSteps(['a', 'b'], 0, 10);
    expect(steps).toEqual([{ color: 'a', from: 0, to: 5 }, { color: 'b', from: 5, to: 10 }]);

    const state = await mount();
    await setType(state, 'heatmap');
    const legend = state.chartOptions.plugins.colorScaleLegend;
    expect(legend.steps).toHaveLength(6);
    expect(legend.steps[0].from).toBe(10);
    expect(legend.steps.at(-1).to).toBe(60);
    // The top value's cell takes the last legend colour
    const background = state.chartDataForDisplay.datasets[0].backgroundColor;
    expect(background({ raw: { v: 60 } })).toBe(legend.steps.at(-1).color);
    expect(background({ raw: { v: 10 } })).toBe(legend.steps[0].color);
  });
});
