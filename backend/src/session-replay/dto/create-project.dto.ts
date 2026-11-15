import { IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

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

  @IsOptional()
  @IsString()
  openreplayApiKey?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  applicationUrl?: string;

  @IsString()
  openreplayProjectKey: string;

  /** Self-hosted OpenReplay instance URL */
  @IsOptional()
  @IsString()
  openreplayBaseUrl?: string;

  @IsOptional()
  @IsObject()
  privacySettings?: {
    maskAllInputs?: boolean;
    maskAllText?: boolean;
    maskTextSelector?: string[];
    blockSelector?: string[];
    respectDoNotTrack?: boolean;
  };

  @IsOptional()
  @IsObject()
  config?: {
    captureConsole?: boolean;
    captureNetwork?: boolean;
    captureIFrames?: boolean;
  };
}
