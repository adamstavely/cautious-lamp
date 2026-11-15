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
  description?: string;

  @IsString()
  argosProjectId: string;

  @IsString()
  argosToken: string;

  /** Self-hosted Argos instance URL */
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
