# API Authentication

This guide explains how to authenticate with the Design System Platform API.

## Authentication Methods

### API Keys (Recommended)

API keys are the primary authentication method for the API.

#### Creating an API Key

```bash
curl -X POST http://localhost:3000/api/v1/auth/api-keys \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My API Key",
    "expiresInDays": 90,
    "scopes": ["read", "write"]
  }'
```

Response:
```json
{
  "apiKey": "ds_abc123...",
  "metadata": {
    "id": "key-123",
    "name": "My API Key",
    "createdAt": "2024-01-01T00:00:00Z",
    "expiresAt": "2024-04-01T00:00:00Z"
  }
}
```

**Important**: Save the API key immediately - it won't be shown again!

#### Using an API Key

Include the API key in the `Authorization` header:

```bash
curl http://localhost:3000/api/v1/workspaces \
  -H "Authorization: Bearer YOUR_API_KEY"
```

Or as a query parameter (less secure):

```bash
curl "http://localhost:3000/api/v1/workspaces?apiKey=YOUR_API_KEY"
```

## API Key Management

### List API Keys

```bash
curl http://localhost:3000/api/v1/auth/api-keys \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Get API Key Details

```bash
curl http://localhost:3000/api/v1/auth/api-keys/:id \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Rotate API Key

Rotate an API key to generate a new one:

```bash
curl -X POST http://localhost:3000/api/v1/auth/api-keys/:id/rotate \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "revokeOld": true,
    "reason": "manual"
  }'
```

### Revoke API Key

Revoke an API key to invalidate it:

```bash
curl -X POST http://localhost:3000/api/v1/auth/api-keys/:id/revoke \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## Security Best Practices

### 1. Store Keys Securely

- Never commit API keys to version control
- Use environment variables
- Use secret management services in production

### 2. Rotate Keys Regularly

- Rotate keys every 90 days (default)
- Rotate immediately if compromised
- Use automatic rotation for critical keys

### 3. Use Scopes

Limit API key permissions:

```json
{
  "scopes": ["read"]  // Read-only access
}
```

### 4. Monitor Key Usage

- Review key usage regularly
- Revoke unused keys
- Monitor for suspicious activity

### 5. Use HTTPS

Always use HTTPS in production to protect API keys in transit.

## Token Rotation

### Automatic Rotation

Tokens can be automatically rotated based on policy:

- **Max Age**: 90 days (default)
- **Rotation Frequency**: 30 days (default)
- **Grace Period**: 7 days after expiration

### Manual Rotation

Rotate tokens manually when needed:

```bash
curl -X POST http://localhost:3000/api/v1/auth/api-keys/:id/rotate \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"reason": "compromised"}'
```

### Rotation History

View rotation history:

```bash
curl http://localhost:3000/api/v1/auth/api-keys/:id/rotation-history \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## OAuth (Future)

OAuth 2.0 support is available for external service integrations (Argos, OpenReplay). See integration-specific documentation.

## Error Responses

### Invalid API Key

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing API key"
  }
}
```

### Expired API Key

```json
{
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "API key has expired"
  }
}
```

### Rate Limit Exceeded

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Maximum 100 requests per minute."
  }
}
```

## Troubleshooting

### Key Not Working

1. Verify the key is correct
2. Check if key is revoked
3. Check if key is expired
4. Verify Authorization header format

### Rate Limiting Issues

1. Check rate limit headers
2. Implement request throttling
3. Use multiple keys for high-volume applications
4. Contact support for higher limits

See [TROUBLESHOOTING_AUTH.md](./TROUBLESHOOTING_AUTH.md) for more help.

## Next Steps

- [API Reference](./API_REFERENCE.md)
- [Getting Started Guide](./GETTING_STARTED.md)
- [Troubleshooting Guide](./TROUBLESHOOTING_AUTH.md)

