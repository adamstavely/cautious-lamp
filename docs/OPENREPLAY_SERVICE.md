# OpenReplay Session Replay Service

## Overview

Integrate OpenReplay as a service capability that teams can use to test and debug their applications. This service allows teams to configure, manage, and view session replays for their applications without needing to set up and maintain their own OpenReplay infrastructure.

## Architecture

1. **Session replay pages** (`/hcd/session-replay`)
   - The project list, and a create dialog with the OpenReplay connection and the privacy and capture settings
   - Per project: **Overview** (the tracker code, as a script tag or the npm package, and the configuration), **Sessions** (one user's sessions, filtered and paginated on the server), **Heatmaps** (a link to OpenReplay) and **Settings**
   - A session page with a link to OpenReplay's player and the session's events

2. **Backend** (`backend/src/session-replay/`, `/api/v1/session-replay`)
   - Projects in Elasticsearch, with per-project access checks and encrypted API keys
   - `openreplay-api.client.ts`: OpenReplay's public REST API (v2), authenticated with the organization API key
   - `openreplay-snippet.ts`: the tracker code, with the project's settings applied
   - `openreplay-url.ts`: the SSRF guard for base URLs, and the API, ingest and dashboard addresses
   - `capture-settings.ts`: privacy and capture settings, their defaults, and the older shape

Recordings stay in OpenReplay. This service doesn't store sessions.

## Routes

| Route | What it does |
| --- | --- |
| `GET/POST /projects`, `GET/PUT/DELETE /projects/:id` | Projects |
| `GET /projects/:id/integration-code` | `{ script, npmInstall, npm }` |
| `GET /projects/:id/sessions?userId=&startDate=&endDate=&page=&limit=&sortOrder=` | One user's sessions |
| `GET /projects/:id/sessions/:sessionId/events` | A session's events |
| `GET /projects/:id/sessions/:sessionId/replay-url` | OpenReplay's player for the session |
| `GET /projects/:id/heatmaps-url` | OpenReplay's heatmap cards |

[GETTING_STARTED_SESSION_REPLAY.md](./GETTING_STARTED_SESSION_REPLAY.md) has the details. [OPENREPLAY_REMAINING_FEATURES.md](./OPENREPLAY_REMAINING_FEATURES.md) lists what isn't built.

## User flow

### Setting up a project

1. Go to `/hcd/session-replay` and choose **Create new project**.
2. Enter the project details, the OpenReplay project key, and optionally the numeric project ID, the API key and a self-hosted base URL.
3. Choose the privacy and capture settings.
4. Copy the tracker code from the project's **Overview** (script tag or npm), add it to the application, and call `setUserID` once the user is known.

### Finding sessions

1. Open the project's **Sessions** tab.
2. Enter a user ID, and optionally a date range and order.
3. Page through the results. **Watch** opens the session in OpenReplay; the session ID opens its events.

## Benefits

1. **Your OpenReplay**: OpenReplay Cloud or your own instance; recordings stay there
2. **Easy integration**: tracker code generated with the project's settings
3. **Privacy**: inputs and emails obscured and Do Not Track respected by default, with per-project selectors
