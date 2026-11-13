# Code review: cautious-lamp

Reviewed at `main` (`2849c65`), 12 November 2026. Covers `backend/` (NestJS, ~33k lines), `frontend/` (Vue 3, ~157k lines), and `mcp-server`, `cli`, `sdk`, `eslint-plugin-design-system`, `vscode-design-system-extension`, the two standalone tools, scripts and repo config.

**Method.** Five parallel reviews (backend security, backend correctness, frontend core, frontend views, packages and tooling), plus `npm audit`, a compile check of every `.vue` file, and the backend and mcp-server test suites. Every finding marked ✔ was re-checked by hand against the code. The others come from a single reviewer who read the code, and include a file and line reference to check.

## Summary

The app works as a local demo, but it isn't safe to deploy, and much of what it shows isn't real.

- **There's no authentication anywhere.** The backend has no auth guard on any route. The frontend makes every visitor a `design_system_manager` (admin) on each page load. Identity comes from whatever the client sends.
- **Three ways to run code on the server** without logging in: a shell command built from an uploaded file's name, `new Function` on scanner code sent in a request body, and SSRF through a headless browser.
- **Most data isn't stored.** Elasticsearch is never wired into the RBAC, feature-flag, audit or design-system modules, so they run from in-memory maps that are wiped on restart. Several endpoints report success when a write failed, and several dashboards show random numbers.
- **Admin controls don't work.** Feature flags are forced on in both the backend and the frontend, so switching one off does nothing.
- **It doesn't build.** `vite build` fails on three pages. The cli and the ESLint plugin can't be used as shipped. There is no CI.
- **82 known vulnerabilities** in production dependencies: 3 critical, 32 high.

## Status after Phase 1

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

## Status after Phase 2

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

Findings are grouped by area below: Critical (C), Security (H, F, M, L), Data and correctness (D), Frontend quality (B, F), Packages (P) and Dependencies (S).

## Fix first

In this order. The first five block any deployment beyond a single developer's machine.

1. **Add real authentication.** Add a global auth guard on the backend. Derive the user from the session, never from `x-user-id`, body fields or localStorage. Delete `initUserRole` in the frontend. (C1, C5, F1)
2. **Remove the three remote-code paths:** use `execFile` for IRIS, stop executing client scanner code, and block private addresses in design extraction. (C2, C3, H1)
3. **Delete the hardcoded API keys** (`test-api-key-123`, `dev-key`) from the backend, the frontend (19 files), the VS Code extension and the API client fallbacks. (C4)
4. **Stop the security-audit loop** that can freeze the server. (C6)
5. **Lock down Elasticsearch in `docker-compose.yml`** (bind to 127.0.0.1, enable security). (C7)
6. **Fix the build:** three Vue template errors. Then add CI. (B1, P9)
7. **Make Elasticsearch actually inject** (`global: true`), add index mappings, and stop returning fake success. (D1, D5, D8)
8. **Stop forcing feature flags on**, in the backend and the frontend. (D3, F3)
9. **Upgrade dependencies** to clear the critical and high advisories. (S1)
10. **Sanitize every `v-html` and `innerHTML` sink.** (F4, F5, F6)

---

## Critical

