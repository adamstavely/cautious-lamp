import { Module } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { EsIndexService } from '../common/elasticsearch/es-index.service';
import { ProjectAccessService } from '../visual-regression/project-access';
import { EsQueryableStore } from '../workspaces/queryable-store';
import { WorkspaceCoreModule } from '../workspaces/workspace-core.module';
import { SessionReplayController } from './session-replay.controller';
import { SR_PROJECTS_INDEX, SR_PROJECT_PROPERTIES, SR_PROJECT_STORE, SessionReplayService } from './session-replay.service';

@Module({
  imports: [WorkspaceCoreModule],
  controllers: [SessionReplayController],
  providers: [
    SessionReplayService,
    ProjectAccessService,
    {
      provide: SR_PROJECT_STORE,
      inject: [ElasticsearchService, EsIndexService],
      useFactory: (es: ElasticsearchService, esIndex: EsIndexService) =>
        new EsQueryableStore(es, esIndex, SR_PROJECTS_INDEX, SR_PROJECT_PROPERTIES),
    },
  ],
  exports: [SessionReplayService],
})
export class SessionReplayModule {}
