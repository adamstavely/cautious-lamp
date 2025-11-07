# Loupe Tool

The Loupe Tool is a component inspector that allows developers and designers to identify design system components on any page and quickly access their documentation, source code, and design files.

## Works in Any Application

The Loupe Tool is designed to work in **any application** that uses design system components. It can be integrated into Vue, React, Angular, or vanilla JavaScript applications. See [LOUPE_TOOL_INTEGRATION.md](./LOUPE_TOOL_INTEGRATION.md) for integration instructions.

## Features

- **Keyboard Shortcut**: Press `Ctrl+Shift+L` (or `Cmd+Shift+L` on Mac) to activate/deactivate
- **Component Detection**: Automatically detects all design system components on the page
- **Visual Highlighting**: Highlights detected components with a blue overlay
- **Component Information**: Hover over components to see:
  - Component name
  - Import path
  - Links to:
    - Style Guide / Documentation
    - GitHub source code
    - Figma design file

## Usage

1. **Activate the Loupe Tool**: Press `Ctrl+Shift+L` (or `Cmd+Shift+L` on Mac)
2. **View Components**: All design system components on the page will be highlighted
3. **Hover for Details**: Hover over any highlighted component to see its information panel
4. **Access Links**: Click on any link in the info panel to open:
   - Documentation in a new tab
   - GitHub source code in a new tab
   - Figma design file in a new tab
5. **Deactivate**: Press `Ctrl+Shift+L` again or `Escape` to close

## Adding Components to the Loupe Tool

To make a component detectable by the Loupe Tool, add data attributes to the component's root element:

```vue
<template>
  <div 
    data-ds-component="component-name"
    data-ds-path="@design-system/components/component-name"
  >
    <!-- Component content -->
  </div>
</template>
```

### Data Attributes

- **`data-ds-component`** (required): The component identifier (e.g., "button", "card", "input")
- **`data-ds-path`** (optional): The import path for the component (e.g., "@design-system/components/button")

### Example

```vue
<template>
  <button
    data-ds-component="button"
    data-ds-path="@design-system/components/button"
    class="px-4 py-2 bg-indigo-600 text-white rounded-lg"
  >
    Click me
  </button>
</template>
```

## Component Metadata

Component metadata (name, links) is stored in two places:

1. **Frontend Service** (`frontend/src/services/componentMetadataService.js`): Local metadata for quick access
2. **Backend API** (`/api/v1/components/metadata`): Centralized metadata that can be updated

### Adding Component Metadata

#### Frontend (Local)

Edit `frontend/src/services/componentMetadataService.js`:

```javascript
const componentMetadata = {
  'your-component': {
    name: 'Your Component',
    path: '@design-system/components/your-component',
    links: {
      docs: '/components/your-component',
      github: 'https://github.com/your-org/design-system/tree/main/packages/components/src/YourComponent',
      figma: 'https://www.figma.com/file/your-design-system/components#your-component',
    },
  },
};
```

#### Backend (API)

The backend automatically generates metadata from registered components in `design-system.service.ts`. To add a new component:

1. Add the component to the `components` array in `backend/src/design-system/design-system.service.ts`
2. The metadata endpoint will automatically include it

## Customization

### Changing the Keyboard Shortcut

Edit `frontend/src/components/LoupeTool.vue`:

```javascript
const handleKeyDown = (event) => {
  // Change 'L' to your preferred key
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'YOUR_KEY') {
    // ...
  }
};
```

### Styling

The Loupe Tool uses CSS classes that can be customized:

- `.component-highlight`: The overlay highlighting detected components
- `.info-panel`: The information panel shown on hover
- `.instructions-overlay`: The instructions overlay in the top-right corner

## Integration with Applications

To use the Loupe Tool in applications that consume the design system:

1. **Include the Loupe Tool**: The tool is automatically available when using the design system
2. **Add Data Attributes**: Add `data-ds-component` attributes to your components
3. **Register Components**: Optionally register component metadata via the API

### Example Integration

```vue
<template>
  <div>
    <!-- Your application components -->
    <MyButton 
      data-ds-component="button"
      data-ds-path="@design-system/components/button"
    />
    
    <MyCard 
      data-ds-component="card"
      data-ds-path="@design-system/components/card"
    />
  </div>
</template>
```

## Troubleshooting

### Components Not Detected

1. Ensure the component has a `data-ds-component` attribute
2. Check that the attribute value matches a registered component name
3. Verify the component is rendered in the DOM (not hidden or conditionally rendered)

### Metadata Not Loading

1. Check browser console for API errors
2. Verify the backend API is running and accessible
3. Ensure API key is set in localStorage (`localStorage.setItem('apiKey', 'dev-key')`)

### Links Not Working

1. Verify the component metadata includes the correct links
2. Check that the links are valid URLs
3. Ensure the component is registered in the metadata service

## Future Enhancements

- Component props inspection
- Component variant detection
- Usage statistics
- Component dependency visualization
- Integration with design tokens

