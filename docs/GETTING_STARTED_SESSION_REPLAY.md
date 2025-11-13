# Getting Started: Session Replay

Session replay lets you see exactly what users do in your application. This guide shows you how to set up OpenReplay integration.

## What is Session Replay?

Session replay:
- Records user sessions
- Shows user interactions
- Helps debug issues
- Provides user behavior insights

## Prerequisites

- OpenReplay account (https://openreplay.com)
- OpenReplay project created
- OpenReplay API key (optional, for advanced features)

## Setting Up OpenReplay Integration

### 1. Get Your OpenReplay Credentials

1. Log in to OpenReplay
2. Create a new project
3. Note your project key
4. (Optional) Generate an API key for advanced features

### 2. Create Session Replay Project

#### Via API

```bash
curl -X POST http://localhost:3000/api/v1/session-replay/projects \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "teamId": "your-team-id",
    "name": "My Session Replay Project",
    "description": "Session replay for main application",
    "openreplayProjectKey": "your-project-key",
    "openreplayBaseUrl": "https://api.openreplay.com",
    "applicationUrl": "https://myapp.com",
    "privacySettings": {
      "maskAllInputs": true,
      "maskAllText": false,
      "respectDoNotTrack": true
    },
    "config": {
      "captureConsole": true,
      "captureNetwork": true,
      "captureIFrames": false
    }
  }'
```

#### Via UI

1. Navigate to Session Replay section
2. Click "Create Project"
3. Enter project details
4. Configure OpenReplay settings:
   - Project Key
   - Base URL (if self-hosted)
   - Application URL
5. Configure privacy settings
6. Configure capture options
7. Save

### 3. Using OAuth (Optional)

Instead of API keys, you can use OAuth:

1. Configure OAuth in project settings
2. Authorize the application
3. Tokens will be automatically refreshed

## Integration Code

Get integration code for your application:

```bash
curl http://localhost:3000/api/v1/session-replay/projects/PROJECT_ID/integration-code \
  -H "Authorization: Bearer YOUR_API_KEY"
```

The response includes JavaScript code to add to your application.

### Adding to Your Application

1. Copy the integration code
2. Add to your HTML (before closing `</body>` tag)
3. Or add to your JavaScript bundle

## Privacy Settings

Configure what to capture:

### Mask Inputs

```json
{
  "maskAllInputs": true
}
```

### Mask Text

```json
{
  "maskAllText": false,
  "maskTextSelector": [".sensitive", "#private"]
}
```

### Block Selectors

```json
{
  "blockSelector": [".no-record", "#skip"]
}
```

### Respect Do Not Track

```json
{
  "respectDoNotTrack": true
}
```

## Viewing Sessions

### Search Sessions

```bash
curl "http://localhost:3000/api/v1/session-replay/projects/PROJECT_ID/sessions?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Get Session Details

```bash
curl http://localhost:3000/api/v1/session-replay/projects/PROJECT_ID/sessions/SESSION_ID \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Get Session Replay URL

```bash
curl http://localhost:3000/api/v1/session-replay/projects/PROJECT_ID/sessions/SESSION_ID/replay-url \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## Heatmaps

Generate heatmaps from session data:

```bash
curl http://localhost:3000/api/v1/session-replay/projects/PROJECT_ID/heatmaps \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## CI/CD Integration

See [CI_CD_OPENREPLAY_INTEGRATION.md](./CI_CD_OPENREPLAY_INTEGRATION.md) for detailed CI/CD setup.

## Best Practices

1. **Respect privacy**: Mask sensitive data
2. **Configure capture**: Only capture what you need
3. **Monitor storage**: Session data can be large
4. **Use filters**: Focus on relevant sessions
5. **Review regularly**: Identify patterns and issues

## Troubleshooting

- **No sessions recorded**: Check integration code is added
- **Missing data**: Verify privacy settings
- **Connection issues**: Check API key and base URL
- See [TROUBLESHOOTING_INTEGRATIONS.md](./TROUBLESHOOTING_INTEGRATIONS.md) for more

## Next Steps

- [CI/CD Integration Guide](./CI_CD_OPENREPLAY_INTEGRATION.md)
- [OpenReplay Service Documentation](./OPENREPLAY_SERVICE.md)
- [Troubleshooting Guide](./TROUBLESHOOTING_INTEGRATIONS.md)

