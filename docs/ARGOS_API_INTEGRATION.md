# Argos API Integration Guide

## Overview

The Visual Regression Testing service integrates with the open-source, self-hosted Argos visual regression testing platform. This guide explains how the integration works and how to configure it.

## Argos API Client

The `ArgosApiClient` class (`backend/src/visual-regression/argos-api.client.ts`) handles all communication with Argos instances.

### Features

- **Self-hosted Support**: Works with any Argos instance URL
- **Authentication**: Bearer token authentication
- **Project Management**: Verify and fetch projects
- **Build Management**: Create, fetch, and monitor builds
- **Screenshot Management**: Get screenshots, approve/reject diffs
- **Image URL Handling**: Handles both absolute and relative image URLs

### API Endpoints Used

The client assumes the following Argos API structure (adjust if your Argos instance uses different endpoints):

```
GET  /api/projects                    - List projects (for connection verification)
GET  /api/projects/:id                - Get project details
POST /api/projects/:id/builds         - Create a new build
GET  /api/projects/:id/builds         - List builds for a project
GET  /api/projects/:id/builds/:buildId - Get build details
GET  /api/projects/:id/builds/:buildId/screenshots - Get screenshots for a build
POST /api/projects/:id/builds/:buildId/screenshots/:screenshotId/approve - Approve screenshot
POST /api/projects/:id/builds/:buildId/screenshots/:screenshotId/reject - Reject screenshot
```

**Note**: These endpoints may need to be adjusted based on your Argos instance's actual API structure. Check your Argos documentation for the correct endpoints.

## Configuration

### Environment Variables

```bash
# Optional: Default Argos base URL if not specified per project
ARGOS_BASE_URL=https://argos.example.com
```

### Project Configuration

When creating a project, teams must provide:

1. **Argos Base URL**: The URL of their self-hosted Argos instance
   - Example: `https://argos.example.com`
   - If not provided, defaults to `ARGOS_BASE_URL` env var or `https://app.argos-ci.com`

2. **Argos Project ID**: The identifier of the project in Argos
   - Format: Usually `org/project` or just the project ID
   - Example: `my-org/my-app`

3. **Argos API Token**: Authentication token for the Argos instance
   - Stored securely (should be encrypted in production)
   - Never returned in API responses

4. **Branch**: Default branch for test runs
   - Example: `main`, `develop`

## How It Works

### 1. Project Creation

When a team creates a project:
1. System verifies connection to Argos instance
2. Verifies that the project exists in Argos
3. Stores project configuration (token encrypted)
4. Project is ready for testing

### 2. Test Execution

When a test is triggered:
1. System creates a build in Argos via API
2. Argos build ID is stored and linked to our test run
3. System polls Argos for build status updates
4. When build completes, screenshots are fetched
5. Results are displayed in the dashboard

### 3. Results Management

- Screenshots are fetched from Argos
- Image URLs are normalized (handles relative/absolute)
- Approve/reject actions are sent to Argos
- Local state is kept in sync with Argos

### 4. Status Polling

- System polls Argos every 5 seconds for build status
- Maximum polling duration: 10 minutes
- When build completes, results are automatically fetched
- Status is updated in real-time

## API Response Mapping

### Argos Build Status → Test Run Status

- `pending` → `pending`
- `progress` → `running`
- `stable` → `completed`
- `error` → `failed`

### Argos Screenshot Status → Test Result Status

- `stable` → `passed`
- `failure` → `failed`
- `new` → `new`
- `removed` → `removed`

## Error Handling

The integration handles various error scenarios:

- **Connection Errors**: Network failures, unreachable instances
- **Authentication Errors**: Invalid tokens, expired credentials
- **Not Found Errors**: Project/build doesn't exist in Argos
- **API Errors**: Unexpected responses from Argos

All errors are logged and user-friendly messages are returned.

## Webhook Support

A webhook endpoint is available at `/api/v1/visual-regression/webhooks/argos` for Argos to notify the system when builds complete. This reduces the need for polling.

**Note**: Webhook payload structure depends on your Argos instance. Update the handler based on your Argos webhook format.

## Security Considerations

1. **Token Storage**: API tokens should be encrypted at rest
2. **Token Transmission**: Tokens are never returned in API responses
3. **HTTPS**: Always use HTTPS for Argos instance URLs
4. **Validation**: All Argos URLs and project IDs are validated

## Customization

If your Argos instance uses different API endpoints or response formats:

1. Update `ArgosApiClient` methods to match your API structure
2. Adjust response parsing in `fetchBuildResults`
3. Update status mapping functions if status values differ
4. Modify webhook handler if webhook format differs

## Testing

To test the integration:

1. Set up a self-hosted Argos instance
2. Create a test project in Argos
3. Generate an API token
4. Create a project in the design system with these credentials
5. Trigger a test run
6. Verify results appear correctly

## Troubleshooting

### Connection Issues

- Verify Argos instance is accessible
- Check base URL format (no trailing slash)
- Verify API token is valid
- Check network/firewall settings

### Authentication Issues

- Verify token has correct permissions
- Check token hasn't expired
- Ensure Bearer token format is correct

### Build Not Starting

- Verify project ID is correct
- Check branch exists in Argos
- Verify Argos instance is running
- Check Argos logs for errors

### Results Not Appearing

- Wait for build to complete (polling may take time)
- Check build status in Argos directly
- Verify screenshots were uploaded to Argos
- Check image URLs are accessible

