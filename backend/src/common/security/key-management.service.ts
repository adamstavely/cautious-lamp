import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { EncryptionService } from './encryption.service';

export interface ApiKeyMetadata {
  id: string;
  name: string;
  keyHash: string; // SHA-256 hash of the key (for validation)
  encryptedKey?: string; // Encrypted key (if storing for rotation)
  createdAt: Date;
  lastUsed?: Date;
  expiresAt?: Date;
  revoked: boolean;
  revokedAt?: Date;
  scopes?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Service for managing API key lifecycle
 */
@Injectable()
export class KeyManagementService {
  private readonly logger = new Logger(KeyManagementService.name);
  private readonly keys = new Map<string, ApiKeyMetadata>();

  constructor(private readonly encryptionService: EncryptionService) {}

  /**
   * Create a new API key
   */
  createKey(
    name: string,
    options?: {
      expiresInDays?: number;
      scopes?: string[];
      metadata?: Record<string, unknown>;
    }
  ): { key: string; metadata: ApiKeyMetadata } {
    // Generate a secure random key
    const key = this.generateSecureKey();
    const keyHash = this.hashKey(key);
    const id = `key-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const metadata: ApiKeyMetadata = {
      id,
      name,
      keyHash,
      encryptedKey: this.encryptionService.encrypt(key), // Store encrypted for rotation
      createdAt: new Date(),
      expiresAt: options?.expiresInDays
        ? new Date(Date.now() + options.expiresInDays * 24 * 60 * 60 * 1000)
        : undefined,
      revoked: false,
      scopes: options?.scopes,
      metadata: options?.metadata,
    };

    this.keys.set(id, metadata);
    this.logger.log(`Created API key: ${id} (${name})`);

    return { key, metadata };
  }

  /**
   * Validate an API key
   */
  validateKey(apiKey: string): ApiKeyMetadata | null {
    const keyHash = this.hashKey(apiKey);

    for (const metadata of this.keys.values()) {
      if (metadata.keyHash === keyHash && !metadata.revoked) {
        // Check expiration
        if (metadata.expiresAt && metadata.expiresAt < new Date()) {
          this.logger.warn(`API key ${metadata.id} has expired`);
          return null;
        }

        // Update last used
        metadata.lastUsed = new Date();
        this.keys.set(metadata.id, metadata);

        return metadata;
      }
    }

    return null;
  }

  /**
   * Revoke an API key
   */
  revokeKey(keyId: string): boolean {
    const metadata = this.keys.get(keyId);
    if (!metadata) {
      return false;
    }

    metadata.revoked = true;
    metadata.revokedAt = new Date();
    this.keys.set(keyId, metadata);
    this.logger.log(`Revoked API key: ${keyId}`);

    return true;
  }

  /**
   * Rotate an API key (create new, optionally revoke old)
   */
  rotateKey(
    keyId: string,
    revokeOld: boolean = true
  ): { newKey: string; newMetadata: ApiKeyMetadata } | null {
    const oldMetadata = this.keys.get(keyId);
    if (!oldMetadata) {
      return null;
    }

    // Create new key with same scopes and metadata
    const { key: newKey, metadata: newMetadata } = this.createKey(oldMetadata.name, {
      scopes: oldMetadata.scopes,
      metadata: oldMetadata.metadata,
    });

    // Revoke old key if requested
    if (revokeOld) {
      this.revokeKey(keyId);
    }

    this.logger.log(`Rotated API key: ${keyId} -> ${newMetadata.id}`);
    return { newKey, newMetadata };
  }

  /**
   * Get all keys (metadata only, no actual keys)
   */
  getAllKeys(): ApiKeyMetadata[] {
    return Array.from(this.keys.values()).map(meta => ({
      ...meta,
      encryptedKey: undefined, // Don't expose encrypted keys
    }));
  }

  /**
   * Get key metadata by ID
   */
  getKeyMetadata(keyId: string): ApiKeyMetadata | undefined {
    const metadata = this.keys.get(keyId);
    if (!metadata) {
      return undefined;
    }

    return {
      ...metadata,
      encryptedKey: undefined, // Don't expose encrypted keys
    };
  }

  /**
   * Clean up expired keys
   */
  cleanupExpiredKeys(): number {
    let cleaned = 0;
    const now = new Date();

    for (const [id, metadata] of this.keys.entries()) {
      if (metadata.expiresAt && metadata.expiresAt < now && !metadata.revoked) {
        this.revokeKey(id);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.log(`Cleaned up ${cleaned} expired API keys`);
    }

    return cleaned;
  }

  /**
   * Generate a secure random API key
   */
  private generateSecureKey(): string {
    // Generate 32 bytes (256 bits) of random data
    const bytes = crypto.randomBytes(32);
    // Return as base64url encoded string (URL-safe)
    return bytes.toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
      .substring(0, 43); // 43 chars = 32 bytes in base64
  }

  /**
   * Hash an API key for storage/comparison
   */
  private hashKey(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
  }
}

