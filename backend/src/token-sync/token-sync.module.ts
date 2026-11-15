import { Module } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { EsIndexService } from '../common/elasticsearch/es-index.service';
import { EsDocumentStore } from '../reviews/document-store';
import { CONNECTION_PROPERTIES } from './connection-registry';
import { TokenSyncController } from './token-sync.controller';
import { TOKEN_SYNC_CONNECTIONS_INDEX, TOKEN_SYNC_CONNECTION_STORE, TokenSyncService } from './token-sync.service';
import { DesignSystemModule } from '../design-system/design-system.module';

@Module({
  imports: [DesignSystemModule],
  controllers: [TokenSyncController],
  providers: [
    TokenSyncService,
    {
      provide: TOKEN_SYNC_CONNECTION_STORE,
      inject: [ElasticsearchService, EsIndexService],
      useFactory: (es: ElasticsearchService, esIndex: EsIndexService) =>
        new EsDocumentStore(es, esIndex, TOKEN_SYNC_CONNECTIONS_INDEX, CONNECTION_PROPERTIES),
    },
  ],
  exports: [TokenSyncService],
})
export class TokenSyncModule {}
