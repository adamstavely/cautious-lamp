import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { strictBody } from '../auth/auth.dto';
import { AuthPrincipal, Principal, RequirePermission } from '../auth/principal';
import { Permission } from '../rbac/rbac.service';
import { CreateBrandDto, UpdateBrandDto } from './brands.dto';
import { BrandsService } from './brands.service';

/**
 * Brands (token overrides per brand). Anyone signed in can read them; creating,
 * changing and deleting need token:create, token:edit and token:delete.
 */
@Controller('api/v1/brands')
export class BrandsController {
  constructor(private readonly brands: BrandsService) {}

  @Get()
  async list() {
    const brands = await this.brands.list();
    return { brands, count: brands.length };
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.brands.get(id);
  }

  @RequirePermission(Permission.TOKEN_CREATE)
  @Post()
  create(@Body(strictBody()) body: CreateBrandDto, @Principal() principal: AuthPrincipal) {
    return this.brands.create(body, principal);
  }

  @RequirePermission(Permission.TOKEN_EDIT)
  @Put(':id')
  update(@Param('id') id: string, @Body(strictBody()) body: UpdateBrandDto, @Principal() principal: AuthPrincipal) {
    return this.brands.update(id, body, principal);
  }

  @RequirePermission(Permission.TOKEN_DELETE)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.brands.delete(id);
    return { success: true };
  }
}
