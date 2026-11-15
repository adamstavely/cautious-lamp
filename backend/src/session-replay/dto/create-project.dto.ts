import { Type } from 'class-transformer';
import { IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { CaptureConfigDto, PrivacySettingsDto } from './capture-settings.dto';
import { IsOpenReplayProjectId, IsOpenReplayProjectKey } from './project-keys';

export class CreateProjectDto {
  @IsString()
  @MaxLength(200)
  name: string;

  /** Free-form label; defaults to the workspace id */
  @IsOptional()
  @IsString()
  teamId?: string;

  /** Owning workspace (needs the editor role there). Without one, only the creator can use the project. */
  @IsOptional()
  @IsString()
  workspaceId?: string | null;

  /** Organization API key, for listing sessions; checked against OpenReplay and stored encrypted */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  openreplayApiKey?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  applicationUrl?: string;

  /** The tracker's project key; the public API addresses the project by it too */
  @IsOpenReplayProjectKey()
  openreplayProjectKey: string;

  /** Numeric project id, for links into OpenReplay (session player, heatmaps). Looked up when an API key is given. */
  @IsOptional()
  @IsOpenReplayProjectId()
  openreplayProjectId?: number;

  /** Self-hosted OpenReplay instance URL */
  @IsOptional()
  @IsString()
  openreplayBaseUrl?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PrivacySettingsDto)
  privacySettings?: PrivacySettingsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CaptureConfigDto)
  config?: CaptureConfigDto;
}
