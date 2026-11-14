# Authentication and permissions

People sign in with an email and password and get a short-lived bearer token. Machine clients (the MCP server, CLI, ESLint plugin and CI) keep using API keys. Every backend route needs one or the other, apart from a few public routes. What a caller may do is decided by RBAC permissions on the server; the frontend only uses permissions to decide what to show.

## Principals

The global `AuthGuard` (an `APP_GUARD`) reads `Authorization: Bearer <token>` and sets `req.principal`:

| Credential | Principal | Permissions |
| --- | --- | --- |
| User access token (JWT) | `{ type: 'user', id, email, name }` | From the user's RBAC roles |
| `ADMIN_API_KEY` | `{ type: 'service', id: 'admin-key', name: 'Admin API key' }` | All permissions |
| A key from `API_KEYS` or created through `/auth/api-keys` | `{ type: 'service', id: <key id>, name }` | The key's `scopes` if it has any; otherwise every `:view` permission plus `component:create`, `review:create` and `feedback:create` |

Routes marked `@Public()` skip authentication. These are:
- `GET /health`
- `POST /auth/login`
- the Argos webhook (it has its own signature check)
- `PUT /upload/:reviewId/:token` (a one-time token)
- `GET /review-files/...` (signed URLs)

Every other route returns `401` without a valid credential. `@RequirePermission(Permission.X, ...)` returns `403` unless the principal has all the listed permissions (on a controller class it applies to every route, merged with any on the route).

