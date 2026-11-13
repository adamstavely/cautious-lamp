import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ValidationPipe } from '@nestjs/common';
import { ASSIGNABLE_ROLES, AssignableRole } from './workspace.types';

/** Rejects unknown fields and converts types, for every workspaces/applications handler */
export const StrictBody = () =>
  new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true });

export const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);
export const lower = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim().toLowerCase() : value);

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class WorkspaceSettingsDto {
  @IsOptional()
  @IsBoolean()
  allowExternalSharing?: boolean;

  @IsOptional()
  @IsBoolean()
  requireApprovalForSharing?: boolean;

  @IsOptional()
  @IsIn(['production', 'in-progress', 'planned'])
  defaultComponentStatus?: 'production' | 'in-progress' | 'planned';
}

export class WorkspaceMetadataDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1_000_000)
  teamSize?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(trim)
  industry?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  tags?: string[];
}

export class CreateWorkspaceDto {
  @IsString()
  @Transform(trim)
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  /** Derived from the name when left out (with a numeric suffix if taken); 409 if given and taken */
  @IsOptional()
  @IsString()
  @MaxLength(60)
  @Matches(SLUG_PATTERN, { message: 'slug must be lowercase letters, digits and single hyphens' })
  slug?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => WorkspaceSettingsDto)
  settings?: WorkspaceSettingsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => WorkspaceMetadataDto)
  metadata?: WorkspaceMetadataDto;

  /**
   * Only for admin:users holders: create the workspace on behalf of this user,
   * who becomes its owner. Required when the caller is an API key.
   */
  @IsOptional()
  @IsEmail()
  @Transform(lower)
  ownerEmail?: string;
}

export class UpdateWorkspaceDto {
  @IsOptional()
  @IsString()
  @Transform(trim)
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  @Matches(SLUG_PATTERN, { message: 'slug must be lowercase letters, digits and single hyphens' })
  slug?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => WorkspaceSettingsDto)
  settings?: WorkspaceSettingsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => WorkspaceMetadataDto)
  metadata?: WorkspaceMetadataDto;
}

export class AddWorkspaceMemberDto {
  @IsEmail()
  @Transform(lower)
  @MaxLength(254)
  email: string;

  @IsIn(ASSIGNABLE_ROLES as unknown as string[])
  role: AssignableRole;
}

export class UpdateWorkspaceMemberDto {
  @IsIn(ASSIGNABLE_ROLES as unknown as string[])
  role: AssignableRole;
}

export class TransferOwnershipDto {
  /** Must already be a member */
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  userId: string;
}

export class UpdateSharingDto {
  /** The full list of other workspaces that may read the item (replaces the current list) */
  @IsArray()
  @ArrayMaxSize(100)
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  workspaceIds: string[];

  /** Readable by every workspace. Setting it clears `workspaceIds`. */
  @IsOptional()
  @IsBoolean()
  isGlobal?: boolean;
}

/** POST /users/:userId/workspaces (user management page) */
export class AddUserToWorkspaceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  workspaceId: string;

  @IsIn(ASSIGNABLE_ROLES as unknown as string[])
  role: AssignableRole;
}
