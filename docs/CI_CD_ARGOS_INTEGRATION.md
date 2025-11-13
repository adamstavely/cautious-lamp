# CI/CD Integration: Argos Visual Regression

This guide shows you how to integrate Argos visual regression testing into your CI/CD pipeline.

## Overview

Argos CI integration allows you to:
- Run visual regression tests automatically
- Block deployments on visual changes
- Review visual diffs in pull requests
- Track visual changes over time

## GitHub Actions

### Basic Setup

Create `.github/workflows/visual-regression.yml`:

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
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run visual regression tests
        env:
          ARGOS_TOKEN: ${{ secrets.ARGOS_TOKEN }}
          ARGOS_PROJECT_ID: ${{ secrets.ARGOS_PROJECT_ID }}
        run: |
          npm run test:visual
          npx @argos-ci/cli upload ./screenshots \
            --token $ARGOS_TOKEN \
            --project $ARGOS_PROJECT_ID \
            --branch ${{ github.head_ref || github.ref_name }} \
            --commit ${{ github.sha }}
```

### Advanced Setup with Review

```yaml
name: Visual Regression Tests

on:
  pull_request:
    branches: [main]

jobs:
  visual-regression:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
      
      - name: Run visual regression tests
        env:
          ARGOS_TOKEN: ${{ secrets.ARGOS_TOKEN }}
          ARGOS_PROJECT_ID: ${{ secrets.ARGOS_PROJECT_ID }}
        run: |
          npm run test:visual
          npx @argos-ci/cli upload ./screenshots \
            --token $ARGOS_TOKEN \
            --project $ARGOS_PROJECT_ID \
            --branch ${{ github.head_ref }} \
            --commit ${{ github.sha }} \
            --base-branch main
      
      - name: Comment PR with results
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            // Get Argos build URL and comment on PR
            const buildUrl = `https://app.argos-ci.com/builds/${process.env.ARGOS_BUILD_ID}`;
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `Visual regression tests completed. [View results](${buildUrl})`
            });
```

## GitLab CI

### Basic Setup

Create `.gitlab-ci.yml`:

```yaml
visual-regression:
  image: node:18
  stage: test
  script:
    - npm ci
    - npm run test:visual
    - npx @argos-ci/cli upload ./screenshots
        --token $ARGOS_TOKEN
        --project $ARGOS_PROJECT_ID
        --branch $CI_COMMIT_REF_NAME
        --commit $CI_COMMIT_SHA
  only:
    - merge_requests
    - main
  variables:
    ARGOS_TOKEN: $ARGOS_TOKEN
    ARGOS_PROJECT_ID: $ARGOS_PROJECT_ID
```

## Jenkins

### Pipeline Setup

Create `Jenkinsfile`:

```groovy
pipeline {
  agent any
  
  environment {
    ARGOS_TOKEN = credentials('argos-token')
    ARGOS_PROJECT_ID = 'your-project-id'
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
    
    stage('Visual Regression') {
      steps {
        sh 'npm run test:visual'
        sh """
          npx @argos-ci/cli upload ./screenshots \\
            --token $ARGOS_TOKEN \\
            --project $ARGOS_PROJECT_ID \\
            --branch ${env.BRANCH_NAME} \\
            --commit ${env.GIT_COMMIT}
        """
      }
    }
  }
  
  post {
    always {
      // Cleanup
    }
    success {
      // Notify on success
    }
    failure {
      // Notify on failure
    }
  }
}
```

## Configuration

### Environment Variables

Set these in your CI/CD environment:

- `ARGOS_TOKEN`: Your Argos API token
- `ARGOS_PROJECT_ID`: Your Argos project ID
- `ARGOS_BASE_URL`: Argos base URL (if self-hosted)

### Test Script

Add to `package.json`:

```json
{
  "scripts": {
    "test:visual": "playwright test --grep @visual"
  }
}
```

### Playwright Example

```typescript
import { test, expect } from '@playwright/test';

test('Button component @visual', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.screenshot({ path: 'screenshots/button.png' });
});
```

## Best Practices

1. **Run on PRs**: Catch visual changes before merge
2. **Use base branch**: Compare against main branch
3. **Review diffs**: Don't auto-approve all changes
4. **Block on failures**: Prevent deployment on visual regressions
5. **Cache dependencies**: Speed up CI runs

## Troubleshooting

### Tests Not Running

- Verify secrets are set correctly
- Check CI/CD logs for errors
- Verify Argos credentials

### Screenshots Not Uploading

- Check file paths
- Verify Argos CLI is installed
- Check network connectivity

See [TROUBLESHOOTING_INTEGRATIONS.md](./TROUBLESHOOTING_INTEGRATIONS.md) for more.

## Next Steps

- [Visual Regression Setup Guide](./GETTING_STARTED_VISUAL_REGRESSION.md)
- [Argos API Documentation](./ARGOS_API_INTEGRATION.md)
- [Troubleshooting Guide](./TROUBLESHOOTING_INTEGRATIONS.md)

