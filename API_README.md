# Design System API

Complete REST API implementation for accessing design tokens and components.

## Features

- ✅ REST API endpoints for tokens and components
- ✅ API key authentication
- ✅ JavaScript SDK (`@designsystem/api`)
- ✅ CLI tool (`@designsystem/cli`)
- ✅ Filtering and search capabilities
- ✅ Health check endpoint

## Getting Started

### Backend API

The backend API runs on `http://localhost:3000/api/v1` by default.

#### Create an API Key

```bash
curl -X POST http://localhost:3000/api/v1/auth/api-keys \
  -H "Content-Type: application/json" \
  -d '{"name": "My API Key"}'
```

#### Get Tokens

```bash
curl -X GET http://localhost:3000/api/v1/tokens \
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### Get Components

```bash
curl -X GET http://localhost:3000/api/v1/components \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### JavaScript SDK

Install:
```bash
npm install @designsystem/api
```

Use:
```javascript
import { DesignSystemAPI } from '@designsystem/api';

const api = new DesignSystemAPI({
  apiKey: 'YOUR_API_KEY',
  baseURL: 'http://localhost:3000/api/v1'
});

const { tokens } = await api.tokens();
const button = await api.component('button');
```

### CLI Tool

Install:
```bash
npm install -g @designsystem/cli
```

Configure:
```bash
ds config set apiKey YOUR_API_KEY
```

Use:
```bash
ds tokens
ds token color.primary
ds components
ds component button --code react
```

## API Endpoints

- `GET /api/v1/tokens` - Get all tokens (supports ?category, ?type, ?tag filters)
- `GET /api/v1/tokens/:name` - Get a specific token
- `GET /api/v1/tokens/category/:category` - Get tokens by category
- `GET /api/v1/components` - Get all components (supports ?status filter)
- `GET /api/v1/components/:id` - Get a specific component
- `GET /api/v1/components/status/:status` - Get components by status
- `POST /api/v1/auth/api-keys` - Create a new API key
- `GET /api/v1/health` - Health check (no auth required)

## Development

### Backend

```bash
cd backend
npm install
npm run start:dev
```

### SDK

```bash
cd sdk
npm install
npm run build
```

### CLI

```bash
cd cli
npm install
npm run build
npm link  # Link globally for testing
```

