import { Controller, Get, Post, Put, Delete, Body, Param, Query, Headers, BadRequestException } from '@nestjs/common';
import { PatternsLibraryService, ComponentPattern } from './patterns-library.service';

@Controller('patterns-library')
export class PatternsLibraryController {
  constructor(private readonly patternsService: PatternsLibraryService) {}

  private validateRequest(authHeader?: string): void {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new BadRequestException('Authorization header required');
    }
  }

  @Get('patterns')
  getAllPatterns(
    @Query('category') category?: string,
    @Query('tags') tags?: string,
    @Query('search') search?: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const filters: any = {};
    if (category) filters.category = category as ComponentPattern['category'];
    if (tags) filters.tags = tags.split(',');
    if (search) filters.search = search;
    return this.patternsService.getAllPatterns(filters);
  }

  @Get('patterns/:id')
  getPattern(
    @Param('id') patternId: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const pattern = this.patternsService.getPattern(patternId);
    if (!pattern) {
      throw new BadRequestException(`Pattern '${patternId}' not found`);
    }
    return pattern;
  }

  @Get('patterns/component/:componentId')
  getPatternsByComponent(
    @Param('componentId') componentId: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.patternsService.getPatternsByComponent(componentId);
  }

  @Get('patterns/:id/related')
  getRelatedPatterns(
    @Param('id') patternId: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.patternsService.getRelatedPatterns(patternId);
  }

  @Post('patterns')
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
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.patternsService.createPattern(data);
  }

  @Put('patterns/:id')
  updatePattern(
    @Param('id') patternId: string,
    @Body() updates: Partial<Omit<ComponentPattern, 'id' | 'createdAt'>>,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const pattern = this.patternsService.updatePattern(patternId, updates);
    if (!pattern) {
      throw new BadRequestException(`Pattern '${patternId}' not found`);
    }
    return pattern;
  }

  @Delete('patterns/:id')
  deletePattern(
    @Param('id') patternId: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const deleted = this.patternsService.deletePattern(patternId);
    if (!deleted) {
      throw new BadRequestException(`Pattern '${patternId}' not found`);
    }
    return { message: 'Pattern deleted successfully' };
  }
}




