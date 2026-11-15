import { ArrayMaxSize, IsArray, IsBoolean, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { INPUT_MODES, InputMode, MAX_SELECTORS, MAX_SELECTOR_LENGTH } from '../capture-settings';

/** What the tracker may record (capture-settings.ts); omitted fields keep their current or default value */
export class PrivacySettingsDto {
  @IsOptional()
  @IsIn(INPUT_MODES)
  defaultInputMode?: InputMode;

  @IsOptional() @IsBoolean() privateMode?: boolean;
  @IsOptional() @IsBoolean() obscureTextEmails?: boolean;
  @IsOptional() @IsBoolean() obscureTextNumbers?: boolean;
  @IsOptional() @IsBoolean() obscureInputEmails?: boolean;
  @IsOptional() @IsBoolean() obscureInputNumbers?: boolean;
  @IsOptional() @IsBoolean() respectDoNotTrack?: boolean;

  /** CSS selectors whose text is obscured */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_SELECTORS)
  @IsString({ each: true })
  @MaxLength(MAX_SELECTOR_LENGTH, { each: true })
  maskTextSelector?: string[];

  /** CSS selectors left out of recordings */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_SELECTORS)
  @IsString({ each: true })
  @MaxLength(MAX_SELECTOR_LENGTH, { each: true })
  blockSelector?: string[];

  /** Older name for defaultInputMode 'obscured' (applications still send it) */
  @IsOptional() @IsBoolean() maskAllInputs?: boolean;
  /** Older name for privateMode */
  @IsOptional() @IsBoolean() maskAllText?: boolean;
}

export class CaptureConfigDto {
  @IsOptional() @IsBoolean() captureConsole?: boolean;
  @IsOptional() @IsBoolean() captureNetwork?: boolean;
  @IsOptional() @IsBoolean() captureNetworkPayload?: boolean;
  @IsOptional() @IsBoolean() captureIFrames?: boolean;
}
