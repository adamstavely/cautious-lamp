import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { OpenReplayApiClient } from './openreplay-api.client';

export interface Project {
  id: string;
  teamId: string;
  name: string;
  description?: string;
  applicationUrl?: string;
  openreplayProjectKey: string;
  openreplayBaseUrl?: string;
  openreplayApiKey?: string; // Encrypted API key (not returned in responses)
  privacySettings?: {
    maskAllInputs?: boolean;
    maskAllText?: boolean;
    maskTextSelector?: string[];
    blockSelector?: string[];
    respectDoNotTrack?: boolean;
  };
  config?: {
    captureConsole?: boolean;
    captureNetwork?: boolean;
    captureIFrames?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  sessionId: string;
  projectId: string;
  userId?: string;
  userEmail?: string;
  userDisplayName?: string;
  startTime: Date;
  duration: number;
  pagesCount: number;
  eventsCount: number;
  errorsCount: number;
  issueScore: number;
  issueTypes: string[];
  favorite: boolean;
  viewed: boolean;
  live: boolean;
  replayUrl: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class SessionReplayService {
  private projects: Map<string, Project> = new Map();

  constructor() {
    // Initialize with mock project for testing
    this.initializeMockData();
  }

  private initializeMockData() {
    // Add a mock project for testing heatmaps
    const mockProject: Project = {
      id: 'sr-project-mock-001',
      teamId: 'default-team',
      name: 'Demo Application',
      description: 'Mock project for testing heatmaps functionality',
      applicationUrl: 'https://demo.example.com',
      openreplayProjectKey: '1',
      openreplayBaseUrl: 'https://demo.openreplay.com',
      privacySettings: {},
      config: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.projects.set(mockProject.id, mockProject);
  }

  // Project Management
  async createProject(teamId: string, dto: any): Promise<Project> {
    // Verify OpenReplay connection if API key provided
    if (dto.openreplayApiKey) {
      const openreplayBaseUrl = dto.openreplayBaseUrl || process.env.OPENREPLAY_BASE_URL || 'https://api.openreplay.com';
      const openreplayClient = new OpenReplayApiClient(openreplayBaseUrl, dto.openreplayApiKey);
      
      try {
        const isValid = await openreplayClient.verifyConnection();
        if (!isValid) {
          throw new BadRequestException('Unable to connect to OpenReplay instance. Please check your base URL and API key.');
        }
      } catch (error: any) {
        if (error instanceof BadRequestException) {
          throw error;
        }
        throw new BadRequestException(`Failed to verify OpenReplay connection: ${error.message}`);
      }
    }

    const project: Project = {
      id: `sr-project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      teamId,
      name: dto.name,
      description: dto.description,
      applicationUrl: dto.applicationUrl,
      openreplayProjectKey: dto.openreplayProjectKey,
      openreplayBaseUrl: dto.openreplayBaseUrl || process.env.OPENREPLAY_BASE_URL || 'https://api.openreplay.com',
      openreplayApiKey: dto.openreplayApiKey, // In production, this should be encrypted
      privacySettings: dto.privacySettings || {},
      config: dto.config || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.projects.set(project.id, project);
    
    // Return project without API key
    const { openreplayApiKey, ...projectWithoutKey } = project;
    return projectWithoutKey as Project;
  }

  async getProjects(teamId?: string): Promise<Project[]> {
    const allProjects = Array.from(this.projects.values());
    if (teamId) {
      return allProjects.filter(p => p.teamId === teamId).map(p => {
        const { openreplayApiKey, ...projectWithoutKey } = p;
        return projectWithoutKey as Project;
      });
    }
    return allProjects.map(p => {
      const { openreplayApiKey, ...projectWithoutKey } = p;
      return projectWithoutKey as Project;
    });
  }

  async getProject(id: string): Promise<Project> {
    const project = this.projects.get(id);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    // Return project without API key
    const { openreplayApiKey, ...projectWithoutKey } = project;
    return projectWithoutKey as Project;
  }

  async updateProject(id: string, dto: any): Promise<Project> {
    const project = this.projects.get(id);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    // If updating OpenReplay connection details, verify them
    if (dto.openreplayProjectKey || dto.openreplayApiKey || dto.openreplayBaseUrl) {
      const openreplayBaseUrl = dto.openreplayBaseUrl || project.openreplayBaseUrl || process.env.OPENREPLAY_BASE_URL || 'https://api.openreplay.com';
      const openreplayApiKey = dto.openreplayApiKey || project.openreplayApiKey;

      if (openreplayApiKey) {
        const openreplayClient = new OpenReplayApiClient(openreplayBaseUrl, openreplayApiKey);
        try {
          await openreplayClient.verifyConnection();
        } catch (error: any) {
          throw new BadRequestException(`Failed to verify OpenReplay connection: ${error.message}`);
        }
      }
    }

    const updated: Project = {
      ...project,
      ...dto,
      updatedAt: new Date(),
    };

    this.projects.set(id, updated);
    
    // Return project without API key
    const { openreplayApiKey, ...projectWithoutKey } = updated;
    return projectWithoutKey as Project;
  }

  async deleteProject(id: string): Promise<void> {
    if (!this.projects.has(id)) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    this.projects.delete(id);
  }

  // Integration Code Generation
  async getIntegrationCode(projectId: string): Promise<string> {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const openreplayClient = new OpenReplayApiClient(
      project.openreplayBaseUrl || 'https://api.openreplay.com',
      project.openreplayApiKey || ''
    );

    return openreplayClient.getIntegrationCode(
      project.openreplayProjectKey,
      project.openreplayBaseUrl,
      {
        privacySettings: project.privacySettings,
        config: project.config,
      }
    );
  }

  // Session Management
  async searchSessions(
    projectId: string,
    params: {
      startDate?: string;
      endDate?: string;
      userId?: string;
      userEmail?: string;
      issueType?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ sessions: Session[]; total: number }> {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // If no API key is configured, return mock sessions for development/demo purposes
    if (!project.openreplayApiKey || (typeof project.openreplayApiKey === 'string' && project.openreplayApiKey.trim() === '')) {
      const mockSessions: Session[] = [
        {
          sessionId: 'mock-session-001',
          projectId,
          userId: 'user-123',
          userEmail: 'user@example.com',
          userDisplayName: 'Demo User',
          startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          duration: 1250,
          pagesCount: 5,
          eventsCount: 342,
          errorsCount: 0,
          issueScore: 0,
          issueTypes: [],
          favorite: false,
          viewed: false,
          live: false,
          replayUrl: `${project.openreplayBaseUrl || 'https://demo.openreplay.com'}/project/${project.openreplayProjectKey || '1'}/session/mock-session-001`,
          metadata: {},
        },
        {
          sessionId: 'mock-session-002',
          projectId,
          userId: 'user-456',
          userEmail: 'another@example.com',
          userDisplayName: 'Another User',
          startTime: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
          duration: 890,
          pagesCount: 3,
          eventsCount: 198,
          errorsCount: 2,
          issueScore: 45,
          issueTypes: ['js_error', 'network_error'],
          favorite: true,
          viewed: true,
          live: false,
          replayUrl: `${project.openreplayBaseUrl || 'https://demo.openreplay.com'}/project/${project.openreplayProjectKey || '1'}/session/mock-session-002`,
          metadata: {},
        },
        {
          sessionId: 'mock-session-003',
          projectId,
          userId: 'user-789',
          userEmail: 'test@example.com',
          userDisplayName: 'Test User',
          startTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          duration: 2100,
          pagesCount: 8,
          eventsCount: 567,
          errorsCount: 1,
          issueScore: 12,
          issueTypes: ['js_error'],
          favorite: false,
          viewed: false,
          live: false,
          replayUrl: `${project.openreplayBaseUrl || 'https://demo.openreplay.com'}/project/${project.openreplayProjectKey || '1'}/session/mock-session-003`,
          metadata: {},
        },
      ];

      // Apply filters if provided
      let filteredSessions = mockSessions;
      if (params.userEmail) {
        filteredSessions = filteredSessions.filter(s => 
          s.userEmail?.toLowerCase().includes(params.userEmail!.toLowerCase())
        );
      }
      if (params.userId) {
        filteredSessions = filteredSessions.filter(s => 
          s.userId?.toLowerCase().includes(params.userId!.toLowerCase())
        );
      }
      if (params.issueType) {
        filteredSessions = filteredSessions.filter(s => 
          s.issueTypes?.includes(params.issueType!)
        );
      }

      // Apply pagination
      const limit = params.limit || 50;
      const offset = params.offset || 0;
      const paginatedSessions = filteredSessions.slice(offset, offset + limit);

      return {
        sessions: paginatedSessions,
        total: filteredSessions.length,
      };
    }

    const openreplayBaseUrl = project.openreplayBaseUrl || process.env.OPENREPLAY_BASE_URL || 'https://api.openreplay.com';
    const openreplayClient = new OpenReplayApiClient(openreplayBaseUrl, project.openreplayApiKey);

    try {
      // Parse project key to get numeric project ID (OpenReplay uses numeric IDs)
      // In a real implementation, you'd need to map project keys to numeric IDs
      const numericProjectId = parseInt(project.openreplayProjectKey) || 1;

      const result = await openreplayClient.searchSessions({
        projectId: numericProjectId,
        ...params,
      });

      // Map OpenReplay sessions to our Session format
      const sessions: Session[] = result.sessions.map(s => ({
        sessionId: s.sessionId,
        projectId,
        userId: s.userId,
        userEmail: s.userEmail,
        userDisplayName: s.userDisplayName,
        startTime: new Date(s.startTs),
        duration: s.duration,
        pagesCount: s.pagesCount,
        eventsCount: s.eventsCount,
        errorsCount: s.errorsCount,
        issueScore: s.issueScore,
        issueTypes: s.issueTypes,
        favorite: s.favorite,
        viewed: s.viewed,
        live: s.live,
        replayUrl: openreplayClient.getSessionReplayUrl(numericProjectId, s.sessionId),
        metadata: s.metadata,
      }));

      return {
        sessions,
        total: result.total,
      };
    } catch (error: any) {
      throw new BadRequestException(`Failed to search sessions: ${error.message}`);
    }
  }

  async getSession(projectId: string, sessionId: string): Promise<Session> {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // If no API key is configured, return mock session for development/demo purposes
    if (!project.openreplayApiKey || (typeof project.openreplayApiKey === 'string' && project.openreplayApiKey.trim() === '')) {
      // Find the mock session by ID or return a default one
      const mockSessions = [
        {
          sessionId: 'mock-session-001',
          projectId,
          userId: 'user-123',
          userEmail: 'user@example.com',
          userDisplayName: 'Demo User',
          startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
          duration: 1250,
          pagesCount: 5,
          eventsCount: 342,
          errorsCount: 0,
          issueScore: 0,
          issueTypes: [],
          favorite: false,
          viewed: false,
          live: false,
          replayUrl: `${project.openreplayBaseUrl || 'https://demo.openreplay.com'}/project/${project.openreplayProjectKey || '1'}/session/mock-session-001`,
          metadata: {},
        },
        {
          sessionId: 'mock-session-002',
          projectId,
          userId: 'user-456',
          userEmail: 'another@example.com',
          userDisplayName: 'Another User',
          startTime: new Date(Date.now() - 5 * 60 * 60 * 1000),
          duration: 890,
          pagesCount: 3,
          eventsCount: 198,
          errorsCount: 2,
          issueScore: 45,
          issueTypes: ['js_error', 'network_error'],
          favorite: true,
          viewed: true,
          live: false,
          replayUrl: `${project.openreplayBaseUrl || 'https://demo.openreplay.com'}/project/${project.openreplayProjectKey || '1'}/session/mock-session-002`,
          metadata: {},
        },
        {
          sessionId: 'mock-session-003',
          projectId,
          userId: 'user-789',
          userEmail: 'test@example.com',
          userDisplayName: 'Test User',
          startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
          duration: 2100,
          pagesCount: 8,
          eventsCount: 567,
          errorsCount: 1,
          issueScore: 12,
          issueTypes: ['js_error'],
          favorite: false,
          viewed: false,
          live: false,
          replayUrl: `${project.openreplayBaseUrl || 'https://demo.openreplay.com'}/project/${project.openreplayProjectKey || '1'}/session/mock-session-003`,
          metadata: {},
        },
      ];

      const mockSession = mockSessions.find(s => s.sessionId === sessionId) || mockSessions[0];
      return mockSession;
    }

    const openreplayBaseUrl = project.openreplayBaseUrl || process.env.OPENREPLAY_BASE_URL || 'https://api.openreplay.com';
    const openreplayClient = new OpenReplayApiClient(openreplayBaseUrl, project.openreplayApiKey);

    try {
      const numericProjectId = parseInt(project.openreplayProjectKey) || 1;
      const s = await openreplayClient.getSession(numericProjectId, sessionId);

      return {
        sessionId: s.sessionId,
        projectId,
        userId: s.userId,
        userEmail: s.userEmail,
        userDisplayName: s.userDisplayName,
        startTime: new Date(s.startTs),
        duration: s.duration,
        pagesCount: s.pagesCount,
        eventsCount: s.eventsCount,
        errorsCount: s.errorsCount,
        issueScore: s.issueScore,
        issueTypes: s.issueTypes,
        favorite: s.favorite,
        viewed: s.viewed,
        live: s.live,
        replayUrl: openreplayClient.getSessionReplayUrl(numericProjectId, s.sessionId),
        metadata: s.metadata,
      };
    } catch (error: any) {
      throw new BadRequestException(`Failed to get session: ${error.message}`);
    }
  }

  /**
   * Get heatmaps URL for a project
   */
  async getHeatmapsUrl(projectId: string, heatmapId?: string): Promise<string> {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // For development/testing: Return mock URL if no OpenReplay base URL is configured
    // or if explicitly using mock data
    const useMockData = process.env.USE_MOCK_OPENREPLAY_DATA === 'true' || 
                       !project.openreplayBaseUrl || 
                       project.openreplayBaseUrl === 'https://api.openreplay.com';

    if (useMockData) {
      // Return a mock heatmap URL pointing to our local demo page
      // In production, this would be the actual OpenReplay URL
      const mockUrl = process.env.MOCK_HEATMAP_URL || 'http://localhost:5174/mock-heatmap.html';
      
      if (heatmapId) {
        return `${mockUrl}?heatmapId=${heatmapId}`;
      }
      return mockUrl;
    }

    const openreplayBaseUrl = project.openreplayBaseUrl || process.env.OPENREPLAY_BASE_URL || 'https://api.openreplay.com';
    const openreplayClient = new OpenReplayApiClient(openreplayBaseUrl, project.openreplayApiKey || '');
    
    const numericProjectId = parseInt(project.openreplayProjectKey) || 1;
    return openreplayClient.getHeatmapUrl(numericProjectId, heatmapId);
  }
}

