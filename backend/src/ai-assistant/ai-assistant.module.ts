import { Module } from '@nestjs/common';
import { DesignSystemModule } from '../design-system/design-system.module';
import { PatternsLibraryModule } from '../patterns-library/patterns-library.module';
import { AiAssistantController } from './ai-assistant.controller';
import { AiAssistantService } from './ai-assistant.service';
import { AiRateLimitGuard } from './ai-rate-limit.guard';

@Module({
  imports: [DesignSystemModule, PatternsLibraryModule],
  controllers: [AiAssistantController],
  providers: [AiAssistantService, AiRateLimitGuard],
})
export class AiAssistantModule {}
