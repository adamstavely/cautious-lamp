<template>
  <WorkspaceModal :open="open" :title="item ? `Edit ${spec.singular}` : `Add ${spec.singular}`" :busy="saving" size="md" @close="emit('close')">
    <form :id="formId" class="flex flex-col gap-5" @submit.prevent="submit">
      <InlineNotice :notice="error ? { type: 'error', message: error } : null" @dismiss="error = null" />
      <!-- e.g. the workspace a new item goes into -->
      <slot />
      <template v-for="field in spec.fields" :key="field.key">
        <UiSelect
          v-if="field.type === 'select'"
          v-model="values[field.key]"
          :label="field.label"
          :required="field.required"
          :options="field.required ? field.options : [{ value: '', label: '—' }, ...field.options]"
        />
        <UiTextarea
          v-else-if="['textarea', 'json', 'svg', 'markdown', 'stages'].includes(field.type)"
          v-model="values[field.key]"
          :label="field.label"
          :required="field.required"
          :rows="field.type === 'textarea' ? 3 : 6"
          :placeholder="field.placeholder"
          :mono="field.type === 'json' || field.type === 'svg'"
        />
        <UiInput
          v-else
          v-model="values[field.key]"
          :label="field.label"
          :type="field.type === 'url' ? 'url' : field.type === 'number' ? 'number' : 'text'"
          :required="field.required"
          :placeholder="field.placeholder"
        />
      </template>
    </form>
    <template #footer>
      <UiButton :disabled="saving" @click="emit('close')">Cancel</UiButton>
      <UiButton variant="primary" type="submit" :form="formId" :loading="saving">
        {{ saving ? 'Saving…' : item ? 'Save' : `Add ${spec.singular}` }}
      </UiButton>
    </template>
  </WorkspaceModal>
</template>

<script setup>
import { ref, useId, watch } from 'vue';
import InlineNotice from '../InlineNotice.vue';
import { UiButton, UiInput, UiSelect, UiTextarea } from '../ui';
import WorkspaceModal from './WorkspaceModal.vue';
import { bodyFromForm, formValuesFor } from './resourceKinds.js';

/**
 * Add or edit one workspace item of a kind (resourceKinds.js). `save(body)`
 * makes the request; for an edit the body holds only the changed fields, and
 * an edit with no changes just closes. Emits `saved` with save's result.
 */
const props = defineProps({
  open: { type: Boolean, default: false },
  /** The kind (resourceKinds.js) */
  spec: { type: Object, required: true },
  /** The item being edited, or null to add one */
  item: { type: Object, default: null },
  /** async (body) => result; throws an Error with a readable message */
  save: { type: Function, required: true },
});
const emit = defineEmits(['close', 'saved']);

const formId = `resource-form-${useId()}`;
const values = ref({});
const saving = ref(false);
const error = ref(null);

watch(
  () => props.open,
  (open) => {
    if (!open) return;
    values.value = formValuesFor(props.spec, props.item);
    saving.value = false;
    error.value = null;
  },
  { immediate: true },
);

const submit = async () => {
  let body;
  try {
    body = bodyFromForm(props.spec, values.value, props.item);
  } catch (err) {
    error.value = err.message;
    return;
  }
  if (props.item && Object.keys(body).length === 0) {
    emit('close');
    return;
  }
  saving.value = true;
  error.value = null;
  try {
    const result = await props.save(body);
    emit('saved', result);
  } catch (err) {
    error.value = err.message;
  } finally {
    saving.value = false;
  }
};
</script>
