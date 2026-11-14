<template>
  <div>
    <div class="ui-tabs" role="tablist" :aria-label="label">
      <button
        v-for="(tab, index) in tabs"
        :id="tabId(tab.value)"
        :key="tab.value"
        ref="buttons"
        type="button"
        role="tab"
        class="ui-tab"
        :class="{ 'ui-tab-on': tab.value === modelValue }"
        :aria-selected="tab.value === modelValue"
        :aria-controls="panelId(tab.value)"
        :tabindex="tab.value === modelValue ? 0 : -1"
        @click="$emit('update:modelValue', tab.value)"
        @keydown="onKey($event, index)"
      >
        <span v-if="tab.icon" class="material-symbols-outlined text-base" aria-hidden="true">{{ tab.icon }}</span>
        {{ tab.label }}
        <UiChip v-if="tab.count !== undefined" tone="neutral">{{ tab.count }}</UiChip>
      </button>
    </div>
    <div :id="panelId(modelValue)" role="tabpanel" :aria-labelledby="tabId(modelValue)" class="ui-tab-panel" tabindex="0">
      <slot :name="modelValue" />
      <slot />
    </div>
  </div>
</template>

<script setup>
import { nextTick, ref, useId } from 'vue';
import UiChip from './UiChip.vue';

/**
 * Tabs for switching views within a page. `tabs` are { value, label, icon?, count? };
 * put each panel in a slot named after its value (or use the default slot and
 * switch on v-model yourself). Arrow keys move between tabs.
 */
const props = defineProps({
  modelValue: { type: String, required: true },
  tabs: { type: Array, required: true },
  /** Accessible name for the tab list */
  label: { type: String, required: true },
});

const emit = defineEmits(['update:modelValue']);
const base = useId();
const buttons = ref([]);
const tabId = (value) => `${base}-tab-${value}`;
const panelId = (value) => `${base}-panel-${value}`;

const onKey = async (event, index) => {
  const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
  const edge = { Home: 0, End: props.tabs.length - 1 }[event.key];
  if (step === undefined && edge === undefined) return;
  event.preventDefault();
  const next = edge ?? (index + step + props.tabs.length) % props.tabs.length;
  emit('update:modelValue', props.tabs[next].value);
  await nextTick();
  buttons.value[next]?.focus();
};
</script>

<style scoped>
.ui-tabs {
  @apply flex flex-wrap gap-6 border-b border-line;
}
.ui-tab {
  @apply relative -mb-px inline-flex items-center gap-2 pb-3 pt-1 border-b-2 border-solid border-transparent text-sm font-medium text-ink-secondary transition-colors hover:text-ink;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 outline-focus rounded-control;
}
.ui-tab-on {
  @apply border-accent text-accent-text;
}
.ui-tab-panel {
  @apply pt-8 focus-visible:outline-none;
}
</style>
