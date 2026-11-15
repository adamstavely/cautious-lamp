# Elasticsearch indexes

Elasticsearch is the backend's only database. There is no PostgreSQL or other SQL store (the backend has no `pg`, TypeORM, Prisma or similar dependency). The connection is set with `ELASTICSEARCH_NODE` (default `http://localhost:9200`) and optional `ELASTICSEARCH_USERNAME` / `ELASTICSEARCH_PASSWORD`.

## How indexes are created

- **Index template.** On start, `EsIndexService` (`backend/src/common/elasticsearch/es-index.service.ts`) installs the template `cautious-lamp-defaults` for `design-system-*`, `color-palettes`, `nasa-tlx`, `sus-scores`, `heuristic-evaluations` and `reviews*`. It maps every dynamically added string as `keyword` (up to 1,024 characters) with a `.text` subfield for full-text search, so `term` lookups on ids and emails work. If Elasticsearch is down the app still starts, and the template is installed on the next write.
- **Document stores.** Most modules keep their documents through `EsDocumentStore` (`backend/src/reviews/document-store.ts`) or `EsQueryableStore` (`backend/src/workspaces/queryable-store.ts`). The store creates its index on first write with `dynamic: false` and the module's explicit properties (the `*_PROPERTIES` constants next to each index name). Only those fields are indexed and can be filtered or sorted on; other fields are kept in `_source` but aren't searchable. To query a new field, add it to the module's properties (and to the mapping of an existing index).
- Writes use `refresh: 'wait_for'` and compare-and-swap (`seq_no`/`primary_term`) where documents are changed in place. When Elasticsearch can't be reached, writes answer `503`.

## Indexes

Index names are constants in the files listed; grep for the name to find the code.

| Index | What it holds | Defined in |
| --- | --- | --- |
| `design-system-users` | User accounts | `auth/user.types.ts` |
| `design-system-api-keys` | API keys (SHA-256 hash and metadata) | `common/security/key-management.service.ts` |
| `design-system-rbac-roles`, `design-system-rbac-user-roles` | Roles and role assignments | `rbac/rbac.store.ts` |
| `design-system-workspaces`, `design-system-workspace-resources` | Workspaces and their resources | `workspaces/workspace.types.ts` |
| `design-system-components`, `design-system-tokens` | Components and tokens (seeded once when empty) | `design-system/design-system-stores.ts` |
| `design-system-roadmap`, `design-system-banners`, `design-system-performance-budgets`, `design-system-issues`, `design-system-meta` | Roadmap items, banners, performance budgets, reported component issues, design-system bookkeeping | `design-system/design-system-stores.ts` |
| `design-system-component-requests`, `design-system-component-request-comments` | Component requests (with votes and status history) and their comments | `component-requests/component-request.types.ts` |
| `design-system-component-usage` | Component usage recorded by governance application scans | `analytics/component-usage.types.ts` |
| `design-system-patterns`, `design-system-patterns-meta` | Patterns library | `patterns-library/patterns-library.service.ts` |
| `design-system-contribution-guidelines`, `design-system-contribution-templates`, `design-system-contribution-checks`, `design-system-contribution-meta` | Contribution process: guidelines, templates, checks, seed marker | `contribution-workflow/contribution-workflow.service.ts` |
| `design-system-governance-rules`, `design-system-governance-scans`, `design-system-governance-meta` | Governance rules and scans | `governance/governance-stores.ts` |
| `design-system-applications`, `design-system-application-names` | Applications, and name claims that keep names unique | `applications/application.types.ts` |
| `design-system-brands` | Brands (multi-brand theming) | `brands/brands.types.ts` |
| `design-system-feature-flags-flags` | Feature flags | `feature-flags/feature-flags.service.ts` |
| `design-system-notifications`, `design-system-notification-settings`, `design-system-changelog` | In-app notifications, people's subscriptions and delivery preferences, the change log | `notifications/notification.types.ts` |
| `design-system-delivery-attempts` | Each email, Slack, Teams and webhook delivery with its tries | `delivery/delivery.types.ts` |
| `design-system-token-sync-connections`, `design-system-design-sync-connections`, `design-system-sync-runs` | Figma and Penpot token and design sync connections, and sync runs | `token-sync/`, `design-sync/`, `design-tools/sync-runs.ts` |
| `design-system-visual-regression-projects`, `design-system-visual-regression-runs` | Visual regression projects (with baselines, shares and notification channels) and runs (with results) | `visual-regression/visual-regression.types.ts` |
| `design-system-session-replay-projects` | Session replay projects | `session-replay/session-replay.service.ts` |
| `design-system-a11y-reports`, `design-system-a11y-schedules`, `design-system-a11y-slas` | Accessibility reports, scan schedules and SLAs | `accessibility-reports/accessibility-reports.service.ts` |
| `design-system-photosensitivity` | Photosensitivity analysis summaries | `photosensitivity/photosensitivity.service.ts` |
| `design-system-health-snapshots` | Daily system-health snapshots | `system-health/health-snapshots.ts` |
| `design-system-audit-YYYY.MM.DD` | Audit log, one index per day (see below) | `audit/audit.service.ts` |
| `reviews`, `reviews-teams` | Design reviews and review teams | `reviews/document-store.ts` |
| `color-palettes` | Saved color palettes | `color-palette/color-palette.service.ts` |
| `nasa-tlx`, `sus-scores`, `heuristic-evaluations` | Research survey responses | `design-system/design-system.service.ts` |
| `otel-trace-*`, `otel-metric-*`, `otel-log-*` | Backend telemetry, only with `OTEL_EXPORTER_ELASTICSEARCH=true` | `observability/elasticsearch-exporter.ts` |

Paths are under `backend/src/`. Global search (`search/`) has no index of its own: it searches the loaded components and the caller's workspaces in memory.

## Audit log

The global `AuditInterceptor` records every API request, successful or not, through `AuditService`. Each day's entries go to `design-system-audit-YYYY.MM.DD` (for example `design-system-audit-2026.11.15`); reads, exports and stats (`/api/v1/audit/logs`, `/export`, `/stats`, needing `admin:audit`) query `design-system-audit-*`. These indexes are written with the plain client, not a document store, so they get the default template (strings as `keyword` with `.text`) rather than an explicit mapping. Fields include `@timestamp`, `userId`, `userName`, `action`, `resourceType`, `resourceId`, `method`, `endpoint`, `ipAddress`, `responseStatus`, `success`, `errorMessage` and `riskScore`; request bodies are sanitized first. If writing an entry fails, the error is logged and the request carries on.

Nothing deletes old audit indexes. Set an index lifecycle policy (or delete old daily indexes) in Elasticsearch if they must not grow forever.

## Querying

- Filter on `keyword` fields with `term`/`terms`, and use the `.text` subfield for full-text matches on template-mapped strings.
- Only properties listed in a store's mapping are searchable in `dynamic: false` indexes.
- Use `range` on `date` fields (`createdAt`, `updatedAt`, `startedAt` and the like where mapped).
