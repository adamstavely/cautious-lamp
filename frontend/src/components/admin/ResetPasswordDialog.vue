<template>
  <AdminDialog
    :model-value="modelValue"
    :title="done ? 'Password reset' : 'Reset password'"
    :subtitle="user ? `${user.name} · ${user.email}` : ''"
    :persistent="saving"
    :max-width="560"
    @update:model-value="close"
  >
    <template v-if="done">
      <p class="text-ink" role="status">
        The password was reset and {{ user?.name }} was signed out everywhere. Share the temporary password over a secure
        channel. They'll choose a new one when they sign in. It won't be shown again.
      </p>
      <TemporaryPasswordField v-model="password" readonly />
    </template>
    <form v-else :id="formId" class="flex flex-col gap-5" novalidate @submit.prevent="submit">
      <p class="text-ink">
        Sets a temporary password, signs {{ user?.name || 'the user' }} out of every session, and makes them choose a new
        password at their next sign-in.
      </p>
      <InlineNotice :notice="generalError ? { type: 'error', message: generalError } : null" @dismiss="generalError = ''" />
      <TemporaryPasswordField v-model="password" :error="passwordError" />
    </form>

    <template #actions>
      <UiButton v-if="done" variant="primary" @click="close(false)">Done</UiButton>
      <template v-else>
        <UiButton :disabled="saving" @click="close(false)">Cancel</UiButton>
        <UiButton type="submit" :form="formId" variant="danger" :loading="saving">
          {{ saving ? 'Resetting…' : 'Reset password' }}
        </UiButton>
      </template>
    </template>
  </AdminDialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import AdminDialog from './AdminDialog.vue';
import TemporaryPasswordField from './TemporaryPasswordField.vue';
import InlineNotice from '../InlineNotice.vue';
import UiButton from '../ui/UiButton.vue';
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
