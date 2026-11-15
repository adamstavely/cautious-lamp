# Changelog

All notable changes to the Design System VS Code Extension are documented in this file.

## [Unreleased]

### Fixed
- The extension compiles and packages from a clean checkout: `@types/vscode` matches the supported VS Code version, `@vscode/vsce` is a dev dependency, and the manifest has a `repository` and `.vscodeignore`.
- Hover finds dotted token names (`tokens.color.primary`), bracketed ones (`tokens.spacing["2xl"]`) and CSS custom properties (`var(--color-primary)`).
- The hover colour swatch is a valid image.
- Hovering a hard-coded hex colour works: the `#` is now part of the value.
- `color.` and other bare token paths complete (they matched the category, `colors`, instead of the token name).
- "Replace with token" matches spacing: px and rem values find the rem `dimension` spacing tokens.
- Open Component Documentation opens pages that exist in the app instead of `localhost:5173/components/<name>`.
- `designSystem.enableSnippets` turns snippets off.
- 401 and 404 answers are no longer retried.
- The typography token snippet names real tokens.

### Added
- Warnings for hard-coded colours and spacing that equal a token, with the replace-with-token quick fix.
- Settings: `designSystem.docsBaseUrl`, `designSystem.requestTimeout`, `designSystem.enableDiagnostics`.
- Unit tests for each feature, run in CI with the build and packaging.

### Changed
- `designSystem.apiKey` has no fallback key; without one the extension warns and sends no `Authorization` header.
- `designSystem.tokenImportPath` is empty by default (the old `@design-system/tokens` doesn't exist). Empty means quick fixes in JS/TS strings write `var(--token)`.

## [1.0.0] - 2025-11-07

### Added
- Initial version (not published): token and component completions, hover, colour decorations, snippets for Vue, React, JavaScript and TypeScript, replace-with-token, and commands to insert components and tokens, open component docs, refresh the cache and show the log.
