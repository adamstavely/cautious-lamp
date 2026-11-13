<template>
  <AdminDialog
    :model-value="modelValue"
    :title="done ? 'Password reset' : 'Reset password'"
    :subtitle="user ? `${user.name} · ${user.email}` : ''"
    :persistent="saving"
    :max-width="560"
    @update:model-value="close"
  >
    <div v-if="done" class="space-y-4">
      <p class="text-sm text-gray-700 dark:text-gray-300" role="status">
        The password was reset and {{ user?.name }} was signed out everywhere. Share the temporary password over a secure
        channel. They'll choose a new one when they sign in. It won't be shown again.
      </p>
      <TemporaryPasswordField v-model="password" readonly />
    </div>
    <form v-else :id="formId" class="space-y-4" novalidate @submit.prevent="submit">
      <p class="text-sm text-gray-700 dark:text-gray-300">
        Sets a temporary password, signs {{ user?.name || 'the user' }} out of every session, and makes them choose a new
        password at their next sign-in.
      </p>
      <InlineNotice :notice="generalError ? { type: 'error', message: generalError } : null" @dismiss="generalError = ''" />
      <TemporaryPasswordField v-model="password" :error="passwordError" />
    </form>

    <template #actions>
      <button
        v-if="done"
        type="button"
        class="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
        @click="close(false)"
      >
        Done
      </button>
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
          class="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors bg-red-600 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="saving"
        >
          {{ saving ? 'Resetting…' : 'Reset password' }}
        </button>
      </template>
    </template>
  </AdminDialog>
</template>

<script setup>
import { ref, watch } from 'vue';
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
  /** { id, name, email } */
  user: { type: Object, default: null },
});

const emit = defineEmits(['update:modelValue', 'reset']);

const formId = `reset-password-${Math.random().toString(36).slice(2, 10)}`;
const password = ref('');
const passwordError = ref('');
const generalError = ref('');
const saving = ref(false);
const done = ref(false);

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      password.value = generatePassword();
      passwordError.value = '';
      generalError.value = '';
      done.value = false;
    } else {
      password.value = '';
    }
  },
  { immediate: true }
);

const close = (value = false) => {
  if (value || saving.value) return;
  emit('update:modelValue', false);
};

const submit = async () => {
  generalError.value = '';
  passwordError.value = passwordProblem(password.value) ?? '';
  if (passwordError.value || !props.user) return;
  saving.value = true;
  try {
    await usersApi.resetPassword(props.user.id, password.value);
    done.value = true;
    emit('reset', props.user);
  } catch (error) {
    const { fields, general } = validationErrors(error, ['password']);
    passwordError.value = fields.password ?? '';
    if (general || !fields.password) generalError.value = general || adminErrorMessage(error, "Couldn't reset the password.");
  } finally {
    saving.value = false;
  }
};
</script>
