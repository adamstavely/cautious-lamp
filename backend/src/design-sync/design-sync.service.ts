import { Injectable } from '@nestjs/common';
import { DesignSystemService, Component, Token } from '../design-system/design-system.service';

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

export interface DesignSyncConnection {
  id: string;
  name: string;
  tool: 'figma' | 'penpot';
  apiKey?: string;
  fileId: string;
  fileUrl: string;
  enabled: boolean;
  syncDirection: 'design-to-code' | 'code-to-design' | 'bidirectional';
  autoSync: boolean;
  syncInterval?: number; // in minutes
  lastSync?: Date;
  lastSyncVersion?: string;
  syncHistory: SyncHistoryEntry[];
  createdAt: Date;
  updatedAt: Date;
}

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

@Injectable()
export class DesignSyncService {
  private connections = new Map<string, DesignSyncConnection>();
  private designFiles = new Map<string, DesignFile>();
  private fileVersions = new Map<string, string[]>(); // fileId -> versions[]

  constructor(private readonly designSystemService: DesignSystemService) {
    // Initialize with sample connections
    this.connections.set('sync-1', {
      id: 'sync-1',
      name: 'Figma Design System',
      tool: 'figma',
      fileId: 'figma-file-123',
      fileUrl: 'https://www.figma.com/file/123',
      enabled: true,
      syncDirection: 'bidirectional',
      autoSync: false,
      syncHistory: [],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
    });

    this.connections.set('sync-2', {
      id: 'sync-2',
      name: 'Penpot Components',
      tool: 'penpot',
      fileId: 'penpot-file-456',
      fileUrl: 'https://penpot.app/file/456',
      enabled: false,
      syncDirection: 'design-to-code',
      autoSync: false,
      syncHistory: [],
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-10'),
    });
  }

  // Connection Management
  getAllConnections(): DesignSyncConnection[] {
    return Array.from(this.connections.values());
  }

  getConnection(id: string): DesignSyncConnection | null {
    return this.connections.get(id) || null;
  }

  createConnection(connection: Omit<DesignSyncConnection, 'id' | 'createdAt' | 'updatedAt' | 'syncHistory'>): DesignSyncConnection {
    const id = `sync-${Date.now()}`;
    const newConnection: DesignSyncConnection = {
      ...connection,
      id,
      syncHistory: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.connections.set(id, newConnection);
    return newConnection;
  }

  updateConnection(id: string, updates: Partial<DesignSyncConnection>): DesignSyncConnection | null {
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

  // Design File Operations
  async fetchDesignFile(connectionId: string): Promise<DesignFile> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new Error('Connection not found');
    }

    // Mock implementation - in real scenario, this would call the design tool API
    const mockFile: DesignFile = {
      id: `file-${connection.fileId}`,
      name: `${connection.name} File`,
      tool: connection.tool,
      fileId: connection.fileId,
      fileUrl: connection.fileUrl,
      version: this.getNextVersion(connection.fileId),
      lastModified: new Date(),
      components: await this.parseComponents(connection),
      tokens: await this.parseTokens(connection),
      metadata: {
        frameCount: 25,
        pageCount: 5,
        componentCount: 12,
      },
    };

    this.designFiles.set(mockFile.id, mockFile);
    this.trackVersion(connection.fileId, mockFile.version);

    return mockFile;
  }

