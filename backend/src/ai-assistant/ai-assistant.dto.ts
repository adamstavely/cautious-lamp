import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsIn, IsOptional, IsString, MaxLength, MinLength, ValidateNested } from 'class-validator';

/** Input caps: what one person can reasonably type or paste, and what keeps a request's cost bounded */
export const AI_LIMITS = {
  message: 4000,
  historyTurns: 20,
  code: 20000,
} as const;

export const SUGGESTION_FOCUSES = ['general', 'accessibility', 'components', 'patterns'] as const;
export type SuggestionFocus = (typeof SUGGESTION_FOCUSES)[number];

export class ChatTurnDto {
  @IsIn(['user', 'assistant']) role: 'user' | 'assistant';
  @IsString() @MaxLength(AI_LIMITS.message) content: string;
}

export class ChatRequestDto {
  @IsString() @MinLength(1) @MaxLength(AI_LIMITS.message) message: string;

  /** Earlier turns, oldest first; the widget sends its last ten */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(AI_LIMITS.historyTurns)
  @ValidateNested({ each: true })
  @Type(() => ChatTurnDto)
  conversationHistory?: ChatTurnDto[];
}

export class SuggestionsRequestDto {
  @IsString() @MinLength(1) @MaxLength(AI_LIMITS.code) code: string;
  @IsOptional() @IsIn(SUGGESTION_FOCUSES) focus?: SuggestionFocus;
}
