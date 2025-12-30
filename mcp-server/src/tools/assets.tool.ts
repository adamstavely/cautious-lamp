import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { apiClient } from '../api-client';

export interface WorkspaceAsset {
  id: string;
  name: string;
  type: 'image' | 'icon' | 'illustration' | 'logo' | 'other';
  url: string;
  thumbnailUrl?: string;
  size?: number;
  format?: string;
  workspaceId: string;
  sharedWith?: string[];
  isGlobal?: boolean;
  tags?: string[];
  description?: string;
  createdAt: string;
  createdBy: string;
}

export interface WorkspaceIcon {
  id: string;
  name: string;
  description?: string;
  iconSet?: string;
  svg?: string;
  url?: string;
  tags?: string[];
  workspaceId: string;
  sharedWith?: string[];
  isGlobal?: boolean;
  createdAt: string;
  createdBy: string;
}

export const getAssetsTool: Tool = {
  name: 'get_assets',
  description: 'Retrieve all assets for a workspace with optional type filter (image, icon, illustration, logo, other)',
  inputSchema: {
    type: 'object',
    properties: {
      workspaceId: {
        type: 'string',
        description: 'The workspace ID',
      },
      type: {
        type: 'string',
        enum: ['image', 'icon', 'illustration', 'logo', 'other'],
        description: 'Filter assets by type',
      },
      userId: {
        type: 'string',
        description: 'Optional user ID for filtering',
      },
    },
    required: ['workspaceId'],
  },
};

export async function getAssets(args: { workspaceId: string; type?: string; userId?: string }): Promise<WorkspaceAsset[]> {
  const params: Record<string, string> = { workspaceId: args.workspaceId };
  if (args.type) params.type = args.type;
  if (args.userId) params.userId = args.userId;

  return await apiClient.get<WorkspaceAsset[]>(`/workspaces/${encodeURIComponent(args.workspaceId)}/assets`, params, 'assets');
}

export const getIconsTool: Tool = {
  name: 'get_icons',
  description: 'Get all icons for a workspace with optional iconSet filter',
  inputSchema: {
    type: 'object',
    properties: {
      workspaceId: {
        type: 'string',
        description: 'The workspace ID',
      },
      iconSet: {
        type: 'string',
        description: 'Filter icons by icon set',
      },
      userId: {
        type: 'string',
        description: 'Optional user ID for filtering',
      },
    },
    required: ['workspaceId'],
  },
};

export async function getIcons(args: { workspaceId: string; iconSet?: string; userId?: string }): Promise<WorkspaceIcon[]> {
  const params: Record<string, string> = { workspaceId: args.workspaceId };
  if (args.iconSet) params.iconSet = args.iconSet;
  if (args.userId) params.userId = args.userId;

  return await apiClient.get<WorkspaceIcon[]>(`/workspaces/${encodeURIComponent(args.workspaceId)}/icons`, params, 'assets');
}

export const getAssetByIdTool: Tool = {
  name: 'get_asset_by_id',
  description: 'Get a specific asset by ID',
  inputSchema: {
    type: 'object',
    properties: {
      workspaceId: {
        type: 'string',
        description: 'The workspace ID',
      },
      assetId: {
        type: 'string',
        description: 'The asset ID',
      },
    },
    required: ['workspaceId', 'assetId'],
  },
};

export async function getAssetById(args: { workspaceId: string; assetId: string }): Promise<WorkspaceAsset> {
  // First get all assets, then find the one we need
  // (Backend might not have a direct GET by ID endpoint)
  const assets = await getAssets({ workspaceId: args.workspaceId });
  const asset = assets.find((a) => a.id === args.assetId);
  
  if (!asset) {
    throw new Error(`Asset with ID ${args.assetId} not found in workspace ${args.workspaceId}`);
  }
  
  return asset;
}

export const searchAssetsTool: Tool = {
  name: 'search_assets',
  description: 'Search assets by name, description, or tags',
  inputSchema: {
    type: 'object',
    properties: {
      workspaceId: {
        type: 'string',
        description: 'The workspace ID',
      },
      query: {
        type: 'string',
        description: 'Search query',
      },
      type: {
        type: 'string',
        enum: ['image', 'icon', 'illustration', 'logo', 'other'],
        description: 'Optional type filter',
      },
    },
    required: ['workspaceId', 'query'],
  },
};

export async function searchAssets(args: { workspaceId: string; query: string; type?: string }): Promise<WorkspaceAsset[]> {
  const assets = await getAssets({ workspaceId: args.workspaceId, type: args.type });
  
  const queryLower = args.query.toLowerCase();
  return assets.filter(
    (asset) =>
      asset.name.toLowerCase().includes(queryLower) ||
      asset.description?.toLowerCase().includes(queryLower) ||
      asset.tags?.some((tag) => tag.toLowerCase().includes(queryLower))
  );
}

export const getAssetTypesTool: Tool = {
  name: 'get_asset_types',
  description: 'List available asset types',
  inputSchema: {
    type: 'object',
    properties: {},
  },
};

export async function getAssetTypes(): Promise<string[]> {
  return ['image', 'icon', 'illustration', 'logo', 'other'];
}

