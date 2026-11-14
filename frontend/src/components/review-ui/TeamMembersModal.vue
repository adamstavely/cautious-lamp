<template>
  <UiDialog :open="modelValue" title="Manage team members" size="lg" @update:open="emit('update:modelValue', $event)">
    <InlineNotice :notice="notice" @dismiss="clearNotice" />

    <section aria-labelledby="add-member-heading" class="flex flex-col gap-4">
      <h3 id="add-member-heading" class="text-sm font-semibold text-ink-strong">Add member</h3>
      <form class="grid sm:grid-cols-2 gap-4 items-end" @submit.prevent="addMember">
        <UiInput v-model="newMemberEmail" label="Email address" type="email" placeholder="member@example.com" required autocomplete="off" />
        <UiInput v-model="newMemberName" label="Name (optional)" placeholder="John Doe" autocomplete="off" />
        <UiSelect v-model="newMemberRole" label="Role" :options="roleOptions" required />
        <div>
          <UiButton variant="primary" type="submit" icon="person_add" :disabled="!newMemberEmail.trim() || busy" :loading="busy">Add</UiButton>
        </div>
      </form>
    </section>

    <section aria-labelledby="members-heading" class="flex flex-col gap-3">
      <h3 id="members-heading" class="text-sm font-semibold text-ink-strong">Members ({{ members.length }})</h3>
      <ul v-if="members.length > 0" class="member-list">
        <li v-for="member in members" :key="member.email" class="member-row">
          <span class="member-avatar" aria-hidden="true">{{ getInitials(member.name || member.email) }}</span>
          <div class="min-w-0 flex-1">
            <p class="flex flex-wrap items-center gap-2">
              <span class="font-medium text-ink-strong">{{ member.name || member.email }}</span>
              <UiChip :tone="member.role === 'Art Director' ? 'info' : 'accent'">{{ member.role || 'Designer' }}</UiChip>
            </p>
            <p class="text-xs text-ink-muted truncate">{{ member.email }}</p>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-44">
              <UiSelect
                :model-value="member.role"
                :options="roleOptions"
                :aria-label="`Role for ${member.name || member.email}`"
                :disabled="busy"
                @update:model-value="updateMemberRole(member.email, $event)"
              />
            </div>
            <UiButton
              icon-only
              icon="delete"
              variant="ghost"
              size="sm"
              :disabled="busy"
              :label="`Remove ${member.name || member.email}`"
              @click="removeMember(member.email)"
            />
          </div>
        </li>
      </ul>
      <p v-else class="py-6 text-center text-ink-muted">No members yet. Add members using the form above.</p>
    </section>
  </UiDialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { teamsAPI, apiErrorMessage } from '../../services/api.js';
import { useNotice } from '../../composables/useNotice.js';
import InlineNotice from '../InlineNotice.vue';
import { UiButton, UiChip, UiDialog, UiInput, UiSelect } from '../ui';

const props = defineProps({
  modelValue: Boolean,
  team: Object
});

// members-updated: (team) after each change; the dialog stays open
const emit = defineEmits(['update:modelValue', 'members-updated']);

const newMemberEmail = ref('');
const newMemberName = ref('');
const newMemberRole = ref('Designer');
// A member's role counts as the matching workflow stage role on the team's reviews (docs/REVIEW_API.md)
const roleOptions = ['Designer', 'Art Director', 'Creative Director', 'Client'];
const busy = ref(false);
// Local copy of the team, replaced by each API response (never mutate the prop)
const currentTeam = ref(null);
const members = computed(() => currentTeam.value?.members || []);
const { notice, showNotice, clearNotice } = useNotice();

watch(() => props.modelValue, (val) => {
  if (val) {
    currentTeam.value = props.team ? JSON.parse(JSON.stringify(props.team)) : null;
    newMemberEmail.value = '';
    newMemberName.value = '';
    newMemberRole.value = 'Designer';
    clearNotice();
  }
});

const getInitials = (name) => {
  if (!name || !name.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
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

<style scoped>
.member-list {
  @apply flex flex-col divide-y divide-line-faint rounded-tile border border-line;
}
.member-row {
  @apply flex flex-wrap items-center gap-3 px-4 py-3;
}
.member-avatar {
  @apply flex h-10 w-10 shrink-0 items-center justify-center rounded-pill bg-accent-subtle text-sm font-semibold text-accent-text;
}
</style>
