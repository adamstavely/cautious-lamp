# Governance and accessibility reports

Governance checks code against compliance rules. Accessibility reports run axe-core against a page and track WCAG results, schedules and SLAs over time. Both need a signed-in caller (see [AUTH.md](AUTH.md)). Every change needs `admin:governance`.

This replaces the old rules engine, which ran rule code (`scannerCode`) with `new Function` on the server and in the browser. No route takes code now, and nothing evaluates it. `RULES_ENGINE_GUIDE.md` and `AUTOMATED_ACCESSIBILITY_REPORTS.md` describe the old behaviour.

## Rules

A rule is data. One interpreter runs every rule (`backend/src/governance/rule-interpreter.ts`).

```jsonc
{
  "id": "rule-…",                 // generated; built-in rules have stable ids such as "a11y-image-alt"
  "name": "Image Alt Text",
  "description": "…",
  "category": "design-system" | "ux-hcd" | "accessibility" | "custom",
  "severity": "error" | "warning" | "info",
  "enabled": true,
  "type": "regex-present" | "regex-absent" | "selector-attribute" | "selector-count" | "token-usage" | "builtin",
  "target": "html" | "css" | "javascript",
  "pattern": "…", "flags": "ims",  // regex-*; optional for selector-attribute
  "selector": "img",               // selector-*
  "attribute": "alt|aria-label",   // selector-attribute: any of these, separated by |
  "min": 1, "max": 1,              // selector-count (at least one of them)
  "properties": ["color", "margin*"], "allowedValues": ["4px"],  // token-usage
  "builtin": "axe" | "heading-order" | "form-labels" | "component-naming",
  "message": "Shown for each violation",
  "builtIn": true,                 // seeded from the built-in set (still editable)
  "version": 3,                    // bumped on every change
  "createdAt", "updatedAt", "createdBy", "updatedBy"
}
```

| Type | Targets | Violation |
| --- | --- | --- |
| `regex-present` | any | The pattern is not found. Skipped when the target is empty. |
| `regex-absent` | any | Each match, with its line. At most 100 per rule. |
| `selector-attribute` | html | Each element that matches `selector` and has none of the `attribute` names. If `pattern` is set, the attribute's value must also match it. |
| `selector-count` | html | The number of matching elements is below `min` or above `max`. |
| `token-usage` | css | Each declaration of a listed property whose value isn't `var(--…)`, a design token value, an `allowedValues` entry or a keyword (`inherit`, `initial`, `unset`, `revert`, `currentColor`, `transparent`, `none`, `auto`, `0`). Values with several parts pass if every part is allowed. |
| `builtin` | html | `axe`: axe-core WCAG 2.x A/AA rules in jsdom, without layout, so colour contrast isn't tested. `heading-order`: a heading level is skipped. `form-labels`: a field has no label, `aria-label`, `aria-labelledby` or `title` (a placeholder is not a label). `component-naming`: the component's name isn't PascalCase (design-system scans only). |

**Validation.** Request bodies that have unknown fields are rejected with `400`, so a `scannerCode` field is rejected. The type and target must fit together. Selectors must parse. Names can be up to 120 characters, messages up to 500 and patterns up to 300.

**Regular expressions.** Patterns are checked before they're saved. A pattern is rejected if it has a syntax error or uses a flag other than `i`, `m` or `s`. Backreferences and lookbehind are also rejected, and so is any repeated group that contains a quantifier or an alternation (`(a+)+`, `(a|ab)*`). These shapes cause most catastrophic backtracking. Matching runs in a worker thread with a time budget for each call (`GOVERNANCE_REGEX_BUDGET_MS`, 500 ms by default). If a pattern runs over the budget, the thread is terminated and the rule is reported as `error`, never as a pass.

**Seeding.** The built-in rules (`builtin-rules.ts`) are seeded once per cluster, and seeding can resume. Each rule is created first, then recorded with its own marker (`builtin-rule-seeded:<id>`) in `design-system-governance-meta`. The completion marker (`builtin-rules-seeded-v1`) is written last, and only once every built-in has a marker. If seeding stops part way (Elasticsearch goes away, say), the next start or request continues with the rules that have no marker yet. Writes ignore duplicates, so instances seeding at the same time don't conflict. Built-in rules you delete stay deleted: the rule's marker remains, so seeding doesn't recreate it. Clusters seeded before per-rule markers existed already have the completion marker and are left as they are. Some old scanners were not carried over because they always passed or relied on guesses: the design-system version check, "has error handling", "has loading states", "has empty states", destructive-action confirmation and touch target size.

