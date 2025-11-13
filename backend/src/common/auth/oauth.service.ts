import { Injectable, Logger } from '@nestjs/common';
import { EncryptionService } from '../security/encryption.service';

export interface OAuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  tokenType: string;
  scope?: string[];
}

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  authorizationURL: string;
  tokenURL: string;
  callbackURL: string;
  scope?: string[];
}

/**
 * OAuth 2.0 service for external service integrations
 */
@Injectable()
export class OAuthService {
  private readonly logger = new Logger(OAuthService.name);
  private readonly tokens = new Map<string, OAuthToken>(); // serviceId -> token
  private readonly configs = new Map<string, OAuthConfig>(); // serviceId -> config

  constructor(
    private readonly encryptionService: EncryptionService,
  ) {}

  /**
   * Register OAuth configuration for a service
   */
  registerService(serviceId: string, config: OAuthConfig): void {
    // Encrypt client secret before storing
    const encryptedSecret = this.encryptionService.encrypt(config.clientSecret);
    this.configs.set(serviceId, {
      ...config,
      clientSecret: encryptedSecret,
    });
    this.logger.log(`Registered OAuth configuration for service: ${serviceId}`);
  }

  /**
   * Get authorization URL for OAuth flow
   */
  getAuthorizationUrl(serviceId: string, state?: string): string {
    const config = this.configs.get(serviceId);
    if (!config) {
      throw new Error(`OAuth configuration not found for service: ${serviceId}`);
    }

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.callbackURL,
      response_type: 'code',
      scope: config.scope?.join(' ') || '',
      ...(state && { state }),
    });

    return `${config.authorizationURL}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(
    serviceId: string,
    code: string,
  ): Promise<OAuthToken> {
    const config = this.configs.get(serviceId);
    if (!config) {
      throw new Error(`OAuth configuration not found for service: ${serviceId}`);
    }

    // Decrypt client secret
    const clientSecret = this.encryptionService.decrypt(config.clientSecret);

    // Exchange code for token (simplified - in production, use proper OAuth library)
    const tokenResponse = await this.requestToken(config.tokenURL, {
      grant_type: 'authorization_code',
      code,
      redirect_uri: config.callbackURL,
      client_id: config.clientId,
      client_secret: clientSecret,
    });

    const token: OAuthToken = {
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      expiresAt: new Date(Date.now() + (tokenResponse.expires_in * 1000)),
      tokenType: tokenResponse.token_type || 'Bearer',
      scope: tokenResponse.scope?.split(' ') || [],
    };

    // Encrypt tokens before storing
    const encryptedToken: OAuthToken = {
      ...token,
      accessToken: this.encryptionService.encrypt(token.accessToken),
      refreshToken: token.refreshToken ? this.encryptionService.encrypt(token.refreshToken) : undefined,
    };

    this.tokens.set(serviceId, encryptedToken);
    this.logger.log(`OAuth token obtained for service: ${serviceId}`);

    return token; // Return unencrypted token for immediate use
  }

  /**
   * Refresh an access token
   */
  async refreshToken(serviceId: string): Promise<OAuthToken> {
    const storedToken = this.tokens.get(serviceId);
    if (!storedToken || !storedToken.refreshToken) {
      throw new Error(`No refresh token available for service: ${serviceId}`);
    }

    const config = this.configs.get(serviceId);
    if (!config) {
      throw new Error(`OAuth configuration not found for service: ${serviceId}`);
    }

    // Decrypt tokens
    const refreshToken = this.encryptionService.decrypt(storedToken.refreshToken!);
    const clientSecret = this.encryptionService.decrypt(config.clientSecret);

    // Refresh token
    const tokenResponse = await this.requestToken(config.tokenURL, {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: config.clientId,
      client_secret: clientSecret,
    });

    const token: OAuthToken = {
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token || refreshToken, // Use new refresh token if provided
      expiresAt: new Date(Date.now() + (tokenResponse.expires_in * 1000)),
      tokenType: tokenResponse.token_type || 'Bearer',
      scope: tokenResponse.scope?.split(' ') || [],
    };

    // Encrypt and store
    const encryptedToken: OAuthToken = {
      ...token,
      accessToken: this.encryptionService.encrypt(token.accessToken),
      refreshToken: token.refreshToken ? this.encryptionService.encrypt(token.refreshToken) : undefined,
    };

    this.tokens.set(serviceId, encryptedToken);
    this.logger.log(`OAuth token refreshed for service: ${serviceId}`);

    return token;
  }

  /**
   * Get access token (refreshes if expired)
   */
  async getAccessToken(serviceId: string): Promise<string> {
    const storedToken = this.tokens.get(serviceId);
    if (!storedToken) {
      throw new Error(`No OAuth token found for service: ${serviceId}`);
    }

    // Check if token is expired (with 5 minute buffer)
    const buffer = 5 * 60 * 1000; // 5 minutes
    if (storedToken.expiresAt.getTime() < Date.now() + buffer) {
      // Token expired or about to expire, refresh it
      const refreshed = await this.refreshToken(serviceId);
      return refreshed.accessToken;
    }

    // Decrypt and return token
    return this.encryptionService.decrypt(storedToken.accessToken);
  }

  /**
   * Check if token is valid
   */
  isTokenValid(serviceId: string): boolean {
    const token = this.tokens.get(serviceId);
    if (!token) {
      return false;
    }

    // Check if expired (with 5 minute buffer)
    const buffer = 5 * 60 * 1000;
    return token.expiresAt.getTime() > Date.now() + buffer;
  }

  /**
   * Revoke OAuth token
   */
  async revokeToken(serviceId: string): Promise<void> {
    this.tokens.delete(serviceId);
    this.logger.log(`OAuth token revoked for service: ${serviceId}`);
  }

  /**
   * Request token from OAuth provider
   */
  private async requestToken(
    tokenURL: string,
    params: Record<string, string>,
  ): Promise<{
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type?: string;
    scope?: string;
  }> {
    const response = await fetch(tokenURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: new URLSearchParams(params),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to obtain OAuth token: ${response.status} ${errorText}`);
    }

    return response.json();
  }
}

