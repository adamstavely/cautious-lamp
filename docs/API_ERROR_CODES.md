# API error codes

The errors the API returns and how to handle them.

## Error response format

Every error body has a stable `code`, next to the `statusCode`, `message` and `error` that Nest has always sent:

```json
{
  "statusCode": 401,
  "code": "TOKEN_EXPIRED",
  "message": "This API key has expired. Create a new one or rotate it.",
  "error": "Unauthorized"
}
```

- `code` is stable: match on it (or on `statusCode`). `message` is for people and may change.
- `message` is a string, or an array of strings when a request fails validation (one per problem, such as `"name must be a string"`).
- Some errors add fields, listed with their codes below (`retryAfterSeconds`, `lockedUntil`).
- When a route sets its own code (such as `PASSWORD_CHANGE_REQUIRED` or `IRIS_TIMEOUT`), that is the code. Otherwise it comes from the status: `VALIDATION_ERROR` for `400`, `RATE_LIMIT_EXCEEDED` for `429`, and the status's name for the rest (`NOT_FOUND`, `CONFLICT`, `SERVICE_UNAVAILABLE`, `PAYLOAD_TOO_LARGE`, …).
- An unexpected server error is a `500` with `code: "INTERNAL_SERVER_ERROR"` and the message "Internal server error"; the details are only in the server log.

The global filter that adds `code` is `backend/src/common/errors/api-exception.filter.ts`.

## HTTP status codes

- `400 Bad Request`: the request is invalid (`VALIDATION_ERROR`)
- `401 Unauthorized`: no valid credential (`UNAUTHORIZED`, `TOKEN_EXPIRED`, `TOKEN_REVOKED`)
- `403 Forbidden`: a missing permission or workspace role (`FORBIDDEN`, `PASSWORD_CHANGE_REQUIRED`)
- `404 Not Found`: no such resource, or one you can't see (`NOT_FOUND`)
- `409 Conflict`: the change conflicts with the current state (`CONFLICT`)
- `423 Locked`: sign-in locked after failed attempts (`ACCOUNT_LOCKED`)
- `429 Too Many Requests`: rate limit exceeded (`RATE_LIMIT_EXCEEDED`)
- `500 Internal Server Error`: a server error (`INTERNAL_SERVER_ERROR`)
- `503 Service Unavailable`: a dependency such as Elasticsearch isn't answering (`SERVICE_UNAVAILABLE`)

## Error codes

### Authentication

#### `UNAUTHORIZED`
`401`. No credential, or one that was never valid (a wrong or unknown API key, a token not signed by this server).

**Solution**: Send `Authorization: Bearer <token or key>` with a current access token or API key.

#### `TOKEN_EXPIRED`
`401`. The API key passed its expiry date, or the sign-in passed its 8 hours.

**Solution**: For a key, create a new one or rotate it on the **API keys** page (`/admin/api-keys`) or with `POST /auth/api-keys/:id/rotate`. For a sign-in, sign in again.

#### `TOKEN_REVOKED`
`401`. The API key was revoked (or rotated, which revokes the old key), or the sign-in was ended: the person signed out, changed their password, had it reset by an admin, or their account was disabled.

**Solution**: Use a new key, or sign in again.

#### `PASSWORD_CHANGE_REQUIRED`
`403`. The user signed in with a temporary password (a new account or an admin reset) and must change it before calling anything except `GET /auth/me`, `POST /auth/change-password` and `POST /auth/logout`. The WebSocket gateway sends it in an `error` event before disconnecting.

**Solution**: Send the user to the change-password screen; after `POST /auth/change-password` succeeds, sign in again with the new password. See [AUTH.md](AUTH.md#principals).

#### `FORBIDDEN`
`403`. The caller lacks a permission (the message names it, such as "Requires admin:users") or a workspace role.

**Solution**: Ask an admin for the permission or role. An API key can only use its scopes; workspace routes need a person's token.

#### `ACCOUNT_LOCKED`
`423`, with `lockedUntil`. Too many failed sign-ins for this email.

**Solution**: Wait until `lockedUntil`.

### Requests and resources

#### `VALIDATION_ERROR`
`400`. The body or query is invalid: a missing or wrong field, an unknown field, or a value the route refuses. `message` says what.

**Solution**: Fix the request as the message says. Unknown fields are refused, so check the field names against the route's documentation.

#### `NOT_FOUND`
`404`. No such resource, or one in a workspace you can't read (those answer exactly like missing ones), or no such route.

**Solution**: Check the id and path, and that you belong to the workspace.

#### `CONFLICT`
`409`. The change conflicts with the current state: a name or id already taken, or something changed since you read it.

**Solution**: Use a different name or id, or reload and try again.

### Rate limiting

#### `RATE_LIMIT_EXCEEDED`
`429`, with `Retry-After` (seconds) and `X-RateLimit-Remaining: 0`. More than `RATE_LIMIT_PER_MINUTE` (default 600) requests to one route from one IP in 60 seconds. Some features have their own limits that also answer `429`, such as AI requests per person.

**Solution**: Wait `Retry-After` seconds, then retry, and spread requests out. More API keys don't help: the limit is per IP address. See [API_REFERENCE.md](./API_REFERENCE.md#rate-limiting).

### Photosensitivity Analysis

`POST /api/v1/photosensitivity/analyze` ([IRIS_PHOTOSENSITIVITY_SERVICE.md](./IRIS_PHOTOSENSITIVITY_SERVICE.md#limits)). These bodies are `{ "statusCode", "code", "message", "error" }`, plus `retryAfterSeconds` on the two retryable refusals.

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

### Server

#### `INTERNAL_SERVER_ERROR`
`500`. An unexpected server error.

**Solution**: Retry; if it persists, check the server log.

#### `SERVICE_UNAVAILABLE`
`503`. A dependency isn't answering, usually Elasticsearch, or a feature isn't set up on this server (the message says which).

**Solution**: Retry after a few moments; check `GET /api/v1/health`.

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

Every response carries `X-RateLimit-Limit`, `X-RateLimit-Remaining` and `X-RateLimit-Reset`. `X-RateLimit-Reset` is a number of seconds, not a date. Slow down when few requests are left, and on a `429` wait for `Retry-After`:

```javascript
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithinLimit(url, options) {
  const response = await fetch(url, options);
  if (response.status === 429) {
    await sleep(Number(response.headers.get('Retry-After') ?? 1) * 1000);
    return fetchWithinLimit(url, options);
  }
  const remaining = Number(response.headers.get('X-RateLimit-Remaining'));
  if (remaining < 10) {
    await sleep(Number(response.headers.get('X-RateLimit-Reset')) * 1000);
  }
  return response;
}
```

## Error Logging

Log errors for debugging:

```javascript
try {
  const response = await fetch(url, options);
  if (!response.ok) {
    const error = await response.json();
    console.error(`API error ${error.statusCode} ${error.code}:`, error.message);
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

