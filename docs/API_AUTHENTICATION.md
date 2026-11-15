# API authentication

How to authenticate with the Design System Platform API. The full model (principals, permissions, storage) is in [AUTH.md](./AUTH.md).

Every request sends one credential:

```bash
Authorization: Bearer <access token or API key>
```

| Credential | For | How to get one |
| --- | --- | --- |
| Access token (JWT) | People, and scripts acting as a person (workspace routes need one) | `POST /auth/login`. Valid for 8 hours, not refreshed. |
| API key | Machine clients: CI, the CLI, the MCP server, the ESLint plugin | An admin creates it on the **API keys** page or with `POST /auth/api-keys` |
| `ADMIN_API_KEY` | Server operators | Set in `backend/.env`; it has every permission. Keep it out of clients. |

## Signing in

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "you@example.com", "password": "your password"}'
```

Response:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs…",
  "expiresAt": "2026-11-15T15:58:21.000Z",
  "user": { "id": "usr_…", "email": "you@example.com", "permissions": ["…"], "mustChangePassword": false }
}
```

Send `accessToken` as the bearer credential. If `mustChangePassword` is `true` (a new account or a reset), every other route answers `403 PASSWORD_CHANGE_REQUIRED` until you change it:

```bash
curl -X POST http://localhost:3000/api/v1/auth/change-password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword": "temporary password", "newPassword": "a new password of 12+ characters"}'
```

That ends the session (`204`); sign in again with the new password.

## API keys

### Creating a key

Managing keys needs the `admin:users` permission, and a key can only be given permissions its creator has ([AUTH.md](./AUTH.md#api-keys)). The easiest way is the **API keys** page (Admin → API keys, `/admin/api-keys`): name the key, pick an expiry and its permissions, and copy the key from the dialog.

With the API, use a signed-in admin's token (or `ADMIN_API_KEY`):

```bash
curl -X POST http://localhost:3000/api/v1/auth/api-keys \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "GitHub Actions: web app",
    "expiresInDays": 90,
    "scopes": ["component:view", "token:view"]
  }'
```

Response:

```json
{
  "apiKey": "dsk_abc123…",
  "metadata": {
    "id": "key_0c0c6a90427b3e00060c7786ec269ac9",
    "name": "GitHub Actions: web app",
    "createdAt": "2026-11-15T10:00:00.000Z",
    "createdBy": "usr_…",
    "expiresAt": "2027-02-13T10:00:00.000Z",
    "revoked": false,
    "scopes": ["component:view", "token:view"]
  }
}
```

Save the key straight away: it isn't shown again, and only a hash of it is stored. Scopes are RBAC permission names; without `scopes` the key gets the default service permissions (every `:view` permission, plus `component:create`, `review:create` and `feedback:create`). `expiresInDays` is 1–3650; leave it out for a key that doesn't expire.

### Using a key

```bash
curl http://localhost:3000/api/v1/components \
  -H "Authorization: Bearer $API_KEY"
```

API keys can't be workspace members, so `/workspaces/...` routes answer `404` for them; use a person's token there.

### Managing keys

All need `admin:users`, as the page does.

```bash
# List keys (metadata only)
curl http://localhost:3000/api/v1/auth/api-keys -H "Authorization: Bearer $TOKEN"

# One key
curl http://localhost:3000/api/v1/auth/api-keys/KEY_ID -H "Authorization: Bearer $TOKEN"

# Rotate: a new key with the same scopes; the old one is revoked unless "revokeOld": false
curl -X POST http://localhost:3000/api/v1/auth/api-keys/KEY_ID/rotate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"revokeOld": true, "reason": "manual"}'

# Revoke
curl -X POST http://localhost:3000/api/v1/auth/api-keys/KEY_ID/revoke -H "Authorization: Bearer $TOKEN"

# Rotation history, and keys older than the rotation policy allows
curl http://localhost:3000/api/v1/auth/api-keys/KEY_ID/rotation-history -H "Authorization: Bearer $TOKEN"
curl http://localhost:3000/api/v1/auth/api-keys/needing-rotation -H "Authorization: Bearer $TOKEN"
```

`reason` is `manual`, `expired` or `compromised`.

### Rotation

Keys are rotated by hand; nothing rotates them automatically, because a rotated key's secret is only returned to whoever rotated it and the clients using the old key would stop working. `GET /auth/api-keys/needing-rotation` lists active keys more than 30 days old (the rotation policy), so you can rotate them on your schedule: rotate, put the new key in the client's secrets, and the old key stops working at once (`401 TOKEN_REVOKED`). To keep the old key working while you update clients, rotate with `"revokeOld": false` and revoke it afterwards.

## Security practices

1. **Store keys as secrets.** Never commit them; use your CI's secret store or environment variables.
2. **One key per client**, so you can revoke one without affecting the others.
3. **Give keys an expiry** and only the scopes the client needs.
4. **Revoke unused keys.** The page and `GET /auth/api-keys` show when each key was last used (updated at most hourly).
5. **Use HTTPS** outside local development.

## Error responses

Refused credentials answer `401`; the `code` says why ([API_ERROR_CODES.md](./API_ERROR_CODES.md)):

```json
{ "statusCode": 401, "code": "UNAUTHORIZED", "message": "Sign in or send a valid API key", "error": "Unauthorized" }
```

```json
{ "statusCode": 401, "code": "TOKEN_EXPIRED", "message": "This API key has expired. Create a new one or rotate it.", "error": "Unauthorized" }
```

```json
{ "statusCode": 401, "code": "TOKEN_REVOKED", "message": "This API key has been revoked. Use a new key.", "error": "Unauthorized" }
```

`TOKEN_EXPIRED` and `TOKEN_REVOKED` are also sent for access tokens: after 8 hours, and after a sign-out, a password change or reset, or when the account is disabled.

Past the rate limit (600 requests per route per IP per minute by default):

```json
{ "statusCode": 429, "code": "RATE_LIMIT_EXCEEDED", "message": "Rate limit exceeded: at most 600 requests per minute. Retry after 12 seconds.", "error": "Too Many Requests" }
```

## Troubleshooting

### Key not working

1. Read the `code`: `TOKEN_EXPIRED` and `TOKEN_REVOKED` say what happened; `UNAUTHORIZED` means the server doesn't recognise the key.
2. Check the header is exactly `Authorization: Bearer <key>`.
3. On a workspace route, use a person's token instead.
4. A `403` names the permission the key lacks: create a key with that scope.

### Rate limiting

1. Read `X-RateLimit-Remaining` and `X-RateLimit-Reset` (seconds) on each response.
2. On a `429`, wait `Retry-After` seconds.
3. More keys don't help: the limit is per IP address.

See [TROUBLESHOOTING_AUTH.md](./TROUBLESHOOTING_AUTH.md) for more help.

## Next steps

- [API reference](./API_REFERENCE.md)
- [Getting started](./GETTING_STARTED.md)
- [Troubleshooting](./TROUBLESHOOTING_AUTH.md)
