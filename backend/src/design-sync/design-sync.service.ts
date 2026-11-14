import { BadRequestException, Injectable, NotImplementedException } from '@nestjs/common';
import { AuthPrincipal } from '../auth/principal';
import { EncryptionService } from '../common/security/encryption.service';
import { Component, Token } from '../design-system/design-system.service';
import {
  AUTO_SYNC_UNSUPPORTED,
  ConnectionRegistry,
  PublicConnection,
  StoredConnection,
  bool,
  httpUrl,
  oneOf,
  text,
} from '../token-sync/connection-registry';

export interface DesignFile {
  id: string;
  name: string;
  tool: 'figma' | 'penpot';
  fileId: string;
  fileUrl: string;
  version: string;
  lastModified: Date;
  components: DesignComponent[];
  tokens: DesignToken[];
  metadata?: {
    frameCount?: number;
    pageCount?: number;
    componentCount?: number;
  };
}

export interface DesignComponent {
  id: string;
  name: string;
  type: string;
  description?: string;
  properties: ComponentProperty[];
  styles: ComponentStyles;
  layout: ComponentLayout;
  sourceFile: string;
  sourceVersion: string;
  lastSynced?: Date;
}

export interface ComponentProperty {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'color' | 'enum';
  defaultValue?: any;
  required?: boolean;
  options?: string[];
  description?: string;
}

export interface ComponentStyles {
  colors?: {
    background?: string;
    text?: string;
    border?: string;
  };
  typography?: {
    fontFamily?: string;
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
  };
  spacing?: {
    padding?: string;
    margin?: string;
    gap?: string;
  };
  border?: {
    radius?: string;
    width?: string;
    style?: string;
  };
  shadow?: string;
}

export interface ComponentLayout {
  width?: string;
  height?: string;
  minWidth?: string;
  minHeight?: string;
  maxWidth?: string;
  maxHeight?: string;
  flexDirection?: 'row' | 'column';
  alignItems?: string;
  justifyContent?: string;
}

export interface DesignToken {
  id: string;
  name: string;
  value: string;
  type: string;
  category?: string;
  description?: string;
  sourceFile: string;
  sourceVersion: string;
}

export const DESIGN_SYNC_TOOLS = ['figma', 'penpot'] as const;
export const SYNC_DIRECTIONS = ['design-to-code', 'code-to-design', 'bidirectional'] as const;

/** As stored (in memory); `apiKey` is encrypted */
export interface DesignSyncConnection extends StoredConnection {
  name: string;
  tool: (typeof DESIGN_SYNC_TOOLS)[number];
  fileId: string;
  fileUrl?: string;
  enabled: boolean;
  syncDirection: (typeof SYNC_DIRECTIONS)[number];
  lastSync?: string;
  lastSyncVersion?: string;
  syncHistory: SyncHistoryEntry[];
}

/** As returned by the API: never the credential */
export type DesignSyncConnectionView = PublicConnection<DesignSyncConnection>;

/** Why nothing can be fetched or synced: the server has no Figma or Penpot client */
export const DESIGN_SYNC_UNSUPPORTED =
  'Design sync is not implemented: this server has no Figma or Penpot integration to read design files from or write them to. Nothing was changed.';

export interface SyncHistoryEntry {
  id: string;
  timestamp: Date;
  direction: 'design-to-code' | 'code-to-design';
  componentsAdded: number;
  componentsUpdated: number;
  componentsRemoved: number;
  tokensAdded: number;
  tokensUpdated: number;
  tokensRemoved: number;
  version: string;
  status: 'success' | 'partial' | 'failed';
  errors?: string[];
}

export interface SyncResult {
  success: boolean;
  direction: 'design-to-code' | 'code-to-design' | 'bidirectional';
  components: {
    added: Component[];
    updated: Component[];
    removed: string[];
  };
  tokens: {
    added: Token[];
    updated: Token[];
    removed: string[];
  };
  version: string;
  errors: string[];
  warnings: string[];
}

/**
 * Design sync connections. Fetching design files and syncing in either
 * direction need a Figma or Penpot integration this server doesn't have, so
 * those routes answer 501 instead of returning sample data as if it were the
 * user's file.
 */
@Injectable()
export class DesignSyncService {
  private readonly registry: ConnectionRegistry<DesignSyncConnection>;

  constructor(encryption: EncryptionService) {
    this.registry = new ConnectionRegistry<DesignSyncConnection>(
      encryption,
      'sync',
      {
        name: text('name', 200),
        tool: oneOf('tool', DESIGN_SYNC_TOOLS),
        fileId: text('fileId', 300),
        fileUrl: httpUrl('fileUrl'),
        enabled: bool('enabled'),
        syncDirection: oneOf('syncDirection', SYNC_DIRECTIONS),
      },
      ['name', 'tool', 'fileId'],
      () => ({ enabled: true, syncDirection: 'design-to-code', syncHistory: [] }),
    );
  }

  getAllConnections(principal: AuthPrincipal): DesignSyncConnectionView[] {
    return this.registry.list(principal);
  }

  getConnection(principal: AuthPrincipal, id: string): DesignSyncConnectionView {
    return this.registry.get(principal, id);
  }

  createConnection(principal: AuthPrincipal, body: unknown): DesignSyncConnectionView {
    return this.registry.create(principal, body);
  }

  updateConnection(principal: AuthPrincipal, id: string, body: unknown): DesignSyncConnectionView {
    return this.registry.update(principal, id, body);
  }

  deleteConnection(principal: AuthPrincipal, id: string): void {
    this.registry.delete(principal, id);
  }

  /** 501: no design tool client */
  fetchDesignFile(principal: AuthPrincipal, connectionId: string): never {
    this.registry.require(principal, connectionId);
    throw new NotImplementedException(DESIGN_SYNC_UNSUPPORTED);
  }

  /** 501 in every direction: no design tool client */
  sync(principal: AuthPrincipal, connectionId: string, direction?: string): never {
    this.registry.require(principal, connectionId);
    if (direction !== undefined && !SYNC_DIRECTIONS.includes(direction as (typeof SYNC_DIRECTIONS)[number])) {
      throw new BadRequestException(`direction must be one of ${SYNC_DIRECTIONS.join(', ')}`);
    }
    throw new NotImplementedException(DESIGN_SYNC_UNSUPPORTED);
  }

  /** 501: generating code needs the component from the design file */
  generateComponentCode(principal: AuthPrincipal, connectionId: string): never {
    this.registry.require(principal, connectionId);
    throw new NotImplementedException(DESIGN_SYNC_UNSUPPORTED);
  }

  /** Versions seen by syncs on this connection: none until sync is implemented */
  getFileVersions(principal: AuthPrincipal, connectionId: string): string[] {
    const connection = this.registry.require(principal, connectionId);
    return connection.lastSyncVersion ? [connection.lastSyncVersion] : [];
  }

  /** 501: there is no scheduler, and nothing to schedule */
  enableAutoSync(principal: AuthPrincipal, connectionId: string): never {
    this.registry.require(principal, connectionId);
    throw new NotImplementedException(AUTO_SYNC_UNSUPPORTED);
  }

  disableAutoSync(principal: AuthPrincipal, connectionId: string): DesignSyncConnectionView {
    return this.registry.disableAutoSync(principal, connectionId);
  }
}
