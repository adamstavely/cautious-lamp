/**
 * Token rotation policy definitions
 */

export interface TokenRotationPolicy {
  maxAge: number; // Maximum age in milliseconds
  rotationFrequency: number; // Rotation frequency in milliseconds
  requireRotation: boolean; // Whether rotation is required
  allowManualRotation: boolean; // Whether manual rotation is allowed
  autoRotate: boolean; // Whether to automatically rotate expired tokens
  gracePeriod: number; // Grace period after expiration in milliseconds
}

export interface TokenRotationHistory {
  tokenId: string;
  rotatedAt: Date;
  rotatedBy: string;
  reason: 'manual' | 'automatic' | 'expired' | 'compromised';
  oldTokenHash: string;
  newTokenId: string;
}

export const DEFAULT_TOKEN_POLICY: TokenRotationPolicy = {
  maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
  rotationFrequency: 30 * 24 * 60 * 60 * 1000, // 30 days
  requireRotation: false,
  allowManualRotation: true,
  autoRotate: false,
  gracePeriod: 7 * 24 * 60 * 60 * 1000, // 7 days grace period
};

