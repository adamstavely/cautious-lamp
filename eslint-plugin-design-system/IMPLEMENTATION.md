# ESLint plugin implementation notes

How the plugin is put together. For usage see [README.md](./README.md); for what is and isn't supported see [STATUS.md](./STATUS.md).

## Layout

```
eslint-plugin-design-system/
├── src/
│   ├── index.ts           # The plugin object (CommonJS `export =`) and its configs
│   ├── rules.ts           # Built-in rules
│   ├── checks.ts          # Parser-agnostic detection helpers
│   ├── token-fix.ts       # Token autofix: options schema, value matching, safe replacement
│   ├── rule-converter.ts  # Governance rule definitions -> ESLint rules
│   ├── api.ts             # loadRulesFromAPI: fetch, convert, register, cache
│   └── types.ts
├── tests/                 # RuleTester, load, API and integration suites
└── .eslintrc.example.js
```

## Plugin name

The package is `@adamstavely/eslint-plugin-design-system`, so ESLint resolves `plugin:@adamstavely/design-system/recommended` and rule ids are `@adamstavely/design-system/<rule>`. The flat config registers the plugin under the same key.

## Autofix

The three token rules declare `fixable: 'code'` and accept `{ tokens, replacement }`. A fix is offered only when:

1. the `tokens` option is set,
2. exactly one token has the value (`normalizeValue` compares colors ignoring case and short hex, lengths numerically),
3. the value can be found verbatim in the source (not written with escapes), and
4. the reference can't break out of its string or template (`safeInside`).

Colors are replaced where they sit inside a longer string or template; spacing and typography replace the whole string, and only when every part matches.

## API rules

Rules are fetched from `GET {apiUrl}/governance/rules/export` and mapped by their declared `type` and `target` (see README). Rules that can't be checked in ESLint are skipped with a reason rather than approximated.
