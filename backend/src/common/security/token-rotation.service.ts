import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { KeyManagementService, ApiKeyMetadata } from './key-management.service';
import { SecurityAuditService } from './security-audit.service';
import { TokenRotationPolicy, TokenRotationHistory, DEFAULT_TOKEN_POLICY } from './token-policy.interface';

/**
 * Service for managing token rotation
 */
@Injectable()
export class TokenRotationService {
  private readonly logger = new Logger(TokenRotationService.name);
  private readonly rotationHistory: TokenRotationHistory[] = [];
  private readonly policies = new Map<string, TokenRotationPolicy>();

  constructor(
    private readonly keyManagementService: KeyManagementService,
    private readonly securityAuditService: SecurityAuditService,
  ) {
    // Set default policy for all tokens
    this.policies.set('default', DEFAULT_TOKEN_POLICY);
  }

  /**
   * Set rotation policy for a token type
   */
  setPolicy(tokenType: string, policy: Partial<TokenRotationPolicy>): void {
    const existingPolicy = this.policies.get(tokenType) || DEFAULT_TOKEN_POLICY;
    this.policies.set(tokenType, {
      ...existingPolicy,
      ...policy,
    });
    this.logger.log(`Updated rotation policy for ${tokenType}`);
  }

  /**
   * Get rotation policy
   */
  getPolicy(tokenType: string = 'default'): TokenRotationPolicy {
    return this.policies.get(tokenType) || DEFAULT_TOKEN_POLICY;
  }

  /**
   * Rotate a token
   */
  async rotateToken(
    tokenId: string,
    userId: string,
    reason: 'manual' | 'automatic' | 'expired' | 'compromised' = 'manual',
    revokeOld: boolean = true,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ newKey: string; newMetadata: ApiKeyMetadata }> {
    const oldMetadata = this.keyManagementService.getKeyMetadata(tokenId);
    if (!oldMetadata) {
      throw new NotFoundException(`Token with ID ${tokenId} not found`);
    }

    // Check if token is eligible for rotation
    const policy = this.getPolicy();
    if (!policy.allowManualRotation && reason === 'manual') {
      throw new BadRequestException('Manual token rotation is not allowed');
    }

    // Rotate the token
    const result = this.keyManagementService.rotateKey(tokenId, revokeOld);
    if (!result) {
      throw new BadRequestException('Failed to rotate token');
    }

    // Record rotation history
    const history: TokenRotationHistory = {
      tokenId,
      rotatedAt: new Date(),
      rotatedBy: userId,
      reason,
      oldTokenHash: oldMetadata.keyHash,
      newTokenId: result.newMetadata.id,
    };
    this.rotationHistory.push(history);

    // Log security event
    await this.securityAuditService.logTokenRotation(
      userId,
      tokenId,
      ipAddress,
      userAgent,
    );

    this.logger.log(`Token rotated: ${tokenId} -> ${result.newMetadata.id} by ${userId} (${reason})`);

    return result;
  }

  /**
   * Check if a token needs rotation
   */
  needsRotation(tokenId: string): { needsRotation: boolean; reason?: string } {
    const metadata = this.keyManagementService.getKeyMetadata(tokenId);
    if (!metadata) {
      return { needsRotation: false };
    }

    const policy = this.getPolicy();
    const now = Date.now();
    const createdAt = metadata.createdAt.getTime();
    const age = now - createdAt;

    // Check if token has exceeded max age
    if (age > policy.maxAge) {
      return {
        needsRotation: true,
        reason: `Token has exceeded maximum age of ${policy.maxAge / (24 * 60 * 60 * 1000)} days`,
      };
    }

    // Check if token needs rotation based on frequency
    if (age > policy.rotationFrequency) {
      return {
        needsRotation: true,
        reason: `Token has exceeded rotation frequency of ${policy.rotationFrequency / (24 * 60 * 60 * 1000)} days`,
      };
    }

    // Check if token is expired
    if (metadata.expiresAt && metadata.expiresAt.getTime() < now) {
      const gracePeriodEnd = metadata.expiresAt.getTime() + policy.gracePeriod;
      if (now > gracePeriodEnd) {
        return {
          needsRotation: true,
          reason: 'Token has expired and grace period has ended',
        };
      }
    }

    return { needsRotation: false };
  }

  /**
   * Get tokens that need rotation
   */
  getTokensNeedingRotation(): Array<{ tokenId: string; metadata: ApiKeyMetadata; reason: string }> {
    const allKeys = this.keyManagementService.getAllKeys();
    const tokensNeedingRotation: Array<{ tokenId: string; metadata: ApiKeyMetadata; reason: string }> = [];

    for (const metadata of allKeys) {
      if (metadata.revoked) {
        continue;
      }

      const check = this.needsRotation(metadata.id);
      if (check.needsRotation && check.reason) {
        tokensNeedingRotation.push({
          tokenId: metadata.id,
          metadata,
          reason: check.reason,
        });
      }
    }

    return tokensNeedingRotation;
  }

  /**
   * Automatically rotate tokens that need rotation
   */
  async autoRotateTokens(userId: string = 'system'): Promise<number> {
    const policy = this.getPolicy();
    if (!policy.autoRotate) {
      this.logger.debug('Auto-rotation is disabled');
      return 0;
    }

    const tokensNeedingRotation = this.getTokensNeedingRotation();
    let rotated = 0;

    for (const { tokenId, reason } of tokensNeedingRotation) {
      try {
        await this.rotateToken(tokenId, userId, 'automatic', true);
        rotated++;
        this.logger.log(`Auto-rotated token: ${tokenId} - ${reason}`);
      } catch (error) {
        this.logger.error(`Failed to auto-rotate token ${tokenId}:`, error);
      }
    }

    if (rotated > 0) {
      this.logger.log(`Auto-rotated ${rotated} tokens`);
    }

    return rotated;
  }

  /**
   * Get rotation history for a token
   */
  getRotationHistory(tokenId: string): TokenRotationHistory[] {
    return this.rotationHistory.filter(h => h.tokenId === tokenId || h.newTokenId === tokenId);
  }

  /**
   * Get all rotation history
   */
  getAllRotationHistory(limit: number = 100): TokenRotationHistory[] {
    return this.rotationHistory
      .sort((a, b) => b.rotatedAt.getTime() - a.rotatedAt.getTime())
      .slice(0, limit);
  }
}

