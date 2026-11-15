import { BadRequestException } from '@nestjs/common';
import { assertPublicHttpUrl } from '../common/security/url-safety';

export const DEFAULT_OPENREPLAY_BASE_URL = 'https://api.openreplay.com';

/** `https://host[:port]/path` without a trailing slash, query or fragment */
function normalize(raw: string): string {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new BadRequestException('openreplayBaseUrl must be a valid URL');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new BadRequestException('openreplayBaseUrl must be an http(s) URL');
  }
  if (url.username || url.password) throw new BadRequestException('openreplayBaseUrl must not contain credentials');
  return `${url.origin}${url.pathname.replace(/\/+$/, '')}`;
}

/** OPENREPLAY_BASE_URL (or the OpenReplay cloud) plus OPENREPLAY_ALLOWED_BASE_URLS */
function allowList(): Set<string> {
  const defaults = [process.env.OPENREPLAY_BASE_URL || DEFAULT_OPENREPLAY_BASE_URL];
  const configured = (process.env.OPENREPLAY_ALLOWED_BASE_URLS ?? '').split(',').map((u) => u.trim()).filter(Boolean);
  const allowed = new Set<string>();
  for (const url of [...defaults, ...configured]) {
    try {
      allowed.add(normalize(url));
    } catch {
      // A malformed setting allows nothing
    }
  }
  return allowed;
}

/**
 * The OpenReplay base URL to store or call, guarding against SSRF. URLs an
 * administrator configured (OPENREPLAY_BASE_URL, OPENREPLAY_ALLOWED_BASE_URLS)
 * are trusted, including internal hosts for self-hosted instances. Any other
 * URL must be http(s) and resolve only to public addresses. Run it when the
 * URL is saved and again before every request, since DNS can change. Throws 400.
 */
export async function resolveOpenReplayBaseUrl(candidate?: string | null): Promise<string> {
  const allowed = allowList();
  const requested = normalize(candidate && candidate.trim() ? candidate : process.env.OPENREPLAY_BASE_URL || DEFAULT_OPENREPLAY_BASE_URL);
  if (allowed.has(requested)) return requested;
  await assertPublicHttpUrl(requested);
  return requested;
}

/** The OpenReplay cloud: its API and ingest live on api.openreplay.com, the dashboard on app.openreplay.com */
const CLOUD_API_HOST = 'api.openreplay.com';
const CLOUD_DASHBOARD_URL = 'https://app.openreplay.com';

function isCloud(baseUrl: string): boolean {
  try {
    return new URL(baseUrl).hostname === CLOUD_API_HOST;
  } catch {
    return false;
  }
}

function trimSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

/**
 * Root of OpenReplay's public REST API (v2), where `/projects` and
 * `/:projectKey/...` live: `https://api.openreplay.com/v2/public` on the
 * cloud, `https://<instance>/v2/api/public` when self-hosted or dedicated.
 */
export function openReplayPublicApiRoot(baseUrl: string): string {
  const base = trimSlash(baseUrl);
  return isCloud(base) ? `${base}/v2/public` : `${base}/v2/api/public`;
}

/** Where people sign in to OpenReplay: app.openreplay.com on the cloud, the instance itself when self-hosted */
export function openReplayDashboardUrl(baseUrl: string): string {
  return isCloud(baseUrl) ? CLOUD_DASHBOARD_URL : trimSlash(baseUrl);
}

/** The tracker's ingest point, or undefined on the cloud (the tracker's default) */
export function openReplayIngestPoint(baseUrl: string): string | undefined {
  return isCloud(baseUrl) ? undefined : `${trimSlash(baseUrl)}/ingest`;
}

/** OpenReplay's player for one recorded session (the dashboard route `/:siteId/session/:sessionId`) */
export function openReplaySessionUrl(baseUrl: string, projectId: number, sessionId: string): string {
  return `${openReplayDashboardUrl(baseUrl)}/${projectId}/session/${encodeURIComponent(sessionId)}`;
}

/**
 * OpenReplay keeps heatmaps as cards: the project's card list (`/:siteId/metrics`),
 * or one heatmap card when its id is given.
 */
export function openReplayHeatmapsUrl(baseUrl: string, projectId: number, heatmapId?: string): string {
  const cards = `${openReplayDashboardUrl(baseUrl)}/${projectId}/metrics`;
  return heatmapId ? `${cards}/${encodeURIComponent(heatmapId)}` : cards;
}
