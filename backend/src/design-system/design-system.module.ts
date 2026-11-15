import { Module, forwardRef } from '@nestjs/common';
import { DesignSystemController } from './design-system.controller';
import { DesignSystemService } from './design-system.service';
import { ComponentIssueService } from './component-issue.service';
import { NotificationsCoreModule } from '../notifications/notifications-core.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { SecurityModule } from '../common/security/security.module';
import { WorkspaceCoreModule } from '../workspaces/workspace-core.module';
import { ComponentAccessService } from './component-access.service';
import { DESIGN_SYSTEM_STORE_PROVIDERS } from './design-system-stores';

@Module({
  imports: [forwardRef(() => AnalyticsModule), SecurityModule, WorkspaceCoreModule, NotificationsCoreModule],
  controllers: [DesignSystemController],
  providers: [
    DesignSystemService,
    ComponentIssueService,
    ComponentAccessService,
    ...DESIGN_SYSTEM_STORE_PROVIDERS,
  ],
  exports: [DesignSystemService, ComponentIssueService, ComponentAccessService],
})
export class DesignSystemModule {}
