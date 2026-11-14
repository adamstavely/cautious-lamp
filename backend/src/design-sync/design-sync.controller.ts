import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { AuthPrincipal, Principal } from '../auth/principal';
import { DesignSyncConnectionView, DesignSyncService } from './design-sync.service';

/**
 * Design sync connections. Each connection belongs to its creator (admin:users
 * holders see all); responses never include the credential, only `hasApiKey`.
 * Fetching files, syncing, code generation and auto-sync answer 501: there is
 * no Figma or Penpot integration.
 */
@Controller('api/v1/design-sync')
export class DesignSyncController {
  constructor(private readonly designSyncService: DesignSyncService) {}

  @Get('connections')
  getConnections(@Principal() principal: AuthPrincipal): DesignSyncConnectionView[] {
    return this.designSyncService.getAllConnections(principal);
  }

  @Get('connections/:id')
  getConnection(@Principal() principal: AuthPrincipal, @Param('id') id: string): DesignSyncConnectionView {
    return this.designSyncService.getConnection(principal, id);
  }

  @Post('connections')
  createConnection(@Principal() principal: AuthPrincipal, @Body() body: unknown): DesignSyncConnectionView {
    return this.designSyncService.createConnection(principal, body);
  }

  @Put('connections/:id')
  updateConnection(@Principal() principal: AuthPrincipal, @Param('id') id: string, @Body() body: unknown): DesignSyncConnectionView {
    return this.designSyncService.updateConnection(principal, id, body);
  }

  @Delete('connections/:id')
  deleteConnection(@Principal() principal: AuthPrincipal, @Param('id') id: string): { success: boolean } {
    this.designSyncService.deleteConnection(principal, id);
    return { success: true };
  }

  /** 501 */
  @Get('connections/:id/file')
  getDesignFile(@Principal() principal: AuthPrincipal, @Param('id') id: string) {
    return this.designSyncService.fetchDesignFile(principal, id);
  }

  /** 501 */
  @Post('connections/:id/sync')
  sync(@Principal() principal: AuthPrincipal, @Param('id') id: string, @Body() body: { direction?: string }) {
    return this.designSyncService.sync(principal, id, body?.direction);
  }

  /** 501 */
  @Post('components/:componentId/generate')
  generateComponentCode(@Principal() principal: AuthPrincipal, @Body() body: { connectionId?: string }) {
    return this.designSyncService.generateComponentCode(principal, String(body?.connectionId ?? ''));
  }

  @Get('connections/:id/versions')
  getFileVersions(@Principal() principal: AuthPrincipal, @Param('id') id: string): string[] {
    return this.designSyncService.getFileVersions(principal, id);
  }

  /** 501 */
  @Post('connections/:id/auto-sync')
  enableAutoSync(@Principal() principal: AuthPrincipal, @Param('id') id: string) {
    return this.designSyncService.enableAutoSync(principal, id);
  }

  @Delete('connections/:id/auto-sync')
  disableAutoSync(@Principal() principal: AuthPrincipal, @Param('id') id: string): { success: boolean } {
    this.designSyncService.disableAutoSync(principal, id);
    return { success: true };
  }
}
