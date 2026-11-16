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
      <input ref="input" type="file" class="sr-only" tabindex="-1" aria-hidden="true" :accept="accept" :multiple="multiple" @change="onChange" />

      <div v-if="file" class="ui-drop-file">
        <AppIcon name="file-pen" class="ui-drop-file-icon" />
        <div class="min-w-0 flex-1 text-left">
          <p class="ui-drop-file-name">{{ file.name }}</p>
          <p v-if="file.size !== undefined" class="ui-drop-file-size">{{ formatSize(file.size) }}</p>
        </div>
        <UiButton icon-only icon="x" variant="ghost" size="sm" :label="`Remove ${file.name}`" @click="remove" />
      </div>

      <template v-else>
        <AppIcon :name="icon" class="ui-drop-icon" />
        <p class="ui-drop-prompt">{{ prompt }}</p>
      </template>

      <UiButton ref="chooseButton" size="sm" icon="file-up" :label="file ? 'Choose another file' : buttonLabel" @click="open" />
      <!-- Always present, so a chosen or removed file is announced -->
      <p class="sr-only" aria-live="polite">{{ announcement }}</p>
    </div>
  </UiField>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue';
import UiButton from './UiButton.vue';
import UiField from './UiField.vue';

/**
 * A file drop zone with a "Choose file" button (the keyboard path) and the
 * chosen file's name, size and a remove button. The parent owns the file:
 * pass it as `file` and handle `select` (a File) and `remove`. Validation
 * stays in the parent; show problems with `error` or an InlineNotice.
 * `hint` lists what's accepted ("PDF or PNG, up to 50MB"). Call `reset()`
 * (via a ref) to clear the native input so the same file can be picked again.
 * With `multiple`, several files can be chosen or dropped at once: `select`
 * fires once per file and the parent lists them (leave `file` null).
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
  /** Lucide icon name (components/ui/icons.js) shown above the prompt */
  icon: { type: String, default: 'cloud-upload' },
  multiple: { type: Boolean, default: false },
});

const emit = defineEmits(['select', 'remove']);

const input = ref(null);
const dragging = ref(false);

const open = () => input.value?.click();
const reset = () => {
  if (input.value) input.value.value = '';
};

const onChange = (event) => {
  dragging.value = false;
  emitFiles(event.target.files);
  reset();
};

const onDrop = (event) => {
  dragging.value = false;
  emitFiles(event.dataTransfer?.files);
};

const emitFiles = (list) => {
  const files = Array.from(list ?? []);
  (props.multiple ? files : files.slice(0, 1)).forEach((file) => emit('select', file));
};

const onLeave = (event) => {
  if (!event.currentTarget.contains(event.relatedTarget)) dragging.value = false;
};

// Removing unmounts the Remove button, so focus goes to the choose button
const chooseButton = ref(null);
const remove = async () => {
  const name = props.file?.name;
  reset();
  emit('remove');
  announcement.value = name ? `${name} removed` : 'File removed';
  await nextTick();
  chooseButton.value?.$el?.focus();
};

const announcement = ref('');
watch(
  () => props.file?.name,
  (name) => {
    if (name) announcement.value = `${name} selected`;
  },
);

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
