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
import { SecurityModule } from './common/security/security.module';
import { DesignExtractionModule } from './design-extraction/design-extraction.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { rateLimitConfig } from './common/rate-limiting/rate-limit.config';
import { APP_GUARD } from '@nestjs/core';
import { CustomThrottlerGuard } from './common/rate-limiting/rate-limit.guard';
import { AppElasticsearchModule } from './common/elasticsearch/elasticsearch.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AltTextModule } from './alt-text/alt-text.module';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/auth.guard';

@Module({
  imports: [
    ThrottlerModule.forRoot(rateLimitConfig),
    AppElasticsearchModule,
    AltTextModule,
    ColorPaletteModule,
    DesignSystemModule,
    AuditModule,
    RbacModule,
    AuthModule,
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
    SecurityModule,
    DesignExtractionModule,
    ReviewsModule,
  ],
  // Global guards run in this order: rate limiting first, then authentication
  providers: [
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useExisting: AuthGuard,
    },
  ],
})
export class AppModule {}

