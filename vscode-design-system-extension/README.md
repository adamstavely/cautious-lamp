# VS Code Design System Extension

Design tokens and components from the Design System API in VS Code: completions, hover details, hard-coded value warnings with a quick fix, snippets and colour previews.

## Features

### Completions
- **Token paths**: after `tokens.` (or `tokens.color.`) you get every token under that path. A bare `color.`, `spacing.` or any other first segment of a token name works too.
- Names that aren't JS identifiers are written as accessors, so `spacing.2xl` completes to `tokens.spacing["2xl"]`.
- **Components**: after `components.` or `<` plus a capital letter in JSX/Vue templates.

### Hover
- **Tokens**: hover anywhere in `tokens.color.primary`, `tokens.color.primary["500"]` or `var(--color-primary)` for the value, what an alias resolves to, category, type, description and a colour swatch.
- **Components**: props, types, defaults and description.
- **Hard-coded colours**: hover a hex colour for a swatch and the token that has the same value, if there is one.

### Hard-coded value warnings
Colours (`#4f46e5`, `#FFF`) and spacing lengths (`16px`, `1rem` in `margin`, `padding`, `gap`, `inset` and `top`/`right`/`bottom`/`left`) that equal a token's value get a warning in the Problems panel. Spacing tokens are stored in rem, so `16px` matches the `1rem` token. Values in comments and bare code aren't flagged.

### Replace with token
The quick fix on a warning (or "Replace with Design Token" on a selected value) rewrites it for the file type:
- CSS, SCSS, Less, `<style>` blocks and markup: `var(--color-primary)`.
- A whole JS/TS string literal: `tokens.color.primary` (with `import { tokens } from '<tokenImportPath>'` added when needed) if `designSystem.tokenImportPath` is set; otherwise `'var(--color-primary)'` inside the string.

### Snippets
Components (`ds-button`, `ds-input`, `ds-card`) in Vue and React files; tokens (`ds-color`, `ds-spacing`, `ds-typography`) in JavaScript and TypeScript. `designSystem.enableSnippets` turns them off without a reload.

### Commands
- `Design System: Insert Component`: inserts a component's code from the API.
- `Design System: Insert Token`: inserts a token accessor.
- `Design System: Open Component Documentation`: opens the component's page in the app (`/components/buttons`, `/components/color-picker`), or the component library (`/components`) for components without their own page.
- `Design System: Replace with Design Token`
- `Design System: Refresh Design System Cache`
- `Design System: Show Output`: the extension's log.

### Colour decorations
Inline swatches and a colour picker for six-digit hex colours.

## Configuration

| Setting | Default | |
| --- | --- | --- |
| `designSystem.apiUrl` | `http://localhost:3000/api/v1` | The backend's API base URL |
| `designSystem.apiKey` | empty | Sent as `Authorization: Bearer <key>`. Every API route needs one; see [API authentication](../docs/API_AUTHENTICATION.md) |
| `designSystem.requestTimeout` | `10000` | Milliseconds. Timeouts, dropped connections and 5xx answers are retried twice; 4xx answers (a bad key, a missing route) fail at once |
| `designSystem.docsBaseUrl` | `http://localhost:5174` | The Design System app, for Open Component Documentation |
| `designSystem.tokenImportPath` | empty | Module that exports `tokens`, for quick fixes in JS/TS strings (see above) |
| `designSystem.enableAutocomplete` | `true` | |
| `designSystem.enableHover` | `true` | |
| `designSystem.enableColorPreview` | `true` | |
| `designSystem.enableDiagnostics` | `true` | Hard-coded value warnings |
| `designSystem.enableSnippets` | `true` | |

Changing the API URL, key or timeout applies at once. The `enable*` switches for completions, hover, colour previews and warnings apply after a window reload.

## Build and install

```bash
cd vscode-design-system-extension
npm ci
npm run compile
npm test
npm run package   # writes design-system-extension.vsix
```

Install the `.vsix` from VS Code's Extensions view: "..." → "Install from VSIX...". CI builds the same `.vsix` on every pull request and keeps it as the `design-system-extension` artifact.

## Troubleshooting

Run `Design System: Show Output` first: every API call and error is logged there.

- **Nothing completes or hovers**: check `designSystem.apiKey` is set (the log says "Unauthorized" without one) and the backend is running at `designSystem.apiUrl`.
- **Stale tokens**: data is cached for 5 minutes. Run `Design System: Refresh Design System Cache`. If the API is down, the last data loaded is kept.

## See also

- [Status](./STATUS.md): what's tested and what isn't
- [ESLint plugin](../eslint-plugin-design-system/README.md)
- [Linter integration guide](../docs/LINTER_INTEGRATION.md)
- [Design System API controller](../backend/src/design-system/design-system.controller.ts)

## License

MIT: see [LICENSE](./LICENSE).
