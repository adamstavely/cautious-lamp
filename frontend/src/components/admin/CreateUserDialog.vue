<template>
  <AdminDialog
    :model-value="modelValue"
    :title="created ? 'User created' : 'Create user'"
    :persistent="saving"
    :max-width="620"
    @update:model-value="close"
  >
    <!-- After creating: hand over the temporary password -->
    <template v-if="created">
      <p class="text-ink" role="status">
        {{ created.name }} ({{ created.email }}) can now sign in with the temporary password below and will be asked
        to choose a new one. Share it with them over a secure channel. It won't be shown again.
      </p>
      <TemporaryPasswordField v-model="password" label="Temporary password" readonly />
    </template>

    <form v-else :id="formId" class="flex flex-col gap-5" novalidate @submit.prevent="submit">
      <InlineNotice :notice="generalError ? { type: 'error', message: generalError } : null" @dismiss="generalError = ''" />

      <UiInput
        :id="`${formId}-email`"
        v-model.trim="form.email"
        label="Email"
        type="email"
        autocomplete="off"
        required
        maxlength="254"
        hint="Emails can't be changed later."
        :error="errors.email"
      />

      <UiInput
        :id="`${formId}-name`"
        v-model="form.name"
        label="Name"
        autocomplete="off"
        required
        maxlength="200"
        :error="errors.name"
      />

      <TemporaryPasswordField v-model="password" :error="errors.password" />

      <fieldset v-if="canAssignRoles" class="flex flex-col gap-2">
        <legend class="mb-2 text-sm font-medium text-ink">Initial roles</legend>
        <p v-if="!roles.length" class="text-ink-muted">No roles available.</p>
        <div v-else class="grid gap-3 sm:grid-cols-2">
          <UiCheckbox v-for="role in roles" :key="role.id" v-model="form.roles" :value="role.id" :label="role.name" :hint="role.description" />
        </div>
        <p v-if="errors.roles" class="text-xs font-medium text-danger" role="alert">{{ errors.roles }}</p>
      </fieldset>
      <p v-else class="text-ink-muted">
        Assigning roles needs the Role Management permission (admin:rbac). The user will start with no roles.
      </p>
    </form>

    <template #actions>
      <UiButton v-if="created" variant="primary" @click="close(false)">Done</UiButton>
      <template v-else>
        <UiButton :disabled="saving" @click="close(false)">Cancel</UiButton>
        <UiButton type="submit" :form="formId" variant="primary" :loading="saving">
          {{ saving ? 'Creating…' : 'Create user' }}
        </UiButton>
      </template>
    </template>
  </AdminDialog>
</template>

<script setup>
import { nextTick, reactive, ref, watch } from 'vue';
import AdminDialog from './AdminDialog.vue';
import TemporaryPasswordField from './TemporaryPasswordField.vue';
import InlineNotice from '../InlineNotice.vue';
import UiButton from '../ui/UiButton.vue';
import UiCheckbox from '../ui/UiCheckbox.vue';
import UiInput from '../ui/UiInput.vue';
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
