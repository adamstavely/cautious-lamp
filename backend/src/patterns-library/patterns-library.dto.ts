import { Transform, Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateIf, ValidateNested } from 'class-validator';
import { ComponentPattern, PATTERN_STATUSES, PatternStatus } from './patterns-library.service';

export const PATTERN_CATEGORIES: ReadonlyArray<ComponentPattern['category']> = ['common', 'anti-pattern', 'best-practice', 'accessibility', 'performance', 'composition'];

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);
const CODE = 64 * 1024;
/** Validate a field of an update only when it was sent */
const changed = (dto: object, value: unknown) => value !== undefined;
const TEXT = 10000;

export class PatternCodeExampleDto {
  @IsOptional() @IsString() @MaxLength(CODE) good?: string;
  @IsOptional() @IsString() @MaxLength(CODE) bad?: string;
  @IsOptional() @IsString() @MaxLength(TEXT) description?: string;
}

/** What a new pattern and an update share */
class PatternDetailsDto {
  @IsOptional() @IsIn(PATTERN_STATUSES) status?: PatternStatus;
  @IsOptional() @IsArray() @ArrayMaxSize(200) @IsString({ each: true }) @MaxLength(120, { each: true }) componentIds?: string[];
  @IsOptional() @ValidateNested() @Type(() => PatternCodeExampleDto) codeExample?: PatternCodeExampleDto;
  @IsOptional() @IsArray() @ArrayMaxSize(100) @IsString({ each: true }) @MaxLength(1000, { each: true }) useCases?: string[];
  @IsOptional() @IsString() @MaxLength(TEXT) whenToUse?: string;
  @IsOptional() @IsString() @MaxLength(TEXT) whenNotToUse?: string;
  @IsOptional() @IsArray() @ArrayMaxSize(100) @IsString({ each: true }) @MaxLength(120, { each: true }) relatedPatterns?: string[];
  @IsOptional() @IsArray() @ArrayMaxSize(50) @IsString({ each: true }) @MaxLength(60, { each: true }) tags?: string[];
}

// name, description and category are what lists sort and search on, so none may be blank
export class CreatePatternDto extends PatternDetailsDto {
  @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(200) name: string;
  @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(TEXT) description: string;
  @IsIn(PATTERN_CATEGORIES) category: ComponentPattern['category'];
}

/** The fields a pattern update may change: everything but its id and timestamps */
export class UpdatePatternDto extends PatternDetailsDto {
  // Left out is unchanged; null is refused, as it would blank the field
  @ValidateIf(changed) @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(200) name?: string;
  @ValidateIf(changed) @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(TEXT) description?: string;
  @ValidateIf(changed) @IsIn(PATTERN_CATEGORIES) category?: ComponentPattern['category'];
}
