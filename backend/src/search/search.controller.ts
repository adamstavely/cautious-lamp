import { Controller, Get, Query, Headers, BadRequestException } from '@nestjs/common';
import { SearchService, SearchFilters } from './search.service';

@Controller('api/v1/search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  private validateRequest(authHeader?: string): void {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new BadRequestException('Authorization header required');
    }
  }

  @Get()
  search(
    @Query('q') query: string,
    @Query('type') type?: string,
    @Query('category') category?: string,
    @Query('hasProps') hasProps?: string,
    @Query('useCase') useCase?: string,
    @Query('tags') tags?: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    
    if (!query) {
      return [];
    }

    const filters: SearchFilters = {};
    if (type) {
      filters.type = type.split(',') as any[];
    }
    if (category) {
      filters.category = category.split(',');
    }
    if (hasProps) {
      filters.hasProps = hasProps.split(',');
    }
    if (useCase) {
      filters.useCase = useCase;
    }
    if (tags) {
      filters.tags = tags.split(',');
    }

    return this.searchService.search(query, filters);
  }

  @Get('suggestions')
  getSuggestions(
    @Query('q') query: string,
    @Query('limit') limit?: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    if (!query) {
      return [];
    }
    return this.searchService.getSuggestions(query, limit ? parseInt(limit) : 5);
  }

  @Get('filters')
  getAvailableFilters(
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.searchService.getAvailableFilters();
  }
}

