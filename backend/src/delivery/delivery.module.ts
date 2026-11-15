import { Module } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { EsIndexService } from '../common/elasticsearch/es-index.service';
import { EsDocumentStore } from '../reviews/document-store';
import { DeliveryService } from './delivery.service';
import { DELIVERY_ATTEMPTS_INDEX, DELIVERY_ATTEMPT_PROPERTIES, DELIVERY_ATTEMPT_STORE } from './delivery.types';

/**
 * Outbound delivery (email, Slack, Teams, signed webhooks) and its record of
 * attempts. Notifications and visual regression import it; it depends only on
 * Elasticsearch, so it creates no cycles.
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
  ],
  exports: [DeliveryService],
})
export class DeliveryModule {}