  private async parseComponents(connection: DesignSyncConnection): Promise<DesignComponent[]> {
    // Mock implementation - in real scenario, this would parse the design file
    return [
      {
        id: 'comp-1',
        name: 'Button',
        type: 'component',
        description: 'Primary button component',
        properties: [
          { name: 'variant', type: 'enum', defaultValue: 'primary', options: ['primary', 'secondary', 'tertiary'], required: false },
          { name: 'size', type: 'enum', defaultValue: 'md', options: ['sm', 'md', 'lg'], required: false },
          { name: 'disabled', type: 'boolean', defaultValue: false, required: false },
          { name: 'label', type: 'string', defaultValue: 'Button', required: true },
        ],
        styles: {
          colors: {
            background: '#4f46e5',
            text: '#ffffff',
          },
          typography: {
            fontFamily: 'Inter, sans-serif',
            fontSize: '1rem',
            fontWeight: '500',
          },
          spacing: {
            padding: '0.5rem 1rem',
          },
          border: {
            radius: '0.5rem',
          },
        },
        layout: {
          minWidth: '120px',
          minHeight: '40px',
        },
        sourceFile: connection.fileId,
        sourceVersion: this.getCurrentVersion(connection.fileId),
      },
      {
        id: 'comp-2',
        name: 'Card',
        type: 'component',
        description: 'Card container component',
        properties: [
          { name: 'elevation', type: 'enum', defaultValue: 'md', options: ['sm', 'md', 'lg'], required: false },
          { name: 'padding', type: 'enum', defaultValue: 'md', options: ['sm', 'md', 'lg'], required: false },
        ],
        styles: {
          colors: {
            background: '#ffffff',
          },
          border: {
            radius: '0.75rem',
          },
          shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        },
        layout: {
          minWidth: '200px',
        },
        sourceFile: connection.fileId,
        sourceVersion: this.getCurrentVersion(connection.fileId),
      },
    ];
  }

  private async parseTokens(connection: DesignSyncConnection): Promise<DesignToken[]> {
    // Mock implementation - in real scenario, this would parse tokens from the design file
    return [
      {
        id: 'token-1',
        name: 'Primary',
        value: '#4f46e5',
        type: 'color',
        category: 'colors',
        description: 'Primary brand color',
        sourceFile: connection.fileId,
        sourceVersion: this.getCurrentVersion(connection.fileId),
      },
      {
        id: 'token-2',
        name: 'Spacing/Medium',
        value: '16px',
        type: 'dimension',
        category: 'spacing',
        description: 'Medium spacing',
        sourceFile: connection.fileId,
        sourceVersion: this.getCurrentVersion(connection.fileId),
      },
    ];
  }

  // Component Generation
  async generateComponentCode(designComponent: DesignComponent, framework: 'vue' | 'react' | 'html'): Promise<string> {
    switch (framework) {
      case 'vue':
        return this.generateVueComponent(designComponent);
      case 'react':
        return this.generateReactComponent(designComponent);
      case 'html':
        return this.generateHTMLComponent(designComponent);
      default:
        throw new Error(`Unsupported framework: ${framework}`);
    }
  }

  private generateVueComponent(component: DesignComponent): string {
    const props = component.properties.map(prop => {
      const defaultVal = prop.defaultValue !== undefined ? ` = ${JSON.stringify(prop.defaultValue)}` : '';
      const required = prop.required ? 'required: true' : '';
      return `    ${prop.name}: { type: ${this.getTypeScriptType(prop.type)}, default: ${JSON.stringify(prop.defaultValue || null)}, ${required} }`;
    }).join(',\n');

    const styles = this.generateStyles(component.styles);

    return `<template>
  <div class="${component.name.toLowerCase()}" :style="computedStyles">
    <slot />
  </div>
</template>

<script setup>
defineProps({
${props}
});

const computedStyles = {
${styles}
};
</script>

<style scoped>
.${component.name.toLowerCase()} {
  /* Component styles */
}
</style>`;
  }

  private generateReactComponent(component: DesignComponent): string {
    const props = component.properties.map(prop => {
      const defaultVal = prop.defaultValue !== undefined ? ` = ${JSON.stringify(prop.defaultValue)}` : '';
      return `  ${prop.name}${defaultVal}`;
    }).join(',\n');

    const styles = this.generateStyles(component.styles);

    return `import React from 'react';

interface ${component.name}Props {
${props}
}

export const ${component.name}: React.FC<${component.name}Props> = ({
${component.properties.map(p => `  ${p.name}${p.defaultValue !== undefined ? ` = ${JSON.stringify(p.defaultValue)}` : ''}`).join(',\n')}
}) => {
  const styles = {
${styles}
  };

  return (
    <div className="${component.name.toLowerCase()}" style={styles}>
      {/* Component content */}
    </div>
  );
};`;
  }

