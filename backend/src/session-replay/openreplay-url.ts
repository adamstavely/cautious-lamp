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
