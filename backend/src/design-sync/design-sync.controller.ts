import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { AuthPrincipal, Principal } from '../auth/principal';
import { SyncRun, SyncRunSummary } from '../design-tools/sync-runs';
import { EnableAutoSyncDto } from '../token-sync/token-sync.dto';
import { CompareDesignDto, SetComponentLinkDto } from './design-sync.dto';
import { DesignFileView, DesignSyncConnectionView, DesignSyncService } from './design-sync.service';

/**
 * Design sync connections and compares. Each connection belongs to its
 * creator (admin:users holders see all); responses never include the
 * credential, only `hasApiKey`. Design sync reads Figma and Penpot files and
 * reports how their components line up with the library; it never writes to
 * the design file or generates code.
 */
@Controller('api/v1/design-sync')
export class DesignSyncController {
  constructor(private readonly designSyncService: DesignSyncService) {}

  @Get('connections')
  getConnections(@Principal() principal: AuthPrincipal): Promise<DesignSyncConnectionView[]> {
    return this.designSyncService.getAllConnections(principal);
  }

  @Get('connections/:id')
  getConnection(@Principal() principal: AuthPrincipal, @Param('id') id: string): Promise<DesignSyncConnectionView> {
    return this.designSyncService.getConnection(principal, id);
  }

  @Post('connections')
  createConnection(@Principal() principal: AuthPrincipal, @Body() body: unknown): Promise<DesignSyncConnectionView> {
    return this.designSyncService.createConnection(principal, body);
  }

  @Put('connections/:id')
  updateConnection(@Principal() principal: AuthPrincipal, @Param('id') id: string, @Body() body: unknown): Promise<DesignSyncConnectionView> {
    return this.designSyncService.updateConnection(principal, id, body);
  }

  @Delete('connections/:id')
  async deleteConnection(@Principal() principal: AuthPrincipal, @Param('id') id: string): Promise<{ success: boolean }> {
    await this.designSyncService.deleteConnection(principal, id);
    return { success: true };
  }

  /** The design file's components, read live */
  @Get('connections/:id/file')
  getDesignFile(@Principal() principal: AuthPrincipal, @Param('id') id: string): Promise<DesignFileView> {
    return this.designSyncService.fetchDesignFile(principal, id);
  }

  /** Compares the design file's components with the library and records the report */
  @Post('connections/:id/sync')
  sync(@Principal() principal: AuthPrincipal, @Param('id') id: string, @Body() body: CompareDesignDto): Promise<SyncRun> {
    return this.designSyncService.sync(principal, id, body?.direction);
  }

  @Get('connections/:id/runs')
  listRuns(@Principal() principal: AuthPrincipal, @Param('id') id: string): Promise<SyncRunSummary[]> {
    return this.designSyncService.listRuns(principal, id);
  }

  @Get('runs/:runId')
  getRun(@Principal() principal: AuthPrincipal, @Param('runId') runId: string): Promise<SyncRun> {
    return this.designSyncService.getRun(principal, runId);
  }

  /** Links a library component to its design node (designNodeId null unlinks) */
  @Put('connections/:id/links')
  setComponentLink(@Principal() principal: AuthPrincipal, @Param('id') id: string, @Body() body: SetComponentLinkDto): Promise<DesignSyncConnectionView> {
    return this.designSyncService.setComponentLink(principal, id, body);
  }

  @Get('connections/:id/versions')
  getFileVersions(@Principal() principal: AuthPrincipal, @Param('id') id: string): Promise<string[]> {
    return this.designSyncService.getFileVersions(principal, id);
  }

  /** Scheduled compares; each is recorded as a run */
  @Post('connections/:id/auto-sync')
  enableAutoSync(@Principal() principal: AuthPrincipal, @Param('id') id: string, @Body() body: EnableAutoSyncDto): Promise<DesignSyncConnectionView> {
    return this.designSyncService.enableAutoSync(principal, id, body);
  }

  @Delete('connections/:id/auto-sync')
  async disableAutoSync(@Principal() principal: AuthPrincipal, @Param('id') id: string): Promise<{ success: boolean }> {
    await this.designSyncService.disableAutoSync(principal, id);
    return { success: true };
  }
}
