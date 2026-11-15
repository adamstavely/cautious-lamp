import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsCoreModule } from './notifications-core.module';

/** The notification routes (NotificationsController) over NotificationsCoreModule */
@Module({
  imports: [NotificationsCoreModule],
  controllers: [NotificationsController],
})
export class NotificationsModule {}
