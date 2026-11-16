import { h, ref } from 'vue';
import MapCanvas from './MapCanvas.js';
import { surfaceProps, canvasProps, project, label } from './mapMarks.js';
import { categorySection, formatValue, renderLegend, sizeSection, symbolPath } from './mapLegend.js';
import { radiusScale, sizeLegendValues } from '../../utils/mapScales.js';

// Direct labels for the few largest symbols only
const LABELS = 3;

/**
 * Proportional symbols: a circle per place whose area is proportional to its
 * value (radius ∝ √value). The largest are drawn first so small ones stay on
 * top and visible; each has a surface-coloured ring to separate overlaps.
 * With categories each symbol also takes its category's marker shape (as on
 * the dot map; the shapes keep the circle's area, so size still reads as
 * value), so category never rests on colour alone.
 */
export default {
  name: 'BubbleMap',
  props: {
    ...surfaceProps,
    /** [{ label, lng, lat, value, color, shape? }] with value > 0 (the view reports the rest) */
    points: { type: Array, required: true },
    /** Legend entries for categories: [{ name, color, shape }]; empty for one series */
    categories: { type: Array, default: () => [] },
    label: { type: String, required: true },
    legendTitle: { type: String, default: '' },
  },
  setup(props, { expose }) {
    const canvas = ref(null);
    expose({ getSvgElement: () => canvas.value?.getSvgElement() });

    const sizing = ({ width, height }) => {
      const max = Math.max(0, ...props.points.map((p) => p.value));
      // The largest circle scales with the map, within readable limits
      const maxRadius = Math.max(14, Math.min(40, Math.min(width, height) / 12));
      return { max, radiusOf: radiusScale(max, maxRadius) };
    };

    const layer = (ctx) => {
      const { radiusOf } = sizing(ctx);
      const placed = props.points
        .map((p) => ({ ...p, at: project(ctx.projection, p.lng, p.lat), r: radiusOf(p.value) }))
        .filter((p) => p.at && p.r > 0)
        .sort((a, b) => b.value - a.value);
      const circles = placed.map((p, i) => h('path', {
        key: `bubble-${i}`,
        d: symbolPath(p.shape || 'circle', p.r),
        transform: `translate(${p.at[0]}, ${p.at[1]})`,
        'data-shape': p.shape || 'circle',
        fill: p.color,
        'fill-opacity': 0.75,
        class: 'stroke-surface-raised',
        'stroke-width': 1.5,
      }, [h('title', `${p.label}: ${formatValue(p.value)}${p.category ? ` (${p.category})` : ''}`)]));
      const labels = placed.slice(0, LABELS).map((p, i) => label(`bubble-label-${i}`, p.at[0], p.at[1] + p.r + 10, p.label));
      return [...circles, ...labels];
    };

    const legend = (ctx) => {
      const { max, radiusOf } = sizing(ctx);
      if (!max) return null;
      return renderLegend([
        sizeSection(sizeLegendValues(max), radiusOf, { title: props.legendTitle }),
        props.categories.length ? categorySection(props.categories.map((c) => ({ ...c, shape: c.shape || 'circle' }))) : null,
      ], ctx.height);
    };

    return () => h(MapCanvas, { ref: canvas, ...canvasProps(props), label: props.label, layer, legend });
  },
};
