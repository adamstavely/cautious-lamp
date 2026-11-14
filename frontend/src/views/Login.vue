<template>
  <div class="auth-page">
    <div class="w-full max-w-5xl mx-auto px-6 md:px-10 py-12 md:py-20 grid md:grid-cols-content-aside items-center gap-12">
      <section aria-labelledby="login-title" class="max-w-md">
        <p class="mb-4 text-sm font-medium tracking-wide text-accent-text">The Agency's design system</p>
        <h1 id="login-title" class="mb-4 text-4xl md:text-5xl font-semibold tracking-tight leading-tight text-ink-strong">Sign in</h1>
        <p class="mb-8 leading-relaxed text-ink-secondary">
          Use the email and password your administrator gave you.
        </p>

        <InlineNotice v-if="notice" :notice="notice" class="mb-6" @dismiss="clearNotice" />

        <UiCallout v-if="demoMode" class="mb-6">
          Demo mode: there is no backend, so any email and password signs you in as the demo user.
        </UiCallout>

        <form novalidate class="space-y-5" @submit.prevent="submit">
          <UiInput
            id="login-email"
            v-model.trim="email"
            type="email"
            label="Email"
            name="email"
            autocomplete="username"
            inputmode="email"
            spellcheck="false"
            required
            :error="errors.email"
          />

          <UiField id="login-password" label="Password" :error="errors.password" required v-slot="{ id, describedBy, invalid }">
            <div class="relative">
              <input
                :id="id"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                name="password"
                autocomplete="current-password"
                required
                class="password-input"
                :aria-invalid="invalid ? 'true' : 'false'"
                :aria-describedby="describedBy"
              />
              <UiButton
                variant="ghost"
                size="sm"
                :icon="showPassword ? 'visibility_off' : 'visibility'"
                icon-only
                label="Show password"
                class="reveal"
                :aria-pressed="showPassword ? 'true' : 'false'"
                @click="showPassword = !showPassword"
              />
            </div>
          </UiField>

          <UiButton type="submit" variant="primary" class="w-full" :loading="submitting">
            {{ submitting ? 'Signing in…' : 'Sign in' }}
          </UiButton>
        </form>

        <p class="mt-8 text-sm text-ink-muted">
          Forgotten your password, or need an account? Ask a design system administrator.
        </p>
      </section>

      <SpotArt name="site/compass-rose" size="hero" class="hidden md:block justify-self-center" />
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
import { SpotArt, UiButton, UiCallout, UiField, UiInput } from '../components/ui';

const route = useRoute();
const router = useRouter();
const { login, demoMode } = useAuth();
const { notice, showNotice, clearNotice } = useNotice();

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const submitting = ref(false);
const errors = reactive({ email: '', password: '' });
// The kit's controls render their own <input>, so focus goes by id
const focusField = (id) => document.getElementById(id)?.focus();

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
    focusField(errors.email ? 'login-email' : 'login-password');
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
    focusField('login-password');
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  if (route.query.changed) showNotice('Your password has been changed. Sign in with your new password.', 'success');
  else if (route.query.signedOut) showNotice('You have signed out.', 'info');
  else if (route.query.expired) showNotice('Your session has ended. Sign in again to continue.', 'warning');
  else if (route.query.unreachable) showNotice('We could not check your sign-in because the server could not be reached. Try again shortly.', 'error');
  focusField('login-email');
});
</script>

<style scoped>
.auth-page {
  @apply min-h-screen flex items-center bg-surface text-ink;
}
/* The kit's input look, with room for the show-password button */
.password-input {
  @apply w-full h-11 pl-3.5 pr-12 rounded-field border border-solid border-line-control bg-surface-control text-sm text-ink;
  @apply hover:border-line-control-hover focus:outline focus:outline-2 focus:outline-offset-0 outline-focus focus:border-transparent;
}
.password-input[aria-invalid='true'] {
  @apply border-danger-solid;
}
.reveal {
  @apply absolute right-1.5 top-1/2 -translate-y-1/2;
}
</style>
