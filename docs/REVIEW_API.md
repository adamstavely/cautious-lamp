# Review API

The review section (`/review`) is backed by the `reviews` module in `backend/src/reviews/`. This is the contract between that module, the frontend client in `frontend/src/services/api.js` and the MCP server's review tools.

The response bodies match what the browser-only mock returns for the same operation (`mockAPI` in `frontend/src/mockData.js`), with the security changes below. Mock mode is now only used when `VITE_USE_MOCKS=true`.

## Conventions

- **Base path:** `/api/v1`.
- **Auth:** every route requires `Authorization: Bearer <token>`: a signed-in user's token, or an API key (docs/AUTH.md). Admin routes (`/admin/...`) require `admin:users` (the admin key has it). What a caller may do with a particular review is decided by the access rules below.
- **Header encoding:** `x-review-password` and `x-user-name` carry free text, so clients send them URL-encoded with `encodeURIComponent`; the server decodes them. HTTP headers can only carry ASCII, so a raw non-ASCII value would be mangled.
- **Acting user:** the signed-in user. An API key has no reviewer identity: its `x-user-name` (else `x-user-email`) is recorded on comments and history as a label, and never counts as the designer, an approved email or a team member.
- **Review passwords:**
  - Sent as an `x-review-password` header, never in the URL, on every request about a review (reads, comments and workflow changes) by someone who isn't the designer, on the review's team or a review admin.
  - Stored as bcrypt hashes and never returned; responses include `hasPassword: boolean` instead.
  - A protected review requested without the right password returns `401 { "passwordRequired": true }`.
- **Sharing:** with `sharingMode: "approved_emails"`, requests about the review return `403` unless the signed-in user's email is the designer's or in `approvedEmails` (case-insensitive), or they're on the review's team or a review admin. Sharing is checked before the password.
- **Expiry:** reviews expire 30 days after creation unless extended. Expired reviews return `410` to non-admin routes and are hidden from lists unless `showExpired=true` (which only shows the expired reviews the caller could otherwise open). Completing a review expires it immediately; an admin can reactivate it.
- **Errors:** standard Nest errors, `{ statusCode, message }`. A storage outage is `503`; nothing reports success it didn't achieve. Request bodies with unknown fields are rejected with `400`.
- **Storage:** Elasticsearch.
  - Index `reviews` holds one document per review, with its versions, comments and workflow history.
  - Index `reviews-teams` holds teams.
  - Writes use optimistic concurrency (`if_seq_no`/`if_primary_term`) and retry on conflict, so concurrent comments aren't lost.

## Access

One policy (`backend/src/reviews/review-access.ts`) decides every route and the list:

| Who | Sees the review | Comments | Versions, extend, complete, move/resubmit workflow | Sharing and password | Approve / reject |
| --- | --- | --- | --- | --- | --- |
| Review admin (`review:admin`: `review_manager`, `design_system_manager`, the admin key) | always | yes | yes | yes | any stage |
| The designer (signed in with `designerEmail`) | always | yes | yes | yes | only with the stage's role |
| A member of the review's team | always | yes | yes, unless their team role is Client | no | only with the stage's role |
| Anyone else signed in | if sharing allows them, with the password | if they can see it | no | no | only with the stage's role |
| An API key without `review:admin` | `anyone` reviews only, with the password | if it can see it | no | no | no |

- **Stage roles:** `client_review` needs the `client` role, `art_director_review` `art_director` and `creative_director_review` `creative_director`, from the user's RBAC roles or their role on the review's team (team roles are free text, so "Art Director" counts as `art_director`), plus `review:approve` to approve or `review:reject` to reject. Review admins may decide any stage.
- **Comments:** anyone who can see the review can comment, reply and react. Editing or deleting a comment is for its author (by signed-in email), the designer, the team and review admins.
- **Teams:** membership grants access, so creating and changing teams needs `review:admin`. Reading them doesn't.
- Forbidden requests return `403` and nothing about the review.

