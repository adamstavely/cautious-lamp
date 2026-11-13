<template>
  <div class="auth-page">
    <div class="w-full max-w-5xl mx-auto px-6 md:px-10 py-12 md:py-20 grid md:grid-cols-[minmax(0,26rem)_1fr] items-center gap-12">
      <section aria-labelledby="login-title">
        <p class="text-sm font-medium tracking-wide text-[#2f5ea8] dark:text-[#9dbcf0] mb-4">The Agency's design system</p>
        <h1 id="login-title" class="text-4xl md:text-5xl font-semibold tracking-tight leading-[1.05] mb-4">Sign in</h1>
        <p class="text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
          Use the email and password your administrator gave you.
        </p>

        <InlineNotice v-if="notice" :notice="notice" class="mb-6" @dismiss="clearNotice" />

        <p v-if="demoMode" class="callout mb-6">
          Demo mode: there is no backend, so any email and password signs you in as the demo user.
        </p>

        <form novalidate class="space-y-5" @submit.prevent="submit">
          <div>
            <label for="login-email" class="field-label">Email</label>
            <input
              id="login-email"
              ref="emailInput"
              v-model.trim="email"
              type="email"
              name="email"
              autocomplete="username"
              inputmode="email"
              spellcheck="false"
              required
              class="field"
              :class="{ 'field-invalid': errors.email }"
              :aria-invalid="errors.email ? 'true' : 'false'"
              :aria-describedby="errors.email ? 'login-email-error' : undefined"
            />
            <p v-if="errors.email" id="login-email-error" class="field-error">{{ errors.email }}</p>
          </div>

          <div>
            <label for="login-password" class="field-label">Password</label>
            <div class="relative">
              <input
                id="login-password"
                ref="passwordInput"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                name="password"
                autocomplete="current-password"
                required
                class="field pr-12"
                :class="{ 'field-invalid': errors.password }"
                :aria-invalid="errors.password ? 'true' : 'false'"
                :aria-describedby="errors.password ? 'login-password-error' : undefined"
              />
              <button
                type="button"
                class="reveal"
                :aria-pressed="showPassword ? 'true' : 'false'"
                aria-label="Show password"
                @click="showPassword = !showPassword"
              >
                <span class="material-symbols-outlined text-xl" aria-hidden="true">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </div>
            <p v-if="errors.password" id="login-password-error" class="field-error">{{ errors.password }}</p>
          </div>

          <button type="submit" class="btn btn-primary w-full justify-center" :disabled="submitting" :aria-busy="submitting ? 'true' : 'false'">
            {{ submitting ? 'Signing in…' : 'Sign in' }}
          </button>
        </form>

        <p class="mt-8 text-sm text-slate-500 dark:text-slate-400">
          Forgotten your password, or need an account? Ask a design system administrator.
        </p>
      </section>

      <div class="spot hidden md:block w-72 h-72 lg:w-80 lg:h-80 justify-self-center" aria-hidden="true" v-html="spot('site/compass-rose')"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import InlineNotice from '../components/InlineNotice.vue';
import { useNotice } from '../composables/useNotice.js';
import { useAuth } from '../composables/useAuth.js';
import { safeRedirect } from '../services/auth.js';
import { spot } from '../utils/spotIllustrations.js';

const route = useRoute();
const router = useRouter();
const { login, demoMode } = useAuth();
const { notice, showNotice, clearNotice } = useNotice();

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const submitting = ref(false);
const errors = reactive({ email: '', password: '' });
const emailInput = ref(null);
const passwordInput = ref(null);

/** The message for a failed sign-in (docs/AUTH.md: 401 bad credentials, 423 locked). */
const loginErrorMessage = (error) => {
  const status = error?.response?.status;
  if (status === 401) return 'Email or password is incorrect.';
  if (status === 423) {
    const detail = error.response.data?.message;
    return typeof detail === 'string' && detail ? detail : 'This account is locked after too many failed sign-ins. Try again in 15 minutes.';
  }
  if (status === 429) return 'Too many attempts. Wait a moment and try again.';
  if (!error?.response) return 'The server could not be reached. Check your connection and try again.';
  return 'Sign-in failed. Please try again.';
};

const validate = () => {
  errors.email = '';
  errors.password = '';
  if (!email.value) errors.email = 'Enter your email address.';
  else if (!/^[^\s@]+@[^\s@]+$/.test(email.value)) errors.email = 'Enter an email address like name@example.com.';
  if (!password.value) errors.password = 'Enter your password.';
  return !errors.email && !errors.password;
};

const submit = async () => {
  if (submitting.value) return;
  clearNotice();
  if (!validate()) {
    (errors.email ? emailInput : passwordInput).value?.focus();
    return;
  }
  submitting.value = true;
  try {
    await login(email.value, password.value);
    // The router guard sends someone who must change their password to /change-password
    await router.replace(safeRedirect(route.query.redirect));
  } catch (error) {
    password.value = '';
    showNotice(loginErrorMessage(error), 'error');
    await nextTick();
    passwordInput.value?.focus();
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  if (route.query.changed) showNotice('Your password has been changed. Sign in with your new password.', 'success');
  else if (route.query.signedOut) showNotice('You have signed out.', 'info');
  else if (route.query.expired) showNotice('Your session has ended. Sign in again to continue.', 'warning');
  else if (route.query.unreachable) showNotice('We could not check your sign-in because the server could not be reached. Try again shortly.', 'error');
  emailInput.value?.focus();
});
</script>

<style scoped>
.auth-page {
  @apply min-h-screen flex items-center bg-[#fff] dark:bg-slate-950 text-slate-900 dark:text-slate-100;
}
.spot :deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
}
.field-label {
  @apply block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5;
}
.field {
  @apply w-full h-11 px-4 rounded-full border border-solid border-slate-300 bg-[#fff] text-slate-900 placeholder-slate-400
    focus:outline-none focus:border-[#2f5ea8] focus:ring-2 focus:ring-[#2f5ea8]/30
    dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-[#9dbcf0] dark:focus:ring-[#9dbcf0]/30;
}
.field-invalid {
  @apply border-red-500 dark:border-red-400;
}
.field-error {
  @apply mt-1.5 text-sm text-red-700 dark:text-red-300;
}
.reveal {
  @apply absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800;
}
.btn {
  @apply inline-flex items-center gap-2 h-11 px-5 rounded-full text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed;
}
.btn-primary {
  @apply bg-[#2f5ea8] text-white hover:bg-[#264d8b] dark:bg-[#9dbcf0] dark:text-slate-950 dark:hover:bg-[#b8cff5];
}
.callout {
  @apply rounded-xl border border-solid border-[#dce8fb] bg-[#f2f6fd] px-4 py-3 text-sm text-[#2f5ea8] dark:border-[#263a5c] dark:bg-[#263a5c]/40 dark:text-[#9dbcf0];
}
</style>
