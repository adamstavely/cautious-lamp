import { Transform, Type } from 'class-transformer';
import {
  Allow,
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { COMPONENT_STATUSES, ComponentStatus } from './design-system.service';
import { BannerType, IssueSeverity, IssueStatus, RoadmapCategory, RoadmapPriority, RoadmapStatus } from './design-system-stores';

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

/** Validate a field of an update only when it was sent; null is refused, as it would blank the field */
const changed = (_dto: object, value: unknown) => value !== undefined;

const NAME = 120;
const TEXT = 2000;
const LONG_TEXT = 10000;
const CODE = 256 * 1024;

// ==================== Components ====================

export class ComponentPropDto {
  @IsString() @IsNotEmpty() @MaxLength(NAME) name: string;
  @IsString() @MaxLength(NAME) type: string;
  /** Any JSON value: a string, number, boolean, list or object */
  @IsOptional() @Allow() default?: unknown;
  @IsOptional() @IsBoolean() required?: boolean;
  @IsOptional() @IsArray() @ArrayMaxSize(100) @IsString({ each: true }) @MaxLength(NAME, { each: true }) options?: string[];
  @IsOptional() @IsString() @MaxLength(TEXT) description?: string;
}

export class ComponentCodeDto {
  @IsOptional() @IsString() @MaxLength(CODE) vue?: string;
  @IsOptional() @IsString() @MaxLength(CODE) react?: string;
  @IsOptional() @IsString() @MaxLength(CODE) html?: string;
}

export class ComponentAccessibilityDto {
  @IsString() @MaxLength(NAME) wcag: string;
  @IsOptional() @IsString() @MaxLength(TEXT) notes?: string;
}

/** POST /api/v1/components. Sharing (isGlobal, sharedWith) is set through the workspace routes, not here */
export class CreateComponentDto {
  @IsString() @Matches(COMPONENT_ID_PATTERN, { message: 'id must be a kebab-case component id' }) id: string;
  @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(NAME) name: string;
  @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(LONG_TEXT) description: string;
  @IsOptional() @IsIn(COMPONENT_STATUSES) status?: ComponentStatus;
  @IsOptional() @IsArray() @ArrayMaxSize(200) @ValidateNested({ each: true }) @Type(() => ComponentPropDto) props?: ComponentPropDto[];
  @IsOptional() @ValidateNested() @Type(() => ComponentCodeDto) code?: ComponentCodeDto;
  @IsOptional() @IsArray() @ArrayMaxSize(100) @IsString({ each: true }) @Matches(COMPONENT_ID_PATTERN, { each: true, message: 'dependencies must be component ids' }) dependencies?: string[];
  @IsOptional() @IsArray() @ArrayMaxSize(100) @IsString({ each: true }) @MaxLength(LONG_TEXT, { each: true }) examples?: string[];
  @IsOptional() @ValidateNested() @Type(() => ComponentAccessibilityDto) accessibility?: ComponentAccessibilityDto;
  @IsOptional() @IsString() @MaxLength(NAME) linkedRequestId?: string;
  @IsOptional() @IsString() @MaxLength(NAME) workspaceId?: string;
}

class VariantStateDto {
  @IsOptional() @IsString() @MaxLength(NAME) backgroundColor?: string;
  @IsOptional() @IsString() @MaxLength(NAME) textColor?: string;
  @IsOptional() @IsString() @MaxLength(NAME) borderColor?: string;
}

class DisabledVariantStateDto {
  @IsOptional() @IsString() @MaxLength(NAME) backgroundColor?: string;
  @IsOptional() @IsString() @MaxLength(NAME) textColor?: string;
  @IsOptional() @IsString() @MaxLength(NAME) opacity?: string;
}

class VariantPropertiesDto extends VariantStateDto {
  @IsOptional() @IsString() @MaxLength(NAME) borderWidth?: string;
  @IsOptional() @IsString() @MaxLength(NAME) borderRadius?: string;
  @IsOptional() @IsString() @MaxLength(NAME) padding?: string;
  @IsOptional() @IsString() @MaxLength(NAME) fontSize?: string;
  @IsOptional() @IsString() @MaxLength(NAME) fontWeight?: string;
  @IsOptional() @ValidateNested() @Type(() => VariantStateDto) hover?: VariantStateDto;
  @IsOptional() @ValidateNested() @Type(() => VariantStateDto) active?: VariantStateDto;
  @IsOptional() @ValidateNested() @Type(() => DisabledVariantStateDto) disabled?: DisabledVariantStateDto;
}

/** POST /api/v1/components/:id/variants. The service generates the code, so any sent is ignored */
export class ComponentVariantDto {
  @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(NAME) name: string;
  @IsOptional() @IsString() @MaxLength(TEXT) description?: string;
  @ValidateNested() @Type(() => VariantPropertiesDto) properties: VariantPropertiesDto;
  /** The builder sends its preview (or null); the stored code is always generated on the server */
  @IsOptional() @Allow() generatedCode?: unknown;
}

// ==================== Performance budgets ====================

export class CreatePerformanceBudgetDto {
  @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(NAME) name: string;
  @IsString() @IsNotEmpty() @MaxLength(NAME) metric: string;
  @IsNumber() @Min(0) threshold: number;
  @IsString() @IsNotEmpty() @MaxLength(20) unit: string;
  /** null or left out: no alert threshold */
  @IsOptional() @IsNumber() @Min(0) alertThreshold?: number;
}

/** The edit form sends the whole budget back; metric and unit are fixed once a budget exists, so they're ignored */
export class UpdatePerformanceBudgetDto {
  @ValidateIf(changed) @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(NAME) name?: string;
  @IsOptional() @IsString() @MaxLength(NAME) metric?: string;
  @ValidateIf(changed) @IsNumber() @Min(0) threshold?: number;
  @IsOptional() @IsString() @MaxLength(20) unit?: string;
  /** null removes the alert threshold */
  @IsOptional() @IsNumber() @Min(0) alertThreshold?: number;
  @ValidateIf(changed) @IsBoolean() enabled?: boolean;
}

export class AnalyzeBundleDto {
  @IsOptional() @IsString() @MaxLength(NAME) componentId?: string;
  @IsOptional() @IsBoolean() includeDependencies?: boolean;
}

// ==================== Roadmap ====================

export const ROADMAP_CATEGORIES: ReadonlyArray<RoadmapCategory> = ['feature', 'improvement', 'bug-fix', 'deprecation', 'integration'];
export const ROADMAP_PRIORITIES: ReadonlyArray<RoadmapPriority> = ['high', 'medium', 'low'];
export const ROADMAP_STATUSES: ReadonlyArray<RoadmapStatus> = ['planned', 'in-progress', 'completed', 'cancelled'];

export class CreateRoadmapItemDto {
  @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(200) title: string;
  @IsString() @MaxLength(LONG_TEXT) description: string;
  @IsIn(ROADMAP_CATEGORIES) category: RoadmapCategory;
  @IsIn(ROADMAP_PRIORITIES) priority: RoadmapPriority;
  @IsOptional() @IsIn(ROADMAP_STATUSES) status?: RoadmapStatus;
  /** An empty date means "no target date" */
  @IsOptional() @Transform(emptyToUndefined) @IsDateString() targetDate?: string;
}

export class UpdateRoadmapItemDto {
  @ValidateIf(changed) @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(200) title?: string;
  @ValidateIf(changed) @IsString() @MaxLength(LONG_TEXT) description?: string;
  @ValidateIf(changed) @IsIn(ROADMAP_CATEGORIES) category?: RoadmapCategory;
  @ValidateIf(changed) @IsIn(ROADMAP_PRIORITIES) priority?: RoadmapPriority;
  @ValidateIf(changed) @IsIn(ROADMAP_STATUSES) status?: RoadmapStatus;
  /** An empty string clears the target date */
  @ValidateIf(changed) @IsString() @Matches(/^$|^\d{4}-\d{2}-\d{2}/, { message: 'targetDate must be a date' }) targetDate?: string;
}

// ==================== Banners ====================

export const BANNER_TYPES: ReadonlyArray<BannerType> = ['info', 'warning', 'error', 'success'];

export class CreateBannerDto {
  @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(200) title: string;
  @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(TEXT) message: string;
  @IsIn(BANNER_TYPES) type: BannerType;
  @IsOptional() @Transform(emptyToUndefined) @IsDateString() expiresAt?: string;
}

export class UpdateBannerDto {
  @ValidateIf(changed) @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(200) title?: string;
  @ValidateIf(changed) @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(TEXT) message?: string;
  @ValidateIf(changed) @IsIn(BANNER_TYPES) type?: BannerType;
  @ValidateIf(changed) @IsBoolean() isActive?: boolean;
  /** An empty string clears the expiry */
  @ValidateIf(changed) @IsString() @Matches(/^$|^\d{4}-\d{2}-\d{2}/, { message: 'expiresAt must be a date' }) expiresAt?: string;
}

// ==================== Issues ====================

export const ISSUE_SEVERITIES: ReadonlyArray<IssueSeverity> = ['low', 'medium', 'high', 'critical'];
export const ISSUE_STATUSES: ReadonlyArray<IssueStatus> = ['open', 'investigating', 'in-progress', 'resolved', 'closed'];

export class CreateIssueDto {
  @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(200) title: string;
  @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(LONG_TEXT) description: string;
  @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(NAME) category: string;
  @IsIn(ISSUE_SEVERITIES) severity: IssueSeverity;
  @IsOptional() @IsString() @MaxLength(NAME) componentId?: string;
  /** Sent by older clients; the reporter is always the signed-in caller */
  @IsOptional() @IsString() @MaxLength(NAME) reportedBy?: string;
}

export class UpdateIssueDto {
  @ValidateIf(changed) @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(200) title?: string;
  @ValidateIf(changed) @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(LONG_TEXT) description?: string;
  @ValidateIf(changed) @IsIn(ISSUE_STATUSES) status?: IssueStatus;
  @ValidateIf(changed) @IsIn(ISSUE_SEVERITIES) severity?: IssueSeverity;
  /** null unassigns the issue */
  @IsOptional() @IsString() @MaxLength(NAME) assignedTo?: string;
}

// ==================== Research forms ====================

/** NASA-TLX: six workload ratings from 0 to 100 */
export class NasaTlxDto {
  @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(200) systemName: string;
  @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(TEXT) task: string;
  @IsNumber() @Min(0) @Max(100) mentalDemand: number;
  @IsNumber() @Min(0) @Max(100) physicalDemand: number;
  @IsNumber() @Min(0) @Max(100) temporalDemand: number;
  @IsNumber() @Min(0) @Max(100) performance: number;
  @IsNumber() @Min(0) @Max(100) effort: number;
  @IsNumber() @Min(0) @Max(100) frustration: number;
  @IsString() @MaxLength(200) user: string;
}

/** System Usability Scale: ten answers from 1 (strongly disagree) to 5 (strongly agree) */
export class SusDto {
  @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(200) systemName: string;
  @IsInt() @Min(1) @Max(5) q1: number;
  @IsInt() @Min(1) @Max(5) q2: number;
  @IsInt() @Min(1) @Max(5) q3: number;
  @IsInt() @Min(1) @Max(5) q4: number;
  @IsInt() @Min(1) @Max(5) q5: number;
  @IsInt() @Min(1) @Max(5) q6: number;
  @IsInt() @Min(1) @Max(5) q7: number;
  @IsInt() @Min(1) @Max(5) q8: number;
  @IsInt() @Min(1) @Max(5) q9: number;
  @IsInt() @Min(1) @Max(5) q10: number;
  @IsString() @MaxLength(200) user: string;
}

/** One heuristic's rating: severity 0 (no issue) to 4 (critical) */
export class HeuristicRatingDto {
  @IsString() @IsNotEmpty() @MaxLength(200) heuristic: string;
  @IsString() @MaxLength(LONG_TEXT) issues: string;
  @IsInt() @Min(0) @Max(4) severity: number;
}

export class HeuristicEvaluationDto {
  @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(200) systemName: string;
  @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(200) evaluator: string;
  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(50) @ValidateNested({ each: true }) @Type(() => HeuristicRatingDto) heuristics: HeuristicRatingDto[];
  @IsString() @MaxLength(LONG_TEXT) overallAssessment: string;
  @IsOptional() @IsDateString() timestamp?: string;
}
