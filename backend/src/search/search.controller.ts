import { Controller, Get, Query } from '@nestjs/common';
import { SearchService, SearchFilters } from './search.service';
import { AuthPrincipal, Principal } from '../auth/principal';

@Controller('api/v1/search')
export class SearchController {
  constructor(
    private readonly searchService: SearchService,
  ) {}

  @Get()
  search(
    @Query('q') query: string,
    @Query('type') type?: string,
    @Query('category') category?: string,
    @Query('hasProps') hasProps?: string,
    @Query('useCase') useCase?: string,
    @Query('tags') tags?: string,
    @Principal() principal?: AuthPrincipal,
  ) {
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

    return this.searchService.search(query, filters, principal);
  }

  @Get('suggestions')
  getSuggestions(
    @Query('q') query: string,
    @Query('limit') limit?: string,
    @Principal() principal?: AuthPrincipal,
  ) {
    if (!query) {
      return [];
    }
    return this.searchService.getSuggestions(query, limit ? parseInt(limit) : 5, principal);
  }

  @Get('filters')
  getAvailableFilters(
    @Principal() principal?: AuthPrincipal,
  ) {
    return this.searchService.getAvailableFilters(principal);
  }
}
