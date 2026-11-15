# Design System Platform

**Unifying the Mission; One UI at a Time**

The Agency's design system for digital experiences: guidelines, components, tokens, patterns and assets in one platform.

## Overview

The platform combines design guidelines, a component library, developer tools, governance and analytics. The Vue frontend talks to a NestJS API, and the API keeps its data in Elasticsearch. [docs/FEATURE_IDEAS.md](./docs/FEATURE_IDEAS.md) lists every feature as built, partly built or not built.

## Key features

### Core

- **Guidelines and documentation**: design guidelines rendered from Markdown in `frontend/public/docs`, plus a VitePress site in `frontend/docs`
- **Component library**: component pages, status, testing, scaffolding and documentation generation
- **Design tokens**: token studio, library, playground, relationships, migration, extraction and sync with Figma and Penpot
- **Patterns library**: patterns and their status, stored in Elasticsearch
- **Typography**: font library, scale, stack and subsetting tools
- **Design assets**: icon library (browse Lucide or upload Material and custom sets), flags, seals, illustrations and logos

### Developer experience

- **Component playgrounds** on the Button and Color picker pages, with Vue, React and React Native snippets
- **Component testing**: accessibility (axe-core) checks run against components
- **Documentation generator**: docs generated from a component's source
- **Token migration**: moves code from old token names to new ones
- **Loupe tool**: component inspector, in the app and as a standalone package
- **Dependency graph**: component relationships

### Design and development collaboration

- **Design handoff**: specs from a design review (`/review/handoff`)
- **Review system**: design review and approval workflow ([docs/REVIEW_API.md](./docs/REVIEW_API.md))
- **Feedback and roadmap**: component requests, feedback and roadmap in one place (`/feedback`)

### Governance and compliance

- **Governance rules engine**: 19 built-in declarative rules (design system, UX/HCD and accessibility) plus custom rules ([docs/RULES_ENGINE_GUIDE.md](./docs/RULES_ENGINE_GUIDE.md), [docs/GOVERNANCE.md](./docs/GOVERNANCE.md))
- **Compliance scanning**: scan code or a registered application's URL, on demand or on a schedule
- **Audit logging**: every API request is recorded in a daily Elasticsearch index
- **Role-based access control**: 10 roles, permissions checked on the server ([docs/AUTH.md](./docs/AUTH.md))
- **Feature flags**: the platform's own flag service, stored in Elasticsearch (see [Feature flags](#feature-flags))

### Tools and utilities

- **Colour**: colour scale generator, converter, contrast checker, APCA calculator, gradient generator, palette builder
- **Content**: lorem ipsum generator, SEO tagging generator, alt text generator (needs `ANTHROPIC_API_KEY`)
- **UX research**: NASA-TLX, System Usability Scale, heuristic evaluation, user personas, journey maps, research reports
- **Data visualisation**: chart builder, map maker (TopoJSON thematic maps), table and timeline generators
- **Developer utilities**: px and CSS converters, HTML viewer and escaper, image compressor, PNG to ICO converter, box shadow, border radius, spacing scale and CSS animation tools
- **Testing services**: visual regression (Argos), session replay (OpenReplay) and photosensitivity checks (IRIS)

### AI

- **Eero**: the design system chat assistant
- **AI suggestions**: component and accessibility suggestions

Both use the Claude API and need `ANTHROPIC_API_KEY`; without it they say they're not configured.

### Analytics and monitoring

- **System health**: health of the API and its dependencies (`/admin/health`)
- **Design system analytics**: component usage recorded from scans
- **Notifications**: inbox, changelog and subscriptions, delivered by email, Slack, Teams or signed webhooks ([docs/NOTIFICATIONS.md](./docs/NOTIFICATIONS.md))

### API and integration

- **REST API** under `/api/v1` ([API_README.md](./API_README.md))
- **JavaScript SDK** (`sdk/`), **CLI** (`cli/`) and **MCP server** (`mcp-server/`)
- **ESLint plugin**: design system rules for ESLint ([docs/LINTER_INTEGRATION.md](./docs/LINTER_INTEGRATION.md))
- **VS Code extension**: completion, hover, colour swatches, snippets, and warnings on hard-coded values with a replace-with-token quick fix

### Observability

- **OpenTelemetry** traces, metrics and logs from the backend, with an optional Elasticsearch exporter; browser telemetry unless `VITE_OTEL_ENABLED` is `false`

## Architecture

### Tech stack

**Frontend:**
- Vue 3 with the Composition API
- Vite
- Tailwind CSS on design tokens, with shared components in `frontend/src/components/ui` ([frontend/RESKIN_GUIDE.md](./frontend/RESKIN_GUIDE.md))
- Lucide icons through `<AppIcon>`
- VitePress for the `frontend/docs` site

**Backend:**
- NestJS and TypeScript
- Elasticsearch for data
- OpenTelemetry for observability

### Project structure

