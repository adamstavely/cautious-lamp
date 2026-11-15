# Argos Visual Regression Testing Service

## Overview

Integrate Argos visual regression testing as a service capability that teams can use to test their applications. This service allows teams to configure, run, and monitor visual regression tests for their apps without needing to set up and maintain their own Argos infrastructure.

## Architecture

### Service Components

1. **Visual Regression Testing Dashboard** (`/tools/visual-regression`)
   - Project management interface
   - Test configuration UI
   - Results dashboard with diff visualization
   - Team/project access management

2. **Backend Service** (`/api/v1/visual-regression`)
   - Argos API integration
   - Project configuration management
   - Test execution orchestration
   - Results storage and retrieval
   - Webhook handling for CI/CD integration

3. **API Endpoints**
   - REST API for teams to integrate into their CI/CD pipelines
   - Webhook endpoints for Argos callbacks
   - Authentication and authorization

4. **CLI Integration**
   - Command-line tool for teams to trigger tests
   - Configuration file management
   - Local test preview

## Implementation Plan

### Phase 1: Core Infrastructure

#### 1.1 Backend Service (`backend/src/visual-regression/`)

```typescript
// visual-regression.service.ts
export class VisualRegressionService {
  // Create/manage projects
  async createProject(teamId: string, config: ProjectConfig): Promise<Project>
  async updateProject(projectId: string, config: Partial<ProjectConfig>): Promise<Project>
  async deleteProject(projectId: string): Promise<void>
  async getProjects(teamId: string): Promise<Project[]>
  
  // Test execution
  async triggerTest(projectId: string, options: TestOptions): Promise<TestRun>
  async getTestRun(runId: string): Promise<TestRun>
  async getTestRuns(projectId: string, filters: RunFilters): Promise<TestRun[]>
  
  // Results management
  async getTestResults(runId: string): Promise<TestResult[]>
  async approveDiff(resultId: string, userId: string): Promise<void>
  async rejectDiff(resultId: string, userId: string): Promise<void>
  
  // Argos integration
  private async syncWithArgos(project: Project): Promise<void>
  private async handleArgosWebhook(payload: ArgosWebhook): Promise<void>
}
```

#### 1.2 Database Schema

```sql
-- Projects table
CREATE TABLE visual_regression_projects (
  id UUID PRIMARY KEY,
  team_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  argos_project_id VARCHAR(255),
  argos_branch VARCHAR(255) DEFAULT 'main',
  argos_token_encrypted TEXT,
  config JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Test runs table
CREATE TABLE visual_regression_runs (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES visual_regression_projects(id),
  argos_build_id VARCHAR(255),
  status VARCHAR(50), -- 'pending', 'running', 'completed', 'failed'
  commit_sha VARCHAR(40),
  branch VARCHAR(255),
  triggered_by VARCHAR(255),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  results_summary JSONB
);

-- Test results table
CREATE TABLE visual_regression_results (
  id UUID PRIMARY KEY,
  run_id UUID REFERENCES visual_regression_runs(id),
  test_name VARCHAR(255),
  status VARCHAR(50), -- 'passed', 'failed', 'new', 'removed'
  diff_image_url TEXT,
  baseline_image_url TEXT,
  current_image_url TEXT,
  diff_percentage DECIMAL(5,2),
  approved BOOLEAN DEFAULT FALSE,
  approved_by VARCHAR(255),
  approved_at TIMESTAMP
);
```

#### 1.3 API Routes (`backend/src/routes/visual-regression.routes.ts`)

```typescript
// Project management
POST   /api/v1/visual-regression/projects
GET    /api/v1/visual-regression/projects
GET    /api/v1/visual-regression/projects/:id
PUT    /api/v1/visual-regression/projects/:id
DELETE /api/v1/visual-regression/projects/:id

// Test execution
POST   /api/v1/visual-regression/projects/:id/runs
GET    /api/v1/visual-regression/projects/:id/runs
GET    /api/v1/visual-regression/runs/:id
GET    /api/v1/visual-regression/runs/:id/results

// Results management
POST   /api/v1/visual-regression/results/:id/approve
POST   /api/v1/visual-regression/results/:id/reject

// Webhooks
POST   /api/v1/visual-regression/webhooks/argos

// Where build results are sent (manage access; see "Notifications" below)
GET    /api/v1/visual-regression/projects/:id/notifications
POST   /api/v1/visual-regression/projects/:id/notifications
DELETE /api/v1/visual-regression/projects/:id/notifications/:type
POST   /api/v1/visual-regression/projects/:id/notifications/:type/test
```

