import { Type } from 'class-transformer';
import { Allow, ArrayMaxSize, IsArray, IsBoolean, IsIn, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { ComponentProp, ComponentScaffoldInput } from './component-scaffolding.service';

/**
 * A component definition for the scaffolding wizard. Names are checked again
 * by the service (letters, identifiers), because they end up in generated code.
 */
const NAME = 120;
const TEXT = 2000;
/** CSS values from the wizard's style fields */
const CSS = 200;

export const PROP_TYPES: ReadonlyArray<ComponentProp['type']> = ['string', 'number', 'boolean', 'object', 'array', 'function', 'date', 'enum'];
export const SCAFFOLD_STATUSES: ReadonlyArray<NonNullable<ComponentScaffoldInput['status']>> = ['production', 'in-progress', 'planned', 'deprecated', 'experimental'];

export class ScaffoldPropDto {
  @IsString() @MaxLength(NAME) name: string;
  @IsIn(PROP_TYPES) type: ComponentProp['type'];
  /** Any JSON value, written into the generated code as the prop's default */
  @IsOptional() @Allow() defaultValue?: unknown;
  @IsOptional() @IsBoolean() required?: boolean;
  @IsOptional() @IsArray() @ArrayMaxSize(100) @IsString({ each: true }) @MaxLength(NAME, { each: true }) options?: string[];
  @IsOptional() @IsString() @MaxLength(TEXT) description?: string;
  @IsOptional() @IsBoolean() reflect?: boolean;
  @IsOptional() @IsBoolean() mutable?: boolean;
}

export class ScaffoldEventDto {
  @IsString() @MaxLength(NAME) name: string;
  @IsOptional() @IsString() @MaxLength(NAME) detail?: string;
  @IsOptional() @IsBoolean() bubbles?: boolean;
  @IsOptional() @IsBoolean() cancelable?: boolean;
  @IsOptional() @IsBoolean() composed?: boolean;
  @IsOptional() @IsString() @MaxLength(TEXT) description?: string;
}

export class ScaffoldMethodParameterDto {
  @IsString() @MaxLength(NAME) name: string;
  @IsString() @MaxLength(NAME) type: string;
}

export class ScaffoldMethodDto {
  @IsString() @MaxLength(NAME) name: string;
  @IsOptional() @IsString() @MaxLength(NAME) returnType?: string;
  @IsOptional() @IsArray() @ArrayMaxSize(20) @ValidateNested({ each: true }) @Type(() => ScaffoldMethodParameterDto) parameters?: ScaffoldMethodParameterDto[];
  @IsOptional() @IsString() @MaxLength(TEXT) description?: string;
}

class ScaffoldColorsDto {
  @IsOptional() @IsString() @MaxLength(CSS) background?: string;
  @IsOptional() @IsString() @MaxLength(CSS) text?: string;
  @IsOptional() @IsString() @MaxLength(CSS) border?: string;
}

class ScaffoldTypographyDto {
  @IsOptional() @IsString() @MaxLength(CSS) fontFamily?: string;
  @IsOptional() @IsString() @MaxLength(CSS) fontSize?: string;
  @IsOptional() @IsString() @MaxLength(CSS) fontWeight?: string;
  @IsOptional() @IsString() @MaxLength(CSS) lineHeight?: string;
}

class ScaffoldSpacingDto {
  @IsOptional() @IsString() @MaxLength(CSS) padding?: string;
  @IsOptional() @IsString() @MaxLength(CSS) margin?: string;
  @IsOptional() @IsString() @MaxLength(CSS) gap?: string;
}

class ScaffoldBorderDto {
  @IsOptional() @IsString() @MaxLength(CSS) radius?: string;
  @IsOptional() @IsString() @MaxLength(CSS) width?: string;
  @IsOptional() @IsString() @MaxLength(CSS) style?: string;
}

export class ScaffoldStylesDto {
  @IsOptional() @ValidateNested() @Type(() => ScaffoldColorsDto) colors?: ScaffoldColorsDto;
  @IsOptional() @ValidateNested() @Type(() => ScaffoldTypographyDto) typography?: ScaffoldTypographyDto;
  @IsOptional() @ValidateNested() @Type(() => ScaffoldSpacingDto) spacing?: ScaffoldSpacingDto;
  @IsOptional() @ValidateNested() @Type(() => ScaffoldBorderDto) border?: ScaffoldBorderDto;
  @IsOptional() @IsString() @MaxLength(CSS) shadow?: string;
}

export class ScaffoldAccessibilityDto {
  @IsOptional() @IsString() @MaxLength(TEXT) ariaLabel?: string;
  @IsOptional() @IsString() @MaxLength(NAME) ariaDescribedBy?: string;
  @IsOptional() @IsString() @MaxLength(NAME) role?: string;
}

export class ComponentScaffoldDto implements ComponentScaffoldInput {
  @IsString() @MaxLength(NAME) name: string;
  @IsOptional() @IsString() @MaxLength(TEXT) description: string;
  @IsOptional() @IsString() @MaxLength(NAME) templateId?: string;
  /** Empty means "custom" */
  @IsOptional() @IsString() @MaxLength(NAME) category: string;
  @IsOptional() @IsArray() @ArrayMaxSize(100) @ValidateNested({ each: true }) @Type(() => ScaffoldPropDto) props: ScaffoldPropDto[];
  @IsOptional() @IsArray() @ArrayMaxSize(100) @ValidateNested({ each: true }) @Type(() => ScaffoldEventDto) events?: ScaffoldEventDto[];
  @IsOptional() @IsArray() @ArrayMaxSize(100) @ValidateNested({ each: true }) @Type(() => ScaffoldMethodDto) methods?: ScaffoldMethodDto[];
  @IsOptional() @IsArray() @ArrayMaxSize(50) @IsString({ each: true }) @MaxLength(NAME, { each: true }) slots?: string[];
  @IsOptional() @ValidateNested() @Type(() => ScaffoldStylesDto) styles?: ScaffoldStylesDto;
  @IsOptional() @ValidateNested() @Type(() => ScaffoldAccessibilityDto) accessibility?: ScaffoldAccessibilityDto;
  @IsOptional() @IsIn(SCAFFOLD_STATUSES) status?: ComponentScaffoldInput['status'];
}
