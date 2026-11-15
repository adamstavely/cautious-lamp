# Linter integration

`@adamstavely/eslint-plugin-design-system` (in `eslint-plugin-design-system/`) brings design system checks into ESLint, so they show up in the editor (through the VS Code ESLint extension or any ESLint integration) and in CI. It has five built-in rules that work offline, and it can also load the governance rules from the server and check the ones that apply to JavaScript source.

What isn't built: there is no Prettier plugin.

The plugin's [README](../eslint-plugin-design-system/README.md) is the reference for each rule's exact behaviour.

## Install

The plugin is released to GitHub Packages under the `@adamstavely` scope by `.github/workflows/release.yml` (an `eslint-plugin-v<version>` tag or a manual run). Nothing has been published yet; until then, build it here and install it from its folder (`npm run build --workspace eslint-plugin-design-system`, then `npm install --save-dev /path/to/cautious-lamp/eslint-plugin-design-system`).

Once published, tell npm where the scope lives in your project's `.npmrc`, with a GitHub token that has `read:packages`:

```ini
@adamstavely:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

```bash
npm install --save-dev @adamstavely/eslint-plugin-design-system
```

ESLint names a plugin published as `@scope/eslint-plugin-name` `@scope/name`, so the plugin is `@adamstavely/design-system` and its rules are `@adamstavely/design-system/<rule>`. It supports ESLint 8 (eslintrc or flat config) and ESLint 9 (flat config).

## Built-in rules

Defined in `eslint-plugin-design-system/src/rules.ts`:

| Rule | Reports | In `recommended` | Autofix |
| --- | --- | --- | --- |
| `@adamstavely/design-system/hardcoded-design-tokens` | Hardcoded colours (`#hex`, `rgb()`, `hsl()`) in strings and template literals | `error` | With `tokens` |
| `@adamstavely/design-system/accessibility-attributes` | Native JSX `<button>`, `<input>`, `<select>` and `<textarea>` with no accessible name | `error` | No |
| `@adamstavely/design-system/component-naming` | Component declarations that aren't PascalCase | `warn` | No |
| `@adamstavely/design-system/spacing-consistency` | Hardcoded px spacing values | `warn` | With `tokens` |
| `@adamstavely/design-system/typography-scale` | Hardcoded font sizes and line heights | `warn` | With `tokens` |

**Autofix.** `eslint --fix` changes code only where a rule supports it: `hardcoded-design-tokens`, `spacing-consistency` and `typography-scale`, and only when you pass your tokens as the rule's `tokens` option. A value is replaced only when exactly one token has it; with no match, two tokens sharing the value, or no `tokens` option, the rule reports and changes nothing. `replacement` sets how a token is written (default `var(--{name})`). Numbers such as `fontSize: 16` are reported but not fixed. `component-naming`, `accessibility-attributes` and rules loaded from the server have no autofix. See the plugin's [README](../eslint-plugin-design-system/README.md#autofix) for examples.

```javascript
const tokens = { 'color-primary': '#3b82f6', 'spacing-sm': '8px' };

module.exports = [
  designSystem.configs['flat/recommended'],
  {
    rules: {
      '@adamstavely/design-system/hardcoded-design-tokens': ['error', { tokens }],
      '@adamstavely/design-system/spacing-consistency': ['warn', { tokens }]
    }
  }
];
```

## Configure

The plugin exports three presets: `flat/recommended` for flat config, and `recommended` (alias `legacy-recommended`) for eslintrc. ESLint 9 has no `--plugin` command-line flag; the plugin is set up in the config file.

### Flat config (`eslint.config.js`, ESLint 9)

```javascript
const designSystem = require('@adamstavely/eslint-plugin-design-system');

module.exports = [
  designSystem.configs['flat/recommended'],
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
    rules: {
      '@adamstavely/design-system/component-naming': 'error'
    }
  }
];
```

### eslintrc (`.eslintrc.js`, ESLint 8)

```javascript
module.exports = {
  extends: ['plugin:@adamstavely/design-system/recommended'],
  parserOptions: { ecmaVersion: 2022, sourceType: 'module', ecmaFeatures: { jsx: true } },
  rules: {
    '@adamstavely/design-system/component-naming': 'error'
  }
};
```

Then run ESLint as usual:

```bash
npx eslint .
npx eslint . --max-warnings 0   # in CI, fail on warnings too
```

## Rules from the server

The plugin can also load governance rules (see [RULES_ENGINE_GUIDE.md](RULES_ENGINE_GUIDE.md)). ESLint rules run synchronously, so the rules have to be loaded before linting, by awaiting `loadRulesFromAPI()` in the config file. The plugin doesn't read ESLint `settings` and fetches nothing when it is loaded.

```javascript
// eslint.config.mjs
import designSystem from '@adamstavely/eslint-plugin-design-system';

const { loaded } = await designSystem.loadRulesFromAPI({
  apiUrl: process.env.DS_API_URL,   // e.g. http://localhost:3000/api/v1
  apiKey: process.env.DS_API_KEY,   // sent as "Authorization: Bearer <key>"
  timeout: 5000,                    // ms, default 5000
  cacheTimeout: 300000              // ms, default 5 minutes
});

export default [
  designSystem.configs['flat/recommended'],
  { rules: Object.fromEntries(loaded.map((id) => [`@adamstavely/design-system/${id}`, 'warn'])) }
];
```

- It calls `GET {apiUrl}/governance/rules/export` on the backend (`governance.controller.ts`), which returns the full rule definitions. `GET /rules/export?format=eslint` exists too, but it leaves out each rule's type and pattern, so the plugin doesn't use it.
- The route needs any valid credential. Get an API key from an administrator: keys are created with `POST /api/v1/auth/api-keys`, which needs `admin:users` (see [AUTH.md](AUTH.md#api-keys)). Keep it in an environment variable, not in the config file.
- Each rule becomes `@adamstavely/design-system/<rule-name-hyphenated>`; `loaded` lists the ids that were registered.
- Only some rule types can be checked on a source file: `regex-present` and `regex-absent` on `javascript`, `token-usage` on CSS-in-JS, `selector-attribute` with a plain tag selector (on JSX), and the `component-naming` built-in check. Every other rule is skipped and listed in `skipped`, with the reason in `warnings`.
- It never rejects. If the server is down or slow, it logs one warning and returns whatever it could load (cached rules for that URL, if any).
- You can pass definitions directly with `rules: [...]` instead of, or as well as, `apiUrl`.

## Editors

With the VS Code ESLint extension (or any editor's ESLint integration), the plugin's problems appear inline as you type. The repository's own VS Code extension is a separate tool for autocomplete, hover and snippets; it doesn't lint. See [VSCODE_EXTENSION_VS_ESLINT.md](VSCODE_EXTENSION_VS_ESLINT.md).

## Relation to governance scans

The plugin checks source files while you write them. Governance scans (`POST /api/v1/governance/scans`) check whole components, code bundles or deployed pages on the server, including the rule types the plugin can't (selector counts, axe, heading order, form labels). The same rule definitions drive both.
