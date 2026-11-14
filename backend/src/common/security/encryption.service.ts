import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import * as crypto from 'crypto';

/**
 * Salt for deriving a key from a passphrase ENCRYPTION_KEY. It must never
 * change: every replica and every restart has to derive the same key, or data
 * encrypted earlier can't be decrypted. Secrecy comes from the passphrase.
 */
const PASSPHRASE_SALT = 'cautious-lamp/encryption-key/v1';
const PBKDF2_ITERATIONS = 100000;

/** Environments where a missing ENCRYPTION_KEY is replaced by a random one */
function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
}

/**
 * The 32-byte key for an ENCRYPTION_KEY value: 64 hex characters or 44
 * base64 characters are used as they are; anything else is a passphrase,
 * stretched with PBKDF2 and a fixed salt so the result is the same everywhere.
 */
export function deriveEncryptionKey(value: string): { key: Buffer; format: 'hex' | 'base64' | 'passphrase' } {
  if (/^[0-9a-fA-F]{64}$/.test(value)) {
    return { key: Buffer.from(value, 'hex'), format: 'hex' };
  }
  if (/^[A-Za-z0-9+/]{43}=$/.test(value)) {
    return { key: Buffer.from(value, 'base64'), format: 'base64' };
  }
  return {
    key: crypto.pbkdf2Sync(value, PASSPHRASE_SALT, PBKDF2_ITERATIONS, 32, 'sha256'),
    format: 'passphrase',
  };
}

/**
 * Encryption service for sensitive data at rest
 * Uses AES-256-GCM for authenticated encryption
 */
@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32; // 256 bits
  private readonly ivLength = 16; // 128 bits
  /** Null outside development when ENCRYPTION_KEY is missing: encrypting and decrypting then fail */
  private readonly encryptionKey: Buffer | null;

  constructor() {
    const keyFromEnv = process.env.ENCRYPTION_KEY?.trim();
    if (!keyFromEnv) {
      if (isDevelopment()) {
        this.logger.warn(
          'ENCRYPTION_KEY is not set: using a random key, so anything encrypted is unreadable after a restart. ' +
            'Generate one with: openssl rand -hex 32',
        );
        this.encryptionKey = crypto.randomBytes(this.keyLength);
      } else {
        this.logger.error('ENCRYPTION_KEY is not set: storing or reading encrypted credentials will fail');
        this.encryptionKey = null;
      }
      return;
    }

    const { key, format } = deriveEncryptionKey(keyFromEnv);
    if (format === 'passphrase') {
      this.logger.warn('ENCRYPTION_KEY is a passphrase; a random 32-byte key (openssl rand -hex 32) is stronger');
    }
    if (key.length !== this.keyLength) {
      throw new Error(`Encryption key must be ${this.keyLength} bytes`);
    }
    this.encryptionKey = key;
  }

  private requireKey(): Buffer {
    if (!this.encryptionKey) {
      throw new ServiceUnavailableException('Encryption is not configured on this server (ENCRYPTION_KEY)');
    }
    return this.encryptionKey;
  }

  /**
   * Encrypt sensitive data
   * @param plaintext - Data to encrypt
   * @returns Encrypted data as base64 string (format: iv:tag:encrypted)
   */
  encrypt(plaintext: string): string {
    if (!plaintext) {
      return plaintext;
    }
    const key = this.requireKey();

    try {
      // Generate random IV for each encryption
      const iv = crypto.randomBytes(this.ivLength);
      
      // Create cipher
      const cipher = crypto.createCipheriv(this.algorithm, key, iv);
      
      // Encrypt
      let encrypted = cipher.update(plaintext, 'utf8', 'base64');
      encrypted += cipher.final('base64');
      
      // Get authentication tag
      const tag = cipher.getAuthTag();
      
      // Return format: iv:tag:encrypted (all base64)
      return `${iv.toString('base64')}:${tag.toString('base64')}:${encrypted}`;
    } catch (error) {
      this.logger.error('Encryption failed', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt sensitive data
   * @param encryptedData - Encrypted data in format: iv:tag:encrypted
   * @returns Decrypted plaintext
   */
  decrypt(encryptedData: string): string {
    if (!encryptedData) {
      return encryptedData;
    }
    const key = this.requireKey();

    try {
      // Parse the encrypted data format: iv:tag:encrypted
      const parts = encryptedData.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }

      const [ivBase64, tagBase64, encrypted] = parts;
      const iv = Buffer.from(ivBase64, 'base64');
      const tag = Buffer.from(tagBase64, 'base64');
      
      // Create decipher
      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
      decipher.setAuthTag(tag);
      
      // Decrypt
      let decrypted = decipher.update(encrypted, 'base64', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      this.logger.error('Decryption failed', error);
      throw new Error('Failed to decrypt data - data may be corrupted or key may be incorrect');
    }
  }

  /**
   * Check if a string is encrypted (has the expected format)
   */
  isEncrypted(data: string): boolean {
    if (!data || typeof data !== 'string') {
      return false;
    }
    const parts = data.split(':');
    return parts.length === 3 && parts.every(part => {
      try {
        Buffer.from(part, 'base64');
        return true;
      } catch {
        return false;
      }
    });
  }

  /**
   * Generate a new encryption key (for key rotation)
   * @returns Hex-encoded encryption key
   */
  generateKey(): string {
    const key = crypto.randomBytes(this.keyLength);
    return key.toString('hex');
  }
}

