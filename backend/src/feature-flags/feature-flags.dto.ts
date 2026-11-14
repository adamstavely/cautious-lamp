import { IsBoolean, IsObject, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateFeatureFlagDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  key: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsBoolean()
  defaultValue?: boolean;

  /** `{ users?, groups?, percentage? }`; other fields are dropped by the service */
  @IsOptional()
  @IsObject()
  targeting?: { users?: string[]; groups?: string[]; percentage?: number };

  /** `{ category?, tags? }` */
  @IsOptional()
  @IsObject()
  metadata?: { category?: string; tags?: string[] };
}

export class UpdateFeatureFlagDto {
  /** Accepted only when unchanged: keys can't be renamed */
  @IsOptional()
  @IsString()
  key?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsBoolean()
  defaultValue?: boolean;

  @IsOptional()
  @IsObject()
  targeting?: { users?: string[]; groups?: string[]; percentage?: number };

  @IsOptional()
  @IsObject()
  metadata?: { category?: string; tags?: string[] };
}
