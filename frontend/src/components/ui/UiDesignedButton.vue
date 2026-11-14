<template>
  <button type="button" class="ui-designed-button"><slot /></button>
</template>

<script setup>
import { computed } from 'vue';

/**
 * A button drawn with styles the user is designing (a variant builder's
 * preview): `styles` is a CSS object such as { backgroundColor, color,
 * borderColor, borderWidth, borderRadius, padding, fontSize, fontWeight }.
 * The values reach CSS through v-bind() in this component's style, so pages
 * never set them inline. Missing values fall back to a plain button.
 */
const props = defineProps({
  styles: { type: Object, default: () => ({}) },
});

const s = computed(() => ({
  background: props.styles.backgroundColor || 'transparent',
  color: props.styles.color || 'inherit',
  borderStyle: props.styles.borderStyle || 'none',
  borderColor: props.styles.borderColor || 'currentColor',
  borderWidth: props.styles.borderWidth || '0',
  radius: props.styles.borderRadius || '0',
  padding: props.styles.padding || '0.75rem 1.5rem',
  fontSize: props.styles.fontSize || 'inherit',
  fontWeight: props.styles.fontWeight || 'inherit',
}));
</script>

<style scoped>
.ui-designed-button {
  background: v-bind('s.background');
  color: v-bind('s.color');
  border-style: v-bind('s.borderStyle');
  border-color: v-bind('s.borderColor');
  border-width: v-bind('s.borderWidth');
  border-radius: v-bind('s.radius');
  padding: v-bind('s.padding');
  font-size: v-bind('s.fontSize');
  font-weight: v-bind('s.fontWeight');
  @apply transition-all focus-visible:outline focus-visible:outline-2 outline-focus;
}
</style>
