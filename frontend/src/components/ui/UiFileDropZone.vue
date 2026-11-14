<template>
  <UiField :label="label" :hint="hint" :error="error" group v-slot="{ labelId, describedBy }">
    <div
      class="ui-drop"
      :class="{ 'ui-drop-active': dragging, 'ui-drop-filled': file }"
      role="group"
      :aria-labelledby="label ? labelId : undefined"
      :aria-describedby="describedBy"
      @dragenter.prevent="dragging = true"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="onLeave"
      @drop.prevent="onDrop"
    >
      <input ref="input" type="file" class="sr-only" tabindex="-1" aria-hidden="true" :accept="accept" @change="onChange" />

      <div v-if="file" class="ui-drop-file">
        <span class="material-symbols-outlined ui-drop-file-icon" aria-hidden="true">draft</span>
        <div class="min-w-0 flex-1 text-left">
          <p class="ui-drop-file-name">{{ file.name }}</p>
          <p v-if="file.size !== undefined" class="ui-drop-file-size">{{ formatSize(file.size) }}</p>
        </div>
        <UiButton icon-only icon="close" variant="ghost" size="sm" :label="`Remove ${file.name}`" @click="remove" />
      </div>

      <template v-else>
        <span class="material-symbols-outlined ui-drop-icon" aria-hidden="true">{{ icon }}</span>
        <p class="ui-drop-prompt">{{ prompt }}</p>
      </template>

      <UiButton size="sm" icon="upload_file" :label="file ? 'Choose another file' : buttonLabel" @click="open" />
    </div>
  </UiField>
</template>

<script setup>
import { ref } from 'vue';
import UiButton from './UiButton.vue';
import UiField from './UiField.vue';

/**
 * A file drop zone with a "Choose file" button (the keyboard path) and the
 * chosen file's name, size and a remove button. The parent owns the file:
 * pass it as `file` and handle `select` (a File) and `remove`. Validation
 * stays in the parent; show problems with `error` or an InlineNotice.
 * `hint` lists what's accepted ("PDF or PNG, up to 50MB"). Call `reset()`
 * (via a ref) to clear the native input so the same file can be picked again.
 */
const props = defineProps({
  /** The chosen file (a File, or anything with name and size), or null */
  file: { type: Object, default: null },
  /** The native accept attribute, e.g. "image/*,.pdf" */
  accept: { type: String, default: '' },
  label: { type: String, default: '' },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
  prompt: { type: String, default: 'Drop a file here, or choose one.' },
  buttonLabel: { type: String, default: 'Choose file' },
  /** Material Symbols name shown above the prompt */
  icon: { type: String, default: 'cloud_upload' },
});

const emit = defineEmits(['select', 'remove']);

const input = ref(null);
const dragging = ref(false);

const open = () => input.value?.click();
const reset = () => {
  if (input.value) input.value.value = '';
};

const onChange = (event) => {
  const chosen = event.target.files?.[0];
  dragging.value = false;
  if (chosen) emit('select', chosen);
  reset();
};

const onDrop = (event) => {
  dragging.value = false;
  const dropped = event.dataTransfer?.files?.[0];
  if (dropped) emit('select', dropped);
};

const onLeave = (event) => {
  if (!event.currentTarget.contains(event.relatedTarget)) dragging.value = false;
};

const remove = () => {
  reset();
  emit('remove');
};

const formatSize = (bytes) => {
  if (!bytes) return '0 bytes';
  const units = ['bytes', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${Math.round((bytes / 1024 ** i) * 100) / 100} ${units[i]}`;
};

defineExpose({ reset, open });
</script>

<style scoped>
.ui-drop {
  @apply flex flex-col items-center gap-3 rounded-tile border-2 border-dashed border-line-control bg-surface-sunken px-6 py-8 text-center transition-colors;
}
.ui-drop-active {
  @apply border-accent-highlight bg-accent-subtle;
}
.ui-drop-filled {
  @apply border-solid border-line;
}
.ui-drop-icon {
  @apply text-4xl text-accent-text;
}
.ui-drop-prompt {
  @apply text-sm text-ink-secondary;
}
.ui-drop-file {
  @apply flex w-full items-center gap-3 rounded-field border border-line bg-surface-raised px-4 py-3;
}
.ui-drop-file-icon {
  @apply text-2xl text-accent-text;
}
.ui-drop-file-name {
  @apply truncate text-sm font-medium text-ink-strong;
}
.ui-drop-file-size {
  @apply text-xs text-ink-muted;
}
</style>
