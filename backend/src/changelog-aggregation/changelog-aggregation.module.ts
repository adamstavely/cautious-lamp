import { Module } from '@nestjs/common';
import { NotificationsCoreModule } from '../notifications/notifications-core.module';
import { ChangelogAggregationController } from './changelog-aggregation.controller';

/** The changelog routes; ChangelogAggregationService itself lives in NotificationsCoreModule */
@Module({
  imports: [NotificationsCoreModule],
  controllers: [ChangelogAggregationController],
})
export class ChangelogAggregationModule {}
