import { h, ref, useId } from 'vue';
import MapCanvas from './MapCanvas.js';
import { surfaceProps, canvasProps, project, label } from './mapMarks.js';
import { formatValue, renderLegend, widthSection } from './mapLegend.js';
import { sizeLegendValues } from '../../utils/mapScales.js';

const NODE_RADIUS = 5;
const MIN_WIDTH = 1.5;
const MAX_WIDTH = 8;

/**
 * Movement between places: a curved line per flow, its width proportional
 * to the value and an arrowhead at the destination. One colour (the
 * sequential accent): flows are one series, so width carries the value.
 */
export default {
  name: 'FlowMap',
  props: {
    ...surfaceProps,
    /** [{ id, label, lng, lat }] */
    places: { type: Array, required: true },
    /** [{ from, to, value }] whose places both exist (the view reports the rest) */
    flows: { type: Array, required: true },
    color: { type: String, required: true },
    label: { type: String, required: true },
    legendTitle: { type: String, default: '' },
  },
  setup(props, { expose }) {
    const canvas = ref(null);
    const markerId = `flow-arrow-${useId()}`.replace(/[^a-zA-Z0-9-]/g, '');
    expose({ getSvgElement: () => canvas.value?.getSvgElement() });

    const maxValue = () => Math.max(0, ...props.flows.map((f) => Math.abs(f.value)).filter(Number.isFinite));
    const widthOf = (value) => {
      const max = maxValue();
      return max > 0 && Number.isFinite(value) ? MIN_WIDTH + (Math.abs(value) / max) * (MAX_WIDTH - MIN_WIDTH) : MIN_WIDTH;
    };

    const defs = () => [
      h('marker', { id: markerId, viewBox: '0 0 10 10', refX: 7, refY: 5, markerWidth: 3, markerHeight: 3, orient: 'auto' }, [
        h('path', { d: 'M0,0L10,5L0,10Z', fill: props.color }),
      ]),
    ];

    const layer = ({ projection }) => {
      const at = new Map();
      props.places.forEach((p) => {
        const point = project(projection, p.lng, p.lat);
        if (point) at.set(p.id, { ...p, x: point[0], y: point[1] });
      });

      const lines = props.flows.map((flow, i) => {
        const a = at.get(flow.from);
        const b = at.get(flow.to);
        if (!a || !b || a === b) return null;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 1) return null;
        // Bow each line to the side, so A→B and B→A don't sit on top of each other
        const cx = (a.x + b.x) / 2 - (dy / distance) * distance * 0.25;
        const cy = (a.y + b.y) / 2 + (dx / distance) * distance * 0.25;
        // Stop short of the destination's dot, so the arrowhead stays visible
        const tx = b.x - cx;
        const ty = b.y - cy;
        const back = (NODE_RADIUS + 2) / (Math.hypot(tx, ty) || 1);
        const ex = b.x - tx * back;
        const ey = b.y - ty * back;
        return h('path', {
          key: `flow-${i}`,
          d: `M${a.x},${a.y}Q${cx},${cy} ${ex},${ey}`,
          fill: 'none',
          stroke: props.color,
          'stroke-width': widthOf(flow.value),
          'stroke-linecap': 'round',
          'stroke-opacity': 0.7,
          'marker-end': `url(#${markerId})`,
        }, [h('title', `${a.label} to ${b.label}: ${formatValue(flow.value)}`)]);
      });

      const nodes = [...at.values()].flatMap((p) => [
        h('circle', { key: `place-${p.id}`, cx: p.x, cy: p.y, r: NODE_RADIUS, class: 'fill-surface-raised stroke-ink-strong', 'stroke-width': 2 }, [h('title', p.label)]),
        label(`place-label-${p.id}`, p.x, p.y + NODE_RADIUS + 11, p.label),
      ]);
      return [...lines, ...nodes];
    };

    const legend = ({ height }) => {
      const max = maxValue();
      if (!max) return null;
      return renderLegend([widthSection(sizeLegendValues(max), widthOf, props.color, { title: props.legendTitle })], height);
    };

    return () => h(MapCanvas, { ref: canvas, ...canvasProps(props), label: props.label, defs, layer, legend });
  },
};
