# Troubleshooting Guide

Common issues and solutions for the Design System Platform.

## Table of Contents

- [General Issues](#general-issues)
- [API Issues](#api-issues)
- [Authentication Issues](#authentication-issues)
- [Integration Issues](#integration-issues)
- [Performance Issues](#performance-issues)

## General Issues

### Application Won't Start

**Symptoms**: Backend or frontend fails to start

**Solutions**:
1. Check Node.js version (requires 18.x or higher)
2. Verify all dependencies are installed: `npm install`
3. Check port availability (3000 for backend, 5174 for frontend)
4. Review error logs for specific errors

### Port Already in Use

**Symptoms**: Error about port being in use

**Solutions**:
1. Find and kill process using the port:
   ```bash
   # macOS/Linux
   lsof -ti:3000 | xargs kill -9
   
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```
2. Change port in configuration
3. Use different ports for multiple instances

### Dependencies Installation Fails

**Symptoms**: npm install fails

**Solutions**:
1. Clear npm cache: `npm cache clean --force`
2. Delete node_modules and package-lock.json, then reinstall
3. Check Node.js and npm versions
4. Try using yarn instead: `yarn install`

## API Issues

### 404 Not Found

**Symptoms**: API endpoints return 404

**Solutions**:
1. Verify endpoint URL is correct
2. Check API version in URL (`/api/v1/...`)
3. Verify resource ID exists
4. Check API documentation for correct endpoint

### 500 Internal Server Error

**Symptoms**: API returns 500 error

**Solutions**:
1. Check backend logs for detailed error
2. Verify database/Elasticsearch connection
3. Check environment variables are set
4. Review recent code changes

### Slow API Responses

**Symptoms**: API requests are slow

**Solutions**:
1. Check database/Elasticsearch performance
2. Review query complexity
3. Enable caching where appropriate
4. Check network connectivity
5. Monitor server resources

See [TROUBLESHOOTING_API.md](./TROUBLESHOOTING_API.md) for more API-specific issues.

## Authentication Issues

### Invalid API Key

**Symptoms**: 401 Unauthorized errors

**Solutions**:
1. Verify API key is correct
2. Check Authorization header format: `Bearer YOUR_API_KEY`
3. Verify key hasn't been revoked
4. Check if key has expired
5. Create a new API key if needed

### API Key Expired

**Symptoms**: Token expired errors

**Solutions**:
1. Rotate the API key
2. Create a new API key
3. Check expiration date
4. Update key in your application

### Rate Limit Exceeded

**Symptoms**: 429 Too Many Requests

**Solutions**:
1. Check rate limit headers
2. Implement request throttling
3. Wait for rate limit to reset
4. Use multiple API keys for high-volume applications
5. Contact support for higher limits

See [TROUBLESHOOTING_AUTH.md](./TROUBLESHOOTING_AUTH.md) for more authentication issues.

## Integration Issues

### Argos Connection Failed

**Symptoms**: Cannot connect to Argos

**Solutions**:
1. Verify Argos credentials (project ID, token)
2. Check Argos base URL is correct
3. Verify network connectivity
4. Check if Argos service is available
5. Review Argos API documentation

### OpenReplay Not Recording

**Symptoms**: No sessions being recorded

**Solutions**:
1. Verify integration code is added
2. Check project key is correct
3. Verify network connectivity
4. Check browser console for errors
5. Review privacy settings

See [TROUBLESHOOTING_INTEGRATIONS.md](./TROUBLESHOOTING_INTEGRATIONS.md) for more integration issues.

## Performance Issues

### Slow Page Loads

**Symptoms**: Frontend loads slowly

**Solutions**:
1. Check network connectivity
2. Review browser console for errors
3. Check backend response times
4. Enable browser caching
5. Optimize asset sizes

### High Memory Usage

**Symptoms**: Application uses too much memory

**Solutions**:
1. Check for memory leaks
2. Review large data sets
3. Implement pagination
4. Clear caches regularly
5. Monitor memory usage

See [TROUBLESHOOTING_PERFORMANCE.md](./TROUBLESHOOTING_PERFORMANCE.md) for more performance issues.

## Getting Help

### Check Logs

1. **Backend logs**: Check console output or log files
2. **Frontend logs**: Check browser console
3. **Network logs**: Check browser network tab

### Review Documentation

- [API Reference](./API_REFERENCE.md)
- [Getting Started Guide](./GETTING_STARTED.md)
- Feature-specific documentation

### Common Solutions

1. **Restart services**: Often fixes transient issues
2. **Clear cache**: Clear browser and application cache
3. **Update dependencies**: Keep dependencies up to date
4. **Check environment**: Verify environment variables

## Next Steps

- [API Troubleshooting](./TROUBLESHOOTING_API.md)
- [Authentication Troubleshooting](./TROUBLESHOOTING_AUTH.md)
- [Integration Troubleshooting](./TROUBLESHOOTING_INTEGRATIONS.md)
- [Performance Troubleshooting](./TROUBLESHOOTING_PERFORMANCE.md)

