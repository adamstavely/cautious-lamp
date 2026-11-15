import { Inject, Injectable, Logger } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { AuthPrincipal } from '../auth/principal';
import { NotificationService } from '../notifications/notification.service';
import { NotificationSettingsService } from '../notifications/notification-settings.service';
import {
  CHANGELOG_STORE,
  ChangeAction,
  ChangeActor,
  ChangeEntityType,
  ChangeInput,
  ChangeRecorder,
  ChangelogEntry,
} from '../notifications/notification.types';
import { DocumentStore, ListOptions } from '../reviews/document-store';
import { WorkspaceAccessService, isWorkspaceSuperuser } from '../workspaces/workspace-access.service';

export type { ChangelogEntry, ChangelogChange } from '../notifications/notification.types';

export interface ChangelogFilters {
  type?: ChangeEntityType;
  entityId?: string;
  action?: ChangeAction;
  version?: string;
  breakingOnly?: boolean;
  since?: Date;
  until?: Date;
  workspaceId?: string;
}

export interface AggregatedChangelog {
  /** The version asked for, or null for a date range */
  version: string | null;
  startDate: string | null;
  endDate: string | null;
  entries: ChangelogEntry[];
  summary: {
    totalChanges: number;
    breakingChanges: number;
    componentsChanged: number;
    tokensChanged: number;
    patternsChanged: number;
    newItems: number;
    deprecations: number;
  };
}

const TYPE_LABELS: Record<ChangeEntityType, string> = {
  component: 'Component',
  token: 'Token',
  pattern: 'Pattern',
  workspace: 'Workspace',
  application: 'Application',
  system: 'System',
};

const ACTION_VERBS: Record<ChangeAction, string> = {
  created: 'added',
  updated: 'updated',
  deprecated: 'deprecated',
  deleted: 'removed',
  'status-changed': 'changed status',
};

/**
 * The design-system changelog, stored in Elasticsearch. Write paths (component
 * routes, the patterns library, workspace tokens and patterns) report changes
 * through `record`; each change is stored and the people who follow the item
 * get a notification. Reads are scoped like the items themselves: a workspace
 * item's changes are visible to the members of the workspaces that could see it.
 */
@Injectable()
export class ChangelogAggregationService implements ChangeRecorder {
  private readonly logger = new Logger(ChangelogAggregationService.name);

  constructor(
    @Inject(CHANGELOG_STORE) private readonly store: DocumentStore<ChangelogEntry>,
    private readonly notifications: NotificationService,
    private readonly settings: NotificationSettingsService,
    private readonly workspaces: WorkspaceAccessService,
  ) {}

  /**
   * ChangeRecorder: records the change and notifies subscribers. The caller's
   * own write has already succeeded, so a failure here is logged rather than
   * turned into an error response that would invite a retry of that write.
   */
  async record(change: ChangeInput, actor?: ChangeActor): Promise<void> {
    try {
      await this.recordChange(change, actor);
    } catch (error) {
      this.logger.error(`Changelog entry for ${change.type} ${change.entityId} not recorded: ${(error as Error)?.message}`);
    }
  }

  /** Stores a changelog entry, then notifies the people following the item */
  async recordChange(change: ChangeInput, actor?: ChangeActor): Promise<ChangelogEntry> {
    const entry: ChangelogEntry = {
      id: `chg_${randomBytes(12).toString('hex')}`,
      type: change.type,
      entityId: change.entityId,
      entityName: change.entityName,
      action: change.action,
      ...(change.version ? { version: change.version } : {}),
      changes: change.changes ?? [],
      breaking: change.breaking ?? false,
      createdAt: new Date().toISOString(),
      ...(actor ? { authorId: actor.id, author: actor.name || actor.id } : {}),
      ...(change.workspaceId ? { workspaceId: change.workspaceId } : {}),
      audience: [...new Set(change.audience ?? [])],
      ...(change.link ? { link: change.link } : {}),
    };
    await this.store.create(entry);
    await this.notifySubscribers(entry);
    return entry;
  }

  /** Entries the principal may read, newest first */
  async getChangelogEntries(principal: AuthPrincipal, filters: ChangelogFilters = {}): Promise<ChangelogEntry[]> {
    const where: NonNullable<ListOptions['where']> = {};
    if (filters.type) where.type = filters.type;
    if (filters.entityId) where.entityId = filters.entityId;
    if (filters.action) where.action = filters.action;
    if (filters.version) where.version = filters.version;
    if (filters.breakingOnly) where.breaking = true;
    if (filters.workspaceId) where.workspaceId = filters.workspaceId;
    // `after` is exclusive; one millisecond earlier makes `since` inclusive
    const after = filters.since ? { createdAt: new Date(filters.since.getTime() - 1).toISOString() } : undefined;

    const entries = await this.store.list({ where, ...(after ? { after } : {}) });
    const visible = await this.visibilityFor(principal);
    return entries.filter((e) => visible(e) && (!filters.until || new Date(e.createdAt) <= filters.until));
  }

