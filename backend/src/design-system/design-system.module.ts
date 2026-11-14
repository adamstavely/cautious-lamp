import { Module, forwardRef } from '@nestjs/common';
import { DesignSystemController } from './design-system.controller';
import { DesignSystemService } from './design-system.service';
import { ComponentRequestService } from './component-request.service';
import { NotificationService } from './notification.service';
import { AnalyticsModule } from '../analytics/analytics.module';
import { SecurityModule } from '../common/security/security.module';
import { WorkspaceCoreModule } from '../workspaces/workspace-core.module';
import { ComponentAccessService } from './component-access.service';

@Module({
  imports: [forwardRef(() => AnalyticsModule), SecurityModule, WorkspaceCoreModule],
  controllers: [DesignSystemController],
  providers: [
    DesignSystemService,
    ComponentRequestService,
    NotificationService,
    ComponentAccessService,
  ],
  exports: [DesignSystemService, ComponentRequestService, NotificationService, ComponentAccessService],
})
export class DesignSystemModule {
  constructor(
    private componentRequestService: ComponentRequestService,
    private notificationService: NotificationService,
    private designSystemService: DesignSystemService
  ) {
    // Inject notification service into component request service
    this.componentRequestService.setNotificationService(this.notificationService);
    
    // Set up auto-linking callback: when a component is created, automatically link to matching requests
    this.designSystemService.setComponentCreatedCallback(
      (componentId: string, componentName: string, linkedRequestId?: string) => {
        this.componentRequestService.onComponentCreated(componentId, componentName, linkedRequestId);
      }
    );
  }

  // This will be called by AnalyticsModule to set the analytics service
  onModuleInit() {
    // Analytics service will be set via setAnalyticsService method
  }
}

