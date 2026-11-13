import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ValidationPipe } from '@nestjs/common';
import { SHARING_MODES, SharingMode, WORKFLOW_STATES, WorkflowState } from './review.types';

/** Rejects unknown fields and converts types, for every reviews handler */
export const StrictBody = () =>
  new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true });

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);
const normalizeEmails = ({ value }: { value: unknown }) =>
  Array.isArray(value) ? value.map((v) => (typeof v === 'string' ? v.trim().toLowerCase() : v)) : value;

class ReviewOptionsDto {
  @IsOptional()
  @IsString()
  @MaxLength(72)
  password?: string;

  @IsOptional()
  @IsBoolean()
  bypassClientReview?: boolean;

  @IsOptional()
  @IsIn(SHARING_MODES)
  sharingMode?: SharingMode;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200)
  @IsEmail({}, { each: true })
  @Transform(normalizeEmails)
  approvedEmails?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(100)
  teamId?: string | null;
}

export class CreateUploadDto extends ReviewOptionsDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Transform(trim)
  filename: string;
}

export class CreateFromUrlDto extends ReviewOptionsDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2048)
  @Transform(trim)
  url: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Transform(trim)
  filename?: string;
}

export class SharingDto {
  @IsIn(SHARING_MODES)
  sharingMode: SharingMode;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200)
  @IsEmail({}, { each: true })
  @Transform(normalizeEmails)
  approvedEmails?: string[];
}

export class PasswordDto {
  @IsString()
  @MaxLength(72)
  password: string;
}

export class ExtendDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(90)
  days: number;
}

export class AdminExtendQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(365)
  days: number;
}

export class BatchDeleteDto {
  @IsArray()
  @ArrayMaxSize(500)
  @IsString({ each: true })
  ids: string[];
}

export class ListReviewsQueryDto {
  @IsOptional()
  @IsIn(WORKFLOW_STATES)
  workflowState?: WorkflowState;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  q?: string;

  @IsOptional()
  @IsIn(['true', 'false'])
  showExpired?: string;
}

export class AdminListQueryDto {
  @IsOptional()
  @IsIn(['true', 'false'])
  showExpired?: string;
}

export class VersionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  label: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  type?: string;
}

export class ApproveDto {
  @IsIn(WORKFLOW_STATES)
  stage: WorkflowState;
}

export class RejectDto {
  @IsIn(WORKFLOW_STATES)
  stage: WorkflowState;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  reason?: string | null;
}

export class ResubmitDto {
  @IsIn(WORKFLOW_STATES)
  targetStage: WorkflowState;
}

export class CommentsQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  versionId?: string;
}

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  text: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  version?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  type?: string;

  @IsOptional()
  @IsBoolean()
  resolved?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  annotationId?: string;

  @IsOptional()
  @IsObject()
  annotationData?: Record<string, unknown>;
}

export class UpdateCommentDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  text?: string;

  @IsOptional()
  @IsBoolean()
  resolved?: boolean;

  @IsOptional()
  @IsObject()
  annotationData?: Record<string, unknown>;
}

export class ReplyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  text: string;
}

export class ReactionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  emoji: string;
}

export class CreateTeamDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @Transform(trim)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}

export class UpdateTeamDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @Transform(trim)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}

export class AddMemberDto {
  @IsEmail()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  role: string;
}

export class UpdateMemberDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  role: string;
}
