import { Injectable } from '@nestjs/common';
import { DesignSystemService } from '../design-system/design-system.service';
import { ChangeValue } from '../common/types/common.types';

export interface ChangelogChange {
  field?: string;
  oldValue?: ChangeValue;
  newValue?: ChangeValue;
  description?: string;
}

export interface ChangelogEntry {
  id: string;
  type: 'component' | 'token' | 'workspace' | 'application' | 'system';
  entityId: string;
  entityName: string;
  action: 'created' | 'updated' | 'deprecated' | 'deleted' | 'status-changed';
  version?: string;
  changes: ChangelogChange[];
  breaking?: boolean;
  timestamp: Date;
  author?: string;
  workspaceId?: string;
}

export interface AggregatedChangelog {
  version: string;
  releaseDate: Date;
  entries: ChangelogEntry[];
  summary: {
    totalChanges: number;
    breakingChanges: number;
    componentsChanged: number;
    tokensChanged: number;
    newFeatures: number;
  };
}

@Injectable()
export class ChangelogAggregationService {
  private changelogEntries: ChangelogEntry[] = [];

  constructor(
    private readonly designSystemService: DesignSystemService,
  ) {
    this.initializeChangelog();
  }

  /**
   * Initialize changelog with existing data
   */
  private initializeChangelog(): void {
    // This would typically load from a database
    // For now, we'll track changes going forward
  }

  /**
   * Record a changelog entry
   */
  recordChange(data: {
    type: ChangelogEntry['type'];
    entityId: string;
    entityName: string;
    action: ChangelogEntry['action'];
    version?: string;
    changes: ChangelogEntry['changes'];
    breaking?: boolean;
    author?: string;
    workspaceId?: string;
  }): ChangelogEntry {
    const entry: ChangelogEntry = {
      id: `changelog-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      timestamp: new Date(),
    };
    this.changelogEntries.push(entry);
    return entry;
  }

  /**
   * Get aggregated changelog for a version or date range
   */
  getAggregatedChangelog(filters?: {
    version?: string;
    startDate?: Date;
    endDate?: Date;
    type?: ChangelogEntry['type'];
    breakingOnly?: boolean;
    workspaceId?: string;
  }): AggregatedChangelog {
    let entries = [...this.changelogEntries];

    if (filters) {
      if (filters.version) {
        entries = entries.filter(e => e.version === filters.version);
      }
      if (filters.startDate) {
        entries = entries.filter(e => e.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        entries = entries.filter(e => e.timestamp <= filters.endDate!);
      }
      if (filters.type) {
        entries = entries.filter(e => e.type === filters.type);
      }
      if (filters.breakingOnly) {
        entries = entries.filter(e => e.breaking === true);
      }
      if (filters.workspaceId) {
        entries = entries.filter(e => e.workspaceId === filters.workspaceId);
      }
    }

    // Sort by timestamp (newest first)
    entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Group by version if provided, otherwise use date-based grouping
    const version = filters?.version || this.getCurrentVersion();
    const releaseDate = filters?.endDate || new Date();

    const summary = {
      totalChanges: entries.length,
      breakingChanges: entries.filter(e => e.breaking).length,
      componentsChanged: entries.filter(e => e.type === 'component').length,
      tokensChanged: entries.filter(e => e.type === 'token').length,
      newFeatures: entries.filter(e => e.action === 'created').length,
    };

    return {
      version,
      releaseDate,
      entries,
      summary,
    };
  }

  /**
   * Get changelog entries
   */
  getChangelogEntries(filters?: {
    type?: ChangelogEntry['type'];
    entityId?: string;
    action?: ChangelogEntry['action'];
    breakingOnly?: boolean;
    since?: Date;
    workspaceId?: string;
  }): ChangelogEntry[] {
    let entries = [...this.changelogEntries];

    if (filters) {
      if (filters.type) {
        entries = entries.filter(e => e.type === filters.type);
      }
      if (filters.entityId) {
        entries = entries.filter(e => e.entityId === filters.entityId);
      }
      if (filters.action) {
        entries = entries.filter(e => e.action === filters.action);
      }
      if (filters.breakingOnly) {
        entries = entries.filter(e => e.breaking === true);
      }
      if (filters.since) {
        entries = entries.filter(e => e.timestamp >= filters.since!);
      }
      if (filters.workspaceId) {
        entries = entries.filter(e => e.workspaceId === filters.workspaceId);
      }
    }

    return entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get changelog for a specific component
   */
  getComponentChangelog(componentId: string): ChangelogEntry[] {
    return this.getChangelogEntries({
      type: 'component',
      entityId: componentId,
    });
  }

  /**
   * Get changelog for a specific token
   */
  getTokenChangelog(tokenName: string): ChangelogEntry[] {
    return this.getChangelogEntries({
      type: 'token',
      entityId: tokenName,
    });
  }

  /**
   * Get breaking changes
   */
  getBreakingChanges(since?: Date): ChangelogEntry[] {
    return this.getChangelogEntries({
      breakingOnly: true,
      since,
    });
  }

  /**
   * Get current version (simplified - would come from version management)
   */
  private getCurrentVersion(): string {
    // In a real implementation, this would come from version management
    return '1.0.0';
  }

  /**
   * Generate release notes for a version
   */
  generateReleaseNotes(version: string): {
    version: string;
    releaseDate: Date;
    features: ChangelogEntry[];
    improvements: ChangelogEntry[];
    fixes: ChangelogEntry[];
    breakingChanges: ChangelogEntry[];
  } {
    const changelog = this.getAggregatedChangelog({ version });
    const entries = changelog.entries;

    const features = entries.filter(e => e.action === 'created');
    const improvements = entries.filter(e => e.action === 'updated' && !e.breaking);
    const fixes = entries.filter(e => e.action === 'updated' && e.type === 'system');
    const breakingChanges = entries.filter(e => e.breaking === true);

    return {
      version,
      releaseDate: changelog.releaseDate,
      features,
      improvements,
      fixes,
      breakingChanges,
    };
  }
}




