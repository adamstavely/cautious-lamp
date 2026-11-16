<template>
  <div class="gradient-preview" role="img" :aria-label="label"></div>
</template>

<script setup>
// The Gradient generator's main preview. It is its own component so the
// v-bind() variables land on the previewed element itself: the gradient can
// then refer to --gradient-angle / --gradient-shift, which the animation
// changes on this same element.
import { computed } from 'vue';

const props = defineProps({
  // [[property, value]…] from gradientStackCss()
  declarations: { type: Array, default: () => [] },
  label: { type: String, default: 'Gradient preview' },
});

const value = (property, fallback) => props.declarations.find(([name]) => name === property)?.[1] || fallback;
const image = computed(() => value('background-image', 'none'));
const blend = computed(() => value('background-blend-mode', 'normal'));
const size = computed(() => value('background-size', 'auto'));
const position = computed(() => value('background-position', '0% 0%'));
const animation = computed(() => value('animation', 'none'));
</script>

<style scoped>
.gradient-preview {
  @apply w-full h-64 rounded-tile border border-line;
  background-image: v-bind(image);
  background-blend-mode: v-bind(blend);
  background-size: v-bind(size);
  background-position: v-bind(position);
  background-repeat: no-repeat;
  animation: v-bind(animation);
}
@media (prefers-reduced-motion: reduce) {
  .gradient-preview {
    animation: none;
  }
}
</style>

<style>
/* Global: the animation names these, and the gradient reads the properties. */
@property --gradient-angle {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}
@property --gradient-shift {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 0%;
}
@keyframes gradient-position {
  0% { --gradient-shift: 0%; }
  50% { --gradient-shift: 100%; }
  100% { --gradient-shift: 0%; }
}
@keyframes gradient-angle {
  from { --gradient-angle: 0deg; }
  to { --gradient-angle: 360deg; }
}
@keyframes gradient-color {
  from { filter: hue-rotate(0deg); }
  to { filter: hue-rotate(360deg); }
}
</style>
