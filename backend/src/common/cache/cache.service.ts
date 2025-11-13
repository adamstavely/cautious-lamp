import { Injectable, Logger } from '@nestjs/common';

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
}

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  accessCount: number;
  lastAccessed: number;
}

/**
 * In-memory cache service with TTL and LRU eviction
 */
@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly cache = new Map<string, CacheEntry<unknown>>();
  private readonly defaultTtl = 5 * 60 * 1000; // 5 minutes
  private readonly defaultMaxSize = 1000;

  /**
   * Get value from cache
   */
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return undefined;
    }

    // Check if expired
    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return undefined;
    }

    // Update access metadata
    entry.accessCount++;
    entry.lastAccessed = Date.now();

    return entry.value as T;
  }

  /**
   * Set value in cache
   */
  set<T>(key: string, value: T, options?: CacheOptions): void {
    const ttl = options?.ttl || this.defaultTtl;
    const maxSize = options?.maxSize || this.defaultMaxSize;

    // Evict if at max size
    if (this.cache.size >= maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    const entry: CacheEntry<T> = {
      value,
      expiresAt: Date.now() + ttl,
      accessCount: 0,
      lastAccessed: Date.now(),
    };

    this.cache.set(key, entry);
  }

  /**
   * Delete value from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }
    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    entries: Array<{ key: string; accessCount: number; age: number }>;
  } {
    const entries = Array.from(this.cache.entries())
      .map(([key, entry]) => ({
        key,
        accessCount: entry.accessCount,
        age: Date.now() - (entry.expiresAt - (entry.expiresAt - entry.lastAccessed)),
      }))
      .sort((a, b) => b.accessCount - a.accessCount);

    const totalAccesses = entries.reduce((sum, e) => sum + e.accessCount, 0);
    const hitRate = entries.length > 0 ? totalAccesses / entries.length : 0;

    return {
      size: this.cache.size,
      maxSize: this.defaultMaxSize,
      hitRate,
      entries: entries.slice(0, 10), // Top 10 most accessed
    };
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let lruKey: string | undefined;
    let lruTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < lruTime) {
        lruTime = entry.lastAccessed;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
      this.logger.debug(`Evicted LRU cache entry: ${lruKey}`);
    }
  }

  /**
   * Clean up expired entries (should be called periodically)
   */
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.debug(`Cleaned up ${cleaned} expired cache entries`);
    }

    return cleaned;
  }
}

