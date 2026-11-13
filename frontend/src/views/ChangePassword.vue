<template>
  <div class="auth-page">
    <div class="w-full max-w-xl mx-auto px-6 md:px-10 py-12 md:py-20">
      <section aria-labelledby="change-password-title">
        <p class="text-sm font-medium tracking-wide text-[#2f5ea8] dark:text-[#9dbcf0] mb-4">
          {{ user?.email }}
        </p>
        <h1 id="change-password-title" class="text-4xl md:text-5xl font-semibold tracking-tight leading-[1.05] mb-4">
          {{ required ? 'Set a new password' : 'Change password' }}
        </h1>
        <p class="text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
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
          <div>
            <label for="cp-current" class="field-label">Current password</label>
            <input
              id="cp-current"
              ref="currentInput"
              v-model="currentPassword"
              type="password"
              autocomplete="current-password"
              required
              class="field"
              :class="{ 'field-invalid': errors.current }"
              :aria-invalid="errors.current ? 'true' : 'false'"
              :aria-describedby="errors.current ? 'cp-current-error' : undefined"
            />
            <p v-if="errors.current" id="cp-current-error" class="field-error">{{ errors.current }}</p>
          </div>

          <div>
            <label for="cp-new" class="field-label">New password</label>
            <input
              id="cp-new"
              ref="newInput"
              v-model="newPassword"
              type="password"
              autocomplete="new-password"
              required
              :minlength="MIN_LENGTH"
              class="field"
              :class="{ 'field-invalid': errors.new }"
              :aria-invalid="errors.new ? 'true' : 'false'"
              :aria-describedby="errors.new ? 'cp-new-hint cp-new-error' : 'cp-new-hint'"
            />
            <p id="cp-new-hint" class="field-hint">At least {{ MIN_LENGTH }} characters.</p>
            <p v-if="errors.new" id="cp-new-error" class="field-error">{{ errors.new }}</p>
          </div>

          <div>
            <label for="cp-confirm" class="field-label">Confirm new password</label>
            <input
              id="cp-confirm"
              ref="confirmInput"
              v-model="confirmPassword"
              type="password"
              autocomplete="new-password"
              required
              class="field"
              :class="{ 'field-invalid': errors.confirm }"
              :aria-invalid="errors.confirm ? 'true' : 'false'"
              :aria-describedby="errors.confirm ? 'cp-confirm-error' : undefined"
            />
            <p v-if="errors.confirm" id="cp-confirm-error" class="field-error">{{ errors.confirm }}</p>
          </div>

          <div class="flex flex-wrap gap-3 pt-1">
            <button type="submit" class="btn btn-primary" :disabled="submitting" :aria-busy="submitting ? 'true' : 'false'">
              {{ submitting ? 'Changing password…' : 'Change password' }}
            </button>
            <button v-if="required" type="button" class="btn btn-secondary" @click="signOut">Sign out</button>
            <button v-else type="button" class="btn btn-secondary" @click="cancel">Cancel</button>
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
const currentInput = ref(null);
const newInput = ref(null);
const confirmInput = ref(null);

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
  if (errors.current) currentInput.value?.focus();
  else if (errors.new) newInput.value?.focus();
  else if (errors.confirm) confirmInput.value?.focus();
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
      currentInput.value?.focus();
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

onMounted(() => currentInput.value?.focus());
</script>

<style scoped>
.auth-page {
  @apply min-h-screen flex items-center bg-[#fff] dark:bg-slate-950 text-slate-900 dark:text-slate-100;
}
.field-label {
  @apply block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5;
}
.field {
  @apply w-full h-11 px-4 rounded-full border border-solid border-slate-300 bg-[#fff] text-slate-900
    focus:outline-none focus:border-[#2f5ea8] focus:ring-2 focus:ring-[#2f5ea8]/30
    dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-[#9dbcf0] dark:focus:ring-[#9dbcf0]/30;
}
.field-invalid {
  @apply border-red-500 dark:border-red-400;
}
.field-hint {
  @apply mt-1.5 text-sm text-slate-500 dark:text-slate-400;
}
.field-error {
  @apply mt-1.5 text-sm text-red-700 dark:text-red-300;
}
.btn {
  @apply inline-flex items-center gap-2 h-11 px-5 rounded-full text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed;
}
.btn-primary {
  @apply bg-[#2f5ea8] text-white hover:bg-[#264d8b] dark:bg-[#9dbcf0] dark:text-slate-950 dark:hover:bg-[#b8cff5];
}
.btn-secondary {
  @apply border border-solid border-slate-300 text-slate-800 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900;
}
</style>
