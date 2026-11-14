import { ArrayMaxSize, ArrayMinSize, IsArray, IsBoolean, IsEmail, IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { ValidationPipe } from '@nestjs/common';
import { MIN_PASSWORD_LENGTH, USER_STATUSES, UserStatus } from './user.types';

/** Bodies with unknown fields are rejected, not silently trimmed */
export const strictBody = () => new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true });

export class LoginDto {
  @IsString()
  @MaxLength(254)
  email: string;

  @IsString()
  @MaxLength(1024)
  password: string;
}

export class ChangePasswordDto {
  @IsString()
  @MaxLength(1024)
  currentPassword: string;

  @IsString()
  @MinLength(MIN_PASSWORD_LENGTH)
  @MaxLength(1024)
  newPassword: string;
}

export class CreateUserDto {
  @IsEmail()
  @MaxLength(254)
  email: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @IsString()
  @MinLength(MIN_PASSWORD_LENGTH)
  @MaxLength(1024)
  password: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  roles?: string[];
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsIn(USER_STATUSES)
  status?: UserStatus;
}

export class ResetPasswordDto {
  @IsString()
  @MinLength(MIN_PASSWORD_LENGTH)
  @MaxLength(1024)
  password: string;
}

export class ListUsersQuery {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  q?: string;

  @IsOptional()
  @IsIn(USER_STATUSES)
  status?: UserStatus;
}

export class CreateApiKeyDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3650)
  expiresInDays?: number;

  /** Omit for the default service permissions (docs/AUTH.md) */
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @IsString({ each: true })
  scopes?: string[];
}

export class RotateApiKeyDto {
  @IsOptional()
  @IsBoolean()
  revokeOld?: boolean;

  @IsOptional()
  @IsIn(['manual', 'automatic', 'expired', 'compromised'])
  reason?: 'manual' | 'automatic' | 'expired' | 'compromised';
}