| ID | Where | Problem | Fix |
| --- | --- | --- | --- |
| C1 ✔ | `backend/src/**` | **No authentication.** No `@UseGuards`, passport strategy or auth guard exists. The only `APP_GUARD` is the throttler. These controllers have no check at all: rbac, audit, feature-flags, token-sync, design-sync, session-replay, visual-regression, analytics, accessibility-reports, system-health, component-scaffolding, color-palette and photosensitivity. The rest check an API key by hand, but the accepted keys are hardcoded (C4). | Global auth guard plus a permissions decorator; derive the user from the token. |
| C2 ✔ | `photosensitivity.service.ts:97`, `photosensitivity.controller.ts:18` | **Command injection.** The shell command is built as `` `${iris} -v "${videoPath}" …` `` and run with `exec`. The stored filename keeps `extname(file.originalname)`, which the client controls, and `$()` still expands inside double quotes. Uploading `x.$(curl…|sh)` runs it, with no auth needed. | `execFile(iris, ['-v', videoPath, …])`; don't reuse `originalname`. |
| C3 ✔ | `design-system.service.ts:2956, 3032, 3171`, route `POST compliance/scan` | **The server runs code from the request body.** `rules[].scannerCode` is passed to `new Function('context', scannerCode)` in the Node process. The only gate is the hardcoded key (C4). The Governance page even has a textarea for it (`Governance.vue:423, 3017`). | Never execute client code; accept rule IDs and run vetted scanners. |
| C4 ✔ | `design-system.service.ts:489-500`; `test-api-key-123` in 19 frontend files and `vscode-design-system-extension/src/extension.ts:20,127`; fallbacks in `frontend/src/services/api.js:29` and `componentMetadataService.js:170` | **Working API keys hardcoded in the source.** `test-api-key-123` and `dev-key` are registered on every start, pass every `validateRequest` check, and ship in the client bundle. | Delete them; load keys from env or a secret store. |
| C5 ✔ | `frontend/src/main.js:46-62`, `router/rbacGuards.js:21,30,55` | **The client makes every visitor an admin.** `initUserRole` writes `userRole=design_system_manager` on every load, and `?role=` overrides it. The RBAC guard skips the check for that role, matches only exact paths (so `/admin`, `/admin/users`, `/admin/workspaces/:id` and others go unchecked), and returns `true` on any error. Its API URL is hardcoded to `localhost:3000`, so outside local dev it always errors and always allows. | Delete `initUserRole`; fail closed; prefix-match `/admin/*`; enforce on the server. |
| C6 ✔ | `common/security/security-audit.service.ts:65, 235-256` | **The server can freeze in an endless loop.** `logSecurityEvent` always calls `checkSuspiciousActivity`, which logs a new event whose description and `detectedPattern` match the same regex (for example "Potential privilege escalation attempt" matches `/privilege.*escalation/`). One match loops forever, starving the event loop and growing memory. `userAgent` is part of the matched text, so a client can trigger it. | Skip the check for `type === 'suspicious_activity'`. |
| C7 | `docker-compose.yml:9,12-13` | **Elasticsearch is open to the network.** `xpack.security.enabled=false`, with ports `9200` and `9300` published on all interfaces. Docker's iptables rules also bypass ufw and firewalld. | `127.0.0.1:9200:9200`, drop 9300, enable security outside dev. |

## Security (high and medium)

