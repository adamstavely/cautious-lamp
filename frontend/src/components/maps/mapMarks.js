import { h } from 'vue';
import { getFeatureCentroid } from '../../utils/mapData.js';

/** Props every map type takes and passes through to MapCanvas. */
export const surfaceProps = {
  geo: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  error: { type: String, default: null },
  projectionType: { type: String, default: 'equalEarth' },
  onOpen: { type: Function, default: null },
};

export const canvasProps = (props) => ({
  geo: props.geo,
  loading: props.loading,
  error: props.error,
  projectionType: props.projectionType,
  onOpen: props.onOpen,
});

/** Text that stays readable on any fill: strong text with a halo in the surface colour. */
export const labelAttrs = {
  class: 'fill-ink-strong stroke-surface-raised pointer-events-none',
  'stroke-width': 3,
  'stroke-linejoin': 'round',
  'paint-order': 'stroke',
  'font-size': 12,
  'font-weight': 'bold',
  'text-anchor': 'middle',
  'dominant-baseline': 'middle',
};

/** A projected point, or null when it is off this projection (London on Albers USA). */
export function project(projection, lng, lat) {
  if (!projection || !Number.isFinite(lng) || !Number.isFinite(lat)) return null;
  const point = projection([lng, lat]);
  return point && Number.isFinite(point[0]) && Number.isFinite(point[1]) ? point : null;
}

/** Whether a projected point falls inside the map. */
export const onMap = (point, width, height) => Boolean(point) && point[0] >= 0 && point[1] >= 0 && point[0] <= width && point[1] <= height;

/** Screen position of a feature's centre. */
export function featureCenter(projection, feature) {
  const [lng, lat] = getFeatureCentroid(feature);
  return project(projection, lng, lat);
}

export const label = (key, x, y, text) => h('text', { key, x, y, ...labelAttrs }, text);
