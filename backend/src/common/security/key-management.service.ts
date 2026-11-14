import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import { DocumentStore, VersionConflictError } from '../../reviews/document-store';

/** Elasticsearch index holding API keys created through the API (docs/AUTH.md) */
export const API_KEYS_INDEX = 'design-system-api-keys';
/** Injection token for the API key store */
export const API_KEY_STORE = Symbol('API_KEY_STORE');

/** Keys created through the API start with this, so other credentials never cost a lookup */
export const MANAGED_KEY_PREFIX = 'dsk_';
const MANAGED_KEY_PATTERN = /^dsk_[A-Za-z0-9_-]{43}$/;
const KEY_ID_PATTERN = /^key_[0-9a-f]{32}$/;

/** How long a key lookup is reused before reading storage again (other replicas see revocations within this) */
export const API_KEY_CACHE_MS = 30_000;
/** `lastUsed` is written at most this often per key */
const LAST_USED_WRITE_MS = 60 * 60 * 1000;

export type RotationReason = 'manual' | 'automatic' | 'expired' | 'compromised';

/** A stored key: only the SHA-256 hash of the secret is kept */
export interface ApiKeyDoc {
  /** `key_` + the first 32 hex characters of the hash, so a key is found from its secret with one read */
  id: string;
  name: string;
  keyHash: string;
  createdAt: string;
  createdBy?: string;
  lastUsed?: string;
  expiresAt?: string;
  revoked: boolean;
  revokedAt?: string;
  scopes?: string[];
  metadata?: Record<string, unknown>;
  /** Set on a key made by rotating another */
  rotatedFrom?: { keyId: string; at: string; by: string; reason: RotationReason };
}

export const API_KEY_PROPERTIES = {
  id: { type: 'keyword' },
  name: { type: 'keyword' },
  keyHash: { type: 'keyword' },
  createdAt: { type: 'date' },
  expiresAt: { type: 'date' },
  revoked: { type: 'boolean' },
  scopes: { type: 'keyword' },
};

export interface ApiKeyMetadata {
  id: string;
  name: string;
  keyHash: string; // SHA-256 hash of the key (for validation)
  createdAt: Date;
  createdBy?: string;
  lastUsed?: Date;
  expiresAt?: Date;
  revoked: boolean;
  revokedAt?: Date;
  scopes?: string[];
  metadata?: Record<string, unknown>;
  rotatedFrom?: { keyId: string; at: Date; by: string; reason: RotationReason };
}

/** Who a credential belongs to, as far as API keys go */
export interface ResolvedApiKey {
  id: string;
  name: string;
  scopes?: string[];
}

function toMetadata(doc: ApiKeyDoc): ApiKeyMetadata {
  const date = (value?: string) => (value ? new Date(value) : undefined);
  return {
    id: doc.id,
    name: doc.name,
    keyHash: doc.keyHash,
    createdAt: new Date(doc.createdAt),
    createdBy: doc.createdBy,
    lastUsed: date(doc.lastUsed),
    expiresAt: date(doc.expiresAt),
    revoked: doc.revoked,
    revokedAt: date(doc.revokedAt),
    scopes: doc.scopes,
    metadata: doc.metadata,
    rotatedFrom: doc.rotatedFrom ? { ...doc.rotatedFrom, at: new Date(doc.rotatedFrom.at) } : undefined,
  };
}

/**
 * API key lifecycle (docs/AUTH.md). Keys from API_KEYS and ADMIN_API_KEY come
 * from the environment; keys created at runtime are stored hashed in
 * Elasticsearch, so they work on every replica and survive restarts.
 */
@Injectable()
export class KeyManagementService {
  private readonly logger = new Logger(KeyManagementService.name);
  /** Lookups by key hash, including misses */
  private readonly cache = new Map<string, { doc: ApiKeyDoc | null; expires: number }>();

  /** Keys configured through API_KEYS (comma-separated), by hash */
  private readonly configuredKeys = new Map<string, { id: string; name: string }>();

  constructor(@Inject(API_KEY_STORE) private readonly store: DocumentStore<ApiKeyDoc>) {
    (process.env.API_KEYS ?? '')
      .split(',')
      .map((key) => key.trim())
      .filter(Boolean)
      .forEach((key, index) => {
        const hash = this.hashKey(key);
        this.configuredKeys.set(hash, { id: `api-keys-${hash.slice(0, 12)}`, name: `API_KEYS key ${index + 1}` });
      });
    if (this.configuredKeys.size === 0) {
      this.logger.warn('API_KEYS is not set: only keys created through the API will be accepted');
    }
  }

