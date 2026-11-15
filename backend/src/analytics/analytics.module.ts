import { Module, forwardRef, OnModuleInit, Inject } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { EsIndexService } from '../common/elasticsearch/es-index.service';
import { EsDocumentStore } from '../reviews/document-store';
import { COMPONENT_USAGE_INDEX, COMPONENT_USAGE_PROPERTIES, COMPONENT_USAGE_STORE } from './component-usage.types';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { DesignSystemModule } from '../design-system/design-system.module';
import { DesignSystemService } from '../design-system/design-system.service';
import { ApplicationsModule } from '../applications/applications.module';
import { WorkspaceCoreModule } from '../workspaces/workspace-core.module';

@Module({
  imports: [forwardRef(() => DesignSystemModule), ApplicationsModule, WorkspaceCoreModule],
  controllers: [AnalyticsController],
  providers: [
    AnalyticsService,
    {
      provide: COMPONENT_USAGE_STORE,
      inject: [ElasticsearchService, EsIndexService],
      useFactory: (es: ElasticsearchService, esIndex: EsIndexService) =>
        new EsDocumentStore(es, esIndex, COMPONENT_USAGE_INDEX, COMPONENT_USAGE_PROPERTIES),
    },
  ],
  exports: [AnalyticsService],
})
export class AnalyticsModule implements OnModuleInit {
  constructor(
    private analyticsService: AnalyticsService,
    @Inject(forwardRef(() => DesignSystemService))
    private designSystemService: DesignSystemService,
  ) {}

  onModuleInit() {
    // Set analytics service in design system service to avoid circular dependency
    this.designSystemService.setAnalyticsService(this.analyticsService);
  }
}

