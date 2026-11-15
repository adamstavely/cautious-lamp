# OpenReplay session replay: what's built and what isn't

This is the state of the session-replay integration (`backend/src/session-replay/`, `/hcd/session-replay`). For setup and the API, see [GETTING_STARTED_SESSION_REPLAY.md](./GETTING_STARTED_SESSION_REPLAY.md).

Tests never reach a real OpenReplay. They use a local HTTP stand-in for its public API and a stub tracker in jsdom. The endpoints called are the ones in OpenReplay's public API documentation (v2).

## Built

### Projects

- Projects are stored in **Elasticsearch** (index `design-system-session-replay-projects`, through `EsQueryableStore`), not in memory.
- **Access control**: every route checks the caller's access to the project (`ProjectAccessService`). Workspace viewers can read, editors can create and change, and a project without a workspace is visible only to its creator.
- **API keys are encrypted** at rest (`EncryptionService`). They are write-only: responses carry only `hasApiKey`.
- The **project key** (used by the tracker and the public API) and the **numeric project ID** (used in dashboard links) are stored separately and each is validated. Projects that stored the numeric ID as their key are migrated when read, and asked for their key again.
- With an API key, saving checks the key and the project with OpenReplay, and fills in the numeric ID.
- The base URL is checked against SSRF when saved and again before every request (`OPENREPLAY_ALLOWED_BASE_URLS` for self-hosted instances).
- `GET /integrations/status` reports how many projects have credentials and, with `check`, which can't reach OpenReplay.

### Tracker setup

- Integration code is generated for both installs: OpenReplay's **script-tag** loader, which loads `openreplay.js` from OpenReplay's CDN, and the **npm package** (`@openreplay/tracker`). It is tested in jsdom with no runtime errors.
- **Privacy and capture settings** have a UI in project create and settings, and are applied in the generated code: input mode, private mode, email and number obscuring, mask and block selectors (as a `domSanitizer`), Do Not Track, console, network, request bodies and iframes.

### Sessions

- **Server-side filters and pagination**, as far as OpenReplay's public API allows: user ID (required by the API), date range, sort order, page and page size (up to 200). The search is kept in the page address.
- **Session events** (`GET .../sessions/:sessionId/events`), paginated, for the session's time window.
- **Replay URL** (`GET .../sessions/:sessionId/replay-url`): OpenReplay's player for the session, with an access check.
- **Heatmaps** (`GET .../heatmaps-url`): a link to the project's heatmap cards in OpenReplay. No heatmap UI is drawn here, by design.
- Errors are reported, never faked: `503 OPENREPLAY_NOT_CONFIGURED`, `409 OPENREPLAY_PROJECT_KEY_MISSING`, `409 OPENREPLAY_PROJECT_ID_MISSING`, `502 OPENREPLAY_ERROR`.

### Platform

- **Rate limiting** applies to these routes like every other API route (`common/rate-limiting`).
- Writes are recorded by the audit log, with API keys redacted (`audit/audit.interceptor.ts`).

## Not built

These items are **not built**. Nothing in the UI suggests they exist.

### Limited by OpenReplay's public API

The public API lists sessions per user and has no project-wide search, so these would need OpenReplay's internal dashboard API or its own UI:

- **Not built**: searching all sessions of a project, or filtering by errors, issue type, duration, live sessions or email.
- **Not built**: per-session error counts, issue scores, page counts and favorites. The public API's session listing doesn't return them.
- **Not built**: project-wide session counts. The application page shows whether the project is connected instead.

### Analytics

- **Not built**: a session analytics dashboard (trends, error rates, user journeys, performance, Core Web Vitals).
- **Not built**: error grouping, error timelines and impact analysis.
- **Not built**: exporting analytics and scheduled reports.

### Session viewer

- **Not built**: an embedded or custom player. OpenReplay forbids framing (`X-Frame-Options: DENY`), so replays open in OpenReplay.
- **Not built**: console and network panels, error details with stack traces, and a session timeline. The events list is the only session detail here.
- **Not built**: annotations and notes on sessions.

### Alerts, webhooks and retention

- **Not built**: alerts on errors or issues. These are set up in OpenReplay.
- **Not built**: webhooks for session events.
- **Not built**: retention settings and automatic data clean-up. Retention is OpenReplay's setting.
- **Not built**: GDPR export or deletion of a user's sessions (the public API has user deletion; nothing calls it).

### Tools

- **Not built**: framework-specific guides beyond the script and npm snippets, a CLI, an SDK wrapper, and CI templates. [CI_CD_OPENREPLAY_INTEGRATION.md](./CI_CD_OPENREPLAY_INTEGRATION.md) has examples, not shipped tooling.
- **Not built**: more than one OpenReplay instance per project.
