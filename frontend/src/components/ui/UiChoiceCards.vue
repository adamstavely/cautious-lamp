<template>
  <UiField :label="label" :hint="hint" group v-slot="{ labelId, describedBy }">
    <div
      class="ui-choice-cards"
      :class="columnsClass"
      role="radiogroup"
      :aria-labelledby="label ? labelId : undefined"
      :aria-label="label ? undefined : ariaLabel"
      :aria-describedby="describedBy"
    >
      <button
        v-for="(option, index) in options"
        :key="String(option.value)"
        ref="buttons"
        type="button"
        role="radio"
        class="ui-choice-card"
        :class="{ 'ui-choice-card-on': option.value === modelValue }"
        :aria-checked="option.value === modelValue"
        :tabindex="option.value === modelValue || (!hasSelection && index === 0) ? 0 : -1"
        @click="select(option.value)"
        @keydown="onKey($event, index)"
      >
        <span class="ui-choice-card-head">
          <span v-if="option.icon" class="material-symbols-outlined ui-choice-card-icon" aria-hidden="true">{{ option.icon }}</span>
          <span class="ui-choice-card-label">{{ option.label }}</span>
        </span>
        <span v-if="option.description" class="ui-choice-card-description">{{ option.description }}</span>
      </button>
    </div>
  </UiField>
</template>

<script setup>
import { computed, nextTick, ref } from 'vue';
import UiField from './UiField.vue';

/**
 * One choice from a set of options that each need a line of explanation
 * (chart types, map types), shown as selectable cards: a radio group with
 * arrow-key support. `options` are { value, label, icon?, description? }.
 * For a few short options use UiSegmented.
 */
const props = defineProps({
  modelValue: { type: [String, Number, Boolean], default: null },
  options: { type: Array, required: true },
  label: { type: String, default: '' },
  hint: { type: String, default: '' },
  /** Accessible name when there's no visible label */
  ariaLabel: { type: String, default: '' },
  /** Cards per row on wide screens: 2, 3, 4 or 5 (fewer on narrow screens) */
  columns: { type: Number, default: 3, validator: (v) => [2, 3, 4, 5].includes(v) },
});

const emit = defineEmits(['update:modelValue']);
const buttons = ref([]);

const hasSelection = computed(() => props.options.some((o) => o.value === props.modelValue));
const columnsClass = computed(
  () =>
    ({
      2: 'sm:grid-cols-2',
      3: 'sm:grid-cols-2 lg:grid-cols-3',
      4: 'sm:grid-cols-2 lg:grid-cols-4',
      5: 'sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5',
    })[props.columns],
);

const select = (value) => emit('update:modelValue', value);

const onKey = async (event, index) => {
  const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
  if (!step) return;
  event.preventDefault();
  const next = (index + step + props.options.length) % props.options.length;
  select(props.options[next].value);
  await nextTick();
  buttons.value[next]?.focus();
};
</script>

<style scoped>
.ui-choice-cards {
  @apply grid grid-cols-1 gap-3;
}
.ui-choice-card {
  @apply flex flex-col items-start gap-1 p-4 text-left rounded-tile border border-line bg-surface-raised transition-colors;
  @apply hover:border-accent-border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 outline-focus;
}
.ui-choice-card-on {
  @apply border-accent-highlight bg-accent-subtle;
}
.ui-choice-card-head {
  @apply flex items-center gap-2;
}
.ui-choice-card-icon {
  @apply text-xl text-ink-muted;
}
.ui-choice-card-on .ui-choice-card-icon {
  @apply text-accent-text;
}
.ui-choice-card-label {
  @apply text-sm font-semibold text-ink-strong;
}
.ui-choice-card-description {
  @apply text-xs leading-relaxed text-ink-secondary;
}
</style>
