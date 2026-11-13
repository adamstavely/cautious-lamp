import { Controller, Get, Query, Headers } from '@nestjs/common';
import { ChangelogAggregationService } from './changelog-aggregation.service';
import { KeyManagementService } from '../common/security/key-management.service';

@Controller('changelog')
export class ChangelogAggregationController {
  constructor(
    private readonly changelogService: ChangelogAggregationService,
    private readonly keyManagementService: KeyManagementService,
  ) {}

  /**
   * No-op: the global AuthGuard has already authenticated the caller (a user
   * token or an API key, docs/AUTH.md). Kept so the call sites stay as they were.
   */
  private validateRequest(_authHeader?: string): void {}

  @Get('aggregated')
  getAggregatedChangelog(
    @Query('version') version?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('type') type?: string,
    @Query('breakingOnly') breakingOnly?: string,
    @Query('workspaceId') workspaceId?: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const filters: any = {};
    if (version) filters.version = version;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    if (type) filters.type = type;
    if (breakingOnly === 'true') filters.breakingOnly = true;
    if (workspaceId) filters.workspaceId = workspaceId;
    return this.changelogService.getAggregatedChangelog(filters);
  }

  @Get('entries')
  getChangelogEntries(
    @Query('type') type?: string,
    @Query('entityId') entityId?: string,
    @Query('action') action?: string,
    @Query('breakingOnly') breakingOnly?: string,
    @Query('since') since?: string,
    @Query('workspaceId') workspaceId?: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const filters: any = {};
    if (type) filters.type = type;
    if (entityId) filters.entityId = entityId;
    if (action) filters.action = action;
    if (breakingOnly === 'true') filters.breakingOnly = true;
    if (since) filters.since = new Date(since);
    if (workspaceId) filters.workspaceId = workspaceId;
    return this.changelogService.getChangelogEntries(filters);
  }

  @Get('components/:componentId')
  getComponentChangelog(
    @Query('componentId') componentId: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.changelogService.getComponentChangelog(componentId);
  }

  @Get('tokens/:tokenName')
  getTokenChangelog(
    @Query('tokenName') tokenName: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.changelogService.getTokenChangelog(tokenName);
  }

  @Get('breaking-changes')
  getBreakingChanges(
    @Query('since') since?: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.changelogService.getBreakingChanges(since ? new Date(since) : undefined);
  }

  @Get('release-notes/:version')
  generateReleaseNotes(
    @Query('version') version: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.changelogService.generateReleaseNotes(version);
  }
}





