import axios, { AxiosInstance } from 'axios';

/**
 * Default API root. The backend (NestJS) serves the design-system routes
 * under `/api/v1`, so a custom `baseURL` must include that prefix too.
 */
export const DEFAULT_BASE_URL = 'http://localhost:3000/api/v1';

export interface Token {
  name: string;
  value: string;
  type: string;
  category: string;
  description?: string;
  tags?: string[];
}

export interface Component {
  id: string;
  name: string;
  description: string;
  status: 'production' | 'in-progress' | 'planned' | 'deprecated';
  props: ComponentProp[];
  code: {
    vue: string;
    react: string;
    html?: string;
  };
  dependencies?: string[];
  examples?: string[];
  accessibility?: {
    wcag: string;
    notes?: string;
  };
  variants?: unknown[];
  workspaceId?: string;
  sharedWith?: string[];
  isGlobal?: boolean;
}

export interface ComponentProp {
  name: string;
  type: string;
  default?: any;
  required?: boolean;
  options?: string[];
  description?: string;
}

export interface Application {
  id: string;
  name: string;
  description?: string;
  repository?: string;
  version?: string;
  designSystemVersion?: string;
  applicationUrl?: string;
  teamId?: string;
  workspaceId?: string;
  /** ISO date string (the backend's Date, JSON-serialised) */
  registeredAt: string;
  updatedAt: string;
  lastScanned?: string;
  capabilities?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface RegisterApplicationOptions {
  description?: string;
  applicationUrl?: string;
  teamId?: string;
  workspaceId?: string;
  capabilities?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface ComplianceCheck {
  id: string;
  rule: string;
  status: 'pass' | 'warning' | 'error';
  message: string;
  component?: string;
  application?: string;
  file?: string;
  line?: number;
  element?: string;
  impact?: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' | 'INFO';
}

export interface ApiKeyMetadata {
  name: string;
  [key: string]: unknown;
}

export interface DesignSystemAPIOptions {
  apiKey: string;
  baseURL?: string;
  /** Request timeout in milliseconds (default: none, axios' default). */
  timeout?: number;
}

export class DesignSystemAPI {
  private client: AxiosInstance;

  constructor(options: DesignSystemAPIOptions) {
    this.client = axios.create({
      baseURL: options.baseURL || DEFAULT_BASE_URL,
      ...(options.timeout !== undefined ? { timeout: options.timeout } : {}),
      headers: {
        Authorization: `Bearer ${options.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  // Token methods

  /** GET /tokens */
  async tokens(): Promise<{ tokens: Token[]; count: number; filters?: Record<string, string | undefined> }> {
    const response = await this.client.get('/tokens');
    return response.data;
  }

  /** GET /tokens/category/:category */
  async tokensByCategory(category: string): Promise<{ tokens: Token[]; category: string; count: number }> {
    const response = await this.client.get(`/tokens/category/${encodeURIComponent(category)}`);
    return response.data;
  }

  /** GET /tokens/:name */
  async token(name: string): Promise<Token> {
    const response = await this.client.get(`/tokens/${encodeURIComponent(name)}`);
    return response.data;
  }

  /** GET /tokens?category=&type=&tag= */
  async tokensFiltered(filters: { category?: string; type?: string; tag?: string }): Promise<{ tokens: Token[]; count: number; filters: Record<string, string | undefined> }> {
    const params: Record<string, string> = {};
    if (filters.category) params.category = filters.category;
    if (filters.type) params.type = filters.type;
    if (filters.tag) params.tag = filters.tag;
    const response = await this.client.get('/tokens', { params });
    return response.data;
  }

  // Component methods

  /** GET /components[?status=] */
  async components(status?: string): Promise<{ components: Component[]; count: number; filters?: Record<string, string | undefined> }> {
    const response = status
      ? await this.client.get('/components', { params: { status } })
      : await this.client.get('/components');
    return response.data;
  }

  /** GET /components/:id */
  async component(id: string): Promise<Component> {
    const response = await this.client.get(`/components/${encodeURIComponent(id)}`);
    return response.data;
  }

  /** GET /components/status/:status */
  async componentsByStatus(status: string): Promise<{ components: Component[]; status: string; count: number }> {
    const response = await this.client.get(`/components/status/${encodeURIComponent(status)}`);
    return response.data;
  }

  /** GET /health */
  async health(): Promise<{ status: string; timestamp: string; version: string }> {
    const response = await this.client.get('/health');
    return response.data;
  }

  // API Key management

  /** POST /auth/api-keys -> { apiKey, metadata } */
  async createApiKey(
    name: string,
    options: { expiresInDays?: number; scopes?: string[] } = {},
  ): Promise<{ apiKey: string; metadata: ApiKeyMetadata }> {
    const response = await this.client.post('/auth/api-keys', { name, ...options });
    return response.data;
  }

  // Application management

  /** POST /applications/register -> Application */
  async registerApplication(
    name: string,
    repository?: string,
    version?: string,
    options: RegisterApplicationOptions = {},
  ): Promise<Application> {
    const body: Record<string, unknown> = { ...options, name };
    if (repository !== undefined) body.repository = repository;
    if (version !== undefined) body.version = version;
    const response = await this.client.post('/applications/register', body);
    return response.data;
  }

  /** GET /applications[?teamId=&capability=] */
  async getApplications(
    filters: { teamId?: string; capability?: 'governance' | 'visualRegression' | 'sessionReplay' } = {},
  ): Promise<{ applications: Application[]; count: number }> {
    const params: Record<string, string> = {};
    if (filters.teamId) params.teamId = filters.teamId;
    if (filters.capability) params.capability = filters.capability;
    const response = await this.client.get('/applications', { params });
    return response.data;
  }

  // Compliance scanning

  /** POST /compliance/scan */
  async scanCompliance(
    scope: 'design-system' | 'applications',
    applicationId?: string,
    categories?: string[],
  ): Promise<{
    scope: string;
    passed: number;
    warnings: number;
    failed: number;
    checks: ComplianceCheck[];
  }> {
    const response = await this.client.post('/compliance/scan', { scope, applicationId, categories });
    return response.data;
  }

  /** POST /compliance/scan-application */
  async scanApplicationCodebase(
    applicationId: string,
    codebase?: unknown,
    categories?: string[],
  ): Promise<{
    applicationId: string;
    scannedAt: string;
    checks: ComplianceCheck[];
  }> {
    const response = await this.client.post('/compliance/scan-application', { applicationId, codebase, categories });
    return response.data;
  }

  // AI Assistant

  /** POST /ai/chat */
  async chat(message: string, conversationHistory?: Array<{ role: string; content: string }>): Promise<{
    response: string;
    suggestions?: string[];
    relatedComponents?: string[];
    relatedTokens?: string[];
  }> {
    const response = await this.client.post('/ai/chat', { message, conversationHistory });
    return response.data;
  }
}

export default DesignSystemAPI;
