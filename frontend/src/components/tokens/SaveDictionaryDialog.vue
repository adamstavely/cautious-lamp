<template>
  <UiDialog :open="open" title="Save to style library" @update:open="emit('update:open', $event)">
    <form :id="formId" class="flex flex-col gap-5" @submit.prevent="submit">
      <InlineNotice :notice="error ? { type: 'error', message: error } : null" @dismiss="error = ''" />
      <UiInput v-model="name" label="Dictionary name" required :error="nameError" placeholder="e.g. Brand tokens" />
      <UiTextarea v-model="description" label="Description" :rows="3" placeholder="What these tokens are for" />

      <UiCallout v-if="updating" tone="info">
        Saving updates <strong>{{ dictionary.name }}</strong> in {{ library.workspaceName(dictionary.workspaceId) ?? 'its workspace' }}.
      </UiCallout>
      <template v-else>
        <UiCallout v-if="dictionary" tone="info">
          You can't change <strong>{{ dictionary.name }}</strong>, so this saves a new copy.
        </UiCallout>
        <UiSelect
          v-if="workspaceOptions.length"
          v-model="workspaceId"
          label="Workspace"
          hint="The style library shows dictionaries from every workspace you can read."
          :options="workspaceOptions"
          required
        />
        <UiCallout v-else tone="warning">
          {{ library.loading.value ? 'Loading your workspaces…' : 'You need editor access to a workspace to save a style dictionary. Ask a workspace owner to add you.' }}
        </UiCallout>
      </template>

      <p class="text-sm text-ink-secondary">{{ tokens.length }} token{{ tokens.length === 1 ? '' : 's' }} will be saved.</p>
    </form>
    <template #footer>
      <UiButton :disabled="saving" @click="emit('update:open', false)">Cancel</UiButton>
      <UiButton variant="primary" type="submit" :form="formId" :loading="saving" :disabled="!canSubmit">
        {{ updating ? 'Save changes' : 'Save to library' }}
      </UiButton>
    </template>
  </UiDialog>
</template>

<script setup>
import { computed, ref, useId, watch } from 'vue';
import InlineNotice from '../InlineNotice.vue';
import { UiButton, UiCallout, UiDialog, UiInput, UiSelect, UiTextarea } from '../ui';
import { tokensToDtcg } from '../../utils/styleDictionary.js';

/**
 * Saves the editor's tokens as a workspace style dictionary
 * (`style-dictionaries`). A dictionary opened from the library is updated in
 * place when the user can edit it; otherwise a new one is created in the
 * workspace they pick. Emits `saved` with the stored dictionary.
 */
const props = defineProps({
  open: { type: Boolean, default: false },
  /** Flat editor tokens ({ name, category, $type, $value, $description }) */
  tokens: { type: Array, required: true },
  /** The dictionary the editor opened from the library, or null */
  dictionary: { type: Object, default: null },
  /** useResourceLibrary('style-dictionaries') */
  library: { type: Object, required: true },
  /** Tags for a new dictionary */
  tags: { type: Array, default: () => [] },
});
const emit = defineEmits(['update:open', 'saved']);

const formId = useId();
const name = ref('');
const description = ref('');
const workspaceId = ref('');
const nameError = ref('');
const error = ref('');
const saving = ref(false);

const updating = computed(() => !!props.dictionary && props.library.canEdit(props.dictionary));
const workspaceOptions = computed(() => props.library.editableWorkspaces.value.map((ws) => ({ value: ws.id, label: ws.name })));
const canSubmit = computed(() => props.tokens.length > 0 && (updating.value || !!workspaceId.value));

watch(
  () => props.open,
  (open) => {
    if (!open) return;
    name.value = props.dictionary?.name ?? name.value;
    description.value = props.dictionary?.description ?? description.value;
    nameError.value = '';
    error.value = '';
    if (!workspaceOptions.value.some((option) => option.value === workspaceId.value)) {
      workspaceId.value = workspaceOptions.value[0]?.value ?? '';
    }
  },
);

const submit = async () => {
  nameError.value = name.value.trim() ? '' : 'Give the dictionary a name';
  if (nameError.value || !canSubmit.value) return;
  saving.value = true;
  error.value = '';
  const fields = { name: name.value.trim(), description: description.value.trim(), tokens: tokensToDtcg(props.tokens) };
  try {
    const saved = updating.value
      ? await props.library.update(props.dictionary, fields)
      : await props.library.create(workspaceId.value, { ...fields, format: 'json', tags: props.tags });
    emit('saved', saved, { created: !updating.value });
    emit('update:open', false);
  } catch (err) {
    error.value = err.message;
  } finally {
    saving.value = false;
  }
};
</script>
