<template>
  <AdminDialog
    :model-value="modelValue"
    :title="step === 'review' ? `Review changes to ${role?.name}` : `Edit permissions: ${role?.name}`"
    :subtitle="role?.description || ''"
    :persistent="saving"
    :max-width="860"
    @update:model-value="close"
  >
    <!-- Step 1: choose permissions -->
    <template v-if="step === 'edit'">
      <p role="status" aria-live="polite">
        {{ selected.size }} of {{ catalogue.length }} permissions selected.
        <template v-if="added.length || removed.length">{{ added.length }} added, {{ removed.length }} removed.</template>
      </p>
      <fieldset v-for="group in groups" :key="group.name" class="perm-group">
        <legend class="perm-group-legend">{{ group.name }}</legend>
        <div class="mb-1 flex justify-end">
          <UiButton
            variant="ghost"
            size="sm"
            :aria-label="`${allSelected(group) ? 'Clear' : 'Select'} all ${group.name} permissions`"
            @click="toggleGroup(group)"
          >
            {{ allSelected(group) ? 'Clear all' : 'Select all' }}
          </UiButton>
        </div>
        <div class="grid gap-1 sm:grid-cols-2">
          <div v-for="permission in group.permissions" :key="permission.value" class="perm-option">
            <UiCheckbox :model-value="selected.has(permission.value)" @update:model-value="toggle(permission.value)">
              {{ permission.label }}
            </UiCheckbox>
            <UiCode class="ml-auto">{{ permission.value }}</UiCode>
            <UiChip v-if="changeOf(permission.value)" :tone="changeOf(permission.value) === 'added' ? 'success' : 'danger'">
              {{ changeOf(permission.value) === 'added' ? '+ added' : '− removed' }}
            </UiChip>
          </div>
        </div>
      </fieldset>
    </template>

    <!-- Step 2: confirm the diff -->
    <template v-else>
      <InlineNotice :notice="error ? { type: 'error', message: error } : null" @dismiss="error = ''" />
      <p class="text-ink">
        This changes what every member of {{ role?.name }} can do
        <template v-if="memberCount !== null">({{ memberCount }} {{ memberCount === 1 ? 'person' : 'people' }})</template>.
        Changes apply within about 30 seconds.
      </p>
      <UiCallout v-if="removedAdmin.length" tone="warning" role="note">
        Removing administration permissions ({{ removedAdmin.map(labelFor).join(', ') }}).
        <template v-if="affectsMe"> You have this role, so you may lose access to this page.</template>
      </UiCallout>
      <div class="grid gap-4 sm:grid-cols-2">
        <section aria-labelledby="perm-diff-added">
          <h3 id="perm-diff-added" class="mb-2 text-sm font-semibold text-success">Added ({{ added.length }})</h3>
          <p v-if="!added.length" class="text-ink-muted">None</p>
          <ul v-else class="flex flex-col gap-1">
            <li v-for="value in added" :key="value" class="perm-diff perm-diff-added">
              + {{ labelFor(value) }} <UiCode>{{ value }}</UiCode>
            </li>
          </ul>
        </section>
        <section aria-labelledby="perm-diff-removed">
          <h3 id="perm-diff-removed" class="mb-2 text-sm font-semibold text-danger">Removed ({{ removed.length }})</h3>
          <p v-if="!removed.length" class="text-ink-muted">None</p>
          <ul v-else class="flex flex-col gap-1">
            <li v-for="value in removed" :key="value" class="perm-diff perm-diff-removed">
              − {{ labelFor(value) }} <UiCode>{{ value }}</UiCode>
            </li>
          </ul>
        </section>
      </div>
    </template>

    <template #actions>
      <template v-if="step === 'edit'">
        <UiButton @click="close(false)">Cancel</UiButton>
        <UiButton variant="primary" :disabled="!added.length && !removed.length" @click="step = 'review'">Review changes</UiButton>
      </template>
      <template v-else>
        <UiButton :disabled="saving" @click="back">Back</UiButton>
        <UiButton variant="primary" :loading="saving" @click="save">{{ saving ? 'Saving…' : 'Save permissions' }}</UiButton>
      </template>
    </template>
  </AdminDialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import AdminDialog from './AdminDialog.vue';
