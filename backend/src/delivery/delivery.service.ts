import { BadRequestException, Inject, Injectable, Logger, OnApplicationShutdown, Optional } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { DestinationPolicy, assertPublicHttpUrl } from '../common/security/url-safety';
import { DocumentStore } from '../reviews/document-store';
import {
  absoluteLink,
  DELIVERY_ID_HEADER,
  emailText,
  EVENT_HEADER,
  SIGNATURE_HEADER,
  slackPayload,
  teamsPayload,
  TIMESTAMP_HEADER,
  webhookPayload,
  webhookSignature,
} from './delivery-formats';
import {
  ChannelAvailability,
  DELIVERY_ATTEMPT_STORE,
  DELIVERY_OPTIONS,
  DeliveryAttempt,
  DeliveryChannel,
  DeliveryMessage,
  DeliveryOwner,
  DeliveryStatus,
  DeliveryTarget,
  DeliveryTry,
  MAIL_TRANSPORT_FACTORY,
  ownerKey,
} from './delivery.types';
import { DeliveryHttpError, DeliveryRefusedError, postJson } from './http-delivery';
import { MailSender, MailTransportFactory, SmtpSettings, nodemailerTransport, smtpMissingReason, smtpSettingsFromEnv } from './mail-transport';

export interface DeliveryOptions {
  /** Tries per delivery, the first included (default 3) */
  maxAttempts: number;
  /** Wait before the first retry; doubles each time (default 1000ms) */
  retryDelayMs: number;
  /** Per try, for HTTP requests and each SMTP stage (default 10000ms) */
  timeoutMs: number;
  /** Where URLs may point; defaults to public addresses only */
  egress: DestinationPolicy;
  /** Plain http targets; off outside tests, so secrets and signatures travel over TLS */
  allowHttp: boolean;
  /** Null when email isn't set up; read from SMTP_* by default */
  smtp: SmtpSettings | null;
  /** The frontend's public origin, for links in messages (APP_PUBLIC_URL) */
  appUrl?: string;
}

/** How long recent attempts are listed for */
const RECENT_DAYS = 30;
/** Error text kept per try; SMTP servers can answer at length */
const MAX_ERROR_LENGTH = 300;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface Failure {
  message: string;
  retryable: boolean;
  refused: boolean;
  httpStatus?: number;
}

/** Sorts an error from a try into retry, give up, or refused */
function classify(error: unknown): Failure {
  const message = String((error as Error)?.message ?? error).slice(0, MAX_ERROR_LENGTH);
  if (error instanceof DeliveryRefusedError) return { message, retryable: false, refused: true };
  if (error instanceof DeliveryHttpError) return { message, retryable: error.retryable, refused: false, httpStatus: error.status };
  // nodemailer: SMTP 5xx answers are permanent, 4xx and connection problems are worth another try
  const smtp = error as { responseCode?: number; code?: string };
  if (typeof smtp?.responseCode === 'number') return { message, retryable: smtp.responseCode < 500, refused: false };
  if (smtp?.code === 'EENVELOPE' || smtp?.code === 'EAUTH') return { message, retryable: false, refused: false };
  return { message, retryable: true, refused: false };
}

/** Recipients for email, the host for URL targets: never the URL itself, which is a secret */
function describeTarget(target: DeliveryTarget): string {
  if (target.channel === 'email') return target.to.join(', ');
  try {
    return new URL(target.url).host;
  } catch {
    return 'invalid URL';
  }
}

/**
 * Sends messages out of the app: email over SMTP, Slack and Microsoft Teams
 * incoming webhooks, and generic JSON webhooks signed with HMAC-SHA256. Every
 * HTTP call goes through the egress checks (public addresses only, checked at
 * connect time) with a timeout, and failed tries are retried with doubling
 * delays. Each delivery and its tries are recorded in Elasticsearch
 * (`design-system-delivery-attempts`) without secrets, so failures show on
 * the settings pages instead of disappearing into a log.
 */
@Injectable()
export class DeliveryService implements OnApplicationShutdown {
  private readonly logger = new Logger(DeliveryService.name);
  private readonly options: DeliveryOptions;
  private mailer?: MailSender;
  private readonly pending = new Set<Promise<unknown>>();

  constructor(
    @Inject(DELIVERY_ATTEMPT_STORE) private readonly attempts: DocumentStore<DeliveryAttempt>,
    @Optional() @Inject(MAIL_TRANSPORT_FACTORY) private readonly transportFactory?: MailTransportFactory,
    @Optional() @Inject(DELIVERY_OPTIONS) overrides?: Partial<DeliveryOptions>,
  ) {
    this.options = {
      maxAttempts: 3,
      retryDelayMs: 1000,
      timeoutMs: 10000,
      egress: {},
      allowHttp: false,
      smtp: smtpSettingsFromEnv(),
      appUrl: process.env.APP_PUBLIC_URL?.trim() || undefined,
      ...overrides,
    };
  }

  /** What the server can deliver to. Slack, Teams and webhooks need only outbound HTTPS; email needs SMTP. */
  availability(): Record<DeliveryChannel, ChannelAvailability> {
    const email: ChannelAvailability = this.options.smtp ? { available: true } : { available: false, reason: smtpMissingReason() };
    return { email, slack: { available: true }, teams: { available: true }, webhook: { available: true } };
  }