| ID | Where | Problem | Fix |
| --- | --- | --- | --- |
| H1 | `design-extraction.service.ts:56`, controller `:66` | **SSRF that returns the fetched page.** Only `http://localhost…` is blocked. `169.254.169.254`, `127.0.0.1:9200` and `[::1]` all get through, and Playwright's extraction result is sent back. | Resolve the host and reject private and link-local addresses, including after redirects. |
| H2 ✔ | `design-system.controller.ts:44-113` | **API key routes are open.** Anyone can create, list, revoke or rotate keys, so they can revoke every key. Separately, keys created here go to `KeyManagementService`, but `validateApiKey` (`design-system.service.ts:567`) only checks its own map, so newly created keys never work. | Guard the routes; validate keys through `keyManagementService`. |
| H3 | `rbac.controller.ts:32,50,58` | **Anyone can rewrite roles** and grant themselves admin. `assignedBy` comes from the request body. | Guard with an `rbac:manage` permission. |
| H4 | `visual-regression.service.ts:122`; `session-replay/openreplay-api.client.ts:49` | **SSRF that also leaks a token.** The client-supplied `argosBaseUrl` is called with the stored Argos token. | Allowlist base URLs, or set them only from server config. |
| H5 | `token-sync.controller.ts:8-16` | **Third-party credentials returned to anyone.** Responses include Figma and Penpot `apiKey`s, with no auth. design-sync probably does the same (not verified). | Auth, and drop secrets from responses. |
| H6 | `audit.controller.ts:18,50,80` | **Audit logs readable and exportable by anyone**, including emails, IPs and request bodies. | Guard with an `audit:read` permission. |
| H7 | `feature-flags.controller.ts:51-89`; `scripts/enable-all-features.js` | **Anyone can create, toggle or delete feature flags**, or call `enable-all`. | Guard the write routes. |
| H8 | `visual-regression.service.ts:669-676` | **The webhook signature check can be skipped** by leaving out the header. | If a secret is configured, require the signature; sign the raw body. |
| H9 | `search.controller.ts:8-12` | **Search accepts any `Bearer` value.** | Validate the key. |
| F4 | `frontend/src/components/review-ui/PreviewFrame.vue:85` | **XSS through the iframe src.** `innerHTML = \`<iframe src="${props.url}">\`` uses a URL that comes from shared review data, so a `"` breaks out of the attribute. The iframe isn't sandboxed either. | Use `<iframe :src sandbox>` in the template. |
| F5 | `components/EeroChatbot.vue:55,185-191` | **The chatbot renders LLM and user text as HTML.** It applies regex markdown, never escapes, and uses `v-html`. | Escape first, or use marked plus DOMPurify. |
| F6 | `views/DocumentationGenerator.vue:357`; `MarkdownViewer.vue:166-173` | **Unsanitized `marked` output in `v-html`.** HTML in uploaded files runs. There are 17 unsanitized `v-html` sites in 13 files, and DOMPurify isn't a dependency. | Add DOMPurify. |
| M1 | `common/rate-limiting/rate-limit.guard.ts:35-38`, `rate-limit.config.ts` | **Rate limiting is easy to get around:** limits are per-token, before the token is checked, so a random token each time is a fresh bucket. Throttler v6 applies the strict `auth` limit (10/min) to every route. | Key by IP until the key validates; make named throttlers opt-in. |
| M2 | `backend/src/main.ts:21` | **Validation does almost nothing.** `ValidationPipe()` has no `whitelist` or `transform`, and handlers use inline interfaces, so any field is accepted (mass assignment). | `whitelist`, `forbidNonWhitelisted` and `transform`, plus class DTOs. |
| M3 | `visual-regression.gateway.ts:15-62` | **The socket gateway is open:** `cors: '*'`, no auth, and clients can join any room. | Authenticate in `handleConnection`. |
| M4 | `photosensitivity.controller.ts:22,62` | **Large unauthenticated uploads:** 500MB, files never deleted, and the response includes absolute paths. | Auth, a lower limit, cleanup, drop paths. |
| M5 | `design-extraction.service.ts:40,62` | **One Chromium per request**, uncapped. | Run them through a queue or semaphore. |
| M6 | `frontend/src/services/api.js:68-70` | **The review password goes in the query string**, so it ends up in logs and telemetry spans. | Send it in the body or a header. |
| L1 | `common/security/encryption.service.ts:19-23` | Falls back to a built-in encryption key. | Refuse to start without `ENCRYPTION_KEY`. |
| L2 | `photosensitivity.service.ts:82,120`, `design-extraction.controller.ts:84` | Error messages expose paths and internals. | Generic messages; log the details. |
| L3 | `mcp-server/src/resources/documentation.resource.ts:91-94` | The path check doesn't include the separator, so sibling `docs*` directories can be read. | `startsWith(base + path.sep)`. |
| L4 | `.gitignore` | `.env.*` isn't ignored. Nothing sensitive is tracked today. | Add `.env.*` and `!.env.example`. |

## Data and correctness

