# ESLint plugin status

What `@adamstavely/eslint-plugin-design-system` does today. Usage is in [README.md](./README.md).

## Source

| File | What it is |
| --- | --- |
| `src/index.ts` | The plugin: `rules`, the `recommended` / `legacy-recommended` (eslintrc) and `flat/recommended` configs, `loadRulesFromAPI` |
| `src/rules.ts` | The five built-in rules and the token autofix they share |
| `src/checks.ts` | Detection helpers (colors, spacing, typography, component names, JSX accessible names) |
| `src/token-fix.ts` | The `tokens` / `replacement` options: finds the one token with a value and writes its reference |
| `src/rule-converter.ts`, `src/api.ts` | Fetching `GET /api/v1/governance/rules/export` and turning the rule types ESLint can check into rules |

## Built-in rules

| Rule | Recommended | Autofix |
| --- | --- | --- |
| `hardcoded-design-tokens` | error | With `tokens`: a color that is exactly one token's value |
| `accessibility-attributes` | error | No |
| `component-naming` | warn | No |
| `spacing-consistency` | warn | With `tokens`: a value whose every part is exactly one token's value |
| `typography-scale` | warn | With `tokens`: a string value that is exactly one token's value |

Without the `tokens` option no rule changes code.

## API rules

- `loadRulesFromAPI(config)` must be awaited before linting (ESLint rules are synchronous). Nothing is fetched at require time, and ESLint `settings` are not read.
- Mapped rule types: `regex-absent` / `regex-present` on JavaScript, `token-usage` on CSS-in-JS, `selector-attribute` on JSX with a plain tag selector, and the `component-naming` builtin. Everything else is skipped and listed with a reason.
- API rules report only; they have no autofix.
- Cached per API URL (5 minutes by default). A failed or slow request logs one warning and keeps what loaded.

## Not included

- No processor: the earlier pass-through processor and `initializePlugin` were removed, since nothing used them and ESLint can't load rules asynchronously through a processor.
- `accessibility-attributes` understands JSX only, not Vue `<template>` markup.

## Tests

`npm test` builds, then runs the RuleTester suites (including the autofix cases), the load test, the API and converter tests, and ESLint integration tests for eslintrc and flat config.

## Releases

Published to GitHub Packages by `.github/workflows/release.yml` (`eslint-plugin-v<version>` tag or a manual run). Nothing has been published yet.
