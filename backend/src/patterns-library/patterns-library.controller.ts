import { Controller, Get, Post, Put, Delete, Body, Param, Query, BadRequestException, Inject } from '@nestjs/common';
import { PatternsLibraryService, ComponentPattern } from './patterns-library.service';
import { CreatePatternDto, UpdatePatternDto } from './patterns-library.dto';
import { strictBody } from '../governance/governance.dto';
import { AuthPrincipal, Principal, RequirePermission } from '../auth/principal';
import { Permission } from '../rbac/rbac.service';
import { CHANGE_RECORDER, ChangeRecorder } from '../notifications/notification.types';

/** A pattern is deprecated by its status, or by tagging it "deprecated" */
const isDeprecated = (pattern?: Pick<ComponentPattern, 'status' | 'tags'> | null) =>
  pattern?.status === 'deprecated' || (pattern?.tags ?? []).some((tag) => tag.toLowerCase() === 'deprecated');

const PATTERN_LINK = '/patterns';

/** Mounted at /patterns-library, outside /api: the MCP server reads patterns from this path */
@Controller('patterns-library')
export class PatternsLibraryController {
  constructor(
    private readonly patternsService: PatternsLibraryService,
    @Inject(CHANGE_RECORDER) private readonly changes: ChangeRecorder,
  ) {}

  @Get('patterns')
  async getAllPatterns(
    @Query('category') category?: string,
    @Query('tags') tags?: string,
    @Query('search') search?: string,
  ) {
    const filters: any = {};
    if (category) filters.category = category as ComponentPattern['category'];
    if (tags) filters.tags = tags.split(',');
    if (search) filters.search = search;
    return this.patternsService.getAllPatterns(filters);
  }

  @Get('patterns/:id')
  async getPattern(
    @Param('id') patternId: string,
  ) {
    const pattern = await this.patternsService.getPattern(patternId);
    if (!pattern) {
      throw new BadRequestException(`Pattern '${patternId}' not found`);
    }
    return pattern;
  }

  @Get('patterns/component/:componentId')
  async getPatternsByComponent(
    @Param('componentId') componentId: string,
  ) {
    return this.patternsService.getPatternsByComponent(componentId);
  }

  @Get('patterns/:id/related')
  async getRelatedPatterns(
    @Param('id') patternId: string,
  ) {
    return this.patternsService.getRelatedPatterns(patternId);
  }

  @Post('patterns')
  @RequirePermission(Permission.PATTERN_CREATE)
  async createPattern(
    @Principal() principal: AuthPrincipal,
    @Body(strictBody()) data: CreatePatternDto,
  ) {
    const pattern = await this.patternsService.createPattern(data);
    await this.changes.record(
      { type: 'pattern', entityId: pattern.id, entityName: pattern.name, action: 'created', changes: [{ description: pattern.description }], link: PATTERN_LINK },
      principal,
    );
    return pattern;
  }

  @Put('patterns/:id')
  @RequirePermission(Permission.PATTERN_EDIT)
  async updatePattern(
    @Principal() principal: AuthPrincipal,
    @Param('id') patternId: string,
    @Body(strictBody()) updates: UpdatePatternDto,
  ) {
    const before = await this.patternsService.getPattern(patternId);
    const wasDeprecated = isDeprecated(before);
    const previousStatus = before?.status;
    const pattern = await this.patternsService.updatePattern(patternId, updates);
    if (!pattern) {
      throw new BadRequestException(`Pattern '${patternId}' not found`);
    }
    const deprecated = !wasDeprecated && isDeprecated(pattern);
    const statusChanged = pattern.status !== previousStatus;
    await this.changes.record(
      {
        type: 'pattern',
        entityId: pattern.id,
        entityName: pattern.name,
        action: deprecated ? 'deprecated' : statusChanged ? 'status-changed' : 'updated',
        changes: Object.keys(updates ?? {}).map((field) => ({ field, description: `${field} changed` })),
        link: PATTERN_LINK,
      },
      principal,
    );
    return pattern;
  }

  @Delete('patterns/:id')
  @RequirePermission(Permission.PATTERN_DELETE)
  async deletePattern(
    @Principal() principal: AuthPrincipal,
    @Param('id') patternId: string,
  ) {
    const pattern = await this.patternsService.getPattern(patternId);
    const deleted = await this.patternsService.deletePattern(patternId);
    if (!deleted || !pattern) {
      throw new BadRequestException(`Pattern '${patternId}' not found`);
    }
    await this.changes.record(
      { type: 'pattern', entityId: pattern.id, entityName: pattern.name, action: 'deleted', breaking: true, link: PATTERN_LINK },
      principal,
    );
    return { message: 'Pattern deleted successfully' };
  }
}
