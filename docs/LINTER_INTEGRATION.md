# Design System Linter Integration Guide

## Overview

The Design System Linter integrates your Rules Engine with ESLint and Prettier, providing real-time feedback in your IDE/editor as developers write code. This bridges the gap between compliance scanning (which happens after code is written) and development-time enforcement (which prevents issues before they're committed).

## Implementation Status

✅ **Backend API**: Export endpoint created (`GET /api/v1/rules/export`)
✅ **ESLint Plugin Package**: Created in `eslint-plugin-design-system/`
✅ **Rule Converter**: Converts scanner code to ESLint AST visitors
✅ **Integration Guide**: This document

### Next Steps

1. **Build Plugin**: Run `npm run build` in `eslint-plugin-design-system/`
2. **Install Plugin**: `npm install ./eslint-plugin-design-system`
3. **Configure ESLint**: Add plugin to `.eslintrc.js`
4. **Test**: Run `npx eslint . --plugin design-system`

## Quick Start

```bash
# Build the plugin
cd eslint-plugin-design-system
npm install
npm run build

# Install in your project
cd ../your-project
npm install ../eslint-plugin-design-system

# Configure ESLint
# Add to .eslintrc.js (see Configuration section)
```

## Architecture

```
Rules Engine (Backend)
  ↓ Export Rules
ESLint/Prettier Plugin Generator
  ↓ Generate Plugin Config
ESLint Plugin (npm package)
  ↓ Runs in IDE
Developer sees real-time errors/warnings
```

## How It Works

### 1. Rule Export

The Rules Engine exports rules in a format that ESLint can understand:

```javascript
// Rules Engine Rule (from Governance.vue)
{
  id: 1,
  name: 'Hardcoded Design Tokens',
  category: 'design-system',
  severity: 'error',
  scannerCode: `// Scanner logic...`
}

// Converted to ESLint Rule
{
  name: 'hardcoded-design-tokens',
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent hardcoded design token values',
      category: 'Design System'
    },
    messages: {
      hardcodedToken: 'Found hardcoded value: {{value}}. Use design token {{token}} instead.'
    }
  },
  create(context) {
    // ESLint rule implementation
  }
}
```

### 2. Integration Points

#### A. Rule Synchronization

The linter plugin fetches rules from the Rules Engine API:

```javascript
// eslint-plugin-design-system/src/index.js
const fetchRules = async () => {
  const response = await fetch('http://localhost:3000/api/v1/rules/export', {
    headers: { Authorization: `Bearer ${API_KEY}` }
  });
  return response.json();
};
```

#### B. Rule Conversion

Convert Rules Engine scanner code to ESLint rules:

```javascript
function convertToESLintRule(rule) {
  return {
    name: rule.name.toLowerCase().replace(/\s+/g, '-'),
    meta: {
      type: rule.severity === 'error' ? 'problem' : 'suggestion',
      docs: {
        description: rule.description,
        category: rule.category
      }
    },
    create(context) {
      // Convert scanner code to ESLint AST traversal
      return {
        // ESLint visitor methods
      };
    }
  };
}
```

#### C. Real-time Linting

ESLint runs as developers type, showing violations immediately:

```javascript
// Example: Hardcoded color detection
create(context) {
  return {
    Literal(node) {
      const value = node.value;
      if (typeof value === 'string' && /^#[0-9a-fA-F]{6}$/i.test(value)) {
        // Check if it's a design token
        const tokens = getDesignTokens();
        const isToken = tokens.some(t => t.value === value);
        
        if (!isToken) {
          context.report({
            node,
            messageId: 'hardcodedToken',
            data: { value, token: 'color.primary' }
          });
        }
      }
    }
  };
}
```

## Implementation

### Step 1: Create ESLint Plugin Package

```bash
npm create eslint-plugin-design-system
```

### Step 2: Export Rules API Endpoint

Add to `backend/src/design-system/design-system.controller.ts`:

```typescript
@Get('rules/export')
exportRules(@Headers('authorization') authHeader?: string) {
  this.validateRequest(authHeader);
  return this.designSystemService.exportRulesForLinter();
}
```

### Step 3: Rule Converter Service

Create `backend/src/design-system/linter-export.service.ts`:

```typescript
export class LinterExportService {
  convertToESLintRule(rule: Rule): ESLintRule {
    // Convert scanner code to ESLint rule structure
  }
  
