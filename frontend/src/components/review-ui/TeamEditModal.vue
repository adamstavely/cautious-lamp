<template>
  <UiDialog :open="modelValue" title="Edit team" @update:open="emit('update:modelValue', $event)">
    <form :id="formId" class="flex flex-col gap-5" @submit.prevent="submit">
      <UiInput v-model="teamName" label="Team name" required autofocus />
      <UiTextarea v-model="teamDescription" label="Description" :rows="3" />
      <InlineNotice :notice="notice" @dismiss="clearNotice" />
    </form>
    <template #footer>
      <UiButton variant="ghost" @click="close">Cancel</UiButton>
      <UiButton variant="primary" type="submit" :form="formId" :disabled="!teamName.trim()" :loading="saving">Save changes</UiButton>
    </template>
  </UiDialog>
</template>

<script setup>
import { ref, useId, watch } from 'vue';
import { teamsAPI, apiErrorMessage } from '../../services/api.js';
import { useNotice } from '../../composables/useNotice.js';
import InlineNotice from '../InlineNotice.vue';
import { UiButton, UiDialog, UiInput, UiTextarea } from '../ui';

const props = defineProps({
  modelValue: Boolean,
  team: Object
});

const emit = defineEmits(['update:modelValue', 'team-updated']);

const formId = `team-edit-${useId()}`;
const teamName = ref('');
const teamDescription = ref('');
const saving = ref(false);
const { notice, showNotice, clearNotice } = useNotice();

watch(() => props.modelValue, (val) => {
  if (val && props.team) {
    teamName.value = props.team.name || '';
    teamDescription.value = props.team.description || '';
    clearNotice();
  }
});

const close = () => {
  emit('update:modelValue', false);
  teamName.value = '';
  teamDescription.value = '';
};

const submit = async () => {
  if (!teamName.value.trim() || !props.team || saving.value) return;

  saving.value = true;
  try {
    await teamsAPI.updateTeam(props.team.id, {
      name: teamName.value.trim(),
      description: teamDescription.value.trim()
    });
    close();
    emit('team-updated');
  } catch (error) {
    console.error('Failed to update team:', error);
    showNotice(apiErrorMessage(error, 'Failed to update the team.'), 'error');
  } finally {
    saving.value = false;
  }
};
</script>
