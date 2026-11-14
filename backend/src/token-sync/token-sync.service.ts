import { BadRequestException, Injectable, NotImplementedException } from '@nestjs/common';
import { AuthPrincipal } from '../auth/principal';
import { EncryptionService } from '../common/security/encryption.service';
import { DesignSystemService, Token } from '../design-system/design-system.service';
import { AUTO_SYNC_UNSUPPORTED, ConnectionRegistry, PublicConnection, StoredConnection, bool, httpUrl, oneOf, text } from './connection-registry';

export interface DesignToolToken {
  id: string;
  name: string;
  value: string;
  type: string;
  category?: string;
  description?: string;
  source: 'figma' | 'penpot' | 'adobe-xd';
  fileId?: string;
  fileUrl?: string;
  lastModified?: Date;
}

export interface TokenMapping {
  designToolTokenId: string;
  designSystemTokenName: string;
  autoMap?: boolean; // If true, automatically map tokens with matching names
}

export const TOKEN_SYNC_TOOLS = ['figma', 'penpot', 'adobe-xd'] as const;

/** As stored (in memory); `apiKey` is encrypted */
export interface TokenSyncConnection extends StoredConnection {
  name: string;
  tool: (typeof TOKEN_SYNC_TOOLS)[number];
  fileId?: string;
  fileUrl?: string;
  enabled: boolean;
  lastSync?: string;
  mappings: TokenMapping[];
}

/** As returned by the API: never the credential */
export type TokenSyncConnectionView = PublicConnection<TokenSyncConnection>;

/** Why sync can't run: the server has no Figma, Penpot or Adobe XD client */
export const TOKEN_SYNC_UNSUPPORTED =
  'Token sync is not implemented: this server has no Figma, Penpot or Adobe XD integration to read tokens from. Nothing was changed.';

function parseMappings(value: unknown): TokenMapping[] {
  if (!Array.isArray(value) || value.length > 1000) {
    throw new BadRequestException('mappings must be an array of at most 1000 mappings');
  }
  return value.map((m) => {
    const { designToolTokenId, designSystemTokenName, autoMap } = (m ?? {}) as Record<string, unknown>;
    if (typeof designToolTokenId !== 'string' || typeof designSystemTokenName !== 'string' || !designToolTokenId || !designSystemTokenName) {
      throw new BadRequestException('Each mapping needs designToolTokenId and designSystemTokenName');
    }
    return { designToolTokenId, designSystemTokenName, ...(typeof autoMap === 'boolean' ? { autoMap } : {}) };
  });
}

export interface TokenConflict {
  designToolToken: DesignToolToken;
  designSystemToken: Token;
  conflictType: 'value-mismatch' | 'type-mismatch' | 'name-collision';
  message: string;
}

export interface TokenValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface SyncResult {
  success: boolean;
  tokensAdded: number;
  tokensUpdated: number;
  tokensSkipped: number;
  conflicts: TokenConflict[];
  errors: string[];
  validationResults: TokenValidationResult[];
}

/**
 * Token sync connections, and the token checks (validation, mapping, conflict
 * detection) a sync would use. Reading tokens from a design tool is not
 * implemented, so sync, conflict resolution and auto-sync answer 501 instead
 * of reporting work that didn't happen.
 */
@Injectable()
export class TokenSyncService {
  private readonly registry: ConnectionRegistry<TokenSyncConnection>;

  constructor(
    private readonly designSystemService: DesignSystemService,
    encryption: EncryptionService,
  ) {
    this.registry = new ConnectionRegistry<TokenSyncConnection>(
      encryption,
      'conn',
      {
        name: text('name', 200),
        tool: oneOf('tool', TOKEN_SYNC_TOOLS),
        fileId: text('fileId', 300, true),
        fileUrl: httpUrl('fileUrl'),
        enabled: bool('enabled'),
        mappings: parseMappings,
      },
      ['name', 'tool'],
      () => ({ enabled: true, mappings: [] }),
    );
  }

  // Connection Management
  getAllConnections(principal: AuthPrincipal): TokenSyncConnectionView[] {
    return this.registry.list(principal);
  }

  getConnection(principal: AuthPrincipal, id: string): TokenSyncConnectionView {
    return this.registry.get(principal, id);
  }

  createConnection(principal: AuthPrincipal, body: unknown): TokenSyncConnectionView {
    return this.registry.create(principal, body);
  }

  updateConnection(principal: AuthPrincipal, id: string, body: unknown): TokenSyncConnectionView {
    return this.registry.update(principal, id, body);
  }

  deleteConnection(principal: AuthPrincipal, id: string): void {
    this.registry.delete(principal, id);
  }

  /** 501: there is no design tool client to read tokens from */
  syncTokens(principal: AuthPrincipal, connectionId: string): never {
    this.registry.require(principal, connectionId);
    throw new NotImplementedException(TOKEN_SYNC_UNSUPPORTED);
  }

  /** 501: conflicts come from a sync, which can't run (nothing is stored to resolve) */
  resolveConflict(_conflictId: string, _resolution: 'use-design-tool' | 'use-system' | 'merge'): never {
    throw new NotImplementedException(`Conflict resolution is not implemented. ${TOKEN_SYNC_UNSUPPORTED}`);
  }