## Scans

A scan runs the selected rules and stores the result, including the version of each rule that ran.

- **Design-system scope** checks each design system component. The component's template (or `code.html`) is the HTML, its `<style>` blocks are the CSS, and its `<script>` blocks plus `code.react` are the JavaScript. `codebase` and `url` aren't accepted for this scope.
- **Application scope** needs an `applicationId` and one of the following:
  - `codebase: { html?, css?, javascript?, file? }`: up to 256 KB per field and 512 KB in total. If `css` or `javascript` is empty, the inline `<style>` or `<script>` blocks in the HTML are used instead. Nest's JSON body limit (100 KB by default, set in `main.ts`) applies first.
  - `url`: the server fetches this public http(s) page and checks its HTML and its inline styles and scripts. Scripts are read, never run. The URL must pass `assertPublicHttpUrl`, and so must every redirect (at most 5). Private addresses are refused again when the connection is made, which stops DNS rebinding. The fetch has a 10 s timeout and a 2 MB size cap.
  - If both are sent, or neither, the scan returns `400`. It doesn't return a pass when there was nothing to check.
- `ruleIds` runs those rules, enabled or not. Otherwise every enabled rule runs. `categories` filters either set.
- **Results.** A rule that finds nothing adds one `pass` check. Each violation adds one check whose `status` is the rule's severity (`error`, `warning` or `info`). A rule that couldn't run adds an `error` check with the reason. A rule that found nothing but couldn't check all of its input is `incomplete`, never a pass, and adds a `warning` check ("Not fully checked: …"). `ruleResults` lists each rule's outcome: `pass`, `fail`, `skipped` (with a reason, e.g. "No CSS to check"), `error` or `incomplete` (with a reason). The `summary` counts `{ passed, warnings, errors, info, total }` always equal the checks by status. Up to 2,000 checks are stored, and `truncated` is set if there were more.
- **Selector limits.** `selector-attribute` checks every matching element for the attribute. With a `pattern`, at most 10,000 attribute values are tested (1,000 per regex call). If more values match and none of the tested ones fail, the rule is `incomplete`.
- After an application scan, `lastScanned` is set on the application (through `ApplicationsService.markScanned`).

### Scheduled scans

An application's `capabilities.governance.scanSchedule` decides whether it's scanned automatically:

- `manual` (the default): only when someone asks.
- `daily` and `weekly`: `GovernanceScanScheduler` scans the application's `applicationUrl` once per UTC day, or once per UTC week starting Monday. It runs the rules the application picked, as a `url` scan, and the result appears in scan history like any other scan, created by `service:governance-scheduler`. An application already scanned in the current day or week (by hand, say) isn't scanned again. Governance must be enabled and the application must have a URL, otherwise there's nothing to scan and the schedule is ignored.
- Each run is claimed with a compare-and-swap write to `scheduled-scan:<applicationId>` in `design-system-governance-meta`, so only one instance runs each occurrence. That document also records `lastStatus` (`success` or `failed`), `lastError` and `lastScanId`. A failed run is logged and retried in the next period.
- The scheduler polls every minute (`GOVERNANCE_SCHEDULER_INTERVAL_MS`). It doesn't run when `GOVERNANCE_SCHEDULER_ENABLED=false` or `NODE_ENV=test`.
- `on-commit` isn't supported. The server has no repository integration that would tell it about a commit. To scan on every commit, have CI call `POST /api/v1/governance/scans` with an API key that has `admin:governance` after each push, sending either the built code (`codebase`) or the deployed preview URL (`url`). Applications that still have `on-commit` stored are treated as `manual`.

## Routes (`/api/v1`)

