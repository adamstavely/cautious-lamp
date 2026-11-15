import { Module } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { AccessibilityReportsModule } from '../accessibility-reports/accessibility-reports.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { EsIndexService } from '../common/elasticsearch/es-index.service';
import { DesignSystemModule } from '../design-system/design-system.module';
import { EsDocumentStore } from '../reviews/document-store';
import { HEALTH_SNAPSHOTS_INDEX, HEALTH_SNAPSHOT_PROPERTIES, HEALTH_SNAPSHOT_STORE } from './health-snapshots';
import { SystemHealthController } from './system-health.controller';
import { SystemHealthSnapshotScheduler } from './system-health.scheduler';
import { SystemHealthService } from './system-health.service';

/** Health score, recommendations and audit reports, with daily snapshots in Elasticsearch */
@Module({
  imports: [DesignSystemModule, AccessibilityReportsModule, AnalyticsModule],
  controllers: [SystemHealthController],
  providers: [
    SystemHealthService,
    SystemHealthSnapshotScheduler,
    {
      provide: HEALTH_SNAPSHOT_STORE,
      inject: [ElasticsearchService, EsIndexService],
      useFactory: (es: ElasticsearchService, esIndex: EsIndexService) =>
        new EsDocumentStore(es, esIndex, HEALTH_SNAPSHOTS_INDEX, HEALTH_SNAPSHOT_PROPERTIES),
    },
  ],
  exports: [SystemHealthService],
})
export class SystemHealthModule {}
