# Feature list

What the app does today, what is only partly there, and what isn't built. Checked against the code at `main` (`69076bb`), 15 November 2026. Each built item names the page (frontend route) or API (`/api/v1/...`) it lives in, and the pull request that made it real where that was recent (adamstavely/cautious-lamp#N).

Status words:

- **Built**: works end to end against the backend, or entirely in the browser where noted.
- **Partly built**: some of it exists; the note says what is missing.
- **Not built**: no code for it.

## Core design system

| Feature | Status | Where |
| --- | --- | --- |
| Component inventory and status | Built | `/components`, `/components/status`, `/api/v1/components` (stored in Elasticsearch since #56; inventory pages on real data since #52) |
| Component documentation pages | Partly built | Two hand-written pages, `/components/buttons` and `/components/color-picker`, each with a playground, usage examples, performance figures, version history, breaking-change alert and migration notes. Other components have no detail page. |
| Component playground | Partly built | Only inside the Button and Color picker pages: live props, and copy as Vue, React, React Native or HTML. There is no general playground for any component. |
| Code snippets library | Partly built | Pattern pages (`/patterns/...`) show code from `data/patternSnippets.js`. There is no separate snippets library. |
| Design tokens | Built | `/tokens/studio` (DTCG tokens, Style Dictionary export), `/tokens/library`, `/tokens/playground`, `/api/v1/tokens` (Elasticsearch, #56) |
| Token relationships | Built | `/tokens/relationships`, `GET /api/v1/tokens/relationships`, `GET /api/v1/tokens/:name/impact` |
| Token migration | Built, in the browser | `/tokens/migration`: rewrites token references in files you add, with a diff and zips (#54) |
| Patterns library | Built | `/patterns`, `/patterns/status`, `patterns-library` API (Elasticsearch, #55) |
| Search | Built | `/search`, `/api/v1/search` |
| Versioning and changelog | Built | `/api/v1/changelog/*` (aggregated, entries, breaking changes, release notes); version history on the two component pages |
| Dependency graph | Built | `/components/dependencies`, `PUT /api/v1/components/:id/dependencies` |
| Deprecation manager | Built | `/components/deprecation`, `PUT /api/v1/components/:id/deprecation` |
| Variant builder | Built | `GET/POST/DELETE /api/v1/components/:id/variants`; variant code is generated on the server (#63) |
| Composition tool | Built, in the browser | `/components/composition`: arranges a fixed set of primitives and exports code; no API |
| Multi-brand | Built | `/brands`, `/api/v1/brands` (`backend/src/brands`) |
| Theme builder | Built | `/theme-builder` (#44) |
| Library export | Built, in the browser | `/components/export`: Storybook, PDF, Markdown, npm package, static site, Figma plugin, Penpot, Adobe XD files |
| React Native export | Partly built | Only the Button and Color picker playgrounds copy a React Native snippet. There is no React Native export of the library. |

## Developer tools

| Feature | Status | Where |
| --- | --- | --- |
| REST API, SDK and CLI | Built | `/api/v1/...`; `sdk` (`@designsystem/api`); `cli` (`@designsystem/cli`: config, compliance, register, applications, scan, tokens, components, health, scaffold, validate, migrate). `migrate` writes a component's current source; there is no versioned migration. |
| ESLint plugin | Built | `eslint-plugin-design-system`: 5 rules (below) plus server rules converted at run time |
| VS Code extension | Built | `vscode-design-system-extension`: completion, hover docs, snippets, insert component or token, replace with token |
| MCP server | Built | `mcp-server` |
| Component testing | Built | `/components/testing`: generates Vitest, Jest, Cypress or Playwright tests from a component's props; runs axe and timing checks on the live preview in the page. Visual tests run in your project with the visual regression integration, not on this page. |
| Scaffolding wizard | Built | `/components/scaffold`, `/api/v1/component-scaffolding` (templates, scaffold, create; generates code, docs and tests) |
| Documentation generator | Built | `/components/documentation`: from `/api/v1/components` or a Vue SFC parsed with Vue's compiler (#54) |
| Design-dev handoff | Built, in the browser | `/review/handoff`: reads SVG and token JSON, matches values to tokens, exports HTML, PDF, Markdown or JSON (#54) |
| Contribution checks | Built | `/getting-started/contribute`, `/api/v1/contribution-workflow`: governance rules, structure, documentation and test checks on submitted code (#54); pull requests opened on GitHub when configured (#63) |
| Code quality checks | Partly built | Only as the contribution checks above and the ESLint plugin. No lint or format runner in the app. |
| Dependency vulnerability scanner | Not built | No code in the frontend or backend. |
| CLI plugins | Not built | |

## Governance and compliance

| Feature | Status | Where |
| --- | --- | --- |
| Rules engine | Built | `/governance`, `/api/v1/governance/rules` (stored, versioned, import/export, test). 19 built-in rules (below). |
| Compliance scans | Built | `POST /api/v1/governance/scans`, `compliance/scan`, `compliance/scan-application`; daily and weekly schedules (`governance.scheduler.ts`) |
| Custom rule templates | Not built | There are no rule templates. You write or import rules. |
| Accessibility reports | Built | `/admin/accessibility-reports`, `/api/v1/accessibility-reports`: axe-core against WCAG 2.0, 2.1 and 2.2 A/AA tags, prioritized fixes with code examples, trends, schedules, SLAs, multi-application summary |
| Accessibility checks in CI | Partly built | CI can call the scan API; there is no packaged CI integration, and `on-commit` schedules are refused. |
| Application management | Built | `/admin/applications`, `/api/v1/applications`, including version tracking, apps needing upgrades and apps affected by breaking changes |
| Team workspaces | Built | `/admin/workspaces`, `/api/v1/workspaces/...`: roles, members, scoped and shared resources, analytics |
| Users, roles, audit, feature flags | Built | `/admin/users`, `/admin/roles`, `/admin/audit`, `/admin/feature-flags` |

## Analytics and health

| Feature | Status | Where |
| --- | --- | --- |
| Health score | Built | `/admin/health` (`/health` redirects there), `/api/v1/system-health/*`: five weighted factors (coverage, adoption, compliance, maintenance, accessibility), trends (30 days by default), alerts, recommendations, audit report. Factors with no data say "Not collected". |
| Usage analytics | Built | `/api/v1/analytics/*`: summary, popularity, adoption, usage trends, cross-application comparison, design debt. Usage comes from scans (#58). |
| Performance budgets and bundle analysis | Built | `/performance/budgets`, `/performance/bundle-analysis`; metrics nothing measures say "Not measured" (#54) |

## Notifications and requests

| Feature | Status | Where |
| --- | --- | --- |
| Notification center | Built | `/notifications`, `/api/v1/notifications` (Elasticsearch, #51) |
| Delivery | Built | Email (SMTP), Slack, Teams and signed webhooks (#59) |
| Component requests | Built | `/feedback` (`/components/feedback` redirects there), `/api/v1/component-requests` (#57): votes, comments, design/technical/final approval, assignment, priority, duplicates, analytics, promote, link to a component; an approved request becomes a roadmap item; status changes notify the author, assignee and voters |
| Roadmap | Built | `/feedback` (`/roadmap` redirects there), `/api/v1/roadmap` (#56) |

## AI

| Feature | Status | Where |
| --- | --- | --- |
| Eero assistant | Built | Trench Coat chat widget (#31) answering through `POST /api/v1/ai/chat` with Claude (#50) |
| AI suggestions | Built | `/ai-suggestions`, `POST /api/v1/ai/suggestions` (#50); `GET /api/v1/ai/status` says when no model is configured |
| Alt text generator | Built | `/tools/alt-text-generator`, `POST /api/v1/alt-text` |

## Integrations

| Feature | Status | Where |
| --- | --- | --- |
| Design sync (Figma, Penpot) | Built, read-only | `/design-sync`, `/api/v1/design-sync` (#62): compare components with the library, link nodes, scheduled compares, file versions. No code generation and no writes to design files. See [TOKEN_SYNC.md](./TOKEN_SYNC.md). |
| Token sync (Figma, Penpot) | Built | `/tokens/sync`, `/api/v1/token-sync` (#62): three-way diff, per-item choices, scheduled pulls that never auto-apply |
| Adobe XD | Not possible | Adobe has discontinued the XD APIs. The library export still writes XD-oriented files. |
| Visual regression (Argos) | Built | `/tools/visual-regression`, `/api/v1/visual-regression` (#60): Argos v2 API, CI setup generated from project settings, baselines with rollback, sharing with one person as viewer or editor, PDF reports, build notifications (#59). No WebSocket updates: pages poll. |
| Session replay (OpenReplay) | Built | `/hcd/session-replay`, `/api/v1/session-replay` (#61): tracker snippet and npm setup with privacy settings, sessions filtered by user, date range, order and page, events, replay and heatmap links to OpenReplay |
| Photosensitivity (IRIS) | Built | `/tools/photosensitivity`, `/api/v1/photosensitivity` |
| Design extraction | Built | `/tokens/extract`, `/api/v1/design-extraction` |

## Tools

All built, most entirely in the browser: palette builder, colour scale, converter, contrast and APCA checkers, gradient, box shadow, border radius, CSS animation, spacing scale, px and CSS converters, HTML viewer and escaper, image compressor, PNG to ICO, lorem ipsum, SVG placeholder, SEO tags, font library, scale, stack and Google Fonts subsetting, icon library, chart builder, timeline and table generators, Map Maker, Loupe, NASA-TLX, SUS and heuristic evaluation (stored through the API), and the user persona generator (`/research/user-personas`). See `/tools`.

## Review

Design review requests, Kanban board and admin: `/review`, `/review/management`, `/api/v1/reviews` and `/api/v1/admin/reviews`.

## Governance rules, counted

The old list claimed 34 rules (14 design system, 15 UX/HCD, 5 accessibility). The code has:

- **19 built-in governance rules** in `backend/src/governance/builtin-rules.ts`, seeded on first start:
  - Design system (10): component usage, hardcoded colours, spacing, typography scale, border radius, shadows, z-index, breakpoints, no `!important`, component naming.
  - UX/HCD (4): no inline styles, help text on complex inputs, no deprecated elements, video needs photosensitivity review.
  - Accessibility (5): axe-core scan, image alt text, form labels, heading order, no positive `tabindex`.
- **5 ESLint rules** in `eslint-plugin-design-system/src/rules.ts`: `hardcoded-design-tokens`, `component-naming`, `accessibility-attributes`, `spacing-consistency`, `typography-scale`. Four of them check the same things as governance rules.
- **axe-core's own rule set**, run by the `a11y-axe` rule, accessibility reports and component testing. It is axe's, not ours, and isn't counted above.

That is 24 named rules, 20 distinct checks. Rules you add through the governance API are on top of these.

## Not built

- Dependency vulnerability scanner
- Custom rule templates
- A general component playground, or detail pages beyond Button and Color picker
- React Native export of the library
- Code generation from design files, and writing back to them
- CLI plugins
- Interactive onboarding for new team members
