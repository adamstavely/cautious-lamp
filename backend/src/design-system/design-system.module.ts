import { Module, forwardRef } from '@nestjs/common';
import { DesignSystemController } from './design-system.controller';
import { DesignSystemService } from './design-system.service';
import { ComponentRequestService } from './component-request.service';
import { NotificationService } from './notification.service';
import { ComplianceScannerService } from './compliance-scanner.service';
import { ApplicationScannerService } from './application-scanner.service';
import { VisualRegressionModule } from '../visual-regression/visual-regression.module';
import { SessionReplayModule } from '../session-replay/session-replay.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { ElasticsearchModule } from '@nestjs/elasticsearch';

@Module({
  imports: [VisualRegressionModule, SessionReplayModule, forwardRef(() => AnalyticsModule)],
  controllers: [DesignSystemController],
  providers: [
    DesignSystemService,
    ComponentRequestService,
    NotificationService,
    ComplianceScannerService,
    ApplicationScannerService
  ],
  exports: [DesignSystemService, ComponentRequestService, NotificationService],
})
export class DesignSystemModule {
  constructor(
    private componentRequestService: ComponentRequestService,
    private notificationService: NotificationService,
    private designSystemService: DesignSystemService
  ) {
    // Inject notification service into component request service
    this.componentRequestService.setNotificationService(this.notificationService);
  }

  // This will be called by AnalyticsModule to set the analytics service
  onModuleInit() {
    // Analytics service will be set via setAnalyticsService method
  }
}

