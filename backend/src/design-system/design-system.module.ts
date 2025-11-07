import { Module } from '@nestjs/common';
import { DesignSystemController } from './design-system.controller';
import { DesignSystemService } from './design-system.service';
import { ComponentRequestService } from './component-request.service';
import { NotificationService } from './notification.service';
import { ComplianceScannerService } from './compliance-scanner.service';
import { ApplicationScannerService } from './application-scanner.service';

@Module({
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
    private notificationService: NotificationService
  ) {
    // Inject notification service into component request service
    this.componentRequestService.setNotificationService(this.notificationService);
  }
}

