import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

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
  private readonly saltLength = 64; // 512 bits
  private readonly tagLength = 16; // 128 bits
  private readonly encryptionKey: Buffer;

  constructor() {
    const keyFromEnv = process.env.ENCRYPTION_KEY;
    if (!keyFromEnv) {
      this.logger.warn(
        'ENCRYPTION_KEY not set in environment. Using default key (NOT SECURE FOR PRODUCTION). ' +
        'Set ENCRYPTION_KEY environment variable with a 32-byte hex string or 64-character hex string.'
      );
      // Generate a default key for development (NOT SECURE)
      this.encryptionKey = crypto.randomBytes(this.keyLength);
    } else {
      // Support both hex string and base64 encoded keys
      try {
        if (keyFromEnv.length === 64) {
          // Hex string (64 chars = 32 bytes)
          this.encryptionKey = Buffer.from(keyFromEnv, 'hex');
        } else if (keyFromEnv.length === 44) {
          // Base64 string
          this.encryptionKey = Buffer.from(keyFromEnv, 'base64');
        } else {
          // Derive key from password using PBKDF2
          const salt = crypto.randomBytes(this.saltLength);
          this.encryptionKey = crypto.pbkdf2Sync(keyFromEnv, salt, 100000, this.keyLength, 'sha256');
        }
      } catch (error) {
        this.logger.error('Failed to parse encryption key from environment', error);
        throw new Error('Invalid ENCRYPTION_KEY format');
      }
    }

    if (this.encryptionKey.length !== this.keyLength) {
      throw new Error(`Encryption key must be ${this.keyLength} bytes`);
    }
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

    try {
      // Generate random IV for each encryption
      const iv = crypto.randomBytes(this.ivLength);
      
      // Create cipher
      const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);
      
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
      const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv);
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

