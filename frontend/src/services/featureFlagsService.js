import apiClient from './api.js';
import { getToken, isMockAuth } from './auth.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

// Flags are read with the signed-in user's token; signed out, there is nothing to read.
const signedOutError = () => Object.assign(new Error('Not signed in'), { code: 'SIGNED_OUT' });

const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

/**
 * Whether a flag is on for a user, the same rule as evaluateFlag in the
 * backend's feature-flags.service.ts: off when disabled; with targeting, on
 * only for listed users, listed groups, or users inside the percentage rollout.
 */
export function evaluateFlag(flag, context = {}) {
  if (!flag?.enabled) return false;
  const { users, groups, percentage } = flag.targeting ?? {};
  if (!users?.length && !groups?.length && percentage === undefined) return true;
  const { userId, userGroups } = context;
  if (userId && users?.includes(userId)) return true;
  if (userGroups?.some((group) => groups?.includes(group))) return true;
  if (percentage !== undefined) return userId ? (hashString(userId) % 100) + 1 <= percentage : percentage >= 100;
  return false;
}

// Simple OpenFeature-compatible provider
class DesignSystemFeatureFlagProvider {
  constructor() {
    this.flagsCache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    this.lastFetch = 0;
  }

  // A stored flag decides; the caller's default applies only when the flag
  // doesn't exist or can't be loaded
  async getBooleanValue(flagKey, defaultValue = false, context = {}) {
    try {
      const flag = await this.getFlag(flagKey);
      if (!flag) return defaultValue;
      return evaluateFlag(flag, context);
    } catch (error) {
      console.error(`Error getting feature flag ${flagKey}:`, error);
      return defaultValue;
    }
  }

  async getStringValue(flagKey, defaultValue = '', context = {}) {
    const boolValue = await this.getBooleanValue(flagKey, false, context);
    return boolValue ? 'enabled' : defaultValue;
  }

  async getNumberValue(flagKey, defaultValue = 0, context = {}) {
    const boolValue = await this.getBooleanValue(flagKey, false, context);
    return boolValue ? 1 : defaultValue;
  }

  async getFlag(flagKey) {
    // Check cache first
    const cached = this.flagsCache.get(flagKey);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.flag;
    }

    if (!isMockAuth() && !getToken()) throw signedOutError();

    // Fetch from API
    try {
      const response = await apiClient.get(`${API_BASE_URL}/api/v1/feature-flags/key/${flagKey}`);
      const flag = response.data;
      
      // Cache the flag
      this.flagsCache.set(flagKey, {
        flag,
        timestamp: Date.now(),
      });

      return flag;
    } catch (error) {
      if (error.response?.status === 404) {
        // No such flag: remembered as missing, so callers use their default
        this.flagsCache.set(flagKey, { flag: null, timestamp: Date.now() });
        return null;
      }
      throw error;
    }
  }

  async refreshCache() {
    if (!isMockAuth() && !getToken()) return;
    try {
      const response = await apiClient.get(`${API_BASE_URL}/api/v1/feature-flags`);
      const flags = response.data;
      
      // Update cache
      flags.forEach(flag => {
        this.flagsCache.set(flag.key, {
          flag,
          timestamp: Date.now(),
        });
      });

      this.lastFetch = Date.now();
    } catch (error) {
      // Keep what is cached; flags that can't be loaded fall back to each caller's default
      console.warn('Error refreshing feature flags cache:', error);
    }
  }

  clearCache() {
    this.flagsCache.clear();
    this.lastFetch = 0;
  }
}

// Singleton instance
const featureFlagProvider = new DesignSystemFeatureFlagProvider();

// Initialize cache on load
featureFlagProvider.refreshCache().catch(err => {
  console.warn('Failed to initialize feature flags cache:', err);
});

// Refresh cache periodically
setInterval(() => {
  featureFlagProvider.refreshCache().catch(err => {
    console.warn('Failed to refresh feature flags cache:', err);
  });
}, 5 * 60 * 1000); // Every 5 minutes

export default featureFlagProvider;

// OpenFeature-compatible API
export const OpenFeature = {
  getBooleanValue: (flagKey, defaultValue = false, context = {}) => {
    return featureFlagProvider.getBooleanValue(flagKey, defaultValue, context);
  },
  getStringValue: (flagKey, defaultValue = '', context = {}) => {
    return featureFlagProvider.getStringValue(flagKey, defaultValue, context);
  },
  getNumberValue: (flagKey, defaultValue = 0, context = {}) => {
    return featureFlagProvider.getNumberValue(flagKey, defaultValue, context);
  },
  refreshCache: () => {
    return featureFlagProvider.refreshCache();
  },
  clearCache: () => {
    return featureFlagProvider.clearCache();
  },
};

// Expose OpenFeature to window and listen for flag update events
if (typeof window !== 'undefined') {
  window.OpenFeature = OpenFeature;
  
  // Listen for flag update events
  window.addEventListener('feature-flags-updated', () => {
    featureFlagProvider.refreshCache().catch(err => {
      console.warn('Failed to refresh feature flags cache after update:', err);
    });
  });
}

