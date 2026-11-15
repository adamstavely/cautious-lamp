import { Controller, Get, Post, Body, Param, NotFoundException, UseGuards } from '@nestjs/common';
import {
  ComponentScaffoldingService,
  ComponentScaffoldInput,
  GeneratedComponent,
  ComponentTemplate,
  CreatedComponentResult,
} from './component-scaffolding.service';
import { ApiKeyGuard } from '../common/security/api-key.guard';
import { RequirePermission } from '../auth/principal';
import { Permission } from '../rbac/rbac.service';

@Controller('api/v1/component-scaffolding')
@UseGuards(ApiKeyGuard)
export class ComponentScaffoldingController {
  constructor(private readonly scaffoldingService: ComponentScaffoldingService) {}

  @Get('templates')
  getTemplates(): ComponentTemplate[] {
    return this.scaffoldingService.getTemplates();
  }

  @Get('templates/:id')
  getTemplate(@Param('id') id: string): ComponentTemplate {
    const template = this.scaffoldingService.getTemplate(id);
    if (!template) {
      throw new NotFoundException(`Template '${id}' not found`);
    }
    return template;
  }

  @Post('scaffold')
  async scaffoldComponent(@Body() input: ComponentScaffoldInput): Promise<GeneratedComponent> {
    return this.scaffoldingService.scaffoldComponent(input);
  }

  // Registers a design-system component, so it needs the same permission as POST /components
  @RequirePermission(Permission.COMPONENT_CREATE)
  @Post('create')
  async createComponent(@Body() input: ComponentScaffoldInput): Promise<CreatedComponentResult> {
    return this.scaffoldingService.createComponentFromScaffold(input);
  }
}
