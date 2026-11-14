<template>
  <span class="ui-swatch" :class="[sizeClass, { 'ui-swatch-flush': flush }]" role="img" :aria-label="label || color"></span>
</template>

<script setup>
import { computed } from 'vue';

/**
 * A colour the user chose or the data contains (not a design colour). The
 * value reaches CSS through v-bind() in this component's style, which is the
 * only sanctioned way to show data-driven colours: pages never set colours
 * inline.
 */
const props = defineProps({
  color: { type: String, required: true },
  label: { type: String, default: '' },
  size: { type: String, default: 'md', validator: (v) => ['sm', 'md', 'lg', 'fill'].includes(v) },
  /** No border or rounding: edge-to-edge colour strips */
  flush: { type: Boolean, default: false },
});

const sizeClass = computed(() => ({ sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12', fill: 'w-full h-full' })[props.size]);
</script>

<style scoped>
.ui-swatch {
  @apply inline-block rounded-control border border-line;
  background: v-bind(color);
}
.ui-swatch-flush {
  @apply rounded-none border-0;
}
</style>
