import { ArrayMaxSize, IsArray, IsIn, IsString, MaxLength } from 'class-validator';
import { ALL_PERMISSIONS } from './rbac.service';

export class UpdateRoleDto {
  @IsArray()
  @ArrayMaxSize(ALL_PERMISSIONS.length)
  @IsIn(ALL_PERMISSIONS, { each: true })
  permissions: string[];
}

export class AssignRoleDto {
  @IsString()
  @MaxLength(100)
  roleId: string;
}
