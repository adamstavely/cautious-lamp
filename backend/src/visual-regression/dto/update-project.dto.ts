import { Type } from 'class-transformer';
import { IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { ProjectConfigDto } from './project-config.dto';

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  /** The Argos project as owner/project (account slug and project name) */
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
  @ValidateNested()
  @Type(() => ProjectConfigDto)
  config?: ProjectConfigDto;
}
