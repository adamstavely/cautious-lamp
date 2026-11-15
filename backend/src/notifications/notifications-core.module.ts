import { Module } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ChangelogAggregationService } from '../changelog-aggregation/changelog-aggregation.service';
import { EsIndexService } from '../common/elasticsearch/es-index.service';
import { DeliveryModule } from '../delivery/delivery.module';
import { EsDocumentStore } from '../reviews/document-store';
import { EsQueryableStore } from '../workspaces/queryable-store';
import { WorkspaceCoreModule } from '../workspaces/workspace-core.module';
import { NotificationDeliveryService } from './notification-delivery.service';
import { NotificationService } from './notification.service';
import { NotificationSettingsService } from './notification-settings.service';
import {
  CHANGELOG_INDEX,
  CHANGELOG_PROPERTIES,
  CHANGELOG_STORE,
  CHANGE_RECORDER,
  NOTIFICATIONS_INDEX,
  NOTIFICATION_PROPERTIES,
  NOTIFICATION_SETTINGS_INDEX,
  NOTIFICATION_SETTINGS_PROPERTIES,
  NOTIFICATION_SETTINGS_STORE,
  NOTIFICATION_STORE,
} from './notification.types';

/**
 * Notifications, people's notification settings and the changelog, without
 * controllers. Write paths in other modules import this for CHANGE_RECORDER;
 * it only needs Elasticsearch, the workspace store and outbound delivery, so
 * it creates no cycles.
 */
@Module({
  imports: [WorkspaceCoreModule, DeliveryModule],
  providers: [
    NotificationService,
    NotificationDeliveryService,
    NotificationSettingsService,
    ChangelogAggregationService,
    { provide: CHANGE_RECORDER, useExisting: ChangelogAggregationService },
    {
      provide: NOTIFICATION_STORE,
      inject: [ElasticsearchService, EsIndexService],
      useFactory: (es: ElasticsearchService, esIndex: EsIndexService) =>
        new EsDocumentStore(es, esIndex, NOTIFICATIONS_INDEX, NOTIFICATION_PROPERTIES),
    },
    {
      provide: NOTIFICATION_SETTINGS_STORE,
      inject: [ElasticsearchService, EsIndexService],
      useFactory: (es: ElasticsearchService, esIndex: EsIndexService) =>
        new EsQueryableStore(es, esIndex, NOTIFICATION_SETTINGS_INDEX, NOTIFICATION_SETTINGS_PROPERTIES),
    },
    {
      provide: CHANGELOG_STORE,
      inject: [ElasticsearchService, EsIndexService],
      useFactory: (es: ElasticsearchService, esIndex: EsIndexService) =>
        new EsDocumentStore(es, esIndex, CHANGELOG_INDEX, CHANGELOG_PROPERTIES),
    },
  ],
  exports: [NotificationService, NotificationSettingsService, NotificationDeliveryService, ChangelogAggregationService, CHANGE_RECORDER],
})
export class NotificationsCoreModule {}
