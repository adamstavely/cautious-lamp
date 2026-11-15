import * as http from 'http';
import * as https from 'https';
import { assertPublicHttpUrl } from '../common/security/url-safety';
import { publicOnlyLookup } from '../governance/safe-fetch';

/** One JSON request to a design tool's API */
export interface DesignToolRequest {
  url: string;
  method: 'GET' | 'POST';
  headers: Record<string, string>;
  body?: unknown;
}

export interface DesignToolResponse {
  status: number;
  body: unknown;
}

/** Sends a request and parses the JSON answer; swapped for a stub in tests */
export type DesignToolHttp = (request: DesignToolRequest) => Promise<DesignToolResponse>;

/**
 * Why a design tool couldn't be read: the destination was refused, the call
 * failed or timed out, or the tool answered with an error. The message is
 * meant for the person who asked for the sync.
 */
export class DesignToolError extends Error {
  constructor(
    message: string,
    /** HTTP status from the design tool, when it answered */
    readonly status?: number,
  ) {
    super(message);
  }
}

export interface PublicJsonOptions {
  timeoutMs?: number;
  maxBytes?: number;
}

/**
 * Sends a JSON request to a design tool on the public internet, through the
 * same egress checks as the governance page fetch: the URL must be http(s)
 * and resolve only to public addresses (checked first, and again at connect
 * time so DNS rebinding can't slip an internal address in). Redirects are not
 * followed, and the call is capped in time and size.
 */
export function publicJsonHttp(options: PublicJsonOptions = {}): DesignToolHttp {
  const timeoutMs = options.timeoutMs ?? (Number(process.env.DESIGN_TOOL_TIMEOUT_MS) || 20000);
  const maxBytes = options.maxBytes ?? 25 * 1024 * 1024;
  return async (request) => {
    let url: URL;
    try {
      url = await assertPublicHttpUrl(request.url);
    } catch (error) {
      throw new DesignToolError(`Refused to contact ${hostOf(request.url)}: ${(error as Error).message}`);
    }
    const payload = request.body === undefined ? undefined : Buffer.from(JSON.stringify(request.body));
    const client = url.protocol === 'https:' ? https : http;
    return new Promise<DesignToolResponse>((resolve, reject) => {
      const req = client.request(
        url,
        {
          method: request.method,
          lookup: publicOnlyLookup,
          timeout: timeoutMs,
          headers: {
            'User-Agent': 'cautious-lamp-design-sync/1.0',
            Accept: 'application/json',
            ...(payload ? { 'Content-Type': 'application/json', 'Content-Length': String(payload.length) } : {}),
            ...request.headers,
          },
        },
        (res) => {
          const status = res.statusCode ?? 0;
          if (status >= 300 && status < 400) {
            res.resume();
            reject(new DesignToolError(`${url.host} answered with a redirect (HTTP ${status}); redirects are not followed`, status));
            return;
          }
          const chunks: Buffer[] = [];
          let size = 0;
          res.on('data', (chunk: Buffer) => {
            size += chunk.length;
            if (size > maxBytes) {
              req.destroy();
              reject(new DesignToolError(`The answer from ${url.host} is larger than ${Math.round(maxBytes / (1024 * 1024))} MB`));
              return;
            }
            chunks.push(chunk);
          });
          res.on('end', () => {
            const text = Buffer.concat(chunks).toString('utf8');
            let body: unknown = text;
            try {
              body = text ? JSON.parse(text) : undefined;
            } catch {
              // Not JSON (an HTML error page, say): keep the text for the error message
            }
            resolve({ status, body });
          });
          res.on('error', (error) => reject(new DesignToolError(`Could not read from ${url.host}: ${error.message}`)));
        },
      );
      // `timeout` only covers an idle socket; the deadline covers the whole call
      const deadline = setTimeout(() => req.destroy(new Error(`timed out after ${timeoutMs}ms`)), timeoutMs);
      req.on('close', () => clearTimeout(deadline));
      req.on('timeout', () => req.destroy(new Error(`timed out after ${timeoutMs}ms`)));
      req.on('error', (error) => reject(error instanceof DesignToolError ? error : new DesignToolError(`Could not reach ${url.host}: ${error.message}`)));
      if (payload) req.write(payload);
      req.end();
    });
  };
}

function hostOf(rawUrl: string): string {
  try {
    return new URL(rawUrl).host;
  } catch {
    return 'that address';
  }
}

/** The `message` (or `err`) a design tool put in its error body, if any */
export function errorMessageOf(body: unknown): string | undefined {
  if (!body || typeof body !== 'object') return typeof body === 'string' && body.length < 300 ? body : undefined;
  const record = body as Record<string, unknown>;
  for (const key of ['message', 'err', 'error', 'hint']) {
    if (typeof record[key] === 'string' && record[key]) return record[key] as string;
  }
  return undefined;
}