### allowedActions

Reviews and list summaries carry `allowedActions`: what the caller may do now, given the review's state, its expiry and the rules above. The UI shows controls from it rather than guessing from roles; the routes enforce the same rules.

| Action | Route |
| --- | --- |
| `approve`, `reject` | `POST /review/:id/workflow/approve` / `reject` with the current `stage` |
| `move-to-client-review`, `move-to-art-director-review`, `resubmit` | the workflow route of that name |
| `upload-version` | `POST /review/:id/versions` |
| `extend`, `complete` | `POST /review/:id/extend` / `complete` |
| `manage-sharing`, `manage-password` | `POST /review/:id/sharing` / `password` |

An expired or completed review has none.

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
  "approvedEmails": [],          // only to those who may change sharing; [] for everyone else
  "versions": [{ "id", "label", "notes", "type", "filename", "contentType", "size", "uploadedAt", "uploadedBy", "url?" }], // "url" only on a url review's version
  "comments": [ /* see Comments */ ],
  "createdAt", "updatedAt", "expiresAt", "extended": false,
  "allowedActions": ["approve", "reject"] // see Access
}
```

## Routes

### Reviews

| Method and path | Body or query | Returns |
| --- | --- | --- |
| `GET /reviews` | `?workflowState=&q=&showExpired=` | `{ reviews: ReviewSummary[], total }`: the reviews the caller could open without a password (see Access); every review for a review admin. A summary is the review without `comments` and `workflowHistory`. The whole index is read (Elasticsearch point-in-time paging), so the list is never cut short. |
| `GET /review/:id` | header `x-review-password` | Review |
| `GET /review/:id/version/:versionId` | header `x-review-password` | `{ url }`: an absolute signed URL for the file, valid 10 minutes. For a url review, the external link. |
| `POST /review/:id/complete` | | Review |
| `POST /review/:id/sharing` | `{ sharingMode, approvedEmails }` | Review. Designer or review admin only. |
| `POST /review/:id/password` | `{ password }` (empty clears it) | `{ hasPassword }`. Designer or review admin only. |
| `POST /review/:id/extend` | `{ days }` (1–90) | Review |

### Creating reviews

| Method and path | Body | Returns |
| --- | --- | --- |
| `POST /upload` | `{ filename, password?, bypassClientReview?, sharingMode?, approvedEmails?, teamId? }` | `{ reviewId, uploadUrl }`. `uploadUrl` is an absolute one-time `PUT /api/v1/upload/:reviewId/:token` URL for the file body, valid 1 hour. |
| `PUT /upload/:reviewId/:token` | raw file body, `Content-Type` set to the file type | `{ success: true, versionId }`. No API key needed; the one-time token authorizes it (`403` once used, expired or wrong). PDF, PNG, JPEG, GIF, WebP and SVG only (`415` otherwise), up to 50MB (`413`). The bytes must match the declared type (`400`). |
| `POST /review/create-from-url` | `{ url, filename?, password?, bypassClientReview?, sharingMode?, approvedEmails?, teamId? }` | `{ reviewId, review }` |

### Versions

| Method and path | Body | Returns |
| --- | --- | --- |
| `POST /review/:id/versions` | multipart: `file`, `label`, `notes?`, `type?` | the new version. Same types and limit as the upload PUT. |
| `GET /review-files/:fileId?expires=&sig=` | | the file. Signed URL, no API key, so `<iframe>` and the PDF viewer can load it. `403` for a bad or expired signature. Served with its stored type, `Content-Disposition: inline`, `X-Content-Type-Options: nosniff`, and for SVG `Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; sandbox`. |

Files are stored under `REVIEW_UPLOAD_DIR/<reviewId>/` with random names (never the client's filename) and deleted with the review.

### Workflow

All return the updated review. Invalid transitions return `409`; a caller without the right (see Access) gets `403`.

| Method and path | Body |
| --- | --- |
| `POST /review/:id/workflow/move-to-client-review` | |
| `POST /review/:id/workflow/move-to-art-director-review` | |
| `POST /review/:id/workflow/approve` | `{ stage }` |
| `POST /review/:id/workflow/reject` | `{ stage, reason? }` |
| `POST /review/:id/workflow/resubmit` | `{ targetStage }` |

Allowed transitions (`approve` and `reject` need `stage` to equal the current state):
- A review created with `bypassClientReview` starts in `art_director_review`
- `draft` → `client_review` via move-to-client-review (or → `art_director_review` via move-to-art-director-review when `bypassClientReview`)
- `client_review` → approve → `client_approved`, then move to → `art_director_review`
- `art_director_review` → approve → `creative_director_review` → approve → `approved`
- Reject at any review stage → `draft`
- Resubmit from `draft` → the given `targetStage` (`client_review`, `art_director_review` or `creative_director_review`)

Each transition appends a `workflowHistory` entry; `user` is the signed-in user's name (for an API key, `x-user-name`, else `x-user-email`).

### Comments

| Method and path | Body | Returns |
| --- | --- | --- |
| `GET /review/:id/comments` | `?versionId=` | `Comment[]` |
| `POST /review/:id/comments` | `{ text, version?, type?, resolved?, annotationId?, annotationData? }` (`version` defaults to the latest version, `type` to `"general"`) | Comment |
| `PATCH /review/:id/comments/:commentId` | `{ text?, resolved?, annotationData? }` | Comment |
| `DELETE /review/:id/comments/:commentId` | | `204` |
| `POST /review/:id/comments/:commentId/replies` | `{ text }` | Reply |
| `POST /review/:id/comments/:commentId/reactions` | `{ emoji }` (toggles for the acting user, keyed by their email; for an API key, by its `x-user-name` / `x-user-email` label, `400` without one) | Comment |
| `POST /review/:id/comments/:commentId/replies/:replyId/reactions` | `{ emoji }` | Comment |

`Comment` is `{ id, text, author, authorEmail, version, type, resolved, annotationId?, annotationData?, replies: [{ id, text, author, authorEmail, timestamp, reactions }], reactions: { [emoji]: [email] }, timestamp }`.

### Admin (`admin:users`, e.g. `ADMIN_API_KEY`)

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
| `POST /teams` | `{ name, description? }` | Team. This and the other team writes need `review:admin`. |
| `PATCH /teams/:id` | `{ name?, description? }` | Team |
| `DELETE /teams/:id` | | `204` |
| `POST /teams/:id/members` | `{ email, name, role }` | Team |
| `PATCH /teams/:id/members/:email` | `{ role }` | Team |
| `DELETE /teams/:id/members/:email` | | Team |

`Team` is `{ id, name, description, members: [{ email, name, role }], createdAt, updatedAt }`. A member's `role` (Designer, Art Director, Creative Director, Client) counts as the matching stage role on the team's reviews.

## Configuration

| Variable | |
| --- | --- |
| `REVIEW_FILE_SECRET` | HMAC key for signed file URLs. Required unless `NODE_ENV` is `development` or `test`, where a random one is generated per process (with a warning). Without it, signed URLs are refused with `503`. |
| `REVIEW_UPLOAD_DIR` | File storage root, default `uploads/reviews`. |
| `PUBLIC_API_URL` | Origin used to build `uploadUrl` and signed URLs; defaults to the request's origin. |

## Differences from the mock

The mock in `frontend/src/mockData.js` predates this contract. Where they disagree, the server follows this document: rejection returns a review to `draft` (the mock used `ad_changes_requested` / `cd_changes_requested`), reactions are `{ [emoji]: [email] }` (the mock used an array of `{ user, emoji }`), sharing mode `approved_emails` (the mock said `restricted`), ids are `rev_…` / `cmt_…` / `team_…`, and passwords are never returned.
