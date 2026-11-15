# Visual regression service

Teams connect an [Argos](https://argos-ci.com) project to the workbench and review its builds here. Argos does the screenshot comparison; the workbench keeps projects, runs, baselines, sharing and notifications, and reads builds from the Argos API ([ARGOS_API_INTEGRATION.md](ARGOS_API_INTEGRATION.md)). Builds come from screenshot uploads in CI ([ARGOS_CI_CD_INTEGRATION.md](ARGOS_CI_CD_INTEGRATION.md)); nothing here starts a run.

## Where it lives

| Part | Location |
| --- | --- |
| Backend | `backend/src/visual-regression/`: controller, service, Argos client, `ci-setup.ts`, notifier, project access |
| Frontend | `/tools/visual-regression` (`VisualRegression.vue`, project list and create), `/tools/visual-regression/:id` (`VisualRegressionProject.vue`), `/tools/visual-regression/:id/runs/:runId` (`VisualRegressionResults.vue`); panels in `frontend/src/components/visual-regression/` |
| Storage | Elasticsearch: `design-system-visual-regression-projects` (projects with their baselines, baseline history, shares and notification channels) and `design-system-visual-regression-runs` (runs with their results). There is no SQL database. |

Argos tokens, webhook secrets and notification URLs are encrypted at rest (`ENCRYPTION_KEY`) and never returned.

## Pages

- **Project list**: projects the caller can read with totals (projects, pass rate, runs, pending diffs), and a form to create one (name, description, workspace, Argos project `owner/project`, token, optional self-hosted URL, branch).
- **Project page** tabs:
  - **Overview**: analytics for a chosen period (builds, passed, to review, failed, average test time, counts by day).
  - **Test runs**: the project's Argos builds, newest first, paged.
  - **Baselines**: record a run as the baseline, see versions and history, roll back.
  - **CI setup**: the generated Playwright config, screenshot helper, upload command and, with a secret, the build notification command.
  - **Settings**: project details, test settings (test folders, browsers, viewports, ignore patterns, screenshot options), sharing, build notification secret, and where build results are sent.
- **Results page**: one run's screenshots with a diff viewer (slider, side by side, overlay, grid; zoom, pan and full screen), search, status filter, filter and sort by review date, approve or reject one or several, keyboard shortcuts (`j`/`k` move, `a`/`r` approve/reject, `/` search), auto-refresh, CSV export and a PDF report (drawn in the browser with jsPDF).

## API

All under `/api/v1/visual-regression`. Every route needs a signed-in user or API key and checks access to the project; see [WORKSPACES.md](WORKSPACES.md#visual-regression-and-session-replay-projects) for who gets read, run and manage.

| Method and path | Access | Notes |
| --- | --- | --- |
| `GET /projects` | | Readable projects; `teamId`, `workspaceId` filters |
| `POST /projects` | editor in the workspace | Checks the Argos token first |
| `GET`, `PUT`, `DELETE /projects/:id` | read; manage | |
| `GET /projects/:id/ci-setup` | read | See [ARGOS_CI_CD_INTEGRATION.md](ARGOS_CI_CD_INTEGRATION.md) |
| `GET /projects/:id/runs` | read | `{ data, pagination }`; `page`, `limit` (max 100), `from`, `to` (YYYY-MM-DD) |
| `GET /runs/:id` | read | One run |
| `GET /runs/:id/results` | read | `{ data, pagination }`, by test name |
| `POST /results/:id/approve`, `/reject` | run | Recorded in Argos first (needs a personal access token), then on the result |
| `GET /projects/:id/analytics` | read | `startDate`, `endDate` |
| `GET /projects/:id/shares`, `POST /projects/:id/share`, `DELETE /projects/:id/share/:userId` | manage | Share with one active user as `viewer` or `editor` |
| `GET /projects/:id/teams` | read | Workspace, application and creator |
| `POST`, `GET /projects/:id/baselines`, `GET /projects/:id/baselines/history`, `POST /projects/:id/baselines/:baselineId/rollback` | run to change, read to list | |
| `POST`, `DELETE /projects/:id/webhook-secret` | manage | The secret CI signs build notifications with; shown once |
| `GET`, `POST /projects/:id/notifications`, `DELETE /projects/:id/notifications/:type`, `POST /projects/:id/notifications/:type/test` | manage | See [Notifications](#notifications) |
| `POST /webhooks/argos` | public, signed | CI's build notification (`x-argos-signature: sha256=<HMAC of the raw body>`) |

## Runs and results

A run is one Argos build. Runs are created when the workbench reads builds from Argos: when runs are listed (at most every 15 seconds per project), when a run's results are opened, or when CI posts a build notification. Run `status` is `pending`, `running`, `completed` or `failed`; Argos's own status is kept as `argosStatus`. A finished build's screenshot diffs become the run's results (`passed`, `failed`, `new`, `removed`), each with baseline, current and diff image URLs from Argos.

## Baselines

Baselines are versions. Recording one (from a run) makes it current and keeps the earlier ones; rolling back makes an earlier one current again, and each change is kept in the history. The current baseline's commit becomes the `--reference-commit` of the CI upload command, so Argos compares new builds against it. With no baseline, builds compare against the project's branch.

## Not built

There is no workbench CLI, SDK, GitHub Action, status badge, PR comments, usage quotas or pricing tiers, and runs can't be started from the workbench. See [ARGOS_REMAINING_FEATURES.md](ARGOS_REMAINING_FEATURES.md) for what is open.

## Notifications

When a run's Argos build finishes, its result is sent to the project's notification channels: email recipients, a Slack incoming webhook, a Microsoft Teams incoming webhook, and a generic webhook signed with HMAC-SHA256. Set them up on the project's **Settings** tab under **Send build results** (separate from **Build notifications**, which is how CI tells this app about a new upload), where each channel has **Send test** and the last 30 days of deliveries are listed with their status.

- **When.** Once per run, the first time its build result is saved with a final Argos status (`no-changes`, `changes-detected`, `accepted`, `rejected` → completed; `error`, `aborted`, `expired` → failed), whether that comes from CI's signed build notification, a sync or opening the results. Later status changes (accepting the build in Argos) and refreshes don't send again. Builds that started more than 24 hours before their result is first saved (history found by a first sync) don't notify.
- **What.** The title says whether the build passed, found changed screenshots, or failed (`Visual regression: Marketing site found 2 changed screenshots`); the text gives the branch, commit and the screenshot counts, and links to the run (with `APP_PUBLIC_URL` set). Webhooks receive event `visual-regression.build.completed` or `visual-regression.build.failed` with `data: { projectId, runId, argosBuildId, argosBuildNumber, argosStatus, argosUrl, status, branch, commitSha, summary }`.
- **Who can change them.** People with `manage` access to the project (editors; admins for application-linked projects). Viewers see a note that only editors can see these settings.
- **Secrets.** Slack, Teams and webhook URLs and the webhook signing secret are stored encrypted (`ENCRYPTION_KEY`) and never returned. A webhook saved with a new URL and no secret gets a generated one, shown once.
- **API.** `POST /projects/:id/notifications` takes `{ type, enabled?, recipients? (email), url? (slack, teams, webhook), secret? (webhook) }`; fields left out keep their saved value, so `{ type, enabled: false }` only turns a channel off. `GET` answers `{ channels, availability, attempts }`. Settings saved before delivery existed (the old free-form `config`) are ignored and must be saved again.

Email needs SMTP on the server; without it the panel says so and nothing is emailed. Delivery, egress checks, retries and webhook signatures work as described in [NOTIFICATIONS.md](NOTIFICATIONS.md).
