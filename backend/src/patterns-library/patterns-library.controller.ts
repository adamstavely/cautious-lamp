import { Controller, Get, Post, Put, Delete, Body, Param, Query, BadRequestException } from '@nestjs/common';
import { PatternsLibraryService, ComponentPattern } from './patterns-library.service';
import { RequirePermission } from '../auth/principal';
import { Permission } from '../rbac/rbac.service';

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

@Controller('patterns-library')
export class PatternsLibraryController {
  constructor(
    private readonly patternsService: PatternsLibraryService,
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
  createPattern(
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
    return this.patternsService.createPattern(data);
  }

  @Put('patterns/:id')
  @RequirePermission(Permission.PATTERN_EDIT)
  updatePattern(
    @Param('id') patternId: string,
    @Body() updates: Partial<Omit<ComponentPattern, 'id' | 'createdAt'>>,
  ) {
    assertPatternFields(updates, false);
    const pattern = this.patternsService.updatePattern(patternId, updates);
    if (!pattern) {
      throw new BadRequestException(`Pattern '${patternId}' not found`);
    }
    return pattern;
  }

  @Delete('patterns/:id')
  @RequirePermission(Permission.PATTERN_DELETE)
  deletePattern(
    @Param('id') patternId: string,
  ) {
    const deleted = this.patternsService.deletePattern(patternId);
    if (!deleted) {
      throw new BadRequestException(`Pattern '${patternId}' not found`);
    }
    return { message: 'Pattern deleted successfully' };
  }
}
