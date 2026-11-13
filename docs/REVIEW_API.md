# Review API

The review section (`/review`) is backed by the `reviews` module in `backend/src/reviews/`. This is the contract between that module, the frontend client in `frontend/src/services/api.js` and the MCP server's review tools.

The response bodies match what the browser-only mock returns for the same operation (`mockAPI` in `frontend/src/mockData.js`), with the security changes below. Mock mode is now only used when `VITE_USE_MOCKS=true`.

## Conventions

- **Base path:** `/api/v1`.
- **Auth:** every route requires `Authorization: Bearer <key>`, where the key is in `API_KEYS` or was created at runtime. Admin routes (`/admin/...`) require `ADMIN_API_KEY` instead.
- **Acting user:** until real user accounts exist (Phase 2), the frontend sends `x-user-email` and `x-user-name`. They are recorded on comments and workflow history. They're self-asserted, so they're display information, not authorization.
- **Review passwords:**
  - Sent as an `x-review-password` header, never in the URL.
  - Stored as bcrypt hashes and never returned; responses include `hasPassword: boolean` instead.
  - A protected review requested without the right password returns `401 { "passwordRequired": true }`.
- **Expiry:** reviews expire 30 days after creation unless extended. Expired reviews return `410` to non-admin routes and are hidden from lists unless `showExpired=true`.
- **Errors:** standard Nest errors, `{ statusCode, message }`. A storage outage is `503`; nothing reports success it didn't achieve.
- **Storage:** Elasticsearch.
  - Index `reviews` holds one document per review, with its versions, comments and workflow history.
  - Index `reviews-teams` holds teams.
  - Writes use optimistic concurrency (`if_seq_no`/`if_primary_term`) and retry on conflict, so concurrent comments aren't lost.

## Review object

```jsonc
{
  "id": "rev_…",
  "filename": "Website Design v2.pdf",
  "sourceType": "upload" | "url",
  "url": "https://…",            // url reviews only, http(s) only, never fetched by the server
  "hasPassword": true,
  "designer": "Sarah Johnson",
  "designerEmail": "sarah@example.com",
  "teamId": "team_…" | null,
  "completed": false,
  "workflowState": "draft" | "client_review" | "client_approved" | "art_director_review" | "art_director_approved" | "creative_director_review" | "approved",
  "workflowHistory": [{ "stage", "action", "user", "timestamp", "reason?", "versionLabel?" }],
  "bypassClientReview": false,
  "sharingMode": "anyone" | "approved_emails",
  "approvedEmails": [],
  "versions": [{ "id", "label", "notes", "type", "filename", "contentType", "size", "uploadedAt", "uploadedBy" }],
  "comments": [ /* see Comments */ ],
  "createdAt", "updatedAt", "expiresAt", "extended": false
}
```

## Routes

### Reviews

| Method and path | Body or query | Returns |
| --- | --- | --- |
| `GET /reviews` | `?workflowState=&q=&showExpired=` | `{ reviews: ReviewSummary[], total }`. A summary is the review without `comments` and `workflowHistory`. |
| `GET /review/:id` | header `x-review-password` | Review |
| `GET /review/:id/version/:versionId` | header `x-review-password` | `{ url }`: a signed URL for the file, valid 10 minutes |
| `POST /review/:id/complete` | | Review |
| `POST /review/:id/sharing` | `{ sharingMode, approvedEmails }` | Review |
| `POST /review/:id/password` | `{ password }` (empty clears it) | `{ hasPassword }` |
| `POST /review/:id/extend` | `{ days }` (1–90) | Review |

### Creating reviews