  convertToPrettierRule(rule: Rule): PrettierRule {
    // Convert formatting rules to Prettier config
  }
}
```

### Step 4: ESLint Plugin Implementation

The plugin would:
1. Fetch rules from API on initialization
2. Convert scanner code to ESLint AST visitors
3. Report violations using ESLint's reporting API
4. Support auto-fix where possible

## Benefits

1. **Real-time Feedback**: Developers see violations as they type
2. **Consistent Rules**: Same rules used in scanning and linting
3. **Prevention**: Catch issues before commit/PR
4. **Auto-fix**: Automatically fix violations where possible
5. **IDE Integration**: Works with VS Code, WebStorm, etc.

## Example Usage

### ESLint Configuration

```javascript
// .eslintrc.js
module.exports = {
  plugins: ['design-system'],
  rules: {
    'design-system/hardcoded-tokens': 'error',
    'design-system/component-naming': 'warn',
    'design-system/accessibility-attributes': 'error'
  },
  settings: {
    'design-system': {
      apiUrl: 'http://localhost:3000/api/v1',
      apiKey: process.env.DS_API_KEY
    }
  }
};
```

### Prettier Configuration

```javascript
// .prettierrc.js
module.exports = {
  plugins: ['prettier-plugin-design-system'],
  designSystem: {
    apiUrl: 'http://localhost:3000/api/v1',
    apiKey: process.env.DS_API_KEY
  }
};
```

## Rule Mapping

| Rules Engine Rule | ESLint Rule | Prettier Rule |
|------------------|-------------|---------------|
| Hardcoded Design Tokens | `hardcoded-tokens` | Format token usage |
| Component Naming | `component-naming` | Format component names |
| Spacing Consistency | `spacing-consistency` | Auto-format spacing |
| Typography Scale | `typography-scale` | Format font sizes |
| Accessibility Attributes | `accessibility-attributes` | N/A (ESLint only) |

## Auto-fix Support

Some rules can auto-fix violations:

```javascript
// Example: Replace hardcoded color with token
create(context) {
  return {
    Literal(node) {
      if (isHardcodedColor(node.value)) {
        context.report({
          node,
          message: 'Use design token',
          fix(fixer) {
            const token = findMatchingToken(node.value);
            return fixer.replaceText(node, `tokens.${token.name}`);
          }
        });
      }
    }
  };
}
```

## CLI Integration

```bash
# Lint files
npx eslint . --plugin design-system

# Fix auto-fixable issues
npx eslint . --plugin design-system --fix

# Check specific rules
npx eslint . --rule 'design-system/hardcoded-tokens: error'
```

## CI/CD Integration

```yaml
# .github/workflows/lint.yml
- name: Run Design System Linter
  run: |
    npm install -g eslint-plugin-design-system
    eslint . --plugin design-system --max-warnings 0
```

## Future Enhancements

1. **VS Code Extension**: Direct IDE integration
2. **Pre-commit Hooks**: Automatic linting before commit
3. **Rule Sync**: Auto-update ESLint config when rules change
4. **Custom Rule Builder**: Visual rule builder that generates ESLint rules
5. **Performance**: Cache rules locally, sync periodically

## Summary

The Design System Linter bridges your Rules Engine with development tools, providing:
- **Real-time enforcement** during development
- **Same rules** as compliance scanning
- **Auto-fix** capabilities
- **IDE integration** for better DX

This creates a complete compliance pipeline:
1. **Development**: ESLint/Prettier catch issues
2. **Pre-commit**: Git hooks validate
3. **CI/CD**: Automated scanning
4. **Post-deploy**: Application scanning

All using the same Rules Engine!

