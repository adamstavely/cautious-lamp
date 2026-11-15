import { Type } from 'class-transformer';
import { IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { ProjectConfigDto } from './project-config.dto';

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

  /** The Argos project as owner/project (account slug and project name) */
  @IsString()
  argosProjectId: string;

  @IsString()
  argosToken: string;

  /** Argos API URL, for a self-hosted Argos (defaults to https://api.argos-ci.com/v2) */
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
