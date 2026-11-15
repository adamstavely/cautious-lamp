import { IsArray, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class SuggestionsDto {
  @IsArray()
  @IsString({ each: true })
  colors: string[];

  @IsOptional()
  @IsString()
  regenerateType?: string;
}

export class ContrastFixDto {
  @IsString()
  color1: string;

  @IsString()
  color2: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(21)
  targetRatio?: number;
}

export class StrategicColorsDto {
  @IsArray()
  @IsString({ each: true })
  colors: string[];

  /** The pairs POST /api/palettes/analyze returned, passed back as they are */
  @IsArray()
  contrastResults: unknown[];

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  maxSuggestions?: number;
}
