import { createHmac } from 'crypto';
import { InMemoryStore } from '../reviews/testing/in-memory-store';
import { DeliveryOptions, DeliveryService } from './delivery.service';
import { DeliveryAttempt, DeliveryMessage } from './delivery.types';
import { TEST_EGRESS, fakeMail, startTarget } from './testing/targets';

const smtpError = (responseCode: number, message: string) => Object.assign(new Error(message), { responseCode });

const MESSAGE: DeliveryMessage = { event: 'test', title: 'Card updated', text: 'Variant "dense" saved.', link: '/components/card' };
const OWNER = { kind: 'user' as const, id: 'usr_ann' };

describe('DeliveryService', () => {
  let attempts: InMemoryStore<DeliveryAttempt>;
  let target: Awaited<ReturnType<typeof startTarget>>;

  const service = (options: Partial<DeliveryOptions> = {}, mail?: ReturnType<typeof fakeMail>) =>
    new DeliveryService(attempts, mail?.factory, {
      retryDelayMs: 1,
      timeoutMs: 2000,
      allowHttp: true,
      egress: TEST_EGRESS,
      smtp: null,
      appUrl: 'https://design.example.com',
      ...options,
    });

  beforeEach(() => {
    attempts = new InMemoryStore<DeliveryAttempt>();
  });

  afterEach(async () => {
    await target?.close();
  });

  it('posts a Slack message and records the attempt without the URL', async () => {
    target = await startTarget([200]);
    const url = target.url('/services/T000/B000/secret-token');
    const attempt = await service().send(OWNER, { channel: 'slack', url }, MESSAGE);

    expect(attempt).toMatchObject({ status: 'sent', channel: 'slack', owner: 'user:usr_ann', test: false });
    expect(attempt.tries).toEqual([expect.objectContaining({ ok: true, httpStatus: 200 })]);
    const body = JSON.parse(target.received[0].body);
    expect(body.text).toBe('Card updated');
    expect(body.blocks[0].text.text).toContain('<https://design.example.com/components/card|Open in the design system>');

    const stored = [...attempts.docs.values()].map((e) => e.doc);
    expect(stored).toHaveLength(1);
    expect(stored[0].target).toMatch(/^127\.0\.0\.1:\d+$/);
    expect(JSON.stringify(stored)).not.toContain('secret-token');
  });

  it('posts a Teams Adaptive Card', async () => {
    target = await startTarget([202]);
    const attempt = await service().send(OWNER, { channel: 'teams', url: target.url() }, MESSAGE);
    expect(attempt.status).toBe('sent');
    const body = JSON.parse(target.received[0].body);
    expect(body.attachments[0].contentType).toBe('application/vnd.microsoft.card.adaptive');
    expect(body.attachments[0].content.body[0].text).toBe('Card updated');
  });

  it('retries a transient failure with backoff, then succeeds', async () => {
    target = await startTarget([503, 429, 200]);
    const attempt = await service().send(OWNER, { channel: 'slack', url: target.url() }, MESSAGE);
    expect(attempt.status).toBe('sent');
    expect(attempt.tries.map((t) => [t.ok, t.httpStatus])).toEqual([
      [false, 503],
      [false, 429],
      [true, 200],
    ]);
    expect(target.received).toHaveLength(3);
  });

  it('gives up after the last try and records the failure', async () => {
    target = await startTarget([500]);
    const attempt = await service({ maxAttempts: 3 }).send(OWNER, { channel: 'slack', url: target.url() }, MESSAGE);
    expect(attempt).toMatchObject({ status: 'failed', error: 'HTTP 500' });
    expect(attempt.tries).toHaveLength(3);
    expect((await attempts.get(attempt.id))!.doc.status).toBe('failed');
  });

  it("doesn't retry a permanent failure (4xx)", async () => {
    target = await startTarget([404]);
    const attempt = await service().send(OWNER, { channel: 'slack', url: target.url() }, MESSAGE);
    expect(attempt).toMatchObject({ status: 'failed', error: 'HTTP 404' });
    expect(target.received).toHaveLength(1);
  });

  it('times out a target that never answers', async () => {
    target = await startTarget([200]);
    target.hangForever();
    const attempt = await service({ timeoutMs: 50, maxAttempts: 2 }).send(OWNER, { channel: 'slack', url: target.url() }, MESSAGE);
    expect(attempt.status).toBe('failed');
    expect(attempt.tries).toHaveLength(2);
    expect(attempt.error).toMatch(/Timed out after 50ms/);
  });

  it('refuses private and internal addresses without sending anything', async () => {
    const strict = service({ egress: {} });
    for (const url of ['http://10.0.0.7/hook', 'http://169.254.169.254/latest/meta-data', 'http://127.0.0.1:9/hook', 'http://[::1]/hook']) {
      const attempt = await strict.send(OWNER, { channel: 'webhook', url, secret: 's'.repeat(32) }, MESSAGE);
      expect([url, attempt.status, attempt.tries.length]).toEqual([url, 'refused', 1]);
    }
    await expect(strict.checkUrl('http://192.168.1.10/hook')).rejects.toMatchObject({ status: 400 });
    expect([...attempts.docs.values()].every((e) => e.doc.status === 'refused')).toBe(true);
  });

  it('only uses https outside tests', async () => {
    const real = service({ allowHttp: false, egress: {} });
    await expect(real.checkUrl('http://hooks.example.com/x')).rejects.toMatchObject({ status: 400 });
    const attempt = await real.send(OWNER, { channel: 'slack', url: 'http://hooks.example.com/x' }, MESSAGE);
    expect(attempt.status).toBe('refused');
  });

  it('signs generic webhooks with HMAC-SHA256 over the timestamp and body', async () => {
    target = await startTarget([200]);
    const secret = 'whsec_0123456789abcdef0123456789abcdef';
    const attempt = await service().send(OWNER, { channel: 'webhook', url: target.url(), secret }, { ...MESSAGE, data: { breaking: true } });
    expect(attempt.status).toBe('sent');

    const { headers, body } = target.received[0];
    const timestamp = headers['x-signature-timestamp'] as string;
    const expected = `sha256=${createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex')}`;
    expect(headers['x-signature-256']).toBe(expected);
    expect(headers['x-delivery-id']).toBe(attempt.id);
    expect(headers['x-delivery-event']).toBe('test');
    expect(JSON.parse(body)).toMatchObject({ id: attempt.id, event: 'test', title: 'Card updated', data: { breaking: true } });
    expect(JSON.stringify([...attempts.docs.values()])).not.toContain(secret);
  });

  describe('email', () => {
    const smtp = { from: 'Design system <ds@example.com>', host: 'smtp.example.com', port: 587 };

    it('says email is not configured without SMTP, and records that rather than pretending', async () => {
      const delivery = service();
      expect(delivery.availability().email).toMatchObject({ available: false, reason: expect.stringContaining('SMTP') });
      expect(delivery.availability().slack).toEqual({ available: true });
      const attempt = await delivery.send(OWNER, { channel: 'email', to: ['ann@example.com'] }, MESSAGE);
      expect(attempt).toMatchObject({ status: 'not-configured', tries: [] });
    });

    it('sends through the SMTP transport with the link made absolute', async () => {
      const mail = fakeMail();
      const attempt = await service({ smtp }, mail).send(OWNER, { channel: 'email', to: ['ann@example.com'] }, MESSAGE);
      expect(attempt).toMatchObject({ status: 'sent', target: 'ann@example.com' });
      expect(mail.sent).toEqual([
        {
          from: smtp.from,
          to: ['ann@example.com'],
          subject: 'Card updated',
          text: 'Variant "dense" saved.\n\nOpen: https://design.example.com/components/card',
        },
      ]);
    });

    it('retries a temporary SMTP error and gives up on a permanent one', async () => {
      const flaky = fakeMail([smtpError(421, 'Try again later')]);
      expect((await service({ smtp }, flaky).send(OWNER, { channel: 'email', to: ['a@example.com'] }, MESSAGE)).tries.map((t) => t.ok)).toEqual([
        false,
        true,
      ]);
      const rejected = fakeMail([smtpError(550, 'No such user')]);
      const attempt = await service({ smtp }, rejected).send(OWNER, { channel: 'email', to: ['nobody@example.com'] }, MESSAGE);
      expect(attempt).toMatchObject({ status: 'failed', error: 'No such user' });
      expect(attempt.tries).toHaveLength(1);
    });
  });

  it('lists an owner\'s recent attempts, newest first, and waits for background deliveries', async () => {
    target = await startTarget([200]);
    const delivery = service();
    delivery.sendInBackground(OWNER, { channel: 'slack', url: target.url() }, { ...MESSAGE, title: 'First' });
    await delivery.idle();
    await new Promise((resolve) => setTimeout(resolve, 5));
    delivery.sendInBackground(OWNER, { channel: 'slack', url: target.url() }, { ...MESSAGE, title: 'Second' });
    delivery.sendInBackground({ kind: 'user', id: 'usr_bob' }, { channel: 'slack', url: target.url() }, MESSAGE);
    await delivery.idle();
    expect((await delivery.recent(OWNER)).map((a) => a.title)).toEqual(['Second', 'First']);
  });
});
