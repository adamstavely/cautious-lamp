import axios, { AxiosInstance } from 'axios';

export interface OpenReplayProject {
  projectId: number;
  name: string;
  status: string;
  createdAt: string;
}

export interface OpenReplaySession {
  sessionId: string;
  projectId: number;
  userId?: string;
  userNumericId?: number;
  userDisplayName?: string;
  userEmail?: string;
  userAnonymousId?: string;
  platform: string;
  startTs: number;
  duration: number;
  pagesCount: number;
  eventsCount: number;
  errorsCount: number;
  issueScore: number;
  issueTypes: string[];
  metadata?: Record<string, any>;
  favorite: boolean;
  viewed: boolean;
  live: boolean;
  url: string;
}

export interface OpenReplaySessionSearchParams {
  projectId: number;
  startDate?: string;
  endDate?: string;
  userId?: string;
  userEmail?: string;
  issueType?: string;
  limit?: number;
  offset?: number;
}

export class OpenReplayApiClient {
  private client: AxiosInstance;
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    // Normalize base URL (remove trailing slash)
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.apiKey = apiKey;

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  /**
   * Verify connection to OpenReplay instance
   */
  async verifyConnection(): Promise<boolean> {
    try {
      // Try to access projects endpoint
      const response = await this.client.get('/api/v1/projects', {
        validateStatus: (status) => status < 500,
      });
      // If we get a response (even 401/403), the connection works
      return true;
    } catch (error: any) {
      // Network errors mean connection failed
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        return false;
      }
      // Other errors mean connection works but auth might be wrong
      return true;
    }
  }

  /**
   * Get project by ID
   */
  async getProject(projectId: number): Promise<OpenReplayProject> {
    try {
      const response = await this.client.get(`/api/v1/projects/${projectId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(`Project ${projectId} not found in OpenReplay`);
      }
      throw new Error(`Failed to fetch OpenReplay project: ${error.message}`);
    }
  }

  /**
   * Search sessions
   */
  async searchSessions(params: OpenReplaySessionSearchParams): Promise<{
    sessions: OpenReplaySession[];
    total: number;
  }> {
    try {
      const response = await this.client.post('/api/v1/sessions/search', params);
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to search OpenReplay sessions: ${error.message}`);
    }
  }

  /**
   * Get session by ID
   */
  async getSession(projectId: number, sessionId: string): Promise<OpenReplaySession> {
    try {
      const response = await this.client.get(`/api/v1/projects/${projectId}/sessions/${sessionId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(`Session ${sessionId} not found`);
      }
      throw new Error(`Failed to fetch OpenReplay session: ${error.message}`);
    }
  }

  /**
   * Get session replay URL
   */
  getSessionReplayUrl(projectId: number, sessionId: string): string {
    return `${this.baseUrl}/project/${projectId}/session/${sessionId}`;
  }

  /**
   * Get heatmaps page URL
   */
  getHeatmapsUrl(projectId: number): string {
    return `${this.baseUrl}/project/${projectId}/heatmaps`;
  }

  /**
   * Get specific heatmap URL (if heatmapId is provided)
   */
  getHeatmapUrl(projectId: number, heatmapId?: string): string {
    if (heatmapId) {
      return `${this.baseUrl}/project/${projectId}/heatmap/${heatmapId}`;
    }
    return `${this.baseUrl}/project/${projectId}/heatmaps`;
  }

  /**
   * Get integration code snippet
   */
  getIntegrationCode(projectKey: string, baseUrl?: string, config?: any): string {
    const ingestPoint = baseUrl ? `${baseUrl}/ingest` : 'https://api.openreplay.com/ingest';
    
    const privacySettings = config?.privacySettings || {};
    const captureSettings = config?.config || {};

    // Build configuration object
    const configObj: any = {};
    if (privacySettings.respectDoNotTrack !== false) {
      configObj.respectDoNotTrack = true;
    }
    if (privacySettings.maskAllInputs) {
      configObj.maskAllInputs = true;
    }
    if (privacySettings.maskAllText) {
      configObj.maskAllText = true;
    }
    if (privacySettings.maskTextSelector && privacySettings.maskTextSelector.length > 0) {
      configObj.maskTextSelector = privacySettings.maskTextSelector;
    }
    if (privacySettings.blockSelector && privacySettings.blockSelector.length > 0) {
      configObj.blockSelector = privacySettings.blockSelector;
    }
    if (captureSettings.captureConsole !== false) {
      configObj.captureConsole = true;
    }
    if (captureSettings.captureNetwork !== false) {
      configObj.captureNetwork = true;
    }
    if (captureSettings.captureIFrames) {
      configObj.captureIFrames = true;
    }

    const configStr = Object.keys(configObj).length > 0 
      ? `\n  window.OpenReplay.config(${JSON.stringify(configObj, null, 2)});`
      : '';

    return `<!-- OpenReplay Session Replay -->
<script>
  (function(A,s,a,y,e,r){
    r=window.OpenReplay=[e,function(y){r[e].push(y)}];
    r[e].r=+new Date;
    r[e].s=s;
    r[e].a=a;
    r[e].y=y;
  })(window,0,"${ingestPoint}","${projectKey}","openreplay");${configStr}
</script>`;
  }
}

