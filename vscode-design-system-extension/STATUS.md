# VS Code Design System Extension: status

Version 1.0.0 is not published to the Marketplace. Build it from source and install the `.vsix` (see the [README](./README.md)).

## Verified

CI (`vscode-extension` job) runs on every pull request, from a clean checkout:

- `npm ci`, `npm run compile` and `npm run package`, which produces `design-system-extension.vsix` (kept as a build artifact).
- `npm test`: unit tests (Node's test runner) for the logic behind each feature:
  - Hover reads dotted and bracketed token names whole (`tokens.color.primary`, `tokens.spacing["2xl"]`, `var(--color-primary)`), resolves aliases, and shows a swatch that is a valid markdown image.
  - Hard-coded colours are found with their `#`, and matched to tokens in any case or short form.
  - Completions after `color.`, `spacing.` and `tokens.<path>.` match on token names, and write accessors that are valid JS.
  - Spacing in px or rem matches the rem spacing tokens; font sizes aren't mistaken for spacing.
  - Hard-coded value warnings: what is flagged, in CSS, JS/TS and Vue, and what isn't (comments, bare code, non-spacing properties).
  - Replace-with-token edits for CSS, JS/TS, JSX, Vue and template literals, with and without `tokenImportPath`.
  - The API client: 4xx answers aren't retried, timeouts and 5xx are retried twice, the timeout setting is used, and no `Authorization` header is sent without a key.
  - Open Component Documentation URLs, snippet files, and that snippets follow `enableSnippets`.

## Not verified

- No integration tests run the extension inside VS Code (`@vscode/test-electron`). The providers and commands that wire the tested logic to the editor are checked by the compiler only.
- It has not been tried against a deployed backend, only against the API's response shapes in `backend/src/design-system`.

## Known limits

- Colour decorations cover six-digit hex colours only.
- Hard-coded value warnings cover hex colours and spacing lengths; other token types (font sizes, shadows) aren't flagged.
- The app has a page for only a few components, so Open Component Documentation usually opens the component library.
- The `enable*` switches other than `enableSnippets` apply after a window reload.
