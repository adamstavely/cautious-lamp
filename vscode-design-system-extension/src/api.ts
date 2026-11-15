import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import type * as vscode from 'vscode';
import { TtlCache } from './ttlCache';
import type { Token } from './tokenLookup';

export type { Token } from './tokenLookup';

export interface Component {
  id: string;
  name: string;
  description: string;
  category: string;
  code?: {
    vue?: string;
    react?: string;
  };
  props?: Array<{
    name: string;
    type: string;
    description: string;
    required: boolean;
    default?: any;
  }>;
}

export const DEFAULT_REQUEST_TIMEOUT_MS = 10000;

/** A response the server gave on purpose (4xx): asking again gets the same answer */
class ClientError extends Error {}

export interface DesignSystemAPIOptions {
  requestTimeout?: number;
  /** For tests: the HTTP GET and the wait between retries */
  get?: (url: string, config: AxiosRequestConfig) => Promise<AxiosResponse>;
  sleep?: (ms: number) => Promise<void>;
}

export class DesignSystemAPI {
  private apiUrl: string;
  private apiKey: string;
  private outputChannel: Pick<vscode.OutputChannel, 'appendLine'>;
  private cacheTimeout: number = 5 * 60 * 1000; // 5 minutes
  // Separate freshness per data set: loading tokens must not make stale components look fresh
  private componentsCache = new TtlCache<Component[]>(this.cacheTimeout);
  private tokensCache = new TtlCache<Token[]>(this.cacheTimeout);
  private requestTimeout: number;
  private get: (url: string, config: AxiosRequestConfig) => Promise<AxiosResponse>;
  private sleep: (ms: number) => Promise<void>;

  constructor(
    apiUrl: string,
    apiKey: string,
    outputChannel: Pick<vscode.OutputChannel, 'appendLine'>,
    options: DesignSystemAPIOptions = {}
  ) {
    this.apiUrl = apiUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = apiKey;
    this.outputChannel = outputChannel;
    this.requestTimeout = options.requestTimeout || DEFAULT_REQUEST_TIMEOUT_MS;
    this.get = options.get ?? ((url, config) => axios.get(url, config));
    this.sleep = options.sleep ?? (ms => new Promise(resolve => setTimeout(resolve, ms)));
  }

  updateConfig(apiUrl: string, apiKey: string, requestTimeout?: number) {
    this.apiUrl = apiUrl.replace(/\/$/, '');
    this.apiKey = apiKey;
    this.requestTimeout = requestTimeout || DEFAULT_REQUEST_TIMEOUT_MS;
    this.clearCache();
    this.outputChannel.appendLine(`Configuration updated: ${this.apiUrl}`);
  }

  private clearCache() {
    this.componentsCache.clear();
    this.tokensCache.clear();
  }

  async refreshCache() {
    this.clearCache();
    await Promise.all([
      this.getComponents().catch(err => {
        this.outputChannel.appendLine(`Warning: Failed to refresh components: ${err.message}`);
      }),
      this.getTokens().catch(err => {
        this.outputChannel.appendLine(`Warning: Failed to refresh tokens: ${err.message}`);
      })
    ]);
  }

