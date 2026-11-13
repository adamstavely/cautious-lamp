import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';

/** Access tokens are valid for 8 hours and never refreshed (docs/AUTH.md) */
export const TOKEN_TTL_SECONDS = 8 * 60 * 60;

export interface TokenClaims {
  /** User id */
  sub: string;
  /** The user's tokenVersion when the token was issued */
  tv: number;
}

/** Environments where a missing AUTH_JWT_SECRET is replaced by a random one */
function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
}

/** Issues and verifies HS256 access tokens signed with AUTH_JWT_SECRET */
@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);
  private readonly jwt: JwtService | null;

  constructor() {
    let secret = process.env.AUTH_JWT_SECRET?.trim();
    if (!secret && isDevelopment()) {
      secret = randomBytes(32).toString('hex');
      this.logger.warn('AUTH_JWT_SECRET is not set: using a random secret, so sign-ins end when the server restarts');
    } else if (!secret) {
      this.logger.error('AUTH_JWT_SECRET is not set: sign-in is disabled. API keys still work.');
    }
    this.jwt = secret
      ? new JwtService({
          secret,
          signOptions: { algorithm: 'HS256', expiresIn: TOKEN_TTL_SECONDS },
          verifyOptions: { algorithms: ['HS256'] },
        })
      : null;
  }

  async issue(claims: TokenClaims): Promise<{ accessToken: string; expiresAt: string }> {
    if (!this.jwt) throw new ServiceUnavailableException('Sign-in is not configured on this server');
    const accessToken = await this.jwt.signAsync({ sub: claims.sub, tv: claims.tv });
    const { exp } = this.jwt.decode(accessToken) as { exp: number };
    return { accessToken, expiresAt: new Date(exp * 1000).toISOString() };
  }

  /** The claims of a valid, unexpired token, else null */
  async verify(token: string): Promise<TokenClaims | null> {
    if (!this.jwt) return null;
    try {
      const payload = await this.jwt.verifyAsync<Partial<TokenClaims>>(token);
      if (typeof payload.sub !== 'string' || typeof payload.tv !== 'number') return null;
      return { sub: payload.sub, tv: payload.tv };
    } catch {
      return null;
    }
  }
}
