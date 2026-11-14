import { h, ref } from 'vue';
import MapCanvas from './MapCanvas.js';
import { surfaceProps, canvasProps, project } from './mapMarks.js';
import { categorySection, formatValue, renderLegend, symbolPath } from './mapLegend.js';

const RADIUS = 5;

/**
 * Places as markers. With categories, each has a colour slot and its own
 * marker shape, so category never rests on colour alone.
 */
export default {
  name: 'DotMap',
  props: {
    ...surfaceProps,
    /** [{ label, lng, lat, value?, category?, color, shape }] */
    points: { type: Array, required: true },
    /** Legend entries: [{ name, color, shape }]; empty when there are no categories */
    categories: { type: Array, default: () => [] },
    label: { type: String, required: true },
  },
  setup(props, { expose }) {
    const canvas = ref(null);
    expose({ getSvgElement: () => canvas.value?.getSvgElement() });

    const layer = ({ projection }) => props.points.map((p, i) => {
      const at = project(projection, p.lng, p.lat);
      if (!at) return null;
      const details = [p.category, Number.isFinite(p.value) ? formatValue(p.value) : null].filter(Boolean).join(', ');
      return h('path', {
        key: `dot-${i}`,
        d: symbolPath(p.shape, RADIUS),
        transform: `translate(${at[0]}, ${at[1]})`,
        fill: p.color,
        class: 'stroke-surface-raised',
        'stroke-width': 1.5,
      }, [h('title', details ? `${p.label} (${details})` : p.label)]);
    });

    const legend = ({ height }) => (props.categories.length ? renderLegend([categorySection(props.categories)], height) : null);

    return () => h(MapCanvas, { ref: canvas, ...canvasProps(props), label: props.label, layer, legend });
  },
};
