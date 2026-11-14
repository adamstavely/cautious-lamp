import { Module } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { EsIndexService } from '../common/elasticsearch/es-index.service';
import { EsDocumentStore } from '../reviews/document-store';
import { FeatureFlagsService, FEATURE_FLAGS_INDEX, FEATURE_FLAG_PROPERTIES, FEATURE_FLAG_STORE } from './feature-flags.service';
import { FeatureFlagsController } from './feature-flags.controller';

@Module({
  imports: [],
  providers: [
    FeatureFlagsService,
    {
      provide: FEATURE_FLAG_STORE,
      inject: [ElasticsearchService, EsIndexService],
      useFactory: (es: ElasticsearchService, esIndex: EsIndexService) =>
        new EsDocumentStore(es, esIndex, FEATURE_FLAGS_INDEX, FEATURE_FLAG_PROPERTIES),
    },
  ],
  controllers: [FeatureFlagsController],
  exports: [FeatureFlagsService],
})
export class FeatureFlagsModule {}
