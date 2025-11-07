# Design System API SDK

JavaScript SDK for accessing the Design System API.

## Installation

```bash
npm install @designsystem/api
```

## Usage

```javascript
import { DesignSystemAPI } from '@designsystem/api';

const api = new DesignSystemAPI({
  apiKey: 'YOUR_API_KEY',
  baseURL: 'http://localhost:3000/api/v1' // Optional, defaults to localhost
});

// Get all tokens
const { tokens } = await api.tokens();

// Get tokens by category
const { tokens: colors } = await api.tokensByCategory('colors');

// Get a specific token
const primaryColor = await api.token('color.primary');

// Get all components
const { components } = await api.components();

// Get a specific component
const button = await api.component('button');

// Get components by status
const { components: productionComponents } = await api.componentsByStatus('production');
```

## API Reference

### Constructor

```typescript
new DesignSystemAPI(options: {
  apiKey: string;
  baseURL?: string;
})
```

### Methods

- `tokens()` - Get all tokens
- `tokensByCategory(category: string)` - Get tokens by category
- `token(name: string)` - Get a specific token by name
- `tokensFiltered(filters)` - Get tokens with filters (category, type, tag)
- `components(status?: string)` - Get all components, optionally filtered by status
- `component(id: string)` - Get a specific component by ID
- `componentsByStatus(status: string)` - Get components by status
- `health()` - Check API health
- `createApiKey(name: string)` - Create a new API key

