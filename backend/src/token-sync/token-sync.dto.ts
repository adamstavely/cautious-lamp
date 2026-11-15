import { IsInt, IsObject, IsOptional, Max, Min } from 'class-validator';

/** POST /token-sync/runs/:runId/apply */
export class ApplySyncRunDto {
  /** Item id (the token name) to take-design, keep-code or skip; checked against the run's items by the service */
  @IsOptional()
  @IsObject()
  choices?: Record<string, string>;
}

/** POST /{token,design}-sync/connections/:id/auto-sync */
export class EnableAutoSyncDto {
  /** Hours between scheduled pulls, 1 to 168 (default 24) */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(168)
  intervalHours?: number;
}
