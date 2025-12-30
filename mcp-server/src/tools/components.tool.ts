import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { apiClient } from '../api-client';

export interface ComponentProp {
  name: string;
  type: string;
  default?: any;
  required?: boolean;
  options?: string[];
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
  variants?: any[];
  workspaceId?: string;
  sharedWith?: string[];
  isGlobal?: boolean;
}

export interface ComponentsResponse {
  components: Component[];
  count: number;
  filters?: {
    status?: string;
  };
}

export const getComponentsTool: Tool = {
  name: 'get_components',
  description: 'Retrieve all components with optional status filter',
  inputSchema: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['production', 'in-progress', 'planned', 'deprecated'],
        description: 'Filter components by status',
      },
    },
  },
};

export async function getComponents(args: { status?: string }): Promise<ComponentsResponse> {
  const params: Record<string, string> = {};
  if (args.status) params.status = args.status;

  return await apiClient.get<ComponentsResponse>('/components', params, 'components');
}

export const getComponentTool: Tool = {
  name: 'get_component',
  description: 'Get a specific component by ID with full details',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'The ID of the component to retrieve',
      },
    },
    required: ['id'],
  },
};

export async function getComponent(args: { id: string }): Promise<Component> {
  return await apiClient.get<Component>(`/components/${encodeURIComponent(args.id)}`, { id: args.id }, 'components');
}

export const getComponentCodeTool: Tool = {
  name: 'get_component_code',
  description: 'Get component code in specified format (vue, react, or html)',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'The ID of the component',
      },
      format: {
        type: 'string',
        enum: ['vue', 'react', 'html'],
        description: 'The code format to retrieve',
      },
    },
    required: ['id', 'format'],
  },
};

export async function getComponentCode(args: { id: string; format: 'vue' | 'react' | 'html' }): Promise<string> {
  const component = await getComponent({ id: args.id });
  
  if (args.format === 'vue') {
    return component.code.vue;
  } else if (args.format === 'react') {
    return component.code.react;
  } else if (args.format === 'html') {
    return component.code.html || '';
  }
  
  throw new Error(`Unsupported format: ${args.format}`);
}

export const searchComponentsTool: Tool = {
  name: 'search_components',
  description: 'Search components by name or description',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search query to match against component names or descriptions',
      },
      status: {
        type: 'string',
        enum: ['production', 'in-progress', 'planned', 'deprecated'],
        description: 'Optional status filter',
      },
    },
    required: ['query'],
  },
};

export async function searchComponents(args: { query: string; status?: string }): Promise<ComponentsResponse> {
  const allComponents = await getComponents({ status: args.status });
  
  const queryLower = args.query.toLowerCase();
  const filtered = allComponents.components.filter(
    (component) =>
      component.name.toLowerCase().includes(queryLower) ||
      component.description.toLowerCase().includes(queryLower) ||
      component.id.toLowerCase().includes(queryLower)
  );

  return {
    components: filtered,
    count: filtered.length,
    filters: { status: args.status },
  };
}

