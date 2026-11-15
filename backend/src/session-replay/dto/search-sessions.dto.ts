import { IsIn, IsISO8601, IsNotEmpty, IsNumberString, IsOptional, IsString, MaxLength } from 'class-validator';

/** Query for GET .../sessions: OpenReplay's public API lists sessions per user, in a time window */
export class SearchSessionsQueryDto {
  /** The id the app passed to tracker.setUserID */
  @IsString()
  @IsNotEmpty({ message: 'userId is required: OpenReplay lists sessions per user' })
  @MaxLength(256)
  userId: string;

  /** ISO date or date-time; defaults to 7 days before endDate */
  @IsOptional()
  @IsISO8601()
  startDate?: string;

  /** ISO date or date-time; defaults to now */
  @IsOptional()
  @IsISO8601()
  endDate?: string;

  /** From 1 */
  @IsOptional()
  @IsNumberString({ no_symbols: true })
  page?: string;

  /** 1-200 */
  @IsOptional()
  @IsNumberString({ no_symbols: true })
  limit?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}

/** Query for GET .../sessions/:sessionId/events */
export class SessionEventsQueryDto {
  @IsOptional()
  @IsISO8601()
  startDate?: string;

  @IsOptional()
  @IsISO8601()
  endDate?: string;

  @IsOptional()
  @IsNumberString({ no_symbols: true })
  page?: string;

  @IsOptional()
  @IsNumberString({ no_symbols: true })
  limit?: string;
}