| Method and path | Permission | Notes |
| --- | --- | --- |
| `GET /governance/rules?category=` | signed in | `{ rules, total }` |
| `GET /governance/rules/:id` | signed in | `404` if unknown |
| `GET /governance/rules/export` | signed in | `{ format: "cautious-lamp-governance-rules", formatVersion: 1, exportedAt, rules }` |
| `POST /governance/rules` | `admin:governance` | Rule definition (no id or metadata) |
| `PUT /governance/rules/:id` | `admin:governance` | Full definition, plus an optional `version`. If `version` doesn't match the stored version, returns `409`. |
| `PATCH /governance/rules/:id` | `admin:governance` | `{ enabled?, severity?, version? }` |
| `DELETE /governance/rules/:id` | `admin:governance` | `204` |
| `POST /governance/rules/import` | `admin:governance` | `{ rules, mode?: "merge" \| "replace" }` (at most 200 rules). Every rule is validated before anything is written. Rules with a known `id` are updated; others are created. `replace` also deletes rules that aren't in the import. Returns `{ created, updated, deleted }`. An exported file can be posted as-is. |
| `POST /governance/rules/test` | `admin:governance` | `{ rule, sample: { html?, css?, javascript? } }`. Returns `{ outcome, reason?, checks, summary }`. Nothing is stored. |
| `POST /governance/scans` | `component:view`; application scope also needs `admin:governance` | `{ scope: "design-system" \| "application", applicationId?, codebase?, url?, ruleIds?, categories? }` |
| `GET /governance/scans?applicationId=&scope=&limit=` | signed in | `{ scans, total }` without checks, newest first |
| `GET /governance/scans/:id` | signed in | The full scan |
| `POST /compliance/scan` | as `POST /governance/scans` | For the CLI and MCP server. Same body and response; `scope: "applications"` is accepted. |
| `POST /compliance/scan-application` | `admin:governance` | For the CLI: `{ applicationId, codebase?, url?, … }` |
| `GET /rules/export?format=json\|eslint\|prettier` | signed in | Rule summaries for the MCP server. Contains no code. The `eslint` format leaves out each rule's type and pattern, so the ESLint plugin reads `GET /governance/rules/export` instead. |

Scan responses are the stored scan record plus `passed`, `warnings`, `failed` (errors) and `info`, which older clients read.

## Accessibility reports

A report is generated by `POST /accessibility-reports/generate/:applicationId` with `{ url? , html? }`:

