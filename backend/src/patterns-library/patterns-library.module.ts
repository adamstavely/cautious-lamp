import { Module } from '@nestjs/common';
import { PatternsLibraryService } from './patterns-library.service';
import { PatternsLibraryController } from './patterns-library.controller';
import { NotificationsCoreModule } from '../notifications/notifications-core.module';

@Module({
  imports: [NotificationsCoreModule],
  controllers: [PatternsLibraryController],
  providers: [PatternsLibraryService],
  exports: [PatternsLibraryService],
})
export class PatternsLibraryModule {}





