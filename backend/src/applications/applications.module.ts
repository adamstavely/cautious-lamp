import { Module } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { EsIndexService } from '../common/elasticsearch/es-index.service';
import { SessionReplayModule } from '../session-replay/session-replay.module';
import { VisualRegressionModule } from '../visual-regression/visual-regression.module';
import { EsQueryableStore } from '../workspaces/queryable-store';
import { WorkspaceCoreModule } from '../workspaces/workspace-core.module';
import { APPLICATIONS_INDEX, APPLICATION_PROPERTIES, APPLICATION_STORE } from './application.types';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';

/**
 * Application registry (docs/WORKSPACES.md). Other modules (analytics,
 * accessibility reports, compliance scans) read applications through the
 * exported ApplicationsService.
 */
@Module({
  imports: [WorkspaceCoreModule, VisualRegressionModule, SessionReplayModule],
  controllers: [ApplicationsController],
  providers: [
    ApplicationsService,
    {
      provide: APPLICATION_STORE,
      inject: [ElasticsearchService, EsIndexService],
      useFactory: (es: ElasticsearchService, esIndex: EsIndexService) =>
        new EsQueryableStore(es, esIndex, APPLICATIONS_INDEX, APPLICATION_PROPERTIES),
    },
  ],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
