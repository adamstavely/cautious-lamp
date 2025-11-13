# Getting Started: Visual Regression Testing

Visual regression testing helps ensure your UI doesn't change unexpectedly. This guide shows you how to set up Argos CI integration.

## What is Visual Regression Testing?

Visual regression testing:
- Captures screenshots of your UI
- Compares screenshots between versions
- Highlights visual differences
- Prevents unintended UI changes

## Prerequisites

- Argos CI account (https://app.argos-ci.com)
- Argos project created
- Argos API token

## Setting Up Argos Integration

### 1. Get Your Argos Credentials

1. Log in to Argos CI
2. Create a new project (or use existing)
3. Go to project settings
4. Generate an API token
5. Note your project ID

### 2. Create Visual Regression Project

#### Via API

```bash
curl -X POST http://localhost:3000/api/v1/visual-regression/projects \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "teamId": "your-team-id",
    "name": "My Visual Regression Project",
    "description": "Visual tests for main application",
    "argosProjectId": "your-argos-project-id",
    "argosToken": "your-argos-api-token",
    "argosBaseUrl": "https://app.argos-ci.com",
    "argosBranch": "main",
    "config": {
      "testDirectories": ["tests/visual"],
      "viewports": ["1920x1080", "768x1024", "375x667"],
      "browsers": ["chromium"]
    }
  }'
```

#### Via UI

1. Navigate to Visual Regression section
2. Click "Create Project"
3. Enter project details
4. Configure Argos settings:
   - Project ID
   - API Token
   - Base URL (if self-hosted)
   - Branch name
5. Configure test settings
6. Save

### 3. Using OAuth (Optional)

Instead of API tokens, you can use OAuth:

1. Configure OAuth in project settings
2. Authorize the application
3. Tokens will be automatically refreshed

## Running Visual Tests

### Trigger Test Run

```bash
curl -X POST http://localhost:3000/api/v1/visual-regression/projects/PROJECT_ID/runs \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "branch": "feature/new-component",
    "commitSha": "abc123"
  }'
```

### View Test Results

```bash
curl http://localhost:3000/api/v1/visual-regression/projects/PROJECT_ID/runs \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## Webhook Configuration

Set up webhooks to receive test results automatically:

1. Get webhook URL from your project settings
2. Configure in Argos CI:
   - Go to project settings
   - Add webhook URL
   - Select events (build.completed, screenshot.approved, etc.)

## Test Configuration

### Viewports

Test different screen sizes:

```json
{
  "viewports": ["1920x1080", "768x1024", "375x667"]
}
```

### Browsers

Test in different browsers:

```json
{
  "browsers": ["chromium", "firefox", "webkit"]
}
```

### Screenshot Options

```json
{
  "screenshotOptions": {
    "fullPage": true,
    "waitForSelector": ".component-loaded",
    "waitForTimeout": 1000
  }
}
```

## Reviewing Results

### View Test Runs

1. Navigate to Visual Regression project
2. View test runs list
3. Click on a run to see details

### Approve/Reject Screenshots

```bash
# Approve a screenshot
curl -X POST http://localhost:3000/api/v1/visual-regression/results/RESULT_ID/approve \
  -H "Authorization: Bearer YOUR_API_KEY"

# Reject a screenshot
curl -X POST http://localhost:3000/api/v1/visual-regression/results/RESULT_ID/reject \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## CI/CD Integration

See [CI_CD_ARGOS_INTEGRATION.md](./CI_CD_ARGOS_INTEGRATION.md) for detailed CI/CD setup.

## Best Practices

1. **Test critical paths**: Focus on important user flows
2. **Use consistent viewports**: Test same sizes across runs
3. **Review regularly**: Don't let diffs accumulate
4. **Document changes**: Explain why screenshots changed
5. **Use branches**: Test feature branches before merging

## Troubleshooting

- **Connection issues**: Verify API token and base URL
- **Missing screenshots**: Check test configuration
- **False positives**: Adjust screenshot options
- See [TROUBLESHOOTING_INTEGRATIONS.md](./TROUBLESHOOTING_INTEGRATIONS.md) for more

## Next Steps

- [CI/CD Integration Guide](./CI_CD_ARGOS_INTEGRATION.md)
- [Argos API Documentation](./ARGOS_API_INTEGRATION.md)
- [Troubleshooting Guide](./TROUBLESHOOTING_INTEGRATIONS.md)

