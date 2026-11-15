import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import {
  APPROVAL_STAGES,
  ApprovalStage,
  REQUEST_PRIORITIES,
  REQUEST_STATUSES,
  RequestPriority,
  RequestStatus,
} from './component-request.types';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

/**
 * Bodies for the component request routes. Every handler validates with
 * StrictBody, so unknown fields (status, votes, requestedBy, author, approval
 * flags) are rejected rather than stored: who did something comes from the
 * signed-in principal, and triage has its own routes.
 */
export class CreateRequestDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  description: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(5000)
  useCase?: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  category: string;

  @IsOptional()
  @IsIn(REQUEST_PRIORITIES)
  priority?: RequestPriority;
}

/** What the author may change on their own open request */
export class UpdateRequestDto {
  @IsOptional()
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(5000)
  useCase?: string;
}

export class TransitionStatusDto {
  @IsIn(REQUEST_STATUSES)
  status: RequestStatus;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comment?: string;
}

export class SetPriorityDto {
  @IsIn(REQUEST_PRIORITIES)
  priority: RequestPriority;
}

export class AssignRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  userId: string;
}

export class ApproveRequestDto {
  @IsOptional()
  @IsIn(APPROVAL_STAGES)
  stage?: ApprovalStage;
}

export class RejectRequestDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  reason: string;
}

export class ComponentLinkDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  componentId: string;
}

export class AddCommentDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content: string;
}
