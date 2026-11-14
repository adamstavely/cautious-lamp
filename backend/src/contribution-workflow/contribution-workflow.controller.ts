import { Controller, Get, Post, Body, Param, Query, BadRequestException } from '@nestjs/common';
import { ContributionWorkflowService, ContributionGuideline, ContributionTemplate, ContributionCheck } from './contribution-workflow.service';
import { RequirePermission } from '../auth/principal';
import { Permission } from '../rbac/rbac.service';

const GUIDELINE_CATEGORIES: ReadonlyArray<string> = ['component', 'token', 'pattern', 'documentation', 'bug-fix', 'enhancement'];
const CHECK_CATEGORIES: ReadonlyArray<string> = ['linting', 'formatting', 'testing', 'documentation', 'accessibility', 'performance'];

/** Lists sort on these fields, so nothing is stored without them */
function assertFields(data: Record<string, unknown> | undefined, strings: string[], category: { allowed: ReadonlyArray<string> }): void {
  if (!data || typeof data !== 'object') throw new BadRequestException('A body is required');
  for (const field of strings) {
    const value = data[field];
    if (typeof value !== 'string' || !value.trim()) throw new BadRequestException(`${field} is required`);
  }
  if (!category.allowed.includes(data.category as string)) {
    throw new BadRequestException(`category must be one of ${category.allowed.join(', ')}`);
  }
}

@Controller('contribution-workflow')
export class ContributionWorkflowController {
  constructor(
    private readonly contributionService: ContributionWorkflowService,
  ) {}

  // ==================== Guidelines ====================

  @Get('guidelines')
  getGuidelines(
    @Query('category') category?: string,
  ) {
    return this.contributionService.getAllGuidelines(category as ContributionGuideline['category']);
  }

  @Get('guidelines/:id')
  getGuideline(
    @Param('id') id: string,
  ) {
    const guideline = this.contributionService.getGuideline(id);
    if (!guideline) {
      throw new BadRequestException(`Guideline '${id}' not found`);
    }
    return guideline;
  }

  @Post('guidelines')
  @RequirePermission(Permission.COMPONENT_APPROVE)
  createGuideline(
    @Body() data: {
      title: string;
      description: string;
      category: ContributionGuideline['category'];
      content: string;
      checklist: string[];
      codeExamples?: ContributionGuideline['codeExamples'];
    },
  ) {
    assertFields(data, ['title', 'description', 'content'], { allowed: GUIDELINE_CATEGORIES });
    if (data.checklist !== undefined && (!Array.isArray(data.checklist) || data.checklist.some((item) => typeof item !== 'string'))) {
      throw new BadRequestException('checklist must be a list of strings');
    }
    return this.contributionService.createGuideline({ ...data, checklist: data.checklist ?? [] });
  }

  // ==================== Templates ====================

  @Get('templates')
  getTemplates(
    @Query('category') category?: string,
  ) {
    return this.contributionService.getAllTemplates(category as ContributionTemplate['category']);
  }

  @Get('templates/:id')
  getTemplate(
    @Param('id') id: string,
  ) {
    const template = this.contributionService.getTemplate(id);
    if (!template) {
      throw new BadRequestException(`Template '${id}' not found`);
    }
    return template;
  }

  @Post('templates')
  @RequirePermission(Permission.COMPONENT_APPROVE)
  createTemplate(
    @Body() data: {
      name: string;
      description: string;
      category: ContributionTemplate['category'];
      template: ContributionTemplate['template'];
    },
  ) {
    assertFields(data, ['name', 'description'], { allowed: GUIDELINE_CATEGORIES });
    if (!data.template || typeof data.template !== 'object') throw new BadRequestException('template is required');
    return this.contributionService.createTemplate(data);
  }

  @Post('templates/:id/generate-pr')
  @RequirePermission(Permission.COMPONENT_CREATE)
  generatePRTemplate(
    @Param('id') id: string,
    @Body() data: {
      title?: string;
      description?: string;
      checklistItems?: string[];
    },
  ) {
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
  ) {
    return this.contributionService.getAllChecks(
      category as ContributionCheck['category'],
      enabledOnly === 'true'
    );
  }

  @Get('checks/:id')
  getCheck(
    @Param('id') id: string,
  ) {
    const check = this.contributionService.getCheck(id);
    if (!check) {
      throw new BadRequestException(`Check '${id}' not found`);
    }
    return check;
  }

  @Post('checks')
  @RequirePermission(Permission.COMPONENT_APPROVE)
  createCheck(
    @Body() data: {
      name: string;
      description: string;
      category: ContributionCheck['category'];
      enabled: boolean;
      command?: string;
      config?: Record<string, any>;
    },
  ) {
    assertFields(data, ['name', 'description'], { allowed: CHECK_CATEGORIES });
    if (typeof data.enabled !== 'boolean') throw new BadRequestException('enabled must be true or false');
    return this.contributionService.createCheck(data);
  }

  @Post('checks/run')
  @RequirePermission(Permission.COMPONENT_CREATE)
  runAutomatedChecks() {
    return this.contributionService.runAutomatedChecks();
  }
}
