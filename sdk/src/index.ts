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
  /** The workspace the application belongs to; required unless the key has admin:governance */
  workspaceId?: string;
  /** The design system version the application is on, a semantic version like 2.1.0 */
  designSystemVersion?: string;
  capabilities?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface ApplicationFilters {
  teamId?: string;
  workspaceId?: string;
  capability?: 'governance' | 'visualRegression' | 'sessionReplay';
  environment?: string;
  /** Matches name, description and repository */
  search?: string;
  /** Page size, 1 to 100; without it every match is returned */
  limit?: number;
  offset?: number;
}

/** GET /applications */
export interface ApplicationPage {
  applications: Application[];
  /** How many are in this page */
  count: number;
  /** How many match the filters, across all pages */
  total: number;
  offset: number;
  limit: number | null;
  /** Teams and environments among the applications the caller can read */
  facets: { teams: string[]; environments: string[] };
}

export interface ComplianceCheck {
  id: string;
  /** The governance rule's id */
  ruleId?: string;
  rule: string;
  status: 'pass' | 'warning' | 'error' | 'info';
  message: string;
  component?: string;
  application?: string;
  file?: string;
  line?: number;
  element?: string;
  impact?: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' | 'INFO';
}

/** A stored scan, as POST /compliance/scan and /compliance/scan-application return it */
export interface ScanResult {
  id: string;
  scope: 'design-system' | 'application';
  source: string;
  applicationId?: string;
  applicationName?: string;
  url?: string;
  createdAt: string;
  rules: Array<{ id: string; name: string; version: number }>;
  summary: { passed: number; warnings: number; errors: number; info: number; total: number };
  checks: ComplianceCheck[];
  /** True when more checks were found than are stored */
  truncated: boolean;
  /** The summary's counts again, flat */
  passed: number;
  warnings: number;
  failed: number;
  info: number;
}

export interface ScanOptions {
  /** design-system scope: scan only these components (ids) */
  componentIds?: string[];
  /** Run only these rules (ids) */
  ruleIds?: string[];
}

/** GET /health */
export interface HealthReport {
  status: 'ok' | 'unavailable';
  timestamp: string;
  version: string;
  elasticsearch: { status: 'up' | 'down'; error?: string };
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

  /**
   * GET /health: the server's release and whether Elasticsearch answers. The
   * server sends the same report with a 503 when it doesn't, so an unhealthy
   * server resolves with `status: 'unavailable'` rather than rejecting.
   */
  async health(): Promise<HealthReport> {
    const response = await this.client.get('/health', { validateStatus: (status) => status === 200 || status === 503 });
    return response.data;
  }

  // API Key management

  /** POST /auth/api-keys -> { apiKey, metadata }. Needs a key with admin:users. */
  async createApiKey(
    name: string,
    options: { expiresInDays?: number; scopes?: string[] } = {},
  ): Promise<{ apiKey: string; metadata: ApiKeyMetadata }> {
    const response = await this.client.post('/auth/api-keys', { name, ...options });
    return response.data;
  }

  // Application management

  /** POST /applications/register -> Application. Needs `workspaceId` unless the key has admin:governance. */
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

  /** GET /applications: the applications the key can read, filtered and optionally paged */
  async getApplications(filters: ApplicationFilters = {}): Promise<ApplicationPage> {
    const params: Record<string, string | number> = {};
    for (const key of ['teamId', 'workspaceId', 'capability', 'environment', 'search'] as const) {
      if (filters[key]) params[key] = filters[key] as string;
    }
    if (filters.limit !== undefined) params.limit = filters.limit;
    if (filters.offset !== undefined) params.offset = filters.offset;
    const response = await this.client.get('/applications', { params });
    return response.data;
  }

  // Compliance scanning

  /**
   * POST /compliance/scan. `design-system` scans the components the key can
   * read (or just `options.componentIds`) and needs component:view;
   * `applications` scans one application (`applicationId`) and needs admin:governance.
   */
  async scanCompliance(
    scope: 'design-system' | 'applications',
    applicationId?: string,
    categories?: string[],
    options: ScanOptions = {},
  ): Promise<ScanResult> {
    const body: Record<string, unknown> = { scope, applicationId, categories };
    if (options.componentIds?.length) body.componentIds = options.componentIds;
    if (options.ruleIds?.length) body.ruleIds = options.ruleIds;
    const response = await this.client.post('/compliance/scan', body);
    return response.data;
  }

  /**
   * POST /compliance/scan-application, which needs a key with admin:governance.
   * Supply the application's code (`codebase`) or a public `url` for the server
   * to fetch; with neither, the server scans the application's registered
   * applicationUrl, and answers 400 if it has none.
   */
  async scanApplicationCodebase(
    applicationId: string,
    codebase?: { html?: string; css?: string; javascript?: string; file?: string },
    categories?: string[],
    url?: string,
  ): Promise<ScanResult> {
    const response = await this.client.post('/compliance/scan-application', { applicationId, codebase, categories, url });
    return response.data;
  }

  // AI Assistant

  /**
   * POST /ai/chat: asks Eero, the design system assistant. Needs ANTHROPIC_API_KEY
   * on the server (503 without it) and is rate limited per caller (429).
   */
  async chat(message: string, conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>): Promise<{
    response: string;
    suggestions: string[];
    relatedComponents: string[];
    relatedTokens: string[];
    /** The Claude model that answered */
    model: string;
  }> {
    const response = await this.client.post('/ai/chat', { message, conversationHistory });
    return response.data;
  }
}

export default DesignSystemAPI;
