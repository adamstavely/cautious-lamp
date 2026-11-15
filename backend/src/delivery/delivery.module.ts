import { Module } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { EsIndexService } from '../common/elasticsearch/es-index.service';
import { EsDocumentStore } from '../reviews/document-store';
import { DeliveryRetentionJob, esAttemptPruner } from './delivery-retention';
import { DeliveryService } from './delivery.service';
import {
  DELIVERY_ATTEMPTS_INDEX,
  DELIVERY_ATTEMPT_PROPERTIES,
  DELIVERY_ATTEMPT_PRUNER,
  DELIVERY_ATTEMPT_STORE,
  DELIVERY_META_INDEX,
  DELIVERY_META_PROPERTIES,
  DELIVERY_META_STORE,
} from './delivery.types';

/**
 * Outbound delivery (email, Slack, Teams, signed webhooks) and its record of
 * attempts. Notifications and visual regression import it; it depends only on
 * Elasticsearch, so it creates no cycles. DeliveryRetentionJob deletes
 * attempts older than DELIVERY_ATTEMPT_RETENTION_DAYS (90) once a day.
 */
@Module({
  providers: [
    DeliveryService,
    {
      provide: DELIVERY_ATTEMPT_STORE,
      inject: [ElasticsearchService, EsIndexService],
      useFactory: (es: ElasticsearchService, esIndex: EsIndexService) =>
        new EsDocumentStore(es, esIndex, DELIVERY_ATTEMPTS_INDEX, DELIVERY_ATTEMPT_PROPERTIES),
    },
    {
      provide: DELIVERY_META_STORE,
      inject: [ElasticsearchService, EsIndexService],
      useFactory: (es: ElasticsearchService, esIndex: EsIndexService) =>
        new EsDocumentStore(es, esIndex, DELIVERY_META_INDEX, DELIVERY_META_PROPERTIES),
    },
    {
      provide: DELIVERY_ATTEMPT_PRUNER,
      inject: [ElasticsearchService],
      useFactory: (es: ElasticsearchService) => esAttemptPruner(es),
    },
    DeliveryRetentionJob,
  ],
  exports: [DeliveryService],
})
export class DeliveryModule {}
