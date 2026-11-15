# Getting started

This guide takes you from a fresh clone to a running platform: the backend and its Elasticsearch, the frontend, your first sign-in, and an API key for the API.

## Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
- [Configuration](#configuration)
- [Next steps](#next-steps)
- [Troubleshooting](#troubleshooting)

## Overview

The Design System Platform manages design systems: components, tokens and patterns, team workspaces, and integrations for visual regression testing and session replay.

- **Workspaces**: teams' components, tokens and other resources, with per-workspace roles
- **Component library** and **design tokens**
- **Visual regression testing** with Argos
- **Session replay** with OpenReplay
- **Accessibility reports**, **component requests** and a **patterns library**

The backend (NestJS) keeps everything in Elasticsearch (users, API keys, workspaces, audit logs), so Elasticsearch is required, not optional.

## Prerequisites

- **Node.js** 22 (what CI and the backend image use) and npm 10
- **Docker**, to run Elasticsearch (or an Elasticsearch 8 you run yourself)
- **openssl**, to generate secrets (any random 64-character hex string will do), and **jq** for the `curl` examples below

## Quick start

### 1. Install dependencies

From the repository root (one install covers the backend, frontend, SDK and CLI):

```bash
npm ci
```

### 2. Start Elasticsearch

```bash
docker compose up -d elasticsearch
curl http://localhost:9200   # answers with the cluster's details once it's up
```

It listens on `127.0.0.1:9200` with security off, for local development only (see `docker-compose.yml`).

### 3. Configure the backend

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and set at least:

```env
# The first admin, created when there are no users yet. The password needs 12+ characters;
# you'll change it on first sign-in.
BOOTSTRAP_ADMIN_EMAIL=you@example.com
BOOTSTRAP_ADMIN_PASSWORD=choose-a-long-password

# Recommended even locally (each: openssl rand -hex 32). Without them, development
# uses random values per process: sign-ins end and encrypted values are lost on restart.
AUTH_JWT_SECRET=
REVIEW_FILE_SECRET=
ENCRYPTION_KEY=
```

The example already sets `NODE_ENV=development`, `PORT=3000` and `ELASTICSEARCH_NODE=http://localhost:9200`. Outside development, `AUTH_JWT_SECRET`, `REVIEW_FILE_SECRET` and `ENCRYPTION_KEY` are required. See [Configuration](#configuration) for the rest.

### 4. Start the backend

```bash
cd backend
npm run start:dev
```

The first start creates the Elasticsearch indices and the bootstrap admin, which can take a minute or two. It is ready when it logs `Backend server running on http://localhost:3000`:

```bash
curl http://localhost:3000/api/v1/health
```

### 5. Start the frontend

In another terminal:

```bash
cp frontend/.env.example frontend/.env   # optional: the defaults work
cd frontend
npm run dev
```

Open http://localhost:5174. With `VITE_API_BASE_URL` empty, the Vite dev server forwards API calls to the backend on port 3000 (`VITE_API_PROXY_TARGET` changes that).

### 6. Sign in as the bootstrap admin

Sign in with `BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD`. You're asked to choose a new password straight away; until you do, the API refuses everything else (`403 PASSWORD_CHANGE_REQUIRED`). Then sign in again with the new password.

From **Admin → User management** you can now create accounts for your team.

### 7. Create an API key

Machine clients (CI, the CLI, the MCP server, the ESLint plugin) use API keys. Creating one needs the `admin:users` permission, which the bootstrap admin has.

**In the app:** go to **Admin → API keys** (`/admin/api-keys`), choose **Create key**, give it a name, an expiry and its permissions, and copy the key. It is shown only once.

**With the API:** sign in for a token, then create the key with it:

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "you@example.com", "password": "your new password"}' | jq -r .accessToken)

curl -X POST http://localhost:3000/api/v1/auth/api-keys \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "My first key", "expiresInDays": 90}'
```

The response's `apiKey` (`dsk_…`) is the key. Save it securely: only its hash is stored.

### 8. Call the API

```bash
curl http://localhost:3000/api/v1/components -H "Authorization: Bearer $API_KEY"
curl http://localhost:3000/api/v1/tokens -H "Authorization: Bearer $API_KEY"
```

Workspace routes need a person's token rather than a key (keys can't be workspace members):

```bash
curl -X POST http://localhost:3000/api/v1/workspaces \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Marketing"}'
```

## Configuration

`backend/.env.example` lists every backend setting with a comment. The ones that matter first:

| Variable | Needed | What it does |
| --- | --- | --- |
| `ELASTICSEARCH_NODE` (`_USERNAME`, `_PASSWORD`) | Always | Where everything is stored |
| `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_PASSWORD` | For the first sign-in | Creates the first admin when there are no users |
| `AUTH_JWT_SECRET` | Outside development | Signs access tokens. Without it in development, a random one per process. |
| `REVIEW_FILE_SECRET` | Outside development | Signs design review file URLs |
| `ENCRYPTION_KEY` | Outside development | Encrypts stored third-party tokens; the same on every replica ([AUTH.md](./AUTH.md#encryption-key)) |
| `API_KEYS`, `ADMIN_API_KEY` | Optional | Keys set in the environment, as well as keys created in the app. `ADMIN_API_KEY` has every permission. |
| `CORS_ORIGINS` | If the frontend isn't on 5174 | Origins allowed to call the API |
| `RATE_LIMIT_PER_MINUTE` | Optional | Requests per route per IP per minute (default 600) |
| `ANTHROPIC_API_KEY` | Optional | The AI features; without it they say they're not configured |

The frontend reads `frontend/.env` (`frontend/.env.example`): `VITE_API_BASE_URL` points it at a backend on another origin, and `VITE_USE_MOCKS=true` runs it without a backend.

Integrations (Argos, OpenReplay, Figma, GitHub, email) are set up later, in the app or in `.env`; see [INTEGRATIONS.md](./INTEGRATIONS.md).

## Next steps

- [Workspaces](./GETTING_STARTED_WORKSPACES.md): create a workspace and add your team
- [Components](./GETTING_STARTED_COMPONENTS.md)
- [Tokens](./GETTING_STARTED_TOKENS.md)
- [Visual regression](./GETTING_STARTED_VISUAL_REGRESSION.md) with Argos
- [Session replay](./GETTING_STARTED_SESSION_REPLAY.md) with OpenReplay
- [API reference](./API_REFERENCE.md) and [API authentication](./API_AUTHENTICATION.md)

## Troubleshooting

- **Health answers 503, or sign-in says the service is unavailable:** Elasticsearch isn't reachable at `ELASTICSEARCH_NODE`. Check `curl http://localhost:9200`.
- **No bootstrap admin:** the bootstrap only runs when there are no users. If you started once without `BOOTSTRAP_ADMIN_*`, set them and restart; if users already exist, ask an admin to create your account.
- **Signed out after restarting the backend:** set `AUTH_JWT_SECRET` in `backend/.env`.
- **`401` with `TOKEN_EXPIRED` or `TOKEN_REVOKED`:** sign in again, or use a new API key ([API_ERROR_CODES.md](./API_ERROR_CODES.md)).
- **`404` from a workspace route with an API key:** use a person's token.
- **Ports in use:** the backend uses `PORT` (3000) and the frontend 5174 (`npm run dev -- --port <port>`; then add the origin to `CORS_ORIGINS`). With the backend on another port, set `VITE_API_PROXY_TARGET` in `frontend/.env` so the dev proxy finds it.

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for more.
