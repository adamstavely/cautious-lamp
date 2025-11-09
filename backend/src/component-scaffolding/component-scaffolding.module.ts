import { Module } from '@nestjs/common';
import { ComponentScaffoldingController } from './component-scaffolding.controller';
import { ComponentScaffoldingService } from './component-scaffolding.service';
import { DesignSystemModule } from '../design-system/design-system.module';

@Module({
  imports: [DesignSystemModule],
  controllers: [ComponentScaffoldingController],
  providers: [ComponentScaffoldingService],
  exports: [ComponentScaffoldingService],
})
export class ComponentScaffoldingModule {}

