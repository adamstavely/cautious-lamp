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

### 2. **Performance Section**
- Component-specific performance metrics
- Bundle size information (Vue, React, Total, Gzipped)
- Dependency information
- Performance status (Optimal, Warning, Error)
- Auto-loads from API on component page mount

### 3. **Live Preview Section**
- Interactive examples of the component
- Shows the component in action

### 4. **Variants Section**
- Different visual styles and variations
- Code examples for each variant
- Use cases and descriptions

### 5. **API Reference Section**
- Props table with:
  - Prop name
  - Type
  - Default value
  - Description

### 6. **Usage Examples**
- Common patterns and use cases
- Code snippets showing real-world implementations

### 7. **Best Practices**
- Recommended patterns and guidelines
- Multiple examples with explanations
- Code snippets showing correct usage
- Green-themed cards with check icons

### 8. **Anti-Patterns**
- Common mistakes to avoid
- Examples of incorrect usage
- Explanations of why patterns are problematic
- Red-themed cards with error icons

### 9. **Accessibility Section**
- Accessibility guidelines
- Best practices
- WCAG compliance notes

### 10. **Related Components**
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

### Step 4: Add Performance Section

Add the performance metrics section directly above the Version History section:

```vue
<!-- Performance Section -->
<div class="max-w-7xl mx-auto mb-16">
  <div class="rounded-lg shadow-sm border overflow-hidden" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
    <div class="p-6 border-b flex items-center justify-between" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
      <h2 class="text-xl font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
        <span class="material-symbols-outlined text-2xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">speed</span>
        Performance Metrics
      </h2>
      <button v-if="performanceData" @click="loadPerformanceData" class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2" :class="isDarkMode ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'">
        <span class="material-symbols-outlined text-base">refresh</span>
        Refresh
      </button>
    </div>
    <!-- Performance metrics cards -->
  </div>
</div>
```

In the script section, add:

```javascript
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const performanceData = ref(null);
const performanceLoading = ref(false);

const API_BASE_URL = 'http://localhost:3000/api/v1';
const API_KEY = 'test-api-key-123';

// Map route paths to component IDs
const getComponentId = () => {
  const routeToIdMap = {
    '/components/buttons': 'button',
    '/components/your-component': 'your-component-id',
    // Add your component route mapping here
  };
  return routeToIdMap[route.path] || null;
};

const formatSize = (bytes) => {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const getPerformanceStatusClass = (status) => {
  if (status === 'error') return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
  if (status === 'warning') return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
  return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
};

const loadPerformanceData = async () => {
  const componentId = getComponentId();
  if (!componentId) {
    performanceData.value = null;
    return;
  }

  performanceLoading.value = true;
  try {
    const response = await axios.post(
      `${API_BASE_URL}/performance/bundle-analysis/analyze`,
      { componentId, includeDependencies: true },
      { headers: { Authorization: `Bearer ${API_KEY}` } }
    );
    performanceData.value = response.data;
  } catch (error) {
    console.error('Error loading performance data:', error);
    performanceData.value = null;
  } finally {
    performanceLoading.value = false;
  }
};

// Call in onMounted
onMounted(() => {
  // ... existing code ...
  loadPerformanceData();
});
```

**Important**: Update the `routeToIdMap` in `getComponentId()` to include your component's route path and corresponding component ID from the backend.

### Step 5: Update Live Preview

Replace the preview examples with your component:

```vue
<div class="flex flex-wrap items-center gap-4">
  <!-- Your component examples here -->
</div>
```

### Step 6: Update Variants Section

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

### Step 7: Update API Reference Table

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

### Step 8: Add Usage Examples

Add real-world usage examples:

```vue
<div class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Example Title</h3>
  <div class="bg-gray-900 dark:bg-slate-950 rounded-lg p-4 overflow-x-auto mb-4">
    <pre class="text-green-400 text-sm font-mono"><code><!-- Code example --></code></pre>
  </div>
</div>
```

