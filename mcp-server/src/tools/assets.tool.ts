import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { apiClient } from '../api-client';

const assetTypeSchema = z.enum(['image', 'icon', 'illustration', 'logo', 'other']);

/**
 * Workspace items live under the generic resource API
 * (`GET /workspaces/:id/resources/:kind?filter=`, docs/WORKSPACES.md). `filter`
 * matches the kind's category field: `type` for assets, `iconSet` for icons.
 */
export function resourcesPath(workspaceId: string, kind: 'assets' | 'icons', resourceId?: string): string {
  const base = `/workspaces/${encodeURIComponent(workspaceId)}/resources/${kind}`;
  return resourceId === undefined ? base : `${base}/${encodeURIComponent(resourceId)}`;
}

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
  kind?: 'assets';
  createdAt: string;
  updatedAt?: string;
  createdBy: string;
  updatedBy?: string;
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
  kind?: 'icons';
  createdAt: string;
  updatedAt?: string;
  createdBy: string;
  updatedBy?: string;
}

export const getAssetsSchema = z.object({
  workspaceId: z.string().min(1),
  type: assetTypeSchema.optional(),
});

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
    },
    required: ['workspaceId'],
  },
};

export async function getAssets(args: { workspaceId: string; type?: string }): Promise<WorkspaceAsset[]> {
  const params = args.type ? { filter: args.type } : undefined;
  return await apiClient.get<WorkspaceAsset[]>(resourcesPath(args.workspaceId, 'assets'), params, 'assets');
}

export const getIconsSchema = z.object({
  workspaceId: z.string().min(1),
  iconSet: z.string().optional(),
});

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
    },
    required: ['workspaceId'],
  },
};

export async function getIcons(args: { workspaceId: string; iconSet?: string }): Promise<WorkspaceIcon[]> {
  const params = args.iconSet ? { filter: args.iconSet } : undefined;
  return await apiClient.get<WorkspaceIcon[]>(resourcesPath(args.workspaceId, 'icons'), params, 'assets');
}

export const getAssetByIdSchema = z.object({
  workspaceId: z.string().min(1),
  assetId: z.string().min(1),
});

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
  // The backend answers 404 for an unknown id; the API client turns that into an error
  return await apiClient.get<WorkspaceAsset>(resourcesPath(args.workspaceId, 'assets', args.assetId), undefined, 'assets');
}

export const searchAssetsSchema = z.object({
  workspaceId: z.string().min(1),
  query: z.string(),
  type: assetTypeSchema.optional(),
});

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

export const getAssetTypesSchema = z.object({});

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

