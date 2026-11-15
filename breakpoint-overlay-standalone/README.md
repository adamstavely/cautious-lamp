# Breakpoint Overlay - Standalone Package

A standalone breakpoint overlay tool for visualizing active breakpoints and viewport metrics in any application. Works in any framework that supports Vue 3 components.

## Installation

The package is published to GitHub Packages under the `@adamstavely` scope. Tell npm where that scope lives, in the project's `.npmrc`:

```ini
@adamstavely:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

`GITHUB_TOKEN` is a GitHub personal access token (classic) with the `read:packages` scope. Then:

```bash
npm install --save-dev @adamstavely/breakpoint-overlay
```

## Package contents

| File | Use |
| --- | --- |
| `dist/breakpoint-overlay.es.mjs` | ES module (`import`); Vue is a peer dependency |
| `dist/breakpoint-overlay.umd.js` | UMD (`require`, `<script>`); expects the `Vue` global in browsers |
| `dist/style.css` | The overlay's styles, exported as `@adamstavely/breakpoint-overlay/style.css`. Import it once; the JS doesn't inject CSS. |
| `types/index.d.ts` | TypeScript declarations |

`npm run test:pack` builds and checks that every file `package.json` advertises is in `npm pack`.

## Usage

### Vue 3 Application

```vue
<template>
  <div>
    <!-- Your application content -->
    <BreakpointOverlay 
      :breakpoints="breakpoints" 
      :hotkey="hotkey"
      :debounce-ms="150"
      @select="onSelect"
    />
  </div>
</template>

<script setup>
import { BreakpointOverlay } from '@adamstavely/breakpoint-overlay';
import '@adamstavely/breakpoint-overlay/style.css';

const breakpoints = [
  { id: 'sm', label: 'Small', minWidth: 640 },
  { id: 'md', label: 'Medium', minWidth: 768 },
  { id: 'lg', label: 'Large', minWidth: 1024 },
  { id: 'xl', label: 'Extra Large', minWidth: 1280 },
  { id: '2xl', label: '2X Large', minWidth: 1536 },
];

const hotkey = 'alt+shift+o';

// A ruler marker was clicked: its media query is on the clipboard (if `copied`)
const onSelect = ({ breakpoint, mediaQuery, copied }) => {
  console.log(breakpoint.id, mediaQuery, copied);
};
</script>
```

### Vanilla JavaScript / React / Other Frameworks

The UMD build needs Vue as a global. With `data-auto-init` it mounts itself and sets `window.breakpointOverlay`. GitHub Packages isn't served by public CDNs, so host `dist/breakpoint-overlay.umd.js` and `dist/style.css` from the installed package yourself:

```html
<link rel="stylesheet" href="/vendor/breakpoint-overlay/style.css">
<script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
<script
  src="/vendor/breakpoint-overlay/breakpoint-overlay.umd.js"
  data-auto-init
  data-hotkey="alt+shift+o"
  data-debounce-ms="150"
  data-breakpoints='[{"id":"mobile","label":"Mobile","maxWidth":767},{"id":"desktop","label":"Desktop","minWidth":768}]'
></script>
```

An attribute that is present is used as given: `data-hotkey=""` turns the shortcut off. A missing or invalid `data-breakpoints` or `data-debounce-ms` falls back to the default.

### Programmatic Initialization

```javascript
import { initBreakpointOverlay } from '@adamstavely/breakpoint-overlay';
import '@adamstavely/breakpoint-overlay/style.css';

const overlay = initBreakpointOverlay({
  breakpoints: [
    { id: 'sm', label: 'Small', minWidth: 640 },
    { id: 'md', label: 'Medium', minWidth: 768 },
    { id: 'lg', label: 'Large', minWidth: 1024 },
  ],
  hotkey: 'alt+shift+o',
  debounceMs: 150,
  onSelect: ({ mediaQuery }) => console.log(`Copied ${mediaQuery}`),
});

