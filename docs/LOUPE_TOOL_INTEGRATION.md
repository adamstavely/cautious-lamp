# Loupe Tool Integration Guide

This guide explains how to integrate the Loupe Tool into applications that use design system components.

## Overview

The Loupe Tool is a component inspector that works in **any application** that uses design system components. It detects components on the page and provides quick access to their documentation, source code, and design files.

## How It Works

The Loupe Tool works by:

1. **Scanning the DOM** for elements with `data-ds-component` attributes
2. **Fetching metadata** from the Design System API (or using fallback metadata)
3. **Highlighting components** with a visual overlay
4. **Displaying information** when hovering over components

## Integration Steps

### Step 1: Install the Loupe Tool Package

```bash
npm install @designsystem/loupe-tool
```

### Step 2: Add Data Attributes to Components

For each design system component in your application, add the `data-ds-component` attribute:

```vue
<!-- Vue Example -->
<template>
  <Button 
    data-ds-component="button"
    data-ds-path="@design-system/components/button"
  >
    Click me
  </Button>
</template>
```

```jsx
// React Example
<Button 
  data-ds-component="button"
  data-ds-path="@design-system/components/button"
>
  Click me
</Button>
```

### Step 3: Initialize the Loupe Tool

#### Vue 3

```vue
<template>
  <div>
    <!-- Your application -->
    <LoupeTool :api-url="apiUrl" :api-key="apiKey" />
  </div>
</template>

<script setup>
import { LoupeTool } from '@designsystem/loupe-tool';

const apiUrl = 'https://your-design-system-api.com/api/v1';
const apiKey = 'your-api-key';
</script>
```

#### React

```jsx
import { useEffect, useRef } from 'react';
import { initLoupeTool } from '@designsystem/loupe-tool';

function App() {
  const loupeRef = useRef(null);

  useEffect(() => {
    loupeRef.current = initLoupeTool({
      apiUrl: process.env.REACT_APP_DS_API_URL,
      apiKey: process.env.REACT_APP_DS_API_KEY,
    });

    return () => {
      if (loupeRef.current) {
        loupeRef.current.destroy();
      }
    };
  }, []);

  return <div>{/* Your app */}</div>;
}
```

#### Vanilla JavaScript

```html
<script type="module">
  import { initLoupeTool } from 'https://unpkg.com/@designsystem/loupe-tool/dist/loupe-tool.esm.js';
  
  initLoupeTool({
    apiUrl: 'https://your-design-system-api.com/api/v1',
    apiKey: 'your-api-key',
  });
</script>
```

## Component Detection

The Loupe Tool detects components by looking for the `data-ds-component` attribute:

```html
<div data-ds-component="button">
  <!-- Component content -->
</div>
```

### Required Attributes

- **`data-ds-component`** (required): Component identifier (e.g., "button", "card", "input")
- **`data-ds-path`** (optional): Import path (e.g., "@design-system/components/button")

### Example Component Markup

```vue
<template>
  <!-- Button Component -->
  <button
    data-ds-component="button"
    data-ds-path="@design-system/components/button"
    class="btn btn-primary"
  >
    Submit
  </button>

  <!-- Card Component -->
  <div
    data-ds-component="card"
    data-ds-path="@design-system/components/card"
    class="card"
  >
    <div class="card-body">Content</div>
  </div>

  <!-- Input Component -->
  <input
    data-ds-component="input"
    data-ds-path="@design-system/components/input"
    type="text"
    class="form-control"
  />
</template>
```

## Component Metadata

The Loupe Tool fetches component metadata from the Design System API:

**Endpoint:** `GET /api/v1/components/metadata`

**Response Format:**
```json
{
  "button": {
    "name": "Button",
    "path": "@design-system/components/button",
    "icon": "smart_button",
    "links": {
      "docs": "/components/buttons",
      "github": "https://github.com/.../Button",
      "figma": "https://www.figma.com/.../button"
    }
  }
}
```

### Fallback Metadata

If the API is unavailable, the tool uses built-in fallback metadata for common components.

## API Configuration

### API URL

Set the Design System API URL:

```javascript
initLoupeTool({
  apiUrl: 'https://your-design-system-api.com/api/v1',
});
```

### API Key

Provide an API key for authentication:

```javascript
initLoupeTool({
  apiKey: 'your-api-key',
});
```

The tool will also check `localStorage.getItem('apiKey')` as a fallback.

## Usage

### Activating the Tool

1. **Keyboard Shortcut**: Press `Ctrl+Shift+L` (or `Cmd+Shift+L` on Mac)
2. **Click Indicator**: Click the small icon in the bottom-right corner

### Viewing Component Information

1. Activate the Loupe Tool
2. Hover over any highlighted component
3. View component name, path, and links in the info panel
4. Click links to open documentation, GitHub, or Figma

### Deactivating

- Press `Ctrl+Shift+L` again
- Press `Escape`
- Click the close button in the info panel

## Best Practices

### 1. Add Attributes at the Component Level

Add `data-ds-component` to the root element of each component:

```vue
<template>
  <div 
    data-ds-component="card"
    data-ds-path="@design-system/components/card"
  >
    <!-- Card content -->
  </div>
</template>
```

### 2. Use Consistent Component Names

Use the same component identifiers as defined in the Design System:

- `button` (not `Button` or `btn`)
- `card` (not `Card` or `panel`)
- `input` (not `Input` or `textfield`)

### 3. Provide Import Paths

Include `data-ds-path` to help developers understand how to import components:

```html
<div 
  data-ds-component="button"
  data-ds-path="@design-system/components/button"
>
```

### 4. Environment-Specific Configuration

Use environment variables for API configuration:

```javascript
initLoupeTool({
  apiUrl: process.env.DESIGN_SYSTEM_API_URL,
  apiKey: process.env.DESIGN_SYSTEM_API_KEY,
});
```

## Troubleshooting

### Components Not Detected

1. **Check attributes**: Ensure `data-ds-component` is present
2. **Check casing**: Component names are case-insensitive but should match metadata
3. **Check DOM**: Verify components are rendered (not hidden or conditionally rendered)

### Metadata Not Loading

1. **Check API URL**: Verify the API URL is correct
2. **Check API key**: Ensure the API key is valid
3. **Check network**: Verify the API is accessible
4. **Check console**: Look for error messages in the browser console

### Tool Not Activating

1. **Check keyboard shortcut**: Try `Ctrl+Shift+L` or `Cmd+Shift+L`
2. **Check console**: Look for error messages
3. **Check initialization**: Verify the tool is properly initialized
4. **Check conflicts**: Ensure no other code is intercepting the keyboard shortcut

## Advanced Configuration

### Custom Container

Mount the tool in a specific container:

```javascript
const container = document.getElementById('my-app');
initLoupeTool({
  apiUrl: 'https://api.example.com/api/v1',
  container: container,
});
```

### Programmatic Control

```javascript
const loupe = initLoupeTool({
  apiUrl: 'https://api.example.com/api/v1',
});

// Later, destroy the tool
loupe.destroy();
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Security Considerations

- The Loupe Tool only reads `data-ds-component` attributes (no code execution)
- API keys should be kept secure and not committed to version control
- Use environment variables for sensitive configuration
- The tool only displays information, it does not modify your application

## Examples

See the `loupe-tool-standalone/` directory for:
- Standalone package
- Integration examples
- Build configuration

