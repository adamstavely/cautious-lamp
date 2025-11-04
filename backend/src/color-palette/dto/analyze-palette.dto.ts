import { IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ColorInputDto {
  @IsString()
  hex: string;
}

export class AnalyzePaletteDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ColorInputDto)
  colors: ColorInputDto[];
}

