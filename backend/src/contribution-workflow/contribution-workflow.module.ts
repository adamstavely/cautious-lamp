import { Module } from '@nestjs/common';
import { ContributionWorkflowService } from './contribution-workflow.service';
import { ContributionWorkflowController } from './contribution-workflow.controller';
import { DesignSystemModule } from '../design-system/design-system.module';
import { GovernanceModule } from '../governance/governance.module';

@Module({
  imports: [DesignSystemModule, GovernanceModule],
  controllers: [ContributionWorkflowController],
  providers: [ContributionWorkflowService],
  exports: [ContributionWorkflowService],
})
export class ContributionWorkflowModule {}





