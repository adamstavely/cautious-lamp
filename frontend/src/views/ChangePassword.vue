<template>
  <div class="auth-page">
    <div class="w-full max-w-xl mx-auto px-6 md:px-10 py-12 md:py-20">
      <section aria-labelledby="change-password-title">
        <p class="mb-4 text-sm font-medium tracking-wide text-accent-text">
          {{ user?.email }}
        </p>
        <h1 id="change-password-title" class="mb-4 text-4xl md:text-5xl font-semibold tracking-tight leading-tight text-ink-strong">
          {{ required ? 'Set a new password' : 'Change password' }}
        </h1>
        <p class="mb-8 leading-relaxed text-ink-secondary">
          <template v-if="required">
            Before you continue, replace the password you were given with one only you know.
          </template>
          <template v-else>
            Changing your password signs you out everywhere, including this browser.
          </template>
          Afterwards, sign in again with the new password.
        </p>

        <InlineNotice v-if="notice" :notice="notice" class="mb-6" @dismiss="clearNotice" />

        <form novalidate class="space-y-5" @submit.prevent="submit">
          <UiInput
            id="cp-current"
            v-model="currentPassword"
            type="password"
            label="Current password"
            autocomplete="current-password"
            required
            :error="errors.current"
          />

          <UiInput
            id="cp-new"
            v-model="newPassword"
            type="password"
            label="New password"
            autocomplete="new-password"
            required
            :minlength="MIN_LENGTH"
            :hint="`At least ${MIN_LENGTH} characters.`"
            :error="errors.new"
          />

          <UiInput
            id="cp-confirm"
            v-model="confirmPassword"
            type="password"
            label="Confirm new password"
            autocomplete="new-password"
            required
            :error="errors.confirm"
          />

          <div class="flex flex-wrap gap-3 pt-1">
            <UiButton type="submit" variant="primary" :loading="submitting">
              {{ submitting ? 'Changing password…' : 'Change password' }}
            </UiButton>
            <UiButton v-if="required" @click="signOut">Sign out</UiButton>
            <UiButton v-else @click="cancel">Cancel</UiButton>
          </div>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import InlineNotice from '../components/InlineNotice.vue';
import { useNotice } from '../composables/useNotice.js';
import { useAuth } from '../composables/useAuth.js';
import { UiButton, UiInput } from '../components/ui';

const MIN_LENGTH = 12;

const router = useRouter();
const { user, changePassword, logout, demoMode } = useAuth();
const { notice, showNotice, clearNotice } = useNotice();

const required = computed(() => !!user.value?.mustChangePassword);
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const submitting = ref(false);
const errors = reactive({ current: '', new: '', confirm: '' });
// The kit's controls render their own <input>, so focus goes by id
const focusField = (id) => document.getElementById(id)?.focus();

const validate = () => {
  errors.current = currentPassword.value ? '' : 'Enter your current password.';
  errors.new = '';
  errors.confirm = '';
  if (!newPassword.value) errors.new = 'Enter a new password.';
  else if (newPassword.value.length < MIN_LENGTH) errors.new = `Use at least ${MIN_LENGTH} characters.`;
  else if (newPassword.value === currentPassword.value) errors.new = 'Choose a password different from your current one.';
  if (!errors.new && confirmPassword.value !== newPassword.value) errors.confirm = 'The passwords do not match.';
  return !errors.current && !errors.new && !errors.confirm;
};

const focusFirstError = () => {
  if (errors.current) focusField('cp-current');
  else if (errors.new) focusField('cp-new');
  else if (errors.confirm) focusField('cp-confirm');
};

const serverMessage = (error) => {
  const message = error?.response?.data?.message;
  return Array.isArray(message) ? message.join(', ') : message;
};

const submit = async () => {
  if (submitting.value) return;
  clearNotice();
  if (!validate()) {
    focusFirstError();
    return;
  }
  submitting.value = true;
  try {
    await changePassword(currentPassword.value, newPassword.value);
    if (demoMode) {
      showNotice('Demo mode: passwords are not stored, so nothing changed.', 'info');
      return;
    }
    // The server revoked every token, including this one
    await router.replace({ path: '/login', query: { changed: '1' } });
  } catch (error) {
    const status = error?.response?.status;
    const message = serverMessage(error) || '';
    if (status === 401 || status === 403 || (status === 400 && /current password/i.test(message))) {
      errors.current = 'Your current password is incorrect.';
      currentPassword.value = '';
      await nextTick();
      focusField('cp-current');
    } else if (status === 400) {
      showNotice(message || 'That password cannot be used. Choose another.', 'error');
    } else if (!error?.response) {
      showNotice('The server could not be reached. Try again shortly.', 'error');
    } else {
      showNotice('Your password could not be changed. Please try again.', 'error');
    }
  } finally {
    submitting.value = false;
  }
};

const signOut = async () => {
  await logout();
  await router.replace({ path: '/login', query: { signedOut: '1' } });
};

const cancel = () => {
  if (window.history.state?.back) router.back();
  else router.replace('/');
};

onMounted(() => focusField('cp-current'));
</script>

<style scoped>
.auth-page {
  @apply min-h-screen flex items-center bg-surface text-ink;
}
</style>
