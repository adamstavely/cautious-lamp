import axios, { AxiosInstance } from 'axios';

export interface ArgosProject {
  id: string;
  name: string;
  repository: string;
  branch: string;
}

export interface ArgosBuild {
  id: string;
  projectId: string;
  branch: string;
  commit: string;
  status: 'pending' | 'progress' | 'stable' | 'error';
  createdAt: string;
  updatedAt: string;
  url?: string;
}

export interface ArgosScreenshot {
  id: string;
  name: string;
  status: 'stable' | 'failure' | 'new' | 'removed';
  baselineUrl?: string;
  compareUrl?: string;
  diffUrl?: string;
  width?: number;
  height?: number;
  s3Id?: string;
}

export interface ArgosBuildWithScreenshots extends ArgosBuild {
  screenshots: ArgosScreenshot[];
}

export class ArgosApiClient {
  private client: AxiosInstance;
  private baseUrl: string;
  private token: string;

  constructor(baseUrl: string, token: string) {
    // Normalize base URL (remove trailing slash)
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.token = token;

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  /**
   * Verify connection to Argos instance
   * Note: This attempts to access the API root or health endpoint
   * Adjust the endpoint based on your Argos instance configuration
   */
  async verifyConnection(): Promise<boolean> {
    try {
      // Try to access projects endpoint or health check
      // Adjust endpoint based on your Argos API structure
      const response = await this.client.get('/api/projects', {
        validateStatus: (status) => status < 500, // Accept 4xx as valid connection
      });
      // If we get a response (even 401/403), the connection works
      return true;
    } catch (error: any) {
      // Network errors mean connection failed
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        return false;
      }
      // Other errors (like 401) mean connection works but auth might be wrong
      return true;
    }
  }

  /**
   * Get project by ID
   */
  async getProject(projectId: string): Promise<ArgosProject> {
    try {
      const response = await this.client.get(`/api/projects/${projectId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(`Project ${projectId} not found in Argos`);
      }
      throw new Error(`Failed to fetch Argos project: ${error.message}`);
    }
  }

  /**
   * Create a new build (test run) in Argos
   */
  async createBuild(projectId: string, options: {
    branch: string;
    commit: string;
    name?: string;
  }): Promise<ArgosBuild> {
    try {
      const response = await this.client.post(`/api/projects/${projectId}/builds`, {
        branch: options.branch,
        commit: options.commit,
        name: options.name,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to create Argos build: ${error.message}`);
    }
  }

  /**
   * Get build by ID
   */
  async getBuild(projectId: string, buildId: string): Promise<ArgosBuildWithScreenshots> {
    try {
      const response = await this.client.get(`/api/projects/${projectId}/builds/${buildId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(`Build ${buildId} not found`);
      }
      throw new Error(`Failed to fetch Argos build: ${error.message}`);
    }
  }

  /**
   * Get all builds for a project
   */
  async getBuilds(projectId: string, options?: {
    branch?: string;
    limit?: number;
  }): Promise<ArgosBuild[]> {
    try {
      const params: any = {};
      if (options?.branch) params.branch = options.branch;
      if (options?.limit) params.limit = options.limit;

      const response = await this.client.get(`/api/projects/${projectId}/builds`, { params });
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to fetch Argos builds: ${error.message}`);
    }
  }

  /**
   * Get screenshots for a build
   */
  async getBuildScreenshots(projectId: string, buildId: string): Promise<ArgosScreenshot[]> {
    try {
      const response = await this.client.get(`/api/projects/${projectId}/builds/${buildId}/screenshots`);
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to fetch Argos screenshots: ${error.message}`);
    }
  }

  /**
   * Approve a screenshot (mark as stable)
   */
  async approveScreenshot(projectId: string, buildId: string, screenshotId: string): Promise<void> {
    try {
      await this.client.post(`/api/projects/${projectId}/builds/${buildId}/screenshots/${screenshotId}/approve`);
    } catch (error: any) {
      throw new Error(`Failed to approve Argos screenshot: ${error.message}`);
    }
  }

  /**
   * Reject a screenshot
   */
  async rejectScreenshot(projectId: string, buildId: string, screenshotId: string): Promise<void> {
    try {
      await this.client.post(`/api/projects/${projectId}/builds/${buildId}/screenshots/${screenshotId}/reject`);
    } catch (error: any) {
      throw new Error(`Failed to reject Argos screenshot: ${error.message}`);
    }
  }

  /**
   * Upload screenshot to Argos
   * Note: This is typically done by the Argos CLI, but we provide the endpoint for reference
   */
  async uploadScreenshot(
    projectId: string,
    buildId: string,
    screenshot: {
      name: string;
      file: Buffer;
      width?: number;
      height?: number;
    }
  ): Promise<ArgosScreenshot> {
    try {
      const formData = new FormData();
      formData.append('screenshot', new Blob([screenshot.file]), screenshot.name);
      if (screenshot.width) formData.append('width', screenshot.width.toString());
      if (screenshot.height) formData.append('height', screenshot.height.toString());

      const response = await this.client.post(
        `/api/projects/${projectId}/builds/${buildId}/screenshots`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to upload screenshot to Argos: ${error.message}`);
    }
  }

  /**
   * Get full image URL (handles both absolute and relative URLs)
   */
  getImageUrl(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // Relative URL - prepend base URL
    return `${this.baseUrl}${url.startsWith('/') ? url : `/${url}`}`;
  }
}

