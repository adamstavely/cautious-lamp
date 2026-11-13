<template>
  <div>
    <label :for="inputId" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{{ label }}</label>
    <div class="flex flex-wrap items-stretch gap-2">
      <div class="relative min-w-0 flex-1">
        <input
          :id="inputId"
          :value="modelValue"
          :type="visible ? 'text' : 'password'"
          autocomplete="new-password"
          :readonly="readonly"
          spellcheck="false"
          :aria-invalid="error ? 'true' : 'false'"
          :aria-describedby="`${inputId}-hint${error ? ` ${inputId}-error` : ''}`"
          class="w-full rounded-lg border border-solid px-3 py-2 pr-10 font-mono text-sm bg-[#fff] text-gray-900 dark:bg-slate-700 dark:text-white"
          :class="error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'"
          @input="emit('update:modelValue', $event.target.value)"
        />
        <button
          type="button"
          class="absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          :aria-label="visible ? 'Hide password' : 'Show password'"
          :aria-pressed="visible ? 'true' : 'false'"
          @click="visible = !visible"
        >
          <span class="material-symbols-outlined text-lg" aria-hidden="true">{{ visible ? 'visibility_off' : 'visibility' }}</span>
        </button>
      </div>
      <button
        v-if="!readonly"
        type="button"
        class="inline-flex items-center gap-1 rounded-lg border border-solid border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-slate-700"
        @click="generate"
      >
        <span class="material-symbols-outlined text-base" aria-hidden="true">casino</span>
        Generate
      </button>
      <button
        type="button"
        class="inline-flex items-center gap-1 rounded-lg border border-solid border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-slate-700"
        :disabled="!modelValue"
        @click="copy"
      >
        <span class="material-symbols-outlined text-base" aria-hidden="true">content_copy</span>
        Copy
      </button>
    </div>
    <p :id="`${inputId}-hint`" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
      <template v-if="readonly">They'll have to choose a new password when they next sign in.</template>
      <template v-else>At least {{ MIN_PASSWORD_LENGTH }} characters. They'll have to choose a new one when they next sign in.</template>
    </p>
    <p v-if="error" :id="`${inputId}-error`" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ error }}</p>
    <p class="sr-only" role="status" aria-live="polite">{{ copyStatus }}</p>
    <p v-if="copyStatus" class="mt-1 text-xs text-gray-600 dark:text-gray-400" aria-hidden="true">{{ copyStatus }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { MIN_PASSWORD_LENGTH, copyText, generatePassword } from '../../composables/useAccessAdmin.js';

const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: 'Temporary password' },
  error: { type: String, default: '' },
  /** Show and copy only (after the password was set) */
  readonly: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue']);

const inputId = `temp-password-${Math.random().toString(36).slice(2, 10)}`;
const visible = ref(false);
const copyStatus = ref('');

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
