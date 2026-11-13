import { Module } from '@nestjs/common';
import { DesignExtractionController } from './design-extraction.controller';
import { DesignExtractionService } from './design-extraction.service';

@Module({
  controllers: [DesignExtractionController],
  providers: [DesignExtractionService],
  exports: [DesignExtractionService],
})
export class DesignExtractionModule {}

