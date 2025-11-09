import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ComponentScaffoldingService, ComponentScaffoldInput, GeneratedComponent, ComponentTemplate } from './component-scaffolding.service';

@Controller('api/v1/component-scaffolding')
export class ComponentScaffoldingController {
  constructor(private readonly scaffoldingService: ComponentScaffoldingService) {}

  @Get('templates')
  getTemplates(): ComponentTemplate[] {
    return this.scaffoldingService.getTemplates();
  }

  @Get('templates/:id')
  getTemplate(@Param('id') id: string): ComponentTemplate | null {
    return this.scaffoldingService.getTemplate(id);
  }

  @Post('scaffold')
  async scaffoldComponent(@Body() input: ComponentScaffoldInput): Promise<GeneratedComponent> {
    return this.scaffoldingService.scaffoldComponent(input);
  }

  @Post('create')
  async createComponent(@Body() input: ComponentScaffoldInput): Promise<{ componentId: string; success: boolean }> {
    return this.scaffoldingService.createComponentFromScaffold(input);
  }
}