  /**
   * GETs `endpoint`, retrying timeouts, dropped connections and 5xx with
   * backoff. A 4xx (a bad key, a missing route) fails at once: retrying it
   * only delays the same error.
   */
  private async fetch<T>(endpoint: string, retries: number = 2): Promise<T> {
    const url = `${this.apiUrl}${endpoint}`;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await this.get(url, {
          headers: this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {},
          timeout: this.requestTimeout,
          validateStatus: (status) => status < 500 // Don't throw on 4xx errors
        });

        if (response.status === 401) {
          throw new ClientError(this.apiKey ? 'Unauthorized: Check your API key' : 'Unauthorized: Set designSystem.apiKey');
        }
        if (response.status === 404) {
          throw new ClientError(`Endpoint not found: ${endpoint}`);
        }
        if (response.status >= 400) {
          throw new ClientError(`API error: ${response.status} ${response.statusText}`);
        }

        return response.data;
      } catch (error: any) {
        if (error instanceof ClientError) throw error;
        const axiosError = error as AxiosError;

        if (axiosError.code === 'ECONNREFUSED' || axiosError.code === 'ENOTFOUND') {
          throw new Error(`Cannot connect to API at ${this.apiUrl}. Is the server running?`);
        }

        if (axiosError.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
          if (attempt < retries) {
            this.outputChannel.appendLine(`Request timeout, retrying... (${attempt + 1}/${retries})`);
            await this.sleep(1000 * (attempt + 1)); // Linear backoff
            continue;
          }
          throw new Error(`Request timeout: API did not respond within ${this.requestTimeout}ms`);
        }

        if (attempt < retries) {
          this.outputChannel.appendLine(`Request failed, retrying... (${attempt + 1}/${retries})`);
          await this.sleep(1000 * (attempt + 1));
          continue;
        }

        throw error;
      }
    }

    throw new Error('Failed to fetch after retries');
  }

  async getComponents(): Promise<Component[]> {
    const fresh = this.componentsCache.getFresh();
    if (fresh) {
      return fresh;
    }

    try {
      const data = await this.fetch<any>('/components');
      const components = Array.isArray(data) ? data : (data?.components || []);
      
      if (!Array.isArray(components)) {
        this.outputChannel.appendLine('Warning: API returned invalid components format');
        return this.componentsCache.getStale() || [];
      }

      this.componentsCache.set(components);
      this.outputChannel.appendLine(`Loaded ${components.length} components`);
      return components;
    } catch (error: any) {
      this.outputChannel.appendLine(`Error fetching components: ${error.message}`);
      // Return cached data if available, otherwise empty array
      const stale = this.componentsCache.getStale();
      if (stale) {
        this.outputChannel.appendLine('Using cached components');
        return stale;
      }
      return [];
    }
  }

  async getTokens(): Promise<Token[]> {
    const fresh = this.tokensCache.getFresh();
    if (fresh) {
      return fresh;
    }

    try {
      const data = await this.fetch<any>('/tokens');
      const tokens = Array.isArray(data) ? data : (data?.tokens || []);
      
      if (!Array.isArray(tokens)) {
        this.outputChannel.appendLine('Warning: API returned invalid tokens format');
        return this.tokensCache.getStale() || [];
      }

      this.tokensCache.set(tokens);
      this.outputChannel.appendLine(`Loaded ${tokens.length} tokens`);
      return tokens;
    } catch (error: any) {
      this.outputChannel.appendLine(`Error fetching tokens: ${error.message}`);
      // Return cached data if available, otherwise empty array
      const stale = this.tokensCache.getStale();
      if (stale) {
        this.outputChannel.appendLine('Using cached tokens');
        return stale;
      }
      return [];
    }
  }

  async getComponent(id: string): Promise<Component | null> {
    try {
      const components = await this.getComponents();
      return components.find(c => c.id === id || c.name === id) || null;
    } catch (error: any) {
      this.outputChannel.appendLine(`Error getting component ${id}: ${error.message}`);
      return null;
    }
  }

  async getToken(name: string): Promise<Token | null> {
    try {
      const tokens = await this.getTokens();
      return tokens.find(t => t.name === name || t.id === name) || null;
    } catch (error: any) {
      this.outputChannel.appendLine(`Error getting token ${name}: ${error.message}`);
      return null;
    }
  }

  async getComponentSnippet(componentName: string, framework: 'vue' | 'react' = 'vue'): Promise<string> {
    try {
      const component = await this.getComponent(componentName);
      if (!component || !component.code) {
        return '';
      }

      const code = component.code[framework] || component.code.vue || '';
      return code;
    } catch (error: any) {
      this.outputChannel.appendLine(`Error getting snippet for ${componentName}: ${error.message}`);
      return '';
    }
  }

  async searchComponents(query: string): Promise<Component[]> {
    try {
      const components = await this.getComponents();
      const lowerQuery = query.toLowerCase();
      return components.filter(c =>
        c.name.toLowerCase().includes(lowerQuery) ||
        c.description?.toLowerCase().includes(lowerQuery) ||
        c.category.toLowerCase().includes(lowerQuery)
      );
    } catch (error: any) {
      this.outputChannel.appendLine(`Error searching components: ${error.message}`);
      return [];
    }
  }

  async searchTokens(query: string): Promise<Token[]> {
    try {
      const tokens = await this.getTokens();
      const lowerQuery = query.toLowerCase();
      return tokens.filter(t =>
        t.name.toLowerCase().includes(lowerQuery) ||
        t.value.toLowerCase().includes(lowerQuery) ||
        t.category.toLowerCase().includes(lowerQuery)
      );
    } catch (error: any) {
      this.outputChannel.appendLine(`Error searching tokens: ${error.message}`);
      return [];
    }
  }
}
