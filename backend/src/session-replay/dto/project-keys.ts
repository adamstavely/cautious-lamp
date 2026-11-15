import { applyDecorators } from '@nestjs/common';
import { IsInt, IsString, Matches, Max, MaxLength, Min } from 'class-validator';

/** OpenReplay project keys are short alphanumeric strings ("Project key" in OpenReplay's project settings) */
export const PROJECT_KEY_PATTERN = /^[A-Za-z0-9_-]+$/;
export const PROJECT_KEY_MAX_LENGTH = 100;
export const PROJECT_KEY_MESSAGE =
  "openreplayProjectKey must be the project key from OpenReplay's project settings (letters and numbers)";
export const PROJECT_KEY_LOOKS_NUMERIC =
  'openreplayProjectKey looks like the numeric project id: put that in openreplayProjectId, and the project key here';

/** The tracker's project key: not the numeric id */
export function IsOpenReplayProjectKey() {
  return applyDecorators(
    IsString(),
    MaxLength(PROJECT_KEY_MAX_LENGTH),
    Matches(PROJECT_KEY_PATTERN, { message: PROJECT_KEY_MESSAGE }),
    Matches(/\D/, { message: PROJECT_KEY_LOOKS_NUMERIC }),
  );
}

/** The numeric project id that OpenReplay's dashboard links use */
export function IsOpenReplayProjectId() {
  return applyDecorators(
    IsInt({ message: 'openreplayProjectId must be the numeric project id from OpenReplay' }),
    Min(1),
    Max(Number.MAX_SAFE_INTEGER),
  );
}
