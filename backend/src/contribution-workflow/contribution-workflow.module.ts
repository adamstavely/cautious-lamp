import { Module } from '@nestjs/common';
import { ContributionWorkflowService } from './contribution-workflow.service';
import { ContributionWorkflowController } from './contribution-workflow.controller';
import { DesignSystemModule } from '../design-system/design-system.module';

@Module({
  imports: [DesignSystemModule],
  controllers: [ContributionWorkflowController],
  providers: [ContributionWorkflowService],
  exports: [ContributionWorkflowService],
})
export class ContributionWorkflowModule {}

