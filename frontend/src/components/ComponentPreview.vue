<template>
  <div class="component-preview" :class="{ 'component-preview-dark': forceDark }" :data-theme="forceDark ? 'dark' : undefined">
    <!-- Button -->
    <div v-if="component === 'button'" class="flex items-center gap-4">
      <button
        type="button"
        class="preview-button"
        :class="[buttonVariantClass, buttonSizeClass, { 'opacity-75': componentProps.loading }]"
        :disabled="componentProps.disabled || componentProps.loading"
      >
        <span v-if="componentProps.loading" class="material-symbols-outlined text-base animate-spin" aria-hidden="true">progress_activity</span>
        {{ componentProps.label || 'Button' }}
      </button>
    </div>

    <!-- Card -->
    <div v-else-if="component === 'card'" class="w-full max-w-md">
      <div class="preview-card" :class="cardVariantClass">
        <h3 v-if="componentProps.title" class="text-xl font-semibold mb-2 text-ink-strong">{{ componentProps.title }}</h3>
        <p v-if="componentProps.content" class="text-sm mb-4 text-ink-secondary">{{ componentProps.content }}</p>
        <div v-if="componentProps.showActions" class="flex gap-2 mt-4">
          <UiButton variant="primary" size="sm" label="Action" />
          <UiButton size="sm" label="Cancel" />
        </div>
      </div>
    </div>

    <!-- Input -->
    <div v-else-if="component === 'input'" class="w-full max-w-md">
      <label v-if="componentProps.label" :for="controlId" class="preview-label">
        {{ componentProps.label }}<span v-if="componentProps.required" class="text-danger ml-1" aria-hidden="true">*</span>
      </label>
      <input
        :id="controlId"
        :type="componentProps.type || 'text'"
        :placeholder="componentProps.placeholder || ''"
        :required="componentProps.required"
        :disabled="componentProps.disabled"
        :aria-label="componentProps.label ? undefined : 'Preview input'"
        class="preview-control h-11"
      />
    </div>

    <!-- Select -->
    <div v-else-if="component === 'select'" class="w-full max-w-md">
      <label v-if="componentProps.label" :for="controlId" class="preview-label">
        {{ componentProps.label }}<span v-if="componentProps.required" class="text-danger ml-1" aria-hidden="true">*</span>
      </label>
      <select
        :id="controlId"
        :required="componentProps.required"
        :disabled="componentProps.disabled"
        :aria-label="componentProps.label ? undefined : 'Preview select'"
        class="preview-control h-11"
      >
        <option value="">Select an option...</option>
        <option v-for="option in optionList" :key="option" :value="option">{{ option }}</option>
      </select>
    </div>

    <!-- Checkbox -->
    <div v-else-if="component === 'checkbox'" class="flex items-center gap-2">
      <input :id="controlId" type="checkbox" :checked="componentProps.checked" :disabled="componentProps.disabled" class="preview-check" />
      <label :for="controlId" class="text-sm text-ink">{{ componentProps.label || 'Checkbox' }}</label>
    </div>

    <!-- Radio -->
    <div v-else-if="component === 'radio'" class="flex flex-col gap-2" role="radiogroup" aria-label="Preview options">
      <div v-for="(option, index) in optionList" :key="option" class="flex items-center gap-2">
        <input :id="`${controlId}-${index}`" type="radio" :name="componentProps.name || `${controlId}-group`" :value="option" class="preview-check" />
        <label :for="`${controlId}-${index}`" class="text-sm text-ink">{{ option }}</label>
      </div>
    </div>

    <!-- Textarea -->
    <div v-else-if="component === 'textarea'" class="w-full max-w-md">
      <label v-if="componentProps.label" :for="controlId" class="preview-label">
        {{ componentProps.label }}<span v-if="componentProps.required" class="text-danger ml-1" aria-hidden="true">*</span>
      </label>
      <textarea
        :id="controlId"
        :rows="componentProps.rows || 4"
        :placeholder="componentProps.placeholder || ''"
        :required="componentProps.required"
        :disabled="componentProps.disabled"
        :aria-label="componentProps.label ? undefined : 'Preview textarea'"
        class="preview-control py-2 resize-none"
      ></textarea>
    </div>

    <!-- Badge -->
    <div v-else-if="component === 'badge'" class="flex items-center gap-4">
      <span class="preview-badge" :class="[`preview-tone-${tone}`, badgeSizeClass]">{{ componentProps.label || 'Badge' }}</span>
    </div>

    <!-- Alert -->
    <div v-else-if="component === 'alert'" class="w-full max-w-md">
      <div class="preview-alert" :class="`preview-tone-${alertTone}`">
        <span class="material-symbols-outlined flex-shrink-0 mt-0.5" aria-hidden="true">{{ alertIcon }}</span>
        <div class="flex-1">
          <h4 v-if="componentProps.title" class="font-semibold mb-1">{{ componentProps.title }}</h4>
          <p class="text-sm text-ink-secondary">{{ componentProps.message || 'Alert message' }}</p>
        </div>
        <UiButton v-if="componentProps.dismissible" variant="ghost" size="sm" icon="close" icon-only label="Dismiss" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, useId } from 'vue';