### Phase 2: Frontend Dashboard

#### 2.1 Main Dashboard Page (`frontend/src/views/VisualRegression.vue`)

**Features:**
- Project list with status indicators
- Quick stats (total tests, pass rate, recent runs)
- Recent test runs timeline
- Quick actions (trigger test, view results)

**Sections:**
1. **Hero Section**
   - Title: "Visual Regression Testing"
   - Description: "Catch visual bugs before they reach production. Automated visual testing powered by Argos."
   - CTA: "Create New Project"

2. **Projects Overview**
   - Grid/list view of all projects
   - Each card shows:
     - Project name and team
     - Last test run status
     - Pass rate percentage
     - Number of pending diffs
     - Last run timestamp

3. **Recent Activity**
   - Timeline of recent test runs across all projects
   - Filter by project, status, date range

#### 2.2 Project Configuration Page (`frontend/src/views/VisualRegressionProject.vue`)

**Features:**
- Project settings form
- Argos integration setup
- Test configuration
- Team member access management
- Webhook configuration for CI/CD

**Configuration Options:**
- Project name and description
- Argos project ID and branch
- Argos API token (encrypted storage)
- Test directories/paths
- Ignore patterns
- Screenshot options (viewport sizes, devices)
- Notification settings

#### 2.3 Test Results Page (`frontend/src/views/VisualRegressionResults.vue`)

**Features:**
- Test run details
- Side-by-side diff visualization
- Baseline vs current comparison
- Diff percentage and metrics
- Approve/reject actions
- Filter and search results
- Export results

**UI Components:**
- Image comparison slider
- Diff overlay toggle
- Zoom controls
- Fullscreen view
- Batch approve/reject

### Phase 3: Integration & Automation

#### 3.1 CI/CD Integration

**GitHub Actions Example:**
```yaml
name: Visual Regression Tests
on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  visual-regression:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Visual Regression Tests
        uses: design-system/visual-regression-action@v1
        with:
          api-endpoint: ${{ secrets.DS_API_ENDPOINT }}
          api-key: ${{ secrets.DS_API_KEY }}
          project-id: ${{ secrets.PROJECT_ID }}
          branch: ${{ github.ref }}
          commit-sha: ${{ github.sha }}
```

**CLI Tool:**
```bash
# Install
npm install -g @design-system/cli

# Configure
ds visual-regression config --project-id <id> --api-key <key>

# Run tests
ds visual-regression test --branch main

# View results
ds visual-regression results --run-id <id>
```

#### 3.2 API Client SDK

```typescript
import { VisualRegressionClient } from '@design-system/visual-regression-sdk';

const client = new VisualRegressionClient({
  apiEndpoint: 'https://design-system.example.com/api/v1',
  apiKey: process.env.DS_API_KEY
});

// Trigger test
const run = await client.projects.triggerTest(projectId, {
  branch: 'main',
  commitSha: 'abc123',
  options: {
    viewports: ['1920x1080', '768x1024'],
    browsers: ['chrome', 'firefox']
  }
});

// Get results
const results = await client.runs.getResults(run.id);

// Approve diff
await client.results.approve(resultId);
```

### Phase 4: Advanced Features

#### 4.1 Team Management
- Multi-team support
- Role-based access (viewer, tester, admin)
- Project sharing between teams
- Usage quotas and limits

#### 4.2 Analytics & Reporting
- Test coverage metrics
- Failure trend analysis
- Performance metrics (test duration)
- Cost tracking (Argos usage)

#### 4.3 Notifications

