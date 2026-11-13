import { Module } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { EsIndexService } from '../common/elasticsearch/es-index.service';
import { GovernanceModule } from '../governance/governance.module';
import { EsDocumentStore } from '../reviews/document-store';
import { AccessibilityReportsController } from './accessibility-reports.controller';
import { AccessibilityReportsScheduler } from './accessibility-reports.scheduler';
import {
  A11Y_SCANNER,
  AccessibilityReportsService,
  REPORTS_INDEX,
  REPORT_PROPERTIES,
  REPORT_STORE,
  SCHEDULES_INDEX,
  SCHEDULE_PROPERTIES,
  SCHEDULE_STORE,
  SLAS_INDEX,
  SLA_PROPERTIES,
  SLA_STORE,
  axeScanner,
} from './accessibility-reports.service';

const esStore = (index: string, properties: Record<string, unknown>) => ({
  inject: [ElasticsearchService, EsIndexService],
  useFactory: (es: ElasticsearchService, esIndex: EsIndexService) => new EsDocumentStore(es, esIndex, index, properties),
});

/** Accessibility reports, schedules and SLAs. Applications come from GovernanceModule's APPLICATION_DIRECTORY. */
@Module({
  imports: [GovernanceModule],
  controllers: [AccessibilityReportsController],
  providers: [
    AccessibilityReportsService,
    AccessibilityReportsScheduler,
    { provide: REPORT_STORE, ...esStore(REPORTS_INDEX, REPORT_PROPERTIES) },
    { provide: SCHEDULE_STORE, ...esStore(SCHEDULES_INDEX, SCHEDULE_PROPERTIES) },
    { provide: SLA_STORE, ...esStore(SLAS_INDEX, SLA_PROPERTIES) },
    { provide: A11Y_SCANNER, useValue: axeScanner },
  ],
  exports: [AccessibilityReportsService],
})
export class AccessibilityReportsModule {}
