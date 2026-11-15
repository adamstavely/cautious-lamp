import { Transform } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsBoolean, IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { MAX_RECIPIENTS } from '../visual-regression-notifier';

export class CreateBaselineDto {
  @IsString()
  @MaxLength(200)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  runId: string;
}

/** `secret` is generated when left out */
export class WebhookSecretDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  secret?: string;
}

/**
 * One notification channel. Fields left out keep their saved value, so
 * `{ type, enabled }` only turns the channel on or off.
 */
export class NotificationSettingsDto {
  @IsIn(['email', 'slack', 'teams', 'webhook'])
  type: 'email' | 'slack' | 'teams' | 'webhook';

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  /** Email only */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_RECIPIENTS)
  @IsEmail({}, { each: true })
  recipients?: string[];

  /** Slack, Teams or webhook: the URL to post to (https, public addresses only) */
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  url?: string;

  /** Webhook only: the signing secret; generated when a new URL is saved without one */
  @IsOptional()
  @IsString()
  @MinLength(16)
  @MaxLength(256)
  secret?: string;
}

/** Gives one person access to the project (see ProjectShare) */
export class ShareProjectDto {
  @IsEmail()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @MaxLength(254)
  email: string;

  @IsIn(['viewer', 'editor'])
  role: 'viewer' | 'editor';
}