import InlineNotice from '../InlineNotice.vue';
import UiButton from '../ui/UiButton.vue';
import UiCallout from '../ui/UiCallout.vue';
import UiCheckbox from '../ui/UiCheckbox.vue';
import UiChip from '../ui/UiChip.vue';
import UiCode from '../ui/UiCode.vue';
import { adminErrorMessage, rbacApi } from '../../composables/useAccessAdmin.js';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  /** RoleDefinition */
  role: { type: Object, default: null },
  /** [{ value, label, category }] from GET /rbac/permissions */
  catalogue: { type: Array, default: () => [] },
  /** Number of members, or null if unknown */
  memberCount: { type: Number, default: null },
  /** Whether the signed-in user has this role */
  affectsMe: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue', 'saved']);

const step = ref('edit');
const selected = ref(new Set());
const saving = ref(false);
const error = ref('');

const original = computed(() => new Set(props.role?.permissions ?? []));
const order = computed(() => props.catalogue.map((p) => p.value));
const added = computed(() => order.value.filter((v) => selected.value.has(v) && !original.value.has(v)));
const removed = computed(() =>
  [...original.value].filter((v) => !selected.value.has(v)).sort((a, b) => order.value.indexOf(a) - order.value.indexOf(b))
);
const removedAdmin = computed(() => removed.value.filter((v) => v.startsWith('admin:')));

const groups = computed(() => {
  const map = new Map();
  for (const permission of props.catalogue) {
    if (!map.has(permission.category)) map.set(permission.category, []);
    map.get(permission.category).push(permission);
  }
  return [...map].map(([name, permissions]) => ({ name, permissions }));
});

const labelFor = (value) => props.catalogue.find((p) => p.value === value)?.label ?? value;
const changeOf = (value) =>
  selected.value.has(value) && !original.value.has(value) ? 'added' : !selected.value.has(value) && original.value.has(value) ? 'removed' : null;

watch(
  () => [props.modelValue, props.role?.id],
  ([open]) => {
    if (!open) return;
    step.value = 'edit';
    error.value = '';
    selected.value = new Set(props.role?.permissions ?? []);
  },
  { immediate: true }
);

const toggle = (value) => {
  const next = new Set(selected.value);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  selected.value = next;
};

const allSelected = (group) => group.permissions.every((p) => selected.value.has(p.value));
const toggleGroup = (group) => {
  const next = new Set(selected.value);
  const select = !allSelected(group);
  group.permissions.forEach((p) => (select ? next.add(p.value) : next.delete(p.value)));
  selected.value = next;
};

const back = () => {
  error.value = '';
  step.value = 'edit';
};

const close = (value = false) => {
  if (value || saving.value) return;
  emit('update:modelValue', false);
};

const save = async () => {
  saving.value = true;
  error.value = '';
  try {
    // Keep only known permissions, in catalogue order
    const permissions = order.value.filter((v) => selected.value.has(v));
    const updated = await rbacApi.updateRole(props.role.id, permissions);
    emit('saved', updated, { added: added.value.length, removed: removed.value.length });
    emit('update:modelValue', false);
  } catch (e) {
    // 409: "This would leave no active user with admin:rbac", or a concurrent edit
    error.value = adminErrorMessage(e, "Couldn't save the permissions.");
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.perm-group {
  @apply rounded-tile border border-solid border-line bg-surface-sunken px-4 pb-4 pt-2;
}
.perm-group-legend {
  @apply px-1 font-semibold text-ink-strong;
}
.perm-option {
  @apply flex items-center gap-2 rounded-control p-2 hover:bg-fill-hover;
}
.perm-diff {
  @apply rounded-control border border-solid px-2 py-1;
}
.perm-diff-added {
  @apply border-success-border bg-success-bg text-success;
}
.perm-diff-removed {
  @apply border-danger-border bg-danger-bg text-danger;
}
</style>
