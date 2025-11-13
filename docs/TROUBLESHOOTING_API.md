# API Troubleshooting

Common API issues and solutions.

## Authentication Errors

### 401 Unauthorized

**Cause**: Invalid or missing API key

**Solution**:
```bash
# Verify API key format
curl -H "Authorization: Bearer YOUR_API_KEY" http://localhost:3000/api/v1/workspaces

# Check if key is valid
curl http://localhost:3000/api/v1/auth/api-keys \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### 403 Forbidden

**Cause**: Insufficient permissions

**Solution**:
- Check API key scopes
- Verify resource permissions
- Contact administrator

## Request Errors

### 400 Bad Request

**Cause**: Invalid request data

**Solution**:
```bash
# Verify request body format
curl -X POST http://localhost:3000/api/v1/workspaces \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Valid Name"
  }'
```

### 404 Not Found

**Cause**: Resource doesn't exist

**Solution**:
- Verify resource ID
- Check resource exists
- Review API documentation

## Rate Limiting

### 429 Too Many Requests

**Cause**: Rate limit exceeded

**Solution**:
```javascript
// Check rate limit headers
const response = await fetch(url, options);
const remaining = response.headers.get('X-RateLimit-Remaining');
const resetTime = response.headers.get('X-RateLimit-Reset');

if (remaining < 10) {
  const waitTime = new Date(resetTime) - new Date();
  await sleep(waitTime);
}
```

## Server Errors

### 500 Internal Server Error

**Cause**: Server error

**Solution**:
- Check server logs
- Retry request
- Contact support if persistent

### 503 Service Unavailable

**Cause**: Service temporarily unavailable

**Solution**:
- Wait and retry
- Check service status
- Verify dependencies are running

## Connection Issues

### Connection Timeout

**Cause**: Network or server issues

**Solution**:
```javascript
// Implement retry with timeout
async function requestWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeout);
      return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(Math.pow(2, i) * 1000);
    }
  }
}
```

## Response Issues

### Unexpected Response Format

**Cause**: API version mismatch or error

**Solution**:
- Verify API version in URL
- Check response format in documentation
- Handle errors gracefully

### Missing Data

**Cause**: Pagination or filtering

**Solution**:
```bash
# Use pagination
curl "http://localhost:3000/api/v1/workspaces?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_API_KEY"

# Check total count
curl "http://localhost:3000/api/v1/workspaces" \
  -H "Authorization: Bearer YOUR_API_KEY" | jq '.pagination.total'
```

## Debugging Tips

### Enable Verbose Logging

```bash
# Add verbose flag
curl -v http://localhost:3000/api/v1/workspaces \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Check Response Headers

```javascript
const response = await fetch(url, options);
console.log('Headers:', [...response.headers.entries()]);
```

### Log Request Details

```javascript
console.log('Request:', {
  url,
  method: options.method,
  headers: options.headers,
  body: options.body
});
```

## Next Steps

- [API Reference](./API_REFERENCE.md)
- [Authentication Guide](./API_AUTHENTICATION.md)
- [Error Codes Reference](./API_ERROR_CODES.md)

