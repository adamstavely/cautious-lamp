# IRIS Photosensitivity Analysis Service

## Overview

Integrate EA's IRIS (photosensitivity analysis tool) as a service capability for accessibility scanning. IRIS analyzes video content to detect photosensitive epileptic risks, including luminance flashes, red saturation flashes, and spatial patterns.

**Repository**: [https://github.com/electronicarts/IRIS](https://github.com/electronicarts/IRIS)

> **Status:** built. IRIS ships in the backend Docker image, and the backend runs it as described in [INTEGRATIONS.md](INTEGRATIONS.md#iris). The plan below is the original outline.

## Limits

Each analysis runs IrisApp for up to `IRIS_TIMEOUT_MS`, so the backend bounds the work (`backend/src/common/concurrency/admission-pool.ts`):

| Variable | Default | |
| --- | --- | --- |
| `IRIS_MAX_CONCURRENT` | 2 | IrisApp processes running at once. |
| `IRIS_MAX_QUEUED` | 4 | Analyses admitted beyond those running: waiting for a slot, or still uploading. |
| `IRIS_MAX_PER_CALLER` | 2 | Analyses one user or API key may have running or queued. |
| `IRIS_RETRY_AFTER_SECONDS` | 30 | The `Retry-After` sent with a refusal. |
| `IRIS_TIMEOUT_MS` | 600000 (10 minutes) | Per video. IrisApp is then killed with SIGKILL and its files deleted. |
| `IRIS_MAX_FRAMES` | 216000 (an hour at 60fps) | Longer videos are refused. IRIS writes one CSV row per frame; the CSV is streamed and reading stops at the limit. |
| `IRIS_MAX_OUTPUT_BYTES` | 67108864 (64MB) | A larger `framedata.csv` is refused without being read. |

`POST /api/v1/photosensitivity/analyze` takes its place before the upload is written (the admission guard runs before the upload interceptor). When there is none it answers straight away, with `Retry-After`:

- `503` `PHOTOSENSITIVITY_BUSY`: the server already has `IRIS_MAX_CONCURRENT + IRIS_MAX_QUEUED` analyses.
- `429` `PHOTOSENSITIVITY_QUOTA_EXCEEDED`: this caller already has `IRIS_MAX_PER_CALLER`.

Both bodies carry `code`, `message` and `retryAfterSeconds`; try again after that many seconds. An admitted request waits for a free slot. If the client disconnects, a queued analysis is dropped and a running IrisApp is killed; either way the video and IRIS's working directory are deleted.

Analyses that can't finish answer `422` with a code: `IRIS_TIMEOUT`, `IRIS_VIDEO_TOO_LONG` (over `IRIS_MAX_FRAMES` or `IRIS_MAX_OUTPUT_BYTES`) or `IRIS_ANALYSIS_FAILED` (an unreadable video). No IRIS installed is `503` `IRIS_UNAVAILABLE`, which retrying won't fix. The full list is in [API_ERROR_CODES.md](API_ERROR_CODES.md#photosensitivity-analysis).

The limits are per backend process. With several replicas, each has its own.

## What IRIS Detects

1. **Luminance Flashes**: More than 3 flashes per second in any given second
2. **Red Saturation Flashes**: More than 3 flashes per second in any given second
3. **Spatial Patterns**: Harmful patterns present for half a second or more
4. **Extended Flash Failures**: 2-3 flashes per second in any 5 consecutive seconds

## Integration Approach

Since IRIS is a C++ library, we'll integrate it as:

1. **Backend Service**: Create a service that interfaces with IRIS (via CLI or wrapper)
2. **Rules Engine Integration**: Add IRIS scanning as an accessibility rule
3. **Video Upload & Analysis**: Allow teams to upload videos for analysis
4. **Results Integration**: Display IRIS results in compliance checks

## Implementation Plan

### Phase 1: Backend Service

- IRIS CLI wrapper service
- Video upload and storage
- Analysis execution
- Results parsing (CSV/JSON)
- Integration with rules engine

### Phase 2: Frontend UI

- Video upload interface
- Analysis progress tracking
- Results visualization
- Integration with Governance page

### Phase 3: Rules Engine Integration

- Add IRIS rule to accessibility category
- Automatic scanning for video content
- Compliance check generation