  /**
   * Checks a URL someone wants to save: https, and only public addresses.
   * Throws 400. The check runs again at send time, against the address
   * actually connected to.
   */
  async checkUrl(rawUrl: string): Promise<string> {
    if (!this.options.allowHttp && !/^https:\/\//i.test(rawUrl.trim())) throw new BadRequestException('Use an https URL');
    return (await assertPublicHttpUrl(rawUrl.trim(), this.options.egress)).toString();
  }

  /** Delivers one message to one target, retrying transient failures, and records the outcome */
  async send(owner: DeliveryOwner, target: DeliveryTarget, message: DeliveryMessage, options: { test?: boolean } = {}): Promise<DeliveryAttempt> {
    const id = `dlv_${randomBytes(12).toString('hex')}`;
    const createdAt = new Date().toISOString();
    const tries: DeliveryTry[] = [];
    let status: DeliveryStatus = 'failed';
    let error: string | undefined;

    if (target.channel === 'email' && !this.options.smtp) {
      status = 'not-configured';
      error = smtpMissingReason();
    } else if (target.channel === 'email' && target.to.length === 0) {
      error = 'No recipients';
    } else {
      for (let attempt = 1; attempt <= this.options.maxAttempts; attempt++) {
        const at = new Date().toISOString();
        try {
          const httpStatus = await this.deliverOnce(id, target, message);
          tries.push({ at, ok: true, ...(httpStatus ? { httpStatus } : {}) });
          status = 'sent';
          error = undefined;
          break;
        } catch (caught) {
          const failure = classify(caught);
          tries.push({ at, ok: false, error: failure.message, ...(failure.httpStatus ? { httpStatus: failure.httpStatus } : {}) });
          error = failure.message;
          if (failure.refused) {
            status = 'refused';
            break;
          }
          if (!failure.retryable || attempt === this.options.maxAttempts) break;
          await sleep(this.options.retryDelayMs * 2 ** (attempt - 1));
        }
      }
    }

    const record: DeliveryAttempt = {
      id,
      owner: ownerKey(owner),
      ownerKind: owner.kind,
      ownerId: owner.id,
      channel: target.channel,
      target: describeTarget(target),
      event: message.event,
      title: message.title,
      test: !!options.test,
      status,
      tries,
      ...(error ? { error } : {}),
      createdAt,
      finishedAt: new Date().toISOString(),
    };
    if (status !== 'sent') {
      this.logger.warn(`${target.channel} delivery ${id} for ${record.owner} ${status}: ${error}`);
    }
    try {
      await this.attempts.create(record);
    } catch (caught) {
      this.logger.error(`Delivery ${id} for ${record.owner} not recorded: ${(caught as Error)?.message}`);
    }
    return record;
  }

  /**
   * Starts a delivery without making the caller wait or fail: for side
   * effects of a change that has already been saved. The outcome is recorded
   * like any other.
   */
  sendInBackground(owner: DeliveryOwner, target: DeliveryTarget, message: DeliveryMessage): void {
    const delivery = this.send(owner, target, message).catch((caught) => {
      this.logger.error(`${target.channel} delivery for ${ownerKey(owner)} failed: ${(caught as Error)?.message}`);
    });
    this.pending.add(delivery);
    void delivery.finally(() => this.pending.delete(delivery));
  }

  /** Resolves when every background delivery has finished */
  async idle(): Promise<void> {
    while (this.pending.size) await Promise.allSettled([...this.pending]);
  }

  async onApplicationShutdown(): Promise<void> {
    await this.idle();
  }

  /** The owner's deliveries from the last 30 days, newest first */
  async recent(owner: DeliveryOwner, limit = 20): Promise<DeliveryAttempt[]> {
    const since = new Date(Date.now() - RECENT_DAYS * 86400000).toISOString();
    const attempts = await this.attempts.list({ where: { owner: ownerKey(owner) }, after: { createdAt: since } });
    return attempts.slice(0, limit);
  }

  /** One try; resolves with the HTTP status for URL targets */
  private async deliverOnce(id: string, target: DeliveryTarget, message: DeliveryMessage): Promise<number | undefined> {
    const link = absoluteLink(message, this.options.appUrl);
    if (target.channel === 'email') {
      this.mailer ??= (this.transportFactory ?? nodemailerTransport)(this.options.smtp!, this.options.timeoutMs);
      await this.mailer.sendMail({ from: this.options.smtp!.from, to: target.to, subject: message.title, text: emailText(message, link) });
      return undefined;
    }

    if (!this.options.allowHttp && !/^https:/i.test(target.url)) throw new DeliveryRefusedError('Only https URLs are used');
    const http = { timeoutMs: this.options.timeoutMs, policy: this.options.egress };
    if (target.channel !== 'webhook') {
      const payload = target.channel === 'slack' ? slackPayload(message, link) : teamsPayload(message, link);
      return postJson(target.url, JSON.stringify(payload), {}, http);
    }

    const sentAt = new Date().toISOString();
    const body = JSON.stringify(webhookPayload(message, id, sentAt, link));
    const timestamp = Math.floor(Date.now() / 1000).toString();
    return postJson(
      target.url,
      body,
      {
        [SIGNATURE_HEADER]: webhookSignature(target.secret, timestamp, body),
        [TIMESTAMP_HEADER]: timestamp,
        [DELIVERY_ID_HEADER]: id,
        [EVENT_HEADER]: message.event,
      },
      http,
    );
  }
}
