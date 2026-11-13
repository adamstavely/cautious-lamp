import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min } from 'class-validator';

export { strictBody } from '../governance/governance.dto';

const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** What to scan: a public URL (rendered in Chromium) or HTML (jsdom). Neither: the application's URL. */
export class GenerateReportDto {
  @IsOptional() @IsString() @MaxLength(2048) url?: string;
  @IsOptional() @IsString() @MaxLength(512 * 1024) html?: string;
}

export class CreateScheduleDto {
  @IsString() @MaxLength(200) applicationId: string;
  @IsOptional() @IsString() @MaxLength(2048) url?: string;
  @IsIn(['daily', 'weekly', 'monthly']) frequency: 'daily' | 'weekly' | 'monthly';
  @IsOptional() @IsInt() @Min(0) @Max(6) dayOfWeek?: number;
  @IsOptional() @IsInt() @Min(1) @Max(31) dayOfMonth?: number;
  @IsString() @Matches(TIME, { message: 'time must be HH:mm (24-hour, UTC)' }) time: string;
  @IsOptional() @IsBoolean() enabled?: boolean;
}

/** Everything but the application can change; id, nextRun and run history are server-owned */
export class UpdateScheduleDto {
  @IsOptional() @IsString() @MaxLength(2048) url?: string;
  @IsOptional() @IsIn(['daily', 'weekly', 'monthly']) frequency?: 'daily' | 'weekly' | 'monthly';
  @IsOptional() @IsInt() @Min(0) @Max(6) dayOfWeek?: number;
  @IsOptional() @IsInt() @Min(1) @Max(31) dayOfMonth?: number;
  @IsOptional() @IsString() @Matches(TIME, { message: 'time must be HH:mm (24-hour, UTC)' }) time?: string;
  @IsOptional() @IsBoolean() enabled?: boolean;
}

export class CreateSlaDto {
  @IsString() @MaxLength(200) applicationId: string;
  @IsInt() @Min(0) @Max(100) targetScore: number;
  @IsIn(['A', 'AA', 'AAA']) targetLevel: 'A' | 'AA' | 'AAA';
  @IsInt() @Min(0) @Max(10000) criticalIssuesThreshold: number;
  @IsInt() @Min(0) @Max(10000) highIssuesThreshold: number;
}

export class UpdateSlaDto {
  @IsOptional() @IsInt() @Min(0) @Max(100) targetScore?: number;
  @IsOptional() @IsIn(['A', 'AA', 'AAA']) targetLevel?: 'A' | 'AA' | 'AAA';
  @IsOptional() @IsInt() @Min(0) @Max(10000) criticalIssuesThreshold?: number;
  @IsOptional() @IsInt() @Min(0) @Max(10000) highIssuesThreshold?: number;
}