```
├── backend/                          # NestJS API (one folder per module in src/)
├── frontend/                         # Vue application
│   ├── src/
│   │   ├── main.js                   # App setup and every route
│   │   ├── router/                   # Route guards (feature flags, RBAC)
│   │   ├── views/                    # Pages
│   │   ├── components/               # Components; ui/ holds the shared kit
│   │   ├── services/                 # API client and services
│   │   └── composables/
│   ├── public/docs/                  # Markdown guidance rendered in the app
│   ├── docs/                         # VitePress site
│   └── scripts/                      # check:styles, check:sfc, check:icons
├── sdk/                              # @adamstavely/design-system-sdk
├── cli/                              # @adamstavely/design-system-cli
├── mcp-server/                       # @adamstavely/design-system-mcp-server (Model Context Protocol)
├── eslint-plugin-design-system/      # @adamstavely/eslint-plugin-design-system
├── vscode-design-system-extension/   # VS Code extension
├── loupe-tool-standalone/            # @adamstavely/loupe-tool
├── breakpoint-overlay-standalone/    # @adamstavely/breakpoint-overlay
└── docs/                             # Further documentation
```

## Getting started

### Prerequisites

- **Node.js** 22 and npm (what CI and the backend image use; NestJS 11 needs at least Node 20)
- **Docker**, for Elasticsearch 8 (required: users, API keys and everything else are stored there)
- **Git**

### Installation

The full walkthrough, including your first API key, is in [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md). In short:

1. **Clone and install** (the root is an npm workspace, so one install covers every package):
```bash
git clone <repository-url>
cd cautious-lamp
npm ci
```

2. **Start Elasticsearch:**
```bash
docker compose up -d elasticsearch
```

3. **Configure the backend:**
```bash
cp backend/.env.example backend/.env
```
Set `BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD` (12+ characters) for the first admin. Set `AUTH_JWT_SECRET`, `REVIEW_FILE_SECRET` and `ENCRYPTION_KEY` too (`openssl rand -hex 32` each): they're required outside development, and without them sign-ins and encrypted values don't survive a restart. There are no built-in API keys.

The frontend reads `frontend/.env` (see `frontend/.env.example`). Leave `VITE_API_BASE_URL` empty in development so API calls go through Vite's proxy; it sends them to `http://localhost:3000` unless `VITE_API_PROXY_TARGET` says otherwise.

### Running the application

Both services together:
```bash
npm run dev
```

Or separately:
```bash
cd backend && npm run start:dev
cd frontend && npm run dev
```

Then open:
- Frontend: http://localhost:5174
- Backend API: http://localhost:3000 (`PORT` changes it)
- API health: http://localhost:3000/api/v1/health

Sign in at the frontend as the bootstrap admin and choose a new password. Create an API key for the CLI, CI or the MCP server under **Admin, API keys** (`/admin/api-keys`).

## Documentation

### In the app
- Getting started: `/getting-started`
- Guidelines: `/guidelines`
- Components: `/components`
- Tokens: `/tokens`
- Patterns: `/patterns`
- Typography: `/fonts`

### Developer resources
- [API documentation](./API_README.md)
- [Authentication and permissions](./docs/AUTH.md)
- [Governance](./docs/GOVERNANCE.md) and [rules engine guide](./docs/RULES_ENGINE_GUIDE.md)
- [OpenTelemetry setup](./docs/OPENTELEMETRY_SETUP.md)
- [Loupe tool](./docs/LOUPE_TOOL.md)
- [ESLint plugin](./eslint-plugin-design-system/README.md) and [linter integration](./docs/LINTER_INTEGRATION.md)
- [VS Code extension](./vscode-design-system-extension/README.md)
- [MCP server](./mcp-server/README.md)

### Additional resources
- [Feature status](./docs/FEATURE_IDEAS.md)
- [Component template guide](./COMPONENT_TEMPLATE_GUIDE.md)
- [WCAG compliance](./frontend/WCAG_COMPLIANCE.md)
- [Code review status](./CODE_REVIEW.md)

## API

See [API_README.md](./API_README.md) for the full API. Some key routes:

**Design system:**
- `GET /api/v1/tokens`
- `GET /api/v1/components`
- `GET /api/v1/components/:id`
- `GET /api/v1/health` (public)

**Feature flags:**
- `GET /api/v1/feature-flags`
- `GET /api/v1/feature-flags/key/:key`
- `GET /api/v1/feature-flags/check/:key`
- `POST /api/v1/feature-flags`, `PUT /api/v1/feature-flags/:id`, `PUT /api/v1/feature-flags/:id/toggle`, `DELETE /api/v1/feature-flags/:id` (need `admin:system_health`)

**Governance:**
- `GET /api/v1/governance/rules`, `POST /api/v1/governance/rules/test`
- `POST /api/v1/governance/scans`, `GET /api/v1/governance/scans`
- `POST /api/v1/compliance/scan`
- `GET /api/v1/governance/rules/export` (used by the ESLint plugin)

