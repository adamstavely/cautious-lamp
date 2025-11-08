import { ref, computed } from 'vue';
import OpenFeature from '../services/featureFlagsService';

// Cache for feature flag states
const flagCache = ref({});
const loadingFlags = ref(new Set());

// Get current user context (can be enhanced with actual user data)
const getUserContext = () => {
  // In a real app, this would get from auth service
  const userId = localStorage.getItem('userId') || undefined;
  const userGroups = localStorage.getItem('userGroups') 
    ? JSON.parse(localStorage.getItem('userGroups'))
    : undefined;
  
  return { userId, userGroups };
};

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
      flagCache.value[flagKey] = enabled;
    } catch (error) {
      console.error(`Error checking feature flag ${flagKey}:`, error);
      isEnabled.value = defaultValue;
    } finally {
      isLoading.value = false;
      loadingFlags.value.delete(flagKey);
    }
  };

  // Check flag on initialization
  if (flagCache.value[flagKey] !== undefined) {
    isEnabled.value = flagCache.value[flagKey];
  } else {
    checkFlag();
  }

  const refresh = () => {
    delete flagCache.value[flagKey];
    checkFlag();
  };

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
        flagCache.value[key] = enabled;
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
      delete flagCache.value[key];
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
  return flagCache.value[flagKey] ?? defaultValue;
}