  async getAggregatedChangelog(
    principal: AuthPrincipal,
    filters: { version?: string; startDate?: Date; endDate?: Date; type?: ChangeEntityType; breakingOnly?: boolean; workspaceId?: string } = {},
  ): Promise<AggregatedChangelog> {
    const entries = await this.getChangelogEntries(principal, {
      version: filters.version,
      since: filters.startDate,
      until: filters.endDate,
      type: filters.type,
      breakingOnly: filters.breakingOnly,
      workspaceId: filters.workspaceId,
    });
    return {
      version: filters.version ?? null,
      startDate: filters.startDate?.toISOString() ?? null,
      endDate: filters.endDate?.toISOString() ?? null,
      entries,
      summary: summarize(entries),
    };
  }

  getComponentChangelog(principal: AuthPrincipal, componentId: string): Promise<ChangelogEntry[]> {
    return this.getChangelogEntries(principal, { type: 'component', entityId: componentId });
  }

  getTokenChangelog(principal: AuthPrincipal, tokenId: string): Promise<ChangelogEntry[]> {
    return this.getChangelogEntries(principal, { type: 'token', entityId: tokenId });
  }

  getBreakingChanges(principal: AuthPrincipal, since?: Date): Promise<ChangelogEntry[]> {
    return this.getChangelogEntries(principal, { breakingOnly: true, since });
  }

  /** Release notes from the entries recorded with this version */
  async generateReleaseNotes(principal: AuthPrincipal, version: string) {
    const entries = await this.getChangelogEntries(principal, { version });
    return {
      version,
      features: entries.filter((e) => e.action === 'created'),
      improvements: entries.filter((e) => e.action === 'updated' && !e.breaking),
      deprecations: entries.filter((e) => e.action === 'deprecated'),
      breakingChanges: entries.filter((e) => e.breaking),
    };
  }

  /** Who may read what: superusers everything; others public entries and their workspaces' */
  private async visibilityFor(principal: AuthPrincipal): Promise<(entry: ChangelogEntry) => boolean> {
    if (isWorkspaceSuperuser(principal)) return () => true;
    const mine = await this.workspaces.memberWorkspaceIds(principal);
    return (entry) => !entry.audience?.length || entry.audience.some((id) => mine.has(id));
  }

  /** Members of any of the workspaces */
  private async membersOf(workspaceIds: string[]): Promise<Set<string>> {
    const members = new Set<string>();
    for (const id of workspaceIds) {
      const workspace = await this.workspaces.find(id);
      for (const memberId of workspace?.memberIds ?? []) members.add(memberId);
    }
    return members;
  }

  private async notifySubscribers(entry: ChangelogEntry): Promise<void> {
    const subscribers = await this.settings.subscribersTo(entry.type, entry.entityId);
    if (!subscribers.length) return;
    // A workspace item's change only reaches people who can see the item
    const allowed = entry.audience.length ? await this.membersOf(entry.audience) : null;
    const title = `${TYPE_LABELS[entry.type]} "${entry.entityName}" ${ACTION_VERBS[entry.action]}`;
    const detail = entry.changes.map((c) => c.description).filter(Boolean).join('; ');
    const message = [entry.breaking ? 'Breaking change.' : '', detail, entry.author ? `By ${entry.author}.` : '']
      .filter(Boolean)
      .join(' ');

    for (const subscriber of subscribers) {
      const prefs = subscriber.preferences;
      if (subscriber.userId === entry.authorId) continue;
      if (allowed && !allowed.has(subscriber.userId)) continue;
      if (!prefs?.inApp) continue;
      if (prefs.breakingOnly && !entry.breaking) continue;
      if (!(prefs.actions ?? []).includes(entry.action)) continue;
      try {
        await this.notifications.createNotification({
          userId: subscriber.userId,
          type: 'design-system-change',
          title,
          message: message || title,
          link: entry.link,
          changelogEntryId: entry.id,
          breaking: entry.breaking,
        });
      } catch (error) {
        this.logger.warn(`Notification for ${subscriber.userId} about ${entry.id} not saved: ${(error as Error)?.message}`);
      }
    }
  }
}

function summarize(entries: ChangelogEntry[]): AggregatedChangelog['summary'] {
  return {
    totalChanges: entries.length,
    breakingChanges: entries.filter((e) => e.breaking).length,
    componentsChanged: new Set(entries.filter((e) => e.type === 'component').map((e) => e.entityId)).size,
    tokensChanged: new Set(entries.filter((e) => e.type === 'token').map((e) => e.entityId)).size,
    patternsChanged: new Set(entries.filter((e) => e.type === 'pattern').map((e) => e.entityId)).size,
    newItems: entries.filter((e) => e.action === 'created').length,
    deprecations: entries.filter((e) => e.action === 'deprecated').length,
  };
}
