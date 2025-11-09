# Argos Visual Regression - CI/CD Integration

This guide provides examples for integrating Argos visual regression testing into your CI/CD pipelines.

## GitHub Actions

### Basic Example

```yaml
name: Visual Regression Tests

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

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
          DESIGN_SYSTEM_API_KEY: ${{ secrets.DESIGN_SYSTEM_API_KEY }}
        run: |
          # Install Argos CLI
          npm install -g @argos-ci/cli
          
          # Run tests and upload to Argos
          argos upload ./screenshots \
            --token $ARGOS_TOKEN \
            --branch ${{ github.head_ref || github.ref_name }} \
            --commit ${{ github.sha }}
      
      - name: Trigger Design System Platform
        run: |
          curl -X POST "https://api.designsystem.com/api/v1/visual-regression/projects/${{ secrets.PROJECT_ID }}/runs" \
            -H "Authorization: Bearer $DESIGN_SYSTEM_API_KEY" \
            -H "Content-Type: application/json" \
            -d '{
              "branch": "${{ github.head_ref || github.ref_name }}",
              "commitSha": "${{ github.sha }}"
            }'
```

### Advanced Example with Status Checks

```yaml
name: Visual Regression Tests

on:
  pull_request:
    branches: [main, develop]

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
        id: argos
        env:
          ARGOS_TOKEN: ${{ secrets.ARGOS_TOKEN }}
          DESIGN_SYSTEM_API_KEY: ${{ secrets.DESIGN_SYSTEM_API_KEY }}
        run: |
          npm install -g @argos-ci/cli
          
          argos upload ./screenshots \
            --token $ARGOS_TOKEN \
            --branch ${{ github.head_ref }} \
            --commit ${{ github.sha }} \
            --parallel
          
          # Get build ID from Argos
          BUILD_ID=$(argos get-build-id --branch ${{ github.head_ref }} --commit ${{ github.sha }})
          echo "build_id=$BUILD_ID" >> $GITHUB_OUTPUT
      
      - name: Trigger Design System Platform
        id: trigger
        run: |
          RESPONSE=$(curl -X POST "https://api.designsystem.com/api/v1/visual-regression/projects/${{ secrets.PROJECT_ID }}/runs" \
            -H "Authorization: Bearer $DESIGN_SYSTEM_API_KEY" \
            -H "Content-Type: application/json" \
            -d '{
              "branch": "${{ github.head_ref }}",
              "commitSha": "${{ github.sha }}"
            }')
          
          RUN_ID=$(echo $RESPONSE | jq -r '.id')
          echo "run_id=$RUN_ID" >> $GITHUB_OUTPUT
      
      - name: Wait for results
        run: |
          RUN_ID="${{ steps.trigger.outputs.run_id }}"
          MAX_WAIT=600  # 10 minutes
          WAIT_TIME=0
          
          while [ $WAIT_TIME -lt $MAX_WAIT ]; do
            STATUS=$(curl -s "https://api.designsystem.com/api/v1/visual-regression/runs/$RUN_ID" \
              -H "Authorization: Bearer $DESIGN_SYSTEM_API_KEY" | jq -r '.status')
            
            if [ "$STATUS" = "completed" ]; then
              echo "Tests completed"
              break
            elif [ "$STATUS" = "failed" ]; then
              echo "Tests failed"
              exit 1
            fi
            
            sleep 10
            WAIT_TIME=$((WAIT_TIME + 10))
          done
      
      - name: Check results
        run: |
          RUN_ID="${{ steps.trigger.outputs.run_id }}"
          RESULTS=$(curl -s "https://api.designsystem.com/api/v1/visual-regression/runs/$RUN_ID/results" \
            -H "Authorization: Bearer $DESIGN_SYSTEM_API_KEY")
          
          FAILED=$(echo $RESULTS | jq '[.[] | select(.status == "failed")] | length')
          
          if [ "$FAILED" -gt 0 ]; then
            echo "❌ $FAILED visual regression test(s) failed"
            echo "View results: https://designsystem.com/tools/visual-regression/${{ secrets.PROJECT_ID }}/runs/$RUN_ID"
            exit 1
          else
            echo "✅ All visual regression tests passed"
          fi
      
      - name: Comment PR with results
        if: always()
        uses: actions/github-script@v6
        with:
          script: |
            const runId = '${{ steps.trigger.outputs.run_id }}';
            const resultsUrl = `https://designsystem.com/tools/visual-regression/${{ secrets.PROJECT_ID }}/runs/${runId}`;
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## Visual Regression Tests
              
              View detailed results: ${resultsUrl}
              
              Run ID: \`${runId}\`
              `
            });
```

## GitLab CI

### Basic Example

```yaml
stages:
  - test

