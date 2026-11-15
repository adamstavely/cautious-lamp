# Loupe Tool - Standalone Package

A standalone component inspector tool for design system components. Works in any application that uses design system components.

## Installation

The package is published to GitHub Packages under the `@adamstavely` scope. Tell npm where that scope lives, in the project's `.npmrc`:

```ini
@adamstavely:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

`GITHUB_TOKEN` is a GitHub personal access token (classic) with the `read:packages` scope. Then:

```bash
npm install @adamstavely/loupe-tool
```

## Package contents

| File | Use |
| --- | --- |
| `dist/loupe-tool.es.mjs` | ES module (`import`); Vue is a peer dependency |
| `dist/loupe-tool.umd.js` | UMD (`require`, `<script>`); expects the `Vue` global in browsers |
| `dist/style.css` | The tool's styles, exported as `@adamstavely/loupe-tool/style.css`. Import it once; the JS doesn't inject CSS. |
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
import { LoupeTool } from '@adamstavely/loupe-tool';
import '@adamstavely/loupe-tool/style.css';

const apiUrl = 'https://your-design-system-api.com/api/v1';
const apiKey = 'your-api-key';
</script>
```

### Vanilla JavaScript / React / Other Frameworks

The UMD build needs Vue as a global. With `data-auto-init` it mounts itself and sets `window.loupeTool`. GitHub Packages isn't served by public CDNs, so host `dist/loupe-tool.umd.js` and `dist/style.css` from the installed package yourself:

```html
<link rel="stylesheet" href="/vendor/loupe-tool/style.css">
<script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
<script
  src="/vendor/loupe-tool/loupe-tool.umd.js"
  data-auto-init
  data-api-url="https://your-api.com/api/v1"
  data-api-key="your-key"
></script>
```

### Programmatic Initialization

```javascript
import { initLoupeTool } from '@adamstavely/loupe-tool';
import '@adamstavely/loupe-tool/style.css';

const loupe = initLoupeTool({
  apiUrl: 'https://your-design-system-api.com/api/v1',
  apiKey: 'your-api-key',
});

// Later, to destroy:
loupe.destroy();
```

## Props and options

The component's props and `initLoupeTool`'s options (and the auto-init script's `data-*` attributes):

| Prop / option | Attribute | Default | Meaning |
| --- | --- | --- | --- |
| `apiUrl` | `data-api-url` | `http://localhost:3000/api/v1` | The Design System API, including `/api/v1` |
| `apiKey` | `data-api-key` | `''` | Sent as `Authorization: Bearer <apiKey>`. Without it, `localStorage.getItem('apiKey')` is used if the page has one. |
| `container` (option only) | | `document.body` | Where `initLoupeTool` mounts the tool |

`initLoupeTool` returns `{ destroy() }`.

## Requirements

### 1. Mark components with data attributes

The tool highlights every element with a `data-ds-component` attribute. `data-ds-path` overrides the import path shown for it:

```html
<div data-ds-component="button" data-ds-path="@design-system/components/button">…</div>
```

### 2. An API key

Component details come from `GET {apiUrl}/component-metadata`, which needs a key. With **no key**, the tool requests nothing: its button turns amber and, when active, it says "Configure apiKey to load component details" and shows components by their `data-ds-component` name only. If the request fails (a wrong key, the API down), it says so the same way. It never falls back to built-in sample data.

The endpoint returns `{ [componentId]: { name, path, icon, links } }` for the components the key can read:

- `icon`: a [Lucide](https://lucide.dev) icon name; the tool draws it with `lucide-vue-next`
- `links.docs`: the component's page in the design system app (`/components/buttons` for buttons, the library at `/components` for the rest). It is absolute when the API has `APP_PUBLIC_URL` set; the tool only shows absolute links, so set it for the docs link to appear in another app.
- `links.github`, `links.figma`: only when the API has `COMPONENT_SOURCE_URL_TEMPLATE` / `COMPONENT_FIGMA_URL_TEMPLATE` set (with `{id}` and `{name}` filled in). Without them those links are left out.

## Keyboard Shortcuts

- **Ctrl+Shift+L** (or **Cmd+Shift+L** on Mac) - Toggle Loupe Tool
- **Escape** - Close Loupe Tool

## Features

- Automatic component detection via `data-ds-component` attributes
- Visual highlighting of design system components that follows scrolling
- Hover panel with the component's name, import path, Lucide icon and configured links
- Works in any framework (Vue, React, Angular, vanilla JS)
- Says when it has no API key or the API can't be reached, instead of showing sample data

## Integration Examples

### React

```jsx
import { useEffect, useRef } from 'react';
import { initLoupeTool } from '@adamstavely/loupe-tool';

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
import { initLoupeTool } from '@adamstavely/loupe-tool';

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

The package isn't an npm workspace; it uses vite, vue and lucide-vue-next from the repository root's `node_modules`:

```bash
npm ci                 # at the repository root
cd loupe-tool-standalone
npm test               # node --test on the framework-free pieces
npm run test:pack      # build, then check every advertised file is in the package
```

Releases are published by `.github/workflows/release.yml` on a `loupe-tool-v<version>` tag, or when the **Release** workflow is run with `package=loupe-tool` (see "Publishing packages" in [the CLI README](../cli/README.md#publishing-packages)).

## License

MIT

