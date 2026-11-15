# Code quality improvements

An earlier pass added shared types, an error helper, a cache, a job queue, pagination helpers and some tests. This is where each of those stands on main, checked against the code.

## Status

| Item | Location | Status |
| --- | --- | --- |
| Shared types | `backend/src/common/types/common.types.ts` | Exists. Used by the audit service (`ChangeValue`, `RequestBody`, `ElasticsearchQuery`, `ElasticsearchRange`) and visual regression (`WebhookPayload`, `NotificationConfig`, and a `CreateProjectDto` the service still imports, while the controller validates with `visual-regression/dto/create-project.dto.ts`). Most modules now define their own types and class-validator DTOs next to the code. |
| Removing `any` | backend | Partly done. About 140 `any` uses remain outside tests, mostly in `design-extraction/` (the Dembrandt transformer and service) and `observability/` (the Elasticsearch exporter and logger). |
| `ErrorHandler` | `backend/src/common/errors/error-handler.ts` | Exists with a unit test, but no service calls it: visual regression imports it without using it. Services throw Nest HTTP exceptions directly. "All services use `ErrorHandler.handleError()`" is not true. |
| `ConnectionStatusService` | `backend/src/common/errors/connection-status.service.ts` | Not used: no module provides it. Health is reported by the `health` and `system-health` modules instead. |
| `CacheService` | `backend/src/common/cache/cache.service.ts` | Not used: no module provides it. Caching that does run is local to the services that need it (for example the design-system service's loaded copy of components and tokens, and the 30-second API key cache). |
| `JobQueueService` | `backend/src/common/background-jobs/job-queue.service.ts` | Not used: no module provides it. |
| Pagination helpers | `backend/src/common/pagination/pagination.types.ts` | Done and used: `parsePaginationParams` and `createPaginatedResponse` (`{ data, pagination }`), for example on visual regression runs and results. Has a unit test. |
| Backend tests | `backend/src/**/*.spec.ts` (Jest, `npm test` in `backend`) | Done and much larger than the original three suites: about 80 spec files, including HTTP-level tests per module. `npm run test:e2e` points at `backend/test/jest-e2e.json`, which doesn't exist. |
| Frontend tests | `frontend/tests/*.test.js` (Vitest with jsdom, `npm test` in `frontend`) | Done: about 37 test files, most of which mount Vue components. |
| Lazy loading of long lists | frontend | Open. Several lists are paged by the API, but there is no virtual or infinite scrolling. |
| Indexing guidance | [DATABASE_INDEXING.md](DATABASE_INDEXING.md) | Rewritten to list the real Elasticsearch indexes. |
| Persistent storage | backend | Done for most data: modules store their documents in Elasticsearch (see DATABASE_INDEXING.md) rather than in memory. |

## Open

- Delete `ConnectionStatusService`, `CacheService` and `JobQueueService`, or wire them in where they are needed.
- Remove the unused `ErrorHandler` import from the visual regression service, and either use `ErrorHandler` or delete it.
- Have the visual regression service take its own `CreateProjectDto` instead of the one in `common.types.ts`.
- Reduce the remaining `any` in `design-extraction/` and `observability/`.
- Add `backend/test/jest-e2e.json` or remove the `test:e2e` script.
- Virtual scrolling for very long lists, if any page needs it.
