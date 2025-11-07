import axios, { AxiosError } from 'axios';
import * as vscode from 'vscode';

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

export interface Token {
  id: string;
  name: string;
  value: string;
  type: string;
  category: string;
  description?: string;
}

export class DesignSystemAPI {
  private apiUrl: string;
  private apiKey: string;
  private outputChannel: vscode.OutputChannel;
  private componentsCache: Component[] | null = null;
  private tokensCache: Token[] | null = null;
  private cacheTimestamp: number = 0;
  private cacheTimeout: number = 5 * 60 * 1000; // 5 minutes
  private requestTimeout: number = 10000; // 10 seconds

  constructor(apiUrl: string, apiKey: string, outputChannel: vscode.OutputChannel) {
    this.apiUrl = apiUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = apiKey;
    this.outputChannel = outputChannel;
  }

  updateConfig(apiUrl: string, apiKey: string) {
    this.apiUrl = apiUrl.replace(/\/$/, '');
    this.apiKey = apiKey;
    this.clearCache();
    this.outputChannel.appendLine(`Configuration updated: ${this.apiUrl}`);
  }

  private clearCache() {
    this.componentsCache = null;
    this.tokensCache = null;
    this.cacheTimestamp = 0;
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

  private async fetch<T>(endpoint: string, retries: number = 2): Promise<T> {
    const url = `${this.apiUrl}${endpoint}`;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await axios.get<T>(url, {
          headers: {
            Authorization: `Bearer ${this.apiKey}`
          },
          timeout: this.requestTimeout,
          validateStatus: (status) => status < 500 // Don't throw on 4xx errors
        });

        if (response.status === 401) {
          throw new Error('Unauthorized: Check your API key');
        }
        if (response.status === 404) {
          throw new Error(`Endpoint not found: ${endpoint}`);
        }
        if (response.status >= 400) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        return response.data;
      } catch (error: any) {
        const axiosError = error as AxiosError;
        
        if (axiosError.code === 'ECONNREFUSED' || axiosError.code === 'ENOTFOUND') {
          throw new Error(`Cannot connect to API at ${this.apiUrl}. Is the server running?`);
        }
        
        if (axiosError.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
          if (attempt < retries) {
            this.outputChannel.appendLine(`Request timeout, retrying... (${attempt + 1}/${retries})`);
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Exponential backoff
            continue;
          }
          throw new Error(`Request timeout: API did not respond within ${this.requestTimeout}ms`);
        }

        if (attempt < retries) {
          this.outputChannel.appendLine(`Request failed, retrying... (${attempt + 1}/${retries})`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          continue;
        }

        throw error;
      }
    }

    throw new Error('Failed to fetch after retries');
  }

  async getComponents(): Promise<Component[]> {
    if (this.componentsCache && Date.now() - this.cacheTimestamp < this.cacheTimeout) {
      return this.componentsCache;
    }

    try {
      const data = await this.fetch<any>('/components');
      const components = Array.isArray(data) ? data : (data?.components || []);
      
      if (!Array.isArray(components)) {
        this.outputChannel.appendLine('Warning: API returned invalid components format');
        return this.componentsCache || [];
      }

      this.componentsCache = components;
      this.cacheTimestamp = Date.now();
      this.outputChannel.appendLine(`Loaded ${components.length} components`);
      return this.componentsCache;
    } catch (error: any) {
      this.outputChannel.appendLine(`Error fetching components: ${error.message}`);
      // Return cached data if available, otherwise empty array
      if (this.componentsCache) {
        this.outputChannel.appendLine('Using cached components');
        return this.componentsCache;
      }
      return [];
    }
  }

  async getTokens(): Promise<Token[]> {
    if (this.tokensCache && Date.now() - this.cacheTimestamp < this.cacheTimeout) {
      return this.tokensCache;
    }

    try {
      const data = await this.fetch<any>('/tokens');
      const tokens = Array.isArray(data) ? data : (data?.tokens || []);
      
      if (!Array.isArray(tokens)) {
        this.outputChannel.appendLine('Warning: API returned invalid tokens format');
        return this.tokensCache || [];
      }

      this.tokensCache = tokens;
      this.cacheTimestamp = Date.now();
      this.outputChannel.appendLine(`Loaded ${tokens.length} tokens`);
      return this.tokensCache;
    } catch (error: any) {
      this.outputChannel.appendLine(`Error fetching tokens: ${error.message}`);
      // Return cached data if available, otherwise empty array
      if (this.tokensCache) {
        this.outputChannel.appendLine('Using cached tokens');
        return this.tokensCache;
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
