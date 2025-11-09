import { Module } from '@nestjs/common';
import { DesignSyncController } from './design-sync.controller';
import { DesignSyncService } from './design-sync.service';
import { DesignSystemModule } from '../design-system/design-system.module';

@Module({
  imports: [DesignSystemModule],
  controllers: [DesignSyncController],
  providers: [DesignSyncService],
  exports: [DesignSyncService],
})
export class DesignSyncModule {}

