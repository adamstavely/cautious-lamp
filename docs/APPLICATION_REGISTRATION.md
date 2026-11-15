# Application Registration & Onboarding

## Overview

A unified application registration and onboarding workflow that allows teams to register their applications with the design system and enable/disable various scanners and capabilities.

## Capabilities

Applications can enable/disable the following capabilities:

1. **Design System Governance / Rules Engine**
   - Compliance scanning
   - Design system component usage checks
   - Token usage validation
   - Accessibility checks

2. **Visual Regression Testing (Argos)**
   - Screenshot comparison
   - Visual diff detection
   - Test run management

3. **Session Replay (OpenReplay)**
   - User session recording
   - Heatmap analysis
   - Error tracking

## Data Model

```typescript
interface Application {
  id: string;
  name: string;
  description?: string;
  repository?: string;
  version?: string;
  applicationUrl?: string;
  teamId?: string;
  registeredAt: Date;
  updatedAt: Date;
  lastScanned?: Date;
  
  // Capabilities configuration
  capabilities: {
    governance: {
      enabled: boolean;
      rules?: string[]; // Specific rules to run (empty = all enabled rules)
      scanSchedule?: 'manual' | 'daily' | 'weekly';
      lastScan?: Date;
    };
    visualRegression: {
      enabled: boolean;
      projectId?: string; // Link to visual regression project
      argosProjectId?: string;
      argosBaseUrl?: string;
      argosBranch?: string;
      lastRun?: Date;
    };
    sessionReplay: {
      enabled: boolean;
      projectId?: string; // Link to session replay project
      openreplayProjectKey?: string;
      openreplayBaseUrl?: string;
      privacySettings?: {
        maskAllInputs?: boolean;
        maskAllText?: boolean;
        respectDoNotTrack?: boolean;
      };
    };
  };
  
  // Metadata
  metadata?: {
    environment?: 'development' | 'staging' | 'production';
    framework?: string;
    language?: string;
    tags?: string[];
  };
}
```

## API Endpoints

### Register Application
```
POST /api/v1/applications/register
```

Request Body:
```json
{
  "name": "Marketing Site",
  "description": "Public-facing marketing website",
  "repository": "https://github.com/company/marketing-site",
  "version": "2.1.0",
  "applicationUrl": "https://marketing.example.com",
  "teamId": "team-123",
  "capabilities": {
    "governance": {
      "enabled": true,
      "rules": [],
      "scanSchedule": "weekly"
    },
    "visualRegression": {
      "enabled": true,
      "argosProjectId": "argos-project-123",
      "argosBaseUrl": "https://app.argos-ci.com",
      "argosBranch": "main"
    },
    "sessionReplay": {
      "enabled": true,
      "openreplayProjectKey": "project-key-123",
      "openreplayBaseUrl": "https://api.openreplay.com",
      "privacySettings": {
        "maskAllInputs": true,
        "respectDoNotTrack": true
      }
    }
  },
  "metadata": {
    "environment": "production",
    "framework": "Vue.js",
    "language": "TypeScript",
    "tags": ["public", "marketing"]
  }
}
```

### Get All Applications
```
GET /api/v1/applications
```

Query Parameters (all optional):
- `search`: case-insensitive text in the name, description, repository, application URL, team or tags (up to 200 characters)
- `teamId`: filter by team
- `workspaceId`: filter by workspace
- `environment`: `development`, `staging` or `production` (`metadata.environment`)
- `capability`: filter by enabled capability (`governance`, `visualRegression`, `sessionReplay`)
- `limit` (1–100) and `offset` (0+): one page, newest first. Without `limit` every match is returned.

Response: `{ applications, count, total, offset, limit, facets: { teams, environments } }`. `count` is how many are in this page, `total` how many match, and `facets` the teams and environments among the applications the caller can read (for filter menus).

### Get Application
```
GET /api/v1/applications/:id
```

### Update Application
```
PUT /api/v1/applications/:id
```

### Update Application Capabilities
```
PATCH /api/v1/applications/:id/capabilities
```

Request Body:
```json
{
  "governance": {
    "enabled": false
  },
  "visualRegression": {
    "enabled": true,
    "argosProjectId": "new-project-id"
  }
}
```

### Delete Application
```
DELETE /api/v1/applications/:id
```

## UI Workflow

### Registration Form

1. **Basic Information**
   - Application name (required)
   - Description (optional)
   - Repository URL (optional)
   - Application URL (optional)
   - Version (optional)
   - Team (optional)

2. **Capabilities Configuration**
   - Toggle switches for each capability
   - Configuration panels that appear when enabled:
     - **Governance**: Rule selection, scan schedule
     - **Visual Regression**: Argos project ID, base URL, branch
     - **Session Replay**: OpenReplay project key, base URL, privacy settings

3. **Metadata** (optional)
   - Environment dropdown
   - Framework input
   - Language input
   - Tags input

### Application Management Page (`/admin/applications`)

- Registered applications the user can read, 20 per page
- Search, and filters by capability, team and environment (applied on the server); workspace admins can also limit the list to the workspaces they administer
- Quick actions on each row:
  - View details (opens the detail page)
  - Run scan (governance), when governance is enabled and the user can change the application
  - View test runs (visual regression), when it has a visual-regression project
  - View sessions (session replay), when it has a session-replay project
  - Edit (details, capabilities and workspace) and Delete, for users who can change it
- `?edit=<id>` opens the edit dialog for that application (the detail page's Edit uses it)

### Application Detail Page (`/admin/applications/:id`)

- Overview: workspace, team, environment, framework, language, tags, versions (with an upgrade flag), repository and application URL, who registered and last changed it
- Status: governance (schedule, last scan and recent scans), accessibility (latest report's score and conformance), visual regression (test runs) and session replay (sessions); each loads on its own, so one failing doesn't hide the others
- Actions: run a governance scan, view test runs, view sessions, edit, delete

## Integration Points

### With Visual Regression Service
- When `visualRegression.enabled` is true and `argosProjectId` is provided:
  - Create or link to existing Argos project
  - Store project reference in application
  - Enable test run triggers

### With Session Replay Service
- When `sessionReplay.enabled` is true and `openreplayProjectKey` is provided:
  - Create or link to existing OpenReplay project
  - Store project reference in application
  - Configure privacy settings

### With Governance Service
- When `governance.enabled` is true:
  - Link application to compliance scanning
  - Apply selected rules (or all enabled rules if empty)
  - `daily` and `weekly` scans of the application URL are run by `GovernanceScanScheduler` (docs/GOVERNANCE.md, "Scheduled scans"). There's no on-commit schedule: have CI call `POST /api/v1/governance/scans` after each push

## Implementation Plan

1. **Backend**
   - Extend Application interface
   - Create ApplicationRegistrationService
   - Create DTOs for registration and updates
   - Update DesignSystemController with new endpoints
   - Integrate with VisualRegressionService and SessionReplayService

2. **Frontend**
   - Create ApplicationRegistration.vue page
   - Create ApplicationManagement.vue page
   - Add routes for registration and management
   - Add navigation links

3. **Integration**
   - Update existing services to check application capabilities
   - Add capability checks to scan endpoints
   - Link projects between services