// Later, to destroy:
overlay.destroy();
```

## Ruler markers

With the overlay open, the ruler across the top has a marker at each breakpoint's `minWidth` (and `maxWidth`, when it has one). A page can't resize the browser window, so clicking a marker (or focusing it and pressing Enter or Space) instead:

1. copies the breakpoint's media query to the clipboard, e.g. `@media (min-width: 768px)` or `@media (min-width: 768px) and (max-width: 1023px)`;
2. shows "Copied @media …" under the ruler, or "Couldn't copy to the clipboard: @media …" when the browser refuses (the clipboard needs a secure context and permission), so the query can be copied by hand;
3. emits `select` with `{ breakpoint, mediaQuery, copied }`: the component's `@select` event, or the `onSelect` option of `initBreakpointOverlay`.

## Configuration

### Breakpoints

Breakpoints can be defined in three ways:

1. **Min-width only**: Active when viewport width >= minWidth
   ```javascript
   { id: 'desktop', label: 'Desktop', minWidth: 1024 }
   ```

2. **Max-width only**: Active when viewport width <= maxWidth
   ```javascript
   { id: 'mobile', label: 'Mobile', maxWidth: 767 }
   ```

3. **Range**: Active when viewport width is between minWidth and maxWidth
   ```javascript
   { id: 'tablet', label: 'Tablet', minWidth: 768, maxWidth: 1023 }
   ```

### Default Breakpoints

If no breakpoints are provided, the tool uses Tailwind CSS defaults:

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Keyboard Shortcuts

- **Alt+Shift+O** (default) - Toggle breakpoint overlay
- **Escape** - Close overlay when expanded

The hotkey can be customized via the `hotkey` option. Format: `modifier+modifier+key` (e.g., `ctrl+shift+k`, `alt+o`).

Supported modifiers:
- `alt`
- `ctrl` / `control`
- `shift`
- `meta` / `cmd` / `command`

The final token must be a single character key. Matching is case-insensitive and also checks `event.code` for letters/digits.

### Debounce

The `debounceMs` option controls how often the viewport is sampled during resize events. Default is 150ms. Lower values provide more responsive updates but may impact performance on slower devices.

## Keyboard Shortcut Behavior

- The listener is added when the overlay mounts, whether through `initBreakpointOverlay`, auto-init or the `<BreakpointOverlay>` component, and removed when it unmounts.
- It listens on `window` in the capture phase, so it sees the shortcut before the page does.
- Key events with editable targets (`input`, `textarea`, `select`, or `contenteditable` elements) are ignored to avoid interfering with typing.
- When the overlay handles the shortcut, it calls `event.preventDefault()` and `event.stopPropagation()`: the page's own listeners don't receive it. Pick a hotkey the page doesn't use, or turn it off with `hotkey: ''`.
- **Escape** closes the expanded overlay (and gives the page its scrolling back); it isn't stopped, so the page still sees it.

## Features

- Visual breakpoint indicator badge (always visible)
- Expanded overlay with detailed breakpoint information
- Viewport metrics display (width × height)
- Active breakpoint highlighting
- Visual scale indicator showing viewport position
- Ruler markers that copy their media query (see [Ruler markers](#ruler-markers))
- Layout inspector for grid and flex containers
- Configurable breakpoints (min-width, max-width, or range)
- Keyboard shortcuts (Alt+Shift+O default, Escape to close)
- Debounced viewport tracking
- Works in any framework (Vue, React, Angular, vanilla JS)
- Dark styles when the page has a `dark` class on an ancestor
- Auto-initialization support

## API Reference

### `initBreakpointOverlay(options)`

Initialize the breakpoint overlay.

**Parameters:**

- `options.breakpoints` (Array, optional): Array of breakpoint definitions. Default: Tailwind breakpoints.
- `options.hotkey` (string, optional): Keyboard shortcut string. Default: `'alt+shift+o'`. Use empty string to disable.
- `options.debounceMs` (number, optional): Debounce interval for resize events in milliseconds. Default: `150`.
- `options.onSelect` (function, optional): Called with `{ breakpoint, mediaQuery, copied }` when a ruler marker is clicked.
- `options.container` (HTMLElement, optional): Container element to mount the tool. Default: `document.body`.

**Returns:**

Object with `destroy()` method to tear down the overlay.

**Example:**

```javascript
const overlay = initBreakpointOverlay({
  breakpoints: [
    { id: 'mobile', label: 'Mobile', maxWidth: 767 },
    { id: 'tablet', label: 'Tablet', minWidth: 768, maxWidth: 1023 },
    { id: 'desktop', label: 'Desktop', minWidth: 1024 },
  ],
  hotkey: 'alt+shift+o',
  debounceMs: 150,
});

// Destroy when done
overlay.destroy();
```

## Integration Examples

### React

```jsx
import { useEffect, useRef } from 'react';
import { initBreakpointOverlay } from '@adamstavely/breakpoint-overlay';

function App() {
  const overlayRef = useRef(null);

  useEffect(() => {
    overlayRef.current = initBreakpointOverlay({
      breakpoints: [
        { id: 'sm', label: 'Small', minWidth: 640 },
        { id: 'md', label: 'Medium', minWidth: 768 },
        { id: 'lg', label: 'Large', minWidth: 1024 },
      ],
      hotkey: 'alt+shift+o',
    });

    return () => {
      if (overlayRef.current) {
        overlayRef.current.destroy();
      }
    };
  }, []);

  return <div>{/* Your app */}</div>;
}
```

### Angular

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { initBreakpointOverlay } from '@adamstavely/breakpoint-overlay';

@Component({
  selector: 'app-root',
  template: '<div><!-- Your app --></div>'
})
export class AppComponent implements OnInit, OnDestroy {
  private overlay: any;

  ngOnInit() {
    this.overlay = initBreakpointOverlay({
      breakpoints: [
        { id: 'sm', label: 'Small', minWidth: 640 },
        { id: 'md', label: 'Medium', minWidth: 768 },
        { id: 'lg', label: 'Large', minWidth: 1024 },
      ],
      hotkey: 'alt+shift+o',
    });
  }

  ngOnDestroy() {
    if (this.overlay) {
      this.overlay.destroy();
    }
  }
}
```

## Development

The package isn't an npm workspace; it uses vite, vitest, jsdom and vue from the repository root's `node_modules`:

```bash
npm ci                 # at the repository root
cd breakpoint-overlay-standalone
npm test               # vitest: breakpoint matching, hotkeys, auto-init attributes, the mounted overlay
npm run test:pack      # build, then check every advertised file is in the package
```

Releases are published by `.github/workflows/release.yml` on a `breakpoint-overlay-v<version>` tag, or when the **Release** workflow is run with `package=breakpoint-overlay` (see "Publishing packages" in [the CLI README](../cli/README.md#publishing-packages)).

## License

MIT

