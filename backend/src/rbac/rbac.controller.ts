import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RbacService, Permission, RoleDefinition } from './rbac.service';

@Controller('api/v1/rbac')
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Get('roles')
  async getRoles() {
    return this.rbacService.getRoles();
  }

  @Get('roles/:id')
  async getRole(@Param('id') id: string) {
    const role = await this.rbacService.getRole(id);
    if (!role) {
      return { error: 'Role not found' };
    }
    return role;
  }

  @Put('roles/:id')
  async updateRole(
    @Param('id') id: string,
    @Body() body: { permissions: Permission[] },
  ) {
    return this.rbacService.updateRole(id, body.permissions);
  }

  @Get('permissions')
  getAllPermissions() {
    return this.rbacService.getAllPermissions();
  }

  @Get('users/:userId/roles')
  async getUserRoles(@Param('userId') userId: string) {
    return this.rbacService.getUserRoles(userId);
  }

  @Post('users/:userId/roles')
  async assignRoleToUser(
    @Param('userId') userId: string,
    @Body() body: { roleId: string; assignedBy?: string },
  ) {
    return this.rbacService.assignRoleToUser(userId, body.roleId, body.assignedBy);
  }

  @Delete('users/:userId/roles/:roleId')
  async removeRoleFromUser(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
  ) {
    await this.rbacService.removeRoleFromUser(userId, roleId);
    return { success: true };
  }

  @Get('roles/:roleId/users')
  async getUsersWithRole(@Param('roleId') roleId: string) {
    return this.rbacService.getUsersWithRole(roleId);
  }

  @Get('users/:userId/permissions/:permission')
  async checkPermission(
    @Param('userId') userId: string,
    @Param('permission') permission: Permission,
  ) {
    const hasPermission = await this.rbacService.hasPermission(userId, permission);
    return { hasPermission };
  }
}

