# Performance section and analysis

Component pages show a performance section with the component's source sizes, and `/admin/performance` (`PerformanceAnalysis.vue`) shows the same analysis for every component plus performance budgets. Both read from the design-system API.

## Where the numbers come from

`POST /api/v1/performance/bundle-analysis/analyze` with `{ componentId?, includeDependencies? }` measures one component (`backend/src/design-system/bundle-analysis.service.ts`); without `componentId` it returns every component, as `GET /api/v1/performance/bundle-analysis` does. Both need a signed-in user or API key.

The sizes are measured from the component code stored in Elasticsearch (`design-system-components`), not estimated and not from a production build (no minification or tree shaking):

| Field | Meaning |
| --- | --- |
| `vueSize`, `reactSize`, `totalSize` | Raw UTF-8 bytes of the stored Vue and React source, and their sum |
| `gzippedSize`, `brotliSize` | Real gzip (level 9) and brotli (quality 11) output sizes of that source |
| `dependencies`, `dependenciesSize`, `totalWithDeps` | Dependencies listed on the component that exist in the design system, and their measured source |
| `missingDependencies` | Listed dependencies that weren't found (not measured) |
| `status` | `pass`, `warning` (raw size of 50,000 bytes or more) or `error` (100,000 or more); `thresholds` gives the limits |
| `method` | Always `measured-source` |

An unknown `componentId` returns `404`.

## Component pages

`ComponentButton.vue` and `ComponentColorPicker.vue` render the section. Each maps its route to a component id (`getComponentId()`: `/components/buttons` to `button`, `/components/color-picker` to `color-picker`, and so on) and calls the analyze route. When the call fails the section shows "Performance data unavailable". `ComponentTesting.vue` calls the same route for the component being tested.

The design system is seeded once, when its Elasticsearch indexes are empty, from `backend/src/design-system/design-system-seed.ts`. The seed includes `button`, `card`, `input`, `select`, `modal`, `color-picker`, `navigation` and `table`, so every id in the route map exists on a fresh install. After seeding, the stored documents are the source of truth: add or change components through the components API (`POST /api/v1/components`, needs `component:create`), not by editing the seed.

The "Supported browsers" list on these pages is a fixed list in the page (Chrome 90, Firefox 88, Safari 14, Edge 90); components have no browser support field.

## Performance budgets

`/admin/performance` also manages budgets: `GET /api/v1/performance/budgets` (anyone signed in), and `POST`, `PUT /performance/budgets/:id` and `DELETE /performance/budgets/:id`, which need `admin:performance_analysis`. A budget has `name`, `metric`, `threshold`, `unit`, optional `alertThreshold` and `enabled`. Budgets are stored in `design-system-performance-budgets`.

`/performance/budgets` and `/performance/bundle-analysis` redirect to `/admin/performance`. The older `BundleSizeAnalysis.vue` and `PerformanceBudgets.vue` views are not routed anywhere.

## Backend telemetry

Request traces, metrics and logs of the backend itself are a separate concern: `backend/src/observability/` sets up OpenTelemetry (on unless `OTEL_ENABLED=false`), exporting over OTLP (`OTEL_EXPORTER_OTLP_ENDPOINT`, default `http://localhost:4318`) or, with `OTEL_EXPORTER_ELASTICSEARCH=true`, straight to Elasticsearch in daily indexes `otel-trace-YYYY.MM.DD`, `otel-metric-YYYY.MM.DD` and `otel-log-YYYY.MM.DD`.