- `html`: axe-core runs in jsdom. The document's scripts never run and no resources are loaded. There's no layout, so colour contrast comes back as "needs review".
- `url`, or neither (then the application's `applicationUrl` is used): the page is loaded in headless Chromium (Playwright) and axe-core runs on the rendered page. The URL must pass `assertPublicHttpUrl` first. After that, all of Chromium's traffic goes through a local egress proxy (`common/security/egress-proxy.ts`): the page, every redirect, every subresource, fetch/XHR and WebSockets (https and wss through `CONNECT` tunnels, so TLS stays end to end). For each connection the proxy resolves the host itself, checks every address, and connects to the address it checked. A host that answers with a public address first and an internal one later (DNS rebinding) is refused on the later request. QUIC and non-proxied WebRTC UDP are switched off. Design token extraction (`design-extraction`) uses the same proxy.
- The page has 30 s to load. The whole scan (starting the browser, loading the page and running axe) has a deadline (`A11Y_URL_SCAN_DEADLINE_MS`, 90 s by default). When it passes, the browser is closed, the scan slot is freed and the request returns `504`. A scheduled run records that as a failure and the scheduler moves on. At most 2 URL scans run at a time (`A11Y_URL_SCAN_CONCURRENCY`). Further callers queue, up to 10, then get `503`. If Chromium isn't installed (`npx playwright install chromium`), URL scans return `503`.
- A page whose final response is an HTTP error (status 400 or higher, e.g. 404 or 500) means the target is unavailable. It isn't audited: the request returns `422` ("Target unavailable: … answered HTTP 404 …"), no report is stored, and the application's latest report stays the latest. A scheduled run records `lastStatus: failed` with that message and keeps the previous `lastReportId`.
- If there's no HTML and no URL, the request returns `400`. A page that fails to load returns `422`.

What's in a report:

- **WCAG criteria** come from axe's tags (for example `wcag143` maps to 1.4.3). Each criterion is `fail` if any of its rules has violations, `review` if axe couldn't decide, and otherwise `pass`.
- **Score** starts at 100, loses 15 per failing level A criterion and 10 per failing AA criterion, and stops at 0.
- **Level** is `Non-Compliant` if any A criterion fails, `A` if only AA criteria fail, and `AA` otherwise. Only A and AA rules run. Automated checks can't prove conformance.
- **Issues** are counted per failing element, by impact: critical, high (axe "serious"), moderate and low. Counts, a criterion's `issues` and a fix's `affectedElements` include every element axe found. A report lists at most 50 example elements per rule (in `checks` and `failingElements`). When a rule had more, the report has `sampling: { examplesPerRule: 50, rules: [{ ruleId, shown, total }] }`, so `totalIssues` can be larger than `checks.length`.
- **Fixes** are grouped by axe rule, with a link to axe's help page.
- **Trend** compares the report with the application's previous one, matching issues by rule and selector.

Reports are stored in `design-system-a11y-reports` and set the application's `lastScanned`.

### Schedules

Each schedule stores `{ applicationId, url?, frequency: daily|weekly|monthly, dayOfWeek? (0–6), dayOfMonth? (1–31), time: "HH:mm" (UTC), enabled, nextRun, lastRun?, lastStatus?, lastError?, lastReportId? }`.

- `nextRun` is the first time strictly after now. A monthly schedule on the 29th to 31st runs on the last day of shorter months.
- An invalid time or day returns `400`.
- Creating a schedule needs a URL: either its own or the application's. The URL must be public.
- `AccessibilityReportsScheduler` checks for due schedules every minute (`A11Y_SCHEDULER_INTERVAL_MS`). It doesn't run when `A11Y_SCHEDULER_ENABLED=false` or `NODE_ENV=test`.
- Because `nextRun` is stored, runs survive restarts. Each run is claimed by moving `nextRun` forward with a compare-and-swap write, so if several instances poll, only one runs each occurrence.
- Nothing is emailed. Reports appear in the history.

### SLAs

An SLA is `{ applicationId, targetScore, targetLevel, criticalIssuesThreshold, highIssuesThreshold }`.

There is one SLA per application: the id is derived from the application, so a second create returns `409`. The status of an SLA against the latest report (`sla.ts`) is one of:

- `no-sla`: the application has no SLA. This is not counted as non-compliant.
- `no-report`: there's an SLA but no report yet.
- `non-compliant`: the score is below the target, the level is below the target level, or there are more critical issues than allowed.
- `at-risk`: there are more high issues than allowed, or a non-zero threshold is reached exactly, or the score is within 5 points of the target (capped at 100). A threshold of 0 with 0 issues is compliant.
- `compliant`: none of the above.

### Routes (`/api/v1/accessibility-reports`)

| Method and path | Permission |
| --- | --- |
| `POST /generate/:applicationId` | `admin:governance` |
| `GET /summary` | signed in |
| `GET /reports?applicationId=` (without checks, fixes or criteria), `GET /reports/:id` | signed in |
| `DELETE /reports/:id` | `admin:governance` |
| `GET /schedules?applicationId=`, `GET /schedules/:id` | signed in |
| `POST /schedules`, `PUT /schedules/:id` (partial; the application can't change), `DELETE /schedules/:id` | `admin:governance` |
| `GET /slas?applicationId=` (always a list), `GET /slas/:id` | signed in |
| `POST /slas`, `PUT /slas/:id`, `DELETE /slas/:id` | `admin:governance` |

Unknown ids return `404`. Bodies are rejected if they have unknown fields, including server-owned ones such as `id`, `nextRun`, `createdAt` and `recipients`.

`GET /summary` returns:

```
{
  totalApplications,
  reportedApplications,
  compliantApplications,
  atRiskApplications,
  nonCompliantApplications,
  unassessedApplications,
  averageScore,
  applications: [ … ]
}
```

`averageScore` is the mean over applications that have a report. Each application entry has a `complianceScore` that is `null` when the application has no report. `SystemHealthService` reads the same summary synchronously from a cache. The cache is refreshed when the backend starts, after every report or SLA change, and on every `GET /summary`.

## Storage

All indices use `EsDocumentStore` (optimistic concurrency, `dynamic: false`):

- `design-system-governance-rules`
- `design-system-governance-scans`
- `design-system-governance-meta`
- `design-system-a11y-reports`
- `design-system-a11y-schedules`
- `design-system-a11y-slas`

Lists read at most the 10,000 newest documents.

## Wiring

- Applications come from `APPLICATION_DIRECTORY` (`governance/sources.ts`). It is bound to `RegistryApplicationDirectory`, which wraps `ApplicationsService` (`find`, `list`, `markScanned`).
- Design system components and tokens come from `DESIGN_SYSTEM_SOURCE`, which wraps `DesignSystemService.getAllComponents()` and `getAllTokens()`. Swap that provider if those move.
- Tests swap these providers for in-memory fakes (`governance/testing/fakes.ts`).
