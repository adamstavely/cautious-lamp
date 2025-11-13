import { ref, computed, watch, reactive } from 'vue';
import OpenFeature from '../services/featureFlagsService';

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

// Get current user context (can be enhanced with actual user data)
// Defined early to avoid hoisting issues
const getUserContext = () => {
  // In a real app, this would get from auth service
  const userId = localStorage.getItem('userId') || undefined;
  const userGroups = localStorage.getItem('userGroups') 
    ? JSON.parse(localStorage.getItem('userGroups'))
    : undefined;
  
  return { userId, userGroups };
};

// Preload all flags from API on initialization
const preloadAllFlags = async () => {
  try {
    const context = getUserContext();
    // Get all flags from the service
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/v1/feature-flags`);
    if (response.ok) {
      const flags = await response.json();
      // Populate flagCache with all flags
      flags.forEach(flag => {
        // Check if flag is enabled and respects targeting
        if (!flag.enabled) {
          flagCache[flag.key] = false;
          return;
        }
        
        // Check targeting rules
        let enabled = flag.enabled;
        if (flag.targeting) {
          const userId = context.userId;
          const userGroups = context.userGroups || [];
          
          // User targeting
          if (flag.targeting.users && userId) {
            enabled = flag.targeting.users.includes(userId);
            if (enabled) {
              flagCache[flag.key] = true;
              return;
            }
          }
          
          // Group targeting
          if (flag.targeting.groups && userGroups.length > 0) {
            enabled = flag.targeting.groups.some(group => userGroups.includes(group));
            if (enabled) {
              flagCache[flag.key] = true;
              return;
            }
          }
          
          // Percentage rollout
          if (flag.targeting.percentage !== undefined) {
            if (userId) {
              const hash = hashString(userId);
              const percentage = (hash % 100) + 1;
              enabled = percentage <= flag.targeting.percentage;
            } else {
              enabled = Math.random() * 100 <= flag.targeting.percentage;
            }
          }
        }
        
        flagCache[flag.key] = enabled;
      });
    }
  } catch (error) {
    console.warn('Failed to preload feature flags:', error);
  }
};

// Hash function for percentage rollout
const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

// Preload flags on initialization
if (typeof window !== 'undefined') {
  preloadAllFlags();
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

