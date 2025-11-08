# OpenReplay Heatmaps Implementation Guide

## Overview

OpenReplay has built-in heatmap functionality in their "Product Analytics" section. Heatmaps visualize user interactions (clicks, scrolls, mouse movements) aggregated across multiple sessions to show engagement hotspots.

## What OpenReplay Provides

OpenReplay's heatmaps feature:
- **Click Heatmaps**: Shows where users click most frequently
- **Scroll Heatmaps**: Shows how far users scroll on pages
- **Mouse Movement Heatmaps**: Shows mouse movement patterns
- **URL Filtering**: Filter by URL patterns (contains, starts with, ends with)
- **Session Filtering**: Filter by user attributes, session characteristics, and issues

## Implementation Requirements

### 1. Backend API Integration

#### 1.1 Add Heatmap API Methods to OpenReplayApiClient

**File**: `backend/src/session-replay/openreplay-api.client.ts`

```typescript
export interface Heatmap {
  id: string;
  projectId: number;
  name: string;
  url: string;
  urlMatchType: 'contains' | 'starts_with' | 'ends_with' | 'equals';
  type: 'click' | 'scroll' | 'movement';
  filters?: {
    userId?: string;
    userEmail?: string;
    country?: string;
    os?: string;
    browser?: string;
    issueType?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface HeatmapData {
  heatmapId: string;
  data: {
    x: number;
    y: number;
    intensity: number; // 0-100
  }[];
  pageWidth: number;
  pageHeight: number;
  totalSessions: number;
  totalClicks?: number;
  totalScrolls?: number;
}

// Add to OpenReplayApiClient class:
async getHeatmaps(projectId: number): Promise<Heatmap[]> {
  try {
    const response = await this.client.get(`/api/v1/projects/${projectId}/heatmaps`);
    return response.data;
  } catch (error: any) {
    throw new Error(`Failed to fetch heatmaps: ${error.message}`);
  }
}

async createHeatmap(projectId: number, heatmap: Partial<Heatmap>): Promise<Heatmap> {
  try {
    const response = await this.client.post(`/api/v1/projects/${projectId}/heatmaps`, heatmap);
    return response.data;
  } catch (error: any) {
    throw new Error(`Failed to create heatmap: ${error.message}`);
  }
}

async getHeatmapData(heatmapId: string): Promise<HeatmapData> {
  try {
    const response = await this.client.get(`/api/v1/heatmaps/${heatmapId}/data`);
    return response.data;
  } catch (error: any) {
    throw new Error(`Failed to fetch heatmap data: ${error.message}`);
  }
}

async updateHeatmap(heatmapId: string, updates: Partial<Heatmap>): Promise<Heatmap> {
  try {
    const response = await this.client.put(`/api/v1/heatmaps/${heatmapId}`, updates);
    return response.data;
  } catch (error: any) {
    throw new Error(`Failed to update heatmap: ${error.message}`);
  }
}

async deleteHeatmap(heatmapId: string): Promise<void> {
  try {
    await this.client.delete(`/api/v1/heatmaps/${heatmapId}`);
  } catch (error: any) {
    throw new Error(`Failed to delete heatmap: ${error.message}`);
  }
}

getHeatmapUrl(projectId: number, heatmapId: string): string {
  return `${this.baseUrl}/project/${projectId}/heatmap/${heatmapId}`;
}
```

#### 1.2 Add Heatmap Service Methods

**File**: `backend/src/session-replay/session-replay.service.ts`

