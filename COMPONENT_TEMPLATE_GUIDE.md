# Component Page Template Guide

This guide explains how to use the component page template to create documentation pages for new components.

## Template Structure

The component page template (`ComponentButton.vue`) includes the following sections:

### 1. **Hero Section**
- Component name and title
- Status badge (Production Ready, In Progress, Planned, Deprecated)
- Description
- Version and last updated information
- Custom SVG icon

### 2. **Live Preview Section**
- Interactive examples of the component
- Shows the component in action

### 3. **Variants Section**
- Different visual styles and variations
- Code examples for each variant
- Use cases and descriptions

### 4. **API Reference Section**
- Props table with:
  - Prop name
  - Type
  - Default value
  - Description

### 5. **Usage Examples**
- Common patterns and use cases
- Code snippets showing real-world implementations

### 6. **Accessibility Section**
- Accessibility guidelines
- Best practices
- WCAG compliance notes

### 7. **Related Components**
- Links to related components
- Cards showing how components work together

## How to Create a New Component Page

### Step 1: Copy the Template

```bash
cp frontend/src/views/ComponentButton.vue frontend/src/views/Component[Name].vue
```

### Step 2: Update the Component Name

Replace all instances of "Button" with your component name:
- Page title
- Hero section heading
- SVG icon (if needed)
- Route path

### Step 3: Customize the Hero Section

Update the hero section with your component's information:

```vue
<h1 class="text-5xl md:text-6xl font-bold text-white leading-tight">
  Your Component Name
</h1>
<span class="px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-300 border border-green-400/30">
  Production Ready
</span>
<p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-4">
  Your component description here.
</p>
```

### Step 4: Update Live Preview

Replace the preview examples with your component:

```vue
<div class="flex flex-wrap items-center gap-4">
  <!-- Your component examples here -->
</div>
```

### Step 5: Update Variants Section

Add your component's variants:

```vue
<div class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
  <div class="mb-6">
    <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Variant Name</h3>
    <p class="text-gray-600 dark:text-gray-400 text-sm">Description of when to use this variant.</p>
  </div>
  <div class="bg-gray-50 dark:bg-slate-900 rounded-lg p-6 mb-4">
    <!-- Your component example -->
  </div>
  <div class="bg-gray-900 dark:bg-slate-950 rounded-lg p-4 overflow-x-auto">
    <pre class="text-green-400 text-sm font-mono"><code><!-- Code example --></code></pre>
  </div>
</div>
```

### Step 6: Update API Reference Table

Update the props table with your component's props:

```vue
<tr class="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
  <td class="px-6 py-4 whitespace-nowrap">
    <code class="text-sm font-mono text-indigo-600 dark:text-indigo-400">propName</code>
  </td>
  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
    <code class="text-xs font-mono bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">type</code>
  </td>
  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
    <code class="text-xs font-mono bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">defaultValue</code>
  </td>
  <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
    Description of the prop.
  </td>
</tr>
```

### Step 7: Add Usage Examples

Add real-world usage examples:

```vue
<div class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Example Title</h3>
  <div class="bg-gray-900 dark:bg-slate-950 rounded-lg p-4 overflow-x-auto mb-4">
    <pre class="text-green-400 text-sm font-mono"><code><!-- Code example --></code></pre>
  </div>
</div>
```

### Step 8: Update Accessibility Section

Customize accessibility guidelines for your component:

```vue
<li class="flex items-start gap-2">
  <span class="text-blue-600 dark:text-blue-400 mt-1">•</span>
  <span>Your accessibility guideline here</span>
</li>
```

### Step 9: Update Related Components

Update the related components section with relevant links:

```vue
<router-link to="/components/related-component" class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all group">
  <!-- Component card content -->
</router-link>
```

### Step 10: Add Route

Add the route in `main.js`:

```javascript
{
  path: '/components/your-component',
  component: () => import('./views/ComponentYourComponent.vue'),
},
```

### Step 11: Update Breadcrumbs

Add the route to the Breadcrumbs component's path labels:

```javascript
const pathLabels = {
  '/components/your-component': 'Your Component',
  // ... other labels
};
```

### Step 12: Update Documentation Drawer

Add the component to the componentItems array in `DocumentationDrawer.vue`:

```javascript
const componentItems = [
  // ... existing items
  { text: 'Your Component', link: '/components/your-component', icon: 'your_icon' },
];
```

## Customization Tips

1. **Status Badges**: Use different colors based on status:
   - Production Ready: `bg-green-500/20 text-green-300 border-green-400/30`
   - In Progress: `bg-yellow-500/20 text-yellow-300 border-yellow-400/30`
   - Planned: `bg-blue-500/20 text-blue-300 border-blue-400/30`
   - Deprecated: `bg-red-500/20 text-red-300 border-red-400/30`

2. **Icons**: Use Material Symbols icons from `material-symbols-outlined` class

3. **Code Blocks**: Use the dark code block style:
   ```vue
   <div class="bg-gray-900 dark:bg-slate-950 rounded-lg p-4 overflow-x-auto">
     <pre class="text-green-400 text-sm font-mono"><code><!-- code --></code></pre>
   </div>
   ```

4. **Dark Mode**: All sections support dark mode automatically through Tailwind's `dark:` prefix

5. **Responsive Design**: The template is fully responsive with mobile-first breakpoints

## Example: Creating a Card Component Page

1. Copy `ComponentButton.vue` to `ComponentCard.vue`
2. Replace "Button" with "Card" throughout
3. Update hero section with Card description
4. Add Card variants (default, elevated, outlined, etc.)
5. Update props table with Card-specific props (title, content, actions, etc.)
6. Add Card usage examples
7. Update related components to show Forms, Buttons, etc.
8. Add route: `/components/cards`
9. Update breadcrumbs and drawer

## Best Practices

- Keep descriptions clear and concise
- Provide multiple examples showing different use cases
- Include accessibility guidelines specific to your component
- Link to related components that work well together
- Keep code examples simple and easy to understand
- Update version and last updated dates when making changes
- Use consistent styling and formatting throughout

