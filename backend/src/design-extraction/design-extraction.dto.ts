import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';

export class ExtractOptionsDto {
  @IsOptional() @IsBoolean() darkMode?: boolean;
  @IsOptional() @IsBoolean() mobile?: boolean;
  @IsOptional() @IsBoolean() slow?: boolean;
}

/** The page to extract a design from; the service refuses non-public addresses */
export class ExtractRequestDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'URL is required and must be a string' })
  @IsNotEmpty({ message: 'URL cannot be empty' })
  @MaxLength(2048, { message: 'URL is too long' })
  url: string;

  @IsOptional() @ValidateNested() @Type(() => ExtractOptionsDto) options?: ExtractOptionsDto;
}
