# External integrations

Three features depend on tools and services that live outside this repository. The backend talks to each through one module. None of them is required to run the app: a feature whose integration isn't set up says so instead of showing made-up data.

| Integration | Feature | Where it runs | Set up with |
| --- | --- | --- | --- |
| [IRIS](https://github.com/electronicarts/IRIS) (EA, BSD 3-clause) | Photosensitivity analysis | Inside the backend: the backend Docker image includes it | `IRIS_EXECUTABLE_PATH`, `IRIS_CONFIG_PATH` outside the image |
| [Argos](https://argos-ci.com) | Visual regression | Argos's hosted service | An Argos project id and token per visual regression project |
| [OpenReplay](https://openreplay.com) | Session replay | OpenReplay Cloud, or your own OpenReplay server | An OpenReplay project id and API key per session replay project |

Chromium (URL accessibility scans, design extraction) and a Claude API key (alt text) are listed on the status page too.

## Status

`GET /api/v1/integrations/status` (needs `admin:system_health`) reports each integration as `ok`, `not_configured` or `unreachable`. Each entry has a one-line `summary`, and when it isn't `ok`, an `action` saying what to do. System Health shows the same in its Integrations panel.

The default report only looks at setup and contacts nothing. `?check=true` (the panel's **Check connections** button) also contacts Argos and OpenReplay for each connected project, four at a time, with 5 seconds each. It lists the projects that don't answer.

## IRIS

### In Docker

`backend/Dockerfile` builds IrisApp, IRIS's console program, from EA's source at a pinned commit, against Debian's OpenCV and FFmpeg. It bundles the shared libraries IrisApp needs and sets `IRIS_EXECUTABLE_PATH` and `IRIS_CONFIG_PATH`. CI builds the image and analyses a flashing and a steady test video through it (`backend/docker/smoke-test.sh`), so a broken IRIS build fails CI.

```bash
docker compose --profile backend up --build
```

That runs the backend on `127.0.0.1:${BACKEND_PORT:-3000}` with the Elasticsearch service, reading `backend/.env` if there is one.

### Outside Docker

Build IrisApp yourself (see the Dockerfile's `iris` stage for the steps, or IRIS's README for vcpkg). Then set:

| Variable | |
| --- | --- |
| `IRIS_EXECUTABLE_PATH` | IrisApp: an absolute path, or a name on `PATH`. Default `IrisApp`. |
| `IRIS_CONFIG_PATH` | IRIS's `config/appsettings.json`. Default: next to the executable. |
| `IRIS_TIMEOUT_MS` | Per video. Default 10 minutes. |

`GET /api/v1/photosensitivity/verify` and the analysis page say whether IRIS was found, without running it.

### How the backend runs it

IrisApp has no output-path option. It reads `appsettings.json` from its working directory and writes `Results/<video file name>/framedata.csv` there, and it exits 0 even when it can't read the video. So for each analysis the backend:
1. Creates a temporary working directory with IRIS's config.
2. Moves the upload into it under a fixed name (`video.mp4`), so nothing from the client reaches the command line.
3. Runs `IrisApp -v video.mp4 -p <0|1> -j 0`.
4. Reads the CSV, then deletes the directory and the video.

No CSV means a `422` with the reason from IRIS's log. No IRIS means a `503`.

Frame results follow IRIS: `0` pass, `1` pass with warning, `2` extended failure (2–3 flashes a second sustained over 5 seconds), `3` flash failure (more than 3 flashes in a second). Both `2` and `3` count as failures (`luminanceFailures`, `redFailures`). The extended ones are also counted separately (`luminanceExtendedFailures`, `redExtendedFailures`).

## Argos

Argos doesn't publish a self-hosting image. Its repository's `docker-compose.yml` only runs dependencies for Argos's own development, and its production uses AWS managed services. So there's no local Argos container: projects point at Argos's hosted service (or at an Argos URL on `ARGOS_ALLOWED_BASE_URLS`).

1. Create a visual regression project with its Argos project id and token.
2. In the project's **Settings → Argos webhooks**, generate a webhook secret, and add the webhook URL and secret in Argos.

## OpenReplay

OpenReplay's Docker Compose deployment [can't run locally](https://docs.openreplay.com/en/deployment/deploy-docker). It needs a server with a public IP and domain, at least 2 vCPUs and 8 GB RAM, on x86. So there's no local OpenReplay container either. Use OpenReplay Cloud (`https://api.openreplay.com`, the default) or your own OpenReplay server (on `OPENREPLAY_ALLOWED_BASE_URLS`).

In a session replay project's **Settings**, set:
- **OpenReplay project ID:** the numeric id from the project's settings in OpenReplay. A non-numeric id is refused, instead of silently reading project 1.
- **OpenReplay API key:** write-only, checked against OpenReplay when you save, and stored encrypted.

Without an API key, the session routes answer `503` with `code: "OPENREPLAY_NOT_CONFIGURED"`, and the project page explains how to connect it. Heatmap links always go to OpenReplay itself.
