import { Module } from '@nestjs/common';
import { FeatureFlagsService } from './feature-flags.service';
import { FeatureFlagsController } from './feature-flags.controller';

@Module({
  imports: [],
  providers: [FeatureFlagsService],
  controllers: [FeatureFlagsController],
  exports: [FeatureFlagsService],
})
export class FeatureFlagsModule {}

