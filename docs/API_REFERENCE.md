# API Reference

Reference for the Design System Platform API: authentication, rate limits, the shape of responses and errors, and the main routes. `GET /api/versions/current/routes` lists every route the running server registers.

## Base URL

```
http://localhost:3000/api/v1
```

## Authentication

Every route needs a credential except the public ones listed in [AUTH.md](./AUTH.md#principals) (`GET /health`, `POST /auth/login`, and a few with their own checks):

```bash
Authorization: Bearer <access token or API key>
```

- **People** sign in with `POST /auth/login` and send the access token (a JWT, valid for 8 hours).
- **Machine clients** (CI, the CLI, the MCP server) send an API key. An admin creates keys on the **API keys** page (`/admin/api-keys`) or with `POST /auth/api-keys`.

API keys can't be workspace members, so the workspace routes need a person's token. See [API_AUTHENTICATION.md](./API_AUTHENTICATION.md).

## Rate limiting

Requests are counted per client IP address and per route: each route allows `RATE_LIMIT_PER_MINUTE` requests (default **600**) from one IP in any 60 seconds. A request counts for 60 seconds after it is made. The count is kept in memory, so each backend instance counts separately and a restart clears it.

Every response carries these headers (browsers can read them; they are listed in `Access-Control-Expose-Headers`):

| Header | Meaning |
| --- | --- |
| `X-RateLimit-Limit` | Requests allowed per 60 seconds for this route |
| `X-RateLimit-Remaining` | Requests left for this route from your IP |
| `X-RateLimit-Reset` | Seconds (not a date) until the current 60-second window ends. On a `429`, seconds until you may call again |

Past the limit the API answers `429` with `code: "RATE_LIMIT_EXCEEDED"`, `X-RateLimit-Remaining: 0` and `Retry-After` in seconds. Using several API keys from one IP doesn't raise the limit.

```javascript
const response = await fetch(url, options);
if (response.status === 429) {
  const seconds = Number(response.headers.get('Retry-After') ?? 1);
  await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  // then retry
}
```

## Responses

Successful responses are the resource itself, with no envelope: `GET /workspaces/:id` returns the workspace object, and `GET /workspaces` returns an array. Lists that are filtered or paged wrap the items in an object, and each says so below. There is no `data`/`meta` envelope.

### Pagination

Most lists return every item the caller can see. These are paged:

| Route | Query | Response |
| --- | --- | --- |
| `GET /visual-regression/projects/:id/runs`, `GET /visual-regression/runs/:id/results` | `page` (from 1), `limit` (1–100, default 20), or `offset` | `{ data: [...], pagination: { page, limit, total, totalPages, hasNext, hasPrevious } }` |
| `GET /applications` | `limit` (1–100; all when left out), `offset` | `{ applications: [...], count, total, offset, limit, facets: { teams, environments } }` |
| `GET /audit/logs` | `limit` (default 100), `offset` | `{ logs: [...], total }` |
| `GET /session-replay/projects/:id/sessions` | `page`, `limit` | `{ items: [...], total, page, limit, startDate, endDate }` |

Some lists return their items with a count but aren't paged: `GET /users` (`{ users, total }`), `GET /tokens` and `GET /components` (`{ tokens|components, count, filters }`), `GET /workspaces/:id/components` (`{ components, count }`).

## Errors

Every error body has a stable `code` next to Nest's `statusCode`, `message` and `error`:

```json
{
  "statusCode": 404,
  "code": "NOT_FOUND",
  "message": "Workspace not found",
  "error": "Not Found"
}
```

`message` is a string, or for validation failures an array of strings (one per problem). Some errors carry more fields, such as `retryAfterSeconds` or `lockedUntil`. Match on `code` and `statusCode`; `message` is for people and may change. Codes are listed in [API_ERROR_CODES.md](./API_ERROR_CODES.md).

| Status | Usual code |
| --- | --- |
| `400` | `VALIDATION_ERROR` |
| `401` | `UNAUTHORIZED`, `TOKEN_EXPIRED`, `TOKEN_REVOKED` |
| `403` | `FORBIDDEN`, `PASSWORD_CHANGE_REQUIRED` |
| `404` | `NOT_FOUND` |
| `409` | `CONFLICT` |
| `423` | `ACCOUNT_LOCKED` |
| `429` | `RATE_LIMIT_EXCEEDED` |
| `500` | `INTERNAL_SERVER_ERROR` |
| `503` | `SERVICE_UNAVAILABLE` (for example, Elasticsearch isn't answering) |

## Endpoints

### Workspaces

Workspace routes need a person's token: roles are per workspace, and API keys can't be members. See [WORKSPACES.md](./WORKSPACES.md).

| Method and path | Notes |
| --- | --- |
| `GET /workspaces` | The workspaces you belong to (every workspace for `admin:users` holders; `?mine=true` for only your own). An array. |
| `POST /workspaces` | `{ name, description? }`. You become the owner. |
| `GET /workspaces/:id`, `GET /workspaces/slug/:slug` | |
| `PATCH /workspaces/:id` | `{ name?, description?, slug?, settings?, metadata? }`. `PUT` does the same. |
| `DELETE /workspaces/:id` | Owner only |
| `POST /workspaces/:id/members` | `{ email, role }`: `admin`, `editor` or `viewer` |
| `PATCH /workspaces/:id/members/:userId`, `DELETE /workspaces/:id/members/:userId` | |
| `POST /workspaces/:id/transfer-ownership` | `{ userId }`. The old owner becomes an admin. |
| `GET /workspaces/:id/analytics` | |

### Workspace components

Components are created with `POST /components` (below); a `workspaceId` puts one in a workspace.

| Method and path | Notes |
| --- | --- |
| `GET /workspaces/:id/components` | `?status=` (`production`, `in-progress`, `planned`, `deprecated`). Returns `{ components, count }`: the workspace's own components, ones shared with it, and global ones. |
| `PUT /workspaces/:id/components/:componentId/sharing` | `{ workspaceIds, isGlobal? }`. Only for the workspace's own components. |

### Workspace items (tokens, fonts, guidelines, …)

Tokens and the other kinds of workspace items share one set of routes, `/workspaces/:id/resources/:kind`. The kinds are `tokens`, `fonts`, `assets`, `icons`, `guidelines`, `patterns`, `style-dictionaries` and others (`backend/src/workspaces/resource-kinds.ts`).

| Method and path | Notes |
| --- | --- |
| `GET /workspaces/:id/resources/:kind` | `?filter=` matches one field per kind (for tokens, `category`). An array of the workspace's items, items shared with it, and global items. |
| `POST /workspaces/:id/resources/:kind` | The kind's fields. Editor or higher. |
| `GET /workspaces/:id/resources/:kind/:itemId` | |
| `PATCH /workspaces/:id/resources/:kind/:itemId` | The fields to change |
| `DELETE /workspaces/:id/resources/:kind/:itemId` | `204` |
| `PUT /workspaces/:id/resources/:kind/:itemId/sharing` | `{ workspaceIds, isGlobal? }` |
| `GET /resources/:kind` | One kind across every workspace you can read |
| `GET /workspaces/:id/resources/tokens/export/style-dictionary` | The workspace's tokens as a Style Dictionary file. `?filter=` is a category. See [GETTING_STARTED_TOKENS.md](./GETTING_STARTED_TOKENS.md#style-dictionary). |

A token is `{ name, value, type, category, description?, tags? }`:

```http
POST /workspaces/:id/resources/tokens
Content-Type: application/json

{
  "name": "color.primary",
  "value": "#0066CC",
  "type": "color",
  "category": "colors"
}
```

### Design system components and tokens

The shared library, readable with an API key.

| Method and path | Notes |
| --- | --- |
| `GET /components` | `?status=`. `{ components, count, filters }`, leaving out components in workspaces you can't read |
| `GET /components/:id`, `GET /components/status/:status` | |
| `POST /components` | `component:create`. `{ id, name, description, status?, props?, code?, dependencies?, examples?, accessibility?, workspaceId? }`; `id` is kebab-case. With `workspaceId`, needs the editor role there. |
| `PUT /components/:id/status`, `/deprecation`, `/dependencies`; `POST /components/:id/variants` | `component:edit` (see [AUTH.md](./AUTH.md#components-and-workspaces)) |
| `GET /tokens` | `?category=&type=&tag=`. `{ tokens, count, filters }` |
| `GET /tokens/:name`, `GET /tokens/category/:category` | |

### Applications

| Method and path | Notes |
| --- | --- |
| `GET /applications` | Paged (see [Pagination](#pagination)); `?teamId=&workspaceId=&capability=&environment=&search=` |
| `POST /applications/register` | `{ name, workspaceId?, designSystemVersion?, capabilities?, repository?, … }`. See [APPLICATION_REGISTRATION.md](./APPLICATION_REGISTRATION.md). |
| `GET /applications/:id`, `PUT /applications/:id`, `DELETE /applications/:id` | |

### Visual regression

Runs come from Argos: the Argos webhook records each build. There is no route that starts a run; trigger Argos from CI ([ARGOS_CI_CD_INTEGRATION.md](./ARGOS_CI_CD_INTEGRATION.md)).

| Method and path | Notes |
| --- | --- |
| `GET /visual-regression/projects` | `?teamId=&workspaceId=` |
| `POST /visual-regression/projects` | `{ name, argosProjectId, argosToken, workspaceId?, config? }` |
| `GET /visual-regression/projects/:id/runs` | Paged: `{ data, pagination }` |
| `GET /visual-regression/runs/:id/results` | Paged: `{ data, pagination }` |
| `POST /visual-regression/results/:id/approve`, `/reject` | |

### Session replay

```http
POST /session-replay/projects
Content-Type: application/json

{
  "name": "Project Name",
  "workspaceId": "ws_id",
  "openreplayProjectKey": "9ihBzyeAkjDfK2rEXPBb",
  "openreplayProjectId": 42,
  "privacySettings": { "defaultInputMode": "obscured" },
  "config": { "captureNetworkPayload": false }
}
```

OpenReplay's public API lists sessions per user, so `userId` is required:

```http
GET /session-replay/projects/:id/sessions?userId=user-1234&startDate=2024-01-01&endDate=2024-01-31&page=1&limit=20&sortOrder=desc
GET /session-replay/projects/:id/sessions/:sessionId/events
GET /session-replay/projects/:id/sessions/:sessionId/replay-url
GET /session-replay/projects/:id/heatmaps-url
GET /session-replay/projects/:id/integration-code
```

See [GETTING_STARTED_SESSION_REPLAY.md](./GETTING_STARTED_SESSION_REPLAY.md).

### API keys

All need `admin:users`, and a key can only get permissions its creator has ([AUTH.md](./AUTH.md#api-keys)). The **API keys** admin page does the same.

| Method and path | Notes |
| --- | --- |
| `POST /auth/api-keys` | `{ name, expiresInDays?, scopes? }` → `{ apiKey, metadata }`. The key is shown only here. |
| `GET /auth/api-keys`, `GET /auth/api-keys/:id` | Metadata, never the key |
| `POST /auth/api-keys/:id/rotate` | `{ revokeOld?, reason? }` → `{ newApiKey, newMetadata }` |
| `POST /auth/api-keys/:id/revoke` | |
| `GET /auth/api-keys/:id/rotation-history`, `GET /auth/api-keys/needing-rotation` | |

## Versioning

There is one API version, v1, under `/api/v1/...`. `GET /api/versions` describes it,
and `GET /api/versions/current/routes` lists every route the server registers.
`GET /api/v1/health` (no credential needed) reports the server's release and whether
Elasticsearch is reachable, and answers 503 when it isn't.

## Next steps

- [API authentication](./API_AUTHENTICATION.md)
- [Error codes](./API_ERROR_CODES.md)
- [Getting started](./GETTING_STARTED.md)