`ApiKeyGuard` accepts any authenticated principal; `AdminKeyGuard` requires `admin:users` (the admin key has it). The API key routes are described under [API keys](#api-keys), and the permissions on other administrative routes under [Administrative routes](#administrative-routes).

The guard only covers HTTP. The visual regression WebSocket gateway checks the same credentials (a user token or an API key) when a client connects. Each `subscribe:project` / `subscribe:run` is then checked against the project's access rules (docs/WORKSPACES.md); a refused subscription gets `{ success: false }` and joins nothing.

Identity always comes from `req.principal`. Client-supplied `userId`, `assignedBy`, `addedBy`, `createdBy`, `x-user-id` and `?userId=` are ignored wherever they claim to be the caller. A service principal may name the person it acts for in `x-user-email` / `x-user-name` (URL-encoded); that is a display label only, never identity: it can't satisfy a review's approved-email list or make the key a review's owner. For reviews, a service principal is an outsider unless it has `review:admin` (docs/REVIEW_API.md, "Access").

## Users

Users are stored in the Elasticsearch index `design-system-users`:

```jsonc
{
  "id": "usr_…",
  "email": "lowercase, unique",
  "name": "…",
  "passwordHash": "bcrypt, never returned",
  "status": "active" | "disabled",
  "mustChangePassword": false,
  "tokenVersion": 0,           // bumped to revoke all of a user's tokens
  "createdAt", "updatedAt", "lastLoginAt"
}
```

**Bootstrap:** when no users exist, `BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD` create the first user (named `BOOTSTRAP_ADMIN_NAME`, default "Administrator") with the `design_system_manager` role and `mustChangePassword: true`. Without them, the backend logs how to create one.

**Ids:** a user's id is derived from their email (`usr_` + a hash of it), so two requests creating the same email can't both succeed. Emails can't be changed.

**Passwords:** at least 12 characters and at most 72 bytes (bcrypt ignores the rest), hashed with bcrypt.

**Lockout:** after 5 failed logins for an email within 15 minutes, that email is locked for 15 minutes, even for the right password. Unknown emails are tracked the same way. The count is kept in memory, so it is per backend instance and resets on restart. Every attempt is recorded through `SecurityAuditService`, as are lockouts, password changes, sign-outs and changes to users and roles.

## Tokens

- HS256 JWT signed with `AUTH_JWT_SECRET`, valid for 8 hours. The payload is `{ sub: userId, tv: tokenVersion }`.
- `AUTH_JWT_SECRET` is required outside development (`NODE_ENV` of `development` or `test`). In development, a random secret is generated with a warning, so tokens stop working on restart. Elsewhere, without it, sign-in returns `503` (API keys still work).
- On each request the guard loads the user and their permissions (cached for 30 seconds) and rejects disabled users or a mismatched `tv`. The instance that makes a change drops its cache at once; other instances see it within 30 seconds.
- Tokens are not refreshed. People sign in again after 8 hours.

## Routes

All under `/api/v1`.

### Auth

| Method and path | Permission | Body | Returns |
| --- | --- | --- | --- |
| `POST /auth/login` | public | `{ email, password }` | `{ accessToken, expiresAt, user: Me }`. `401` on bad credentials or a disabled user (same message for an unknown email); `423` when locked. |
| `POST /auth/logout` | any user | | `204`. Bumps `tokenVersion`, which signs out every session. `403` for an API key. |
| `GET /auth/me` | any principal | | `Me` |
| `POST /auth/change-password` | any user | `{ currentPassword, newPassword }` | `204`. Clears `mustChangePassword` and bumps `tokenVersion`, so the client must sign in again. A wrong current password returns `400` with the message "Current password is incorrect" (not `401`, which would sign the client out) and counts towards the lockout. The new password must differ from the current one. |

`Me` is `{ id, type, email, name, roles: string[], permissions: string[], mustChangePassword }`. For an API key, `email` is `null` and `roles` is empty.

Bodies of the auth, users and RBAC routes are rejected with `400` if they have unknown fields.

### Users

All need `admin:users`.

| Method and path | Body | Returns |
| --- | --- | --- |
| `GET /users` | `?q=&status=` | `{ users: User[], total }`, where `User` is the stored user without `passwordHash` and `tokenVersion`, plus `roles` (role ids). `q` matches email or name. |
| `GET /users/:id` | | `User` |
| `POST /users` | `{ email, name, password, roles? }` | `User`. `409` if the email is taken, `400` for an unknown role, `403` if `roles` is not empty and the caller lacks `admin:rbac`. The new user has `mustChangePassword: true`. |
| `PATCH /users/:id` | `{ name?, status? }` | `User`. Disabling a user bumps `tokenVersion`. |
| `POST /users/:id/reset-password` | `{ password }` | `204`. Sets `mustChangePassword` and bumps `tokenVersion`. `403` if the user has an `admin:` permission the caller lacks (a password reset would let the caller sign in as them). |

There is no hard delete: users are disabled. Disabling yourself, or disabling the last active user with `admin:rbac`, returns `409`.

### Roles

| Method and path | Permission | Notes |
| --- | --- | --- |
| `GET /rbac/roles`, `GET /rbac/roles/:id` | `admin:rbac` | `404` for an unknown role |
| `PUT /rbac/roles/:id` | `admin:rbac` | Body `{ permissions }`, each validated against the `Permission` enum. `409` if it would leave no active user with `admin:rbac`. |
| `GET /rbac/permissions` | `admin:rbac` | Lists every permission, including `admin:performance_analysis` and `admin:users` |
| `GET /rbac/users/:userId/roles` | `admin:rbac`, or the user themself | |
| `POST /rbac/users/:userId/roles` | `admin:rbac` | Body `{ roleId }`. `assignedBy` comes from the principal; `404` for an unknown user or role. |
| `DELETE /rbac/users/:userId/roles/:roleId` | `admin:rbac` | Removing the last active `admin:rbac` holder returns `409`; `404` if the user doesn't have the role. |
| `GET /rbac/roles/:roleId/users` | `admin:rbac` | Returns user summaries (`id`, `email`, `name`), not bare ids |
| `GET /rbac/users/:userId/permissions/:permission` | `admin:rbac`, or the user themself | |

**New permission:** `admin:users`. It is granted to `design_system_manager` and `system_owner`.

**Default roles** are created on startup if missing. A default permission added in a later release is added to the stored role once; permissions an admin removed or added are left alone. If Elasticsearch is down, RBAC and user routes return `503`.

### API keys

All need `admin:users`. A caller can only hand out permissions it has itself: creating a key, or rotating one (the new key keeps the old one's scopes), returns `403` naming the missing permissions if the key would have any the caller lacks. An unscoped key counts as having the default service permissions. So `admin:users` lets someone manage keys, but never gain anything through them; there is no separate key-management permission. The admin key can grant anything.

| Method and path | Body | Returns |
| --- | --- | --- |
| `POST /auth/api-keys` | `{ name, expiresInDays?, scopes? }` | `{ apiKey, metadata }`. The key (`dsk_` + 43 characters) is shown only here. `scopes` are permission names; unknown ones or an empty list return `400`. |
| `GET /auth/api-keys`, `GET /auth/api-keys/:id` | | Metadata: `id`, `name`, `scopes`, `createdAt`, `createdBy`, `expiresAt`, `lastUsed`, `revoked`, `revokedAt`, `rotatedFrom` |
| `GET /auth/api-keys/needing-rotation` | | Keys past the rotation policy's age limits |
| `POST /auth/api-keys/:id/rotate` | `{ revokeOld?, reason? }` | `{ newApiKey, newMetadata }`. Revokes the old key unless `revokeOld` is `false`. |
| `POST /auth/api-keys/:id/revoke` | | `404` for an unknown key |
| `GET /auth/api-keys/:id/rotation-history` | | Read from the key records (each rotated key names its predecessor) |

**Storage:** keys are stored in the Elasticsearch index `design-system-api-keys`, as a SHA-256 hash with their metadata; the key itself is never stored, encrypted or otherwise. They work on every replica and survive restarts. A key's id is derived from its hash, so checking a key is one read, cached for 30 seconds: the instance that revokes a key stops accepting it at once, other instances within 30 seconds. `lastUsed` is updated at most hourly. If Elasticsearch is down, requests with a managed key get `503`; `API_KEYS` and `ADMIN_API_KEY` keep working. Keys created before this storage existed were held in memory and are gone; create them again.

### Administrative routes

Besides the routes above, these need a permission on the server (`403` otherwise). Reading stays open to anyone signed in.

| Routes | Permission |
| --- | --- |
| `POST /banners`, `PUT /banners/:id`, `DELETE /banners/:id` | `admin:banners` |
| `POST /feature-flags`, `PUT /feature-flags/:id`, `PUT /feature-flags/:id/toggle`, `DELETE /feature-flags/:id`, `POST /feature-flags/enable-all` | `admin:system_health` |
| `POST /performance/budgets`, `PUT`/`DELETE /performance/budgets/:id` | `admin:performance_analysis` |
| `POST /roadmap/items`, `PUT`/`DELETE /roadmap/items/:id` | `roadmap:edit` |
| Request triage: `PUT /requests/:id/status`, `PUT /requests/:id/assign`, `POST /requests/:id/merge`, and `PATCH /component-requests/:id/status`, `POST /component-requests/:id/{assign,approve,reject,promote}` | `roadmap:edit` (the frontend shows these actions to the same people) |
| `POST /components` | `component:create`, and the `editor` role in `workspaceId` if one is given. `isGlobal` is ignored: sharing is set through the workspace routes. |
| `POST /components/:id/variants`, `DELETE /components/:id/variants/:name` | `component:edit` |
| `POST /patterns-library/patterns`, `PUT /patterns-library/patterns/:id`, `DELETE /patterns-library/patterns/:id` | `pattern:create`, `pattern:edit`, `pattern:delete` |
| `POST /contribution-workflow/guidelines`, `/templates`, `/checks` (defining the contribution process) | `component:approve` |
| `POST /contribution-workflow/templates/:id/generate-pr`, `POST /contribution-workflow/checks/run` | `component:create` |

Feature flags: `GET /feature-flags/check/:key` evaluates the flag for the caller (their id, and their roles as groups); `?userId=` and `?userGroups=` are ignored. Stored flags keep their values; the built-in flags are defaults for flags that were never stored, and deleting a built-in flag resets it to its default. Unknown keys return `404`.

### Components and workspaces

A component that belongs to a workspace (`workspaceId`) is visible only to that workspace's members, to members of workspaces it is shared with (`sharedWith`), and to everyone if `isGlobal`. Components without a workspace are the shared library and visible to all. `admin:users` holders see everything, as they do in workspaces; API keys can't be workspace members, so they see only library and global components.

The global routes apply this: `GET /components`, `/components/status/:status`, `/component-metadata`, `/search`, `/search/suggestions`, `/search/filters` and the AI chat leave hidden components out, and `/components/:id` (with `/variants`, `/test-coverage`, `/linked-requests`) answers a hidden component exactly like a missing one.

## Encryption key

`ENCRYPTION_KEY` encrypts stored third-party credentials (OAuth secrets, integration tokens). Use 32 random bytes as 64 hex characters (`openssl rand -hex 32`) or 44 base64 characters; any other value is treated as a passphrase and stretched with PBKDF2 and a fixed salt, so every replica and restart derives the same key. Outside development (`NODE_ENV` of `development` or `test`) it is required: without it, storing or reading encrypted values returns `503`. In development a random key is used, so encrypted values don't survive a restart.

Earlier versions derived a passphrase key with a random salt on each start, so values encrypted under a passphrase could only be read by the process that wrote them; they can't be recovered and must be entered again (reconnect the integration). Values encrypted under a hex or base64 key are unaffected. To move to a raw key, set the new `ENCRYPTION_KEY` and re-enter the stored credentials.

## Frontend

- `/login` is the only route that works without signing in. Other routes redirect to `/login?redirect=<path>`.
- The access token is kept in `sessionStorage`; `useAuth()` exposes `user`, `permissions`, `hasPermission()`, `login()`, `logout()` and `refreshMe()`.
- `apiClient` and every other backend call send the user's token. The browser no longer uses `VITE_API_KEY`.
- When `mustChangePassword` is set, the app shows the change-password screen before anything else.
- A `401` from the API signs the user out and redirects to `/login`. A `403` shows "You don't have access to this".
- When the token's `expiresAt` passes, the app signs the user out and redirects to `/login?redirect=…&expired=1`, whether or not a request or navigation happens first.
- Admin routes (`/admin/*`) are guarded by prefix and fail closed:

  | Prefix | Permission |
  | --- | --- |
  | `/admin/users` | `admin:users` |
  | `/admin/roles` | `admin:rbac` |
  | `/admin/audit` | `admin:audit` |
  | `/admin/governance` | `admin:governance` |
  | `/admin/health` | `admin:system_health` |
  | `/admin/performance` | `admin:performance_analysis` |
  | `/admin/banners`, `/admin/content` | `admin:banners` |
  | `/admin/feature-flags` | `admin:system_health` |
  | `/admin/applications` | `admin:governance`, or admin/owner of at least one workspace (the server lets workspace admins change their workspaces' applications; see [WORKSPACES.md](WORKSPACES.md#applications)) |
  | `/admin/accessibility-reports` | `admin:governance` |
  | `/admin/dependencies` | `component:view` |
  | `/admin/workspaces` | none beyond signing in (each workspace enforces its own roles on the server) |
  | anything else under `/admin` | `admin:users` |

  If permissions can't be loaded, the guard denies.
- Feature flags hide a page (route guard and navigation) only when the flag is off for the user, using the same targeting rules as the server. A flag that doesn't exist, or flags that can't be loaded, hide nothing: that is deliberate, so a slow or failing flag request never locks people out of pages.
- `VITE_USE_MOCKS=true` signs in a local demo user, with no backend.
