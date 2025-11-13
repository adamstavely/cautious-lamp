import { Controller, Get, Post, Body, Param, Query, Headers, BadRequestException } from '@nestjs/common';
import { ContributionWorkflowService, ContributionGuideline, ContributionTemplate, ContributionCheck } from './contribution-workflow.service';

@Controller('contribution-workflow')
export class ContributionWorkflowController {
  constructor(private readonly contributionService: ContributionWorkflowService) {}

  private validateRequest(authHeader?: string): void {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new BadRequestException('Authorization header required');
    }
  }

  // ==================== Guidelines ====================

  @Get('guidelines')
  getGuidelines(
    @Query('category') category?: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.contributionService.getAllGuidelines(category as ContributionGuideline['category']);
  }

  @Get('guidelines/:id')
  getGuideline(
    @Param('id') id: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const guideline = this.contributionService.getGuideline(id);
    if (!guideline) {
      throw new BadRequestException(`Guideline '${id}' not found`);
    }
    return guideline;
  }

  @Post('guidelines')
  createGuideline(
    @Body() data: {
      title: string;
      description: string;
      category: ContributionGuideline['category'];
      content: string;
      checklist: string[];
      codeExamples?: ContributionGuideline['codeExamples'];
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.contributionService.createGuideline(data);
  }

  // ==================== Templates ====================

  @Get('templates')
  getTemplates(
    @Query('category') category?: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.contributionService.getAllTemplates(category as ContributionTemplate['category']);
  }

  @Get('templates/:id')
  getTemplate(
    @Param('id') id: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const template = this.contributionService.getTemplate(id);
    if (!template) {
      throw new BadRequestException(`Template '${id}' not found`);
    }
    return template;
  }

  @Post('templates')
  createTemplate(
    @Body() data: {
      name: string;
      description: string;
      category: ContributionTemplate['category'];
      template: ContributionTemplate['template'];
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.contributionService.createTemplate(data);
  }

  @Post('templates/:id/generate-pr')
  generatePRTemplate(
    @Param('id') id: string,
    @Body() data: {
      title?: string;
      description?: string;
      checklistItems?: string[];
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    try {
      return {
        prTemplate: this.contributionService.generatePRTemplate(id, data),
      };
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  // ==================== Automated Checks ====================

  @Get('checks')
  getChecks(
    @Query('category') category?: string,
    @Query('enabledOnly') enabledOnly?: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.contributionService.getAllChecks(
      category as ContributionCheck['category'],
      enabledOnly === 'true'
    );
  }

  @Get('checks/:id')
  getCheck(
    @Param('id') id: string,
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    const check = this.contributionService.getCheck(id);
    if (!check) {
      throw new BadRequestException(`Check '${id}' not found`);
    }
    return check;
  }

  @Post('checks')
  createCheck(
    @Body() data: {
      name: string;
      description: string;
      category: ContributionCheck['category'];
      enabled: boolean;
      command?: string;
      config?: Record<string, any>;
    },
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.contributionService.createCheck(data);
  }

  @Post('checks/run')
  runAutomatedChecks(
    @Headers('authorization') authHeader?: string,
  ) {
    this.validateRequest(authHeader);
    return this.contributionService.runAutomatedChecks();
  }
}




