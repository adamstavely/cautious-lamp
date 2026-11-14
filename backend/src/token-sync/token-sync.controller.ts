import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { AuthPrincipal, Principal } from '../auth/principal';
import { TokenSyncConnectionView, TokenSyncService } from './token-sync.service';

/**
 * Token sync connections. Each connection belongs to its creator (admin:users
 * holders see all); responses never include the credential, only `hasApiKey`.
 * Sync, conflict resolution and auto-sync answer 501: there is no design tool integration.
 */
@Controller('api/v1/token-sync')
export class TokenSyncController {
  constructor(private readonly tokenSyncService: TokenSyncService) {}

  @Get('connections')
  getConnections(@Principal() principal: AuthPrincipal): TokenSyncConnectionView[] {
    return this.tokenSyncService.getAllConnections(principal);
  }

  @Get('connections/:id')
  getConnection(@Principal() principal: AuthPrincipal, @Param('id') id: string): TokenSyncConnectionView {
    return this.tokenSyncService.getConnection(principal, id);
  }

  @Post('connections')
  createConnection(@Principal() principal: AuthPrincipal, @Body() body: unknown): TokenSyncConnectionView {
    return this.tokenSyncService.createConnection(principal, body);
  }

  @Put('connections/:id')
  updateConnection(@Principal() principal: AuthPrincipal, @Param('id') id: string, @Body() body: unknown): TokenSyncConnectionView {
    return this.tokenSyncService.updateConnection(principal, id, body);
  }

  @Delete('connections/:id')
  deleteConnection(@Principal() principal: AuthPrincipal, @Param('id') id: string): { success: boolean } {
    this.tokenSyncService.deleteConnection(principal, id);
    return { success: true };
  }

  /** 501 */
  @Post('connections/:id/sync')
  syncTokens(@Principal() principal: AuthPrincipal, @Param('id') id: string) {
    return this.tokenSyncService.syncTokens(principal, id);
  }

  /** 501 */
  @Post('connections/:id/auto-sync')
  enableAutoSync(@Principal() principal: AuthPrincipal, @Param('id') id: string) {
    return this.tokenSyncService.enableAutoSync(principal, id);
  }

  @Delete('connections/:id/auto-sync')
  disableAutoSync(@Principal() principal: AuthPrincipal, @Param('id') id: string): { success: boolean } {
    this.tokenSyncService.disableAutoSync(principal, id);
    return { success: true };
  }

  /** 501 */
  @Post('conflicts/:id/resolve')
  resolveConflict(@Param('id') id: string, @Body() body: { resolution: 'use-design-tool' | 'use-system' | 'merge' }) {
    return this.tokenSyncService.resolveConflict(id, body?.resolution);
  }
}
