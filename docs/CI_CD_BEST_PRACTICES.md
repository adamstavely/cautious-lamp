# CI/CD Best Practices

Best practices for integrating the Design System Platform with CI/CD pipelines.

## General Principles

### 1. Security

- **Never commit secrets**: Use CI/CD secret management
- **Rotate credentials**: Regularly rotate API keys and tokens
- **Use least privilege**: Grant minimum required permissions
- **Audit access**: Monitor who has access to secrets

### 2. Reliability

- **Idempotent operations**: Ensure operations can be retried safely
- **Error handling**: Handle failures gracefully
- **Retry logic**: Implement exponential backoff for transient errors
- **Health checks**: Verify services before running tests

### 3. Performance

- **Cache dependencies**: Speed up builds
- **Parallel execution**: Run independent tests in parallel
- **Optimize tests**: Only run necessary tests
- **Clean up**: Remove temporary files and resources

## Visual Regression Testing

### When to Run

- **On pull requests**: Catch visual changes before merge
- **On main branch**: Track visual changes over time
- **Before releases**: Ensure no visual regressions

### Configuration

```yaml
# Run visual regression tests
- name: Visual Regression
  run: |
    npm run test:visual
    npx @argos-ci/cli upload ./screenshots
```

### Best Practices

1. **Compare against base branch**: Always compare PRs against main
2. **Review all diffs**: Don't auto-approve changes
3. **Block on failures**: Prevent merge on visual regressions
4. **Cache screenshots**: Speed up subsequent runs
5. **Use consistent viewports**: Test same sizes across runs

## Session Replay

### When to Use

- **E2E test debugging**: Record test sessions for debugging
- **Production monitoring**: Track real user sessions
- **Error investigation**: Review sessions with errors

### Configuration

```yaml
# Record sessions during tests
- name: E2E Tests with Replay
  env:
    OPENREPLAY_PROJECT_KEY: ${{ secrets.OPENREPLAY_PROJECT_KEY }}
  run: npm run test:e2e
```

### Best Practices

1. **Privacy first**: Mask sensitive data
2. **Filter sessions**: Focus on relevant sessions
3. **Monitor storage**: Session data can be large
4. **Alert on errors**: Set up alerts for critical issues
5. **Review regularly**: Identify patterns and issues

## API Integration

### Authentication

```yaml
# Use secrets for API keys
env:
  API_KEY: ${{ secrets.DESIGN_SYSTEM_API_KEY }}
```

### Error Handling

```yaml
# Implement retry logic
- name: API Request
  run: |
    for i in {1..3}; do
      if curl -f -H "Authorization: Bearer $API_KEY" $API_URL; then
        break
      fi
      sleep $((2 ** i))
    done
```

### Rate Limiting

```yaml
# Handle rate limits
- name: Check Rate Limit
  run: |
    response=$(curl -s -H "Authorization: Bearer $API_KEY" $API_URL)
    remaining=$(echo $response | jq -r '.headers.X-RateLimit-Remaining')
    if [ "$remaining" -lt 10 ]; then
      echo "Rate limit low, waiting..."
      sleep 60
    fi
```

## Workflow Organization

### Separate Jobs

```yaml
jobs:
  unit-tests:
    # Unit tests
  
  visual-regression:
    # Visual regression tests
  
  e2e-tests:
    # E2E tests with session replay
```

### Conditional Execution

```yaml
# Only run on specific branches
if: github.ref == 'refs/heads/main'

# Skip on draft PRs
if: github.event.pull_request.draft == false
```

## Monitoring and Alerts

### Success Notifications

```yaml
- name: Notify Success
  if: success()
  uses: actions/github-script@v6
  with:
    script: |
      // Send success notification
```

### Failure Alerts

```yaml
- name: Alert on Failure
  if: failure()
  uses: actions/github-script@v6
  with:
    script: |
      // Send failure alert
```

## Performance Optimization

### Caching

```yaml
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

### Parallel Execution

```yaml
strategy:
  matrix:
    test-group: [1, 2, 3]
  fail-fast: false
```

## Troubleshooting

### Common Issues

1. **Secrets not available**: Check secret configuration
2. **Rate limit exceeded**: Implement throttling
3. **Tests flaky**: Add retry logic
4. **Slow builds**: Optimize and cache

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for more.

## Next Steps

- [Argos CI/CD Integration](./CI_CD_ARGOS_INTEGRATION.md)
- [OpenReplay CI/CD Integration](./CI_CD_OPENREPLAY_INTEGRATION.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)

