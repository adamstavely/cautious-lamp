# ESLint plugin and VS Code extension

The repository has two editor tools. They do different jobs and can be used together.

- **`eslint-plugin-design-system`** finds problems. It's an ESLint plugin, so it works in any editor with an ESLint integration (in VS Code, the ESLint extension) and in CI. See [LINTER_INTEGRATION.md](LINTER_INTEGRATION.md).
- **`vscode-design-system-extension`** helps you write code in VS Code: autocomplete, hover, colour swatches, snippets, and warnings about hard-coded colours and spacing that equal a token, with a quick fix to replace them.

## Comparison

| | ESLint plugin | VS Code extension |
| --- | --- | --- |
| Reports problems | Yes, in any ESLint editor and in CI: five built-in rules, plus governance rules loaded from the server | Only in VS Code: hard-coded colours and spacing that equal a token (`designSystem.enableDiagnostics`) |
| Autofix | Only where a rule supports it; on `main` no rule provides a fixer yet | Quick fix: replace a value with its token |
| Autocomplete | No | Yes |
| Hover information | No | Yes |
| Colour swatches | No | Yes |
| Snippets | No | Yes |
| CI | Yes | No |

## What the VS Code extension does

From `vscode-design-system-extension/package.json` and `src/` (see its [STATUS.md](../vscode-design-system-extension/STATUS.md) for what is tested):

- **Data.** It reads `GET {designSystem.apiUrl}/tokens` and `GET {designSystem.apiUrl}/components`, sending `designSystem.apiKey` as `Authorization: Bearer <key>`. The default URL is `http://localhost:3000/api/v1`, and there is no default key. "Refresh Design System Cache" reloads the data; `designSystem.requestTimeout` sets how long to wait.
- **Autocomplete** for token names (after `tokens.`, `color.` and `spacing.`) and component names.
- **Hover** on a token reference (`tokens.color.primary`, `var(--color-primary)`) shows its value, with a swatch for colours. Hover on a component name shows its description and props.
- **Colour swatches** next to six-digit hex colours.
- **Warnings** on hard-coded hex colours and px or rem spacing that equal a token, in CSS, JavaScript, TypeScript and Vue.
- **Replace with token.** On a warning, or on a selected value with "Replace with Design Token", the value is swapped for its token: `var(--<name>)` in CSS, or a `tokens.<name>` accessor in JavaScript and TypeScript (with an import from `designSystem.tokenImportPath` when that is set).
- **Snippets**: `ds-color`, `ds-spacing` and `ds-typography` in JavaScript and TypeScript; `ds-button`, `ds-input` and `ds-card` in Vue and React. `designSystem.enableSnippets` turns them off.
- **Commands**: Insert Component, Insert Token, Open Component Documentation (opens the component's page under `designSystem.docsBaseUrl`, default `http://localhost:5174`), Replace with Design Token, Refresh Design System Cache and Show Output.

Nothing in this repository publishes the extension. Build it from `vscode-design-system-extension/` and install the `.vsix`; see its [README](../vscode-design-system-extension/README.md).

## Which to use

- To catch problems in review and CI, use the ESLint plugin.
- To find and insert tokens and components faster in VS Code, and to catch hard-coded values as you type, add the extension.

Both read the same server, so they need the same kind of API key (see [AUTH.md](AUTH.md#api-keys)).
