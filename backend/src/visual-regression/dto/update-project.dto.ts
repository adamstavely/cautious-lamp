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
  argosProjectId?: string;

  /** Write-only: replaces the stored token when sent */
  @IsOptional()
  @IsString()
  argosToken?: string;

  @IsOptional()
  @IsString()
  argosBaseUrl?: string;

  @IsOptional()
  @IsString()
  argosBranch?: string;

  @IsOptional()
  @IsObject()
  config?: {
    testDirectories?: string[];
    viewports?: string[];
    browsers?: string[];
    ignorePatterns?: string[];
    screenshotOptions?: {
      fullPage?: boolean;
      waitForSelector?: string;
      waitForTimeout?: number;
    };
  };
}