  /**
   * Whether a key is one of the configured keys or a live managed key
   */
  async isValidApiKey(apiKey: string | undefined): Promise<boolean> {
    if (!apiKey) return false;
    return (await this.resolveApiKey(apiKey)) !== null;
  }

  /**
   * Who a key belongs to: a configured key (no scopes) or a live managed key
   * with its scopes. Null for anything else, including the admin key.
   */
  async resolveApiKey(apiKey: string | undefined): Promise<ResolvedApiKey | null> {
    if (!apiKey) return null;
    const configured = this.configuredKeys.get(this.hashKey(apiKey));
    if (configured) return { ...configured };
    const managed = await this.validateKey(apiKey);
    return managed ? { id: managed.id, name: managed.name, scopes: managed.scopes } : null;
  }

  /**
   * Whether a key matches ADMIN_API_KEY. Admin routes are closed when it isn't set.
   */
  isAdminKey(apiKey: string | undefined): boolean {
    const adminKey = process.env.ADMIN_API_KEY;
    if (!adminKey || !apiKey) return false;
    const expected = Buffer.from(this.hashKey(adminKey));
    const actual = Buffer.from(this.hashKey(apiKey));
    return crypto.timingSafeEqual(expected, actual);
  }

  /**
   * Throws unless the Authorization header carries a valid API key.
   * @deprecated Routes are authenticated by the global AuthGuard, which also
   * accepts user tokens (docs/AUTH.md); use `@RequirePermission` instead.
   */
  async assertValidApiKey(authHeader: string | undefined): Promise<void> {
    if (!(await this.isValidApiKey(KeyManagementService.extractKey(authHeader)))) {
      throw new UnauthorizedException('Invalid or missing API key');
    }
  }

  /**
   * Throws unless the Authorization header carries the admin key.
   * @deprecated Use `@RequirePermission(Permission.ADMIN_USERS)`, which the admin key and admins pass.
   */
  assertAdminKey(authHeader: string | undefined): void {
    if (!this.isAdminKey(KeyManagementService.extractKey(authHeader))) {
      throw new UnauthorizedException('Admin API key required');
    }
  }

  static extractKey(authHeader: string | undefined): string | undefined {
    if (!authHeader) return undefined;
    return authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
  }

  /**
   * Create a new API key. Only its hash is stored; the key itself is returned once.
   * Which scopes a caller may grant is decided by the API key routes.
   */
  async createKey(
    name: string,
    options?: {
      expiresInDays?: number;
      scopes?: string[];
      metadata?: Record<string, unknown>;
      createdBy?: string;
      rotatedFrom?: ApiKeyDoc['rotatedFrom'];
    },
  ): Promise<{ key: string; metadata: ApiKeyMetadata }> {
    const key = this.generateSecureKey();
    const keyHash = this.hashKey(key);
    const doc: ApiKeyDoc = {
      id: this.idForHash(keyHash),
      name,
      keyHash,
      createdAt: new Date().toISOString(),
      createdBy: options?.createdBy,
      expiresAt: options?.expiresInDays
        ? new Date(Date.now() + options.expiresInDays * 24 * 60 * 60 * 1000).toISOString()
        : undefined,
      revoked: false,
      scopes: options?.scopes,
      metadata: options?.metadata,
      rotatedFrom: options?.rotatedFrom,
    };

    await this.store.create(doc);
    this.cache.delete(keyHash);
    this.logger.log(`Created API key: ${doc.id} (${name})`);

    return { key, metadata: toMetadata(doc) };
  }

  /**
   * The live managed key with this secret, or null (unknown, revoked or expired)
   */
  async validateKey(apiKey: string): Promise<ApiKeyMetadata | null> {
    if (!MANAGED_KEY_PATTERN.test(apiKey)) return null;
    const keyHash = this.hashKey(apiKey);
    const doc = await this.lookup(keyHash);
    if (!doc || doc.revoked || doc.keyHash !== keyHash) {
      return null;
    }
    if (doc.expiresAt && new Date(doc.expiresAt) < new Date()) {
      this.logger.warn(`API key ${doc.id} has expired`);
      return null;
    }
    this.touch(doc);
    return toMetadata(doc);
  }

  /**
   * Revoke an API key. False when there is no such key.
   */
  async revokeKey(keyId: string): Promise<boolean> {
    const doc = await this.mutate(keyId, (current) => {
      if (current.revoked) return false;
      current.revoked = true;
      current.revokedAt = new Date().toISOString();
      return true;
    });
    if (!doc) return false;
    this.logger.log(`Revoked API key: ${keyId}`);
    return true;
  }

