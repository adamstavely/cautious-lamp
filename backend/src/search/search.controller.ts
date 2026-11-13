import { Controller, Get, Query, Headers } from '@nestjs/common';
import { SearchService, SearchFilters } from './search.service';
import { KeyManagementService } from '../common/security/key-management.service';
import { AuthPrincipal, Principal } from '../auth/principal';

@Controller('api/v1/search')
export class SearchController {
  constructor(
    private readonly searchService: SearchService,
    private readonly keyManagementService: KeyManagementService,
  ) {}

  /**
   * No-op: the global AuthGuard has already authenticated the caller (a user
   * token or an API key, docs/AUTH.md). Kept so the call sites stay as they were.
   */
  private validateRequest(_authHeader?: string): void {}

  @Get()
  search(
    @Query('q') query: string,
    @Query('type') type?: string,
    @Query('category') category?: string,
    @Query('hasProps') hasProps?: string,
    @Query('useCase') useCase?: string,
    @Query('tags') tags?: string,
    @Headers('authorization') authHeader?: string,
    @Principal() principal?: AuthPrincipal,
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

    return this.searchService.search(query, filters, principal);
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
    @Principal() principal?: AuthPrincipal,
  ) {
    this.validateRequest(authHeader);
    return this.searchService.getAvailableFilters(principal);
  }
}

