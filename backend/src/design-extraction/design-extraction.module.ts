import { Module } from '@nestjs/common';
import { DesignExtractionController } from './design-extraction.controller';
import { DesignExtractionService } from './design-extraction.service';
import { DesignSystemModule } from '../design-system/design-system.module';

@Module({
  imports: [DesignSystemModule],
  controllers: [DesignExtractionController],
  providers: [DesignExtractionService],
  exports: [DesignExtractionService],
})
export class DesignExtractionModule {}

