<template>
  <UiField :label="label" :hint="hint" :error="error" v-slot="{ id, describedBy, invalid }">
    <div class="flex flex-wrap items-center gap-2">
      <div class="relative min-w-0 flex-1">
        <input
          :id="id"
          :value="modelValue"
          :type="visible ? 'text' : 'password'"
          autocomplete="new-password"
          :readonly="readonly"
          spellcheck="false"
          :aria-invalid="invalid ? 'true' : 'false'"
          :aria-describedby="describedBy"
          class="temp-password-input"
          @input="emit('update:modelValue', $event.target.value)"
        />
        <UiButton
          class="temp-password-toggle"
          variant="ghost"
          size="sm"
          icon-only
          :icon="visible ? 'visibility_off' : 'visibility'"
          :label="visible ? 'Hide password' : 'Show password'"
          :aria-pressed="visible ? 'true' : 'false'"
          @click="visible = !visible"
        />
      </div>
      <UiButton v-if="!readonly" icon="casino" @click="generate">Generate</UiButton>
      <UiButton icon="content_copy" :disabled="!modelValue" @click="copy">Copy</UiButton>
    </div>
    <p class="sr-only" role="status" aria-live="polite">{{ copyStatus }}</p>
    <p v-if="copyStatus" class="text-xs text-ink-secondary" aria-hidden="true">{{ copyStatus }}</p>
  </UiField>
</template>

<script setup>
import { computed, ref } from 'vue';
import UiButton from '../ui/UiButton.vue';
import UiField from '../ui/UiField.vue';
import { MIN_PASSWORD_LENGTH, copyText, generatePassword } from '../../composables/useAccessAdmin.js';

const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: 'Temporary password' },
  error: { type: String, default: '' },
  /** Show and copy only (after the password was set) */
  readonly: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue']);

const visible = ref(false);
const copyStatus = ref('');

const hint = computed(() =>
  props.readonly
    ? "They'll have to choose a new password when they next sign in."
    : `At least ${MIN_PASSWORD_LENGTH} characters. They'll have to choose a new one when they next sign in.`
);

const generate = () => {
  emit('update:modelValue', generatePassword());
  visible.value = true;
  copyStatus.value = '';
};

const copy = async () => {
  copyStatus.value = (await copyText(props.modelValue))
    ? 'Password copied to the clipboard.'
    : "Couldn't copy. Select the password and copy it yourself.";
  if (!visible.value) visible.value = true;
};
</script>

<style scoped>
.temp-password-input {
  @apply w-full h-11 pl-3.5 pr-11 rounded-field border border-solid border-line-control bg-surface-control font-code text-sm text-ink;
  @apply hover:border-line-control-hover focus:outline focus:outline-2 focus:outline-offset-0 outline-focus focus:border-transparent;
}
.temp-password-input[aria-invalid='true'] {
  @apply border-danger-solid;
}
.temp-password-toggle {
  @apply absolute right-1.5 top-1/2 -translate-y-1/2;
}
</style>
