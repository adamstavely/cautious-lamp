import { Transform, Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { trim } from '../workspaces/workspace.dto';

export class TokenOverrideDto {
  @IsString() @Transform(trim) @IsNotEmpty() @MaxLength(200)
  token: string;

  @IsString() @Transform(trim) @IsNotEmpty() @MaxLength(500)
  value: string;
}

export class CreateBrandDto {
  @IsString() @Transform(trim) @IsNotEmpty() @MaxLength(100)
  name: string;

  @IsOptional() @IsString() @Transform(trim) @MaxLength(2000)
  description?: string;

  @IsOptional() @IsArray() @ArrayMaxSize(500) @ValidateNested({ each: true }) @Type(() => TokenOverrideDto)
  tokenOverrides?: TokenOverrideDto[];
}

/** Every field optional; `tokenOverrides`, when sent, replaces the whole list */
export class UpdateBrandDto {
  @IsOptional() @IsString() @Transform(trim) @IsNotEmpty() @MaxLength(100)
  name?: string;

  @IsOptional() @IsString() @Transform(trim) @MaxLength(2000)
  description?: string;

  @IsOptional() @IsArray() @ArrayMaxSize(500) @ValidateNested({ each: true }) @Type(() => TokenOverrideDto)
  tokenOverrides?: TokenOverrideDto[];
}
