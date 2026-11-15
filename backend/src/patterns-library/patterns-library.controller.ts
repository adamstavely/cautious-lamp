import { Controller, Get, Post, Put, Delete, Body, Param, Query, BadRequestException, Inject } from '@nestjs/common';
import { PatternsLibraryService, ComponentPattern } from './patterns-library.service';
import { AuthPrincipal, Principal, RequirePermission } from '../auth/principal';
import { Permission } from '../rbac/rbac.service';
import { CHANGE_RECORDER, ChangeRecorder } from '../notifications/notification.types';

const PATTERN_CATEGORIES: ReadonlyArray<ComponentPattern['category']> = ['common', 'anti-pattern', 'best-practice', 'accessibility', 'performance', 'composition'];

/** name, description and category are what lists sort and search on, so a pattern can't be stored without them */
function assertPatternFields(data: Partial<ComponentPattern> | undefined, creating: boolean): void {
  if (!data || typeof data !== 'object') throw new BadRequestException('A pattern body is required');
  for (const field of ['name', 'description'] as const) {
    const value = data[field];
    if (value === undefined && !creating) continue;
    if (typeof value !== 'string' || !value.trim()) throw new BadRequestException(`${field} is required`);
  }
  if ((creating || data.category !== undefined) && !PATTERN_CATEGORIES.includes(data.category as ComponentPattern['category'])) {
    throw new BadRequestException(`category must be one of ${PATTERN_CATEGORIES.join(', ')}`);
  }
}

/** Tagging a pattern "deprecated" deprecates it */
const isDeprecated = (tags?: string[]) => (tags ?? []).some((tag) => tag.toLowerCase() === 'deprecated');

const PATTERN_LINK = '/patterns';

@Controller('patterns-library')
export class PatternsLibraryController {
  constructor(
    private readonly patternsService: PatternsLibraryService,
    @Inject(CHANGE_RECORDER) private readonly changes: ChangeRecorder,
  ) {}

  @Get('patterns')
  getAllPatterns(
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
  getPattern(
    @Param('id') patternId: string,
  ) {
    const pattern = this.patternsService.getPattern(patternId);
    if (!pattern) {
      throw new BadRequestException(`Pattern '${patternId}' not found`);
    }
    return pattern;
  }

  @Get('patterns/component/:componentId')
  getPatternsByComponent(
    @Param('componentId') componentId: string,
  ) {
    return this.patternsService.getPatternsByComponent(componentId);
  }

  @Get('patterns/:id/related')
  getRelatedPatterns(
    @Param('id') patternId: string,
  ) {
    return this.patternsService.getRelatedPatterns(patternId);
  }

  @Post('patterns')
  @RequirePermission(Permission.PATTERN_CREATE)
  async createPattern(
    @Principal() principal: AuthPrincipal,
    @Body() data: {
      name: string;
      description: string;
      category: ComponentPattern['category'];
      componentIds?: string[];
      codeExample?: ComponentPattern['codeExample'];
      useCases?: string[];
      whenToUse?: string;
      whenNotToUse?: string;
      relatedPatterns?: string[];
      tags?: string[];
    },
  ) {
    assertPatternFields(data, true);
    const pattern = this.patternsService.createPattern(data);
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
    @Body() updates: Partial<Omit<ComponentPattern, 'id' | 'createdAt'>>,
  ) {
    assertPatternFields(updates, false);
    const wasDeprecated = isDeprecated(this.patternsService.getPattern(patternId)?.tags);
    const pattern = this.patternsService.updatePattern(patternId, updates);
    if (!pattern) {
      throw new BadRequestException(`Pattern '${patternId}' not found`);
    }
    const deprecated = !wasDeprecated && isDeprecated(pattern.tags);
    await this.changes.record(
      {
        type: 'pattern',
        entityId: pattern.id,
        entityName: pattern.name,
        action: deprecated ? 'deprecated' : 'updated',
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
    const pattern = this.patternsService.getPattern(patternId);
    const deleted = this.patternsService.deletePattern(patternId);
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
