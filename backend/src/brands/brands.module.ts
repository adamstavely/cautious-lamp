import { Module } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { EsIndexService } from '../common/elasticsearch/es-index.service';
import { DesignSystemModule } from '../design-system/design-system.module';
import { EsDocumentStore } from '../reviews/document-store';
import { BrandsController } from './brands.controller';
import { BrandsService } from './brands.service';
import { BRANDS_INDEX, BRAND_PROPERTIES, BRAND_STORE } from './brands.types';

@Module({
  imports: [DesignSystemModule],
  providers: [
    BrandsService,
    {
      provide: BRAND_STORE,
      inject: [ElasticsearchService, EsIndexService],
      useFactory: (es: ElasticsearchService, esIndex: EsIndexService) => new EsDocumentStore(es, esIndex, BRANDS_INDEX, BRAND_PROPERTIES),
    },
  ],
  controllers: [BrandsController],
})
export class BrandsModule {}
