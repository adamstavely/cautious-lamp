# API Reference

Complete reference for the Design System Platform API.

## Base URL

```
http://localhost:3000/api/v1
```

## Authentication

All API requests require authentication via API key:

```bash
Authorization: Bearer YOUR_API_KEY
```

See [API_AUTHENTICATION.md](./API_AUTHENTICATION.md) for detailed authentication documentation.

## Rate Limiting

API requests are rate-limited:
- **Default**: 100 requests per minute
- **Strict endpoints**: 20 requests per minute
- **Auth endpoints**: 10 requests per minute

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: When the limit resets

## Endpoints

### Workspaces

#### List Workspaces

```http
GET /workspaces
```

#### Get Workspace

```http
GET /workspaces/:id
```

#### Create Workspace

```http
POST /workspaces
Content-Type: application/json

{
  "name": "My Workspace",
  "description": "Description"
}
```

#### Update Workspace

```http
PUT /workspaces/:id
Content-Type: application/json

{
  "name": "Updated Name"
}
```

### Components

#### List Components

```http
GET /workspaces/:workspaceId/components
```

Query parameters:
- `category`: Filter by category
- `search`: Search by name/description

#### Get Component

```http
GET /workspaces/:workspaceId/components/:id
```

#### Create Component

```http
POST /workspaces/:workspaceId/components
Content-Type: application/json

{
  "name": "Button",
  "description": "Button component",
  "category": "forms",
  "props": [...]
}
```

### Design Tokens

#### List Tokens

```http
GET /workspaces/:workspaceId/tokens
```

Query parameters:
- `category`: Filter by category
- `type`: Filter by type
- `search`: Search by name

#### Get Token

```http
GET /workspaces/:workspaceId/tokens/:id
```

#### Create Token

```http
POST /workspaces/:workspaceId/tokens
Content-Type: application/json

{
  "name": "color.primary",
  "value": "#0066CC",
  "type": "color",
  "category": "colors"
}
```

### Visual Regression

#### List Projects

```http
GET /visual-regression/projects
```

#### Create Project

```http
POST /visual-regression/projects
Content-Type: application/json

{
  "teamId": "team-id",
  "name": "Project Name",
  "argosProjectId": "argos-id",
  "argosToken": "token",
  "config": {...}
}
```

#### Trigger Test Run

```http
POST /visual-regression/projects/:id/runs
Content-Type: application/json

{
  "branch": "main",
  "commitSha": "abc123"
}
```

#### Get Test Runs

```http
GET /visual-regression/projects/:id/runs?page=1&limit=20
```

#### Get Test Results

```http
GET /visual-regression/runs/:runId/results?page=1&limit=20
```

### Session Replay

#### List Projects

```http
GET /session-replay/projects
```

#### Create Project

```http
POST /session-replay/projects
Content-Type: application/json

{
  "teamId": "team-id",
  "name": "Project Name",
  "openreplayProjectKey": "key",
  "config": {...}
}
```

#### Search Sessions

```http
GET /session-replay/projects/:id/sessions?startDate=2024-01-01&endDate=2024-01-31
```

### API Keys

#### Create API Key

```http
POST /auth/api-keys
Content-Type: application/json

{
  "name": "My API Key",
  "expiresInDays": 90,
  "scopes": ["read", "write"]
}
```

#### List API Keys

```http
GET /auth/api-keys
```

#### Rotate API Key

```http
POST /auth/api-keys/:id/rotate
Content-Type: application/json

{
  "revokeOld": true,
  "reason": "manual"
}
```

#### Revoke API Key

```http
POST /auth/api-keys/:id/revoke
```

## Response Format

### Success Response

```json
{
  "data": {...},
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

### Paginated Response

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Error Response

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": {...}
  }
}
```

## Error Codes

- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid API key
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

See [API_ERROR_CODES.md](./API_ERROR_CODES.md) for complete error code reference.

## Versioning

API versioning is supported via URL path:
- `/api/v1/...` - Version 1 (current)
- `/api/v2/...` - Version 2 (future)

## Next Steps

- [API Authentication Guide](./API_AUTHENTICATION.md)
- [Error Codes Reference](./API_ERROR_CODES.md)
- [Getting Started Guide](./GETTING_STARTED.md)

