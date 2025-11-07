import { Controller, Get, Post, Query, Param, Headers, Body, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { DesignSystemService } from './design-system.service';

@Controller('api/v1')
export class DesignSystemController {
  constructor(private readonly designSystemService: DesignSystemService) {}

  private extractApiKey(authHeader: string | undefined): string | null {
    if (!authHeader) return null;
    if (authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return authHeader;
  }

  private validateRequest(authHeader: string | undefined): void {
    const apiKey = this.extractApiKey(authHeader);
    if (!apiKey || !this.designSystemService.validateApiKey(apiKey)) {
      throw new UnauthorizedException('Invalid or missing API key');
    }
  }

  @Post('auth/api-keys')
  createApiKey(@Body() body: { name: string }) {
    if (!body.name) {
      throw new BadRequestException('API key name is required');
    }
    const apiKey = this.designSystemService.createApiKey(body.name);
    return { apiKey, name: body.name, createdAt: new Date() };
  }

  @Get('tokens')
  getTokens(
    @Query('category') category?: string,
    @Query('type') type?: string,
    @Query('tag') tag?: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const tokens = this.designSystemService.getAllTokens(category, type, tag);
    return { 
      tokens,
      count: tokens.length,
      filters: { category, type, tag }
    };
  }

  @Get('tokens/:name')
  getToken(
    @Param('name') name: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const token = this.designSystemService.getTokenByName(name);
    if (!token) {
      throw new BadRequestException(`Token '${name}' not found`);
    }
    return token;
  }

  @Get('tokens/category/:category')
  getTokensByCategory(
    @Param('category') category: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const tokens = this.designSystemService.getTokensByCategory(category);
    return { 
      tokens,
      category,
      count: tokens.length
    };
  }

  @Get('components')
  getComponents(
    @Query('status') status?: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const components = this.designSystemService.getAllComponents(status);
    return { 
      components,
      count: components.length,
      filters: { status }
    };
  }

  @Get('components/:id')
  getComponent(
    @Param('id') id: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const component = this.designSystemService.getComponentById(id);
    if (!component) {
      throw new BadRequestException(`Component '${id}' not found`);
    }
    return component;
  }

  @Get('components/status/:status')
  getComponentsByStatus(
    @Param('status') status: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const components = this.designSystemService.getComponentsByStatus(status);
    return { 
      components,
      status,
      count: components.length
    };
  }

  @Get('health')
  health() {
    return { 
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
  }
}
