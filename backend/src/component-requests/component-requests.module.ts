import { Module } from '@nestjs/common';
import { ComponentRequestsController } from './component-requests.controller';
import { ComponentRequestsService } from './component-requests.service';
import { DesignSystemModule } from '../design-system/design-system.module';

@Module({
  imports: [DesignSystemModule],
  controllers: [ComponentRequestsController],
  providers: [ComponentRequestsService],
  exports: [ComponentRequestsService],
})
export class ComponentRequestsModule {}

