import { Transform, Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength, ValidateNested } from 'class-validator';
import { trim } from '../workspaces/workspace.dto';
import { CHANGE_ACTIONS, ChangeAction, SUBSCRIBABLE_TYPES, SubscribableType } from './notification.types';

/** Which channels notifications are delivered to besides the app */
export class NotificationChannelsDto {
  @IsOptional() @IsBoolean() email?: boolean;
  @IsOptional() @IsBoolean() slack?: boolean;
  @IsOptional() @IsBoolean() teams?: boolean;
  @IsOptional() @IsBoolean() webhook?: boolean;
}

/** A Slack or Teams incoming-webhook URL, or a webhook URL with an optional signing secret (generated when left out) */
export class ChannelTargetDto {
  @IsString() @Transform(trim) @IsNotEmpty() @MaxLength(2000) url: string;
  @IsOptional() @IsString() @Transform(trim) @MinLength(16) @MaxLength(256) secret?: string;
}

/** Any subset of the preferences; fields left out keep their value */
export class UpdateNotificationPreferencesDto {
  @IsOptional() @IsBoolean() inApp?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(CHANGE_ACTIONS.length)
  @IsIn(CHANGE_ACTIONS as string[], { each: true })
  actions?: ChangeAction[];

  @IsOptional() @IsBoolean() breakingOnly?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationChannelsDto)
  channels?: NotificationChannelsDto;
}

/** Follow one item, or every item of a type with entityId "*" */
export class CreateSubscriptionDto {
  @IsIn(SUBSCRIBABLE_TYPES as unknown as string[]) type: SubscribableType;
  @IsString() @Transform(trim) @IsNotEmpty() @MaxLength(200) entityId: string;
  @IsOptional() @IsString() @Transform(trim) @MaxLength(200) entityName?: string;
}
