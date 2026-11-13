import { Module } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { EsIndexService } from '../common/elasticsearch/es-index.service';
import { EsQueryableStore } from './queryable-store';
import { WorkspaceAccessService } from './workspace-access.service';
import { WORKSPACES_INDEX, WORKSPACE_PROPERTIES, WORKSPACE_STORE } from './workspace.types';

/**
 * The workspace store and access checks, without controllers. Split out so
 * ApplicationsModule can check workspace roles while WorkspacesModule uses
 * ApplicationsService (to block deleting a workspace that still has applications).
 */
@Module({
  providers: [
    WorkspaceAccessService,
    {
      provide: WORKSPACE_STORE,
      inject: [ElasticsearchService, EsIndexService],
      useFactory: (es: ElasticsearchService, esIndex: EsIndexService) =>
        new EsQueryableStore(es, esIndex, WORKSPACES_INDEX, WORKSPACE_PROPERTIES),
    },
  ],
  exports: [WorkspaceAccessService, WORKSPACE_STORE],
})
export class WorkspaceCoreModule {}
