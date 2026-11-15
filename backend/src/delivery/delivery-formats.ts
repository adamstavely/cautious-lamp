import { createHmac } from 'crypto';
import { DeliveryMessage } from './delivery.types';

/** Headers on generic webhook deliveries (docs/NOTIFICATIONS.md, "Verifying webhooks") */
export const SIGNATURE_HEADER = 'X-Signature-256';
export const TIMESTAMP_HEADER = 'X-Signature-Timestamp';
export const DELIVERY_ID_HEADER = 'X-Delivery-Id';
export const EVENT_HEADER = 'X-Delivery-Event';

/** The message's link made absolute with APP_PUBLIC_URL; undefined without one (a bare path is no use outside the app) */
export function absoluteLink(message: DeliveryMessage, appUrl: string | undefined): string | undefined {
  if (!message.link) return undefined;
  if (/^https?:\/\//i.test(message.link)) return message.link;
  if (!appUrl) return undefined;
  return `${appUrl.replace(/\/+$/, '')}/${message.link.replace(/^\/+/, '')}`;
}

export function emailText(message: DeliveryMessage, link?: string): string {
  return [message.text, link ? `Open: ${link}` : ''].filter(Boolean).join('\n\n');
}

/** Slack mrkdwn needs &, < and > escaped */
function slackEscape(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** A Slack incoming-webhook message: a plain-text fallback and one section block */
export function slackPayload(message: DeliveryMessage, link?: string): Record<string, unknown> {
  const lines = [`*${slackEscape(message.title)}*`, slackEscape(message.text)];
  if (link) lines.push(`<${link}|Open in the design system>`);
  return {
    text: message.title,
    blocks: [{ type: 'section', text: { type: 'mrkdwn', text: lines.filter(Boolean).join('\n') } }],
  };
}

/** A Microsoft Teams incoming-webhook (or Workflows) message carrying an Adaptive Card */
export function teamsPayload(message: DeliveryMessage, link?: string): Record<string, unknown> {
  return {
    type: 'message',
    attachments: [
      {
        contentType: 'application/vnd.microsoft.card.adaptive',
        content: {
          $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
          type: 'AdaptiveCard',
          version: '1.4',
          body: [
            { type: 'TextBlock', text: message.title, weight: 'Bolder', size: 'Medium', wrap: true },
            { type: 'TextBlock', text: message.text, wrap: true },
          ],
          ...(link ? { actions: [{ type: 'Action.OpenUrl', title: 'Open in the design system', url: link }] } : {}),
        },
      },
    ],
  };
}

/** The generic webhook's JSON body */
export function webhookPayload(message: DeliveryMessage, deliveryId: string, sentAt: string, link?: string): Record<string, unknown> {
  return {
    id: deliveryId,
    event: message.event,
    title: message.title,
    text: message.text,
    ...(link ? { link } : {}),
    ...(message.data ? { data: message.data } : {}),
    sentAt,
  };
}

/**
 * `sha256=<hex HMAC-SHA256 of "<timestamp>.<body>">` with the target's
 * secret. Receivers recompute it over the raw body and the timestamp header,
 * compare in constant time, and reject old timestamps to stop replays.
 */
export function webhookSignature(secret: string, timestamp: string, body: string): string {
  return `sha256=${createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex')}`;
}
