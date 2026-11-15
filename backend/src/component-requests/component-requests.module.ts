import { Module } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { EsIndexService } from '../common/elasticsearch/es-index.service';
import { DesignSystemModule } from '../design-system/design-system.module';
import { NotificationsCoreModule } from '../notifications/notifications-core.module';
import { EsDocumentStore } from '../reviews/document-store';
import { EsQueryableStore } from '../workspaces/queryable-store';
import {
  COMPONENT_REQUESTS_INDEX,
  COMPONENT_REQUEST_COMMENTS_INDEX,
  COMPONENT_REQUEST_COMMENT_STORE,
  COMPONENT_REQUEST_PROPERTIES,
  COMPONENT_REQUEST_STORE,
  REQUEST_COMMENT_PROPERTIES,
} from './component-request.types';
import { ComponentRequestsController } from './component-requests.controller';
import { ComponentRequestsService } from './component-requests.service';

@Module({
  imports: [DesignSystemModule, NotificationsCoreModule],
  controllers: [ComponentRequestsController],
  providers: [
    ComponentRequestsService,
    {
      provide: COMPONENT_REQUEST_STORE,
      inject: [ElasticsearchService, EsIndexService],
      useFactory: (es: ElasticsearchService, esIndex: EsIndexService) =>
        new EsQueryableStore(es, esIndex, COMPONENT_REQUESTS_INDEX, COMPONENT_REQUEST_PROPERTIES),
    },
    {
      provide: COMPONENT_REQUEST_COMMENT_STORE,
      inject: [ElasticsearchService, EsIndexService],
      useFactory: (es: ElasticsearchService, esIndex: EsIndexService) =>
        new EsDocumentStore(es, esIndex, COMPONENT_REQUEST_COMMENTS_INDEX, REQUEST_COMMENT_PROPERTIES),
    },
  ],
  exports: [ComponentRequestsService],
})
export class ComponentRequestsModule {}
