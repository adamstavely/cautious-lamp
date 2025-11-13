import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { OAuthService } from './oauth.service';

/**
 * Service for automatically refreshing OAuth tokens
 */
@Injectable()
export class TokenRefreshService implements OnModuleInit {
  private readonly logger = new Logger(TokenRefreshService.name);
  private refreshIntervals = new Map<string, NodeJS.Timeout>();

  constructor(private readonly oauthService: OAuthService) {}

  onModuleInit() {
    // Start monitoring tokens for refresh
    this.startTokenRefreshMonitoring();
  }

  /**
   * Start monitoring and refreshing tokens
   */
  private startTokenRefreshMonitoring(): void {
    // Check every 5 minutes for tokens that need refreshing
    setInterval(() => {
      this.checkAndRefreshTokens();
    }, 5 * 60 * 1000); // 5 minutes
  }

  /**
   * Check all tokens and refresh if needed
   */
  private async checkAndRefreshTokens(): Promise<void> {
    // This would iterate through all registered services
    // For now, it's a placeholder that can be extended
    this.logger.debug('Checking tokens for refresh...');
  }

  /**
   * Register a service for automatic token refresh
   */
  registerServiceRefresh(serviceId: string, refreshIntervalMs: number = 60 * 60 * 1000): void {
    // Clear existing interval if any
    const existing = this.refreshIntervals.get(serviceId);
    if (existing) {
      clearInterval(existing);
    }

    // Set up automatic refresh
    const interval = setInterval(async () => {
      try {
        if (!this.oauthService.isTokenValid(serviceId)) {
          await this.oauthService.refreshToken(serviceId);
          this.logger.log(`Auto-refreshed token for service: ${serviceId}`);
        }
      } catch (error) {
        this.logger.error(`Failed to auto-refresh token for service ${serviceId}:`, error);
      }
    }, refreshIntervalMs);

    this.refreshIntervals.set(serviceId, interval);
    this.logger.log(`Registered automatic token refresh for service: ${serviceId}`);
  }

  /**
   * Unregister service refresh
   */
  unregisterServiceRefresh(serviceId: string): void {
    const interval = this.refreshIntervals.get(serviceId);
    if (interval) {
      clearInterval(interval);
      this.refreshIntervals.delete(serviceId);
      this.logger.log(`Unregistered automatic token refresh for service: ${serviceId}`);
    }
  }

  /**
   * Cleanup on module destroy
   */
  onModuleDestroy(): void {
    for (const interval of this.refreshIntervals.values()) {
      clearInterval(interval);
    }
    this.refreshIntervals.clear();
  }
}

