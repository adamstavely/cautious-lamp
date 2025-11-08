import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, HttpCode } from '@nestjs/common';
import { VisualRegressionService } from './visual-regression.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { TriggerTestDto } from './dto/trigger-test.dto';

@Controller('api/v1/visual-regression')
export class VisualRegressionController {
  constructor(private readonly visualRegressionService: VisualRegressionService) {}

  @Get('projects')
  async getProjects(@Query('teamId') teamId?: string) {
    return this.visualRegressionService.getProjects(teamId);
  }

  @Post('projects')
  async createProject(@Body() dto: CreateProjectDto, @Request() req: any) {
    const userId = req.user?.id || 'anonymous';
    const teamId = dto.teamId || 'default-team';
    return this.visualRegressionService.createProject(teamId, dto);
  }

  @Get('projects/:id')
  async getProject(@Param('id') id: string) {
    return this.visualRegressionService.getProject(id);
  }

  @Put('projects/:id')
  async updateProject(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.visualRegressionService.updateProject(id, dto);
  }

  @Delete('projects/:id')
  async deleteProject(@Param('id') id: string) {
    await this.visualRegressionService.deleteProject(id);
    return { message: 'Project deleted successfully' };
  }

  @Post('projects/:id/runs')
  async triggerTest(
    @Param('id') projectId: string,
    @Body() dto: TriggerTestDto,
    @Request() req: any
  ) {
    const userId = req.user?.id || 'anonymous';
    return this.visualRegressionService.triggerTest(projectId, userId, dto);
  }

  @Get('projects/:id/runs')
  async getTestRuns(@Param('id') projectId: string) {
    return this.visualRegressionService.getTestRuns(projectId);
  }

  @Get('runs/:id')
  async getTestRun(@Param('id') runId: string) {
    return this.visualRegressionService.getTestRun(runId);
  }

  @Get('runs/:id/results')
  async getTestResults(@Param('id') runId: string) {
    return this.visualRegressionService.getTestResults(runId);
  }

  @Post('results/:id/approve')
  @HttpCode(200)
  async approveDiff(@Param('id') resultId: string, @Request() req: any) {
    const userId = req.user?.id || 'anonymous';
    await this.visualRegressionService.approveDiff(resultId, userId);
    return { message: 'Diff approved successfully' };
  }

  @Post('results/:id/reject')
  @HttpCode(200)
  async rejectDiff(@Param('id') resultId: string, @Request() req: any) {
    const userId = req.user?.id || 'anonymous';
    await this.visualRegressionService.rejectDiff(resultId, userId);
    return { message: 'Diff rejected successfully' };
  }

  @Post('webhooks/argos')
  @HttpCode(200)
  async handleArgosWebhook(@Body() payload: any) {
    // Handle webhooks from Argos for build status updates
    // This allows Argos to notify us when builds complete
    // Note: This is a placeholder - actual webhook handling would need to be implemented
    // based on Argos webhook payload structure
    return { message: 'Webhook received' };
  }
}
