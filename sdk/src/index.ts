import axios, { AxiosInstance } from 'axios';

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
}

export interface ComponentProp {
  name: string;
  type: string;
  default?: any;
  required?: boolean;
  options?: string[];
  description?: string;
}

export interface DesignSystemAPIOptions {
  apiKey: string;
  baseURL?: string;
}

export class DesignSystemAPI {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(options: DesignSystemAPIOptions) {
    this.apiKey = options.apiKey;
    this.client = axios.create({
      baseURL: options.baseURL || 'http://localhost:3000/api/v1',
      headers: {
        'Authorization': `Bearer ${options.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  // Token methods
  async tokens(): Promise<{ tokens: Token[]; count: number; filters?: any }> {
    const response = await this.client.get('/tokens');
    return response.data;
  }

  async tokensByCategory(category: string): Promise<{ tokens: Token[]; category: string; count: number }> {
    const response = await this.client.get(`/tokens/category/${category}`);
    return response.data;
  }

  async token(name: string): Promise<Token> {
    const response = await this.client.get(`/tokens/${encodeURIComponent(name)}`);
    return response.data;
  }

  async tokensFiltered(filters: { category?: string; type?: string; tag?: string }): Promise<{ tokens: Token[]; count: number; filters: any }> {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.type) params.append('type', filters.type);
    if (filters.tag) params.append('tag', filters.tag);
    
    const response = await this.client.get(`/tokens?${params.toString()}`);
    return response.data;
  }

  // Component methods
  async components(status?: string): Promise<{ components: Component[]; count: number; filters?: any }> {
    const url = status ? `/components?status=${status}` : '/components';
    const response = await this.client.get(url);
    return response.data;
  }

  async component(id: string): Promise<Component> {
    const response = await this.client.get(`/components/${id}`);
    return response.data;
  }

  async componentsByStatus(status: string): Promise<{ components: Component[]; status: string; count: number }> {
    const response = await this.client.get(`/components/status/${status}`);
    return response.data;
  }

  // Health check
  async health(): Promise<{ status: string; timestamp: string; version: string }> {
    const response = await this.client.get('/health');
    return response.data;
  }

  // API Key management
  async createApiKey(name: string): Promise<{ apiKey: string; name: string; createdAt: Date }> {
    // Note: This endpoint might not require auth, or might use a different auth method
    const response = await this.client.post('/auth/api-keys', { name });
    return response.data;
  }
}

export default DesignSystemAPI;

