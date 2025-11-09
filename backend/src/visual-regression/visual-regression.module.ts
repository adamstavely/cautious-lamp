import { Module } from '@nestjs/common';
import { VisualRegressionController } from './visual-regression.controller';
import { VisualRegressionService } from './visual-regression.service';
import { VisualRegressionGateway } from './visual-regression.gateway';

@Module({
  controllers: [VisualRegressionController],
  providers: [
    VisualRegressionService,
    VisualRegressionGateway,
    {
      provide: 'INIT_GATEWAY',
      useFactory: (service: VisualRegressionService, gateway: VisualRegressionGateway) => {
        service.setGateway(gateway);
        return true;
      },
      inject: [VisualRegressionService, VisualRegressionGateway],
    },
  ],
  exports: [VisualRegressionService, VisualRegressionGateway],
})
export class VisualRegressionModule {}

