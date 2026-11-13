import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put } from '@nestjs/common';
import { strictBody } from '../auth/auth.dto';
import { AuthPrincipal, Principal, RequirePermission, assertSelfOr } from '../auth/principal';
import { UsersService } from '../auth/users.service';
import { Permission, RbacService } from './rbac.service';
import { AssignRoleDto, UpdateRoleDto } from './rbac.dto';

/**
 * Roles and assignments (docs/AUTH.md). Everything needs admin:rbac, except
 * that people may read their own roles and permissions. Role changes go
 * through UsersService, which knows who is active (the last-admin rule).
 * Clients put user ids in paths with encodeURIComponent; Express decodes them.
 */
@Controller('api/v1/rbac')
export class RbacController {
  constructor(
    private readonly rbacService: RbacService,
    private readonly users: UsersService,
  ) {}

  @Get('roles')
  @RequirePermission(Permission.ADMIN_RBAC)
  getRoles() {
    return this.rbacService.getRoles();
  }

  @Get('roles/:id')
  @RequirePermission(Permission.ADMIN_RBAC)
  getRole(@Param('id') id: string) {
    return this.rbacService.requireRole(id);
  }

  @Put('roles/:id')
  @RequirePermission(Permission.ADMIN_RBAC)
  updateRole(@Param('id') id: string, @Body(strictBody()) body: UpdateRoleDto, @Principal() principal: AuthPrincipal) {
    return this.users.updateRolePermissions(id, body.permissions, principal);
  }

  @Get('permissions')
  @RequirePermission(Permission.ADMIN_RBAC)
  getAllPermissions() {
    return this.rbacService.getAllPermissions();
  }

  @Get('users/:userId/roles')
  getUserRoles(@Param('userId') userId: string, @Principal() principal: AuthPrincipal) {
    assertSelfOr(principal, userId, Permission.ADMIN_RBAC);
    return this.rbacService.getUserRoles(userId);
  }

  @Post('users/:userId/roles')
  @RequirePermission(Permission.ADMIN_RBAC)
  assignRoleToUser(
    @Param('userId') userId: string,
    @Body(strictBody()) body: AssignRoleDto,
    @Principal() principal: AuthPrincipal,
  ) {
    return this.users.assignRole(userId, body.roleId, principal);
  }

  @Delete('users/:userId/roles/:roleId')
  @RequirePermission(Permission.ADMIN_RBAC)
  @HttpCode(200)
  async removeRoleFromUser(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
    @Principal() principal: AuthPrincipal,
  ) {
    await this.users.removeRole(userId, roleId, principal);
    return { success: true };
  }

  /** Summaries (id, email, name) of the users with the role */
  @Get('roles/:roleId/users')
  @RequirePermission(Permission.ADMIN_RBAC)
  async getUsersWithRole(@Param('roleId') roleId: string) {
    return this.users.summaries(await this.rbacService.getUsersWithRole(roleId));
  }

  @Get('users/:userId/permissions/:permission')
  async checkPermission(
    @Param('userId') userId: string,
    @Param('permission') permission: string,
    @Principal() principal: AuthPrincipal,
  ) {
    assertSelfOr(principal, userId, Permission.ADMIN_RBAC);
    const hasPermission = await this.rbacService.hasPermission(userId, permission as Permission);
    return { hasPermission };
  }
}
