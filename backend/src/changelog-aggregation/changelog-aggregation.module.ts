import { Module } from '@nestjs/common';
import { ChangelogAggregationService } from './changelog-aggregation.service';
import { ChangelogAggregationController } from './changelog-aggregation.controller';
import { DesignSystemModule } from '../design-system/design-system.module';

@Module({
  imports: [DesignSystemModule],
  controllers: [ChangelogAggregationController],
  providers: [ChangelogAggregationService],
  exports: [ChangelogAggregationService],
})
export class ChangelogAggregationModule {}




