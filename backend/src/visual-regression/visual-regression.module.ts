import { Module } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { EsIndexService } from '../common/elasticsearch/es-index.service';
import { EsQueryableStore } from '../workspaces/queryable-store';
import { WorkspaceCoreModule } from '../workspaces/workspace-core.module';
import { ProjectAccessService } from './project-access';
import { VisualRegressionController, ArgosWebhookController } from './visual-regression.controller';
import { VisualRegressionService } from './visual-regression.service';
import {
  VR_PROJECTS_INDEX,
  VR_PROJECT_PROPERTIES,
  VR_PROJECT_STORE,
  VR_RUNS_INDEX,
  VR_RUN_PROPERTIES,
  VR_RUN_STORE,
} from './visual-regression.types';

@Module({
  imports: [WorkspaceCoreModule],
  controllers: [VisualRegressionController, ArgosWebhookController],
  providers: [
    VisualRegressionService,
    ProjectAccessService,
    {
      provide: VR_PROJECT_STORE,
      inject: [ElasticsearchService, EsIndexService],
      useFactory: (es: ElasticsearchService, esIndex: EsIndexService) =>
        new EsQueryableStore(es, esIndex, VR_PROJECTS_INDEX, VR_PROJECT_PROPERTIES),
    },
    {
      provide: VR_RUN_STORE,
      inject: [ElasticsearchService, EsIndexService],
      useFactory: (es: ElasticsearchService, esIndex: EsIndexService) =>
        new EsQueryableStore(es, esIndex, VR_RUNS_INDEX, VR_RUN_PROPERTIES),
    },
  ],
  exports: [VisualRegressionService, ProjectAccessService],
})
export class VisualRegressionModule {}
