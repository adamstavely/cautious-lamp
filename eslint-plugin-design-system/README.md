# eslint-plugin-design-system

ESLint plugin for Design System compliance: five built-in rules that work offline, plus optional extra rules loaded from the Design System Rules Engine API.

Supports ESLint 8 (eslintrc and flat config) and ESLint 9 (flat config).

## Installation

```bash
npm install --save-dev eslint-plugin-design-system
```

## Configuration

The plugin ships two presets with the same rules:

| Config | Format | Use with |
| --- | --- | --- |
| `recommended` (alias `legacy-recommended`) | eslintrc | `.eslintrc.*`, ESLint 8 default mode |
| `flat/recommended` | flat config | `eslint.config.js`, ESLint 9 or ESLint 8.57+ flat mode |

### Flat config (`eslint.config.js`)

```javascript
const designSystem = require('eslint-plugin-design-system');

module.exports = [
  designSystem.configs['flat/recommended'],
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
    rules: {
      'design-system/component-naming': 'error'
    }
  }
];
```

### eslintrc (`.eslintrc.js`)

```javascript
module.exports = {
  extends: ['plugin:design-system/recommended'],
  parserOptions: { ecmaVersion: 2022, sourceType: 'module', ecmaFeatures: { jsx: true } },
  rules: {
    'design-system/component-naming': 'error'
  }
};
```

`recommended` sets `hardcoded-design-tokens` and `accessibility-attributes` to `error`, the other three to `warn`.

## Built-in Rules

| Rule | Reports |
| --- | --- |
| `hardcoded-design-tokens` | Hardcoded colors in strings and template literals: `#rgb`, `#rrggbb`, `#rrggbbaa`, colors inside longer values (`'1px solid #fff'`), `rgb()/rgba()/hsl()/hsla()`. Object keys and import sources are ignored. |
| `spacing-consistency` | px spacing values (`'16px'`, `'-4px'`, `'8px 16px'`). Zero values are allowed, and values for non-spacing properties (`width`, `height`, `border*`, `*radius`, `font*`, ...) are left alone. |
| `typography-scale` | Hardcoded `px/rem/em/pt` values for `fontSize`, `lineHeight`, `letterSpacing`, `wordSpacing` (object properties, `style.x = ...`, JSX props, or variables named like them), and numeric `fontSize: 16`. |
| `component-naming` | Component declarations (variables, functions, classes whose name starts with an uppercase letter) that aren't PascalCase, e.g. `My_Component`. `_private`, `$el`, `camelCase` and ALL_CAPS constants (`MAX_SIZE`) are not components. References and imports aren't checked; only declarations. |
| `accessibility-attributes` | Native JSX `<button>`, `<input>`, `<select>`, `<textarea>` with no accessible name. Accepted: non-empty `aria-label`, `aria-labelledby` or `title`; button text or child content; an `id` (for `<label htmlFor>`); a wrapping `<label>`; `type="hidden"/"submit"/"reset"`. Components (`<Button>`), `<ui.button>` and elements with `{...spread}` props are skipped. `placeholder` is not a label. |

None of the rules are auto-fixable.

Vue: the rules check `<script>` code when using `vue-eslint-parser`; `accessibility-attributes` only understands JSX, not Vue `<template>` markup.

## API rules

ESLint rules run synchronously, so rules from the Rules Engine have to be loaded **before** linting. Nothing is fetched when the plugin is required, and ESLint `settings` are not read.

```javascript
// eslint.config.mjs
import designSystem from 'eslint-plugin-design-system';

const { loaded } = await designSystem.loadRulesFromAPI({
  apiUrl: process.env.DS_API_URL,   // e.g. http://localhost:3000/api/v1
  apiKey: process.env.DS_API_KEY,   // sent as "Authorization: Bearer <key>"
  timeout: 5000,                    // ms, default 5000
  cacheTimeout: 300000              // ms, default 5 minutes
});

export default [
  designSystem.configs['flat/recommended'],
  { rules: Object.fromEntries(loaded.map(id => [`design-system/${id}`, 'warn'])) }
];
```

- Fetches `GET {apiUrl}/rules/export?format=eslint` and expects `{ rules: [...] }`.
- Rule ids are the rule name lowercased and hyphenated (`"No Brand Colors"` becomes `design-system/no-brand-colors`). Disabled rules, rules whose name sanitizes to nothing, and rules that would replace a built-in rule are skipped and listed in `skipped`.
- It never rejects: if the API is down, slow (times out) or returns bad data, it logs one warning and resolves with whatever loaded (cached rules for that URL, if any).
- `config.rules` registers rule definitions directly without a request.

## Development

```bash
npm run build   # tsc -> lib/
npm test        # builds, then runs jest (RuleTester suites, load test, ESLint integration)
```
