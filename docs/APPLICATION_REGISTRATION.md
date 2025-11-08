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
      scanSchedule?: 'manual' | 'daily' | 'weekly' | 'on-commit';
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

Query Parameters:
- `teamId` (optional): Filter by team
- `capability` (optional): Filter by enabled capability (governance, visualRegression, sessionReplay)

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

### Application Management Page

- List of all registered applications
- Filter by team, capability, environment
- Quick actions:
  - View details
  - Edit capabilities
  - Run scan (governance)
  - View test runs (visual regression)
  - View sessions (session replay)
  - Delete application

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
  - Schedule scans based on `scanSchedule`

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

