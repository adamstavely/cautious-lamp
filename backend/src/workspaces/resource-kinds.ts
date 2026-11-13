import { BadRequestException, applyDecorators } from '@nestjs/common';
import { Transform, Type, plainToInstance } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  ValidateBy,
  ValidateNested,
  ValidationError,
  buildMessage,
  validate,
} from 'class-validator';
import { trim } from './workspace.dto';

// ---------- Field decorators shared by the kinds ----------

/** An http(s) URL of at most 2048 characters. Stored for the browser to open; the server never fetches it. */
export const HttpUrl = () =>
  applyDecorators(
    IsString(),
    MaxLength(2048),
    IsUrl({ protocols: ['http', 'https'], require_protocol: true, require_tld: false }, { message: '$property must be an http(s) URL' }),
  );

const Name = () => applyDecorators(IsString(), Transform(trim), IsNotEmpty(), MaxLength(200));
const ShortText = (max = 200) => applyDecorators(IsOptional(), IsString(), MaxLength(max));
const Description = () => ShortText(5000);
const StringList = (maxItems = 50, maxLength = 500) =>
  applyDecorators(IsOptional(), IsArray(), ArrayMaxSize(maxItems), IsString({ each: true }), MaxLength(maxLength, { each: true }));

/** Rejects objects whose JSON is larger than `bytes` */
const MaxJsonSize = (bytes: number) =>
  ValidateBy({
    name: 'maxJsonSize',
    validator: {
      validate: (value) => {
        try {
          return Buffer.byteLength(JSON.stringify(value ?? null)) <= bytes;
        } catch {
          return false;
        }
      },
      defaultMessage: buildMessage((prefix) => `${prefix}$property must be at most ${Math.round(bytes / 1024)}KB of JSON`),
    },
  });

/** Must look like an SVG document. It is still sanitized by the browser before display. */
const SvgMarkup = () =>
  ValidateBy({
    name: 'svgMarkup',
    validator: {
      validate: (value) => typeof value === 'string' && /<svg[\s>]/i.test(value),
      defaultMessage: buildMessage((prefix) => `${prefix}$property must be SVG markup`),
    },
  });

abstract class Tagged {
  @StringList(30, 50)
  tags?: string[];
}

// ---------- One DTO per kind (create; updates use the same class with every field optional) ----------

export class FontDto extends Tagged {
  @Name() name: string;
  @IsString() @Transform(trim) @IsNotEmpty() @MaxLength(200) family: string;
  @StringList(20, 20) weights?: string[];
  @IsOptional() @IsArray() @ArrayMaxSize(3) @IsIn(['normal', 'italic', 'oblique'], { each: true }) styles?: string[];
  @IsIn(['google', 'custom', 'system']) source: 'google' | 'custom' | 'system';
  @IsOptional() @HttpUrl() url?: string;
  @ShortText(200) fallback?: string;
}

export class AssetDto extends Tagged {
  @Name() name: string;
  @IsIn(['image', 'icon', 'illustration', 'logo', 'other']) type: string;
  @HttpUrl() url: string;
  @IsOptional() @HttpUrl() thumbnailUrl?: string;
  @IsOptional() @IsInt() @Min(0) @Max(10 * 1024 * 1024 * 1024) size?: number;
  @ShortText(20) format?: string;
  @Description() description?: string;
}

export class TokenDto extends Tagged {
  @Name() name: string;
  @IsString() @IsNotEmpty() @MaxLength(2000) value: string;
  @IsString() @IsNotEmpty() @MaxLength(50) type: string;
  @IsString() @IsNotEmpty() @MaxLength(50) category: string;
  @Description() description?: string;
}

export class ReviewDto extends Tagged {
  @Name() title: string;
  @Description() description?: string;
  @IsOptional() @IsIn(['pending', 'in-review', 'approved', 'rejected']) status?: string;
  @IsOptional() @HttpUrl() url?: string;
}

export class SessionReplayDto extends Tagged {
  @Name() name: string;
  @Description() description?: string;
  @ShortText(200) projectId?: string;
  @ShortText(200) sessionId?: string;
  @IsOptional() @HttpUrl() url?: string;
}

class JourneyStageDto {
  @Name() name: string;
  @ShortText(2000) description?: string;
}