### Step 9: Add Best Practices Section

Add a Best Practices section after Usage Examples and before Accessibility:

```vue
<!-- Best Practices -->
<div class="max-w-7xl mx-auto mb-16">
  <div class="mb-8">
    <h2 class="text-3xl font-bold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Best Practices</h2>
    <p :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Recommended patterns and guidelines for using the [Component] component effectively.</p>
  </div>
  
  <div class="space-y-6">
    <div 
      class="rounded-2xl border p-8"
      :class="isDarkMode 
        ? 'bg-green-900/20 border-green-800' 
        : 'bg-green-50 border-green-200'"
    >
      <div class="flex items-start gap-4">
        <span class="material-symbols-outlined text-3xl flex-shrink-0" :class="isDarkMode ? 'text-green-400' : 'text-green-600'">check_circle</span>
        <div class="flex-1">
          <h3 class="text-xl font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Practice Title</h3>
          <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
            Explanation of the best practice and why it's important.
          </p>
          <div class="rounded-lg p-4 overflow-x-auto mb-4" :class="isDarkMode ? 'bg-slate-950' : 'bg-gray-900'">
            <pre class="text-green-400 text-sm font-mono" v-pre><code>&lt;!-- Good: Example code --&gt;
&lt;YourComponent prop="value" /&gt;</code></pre>
          </div>
        </div>
      </div>
    </div>
    <!-- Add more best practices... -->
  </div>
</div>
```

### Step 10: Add Anti-Patterns Section

Add an Anti-Patterns section after Best Practices:

```vue
<!-- Anti-Patterns -->
<div class="max-w-7xl mx-auto mb-16">
  <div class="mb-8">
    <h2 class="text-3xl font-bold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Anti-Patterns</h2>
    <p :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Common mistakes to avoid when using the [Component] component.</p>
  </div>
  
  <div class="space-y-6">
    <div 
      class="rounded-2xl border p-8"
      :class="isDarkMode 
        ? 'bg-red-900/20 border-red-800' 
        : 'bg-red-50 border-red-200'"
    >
      <div class="flex items-start gap-4">
        <span class="material-symbols-outlined text-3xl flex-shrink-0" :class="isDarkMode ? 'text-red-400' : 'text-red-600'">error</span>
        <div class="flex-1">
          <h3 class="text-xl font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Anti-Pattern Title</h3>
          <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
            Explanation of the anti-pattern and why it's problematic.
          </p>
          <div class="rounded-lg p-4 overflow-x-auto mb-4" :class="isDarkMode ? 'bg-slate-950' : 'bg-gray-900'">
            <pre class="text-red-400 text-sm font-mono" v-pre><code>&lt;!-- Bad: Anti-pattern example --&gt;
&lt;YourComponent prop="bad-value" /&gt;

&lt;!-- Good: Correct usage --&gt;
&lt;YourComponent prop="good-value" /&gt;</code></pre>
          </div>
        </div>
      </div>
    </div>
    <!-- Add more anti-patterns... -->
  </div>
</div>
```

### Step 11: Update Accessibility Section

Customize accessibility guidelines for your component:

```vue
<li class="flex items-start gap-2">
  <span class="text-blue-600 dark:text-blue-400 mt-1">•</span>
  <span>Your accessibility guideline here</span>
</li>
```

### Step 12: Update Related Components

Update the related components section with relevant links:

```vue
<router-link to="/components/related-component" class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all group">
  <!-- Component card content -->
</router-link>
```

### Step 13: Add Route

Add the route in `main.js`:

```javascript
{
  path: '/components/your-component',
  component: () => import('./views/ComponentYourComponent.vue'),
},
```

### Step 14: Update Breadcrumbs

Add the route to the Breadcrumbs component's path labels:

```javascript
const pathLabels = {
  '/components/your-component': 'Your Component',
  // ... other labels
};
```

### Step 15: Update Documentation Drawer

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