  private generateHTMLComponent(component: DesignComponent): string {
    const styles = this.generateStyles(component.styles);
    const cssStyles = Object.entries(component.styles || {}).map(([key, value]) => {
      if (typeof value === 'object') {
        return Object.entries(value).map(([k, v]) => `  ${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v};`).join('\n');
      }
      return `  ${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`;
    }).join('\n');

    return `<div class="${component.name.toLowerCase()}">
  <!-- Component content -->
</div>

<style>
.${component.name.toLowerCase()} {
${cssStyles}
}
</style>`;
  }

  private generateStyles(styles: ComponentStyles): string {
    const styleLines: string[] = [];
    
    if (styles.colors) {
      Object.entries(styles.colors).forEach(([key, value]) => {
        styleLines.push(`  ${key}: '${value}',`);
      });
    }
    
    if (styles.typography) {
      Object.entries(styles.typography).forEach(([key, value]) => {
        styleLines.push(`  ${key}: '${value}',`);
      });
    }
    
    if (styles.spacing) {
      Object.entries(styles.spacing).forEach(([key, value]) => {
        styleLines.push(`  ${key}: '${value}',`);
      });
    }
    
    if (styles.border) {
      Object.entries(styles.border).forEach(([key, value]) => {
        styleLines.push(`  ${key}: '${value}',`);
      });
    }
    
    if (styles.shadow) {
      styleLines.push(`  boxShadow: '${styles.shadow}',`);
    }

    return styleLines.join('\n') || '  // No styles';
  }

  private getTypeScriptType(type: string): string {
    const typeMap: Record<string, string> = {
      'string': 'String',
      'number': 'Number',
      'boolean': 'Boolean',
      'color': 'String',
      'enum': 'String',
    };
    return typeMap[type] || 'String';
  }

