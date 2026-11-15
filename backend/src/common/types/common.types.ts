/**
 * Common type definitions to replace any types throughout the codebase
 */

// Generic value types for changelog/audit entries
export type ChangeValue = string | number | boolean | null | undefined | Record<string, unknown> | unknown[];

// Request body types
export interface RequestBody {
  [key: string]: unknown;
}

// Elasticsearch query types
export interface ElasticsearchQuery {
  index: string;
  body: {
    query: {
      bool: {
        must?: Array<Record<string, unknown>>;
        should?: Array<Record<string, unknown>>;
        must_not?: Array<Record<string, unknown>>;
      };
    };
    sort?: Array<Record<string, { order: 'asc' | 'desc' }>>;
    size?: number;
    from?: number;
  };
}

export interface ElasticsearchRange {
  gte?: string;
  lte?: string;
  gt?: string;
  lt?: string;
}

// Webhook payload types
export interface WebhookPayload {
  [key: string]: unknown;
  event?: string;
  projectId?: string;
  buildId?: string;
  screenshotId?: string;
}

// DTO types for project creation/updates
export interface CreateProjectDto {
  name: string;
  description?: string;
  argosProjectId: string;
  argosBaseUrl?: string;
  argosBranch?: string;
  argosToken?: string;
  config?: ProjectConfig;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  argosBranch?: string;
  config?: ProjectConfig;
}

export interface ProjectConfig {
  testDirectories?: string[];
  viewports?: string[];
  browsers?: string[];
  ignorePatterns?: string[];
  screenshotOptions?: ScreenshotOptions;
}

export interface ScreenshotOptions {
  fullPage?: boolean;
  waitForSelector?: string;
  waitForTimeout?: number;
}

// Build and screenshot types
export interface BuildPayload {
  id: string;
  projectId: string;
  status: string;
  branch?: string;
  commit?: string;
  [key: string]: unknown;
}

export interface ScreenshotPayload {
  id: string;
  buildId: string;
  name: string;
  status: string;
  [key: string]: unknown;
}

// Component prop types
export interface ComponentProp {
  name: string;
  type: string;
  description?: string;
  required?: boolean;
  defaultValue?: ChangeValue;
  options?: string[];
}

// Codebase scanning types
export interface CodebaseContext {
  html?: string;
  javascript?: string;
  css?: string;
  components?: ComponentDefinition[];
  tokens?: TokenDefinition[];
}

export interface ComponentDefinition {
  name: string;
  props?: ComponentProp[];
  [key: string]: unknown;
}

export interface TokenDefinition {
  name: string;
  value: string;
  type: string;
  category: string;
  [key: string]: unknown;
}

// Notification configuration
export interface NotificationConfig {
  email?: EmailConfig;
  slack?: SlackConfig;
  teams?: TeamsConfig;
  webhook?: WebhookConfig;
  [key: string]: unknown;
}

export interface EmailConfig {
  recipients: string[];
  [key: string]: unknown;
}

export interface SlackConfig {
  webhookUrl: string;
  channel?: string;
  [key: string]: unknown;
}

export interface TeamsConfig {
  webhookUrl: string;
  [key: string]: unknown;
}

export interface WebhookConfig {
  url: string;
  secret?: string;
  [key: string]: unknown;
}

// Error types
export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
  details?: Record<string, unknown>;
  recovery?: string[];
}

// Connection status
export interface ConnectionStatus {
  connected: boolean;
  lastChecked: Date;
  error?: string;
  latency?: number;
}

