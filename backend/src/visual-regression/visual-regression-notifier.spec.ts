import { createHmac } from 'crypto';
import { TEST_EGRESS, fakeMail, startTarget } from '../delivery/testing/targets';
import { ArgosApiClient } from './argos-api.client';
import { SYSTEM_CREATOR, createProjectServices } from './testing/services';
import { ProjectDoc } from './visual-regression.types';

const waitFor = async (check: () => boolean, ms = 2000) => {
  const until = Date.now() + ms;
  while (!check()) {
    if (Date.now() > until) throw new Error('Timed out waiting');
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
};

/** Build notifications: settings saved encrypted, a test send, and delivery when an Argos build finishes */
describe('Visual regression build notifications', () => {
  let target: Awaited<ReturnType<typeof startTarget>>;
  let services: ReturnType<typeof createProjectServices>;
  let mail: ReturnType<typeof fakeMail>;
  const PROJECT = 'vr-project-notify';

  beforeEach(async () => {
    target = await startTarget([200]);
    mail = fakeMail();
    services = createProjectServices(undefined, {
      mail: mail.factory,
      options: { retryDelayMs: 1, allowHttp: true, egress: TEST_EGRESS, smtp: { from: 'ds@example.com', host: 'smtp.example.com' } },
    });
    const now = new Date().toISOString();
    const project: ProjectDoc = {
      id: PROJECT,
      teamId: 't',
      workspaceId: null,
      createdBy: SYSTEM_CREATOR,
      name: 'Marketing site',
      argosProjectId: 'argos-notify',
      argosBranch: 'main',
      argosToken: services.encryption.encrypt('argos-token'),
      config: {},
      baselines: [],
      notifications: [],
      createdAt: now,
      updatedAt: now,
    };
    await services.vrProjects.create(project);
  });

  afterEach(async () => {
    await services.delivery.idle();
    await target.close();
    jest.restoreAllMocks();
  });

  it('saves channel settings with URLs and secrets encrypted, and never returns them', async () => {
    const url = target.url('/services/T/B/vr-slack-token');
    await expect(services.notifier.configure(PROJECT, { type: 'slack', url: 'http://10.1.1.1/x' })).rejects.toMatchObject({ status: 400 });
    await expect(services.notifier.configure(PROJECT, { type: 'email', recipients: [] })).rejects.toMatchObject({ status: 400 });

    expect(await services.notifier.configure(PROJECT, { type: 'slack', url })).toMatchObject({ type: 'slack', enabled: true, configured: true });
    const webhook = await services.notifier.configure(PROJECT, { type: 'webhook', url: target.url('/wh') });
    expect(webhook.secret).toMatch(/^whsec_[0-9a-f]{64}$/);
    await services.notifier.configure(PROJECT, { type: 'email', recipients: ['QA@example.com', 'qa@example.com'] });
    // Turning a channel off keeps its URL
    expect(await services.notifier.configure(PROJECT, { type: 'slack', enabled: false })).toMatchObject({ enabled: false, configured: true });

    const overview = await services.notifier.overview(PROJECT);
    expect(overview.channels).toEqual([
      expect.objectContaining({ type: 'email', enabled: true, recipients: ['qa@example.com'] }),
      expect.objectContaining({ type: 'slack', enabled: false, configured: true }),
      { type: 'teams', enabled: false, configured: false },
      expect.objectContaining({ type: 'webhook', enabled: true, hasSecret: true }),
    ]);
    expect(overview.availability.email).toEqual({ available: true });
    const json = JSON.stringify(overview);
    expect(json).not.toContain('vr-slack-token');
    expect(json).not.toContain(webhook.secret);

    const stored = (await services.vrProjects.get(PROJECT))!.doc.notifications;
    const slack = stored.find((n) => n.type === 'slack')!;
    expect(slack.url).not.toContain('vr-slack-token');
    expect(services.encryption.decrypt(slack.url!)).toBe(url);
    expect(services.encryption.decrypt(stored.find((n) => n.type === 'webhook')!.secret!)).toBe(webhook.secret);

    await services.notifier.remove(PROJECT, 'slack');
    expect((await services.notifier.overview(PROJECT)).channels[1]).toEqual({ type: 'slack', enabled: false, configured: false });
  });

  it('sends a test to one channel and records it', async () => {
    await expect(services.notifier.sendTest(PROJECT, 'teams')).rejects.toMatchObject({ status: 400 });
    await services.notifier.configure(PROJECT, { type: 'teams', url: target.url('/teams') });
    const attempt = await services.notifier.sendTest(PROJECT, 'teams');
    expect(attempt).toMatchObject({ status: 'sent', test: true, owner: `vr-project:${PROJECT}` });
    expect(JSON.parse(target.received[0].body).attachments[0].content.body[0].text).toBe('Test notification for Marketing site');
    expect((await services.notifier.overview(PROJECT)).attempts.map((a) => a.id)).toEqual([attempt.id]);
  });

  const build = (number: number, status: string, startTime = new Date().toISOString()) =>
    ({
      id: `argos-build-${number}`,
      number,
      head: { sha: 'abcdef1234567', branch: 'main' },
      base: null,
      status,
      conclusion: null,
      stats: null,
      metadata: { testReport: { status: 'passed', stats: { startTime } } },
      url: `https://app.argos-ci.com/acme/web/builds/${number}`,
    }) as any;

  /** CI reports an upload through the signed build notification */
  const notifyBuild = async (buildNumber: number) => {
    const argosSecret = (await services.visualRegression.setWebhookSecret(PROJECT)).secret;
    const raw = Buffer.from(JSON.stringify({ projectId: 'argos-notify', buildNumber }));
    const signature = `sha256=${createHmac('sha256', argosSecret).update(raw).digest('hex')}`;
    return services.visualRegression.handleWebhook(JSON.parse(raw.toString()), signature, raw);
  };

  it('delivers to every enabled channel once when an Argos build reaches a final status', async () => {
    await services.notifier.configure(PROJECT, { type: 'slack', url: target.url('/slack') });
    const { secret } = await services.notifier.configure(PROJECT, { type: 'webhook', url: target.url('/wh') });
    await services.notifier.configure(PROJECT, { type: 'email', recipients: ['qa@example.com'] });
    await services.notifier.configure(PROJECT, { type: 'teams', url: target.url('/teams'), enabled: false });

    const getBuild = jest.spyOn(ArgosApiClient.prototype, 'getBuild').mockResolvedValue(build(42, 'progress'));
    jest.spyOn(ArgosApiClient.prototype, 'listBuildDiffs').mockResolvedValue([
      { id: 's1', name: 'home', status: 'changed', score: 0.1, url: null, base: null, head: null },
      { id: 's2', name: 'nav', status: 'unchanged', score: 0, url: null, base: null, head: null },
      { id: 's3', name: 'footer', status: 'added', score: null, url: null, base: null, head: null },
    ]);

    // Still running: nothing is sent
    expect(await notifyBuild(42)).toMatchObject({ processed: true });
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(target.received).toHaveLength(0);

    getBuild.mockResolvedValue(build(42, 'changes-detected'));
    expect(await notifyBuild(42)).toMatchObject({ processed: true });
    await waitFor(() => target.received.length === 2 && mail.sent.length === 1);
    await services.delivery.idle();
    expect(target.received.map((r) => r.path).sort()).toEqual(['/slack', '/wh']); // Teams is turned off
    const slack = JSON.parse(target.received.find((r) => r.path === '/slack')!.body);
    expect(slack.text).toBe('Visual regression: Marketing site found 1 changed screenshot');
    const hook = target.received.find((r) => r.path === '/wh')!;
    const timestamp = hook.headers['x-signature-timestamp'];
    expect(hook.headers['x-signature-256']).toBe(`sha256=${createHmac('sha256', secret!).update(`${timestamp}.${hook.body}`).digest('hex')}`);
    const [run] = await services.vrRuns.findAny([{ projectId: PROJECT }]);
    expect(JSON.parse(hook.body)).toMatchObject({
      event: 'visual-regression.build.completed',
      data: { projectId: PROJECT, runId: run.id, argosStatus: 'changes-detected', status: 'completed', summary: { total: 3, passed: 1, failed: 1, new: 1 } },
    });
    expect(mail.sent[0]).toMatchObject({ to: ['qa@example.com'], subject: 'Visual regression: Marketing site found 1 changed screenshot' });
    expect(mail.sent[0].text).toContain('Branch main, commit abcdef1.');

    // Accepting the build in Argos re-applies it, and refreshing reads it again: neither sends again
    getBuild.mockResolvedValue(build(42, 'accepted'));
    await services.visualRegression.getTestResults(run.id);
    await services.visualRegression.getTestResults(run.id);
    await new Promise((resolve) => setTimeout(resolve, 20));
    await services.delivery.idle();
    expect((await services.vrRuns.get(run.id))!.doc.argosStatus).toBe('accepted');
    expect(target.received).toHaveLength(2);
    expect(mail.sent).toHaveLength(1);
    const attempts = [...services.deliveryAttempts.docs.values()].map((e) => e.doc);
    expect(attempts.map((a) => [a.channel, a.status]).sort()).toEqual([
      ['email', 'sent'],
      ['slack', 'sent'],
      ['webhook', 'sent'],
    ]);
  });

  it('says so when a build fails', async () => {
    await services.notifier.configure(PROJECT, { type: 'slack', url: target.url('/slack') });
    jest.spyOn(ArgosApiClient.prototype, 'getBuild').mockResolvedValue(build(7, 'error'));
    jest.spyOn(ArgosApiClient.prototype, 'listBuildDiffs').mockRejectedValue(new Error('no diffs'));
    await notifyBuild(7);
    await waitFor(() => target.received.length === 1);
    expect(JSON.parse(target.received[0].body).text).toBe('Visual regression: Marketing site failed');
  });

  it("doesn't notify about old builds found by a first sync", async () => {
    await services.notifier.configure(PROJECT, { type: 'slack', url: target.url('/slack') });
    const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString();
    jest.spyOn(ArgosApiClient.prototype, 'getBuild').mockResolvedValue(build(3, 'accepted', threeDaysAgo));
    jest.spyOn(ArgosApiClient.prototype, 'listBuildDiffs').mockResolvedValue([]);
    await notifyBuild(3);
    await new Promise((resolve) => setTimeout(resolve, 20));
    await services.delivery.idle();
    expect(target.received).toHaveLength(0);
    expect((await services.vrRuns.findAny([{ projectId: PROJECT }]))[0].status).toBe('completed');
  });
});
