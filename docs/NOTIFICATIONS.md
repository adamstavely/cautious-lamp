# Notifications and delivery

Notifications appear in the app (the bell and **Change notifications**, `/notifications`) and can also be delivered outside it: by email, to Slack, to Microsoft Teams, and to a generic signed webhook. Visual regression projects use the same delivery for build results ([ARGOS_VISUAL_REGRESSION_SERVICE.md](ARGOS_VISUAL_REGRESSION_SERVICE.md#notifications)).

The code is in `backend/src/delivery/` (sending and the record of attempts), `backend/src/notifications/` (people's channels) and `backend/src/visual-regression/visual-regression-notifier.ts` (project channels).

## What gets delivered

- **Design system changes** a person follows (components, tokens, patterns), filtered by their preferences: the kinds of change and "only breaking changes". "Show notifications in the app" only controls the in-app list; email, Slack, Teams and webhooks have their own switches.
- **Component request updates**: a request you made was updated, assigned to you, commented on, or a request you voted on was approved, rejected, completed or released.
- **Visual regression builds**: when an Argos build for a project finishes (`visual-regression.build.completed`) or fails (`visual-regression.build.failed`), once per run.

## Setting up the server

| Channel | Needs on the server | Without it |
| --- | --- | --- |
| Email | SMTP: `SMTP_FROM` and `SMTP_URL`, or `SMTP_HOST` (with `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`) | The settings pages say "Email isn't set up on this server" and name the missing variable. Nothing is sent and the switch can't be turned on. |
| Slack, Teams, webhook | Outbound HTTPS to the URLs people save | Deliveries fail and are listed as failed. |

Also set:

- `ENCRYPTION_KEY`: saved URLs and webhook signing secrets are encrypted with it ([AUTH.md](AUTH.md#encryption-key)). Without it (outside development) saving a URL answers `503`.
- `APP_PUBLIC_URL`: the frontend's public origin (for example `https://design.example.com`). Messages link back to the app with it; without it they carry no link.

Examples (`backend/.env.example` lists them all):

```
SMTP_URL=smtps://user:password@smtp.example.com:465
SMTP_FROM="Design system <design-system@example.com>"
APP_PUBLIC_URL=https://design.example.com
```

## Setting up a channel (people)

On **Change notifications → Following and preferences → Email, Slack, Teams and webhooks**:

- **Email** goes to the address you sign in with. It needs SMTP on the server.
- **Slack**: create an [incoming webhook](https://api.slack.com/messaging/webhooks) for the channel and paste its URL.
- **Microsoft Teams**: create an incoming webhook (or a Workflows "post to a channel when a webhook request is received" flow) and paste its URL. Messages are sent as an Adaptive Card.
- **Webhook**: any https endpoint. Leave the signing secret empty to have one generated; it is shown once, when you save.

Saving a URL turns the channel on. **Send test** sends a test message to that channel straight away, and **Recent deliveries** lists the last 30 days of deliveries with their status (sent, failed, refused, not set up), the error and how many tries it took.

URLs (they work as passwords: anyone with a Slack or Teams webhook URL can post to the channel) and webhook secrets are stored encrypted and never returned by the API. The API only says whether one is saved.

## How delivery works

- **Egress checks.** URLs must be `https` and point at public addresses. They are checked when saved (`400` otherwise) and again at send time: the host is resolved once, every address checked, and the connection made to that address, so a DNS answer that changes between the check and the connection (rebinding) can't reach an internal service. Private, loopback, link-local (including cloud metadata) and reserved ranges are refused; such a delivery is recorded as `refused` and nothing is sent. Redirects aren't followed.
- **Timeouts and retries.** Each try has a 10 second timeout (HTTP request, or each SMTP stage). Network errors, timeouts, HTTP 5xx, 408 and 429, and SMTP 4xx answers are retried up to 3 tries in all, waiting 1 then 2 seconds. HTTP 4xx and SMTP 5xx answers are permanent and not retried.
- **Record.** Every delivery is stored in the Elasticsearch index `design-system-delivery-attempts`: owner (a person or a visual regression project), channel, target (the recipients for email, only the host for URLs), event, title, status, each try with its time, HTTP status and error, and timestamps. No URL or secret is stored there. Failures are also logged as warnings.
- **No blocking.** Deliveries run in the background after the change that caused them has been saved; a slow or failing target never fails or delays the change.

### API

| Route | |
| --- | --- |
| `GET /api/v1/notifications/settings` | Subscriptions, preferences (`channels: { email, slack, teams, webhook }`) and `targets: { slack, teams, webhook: { configured, savedAt? } }` |
| `PUT /api/v1/notifications/preferences` | Turn channels on or off: `{ channels: { slack: true } }` |
| `GET /api/v1/notifications/delivery` | `{ channels: { email: { available, reason? }, … }, attempts: [...] }` |
| `PUT /api/v1/notifications/channels/:channel` | `slack`, `teams` or `webhook`: `{ url, secret? }`. Turns the channel on. A webhook's response includes `secret` once. |
| `DELETE /api/v1/notifications/channels/:channel` | Removes the URL and turns the channel off |
| `POST /api/v1/notifications/channels/:channel/test` | `email`, `slack`, `teams` or `webhook`: sends a test now; answers with the recorded attempt |

## Verifying webhooks

Generic webhooks are a JSON `POST`:

```json
{
  "id": "dlv_…",
  "event": "design-system-change",
  "title": "Component \"Button\" updated",
  "text": "Variant \"dense\" saved. By Sue.",
  "link": "https://design.example.com/components",
  "data": { "changelogEntryId": "chg_…", "type": "component", "entityId": "button", "action": "updated", "breaking": false },
  "sentAt": "2026-11-15T10:00:00.000Z"
}
```

with these headers:

| Header | |
| --- | --- |
| `X-Signature-256` | `sha256=<hex HMAC-SHA256 of "<timestamp>.<raw body>" with your secret>` |
| `X-Signature-Timestamp` | Unix time in seconds when it was signed |
| `X-Delivery-Id` | The delivery's id (also `id` in the body); the same on every retry of one delivery |
| `X-Delivery-Event` | The event, e.g. `design-system-change`, `request-commented`, `visual-regression.build.completed`, `test` |

To verify: recompute the HMAC over the timestamp header, a `.`, and the raw request body (not re-serialized JSON); compare in constant time; reject timestamps more than a few minutes old; and ignore an `X-Delivery-Id` you have already handled.

```js
const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex');
const ok = expected.length === signature.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
```

Answer with any 2xx status to acknowledge.
