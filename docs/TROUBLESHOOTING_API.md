# API Troubleshooting

Common API issues and solutions.

## Authentication Errors

### 401 Unauthorized

**Cause**: No credential, or one the server refuses. The body's `code` says which:

- `UNAUTHORIZED`: missing, mistyped, or not a key or token this server knows
- `TOKEN_EXPIRED`: the API key's expiry date or the sign-in's 8 hours have passed
- `TOKEN_REVOKED`: the key was revoked or rotated, or the person signed out, changed their password or was disabled

**Solution**:
```bash
# See the code and message
curl -s http://localhost:3000/api/v1/auth/me -H "Authorization: Bearer YOUR_API_KEY" | jq '{code, message}'
```
Create a new key (Admin → API keys) or sign in again. See [API_ERROR_CODES.md](./API_ERROR_CODES.md).

### 403 Forbidden

**Cause**: Insufficient permissions

**Solution**:
- The message names the missing permission ("Requires admin:users"); an API key only has its scopes
- Workspace routes need a person's token: API keys can't be workspace members
- Ask an administrator for the permission or workspace role

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
// The limit is per route per IP (default 600 a minute). X-RateLimit-Reset is seconds, not a date.
const response = await fetch(url, options);
if (response.status === 429) {
  await sleep(Number(response.headers.get('Retry-After')) * 1000);
} else if (Number(response.headers.get('X-RateLimit-Remaining')) < 10) {
  await sleep(Number(response.headers.get('X-RateLimit-Reset')) * 1000);
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

**Cause**: The item is in a workspace you can't read, or a filter left it out. Most lists aren't paged: `GET /workspaces` returns every workspace you belong to as an array, with no `?page=`.

**Solution**:
```bash
# Count what you can see
curl -s http://localhost:3000/api/v1/workspaces -H "Authorization: Bearer $TOKEN" | jq length
```

The paged lists (visual regression runs and results, applications, audit logs, session replay sessions) take `limit` with `page` or `offset` and return a total; see [API_REFERENCE.md](./API_REFERENCE.md#pagination). For example:

```bash
curl -s "http://localhost:3000/api/v1/visual-regression/projects/PROJECT_ID/runs?page=2&limit=20" \
  -H "Authorization: Bearer $TOKEN" | jq .pagination
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

