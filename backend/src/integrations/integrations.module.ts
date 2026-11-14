import { Module } from '@nestjs/common';
import { PhotosensitivityModule } from '../photosensitivity/photosensitivity.module';
import { SessionReplayModule } from '../session-replay/session-replay.module';
import { VisualRegressionModule } from '../visual-regression/visual-regression.module';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';

@Module({
  imports: [PhotosensitivityModule, VisualRegressionModule, SessionReplayModule],
  controllers: [IntegrationsController],
  providers: [IntegrationsService],
})
export class IntegrationsModule {}
