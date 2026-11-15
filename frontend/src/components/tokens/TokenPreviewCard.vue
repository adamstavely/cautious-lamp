<template>
  <div class="token-preview-card">
    <p class="token-preview-title">Card title</p>
    <p class="token-preview-body">This card is drawn with the tokens chosen for each role.</p>
    <UiDesignedButton :styles="buttonStyles">Action button</UiDesignedButton>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { UiDesignedButton } from '../ui';
import { readableOn } from '../../utils/contrast.js';

/**
 * Token playground's component preview: a card whose surface, text, padding,
 * radius, shadow, font and button come from token values (resolved, so plain
 * CSS values). Each value reaches CSS through v-bind(); empty ones fall back
 * to the app's own tokens.
 */
const props = defineProps({
  surface: { type: String, default: '' },
  text: { type: String, default: '' },
  accent: { type: String, default: '' },
  padding: { type: String, default: '' },
  radius: { type: String, default: '' },
  shadow: { type: String, default: '' },
  family: { type: String, default: '' },
  buttonPadding: { type: String, default: '' },
});

const v = computed(() => ({
  surface: props.surface || 'var(--tc-surface-raised)',
  text: props.text || 'var(--tc-text-primary)',
  padding: props.padding || '1.5rem',
  radius: props.radius || '0.5rem',
  shadow: props.shadow || 'none',
  family: props.family || 'inherit',
}));

const buttonStyles = computed(() => ({
  backgroundColor: props.accent || 'var(--tc-accent)',
  color: props.accent ? readableOn(props.accent) : 'var(--app-text-on-accent)',
  borderRadius: props.radius || '0.5rem',
  padding: props.buttonPadding || '0.5rem 1rem',
  fontWeight: '600',
}));
</script>

<style scoped>
.token-preview-card {
  @apply border border-line flex flex-col items-start gap-2;
  background: v-bind('v.surface');
  color: v-bind('v.text');
  padding: v-bind('v.padding');
  border-radius: v-bind('v.radius');
  box-shadow: v-bind('v.shadow');
  font-family: v-bind('v.family');
}
.token-preview-title {
  @apply text-xl font-bold;
}
.token-preview-body {
  @apply text-sm mb-2 opacity-80;
}
</style>
