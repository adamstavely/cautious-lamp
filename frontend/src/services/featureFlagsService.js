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

/** How long a loaded flag list is used before it is fetched again */
export const FLAG_TTL_MS = 60 * 1000;
const SESSION_KEY = 'featureFlags';

/**
 * OpenFeature-compatible provider. Every flag comes from one list request
 * (GET /feature-flags), shared by every caller: the list is kept for
 * FLAG_TTL_MS (in sessionStorage too, so reloading pages in quick succession
 * doesn't fetch it again), and callers that ask while it is loading wait for
 * the same request. A key that isn't in the list doesn't exist, so its
 * callers get their default without another request.
 */
class DesignSystemFeatureFlagProvider {
  constructor() {
    this.flags = null; // Map of key → flag, once loaded
    this.lastFetch = 0;
    this.inFlight = null;
    this.restore();
  }

  restore() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
      if (saved && Array.isArray(saved.flags) && Date.now() - saved.fetchedAt < FLAG_TTL_MS) {
        this.flags = new Map(saved.flags.map((flag) => [flag.key, flag]));
        this.lastFetch = saved.fetchedAt;
      }
    } catch {
      // No storage (private mode): load from the API
    }
  }

  isFresh() {
    return !!this.flags && Date.now() - this.lastFetch < FLAG_TTL_MS;
  }

  /** The flag list: cached while fresh, one shared request otherwise (or always, with force) */
  async loadAll({ force = false } = {}) {
    if (!force && this.isFresh()) return this.flags;
    if (this.inFlight) return this.inFlight;
    if (!isMockAuth() && !getToken()) throw signedOutError();
    this.inFlight = apiClient
      .get(`${API_BASE_URL}/api/v1/feature-flags`)
      .then((response) => {
        const list = Array.isArray(response.data) ? response.data : [];
        this.flags = new Map(list.map((flag) => [flag.key, flag]));
        this.lastFetch = Date.now();
        try {
          sessionStorage.setItem(SESSION_KEY, JSON.stringify({ fetchedAt: this.lastFetch, flags: list }));
        } catch {
          // Kept in memory only
        }
        return this.flags;
      })
      .finally(() => {
        this.inFlight = null;
      });
    return this.inFlight;
  }

  // A stored flag decides; the caller's default applies only when the flag
  // doesn't exist or can't be loaded
  async getBooleanValue(flagKey, defaultValue = false, context = {}) {
    try {
      const flag = await this.getFlag(flagKey);
      if (!flag) return defaultValue;
      return evaluateFlag(flag, context);
    } catch (error) {
      // Signed out is expected (the sign-in page); flags are read again after sign-in
      if (error?.code !== 'SIGNED_OUT') console.error(`Error getting feature flag ${flagKey}:`, error);
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

  /** One flag, or null when no such flag exists */
  async getFlag(flagKey) {
    const flags = await this.loadAll();
    return flags.get(flagKey) ?? null;
  }

  /** Every flag (for preloading); an empty list when signed out or unavailable */
  async getAllFlags() {
    try {
      return [...(await this.loadAll()).values()];
    } catch (error) {
      if (error?.code !== 'SIGNED_OUT') console.warn('Error loading feature flags:', error);
      return [];
    }
  }

  /** Reload the list when it is stale; `force` reloads it now (after a flag changed) */
  async refreshCache({ force = false } = {}) {
    if (!isMockAuth() && !getToken()) return;
    try {
      await this.loadAll({ force });
    } catch (error) {
      // Keep what is cached; flags that can't be loaded fall back to each caller's default
      console.warn('Error refreshing feature flags cache:', error);
    }
  }

  clearCache() {
    this.flags = null;
    this.lastFetch = 0;
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // Nothing stored
    }
  }
}

// Singleton instance
const featureFlagProvider = new DesignSystemFeatureFlagProvider();

// Keep the list current while the app is open (one request per interval at most)
if (typeof window !== 'undefined') {
  setInterval(() => featureFlagProvider.refreshCache(), 5 * 60 * 1000);
}

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
  getAllFlags: () => featureFlagProvider.getAllFlags(),
  refreshCache: (options) => {
    return featureFlagProvider.refreshCache(options);
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
    featureFlagProvider.refreshCache({ force: true });
  });
}

