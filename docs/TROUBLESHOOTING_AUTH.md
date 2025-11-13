# Authentication Troubleshooting

Common authentication issues and solutions.

## API Key Issues

### Invalid API Key

**Symptoms**: 401 Unauthorized error

**Solutions**:
1. Verify key is correct (no extra spaces)
2. Check Authorization header format: `Bearer YOUR_API_KEY`
3. Verify key hasn't been revoked
4. Create a new key if needed

### Expired API Key

**Symptoms**: Token expired error

**Solutions**:
1. Rotate the API key
2. Create a new API key
3. Check expiration date in key metadata

### Revoked API Key

**Symptoms**: Token revoked error

**Solutions**:
1. Create a new API key
2. Check why key was revoked
3. Review key rotation history

## Rate Limiting

### Rate Limit Exceeded

**Symptoms**: 429 Too Many Requests

**Solutions**:
1. Check rate limit headers
2. Implement request throttling
3. Wait for limit to reset
4. Use multiple keys for high volume

## Token Rotation

### Rotation Failed

**Symptoms**: Cannot rotate token

**Solutions**:
1. Verify token exists
2. Check rotation policy
3. Verify permissions
4. Review rotation history

## Next Steps

- [API Authentication Guide](./API_AUTHENTICATION.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)

