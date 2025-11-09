import { Module } from '@nestjs/common';
import { ColorPaletteModule } from './color-palette/color-palette.module';
import { DesignSystemModule } from './design-system/design-system.module';
import { AuditModule } from './audit/audit.module';
import { RbacModule } from './rbac/rbac.module';
import { FeatureFlagsModule } from './feature-flags/feature-flags.module';
import { VisualRegressionModule } from './visual-regression/visual-regression.module';
import { SessionReplayModule } from './session-replay/session-replay.module';
import { PhotosensitivityModule } from './photosensitivity/photosensitivity.module';
import { AccessibilityReportsModule } from './accessibility-reports/accessibility-reports.module';
import { SystemHealthModule } from './system-health/system-health.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { TokenSyncModule } from './token-sync/token-sync.module';
import { DesignSyncModule } from './design-sync/design-sync.module';
import { ComponentScaffoldingModule } from './component-scaffolding/component-scaffolding.module';
import { ComponentRequestsModule } from './component-requests/component-requests.module';
import { PatternsLibraryModule } from './patterns-library/patterns-library.module';
import { ChangelogAggregationModule } from './changelog-aggregation/changelog-aggregation.module';
import { ContributionWorkflowModule } from './contribution-workflow/contribution-workflow.module';
import { ApiVersioningModule } from './api-versioning/api-versioning.module';
import { SearchModule } from './search/search.module';
import { ElasticsearchModule } from '@nestjs/elasticsearch';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      useFactory: () => {
        const node = process.env.ELASTICSEARCH_NODE || 'http://localhost:9200';
        return {
          node,
          // Make connection optional - don't fail if Elasticsearch isn't available
          maxRetries: 0,
          requestTimeout: 1000,
        };
      },
    }),
    ColorPaletteModule,
    DesignSystemModule,
    AuditModule,
    RbacModule,
    FeatureFlagsModule,
    VisualRegressionModule,
    SessionReplayModule,
    PhotosensitivityModule,
    AccessibilityReportsModule,
    SystemHealthModule,
    AnalyticsModule,
    TokenSyncModule,
    DesignSyncModule,
    ComponentScaffoldingModule,
    ComponentRequestsModule,
    PatternsLibraryModule,
    ChangelogAggregationModule,
    ContributionWorkflowModule,
    ApiVersioningModule,
    SearchModule,
  ],
})
export class AppModule {}