| ID | Where | Problem | Fix |
| --- | --- | --- | --- |
| D1 ✔ | `app.module.ts:33`; `rbac.module.ts`, `feature-flags.module.ts`, `audit.module.ts`, `design-system.module.ts` (imports the symbol, never registers it) | **Elasticsearch is never injected.** The root registration isn't global, so every `@Optional() ElasticsearchService` is `undefined`. Roles, flags, audit logs and design-system data live in about 90 in-memory `Map`s across 25 services. They're lost on restart and differ between instances. Only color-palette reaches ES. | `global: true` on the root registration, or import the module in each feature module. |
| D2 | `design-system/component-request.service.ts:61` vs `component-requests/component-requests.service.ts:29` | **Two separate component-request stores** behind two routes; requests created through one never show up in the other. | Keep one. |
| D3 ✔ | `feature-flags.service.ts:741-870, 992`; `frontend/src/services/featureFlagsService.js:13-23` | **Flags are forced on** in both the backend and the frontend. Toggling one off reports success, then it flips back. When the API is down and nothing is cached, the frontend guard does the opposite and sends users away from flagged pages. | Respect the stored value; treat fetch errors as "use the default". |
| D4 | `design-system.service.ts:2950-3200` | **Fake governance results.** The client falls back to a hardcoded "8 pass / 2 warn / 1 fail" report and made-up apps when the API fails (`Governance.vue:803, 3030`). | Show an error state. |
| D5 | `design-system.service.ts:3924-3948, ~3992, ~4046` | **Failed survey writes reported as saved.** NASA-TLX and SUS submissions return `{id:'mock-…'}` when the write fails, which is always, because of D1. | Return a 503. |
| D6 | `system-health.service.ts:50,358-380,575`; `analytics.service.ts:80,494-525`; `design-system.service.ts:4460` | **Dashboards show random numbers** presented as real metrics, different on every restart. | Return no data, or label it as demo data. |
| D7 | `rbac.service.ts:445-532` | **Revoked roles come back.** Role removal never touches the in-memory fallback, which is used whenever ES fails. | One source of truth; don't swallow write errors. |
| D8 | `rbac.service.ts:520,556`; `audit.service.ts:150-162` | **No index mappings.** `term` queries on dynamically mapped text fields never match hyphenated IDs. Latent until D1 is fixed. | Explicit keyword mappings at startup. |
| D9 | `color-palette.service.ts:77` | **Palette list problems:** at most 10 results, a 500 on a fresh install (missing index), and a 500 instead of a 404 for unknown IDs. | Add `size` or pagination; ensure the index exists; map 404s. |
| D10 | `observability/elasticsearch-exporter.ts:57-66` | **The telemetry export queue can grow without limit**, and partial bulk failures are ignored. | Cap the queue; check `bulk.errors`. |
| D11 | `backend/src/observability/opentelemetry.ts:92`; `main.ts` | **Shutdown hangs.** The SIGTERM handler never exits and shutdown hooks are never enabled, so the process only stops on SIGKILL. Instrumentation also starts too late to patch http and express. | `enableShutdownHooks()`, then exit. |
| D12 | `frontend/src/observability/opentelemetry.ts:62,113` | **Frontend telemetry never exports but still runs.** It calls `addSpanProcessor` and `addLogRecordProcessor`, which the installed SDK versions removed, while the instrumentation still patches fetch, XHR and clicks. | Pass processors to the constructor, or default OTel to off. |
| D13 | `views/WorkspaceDetail.vue:2711, 2983` | **Workspace failures are hidden or invented.** Adding a member makes up a `userId`, and a failed load shows a fake workspace owned by the current user. | Resolve users on the server; show errors. |
| D14 | `views/AdminDashboard.vue:589-608`; `views/ReviewKanban.vue:440-444` | **Empty against the real API.** The admin list filters by a mock designer name, and the Kanban fetch is commented out. | Scope on the server; implement the fetch. |
| D15 | `error-handler.ts:~50 vs ~87` | **Timeouts reported as connection errors (503)** because the connection check runs first. This is the one failing backend test. | Check for timeouts first. |
| D16 | `rbac.service.ts:243`, `feature-flags.service.ts:35` | **Startup race.** Constructors start async setup without waiting, so early requests run before it finishes. | Use `onModuleInit` and await it. |

## Frontend quality

| ID | Where | Problem |
| --- | --- | --- |
| B1 ✔ | `views/ReviewPage.vue:407`, `views/HarmonyPalette.vue:2`, `views/TimelineGenerator.vue:366/465` | **Template errors that break `vite build`.** HarmonyPalette is missing its root `</div>`; TimelineGenerator has an extra `</div>` near `<figcaption>`. |
| F1 | 41-48 files | **`http://localhost:3000` hardcoded** (about 55 places) instead of `VITE_API_BASE_URL`. Everything breaks when deployed. |
| F2 | `main.js:186, 310` | **`/admin` declared twice.** The second one is dead. |
| F3 | `composables/useFeatureFlags.js:143,180`; `services/featureFlagsService.js` | **Three flag evaluators that disagree**, plus a refresher map that is never cleared and an interval that is never stopped. |
| F7 | `ChartBuilder.vue:4769, 5049`; `MapMaker.vue:627, 999` | **Resize observers never cleaned up**, because `onBeforeUnmount` is registered after an `await`. |
| F8 | `ChartBuilder.vue:4783, 5063` | **Map-switch race**: a slow response can show the wrong map. |
| F9 | `components/Step2Harmony.vue:815`; `Sidebar.vue:116`; `review-ui/DarkModeToggle.vue:82` | **Listeners never removed.** |
| F10 | 103 files | **Dark mode is polled every 100ms** in 103 components, alongside a `MutationObserver`. Tailwind `dark:` variants make this unnecessary. |
| F11 | `main.js:18-19` | **The entry chunk includes every Vuetify component** (`import * as components`). |
| F12 | 225 `alert(` calls in 51 files; 94 `console.log` calls | **`alert()` used for user feedback**, and debug logging left in. |
| F13 | 46 elements; 18 `v-for`s | **Accessibility and rendering gaps:** clickable `div`, `span` and `tr` elements with no role or keyboard access, and `v-for`s without a `:key`. The app shell has no focus management or page titles on navigation. |
| F14 | 12 files | **`isMockMode()` silently shows mock reviews as real** whenever the health check fails. |
| F15 | `ChartBuilder` 5,434 lines, `WorkspaceDetail` 3,666, `Governance` 3,304; backend `design-system.service.ts` 6,119 | **Monolith files.** Near-duplicates: ColoredTextPalette/HarmonyPalette (70% the same), AITokenBuilder/TokenStudio (55%), PatternStatus/ComponentStatus (55%). |
| F16 | `frontend/src/style.css` | **A global Vuetify `.bg-white { … !important }` rule overrides Tailwind `dark:` variants.** The restyle guide documents the workaround. |

