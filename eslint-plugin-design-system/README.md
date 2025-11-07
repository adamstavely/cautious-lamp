# eslint-plugin-design-system

ESLint plugin that integrates with your Design System Rules Engine to provide real-time linting based on your compliance rules.

## Installation

```bash
npm install --save-dev eslint-plugin-design-system
```

## Configuration

### Basic Setup

Add to your `.eslintrc.js`:

```javascript
module.exports = {
  plugins: ['design-system'],
  extends: ['plugin:design-system/recommended'],
  settings: {
    'design-system': {
      apiUrl: 'http://localhost:3000/api/v1',
      apiKey: process.env.DS_API_KEY || 'test-api-key-123',
      cacheRules: true,
      cacheTimeout: 300000 // 5 minutes
    }
  },
  rules: {
    // Built-in rules work immediately
    'design-system/hardcoded-design-tokens': 'error',
    'design-system/component-naming': 'warn',
    'design-system/accessibility-attributes': 'error',
    'design-system/spacing-consistency': 'warn',
    'design-system/typography-scale': 'warn'
    
    // Additional rules loaded from API will be available automatically
  }
};
```

## Built-in Rules

The plugin includes these rules that work without API connection:

1. **`hardcoded-design-tokens`** - Prevents hardcoded colors, spacing, typography
2. **`component-naming`** - Enforces PascalCase component naming
3. **`accessibility-attributes`** - Requires ARIA attributes on interactive elements
4. **`spacing-consistency`** - Ensures consistent spacing usage
5. **`typography-scale`** - Validates typography scale usage

## API Integration

When `apiUrl` is configured, the plugin automatically fetches additional rules from your Rules Engine:

- Rules are cached for performance (default: 5 minutes)
- Rules sync with your Governance UI
- Same scanner logic used in compliance scanning

## Usage

```bash
# Lint files
npx eslint . --plugin design-system

# Fix auto-fixable issues
npx eslint . --plugin design-system --fix

# Check specific rules
npx eslint . --rule 'design-system/hardcoded-design-tokens: error'
```

## VS Code Integration

Install the ESLint extension for VS Code:

1. Install `dbaeumer.vscode-eslint` extension
2. Configure ESLint as shown above
3. Rules will work automatically in VS Code

## Example

**Before (violation):**
```javascript
const color = '#3b82f6'; // ❌ Hardcoded color
const spacing = '16px';  // ❌ Hardcoded spacing
```

**After (fixed):**
```javascript
const color = tokens.color.primary; // ✅ Design token
const spacing = tokens.spacing.md;   // ✅ Design token
```

## How It Works

1. **Built-in Rules**: Work immediately without API connection
2. **API Rules**: Fetched from Rules Engine when `apiUrl` is configured
3. **Rule Conversion**: Scanner code converted to ESLint AST visitors
4. **Real-time Linting**: Works in IDE and CLI

## See Also

- [Linter Integration Guide](../docs/LINTER_INTEGRATION.md)
- [Rules Engine Guide](../docs/RULES_ENGINE_GUIDE.md)
