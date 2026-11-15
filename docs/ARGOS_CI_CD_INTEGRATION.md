# Visual regression in CI

Argos creates a build when screenshots are uploaded to it. The workbench can't start a build: your CI runs the tests, uploads the screenshots with the Argos CLI, and the workbench reads the builds back from the Argos API. This guide covers what to put in CI.

There is no workbench CLI, SDK, GitHub Action, status badge or PR-comment integration. Everything below uses Playwright, the Argos packages (`@argos-ci/playwright`, `@argos-ci/cli`), `curl`, `openssl` and `jq`.

## 1. Get the generated setup

Open the project (`/tools/visual-regression/:id`) and choose the **CI setup** tab, or call the API:

```
GET /api/v1/visual-regression/projects/:id/ci-setup
```

It returns, generated from the project's test settings (Settings tab) and current baseline (`backend/src/visual-regression/ci-setup.ts`):

| Field | What it is |
| --- | --- |
| `playwrightConfig` | `playwright.config.ts`: test folders become `testMatch` globs (`<folder>/**/*.spec.ts`), browsers (`chromium`, `firefox`, `webkit`) become Playwright projects |
| `screenshotHelper` | `tests/argos.ts`, a `screenshot(page, name)` helper that calls `argosScreenshot` with the project's viewports, `fullPage`, `waitForSelector` and `waitForTimeout`, saving to `./screenshots` |
| `uploadCommand` | The upload step, shown below |
| `notifyCommand` | The build notification step; only present when the project has a build notification secret |
| `reference` | What builds are compared against: `{ kind: 'commit', commit, baselineName }` for the current baseline, otherwise `{ kind: 'branch', branch }` |

The upload command looks like this:

```bash
npx @argos-ci/cli upload ./screenshots \
  --reference-commit '<current baseline commit>' \
  --ignore '<pattern>'
```

With no baseline recorded it uses `--reference-branch '<project branch>'` instead. `--ignore` appears only when the project has ignore patterns. The CLI reads the Argos token from `ARGOS_TOKEN`.

Recording or rolling back a baseline changes `--reference-commit`, so copy the upload command again after either.

## 2. Add it to CI

Install `@playwright/test`, `@argos-ci/playwright` and `@argos-ci/cli` as dev dependencies, add the two generated files, and use the helper in tests:

```ts
import { test } from '@playwright/test';
import { screenshot } from './argos';

test('button', async ({ page }) => {
  await page.goto('http://localhost:3000/button');
  await screenshot(page, 'button');
});
```

A GitHub Actions job (other CI systems run the same commands):

```yaml
name: Visual regression
on: [pull_request, push]

jobs:
  visual-regression:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - name: Upload screenshots to Argos
        env:
          ARGOS_TOKEN: ${{ secrets.ARGOS_TOKEN }}
        run: |
          # Paste uploadCommand from the CI setup tab here
          npx @argos-ci/cli upload ./screenshots --reference-branch 'main'
```

The new build shows up under **Test runs** the next time runs are listed (the workbench asks Argos at most every 15 seconds per project, and reads the 30 most recent builds).

## 3. Optional: tell the workbench about each upload

Argos sends no webhooks, so CI can post a signed build notification to have the build read at once. On the project's Settings tab, set a build notification secret (or `POST /api/v1/visual-regression/projects/:id/webhook-secret`, body `{ secret? }`; a `whsec_…` secret is generated when left out and shown only once). Store it in CI as `ARGOS_WEBHOOK_SECRET`. The CI setup tab then also shows `notifyCommand`:

```bash
BODY='{"projectId":"acme/web"}'
SIG="sha256=$(printf '%s' "$BODY" | openssl dgst -sha256 -hmac "$ARGOS_WEBHOOK_SECRET" -r | cut -d' ' -f1)"
curl -fsS -X POST 'https://<workbench>/api/v1/visual-regression/webhooks/argos' \
  -H 'Content-Type: application/json' -H "x-argos-signature: $SIG" -d "$BODY"
```

`projectId` is the Argos project (`owner/project`). The body may also carry `buildNumber` to read just that build; without it the workbench re-reads the project's recent builds. The route is public but refuses (`401`) a missing or wrong signature, and a project without a secret.

Where finished build results are then sent (email, Slack, Teams, webhook) is configured separately; see [Notifications](ARGOS_VISUAL_REGRESSION_SERVICE.md#notifications).

## 4. Optional: fail the job on visual changes

The simplest gate is Argos's own commit status, which Argos posts when its GitHub or GitLab integration is set up in Argos. To gate on the workbench instead, poll the project's runs with an API key that can read the project (see [Who can read a project](#who-can-read-a-project)).

`GET /api/v1/visual-regression/projects/:id/runs` answers `{ data, pagination }`, newest first. Each run in `data` has `status` (`pending`, `running`, `completed`, `failed`), Argos's own `argosStatus` (`no-changes`, `changes-detected`, `accepted`, `rejected`, `error`, `aborted`, `expired`, `pending`, `progress`), `argosBuildNumber`, `argosUrl`, `commitSha`, `branch` and `resultsSummary`. `limit` is at most 100.

```bash
# DS_URL: the workbench API origin; DS_PROJECT_ID: the workbench project id (not the Argos one)
# COMMIT: the commit Argos recorded for the build (on pull requests, the PR head commit)
RUN=""
for i in $(seq 1 60); do
  RUN=$(curl -fsS "$DS_URL/api/v1/visual-regression/projects/$DS_PROJECT_ID/runs?limit=50" \
      -H "Authorization: Bearer $DS_API_KEY" \
    | jq -c --arg sha "$COMMIT" '[.data[] | select(.commitSha == $sha)][0] // empty')
  if [ -n "$RUN" ] && echo "$RUN" | jq -e '.status == "completed" or .status == "failed"' > /dev/null; then
    break
  fi
  RUN=""
  sleep 10
done
[ -n "$RUN" ] || { echo "No finished Argos build for $COMMIT"; exit 1; }
echo "$RUN" | jq -r '"Argos build \(.argosBuildNumber): \(.argosStatus) \(.argosUrl)"'
# jq -e exits 1 when the expression is false, failing the step
echo "$RUN" | jq -e '.status == "completed" and (.argosStatus == "no-changes" or .argosStatus == "accepted")' > /dev/null
```

`changes-detected` fails the gate until someone accepts the build in Argos; re-run the job afterwards. Reviewing single screenshots in the workbench (approve or reject) is recorded in Argos and on the result, but doesn't change the build's `argosStatus` by itself.

## Who can read a project

API keys can't be workspace members. A key can read a project it created without a workspace, and keys with `admin:users` can read every project (`admin:governance` every application-linked project). Signed-in users follow the workspace roles and shares described in [WORKSPACES.md](WORKSPACES.md#visual-regression-and-session-replay-projects). Keys are created with `POST /auth/api-keys` ([AUTH.md](AUTH.md#api-keys)).

## Troubleshooting

- **No runs appear.** Check the upload step succeeded and that the project's Argos project (`owner/project`) and token are the ones CI uploads to. The token stored on the project must be able to read builds; a project token is enough.
- **Approve or reject fails.** Argos only accepts reviews from a personal access token with review access; a project token can read builds but not review them.
- **The build notification returns 401.** The secret in CI doesn't match the project's (secrets are shown once; set a new one), or the body was changed after signing. The signature is over the exact bytes sent.
- **Builds compare against the wrong reference.** The upload command embeds the current baseline's commit; copy it again after recording or rolling back a baseline.
