import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { HttpUrl } from '../workspaces/resource-kinds';
import { trim } from '../workspaces/workspace.dto';
import { ENVIRONMENTS, SCAN_SCHEDULES } from './application.types';

/** major.minor.patch with an optional pre-release/build suffix, optional leading v */
export const SEMVER_PATTERN = /^v?\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/;
const SAFE_ID_PATTERN = /^[A-Za-z0-9_-]{1,100}$/;
/** A git branch name, conservatively */
const BRANCH_PATTERN = /^[A-Za-z0-9._/-]{1,200}$/;

class GovernanceCapabilityDto {
  @IsBoolean()
  enabled: boolean;

  /** Rule ids from GET /governance/rules; empty means every enabled rule */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @Matches(SAFE_ID_PATTERN, { each: true, message: 'each rule must be a governance rule id' })
  rules?: string[];

  @IsOptional()
  @IsIn(SCAN_SCHEDULES as unknown as string[])
  scanSchedule?: (typeof SCAN_SCHEDULES)[number];
}

class VisualRegressionCapabilityDto {
  @IsBoolean()
  enabled: boolean;

  @ValidateIf((o) => o.enabled === true || o.argosProjectId !== undefined)
  @IsString()
  @IsNotEmpty({ message: 'argosProjectId is required to enable visual regression' })
  @MaxLength(200)
  argosProjectId?: string;

  /** Checked against ARGOS_ALLOWED_BASE_URLS by the visual-regression service */
  @IsOptional()
  @HttpUrl()
  argosBaseUrl?: string;

  @IsOptional()
  @Matches(BRANCH_PATTERN, { message: 'argosBranch must be a branch name' })
  argosBranch?: string;

  /** Passed to the visual-regression project (encrypted there); never stored on the application */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  argosToken?: string;
}

class PrivacySettingsDto {
  @IsOptional() @IsBoolean() maskAllInputs?: boolean;
  @IsOptional() @IsBoolean() maskAllText?: boolean;
  @IsOptional() @IsBoolean() respectDoNotTrack?: boolean;
}

class SessionReplayCapabilityDto {
  @IsBoolean()
  enabled: boolean;

  @ValidateIf((o) => o.enabled === true || o.openreplayProjectKey !== undefined)
  @IsString()
  @IsNotEmpty({ message: 'openreplayProjectKey is required to enable session replay' })
  @MaxLength(200)
  openreplayProjectKey?: string;

  /** Must be on the public internet or in OPENREPLAY_ALLOWED_BASE_URLS (checked by the session-replay service) */
  @IsOptional()
  @HttpUrl()
  openreplayBaseUrl?: string;

  /** Passed to the session-replay project (encrypted there); never stored on the application */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  openreplayApiKey?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PrivacySettingsDto)
  privacySettings?: PrivacySettingsDto;
}

export class CapabilitiesDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => GovernanceCapabilityDto)
  governance?: GovernanceCapabilityDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => VisualRegressionCapabilityDto)
  visualRegression?: VisualRegressionCapabilityDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SessionReplayCapabilityDto)
  sessionReplay?: SessionReplayCapabilityDto;
}

export class ApplicationMetadataDto {
  @IsOptional()
  @IsIn(ENVIRONMENTS as unknown as string[])
  environment?: (typeof ENVIRONMENTS)[number];

  @IsOptional() @IsString() @MaxLength(100) framework?: string;
  @IsOptional() @IsString() @MaxLength(100) language?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  tags?: string[];
}

/** Fields both registration and PUT can set */
class ApplicationFieldsDto {
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  /** Only displayed and linked to; never fetched */
  @IsOptional()
  @HttpUrl()
  repository?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  version?: string;

  /** Only displayed and linked to; never fetched by this service */
  @IsOptional()
  @HttpUrl()
  applicationUrl?: string;

  /** '' clears it on update */
  @IsOptional()
  @ValidateIf((o) => o.teamId !== '')
  @Matches(SAFE_ID_PATTERN, { message: 'teamId must be letters, digits, _ or -' })
  teamId?: string;

  /** Replaces the stored metadata as a whole */
  @IsOptional()
  @ValidateNested()
  @Type(() => ApplicationMetadataDto)
  metadata?: ApplicationMetadataDto;
}

export class RegisterApplicationDto extends ApplicationFieldsDto {
  @IsString()
  @Transform(trim)
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  /** Required unless the caller has admin:governance */
  @IsOptional()
  @Matches(SAFE_ID_PATTERN, { message: 'workspaceId must be a workspace id' })
  workspaceId?: string;

  @IsOptional()
  @Matches(SEMVER_PATTERN, { message: 'designSystemVersion must be a semantic version like 2.1.0' })
  designSystemVersion?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CapabilitiesDto)
  capabilities?: CapabilitiesDto;
}

/** PUT /applications/:id. Capabilities, workspace and design-system version have their own routes. */
export class UpdateApplicationDto extends ApplicationFieldsDto {
  @IsOptional()
  @IsString()
  @Transform(trim)
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;
}

export class UpdateDesignSystemVersionDto {
  @Matches(SEMVER_PATTERN, { message: 'version must be a semantic version like 2.1.0' })
  version: string;
}

export class MoveApplicationDto {
  /** null takes the application out of any workspace (admin:governance only) */
  @IsOptional()
  @Matches(SAFE_ID_PATTERN, { message: 'workspaceId must be a workspace id' })
  workspaceId: string | null;
}
