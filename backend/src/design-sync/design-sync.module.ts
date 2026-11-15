import { Module } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { EsIndexService } from '../common/elasticsearch/es-index.service';
import { EsDocumentStore } from '../reviews/document-store';
import { CONNECTION_PROPERTIES } from '../token-sync/connection-registry';
import { DesignSyncController } from './design-sync.controller';
import { DESIGN_SYNC_CONNECTIONS_INDEX, DESIGN_SYNC_CONNECTION_STORE, DesignSyncService } from './design-sync.service';
import { DesignSystemModule } from '../design-system/design-system.module';
import { DesignToolsModule } from '../design-tools/design-tools.module';

@Module({
  imports: [DesignSystemModule, DesignToolsModule],
  controllers: [DesignSyncController],
  providers: [
    DesignSyncService,
    {
      provide: DESIGN_SYNC_CONNECTION_STORE,
      inject: [ElasticsearchService, EsIndexService],
      useFactory: (es: ElasticsearchService, esIndex: EsIndexService) =>
        new EsDocumentStore(es, esIndex, DESIGN_SYNC_CONNECTIONS_INDEX, CONNECTION_PROPERTIES),
    },
  ],
  exports: [DesignSyncService],
})
export class DesignSyncModule {}
