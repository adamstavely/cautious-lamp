<template>
  <!-- WCAG 2.2.1: say before the 8-hour session ends, while there is time to act -->
  <UiDialog :open="authState.expiringSoon" title="Your session is about to end" size="sm" @update:open="(open) => { if (!open) dismissExpiryWarning(); }">
    <p>
      For security you'll be signed out at <strong class="text-ink-strong">{{ endsAt }}</strong>.
      Your session can't be extended, so anything you haven't saved will be lost when it ends.
    </p>
    <p>Save your work now, or sign in again to start a new session. You'll come back to this page.</p>
    <template #footer>
      <UiButton @click="dismissExpiryWarning">Keep working</UiButton>
      <UiButton variant="primary" icon="log-in" @click="signInAgain">Sign in again</UiButton>
    </template>
  </UiDialog>
</template>

<script setup>
import { computed } from 'vue';
import { UiButton, UiDialog } from './ui';
import { authState, dismissExpiryWarning, signInAgain } from '../services/auth.js';

/**
 * The warning shown two minutes before the sign-in token expires (mounted
 * once in App.vue). The backend has no token refresh, so it offers signing in
 * again, which keeps the current page as the redirect.
 */
const endsAt = computed(() => {
  if (!authState.expiresAt) return 'soon';
  const date = new Date(authState.expiresAt);
  return Number.isNaN(date.getTime()) ? 'soon' : date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
});
</script>
