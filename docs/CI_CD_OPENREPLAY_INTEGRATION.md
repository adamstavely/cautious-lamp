# CI/CD Integration: OpenReplay Session Replay

This guide shows you how to integrate OpenReplay session replay into your CI/CD pipeline for automated testing and monitoring.

## Overview

OpenReplay integration allows you to:
- Record test sessions automatically
- Monitor production sessions
- Debug issues in CI/CD
- Track user behavior

## GitHub Actions

### Basic Setup

Create `.github/workflows/session-replay.yml`:

```yaml
name: Session Replay Tests

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  session-replay:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Start application
        run: npm run start &
        env:
          OPENREPLAY_PROJECT_KEY: ${{ secrets.OPENREPLAY_PROJECT_KEY }}
      
      - name: Run E2E tests with replay
        run: npm run test:e2e
      
      - name: Upload session data
        if: always()
        run: |
          # Process and upload session data if needed
          echo "Session replay data collected"
```

### Advanced Setup with Monitoring

```yaml
name: Session Replay Monitoring

on:
  schedule:
    - cron: '0 * * * *'  # Every hour
  workflow_dispatch:

jobs:
  monitor-sessions:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Check session health
        env:
          OPENREPLAY_API_KEY: ${{ secrets.OPENREPLAY_API_KEY }}
          OPENREPLAY_PROJECT_KEY: ${{ secrets.OPENREPLAY_PROJECT_KEY }}
        run: |
          node scripts/check-sessions.js
      
      - name: Alert on issues
        if: failure()
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: 'Session Replay Health Check Failed',
              body: 'Session replay monitoring detected issues.'
            });
```

## GitLab CI

### Basic Setup

Create `.gitlab-ci.yml`:

```yaml
session-replay:
  image: node:18
  stage: test
  script:
    - npm ci
    - npm run start &
    - sleep 5
    - npm run test:e2e
  environment:
    name: test
    variables:
      OPENREPLAY_PROJECT_KEY: $OPENREPLAY_PROJECT_KEY
  only:
    - merge_requests
    - main
```

## Jenkins

### Pipeline Setup

Create `Jenkinsfile`:

```groovy
pipeline {
  agent any
  
  environment {
    OPENREPLAY_PROJECT_KEY = credentials('openreplay-project-key')
    OPENREPLAY_API_KEY = credentials('openreplay-api-key')
  }
  
  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }
    
    stage('Install') {
      steps {
        sh 'npm ci'
      }
    }
    
    stage('Session Replay Tests') {
      steps {
        sh 'npm run start &'
        sh 'sleep 5'
        sh 'npm run test:e2e'
      }
    }
  }
}
```

## Integration Code

Add OpenReplay to your test application:

```html
<script>
  !function(e,t,s,n,a,o,i){e[a]=e[a]||function(){(e[a].q=e[a].q||[]).push(arguments)},n=t.createElement(s),o=t.getElementsByTagName(s)[0],n.async=1,n.src=i,o.parentNode.insertBefore(n,o)}(window,document,"script",0,"openReplay","https://static.openreplay.com/3.5.0/openreplay.js",{projectKey:"YOUR_PROJECT_KEY"});
</script>
```

Or via environment variable:

```javascript
// In your test setup
process.env.OPENREPLAY_PROJECT_KEY = 'your-project-key';
```

## Configuration

### Environment Variables

Set these in your CI/CD environment:

- `OPENREPLAY_PROJECT_KEY`: Your OpenReplay project key
- `OPENREPLAY_API_KEY`: Your OpenReplay API key (for advanced features)
- `OPENREPLAY_BASE_URL`: OpenReplay base URL (if self-hosted)

### Test Configuration

Configure OpenReplay in your tests:

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    // OpenReplay will automatically record sessions
    baseURL: 'http://localhost:3000',
  },
  // Configure OpenReplay
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});
```

## Best Practices

1. **Record test sessions**: Capture E2E test sessions for debugging
2. **Monitor production**: Track real user sessions
3. **Privacy first**: Mask sensitive data
4. **Filter sessions**: Focus on relevant sessions
5. **Alert on errors**: Set up alerts for critical issues

## Troubleshooting

### Sessions Not Recording

- Verify project key is set
- Check integration code is added
- Verify network connectivity

### Missing Data

- Check privacy settings
- Verify capture configuration
- Check API key permissions

See [TROUBLESHOOTING_INTEGRATIONS.md](./TROUBLESHOOTING_INTEGRATIONS.md) for more.

## Next Steps

- [Session Replay Setup Guide](./GETTING_STARTED_SESSION_REPLAY.md)
- [OpenReplay Service Documentation](./OPENREPLAY_SERVICE.md)
- [Troubleshooting Guide](./TROUBLESHOOTING_INTEGRATIONS.md)

