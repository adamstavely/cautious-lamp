import { Injectable } from '@nestjs/common';
import { DesignSystemService, Token } from '../design-system/design-system.service';

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

export interface TokenSyncConnection {
  id: string;
  name: string;
  tool: 'figma' | 'penpot' | 'adobe-xd';
  apiKey?: string;
  fileId?: string;
  fileUrl?: string;
  enabled: boolean;
  autoSync: boolean;
  syncInterval?: number; // in minutes
  lastSync?: Date;
  mappings: TokenMapping[];
  createdAt: Date;
  updatedAt: Date;
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

@Injectable()
export class TokenSyncService {
  private connections = new Map<string, TokenSyncConnection>();
  private designToolTokens = new Map<string, DesignToolToken[]>();

  constructor(private readonly designSystemService: DesignSystemService) {
    // Initialize with sample connections
    this.connections.set('conn-1', {
      id: 'conn-1',
      name: 'Figma Design System',
      tool: 'figma',
      fileId: 'figma-file-123',
      fileUrl: 'https://www.figma.com/file/123',
      enabled: true,
      autoSync: false,
      mappings: [],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
    });

    this.connections.set('conn-2', {
      id: 'conn-2',
      name: 'Penpot Tokens',
      tool: 'penpot',
      fileId: 'penpot-file-456',
      fileUrl: 'https://penpot.app/file/456',
      enabled: false,
      autoSync: false,
      mappings: [],
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-10'),
    });
  }

  // Connection Management
  getAllConnections(): TokenSyncConnection[] {
    return Array.from(this.connections.values());
  }

  getConnection(id: string): TokenSyncConnection | null {
    return this.connections.get(id) || null;
  }

  createConnection(connection: Omit<TokenSyncConnection, 'id' | 'createdAt' | 'updatedAt'>): TokenSyncConnection {
    const id = `conn-${Date.now()}`;
    const newConnection: TokenSyncConnection = {
      ...connection,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.connections.set(id, newConnection);
    return newConnection;
  }

  updateConnection(id: string, updates: Partial<TokenSyncConnection>): TokenSyncConnection | null {
    const connection = this.connections.get(id);
    if (!connection) return null;

    const updated = {
      ...connection,
      ...updates,
      updatedAt: new Date(),
    };
    this.connections.set(id, updated);
    return updated;
  }

  deleteConnection(id: string): boolean {
    return this.connections.delete(id);
  }

  // Token Sync Operations
  async syncTokens(connectionId: string): Promise<SyncResult> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return {
        success: false,
        tokensAdded: 0,
        tokensUpdated: 0,
        tokensSkipped: 0,
        conflicts: [],
        errors: ['Connection not found'],
        validationResults: [],
      };
    }

    // Fetch tokens from design tool (mock implementation)
    const designToolTokens = await this.fetchTokensFromDesignTool(connection);
    
    // Validate tokens
    const validationResults = designToolTokens.map(token => this.validateToken(token));
    
    // Map tokens to design system tokens
    const mappedTokens = this.mapTokens(designToolTokens, connection.mappings);
    
    // Check for conflicts
    const conflicts = this.detectConflicts(mappedTokens);
    
    // Apply mappings and sync
    const syncResult = await this.applySync(mappedTokens, conflicts);
    
    // Update last sync time
    this.updateConnection(connectionId, { lastSync: new Date() });

    return {
      success: conflicts.length === 0,
      tokensAdded: syncResult.added,
      tokensUpdated: syncResult.updated,
      tokensSkipped: syncResult.skipped,
      conflicts,
      errors: syncResult.errors,
      validationResults,
    };
  }

  private async fetchTokensFromDesignTool(connection: TokenSyncConnection): Promise<DesignToolToken[]> {
    // Mock implementation - in real scenario, this would call the design tool API
    const mockTokens: DesignToolToken[] = [
      {
        id: 'figma-token-1',
        name: 'Primary',
        value: '#4f46e5',
        type: 'color',
        category: 'colors',
        description: 'Primary brand color',
        source: connection.tool,
        fileId: connection.fileId,
        lastModified: new Date(),
      },
      {
        id: 'figma-token-2',
        name: 'Spacing/Medium',
        value: '16px',
        type: 'dimension',
        category: 'spacing',
        description: 'Medium spacing',
        source: connection.tool,
        fileId: connection.fileId,
        lastModified: new Date(),
      },
      {
        id: 'figma-token-3',
        name: 'Typography/Heading/Large',
        value: '2rem',
        type: 'fontSize',
        category: 'typography',
        description: 'Large heading font size',
        source: connection.tool,
        fileId: connection.fileId,
        lastModified: new Date(),
      },
    ];

    // Store tokens for this connection
    this.designToolTokens.set(connection.id, mockTokens);
    return mockTokens;
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

  async applySync(
    mappedTokens: Array<{ designToolToken: DesignToolToken; designSystemTokenName: string }>,
    conflicts: TokenConflict[],
  ): Promise<{ added: number; updated: number; skipped: number; errors: string[] }> {
    let added = 0;
    let updated = 0;
    let skipped = 0;
    const errors: string[] = [];

    const conflictTokenNames = new Set(conflicts.map(c => c.designSystemToken.name));
    const systemTokens = this.designSystemService.getAllTokens();

    for (const mapped of mappedTokens) {
      // Skip tokens with conflicts
      if (conflictTokenNames.has(mapped.designSystemTokenName)) {
        skipped++;
        continue;
      }

      const existingToken = systemTokens.find(t => t.name === mapped.designSystemTokenName);

      if (existingToken) {
        // Update existing token
        // In a real implementation, this would update the token in the design system service
        updated++;
      } else {
        // Add new token
        // In a real implementation, this would add the token to the design system service
        added++;
      }
    }

    return { added, updated, skipped, errors };
  }

  // Conflict Resolution
  resolveConflict(conflictId: string, resolution: 'use-design-tool' | 'use-system' | 'merge'): boolean {
    // In a real implementation, this would resolve the conflict
    return true;
  }

  // Auto-sync management
  enableAutoSync(connectionId: string, intervalMinutes: number): boolean {
    const connection = this.connections.get(connectionId);
    if (!connection) return false;

    this.updateConnection(connectionId, {
      autoSync: true,
      syncInterval: intervalMinutes,
    });

    // In a real implementation, this would set up a scheduled job
    return true;
  }

  disableAutoSync(connectionId: string): boolean {
    const connection = this.connections.get(connectionId);
    if (!connection) return false;

    this.updateConnection(connectionId, {
      autoSync: false,
      syncInterval: undefined,
    });

    return true;
  }
}

