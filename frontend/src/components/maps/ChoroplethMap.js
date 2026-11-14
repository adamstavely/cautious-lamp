import { h, ref, useId } from 'vue';
import MapCanvas from './MapCanvas.js';
import { surfaceProps, canvasProps, featureCenter, label } from './mapMarks.js';
import { classSection, formatValue, renderLegend } from './mapLegend.js';

// Label regions only while there are few enough for the labels to stay apart
const MAX_LABELS = 10;

/**
 * Regions coloured by value through a classed colour scale
 * (utils/mapScales.js buildColorScale). Regions without data are hatched, so
 * "no data" never reads as a low value.
 */
export default {
  name: 'ChoroplethMap',
  props: {
    ...surfaceProps,
    /** Map of feature index → { row: { region, value } } (utils/regionMatch.js matchRows) */
    matched: { type: Map, required: true },
    /** buildColorScale result, or null with no data */
    scale: { type: Object, default: null },
    showAllRegions: { type: Boolean, default: true },
    label: { type: String, required: true },
    legendTitle: { type: String, default: '' },
  },
  setup(props, { expose }) {
    const canvas = ref(null);
    const patternId = `no-data-${useId()}`.replace(/[^a-zA-Z0-9-]/g, '');
    const noData = `url(#${patternId})`;
    expose({ getSvgElement: () => canvas.value?.getSvgElement() });

    const valueOf = (index) => props.matched.get(index)?.row.value;

    const fillFor = (index) => {
      const value = valueOf(index);
      if (value === undefined) return props.showAllRegions ? { fill: noData } : false;
      return { fill: props.scale?.colorFor(value) || noData };
    };

    const titleFor = (index) => {
      const name = props.geo.index.labels[index];
      const value = valueOf(index);
      return value === undefined ? `${name}: no data` : `${name}: ${formatValue(value)}`;
    };

    // A hatch for regions without data; the stripes use the chart's neutral token
    const defs = () => [
      h('pattern', { id: patternId, width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, [
        h('rect', { width: 6, height: 6, class: 'fill-surface-raised' }),
        h('line', { x1: 0, y1: 0, x2: 0, y2: 6, class: 'stroke-chart-neutral', 'stroke-width': 1.25 }),
      ]),
    ];

    const layer = ({ projection }) => {
      if (props.matched.size > MAX_LABELS) return [];
      return [...props.matched.keys()].map((index) => {
        const point = featureCenter(projection, props.geo.features[index]);
        return point ? label(`label-${index}`, point[0], point[1], props.geo.index.labels[index]) : null;
      });
    };

    const legend = ({ height }) => {
      if (!props.scale) return null;
      const missing = props.showAllRegions && props.matched.size < props.geo.features.length;
      return renderLegend([classSection(props.scale.classes, { title: props.legendTitle, noDataFill: missing ? noData : null })], height);
    };

    return () => h(MapCanvas, { ref: canvas, ...canvasProps(props), label: props.label, fillFor, titleFor, defs, layer, legend });
  },
};
