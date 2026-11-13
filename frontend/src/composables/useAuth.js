import { computed } from 'vue';
import {
  authState,
  hasPermission,
  login,
  logout,
  refreshMe,
  changePassword,
  isMockAuth,
} from '../services/auth.js';

/** Initials for an avatar: "Sarah Johnson" → "SJ", "sam@x.com" → "S". */
export const initialsFor = (user) => {
  const source = (user?.name || user?.email || '').trim();
  if (!source) return '?';
  const words = source.includes('@') ? [source] : source.split(/\s+/).filter(Boolean);
  const letters = words.length > 1 ? words[0][0] + words[words.length - 1][0] : words[0][0];
  return letters.toUpperCase();
};

/**
 * The signed-in user and their permissions (docs/AUTH.md). State is shared
 * across the app; permissions decide what the UI shows, the server enforces.
 */
export function useAuth() {
  const user = computed(() => authState.user);
  const permissions = computed(() => authState.user?.permissions ?? []);
  const isSignedIn = computed(() => !!authState.user);
  const initials = computed(() => initialsFor(authState.user));

  return {
    user,
    permissions,
    isSignedIn,
    initials,
    demoMode: isMockAuth(),
    hasPermission,
    login,
    logout,
    refreshMe,
    changePassword,
  };
}
