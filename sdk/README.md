# Design System API SDK

JavaScript and TypeScript client for the Design System API (`backend/`). CommonJS and ES module builds, with type declarations.

## Installation

The package is published to GitHub Packages, so npm needs to know where the `@adamstavely` scope lives. Add this to the project's `.npmrc` (or `~/.npmrc`):

```ini
@adamstavely:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

`GITHUB_TOKEN` is a GitHub personal access token (classic) with the `read:packages` scope. Then:

```bash
npm install @adamstavely/design-system-sdk
```

## Usage

```javascript
import { DesignSystemAPI } from '@adamstavely/design-system-sdk';

const api = new DesignSystemAPI({
  apiKey: process.env.DS_API_KEY,
  baseURL: 'https://design.example.com/api/v1', // default http://localhost:3000/api/v1; include /api/v1
  timeout: 30000,                               // ms, optional
});

const { tokens } = await api.tokens();
const button = await api.component('button');
```

Every method returns the response body and rejects with the axios error on a non-2xx status (except `health()`, below). The key is sent as `Authorization: Bearer <apiKey>`.

## Methods

### Tokens and components

| Method | Request | Returns |
| --- | --- | --- |
| `tokens()` | `GET /tokens` | `{ tokens, count }` |
| `tokensByCategory(category)` | `GET /tokens/category/:category` | `{ tokens, category, count }` |
| `token(name)` | `GET /tokens/:name` | `Token` |
| `tokensFiltered({ category?, type?, tag? })` | `GET /tokens?…` | `{ tokens, count, filters }` |
| `components(status?)` | `GET /components[?status=]` | `{ components, count }` |
| `component(id)` | `GET /components/:id` | `Component` |
| `componentsByStatus(status)` | `GET /components/status/:status` | `{ components, status, count }` |

Only components the key can read are returned: private workspace components stay hidden from other workspaces.

### Health

`health()` calls `GET /health`, which needs no key. It resolves with `{ status, version, timestamp, elasticsearch: { status, error? } }` both when the API is up (`status: 'ok'`, HTTP 200) and when Elasticsearch is down (`status: 'unavailable'`, HTTP 503), so check `status`.

### Applications

```javascript
const app = await api.registerApplication('Shop', 'https://github.com/acme/shop', '3.2.0', {
  workspaceId: 'ws_0123456789abcdef01234567', // required unless the key has admin:governance
  applicationUrl: 'https://shop.example.com',
  designSystemVersion: '2.1.0',
  description: 'Customer storefront',
});

const page = await api.getApplications({ workspaceId: app.workspaceId, search: 'shop', limit: 20 });
// { applications, count, total, offset, limit, facets: { teams, environments } }
```

- `registerApplication(name, repository?, version?, options?)`: `POST /applications/register`. `options` takes `description`, `applicationUrl`, `teamId`, `workspaceId`, `designSystemVersion`, `capabilities` and `metadata`.
- `getApplications(filters?)`: `GET /applications`. Filters are `teamId`, `workspaceId`, `capability` (`governance`, `visualRegression`, `sessionReplay`), `environment`, `search`, and `limit` (1 to 100) / `offset` for paging. Without `limit` every match is returned.

### Compliance scans

Both scan methods store the scan on the server and resolve with it: `{ id, scope, createdAt, rules, summary, checks, truncated, passed, warnings, failed, info }`, plus `applicationId` and `applicationName` for an application scan.

```javascript
// The design system's own components (needs component:view)
const all = await api.scanCompliance('design-system');
const oneComponent = await api.scanCompliance('design-system', undefined, ['accessibility'], { componentIds: ['button'] });

// One application (needs an API key with admin:governance)
const fromUrl = await api.scanApplicationCodebase('app-123', undefined, ['accessibility'], 'https://shop.example.com');
const fromCode = await api.scanApplicationCodebase('app-123', { html: '<img src="logo.png">', file: 'index.html' });
```

- `scanCompliance(scope, applicationId?, categories?, options?)`: `POST /compliance/scan`. `scope` is `design-system` (the components the key can read, or only `options.componentIds`; an id the key can't read is a 404) or `applications` (the application `applicationId`, which needs admin:governance). `categories` limits the rules by category; `options.ruleIds` runs just those rules.
- `scanApplicationCodebase(applicationId, codebase?, categories?, url?)`: `POST /compliance/scan-application`, which needs admin:governance. Send the code (`{ html?, css?, javascript?, file? }`) or a public `url` for the server to fetch. With neither, the server scans the application's registered `applicationUrl`, and answers 400 if it has none.

### API keys

`createApiKey(name, { expiresInDays?, scopes? })`: `POST /auth/api-keys`, resolving with `{ apiKey, metadata }`. Needs a key with admin:users, and can only grant scopes the caller holds. The new key is shown only in this response.

### Eero (AI chat)

```javascript
const reply = await api.chat('Which button variant should I use for a destructive action?', [
  { role: 'user', content: 'We are building a settings page.' },
  { role: 'assistant', content: 'Happy to help with the settings page.' },
]);
// { response, suggestions, relatedComponents, relatedTokens, model }
```

`chat(message, conversationHistory?)`: `POST /ai/chat`. History turns are `{ role: 'user' | 'assistant', content }`, oldest first. The server answers 503 when `ANTHROPIC_API_KEY` isn't set and 429 when the caller is over the per-minute limit (`AI_REQUESTS_PER_MINUTE`, default 10).

## Development

```bash
npm run build   # CommonJS in dist/, ES modules in dist/esm/
npm test
```

Releases are published by `.github/workflows/release.yml`: see "Publishing packages" in the CLI README.
