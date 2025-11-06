<template>
  <v-dialog v-model="dialog" max-width="600" persistent>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <span class="text-gray-900 dark:text-gray-100">Edit Team</span>
        <button @click="close" class="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </v-card-title>
      
      <v-divider />
      
      <v-card-text class="pt-6">
        <v-form @submit.prevent="submit">
          <v-text-field
            v-model="teamName"
            label="Team Name"
            variant="outlined"
            required
            class="mb-4"
          />
          
          <v-textarea
            v-model="teamDescription"
            label="Description"
            variant="outlined"
            rows="3"
            class="mb-4"
          />
          
          <div class="d-flex justify-end ga-2">
            <v-btn variant="text" @click="close">Cancel</v-btn>
            <v-btn color="primary" type="submit" :disabled="!teamName.trim()">
              Save Changes
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import axios from 'axios';
import { mockAPI, isMockMode } from '../../mockData.js';

const props = defineProps({
  modelValue: Boolean,
  team: Object
});

const emit = defineEmits(['update:modelValue', 'team-updated']);

const dialog = ref(false);
const teamName = ref('');
const teamDescription = ref('');

watch(() => props.modelValue, (val) => {
  dialog.value = val;
  if (val && props.team) {
    teamName.value = props.team.name || '';
    teamDescription.value = props.team.description || '';
  }
});

watch(dialog, (val) => {
  emit('update:modelValue', val);
});

const close = () => {
  dialog.value = false;
  teamName.value = '';
  teamDescription.value = '';
};

const submit = async () => {
  if (!teamName.value.trim() || !props.team) return;
  
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      await mockAPI.updateTeam(props.team.id, {
        name: teamName.value.trim(),
        description: teamDescription.value.trim()
      });
    } else {
      await axios.patch(`/teams/${props.team.id}`, {
        name: teamName.value.trim(),
        description: teamDescription.value.trim()
      });
    }
    close();
    emit('team-updated');
  } catch (error) {
    console.error('Failed to update team:', error);
  }
};
</script>

