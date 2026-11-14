<template>
  <component :is="tag" class="ui-type-sample"><slot /></component>
</template>

<script setup>
import { computed } from 'vue';

/**
 * Text set in a size, family, weight or line height that comes from data or
 * user input (a type scale step, a font stack being built), not from the
 * design. Like UiSwatch, the values reach CSS through v-bind() in this
 * component's style, so pages never set them inline. Anything left unset
 * inherits. Colour comes from the surrounding text (use the ink tokens).
 */
const props = defineProps({
  /** Font size: a number of pixels, or any CSS length ("1.25rem") */
  size: { type: [Number, String], default: null },
  /** A CSS font-family value, e.g. "'Inter', Arial, sans-serif" */
  family: { type: String, default: '' },
  /** A CSS font-weight, e.g. 700 or "bold" */
  weight: { type: [Number, String], default: null },
  /** A CSS line-height, e.g. 1.4 */
  lineHeight: { type: [Number, String], default: null },
  /** The element to render: div, p, span, or a heading when the sample is one */
  tag: { type: String, default: 'div' },
});

const fontSize = computed(() => (props.size === null || props.size === '' ? 'inherit' : typeof props.size === 'number' ? `${props.size}px` : props.size));
const fontFamily = computed(() => props.family || 'inherit');
const fontWeight = computed(() => (props.weight === null || props.weight === '' ? 'inherit' : String(props.weight)));
const lineHeightValue = computed(() => (props.lineHeight === null || props.lineHeight === '' ? 'inherit' : String(props.lineHeight)));
</script>

<style scoped>
.ui-type-sample {
  font-size: v-bind(fontSize);
  font-family: v-bind(fontFamily);
  font-weight: v-bind(fontWeight);
  line-height: v-bind(lineHeightValue);
}
</style>
