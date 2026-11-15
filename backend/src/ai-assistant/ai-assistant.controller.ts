import { Body, Controller, Get, Post, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthPrincipal, Principal } from '../auth/principal';
import { ChatRequestDto, SuggestionsRequestDto } from './ai-assistant.dto';
import { AiAssistantService } from './ai-assistant.service';
import { AiRateLimitGuard } from './ai-rate-limit.guard';

const body = () => new ValidationPipe({ whitelist: true, transform: true });

/** Eero and AI suggestions. Signed-in callers only (the global AuthGuard), rate limited per person. */
@Controller('api/v1/ai')
export class AiAssistantController {
  constructor(private readonly ai: AiAssistantService) {}

  /** Whether Claude is configured, so the UI can say so before anyone asks */
  @Get('status')
  status() {
    return this.ai.status();
  }

  @Post('chat')
  @UseGuards(AiRateLimitGuard)
  chat(@Body(body()) request: ChatRequestDto, @Principal() principal: AuthPrincipal) {
    return this.ai.chat(principal, request);
  }

  @Post('suggestions')
  @UseGuards(AiRateLimitGuard)
  suggestions(@Body(body()) request: SuggestionsRequestDto, @Principal() principal: AuthPrincipal) {
    return this.ai.suggest(principal, request);
  }
}
