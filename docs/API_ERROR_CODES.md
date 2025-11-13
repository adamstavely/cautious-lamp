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