## Packages and tooling

| ID | Where | Problem | Fix |
| --- | --- | --- | --- |
| P1 | `mcp-server/src/logger.ts:28-31` | **Logs are written to stdout, which is the MCP JSON-RPC channel**, so clients see parse errors on startup and on every API error. (Confirmed by running it.) | `stderrLevels` for all levels. |
| P2 | `eslint-plugin-design-system/src/index.ts:257` | **The plugin can't be loaded.** `export default` compiles to `exports.default`, so ESLint finds no rules or configs. | `export = plugin`. |
| P3 | `cli/src/cli.ts:57,67` | **The cli doesn't compile** (TS7053 under strict), and `chalk@5` is ESM-only in a CommonJS build. | Type the config; pin `chalk@4`. |
| P4 | `mcp-server/src/index.ts:153`, `tools/*.ts` | **Tools crash when called without `arguments`**, and input isn't validated. | Default to `{}`; validate with zod. |
| P5 | `mcp-server/src/api-client.ts:204-226` | **POSTs are retried**, which duplicates reviews; a call can block for about 2 minutes. | Retry GETs only. |
| P6 | `breakpoint-overlay-standalone/package.json:5-7`, `loupe-tool-standalone/package.json:5-7`, `sdk/package.json:6` | **`main`, `module` and `types` point at files the build never produces.** | Point them at the real outputs. |
| P7 | `eslint-plugin-design-system/src/index.ts:84-86` | **The `component-naming` rule flags `MAX_SIZE`, `_private` and `$el`.** | Test `/^[A-Z]/` first and skip constants. |
| P8 | `vscode-design-system-extension/src/extension.ts:224` and settings | **Docs URL hardcoded to `localhost:5173`**, settings read only once, `enableSnippets` never read, and multi-character trigger characters (which VS Code ignores). | Add settings and re-register on change. |
| P9 | repo root | **No CI**, and the workspaces list only `backend` and `frontend`, which is how P2, P3 and P6 went unnoticed. | Add every package to the workspaces; add a GitHub Actions build-and-test workflow. |
| P10 | `otel-collector-config.yaml` | **The collector config isn't used by any compose service**, and its `logging` exporter has been removed from recent collector releases (not checked against a running collector). | Use `debug`; add the service. |

## Dependencies

| ID | Problem |
| --- | --- |
| S1 ✔ | `npm audit --omit=dev`: **82 vulnerabilities (3 critical, 32 high, 45 moderate, 2 low).** Critical: `jspdf` (local file inclusion), `protobufjs` (code injection), `proxy-addr` (IP spoofing). High includes `axios` (SSRF), `dompurify` (XSS), `express` and `body-parser`, `multer`, `socket.io-parser` and `engine.io`, `path-to-regexp`, `postcss`, `form-data`, `@grpc/grpc-js`, `@vue/server-renderer`, and `mout` through `@adobe/leonardo-contrast-colors`. Most fixes are minor or patch upgrades; `leonardo-contrast-colors` needs replacing or a newer release. |

## Tests

- **backend:** 3 spec files for about 33k lines. 14 of 15 tests pass; the failure is D15. One suite couldn't load in the reviewer's setup (`entities/decode`). No service that stores data has a test. Dependencies aren't installed in this checkout; the tests ran against a sibling checkout at the same commit.
- **mcp-server:** 12 suites, 60 tests, all passing; `tsc` is clean. The tests miss P1 and P4.
- **frontend, cli, sdk, eslint plugin, extension:** no tests.

## Not covered

- design-sync's response shapes (H5 is inferred from token-sync).
- A runtime check of the collector config (P10).
- The `vscode-design-system-extension`, standalone tools and sdk weren't built, because their dependencies aren't installed or cached. Those findings come from reading the code and running `tsc`.
- Frontend views were reviewed by searching across all of them and reading nine in depth, not line by line.
