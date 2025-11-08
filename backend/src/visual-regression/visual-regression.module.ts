import { Module } from '@nestjs/common';
import { VisualRegressionController } from './visual-regression.controller';
import { VisualRegressionService } from './visual-regression.service';

@Module({
  controllers: [VisualRegressionController],
  providers: [VisualRegressionService],
  exports: [VisualRegressionService],
})
export class VisualRegressionModule {}

