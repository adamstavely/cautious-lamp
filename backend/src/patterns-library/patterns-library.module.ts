import { Module } from '@nestjs/common';
import { PatternsLibraryService } from './patterns-library.service';
import { PatternsLibraryController } from './patterns-library.controller';

@Module({
  controllers: [PatternsLibraryController],
  providers: [PatternsLibraryService],
  exports: [PatternsLibraryService],
})
export class PatternsLibraryModule {}

