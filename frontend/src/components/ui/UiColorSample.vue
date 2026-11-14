<template>
  <component :is="tag" :type="tag === 'button' ? 'button' : undefined" class="ui-color-sample">
    <slot />
  </component>
</template>

<script setup>
import { computed } from 'vue';

/**
 * An element filled with a colour from data or user input (a palette cell, a
 * generated shade, a demo of a picked accent), with content on top. Unlike
 * UiSwatch it holds content and takes any size or shape from its classes.
 * The colours reach CSS through v-bind(), never style=.
 *
 *   <UiColorSample :color="shade.hex" text-color="#fff" tag="button" class="p-3 rounded-tile">…</UiColorSample>
 *
 * `textColor` is the readable ink for that fill (usually black or white
 * picked from its luminance); leave it empty to inherit. Add a `border`
 * class for an edge: it is the hairline colour, or `borderColor` from data. Import by path:
 * import UiColorSample from '../components/ui/UiColorSample.vue'.
 */
const props = defineProps({
  color: { type: String, default: 'transparent' },
  textColor: { type: String, default: '' },
  borderColor: { type: String, default: '' },
  tag: { type: String, default: 'div' },
});

const fill = computed(() => props.color || 'transparent');
const ink = computed(() => props.textColor || 'inherit');
const edge = computed(() => props.borderColor || 'var(--tc-border-default)');
</script>

<style scoped>
.ui-color-sample {
  background: v-bind(fill);
  color: v-bind(ink);
  border-color: v-bind(edge);
}
button.ui-color-sample {
  @apply focus-visible:outline focus-visible:outline-2 outline-focus;
}
</style>