  /** 501: there is no scheduler, and nothing to schedule */
  enableAutoSync(principal: AuthPrincipal, connectionId: string): never {
    this.registry.require(principal, connectionId);
    throw new NotImplementedException(AUTO_SYNC_UNSUPPORTED);
  }

  disableAutoSync(principal: AuthPrincipal, connectionId: string): TokenSyncConnectionView {
    return this.registry.disableAutoSync(principal, connectionId);
  }

  validateToken(token: DesignToolToken): TokenValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate token name
    if (!token.name || token.name.trim().length === 0) {
      errors.push('Token name is required');
    }

    // Validate token value
    if (!token.value || token.value.trim().length === 0) {
      errors.push('Token value is required');
    }

    // Validate token type
    const validTypes = ['color', 'dimension', 'fontFamily', 'fontSize', 'fontWeight', 'shadow', 'border'];
    if (!validTypes.includes(token.type)) {
      errors.push(`Invalid token type: ${token.type}. Must be one of: ${validTypes.join(', ')}`);
    }

    // Validate color format
    if (token.type === 'color' && !this.isValidColor(token.value)) {
      errors.push(`Invalid color value: ${token.value}`);
    }

    // Validate dimension format
    if (token.type === 'dimension' && !this.isValidDimension(token.value)) {
      warnings.push(`Dimension value may be invalid: ${token.value}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private isValidColor(value: string): boolean {
    // Check for hex, rgb, rgba, hsl, hsla, or named colors
    const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    const rgbPattern = /^rgba?\([\d\s,]+\)$/;
    const hslPattern = /^hsla?\([\d\s%,]+\)$/;
    const namedColors = ['transparent', 'currentColor'];
    
    return hexPattern.test(value) || 
           rgbPattern.test(value) || 
           hslPattern.test(value) || 
           namedColors.includes(value.toLowerCase());
  }

  private isValidDimension(value: string): boolean {
    // Check for valid CSS dimension (px, rem, em, %, etc.)
    const dimensionPattern = /^-?\d+(\.\d+)?(px|rem|em|%|vh|vw|ch|ex|cm|mm|in|pt|pc)$/;
    return dimensionPattern.test(value.trim());
  }

  mapTokens(designToolTokens: DesignToolToken[], mappings: TokenMapping[]): Array<{ designToolToken: DesignToolToken; designSystemTokenName: string }> {
    return designToolTokens.map(designToolToken => {
      // Check for explicit mapping
      const explicitMapping = mappings.find(m => m.designToolTokenId === designToolToken.id);
      if (explicitMapping) {
        return {
          designToolToken,
          designSystemTokenName: explicitMapping.designSystemTokenName,
        };
      }

      // Auto-map based on name similarity
      const autoMapping = this.autoMapToken(designToolToken);
      return {
        designToolToken,
        designSystemTokenName: autoMapping,
      };
    });
  }

  private autoMapToken(designToolToken: DesignToolToken): string {
    // Simple auto-mapping logic based on token name
    // In a real implementation, this would be more sophisticated
    const name = designToolToken.name.toLowerCase();
    
    // Map common patterns
    if (name.includes('primary') || name.includes('brand')) {
      return 'color.primary';
    }
    if (name.includes('secondary')) {
      return 'color.secondary';
    }
    if (name.includes('spacing') && name.includes('medium')) {
      return 'spacing.md';
    }
    if (name.includes('spacing') && name.includes('small')) {
      return 'spacing.sm';
    }
    if (name.includes('spacing') && name.includes('large')) {
      return 'spacing.lg';
    }
    if (name.includes('font') && name.includes('size') && name.includes('large')) {
      return 'typography.fontSize.lg';
    }

    // Default: create a new token name based on design tool token
    return this.generateTokenName(designToolToken);
  }

  private generateTokenName(token: DesignToolToken): string {
    // Convert design tool token name to design system token name format
    const parts = token.name.split(/[\/\-_]/).map(p => p.toLowerCase().trim());
    const category = token.category || parts[0] || 'custom';
    const name = parts.slice(1).join('.') || parts[0];
    return `${category}.${name}`;
  }

  detectConflicts(mappedTokens: Array<{ designToolToken: DesignToolToken; designSystemTokenName: string }>): TokenConflict[] {
    const conflicts: TokenConflict[] = [];
    const systemTokens = this.designSystemService.getAllTokens();

    for (const mapped of mappedTokens) {
      const systemToken = systemTokens.find(t => t.name === mapped.designSystemTokenName);
      
      if (systemToken) {
        // Check for value mismatch
        if (systemToken.value !== mapped.designToolToken.value) {
          conflicts.push({
            designToolToken: mapped.designToolToken,
            designSystemToken: systemToken,
            conflictType: 'value-mismatch',
            message: `Value mismatch: Design tool has "${mapped.designToolToken.value}" but system has "${systemToken.value}"`,
          });
        }

        // Check for type mismatch
        if (systemToken.type !== mapped.designToolToken.type) {
          conflicts.push({
            designToolToken: mapped.designToolToken,
            designSystemToken: systemToken,
            conflictType: 'type-mismatch',
            message: `Type mismatch: Design tool has type "${mapped.designToolToken.type}" but system has "${systemToken.type}"`,
          });
        }
      }
    }

    return conflicts;
  }
}
