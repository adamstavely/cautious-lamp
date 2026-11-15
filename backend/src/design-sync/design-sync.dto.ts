import { IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';

/** POST /design-sync/connections/:id/sync */
export class CompareDesignDto {
  /** Only design-to-code is supported; anything else is refused by the service with the reason */
  @IsOptional()
  @IsString()
  direction?: string;
}

/** PUT /design-sync/connections/:id/links */
export class SetComponentLinkDto {
  @IsString()
  @MaxLength(200)
  componentId!: string;

  /** The design node id, or null to unlink */
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(200)
  designNodeId!: string | null;
}