export class JourneyMapDto extends Tagged {
  @Name() title: string;
  @Description() description?: string;
  @ShortText(200) persona?: string;
  @IsOptional() @IsArray() @ArrayMaxSize(50) @ValidateNested({ each: true }) @Type(() => JourneyStageDto) stages?: JourneyStageDto[];
  @IsOptional() @HttpUrl() url?: string;
}

export class HcdReportDto extends Tagged {
  @Name() title: string;
  @Description() description?: string;
  @IsOptional() @IsIn(['usability', 'accessibility', 'heuristic', 'user-research', 'other']) reportType?: string;
  @IsOptional() @HttpUrl() url?: string;
}

export class UserPersonaDto extends Tagged {
  @Name() name: string;
  @Description() description?: string;
  @IsOptional() @IsObject() @MaxJsonSize(8 * 1024) demographics?: Record<string, unknown>;
  @StringList() goals?: string[];
  @StringList() painPoints?: string[];
  @StringList() behaviors?: string[];
  @IsOptional() @HttpUrl() url?: string;
}

export class ResearchArtifactDto extends Tagged {
  @Name() title: string;
  @Description() description?: string;
  @IsOptional() @IsIn(['interview', 'survey', 'observation', 'workshop', 'other']) artifactType?: string;
  @IsOptional() @HttpUrl() url?: string;
}

export class InsightDto extends Tagged {
  @Name() title: string;
  @Description() description?: string;
  @IsOptional() @IsIn(['user-need', 'pain-point', 'opportunity', 'finding', 'other']) category?: string;
  @IsOptional() @IsIn(['high', 'medium', 'low']) priority?: string;
  @IsOptional() @HttpUrl() url?: string;
}

export class PatternDto extends Tagged {
  @Name() name: string;
  @Description() description?: string;
  @ShortText(100) category?: string;
  @IsOptional() @HttpUrl() url?: string;
}

export class IconDto extends Tagged {
  @Name() name: string;
  @Description() description?: string;
  @ShortText(100) iconSet?: string;
  /** Raw SVG. Sanitized in the browser before display (docs/WORKSPACES.md). */
  @IsOptional() @IsString() @MaxLength(100 * 1024) @SvgMarkup() svg?: string;
  @IsOptional() @HttpUrl() url?: string;
}

export class InteractiveDto extends Tagged {
  @Name() name: string;
  @Description() description?: string;
  @IsOptional() @IsIn(['prototype', 'demo', 'sandbox', 'other']) type?: string;
  @IsOptional() @HttpUrl() url?: string;
}

export class StockPhotoDto extends Tagged {
  @Name() name: string;
  @Description() description?: string;
  @HttpUrl() url: string;
  @IsOptional() @HttpUrl() thumbnailUrl?: string;
  @ShortText(200) photographer?: string;
  @ShortText(200) license?: string;
}

export class IllustrationDto extends Tagged {
  @Name() name: string;
  @Description() description?: string;
  @HttpUrl() url: string;
  @IsOptional() @HttpUrl() thumbnailUrl?: string;
  @ShortText(100) style?: string;
}

export class CapabilityLogoDto extends Tagged {
  @Name() name: string;
  @Description() description?: string;
  @ShortText(100) capability?: string;
  @HttpUrl() url: string;
  @IsOptional() @HttpUrl() thumbnailUrl?: string;
  @ShortText(20) format?: string;
}

export class StyleDictionaryDto extends Tagged {
  @Name() name: string;
  @Description() description?: string;
  @IsOptional() @IsIn(['json', 'css', 'scss', 'less', 'js', 'ts']) format?: string;
  @IsOptional() @IsObject() @MaxJsonSize(512 * 1024) tokens?: Record<string, unknown>;
  @IsOptional() @HttpUrl() url?: string;
}

export class GuidelineDto extends Tagged {
  @Name() title: string;
  @Description() description?: string;
  @IsOptional() @IsIn(['design', 'accessibility', 'content', 'interaction', 'visual', 'technical', 'other']) category?: string;
  /** Markdown (HTML allowed). Sanitized in the browser before display (docs/WORKSPACES.md). */
  @IsOptional() @IsString() @MaxLength(200 * 1024) content?: string;
  @IsOptional() @HttpUrl() url?: string;
}

