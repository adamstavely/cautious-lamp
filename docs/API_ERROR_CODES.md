# API Error Codes

Complete reference for API error codes and how to handle them.

## Error Response Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional error details"
    }
  }
}
```

## HTTP Status Codes

- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error
- `503 Service Unavailable`: Service temporarily unavailable

## Error Codes

### Authentication Errors

#### `UNAUTHORIZED`
Invalid or missing API key.

**Solution**: Verify API key is correct and included in Authorization header.

#### `TOKEN_EXPIRED`
API key has expired.

**Solution**: Rotate or create a new API key.

#### `TOKEN_REVOKED`
API key has been revoked.

**Solution**: Create a new API key.

#### `PASSWORD_CHANGE_REQUIRED`
`403`. The user signed in with a temporary password (a new account or an admin reset) and must change it before calling anything except `GET /auth/me`, `POST /auth/change-password` and `POST /auth/logout`. The WebSocket gateway sends it in an `error` event before disconnecting.

**Solution**: Send the user to the change-password screen; after `POST /auth/change-password` succeeds, sign in again with the new password. See [AUTH.md](AUTH.md#principals).

### Validation Errors

#### `VALIDATION_ERROR`
Request data validation failed.

**Solution**: Check request body against API documentation.

#### `MISSING_REQUIRED_FIELD`
Required field is missing.

**Solution**: Include all required fields in request.

#### `INVALID_FIELD_VALUE`
Field value is invalid.

**Solution**: Check field value format and constraints.

### Resource Errors

#### `NOT_FOUND`
Resource not found.

**Solution**: Verify resource ID is correct.

#### `ALREADY_EXISTS`
Resource already exists.

**Solution**: Use existing resource or update instead of create.

#### `CONFLICT`
Resource conflict (e.g., duplicate name).

**Solution**: Use a different name or update existing resource.

### Rate Limiting

#### `RATE_LIMIT_EXCEEDED`
Rate limit exceeded.

**Solution**: 
- Wait for rate limit to reset
- Implement request throttling
- Use multiple API keys
- Contact support for higher limits

### Photosensitivity Analysis

`POST /api/v1/photosensitivity/analyze` ([IRIS_PHOTOSENSITIVITY_SERVICE.md](./IRIS_PHOTOSENSITIVITY_SERVICE.md#limits)). These bodies are `{ "statusCode", "code", "message" }`, plus `retryAfterSeconds` on the two retryable refusals.

#### `PHOTOSENSITIVITY_BUSY`
`503`, with `Retry-After`. The server is running and queueing as many analyses as it allows. Nothing was uploaded.

**Solution**: Retry after `Retry-After` seconds.

#### `PHOTOSENSITIVITY_QUOTA_EXCEEDED`
`429`, with `Retry-After`. You already have as many analyses running or queued as one user or API key may. Nothing was uploaded.

**Solution**: Wait for one to finish, then retry.

#### `IRIS_UNAVAILABLE`
`503`. IRIS isn't installed or configured on this server.

**Solution**: Not retryable; see `GET /api/v1/photosensitivity/verify` and [INTEGRATIONS.md](./INTEGRATIONS.md#iris).

#### `IRIS_TIMEOUT`
`422`. The analysis ran longer than `IRIS_TIMEOUT_MS` and was stopped.

**Solution**: Analyse a shorter clip.

#### `IRIS_VIDEO_TOO_LONG`
`422`. The video has more frames than `IRIS_MAX_FRAMES`, or its results are larger than `IRIS_MAX_OUTPUT_BYTES`.

**Solution**: Analyse a shorter clip.

#### `IRIS_ANALYSIS_FAILED`
`422`. IRIS couldn't analyse the video, usually because it can't read it.

**Solution**: Check the video plays, or re-encode it as MP4.

### Integration Errors

#### `INTEGRATION_ERROR`
External service integration error.

**Solution**: 
- Check integration credentials
- Verify external service is available
- Check integration logs

#### `CONNECTION_FAILED`
Failed to connect to external service.

**Solution**: 
- Verify network connectivity
- Check service URL
- Verify credentials

### Server Errors

#### `INTERNAL_SERVER_ERROR`
Unexpected server error.

**Solution**: 
- Retry request
- Check server logs
- Contact support if persistent

#### `SERVICE_UNAVAILABLE`
Service temporarily unavailable.

**Solution**: 
- Retry after a few moments
- Check service status
- Contact support if persistent

## Handling Errors

### Retry Logic

For transient errors (5xx), implement exponential backoff:

```javascript
async function requestWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      
      if (response.status >= 500 && i < maxRetries - 1) {
        await sleep(Math.pow(2, i) * 1000); // Exponential backoff
        continue;
      }
      
      throw new Error(`Request failed: ${response.status}`);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(Math.pow(2, i) * 1000);
    }
  }
}
```

### Rate Limit Handling

Check rate limit headers and throttle requests:

```javascript
const response = await fetch(url, options);
const remaining = parseInt(response.headers.get('X-RateLimit-Remaining'));
const resetTime = new Date(response.headers.get('X-RateLimit-Reset'));

if (remaining < 10) {
  const waitTime = resetTime.getTime() - Date.now();
  await sleep(waitTime);
}
```

## Error Logging

Log errors for debugging:

```javascript
try {
  const response = await fetch(url, options);
  if (!response.ok) {
    const error = await response.json();
    console.error('API Error:', error);
    // Log to error tracking service
  }
} catch (error) {
  console.error('Request failed:', error);
  // Log to error tracking service
}
```

## Next Steps

- [API Reference](./API_REFERENCE.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [Getting Started Guide](./GETTING_STARTED.md)