| Method and path | Body | Returns |
| --- | --- | --- |
| `POST /upload` | `{ filename, password?, bypassClientReview?, sharingMode?, approvedEmails?, teamId? }` | `{ reviewId, uploadUrl }`. `uploadUrl` is a one-time `PUT /upload/:reviewId/:token` URL for the file body. |
| `PUT /upload/:reviewId/:token` | raw file body, `Content-Type` set to the file type | `{ success: true, versionId }`. No API key needed; the one-time token authorizes it. PDF, PNG, JPEG, GIF, WebP and SVG only, up to 50MB. |
| `POST /review/create-from-url` | `{ url, filename?, password?, bypassClientReview?, sharingMode?, approvedEmails?, teamId? }` | `{ reviewId, review }` |

### Versions

| Method and path | Body | Returns |
| --- | --- | --- |
| `POST /review/:id/versions` | multipart: `file`, `label`, `notes?`, `type?` | the new version |
| `GET /review-files/:fileId?expires=&sig=` | | the file. Signed URL, no API key, so `<iframe>` and the PDF viewer can load it. |

### Workflow

All return the updated review. Invalid transitions return `409`.

| Method and path | Body |
| --- | --- |
| `POST /review/:id/workflow/move-to-client-review` | |
| `POST /review/:id/workflow/move-to-art-director-review` | |
| `POST /review/:id/workflow/approve` | `{ stage }` |
| `POST /review/:id/workflow/reject` | `{ stage, reason? }` |
| `POST /review/:id/workflow/resubmit` | `{ targetStage }` |

Allowed transitions:
- `draft` → `client_review` (or → `art_director_review` when `bypassClientReview`)
- `client_review` → approve → `client_approved`, then move to → `art_director_review`
- `art_director_review` → approve → `creative_director_review` → approve → `approved`
- Reject at any review stage → `draft`
- Resubmit from `draft` → the given `targetStage`

### Comments

| Method and path | Body | Returns |
| --- | --- | --- |
| `GET /review/:id/comments` | `?versionId=` | `Comment[]` |
| `POST /review/:id/comments` | `{ text, version, type, resolved?, annotationId?, annotationData? }` | Comment |
| `PATCH /review/:id/comments/:commentId` | `{ text?, resolved?, annotationData? }` | Comment |
| `DELETE /review/:id/comments/:commentId` | | `204` |
| `POST /review/:id/comments/:commentId/replies` | `{ text }` | Reply |
| `POST /review/:id/comments/:commentId/reactions` | `{ emoji }` (toggles for the acting user) | Comment |
| `POST /review/:id/comments/:commentId/replies/:replyId/reactions` | `{ emoji }` | Comment |

`Comment` is `{ id, text, author, authorEmail, version, type, resolved, annotationId?, annotationData?, replies: [{ id, text, author, authorEmail, timestamp, reactions }], reactions: { [emoji]: [email] }, timestamp }`.

### Admin (`ADMIN_API_KEY`)

| Method and path | Body or query | Returns |
| --- | --- | --- |
| `GET /admin/reviews` | `?showExpired=true` | `ReviewSummary[]` |
| `POST /admin/reviews/:id/extend` | `?days=` (1–365) | Review |
| `POST /admin/reviews/:id/reactivate` | | Review |
| `POST /admin/reviews/:id/reset-password` | `{ password }` | `{ hasPassword }` |
| `DELETE /admin/reviews/:id` | | `204`, and stored files are deleted |
| `POST /admin/reviews/batch-delete` | `{ ids }` | `{ deleted }` |

### Teams

| Method and path | Body | Returns |
| --- | --- | --- |
| `GET /teams` | | `Team[]` |
| `GET /teams/:id` | | Team |
| `POST /teams` | `{ name, description? }` | Team |
| `PATCH /teams/:id` | `{ name?, description? }` | Team |
| `DELETE /teams/:id` | | `204` |
| `POST /teams/:id/members` | `{ email, name, role }` | Team |
| `PATCH /teams/:id/members/:email` | `{ role }` | Team |
| `DELETE /teams/:id/members/:email` | | Team |

`Team` is `{ id, name, description, members: [{ email, name, role }], createdAt, updatedAt }`.
