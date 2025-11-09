import { Module } from '@nestjs/common';
import { TokenSyncController } from './token-sync.controller';
import { TokenSyncService } from './token-sync.service';
import { DesignSystemModule } from '../design-system/design-system.module';

@Module({
  imports: [DesignSystemModule],
  controllers: [TokenSyncController],
  providers: [TokenSyncService],
  exports: [TokenSyncService],
})
export class TokenSyncModule {}

