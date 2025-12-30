import NodeCache from 'node-cache';
import { logger } from './logger';

const CACHE_ENABLED = process.env.CACHE_ENABLED !== 'false';
const CACHE_TTL_DEFAULT = parseInt(process.env.CACHE_TTL_DEFAULT || '300', 10);

// TTL configuration per resource type (in seconds)
const TTL_CONFIG: Record<string, number> = {
  tokens: 300,        // 5 minutes
  components: 120,    // 2 minutes
  patterns: 300,      // 5 minutes
  compliance: 600,    // 10 minutes
  assets: 60,         // 1 minute
  reviews: 30,        // 30 seconds
  documentation: 600, // 10 minutes
};

interface CacheStats {
  hits: number;
  misses: number;
  keys: number;
}

class Cache {
  private cache: NodeCache;
  private stats: CacheStats;

  constructor() {
    this.cache = new NodeCache({
      stdTTL: CACHE_TTL_DEFAULT,
      checkperiod: 60, // Check for expired keys every 60 seconds
      useClones: false, // Better performance, but be careful with mutations
    });

    this.stats = {
      hits: 0,
      misses: 0,
      keys: 0,
    };

    // Track cache events
    this.cache.on('set', () => {
      this.stats.keys = this.cache.keys().length;
    });

    this.cache.on('del', () => {
      this.stats.keys = this.cache.keys().length;
    });

    this.cache.on('expired', (key) => {
      logger.debug('Cache key expired', { key });
    });
  }

  /**
   * Generate cache key from resource type and parameters
   */
  private generateKey(resourceType: string, params?: Record<string, any>): string {
    if (!params || Object.keys(params).length === 0) {
      return resourceType;
    }

    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}=${String(params[key])}`)
      .join('&');

    return `${resourceType}:${sortedParams}`;
  }

  /**
   * Get TTL for a resource type
   */
  private getTTL(resourceType: string): number {
    return TTL_CONFIG[resourceType] || CACHE_TTL_DEFAULT;
  }

  /**
   * Get value from cache
   */
  get<T>(resourceType: string, params?: Record<string, any>): T | undefined {
    if (!CACHE_ENABLED) {
      return undefined;
    }

    const key = this.generateKey(resourceType, params);
    const value = this.cache.get<T>(key);

    if (value !== undefined) {
      this.stats.hits++;
      logger.debug('Cache hit', { key, resourceType });
      return value;
    }

    this.stats.misses++;
    logger.debug('Cache miss', { key, resourceType });
    return undefined;
  }

  /**
   * Set value in cache
   */
  set<T>(resourceType: string, value: T, params?: Record<string, any>, customTTL?: number): boolean {
    if (!CACHE_ENABLED) {
      return false;
    }

    const key = this.generateKey(resourceType, params);
    const ttl = customTTL || this.getTTL(resourceType);

    const success = this.cache.set(key, value, ttl);
    
    if (success) {
      logger.debug('Cache set', { key, resourceType, ttl });
    } else {
      logger.warn('Cache set failed', { key, resourceType });
    }

    return success;
  }

  /**
   * Delete value from cache
   */
  delete(resourceType: string, params?: Record<string, any>): number {
    if (!CACHE_ENABLED) {
      return 0;
    }

    const key = this.generateKey(resourceType, params);
    const deleted = this.cache.del(key);

    if (deleted > 0) {
      logger.debug('Cache deleted', { key, resourceType });
    }

    return deleted;
  }

  /**
   * Clear all cache entries for a resource type
   */
  clearResourceType(resourceType: string): number {
    if (!CACHE_ENABLED) {
      return 0;
    }

    const keys = this.cache.keys();
    const pattern = new RegExp(`^${resourceType}(:|$)`);
    let deleted = 0;

    keys.forEach((key) => {
      if (pattern.test(key)) {
        this.cache.del(key);
        deleted++;
      }
    });

    if (deleted > 0) {
      logger.debug('Cache cleared for resource type', { resourceType, deleted });
    }

    return deleted;
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.flushAll();
    this.stats.keys = 0;
    logger.info('Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats & { hitRate: number; enabled: boolean } {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? this.stats.hits / total : 0;

    return {
      ...this.stats,
      hitRate,
      enabled: CACHE_ENABLED,
    };
  }

  /**
   * Check if cache is enabled
   */
  isEnabled(): boolean {
    return CACHE_ENABLED;
  }
}

export const cache = new Cache();


