import { ValidationPipe } from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { BUILTIN_CHECKS, LIMITS, RULE_CATEGORIES, RULE_SEVERITIES, RULE_TARGETS, RULE_TYPES } from './governance.types';

/** Rejects unknown fields (including any attempt to send code, e.g. `scannerCode`) */
export const strictBody = () => new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true });

export class RuleDefinitionDto {
  @IsString() @MaxLength(LIMITS.name) name: string;
  @IsOptional() @IsString() @MaxLength(LIMITS.description) description?: string;
  @IsIn(RULE_CATEGORIES) category: (typeof RULE_CATEGORIES)[number];
  @IsIn(RULE_SEVERITIES) severity: (typeof RULE_SEVERITIES)[number];
  @IsOptional() @IsBoolean() enabled?: boolean;
  @IsIn(RULE_TYPES) type: (typeof RULE_TYPES)[number];
  @IsIn(RULE_TARGETS) target: (typeof RULE_TARGETS)[number];
  @IsOptional() @IsString() @MaxLength(LIMITS.pattern) pattern?: string;
  @IsOptional() @IsString() @Matches(/^[ims]{0,3}$/, { message: 'flags may only contain i, m and s' }) flags?: string;
  @IsOptional() @IsString() @MaxLength(LIMITS.selector) selector?: string;
  @IsOptional() @IsString() @MaxLength(700) attribute?: string;
  @IsOptional() @IsInt() @Min(0) @Max(10000) min?: number;
  @IsOptional() @IsInt() @Min(0) @Max(10000) max?: number;
  @IsOptional() @IsArray() @ArrayMaxSize(30) @IsString({ each: true }) @MaxLength(61, { each: true }) properties?: string[];
  @IsOptional() @IsArray() @ArrayMaxSize(100) @IsString({ each: true }) @MaxLength(100, { each: true }) allowedValues?: string[];
  @IsOptional() @IsIn(BUILTIN_CHECKS) builtin?: (typeof BUILTIN_CHECKS)[number];
  @IsString() @MaxLength(LIMITS.message) message: string;
}

export class UpdateRuleDto extends RuleDefinitionDto {
  /** The version the editor loaded; a mismatch returns 409 instead of overwriting */
  @IsOptional() @IsInt() @Min(1) version?: number;
}

export class PatchRuleDto {
  @IsOptional() @IsBoolean() enabled?: boolean;
  @IsOptional() @IsIn(RULE_SEVERITIES) severity?: (typeof RULE_SEVERITIES)[number];
  @IsOptional() @IsInt() @Min(1) version?: number;
}

export class ImportedRuleDto extends RuleDefinitionDto {
  /** Existing id to update; new rules get a generated id */
  @IsOptional() @IsString() @Matches(/^[a-z0-9][a-z0-9-]{0,63}$/) id?: string;
  /** Exported documents carry these; they are ignored on import */
  @IsOptional() @IsBoolean() builtIn?: boolean;
  @IsOptional() @IsInt() version?: number;
  @IsOptional() @IsString() createdAt?: string;
  @IsOptional() @IsString() updatedAt?: string;
  @IsOptional() @IsString() createdBy?: string;
  @IsOptional() @IsString() updatedBy?: string;
}

export class ImportRulesDto {
  @IsArray() @ArrayMaxSize(LIMITS.importRules) @ValidateNested({ each: true }) @Type(() => ImportedRuleDto) rules: ImportedRuleDto[];
  /** merge (default): create or update by id; replace: also delete rules not in the file */
  @IsOptional() @IsIn(['merge', 'replace']) mode?: 'merge' | 'replace';
  /** Present in exported files */
  @IsOptional() @IsString() format?: string;
  @IsOptional() @IsInt() formatVersion?: number;
  @IsOptional() @IsString() exportedAt?: string;
}

export class CodebaseDto {
  @IsOptional() @IsString() @MaxLength(LIMITS.codebaseField) html?: string;
  @IsOptional() @IsString() @MaxLength(LIMITS.codebaseField) css?: string;
  @IsOptional() @IsString() @MaxLength(LIMITS.codebaseField) javascript?: string;
  /** Label for results (e.g. a file path) */
  @IsOptional() @IsString() @MaxLength(300) file?: string;
}

export class ScanDto {
  @IsIn(['design-system', 'application', 'applications']) scope: 'design-system' | 'application' | 'applications';
  @IsOptional() @IsString() @MaxLength(200) applicationId?: string;
  @IsOptional() @ValidateNested() @Type(() => CodebaseDto) codebase?: CodebaseDto;
  @IsOptional() @IsString() @MaxLength(2048) url?: string;
  @IsOptional() @IsArray() @ArrayMaxSize(200) @IsString({ each: true }) ruleIds?: string[];
  @IsOptional() @IsArray() @ArrayMaxSize(10) @IsIn(RULE_CATEGORIES, { each: true }) categories?: string[];
}

/** POST /compliance/scan-application (older clients) */
export class ScanApplicationDto {
  @IsString() @MaxLength(200) applicationId: string;
  @IsOptional() @ValidateNested() @Type(() => CodebaseDto) codebase?: CodebaseDto;
  @IsOptional() @IsString() @MaxLength(2048) url?: string;
  @IsOptional() @IsArray() @ArrayMaxSize(200) @IsString({ each: true }) ruleIds?: string[];
  @IsOptional() @IsArray() @ArrayMaxSize(10) @IsIn(RULE_CATEGORIES, { each: true }) categories?: string[];
}

export class TestRuleDto {
  @ValidateNested() @Type(() => RuleDefinitionDto) rule: RuleDefinitionDto;
  @ValidateNested() @Type(() => CodebaseDto) sample: CodebaseDto;
}

export class ListScansQueryDto {
  @IsOptional() @IsString() @MaxLength(200) applicationId?: string;
  @IsOptional() @IsIn(['design-system', 'application']) scope?: 'design-system' | 'application';
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(200) limit?: number;
}
