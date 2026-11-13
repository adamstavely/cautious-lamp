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
    <div v-if="step === 'edit'" class="space-y-4">
      <p class="text-sm text-gray-600 dark:text-gray-400" role="status" aria-live="polite">
        {{ selected.size }} of {{ catalogue.length }} permissions selected.
        <template v-if="added.length || removed.length">{{ added.length }} added, {{ removed.length }} removed.</template>
      </p>
      <fieldset
        v-for="group in groups"
        :key="group.name"
        class="rounded-lg border border-solid border-gray-200 p-4 bg-gray-50 dark:border-gray-700 dark:bg-slate-900"
      >
        <legend class="px-1 font-semibold text-gray-900 dark:text-white">{{ group.name }}</legend>
        <div class="mb-2 flex justify-end">
          <button
            type="button"
            class="text-xs font-medium text-indigo-700 hover:underline dark:text-indigo-300"
            :aria-label="`${allSelected(group) ? 'Clear' : 'Select'} all ${group.name} permissions`"
            @click="toggleGroup(group)"
          >
            {{ allSelected(group) ? 'Clear all' : 'Select all' }}
          </button>
        </div>
        <div class="grid gap-1 sm:grid-cols-2">
          <label
            v-for="permission in group.permissions"
            :key="permission.value"
            class="flex cursor-pointer items-center gap-2 rounded p-2 hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            <input
              type="checkbox"
              :checked="selected.has(permission.value)"
              class="accent-indigo-600 dark:accent-indigo-500"
              @change="toggle(permission.value)"
            />
            <span class="text-sm text-gray-800 dark:text-gray-200">{{ permission.label }}</span>
            <code class="ml-auto text-[11px] text-gray-500 dark:text-gray-400">{{ permission.value }}</code>
            <span
              v-if="changeOf(permission.value)"
              class="text-xs font-semibold"
              :class="changeOf(permission.value) === 'added' ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'"
            >
              {{ changeOf(permission.value) === 'added' ? '+ added' : '− removed' }}
            </span>
          </label>
        </div>
      </fieldset>
    </div>

    <!-- Step 2: confirm the diff -->
    <div v-else class="space-y-5">
      <InlineNotice :notice="error ? { type: 'error', message: error } : null" @dismiss="error = ''" />
      <p class="text-sm text-gray-700 dark:text-gray-300">
        This changes what every member of {{ role?.name }} can do
        <template v-if="memberCount !== null">({{ memberCount }} {{ memberCount === 1 ? 'person' : 'people' }})</template>.
        Changes apply within about 30 seconds.
      </p>
      <div
        v-if="removedAdmin.length"
        class="rounded-lg border border-solid border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
        role="note"
      >
        Removing administration permissions ({{ removedAdmin.map(labelFor).join(', ') }}).
        <template v-if="affectsMe"> You have this role, so you may lose access to this page.</template>
      </div>
      <div class="grid gap-4 sm:grid-cols-2">
        <section aria-labelledby="perm-diff-added">
          <h3 id="perm-diff-added" class="mb-2 text-sm font-semibold text-emerald-800 dark:text-emerald-300">Added ({{ added.length }})</h3>
          <p v-if="!added.length" class="text-sm text-gray-500 dark:text-gray-400">None</p>
          <ul v-else class="space-y-1 text-sm">
            <li v-for="value in added" :key="value" class="rounded px-2 py-1 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
              + {{ labelFor(value) }} <code class="text-xs opacity-75">{{ value }}</code>
            </li>
          </ul>
        </section>
        <section aria-labelledby="perm-diff-removed">
          <h3 id="perm-diff-removed" class="mb-2 text-sm font-semibold text-red-800 dark:text-red-300">Removed ({{ removed.length }})</h3>
          <p v-if="!removed.length" class="text-sm text-gray-500 dark:text-gray-400">None</p>
          <ul v-else class="space-y-1 text-sm">
            <li v-for="value in removed" :key="value" class="rounded px-2 py-1 bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-200">
              − {{ labelFor(value) }} <code class="text-xs opacity-75">{{ value }}</code>
            </li>
          </ul>
        </section>
      </div>
    </div>

    <template #actions>
      <template v-if="step === 'edit'">
        <button
          type="button"
          class="rounded-lg px-4 py-2 text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600"
          @click="close(false)"
        >
          Cancel
        </button>
        <button
          type="button"
          class="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors bg-indigo-600 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          :disabled="!added.length && !removed.length"
          @click="step = 'review'"
        >
          Review changes
        </button>
      </template>
      <template v-else>
        <button
          type="button"
          class="rounded-lg px-4 py-2 text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600"
          :disabled="saving"
          @click="back"
        >
          Back
        </button>
        <button
          type="button"
          class="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors bg-indigo-600 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          :disabled="saving"
          @click="save"
        >
          {{ saving ? 'Saving…' : 'Save permissions' }}
        </button>
      </template>
    </template>
  </AdminDialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import AdminDialog from './AdminDialog.vue';
import InlineNotice from '../InlineNotice.vue';
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
