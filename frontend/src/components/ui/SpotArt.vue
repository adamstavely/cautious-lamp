<template>
  <!-- Inlined (not <img>) so the illustration follows the app's .dark class -->
  <div class="spot-art" :class="sizeClass" aria-hidden="true" v-html="markup"></div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

/**
 * A Trench Coat spot illustration (src/assets/illustrations/spot/<folder>/<name>.svg),
 * loaded on demand so pages only download the ones they show. Decorative:
 * always hidden from assistive technology, so keep a text label beside it.
 */
const props = defineProps({
  /** "<folder>/<name>", e.g. "site/tools" */
  name: { type: String, required: true },
  /** xs 40px · sm 48px · md 64px · lg 96px · xl 192px (224px wide screens) · hero 256px (288px) */
  size: { type: String, default: 'md', validator: (v) => ['xs', 'sm', 'md', 'lg', 'xl', 'hero'].includes(v) },
});

const loaders = import.meta.glob('../../assets/illustrations/spot/**/*.svg', { query: '?raw', import: 'default' });
const cache = new Map();
const markup = ref('');

watch(
  () => props.name,
  async (name) => {
    if (cache.has(name)) {
      markup.value = cache.get(name);
      return;
    }
    const load = loaders[`../../assets/illustrations/spot/${name}.svg`];
    if (!load) {
      if (import.meta.env.DEV) console.warn(`SpotArt: no illustration "${name}"`);
      markup.value = '';
      return;
    }
    const svg = await load();
    cache.set(name, svg);
    if (props.name === name) markup.value = svg;
  },
  { immediate: true },
);

const sizeClass = computed(
  () =>
    ({
      xs: 'w-10 h-10',
      sm: 'w-12 h-12',
      md: 'w-16 h-16',
      lg: 'w-24 h-24',
      xl: 'w-48 h-48 lg:w-56 lg:h-56',
      hero: 'w-64 h-64 lg:w-72 lg:h-72',
    })[props.size],
);
</script>

<style scoped>
.spot-art {
  @apply shrink-0;
}
.spot-art :deep(svg) {
  @apply block w-full h-full;
}
</style>
