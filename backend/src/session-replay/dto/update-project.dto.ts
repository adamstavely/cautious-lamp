import { IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

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
  @IsString()
  openreplayProjectKey?: string;

  /** Write-only: replaces the stored key when sent */
  @IsOptional()
  @IsString()
  openreplayApiKey?: string;

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
