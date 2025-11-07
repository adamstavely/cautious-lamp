# Rules Engine Guide

## Table of Contents
1. [Overview](#overview)
2. [Rule Structure](#rule-structure)
3. [Creating Rules in the Frontend](#creating-rules-in-the-frontend)
4. [Writing Scanner Code](#writing-scanner-code)
5. [Backend Scanner Implementation](#backend-scanner-implementation)
6. [Testing Rules](#testing-rules)
7. [Best Practices](#best-practices)
8. [Examples](#examples)
9. [Troubleshooting](#troubleshooting)

---

## Overview

The Rules Engine is a flexible system for scanning applications and design systems for compliance with design system standards, UX/HCD best practices, and accessibility requirements. Rules can be created and customized through the UI, with scanner logic written in JavaScript.

### Key Concepts

- **Rules**: Define what to check (e.g., "Form Label Requirements", "Color Contrast WCAG AA")
- **Scanners**: JavaScript functions that analyze code and return compliance checks
- **Context**: The data available to scanners (components, tokens, HTML, CSS, JavaScript)
- **Compliance Checks**: Results returned by scanners (pass, warning, error)

### Architecture

```
Frontend (Governance.vue)
  ↓ Rules Configuration
  ↓ Scanner Code (JavaScript)
Backend (DesignSystemService)
  ↓ Execute Scanner Code
  ↓ ApplicationScannerService
  ↓ Return Compliance Checks
```

---

## Rule Structure

Each rule has the following structure:

```javascript
{
  id: number,                    // Unique identifier
  name: string,                  // Display name (e.g., "Form Label Requirements")
  description: string,           // What the rule checks
  enabled: boolean,              // Whether rule is active
  severity: 'error' | 'warning' | 'info',  // Severity level
  category: 'design-system' | 'ux-hcd' | 'accessibility',  // Rule category
  scannerCode: string            // JavaScript code that performs the scan
}
```

### Severity Levels

- **error**: Critical issues that must be fixed (e.g., missing ARIA labels, accessibility violations)
- **warning**: Issues that should be addressed (e.g., non-standard spacing, deprecated patterns)
- **info**: Suggestions for improvement (e.g., empty state handling)

### Categories

- **design-system**: Rules for design system compliance (tokens, components, versions)
- **ux-hcd**: Rules for UX and Human-Centered Design best practices
- **accessibility**: Rules for accessibility and WCAG compliance

---

## Creating Rules in the Frontend

### Step 1: Add Rule to Rules Array

In `frontend/src/views/Governance.vue`, add your rule to the `rules` ref array:

```javascript
const rules = ref([
  // ... existing rules ...
  {
    id: 17,  // Next available ID
    name: 'My New Rule',
    description: 'Description of what this rule checks',
    enabled: true,
    severity: 'warning',
    category: 'design-system',  // or 'ux-hcd' or 'accessibility'
    scannerCode: `// Scanner code here (see Writing Scanner Code section)`
  }
]);
```

### Step 2: Write Scanner Code

The `scannerCode` property contains JavaScript that will be executed to perform the scan. See the [Writing Scanner Code](#writing-scanner-code) section for details.

### Step 3: Test the Rule

Use the "Test" button in the Rule Configuration panel to validate your scanner code before saving.

---

## Writing Scanner Code

Scanner code is JavaScript that receives a `context` object and returns an array of `ComplianceCheck` objects.

### Context Object

The context object contains the data available for scanning:

#### For Design System Scanning (`scope: 'design-system'`)

```javascript
context = {
  components: Component[],    // Array of design system components
  tokens: Token[]              // Array of design tokens
}
```

#### For Application Scanning (`scope: 'applications'`)

```javascript
context = {
  html: string,                // HTML code from application
  css: string,                 // CSS code from application
  javascript: string,          // JavaScript code from application
  components: Component[],     // Components used in application
  tokens: Token[],             // Design tokens available
  applicationName: string,     // Name of the application being scanned
  file: string                 // File path (if scanning specific file)
}
```

### Component Structure

```javascript
Component = {
  id: string,
  name: string,
  code: {
    vue: string,    // Vue component code
    react: string   // React component code
  },
  accessibility: {
    wcag: string   // WCAG compliance level (e.g., 'AA')
  }
}
```

### Token Structure

```javascript
Token = {
  name: string,        // Token name (e.g., 'color.primary')
  value: string,       // Token value (e.g., '#3b82f6')
  category: string,    // Token category (e.g., 'colors', 'spacing')
  type: string         // Token type (e.g., 'color', 'dimension', 'fontSize')
}
```

### ComplianceCheck Structure

```javascript
ComplianceCheck = {
  id: string,                    // Unique check ID
  rule: string,                  // Rule name
  status: 'pass' | 'warning' | 'error',
  message: string,               // Human-readable message
  component?: string,            // Component name (if applicable)
  application?: string,          // Application name (if applicable)
  file?: string,                 // File path (if applicable)
  line?: number,                 // Line number (if applicable)
  element?: string,              // HTML element snippet (if applicable)
  impact?: 'minor' | 'moderate' | 'serious' | 'critical'  // Impact level
}
```

### Scanner Code Template

```javascript
// Scanner function template
const checks = [];
const components = context.components || [];
const tokens = context.tokens || [];
const html = context.html || '';
const css = context.css || '';
const javascript = context.javascript || '';

// Your scanning logic here
// Example: Check for something
components.forEach(component => {
  const code = component.code?.vue || component.code?.react || '';
  
  // Perform check
  if (/* condition */) {
    checks.push({
      id: `check-${component.id}`,
      rule: 'My New Rule',
      status: 'warning',
      message: 'Issue found in component',
      component: component.name
    });
  }
});

// Return array of checks
return checks;
```

### Common Patterns

#### Pattern 1: Check Component Code

```javascript
components.forEach(component => {
  const code = component.code?.vue || component.code?.react || '';
  
  // Use regex to find patterns
  const pattern = /some-pattern/g;
  const matches = [...code.matchAll(pattern)];
  
  matches.forEach(match => {
    checks.push({
      id: `check-${component.id}-${match.index}`,
      rule: 'My Rule',
      status: 'warning',
      message: `Found issue: ${match[0]}`,
      component: component.name
    });
  });
});
```

#### Pattern 2: Check HTML Content

```javascript
const html = context.html || '';

// Find elements
const elementPattern = /<input[^>]*>/gi;
const elements = [...html.matchAll(elementPattern)];

elements.forEach((match, index) => {
  const element = match[0];
  
  // Check attributes
  if (!/aria-label/i.test(element)) {
    checks.push({
      id: `check-${index}`,
      rule: 'My Rule',
      status: 'error',
      message: 'Input missing aria-label',
      file: context.file,
      element: element.substring(0, 50)
    });
  }
});
```

#### Pattern 3: Check Against Design Tokens

```javascript
const tokens = context.tokens || [];
const colorTokens = tokens.filter(t => t.category === 'colors');
const tokenValues = colorTokens.map(t => t.value);

// Check CSS for hardcoded values
const css = context.css || '';
const colorPattern = /#[0-9a-fA-F]{6}/g;
const colorMatches = [...css.matchAll(colorPattern)];

colorMatches.forEach(match => {
  const colorValue = match[0];
  const isToken = tokenValues.some(tv => tv.includes(colorValue));
  
  if (!isToken) {
    checks.push({
      id: `hardcoded-color-${match.index}`,
      rule: 'My Rule',
      status: 'error',
      message: `Found hardcoded color: ${colorValue}. Use design tokens.`,
      file: context.file,
      line: getLineNumber(css, match.index)
    });
  }
});

// Helper function to get line number
function getLineNumber(content, index) {
  return content.substring(0, index).split('\n').length;
}
```

#### Pattern 4: Return Pass Status

If no issues are found, return a pass check:

```javascript
if (checks.length === 0) {
  checks.push({
    id: 'overall-pass',
    rule: 'My Rule',
    status: 'pass',
    message: 'All checks passed'
  });
}

return checks;
```

---

## Backend Scanner Implementation

For complex rules that require DOM parsing or advanced analysis, you can implement backend scanner methods in `ApplicationScannerService`.

### Step 1: Add Method to ApplicationScannerService

In `backend/src/design-system/application-scanner.service.ts`:

```typescript
scanMyNewRule(context: ApplicationScanContext): ComplianceCheck[] {
  const checks: ComplianceCheck[] = [];
  const html = context.html || '';
  
  // Your scanning logic using JSDOM if needed
  try {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Use DOM API for complex checks
    const elements = document.querySelectorAll('some-selector');
    elements.forEach((element, index) => {
      // Perform check
      checks.push({
        id: `my-rule-${index}`,
        rule: 'My New Rule',
        status: 'warning',
        message: 'Issue found',
        application: context.applicationName,
        file: context.file,
        element: element.outerHTML.substring(0, 100)
      });
    });
  } catch (error) {
    // Handle errors
  }
  
  return checks;
}
```

### Step 2: Add to scanApplicationCodebase

In `backend/src/design-system/design-system.service.ts`, add your method to the switch statement:

```typescript
case 'My New Rule':
  allChecks.push(...this.applicationScanner.scanMyNewRule(scanContext));
  break;
```

### Step 3: Use in Scanner Code

In your frontend rule's `scannerCode`, you can call the backend method by name, or implement the logic directly in JavaScript:

```javascript
// Option 1: Use backend method (if implemented)
// The backend will automatically call it if rule name matches

// Option 2: Implement directly in scanner code
const checks = [];
// ... your logic ...
return checks;
```

---

## Testing Rules

### Using the Test Button

1. Select a rule in the Rules Engine panel
2. Edit the scanner code in the "Scanner Logic" textarea
3. Click the "Test" button
4. Review the test result message

The test button executes your scanner code with mock data and validates:
- Syntax correctness
- Return value format (must be an array)
- Check object structure

### Test Template

The test uses this mock context:

```javascript
const mockContext = {
  components: [
    {
      id: 'test-1',
      name: 'TestComponent',
      code: { vue: '<template><button>Click</button></template>' }
    }
  ],
  tokens: [
    { name: 'color.primary', value: '#3b82f6', category: 'colors', type: 'color' }
  ],
  html: '<div><input type="text" /></div>',
  css: '.test { color: #000; }',
  javascript: 'const test = "example";',
  applicationName: 'Test App',
  file: 'test.vue'
};
```

### Manual Testing

1. Create a test application or component
2. Run a compliance scan
3. Verify the rule detects expected issues
4. Fix issues and verify they're no longer reported

---

## Best Practices

### 1. Clear Rule Names and Descriptions

```javascript
// Good
{
  name: 'Form Label Requirements',
  description: 'All form inputs must have associated labels for clarity and accessibility'
}

// Bad
{
  name: 'Check Forms',
  description: 'Forms should be good'
}
```

### 2. Specific Error Messages

```javascript
// Good
message: `Component "${component.name}" uses non-standard spacing value: ${fullValue}. Use design tokens instead.`

// Bad
message: 'Spacing issue found'
```

### 3. Include Context in Checks

```javascript
checks.push({
  id: `check-${component.id}-${match.index}`,
  rule: 'My Rule',
  status: 'warning',
  message: 'Issue description',
  component: component.name,      // Include component name
  file: context.file,             // Include file if available
  line: getLineNumber(code, match.index),  // Include line number
  element: match[0].substring(0, 50)  // Include element snippet
});
```

### 4. Handle Edge Cases

```javascript
// Always check for empty/null values
const html = context.html || '';
const components = context.components || [];
const tokens = context.tokens || [];

// Validate before processing
if (!html || html.length === 0) {
  return checks;  // Return empty array if no data
}
```

### 5. Use Appropriate Severity Levels

- **error**: Must be fixed (accessibility violations, security issues)
- **warning**: Should be fixed (non-standard patterns, deprecated usage)
- **info**: Nice to have (suggestions, optimizations)

### 6. Efficient Regex Patterns

```javascript
// Use global flag for multiple matches
const pattern = /<input[^>]*>/gi;
const matches = [...html.matchAll(pattern)];

// Avoid catastrophic backtracking
// Good: /#[0-9a-fA-F]{6}/
// Bad: /#.*?/
```

### 7. Return Meaningful Results

```javascript
// Always return an array, even if empty
if (checks.length === 0) {
  checks.push({
    id: 'overall-pass',
    rule: 'My Rule',
    status: 'pass',
    message: 'All checks passed'
  });
}

return checks;
```

---

## Examples

### Example 1: Check for Required ARIA Attributes

```javascript
const checks = [];
const html = context.html || '';

// Find all interactive elements
const interactivePattern = /<(button|a|input|select|textarea)[^>]*>/gi;
const elements = [...html.matchAll(interactivePattern)];

elements.forEach((match, index) => {
  const element = match[0];
  const tagName = match[1].toLowerCase();
  
  // Check for ARIA label
  const hasAriaLabel = /aria-label|aria-labelledby/i.test(element);
  const hasLabel = /<label/i.test(html);
  const hasPlaceholder = /placeholder/i.test(element);
  const isHidden = /type=['"]hidden['"]/i.test(element);
  
  if (!hasAriaLabel && !hasLabel && !hasPlaceholder && !isHidden) {
    checks.push({
      id: `aria-missing-${index}`,
      rule: 'ARIA Label Requirements',
      status: 'error',
      message: `${tagName} element missing ARIA label or associated label`,
      file: context.file,
      element: element.substring(0, 50)
    });
  }
});

return checks.length > 0 ? checks : [{
  id: 'aria-pass',
  rule: 'ARIA Label Requirements',
  status: 'pass',
  message: 'All interactive elements have ARIA labels'
}];
```

### Example 2: Check Design Token Usage

```javascript
const checks = [];
const css = context.css || '';
const tokens = context.tokens || [];

// Get color tokens
const colorTokens = tokens.filter(t => t.category === 'colors');
const tokenValues = colorTokens.map(t => t.value);

// Find hardcoded colors
const colorPattern = /#[0-9a-fA-F]{6}|rgb\([^)]+\)|rgba\([^)]+\)/g;
const colorMatches = [...css.matchAll(colorPattern)];

colorMatches.forEach(match => {
  const colorValue = match[0];
  
  // Check if color matches a token value
  const isToken = tokenValues.some(tv => {
    // Normalize colors for comparison
    return normalizeColor(tv) === normalizeColor(colorValue);
  });
  
  if (!isToken) {
    checks.push({
      id: `hardcoded-color-${match.index}`,
      rule: 'Design Token Usage',
      status: 'error',
      message: `Found hardcoded color: ${colorValue}. Use design tokens instead.`,
      file: context.file,
      line: getLineNumber(css, match.index)
    });
  }
});

function normalizeColor(color) {
  // Simple normalization (in production, use a color library)
  return color.toLowerCase().replace(/\s/g, '');
}

function getLineNumber(content, index) {
  return content.substring(0, index).split('\n').length;
}

return checks;
```

### Example 3: Check Component Naming Convention

```javascript
const checks = [];
const components = context.components || [];
const pascalCaseRegex = /^[A-Z][a-zA-Z0-9]*$/;

components.forEach(component => {
  const isValid = pascalCaseRegex.test(component.name);
  
  if (!isValid) {
    checks.push({
      id: `naming-${component.id}`,
      rule: 'Component Naming Convention',
      status: 'warning',
      message: `Component "${component.name}" does not follow PascalCase convention. Use PascalCase (e.g., MyComponent).`,
      component: component.name
    });
  }
});

return checks.length > 0 ? checks : [{
  id: 'naming-pass',
  rule: 'Component Naming Convention',
  status: 'pass',
  message: 'All components follow PascalCase convention'
}];
```

### Example 4: Check Loading States

```javascript
const checks = [];
const html = context.html || '';
const javascript = context.javascript || '';

// Check for async operations
const asyncPatterns = [
  /fetch\s*\(/i,
  /axios\./i,
  /async\s+function/i,
  /await\s+/i,
  /\.then\s*\(/i
];

const hasAsyncOperations = asyncPatterns.some(pattern => 
  pattern.test(javascript)
);

// Check for loading indicators
const loadingPatterns = [
  /loading/i,
  /spinner/i,
  /skeleton/i,
  /aria-busy/i,
  /aria-live/i,
  /isLoading/i,
  /isLoading/i
];

const hasLoadingIndicators = loadingPatterns.some(pattern =>
  pattern.test(html) || pattern.test(javascript)
);

if (hasAsyncOperations && !hasLoadingIndicators) {
  checks.push({
    id: 'loading-states',
    rule: 'Loading State Indicators',
    status: 'warning',
    message: 'Async operations detected but no loading indicators found. Users need feedback during async operations.',
    application: context.applicationName,
    file: context.file
  });
}

return checks;
```

---

## Troubleshooting

### Issue: Scanner Code Not Executing

**Symptoms**: Rule shows no results or errors

**Solutions**:
1. Check JavaScript syntax in scanner code
2. Verify context object properties are accessed correctly
3. Use the "Test" button to validate syntax
4. Check browser console for errors

### Issue: Rule Returns Wrong Results

**Symptoms**: Rule reports false positives or misses issues

**Solutions**:
1. Review regex patterns for accuracy
2. Add more specific conditions
3. Test with sample data
4. Check edge cases (empty strings, null values)

### Issue: Performance Problems

**Symptoms**: Scans take too long

**Solutions**:
1. Optimize regex patterns
2. Limit scope of checks
3. Use more efficient algorithms
4. Consider backend implementation for complex checks

### Issue: Backend Method Not Called

**Symptoms**: Custom backend method not executing

**Solutions**:
1. Verify method name matches rule name exactly
2. Check switch statement in `scanApplicationCodebase`
3. Ensure method is exported from `ApplicationScannerService`
4. Check for TypeScript compilation errors

---

## Additional Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Design Tokens Community Group](https://designtokens.org/)
- [JavaScript Regex Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)

---

## Support

For questions or issues:
1. Check existing rules for examples
2. Review this guide
3. Test scanner code incrementally
4. Use browser dev tools for debugging

---

**Last Updated**: 2024-01-20
**Version**: 1.0.0