  /**
   * Rotate an API key (create new, optionally revoke old). Null when there is no such key.
   */
  async rotateKey(
    keyId: string,
    revokeOld: boolean = true,
    rotation: { by: string; reason: RotationReason } = { by: 'system', reason: 'manual' },
  ): Promise<{ newKey: string; newMetadata: ApiKeyMetadata } | null> {
    const old = KEY_ID_PATTERN.test(keyId) ? (await this.store.get(keyId))?.doc : undefined;
    if (!old) {
      return null;
    }

    // Create new key with same scopes and metadata
    const { key: newKey, metadata: newMetadata } = await this.createKey(old.name, {
      scopes: old.scopes,
      metadata: old.metadata,
      createdBy: rotation.by,
      rotatedFrom: { keyId, at: new Date().toISOString(), by: rotation.by, reason: rotation.reason },
    });

    // Revoke old key if requested
    if (revokeOld) {
      await this.revokeKey(keyId);
    }

    this.logger.log(`Rotated API key: ${keyId} -> ${newMetadata.id}`);
    return { newKey, newMetadata };
  }

  /**
   * Every managed key (metadata only: the secret itself is never stored)
   */
  async getAllKeys(): Promise<ApiKeyMetadata[]> {
    return (await this.store.list()).map(toMetadata);
  }

  /**
   * Get key metadata by ID
   */
  async getKeyMetadata(keyId: string): Promise<ApiKeyMetadata | undefined> {
    if (!KEY_ID_PATTERN.test(keyId)) return undefined;
    const doc = (await this.store.get(keyId))?.doc;
    return doc ? toMetadata(doc) : undefined;
  }

  /**
   * Revokes keys past their expiry date
   */
  async cleanupExpiredKeys(): Promise<number> {
    let cleaned = 0;
    const now = new Date();

    for (const metadata of await this.getAllKeys()) {
      if (metadata.expiresAt && metadata.expiresAt < now && !metadata.revoked) {
        if (await this.revokeKey(metadata.id)) cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.log(`Cleaned up ${cleaned} expired API keys`);
    }

    return cleaned;
  }

  /** The stored key for a hash (or null), cached for API_KEY_CACHE_MS */
  private async lookup(keyHash: string): Promise<ApiKeyDoc | null> {
    const cached = this.cache.get(keyHash);
    if (cached && cached.expires > Date.now()) return cached.doc;
    const doc = (await this.store.get(this.idForHash(keyHash)))?.doc ?? null;
    this.cache.set(keyHash, { doc, expires: Date.now() + API_KEY_CACHE_MS });
    return doc;
  }

  /** Records use at most hourly, in the background; a lost write only leaves lastUsed older */
  private touch(doc: ApiKeyDoc): void {
    const last = doc.lastUsed ? new Date(doc.lastUsed).getTime() : 0;
    if (Date.now() - last < LAST_USED_WRITE_MS) return;
    const lastUsed = new Date().toISOString();
    doc.lastUsed = lastUsed;
    void this.mutate(doc.id, (current) => {
      current.lastUsed = lastUsed;
      return true;
    }, 1).catch(() => undefined);
  }

  /**
   * Read-modify-write with optimistic concurrency. `change` returns false to
   * skip the write. Returns the document (changed or not), or null if missing.
   */
  private async mutate(keyId: string, change: (doc: ApiKeyDoc) => boolean, attempts = 5): Promise<ApiKeyDoc | null> {
    if (!KEY_ID_PATTERN.test(keyId)) return null;
    for (let attempt = 1; ; attempt++) {
      const stored = await this.store.get(keyId);
      if (!stored) return null;
      const doc = stored.doc;
      if (!change(doc)) return doc;
      try {
        await this.store.replace(doc, stored.version);
        this.cache.delete(doc.keyHash);
        return doc;
      } catch (error) {
        if (!(error instanceof VersionConflictError) || attempt >= attempts) throw error;
      }
    }
  }

  private idForHash(keyHash: string): string {
    return `key_${keyHash.slice(0, 32)}`;
  }

  /**
   * Generate a secure random API key: the prefix and 32 random bytes, base64url
   */
  private generateSecureKey(): string {
    return MANAGED_KEY_PREFIX + crypto.randomBytes(32).toString('base64url');
  }

  /**
   * Hash an API key for storage/comparison
   */
  private hashKey(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
  }
}
