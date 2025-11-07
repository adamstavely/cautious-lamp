// Example ESLint configuration
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: ['design-system'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:design-system/recommended'
  ],
  settings: {
    'design-system': {
      apiUrl: process.env.DS_API_URL || 'http://localhost:3000/api/v1',
      apiKey: process.env.DS_API_KEY || 'test-api-key-123',
      cacheRules: true,
      cacheTimeout: 300000 // 5 minutes
    }
  },
  rules: {
    // Built-in rules
    'design-system/hardcoded-design-tokens': 'error',
    'design-system/component-naming': 'warn',
    'design-system/accessibility-attributes': 'error',
    'design-system/spacing-consistency': 'warn',
    'design-system/typography-scale': 'warn'
    
    // Additional rules from API will be available automatically
  }
};
