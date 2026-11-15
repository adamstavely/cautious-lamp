import { Transform } from 'class-transformer';
import { IsEmail, IsIn, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';
import { NotificationConfig } from '../../common/types/common.types';

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

export class NotificationSettingsDto {
  @IsIn(['email', 'slack', 'teams', 'webhook'])
  type: 'email' | 'slack' | 'teams' | 'webhook';

  @IsObject()
  config: NotificationConfig;
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
