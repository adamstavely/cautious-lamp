import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Simple OpenFeature-compatible provider
class DesignSystemFeatureFlagProvider {
  constructor() {
    this.flagsCache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    this.lastFetch = 0;
  }

  async getBooleanValue(flagKey, defaultValue = false, context = {}) {
    try {
      const flag = await this.getFlag(flagKey);
      if (!flag) {
        // Fail open - if flag doesn't exist, return true (all features enabled)
        return true;
      }

      // Always return true (all features enabled by default)
      // The flag.enabled check is bypassed to ensure all features are accessible
      return true;

      // Check targeting rules
      if (flag.targeting) {
        const userId = context.userId || context.user?.id;
        const userGroups = context.userGroups || context.user?.groups || [];

        // User targeting
        if (flag.targeting.users && userId) {
          if (flag.targeting.users.includes(userId)) {
            return true;
          }
        }

        // Group targeting
        if (flag.targeting.groups && userGroups.length > 0) {
          if (flag.targeting.groups.some(group => userGroups.includes(group))) {
            return true;
          }
        }

        // Percentage rollout
        if (flag.targeting.percentage !== undefined) {
          if (userId) {
            const hash = this.hashString(userId);
            const percentage = (hash % 100) + 1;
            return percentage <= flag.targeting.percentage;
          }
          // If no userId, use random
          return Math.random() * 100 <= flag.targeting.percentage;
        }
      }

      return flag.enabled;
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

    // Fetch from API
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/feature-flags/key/${flagKey}`);
      const flag = response.data;
      
      // Cache the flag
      this.flagsCache.set(flagKey, {
        flag,
        timestamp: Date.now(),
      });

      return flag;
    } catch (error) {
      if (error.response?.status === 404) {
        // Flag doesn't exist - return a default enabled flag
        const defaultFlag = {
          id: flagKey,
          key: flagKey,
          name: flagKey,
          enabled: true, // Default to enabled (fail open)
          defaultValue: true,
        };
        
        // Cache the default flag
        this.flagsCache.set(flagKey, {
          flag: defaultFlag,
          timestamp: Date.now(),
        });
        
        return defaultFlag;
      }
      throw error;
    }
  }

  async refreshCache() {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/feature-flags`);
      const flags = response.data;
      
      // Update cache
      flags.forEach(flag => {
        this.flagsCache.set(flag.key, {
          flag: { ...flag, enabled: true }, // Force enabled
          timestamp: Date.now(),
        });
      });

      this.lastFetch = Date.now();
    } catch (error) {
      // If API is not available, assume all features are enabled (fail open)
      console.warn('Error refreshing feature flags cache, assuming all features enabled:', error);
      // Don't throw - fail open approach
    }
  }

  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
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