  // Sync Operations
  async syncDesignToCode(connectionId: string): Promise<SyncResult> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new Error('Connection not found');
    }

    const designFile = await this.fetchDesignFile(connectionId);
    const result: SyncResult = {
      success: true,
      direction: 'design-to-code',
      components: { added: [], updated: [], removed: [] },
      tokens: { added: [], updated: [], removed: [] },
      version: designFile.version,
      errors: [],
      warnings: [],
    };

    // Sync components
    for (const designComp of designFile.components) {
      const existingComponent = this.designSystemService.getComponentById(designComp.name.toLowerCase());
      
      if (existingComponent) {
        // Update existing component
        const updated = this.mapDesignComponentToSystemComponent(designComp);
        result.components.updated.push(updated);
      } else {
        // Add new component
        const newComponent = this.mapDesignComponentToSystemComponent(designComp);
        result.components.added.push(newComponent);
      }
    }

    // Sync tokens
    for (const designToken of designFile.tokens) {
      const existingTokens = this.designSystemService.getAllTokens();
      const existing = existingTokens.find(t => t.name === this.mapTokenName(designToken.name));
      
      if (existing) {
        // Update existing token
        const updated: Token = {
          ...existing,
          value: designToken.value,
        };
        result.tokens.updated.push(updated);
      } else {
        // Add new token
        const newToken: Token = {
          name: this.mapTokenName(designToken.name),
          value: designToken.value,
          type: designToken.type,
          category: designToken.category || 'custom',
          description: designToken.description,
        };
        result.tokens.added.push(newToken);
      }
    }

    // Record sync history
    const historyEntry: SyncHistoryEntry = {
      id: `sync-${Date.now()}`,
      timestamp: new Date(),
      direction: 'design-to-code',
      componentsAdded: result.components.added.length,
      componentsUpdated: result.components.updated.length,
      componentsRemoved: result.components.removed.length,
      tokensAdded: result.tokens.added.length,
      tokensUpdated: result.tokens.updated.length,
      tokensRemoved: result.tokens.removed.length,
      version: designFile.version,
      status: result.errors.length > 0 ? 'failed' : (result.warnings.length > 0 ? 'partial' : 'success'),
      errors: result.errors,
    };

    connection.syncHistory.unshift(historyEntry);
    if (connection.syncHistory.length > 50) {
      connection.syncHistory = connection.syncHistory.slice(0, 50);
    }

    this.updateConnection(connectionId, {
      lastSync: new Date(),
      lastSyncVersion: designFile.version,
    });

    return result;
  }

  async syncCodeToDesign(connectionId: string): Promise<SyncResult> {
    // In a real implementation, this would push changes back to the design tool
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new Error('Connection not found');
    }

    // Mock implementation
    return {
      success: true,
      direction: 'code-to-design',
      components: { added: [], updated: [], removed: [] },
      tokens: { added: [], updated: [], removed: [] },
      version: this.getCurrentVersion(connection.fileId),
      errors: [],
      warnings: ['Code-to-design sync is not fully implemented'],
    };
  }

  async syncBidirectional(connectionId: string): Promise<SyncResult> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new Error('Connection not found');
    }

    // Sync design to code first
    const designToCode = await this.syncDesignToCode(connectionId);
    
    // Then sync code to design
    const codeToDesign = await this.syncCodeToDesign(connectionId);

    return {
      success: designToCode.success && codeToDesign.success,
      direction: 'bidirectional',
      components: {
        added: [...designToCode.components.added, ...codeToDesign.components.added],
        updated: [...designToCode.components.updated, ...codeToDesign.components.updated],
        removed: [...designToCode.components.removed, ...codeToDesign.components.removed],
      },
      tokens: {
        added: [...designToCode.tokens.added, ...codeToDesign.tokens.added],
        updated: [...designToCode.tokens.updated, ...codeToDesign.tokens.updated],
        removed: [...designToCode.tokens.removed, ...codeToDesign.tokens.removed],
      },
      version: designToCode.version,
      errors: [...designToCode.errors, ...codeToDesign.errors],
      warnings: [...designToCode.warnings, ...codeToDesign.warnings],
    };
  }

  private mapDesignComponentToSystemComponent(designComp: DesignComponent): Component {
    return {
      id: designComp.name.toLowerCase(),
      name: designComp.name,
      description: designComp.description || '',
      status: 'in-progress',
      props: designComp.properties.map(p => ({
        name: p.name,
        type: p.type,
        default: p.defaultValue,
        required: p.required || false,
        options: p.options,
        description: p.description,
      })),
      code: {
        vue: '', // Will be generated on demand
        react: '', // Will be generated on demand
      },
      dependencies: [],
    };
  }

  private mapTokenName(designTokenName: string): string {
    // Convert design tool token naming to design system naming
    return designTokenName.toLowerCase().replace(/\//g, '.').replace(/\s+/g, '-');
  }

  // Version Management
  private getCurrentVersion(fileId: string): string {
    const versions = this.fileVersions.get(fileId) || [];
    return versions[versions.length - 1] || '1.0.0';
  }

  private getNextVersion(fileId: string): string {
    const versions = this.fileVersions.get(fileId) || [];
    const lastVersion = versions[versions.length - 1] || '1.0.0';
    const [major, minor, patch] = lastVersion.split('.').map(Number);
    return `${major}.${minor}.${patch + 1}`;
  }

  private trackVersion(fileId: string, version: string): void {
    if (!this.fileVersions.has(fileId)) {
      this.fileVersions.set(fileId, []);
    }
    const versions = this.fileVersions.get(fileId)!;
    if (!versions.includes(version)) {
      versions.push(version);
    }
  }

  getFileVersions(fileId: string): string[] {
    return this.fileVersions.get(fileId) || [];
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

