import { computed, h, onBeforeUnmount, ref, watch } from 'vue';
import { createAreaProjection, createPathGenerator, createProjection } from '../../utils/mapProjections.js';

/**
 * The drawing surface every map type shares: measures its container (always
 * rendered, so the ResizeObserver can attach on mount), projects the
 * geography from useGeography to the current size, and draws the base map:
 * context countries, the area's regions (filled by `fillFor`, or a neutral
 * base), border lines, and the hover/focus outline. Regions that can be
 * opened (a country on a world or continent map) are buttons: click, Enter
 * or Space opens them. Map types draw their own marks on top through `layer`
 * and their legend through `legend`.
 *
 * `layer`, `legend`, `fillFor` and `titleFor` are functions so the parent's
 * data stays reactive inside this component's render.
 */
export default {
  name: 'MapCanvas',
  props: {
    geo: { type: Object, default: null },
    loading: { type: Boolean, default: false },
    error: { type: String, default: null },
    /** World maps only: 'equalEarth' | 'mercator' */
    projectionType: { type: String, default: 'equalEarth' },
    /** Accessible name of the map, e.g. "Choropleth map of Canada" */
    label: { type: String, required: true },
    /** (featureIndex) => { fill?: string, class?: string } | null; null draws the neutral base */
    fillFor: { type: Function, default: null },
    /** (featureIndex) => tooltip text for a region */
    titleFor: { type: Function, default: null },
    /** ({ projection, width, height, geo }) => VNode[] drawn above the regions */
    layer: { type: Function, default: null },
    /** ({ projection, width, height, geo }) => VNode | null, drawn last */
    legend: { type: Function, default: null },
    /** <defs> content, e.g. the no-data pattern */
    defs: { type: Function, default: null },
    /** Called with (countryId) when a region that can be opened is activated */
    onOpen: { type: Function, default: null },
  },
  setup(props, { expose }) {
    const containerRef = ref(null);
    const svgRef = ref(null);
    const width = ref(800);
    const height = ref(500);
    const hovered = ref(null);
    let resizeObserver = null;

    const measure = () => {
      const el = containerRef.value;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        width.value = Math.round(rect.width);
        height.value = Math.round(rect.height);
      }
    };

    watch(containerRef, (el) => {
      resizeObserver?.disconnect();
      resizeObserver = null;
      if (!el) return;
      measure();
      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(measure);
        resizeObserver.observe(el);
      }
    }, { flush: 'post' });

    onBeforeUnmount(() => resizeObserver?.disconnect());

    // Rebuilt on resize, a new area or a new world projection
    const projection = computed(() => {
      const geo = props.geo;
      if (!geo) return null;
      if (geo.projection.type === 'world') return createProjection('world', width.value, height.value, props.projectionType);
      return createAreaProjection(geo.projection, width.value, height.value, geo.fit);
    });

    // Path strings are the expensive part; compute them once per projection
    const paths = computed(() => {
      const proj = projection.value;
      if (!proj) return { features: [], context: [], overlay: null };
      const gen = createPathGenerator(proj);
      return {
        features: props.geo.features.map((f) => gen(f)),
        context: props.geo.context.map((f) => gen(f)),
        overlay: props.geo.overlay ? gen(props.geo.overlay) : null,
      };
    });

    watch(() => props.geo, () => {
      hovered.value = null;
    });

    expose({ getSvgElement: () => svgRef.value });

    const message = (text, isError = false) =>
      h('div', { class: 'absolute inset-0 flex items-center justify-center' }, [
        h('div', { class: isError ? 'text-sm text-danger' : 'text-sm text-ink-muted', role: isError ? 'alert' : 'status' }, text),
      ]);

    const renderMap = () => {
      const geo = props.geo;
      const ctx = { projection: projection.value, width: width.value, height: height.value, geo };
      const openable = (feature) => (props.onOpen && geo.drillable ? geo.drillable(feature) : null);
      const anyOpenable = Boolean(props.onOpen && geo.drillable);
      // Thin strokes where regions are small and many
      const strokeWidth = geo.kind === 'us-counties' ? 0.25 : 0.5;
      let hoveredPath = null;

      const context = paths.value.context.map((d, i) => (d
        // Outlines on the well's own colour, so no fill can be mistaken for data
        ? h('path', { key: `context-${i}`, d, class: 'fill-surface-sunken stroke-line', 'stroke-width': strokeWidth })
        : null));

      const regions = geo.features.map((feature, index) => {
        const d = paths.value.features[index];
        if (!d) return null;
        const fill = props.fillFor ? props.fillFor(index) : null;
        if (fill === false) return null;
        const countryId = openable(feature);
        const title = props.titleFor ? props.titleFor(index) : geo.index.labels[index];
        const isHovered = countryId && hovered.value === index;
        if (isHovered) hoveredPath = d;
        const open = () => props.onOpen(countryId);
        return h('path', {
          key: `region-${index}`,
          d,
          fill: fill?.fill,
          class: ['stroke-surface-raised outline-none', fill?.class || (fill?.fill ? '' : 'fill-fill-strong'), countryId ? 'cursor-pointer' : ''],
          'stroke-width': strokeWidth,
          tabindex: countryId ? 0 : undefined,
          role: countryId ? 'button' : undefined,
          'aria-label': countryId ? `${title}. Activate to show its regions.` : undefined,
          onClick: countryId ? open : undefined,
          onKeydown: countryId ? (e) => {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
              e.preventDefault();
              open();
            }
          } : undefined,
          onMouseenter: countryId ? () => { hovered.value = index; } : undefined,
          onMouseleave: countryId ? () => { if (hovered.value === index) hovered.value = null; } : undefined,
          onFocus: countryId ? () => { hovered.value = index; } : undefined,
          onBlur: countryId ? () => { if (hovered.value === index) hovered.value = null; } : undefined,
        }, [h('title', countryId ? `${title} (click to show its regions)` : title)]);
      });

      return h('svg', {
        ref: svgRef,
        xmlns: 'http://www.w3.org/2000/svg',
        width: width.value,
        height: height.value,
        viewBox: `0 0 ${width.value} ${height.value}`,
        class: 'w-full h-full block',
        role: anyOpenable ? 'group' : 'img',
        'aria-label': props.label,
      }, [
        props.defs ? h('defs', props.defs(ctx)) : null,
        ...context,
        ...regions,
        paths.value.overlay ? h('path', { d: paths.value.overlay, fill: 'none', class: 'stroke-ink-muted pointer-events-none', 'stroke-width': 0.75 }) : null,
        hoveredPath ? h('path', { d: hoveredPath, fill: 'none', class: 'stroke-accent pointer-events-none', 'stroke-width': 2 }) : null,
        ...(props.layer ? props.layer(ctx) : []),
        props.legend ? props.legend(ctx) : null,
      ]);
    };

    return () => {
      let inner;
      if (props.loading) inner = message('Loading map...');
      else if (props.error) inner = message(`Error: ${props.error}`, true);
      else if (!props.geo || !projection.value || !props.geo.features.length) inner = message('No map data available');
      else inner = renderMap();
      return h('div', { ref: containerRef, class: 'w-full h-full min-h-72 relative' }, [inner]);
    };
  },
};
