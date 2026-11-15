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
import { BROWSERS, VIEWPORT_PATTERN } from '../ci-setup';

export class ScreenshotOptionsDto {
  @IsOptional()
  @IsBoolean()
  fullPage?: boolean;

  /** CSS selector to wait for before each screenshot */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  waitForSelector?: string;

  /** Milliseconds to wait before each screenshot */
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(60000)
  waitForTimeout?: number;
}

/** Test settings, emitted into the CI setup (see ci-setup.ts) */
export class ProjectConfigDto {
  /** Folders holding the visual tests, relative to the repository */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(200, { each: true })
  @Matches(/^[\w./-]+$/, { each: true, message: 'testDirectories must be relative paths of letters, digits, ".", "_", "-" and "/"' })
  testDirectories?: string[];

  /** Argos viewport presets (iphone-16) or WIDTHxHEIGHT */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @Matches(VIEWPORT_PATTERN, { each: true, message: 'viewports must be Argos presets such as iphone-16, or WIDTHxHEIGHT such as 1280x800' })
  viewports?: string[];

  @IsOptional()
  @IsArray()
  @IsIn(Object.keys(BROWSERS), { each: true })
  browsers?: string[];

  /** Globs of screenshot files the upload skips */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MaxLength(200, { each: true })
  ignorePatterns?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ScreenshotOptionsDto)
  screenshotOptions?: ScreenshotOptionsDto;
}
