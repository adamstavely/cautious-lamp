import { BadRequestException, PayloadTooLargeException, UnprocessableEntityException } from '@nestjs/common';
import { lookup as dnsLookup } from 'dns';
import * as http from 'http';
import * as https from 'https';
import type { LookupFunction } from 'net';
import { assertPublicHttpUrl, isBlockedAddress } from '../common/security/url-safety';

export interface FetchedPage {
  url: string;
  status: number;
  contentType: string;
  body: string;
}

/**
 * DNS lookup that refuses private addresses at connect time, so a hostname
 * can't pass assertPublicHttpUrl and then resolve somewhere internal (DNS
 * rebinding). Node skips lookup for IP literals; assertPublicHttpUrl covers those.
 */
const publicOnlyLookup: LookupFunction = (hostname, options, callback) => {
  dnsLookup(hostname, { ...options, all: true }, (error, addresses: any) => {
    if (error) return (callback as any)(error);
    const list = (Array.isArray(addresses) ? addresses : [{ address: addresses, family: 4 }]) as Array<{ address: string; family: number }>;
    if (list.length === 0 || list.some((entry) => isBlockedAddress(entry.address))) {
      return (callback as any)(new Error('Address is not public'));
    }
    if ((options as { all?: boolean }).all) return (callback as any)(null, list);
    return (callback as any)(null, list[0].address, list[0].family);
  });
};

function requestOnce(url: URL, timeoutMs: number, maxBytes: number): Promise<{ status: number; location?: string; contentType: string; body: Buffer }> {
  const client = url.protocol === 'https:' ? https : http;
  return new Promise((resolve, reject) => {
    const req = client.request(
      url,
      {
        method: 'GET',
        lookup: publicOnlyLookup,
        timeout: timeoutMs,
        headers: { 'User-Agent': 'cautious-lamp-governance/1.0', Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.1' },
      },
      (res) => {
        const status = res.statusCode ?? 0;
        if (status >= 300 && status < 400 && res.headers.location) {
          res.resume();
          return resolve({ status, location: res.headers.location, contentType: '', body: Buffer.alloc(0) });
        }
        const chunks: Buffer[] = [];
        let size = 0;
        res.on('data', (chunk: Buffer) => {
          size += chunk.length;
          if (size > maxBytes) {
            req.destroy();
            reject(new PayloadTooLargeException(`The page is larger than ${Math.round(maxBytes / 1024)} KB`));
            return;
          }
          chunks.push(chunk);
        });
        res.on('end', () => resolve({ status, contentType: String(res.headers['content-type'] ?? ''), body: Buffer.concat(chunks) }));
        res.on('error', reject);
      },
    );
    req.on('timeout', () => req.destroy(new Error(`Timed out after ${timeoutMs}ms`)));
    req.on('error', reject);
    req.end();
  });
}

/**
 * GETs a public http(s) page for scanning. Each redirect hop is checked again,
 * private addresses are refused at connect time, and the response is capped in
 * time and size.
 */
export async function fetchPublicPage(rawUrl: string, options: { timeoutMs?: number; maxBytes?: number; maxRedirects?: number } = {}): Promise<FetchedPage> {
  const timeoutMs = options.timeoutMs ?? 10000;
  const maxBytes = options.maxBytes ?? 2 * 1024 * 1024;
  const maxRedirects = options.maxRedirects ?? 5;
  const deadline = Date.now() + timeoutMs;

  let url = await assertPublicHttpUrl(rawUrl);
  for (let hop = 0; hop <= maxRedirects; hop++) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) throw new UnprocessableEntityException(`Could not fetch ${url.host}: timed out`);
    let result: Awaited<ReturnType<typeof requestOnce>>;
    try {
      result = await requestOnce(url, remaining, maxBytes);
    } catch (error) {
      if (error instanceof PayloadTooLargeException) throw error;
      throw new UnprocessableEntityException(`Could not fetch ${url.host}: ${(error as Error).message}`);
    }
    if (result.location) {
      let next: URL;
      try {
        next = new URL(result.location, url);
      } catch {
        throw new UnprocessableEntityException('The page redirected to an invalid URL');
      }
      url = await assertPublicHttpUrl(next.toString());
      continue;
    }
    if (result.status < 200 || result.status >= 300) {
      throw new UnprocessableEntityException(`Fetching ${url.host} returned HTTP ${result.status}`);
    }
    if (result.contentType && !/text\/html|application\/xhtml\+xml|text\/plain/i.test(result.contentType)) {
      throw new BadRequestException(`Expected an HTML page, got ${result.contentType.split(';')[0]}`);
    }
    return { url: url.toString(), status: result.status, contentType: result.contentType, body: result.body.toString('utf8') };
  }
  throw new UnprocessableEntityException('Too many redirects');
}
