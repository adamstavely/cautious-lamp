# Component page template guide

How to build a documentation page for a component in the app. The template is `frontend/src/views/ComponentButton.vue` (route `/components/buttons`); `ComponentColorPicker.vue` follows the same layout. Both are built from the design system's own page components and tokens, as every page must be. Read [frontend/RESKIN_GUIDE.md](./frontend/RESKIN_GUIDE.md) first: it lists the tokens and ui components this guide uses.

## Page structure

`ComponentButton.vue` is a `PageShell` holding a `PageHero` and a run of `PageSection`s:

| Section | What it holds |
| --- | --- |
| Hero | `PageHero` with a back link to `/components`, the title, a lead, a spot illustration and the lifecycle status as a `UiChip` |
| Breaking change alert | `BreakingChangeAlert`, shown when the component's versions include a breaking change |
| Playground | A props editor (`UiInput`, `UiSelect`, `UiCheckbox`), a live preview and generated code (`UiCodeBlock`) |
| Variants | Example variants, and a variant builder |
| API reference | Props in a `UiTable` inside `<UiPanel flush>` |
| Usage examples | `UiPanel`s with `UiCodeBlock`s |
| Accessibility | A `UiCallout` with the component's accessibility notes |
| Performance metrics | Measured bundle size from the API, as `UiStat`s |
| Version history | `ComponentVersionHistory`, from the design-system changelog (`useComponentChangelog`, `GET /api/v1/changelog/components/:id`) |
| Dependencies | `ComponentDependencyGraphCard` |
| Best practices and anti-patterns | `UiPanel`s marked with a "Do" (`tone="success"`) or "Avoid" (`tone="danger"`) `UiChip` |
| Related components | `UiCard` links |

The examples, best practices and anti-patterns are data in `frontend/src/data/componentButtonExamples.js`, rendered with `v-for`. Put a new component's in its own data file.

## Create a page

### 1. Copy the template

```bash
cp frontend/src/views/ComponentButton.vue frontend/src/views/ComponentCard.vue
cp frontend/src/data/componentButtonExamples.js frontend/src/data/componentCardExamples.js
```

Rename everything that says Button, replace the examples, and drop sections the component doesn't need.

### 2. The hero

```vue
<PageShell width="wide">
  <PageHero
    :back="{ to: '/components', label: 'Components' }"
    title="Card"
    lead="Groups related content and actions."
    spot="foundations/component-composition"
    size="tool"
  >
    <template #actions>
      <UiChip v-if="componentStatus" :tone="componentStatus.tone">{{ componentStatus.label }}</UiChip>
    </template>
  </PageHero>
  …
</PageShell>
```

- Pick the closest illustration under `frontend/src/assets/illustrations/spot/` (component pages use `foundations/component-*`). There are no hand-drawn SVGs or icon heroes.
- The status comes from the component library: `const componentStatus = useComponentStatus('card')` (`src/composables/useComponentPatternStatus.js`, which reads `GET /api/v1/components/card`). The id must exist in the library; components are stored in Elasticsearch.

### 3. Sections

```vue
<PageSection title="Usage examples" description="Common patterns for the Card component." divided>
  <div class="space-y-6">
    <UiPanel v-for="example in usageExamples" :key="example.title" :title="example.title" :description="example.description">
      <UiCodeBlock :code="example.code" label="Example" />
    </UiPanel>
  </div>
</PageSection>
```

Every section after the first takes `divided`. Headings are sentence case, and the page has one `h1` (the hero's title).

Props table:

```vue
<UiPanel flush>
  <UiTable caption="Card props">
    <thead>
      <tr><th scope="col">Prop</th><th scope="col">Type</th><th scope="col">Default</th><th scope="col">Description</th></tr>
    </thead>
    <tbody>
      <tr v-for="prop in props" :key="prop.name">
        <th scope="row"><UiCode>{{ prop.name }}</UiCode></th>
        <td><UiCode>{{ prop.type }}</UiCode></td>
        <td><UiCode>{{ prop.default }}</UiCode></td>
        <td>{{ prop.description }}</td>
      </tr>
    </tbody>
  </UiTable>
</UiPanel>
```

### 4. Data from the API

Call the backend through the shared client, `apiClient` from `src/services/api.js`. It adds the signed-in user's token, uses the configured base URL (empty in development, so Vite proxies `/api` to the backend) and handles a `401` by sending the user to sign in. Never put an API key in frontend code.

```js
import apiClient from '../services/api.js';

const performanceData = ref(null);
const performanceLoading = ref(false);

const loadPerformanceData = async () => {
  performanceLoading.value = true;
  try {
    const { data } = await apiClient.post('/api/v1/performance/bundle-analysis/analyze', {
      componentId: 'card',
      includeDependencies: true,
    });
    performanceData.value = data;
  } catch (error) {
    console.error('Error loading performance data:', error);
    performanceData.value = null;
  } finally {
    performanceLoading.value = false;
  }
};

onMounted(loadPerformanceData);
```

In the template, show `UiSpinner` while loading and `UiEmptyState` or a `UiCallout` when there's nothing, never made-up figures. The template maps routes to component ids in `getComponentId()`; add your route there if you reuse that function.

### 5. Icons

Icons are Lucide, by name: `<AppIcon name="circle-check" />`, or the `icon` prop on `UiButton`, `UiChip`, `UiStat` and `UiCallout`. An icon that isn't in `frontend/src/components/ui/icons.js` yet goes there (import plus an `ICONS` entry). Icon-only buttons take `icon-only` and a `label`. No icon fonts, emoji or inline SVG icons. `npm run check:icons` fails on Material Symbols markup and on icon names that `icons.js` doesn't have.

### 6. Styling

Use the token utilities from `tailwind.config.js` and the ui kit: `bg-surface-raised`, `text-ink-muted`, `border-line`, `rounded-card` and so on. Tokens follow the theme, so there are no `dark:` variants and no `isDarkMode` checks. No inline styles, no arbitrary values (`text-[#…]`), no raw palette classes (`bg-indigo-600`). A colour that comes from data goes through `UiSwatch`, `UiColorSample` or `v-bind()` in a `<style>` block.

### 7. Route, breadcrumb and checks

1. Add the route in `frontend/src/main.js`, next to the other component pages:
   ```js
   {
     path: '/components/cards',
     component: () => import('./views/ComponentCard.vue'),
   },
   ```
2. Add its label to the path labels in `frontend/src/components/Breadcrumbs.vue`:
   ```js
   '/components/cards': 'Cards',
   ```
3. Add the file to `frontend/scripts/reskinned.json` so the style check covers it.
4. From `frontend/`, run:
   ```bash
   npm run check:styles
   npm run check:sfc
   npm run check:icons
   npm test
   ```
5. Look at the page in light and dark, and try each control with the keyboard.

## Checklist

- [ ] Hero with back link, spot illustration and status from the library
- [ ] Examples in a data file, rendered with `v-for`
- [ ] API calls through `apiClient`, with loading and empty states
- [ ] Icons through `AppIcon` or `icon` props
- [ ] Tokens and ui components only
- [ ] Route in `main.js`, breadcrumb label, entry in `reskinned.json`
- [ ] Checks pass
