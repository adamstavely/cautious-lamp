import { IsObject, IsOptional, IsString } from 'class-validator';

export class TriggerTestDto {
  @IsOptional()
  @IsString()
  branch?: string;

  @IsOptional()
  @IsString()
  commitSha?: string;

  @IsOptional()
  @IsObject()
  options?: {
    viewports?: string[];
    browsers?: string[];
    testDirectories?: string[];
  };
}
