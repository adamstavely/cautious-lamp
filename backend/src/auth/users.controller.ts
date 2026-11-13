import { Body, Controller, Get, HttpCode, Param, Patch, Post, Query, ValidationPipe } from '@nestjs/common';
import { Permission } from '../rbac/rbac.service';
import { CreateUserDto, ListUsersQuery, ResetPasswordDto, UpdateUserDto, strictBody } from './auth.dto';
import { AuthPrincipal, Principal, RequirePermission } from './principal';
import { PublicUser } from './user.types';
import { UsersService } from './users.service';

/** User administration (docs/AUTH.md). There is no delete: users are disabled. */
@Controller('api/v1/users')
@RequirePermission(Permission.ADMIN_USERS)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  list(@Query(new ValidationPipe({ whitelist: true, transform: true })) query: ListUsersQuery): Promise<{ users: PublicUser[]; total: number }> {
    return this.users.list(query);
  }

  @Get(':id')
  get(@Param('id') id: string): Promise<PublicUser> {
    return this.users.get(id);
  }

  @Post()
  create(@Body(strictBody()) body: CreateUserDto, @Principal() principal: AuthPrincipal): Promise<PublicUser> {
    return this.users.create(body, principal);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(strictBody()) body: UpdateUserDto,
    @Principal() principal: AuthPrincipal,
  ): Promise<PublicUser> {
    return this.users.update(id, body, principal);
  }

  @Post(':id/reset-password')
  @HttpCode(204)
  async resetPassword(
    @Param('id') id: string,
    @Body(strictBody()) body: ResetPasswordDto,
    @Principal() principal: AuthPrincipal,
  ): Promise<void> {
    await this.users.resetPassword(id, body.password, principal);
  }
}
