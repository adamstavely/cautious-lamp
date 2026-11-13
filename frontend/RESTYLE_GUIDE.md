# Restyle guide: from the old look to the clean look

This guide is for moving the rest of the site over to the new styling. The homepage, side nav, top nav, docs drawer, breadcrumbs, Design Assets, Tools and SVG placeholder text pages are already done (PR #12). Use them as the reference whenever this guide and your judgement disagree.

## What changed, in one paragraph

The old look used dark slate gradient heroes, a purple-to-indigo page wash, Material icons in indigo, and indigo gradient bands. The new look is quiet: plain white (slate-950 in dark mode), hairline slate borders, one accent blue taken from the Trench Coat illustrations, pill-shaped buttons, and a Trench Coat spot illustration wherever there used to be a big icon or decorative SVG.

## Colors

Use one accent, with a light-mode and dark-mode value. Everything else is Tailwind's `slate` scale.

| Role | Light | Dark |
| --- | --- | --- |
| Page surface | `bg-[#fff]` | `dark:bg-slate-950` |
| Text | `text-slate-900` | `dark:text-slate-100` / `dark:text-white` |
| Secondary text | `text-slate-600` | `dark:text-slate-400` |
| Faint text, icons | `text-slate-400` / `text-slate-500` | `dark:text-slate-500` |
| Borders | `border-slate-200` | `dark:border-slate-800` |
| Hover fill | `hover:bg-slate-50` / `hover:bg-slate-100` | `dark:hover:bg-slate-900` |
| **Accent** (links, active, primary) | `#2f5ea8` | `#9dbcf0` |
| Accent hover (primary button) | `#264d8b` | `#b8cff5` |
| Accent wash (active item, callout) | `bg-[#f2f6fd]` | `dark:bg-[#263a5c]/40` |
| Accent border (card hover) | `#8fb0e8` | `#6f93d1` |
| Accent hairline (chips) | `#dce8fb` | `#263a5c` |

The accent is the ink color of the spot illustrations, so pages and art match. Don't add new blues or bring back indigo or purple.

### Old → new class mapping

| Old | New |
| --- | --- |
| `bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 …` (page wash) | `bg-[#fff] dark:bg-slate-950 text-slate-900 dark:text-slate-100` |
| `bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 …` (hero banner) | Plain hero, see [Page anatomy](#page-anatomy) |
| `bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-700 …` (feature band) | A normal section with `.card`s or a `.tool` list |
| `text-indigo-600` / `dark:text-indigo-400` | `text-[#2f5ea8]` / `dark:text-[#9dbcf0]` |
| `bg-indigo-600 text-white hover:bg-indigo-700` | `.btn .btn-primary` |
| `border-2 border-indigo-600 text-indigo-600 …` | `.btn .btn-secondary` |
| `bg-indigo-50` / `dark:bg-indigo-900/20` (active) | `bg-[#f2f6fd]` / `dark:bg-[#263a5c]/40` |
| `text-gray-*`, `border-gray-*`, `bg-gray-*` | Same step on `slate-*` |
| `shadow-lg` / `shadow-xl` on panels | No shadow; `border border-slate-200 dark:border-slate-800` |
| `rounded-lg` buttons | `rounded-full` |
| `material-symbols-outlined text-5xl` card icon | A spot illustration, see [Spot illustrations](#spot-illustrations) |
| `:class="isDarkMode ? 'a' : 'b'"` | `class="b dark:a"` |

## Page anatomy

Most pages are a hero followed by sections separated by hairlines.

```html
<div class="w-full h-full bg-[#fff] dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative flex">
  <!-- keep DocumentationDrawer, the margin-left logic and Breadcrumbs exactly as they were -->
  <div class="max-w-6xl mx-auto px-6 md:px-10 py-12 md:py-16">

    <!-- Hero -->
    <section class="grid md:grid-cols-[1fr_auto] items-center gap-10 pb-14 md:pb-16 border-b border-slate-200 dark:border-slate-800">
      <div>
        <p class="text-sm font-medium tracking-wide text-[#2f5ea8] dark:text-[#9dbcf0] mb-4">Foundations</p>
        <h1 class="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05] mb-5">Design assets</h1>
        <p class="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">One or two sentences.</p>
      </div>
      <div class="spot hidden md:block w-64 h-64 lg:w-72 lg:h-72" aria-hidden="true" v-html="spot('foundations/design-assets')"></div>
    </section>

    <!-- Section -->
    <section class="py-14 md:py-16">
      <div class="section-head">
        <h2>Browse assets</h2>
        <p>One line of context.</p>
      </div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <router-link v-for="item in items" :key="item.to" :to="item.to" class="card group">
          <div class="spot w-16 h-16 -ml-1 mb-2" aria-hidden="true" v-html="spot(item.art)"></div>
          <h3 class="card-title">
            {{ item.title }}
            <span class="material-symbols-outlined arrow" aria-hidden="true">arrow_forward</span>
          </h3>
          <p class="card-body">{{ item.body }}</p>
        </router-link>
      </div>
    </section>

    <!-- Later sections add a top hairline -->
    <section class="py-14 md:py-16 border-t border-slate-200 dark:border-slate-800">…</section>
  </div>
</div>
```

Conventions:

- **The headline is the page name** ("Tools", "Design assets"). The small blue line above it is the section the page belongs to, or a short tagline.
- **Tool and detail pages** use a smaller hero (`text-4xl md:text-5xl`, illustration `w-48 h-48 lg:w-56 lg:h-56`), and the small blue line becomes a back link: `← Tools`.
- **Card titles use sentence case**: "Gradient generator", not "Gradient Generator".
- Turn hand-written repeated cards into a data array and a `v-for` (see `Tools.vue`). It makes the template a fraction of the size and keeps the cards consistent.

## Shared classes

These currently live in each view's `<style scoped>`. Copy the ones you need from `src/views/Home.vue`; they're all `@apply` one-liners.

| Class | Use |
| --- | --- |
| `.spot` | Wrapper for an inlined illustration. Needs `.spot :deep(svg) { width: 100%; height: 100%; display: block; }` |
| `.section-head` | Section `h2` and its one-line description |
| `.card`, `.card-title`, `.card-body`, `.arrow` | Link cards with a hover border and the arrow nudge |
| `.tool` | Compact list row: small spot, title, one-line description |
| `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost` | Pill buttons |
| `.panel`, `.panel-body`, `.panel-foot` | Flat bordered container with an optional footer bar |
| `.chip`, `.chip-stable`, `.chip-beta`, `.chip-deprecated` | Status labels |
| `.callout`, `.steps`, `.code`, `.link` | Notes, numbered steps, inline code, text links |
| `.seg`, `.seg.on`, `.range` | Round toggles and sliders on tool pages (see `SVGPlaceholderTextGenerator.vue`) |

Once a few more pages are done, these should move into one shared stylesheet (or a small set of components) instead of being copied per view.

## Spot illustrations

The illustrations come from Trench Coat (`@adamstavely/trenchcoat`, folder `illustrations/spot/`). The package README indexes all 224 of them by folder: `site`, `foundations`, `tools`, `guidelines`, `laws`, `patterns`, `research`, `ai`, `admin`, `principles` and `references`.

To use one:

1. Copy the SVG into `src/assets/illustrations/spot/<folder>/<name>.svg`, keeping Trench Coat's folder name.
2. In the view, add `import { spot } from '../utils/spotIllustrations.js';`
3. Render it with `v-html="spot('<folder>/<name>')"` inside a sized `.spot` div, with `aria-hidden="true"`.

`spot()` inlines the SVG markup, so it follows the app's `.dark` class. Don't use `<img src>`: an image follows the operating system's theme, not the app toggle. Size them with the wrapper (48px to 320px works); keep them square, and keep text beside them, not inside.

If a page has no exact match, use the closest one and say which you picked in the PR. So far: Palette builder uses `foundations/color-palettes`, SVG placeholder text uses `guidelines/text-graphics`, and Photosensitivity uses `admin/photosensitivity-analysis`.

## Gotchas

These cost real time during the first pages. Check for them on every page.

1. **Never use `bg-white`.** A global stylesheet (from Vuetify) defines `.bg-white { background: #fff !important; color: #000 !important }`, which beats `dark:` variants and turns text black. Use `bg-[#fff]`.
2. **Outlined `<button>`s need `border-solid`.** A global reset sets `border-style: none` on buttons, so `border border-slate-200` alone shows nothing on a `<button>`. It works on `<a>` and `router-link`. Add `border-solid` (or `@apply … border border-solid …`).
3. **Don't use `<header>` for section headings.** A global `header` style leaks in and misaligns them. Use a `<div class="section-head">`.
4. **Don't mix a scoped class and Tailwind utilities that set the same property.** Scoped rules have higher specificity, so a utility like `sm:flex-row` loses to `.section-head { flex-direction: column }`. Put the variant in the scoped class instead (see `.section-head-split`).
5. **Dark-mode rules on pseudo-elements:** in `<style scoped>`, write `.range:is(.dark *)::-webkit-slider-thumb`. `:global(.dark) .range::…` is silently dropped.
6. **Remove `isDarkMode` ternaries and the polling that feeds them** (`MutationObserver` + `setInterval(…, 100)`) when a template no longer needs them. `dark:` variants handle it.
7. **If a component must keep JS theme detection, start it before any `await`.** `DocumentationDrawer` used to wait for a feature-flag request first; when that failed, it never followed theme changes.
8. **Keep the layout scaffolding:** `DocumentationDrawer`, `Breadcrumbs`, the `drawerOpen ? 'margin-left: 256px;' : 'margin-left: 48px;'` style, `sessionStorage.openDrawerOnLoad`, and any reference-doc (`MarkdownViewer`) branch. Only the content area changes.
9. **Don't invent content.** Drop the old "Updated {today's date}" hero lines (they always showed the current date), but don't add stats, badges or copy the page can't back up.

## Per-page checklist

- [ ] Root wrapper uses `bg-[#fff] dark:bg-slate-950 text-slate-900 dark:text-slate-100`
- [ ] Hero rebuilt to the anatomy above, with a matching spot illustration
- [ ] No `indigo`, `purple` or `gray` classes left (`grep -n "indigo\|purple\|gray-" <file>`)
- [ ] No `bg-white`, no `shadow-lg`/`shadow-xl` on cards or panels
- [ ] Buttons are `.btn` pills; outlined `<button>`s have `border-solid`
- [ ] `isDarkMode` ternaries replaced with `dark:` variants; unused observers removed
- [ ] Drawer, breadcrumbs and margin logic unchanged
- [ ] Icon-only buttons have an `aria-label`
- [ ] Checked in the browser in light **and** dark, including switching themes without reloading
- [ ] Interactive tools still work (try each control once)

## Status

| Done | To do |
| --- | --- |
| Homepage, side nav, top nav bar, docs drawer, breadcrumbs, Design Assets, Tools, SVG placeholder text | All other tool pages, Design Assets sub-pages (Country Flags and so on), Getting Started, Guidelines, HCD, Components, Tokens, Patterns, Review, Data Viz, Admin, and the top nav's dropdown menus |

## Known issues not caused by the restyle

- `npm run build` fails on `main` because of `src/views/ReviewPage.vue:407` ("Invalid end tag"). Use the dev server to check pages until that's fixed.
- At phone width the app scrolls sideways because the fixed side nav doesn't collapse.
