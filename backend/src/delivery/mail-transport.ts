import * as nodemailer from 'nodemailer';

/** The part of a nodemailer transport delivery uses */
export interface MailSender {
  sendMail(mail: { from: string; to: string[]; subject: string; text: string }): Promise<unknown>;
}

/** SMTP settings read from the environment (docs/NOTIFICATIONS.md) */
export interface SmtpSettings {
  from: string;
  /** `SMTP_URL`, e.g. smtps://user:pass@smtp.example.com:465 */
  url?: string;
  host?: string;
  port?: number;
  /** TLS from the start (port 465); otherwise STARTTLS when the server offers it */
  secure?: boolean;
  user?: string;
  pass?: string;
}

export type MailTransportFactory = (settings: SmtpSettings, timeoutMs: number) => MailSender;

/**
 * SMTP settings from `SMTP_URL`, or `SMTP_HOST` with `SMTP_PORT`,
 * `SMTP_SECURE`, `SMTP_USER` and `SMTP_PASS`; `SMTP_FROM` is required either
 * way. Null when email isn't set up.
 */
export function smtpSettingsFromEnv(env: NodeJS.ProcessEnv = process.env): SmtpSettings | null {
  const from = env.SMTP_FROM?.trim();
  const url = env.SMTP_URL?.trim();
  const host = env.SMTP_HOST?.trim();
  if (!from || (!url && !host)) return null;
  if (url) return { from, url };
  const port = Number(env.SMTP_PORT) || undefined;
  return {
    from,
    host,
    port,
    secure: env.SMTP_SECURE ? env.SMTP_SECURE === 'true' : port === 465,
    user: env.SMTP_USER?.trim() || undefined,
    pass: env.SMTP_PASS || undefined,
  };
}

/** Why email isn't available, for the settings pages */
export function smtpMissingReason(env: NodeJS.ProcessEnv = process.env): string {
  if (!env.SMTP_URL?.trim() && !env.SMTP_HOST?.trim()) return "Email isn't set up on this server: SMTP_URL or SMTP_HOST is not set.";
  return "Email isn't set up on this server: SMTP_FROM is not set.";
}

/** A nodemailer SMTP transport with connection, greeting and socket timeouts */
export const nodemailerTransport: MailTransportFactory = (settings, timeoutMs) => {
  const timeouts = { connectionTimeout: timeoutMs, greetingTimeout: timeoutMs, socketTimeout: timeoutMs };
  if (settings.url) return nodemailer.createTransport({ url: settings.url, ...timeouts });
  return nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
    secure: settings.secure,
    ...(settings.user ? { auth: { user: settings.user, pass: settings.pass } } : {}),
    ...timeouts,
  });
};
