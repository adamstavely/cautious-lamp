# Reskin guide: tokens and components

Pages use the clean design: a plain surface, hairline borders, one accent blue (the ink of the Trench Coat spot illustrations), pill buttons, and a spot illustration where a page used to have a big icon or banner. `src/views/Tools.vue` is the reference page.

**The rule:** pages compose the components in `src/components/ui` and use the token names below. A reskinned page has:
- no inline styles: no `style=`, `:style` or `v-bind:style`;
- no Tailwind arbitrary values (`text-[#2f5ea8]`, `w-[13px]`);
- no raw palette classes (`text-slate-600`, `bg-indigo-600`, `bg-white`);
- no `dark:` variants and no `isDarkMode`. Every token already follows the theme.

`npm run check:styles` enforces this for every file listed in `scripts/reskinned.json`. Add your files there.

## Tokens

The tokens come from Trench Coat (`src/styles/trenchcoat/tokens.css`, its clean look, synced with `scripts/sync-trenchcoat.mjs`). The app's overrides live in `src/styles/tokens.css`: the accent is the illustration blue, and primary buttons are blue. `tailwind.config.js` names them:

| Use | Classes |
| --- | --- |
| Page and card surfaces | `bg-surface` (page), `bg-surface-raised` (cards, panels), `bg-surface-sunken` (wells, panel footers), `bg-surface-control` (inputs), `bg-surface-overlay` (popovers) |
| Text | `text-ink-strong` (headings), `text-ink` (body), `text-ink-secondary`, `text-ink-muted`, `text-ink-disabled` |
| Borders | `border-line` (hairlines), `border-line-faint`, `border-line-control` (inputs, at least 3:1), `border-line-selected` |
| Fills (translucent, any surface) | `bg-fill-subtle`, `bg-fill`, `bg-fill-strong`, `hover:bg-fill-hover`, `bg-fill-selected` |
| Accent | `text-accent-text` (links, active), `bg-accent` / `hover:bg-accent-hover` (primary), `bg-accent-subtle` (active item), `border-accent-highlight`, `hover:border-accent-border` |
| Text on accent | `text-ink-on-accent` |
| Status | `text-success`, `bg-success-bg`, `border-success-border`, `bg-success-solid`, and the same for `warning`, `danger` and `info` |
| Data viz series | `chart-1` … `chart-6`, `chart-neutral` (`fill-chart-1`, `stroke-chart-2`, `bg-chart-3`) |
| Radius | `rounded-control` (8px), `rounded-field` (10px), `rounded-tile` (12px), `rounded-card` (16px), `rounded-pill` |
| Shadow | `shadow-control`, `shadow-raised`, `shadow-overlay`, `hover:shadow-card-hover` |
| Focus | `outline-focus` with `focus-visible:outline focus-visible:outline-2` |
| Fonts | `font-ui`, `font-code` |
| Layout | `grid-cols-content-aside` (text beside a sized column), `grid-cols-aside-content`, `h-workspace` (a tool's working area: maps, canvases), `h-embed` (an embedded page) |

Tailwind's spacing, sizing and type scale (`p-6`, `gap-4`, `text-sm`, `w-64`) are the spacing and type tokens; use them as they are. If a value isn't covered, add a named token to `tailwind.config.js` (and `src/styles/tokens.css` if it needs a CSS value). Don't use an arbitrary value.

In `<style scoped>`, use `@apply` with the same names, or `var(--tc-…)` / `var(--app-…)`. Never use a hex or `rgb()` value.

## Components (`import { … } from '../components/ui'`)

| Component | For |
| --- | --- |
| `PageShell` | Every page's frame: docs drawer, breadcrumbs, scrolling body. `width="default \| wide \| full"`. Replaces the `DocumentationDrawer` + `margin-left` + `Breadcrumbs` + `MarkdownViewer` scaffolding (index pages that drive the reference doc from the route use `v-model:doc-link`, see `Tools.vue`). |
| `PageHero` | Title block: `eyebrow` (or `back="{ to, label }"` on tool and detail pages), `title`, `lead`, `spot`, `size="page \| tool"`, `#actions` slot |
| `PageSection` | A section with `title`, `description`, `#actions`; `divided` on every section after the first |
| `SpotArt` | An illustration: `name="folder/name"`, `size="xs \| sm \| md \| lg \| xl \| hero"` |
| `UiCard`, `UiLinkRow` | Link cards with a spot (grids), and compact link rows (shortlists) |
| `UiPanel` | A bordered container with `title`, `description`, `#actions`, `#footer`; `flush` for tables |
| `UiButton` | `variant="primary \| secondary \| ghost \| danger"`, `size="md \| sm"`, `icon`, `icon-only` + `label`, `to`/`href`, `loading` |
| `UiLink` | Text links; `arrow`, `external` |
| `UiInput`, `UiTextarea`, `UiSelect`, `UiCheckbox`, `UiSwitch`, `UiSegmented`, `UiRange` | Form controls with label, hint and error built in (`v-model`) |
| | Options: `hide-label` keeps the label for assistive technology only; `size="sm"` for dense rows (UiInput, UiSelect); UiInput has a `#trailing` slot and `focus()`; UiSelect takes option groups `{ group, options }`; UiSegmented options take `disabled` and `srLabel`; UiTextarea has `#label-aside` |
| `UiField` | The label, hint and error frame, for a control the kit doesn't have (slot props `id`, `describedBy`, `invalid`) |
| `UiTabs` | Tabs with arrow-key support; panels in slots named after each tab's value |
| `UiTable` | Styles a native `<table>` (`caption` required); put it in `<UiPanel flush>` |
| `UiChip` | Status and category labels; `tone` |
| `UiCallout` | Notes in the page flow; `tone="info \| success \| warning \| danger"` |
| `InlineNotice` (`src/components`) | Dismissable results of an action, with `useNotice()` |
| `UiStat` | A figure with its label; `#footer` for a trend, meter or link |
| `UiEmptyState` | Nothing yet, or not set up: spot, title, body, actions |
| `UiSpinner` | Loading |
| `UiCode`, `UiCodeBlock` | Inline code, and generated code with a copy button |
| `UiDialog` | Modals (`v-model:open`, `#footer`; `size="full"` for full-screen editors) |
| `UiSwatch` | A colour from data or user input (`flush` for edge-to-edge strips) |
| `UiColorSample` | An element filled with a data colour that holds content (a palette cell, a demo button) |
| `UiDesignedButton` | A button drawn from a style object the user is designing (button builders) |
| `UiTypeSample` | Text set in a size, family, weight or line height from data (type scales, font stacks) |
| `UiMeter` | A bar for a value out of a maximum: shares, scores, budgets (`label` makes it a meter; `marker` for a threshold) |
| `UiFileDropZone` | Drop area and file picker, with the chosen file's name and size |
| `UiRadioChoices`, `UiChoiceCards` | Radio groups for longer options: plain rows, or cards with an icon and a description |

If a page needs something the kit doesn't have and it will recur, add a component to `src/components/ui` (tokens only, documented at the top, exported from `index.js`). Don't hand-build it in the page.

## Colours and sizes from data

A colour the user picked, a gradient they built, a shadow they're designing, a chart series from a dataset: these aren't design colours, so they can't be tokens. Pass them to CSS through `v-bind()` in a `<style>` block, never `style=`:

```vue
<div class="preview" />
<style scoped>
.preview { background: v-bind(gradientCss); }
</style>
```

`UiSwatch` does this for single colours. Charts draw series colours as SVG `fill`/`stroke` attributes from their data, which is fine; their axes, gridlines and labels use tokens (`fill-chart-neutral`, `text-ink-muted`). Canvas libraries (Chart.js, html2canvas) can't read CSS variables: use `useChartTheme()` (`src/composables/useChartTheme.js`), which resolves the tokens to colours and re-reads them when the theme changes.

## Page recipe

```vue
<template>
  <PageShell>
    <PageHero :back="{ to: '/tools', label: 'Tools' }" title="Gradient generator"
      lead="Build CSS gradients with custom stops and copy the code." spot="tools/gradient-generator" size="tool" />
    <PageSection title="Build" description="Pick a type and add stops.">
      <div class="grid lg:grid-cols-2 gap-6">
        <UiPanel title="Settings">…UiSegmented, UiRange, UiInput…</UiPanel>
        <UiPanel title="Preview">…</UiPanel>
      </div>
    </PageSection>
    <PageSection title="Code" divided><UiCodeBlock :code="css" label="CSS" /></PageSection>
  </PageShell>
</template>
```

- **Headline:** the page name. The eyebrow is the section it belongs to (index pages), or a back link (tool and detail pages).
- **Card titles:** sentence case ("Gradient generator").
- **Repeated markup:** turn it into a data array and a `v-for`.
- **Picking an illustration:** use the closest one under `src/assets/illustrations/spot/<folder>/`. The folders are `site`, `foundations`, `tools`, `guidelines`, `laws`, `patterns`, `research`, `ai`, `admin`, `principles` and `references`. Prefer a page-specific one (for example `admin/user-management`).
- **Keep behaviour:** keep every control, handler, API call, route, emitted event and piece of copy that does something. Restyle; don't redesign features. Drop decorative fluff: gradient banners, fake stats, "Updated today" lines.
- **Accessibility:**
  - every control is labelled (the kit's controls take `label`);
  - icon-only buttons take `label`;
  - tables take a `caption`;
  - status changes go through `InlineNotice` or `UiCallout role="status"`.
- **Remove dead code:** delete the `isDarkMode` refs, MutationObservers and `setInterval` theme polling that only fed the old styling, and any `<style>` rules the page no longer uses.

## Check

```bash
npm run check:styles
```

Then `npm run check:sfc`, `npm test` and `npx vite build`. Look at the page in light and dark, switching without reloading, and try each control once.