// ---------- The allowlist ----------

export interface ResourceKindSpec {
  kind: string;
  dto: new () => object;
  /** The field shown as the item's title */
  titleField: 'name' | 'title';
  /** Optional `?filter=` on list requests matches this field */
  filterField?: string;
}

export const RESOURCE_KINDS: readonly ResourceKindSpec[] = [
  { kind: 'fonts', dto: FontDto, titleField: 'name', filterField: 'source' },
  { kind: 'assets', dto: AssetDto, titleField: 'name', filterField: 'type' },
  { kind: 'tokens', dto: TokenDto, titleField: 'name', filterField: 'category' },
  { kind: 'reviews', dto: ReviewDto, titleField: 'title', filterField: 'status' },
  { kind: 'session-replays', dto: SessionReplayDto, titleField: 'name' },
  { kind: 'journey-maps', dto: JourneyMapDto, titleField: 'title' },
  { kind: 'hcd-reports', dto: HcdReportDto, titleField: 'title', filterField: 'reportType' },
  { kind: 'user-personas', dto: UserPersonaDto, titleField: 'name' },
  { kind: 'research-artifacts', dto: ResearchArtifactDto, titleField: 'title', filterField: 'artifactType' },
  { kind: 'insights', dto: InsightDto, titleField: 'title', filterField: 'category' },
  { kind: 'patterns', dto: PatternDto, titleField: 'name', filterField: 'category' },
  { kind: 'icons', dto: IconDto, titleField: 'name', filterField: 'iconSet' },
  { kind: 'interactives', dto: InteractiveDto, titleField: 'name', filterField: 'type' },
  { kind: 'stock-photos', dto: StockPhotoDto, titleField: 'name' },
  { kind: 'illustrations', dto: IllustrationDto, titleField: 'name', filterField: 'style' },
  { kind: 'capability-logos', dto: CapabilityLogoDto, titleField: 'name', filterField: 'capability' },
  { kind: 'style-dictionaries', dto: StyleDictionaryDto, titleField: 'name', filterField: 'format' },
  { kind: 'guidelines', dto: GuidelineDto, titleField: 'title', filterField: 'category' },
];

const BY_KIND = new Map(RESOURCE_KINDS.map((spec) => [spec.kind, spec]));

export function resourceKind(kind: string): ResourceKindSpec | undefined {
  return BY_KIND.get(kind);
}

function flattenErrors(errors: ValidationError[], parent = ''): string[] {
  return errors.flatMap((error) => {
    const path = parent ? `${parent}.${error.property}` : error.property;
    const own = Object.values(error.constraints ?? {}).map((message) =>
      parent ? message.replace(error.property, path) : message,
    );
    return [...own, ...flattenErrors(error.children ?? [], path)];
  });
}

/**
 * Validates a create (`partial: false`) or update (`partial: true`) body for a
 * kind: unknown fields are rejected, and updates can't set a field to null.
 * Returns only the kind's own fields, never control fields like workspaceId.
 */
export async function validateResourceFields(
  spec: ResourceKindSpec,
  body: unknown,
  partial: boolean,
): Promise<Record<string, unknown>> {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new BadRequestException('The body must be a JSON object');
  }
  const entries = Object.entries(body as Record<string, unknown>);
  if (partial) {
    if (entries.length === 0) throw new BadRequestException('Nothing to update');
    const nulls = entries.filter(([, value]) => value === null).map(([key]) => key);
    if (nulls.length) throw new BadRequestException(nulls.map((key) => `${key} cannot be null`));
  }
  const instance = plainToInstance(spec.dto, body) as Record<string, unknown>;
  const errors = await validate(instance, {
    whitelist: true,
    forbidNonWhitelisted: true,
    skipMissingProperties: partial,
  });
  if (errors.length) throw new BadRequestException(flattenErrors(errors));
  // Back to plain JSON (nested DTO instances become objects)
  const fields = JSON.parse(JSON.stringify(instance)) as Record<string, unknown>;
  for (const key of Object.keys(fields)) {
    if (fields[key] === undefined) delete fields[key];
  }
  return fields;
}
