# Visual regression: done and open

What the Argos-backed visual regression service does today, and what is still open. How it works is in [ARGOS_VISUAL_REGRESSION_SERVICE.md](ARGOS_VISUAL_REGRESSION_SERVICE.md).

## Done

**Argos and runs**
- Argos REST API v2 client (projects as `owner/project`), with a self-hosted URL allow-list (`ARGOS_ALLOWED_BASE_URLS`).
- Token check on create and update, with separate messages for a refused token, a missing project and an unreachable Argos.
- Runs read from Argos builds when listed (throttled per project), when results are opened, or on a build notification. Runs can't be started from the workbench; Argos builds come from CI uploads.
- Approve and reject per screenshot, recorded in Argos as a review (needs a personal access token) and on the result.

**CI**
- CI setup tab and `GET .../projects/:id/ci-setup`: Playwright config, screenshot helper and `argos upload` command generated from the project's test settings and current baseline.
- Signed build notifications from CI (`POST /webhooks/argos`, HMAC-SHA256 over the raw body, per-project secret).
- See [ARGOS_CI_CD_INTEGRATION.md](ARGOS_CI_CD_INTEGRATION.md).

**Results page**
- Diff viewer with slider, side by side, overlay and grid; zoom, pan and full screen.
- Search, status filter, filter and sort by review date, sort by name and status.
- Bulk approve and reject.
- Keyboard shortcuts, auto-refresh (polling), CSV export, PDF report.

**Projects**
- Workspace ownership with viewer/editor/admin roles, per-person sharing as viewer or editor, creator-only projects without a workspace.
- Baselines as versions, with history and rollback; the current baseline sets the upload's `--reference-commit`.
- Analytics for a period: builds, passed, to review, failed, average test duration, counts by day.
- Build result notifications by email, Slack, Teams and signed webhook, with test sends and a delivery log.
- Argos tokens, webhook secrets and notification URLs encrypted at rest; never returned.
- Projects and runs stored in Elasticsearch; run and result lists are paged.
- Every API call (reviews, baselines and settings included) is recorded by the global audit interceptor ([DATABASE_INDEXING.md](DATABASE_INDEXING.md#audit-log)); there are no visual-regression-specific audit events.

## Open

- Sort results by diff score (Argos returns a `score` per diff; it isn't stored).
- Compare two baselines with each other; automatic baseline promotion rules.
- Notification preferences per user, digest or scheduled reports.
- Argos usage or cost tracking, usage quotas.
- Image annotation, a screenshot timeline per test.
- Live updates without polling (there is no WebSocket client; pages poll).

## Not built

A workbench CLI, SDK, GitHub Action, status badge or PR comments. Use Argos's own CLI and its GitHub or GitLab integration for these.
