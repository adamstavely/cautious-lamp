# Rules engine guide

How to write, test and run governance rules. The reference for every route, scan result field, read permission and storage index is [GOVERNANCE.md](GOVERNANCE.md); this guide is the how-to.

Rules are data. A rule says which kind of check to run and with what settings, and one interpreter on the server (`backend/src/governance/rule-interpreter.ts`) runs every rule. No rule, request or stored document contains code, and nothing is evaluated. A request that sends a field the server doesn't know, such as the old `scannerCode`, is rejected with `400` (`strictBody()` in `governance.dto.ts`).

In the app, rules are managed on **Admin > Governance** (`/admin/governance`, `frontend/src/views/Governance.vue`).

## Permissions

From the `@RequirePermission` decorators in `governance.controller.ts`:

| What | Needs |
| --- | --- |
| List, read and export rules; list and read scans | Any signed-in caller (scan reads are also filtered by who may read each scan) |
| Create, update, patch, delete and import rules; test a rule | `admin:governance` |
| Design-system scan (`POST /governance/scans`, `POST /compliance/scan`) | `component:view` |
| Application scan (`scope: "application"`) | `component:view` and `admin:governance` |
| `POST /compliance/scan-application`, `GET /governance/scheduled-scans` | `admin:governance` |

## Rule fields

| Field | Notes |
| --- | --- |
| `name` | Required, up to 120 characters |
| `description` | Optional, up to 1,000 characters |
| `category` | `design-system`, `ux-hcd`, `accessibility` or `custom` |
| `severity` | `error`, `warning` or `info`. Each violation becomes a check with this status. |
| `enabled` | Defaults to `true`. Disabled rules don't run unless a scan names them in `ruleIds`. |
| `type` | One of the six types below |
| `target` | `html`, `css` or `javascript`; which targets are allowed depends on the type |
| `message` | Required, up to 500 characters. Shown on every violation. |

The server sets `id`, `builtIn`, `version` (bumped on every change; scans record the version that ran), `createdAt`, `updatedAt`, `createdBy` and `updatedBy`. Don't send them when creating a rule.

## Rule types

| Type | Targets | Fields | Reports a violation when |
| --- | --- | --- | --- |
| `regex-present` | `html`, `css`, `javascript` | `pattern`, `flags?` | The pattern isn't found. Skipped when the target is empty. |
| `regex-absent` | `html`, `css`, `javascript` | `pattern`, `flags?` | For each match (at most 100 per rule), with its line. |
| `selector-attribute` | `html` | `selector`, `attribute`, `pattern?`, `flags?` | An element matching `selector` has none of the `attribute` names (separate alternatives with `\|`, up to 10). With `pattern`, the attribute's value must also match it. |
| `selector-count` | `html` | `selector`, `min?`, `max?` (at least one, 0 to 10,000) | The number of matching elements is below `min` or above `max`. |
| `token-usage` | `css` | `properties` (1 to 30; a trailing `*` matches a prefix, e.g. `margin*`), `allowedValues?` (up to 100) | A declaration of a listed property has a value that isn't `var(--…)`, a design token value, an `allowedValues` entry or a CSS keyword (`inherit`, `initial`, `unset`, `revert`, `revert-layer`, `currentColor`, `transparent`, `none`, `auto`, `0`). Multi-part values pass if every part is allowed. |
| `builtin` | `html` | `builtin` | The named server check fails (see below). |

Built-in checks (`BUILTIN_CHECKS` in `governance.types.ts`):

- `axe`: axe-core WCAG 2.x A and AA rules, run in jsdom. There is no layout, so colour contrast isn't tested here; use a URL scan in Accessibility Reports for that. Component markup is treated as a fragment, so page-level checks (title, language, landmarks) don't apply to it.
- `heading-order`: a heading level is skipped (h1 then h3).
- `form-labels`: an input, select or textarea has no `<label>` (wrapping or `for`), `aria-label`, `aria-labelledby` or `title`. A placeholder is not a label.
- `component-naming`: the component's name isn't PascalCase. Only applies to design-system scans; skipped otherwise.

`normalizeRuleDefinition` (`rule-validation.ts`) checks each rule against its type and keeps only the fields that type uses: a selector must parse, the type and target must fit together, and an unused field is dropped rather than stored.

### Regular expressions

Before a pattern is saved, `assertSafePattern` (`regex-safety.ts`) rejects:

