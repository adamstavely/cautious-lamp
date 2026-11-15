# Loupe tool

Loupe is a component inspector. It finds the design system components on a page, highlights them, and shows each one's name, import path and links when you hover over it.

There are two versions:

- **In the app** (`frontend/src/components/LoupeTool.vue`): built into this design system site. Besides component inspection it has a breakpoint ruler, a breakpoint list, viewport tracking and a layout inspector. This document covers it.
- **The standalone package** (`loupe-tool-standalone/`, `@adamstavely/loupe-tool`): component inspection only, for adding to other applications. See [LOUPE_TOOL_INTEGRATION.md](LOUPE_TOOL_INTEGRATION.md).

## Turning it on

The in-app tool is mounted by `App.vue` when the `component-loupe` feature flag is on (Admin > Feature flags). The **Loupe** page (`/components/loupe`) explains it and names components on that page to try it on.

1. Press `Ctrl+Shift+L` (`Cmd+Shift+L` on Mac) on any page.
2. Components are highlighted. Hover over one to see its name, import path and links to its documentation, source and design file, where those are known.
3. Press the shortcut again or `Escape` to close it.

## Control panel

The control panel turns each feature on or off:

- **Component highlights**: outlines every detected component.
- **Breakpoint ruler**: a ruler along the top of the page with a marker for each breakpoint and a line at the current viewport width.
- **Layout inspector**: finds CSS Grid and Flexbox containers, outlines them, and lists their gap, direction and alignment. Selecting one in the list highlights it on the page.

The panel also shows the viewport size, the active breakpoint, and the breakpoint list with each breakpoint's range and whether it's active. The breakpoints are fixed in the component: Small 640px, Medium 768px, Large 1024px, Extra Large 1280px and 2X Large 1536px.

## Making a component detectable

Loupe looks for elements with a `data-ds-component` attribute. Put it on the component's root element:

```html
<button
  data-ds-component="button"
  data-ds-path="@design-system/components/button"
>
  Save
</button>
```

- `data-ds-component` (required): the component's id, matched case-insensitively against the metadata.
- `data-ds-path` (optional): the import path to show. If it's missing, the path from the metadata is used.

## Component metadata

The in-app tool combines two sources:

1. A local list in `frontend/src/services/componentMetadataService.js`, which works without the server.
2. `GET /api/v1/component-metadata` (`design-system.controller.ts`), loaded when the tool starts and merged over the local list. The request uses your signed-in session.

The route returns `{ [componentId]: { name, path, links: { docs, github, figma }, … } }` for the components the caller can read (`ComponentAccessService`; see [AUTH.md](AUTH.md)). It's built by `DesignSystemService.getComponentMetadata()` from the design system's components: `path` is `@design-system/components/<id>`, and `docs` points at the component's documentation page (absolute when the backend has `APP_PUBLIC_URL`). `github` and `figma` links are included only when `COMPONENT_SOURCE_URL_TEMPLATE` and `COMPONENT_FIGMA_URL_TEMPLATE` are set on the backend.

To add or correct metadata for a component that isn't in the design system, edit the local list in `componentMetadataService.js`.

## Troubleshooting

- **A component isn't highlighted.** Check that its root element has `data-ds-component` and that it's rendered (not hidden or behind a `v-if`). While it's open, the in-app tool rescans the page every second, so components that appear later are picked up.
- **A component shows only its id, with no links.** There's no metadata for that id. Check the browser console for a failed `/api/v1/component-metadata` request, and that the id matches a design system component or an entry in `componentMetadataService.js`.
- **The shortcut does nothing.** Check that the `component-loupe` feature flag is on, and that nothing else on the page handles `Ctrl+Shift+L` first.
