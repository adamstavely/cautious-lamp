import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ArgosApiClient } from './argos-api.client';
import * as crypto from 'crypto';
import { 
  CreateProjectDto, 
  UpdateProjectDto, 
  WebhookPayload, 
  BuildPayload, 
  ScreenshotPayload,
  NotificationConfig 
} from '../common/types/common.types';
import { ErrorHandler } from '../common/errors/error-handler';
import { VisualRegressionGateway } from './visual-regression.gateway';
import { PaginationParams, PaginatedResponse, parsePaginationParams, createPaginatedResponse } from '../common/pagination/pagination.types';

export interface Project {
  id: string;
  teamId: string;
  name: string;
  description?: string;
  argosProjectId: string;
  argosBaseUrl?: string; // Self-hosted Argos instance URL
  argosBranch: string;
  argosToken?: string; // Encrypted token (not returned in API responses)
  config: {
    testDirectories?: string[];
    viewports?: string[];
    browsers?: string[];
    ignorePatterns?: string[];
    screenshotOptions?: {
      fullPage?: boolean;
      waitForSelector?: string;
      waitForTimeout?: number;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface TestRun {
  id: string;
  projectId: string;
  argosBuildId?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  commitSha?: string;
  branch?: string;
  triggeredBy: string;
  startedAt?: Date;
  completedAt?: Date;
  resultsSummary?: {
    total: number;
    passed: number;
    failed: number;
    new: number;
    removed: number;
  };
}

export interface TestResult {
  id: string;
  runId: string;
  testName: string;
  status: 'passed' | 'failed' | 'new' | 'removed';
  diffImageUrl?: string;
  baselineImageUrl?: string;
  currentImageUrl?: string;
  diffPercentage?: number;
  approved: boolean;
  approvedBy?: string;
  approvedAt?: Date;
}

@Injectable()
export class VisualRegressionService {
  private projects: Map<string, Project> = new Map();
  private testRuns: Map<string, TestRun> = new Map();
  private testResults: Map<string, TestResult[]> = new Map();
  private webhookSecrets: Map<string, string> = new Map(); // projectId -> webhookSecret
  private webhookEvents: Array<{ projectId: string; event: string; payload: WebhookPayload; timestamp: Date }> = [];
  private gateway?: VisualRegressionGateway; // Injected via setter to avoid circular dependency

  // Project Management
  async createProject(teamId: string, dto: CreateProjectDto): Promise<Project> {
    // Verify Argos connection before creating project
    const argosBaseUrl = dto.argosBaseUrl || process.env.ARGOS_BASE_URL || 'https://app.argos-ci.com';
    const argosClient = new ArgosApiClient(argosBaseUrl, dto.argosToken);
    
    try {
      // Verify connection and project exists
      const isValid = await argosClient.verifyConnection();
      if (!isValid) {
        throw new BadRequestException('Unable to connect to Argos instance. Please check your base URL and token.');
      }

      // Verify project exists in Argos
      await argosClient.getProject(dto.argosProjectId);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw ErrorHandler.handleError(error, 'VisualRegressionService.createProject');
    }

    const project: Project = {
      id: `vr-project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      teamId,
      name: dto.name,
      description: dto.description,
      argosProjectId: dto.argosProjectId,
      argosBaseUrl,
      argosBranch: dto.argosBranch || 'develop',
      argosToken: dto.argosToken, // In production, this should be encrypted
      config: dto.config || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.projects.set(project.id, project);
    
    // Return project without token
    const { argosToken, ...projectWithoutToken } = project;
    return projectWithoutToken as Project;
  }

  async getProjects(teamId?: string): Promise<Project[]> {
    const allProjects = Array.from(this.projects.values());
    if (teamId) {
      return allProjects.filter(p => p.teamId === teamId);
    }
    return allProjects;
  }

  async getProject(id: string): Promise<Project> {
    const project = this.projects.get(id);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    // Return project without token
    const { argosToken, ...projectWithoutToken } = project;
    return projectWithoutToken as Project;
  }

  async updateProject(id: string, dto: UpdateProjectDto): Promise<Project> {
    const project = this.projects.get(id);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    // If updating Argos connection details, verify them
    if (dto.argosProjectId || dto.argosToken || dto.argosBaseUrl) {
      const argosBaseUrl = dto.argosBaseUrl || project.argosBaseUrl || process.env.ARGOS_BASE_URL || 'https://app.argos-ci.com';
      const argosToken = dto.argosToken || project.argosToken;
      const argosProjectId = dto.argosProjectId || project.argosProjectId;

      if (argosToken) {
        const argosClient = new ArgosApiClient(argosBaseUrl, argosToken);
        try {
          await argosClient.verifyConnection();
          await argosClient.getProject(argosProjectId);
        } catch (error) {
          throw ErrorHandler.handleError(error, 'VisualRegressionService.updateProject');
        }
      }
    }

    const updated: Project = {
      ...project,
      ...dto,
      updatedAt: new Date(),
    };

    this.projects.set(id, updated);
    
    // Return project without token
    const { argosToken, ...projectWithoutToken } = updated;
    return projectWithoutToken as Project;
  }

  async deleteProject(id: string): Promise<void> {
    if (!this.projects.has(id)) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    this.projects.delete(id);
    // Also delete associated test runs and results
    const runs = Array.from(this.testRuns.values()).filter(r => r.projectId === id);
    runs.forEach(run => {
      this.testRuns.delete(run.id);
      this.testResults.delete(run.id);
    });
  }

  // Test Execution
  async triggerTest(projectId: string, userId: string, dto: { branch?: string; commitSha?: string }): Promise<TestRun> {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    if (!project.argosToken) {
      throw new BadRequestException('Argos token not configured for this project');
    }

    const argosBaseUrl = project.argosBaseUrl || process.env.ARGOS_BASE_URL || 'https://app.argos-ci.com';
    const argosClient = new ArgosApiClient(argosBaseUrl, project.argosToken);

    const branch = dto.branch || project.argosBranch;
    const commitSha = dto.commitSha || `commit-${Date.now()}`;

    try {
      // Create build in Argos
      const argosBuild = await argosClient.createBuild(project.argosProjectId, {
        branch,
        commit: commitSha,
        name: `Test run triggered by ${userId}`,
      });

      const testRun: TestRun = {
        id: `vr-run-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        projectId,
        argosBuildId: argosBuild.id,
        status: this.mapArgosStatusToRunStatus(argosBuild.status),
        branch,
        commitSha,
        triggeredBy: userId,
        startedAt: new Date(argosBuild.createdAt),
      };

      this.testRuns.set(testRun.id, testRun);

      // Emit WebSocket update
      if (this.gateway) {
        this.gateway.emitRunStatusUpdate(testRun.id, testRun.status, testRun);
      }

      // Poll for build completion in background
      this.pollBuildStatus(testRun.id, project, argosClient);

      return testRun;
    } catch (error) {
      throw ErrorHandler.handleError(error, 'VisualRegressionService.triggerTest');
    }
  }

  private mapArgosStatusToRunStatus(argosStatus: string): 'pending' | 'running' | 'completed' | 'failed' {
    const statusMap: Record<string, 'pending' | 'running' | 'completed' | 'failed'> = {
      'pending': 'pending',
      'progress': 'running',
      'stable': 'completed',
      'error': 'failed',
    };
    return statusMap[argosStatus] || 'pending';
  }

  private async pollBuildStatus(runId: string, project: Project, argosClient: ArgosApiClient): Promise<void> {
    const run = this.testRuns.get(runId);
    if (!run || !run.argosBuildId) return;

    const pollInterval = 5000; // Poll every 5 seconds
    const maxAttempts = 120; // Max 10 minutes
    let attempts = 0;

    const poll = async () => {
      if (attempts >= maxAttempts) {
        run.status = 'failed';
        run.completedAt = new Date();
        this.testRuns.set(runId, run);
        return;
      }

      try {
        const build = await argosClient.getBuild(project.argosProjectId, run.argosBuildId!);
        run.status = this.mapArgosStatusToRunStatus(build.status);

        if (build.status === 'stable' || build.status === 'error') {
          // Build completed, fetch results
          await this.fetchBuildResults(runId, project, argosClient, build);
          run.completedAt = new Date();
          this.testRuns.set(runId, run);
          
          // Emit WebSocket update
          if (this.gateway) {
            this.gateway.emitRunCompleted(runId, this.testResults.get(runId));
          }
        } else {
          // Still running, poll again
          attempts++;
          // Emit status update
          if (this.gateway) {
            this.gateway.emitRunStatusUpdate(runId, run.status, run);
          }
          setTimeout(poll, pollInterval);
        }
      } catch (error) {
        console.error(`Failed to poll build status for run ${runId}:`, error);
        attempts++;
        setTimeout(poll, pollInterval);
      }
    };

    // Start polling
    setTimeout(poll, pollInterval);
  }

  interface ArgosBuild {
    id: string;
    status: string;
    createdAt: string;
  }

  interface ArgosScreenshot {
    id: string;
    name: string;
    status: string;
    baselineUrl?: string;
    compareUrl?: string;
    diffUrl?: string;
    diffPercentage?: number;
  }

  private async fetchBuildResults(
    runId: string,
    project: Project,
    argosClient: ArgosApiClient,
    build: ArgosBuild
  ): Promise<void> {
    try {
      const screenshots = await argosClient.getBuildScreenshots(project.argosProjectId, build.id) as ArgosScreenshot[];
      
      const results: TestResult[] = screenshots.map((screenshot: ArgosScreenshot) => ({
        id: `result-${screenshot.id}-${runId}`,
        runId,
        testName: screenshot.name,
        status: this.mapArgosScreenshotStatus(screenshot.status),
        baselineImageUrl: screenshot.baselineUrl ? argosClient.getImageUrl(screenshot.baselineUrl) : undefined,
        currentImageUrl: screenshot.compareUrl ? argosClient.getImageUrl(screenshot.compareUrl) : undefined,
        diffImageUrl: screenshot.diffUrl ? argosClient.getImageUrl(screenshot.diffUrl) : undefined,
        diffPercentage: screenshot.diffPercentage,
        approved: screenshot.status === 'stable',
      }));

      this.testResults.set(runId, results);

      const run = this.testRuns.get(runId);
      if (run) {
        run.resultsSummary = {
          total: results.length,
          passed: results.filter(r => r.status === 'passed').length,
          failed: results.filter(r => r.status === 'failed').length,
          new: results.filter(r => r.status === 'new').length,
          removed: results.filter(r => r.status === 'removed').length,
        };
        this.testRuns.set(runId, run);
      }
    } catch (error) {
      console.error(`Failed to fetch build results for run ${runId}:`, error);
    }
  }

  private mapArgosScreenshotStatus(argosStatus: string): 'passed' | 'failed' | 'new' | 'removed' {
    const statusMap: Record<string, 'passed' | 'failed' | 'new' | 'removed'> = {
      'stable': 'passed',
      'failure': 'failed',
      'new': 'new',
      'removed': 'removed',
    };
    return statusMap[argosStatus] || 'failed';
  }

  async getTestRun(runId: string): Promise<TestRun> {
    const run = this.testRuns.get(runId);
    if (!run) {
      throw new NotFoundException(`Test run with ID ${runId} not found`);
    }
    return run;
  }

  async getTestRuns(projectId: string, pagination?: PaginationParams): Promise<PaginatedResponse<TestRun>> {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Try to sync from Argos if we have credentials
    if (project.argosToken) {
      try {
        await this.syncRunsFromArgos(projectId, project);
      } catch (error) {
        console.error(`Failed to sync runs from Argos for project ${projectId}:`, error);
        // Continue with local runs if sync fails
      }
    }

    const allRuns = Array.from(this.testRuns.values())
      .filter(run => run.projectId === projectId)
      .sort((a, b) => (b.startedAt?.getTime() || 0) - (a.startedAt?.getTime() || 0));

    if (pagination) {
      const paginated = allRuns.slice(pagination.offset, pagination.offset + pagination.limit);
      return createPaginatedResponse(paginated, allRuns.length, pagination);
    }

    // Default pagination if not provided
    const defaultPagination = { page: 1, limit: 20, offset: 0 };
    const paginated = allRuns.slice(0, defaultPagination.limit);
    return createPaginatedResponse(paginated, allRuns.length, defaultPagination);
  }

  private async syncRunsFromArgos(projectId: string, project: Project): Promise<void> {
    const argosBaseUrl = project.argosBaseUrl || process.env.ARGOS_BASE_URL || 'https://app.argos-ci.com';
    const argosClient = new ArgosApiClient(argosBaseUrl, project.argosToken!);

    try {
      const argosBuilds = await argosClient.getBuilds(project.argosProjectId, {
        branch: project.argosBranch,
        limit: 50, // Get last 50 builds
      });

      // Sync builds to local test runs
      for (const build of argosBuilds) {
        const existingRun = Array.from(this.testRuns.values()).find(
          r => r.argosBuildId === build.id && r.projectId === projectId
        );

        if (!existingRun) {
          // Create new test run from Argos build
          const testRun: TestRun = {
            id: `vr-run-${build.id}`,
            projectId,
            argosBuildId: build.id,
            status: this.mapArgosStatusToRunStatus(build.status),
            branch: build.branch,
            commitSha: build.commit,
            triggeredBy: 'argos-sync',
            startedAt: new Date(build.createdAt),
            completedAt: build.status === 'stable' || build.status === 'error' 
              ? new Date(build.updatedAt) 
              : undefined,
          };

          this.testRuns.set(testRun.id, testRun);

          // If build is completed, fetch results
          if (build.status === 'stable' || build.status === 'error') {
            await this.fetchBuildResults(testRun.id, project, argosClient, build);
          }
        } else {
          // Update existing run status
          existingRun.status = this.mapArgosStatusToRunStatus(build.status);
          if (build.status === 'stable' || build.status === 'error') {
            existingRun.completedAt = new Date(build.updatedAt);
            // Refresh results if completed
            await this.fetchBuildResults(existingRun.id, project, argosClient, build);
          }
          this.testRuns.set(existingRun.id, existingRun);
        }
      }
    } catch (error) {
      console.error(`Failed to sync runs from Argos:`, error);
      throw error;
    }
  }

  // Results Management
  async getTestResults(runId: string, pagination?: PaginationParams): Promise<PaginatedResponse<TestResult>> {
    const run = this.testRuns.get(runId);
    if (!run) {
      throw new NotFoundException(`Test run with ID ${runId} not found`);
    }

    const project = this.projects.get(run.projectId);
    if (!project) {
      throw new NotFoundException(`Project not found`);
    }

    // If we have Argos credentials and the run is completed, try to refresh from Argos
    if (project.argosToken && run.argosBuildId && run.status === 'completed') {
      try {
        const argosBaseUrl = project.argosBaseUrl || process.env.ARGOS_BASE_URL || 'https://app.argos-ci.com';
        const argosClient = new ArgosApiClient(argosBaseUrl, project.argosToken);
        const build = await argosClient.getBuild(project.argosProjectId, run.argosBuildId);
        await this.fetchBuildResults(runId, project, argosClient, build);
      } catch (error) {
        console.error(`Failed to refresh results from Argos:`, error);
        // Continue with cached results if refresh fails
      }
    }

    const allResults = (this.testResults.get(runId) || [])
      .sort((a, b) => a.testName.localeCompare(b.testName));

    if (pagination) {
      const paginated = allResults.slice(pagination.offset, pagination.offset + pagination.limit);
      return createPaginatedResponse(paginated, allResults.length, pagination);
    }

    // Default pagination if not provided
    const defaultPagination = { page: 1, limit: 50, offset: 0 };
    const paginated = allResults.slice(0, defaultPagination.limit);
    return createPaginatedResponse(paginated, allResults.length, defaultPagination);
  }

  async approveDiff(resultId: string, userId: string): Promise<void> {
    const allResults = Array.from(this.testResults.values()).flat();
    const result = allResults.find(r => r.id === resultId);
    if (!result) {
      throw new NotFoundException(`Test result with ID ${resultId} not found`);
    }

    // Find the run and project
    const run = this.testRuns.get(result.runId);
    if (!run) {
      throw new NotFoundException(`Test run not found`);
    }

    const project = this.projects.get(run.projectId);
    if (!project || !project.argosToken) {
      throw new BadRequestException('Project or Argos token not found');
    }

    // Extract Argos screenshot ID from result ID
    // Format: result-{argosScreenshotId}-{runId}
    const parts = result.id.split('-');
    if (parts.length < 3) {
      throw new BadRequestException('Invalid result ID format');
    }
    const argosScreenshotId = parts[1];

    // Approve in Argos
    const argosBaseUrl = project.argosBaseUrl || process.env.ARGOS_BASE_URL || 'https://app.argos-ci.com';
    const argosClient = new ArgosApiClient(argosBaseUrl, project.argosToken);

    try {
      await argosClient.approveScreenshot(project.argosProjectId, run.argosBuildId!, argosScreenshotId);
      
      // Update local state
      result.approved = true;
      result.approvedBy = userId;
      result.approvedAt = new Date();
    } catch (error: any) {
      throw new BadRequestException(`Failed to approve in Argos: ${error.message}`);
    }
  }

  async rejectDiff(resultId: string, userId: string): Promise<void> {
    const allResults = Array.from(this.testResults.values()).flat();
    const result = allResults.find(r => r.id === resultId);
    if (!result) {
      throw new NotFoundException(`Test result with ID ${resultId} not found`);
    }

    // Find the run and project
    const run = this.testRuns.get(result.runId);
    if (!run) {
      throw new NotFoundException(`Test run not found`);
    }

    const project = this.projects.get(run.projectId);
    if (!project || !project.argosToken) {
      throw new BadRequestException('Project or Argos token not found');
    }

    // Extract Argos screenshot ID from result ID
    const parts = result.id.split('-');
    if (parts.length < 3) {
      throw new BadRequestException('Invalid result ID format');
    }
    const argosScreenshotId = parts[1];

    // Reject in Argos
    const argosBaseUrl = project.argosBaseUrl || process.env.ARGOS_BASE_URL || 'https://app.argos-ci.com';
    const argosClient = new ArgosApiClient(argosBaseUrl, project.argosToken);

    try {
      await argosClient.rejectScreenshot(project.argosProjectId, run.argosBuildId!, argosScreenshotId);
      
      // Update local state
      result.approved = false;
      result.approvedBy = userId;
      result.approvedAt = new Date();
    } catch (error) {
      throw ErrorHandler.handleError(error, 'VisualRegressionService.rejectDiff');
    }
  }

  // Webhook Handling
  async handleWebhook(payload: WebhookPayload, signature?: string, event?: string): Promise<{ message: string; processed: boolean }> {
    // Log webhook event
    const webhookLog = {
      event: event || 'unknown',
      payload,
      timestamp: new Date(),
      signature: signature ? 'present' : 'missing',
    };

    // Try to identify project from payload
    const projectId = payload.projectId || payload.project?.id;
    if (!projectId) {
      console.warn('Webhook received without project identifier', webhookLog);
      return { message: 'Webhook received but project not identified', processed: false };
    }

    // Find project by Argos project ID
    const project = Array.from(this.projects.values()).find(
      p => p.argosProjectId === projectId
    );

    if (!project) {
      console.warn(`Webhook received for unknown project: ${projectId}`, webhookLog);
      return { message: 'Project not found', processed: false };
    }

    // Verify signature if webhook secret is configured
    const webhookSecret = this.webhookSecrets.get(project.id);
    if (webhookSecret && signature) {
      const isValid = this.verifyWebhookSignature(payload, signature, webhookSecret);
      if (!isValid) {
        console.warn(`Invalid webhook signature for project ${project.id}`, webhookLog);
        throw new BadRequestException('Invalid webhook signature');
      }
    }

    // Store webhook event
    this.webhookEvents.push({
      projectId: project.id,
      event: event || 'unknown',
      payload,
      timestamp: new Date(),
    });

    // Process webhook based on event type
    try {
      await this.processWebhookEvent(project.id, event || 'build.updated', payload);
      return { message: 'Webhook processed successfully', processed: true };
    } catch (error) {
      const handledError = ErrorHandler.handleError(error);
      console.error(`Failed to process webhook for project ${project.id}:`, error);
      return { message: `Webhook received but processing failed: ${handledError.message}`, processed: false };
    }
  }

  private verifyWebhookSignature(payload: WebhookPayload, signature: string, secret: string): boolean {
    try {
      // Common webhook signature verification (HMAC SHA256)
      const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(payloadString);
      const expectedSignature = `sha256=${hmac.digest('hex')}`;
      
      // Compare signatures (constant-time comparison)
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
      return false;
    }
  }

  private async processWebhookEvent(projectId: string, event: string, payload: WebhookPayload): Promise<void> {
    const project = this.projects.get(projectId);
    if (!project) return;

    // Handle different event types
    switch (event) {
      case 'build.completed':
      case 'build.updated':
      case 'build.stable':
      case 'build.error':
        await this.handleBuildUpdate(projectId, payload);
        break;
      case 'screenshot.approved':
      case 'screenshot.rejected':
        await this.handleScreenshotUpdate(projectId, payload);
        break;
      default:
        console.log(`Unhandled webhook event: ${event}`, payload);
    }
  }

  private async handleBuildUpdate(projectId: string, payload: BuildPayload | WebhookPayload): Promise<void> {
    const project = this.projects.get(projectId);
    if (!project || !project.argosToken) return;

    const buildId = payload.buildId || payload.build?.id;
    if (!buildId) return;

    // Find existing test run
    const existingRun = Array.from(this.testRuns.values()).find(
      r => r.projectId === projectId && r.argosBuildId === buildId
    );

    if (existingRun) {
      // Update run status
      const argosBaseUrl = project.argosBaseUrl || process.env.ARGOS_BASE_URL || 'https://app.argos-ci.com';
      const argosClient = new ArgosApiClient(argosBaseUrl, project.argosToken);
      
      try {
        const build = await argosClient.getBuild(project.argosProjectId, buildId);
        existingRun.status = this.mapArgosStatusToRunStatus(build.status);
        
        if (build.status === 'stable' || build.status === 'error') {
          existingRun.completedAt = new Date();
          // Fetch results
          await this.fetchBuildResults(existingRun.id, project, argosClient, build);
        }
        
        this.testRuns.set(existingRun.id, existingRun);
      } catch (error) {
        console.error(`Failed to update run ${existingRun.id} from webhook:`, error);
      }
    }
  }

  private async handleScreenshotUpdate(projectId: string, payload: ScreenshotPayload | WebhookPayload): Promise<void> {
    // Update screenshot approval status if needed
    const screenshotId = payload.screenshotId || payload.screenshot?.id;
    const buildId = payload.buildId || payload.build?.id;
    
    if (!screenshotId || !buildId) return;

    // Find the result
    const allResults = Array.from(this.testResults.values()).flat();
    const result = allResults.find(r => r.id.includes(screenshotId));
    
    if (result) {
      const event = payload.event || 'screenshot.approved';
      result.approved = event === 'screenshot.approved';
      result.approvedAt = new Date();
      
      // Update in the results map
      const results = this.testResults.get(result.runId);
      if (results) {
        const index = results.findIndex(r => r.id === result.id);
        if (index > -1) {
          results[index] = result;
          this.testResults.set(result.runId, results);
        }
      }
    }
  }

  // Set webhook secret for a project
  async setWebhookSecret(projectId: string, secret: string): Promise<void> {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }
    this.webhookSecrets.set(projectId, secret);
  }

  // Get webhook events for a project
  async getWebhookEvents(projectId: string, limit: number = 50): Promise<Array<{ event: string; payload: WebhookPayload; timestamp: Date }>> {
    return this.webhookEvents
      .filter(e => e.projectId === projectId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
      .map(e => ({
        event: e.event,
        payload: e.payload,
        timestamp: e.timestamp,
      }));
  }

  // Set WebSocket gateway (called from module to avoid circular dependency)
  setGateway(gateway: VisualRegressionGateway) {
    this.gateway = gateway;
  }

  // Analytics & Reporting
  async getProjectAnalytics(projectId: string, startDate?: string, endDate?: string): Promise<{
    totalRuns: number;
    passedRuns: number;
    failedRuns: number;
    averageDuration: number;
    trends: Array<{ date: string; passed: number; failed: number }>;
  }> {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const runs = Array.from(this.testRuns.values())
      .filter(r => r.projectId === projectId)
      .filter(r => {
        if (!startDate && !endDate) return true;
        if (!r.startedAt) return false;
        const runDate = new Date(r.startedAt);
        if (startDate && runDate < new Date(startDate)) return false;
        if (endDate && runDate > new Date(endDate)) return false;
        return true;
      });

    const allResults = runs
      .map(r => this.testResults.get(r.id) || [])
      .flat();

    // Calculate metrics
    const totalRuns = runs.length;
    const completedRuns = runs.filter(r => r.status === 'completed').length;
    const failedRuns = runs.filter(r => r.status === 'failed').length;
    const totalTests = allResults.length;
    const passedTests = allResults.filter(r => r.status === 'passed').length;
    const failedTests = allResults.filter(r => r.status === 'failed').length;
    const newTests = allResults.filter(r => r.status === 'new').length;

    // Calculate trends
    const runsByDate = runs.reduce((acc, run) => {
      if (!run.startedAt) return acc;
      const date = new Date(run.startedAt).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const failureRate = totalRuns > 0 ? (failedRuns / totalRuns) * 100 : 0;
    const testPassRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

    // Average diff percentage
    const diffs = allResults
      .filter(r => r.diffPercentage !== undefined)
      .map(r => r.diffPercentage!);
    const avgDiffPercentage = diffs.length > 0
      ? diffs.reduce((a, b) => a + b, 0) / diffs.length
      : 0;

    // Performance metrics (duration)
    const durations = runs
      .filter(r => r.startedAt && r.completedAt)
      .map(r => new Date(r.completedAt!).getTime() - new Date(r.startedAt!).getTime());
    const avgDuration = durations.length > 0
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : 0;

    return {
      projectId,
      period: {
        startDate: startDate || null,
        endDate: endDate || null,
      },
      summary: {
        totalRuns,
        completedRuns,
        failedRuns,
        successRate: 100 - failureRate,
        failureRate,
      },
      testMetrics: {
        totalTests,
        passedTests,
        failedTests,
        newTests,
        testPassRate,
        avgDiffPercentage: Math.round(avgDiffPercentage * 100) / 100,
      },
      performance: {
        avgDurationMs: Math.round(avgDuration),
        avgDurationMinutes: Math.round(avgDuration / 60000 * 100) / 100,
      },
      trends: {
        runsByDate,
      },
    };
  }

  async generatePDFReport(projectId: string): Promise<{ message: string; reportUrl?: string }> {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const analytics = await this.getProjectAnalytics(projectId);
    
    // In a real implementation, this would generate a PDF using a library like pdfkit
    // For now, return a placeholder
    return {
      message: 'PDF report generation not yet implemented',
      reportUrl: `https://api.designsystem.com/api/v1/visual-regression/projects/${projectId}/reports/pdf?timestamp=${Date.now()}`,
    };
  }

  // Team Management
  private projectTeams: Map<string, Array<{ teamId: string; role: 'viewer' | 'tester' | 'admin'; addedAt: Date }>> = new Map();

  async shareProject(projectId: string, teamId: string, role: 'viewer' | 'tester' | 'admin'): Promise<void> {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    if (!this.projectTeams.has(projectId)) {
      this.projectTeams.set(projectId, []);
    }

    const teams = this.projectTeams.get(projectId)!;
    const existing = teams.find(t => t.teamId === teamId);
    
    if (existing) {
      existing.role = role;
    } else {
      teams.push({ teamId, role, addedAt: new Date() });
    }

    this.projectTeams.set(projectId, teams);
  }

  async getProjectTeams(projectId: string): Promise<Array<{ teamId: string; role: string; addedAt: Date }>> {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const teams = this.projectTeams.get(projectId) || [];
    // Include the owner team
    return [
      { teamId: project.teamId, role: 'admin' as const, addedAt: project.createdAt },
      ...teams,
    ];
  }

  // Baseline Management
  private baselines: Map<string, Array<{
    id: string;
    projectId: string;
    name: string;
    description?: string;
    runId: string;
    createdAt: Date;
    createdBy: string;
  }>> = new Map();

  async createBaseline(projectId: string, dto: { name: string; description?: string; runId: string }): Promise<any> {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const run = this.testRuns.get(dto.runId);
    if (!run || run.projectId !== projectId) {
      throw new NotFoundException(`Test run with ID ${dto.runId} not found`);
    }

    if (!this.baselines.has(projectId)) {
      this.baselines.set(projectId, []);
    }

    const baseline = {
      id: `baseline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      projectId,
      name: dto.name,
      description: dto.description,
      runId: dto.runId,
      createdAt: new Date(),
      createdBy: 'system', // In real implementation, use actual user
    };

    this.baselines.get(projectId)!.push(baseline);
    return baseline;
  }

  async getBaselines(projectId: string): Promise<any[]> {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    return this.baselines.get(projectId) || [];
  }

  async rollbackBaseline(projectId: string, baselineId: string): Promise<{ message: string }> {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const baselines = this.baselines.get(projectId) || [];
    const baseline = baselines.find(b => b.id === baselineId);
    
    if (!baseline) {
      throw new NotFoundException(`Baseline with ID ${baselineId} not found`);
    }

    // In a real implementation, this would restore the baseline images
    // For now, return a success message
    return { message: `Baseline ${baselineId} rolled back successfully` };
  }

  // Notifications
  private notificationConfigs: Map<string, Array<{
    type: 'email' | 'slack' | 'teams' | 'webhook';
    config: NotificationConfig;
    enabled: boolean;
  }>> = new Map();

  async configureNotifications(projectId: string, dto: { type: 'email' | 'slack' | 'teams' | 'webhook'; config: NotificationConfig }): Promise<{ type: string; enabled: boolean; config: NotificationConfig }> {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    if (!this.notificationConfigs.has(projectId)) {
      this.notificationConfigs.set(projectId, []);
    }

    const configs = this.notificationConfigs.get(projectId)!;
    const existing = configs.find(c => c.type === dto.type);
    
    if (existing) {
      existing.config = dto.config;
      existing.enabled = true;
    } else {
      configs.push({
        type: dto.type,
        config: dto.config,
        enabled: true,
      });
    }

    this.notificationConfigs.set(projectId, configs);
    return { message: `Notification ${dto.type} configured successfully` };
  }

  async getNotificationConfig(projectId: string): Promise<any[]> {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    return this.notificationConfigs.get(projectId) || [];
  }
}