- syntax errors, patterns over 300 characters, and flags other than `i`, `m` and `s` (the interpreter adds `g` itself);
- backreferences (`\1`, `\k<name>`) and lookbehind (`(?<=`, `(?<!`);
- a repeated group that contains another quantifier or an alternation, such as `(a+)+` or `(a|ab)*`.

Lookahead is allowed. Patterns run in a worker thread with a time budget per call (`GOVERNANCE_REGEX_BUDGET_MS`, 500 ms by default). A pattern that runs over the budget is stopped and the rule is reported as `error`, never as a pass.

## Example: create a rule

This is the rule the HTTP tests create (`governance.http.spec.ts`):

```bash
curl -X POST http://localhost:3000/api/v1/governance/rules \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "No lorem ipsum",
    "description": "Placeholder copy",
    "category": "custom",
    "severity": "warning",
    "type": "regex-absent",
    "target": "html",
    "pattern": "lorem ipsum",
    "flags": "i",
    "message": "Placeholder text"
  }'
```

`$TOKEN` is a signed-in user's access token or an API key; either way it needs `admin:governance` (see [AUTH.md](AUTH.md)). The response is the stored rule with `id`, `builtIn: false`, `version: 1` and the audit fields.

To change it, `PUT /governance/rules/:id` with the full definition plus the `version` you loaded; a stale `version` returns `409` instead of overwriting. `PATCH /governance/rules/:id` changes only `enabled` and `severity`.

## Testing a rule before saving it

`POST /governance/rules/test` runs one unsaved rule against sample code and stores nothing. In the rule editor this is the "Test against sample code" section. The body is `{ rule, sample: { html?, css?, javascript?, file? } }`:

```bash
curl -X POST http://localhost:3000/api/v1/governance/rules/test \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rule": {
      "name": "Image alt text",
      "category": "custom",
      "severity": "warning",
      "type": "selector-attribute",
      "target": "html",
      "selector": "img",
      "attribute": "alt",
      "message": "Image without alt text"
    },
    "sample": { "html": "<img src=\"a\"><img src=\"b\" alt=\"\">" }
  }'
```

The response is `{ outcome, reason?, checks, summary }`. Here the first image has no `alt`, so `outcome` is `fail` and `summary` is `{ passed: 0, warnings: 1, errors: 0, info: 0, total: 1 }`. An invalid rule returns `400` with the reason, the same as saving it would.

## Built-in rules

`builtin-rules.ts` seeds these rules once per cluster. They're ordinary rules afterwards: you can edit, disable or delete them, and a deleted built-in rule isn't recreated.

| Id | Name | Category | Severity | Type |
| --- | --- | --- | --- | --- |
| `ds-component-import` | Design System Component Usage | design-system | warning | `regex-present` on javascript: an import `from '@designsystem/…'` |
| `ds-hardcoded-colors` | Hardcoded Colors | design-system | warning | `token-usage` on colour properties (`white` and `black` allowed) |
| `ds-spacing` | Spacing Consistency | design-system | warning | `token-usage` on `margin*`, `padding*`, `gap`, `row-gap`, `column-gap`, with the spacing scale allowed |
| `ds-typography-scale` | Typography Scale | design-system | warning | `token-usage` on `font-size`, with the type scale allowed |
| `ds-border-radius` | Border Radius Consistency | design-system | warning | `token-usage` on the `border-*radius` properties |
| `ds-shadows` | Shadow/Elevation Consistency | design-system | warning | `token-usage` on `box-shadow` |
| `ds-z-index` | Z-index Layer Management | design-system | warning | `token-usage` on `z-index` |
| `ds-breakpoints` | Responsive Breakpoint Usage | design-system | info | `regex-absent` on css: a media query width other than 640, 768, 1024, 1280 or 1536px |
| `ds-important` | No !important Overrides | design-system | info | `regex-absent` on css: `!important` |
| `ds-component-naming` | Component Naming | design-system | info | `builtin` `component-naming` |
| `ux-inline-styles` | No Inline Styles | ux-hcd | info | `regex-absent` on html: a `style=` attribute |
| `ux-complex-input-help` | Help Text on Complex Inputs | ux-hcd | warning | `selector-attribute`: date, time, number and range inputs need `aria-describedby` or `title` |
| `ux-deprecated-elements` | No Deprecated Elements | ux-hcd | warning | `selector-count`: `marquee, blink, font`, max 0 |
| `ux-video-photosensitivity` | Video Needs Photosensitivity Review | ux-hcd | info | `selector-count`: `video`, max 0 |
| `a11y-axe` | Accessibility Scan (axe-core) | accessibility | error | `builtin` `axe` |
| `a11y-image-alt` | Image Alt Text | accessibility | error | `selector-attribute`: `img` (not presentational) needs `alt` |
| `a11y-form-labels` | Form Label Requirements | accessibility | error | `builtin` `form-labels` |
| `a11y-heading-order` | Heading Hierarchy | accessibility | warning | `builtin` `heading-order` |
| `a11y-positive-tabindex` | No Positive tabindex | accessibility | warning | `regex-absent` on html: `tabindex` of 1 or more |

