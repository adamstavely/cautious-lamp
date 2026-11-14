import { BadRequestException } from '@nestjs/common';
import { lookup } from 'dns/promises';
import { BlockList, isIP } from 'net';

/** Address ranges a server-side fetch must never reach */
const blocked = new BlockList();
for (const [network, prefix] of [
  ['0.0.0.0', 8], // "this" network
  ['10.0.0.0', 8], // private
  ['100.64.0.0', 10], // carrier-grade NAT
  ['127.0.0.0', 8], // loopback
  ['169.254.0.0', 16], // link-local, including cloud metadata (169.254.169.254)
  ['172.16.0.0', 12], // private
  ['192.0.0.0', 24], // IETF protocol assignments
  ['192.168.0.0', 16], // private
  ['198.18.0.0', 15], // benchmarking
  ['224.0.0.0', 4], // multicast
  ['240.0.0.0', 4], // reserved and broadcast
] as const) {
  blocked.addSubnet(network, prefix, 'ipv4');
}
for (const [network, prefix] of [
  ['::', 128], // unspecified
  ['::1', 128], // loopback
  ['fc00::', 7], // unique local
  ['fe80::', 10], // link-local
  ['ff00::', 8], // multicast
] as const) {
  blocked.addSubnet(network, prefix, 'ipv6');
}

/** Whether an IP address is in a private, loopback, link-local or reserved range */
export function isBlockedAddress(address: string): boolean {
  const family = isIP(address);
  if (family === 4) return blocked.check(address, 'ipv4');
  if (family === 6) {
    // IPv4-mapped IPv6 (::ffff:127.0.0.1) must be checked as IPv4
    const mapped = address.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
    if (mapped) return blocked.check(mapped[1], 'ipv4');
    return blocked.check(address, 'ipv6');
  }
  return true;
}

/**
 * Parses a URL and checks it only points at the public internet: http(s), and
 * every address the hostname resolves to is public. Throws 400 otherwise.
 *
 * This is an early, friendly check only: the hostname is resolved again when
 * connecting. Anything that connects must also check at connect time
 * (resolvePublicAddress, the governance safe fetch, or the egress proxy for
 * headless Chromium) or a DNS-rebinding host can answer differently then.
 */
export async function assertPublicHttpUrl(rawUrl: string, policy: DestinationPolicy = {}): Promise<URL> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new BadRequestException('Invalid URL');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new BadRequestException('Only http and https URLs are allowed');
  }
  if (url.username || url.password) {
    throw new BadRequestException('URLs with credentials are not allowed');
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, '');
  let addresses: string[];
  try {
    addresses = isIP(hostname)
      ? [hostname]
      : (await (policy.resolve ?? systemResolver)(hostname)).map((entry) => entry.address);
  } catch {
    throw new BadRequestException(`Could not resolve ${url.hostname}`);
  }
  const allowed = policy.isAllowedAddress ?? ((address: string) => !isBlockedAddress(address));
  if (addresses.length === 0 || addresses.some((address) => !allowed(address))) {
    throw new BadRequestException('URLs that point to private or internal addresses are not allowed');
  }
  return url;
}

/** Resolves a hostname to every address it has; swapped in tests */
export type HostResolver = (hostname: string) => Promise<Array<{ address: string; family: number }>>;

export interface DestinationPolicy {
  /** Defaults to the system resolver */
  resolve?: HostResolver;
  /** Defaults to "not a private, loopback, link-local or reserved address" */
  isAllowedAddress?: (address: string) => boolean;
}

/** Thrown when a destination resolves to an address the policy refuses */
export class BlockedDestinationError extends Error {
  constructor(readonly host: string) {
    super(`${host} does not resolve to a public address`);
  }
}

const systemResolver: HostResolver = (hostname) => lookup(hostname, { all: true, verbatim: true });

/**
 * Resolves a host once and checks every answer, returning the address to
 * connect to. Callers connect to that address (not the hostname), so the
 * check and the connection see the same DNS answer: a rebinding resolver
 * that answers differently next time can't slip an internal address in.
 */
export async function resolvePublicAddress(host: string, policy: DestinationPolicy = {}): Promise<{ address: string; family: number }> {
  const hostname = host.replace(/^\[|\]$/g, '');
  const allowed = policy.isAllowedAddress ?? ((address: string) => !isBlockedAddress(address));
  const family = isIP(hostname);
  let addresses: Array<{ address: string; family: number }>;
  try {
    addresses = family ? [{ address: hostname, family }] : await (policy.resolve ?? systemResolver)(hostname);
  } catch {
    throw new BlockedDestinationError(hostname);
  }
  if (addresses.length === 0 || addresses.some((entry) => !allowed(entry.address))) throw new BlockedDestinationError(hostname);
  return addresses[0];
}
