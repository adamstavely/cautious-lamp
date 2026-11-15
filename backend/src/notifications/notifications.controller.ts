import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query } from '@nestjs/common';
import { AuthPrincipal, Principal } from '../auth/principal';
import { StrictBody } from '../workspaces/workspace.dto';
import { CreateSubscriptionDto, UpdateNotificationPreferencesDto } from './notification.dto';
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
}
