import { ArrayMaxSize, IsArray, IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
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
