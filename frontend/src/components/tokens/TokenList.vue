<template>
  <ul class="flex flex-col divide-y divide-line">
    <li v-for="token in tokens" :key="token.id" class="flex items-center gap-4 py-3">
      <UiSwatch v-if="isColor(token)" :color="token.$value" size="lg" :label="`${token.name}: ${token.$value}`" />
      <span v-else class="token-preview" aria-hidden="true">
        <span v-if="token.$type === 'dimension'" class="font-code text-xs text-ink-secondary truncate px-1">{{ token.$value }}</span>
        <AppIcon v-else :name="typeIcon(token.$type)" class="text-lg text-ink-muted" />
      </span>
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-2">
          <code class="font-code text-sm font-semibold text-ink-strong break-all">{{ token.name }}</code>
          <UiChip tone="accent">{{ token.$type || 'string' }}</UiChip>
        </div>
        <p class="font-code text-sm text-ink-secondary break-all">{{ formatValue(token.$value) }}</p>
        <p v-if="token.$description" class="text-xs text-ink-muted mt-1">{{ token.$description }}</p>
      </div>
      <div class="flex shrink-0 items-center gap-1">
        <slot name="actions" :token="token">
          <UiButton icon-only icon="pencil" variant="ghost" size="sm" :label="`Edit ${token.name}`" @click="emit('edit', token)" />
          <UiButton icon-only icon="trash-2" variant="ghost" size="sm" :label="`Delete ${token.name}`" @click="emit('delete', token)" />
        </slot>
      </div>
    </li>
  </ul>
</template>

<script setup>
import { UiButton, UiChip, UiSwatch } from '../ui';

/** The token editors' list: a preview, the name, type, value and description, with edit and delete (or the #actions slot's buttons) */
defineProps({
  /** Flat editor tokens ({ id, name, $type, $value, $description }) */
  tokens: { type: Array, required: true },
});
const emit = defineEmits(['edit', 'delete']);

const ICONS = {
  color: 'palette',
  dimension: 'ruler',
  fontFamily: 'type',
  fontWeight: 'bold',
  duration: 'clock',
  cubicBezier: 'chart-gantt',
  number: 'hash',
  string: 'type',
};
const typeIcon = (type) => ICONS[type] ?? 'swatch-book';

// An alias ({color.primary}) has no colour of its own to show
const isColor = (token) => token.$type === 'color' && typeof token.$value === 'string' && !token.$value.trim().startsWith('{');

const formatValue = (value) => (value && typeof value === 'object' ? JSON.stringify(value) : String(value ?? ''));
</script>

<style scoped>
.token-preview {
  @apply flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-control border border-line bg-surface-sunken;
}
</style>
