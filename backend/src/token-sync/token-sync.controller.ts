import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { TokenSyncService, TokenSyncConnection, SyncResult, TokenConflict, TokenValidationResult } from './token-sync.service';

@Controller('api/v1/token-sync')
export class TokenSyncController {
  constructor(private readonly tokenSyncService: TokenSyncService) {}

  @Get('connections')
  getConnections(): TokenSyncConnection[] {
    return this.tokenSyncService.getAllConnections();
  }

  @Get('connections/:id')
  getConnection(@Param('id') id: string): TokenSyncConnection | null {
    return this.tokenSyncService.getConnection(id);
  }

  @Post('connections')
  createConnection(@Body() connection: Omit<TokenSyncConnection, 'id' | 'createdAt' | 'updatedAt'>): TokenSyncConnection {
    return this.tokenSyncService.createConnection(connection);
  }

  @Put('connections/:id')
  updateConnection(
    @Param('id') id: string,
    @Body() updates: Partial<TokenSyncConnection>,
  ): TokenSyncConnection | null {
    return this.tokenSyncService.updateConnection(id, updates);
  }

  @Delete('connections/:id')
  deleteConnection(@Param('id') id: string): { success: boolean } {
    const deleted = this.tokenSyncService.deleteConnection(id);
    return { success: deleted };
  }

  @Post('connections/:id/sync')
  async syncTokens(@Param('id') id: string): Promise<SyncResult> {
    return this.tokenSyncService.syncTokens(id);
  }

  @Post('connections/:id/auto-sync')
  enableAutoSync(
    @Param('id') id: string,
    @Body() body: { intervalMinutes: number },
  ): { success: boolean } {
    const success = this.tokenSyncService.enableAutoSync(id, body.intervalMinutes);
    return { success };
  }

  @Delete('connections/:id/auto-sync')
  disableAutoSync(@Param('id') id: string): { success: boolean } {
    const success = this.tokenSyncService.disableAutoSync(id);
    return { success };
  }

  @Post('conflicts/:id/resolve')
  resolveConflict(
    @Param('id') id: string,
    @Body() body: { resolution: 'use-design-tool' | 'use-system' | 'merge' },
  ): { success: boolean } {
    const success = this.tokenSyncService.resolveConflict(id, body.resolution);
    return { success };
  }
}

