# Performance data fix (historical)

This was a note about getting the component performance section working: the `color-picker` component was missing from the backend's hard-coded component list, so its page showed "Performance data unavailable".

That no longer applies. Components now live in Elasticsearch, seeded on first start from `backend/src/design-system/design-system-seed.ts`, and the seed includes `color-picker`, `navigation` and `table` along with `button`, `card`, `input`, `select` and `modal`. Sizes are measured from the stored source, including gzip and brotli.

For how the section and `POST /api/v1/performance/bundle-analysis/analyze` work today, see [PERFORMANCE_SECTION_SETUP.md](PERFORMANCE_SECTION_SETUP.md).
