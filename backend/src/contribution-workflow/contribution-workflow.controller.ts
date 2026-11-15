import { Controller, Get, Post, Body, Param, Query, BadRequestException } from '@nestjs/common';
import { ContributionWorkflowService, ContributionGuideline, ContributionTemplate, ContributionCheck } from './contribution-workflow.service';
import { AuthPrincipal, Principal, RequirePermission } from '../auth/principal';
import { strictBody } from '../governance/governance.dto';
import { CreateCheckDto, CreateGuidelineDto, CreateTemplateDto, GeneratePullRequestDto, RunContributionChecksDto } from './contribution-workflow.dto';
import { Permission } from '../rbac/rbac.service';

@Controller('api/v1/contribution-workflow')
export class ContributionWorkflowController {
  constructor(
    private readonly contributionService: ContributionWorkflowService,
  ) {}

  // ==================== Guidelines ====================

  @Get('guidelines')
  async getGuidelines(
    @Query('category') category?: string,
  ) {
    return this.contributionService.getAllGuidelines(category as ContributionGuideline['category']);
  }

  @Get('guidelines/:id')
  async getGuideline(
    @Param('id') id: string,
  ) {
    const guideline = await this.contributionService.getGuideline(id);
    if (!guideline) {
      throw new BadRequestException(`Guideline '${id}' not found`);
    }
    return guideline;
  }

  @Post('guidelines')
  @RequirePermission(Permission.COMPONENT_APPROVE)
  async createGuideline(@Body(strictBody()) data: CreateGuidelineDto) {
    return this.contributionService.createGuideline({ ...data, checklist: data.checklist ?? [] });
  }

  // ==================== Templates ====================

  @Get('templates')
  async getTemplates(
    @Query('category') category?: string,
  ) {
    return this.contributionService.getAllTemplates(category as ContributionTemplate['category']);
  }

  @Get('templates/:id')
  async getTemplate(
    @Param('id') id: string,
  ) {
    const template = await this.contributionService.getTemplate(id);
    if (!template) {
      throw new BadRequestException(`Template '${id}' not found`);
    }
    return template;
  }

  @Post('templates')
  @RequirePermission(Permission.COMPONENT_APPROVE)
  async createTemplate(@Body(strictBody()) data: CreateTemplateDto) {
    return this.contributionService.createTemplate(data);
  }

  /** Whether submitting a contribution opens a pull request (GitHub set up on the server), and in which repository */
  @Get('pull-requests/setup')
  getPullRequestSetup() {
    return this.contributionService.pullRequestSetup();
  }

  /**
   * The pull request text from a template. With files and GitHub set up, the
   * files are committed on a new branch and the pull request is opened.
   */
  @Post('templates/:id/generate-pr')
  @RequirePermission(Permission.COMPONENT_CREATE)
  generatePRTemplate(
    @Param('id') id: string,
    @Body(strictBody()) data: GeneratePullRequestDto,
    @Principal() principal: AuthPrincipal,
  ) {
    return this.contributionService.generatePRTemplate(id, data, principal);
  }

  // ==================== Automated Checks ====================

  @Get('checks')
  async getChecks(
    @Query('category') category?: string,
    @Query('enabledOnly') enabledOnly?: string,
  ) {
    return this.contributionService.getAllChecks(
      category as ContributionCheck['category'],
      enabledOnly === 'true'
    );
  }

  @Get('checks/:id')
  async getCheck(
    @Param('id') id: string,
  ) {
    const check = await this.contributionService.getCheck(id);
    if (!check) {
      throw new BadRequestException(`Check '${id}' not found`);
    }
    return check;
  }

  @Post('checks')
  @RequirePermission(Permission.COMPONENT_APPROVE)
  async createCheck(@Body(strictBody()) data: CreateCheckDto) {
    return this.contributionService.createCheck(data);
  }

  /** Runs the checks on the submitted code (contribution-checks.ts); nothing is stored */
  @Post('checks/run')
  @RequirePermission(Permission.COMPONENT_CREATE)
  runAutomatedChecks(@Body(strictBody()) body: RunContributionChecksDto) {
    const { checkIds, ...submission } = body;
    return this.contributionService.runAutomatedChecks(submission, checkIds);
  }
}
