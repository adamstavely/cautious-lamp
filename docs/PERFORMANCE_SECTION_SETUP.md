# Performance Section Setup Guide

## Overview
The performance section on component pages displays bundle size metrics, dependencies, and browser support information. This guide explains what needs to be done to get performance data working.

## Current Status

### ✅ What's Working
1. **Frontend Implementation**: Performance section is added to component pages (ComponentButton.vue, ComponentColorPicker.vue)
2. **API Endpoint**: Backend has `/api/v1/performance/bundle-analysis/analyze` endpoint
3. **Error Handling**: Frontend gracefully handles missing components with "Performance data unavailable" message

### ⚠️ What Needs to Be Done

## 1. Component ID Mapping

The frontend maps route paths to component IDs. Currently mapped:

```javascript
const routeToIdMap = {
  '/components/buttons': 'button',        // ✅ Exists in backend
  '/components/color-picker': 'color-picker', // ❌ Does NOT exist in backend
  '/components/forms': 'input',           // ✅ Exists in backend
  '/components/cards': 'card',            // ✅ Exists in backend
  '/components/navigation': 'navigation',  // ❌ Does NOT exist in backend
  '/components/data-display': 'table'      // ❌ Does NOT exist in backend
};
```

### Backend Components Available
- ✅ `button` - Works
- ✅ `card` - Works
- ✅ `input` - Works
- ✅ `select` - Works
- ✅ `modal` - Works
- ❌ `color-picker` - **Needs to be added**
- ❌ `navigation` - **Needs to be added**
- ❌ `table` - **Needs to be added**

## 2. Add Missing Components to Backend

To get performance data for components that don't exist, you need to add them to the backend:

**File**: `backend/src/design-system/design-system.service.ts`

Add to the `components` array (around line 164):

```typescript
{
  id: 'color-picker',
  name: 'Color Picker',
  description: 'Color picker component with gradient selector and multiple format support',
  status: 'production',
  props: [
    // Add props here
  ],
  code: {
    vue: `<!-- Vue component code -->`,
    react: `/* React component code */`
  },
  dependencies: [],
  examples: [],
  accessibility: {
    wcag: 'AA',
    notes: 'WCAG 2.1 AA compliant'
  }
}
```

## 3. Update Route-to-ID Mapping

After adding components to the backend, update the mapping in component pages:

**Files**: 
- `frontend/src/views/ComponentButton.vue`
- `frontend/src/views/ComponentColorPicker.vue`

Update the `getComponentId()` function:

```javascript
const getComponentId = () => {
  const routeToIdMap = {
    '/components/buttons': 'button',
    '/components/color-picker': 'color-picker',  // ✅ Now works
    '/components/forms': 'input',
    '/components/cards': 'card',
    '/components/navigation': 'navigation',      // ✅ Now works
    '/components/data-display': 'table'          // ✅ Now works
  };
  return routeToIdMap[route.path] || null;
};
```

## 4. Browser Support Data

Currently, browser support is hardcoded in the frontend:

```javascript
const getSupportedBrowsers = () => {
  return [
    { name: 'Chrome', version: '90' },
    { name: 'Firefox', version: '88' },
    { name: 'Safari', version: '14' },
    { name: 'Edge', version: '90' }
  ];
};
```

### Option A: Keep Hardcoded (Current)
- Simple and works immediately
- Easy to customize per component
- No backend changes needed

### Option B: Add to Backend Component Data
Add `browserSupport` field to Component interface:

```typescript
export interface Component {
  // ... existing fields
  browserSupport?: {
    chrome?: string;
    firefox?: string;
    safari?: string;
    edge?: string;
  };
}
```

Then update frontend to use component data:

```javascript
const getSupportedBrowsers = () => {
  // Try to get from component data first
  if (performanceData.value?.browserSupport) {
    const support = performanceData.value.browserSupport;
    return [
      support.chrome && { name: 'Chrome', version: support.chrome },
      support.firefox && { name: 'Firefox', version: support.firefox },
      support.safari && { name: 'Safari', version: support.safari },
      support.edge && { name: 'Edge', version: support.edge }
    ].filter(Boolean);
  }
  
  // Fallback to defaults
  return [
    { name: 'Chrome', version: '90' },
    { name: 'Firefox', version: '88' },
    { name: 'Safari', version: '14' },
    { name: 'Edge', version: '90' }
  ];
};
```

## 5. Testing

After adding components:

1. **Test API Endpoint**:
   ```bash
   curl -X POST http://localhost:3000/api/v1/performance/bundle-analysis/analyze \
     -H "Authorization: Bearer test-api-key-123" \
     -H "Content-Type: application/json" \
     -d '{"componentId": "color-picker", "includeDependencies": true}'
   ```

2. **Check Component Page**: Navigate to `/components/color-picker` and verify performance data loads

3. **Verify Metrics**: Check that Vue Size, React Size, Total Size, Gzipped, and Dependencies are displayed correctly

## Summary Checklist

- [ ] Add missing components to backend (`color-picker`, `navigation`, `table`, etc.)
- [ ] Update route-to-ID mapping in component pages
- [ ] Test API endpoint returns data for each component
- [ ] Verify performance section displays correctly on all component pages
- [ ] (Optional) Add browser support to backend component data
- [ ] (Optional) Customize browser support per component if needed

## Current Behavior

- **Components that exist** (button, card, input, select, modal): Performance data loads automatically
- **Components that don't exist** (color-picker, navigation, table): Shows "Performance data unavailable" message
- **Error handling**: API errors are caught and displayed gracefully

## Next Steps

1. Add `color-picker` component to backend (highest priority - has a dedicated page)
2. Add other missing components as needed
3. Update route mappings
4. Test and verify