```typescript
// Add to SessionReplayService class:

async getHeatmaps(projectId: string): Promise<Heatmap[]> {
  const project = this.projects.get(projectId);
  if (!project) {
    throw new NotFoundException(`Project with ID ${projectId} not found`);
  }

  if (!project.openreplayApiKey) {
    throw new BadRequestException('OpenReplay API key not configured for this project');
  }

  const openreplayBaseUrl = project.openreplayBaseUrl || process.env.OPENREPLAY_BASE_URL || 'https://api.openreplay.com';
  const openreplayClient = new OpenReplayApiClient(openreplayBaseUrl, project.openreplayApiKey);

  try {
    const numericProjectId = parseInt(project.openreplayProjectKey) || 1;
    return await openreplayClient.getHeatmaps(numericProjectId);
  } catch (error: any) {
    throw new BadRequestException(`Failed to get heatmaps: ${error.message}`);
  }
}

async createHeatmap(projectId: string, heatmapData: Partial<Heatmap>): Promise<Heatmap> {
  const project = this.projects.get(projectId);
  if (!project) {
    throw new NotFoundException(`Project with ID ${projectId} not found`);
  }

  if (!project.openreplayApiKey) {
    throw new BadRequestException('OpenReplay API key not configured for this project');
  }

  const openreplayBaseUrl = project.openreplayBaseUrl || process.env.OPENREPLAY_BASE_URL || 'https://api.openreplay.com';
  const openreplayClient = new OpenReplayApiClient(openreplayBaseUrl, project.openreplayApiKey);

  try {
    const numericProjectId = parseInt(project.openreplayProjectKey) || 1;
    return await openreplayClient.createHeatmap(numericProjectId, heatmapData);
  } catch (error: any) {
    throw new BadRequestException(`Failed to create heatmap: ${error.message}`);
  }
}

async getHeatmapData(projectId: string, heatmapId: string): Promise<HeatmapData> {
  const project = this.projects.get(projectId);
  if (!project) {
    throw new NotFoundException(`Project with ID ${projectId} not found`);
  }

  if (!project.openreplayApiKey) {
    throw new BadRequestException('OpenReplay API key not configured for this project');
  }

  const openreplayBaseUrl = project.openreplayBaseUrl || process.env.OPENREPLAY_BASE_URL || 'https://api.openreplay.com';
  const openreplayClient = new OpenReplayApiClient(openreplayBaseUrl, project.openreplayApiKey);

  try {
    return await openreplayClient.getHeatmapData(heatmapId);
  } catch (error: any) {
    throw new BadRequestException(`Failed to get heatmap data: ${error.message}`);
  }
}
```

#### 1.3 Add Controller Endpoints

**File**: `backend/src/session-replay/session-replay.controller.ts`

```typescript
@Get('projects/:id/heatmaps')
async getHeatmaps(@Param('id') projectId: string) {
  return this.sessionReplayService.getHeatmaps(projectId);
}

@Post('projects/:id/heatmaps')
async createHeatmap(@Param('id') projectId: string, @Body() heatmapData: any) {
  return this.sessionReplayService.createHeatmap(projectId, heatmapData);
}

@Get('projects/:id/heatmaps/:heatmapId')
async getHeatmap(@Param('id') projectId: string, @Param('heatmapId') heatmapId: string) {
  return this.sessionReplayService.getHeatmapData(projectId, heatmapId);
}

@Put('projects/:id/heatmaps/:heatmapId')
async updateHeatmap(@Param('id') projectId: string, @Param('heatmapId') heatmapId: string, @Body() updates: any) {
  const openreplayClient = // ... get client
  return openreplayClient.updateHeatmap(heatmapId, updates);
}

@Delete('projects/:id/heatmaps/:heatmapId')
async deleteHeatmap(@Param('id') projectId: string, @Param('heatmapId') heatmapId: string) {
  const openreplayClient = // ... get client
  await openreplayClient.deleteHeatmap(heatmapId);
  return { message: 'Heatmap deleted successfully' };
}
```

### 2. Frontend Implementation

#### 2.1 Create Heatmap Component

**File**: `frontend/src/components/HeatmapViewer.vue`

This component will:
- Display heatmap overlay on a page screenshot
- Show intensity gradients (red = high, blue = low)
- Allow switching between click/scroll/movement heatmaps
- Show statistics (total sessions, total clicks, etc.)

#### 2.2 Add Heatmaps Tab to Project Page

**File**: `frontend/src/views/SessionReplayProject.vue`

