import { ArrayMaxSize, IsArray, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { LIMITS } from '../governance/governance.types';
import { SUBMISSION_LANGUAGES } from './contribution-checks';

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
