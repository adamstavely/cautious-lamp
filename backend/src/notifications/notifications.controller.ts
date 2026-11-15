import { BadRequestException, Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query } from '@nestjs/common';
import { AuthPrincipal, Principal } from '../auth/principal';
import { StrictBody } from '../workspaces/workspace.dto';
import { DELIVERY_CHANNELS, DeliveryChannel, URL_CHANNELS, UrlChannel } from '../delivery/delivery.types';
import { ChannelTargetDto, CreateSubscriptionDto, UpdateNotificationPreferencesDto } from './notification.dto';
import { NotificationDeliveryService } from './notification-delivery.service';
import { NotificationService } from './notification.service';
import { NotificationSettingsService } from './notification-settings.service';

/**
 * The signed-in person's notifications, what they follow and how they want to
 * be told. Everything here is scoped to the caller:
 * nobody can read or change someone else's notifications or settings.
 */
@Controller('api/v1')
export class NotificationsController {
  constructor(
    private readonly notifications: NotificationService,
    private readonly settings: NotificationSettingsService,
    private readonly delivery: NotificationDeliveryService,
  ) {}

  @Get('notifications')
  getNotifications(@Principal() principal: AuthPrincipal, @Query('unreadOnly') unreadOnly?: string) {
    return this.notifications.getNotifications(principal.id, unreadOnly === 'true');
  }

  @Get('notifications/unread-count')
  async getUnreadCount(@Principal() principal: AuthPrincipal) {
    return { count: await this.notifications.getUnreadCount(principal.id) };
  }

  @Put('notifications/read-all')
  async markAllNotificationsAsRead(@Principal() principal: AuthPrincipal) {
    const count = await this.notifications.markAllAsRead(principal.id);
    return { success: true, count };
  }

  @Put('notifications/:id/read')
  markNotificationAsRead(@Principal() principal: AuthPrincipal, @Param('id') id: string) {
    return this.notifications.markAsRead(principal.id, id);
  }

  @Delete('notifications/:id')
  @HttpCode(204)
  async deleteNotification(@Principal() principal: AuthPrincipal, @Param('id') id: string): Promise<void> {
    await this.notifications.deleteNotification(principal.id, id);
  }

  @Get('notifications/settings')
  getSettings(@Principal() principal: AuthPrincipal) {
    return this.settings.get(principal.id);
  }

  @Put('notifications/preferences')
  updatePreferences(@Principal() principal: AuthPrincipal, @Body(StrictBody()) dto: UpdateNotificationPreferencesDto) {
    return this.settings.updatePreferences(principal.id, dto);
  }

  @Post('notifications/subscriptions')
  subscribe(@Principal() principal: AuthPrincipal, @Body(StrictBody()) dto: CreateSubscriptionDto) {
    return this.settings.subscribe(principal.id, dto);
  }

  @Delete('notifications/subscriptions/:id')
  @HttpCode(204)
  async unsubscribe(@Principal() principal: AuthPrincipal, @Param('id') id: string): Promise<void> {
    await this.settings.unsubscribe(principal.id, id);
  }

  /** What the server can deliver to, and the caller's deliveries from the last 30 days */
  @Get('notifications/delivery')
  getDelivery(@Principal() principal: AuthPrincipal) {
    return this.delivery.overview(principal.id);
  }

  /**
   * Saves the caller's Slack, Teams or webhook URL (encrypted; never returned)
   * and turns the channel on. For a webhook the signing secret comes back
   * once, in this response.
   */
  @Put('notifications/channels/:channel')
  saveChannelTarget(@Principal() principal: AuthPrincipal, @Param('channel') channel: string, @Body(StrictBody()) dto: ChannelTargetDto) {
    if (channel !== 'webhook' && dto.secret !== undefined) throw new BadRequestException('Only webhooks take a signing secret');
    return this.delivery.saveTarget(principal.id, urlChannel(channel), dto);
  }

  @Delete('notifications/channels/:channel')
  removeChannelTarget(@Principal() principal: AuthPrincipal, @Param('channel') channel: string) {
    return this.delivery.removeTarget(principal.id, urlChannel(channel));
  }

  /** Sends a test message to one channel now and returns the recorded attempt */
  @Post('notifications/channels/:channel/test')
  @HttpCode(200)
  sendTest(@Principal() principal: AuthPrincipal, @Param('channel') channel: string) {
    if (!(DELIVERY_CHANNELS as readonly string[]).includes(channel)) throw new BadRequestException(`channel must be one of ${DELIVERY_CHANNELS.join(', ')}`);
    return this.delivery.sendTest(principal.id, channel as DeliveryChannel);
  }
}

function urlChannel(channel: string): UrlChannel {
  if (!(URL_CHANNELS as readonly string[]).includes(channel)) throw new BadRequestException(`channel must be one of ${URL_CHANNELS.join(', ')}`);
  return channel as UrlChannel;
}
