import { Type } from 'class-transformer';
import { IsOptional, IsString, MaxLength, ValidateIf, ValidateNested } from 'class-validator';
import { CaptureConfigDto, PrivacySettingsDto } from './capture-settings.dto';
import { IsOpenReplayProjectId, IsOpenReplayProjectKey } from './project-keys';

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  applicationUrl?: string;

  @IsOptional()
  @IsOpenReplayProjectKey()
  openreplayProjectKey?: string;

  /** null clears it */
  @IsOptional()
  @ValidateIf((o) => o.openreplayProjectId !== null)
  @IsOpenReplayProjectId()
  openreplayProjectId?: number | null;

  /** Write-only: replaces the stored key when sent */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  openreplayApiKey?: string;

  @IsOptional()
  @IsString()
  openreplayBaseUrl?: string;

  /** Merged into the current settings */
  @IsOptional()
  @ValidateNested()
  @Type(() => PrivacySettingsDto)
  privacySettings?: PrivacySettingsDto;

  /** Merged into the current settings */
  @IsOptional()
  @ValidateNested()
  @Type(() => CaptureConfigDto)
  config?: CaptureConfigDto;
}
