import { ref, computed, watch, reactive } from 'vue';
import OpenFeature, { evaluateFlag } from '../services/featureFlagsService';
import { authState, authHeaders, getToken, isMockAuth } from '../services/auth.js';

// Cache for feature flag states - load from localStorage on initialization
const loadFlagCache = () => {
  try {
    const cached = localStorage.getItem('featureFlagsCache');
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.warn('Failed to load feature flags cache from localStorage:', error);
  }
  return {};
};

// Use reactive() for better nested property tracking
const flagCache = reactive(loadFlagCache());
const loadingFlags = ref(new Set());
const activeFlagRefreshers = new Map(); // Track active flag refreshers

/**
 * Targeting context for flags: the signed-in user's id, with their RBAC roles
 * as groups. Comes from the session, not from anything stored in the browser.
 */
export const getUserContext = () => ({
  userId: authState.user?.id || undefined,
  userGroups: authState.user?.roles?.length ? [...authState.user.roles] : undefined,
});

// Preload all flags from API on initialization
const preloadAllFlags = async () => {
  try {
    const context = getUserContext();
    // Get all flags from the service
    if (!isMockAuth() && !getToken()) return;
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL ?? ''}/api/v1/feature-flags`, {
      headers: authHeaders(),
    });
    if (response.ok) {
      const flags = await response.json();
      // Populate flagCache with all flags
      flags.forEach(flag => {
        flagCache[flag.key] = evaluateFlag(flag, context);
      });
    }
  } catch (error) {
    console.warn('Failed to preload feature flags:', error);
  }
};

// Preload flags once someone is signed in (and again for each new sign-in)
if (typeof window !== 'undefined') {
  watch(() => authState.user?.id, (id) => {
    if (id) preloadAllFlags();
  }, { immediate: true });
}

// Export flagCache so components can access it reactively
export { flagCache };

// Persist cache to localStorage whenever it changes
watch(flagCache, (newCache) => {
  try {
    localStorage.setItem('featureFlagsCache', JSON.stringify(newCache));
  } catch (error) {
    console.warn('Failed to persist feature flags cache to localStorage:', error);
  }
}, { deep: true });

// Flags read while signed out fell back to their defaults, and targeting
// depends on who is signed in, so re-read every active flag when the user changes
watch(
  () => authState.user?.id ?? null,
  () => activeFlagRefreshers.forEach((refresh) => refresh()),
);

// Single global listener for flag updates
if (typeof window !== 'undefined') {
  window.addEventListener('feature-flags-updated', () => {
    // Refresh all active flags
    activeFlagRefreshers.forEach((refresh) => {
      refresh();
    });
  });
}

/**
 * Composable for checking feature flags
 * @param {string} flagKey - The feature flag key
 * @param {boolean} defaultValue - Default value if flag is not found
 * @returns {Object} - { isEnabled, isLoading, refresh }
 */
export function useFeatureFlag(flagKey, defaultValue = false) {
  const isEnabled = ref(defaultValue);
  const isLoading = ref(false);

  const checkFlag = async () => {
    if (loadingFlags.value.has(flagKey)) {
      // Already loading, wait for it
      return;
    }

    isLoading.value = true;
    loadingFlags.value.add(flagKey);

    try {
      const context = getUserContext();
      const enabled = await OpenFeature.getBooleanValue(flagKey, defaultValue, context);
      isEnabled.value = enabled;
      flagCache[flagKey] = enabled;
    } catch (error) {
      console.error(`Error checking feature flag ${flagKey}:`, error);
      isEnabled.value = defaultValue;
    } finally {
      isLoading.value = false;
      loadingFlags.value.delete(flagKey);
    }
  };

  // Check flag on initialization - use cached value if available, otherwise fetch
  if (flagCache[flagKey] !== undefined) {
    isEnabled.value = flagCache[flagKey];
    // Still refresh in background to ensure we have latest value
    checkFlag();
  } else {
    checkFlag();
  }

  const refresh = () => {
    delete flagCache[flagKey];
    checkFlag();
  };

  // Register this flag's refresher for global updates
  activeFlagRefreshers.set(flagKey, refresh);

  return {
    isEnabled: computed(() => isEnabled.value),
    isLoading: computed(() => isLoading.value),
    refresh,
  };
}

/**
 * Check multiple feature flags at once
 * @param {string[]} flagKeys - Array of feature flag keys
 * @param {boolean} defaultValue - Default value if flag is not found
 * @returns {Object} - { flags, isLoading, refresh }
 */
export function useFeatureFlags(flagKeys, defaultValue = false) {
  const flags = ref({});
  const isLoading = ref(false);

  const checkFlags = async () => {
    isLoading.value = true;
    const context = getUserContext();

    try {
      const results = await Promise.all(
        flagKeys.map(async (key) => {
          try {
            const enabled = await OpenFeature.getBooleanValue(key, defaultValue, context);
            return { key, enabled };
          } catch (error) {
            console.error(`Error checking feature flag ${key}:`, error);
            return { key, enabled: defaultValue };
          }
        })
      );

      results.forEach(({ key, enabled }) => {
        flags.value[key] = enabled;
        flagCache[key] = enabled;
      });
    } catch (error) {
      console.error('Error checking feature flags:', error);
      flagKeys.forEach(key => {
        flags.value[key] = defaultValue;
      });
    } finally {
      isLoading.value = false;
    }
  };

  // Check flags on initialization
  checkFlags();

  const refresh = () => {
    flagKeys.forEach(key => {
      delete flagCache[key];
    });
    checkFlags();
  };

  return {
    flags: computed(() => flags.value),
    isLoading: computed(() => isLoading.value),
    refresh,
  };
}

/**
 * Check if a feature flag is enabled (synchronous, uses cache)
 * @param {string} flagKey - The feature flag key
 * @param {boolean} defaultValue - Default value if flag is not found
 * @returns {boolean}
 */
export function isFeatureEnabled(flagKey, defaultValue = false) {
  return flagCache[flagKey] ?? defaultValue;
}

