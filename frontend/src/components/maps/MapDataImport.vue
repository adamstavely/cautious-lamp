<template>
  <div class="flex flex-col gap-4">
    <UiTextarea
      v-model="text"
      :label="label"
      :hint="hint"
      :rows="8"
      mono
      spellcheck="false"
      :placeholder="placeholder"
    />
    <UiFileDropZone
      :file="file"
      accept=".csv,.tsv,.txt,text/csv,text/tab-separated-values,text/plain"
      hint="CSV or TSV, up to 5MB. The file is imported as soon as you choose it."
      prompt="Drop a CSV or TSV file here, or choose one."
      :error="fileError"
      @select="onFile"
      @remove="file = null"
    />
    <div class="flex flex-wrap gap-2">
      <UiButton variant="primary" icon="upload" :disabled="!text.trim()" @click="$emit('import', text)">Import</UiButton>
      <UiButton icon="flask-conical" @click="$emit('sample')">Load sample data</UiButton>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { UiButton, UiFileDropZone, UiTextarea } from '../ui';

/**
 * Paste or upload a table for Map Maker. Emits `import` with the text (on
 * the Import button, or straight away for an uploaded file) and `sample`
 * for the sample data. `modelText` lets the parent show the CSV it just
 * loaded (a sample) in the box.
 */
const props = defineProps({
  label: { type: String, required: true },
  hint: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  /** Text to show in the box; replaced whenever it changes */
  modelText: { type: String, default: '' },
});

const emit = defineEmits(['import', 'sample']);

const MAX_BYTES = 5 * 1024 * 1024;
const text = ref(props.modelText);
const file = ref(null);
const fileError = ref('');

watch(() => props.modelText, (value) => {
  text.value = value;
});

const onFile = async (chosen) => {
  fileError.value = '';
  if (chosen.size > MAX_BYTES) {
    fileError.value = `${chosen.name} is larger than 5MB.`;
    return;
  }
  try {
    file.value = chosen;
    text.value = await chosen.text();
    emit('import', text.value);
  } catch (err) {
    fileError.value = `Could not read ${chosen.name}: ${err.message || 'unknown error'}`;
    file.value = null;
  }
};
</script>