Implemented. See [Notifications](#notifications).

#### 4.4 Baseline Management
- Manual baseline updates
- Baseline versioning
- Baseline comparison
- Automatic baseline promotion rules

## User Flow

### Setting Up a New Project

1. Navigate to `/tools/visual-regression`
2. Click "Create New Project"
3. Fill in project details:
   - Project name
   - Team/organization
   - Description
4. Configure Argos integration:
   - Enter Argos project ID
   - Enter Argos API token
   - Select branch
5. Configure test settings:
   - Test directories
   - Viewport sizes
   - Browsers/devices
   - Ignore patterns
6. Save configuration
7. System validates Argos connection
8. Project is ready for testing

### Running Tests

**Via Dashboard:**
1. Navigate to project page
2. Click "Run Tests"
3. Select branch and commit (optional)
4. Configure test options
5. Trigger test
6. Monitor progress
7. View results when complete

**Via CI/CD:**
1. Push code to repository
2. CI/CD pipeline triggers
3. Tests run automatically
4. Results posted to PR/commit
5. Team reviews diffs
6. Approve or fix issues

### Reviewing Results

1. Navigate to test run results
2. View list of all test results
3. Filter by status (passed, failed, new, removed)
4. Click on a result to view diff
5. Compare baseline vs current
6. Review diff percentage and areas
7. Approve if expected, reject if bug
8. Fix issues and re-run if needed

## Security & Access Control

- **Authentication**: Use existing design system auth
- **Authorization**: RBAC-based project access
- **API Keys**: Encrypted storage, team-scoped
- **Argos Tokens**: Encrypted at rest, never exposed in API responses
- **Audit Logging**: Track all test runs and approvals

## Pricing/Quota Model

- **Free Tier**: 
  - 5 projects per team
  - 100 test runs/month
  - 7-day result retention
  
- **Pro Tier**:
  - Unlimited projects
  - 1000 test runs/month
  - 90-day result retention
  - Priority support

- **Enterprise Tier**:
  - Custom limits
  - Unlimited retention
  - Dedicated support
  - SLA guarantees

## Technical Considerations

### Argos API Integration
- Use Argos REST API for all operations
- Handle rate limiting
- Implement retry logic
- Cache project metadata
- Webhook signature verification

### Performance
- Async test execution
- Background job processing
- Image CDN for diff visualization
- Pagination for large result sets
- Caching of frequently accessed data

### Scalability
- Queue-based test execution
- Horizontal scaling for API
- Database indexing strategy
- Image storage optimization
- CDN for static assets

## Future Enhancements

1. **Multi-browser Testing**: Support for multiple browsers/devices
2. **Component-level Testing**: Test individual components in isolation
3. **Visual AI**: AI-powered diff analysis and auto-approval
4. **Performance Testing**: Combine with performance metrics
5. **Accessibility Testing**: Integrate with accessibility checks
6. **Mobile App Testing**: Support for React Native, Flutter
7. **Test Templates**: Pre-configured test setups for common frameworks

## Documentation

- **Getting Started Guide**: Step-by-step setup instructions
- **API Documentation**: Complete API reference
- **CI/CD Integration Guides**: Examples for common platforms
- **Best Practices**: Recommendations for effective visual testing
- **Troubleshooting**: Common issues and solutions

## Success Metrics

- Number of teams using the service
- Number of projects configured
- Test runs per month
- Bugs caught before production
- Time saved vs manual testing
- User satisfaction scores

## Notifications

When a run's Argos build finishes, its result is sent to the project's notification channels: email recipients, a Slack incoming webhook, a Microsoft Teams incoming webhook, and a generic webhook signed with HMAC-SHA256. Set them up on the project's **Settings** tab under **Send build results** (separate from **Build notifications**, which is how CI tells this app about a new upload), where each channel has **Send test** and the last 30 days of deliveries are listed with their status.

- **When.** Once per run, the first time its build result is saved with a final Argos status (`no-changes`, `changes-detected`, `accepted`, `rejected` → completed; `error`, `aborted`, `expired` → failed), whether that comes from CI's signed build notification, a sync or opening the results. Later status changes (accepting the build in Argos) and refreshes don't send again. Builds that started more than 24 hours before their result is first saved (history found by a first sync) don't notify.
- **What.** The title says whether the build passed, found changed screenshots, or failed (`Visual regression: Marketing site found 2 changed screenshots`); the text gives the branch, commit and the screenshot counts, and links to the run (with `APP_PUBLIC_URL` set). Webhooks receive event `visual-regression.build.completed` or `visual-regression.build.failed` with `data: { projectId, runId, argosBuildId, argosBuildNumber, argosStatus, argosUrl, status, branch, commitSha, summary }`.
- **Who can change them.** People with `manage` access to the project (editors; admins for application-linked projects). Viewers see a note that only editors can see these settings.
- **Secrets.** Slack, Teams and webhook URLs and the webhook signing secret are stored encrypted (`ENCRYPTION_KEY`) and never returned. A webhook saved with a new URL and no secret gets a generated one, shown once.
- **API.** `POST /projects/:id/notifications` takes `{ type, enabled?, recipients? (email), url? (slack, teams, webhook), secret? (webhook) }`; fields left out keep their saved value, so `{ type, enabled: false }` only turns a channel off. `GET` answers `{ channels, availability, attempts }`. Settings saved before delivery existed (the old free-form `config`) are ignored and must be saved again.

Email needs SMTP on the server; without it the panel says so and nothing is emailed. Delivery, egress checks, retries and webhook signatures work as described in [NOTIFICATIONS.md](NOTIFICATIONS.md).
