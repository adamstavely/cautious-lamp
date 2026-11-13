// Example eslintrc configuration (ESLint 8). For flat config (eslint.config.js,
// ESLint 9) use `require('eslint-plugin-design-system').configs['flat/recommended']`.
// API rules are not configured here; see README "API rules".
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:design-system/recommended'
  ],
  rules: {
    // Override severities from the recommended preset as needed.
    'design-system/component-naming': 'error'
  }
};
