import * as http from 'http';
import * as https from 'https';
import type { LookupFunction } from 'net';
import { DestinationPolicy, assertPublicHttpUrl, resolvePublicAddress } from '../common/security/url-safety';

/** The URL points at a private or internal address (or isn't a valid http(s) URL): nothing was sent */
export class DeliveryRefusedError extends Error {}

/** The target answered with an error, or couldn't be reached */
export class DeliveryHttpError extends Error {
  constructor(
    message: string,
    readonly retryable: boolean,
    readonly status?: number,
  ) {
    super(message);
  }
}

/** Always answers with the address that was checked, so the check and the connection see the same DNS answer */
function fixedLookup(address: string, family: number): LookupFunction {
  return ((_hostname: string, options: { all?: boolean }, callback: (...args: unknown[]) => void) => {
    if (options?.all) callback(null, [{ address, family }]);
    else callback(null, address, family);
  }) as unknown as LookupFunction;
}

/**
 * POSTs a JSON body to a public http(s) URL and resolves with the status.
 * The URL is checked with assertPublicHttpUrl, then the host is resolved once
 * more and the connection made to exactly that checked address (DNS
 * rebinding can't slip an internal address in). Redirects aren't followed.
 * Throws DeliveryRefusedError for private targets and DeliveryHttpError
 * otherwise; 5xx, 408, 429, timeouts and network errors are retryable.
 */
export async function postJson(
  rawUrl: string,
  body: string,
  headers: Record<string, string>,
  options: { timeoutMs: number; policy?: DestinationPolicy },
): Promise<number> {
  let url: URL;
  let target: { address: string; family: number };
  try {
    url = await assertPublicHttpUrl(rawUrl, options.policy);
    target = await resolvePublicAddress(url.hostname, options.policy);
  } catch (error) {
    throw new DeliveryRefusedError((error as Error).message);
  }

  const client = url.protocol === 'https:' ? https : http;
  return new Promise<number>((resolve, reject) => {
    const req = client.request(
      url,
      {
        method: 'POST',
        lookup: fixedLookup(target.address, target.family),
        timeout: options.timeoutMs,
        agent: false,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body).toString(),
          'User-Agent': 'cautious-lamp-delivery/1.0',
          ...headers,
        },
      },
      (res) => {
        // Only the status matters; drain the body without keeping it
        res.resume();
        const status = res.statusCode ?? 0;
        if (status >= 200 && status < 300) return resolve(status);
        if (status >= 300 && status < 400) return reject(new DeliveryHttpError(`HTTP ${status}: redirects aren't followed`, false, status));
        const retryable = status >= 500 || status === 408 || status === 429;
        reject(new DeliveryHttpError(`HTTP ${status}`, retryable, status));
      },
    );
    req.on('timeout', () => req.destroy(new Error(`Timed out after ${options.timeoutMs}ms`)));
    req.on('error', (error) => reject(error instanceof DeliveryHttpError ? error : new DeliveryHttpError(error.message, true)));
    req.end(body);
  });
}
