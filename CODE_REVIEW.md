# Code review: cautious-lamp

**Originally written** at `main` (`2849c65`), 12 November 2026. **Status updated** at `main` (`69076bb`), 15 November 2026: every finding below was re-checked against the code at `69076bb`, and each fixed one names the pull request that fixed it (adamstavely/cautious-lamp#N). The Problem columns still describe the code as it was at `2849c65`; the Status column says where it stands now.

The original review covered `backend/` (NestJS), `frontend/` (Vue 3), and `mcp-server`, `cli`, `sdk`, `eslint-plugin-design-system`, `vscode-design-system-extension`, the two standalone tools, scripts and repo config. **Method:** five parallel reviews (backend security, backend correctness, frontend core, frontend views, packages and tooling), plus `npm audit`, a compile check of every `.vue` file, and the backend and mcp-server test suites. Findings marked ✔ were re-checked by hand at the time.

## Where it stands at 69076bb

Every Critical and High finding is fixed. What is still open is mostly frontend quality and operations:

| ID | Open item |
| --- | --- |
| F3 | Two flag evaluators remain (`services/featureFlagsService.js` and `composables/useFeatureFlags.js`); the 5-minute refresh `setInterval` is never stopped, and the refresher map is never cleared. Stored flag values are respected now (#22). |
| F6 (part) | `MarkdownViewer.vue` still puts unsanitized `marked` output into `v-html` (it renders the repo's own docs, not user uploads). |
| F9 (part) | `Sidebar.vue` adds a `prefers-color-scheme` listener that is never removed. |
| F10 (part) | 31 `setInterval(…, 100)` dark-mode polls remain in `frontend/src` (103 components at `2849c65`). |
| F11 | `main.js` still registers every Vuetify component and directive (`import * as components`). |
| F12 (part) | 33 `alert()` calls in 11 files and 63 `console.log` calls remain. |
| F13 | Clickable `div`/`span`/`tr` elements without a role are still common (a single-line grep finds about 44), and the router sets no page title or focus on navigation. |
| F15 (part) | `ChartBuilder.vue` is still 3,827 lines. The others shrank: `WorkspaceDetail.vue` 422, `Governance.vue` 801, `design-system.service.ts` 1,555. |
| D10 | The Elasticsearch telemetry exporter re-queues a failed batch with no cap, and never checks `bulk` item errors. |
| D11 | No `enableShutdownHooks()`; the OpenTelemetry SIGTERM handler shuts the SDK down but never exits. |
| D12 | The browser OpenTelemetry setup still calls `addSpanProcessor` / `addLogRecordProcessor` when they exist and only warns otherwise. Telemetry is off only when `VITE_OTEL_ENABLED=false`. |
| L2 (part) | Photosensitivity errors still pass IRIS's `error.message` to the client inside the 503/422 body. |
| P8 (part) | The VS Code extension's completion trigger characters still include `tokens` and `components` (VS Code uses single characters only). The rest of P8 was fixed in #65, after `69076bb`. |
| P10 | `otel-collector-config.yaml` still uses the `logging` exporter, and no compose service runs the collector. |
| S1 (rest) | After #22 and the NestJS 11 upgrade (#24), the remaining advisories were moderate and low, in `style-dictionary`'s bundled glob and deepmerge. `npm audit` was not re-run for this update. |
| Ops | From the staff-engineer review's production gates: there is a health endpoint (`GET /api/v1/health`, Elasticsearch reachability, 503 when it is down, #63), but graceful shutdown (D11), backups and load testing are not done. |

Not reproducible: **F16** (a global `.bg-white { … !important }` rule in `style.css`). No such rule exists in `frontend/src` at `2849c65` or now, so it is closed.

## Original summary (2849c65)

At `2849c65` the app worked as a local demo but wasn't safe to deploy:

- No authentication anywhere; the frontend made every visitor an admin. Fixed: #13 (API keys), #14 (sign-in, global guard, server-side permissions).
- Three ways to run code on the server without logging in (IRIS shell command, `new Function` scanner code, SSRF through a headless browser). Fixed: #13, #14, #22.
- Most data in in-memory maps lost on restart. Fixed across #13 (Elasticsearch injected), #14, #22, #55, #56 and #57; the remaining in-process state is caches and job queues (see D1).
- Feature flags forced on. Fixed: #13 and #22 (R36).
- `vite build` failed, the cli and ESLint plugin couldn't be used, no CI. Fixed: #13; CI is `.github/workflows/ci.yml`.
- 82 known vulnerabilities in production dependencies. Fixed down to moderate/low: #22, #24.

---

## Critical

| ID | Where (at 2849c65) | Problem | Status at 69076bb |
| --- | --- | --- | --- |
| C1 ✔ | `backend/src/**` | **No authentication.** No guard on any route except the throttler; identity came from whatever the client sent. | Fixed: API keys from env (#13); real sign-in, JWTs, global `AuthGuard` and permission checks (#14). |
| C2 ✔ | `photosensitivity.service.ts:97`, `photosensitivity.controller.ts:18` | **Command injection** through a shell command built from an uploaded file's name. | Fixed (#13): `execFile`, filename not reused. |
| C3 ✔ | `design-system.service.ts:2956, 3032, 3171` | **The server ran `new Function` on `rules[].scannerCode`** from the request body. | Fixed (#14): rules are stored data, scanners are vetted code. |
| C4 ✔ | `design-system.service.ts:489-500`, 19 frontend files, VS Code extension, API client fallbacks | **Working API keys hardcoded** (`test-api-key-123`, `dev-key`). | Fixed (#13): the backend refuses both (tested in `key-management.service.spec.ts`). The VS Code extension's `apiKey` default was emptied in #65. |
| C5 ✔ | `frontend/src/main.js:46-62`, `router/rbacGuards.js` | **The client made every visitor an admin** via `initUserRole`; the guard failed open. | Fixed (#14): `initUserRole` deleted; prefix-matched guard from the signed-in user's permissions, failing closed. |
| C6 ✔ | `common/security/security-audit.service.ts:65, 235-256` | **Endless loop** in suspicious-activity logging. | Fixed (#13). |
| C7 | `docker-compose.yml:9,12-13` | **Elasticsearch open to the network.** | Fixed (#13): bound to `127.0.0.1:9200`, 9300 not published. Security stays off in the dev compose file, with a comment to enable it elsewhere. |

## Security (high and medium)

| ID | Where (at 2849c65) | Problem | Status at 69076bb |
| --- | --- | --- | --- |
| H1 | `design-extraction.service.ts:56` | **SSRF** returning the fetched page. | Fixed (#13); DNS rebinding closed with a per-scan egress proxy (#22, R09). |
| H2 ✔ | `design-system.controller.ts:44-113` | **API key routes open**, and created keys never validated. | Fixed (#13); scope escalation closed in #22 (R01). |
| H3 | `rbac.controller.ts` | **Anyone could rewrite roles**; `assignedBy` from the body. | Fixed (#14). |
| H4 | `visual-regression.service.ts:122`; `openreplay-api.client.ts:49` | **SSRF leaking the Argos token** via client `argosBaseUrl`. | Fixed (#13). |
| H5 | `token-sync.controller.ts:8-16` | **Figma/Penpot credentials returned** to anyone. | Fixed (#22, R08): owner-scoped connections, encrypted credentials, `toPublic` never returns them (`token-sync/connection-registry.ts`, shared by design-sync). |
| H6 | `audit.controller.ts` | **Audit logs readable by anyone.** | Fixed (#14): `admin:audit`. |
| H7 | `feature-flags.controller.ts:51-89` | **Anyone could create, toggle or delete flags**, or call `enable-all`. | Fixed (#22, R07): every write route needs `ADMIN_SYSTEM_HEALTH`. |
| H8 | `visual-regression.service.ts:669-676` | **Webhook signature skippable.** | Fixed (#13); secrets can be set and rotated since #25. |
| H9 | `search.controller.ts:8-12` | **Search accepted any `Bearer`.** | Fixed (#13). |
| F4 | `review-ui/PreviewFrame.vue:85` | **XSS through the iframe src.** | Fixed (#13). |
| F5 | `components/EeroChatbot.vue` | **Chatbot rendered LLM and user text as HTML.** | Fixed: markdown escaped first (#29, S14); Eero then moved onto Trench Coat's chat widget with plain-text formatting (#31). |
| F6 | `DocumentationGenerator.vue:357`; `MarkdownViewer.vue` | **Unsanitized `marked` output in `v-html`.** | Partly fixed (#13): DOMPurify is a dependency and the documentation generator sanitizes. `MarkdownViewer.vue` still doesn't (open). |
| M1 | `rate-limit.guard.ts` | **Rate limiting easy to bypass.** | Fixed (#13). |
| M2 | `backend/src/main.ts:21` | **Validation did almost nothing.** | Fixed: DTOs per module (#13, #14), a global `whitelist` + `forbidNonWhitelisted` pipe (#58), and DTOs for the 19 remaining free-form bodies (#63). Bodies typed as plain objects are listed, with reasons, in `global-validation.spec.ts`. |
| M3 | `visual-regression.gateway.ts` | **Open socket gateway.** | Fixed (#13); credential expiry and re-checks in #29 (S07). |
| M4 | `photosensitivity.controller.ts` | **Large unauthenticated uploads** with absolute paths in responses. | Fixed (#13); admission limits in #29 (S06). |
| M5 | `design-extraction.service.ts` | **One Chromium per request.** | Fixed (#13). |
| M6 | `frontend/src/services/api.js:68-70` | **Review password in the query string.** | Fixed (#13). |
| L1 | `encryption.service.ts:19-23` | **Built-in fallback encryption key.** | Fixed (#22): outside development and test a missing `ENCRYPTION_KEY` leaves encryption unavailable instead of using a built-in key. |
| L2 | `photosensitivity.service.ts`, `design-extraction.controller.ts:84` | **Error messages expose internals.** | Partly fixed: the design-extraction controller no longer builds error text, and upload paths are gone from responses (#13). IRIS error messages are still passed to the client (open). |
| L3 | `mcp-server/src/resources/documentation.resource.ts` | **Path check without separator.** | Fixed (#13). |
| L4 | `.gitignore` | **`.env.*` not ignored.** | Fixed (#13). |

## Data and correctness

| ID | Where (at 2849c65) | Problem | Status at 69076bb |
| --- | --- | --- | --- |
| D1 ✔ | `app.module.ts:33` and feature modules | **Elasticsearch never injected**; about 90 in-memory maps. | Fixed (#13), then each store moved to Elasticsearch: RBAC, users, governance (#14); keys, projects, flags (#22); patterns, contribution process, sync connections (#55); components, tokens, roadmap, banners, budgets, issues (#56); component requests (#57). What stays in process is caches and queues: the API-key lookup cache, the design-system in-process copy (reloaded when another replica writes, #63) and `common/background-jobs/job-queue.service.ts`. Review files and photosensitivity uploads are on local disk. |
| D2 | `component-request.service.ts` vs `component-requests.service.ts` | **Two component-request stores.** | Fixed (#57): one Elasticsearch store; `/api/v1/requests` removed. |
| D3 ✔ | `feature-flags.service.ts`; `featureFlagsService.js` | **Flags forced on.** | Fixed: guard no longer redirects on fetch errors (#13); stored values win on both sides (#22, R36). |
| D4 | `design-system.service.ts:2950-3200`, `Governance.vue` | **Fake governance results.** | Fixed (#14). |
| D5 | `design-system.service.ts:3924-4046` | **Failed survey writes reported as saved.** | Fixed (#13). |
| D6 | `system-health.service.ts`, `analytics.service.ts`, `design-system.service.ts` | **Dashboards showed random numbers.** | Fixed: analytics (#14), health history (#22, R38), design-system data (#56). No `Math.random` remains in backend metrics (only in palette hue variation and job ids). Component usage is recorded from scans since #58. |
| D7 | `rbac.service.ts:445-532` | **Revoked roles came back.** | Fixed (#14). |
| D8 | `rbac.service.ts`, `audit.service.ts` | **No index mappings.** | Fixed (#13). |
| D9 | `color-palette.service.ts:77` | **Palette list problems.** | Fixed (#13). |
| D10 | `observability/elasticsearch-exporter.ts:57-66` | **Telemetry export queue unbounded**; bulk errors ignored. | Open. |
| D11 | `observability/opentelemetry.ts:92`; `main.ts` | **Shutdown hangs.** | Open. |
| D12 | `frontend/src/observability/opentelemetry.ts:62,113` | **Frontend telemetry never exports but still runs.** | Open. |
| D13 | `views/WorkspaceDetail.vue` | **Workspace failures hidden or invented.** | Fixed (#14). |
| D14 | `AdminDashboard.vue`; `ReviewKanban.vue` | **Empty against the real API.** | Fixed (#13). |
| D15 | `error-handler.ts` | **Timeouts reported as connection errors.** | Fixed (#13). |
| D16 | `rbac.service.ts:243`, `feature-flags.service.ts:35` | **Startup race** from async work in constructors. | Fixed: RBAC initializes in `onModuleInit` (#14); feature flags read through an injected store with no constructor work (#22). |

## Frontend quality

| ID | Where (at 2849c65) | Problem | Status at 69076bb |
| --- | --- | --- | --- |
| B1 ✔ | `ReviewPage.vue`, `HarmonyPalette.vue`, `TimelineGenerator.vue` | **Template errors broke `vite build`.** | Fixed (#13); CI runs `check:sfc` and the build. |
| F1 | 41-48 files | **`http://localhost:3000` hardcoded** in about 55 places. | Fixed (#13). One fallback remains in `observability/opentelemetry.ts` for when `VITE_API_URL` is unset. |
| F2 | `main.js:186, 310` | **`/admin` declared twice.** | Fixed (#14). |
| F3 | `useFeatureFlags.js`; `featureFlagsService.js` | **Three flag evaluators that disagree**, a never-cleared refresher map and a never-stopped interval. | Partly fixed (#22): they agree on stored values. Two evaluators, the map and the interval remain (open). |
| F7 | `MapMaker.vue:627, 999` | **Resize observers never cleaned up.** | Fixed (#13). The ChartBuilder lines were commented-out code. |
| F8 | `MapMaker.vue` | **Map-switch race.** | Fixed (#13). |
| F9 | `Step2Harmony.vue`, `Sidebar.vue`, `DarkModeToggle.vue` | **Listeners never removed.** | Partly fixed (#13). `Sidebar.vue`'s media-query listener remains (open). |
| F10 | 103 files | **Dark mode polled every 100 ms.** | Partly fixed: many pages moved to tokens and shared components (#27, #43–#46); 31 such intervals remain (open). |
| F11 | `main.js:18-21` | **Entry chunk includes every Vuetify component.** | Open. |
| F12 | 225 `alert(` in 51 files; 94 `console.log` | **`alert()` for feedback, debug logging.** | Partly fixed (#13 and the restyles): 33 `alert()` in 11 files and 63 `console.log` remain (open). |
| F13 | 46 elements; 18 `v-for`s | **Accessibility and rendering gaps**, no focus management or page titles on navigation. | Open. |
| F14 | 12 files | **`isMockMode()` showed mock reviews as real** when the health check failed. | Fixed (#13): mock mode only when `VITE_USE_MOCKS=true`. |
| F15 | `ChartBuilder` 5,434 lines, `WorkspaceDetail` 3,666, `Governance` 3,304; `design-system.service.ts` 6,119 | **Monolith files.** | Partly fixed (#14, #56 and others): see the table at the top. `ChartBuilder.vue` is still 3,827 lines (open). |
| F16 | `frontend/src/style.css` | **Global `.bg-white … !important` rule.** | Not reproducible: no such rule at `2849c65` or now. Closed. |

## Packages and tooling

| ID | Where (at 2849c65) | Problem | Status at 69076bb |
| --- | --- | --- | --- |
| P1 | `mcp-server/src/logger.ts` | **Logs on the MCP stdout channel.** | Fixed (#13). |
| P2 | `eslint-plugin-design-system/src/index.ts` | **Plugin couldn't be loaded.** | Fixed (#13). |
| P3 | `cli/src/cli.ts` | **cli didn't compile.** | Fixed (#13). |
| P4 | `mcp-server/src/index.ts` | **Tools crashed without `arguments`.** | Fixed (#13). |
| P5 | `mcp-server/src/api-client.ts` | **POSTs retried.** | Fixed (#13). |
| P6 | standalone tools and sdk `package.json` | **Entry points pointed at missing files.** | Fixed (#13, #22 R28). |
| P7 | `eslint-plugin-design-system/src/index.ts` | **`component-naming` false positives.** | Fixed (#13). |
| P8 | `vscode-design-system-extension/src/extension.ts` | **Docs URL hardcoded**, settings read once, `enableSnippets` unread, multi-character triggers. | Partly fixed: `apiUrl`/`apiKey` changes are picked up (`onDidChangeConfiguration`). #65 (after `69076bb`) added a `docsBaseUrl` setting, honours `enableSnippets` and removed the `test-api-key-123` default. The multi-character triggers are still open. |
| P9 | repo root | **No CI**; workspaces missed packages. | Fixed (#13): `.github/workflows/ci.yml` builds and tests backend, frontend, sdk, cli, mcp-server, the ESLint plugin, the VS Code extension and the two standalone tools. |
| P10 | `otel-collector-config.yaml` | **Unused collector config with a removed exporter.** | Open. |

## Dependencies

| ID | Problem | Status at 69076bb |
| --- | --- | --- |
| S1 ✔ | `npm audit --omit=dev`: 82 vulnerabilities (3 critical, 32 high). | Fixed down to moderate and low (#22, #24). Not re-run for this update. |

## Later reviews

- **Phase 3 external review (R01–R39, at `d5528ed`):** all 39 fixed in #22.
- **Staff-engineer review (S01–S15, at `11f8c8f`):** S02, S03, S05–S10, S13 and S14 fixed in #29. The rest are fixed since: S01 and S12 (component-request authorization, forged authors) in #57; S04 and S15 (core library and roadmap in memory, duplicate component ids now 409) in #56; S11 (simulated contribution checks) in #54. The production gates are in the open list above.
- **Second staff-engineer review (T01–T10, at `2b17fad`):** T03–T07 fixed in #38. T01, T02, T08, T09 and T10 are S01, S04, S11, S12 and S15, fixed as above.
- **Phase 2 known gaps:** component-usage analytics now records usage from scans (#58). `docs/RULES_ENGINE_GUIDE.md`, which still described `scannerCode` scanners at `69076bb`, is rewritten for the declarative engine in the docs refresh that adds this status. Registering an application from the CLI or SDK still needs a key with `admin:governance`.

## Tests

At `2849c65` the backend had 3 spec files and the frontend, cli, sdk, ESLint plugin and extension had none. At `69076bb`: 83 backend spec files, 37 frontend test files, 17 in mcp-server, 5 in the ESLint plugin, 3 in the VS Code extension, 2 each in cli and sdk. CI runs all of them, plus the standalone tools' tests and pack checks.

## History

The sections below are what each phase recorded at the time. They are kept for the detail of each fix; where they say something is "not addressed" or "known gap", the tables above are current.

### Status after Phase 1

Phase 1 covered the MCP server, CLI, SDK, ESLint plugin, every tool page, data visualization and the review section, plus the foundations they needed. It shipped as adamstavely/cautious-lamp#13.

- **Fixed:** C2, C4, C6, C7; H1, H2, H4, H8, H9; F4; M1, M3, M4, M5, M6; L3, L4; D1, D5, D8, D9, D14, D15; B1; F1, F7, F8, F14; P1–P7 and P9.
  - F7 and F8 turned out to be in commented-out ChartBuilder code; the real bugs were in MapMaker, and both are fixed.
  - The review section now has a real backend (`docs/REVIEW_API.md`).
- **Partly fixed:**
  - **C1:** keys come from `API_KEYS`; admin routes need `ADMIN_API_KEY`; the tool, review, visual-regression and scaffolding routes require a key. There are still no user accounts.
  - **M2:** strict DTO validation in the review module only.
  - **F6:** the documentation generator is sanitized; `MarkdownViewer` isn't.
  - **D3:** the route guard no longer hides pages when flags can't load, but flags are still forced on.
  - **F9, F10, F12:** fixed in the tool, data-viz and review pages only.
- **Planned for Phase 2:** C1, C3, D4, C5, H3, H6, D7 and D13, all fixed (below).
- **Not yet scheduled:** H5, H7, F5, F2, F3, F11, F13, F15, F16, D2, D6, D10–D12, D16, L1, L2, P8, P10, S1.

### Status after Phase 2

Phase 2 covered governance, accessibility reports and scanning, team workspaces, and user, application and role management. It shipped as adamstavely/cautious-lamp#14.

- **Fixed:**
  - **C1:** real sign-in. Users are stored in Elasticsearch with bcrypt passwords and JWTs. A global guard covers every route, with permission checks on the server; machine clients keep API keys (`docs/AUTH.md`).
  - **C3, D4:** governance rules are stored data with versions. The `new Function` scanners are deleted, scans run real checks (axe for accessibility), and the fake fallback reports are gone (`docs/GOVERNANCE.md`).
  - **C5:** `initUserRole` is removed. Routes are guarded by prefix from the signed-in user's permissions, and the guard denies when permissions can't be loaded.
  - **H3, H6:** the role routes need `admin:rbac` and the audit routes `admin:audit`. `assignedBy` comes from the principal.
  - **D7:** RBAC has one store, and write errors surface as `503`.
  - **D13:** workspaces resolve members on the server and show real errors (`docs/WORKSPACES.md`).
- **Also fixed in Phase 2:**
  - A user with `admin:users` could reset the password of someone with more privileges and sign in as them.
  - Application governance rules didn't match any real rule, and an application scan ignored them.
  - The session replay snippet put the project key into a `<script>` unescaped, and project updates could overwrite any stored field.
- **Partly fixed, M2:** strict validation now also covers the auth, users, RBAC, governance, workspace and application routes.
- **Known gaps:**
  - Component-usage analytics has no data source now that its fake history is gone, so the analytics pages are empty until usage tracking is wired up.
  - `docs/RULES_ENGINE_GUIDE.md` and `docs/AUTOMATED_ACCESSIBILITY_REPORTS.md` describe the old scanners.
  - Registering an application from the CLI or SDK needs an API key with the `admin:governance` scope.

### Status after Phase 3

A second, external review of `main` at `d5528ed` (13 November 2026) reported 39 findings, R01–R39: 13 P1 and 26 P2. Each was checked against the code and all 39 were real. All are fixed in adamstavely/cautious-lamp#22, with tests.

| Finding | Fix |
| --- | --- |
| **P1** | |
| R01 API-key privilege escalation | Key routes moved to `auth/api-keys.controller.ts`; a caller can only grant scopes it holds |
| R02 Review sharing/password changes unchecked | One access policy (`reviews/review-access.ts`); only the owner or a review admin can change sharing or the password |
| R03 Review list leaks metadata | The list is filtered by the same policy; `approvedEmails` is hidden from callers who can't manage sharing |
| R04 API keys impersonate reviewers | `x-user-email` from an API key is a display label only; keys need `review:admin` |
| R05 Workspace components via global routes | `design-system/component-access.service.ts` covers list, detail, search, metadata, AI chat and analytics |
| R06 Projects without ownership checks | `visual-regression/project-access.ts` on every route and WebSocket subscription, by workspace role |
| R07 Admin mutations without permissions | Banners, feature flags, budgets, roadmap, triage, components, patterns and contribution routes need permissions |
| R08 Sync APIs expose credentials | Connections are owner-scoped, credentials encrypted and never returned |
| R09 DNS rebinding in browser scans | Chromium goes through a per-scan egress proxy that checks the resolved IP on each connection |
| R10 Partial rule seed is permanent | Seeding is resumable, with a marker per rule and completion recorded last |
| R11 Unbounded browser evaluation | A total deadline closes the browser and frees the slot (504) |
| R12 Projects lost on restart | Visual regression and session replay projects and runs are stored in Elasticsearch; missing links are recreated or removed |
| R13 Client approval unreachable | The server returns `allowedActions`; a `client` role exists; the UI uses `allowedActions` |
| **P2** | |
| R14 Runtime API keys lost | Hashed keys in Elasticsearch, shared by every replica |
| R15 Passphrase encryption keys unrecoverable | Stable PBKDF2 derivation; hex or base64 keys used as-is |
| R16 Counts truncated at 50 nodes | Full counts are kept; examples are sampled and the report says so |
| R17 Selector cap turns failures into passes | Every element is checked; untested values give `incomplete`, never a pass |
| R18 Schedules never run | `governance.scheduler.ts` runs daily and weekly scans; `on-commit` is refused (CI calls the scan API) |
| R19 Listing stops at 10,000 | Point-in-time paging with `search_after`, also used by the workspace store |
| R20 Error pages become reports | A non-2xx/3xx target fails the scan (422) and keeps the previous report |
| R21 Concurrent enables leak projects | Fixed project ids per application; the loser reuses the winner's project |
| R22 Tool accessibility scans throw | Shared `utils/axeScan.js` with real axe rules and tags |
| R23, R24 Generated React table | Stable default data, rows keyed by id, page reset and clamped |
| R25 Generated Vue exports break | `utils/scriptSafeJson.js` escapes embedded data |
| R26 MCP asset tools call old routes | `/workspaces/:id/resources/:kind`, plus a contract test against the backend controllers |
| R27 ESLint dynamic rules lose meaning | Declarative rule types mapped explicitly; unsupported rules skipped with a warning |
| R28 Standalone package entry points | Manifests match the build output; types; `npm pack` check |
| R29, R30 VS Code quick fix and cache | Syntax-aware token edits with imports; separate cache ages |
| R31, R32 Loupe geometry and metadata | Viewport coordinates (also in the app's Loupe); real endpoint with `response.ok` fallback |
| R33 Workspace admins blocked from applications | Route allows workspace owners and admins |
| R34 Session expiry strands the UI | Expiry is handled before the cached user is returned, and redirects to sign-in |
| R35 Late workspace responses | Request generations guard every assignment |
| R36 Disabled flags forced on | Stored values win on both sides; defaults only for missing flags; flags are re-read after sign-in |
| R37 Sync reports success without syncing | Unsupported provider operations return 501 and the UI says sync isn't available |
| R38 Random health history | Measured data only; unmeasured factors are "Not collected" |
| R39 Placeholder PDF and rollback | 501 instead of fake success |

Found while fixing these: pattern and contribution bodies weren't validated, so one empty write broke the list for everyone. Both now return 400.

**Dependencies.** `npm audit --omit=dev` went from 81 findings (2 critical, 32 high) to 12 (10 moderate, 2 low):
- **Fixed or upgraded:** `npm audit fix`, jsPDF 4, zod 4, OpenTelemetry 3 on the backend (0.223 line in the browser), `@nestjs/common` 10.4.22 (Content-Type RCE), and csv-parse 7.
- **Overrides:** `body-parser`, `multer`, `qs`, `image-size` and `gcp-metadata`, in the root `package.json`.
- **Removed:** the unused `@adobe/leonardo-contrast-colors`, which took its whole vulnerable chain with it.

NestJS was then upgraded from 10 to 11 (Express 5), which cleared the `@nestjs/core` and `file-type` advisories. What's left (6, moderate and low) is `style-dictionary`'s bundled glob and deepmerge, which have no upstream fix yet.

**Known gaps:**
- **Design and token sync connections (fixed later):** they were kept in memory and lost on restart. They're now stored in Elasticsearch (`design-system-design-sync-connections`, `design-system-token-sync-connections`), with API keys still encrypted by EncryptionService before they're written. The patterns library and the contribution process (guidelines, PR templates, check definitions) moved to Elasticsearch at the same time; their defaults are seeded once, with stable unique ids, and a deleted default stays deleted.
- **Session replay (fixed after Phase 3):** it showed mock sessions when no OpenReplay key was set. It now says OpenReplay isn't connected, and project settings can set the key. IRIS ships in the backend Docker image, and `GET /integrations/status` reports every integration (docs/INTEGRATIONS.md).
- **Argos webhooks (fixed after Phase 3):** nothing could set a project's webhook secret, so every webhook was refused. Projects now have `POST`/`DELETE …/webhook-secret` (manage role) and a settings card to generate, replace or remove it.
- **Migration:**
  - Clusters seeded partially by the old code keep a v1 seed marker, which a deliberate deletion can't be told apart from.
  - Values encrypted under a passphrase key before R15 must be re-entered.
  - API keys created at runtime before R14 must be created again.

Findings are grouped by area below: Critical (C), Security (H, F, M, L), Data and correctness (D), Frontend quality (B, F), Packages (P) and Dependencies (S).

### Status after the staff-engineer review

A staff-engineer production-readiness review of `main` at `11f8c8f` (14 November 2026) reported 15 findings, S01–S15. The ten in areas covered by Phases 1–3 and the integrations are fixed, with tests:

| Finding | Fix |
| --- | --- |
| S02 Variant writes need only read access | `ComponentAccessService.getForWrite`: workspace components need the editor role in their source workspace; shared and global readers get 403 |
| S03 Scans expose private components | Design-system scans cover only components the caller can read; stored scans and reports carry `access` metadata and are filtered on list and detail (older records fail closed) |
| S05 Temporary passwords only enforced in the browser | `AuthGuard` restricts such sessions to `auth/me`, `change-password` and `logout` (403 `PASSWORD_CHANGE_REQUIRED`), WebSocket included |
| S06 Unbounded video analysis | `AdmissionPool`: limits on running, queued and per-caller analyses, checked before the upload is stored (503/429 with `Retry-After`); frame, output and timeout caps with SIGKILL and cleanup |
| S07 WebSocket subscriptions outlive revocation | Sockets close at credential expiry; credentials and project access are re-checked on subscribe and before each broadcast |
| S08 Scheduled scans lost on a crash | Expiring leases, bounded retries with backoff, dead letters and fixed result ids, for governance and accessibility schedules |
| S09 Accessibility reports suppress governance scans | Separate `governance.lastScan` and `lastAccessibilityReport` timestamps |
| S10 Incomplete audits labelled AA | New `conformance` status; `wcagLevel` is the level actually verified (`Unverified` is new); SLA `needs-review`; HTML-only scans never reach AA |
| S13 Analytics reveal other workspaces' applications | Analytics and `GET /applications` use `ApplicationsService.listFor` |
| S14 Persona input rendered as HTML | Rendered as text; the Eero chatbot's markdown now escapes first |

Not addressed, because they are outside the areas worked on: S01 and S12 (component request authorization and forged authors), S04 and S15 (the core component library and roadmap are in memory only; duplicate component ids), S11 (simulated contribution checks), and the review's production gates (readiness checks, graceful shutdown, backups, load testing).

### Status after the second staff-engineer review

A second review at `2b17fad` (14 November 2026) reported T01–T10. The five in code from the earlier fixes are fixed, with tests:

| Finding | Fix |
| --- | --- |
| T03 Cancelling during slot handoff leaks IRIS capacity | `AdmissionTicket.grant(true)` makes the ticket the slot's owner at once, so a cancel before its `run()` resumes aborts it as a running job and the slot is released once |
| T04 Schedule and SLA reads bypass report privacy | Schedule and SLA list and detail reads follow the report rule (the application's workspace, or governance admins; others get an empty list or 404); responses leave out `pending.token` and `pending.leaseUntil` |
| T05 Long scheduler passes hand out expired leases | Both schedulers read the clock at each claim and each completion (`clockOf` in `occurrence-policy.ts`) |
| T06 Governance retries lost at a period boundary | A previous-period occurrence still waiting for a retry, or whose run died, is dead-lettered as superseded before the new period runs; one with a live lease finishes first |
| T07 Unknown API keys fill the lookup cache | Unknown keys are never cached; known keys are capped at 1,000 per instance, least recently used dropped first, expired entries dropped when read |

T01, T02, T08, T09 and T10 are S01, S04, S11, S12 and S15 above, still not addressed.
