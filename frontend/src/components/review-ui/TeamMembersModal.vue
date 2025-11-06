<template>
  <v-dialog v-model="dialog" max-width="700" persistent>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <span class="text-gray-900 dark:text-gray-100">Manage Team Members</span>
        <button @click="close" class="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </v-card-title>
      
      <v-divider />
      
      <v-card-text class="pt-6">
        <!-- Add Member Form -->
        <div class="mb-6">
          <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Add Member</h3>
          <v-form @submit.prevent="addMember">
            <div class="d-flex flex-column ga-3">
              <div class="d-flex ga-2">
                <v-text-field
                  v-model="newMemberEmail"
                  label="Email Address"
                  type="email"
                  variant="outlined"
                  placeholder="member@example.com"
                  required
                  class="flex-1"
                />
                <v-text-field
                  v-model="newMemberName"
                  label="Name (optional)"
                  variant="outlined"
                  placeholder="John Doe"
                  class="flex-1"
                />
              </div>
              <div class="d-flex ga-2">
                <v-select
                  v-model="newMemberRole"
                  label="Role"
                  variant="outlined"
                  :items="roleOptions"
                  required
                  class="flex-1"
                />
                <v-btn color="primary" type="submit" :disabled="!newMemberEmail.trim()" class="align-self-end">
                  Add
                </v-btn>
              </div>
            </div>
          </v-form>
        </div>
        
        <!-- Members List -->
        <div>
          <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Members ({{ team?.members?.length || 0 }})
          </h3>
          <v-list v-if="team?.members?.length > 0">
            <v-list-item
              v-for="member in team.members"
              :key="member.email"
              class="px-0"
            >
              <template #prepend>
                <v-avatar color="indigo" size="40">
                  <span class="text-white">{{ getInitials(member.name || member.email) }}</span>
                </v-avatar>
              </template>
              
              <v-list-item-title>
                <div class="d-flex align-center ga-2 flex-wrap">
                  <span class="text-gray-900 dark:text-gray-100">{{ member.name || member.email }}</span>
                  <v-chip
                    :color="getRoleColor(member.role)"
                    size="small"
                    class="font-medium"
                  >
                    {{ member.role || 'Designer' }}
                  </v-chip>
                </div>
              </v-list-item-title>
              <v-list-item-subtitle class="text-gray-600 dark:text-gray-300">
                {{ member.email }}
              </v-list-item-subtitle>
              
              <template #append>
                <div class="d-flex align-center ga-2">
                  <v-select
                    v-model="member.role"
                    :items="roleOptions"
                    variant="outlined"
                    density="compact"
                    hide-details
                    style="min-width: 140px;"
                    @update:model-value="updateMemberRole(member.email, member.role)"
                  />
                  <v-btn
                    icon="mdi-delete"
                    variant="text"
                    size="small"
                    @click="removeMember(member.email)"
                    color="error"
                  />
                </div>
              </template>
            </v-list-item>
          </v-list>
          <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
            No members yet. Add members using the form above.
          </div>
        </div>
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

const emit = defineEmits(['update:modelValue', 'members-updated']);

const dialog = ref(false);
const newMemberEmail = ref('');
const newMemberName = ref('');
const newMemberRole = ref('Designer');
const roleOptions = ['Designer', 'Art Director'];

watch(() => props.modelValue, (val) => {
  dialog.value = val;
  if (val) {
    newMemberEmail.value = '';
    newMemberName.value = '';
    newMemberRole.value = 'Designer';
  }
});

watch(dialog, (val) => {
  emit('update:modelValue', val);
});

const close = () => {
  dialog.value = false;
};

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name[0].toUpperCase();
};

const getRoleColor = (role) => {
  if (role === 'Art Director') {
    return 'purple';
  }
  return 'indigo';
};

const updateMemberRole = async (email, newRole) => {
  if (!props.team) return;
  
  try {
    const useMockMode = await isMockMode();
    const team = useMockMode 
      ? (await mockAPI.getTeams()).find(t => t.id === props.team.id)
      : (await axios.get(`/teams/${props.team.id}`)).data;
    
    const member = team.members.find(m => m.email === email);
    if (member) {
      member.role = newRole;
      
      if (useMockMode) {
        await mockAPI.updateTeam(props.team.id, { members: team.members });
      } else {
        await axios.patch(`/teams/${props.team.id}/members/${encodeURIComponent(email)}`, {
          role: newRole
        });
      }
      
      emit('members-updated');
    }
  } catch (error) {
    console.error('Failed to update member role:', error);
  }
};

const addMember = async () => {
  if (!newMemberEmail.value.trim() || !props.team) return;
  
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      await mockAPI.addTeamMember(props.team.id, {
        email: newMemberEmail.value.trim(),
        name: newMemberName.value.trim() || null,
        role: newMemberRole.value || 'Designer'
      });
    } else {
      await axios.post(`/teams/${props.team.id}/members`, {
        email: newMemberEmail.value.trim(),
        name: newMemberName.value.trim() || null,
        role: newMemberRole.value || 'Designer'
      });
    }
    newMemberEmail.value = '';
    newMemberName.value = '';
    newMemberRole.value = 'Designer';
    emit('members-updated');
  } catch (error) {
    console.error('Failed to add member:', error);
  }
};

const removeMember = async (email) => {
  if (!props.team) return;
  
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      await mockAPI.removeTeamMember(props.team.id, email);
    } else {
      await axios.delete(`/teams/${props.team.id}/members/${encodeURIComponent(email)}`);
    }
    emit('members-updated');
  } catch (error) {
    console.error('Failed to remove member:', error);
  }
};
</script>

