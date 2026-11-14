import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { RequirePermission } from '../auth/principal';
import { ApiKeyGuard } from '../common/security/api-key.guard';
import { Permission } from '../rbac/rbac.service';
import { AddMemberDto, CreateTeamDto, StrictBody, UpdateMemberDto, UpdateTeamDto } from './review.dto';
import { TeamsService } from './teams.service';

/**
 * Team membership grants access to the team's reviews (review-access.ts), so
 * only review admins (`review:admin`) may change teams. Anyone signed in can read them.
 */
@Controller('api/v1/teams')
@UseGuards(ApiKeyGuard)
export class TeamsController {
  constructor(private readonly teams: TeamsService) {}

  @Get()
  list() {
    return this.teams.list();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.teams.get(id);
  }

  @Post()
  @RequirePermission(Permission.REVIEW_ADMIN)
  create(@Body(StrictBody()) dto: CreateTeamDto) {
    return this.teams.create(dto);
  }

  @Patch(':id')
  @RequirePermission(Permission.REVIEW_ADMIN)
  update(@Param('id') id: string, @Body(StrictBody()) dto: UpdateTeamDto) {
    return this.teams.update(id, dto);
  }

  @Delete(':id')
  @RequirePermission(Permission.REVIEW_ADMIN)
  @HttpCode(204)
  async delete(@Param('id') id: string): Promise<void> {
    await this.teams.delete(id);
  }

  @Post(':id/members')
  @RequirePermission(Permission.REVIEW_ADMIN)
  addMember(@Param('id') id: string, @Body(StrictBody()) dto: AddMemberDto) {
    return this.teams.addMember(id, dto);
  }

  @Patch(':id/members/:email')
  @RequirePermission(Permission.REVIEW_ADMIN)
  updateMember(@Param('id') id: string, @Param('email') email: string, @Body(StrictBody()) dto: UpdateMemberDto) {
    return this.teams.updateMember(id, email, dto);
  }

  @Delete(':id/members/:email')
  @RequirePermission(Permission.REVIEW_ADMIN)
  removeMember(@Param('id') id: string, @Param('email') email: string) {
    return this.teams.removeMember(id, email);
  }
}
