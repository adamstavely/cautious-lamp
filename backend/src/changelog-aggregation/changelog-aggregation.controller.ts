import { BadRequestException, Controller, Get, Param, Query } from '@nestjs/common';
import { AuthPrincipal, Principal } from '../auth/principal';
import { CHANGE_ACTIONS, ChangeAction, ChangeEntityType } from '../notifications/notification.types';
import { ChangelogAggregationService, ChangelogFilters } from './changelog-aggregation.service';

const ENTITY_TYPES: readonly ChangeEntityType[] = ['component', 'token', 'pattern', 'workspace', 'application', 'system'];

function parseDate(value: string | undefined, name: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new BadRequestException(`${name} must be a date`);
  return date;
}

function parseType(value: string | undefined): ChangeEntityType | undefined {
  if (!value) return undefined;
  if (!ENTITY_TYPES.includes(value as ChangeEntityType)) throw new BadRequestException(`type must be one of ${ENTITY_TYPES.join(', ')}`);
  return value as ChangeEntityType;
}

function parseAction(value: string | undefined): ChangeAction | undefined {
  if (!value) return undefined;
  if (!CHANGE_ACTIONS.includes(value as ChangeAction)) throw new BadRequestException(`action must be one of ${CHANGE_ACTIONS.join(', ')}`);
  return value as ChangeAction;
}

/** The design-system changelog, as the caller may see it (workspace items only to their workspaces) */
@Controller('api/v1/changelog')
export class ChangelogAggregationController {
  constructor(private readonly changelogService: ChangelogAggregationService) {}

  @Get('aggregated')
  getAggregatedChangelog(
    @Principal() principal: AuthPrincipal,
    @Query('version') version?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('type') type?: string,
    @Query('breakingOnly') breakingOnly?: string,
    @Query('workspaceId') workspaceId?: string,
  ) {
    return this.changelogService.getAggregatedChangelog(principal, {
      version: version || undefined,
      startDate: parseDate(startDate, 'startDate'),
      endDate: parseDate(endDate, 'endDate'),
      type: parseType(type),
      breakingOnly: breakingOnly === 'true',
      workspaceId: workspaceId || undefined,
    });
  }

  @Get('entries')
  getChangelogEntries(
    @Principal() principal: AuthPrincipal,
    @Query('type') type?: string,
    @Query('entityId') entityId?: string,
    @Query('action') action?: string,
    @Query('breakingOnly') breakingOnly?: string,
    @Query('since') since?: string,
    @Query('workspaceId') workspaceId?: string,
  ) {
    const filters: ChangelogFilters = {
      type: parseType(type),
      entityId: entityId || undefined,
      action: parseAction(action),
      breakingOnly: breakingOnly === 'true',
      since: parseDate(since, 'since'),
      workspaceId: workspaceId || undefined,
    };
    return this.changelogService.getChangelogEntries(principal, filters);
  }

  @Get('breaking-changes')
  getBreakingChanges(@Principal() principal: AuthPrincipal, @Query('since') since?: string) {
    return this.changelogService.getBreakingChanges(principal, parseDate(since, 'since'));
  }

  @Get('components/:componentId')
  getComponentChangelog(@Principal() principal: AuthPrincipal, @Param('componentId') componentId: string) {
    return this.changelogService.getComponentChangelog(principal, componentId);
  }

  @Get('tokens/:tokenId')
  getTokenChangelog(@Principal() principal: AuthPrincipal, @Param('tokenId') tokenId: string) {
    return this.changelogService.getTokenChangelog(principal, tokenId);
  }

  @Get('release-notes/:version')
  generateReleaseNotes(@Principal() principal: AuthPrincipal, @Param('version') version: string) {
    return this.changelogService.generateReleaseNotes(principal, version);
  }
}
