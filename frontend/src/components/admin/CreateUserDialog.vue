<template>
  <AdminDialog
    :model-value="modelValue"
    :title="created ? 'User created' : 'Create user'"
    :persistent="saving"
    :max-width="620"
    @update:model-value="close"
  >
    <!-- After creating: hand over the temporary password -->
    <div v-if="created" class="space-y-4">
      <p class="text-sm text-gray-700 dark:text-gray-300" role="status">
        {{ created.name }} ({{ created.email }}) can now sign in with the temporary password below and will be asked
        to choose a new one. Share it with them over a secure channel. It won't be shown again.
      </p>
      <TemporaryPasswordField v-model="password" label="Temporary password" readonly />
    </div>

    <form v-else :id="formId" class="space-y-5" novalidate @submit.prevent="submit">
      <InlineNotice :notice="generalError ? { type: 'error', message: generalError } : null" @dismiss="generalError = ''" />

      <div>
        <label :for="`${formId}-email`" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
        <input
          :id="`${formId}-email`"
          v-model.trim="form.email"
          type="email"
          autocomplete="off"
          required
          maxlength="254"
          :aria-invalid="errors.email ? 'true' : 'false'"
          :aria-describedby="errors.email ? `${formId}-email-error` : `${formId}-email-hint`"
          class="w-full rounded-lg border border-solid px-3 py-2 text-sm bg-[#fff] text-gray-900 dark:bg-slate-700 dark:text-white"
          :class="errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'"
        />
        <p v-if="errors.email" :id="`${formId}-email-error`" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ errors.email }}</p>
        <p v-else :id="`${formId}-email-hint`" class="mt-1 text-xs text-gray-500 dark:text-gray-400">Emails can't be changed later.</p>
      </div>

      <div>
        <label :for="`${formId}-name`" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
        <input
          :id="`${formId}-name`"
          v-model="form.name"
          type="text"
          autocomplete="off"
          required
          maxlength="200"
          :aria-invalid="errors.name ? 'true' : 'false'"
          :aria-describedby="errors.name ? `${formId}-name-error` : undefined"
          class="w-full rounded-lg border border-solid px-3 py-2 text-sm bg-[#fff] text-gray-900 dark:bg-slate-700 dark:text-white"
          :class="errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'"
        />
        <p v-if="errors.name" :id="`${formId}-name-error`" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ errors.name }}</p>
      </div>

      <TemporaryPasswordField v-model="password" :error="errors.password" />

      <fieldset v-if="canAssignRoles">
        <legend class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Initial roles</legend>
        <p v-if="!roles.length" class="text-sm text-gray-500 dark:text-gray-400">No roles available.</p>
        <div v-else class="grid gap-2 sm:grid-cols-2">
          <label
            v-for="role in roles"
            :key="role.id"
            class="flex cursor-pointer items-start gap-2 rounded p-2 hover:bg-gray-100 dark:hover:bg-slate-700"
          >
            <input v-model="form.roles" type="checkbox" :value="role.id" class="mt-1 accent-indigo-600 dark:accent-indigo-500" />
            <span class="text-sm">
              <span class="block text-gray-900 dark:text-white">{{ role.name }}</span>
              <span class="block text-xs text-gray-500 dark:text-gray-400">{{ role.description }}</span>
            </span>
          </label>
        </div>
        <p v-if="errors.roles" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ errors.roles }}</p>
      </fieldset>
      <p v-else class="text-sm text-gray-500 dark:text-gray-400">
        Assigning roles needs the Role Management permission (admin:rbac). The user will start with no roles.
      </p>
    </form>

    <template #actions>
      <template v-if="created">
        <button
          type="button"
          class="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          @click="close(false)"
        >
          Done
        </button>
      </template>
      <template v-else>
        <button
          type="button"
          class="rounded-lg px-4 py-2 text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600"
          :disabled="saving"
          @click="close(false)"
        >
          Cancel
        </button>
        <button
          type="submit"
          :form="formId"
          class="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors bg-indigo-600 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          :disabled="saving"
        >
          {{ saving ? 'Creating…' : 'Create user' }}
        </button>
      </template>
    </template>
  </AdminDialog>
</template>

<script setup>
import { nextTick, reactive, ref, watch } from 'vue';
import AdminDialog from './AdminDialog.vue';
import TemporaryPasswordField from './TemporaryPasswordField.vue';
import InlineNotice from '../InlineNotice.vue';
import {
  adminErrorMessage,
  generatePassword,
  passwordProblem,
  usersApi,
  validationErrors,
} from '../../composables/useAccessAdmin.js';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  /** Roles from GET /rbac/roles; empty when the caller can't read them */
  roles: { type: Array, default: () => [] },
  canAssignRoles: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue', 'created']);

const formId = `create-user-${Math.random().toString(36).slice(2, 10)}`;
const form = reactive({ email: '', name: '', roles: [] });
const password = ref('');
const errors = reactive({ email: '', name: '', password: '', roles: '' });
const generalError = ref('');
const saving = ref(false);
const created = ref(null);

const reset = () => {
  Object.assign(form, { email: '', name: '', roles: [] });
  Object.assign(errors, { email: '', name: '', password: '', roles: '' });
  password.value = generatePassword();
  generalError.value = '';
  created.value = null;
};

watch(
  () => props.modelValue,
  (open) => {
    if (open) reset();
    // Don't keep the temporary password around once the dialog is closed
    else password.value = '';
  },
  { immediate: true }
);

const close = (value = false) => {
  if (value || saving.value) return;
  emit('update:modelValue', false);
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validate = () => {
  errors.email = !form.email ? 'Enter an email address.' : EMAIL.test(form.email) ? '' : 'Enter a valid email address.';
  errors.name = form.name.trim() ? '' : 'Enter a name.';
  errors.password = passwordProblem(password.value) ?? '';
  errors.roles = '';
  return !errors.email && !errors.name && !errors.password;
};

/** Moves focus to the first field with an error, so keyboard and screen reader users land on it */
const focusFirstInvalid = async () => {
  await nextTick();
  document.getElementById(formId)?.querySelector('[aria-invalid="true"]')?.focus();
};

const submit = async () => {
  generalError.value = '';
  if (!validate()) return focusFirstInvalid();
  saving.value = true;
  try {
    const body = { email: form.email, name: form.name.trim(), password: password.value };
    if (props.canAssignRoles && form.roles.length) body.roles = [...form.roles];
    const user = await usersApi.create(body);
    created.value = user;
    emit('created', user);
  } catch (error) {
    const { fields, general } = validationErrors(error, ['email', 'name', 'password', 'roles']);
    Object.assign(errors, { email: '', name: '', password: '', roles: '' }, fields);
    if (error?.response?.status === 409) errors.email = adminErrorMessage(error);
    else if (general || !Object.keys(fields).length) generalError.value = general || adminErrorMessage(error, "Couldn't create the user.");
    focusFirstInvalid();
  } finally {
    saving.value = false;
  }
};
</script>