## Import and export

`GET /governance/rules/export` returns `{ format: "cautious-lamp-governance-rules", formatVersion: 1, exportedAt, rules }`. `POST /governance/rules/import` accepts that file as-is, or `{ rules, mode? }` with at most 200 rules. Every rule is validated before anything is written. Rules with a known `id` are updated and the rest are created; `mode: "replace"` also deletes rules that aren't in the file. The Governance page has Import and Export buttons for this.

## Running scans

`POST /governance/scans` runs rules and stores the result, with the version of each rule that ran (`scans.service.ts`).

- **Design-system scope** (`{ "scope": "design-system" }`) checks every design system component the caller can read. A component's template (or `code.html`) is the HTML, its `<style>` blocks the CSS, and its `<script>` blocks plus `code.react` the JavaScript.
- **Application scope** needs an `applicationId` and either `codebase: { html?, css?, javascript?, file? }` (up to 256 KB per field, 512 KB in total) or a public `url`, not both (`400`). If neither is sent, the application's own `applicationUrl` is scanned, and an application without one returns `400`. A URL is fetched by `safe-fetch.ts`: http(s) only, public addresses only (checked again at connect time, which stops DNS rebinding), at most 5 redirects, a 10 s timeout and a 2 MB cap. Scripts on the page are read, never run.
- **Which rules run.** `ruleIds` runs exactly those rules, enabled or not. Without it, an application scan runs the enabled rules the application picked (its `governanceRules`), and otherwise every enabled rule runs. `categories` filters either set.
- **Results.** A rule with no violations adds one `pass` check; each violation adds a check with the rule's severity as its status. A rule that couldn't run is `error`, and one that found nothing but couldn't check all of its input is `incomplete` (a `warning` check); neither counts as a pass. See [GOVERNANCE.md](GOVERNANCE.md#scans) for the full result shape and who may read each scan.

The CLI and MCP server use the older paths `POST /compliance/scan` and `POST /compliance/scan-application`, which take the same bodies.

## Scheduled scans

An application's `capabilities.governance.scanSchedule` can be `manual` (the default), `daily` or `weekly`. `GovernanceScanScheduler` (`governance.scheduler.ts`) scans each scheduled application's `applicationUrl` once per UTC day or once per UTC week (from Monday), with the rules the application picked, recorded as created by `service:governance-scheduler`. An application is skipped if governance isn't enabled for it, it has no URL, or a governance scan already ran in the current period.

Each period's run is claimed with a lease, retried with backoff when it fails, and dead-lettered after the last attempt (`occurrence-policy.ts`). `GET /governance/scheduled-scans` (`admin:governance`) lists each scheduled application's latest occurrence. The settings:

| Variable | Default |
| --- | --- |
| `GOVERNANCE_SCHEDULER_ENABLED` | on; `false` turns it off (it never runs under `NODE_ENV=test`) |
| `GOVERNANCE_SCHEDULER_INTERVAL_MS` | 60,000 (how often it checks) |
| `GOVERNANCE_SCHEDULER_LEASE_MS` | 10 minutes |
| `GOVERNANCE_SCHEDULER_RETRY_DELAY_MS` | 5 minutes, doubling per attempt |
| `GOVERNANCE_SCHEDULER_MAX_ATTEMPTS` | 3 |

There is no `on-commit` schedule. To scan on every commit, have CI call `POST /api/v1/governance/scans` with an API key that has `admin:governance`. [GOVERNANCE.md](GOVERNANCE.md#scheduled-scans) describes occurrence states and recovery in detail.

## Rules in the editor

The ESLint plugin (`eslint-plugin-design-system`) can load the same rules from `GET /governance/rules/export` and check the ones that make sense on JavaScript source. Other rule types are skipped with a warning. See [LINTER_INTEGRATION.md](LINTER_INTEGRATION.md).
