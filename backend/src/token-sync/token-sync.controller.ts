import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { AuthPrincipal, Principal } from '../auth/principal';
import { SyncRun, SyncRunSummary } from '../design-tools/sync-runs';
import { ApplySyncRunDto, EnableAutoSyncDto } from './token-sync.dto';
import { TokenSyncConnectionView, TokenSyncService } from './token-sync.service';

/**
 * Token sync connections, pulls and applies. Each connection belongs to its
 * creator (admin:users holders see all); responses never include the
 * credential, only `hasApiKey`. A pull (`sync`) records a diff as a run;
 * applying a run writes the chosen changes and needs token:create, token:edit
 * or token:delete for the kinds of change chosen.
 */
@Controller('api/v1/token-sync')
export class TokenSyncController {
  constructor(private readonly tokenSyncService: TokenSyncService) {}

  @Get('connections')
  getConnections(@Principal() principal: AuthPrincipal): Promise<TokenSyncConnectionView[]> {
    return this.tokenSyncService.getAllConnections(principal);
  }

  @Get('connections/:id')
  getConnection(@Principal() principal: AuthPrincipal, @Param('id') id: string): Promise<TokenSyncConnectionView> {
    return this.tokenSyncService.getConnection(principal, id);
  }

  @Post('connections')
  createConnection(@Principal() principal: AuthPrincipal, @Body() body: unknown): Promise<TokenSyncConnectionView> {
    return this.tokenSyncService.createConnection(principal, body);
  }

  @Put('connections/:id')
  updateConnection(@Principal() principal: AuthPrincipal, @Param('id') id: string, @Body() body: unknown): Promise<TokenSyncConnectionView> {
    return this.tokenSyncService.updateConnection(principal, id, body);
  }

  @Delete('connections/:id')
  async deleteConnection(@Principal() principal: AuthPrincipal, @Param('id') id: string): Promise<{ success: boolean }> {
    await this.tokenSyncService.deleteConnection(principal, id);
    return { success: true };
  }

  /** Pulls the design file and records the diff for review; writes no tokens */
  @Post('connections/:id/sync')
  syncTokens(@Principal() principal: AuthPrincipal, @Param('id') id: string): Promise<SyncRun> {
    return this.tokenSyncService.syncTokens(principal, id);
  }

  @Get('connections/:id/runs')
  listRuns(@Principal() principal: AuthPrincipal, @Param('id') id: string): Promise<SyncRunSummary[]> {
    return this.tokenSyncService.listRuns(principal, id);
  }

  @Get('runs/:runId')
  getRun(@Principal() principal: AuthPrincipal, @Param('runId') runId: string): Promise<SyncRun> {
    return this.tokenSyncService.getRun(principal, runId);
  }

  /** Writes the chosen changes: per item take-design, keep-code or skip */
  @Post('runs/:runId/apply')
  applyRun(@Principal() principal: AuthPrincipal, @Param('runId') runId: string, @Body() body: ApplySyncRunDto): Promise<SyncRun> {
    return this.tokenSyncService.applyRun(principal, runId, body);
  }

  /** Scheduled pulls that produce diffs for review; nothing is applied automatically */
  @Post('connections/:id/auto-sync')
  enableAutoSync(@Principal() principal: AuthPrincipal, @Param('id') id: string, @Body() body: EnableAutoSyncDto): Promise<TokenSyncConnectionView> {
    return this.tokenSyncService.enableAutoSync(principal, id, body);
  }

  @Delete('connections/:id/auto-sync')
  async disableAutoSync(@Principal() principal: AuthPrincipal, @Param('id') id: string): Promise<{ success: boolean }> {
    await this.tokenSyncService.disableAutoSync(principal, id);
    return { success: true };
  }
}
