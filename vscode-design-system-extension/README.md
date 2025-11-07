# VS Code Design System Extension

VS Code extension for Design System integration - autocomplete, hover info, snippets, and more.

## Features

### 🎯 Autocomplete
- **Token Autocomplete**: Type `tokens.` to see all design tokens
- **Component Autocomplete**: Type component names in JSX/Vue templates
- **Category-based**: Autocomplete for `color.`, `spacing.`, `typography.`, etc.

### 💡 Hover Information
- **Token Details**: Hover over tokens to see values, categories, and descriptions
- **Component Docs**: Hover over components to see props, descriptions, and usage
- **Color Preview**: Visual color previews for color tokens
- **Hardcoded Value Warnings**: Hover over hardcoded colors to see suggestions

### 🎨 Visual Features
- **Color Decorations**: Inline color previews for hex colors
- **Token Values**: See token values in hover tooltips

### ⚡ Code Snippets
- **Component Snippets**: `ds-button`, `ds-input`, `ds-card`, etc.
- **Token Snippets**: `ds-color`, `ds-spacing`, `ds-typography`
- **Framework Support**: Vue, React, JavaScript, TypeScript

### 🔧 Quick Actions
- **Replace with Token**: Right-click hardcoded values → Replace with token
- **Insert Component**: Command palette → Insert Component
- **Insert Token**: Command palette → Insert Token
- **Open Component Docs**: Jump to component documentation
- **Refresh Cache**: Manually refresh design system data
- **Show Output**: View extension logs and debug information

## Installation

### From Source

```bash
cd vscode-design-system-extension
npm install
npm run compile
```

### Package Extension

```bash
npm install -g @vscode/vsce
vsce package
```

Then install the `.vsix` file in VS Code:
1. Open VS Code
2. Go to Extensions
3. Click "..." → "Install from VSIX..."
4. Select the `.vsix` file

## Configuration

Add to your VS Code `settings.json`:

```json
{
  "designSystem.apiUrl": "http://localhost:3000/api/v1",
  "designSystem.apiKey": "test-api-key-123",
  "designSystem.enableAutocomplete": true,
  "designSystem.enableHover": true,
  "designSystem.enableColorPreview": true,
  "designSystem.enableSnippets": true
}
```

## Usage

### Autocomplete

Type `tokens.` to see all available tokens:
```javascript
const color = tokens.color.primary; // ← Autocomplete shows all color tokens
const spacing = tokens.spacing.md;   // ← Autocomplete shows all spacing tokens
```

### Hover Information

Hover over tokens or components to see details:
```javascript
tokens.color.primary // ← Hover to see value, category, description
<Button />           // ← Hover to see component props and docs
```

### Code Snippets

Type snippet prefix and press Tab:
- `ds-button` → Button component snippet
- `ds-input` → Input component snippet
- `ds-color` → Color token snippet
- `ds-spacing` → Spacing token snippet

### Quick Actions

1. **Replace Hardcoded Values**:
   - Select a hardcoded color: `#3b82f6`
   - Right-click → "Replace with Design Token"
   - Or use Command Palette: `Design System: Replace with Design Token`

2. **Insert Component**:
   - Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`)
   - Type: "Design System: Insert Component"
   - Select component from list

3. **Insert Token**:
   - Command Palette
   - Type: "Design System: Insert Token"
   - Select token from list

4. **View Logs**:
   - Command Palette
   - Type: "Design System: Show Output"
   - View extension logs and debug information

## Commands

- `designSystem.insertComponent` - Insert a component snippet
- `designSystem.insertToken` - Insert a token reference
- `designSystem.openComponentDocs` - Open component documentation
- `designSystem.replaceWithToken` - Replace selected value with token
- `designSystem.refreshCache` - Refresh design system cache
- `designSystem.showOutput` - Show extension output channel

## Supported Languages

- JavaScript
- TypeScript
- Vue
- React (JSX/TSX)
- CSS/SCSS (for color previews)

## Troubleshooting

### Extension not working?
1. Check output channel: `Design System: Show Output`
2. Verify API URL is correct
3. Check API key is valid
4. Ensure backend is running

### No autocomplete?
1. Check `designSystem.enableAutocomplete` is true
2. Verify API connection
3. Check output channel for errors

### API connection errors?
1. Verify backend is running
2. Check API URL format (no trailing slash)
3. Verify API key is correct
4. Check firewall/network settings

### See logs
Use `Design System: Show Output` command to view detailed logs and error messages.

## Architecture

```
VS Code Extension
  ↓ API Calls (with retry & timeout)
Design System Backend API
  ↓ Returns Components/Tokens
Extension Providers
  ↓ Provides Features
VS Code Editor
```

## Development

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch for changes
npm run watch

# Package extension
npm run package
```

## Production Features

- ✅ Comprehensive error handling
- ✅ Retry logic with exponential backoff
- ✅ Request timeouts (10 seconds)
- ✅ Caching with fallback
- ✅ Detailed logging
- ✅ User-friendly error messages
- ✅ Graceful degradation

## See Also

- [ESLint Plugin](../eslint-plugin-design-system/README.md)
- [Design System API](../../backend/src/design-system/design-system.controller.ts)
- [Integration Guide](../docs/LINTER_INTEGRATION.md)
- [Production Guide](./PRODUCTION.md)

## License

MIT License - see [LICENSE](./LICENSE) file for details.
