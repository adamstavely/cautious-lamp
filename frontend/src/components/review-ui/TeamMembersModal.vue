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
        <InlineNotice :notice="notice" class="mb-4" @dismiss="clearNotice" />
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
                <v-btn color="primary" type="submit" :disabled="!newMemberEmail.trim() || busy" :loading="busy" class="align-self-end">
                  Add
                </v-btn>
              </div>
            </div>
          </v-form>
        </div>
        
        <!-- Members List -->
        <div>
          <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Members ({{ members.length }})
          </h3>
          <v-list v-if="members.length > 0">
            <v-list-item
              v-for="member in members"
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
                    :model-value="member.role"
                    :items="roleOptions"
                    variant="outlined"
                    density="compact"
                    hide-details
                    :disabled="busy"
                    style="min-width: 140px;"
                    @update:model-value="updateMemberRole(member.email, $event)"
                  />
                  <v-btn
                    icon="mdi-delete"
                    variant="text"
                    size="small"
                    :disabled="busy"
                    :aria-label="`Remove ${member.name || member.email}`"
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
import { ref, computed, watch } from 'vue';
import { teamsAPI, apiErrorMessage } from '../../services/api.js';
import { useNotice } from '../../composables/useNotice.js';
import InlineNotice from '../InlineNotice.vue';

const props = defineProps({
  modelValue: Boolean,
  team: Object
});

// members-updated: (team) after each change; the dialog stays open
const emit = defineEmits(['update:modelValue', 'members-updated']);

const dialog = ref(false);
const newMemberEmail = ref('');
const newMemberName = ref('');
const newMemberRole = ref('Designer');
const roleOptions = ['Designer', 'Art Director'];
const busy = ref(false);
// Local copy of the team, replaced by each API response (never mutate the prop)
const currentTeam = ref(null);
const members = computed(() => currentTeam.value?.members || []);
const { notice, showNotice, clearNotice } = useNotice();

watch(() => props.modelValue, (val) => {
  dialog.value = val;
  if (val) {
    currentTeam.value = props.team ? JSON.parse(JSON.stringify(props.team)) : null;
    newMemberEmail.value = '';
    newMemberName.value = '';
    newMemberRole.value = 'Designer';
    clearNotice();
  }
});

watch(dialog, (val) => {
  emit('update:modelValue', val);
});

const close = () => {
  dialog.value = false;
};

const getInitials = (name) => {
  if (!name || !name.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
};

const getRoleColor = (role) => {
  if (role === 'Art Director') {
    return 'purple';
  }
  return 'indigo';
};

/** Run a team change, keep the returned team, and report failures inline. */
const change = async (action, failure, success) => {
  if (!currentTeam.value || busy.value) return false;
  busy.value = true;
  clearNotice();
  try {
    const team = await action(currentTeam.value.id);
    if (team && team.members) currentTeam.value = team;
    emit('members-updated', currentTeam.value);
    if (success) showNotice(success, 'success');
    return true;
  } catch (error) {
    console.error(failure, error);
    showNotice(apiErrorMessage(error, failure), 'error');
    return false;
  } finally {
    busy.value = false;
  }
};

const updateMemberRole = (email, newRole) =>
  change((teamId) => teamsAPI.updateMemberRole(teamId, email, newRole), 'Failed to change the role.', 'Role updated.');

const addMember = async () => {
  const email = newMemberEmail.value.trim();
  if (!email) return;
  const added = await change(
    (teamId) => teamsAPI.addMember(teamId, email, newMemberName.value.trim() || email, newMemberRole.value || 'Designer'),
    'Failed to add the member.',
    'Member added.'
  );
  if (added) {
    newMemberEmail.value = '';
    newMemberName.value = '';
    newMemberRole.value = 'Designer';
  }
};

const removeMember = (email) =>
  change((teamId) => teamsAPI.removeMember(teamId, email), 'Failed to remove the member.', 'Member removed.');
</script>

