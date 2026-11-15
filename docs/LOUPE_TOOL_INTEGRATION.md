# Adding Loupe to another application

The standalone Loupe package (`loupe-tool-standalone/`, package name `@designsystem/loupe-tool`) brings component inspection to applications outside this site: it highlights elements marked as design system components and shows each one's name, import path and links on hover. It doesn't have the in-app version's breakpoint ruler or layout inspector; see [LOUPE_TOOL.md](LOUPE_TOOL.md) for that.

The package is written in Vue 3, and `vue` (3.3 or later) is a peer dependency, so the host application needs Vue installed or loaded even if it uses another framework.

## Build and install

The package isn't published to a registry. Build it from this repository:

```bash
cd loupe-tool-standalone
npm run build
```

`vite.config.js` writes:

| File | Use |
| --- | --- |
| `dist/loupe-tool.es.mjs` | ES module (`import`) |
| `dist/loupe-tool.umd.js` | UMD (`require` or a `<script>` tag); expects a global `Vue` in the browser |
| `dist/style.css` | The tool's styles. The JavaScript doesn't inject them; import this file once. |

Types are in `types/index.d.ts`. To use the build in another project, install it from the folder or from a tarball made with `npm pack`.

## Mark your components

Loupe finds elements with a `data-ds-component` attribute. Put it on each component's root element:

```html
<button
  data-ds-component="button"
  data-ds-path="@design-system/components/button"
>
  Save
</button>
```

- `data-ds-component` (required): the component's id, matched case-insensitively against the metadata ids.
- `data-ds-path` (optional): the import path to show; otherwise the metadata's path is used.

## Start it

### Vue 3

```vue
<template>
  <LoupeTool :api-url="apiUrl" :api-key="apiKey" />
</template>

<script setup>
import { LoupeTool } from '@designsystem/loupe-tool';
import '@designsystem/loupe-tool/style.css';

const apiUrl = import.meta.env.VITE_DS_API_URL; // e.g. https://design-system.example.com/api/v1
const apiKey = import.meta.env.VITE_DS_API_KEY;
</script>
```

### Any framework

`initLoupeTool()` mounts the tool in its own Vue app and returns a handle:

```javascript
import { initLoupeTool } from '@designsystem/loupe-tool';
import '@designsystem/loupe-tool/style.css';

const loupe = initLoupeTool({
  apiUrl: 'https://design-system.example.com/api/v1', // default http://localhost:3000/api/v1
  apiKey: '<your key>',
  container: document.body,                           // default document.body
});

// Later
loupe.destroy();
```

In React, call it in an effect and call `destroy()` in the cleanup.

### Script tag

With the UMD build and a global `Vue`, the `data-auto-init` attribute mounts the tool and sets `window.loupeTool`:

```html
<link rel="stylesheet" href="/vendor/loupe-tool/style.css">
<script src="/vendor/vue.global.prod.js"></script>
<script
  src="/vendor/loupe-tool/loupe-tool.umd.js"
  data-auto-init
  data-api-url="https://design-system.example.com/api/v1"
  data-api-key="<your key>"
></script>
```

## Using it

- Press `Ctrl+Shift+L` (`Cmd+Shift+L` on Mac), or click the round button in the bottom-right corner, to turn it on.
- Hover over a highlighted component to see its details and links.
- Press the shortcut again, press `Escape`, or use the close button in the info panel to turn it off.

## Component metadata

When it starts, the tool requests `GET {apiUrl}/component-metadata` (`COMPONENT_METADATA_PATH` in `src/loupe-core.mjs`). The backend route is in `backend/src/design-system/design-system.controller.ts` and returns `{ [componentId]: { name, path, links: { docs, github, figma }, … } }`.

- The route needs a valid credential, sent as `Authorization: Bearer <apiKey>`. If `apiKey` isn't given, the tool uses `localStorage.getItem('apiKey')`.
- It only returns components the caller can read. An API key isn't a workspace member, so it sees the shared library and global components, not workspace-private ones (see [AUTH.md](AUTH.md)).
- If the request fails for any reason (network error, `401`, `404`, a body that isn't an object), the tool logs a warning and uses a small built-in list for common components (button, card, input, dropdown, sidebar, top navigation, breadcrumbs).
- The `docs` links are paths on the design system site (`/components/...`). The `github` and `figma` links come from placeholder templates on the server and don't lead anywhere real yet.

## Getting an API key

The development keys used in older guides are rejected by the server. Ask an administrator for a key: someone with the `admin:users` permission creates it with `POST /api/v1/auth/api-keys` (there's no screen for this in the app; the **Design system API** page at `/api` describes the route). Ask for a key limited to reading, for example `{ "name": "Loupe for <app>", "scopes": ["component:view"], "expiresInDays": 90 }`. The key is shown once, in the response.

A key given to a browser can be read by anyone who can load the page. Only ship Loupe with a key in internal or development builds, give that key read-only scopes, and keep it in your build's environment rather than in source control. [AUTH.md](AUTH.md#api-keys) describes keys, scopes, rotation and revocation.

## Troubleshooting

- **Nothing is highlighted.** Check that elements have `data-ds-component` and are rendered. While it's open, the tool rescans the page every second.
- **Components show only their id and no links.** Metadata didn't load, or has no entry for that id. Look in the console for the warning from the `/component-metadata` request, and check `apiUrl` (it must end in `/api/v1`) and the key.
- **No styles.** Import `@designsystem/loupe-tool/style.css` (or link `dist/style.css`).
- **`Vue is not defined`** with the UMD build: load Vue 3's global build before the Loupe script.
