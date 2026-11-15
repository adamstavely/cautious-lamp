/** Elasticsearch index, injection tokens and documents for outbound delivery (email, Slack, Teams, webhooks) */

export const DELIVERY_ATTEMPTS_INDEX = 'design-system-delivery-attempts';

export const DELIVERY_ATTEMPT_STORE = Symbol('DELIVERY_ATTEMPT_STORE');
/** Overrides for DeliveryOptions (tests use it for short delays and a local HTTP target) */
export const DELIVERY_OPTIONS = Symbol('DELIVERY_OPTIONS');
/** Builds the mail sender from the SMTP settings; tests swap in a fake transport */
export const MAIL_TRANSPORT_FACTORY = Symbol('MAIL_TRANSPORT_FACTORY');

export const DELIVERY_CHANNELS = ['email', 'slack', 'teams', 'webhook'] as const;
export type DeliveryChannel = (typeof DELIVERY_CHANNELS)[number];

/** Channels that post to a URL the owner saves (the URL is a secret) */
export const URL_CHANNELS = ['slack', 'teams', 'webhook'] as const;
export type UrlChannel = (typeof URL_CHANNELS)[number];

/** Where one delivery goes, with its secrets decrypted. Never stored or returned as is. */
export type DeliveryTarget =
  | { channel: 'email'; to: string[] }
  | { channel: 'slack' | 'teams'; url: string }
  | { channel: 'webhook'; url: string; secret: string };

/** What is sent; each channel formats it its own way */
export interface DeliveryMessage {
  /** Machine-readable kind, e.g. `design-system-change` or `visual-regression.build.completed` */
  event: string;
  title: string;
  text: string;
  /** A path in the app (`/components/button`); made absolute with APP_PUBLIC_URL, left out without it */
  link?: string;
  /** Extra fields for the generic webhook's JSON body */
  data?: Record<string, unknown>;
}

/** Whose delivery this was: a person's notifications or a visual regression project's */
export interface DeliveryOwner {
  kind: 'user' | 'vr-project';
  id: string;
}

/**
 * - `sent`: the target accepted it
 * - `failed`: every try failed, or the target refused it for good (HTTP 4xx, SMTP 5xx)
 * - `refused`: the URL points at a private or internal address, so nothing was sent
 * - `not-configured`: the server isn't set up for the channel (no SMTP)
 */
export type DeliveryStatus = 'sent' | 'failed' | 'refused' | 'not-configured';

export interface DeliveryTry {
  at: string;
  ok: boolean;
  httpStatus?: number;
  error?: string;
}

/** One delivery and each try at it, as stored. Holds no secrets: URL targets are recorded by host only. */
export interface DeliveryAttempt {
  id: string;
  /** `<kind>:<id>` of the owner, for term queries */
  owner: string;
  ownerKind: DeliveryOwner['kind'];
  ownerId: string;
  channel: DeliveryChannel;
  /** Recipients for email, the host for URL channels */
  target: string;
  event: string;
  title: string;
  /** Sent with "Send test" */
  test: boolean;
  status: DeliveryStatus;
  tries: DeliveryTry[];
  /** The last error, when it wasn't sent */
  error?: string;
  createdAt: string;
  finishedAt: string;
}

/** Whether the server can deliver to a channel at all */
export interface ChannelAvailability {
  available: boolean;
  /** Why not, when it isn't */
  reason?: string;
}

export function ownerKey(owner: DeliveryOwner): string {
  return `${owner.kind}:${owner.id}`;
}

const keyword = { type: 'keyword' };
const date = { type: 'date' };

export const DELIVERY_ATTEMPT_PROPERTIES = {
  id: keyword,
  owner: keyword,
  ownerKind: keyword,
  ownerId: keyword,
  channel: keyword,
  event: keyword,
  status: keyword,
  test: { type: 'boolean' },
  createdAt: date,
  finishedAt: date,
};
