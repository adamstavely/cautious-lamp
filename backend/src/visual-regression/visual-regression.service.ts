import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ArgosApiClient } from './argos-api.client';

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

  // Project Management
  async createProject(teamId: string, dto: any): Promise<Project> {
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
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to verify Argos project: ${error.message}`);
    }

    const project: Project = {
      id: `vr-project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      teamId,
      name: dto.name,
      description: dto.description,
      argosProjectId: dto.argosProjectId,
      argosBaseUrl,
      argosBranch: dto.argosBranch || 'main',
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

  async updateProject(id: string, dto: any): Promise<Project> {
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
        } catch (error: any) {
          throw new BadRequestException(`Failed to verify Argos connection: ${error.message}`);
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
  async triggerTest(projectId: string, userId: string, dto: any): Promise<TestRun> {
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

      // Poll for build completion in background
      this.pollBuildStatus(testRun.id, project, argosClient);

      return testRun;
    } catch (error: any) {
      throw new BadRequestException(`Failed to trigger Argos test: ${error.message}`);
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
        } else {
          // Still running, poll again
          attempts++;
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

  private async fetchBuildResults(
    runId: string,
    project: Project,
    argosClient: ArgosApiClient,
    build: any
  ): Promise<void> {
    try {
      const screenshots = await argosClient.getBuildScreenshots(project.argosProjectId, build.id);
      
      const results: TestResult[] = screenshots.map((screenshot: any) => ({
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

  async getTestRuns(projectId: string): Promise<TestRun[]> {
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

    return Array.from(this.testRuns.values())
      .filter(run => run.projectId === projectId)
      .sort((a, b) => (b.startedAt?.getTime() || 0) - (a.startedAt?.getTime() || 0));
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
  async getTestResults(runId: string): Promise<TestResult[]> {
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

    const results = this.testResults.get(runId);
    if (!results) {
      return [];
    }
    return results;
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
    } catch (error: any) {
      throw new BadRequestException(`Failed to reject in Argos: ${error.message}`);
    }
  }
}

