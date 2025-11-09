import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { DesignSyncService, DesignSyncConnection, DesignFile, SyncResult, DesignComponent } from './design-sync.service';

@Controller('api/v1/design-sync')
export class DesignSyncController {
  constructor(private readonly designSyncService: DesignSyncService) {}

  @Get('connections')
  getConnections(): DesignSyncConnection[] {
    return this.designSyncService.getAllConnections();
  }

  @Get('connections/:id')
  getConnection(@Param('id') id: string): DesignSyncConnection | null {
    return this.designSyncService.getConnection(id);
  }

  @Post('connections')
  createConnection(@Body() connection: Omit<DesignSyncConnection, 'id' | 'createdAt' | 'updatedAt' | 'syncHistory'>): DesignSyncConnection {
    return this.designSyncService.createConnection(connection);
  }

  @Put('connections/:id')
  updateConnection(
    @Param('id') id: string,
    @Body() updates: Partial<DesignSyncConnection>,
  ): DesignSyncConnection | null {
    return this.designSyncService.updateConnection(id, updates);
  }

  @Delete('connections/:id')
  deleteConnection(@Param('id') id: string): { success: boolean } {
    const deleted = this.designSyncService.deleteConnection(id);
    return { success: deleted };
  }

  @Get('connections/:id/file')
  async getDesignFile(@Param('id') id: string): Promise<DesignFile> {
    return this.designSyncService.fetchDesignFile(id);
  }

  @Post('connections/:id/sync')
  async sync(
    @Param('id') id: string,
    @Body() body: { direction?: 'design-to-code' | 'code-to-design' | 'bidirectional' },
  ): Promise<SyncResult> {
    const connection = this.designSyncService.getConnection(id);
    if (!connection) {
      throw new Error('Connection not found');
    }

    const direction = body.direction || connection.syncDirection;

    switch (direction) {
      case 'design-to-code':
        return this.designSyncService.syncDesignToCode(id);
      case 'code-to-design':
        return this.designSyncService.syncCodeToDesign(id);
      case 'bidirectional':
        return this.designSyncService.syncBidirectional(id);
      default:
        return this.designSyncService.syncDesignToCode(id);
    }
  }

  @Post('components/:componentId/generate')
  async generateComponentCode(
    @Param('componentId') componentId: string,
    @Body() body: { framework: 'vue' | 'react' | 'html'; connectionId: string },
  ): Promise<{ code: string }> {
    const designFile = await this.designSyncService.fetchDesignFile(body.connectionId);
    const component = designFile.components.find(c => c.id === componentId);
    
    if (!component) {
      throw new Error('Component not found');
    }

    const code = await this.designSyncService.generateComponentCode(component, body.framework);
    return { code };
  }

  @Get('connections/:id/versions')
  getFileVersions(@Param('id') id: string): string[] {
    const connection = this.designSyncService.getConnection(id);
    if (!connection) {
      throw new Error('Connection not found');
    }
    return this.designSyncService.getFileVersions(connection.fileId);
  }

  @Post('connections/:id/auto-sync')
  enableAutoSync(
    @Param('id') id: string,
    @Body() body: { intervalMinutes: number },
  ): { success: boolean } {
    const success = this.designSyncService.enableAutoSync(id, body.intervalMinutes);
    return { success };
  }

  @Delete('connections/:id/auto-sync')
  disableAutoSync(@Param('id') id: string): { success: boolean } {
    const success = this.designSyncService.disableAutoSync(id);
    return { success };
  }
}

