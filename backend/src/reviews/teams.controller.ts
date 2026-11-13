import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../common/security/api-key.guard';
import { AddMemberDto, CreateTeamDto, StrictBody, UpdateMemberDto, UpdateTeamDto } from './review.dto';
import { TeamsService } from './teams.service';

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
  create(@Body(StrictBody()) dto: CreateTeamDto) {
    return this.teams.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body(StrictBody()) dto: UpdateTeamDto) {
    return this.teams.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string): Promise<void> {
    await this.teams.delete(id);
  }

  @Post(':id/members')
  addMember(@Param('id') id: string, @Body(StrictBody()) dto: AddMemberDto) {
    return this.teams.addMember(id, dto);
  }

  @Patch(':id/members/:email')
  updateMember(@Param('id') id: string, @Param('email') email: string, @Body(StrictBody()) dto: UpdateMemberDto) {
    return this.teams.updateMember(id, email, dto);
  }

  @Delete(':id/members/:email')
  removeMember(@Param('id') id: string, @Param('email') email: string) {
    return this.teams.removeMember(id, email);
  }
}
