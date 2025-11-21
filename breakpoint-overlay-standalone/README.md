# Breakpoint Overlay - Standalone Package

A standalone breakpoint overlay tool for visualizing active breakpoints and viewport metrics in any application. Works in any framework that supports Vue 3 components.

## Installation

```bash
npm install --save-dev @designsystem/breakpoint-overlay
```

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
    />
  </div>
</template>

<script setup>
import { BreakpointOverlay } from '@designsystem/breakpoint-overlay';

const breakpoints = [
  { id: 'sm', label: 'Small', minWidth: 640 },
  { id: 'md', label: 'Medium', minWidth: 768 },
  { id: 'lg', label: 'Large', minWidth: 1024 },
  { id: 'xl', label: 'Extra Large', minWidth: 1280 },
  { id: '2xl', label: '2X Large', minWidth: 1536 },
];

const hotkey = 'alt+shift+o';
</script>
```

### Vanilla JavaScript / React / Other Frameworks

```html
<!-- Include the script -->
<script type="module" src="https://unpkg.com/@designsystem/breakpoint-overlay/dist/breakpoint-overlay.esm.js"></script>

<!-- Auto-initialize on page load -->
<script 
  type="module" 
  data-auto-init 
  data-hotkey="alt+shift+o"
  data-debounce-ms="150"
>
  import { initBreakpointOverlay } from 'https://unpkg.com/@designsystem/breakpoint-overlay/dist/breakpoint-overlay.esm.js';
  
  initBreakpointOverlay({
    breakpoints: [
      { id: 'mobile', label: 'Mobile', maxWidth: 767 },
      { id: 'tablet', label: 'Tablet', minWidth: 768, maxWidth: 1023 },
      { id: 'desktop', label: 'Desktop', minWidth: 1024 },
    ],
    hotkey: 'alt+shift+o',
    debounceMs: 150,
  });
</script>
```

### Programmatic Initialization

```javascript
import { initBreakpointOverlay } from '@designsystem/breakpoint-overlay';

const overlay = initBreakpointOverlay({
  breakpoints: [
    { id: 'sm', label: 'Small', minWidth: 640 },
    { id: 'md', label: 'Medium', minWidth: 768 },
    { id: 'lg', label: 'Large', minWidth: 1024 },
  ],
  hotkey: 'alt+shift+o',
  debounceMs: 150,
});

// Later, to destroy:
overlay.destroy();
```

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

- The listener registers when `initBreakpointOverlay` creates the runtime; shortcuts do nothing until the handle exists.
- Key events with editable targets (`input`, `textarea`, `select`, or `contenteditable` elements) are ignored to avoid interfering with typing.
- When the overlay handles the shortcut, it calls `event.preventDefault()` but still allows the event to bubble so other listeners can observe it.

## Features

- ✅ Visual breakpoint indicator badge (always visible)
- ✅ Expanded overlay with detailed breakpoint information
- ✅ Viewport metrics display (width × height)
- ✅ Active breakpoint highlighting
- ✅ Visual scale indicator showing viewport position
- ✅ Configurable breakpoints (min-width, max-width, or range)
- ✅ Keyboard shortcuts (Alt+Shift+O default, Escape to close)
- ✅ Debounced viewport tracking
- ✅ Works in any framework (Vue, React, Angular, vanilla JS)
- ✅ Dark mode support
- ✅ Auto-initialization support

## API Reference

### `initBreakpointOverlay(options)`

Initialize the breakpoint overlay.

**Parameters:**

- `options.breakpoints` (Array, optional): Array of breakpoint definitions. Default: Tailwind breakpoints.
- `options.hotkey` (string, optional): Keyboard shortcut string. Default: `'alt+shift+o'`. Use empty string to disable.
- `options.debounceMs` (number, optional): Debounce interval for resize events in milliseconds. Default: `150`.
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
import { initBreakpointOverlay } from '@designsystem/breakpoint-overlay';

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
import { initBreakpointOverlay } from '@designsystem/breakpoint-overlay';

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

```bash
cd breakpoint-overlay-standalone
npm install
npm run build
```

## License

MIT

