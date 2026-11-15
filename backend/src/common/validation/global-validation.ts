import { ValidationPipe, ValidationPipeOptions } from '@nestjs/common';

/**
 * Applied to every route (main.ts). Bodies and queries typed as DTO classes
 * keep only their decorated properties, and an unknown property is a 400
 * instead of passing through to the service. Parameters typed as plain
 * objects (`unknown`, `Record`, object literals) aren't validated by the pipe
 * at all; every such body is listed, with why, in global-validation.spec.ts.
 */
export const GLOBAL_VALIDATION_OPTIONS: ValidationPipeOptions = { whitelist: true, forbidNonWhitelisted: true };

export const globalValidationPipe = () => new ValidationPipe(GLOBAL_VALIDATION_OPTIONS);
