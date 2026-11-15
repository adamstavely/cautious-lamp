import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { URL_CHANNELS, UrlChannel } from '../delivery/delivery.types';
import { DuplicateDocumentError, VersionConflictError } from '../reviews/document-store';
import { QueryableStore } from '../workspaces/queryable-store';
import {
  ChannelTargetView,
  DEFAULT_PREFERENCES,
  NOTIFICATION_SETTINGS_STORE,
  NotificationPreferences,
  NotificationSettingsDoc,
  StoredChannelTarget,
  SubscribableType,
  Subscription,
  topicOf,
} from './notification.types';

const MAX_WRITE_ATTEMPTS = 5;
/** Enough for every component, token type and pattern someone could reasonably follow */
export const MAX_SUBSCRIPTIONS = 200;

export interface NotificationSettingsView {
  subscriptions: Subscription[];
  preferences: NotificationPreferences;
  /** Which delivery URLs are saved; the URLs themselves are never returned */
  targets: Record<UrlChannel, ChannelTargetView>;
}

export type PreferencesPatch = Partial<Omit<NotificationPreferences, 'channels'>> & {
  channels?: Partial<NotificationPreferences['channels']>;
};

/**
 * What each person follows and how they want to be notified, one document per
 * person. Someone who never saved anything follows nothing and has the default
 * preferences.
 */
@Injectable()
export class NotificationSettingsService {
  constructor(@Inject(NOTIFICATION_SETTINGS_STORE) private readonly store: QueryableStore<NotificationSettingsDoc>) {}

  async get(userId: string): Promise<NotificationSettingsView> {
    const doc = (await this.store.get(userId))?.doc;
    return toView(doc);
  }

  /** The stored document, with encrypted targets, for delivery. Null for someone who never saved settings. */
  async getDoc(userId: string): Promise<NotificationSettingsDoc | null> {
    return (await this.store.get(userId))?.doc ?? null;
  }

  /**
   * Saves (already encrypted) a Slack, Teams or webhook target and turns the
   * channel on, or with `null` removes it and turns the channel off.
   */
  async setTarget(userId: string, channel: UrlChannel, target: StoredChannelTarget | null): Promise<NotificationSettingsView> {
    const doc = await this.mutate(userId, (d) => {
      const targets = { ...(d.targets ?? {}) };
      if (target) targets[channel] = target;
      else delete targets[channel];
      d.targets = targets;
      d.preferences = { ...d.preferences, channels: { ...DEFAULT_PREFERENCES.channels, ...d.preferences.channels, [channel]: !!target } };
    });
    return toView(doc);
  }

  async updatePreferences(userId: string, patch: PreferencesPatch): Promise<NotificationSettingsView> {
    const doc = await this.mutate(userId, (d) => {
      d.preferences = {
        ...d.preferences,
        ...(patch.inApp !== undefined ? { inApp: patch.inApp } : {}),
        ...(patch.actions !== undefined ? { actions: [...new Set(patch.actions)] } : {}),
        ...(patch.breakingOnly !== undefined ? { breakingOnly: patch.breakingOnly } : {}),
        channels: { ...DEFAULT_PREFERENCES.channels, ...d.preferences.channels, ...(patch.channels ?? {}) },
      };
    });
    return toView(doc);
  }

  /** Follows an item (or every item of a type with `entityId: '*'`). Following the same thing twice is a no-op. */
  async subscribe(userId: string, input: { type: SubscribableType; entityId: string; entityName?: string }): Promise<Subscription> {
    let result: Subscription | undefined;
    await this.mutate(userId, (d) => {
      const existing = d.subscriptions.find((s) => s.type === input.type && s.entityId === input.entityId);
      if (existing) {
        result = existing;
        return;
      }
      if (d.subscriptions.length >= MAX_SUBSCRIPTIONS) {
        throw new ConflictException(`You can follow at most ${MAX_SUBSCRIPTIONS} items`);
      }
      result = {
        id: `sub_${randomBytes(8).toString('hex')}`,
        type: input.type,
        entityId: input.entityId,
        ...(input.entityName ? { entityName: input.entityName } : {}),
        createdAt: new Date().toISOString(),
      };
      d.subscriptions.push(result);
    });
    return result!;
  }

  async unsubscribe(userId: string, subscriptionId: string): Promise<void> {
    const current = (await this.store.get(userId))?.doc;
    if (!current?.subscriptions.some((s) => s.id === subscriptionId)) throw new NotFoundException('Subscription not found');
    await this.mutate(userId, (d) => {
      d.subscriptions = d.subscriptions.filter((s) => s.id !== subscriptionId);
    });
  }

  /** The settings of everyone following this item, directly or through "all of this type" */
  async subscribersTo(type: string, entityId: string): Promise<NotificationSettingsDoc[]> {
    return this.store.findAny([{ topics: topicOf(type, entityId) }, { topics: topicOf(type, '*') }]);
  }

  /** Reads, changes and writes the person's document, creating it on first use and retrying on concurrent writes */
  private async mutate(userId: string, fn: (doc: NotificationSettingsDoc) => void): Promise<NotificationSettingsDoc> {
    for (let attempt = 0; attempt < MAX_WRITE_ATTEMPTS; attempt++) {
      const stored = await this.store.get(userId);
      const now = new Date().toISOString();
      const doc: NotificationSettingsDoc = stored?.doc ?? {
        id: userId,
        userId,
        subscriptions: [],
        topics: [],
        preferences: structuredClone(DEFAULT_PREFERENCES),
        createdAt: now,
        updatedAt: now,
      };
      fn(doc);
      doc.topics = [...new Set(doc.subscriptions.map((s) => topicOf(s.type, s.entityId)))];
      doc.updatedAt = now;
      try {
        if (stored) await this.store.replace(doc, stored.version);
        else await this.store.create(doc);
        return doc;
      } catch (error) {
        if (!(error instanceof VersionConflictError) && !(error instanceof DuplicateDocumentError)) throw error;
      }
    }
    throw new ConflictException('Your notification settings are being changed, please try again');
  }
}

function toView(doc: NotificationSettingsDoc | undefined): NotificationSettingsView {
  const defaults = structuredClone(DEFAULT_PREFERENCES);
  const saved = doc?.preferences;
  const targets = Object.fromEntries(
    URL_CHANNELS.map((channel) => {
      const target = doc?.targets?.[channel];
      return [channel, target ? { configured: true, savedAt: target.savedAt } : { configured: false }];
    }),
  ) as Record<UrlChannel, ChannelTargetView>;
  return {
    subscriptions: doc?.subscriptions ?? [],
    preferences: { ...defaults, ...(saved ?? {}), channels: { ...defaults.channels, ...(saved?.channels ?? {}) } },
    targets,
  };
}