Add a new "Heatmaps" tab that:
- Lists all heatmaps for the project
- Allows creating new heatmaps
- Shows heatmap previews
- Links to full heatmap view

#### 2.3 Create Heatmap Detail Page

**File**: `frontend/src/views/SessionReplayHeatmap.vue`

This page will:
- Display the full heatmap visualization
- Show heatmap configuration
- Allow editing filters
- Show statistics and insights

#### 2.4 Create Heatmap Creation Modal

**File**: `frontend/src/components/CreateHeatmapModal.vue`

This modal will allow users to:
- Enter heatmap name
- Configure URL pattern (contains/starts with/ends with/equals)
- Select heatmap type (click/scroll/movement)
- Configure filters (user attributes, session characteristics, issues)
- Preview heatmap settings

### 3. Alternative: Direct OpenReplay Integration

If OpenReplay's API doesn't expose heatmap endpoints, we can:

1. **Embed OpenReplay Heatmap UI**: Use iframe to embed OpenReplay's built-in heatmap interface
2. **Generate Heatmap Links**: Create direct links to OpenReplay's heatmap pages
3. **Use OpenReplay SDK**: If available, use their SDK to generate heatmaps client-side

### 4. Implementation Steps

#### Step 1: Research OpenReplay API
- [ ] Check OpenReplay API documentation for heatmap endpoints
- [ ] Verify API authentication requirements
- [ ] Test API calls with Postman/curl

#### Step 2: Backend Implementation
- [ ] Add heatmap interfaces to `openreplay-api.client.ts`
- [ ] Implement heatmap API methods
- [ ] Add service methods to `session-replay.service.ts`
- [ ] Add controller endpoints
- [ ] Test API integration

#### Step 3: Frontend Implementation
- [ ] Create `HeatmapViewer.vue` component
- [ ] Add Heatmaps tab to project page
- [ ] Create heatmap detail page
- [ ] Create heatmap creation modal
- [ ] Add routing for heatmap pages

#### Step 4: Testing
- [ ] Test creating heatmaps
- [ ] Test viewing heatmap data
- [ ] Test filtering and configuration
- [ ] Test with real OpenReplay instance

### 5. API Endpoint Discovery

**Note**: The exact OpenReplay API endpoints for heatmaps may need to be discovered by:
1. Inspecting OpenReplay's web UI network requests
2. Checking OpenReplay's API documentation
3. Contacting OpenReplay support
4. Reviewing OpenReplay's source code (if open source)

### 6. Fallback Implementation

If OpenReplay doesn't provide a heatmap API, we can:

1. **Aggregate Session Data**: Collect click/scroll data from sessions and generate heatmaps ourselves
2. **Use Canvas/WebGL**: Render heatmap overlays using canvas or WebGL
3. **Third-party Library**: Use a heatmap library like `heatmap.js` to visualize aggregated data

### 7. Example Heatmap Data Structure

```typescript
interface HeatmapPoint {
  x: number;        // X coordinate (0-100 or pixels)
  y: number;        // Y coordinate (0-100 or pixels)
  intensity: number; // 0-100, how "hot" this point is
  count?: number;    // Number of interactions at this point
}

interface HeatmapData {
  points: HeatmapPoint[];
  pageWidth: number;
  pageHeight: number;
  totalSessions: number;
  dateRange: {
    start: string;
    end: string;
  };
}
```

## Next Steps

1. **Verify OpenReplay API**: Check if heatmap endpoints exist in OpenReplay's API
2. **Start with Backend**: Implement API client methods first
3. **Build UI Components**: Create heatmap visualization components
4. **Test Integration**: Test with real OpenReplay instance
5. **Add Features**: Enhance with filtering, analytics, etc.

## Resources

- [OpenReplay Heatmaps Documentation](https://docs.openreplay.com/en/product-analytics/heatmaps/)
- OpenReplay API Documentation (if available)
- Heatmap visualization libraries:
  - [heatmap.js](https://www.patrick-wied.at/static/heatmapjs/)
  - [Leaflet Heatmap](https://github.com/Leaflet/Leaflet.heat)

