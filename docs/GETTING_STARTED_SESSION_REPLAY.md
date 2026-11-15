# Getting started: session replay

Session replay connects an application to [OpenReplay](https://openreplay.com), which records what people do in it. This service keeps one session-replay project per application: it holds the OpenReplay connection and the project's privacy settings, generates the tracker code, lists sessions through OpenReplay's public API, and links to OpenReplay's player and heatmaps. Recordings stay in OpenReplay. You watch them there.

## What you need from OpenReplay

OpenReplay identifies a project in two ways, and this service stores both:

| Setting | Where to find it | Used for |
| --- | --- | --- |
| **Project key** (`openreplayProjectKey`), e.g. `9ihBzyeAkjDfK2rEXPBb` | OpenReplay → Preferences → Projects | The tracker, and the public API (`/:projectKey/...`). Required. |
| **Project ID** (`openreplayProjectId`), e.g. `42` | The number in the dashboard address (`app.openreplay.com/42/sessions`) | Links to the player and to heatmaps. Optional, and filled in for you when you save an API key. |
| **Organization API key** (`openreplayApiKey`) | OpenReplay → Preferences → Account | Listing sessions and events. Optional, but without it sessions can't be listed here. Write-only: it is stored encrypted and never returned. |
| **Base URL** (`openreplayBaseUrl`) | `https://api.openreplay.com` for OpenReplay Cloud, or your own instance | Where the API, the ingest point and the dashboard live. |

A project key that is only digits is refused, because that is the project ID. Projects saved before the two were stored separately had the numeric ID in `openreplayProjectKey`. When such a project is read, the number moves to `openreplayProjectId`, and the project asks for its key again: the integration code returns `409 OPENREPLAY_PROJECT_KEY_MISSING` until you enter it. The change is written back on the project's next update.

When you save an API key, or change the key, ID or base URL while one is saved, the server asks OpenReplay for the project (`GET /public/projects/:projectKey`). It refuses the save if OpenReplay rejects the key, can't be reached, has no project with that key, or reports a different numeric ID from the one you entered.

### Self-hosted OpenReplay

Base URLs other than the OpenReplay cloud must resolve to public addresses, or be listed in `OPENREPLAY_ALLOWED_BASE_URLS` (comma-separated), or be `OPENREPLAY_BASE_URL`. This guards against SSRF. For a self-hosted base URL `https://replay.example.com`:

- API: `https://replay.example.com/v2/api/public`
- Ingest point (in the tracker code): `https://replay.example.com/ingest`
- Dashboard links: `https://replay.example.com/<projectId>/...`

On OpenReplay Cloud (`https://api.openreplay.com`), the API is `https://api.openreplay.com/v2/public`, the tracker uses its default ingest point, and links go to `https://app.openreplay.com`.

## Create a project

### In the UI

Go to **Session replay** (`/hcd/session-replay`), choose **Create new project**, and fill in the OpenReplay settings and the privacy and capture settings. All of these can be changed later in the project's **Settings** tab.

### With the API

```bash
curl -X POST http://localhost:3456/api/v1/session-replay/projects \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Checkout",
    "workspaceId": "ws_payments",
    "applicationUrl": "https://checkout.example.com",
    "openreplayProjectKey": "9ihBzyeAkjDfK2rEXPBb",
    "openreplayProjectId": 42,
    "openreplayApiKey": "YOUR_ORGANIZATION_API_KEY",
    "privacySettings": {
      "defaultInputMode": "obscured",
      "blockSelector": [".card-number", "[data-private]"]
    },
    "config": { "captureNetworkPayload": false }
  }'
```

Projects live in Elasticsearch (index `design-system-session-replay-projects`). Access is per project: workspace viewers can read a project, editors can create and change it, and a project without a workspace is visible only to its creator (see [WORKSPACES.md](./WORKSPACES.md)). `PUT` changes a project; `privacySettings` and `config` are merged into the current settings; `"openreplayProjectId": null` clears the ID.

## Privacy and capture settings

Each setting maps onto an option of OpenReplay's tracker ([constructor options](https://docs.openreplay.com/en/sdk/constructor/)). Omitted settings take the defaults below, which keep recordings private by default.

| Setting | Default | Tracker option |
| --- | --- | --- |
| `privacySettings.defaultInputMode`: `plain`, `obscured` or `ignored` | `obscured` | `defaultInputMode` (0, 1, 2) |
| `privacySettings.privateMode`: mask all text except elements marked `data-openreplay-unmask` | `false` | `privateMode` |
| `privacySettings.obscureTextEmails` / `obscureTextNumbers` | `true` / `false` | same names |
| `privacySettings.obscureInputEmails` / `obscureInputNumbers` | `true` / `true` | same names |
| `privacySettings.maskTextSelector`: CSS selectors whose text is obscured | none | `domSanitizer` returns 1 |
| `privacySettings.blockSelector`: CSS selectors left out of recordings | none | `domSanitizer` returns 2 |
| `privacySettings.respectDoNotTrack` | `true` | `respectDoNotTrack` |
| `config.captureConsole` | `true` | `consoleMethods: []` when off |
| `config.captureNetwork` | `true` | `network: { disabled: true }` when off |
| `config.captureNetworkPayload`: request and response bodies | `false` | `network.capturePayload` |
| `config.captureIFrames`: same-origin iframes | `true` | `captureIFrames` |

There can be up to 20 selectors per list, each up to 200 characters. A selector the browser would reject is refused with a 400. The older `maskAllInputs` and `maskAllText` fields, which the applications form still sends, are read as `defaultInputMode` (`obscured` or `plain`) and `privateMode`.

## Install the tracker

```bash
curl http://localhost:3456/api/v1/session-replay/projects/PROJECT_ID/integration-code \
  -H "Authorization: Bearer YOUR_TOKEN"
```

The response has the tracker setup with the project's settings applied, in two forms:

- `script`: OpenReplay's own loader snippet for the page's `<head>`. It queues calls on `window.OpenReplay` and loads `openreplay.js` from `https://static.openreplay.com/19.0.0/openreplay.js`. Set `OPENREPLAY_TRACKER_SCRIPT_URL` to load another version or a copy you host.
- `npmInstall` and `npm`: `npm i @openreplay/tracker@^19`, and module code that creates the tracker (`new OpenReplay({...})`) and calls `tracker.start()`.

The project's **Overview** tab shows both forms, with copy buttons.

Sessions are listed here **by user**, because that's how OpenReplay's public API lists them. Give the tracker the signed-in user's ID with `tracker.setUserID(id)`, or set `startOpts.userID` in the script snippet.

## Sessions

OpenReplay's public API has no project-wide session search. It lists one user's sessions within a time window. So does this service:

```bash
curl "http://localhost:3456/api/v1/session-replay/projects/PROJECT_ID/sessions?userId=user-1234&startDate=2026-11-01&endDate=2026-11-07&page=1&limit=20&sortOrder=desc" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

| Parameter | Notes |
| --- | --- |
| `userId` | Required. The ID passed to `setUserID`. |
| `startDate`, `endDate` | ISO dates or date-times. A bare `endDate` includes that whole day. The default window is the 7 days before `endDate`, and `endDate` defaults to now. |
| `page`, `limit` | `page` starts at 1. `limit` is 1–200 and defaults to 20. |
| `sortOrder` | `desc` (default) or `asc`. |

The response is `{ items, total, page, limit, startDate, endDate }`. Each item has `sessionId`, `userId`, `startTime`, `endTime`, `duration` (seconds), `eventsCount` and `replayUrl`. `replayUrl` is null until the project has its numeric ID. The **Sessions** tab has these filters, and each search is kept in the page address, so it can be shared.

A session's events (clicks, page views, inputs and custom events):

```bash
curl "http://localhost:3456/api/v1/session-replay/projects/PROJECT_ID/sessions/SESSION_ID/events?startDate=...&endDate=...&page=1&limit=50" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Without a window, the last 30 days are searched. The session page passes the session's own start and end.

Errors are reported as they are:

- `503 OPENREPLAY_NOT_CONFIGURED`: no API key.
- `409 OPENREPLAY_PROJECT_KEY_MISSING`: no project key.
- `502 OPENREPLAY_ERROR`: OpenReplay refused or failed, with its reason.
- `400`: a parameter the public API would reject.

## Replay URL

```bash
curl http://localhost:3456/api/v1/session-replay/projects/PROJECT_ID/sessions/SESSION_ID/replay-url \
  -H "Authorization: Bearer YOUR_TOKEN"
# { "url": "https://app.openreplay.com/42/session/SESSION_ID" }
```

This returns OpenReplay's player for the session (`<dashboard>/<projectId>/session/<sessionId>`). Anyone who can read the project can call it. It needs the numeric project ID (otherwise `409 OPENREPLAY_PROJECT_ID_MISSING`) but not the API key. The player opens in OpenReplay, where the viewer signs in. OpenReplay sends `X-Frame-Options: DENY`, so the player can't be embedded here.

## Heatmaps

OpenReplay keeps heatmaps as cards in its dashboard. This service links to them and doesn't draw heatmaps itself:

```bash
curl "http://localhost:3456/api/v1/session-replay/projects/PROJECT_ID/heatmaps-url" \
  -H "Authorization: Bearer YOUR_TOKEN"
# { "url": "https://app.openreplay.com/42/metrics" }
```

Pass `heatmapId` (a card ID) to link to one card. Like the replay URL, this needs the numeric project ID. The project's **Heatmaps** tab links out to the same address.

## Testing

The backend specs never reach a real OpenReplay. They use a local HTTP stand-in for its public API (`backend/src/session-replay/testing/fake-openreplay.ts`). The generated tracker code is run in jsdom against a stub tracker (`openreplay-snippet.spec.ts`), which replays what OpenReplay's `openreplay.js` does with the loader's queue. To try a real connection, point a project at your OpenReplay instance and save an API key; the save checks the key and the project with OpenReplay.

## Troubleshooting

- **No sessions listed**: check that the app calls `setUserID`, that you searched for that ID, and that the date window covers the session.
- **"OpenReplay isn't connected"**: add the organization API key in the project's settings.
- **No replay or heatmap links**: add the numeric project ID, or save the API key so that it is looked up.
- **The tracker doesn't record**: check the project key, the browser's Do Not Track setting (respected by default), and, when self-hosted, that the ingest point is reachable.

See also [OPENREPLAY_SERVICE.md](./OPENREPLAY_SERVICE.md), [OPENREPLAY_REMAINING_FEATURES.md](./OPENREPLAY_REMAINING_FEATURES.md) and [CI_CD_OPENREPLAY_INTEGRATION.md](./CI_CD_OPENREPLAY_INTEGRATION.md).
