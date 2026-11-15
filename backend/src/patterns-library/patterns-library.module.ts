import { Module } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { EsIndexService } from '../common/elasticsearch/es-index.service';
import { SEED_MARKER_PROPERTIES } from '../common/elasticsearch/seed-defaults';
import { EsDocumentStore } from '../reviews/document-store';
import {
  PATTERNS_INDEX,
  PATTERNS_META_INDEX,
  PATTERN_META_STORE,
  PATTERN_PROPERTIES,
  PATTERN_STORE,
  PatternsLibraryService,
} from './patterns-library.service';
import { PatternsLibraryController } from './patterns-library.controller';
import { NotificationsCoreModule } from '../notifications/notifications-core.module';

@Module({
  imports: [NotificationsCoreModule],
  controllers: [PatternsLibraryController],
  providers: [
    PatternsLibraryService,
    {
      provide: PATTERN_STORE,
      inject: [ElasticsearchService, EsIndexService],
      useFactory: (es: ElasticsearchService, esIndex: EsIndexService) => new EsDocumentStore(es, esIndex, PATTERNS_INDEX, PATTERN_PROPERTIES),
    },
    {
      provide: PATTERN_META_STORE,
      inject: [ElasticsearchService, EsIndexService],
      useFactory: (es: ElasticsearchService, esIndex: EsIndexService) => new EsDocumentStore(es, esIndex, PATTERNS_META_INDEX, SEED_MARKER_PROPERTIES),
    },
  ],
  exports: [PatternsLibraryService],
})
export class PatternsLibraryModule {}
