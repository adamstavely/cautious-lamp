/** Elasticsearch indices, injection tokens and documents for notifications and the changelog */

import type { UrlChannel } from '../delivery/delivery.types';

export const NOTIFICATIONS_INDEX = 'design-system-notifications';
export const NOTIFICATION_SETTINGS_INDEX = 'design-system-notification-settings';
export const CHANGELOG_INDEX = 'design-system-changelog';

export const NOTIFICATION_STORE = Symbol('NOTIFICATION_STORE');
export const NOTIFICATION_SETTINGS_STORE = Symbol('NOTIFICATION_SETTINGS_STORE');
export const CHANGELOG_STORE = Symbol('CHANGELOG_STORE');

export type NotificationType =
  | 'request-created'
  | 'request-updated'
  | 'request-commented'
  | 'request-assigned'
  | 'request-merged'
  | 'issue-created'
  | 'issue-updated'
  | 'design-system-change';

/** One notification for one person. Only its recipient (`userId`) can read or change it. */
export interface Notification {
  id: string;
  /** The recipient */
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  readAt?: string;
  createdAt: string;
  /** For `design-system-change`: the changelog entry behind it */
  changelogEntryId?: string;
  breaking?: boolean;
}

// ---------- Changelog ----------

/** What a changelog entry is about. Components, tokens and patterns are recorded today. */
export type ChangeEntityType = 'component' | 'token' | 'pattern' | 'workspace' | 'application' | 'system';
export type ChangeAction = 'created' | 'updated' | 'deprecated' | 'deleted' | 'status-changed';

export const SUBSCRIBABLE_TYPES = ['component', 'token', 'pattern'] as const;
export type SubscribableType = (typeof SUBSCRIBABLE_TYPES)[number];

export const CHANGE_ACTIONS: readonly ChangeAction[] = ['created', 'updated', 'deprecated', 'deleted', 'status-changed'];

export interface ChangelogChange {
  field?: string;
  description?: string;
}

export interface ChangelogEntry {
  id: string;
  type: ChangeEntityType;
  entityId: string;
  entityName: string;
  action: ChangeAction;
  version?: string;
  changes: ChangelogChange[];
  breaking: boolean;
  createdAt: string;
  /** Who made the change (display name) and their id */
  author?: string;
  authorId?: string;
  /** The workspace that owns the item, if any */
  workspaceId?: string;
  /**
   * Workspaces whose members may read the entry: the owner and the workspaces
   * the item was shared with. Empty for library items and global ones, which
   * everyone may read.
   */
  audience: string[];
  /** Where in the app the item can be found */
  link?: string;
}

/** What a write path reports; the recorder fills in id, time and audience defaults */
export interface ChangeInput {
  type: ChangeEntityType;
  entityId: string;
  entityName: string;
  action: ChangeAction;
  version?: string;
  changes?: ChangelogChange[];
  breaking?: boolean;
  workspaceId?: string;
  audience?: string[];
  link?: string;
}

/** Who made a change, as far as the changelog cares */
export interface ChangeActor {
  id: string;
  name?: string;
}

/**
 * Records a change to the design system and notifies the people subscribed to
 * it. Write paths call this after their own write succeeded; recording never
 * fails the write (see ChangelogAggregationService.record).
 */
export interface ChangeRecorder {
  record(change: ChangeInput, actor?: ChangeActor): Promise<void>;
}

export const CHANGE_RECORDER = Symbol('CHANGE_RECORDER');

// ---------- Per-user settings: subscriptions and preferences ----------

/** Something a person follows: one item (`entityId`), or every item of a type (`entityId: '*'`) */
export interface Subscription {
  id: string;
  type: SubscribableType;
  entityId: string;
  entityName?: string;
  createdAt: string;
}

export interface NotificationPreferences {
  /** Show notifications in the app (the bell and the notifications page) */
  inApp: boolean;
  /** Which kinds of change notify */
  actions: ChangeAction[];
  /** Only notify about breaking changes */
  breakingOnly: boolean;
  /**
   * Where else notifications are delivered (NotificationDeliveryService).
   * Email goes to the person's sign-in address; Slack, Teams and webhook
   * need a URL saved in `targets`.
   */
  channels: { email: boolean; slack: boolean; teams: boolean; webhook: boolean };
}

/** A saved Slack, Teams or webhook target. Both fields are encrypted at rest and never returned. */
export interface StoredChannelTarget {
  url: string;
  /** Webhook only: signs each delivery (HMAC-SHA256) */
  secret?: string;
  savedAt: string;
}

/** What the API says about a saved target: whether there is one, never the URL */
export interface ChannelTargetView {
  configured: boolean;
  savedAt?: string;
}

export const DEFAULT_PREFERENCES: NotificationPreferences = {
  inApp: true,
  actions: ['created', 'updated', 'deprecated', 'deleted', 'status-changed'],
  breakingOnly: false,
  channels: { email: false, slack: false, teams: false, webhook: false },
};

/** One document per person (id = the user's id) */
export interface NotificationSettingsDoc {
  id: string;
  userId: string;
  subscriptions: Subscription[];
  /** Denormalized from subscriptions (`<type>:<entityId>`) for term queries */
  topics: string[];
  preferences: NotificationPreferences;
  /** Saved URLs for Slack, Teams and webhook delivery (encrypted) */
  targets?: Partial<Record<UrlChannel, StoredChannelTarget>>;
  createdAt: string;
  updatedAt: string;
}

export function topicOf(type: string, entityId: string): string {
  return `${type}:${entityId}`;
}

const keyword = { type: 'keyword' };
const date = { type: 'date' };

export const NOTIFICATION_PROPERTIES = {
  id: keyword,
  userId: keyword,
  type: keyword,
  read: { type: 'boolean' },
  breaking: { type: 'boolean' },
  changelogEntryId: keyword,
  createdAt: date,
};

export const NOTIFICATION_SETTINGS_PROPERTIES = {
  id: keyword,
  userId: keyword,
  topics: keyword,
  createdAt: date,
  updatedAt: date,
};

export const CHANGELOG_PROPERTIES = {
  id: keyword,
  type: keyword,
  entityId: keyword,
  action: keyword,
  version: keyword,
  breaking: { type: 'boolean' },
  workspaceId: keyword,
  audience: keyword,
  authorId: keyword,
  createdAt: date,
};
