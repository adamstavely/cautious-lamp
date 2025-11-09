import { IsString, IsOptional, IsArray, IsEnum, IsNumber } from 'class-validator';

export class CreateRequestDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  useCase?: string;

  @IsString()
  requestedBy: string;

  @IsString()
  category: string;

  @IsEnum(['low', 'medium', 'high', 'critical'])
  @IsOptional()
  priority?: 'low' | 'medium' | 'high' | 'critical';

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attachments?: string[];

  @IsNumber()
  @IsOptional()
  estimatedEffort?: number;

  @IsString()
  @IsOptional()
  targetRelease?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  relatedComponents?: string[];
}

