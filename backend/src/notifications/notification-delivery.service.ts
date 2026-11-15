import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { UsersService } from '../auth/users.service';
import { EncryptionService } from '../common/security/encryption.service';
import { DeliveryService } from '../delivery/delivery.service';
import {
  ChannelAvailability,
  DELIVERY_CHANNELS,
  DeliveryAttempt,
  DeliveryChannel,
  DeliveryMessage,
  DeliveryOwner,
  DeliveryTarget,
  UrlChannel,
} from '../delivery/delivery.types';
import { NotificationSettingsService, NotificationSettingsView } from './notification-settings.service';
import { NotificationSettingsDoc } from './notification.types';

/** What the delivery panel shows: what the server can send, and the person's recent deliveries */
export interface DeliveryOverview {
  channels: Record<DeliveryChannel, ChannelAvailability>;
  attempts: DeliveryAttempt[];
}

const LABELS: Record<UrlChannel, string> = { slack: 'Slack', teams: 'Teams', webhook: 'webhook' };

/** Webhook secrets people choose must be long enough to resist guessing */
const MIN_SECRET_LENGTH = 16;

/**
 * Delivers a person's notifications to the channels they turned on: email to
 * their sign-in address, and Slack, Teams or a signed webhook at the URLs
 * they saved (encrypted at rest, never returned).
 */
@Injectable()
export class NotificationDeliveryService {
  private readonly logger = new Logger(NotificationDeliveryService.name);

  constructor(
    private readonly settings: NotificationSettingsService,
    private readonly delivery: DeliveryService,
    private readonly encryption: EncryptionService,
    private readonly users: UsersService,
  ) {}

  async overview(userId: string): Promise<DeliveryOverview> {
    return { channels: this.delivery.availability(), attempts: await this.delivery.recent(owner(userId)) };
  }

  /**
   * Saves the URL for a Slack, Teams or webhook channel and turns the channel
   * on. A webhook gets a signing secret: the one given, or a generated one,
   * returned once here and never again.
   */
  async saveTarget(
    userId: string,
    channel: UrlChannel,
    input: { url: string; secret?: string },
  ): Promise<NotificationSettingsView & { secret?: string }> {
    const url = await this.delivery.checkUrl(input.url);
    const secret = channel === 'webhook' ? input.secret?.trim() || randomBytes(32).toString('hex') : undefined;
    if (secret !== undefined && secret.length < MIN_SECRET_LENGTH) {
      throw new BadRequestException(`The signing secret needs at least ${MIN_SECRET_LENGTH} characters`);
    }
    const view = await this.settings.setTarget(userId, channel, {
      url: this.encryption.encrypt(url),
      ...(secret ? { secret: this.encryption.encrypt(secret) } : {}),
      savedAt: new Date().toISOString(),
    });
    return channel === 'webhook' ? { ...view, secret } : view;
  }

  async removeTarget(userId: string, channel: UrlChannel): Promise<NotificationSettingsView> {
    return this.settings.setTarget(userId, channel, null);
  }

  /** Sends a test message to one channel now, whether or not it's turned on, and returns the recorded attempt */
  async sendTest(userId: string, channel: DeliveryChannel): Promise<DeliveryAttempt> {
    const doc = await this.settings.getDoc(userId);
    const target = await this.targetFor(userId, doc, channel);
    const message: DeliveryMessage = {
      event: 'test',
      title: 'Test notification from the design system',
      text: 'This is a test. If you can read it, notifications reach you here.',
      link: '/notifications',
    };
    if (!target) {
      throw new BadRequestException(channel === 'email' ? 'Your account has no email address to send to' : `Save a ${LABELS[channel]} URL first`);
    }
    return this.delivery.send(owner(userId), target, message, { test: true });
  }

  /**
   * Starts delivery of one notification to every channel the person turned
   * on and the server can send to. Doesn't wait or throw: the outcome of each
   * delivery is recorded and shown on the notifications page.
   */
  async deliver(userId: string, message: DeliveryMessage, doc?: NotificationSettingsDoc | null): Promise<void> {
    try {
      const settings = doc === undefined ? await this.settings.getDoc(userId) : doc;
      const channels = settings?.preferences?.channels;
      if (!settings || !channels) return;
      const available = this.delivery.availability();
      for (const channel of DELIVERY_CHANNELS) {
        if (!channels[channel] || !available[channel].available) continue;
        const target = await this.targetFor(userId, settings, channel);
        if (target) this.delivery.sendInBackground(owner(userId), target, message);
      }
    } catch (error) {
      this.logger.warn(`Delivery for ${userId} not started: ${(error as Error)?.message}`);
    }
  }

  /** Like deliver, without waiting for the settings to be read */
  deliverInBackground(userId: string, message: DeliveryMessage, doc?: NotificationSettingsDoc | null): void {
    void this.deliver(userId, message, doc);
  }

  /** The decrypted target for a channel, or null when there is none to send to */
  private async targetFor(userId: string, doc: NotificationSettingsDoc | null, channel: DeliveryChannel): Promise<DeliveryTarget | null> {
    if (channel === 'email') {
      const user = await this.users.findById(userId);
      return user?.email && user.status === 'active' ? { channel: 'email', to: [user.email] } : null;
    }
    const stored = doc?.targets?.[channel];
    if (!stored) return null;
    const url = this.encryption.decrypt(stored.url);
    if (channel === 'webhook') return { channel, url, secret: stored.secret ? this.encryption.decrypt(stored.secret) : '' };
    return { channel, url };
  }
}

function owner(userId: string): DeliveryOwner {
  return { kind: 'user', id: userId };
}
