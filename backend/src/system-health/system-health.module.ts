import { Module } from '@nestjs/common';
import { SystemHealthController } from './system-health.controller';
import { SystemHealthService } from './system-health.service';
import { DesignSystemModule } from '../design-system/design-system.module';
import { AccessibilityReportsModule } from '../accessibility-reports/accessibility-reports.module';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [DesignSystemModule, AccessibilityReportsModule, AnalyticsModule],
  controllers: [SystemHealthController],
  providers: [SystemHealthService],
  exports: [SystemHealthService],
})
export class SystemHealthModule {}

