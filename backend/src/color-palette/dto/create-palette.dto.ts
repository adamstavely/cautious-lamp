import { IsString, IsOptional, IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class ColorDto {
  @IsString()
  hex: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  role?: 'hero' | 'accent' | 'neutral';
}

/** A palette's editable content (PUT /api/palettes/:id) */
export class UpdatePaletteDto {
  @IsString()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ColorDto)
  colors: ColorDto[];
}

export class CreatePaletteDto extends UpdatePaletteDto {
  /** Shares the palette with a workspace's editors; needs the editor role there */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  workspaceId?: string;
}
