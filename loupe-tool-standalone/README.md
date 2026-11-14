# Loupe Tool - Standalone Package

A standalone component inspector tool for design system components. Works in any application that uses design system components.

## Installation

```bash
npm install @designsystem/loupe-tool
```

## Package contents

| File | Use |
| --- | --- |
| `dist/loupe-tool.es.mjs` | ES module (`import`); Vue is a peer dependency |
| `dist/loupe-tool.umd.js` | UMD (`require`, `<script>`); expects the `Vue` global in browsers |
| `dist/style.css` | The tool's styles, exported as `@designsystem/loupe-tool/style.css`. Import it once; the JS doesn't inject CSS. |
| `types/index.d.ts` | TypeScript declarations |

`npm run test:pack` builds and checks that every file `package.json` advertises is in `npm pack`.

## Usage

### Vue 3 Application

```vue
<template>
  <div>
    <!-- Your application content -->
    <LoupeTool :api-url="apiUrl" :api-key="apiKey" />
  </div>
</template>

<script setup>
import { LoupeTool } from '@designsystem/loupe-tool';
import '@designsystem/loupe-tool/style.css';

const apiUrl = 'https://your-design-system-api.com/api/v1';
const apiKey = 'your-api-key';
</script>
```

### Vanilla JavaScript / React / Other Frameworks

The UMD build needs Vue as a global. With `data-auto-init` it mounts itself and sets `window.loupeTool`:

```html
<link rel="stylesheet" href="https://unpkg.com/@designsystem/loupe-tool/dist/style.css">
<script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
<script
  src="https://unpkg.com/@designsystem/loupe-tool/dist/loupe-tool.umd.js"
  data-auto-init
  data-api-url="https://your-api.com/api/v1"
  data-api-key="your-key"
></script>
```

### Programmatic Initialization

```javascript
import { initLoupeTool } from '@designsystem/loupe-tool';
import '@designsystem/loupe-tool/style.css';

const loupe = initLoupeTool({
  apiUrl: 'https://your-design-system-api.com/api/v1',
  apiKey: 'your-api-key',
});

// Later, to destroy:
loupe.destroy();
```

## Requirements

### 1. Add Data Attributes to Components

For the Loupe Tool to detect components, add `data-ds-component` attributes:

```vue
<template>
  <div 
    data-ds-component="button"
    data-ds-path="@design-system/components/button"
  >
    <!-- Component content -->
  </div>
</template>
```

### 2. Component Metadata

The tool fetches component metadata from the Design System API endpoint:
- `GET /api/v1/components/metadata`

This endpoint returns component information including:
- Component name
- Import path
- Icon (Material Symbol name)
- Links to documentation, GitHub, and Figma

### 3. API Access

The application needs:
- Access to the Design System API
- An API key (optional, but recommended)

## Keyboard Shortcuts

- **Ctrl+Shift+L** (or **Cmd+Shift+L** on Mac) - Toggle Loupe Tool
- **Escape** - Close Loupe Tool

## Features

- ✅ Automatic component detection via `data-ds-component` attributes
- ✅ Visual highlighting of design system components
- ✅ Hover info panel with component details
- ✅ Links to documentation, GitHub, and Figma
- ✅ Component icons
- ✅ Works in any framework (Vue, React, Angular, vanilla JS)
- ✅ Fetches metadata from Design System API
- ✅ Fallback metadata if API is unavailable

## Configuration

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

## Integration Examples

### React

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

### Angular

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { initLoupeTool } from '@designsystem/loupe-tool';

@Component({
  selector: 'app-root',
  template: '<div><!-- Your app --></div>'
})
export class AppComponent implements OnInit, OnDestroy {
  private loupe: any;

  ngOnInit() {
    this.loupe = initLoupeTool({
      apiUrl: 'https://your-api.com/api/v1',
      apiKey: 'your-key',
    });
  }

  ngOnDestroy() {
    if (this.loupe) {
      this.loupe.destroy();
    }
  }
}
```

## Development

```bash
cd loupe-tool-standalone
npm install
npm run build
```

## License

MIT

