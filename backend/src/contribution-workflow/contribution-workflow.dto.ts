import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { LIMITS } from '../governance/governance.types';
import { SUBMISSION_LANGUAGES } from './contribution-checks';

export const GUIDELINE_CATEGORIES = ['component', 'token', 'pattern', 'documentation', 'bug-fix', 'enhancement'] as const;
export const CHECK_CATEGORIES = ['linting', 'formatting', 'testing', 'documentation', 'accessibility', 'performance', 'design-system', 'structure'] as const;

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);
const TEXT = 20000;
const CODE = 64 * 1024;

/** Most files a contribution's pull request may carry */
export const MAX_CONTRIBUTION_FILES = 50;
/**
 * A path inside the repository: relative, with no `.`, `..` or empty segments, no
 * backslashes and nothing under .git or .github (workflows run with the repository's secrets)
 */
export const REPOSITORY_PATH_PATTERN = /^(?!\.git(?:hub)?\/)(?!.*\/\/)(?!.*(?:^|\/)\.{1,2}(?:\/|$))[A-Za-z0-9._@+-][A-Za-z0-9._@+\-/]*[A-Za-z0-9._@+-]$|^[A-Za-z0-9_@+-]$/;

/** A list of short strings, as a checklist */
const checklist = () => [IsArray(), ArrayMaxSize(100), IsString({ each: true }), IsNotEmpty({ each: true }), MaxLength(1000, { each: true })];
const apply = (decorators: PropertyDecorator[]): PropertyDecorator => (target, key) => decorators.forEach((d) => d(target, key));

/** A contribution to check: its code and what comes with it */
export class RunContributionChecksDto {
  @IsString() @MinLength(1) @MaxLength(LIMITS.codebaseField) code: string;
  @IsIn(SUBMISSION_LANGUAGES) language: (typeof SUBMISSION_LANGUAGES)[number];
  @IsOptional() @IsString() @MaxLength(LIMITS.name) name?: string;
  @IsOptional() @IsString() @MaxLength(LIMITS.description) description?: string;
  @IsOptional() @IsString() @MaxLength(LIMITS.codebaseField) documentation?: string;
  @IsOptional() @IsString() @MaxLength(LIMITS.codebaseField) tests?: string;
  /** Run only these checks; all enabled checks when left out */
  @IsOptional() @IsArray() @ArrayMaxSize(50) @IsString({ each: true }) checkIds?: string[];
}

export class GuidelineCodeExamplesDto {
  @IsOptional() @IsString() @MaxLength(CODE) good?: string;
  @IsOptional() @IsString() @MaxLength(CODE) bad?: string;
}

// Lists sort on title/name, so none may be blank
export class CreateGuidelineDto {
  @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(200) title: string;
  @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(LIMITS.description) description: string;
  @IsIn(GUIDELINE_CATEGORIES) category: (typeof GUIDELINE_CATEGORIES)[number];
  @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(TEXT) content: string;
  @IsOptional() @apply(checklist()) checklist?: string[];
  @IsOptional() @ValidateNested() @Type(() => GuidelineCodeExamplesDto) codeExamples?: GuidelineCodeExamplesDto;
}

export class TemplateContentDto {
  @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(200) title: string;
  @IsString() @MaxLength(TEXT) description: string;
  @apply(checklist()) checklist: string[];
  @IsOptional() @IsString() @MaxLength(CODE) codeExample?: string;
}

export class CreateTemplateDto {
  @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(200) name: string;
  @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(LIMITS.description) description: string;
  @IsIn(GUIDELINE_CATEGORIES) category: (typeof GUIDELINE_CATEGORIES)[number];
  @ValidateNested() @Type(() => TemplateContentDto) template: TemplateContentDto;
}

export class CreateCheckDto {
  @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(200) name: string;
  @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(LIMITS.description) description: string;
  @IsIn(CHECK_CATEGORIES) category: (typeof CHECK_CATEGORIES)[number];
  @IsBoolean() enabled: boolean;
  @IsOptional() @IsString() @MaxLength(500) command?: string;
  /** Settings for the check's own tool; stored as given and not interpreted here */
  @IsOptional() @IsObject() config?: Record<string, unknown>;
}

/** One file of a contribution, committed as is */
export class ContributionFileDto {
  @Transform(trim)
  @IsString()
  @MaxLength(300)
  @Matches(REPOSITORY_PATH_PATTERN, { message: 'path must be a relative path inside the repository (no "..", and nothing under .git or .github)' })
  path: string;

  @IsString() @MaxLength(LIMITS.codebaseField) content: string;
}

/**
 * A contribution from a template: the pull request text, and the files to
 * commit. With files and GitHub set up, a pull request is opened.
 */
export class GeneratePullRequestDto {
  @IsOptional() @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(200) title?: string;
  @IsOptional() @IsString() @MaxLength(TEXT) description?: string;
  @IsOptional() @apply(checklist()) checklistItems?: string[];
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_CONTRIBUTION_FILES)
  @ValidateNested({ each: true })
  @Type(() => ContributionFileDto)
  files?: ContributionFileDto[];
}
