import { Module } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { EsIndexService } from '../common/elasticsearch/es-index.service';
import { EsDocumentStore } from '../reviews/document-store';
import { DESIGN_TOOL_READER, DesignToolReader } from './design-tool-reader';
import { publicJsonHttp } from './design-tool-http';
import { SYNC_RUNS_INDEX, SYNC_RUN_PROPERTIES, SYNC_RUN_STORE, SyncRunLog } from './sync-runs';

/** Figma and Penpot readers (outbound calls through the egress checks) and the sync run log */
@Module({
  providers: [
    { provide: DESIGN_TOOL_READER, useFactory: () => new DesignToolReader(publicJsonHttp()) },
    {
      provide: SYNC_RUN_STORE,
      inject: [ElasticsearchService, EsIndexService],
      useFactory: (es: ElasticsearchService, esIndex: EsIndexService) => new SyncRunLog(new EsDocumentStore(es, esIndex, SYNC_RUNS_INDEX, SYNC_RUN_PROPERTIES)),
    },
  ],
  exports: [DESIGN_TOOL_READER, SYNC_RUN_STORE],
})
export class DesignToolsModule {}
