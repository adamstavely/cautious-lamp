import { Module } from '@nestjs/common';
import { AccessibilityReportsController } from './accessibility-reports.controller';
import { AccessibilityReportsService } from './accessibility-reports.service';
import { DesignSystemModule } from '../design-system/design-system.module';

@Module({
  imports: [DesignSystemModule],
  controllers: [AccessibilityReportsController],
  providers: [AccessibilityReportsService],
  exports: [AccessibilityReportsService],
})
export class AccessibilityReportsModule {}