visual-regression:
  stage: test
  image: node:18
  before_script:
    - npm ci
    - npm install -g @argos-ci/cli
  script:
    - npm run build
    - npm run test:visual
    - |
      argos upload ./screenshots \
        --token $ARGOS_TOKEN \
        --branch $CI_COMMIT_REF_NAME \
        --commit $CI_COMMIT_SHA
    - |
      curl -X POST "https://api.designsystem.com/api/v1/visual-regression/projects/$PROJECT_ID/runs" \
        -H "Authorization: Bearer $DESIGN_SYSTEM_API_KEY" \
        -H "Content-Type: application/json" \
        -d "{
          \"branch\": \"$CI_COMMIT_REF_NAME\",
          \"commitSha\": \"$CI_COMMIT_SHA\"
        }"
  variables:
    ARGOS_TOKEN: $ARGOS_TOKEN
    DESIGN_SYSTEM_API_KEY: $DESIGN_SYSTEM_API_KEY
    PROJECT_ID: $PROJECT_ID
  only:
    - merge_requests
    - main
    - develop
```

## Jenkins

### Jenkinsfile Example

```groovy
pipeline {
    agent any
    
    environment {
        ARGOS_TOKEN = credentials('argos-token')
        DESIGN_SYSTEM_API_KEY = credentials('design-system-api-key')
        PROJECT_ID = 'your-project-id'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }
        
        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
        
        stage('Visual Regression Tests') {
            steps {
                sh '''
                    npm install -g @argos-ci/cli
                    npm run test:visual
                    argos upload ./screenshots \
                        --token $ARGOS_TOKEN \
                        --branch $GIT_BRANCH \
                        --commit $GIT_COMMIT
                '''
            }
        }
        
        stage('Trigger Design System Platform') {
            steps {
                script {
                    def response = sh(
                        script: """
                            curl -X POST "https://api.designsystem.com/api/v1/visual-regression/projects/${PROJECT_ID}/runs" \
                                -H "Authorization: Bearer ${DESIGN_SYSTEM_API_KEY}" \
                                -H "Content-Type: application/json" \
                                -d '{
                                    "branch": "${env.GIT_BRANCH}",
                                    "commitSha": "${env.GIT_COMMIT}"
                                }'
                        """,
                        returnStdout: true
                    )
                    
                    def json = readJSON text: response
                    env.RUN_ID = json.id
                }
            }
        }
        
        stage('Wait for Results') {
            steps {
                script {
                    def maxWait = 600 // 10 minutes
                    def waitTime = 0
                    
                    while (waitTime < maxWait) {
                        def statusResponse = sh(
                            script: """
                                curl -s "https://api.designsystem.com/api/v1/visual-regression/runs/${env.RUN_ID}" \
                                    -H "Authorization: Bearer ${DESIGN_SYSTEM_API_KEY}"
                            """,
                            returnStdout: true
                        )
                        
                        def statusJson = readJSON text: statusResponse
                        def status = statusJson.status
                        
                        if (status == 'completed') {
                            echo "Tests completed"
                            break
                        } else if (status == 'failed') {
                            error "Tests failed"
                        }
                        
                        sleep(time: 10, unit: 'SECONDS')
                        waitTime += 10
                    }
                }
            }
        }
    }
    
    post {
        always {
            script {
                if (env.RUN_ID) {
                    echo "View results: https://designsystem.com/tools/visual-regression/${PROJECT_ID}/runs/${env.RUN_ID}"
                }
            }
        }
    }
}
```

## CLI Tool

### Installation

```bash
npm install -g @design-system/cli
```

### Usage

```bash
# Configure
ds config set api-key YOUR_API_KEY
ds config set project-id YOUR_PROJECT_ID

# Trigger a test run
ds visual-regression trigger \
  --branch main \
  --commit abc123 \
  --wait

# Get run status
ds visual-regression status RUN_ID

# Get results
ds visual-regression results RUN_ID

# Approve a diff
ds visual-regression approve RESULT_ID

# Reject a diff
ds visual-regression reject RESULT_ID
```

### Configuration File (.dsrc)

```json
{
  "apiKey": "your-api-key",
  "baseUrl": "https://api.designsystem.com",
  "visualRegression": {
    "projectId": "your-project-id",
    "defaultBranch": "main",
    "screenshotDir": "./screenshots",
    "timeout": 600
  }
}
```

## API SDK (TypeScript/JavaScript)

### Installation

```bash
npm install @design-system/sdk
```

### Usage

```typescript
import { DesignSystemClient } from '@design-system/sdk';

const client = new DesignSystemClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.designsystem.com',
});

// Trigger a test run
const run = await client.visualRegression.triggerRun({
  projectId: 'your-project-id',
  branch: 'main',
  commitSha: 'abc123',
});

// Wait for completion
const completedRun = await client.visualRegression.waitForCompletion(run.id, {
  timeout: 600000, // 10 minutes
});

// Get results
const results = await client.visualRegression.getResults(run.id);

// Approve a diff
await client.visualRegression.approveDiff(resultId);

// Reject a diff
await client.visualRegression.rejectDiff(resultId);

// Get run status
const status = await client.visualRegression.getRunStatus(run.id);
```

## Status Badge

Generate a status badge for your README:

```markdown
![Visual Regression](https://api.designsystem.com/api/v1/visual-regression/projects/YOUR_PROJECT_ID/badge)
```

## PR Comment Integration

The Design System Platform can automatically comment on PRs with test results when configured with webhook integration.

Configure in your project settings:
- GitHub webhook URL: `https://api.designsystem.com/api/v1/visual-regression/webhooks/github`
- GitLab webhook URL: `https://api.designsystem.com/api/v1/visual-regression/webhooks/gitlab`

