import { Global, Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { EsIndexService } from './es-index.service';

/**
 * One Elasticsearch connection for the whole app. @nestjs/elasticsearch modules
 * aren't global, so without this every feature module's ElasticsearchService was
 * undefined and their data only lived in memory.
 */
@Global()
@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      useFactory: () => ({
        node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
        auth: process.env.ELASTICSEARCH_USERNAME
          ? {
              username: process.env.ELASTICSEARCH_USERNAME,
              password: process.env.ELASTICSEARCH_PASSWORD ?? '',
            }
          : undefined,
        maxRetries: 1,
        requestTimeout: 5000,
      }),
    }),
  ],
  providers: [EsIndexService],
  exports: [ElasticsearchModule, EsIndexService],
})
export class AppElasticsearchModule {}