import { UiButton } from './ui';

/**
 * A live preview of a design-system component (`component`: button, card,
 * input, select, checkbox, radio, textarea, badge or alert) with the given
 * `props`. Colours come from tokens, so it follows the page theme; set the
 * dark prop to render the preview in dark whatever the page theme.
 */
const props = defineProps({
  component: {
    type: String,
    required: true,
  },
  props: {
    type: Object,
    default: () => ({}),
  },
  /** Render the preview in dark (otherwise it follows the page theme) */
  // style-check: allow prop name kept for backward compatibility with callers
  isDarkMode: {
    type: Boolean,
    default: false,
  },
});

// style-check: allow reads the backward-compatible prop above
const forceDark = computed(() => props.isDarkMode);
const controlId = `preview-${useId()}`;

// Create a computed property to ensure reactivity
const componentProps = computed(() => props.props);

const optionList = computed(() =>
  String(componentProps.value.options || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
);

const buttonVariantClass = computed(
  () =>
    ({
      primary: 'preview-button-primary',
      secondary: 'preview-button-secondary',
      tertiary: 'preview-button-tertiary',
      danger: 'preview-button-danger',
    })[componentProps.value.variant] || 'preview-button-primary',
);
const buttonSizeClass = computed(() => ({ sm: 'px-4 py-1 text-sm', lg: 'px-8 py-3 text-lg' })[componentProps.value.size] || 'px-6 py-2');

const cardVariantClass = computed(
  () => ({ elevated: 'shadow-raised border border-line-faint', outlined: 'border-2 border-line' })[componentProps.value.variant] || 'border border-line',
);

const tone = computed(() => ({ success: 'success', warning: 'warning', error: 'danger', info: 'info' })[componentProps.value.variant] || 'neutral');
const badgeSizeClass = computed(() => ({ sm: 'text-xs px-2 py-0.5', lg: 'text-sm px-4 py-1.5' })[componentProps.value.size] || 'text-xs px-3 py-1');

const alertTone = computed(() => ({ success: 'success', warning: 'warning', error: 'danger' })[componentProps.value.variant] || 'info');
const alertIcon = computed(() => ({ success: 'check_circle', warning: 'warning', danger: 'error', info: 'info' })[alertTone.value]);
</script>

<style scoped>
.component-preview-dark {
  @apply text-ink;
}
.preview-button {
  @apply inline-flex items-center gap-2 rounded-pill border border-solid font-medium transition-colors;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 outline-focus;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}
.preview-button-primary {
  @apply border-transparent bg-accent text-ink-on-accent enabled:hover:bg-accent-hover;
}
.preview-button-secondary {
  @apply border-2 border-accent bg-surface-raised text-accent-text enabled:hover:bg-accent-subtle;
}
.preview-button-tertiary {
  @apply border-transparent bg-transparent text-accent-text enabled:hover:bg-accent-subtle;
}
.preview-button-danger {
  @apply border-danger-border bg-danger-bg text-danger enabled:hover:border-danger-solid;
}
.preview-card {
  @apply rounded-card p-6 bg-surface-raised;
}
.preview-label {
  @apply block mb-2 text-sm font-medium text-ink;
}
.preview-control {
  @apply w-full px-3.5 rounded-field border border-solid border-line-control bg-surface-control text-sm text-ink placeholder:text-ink-muted;
  @apply hover:border-line-control-hover focus:outline focus:outline-2 focus:outline-offset-0 outline-focus focus:border-transparent;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}
.preview-check {
  @apply w-4 h-4 accent-accent;
}
.preview-badge {
  @apply inline-flex items-center rounded-pill border font-medium;
}
.preview-alert {
  @apply flex items-start gap-3 rounded-tile border p-4;
}
.preview-tone-neutral {
  @apply border-line bg-fill-subtle text-ink-secondary;
}
.preview-tone-success {
  @apply border-success-border bg-success-bg text-success;
}
.preview-tone-warning {
  @apply border-warning-border bg-warning-bg text-warning;
}
.preview-tone-danger {
  @apply border-danger-border bg-danger-bg text-danger;
}
.preview-tone-info {
  @apply border-info-border bg-info-bg text-info;
}
</style>