**RBAC:**
- `GET /api/v1/rbac/roles`
- `POST /api/v1/rbac/users/:userId/roles`

**Audit:**
- `GET /api/v1/audit/logs`
- `GET /api/v1/audit/export`

## Development

### Available scripts

**Root:**
```bash
npm run dev              # Backend and frontend
npm run dev:backend      # Backend only
npm run dev:frontend     # Frontend only
npm run build            # Build every workspace
npm test                 # Test every workspace
```

**Backend:**
```bash
cd backend
npm run start:dev        # Development server
npm run build            # Production build
npm run lint             # ESLint
npm test                 # Jest
```

**Frontend:**
```bash
cd frontend
npm run dev              # Development server
npm run build            # Production build
npm test                 # Vitest
npm run check:styles     # Token-only styling rules
npm run check:sfc        # Single-file component checks
npm run check:icons      # Icons come from Lucide through AppIcon
npm run docs:dev         # VitePress site
```

### Code style

- **Backend**: TypeScript with NestJS conventions; DTOs with class-validator; data in Elasticsearch stores
- **Frontend**: Vue 3 `<script setup>`; token utilities and the shared ui kit, no inline styles or raw colours ([frontend/RESKIN_GUIDE.md](./frontend/RESKIN_GUIDE.md))
- **Icons**: Lucide only, through `<AppIcon name>`

## Authentication and authorization

People sign in with an email and password and get a bearer token. Machine clients (CLI, SDK, MCP server, ESLint plugin, CI) use API keys: the keys in `API_KEYS`, `ADMIN_API_KEY`, or keys created through `POST /api/v1/auth/api-keys`. There are no default keys; the old `test-api-key-123` and `dev-key` are rejected. See [docs/AUTH.md](./docs/AUTH.md).

## Feature flags

Flags use the platform's own service (`backend/src/feature-flags`), not OpenFeature. Flags are stored in the Elasticsearch index `design-system-feature-flags-flags`, and the built-in defaults apply until a flag is changed. Manage them on the Admin, Feature flags page (`/admin/feature-flags`).

- Routes are protected by the guard in `frontend/src/router/featureFlagGuards.js`
- Targeting by user, group and percentage rollout; the backend and `frontend/src/services/featureFlagsService.js` evaluate it the same way
- Changing flags needs the `admin:system_health` permission

## Observability

The backend is instrumented with OpenTelemetry for traces, metrics and logs, with an optional Elasticsearch exporter. See [docs/OPENTELEMETRY_SETUP.md](./docs/OPENTELEMETRY_SETUP.md).

## Contributing

See the contribution guide in the app at `/getting-started/contribute`.

## Packages

- **CLI** (`cli/`): command-line access to the API
- **JavaScript SDK** (`sdk/`): API client for JavaScript and TypeScript
- **MCP server** (`mcp-server/`, command `design-system-mcp`): exposes tokens, components, patterns, rules and docs to AI assistants
- **ESLint plugin** (`eslint-plugin-design-system/`)
- **VS Code extension** (`vscode-design-system-extension/`)
- **Loupe tool** (`loupe-tool-standalone/`): standalone component inspector
- **Breakpoint overlay** (`breakpoint-overlay-standalone/`): shows the active breakpoint and viewport metrics in any Vue 3 app

Apart from the VS Code extension, they are released to GitHub Packages under the `@adamstavely` scope by `.github/workflows/release.yml` (a `<package>-v<version>` tag or a manual run). Nothing has been published yet. To install them once published, add `@adamstavely:registry=https://npm.pkg.github.com` and a token with `read:packages` to your `.npmrc`; see each package's README.

## Governance

- **19 built-in rules** covering design system, UX/HCD and accessibility, plus custom declarative rules
- **Application scanning**, on demand or scheduled
- **Audit logging** of every API request
- **RBAC** with 10 roles

See [docs/RULES_ENGINE_GUIDE.md](./docs/RULES_ENGINE_GUIDE.md) for writing custom rules.

## Security

- Signed-in users and API keys; every route needs one except a few public ones
- Role-based access control on the server
- Audit logging of every request
- Third-party tokens encrypted at rest (`ENCRYPTION_KEY`)

## License

MIT

## Acknowledgments

Built with [Vue.js](https://vuejs.org/), [NestJS](https://nestjs.com/), [Tailwind CSS](https://tailwindcss.com/), [VitePress](https://vitepress.dev/), [OpenTelemetry](https://opentelemetry.io/), [Lucide](https://lucide.dev/), [Style Dictionary](https://amzn.github.io/style-dictionary/) and [Elasticsearch](https://www.elastic.co/elasticsearch/).

## Support

- The [getting started](/getting-started) section in the app
- Eero, the in-app assistant, for design system questions
- The [feedback and roadmap](/feedback) page for requests and issues

---

**Built for the Agency | Unifying the Mission; One UI at a Time**
