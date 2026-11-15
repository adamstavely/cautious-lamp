import { Transform } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsIn, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { COMPONENT_STATUSES, ComponentStatus } from './design-system.service';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);
/** Empty strings mean "not set" */
const emptyToUndefined = ({ value }: { value: unknown }) => (typeof value === 'string' && value.trim() === '' ? undefined : trim({ value }));

/** Component ids are kebab-case slugs, as the scaffolding wizard makes them */
export const COMPONENT_ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,99}$/;

export class UpdateComponentStatusDto {
  @IsIn(COMPONENT_STATUSES)
  status: ComponentStatus;
}

export class DeprecateComponentDto {
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  @Matches(COMPONENT_ID_PATTERN, { message: 'replacement must be a component id' })
  replacement?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'sunsetDate must be a date (YYYY-MM-DD)' })
  sunsetDate?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  @MaxLength(2000)
  reason?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  @MaxLength(10000)
  migrationGuide?: string;
}

export class ComponentDependenciesDto {
  @IsArray()
  @ArrayMaxSize(100)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  dependencies: string[];
}
