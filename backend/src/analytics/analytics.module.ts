import { Module, forwardRef, OnModuleInit, Inject } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { DesignSystemModule } from '../design-system/design-system.module';
import { DesignSystemService } from '../design-system/design-system.service';
import { ApplicationsModule } from '../applications/applications.module';

@Module({
  imports: [forwardRef(() => DesignSystemModule), ApplicationsModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule implements OnModuleInit {
  constructor(
    private analyticsService: AnalyticsService,
    @Inject(forwardRef(() => DesignSystemService))
    private designSystemService: DesignSystemService,
  ) {}

  onModuleInit() {
    // Set analytics service in design system service to avoid circular dependency
    this.designSystemService.setAnalyticsService(this.analyticsService);
  }
}

