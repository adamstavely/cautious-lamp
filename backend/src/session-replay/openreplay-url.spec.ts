import { BadRequestException } from '@nestjs/common';
import { resolveOpenReplayBaseUrl } from './openreplay-url';
import { SessionReplayService } from './session-replay.service';

describe('OpenReplay base URL (SSRF guard)', () => {
  const saved = { ...process.env };

  beforeEach(() => {
    delete process.env.OPENREPLAY_BASE_URL;
    delete process.env.OPENREPLAY_ALLOWED_BASE_URLS;
  });

  afterAll(() => {
    process.env = saved;
  });

  it('defaults to the OpenReplay cloud and normalizes', async () => {
    await expect(resolveOpenReplayBaseUrl(undefined)).resolves.toBe('https://api.openreplay.com');
    await expect(resolveOpenReplayBaseUrl('https://api.openreplay.com/')).resolves.toBe('https://api.openreplay.com');
    await expect(resolveOpenReplayBaseUrl('https://93.184.216.34/openreplay/?x=1#y')).resolves.toBe('https://93.184.216.34/openreplay');
  });

  it.each([
    'http://127.0.0.1:9000',
    'http://localhost.', // resolves to loopback or not at all
    'http://169.254.169.254/latest/meta-data',
    'http://10.1.2.3',
    'http://172.16.0.1',
    'http://192.168.0.10',
    'http://[::1]',
    'http://[::ffff:127.0.0.1]',
    'file:///etc/passwd',
    'gopher://example.com',
    'https://user:pass@example.com',
    'not a url',
  ])('rejects %s', async (url) => {
    await expect(resolveOpenReplayBaseUrl(url)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('trusts URLs an administrator allowed, including internal ones', async () => {
    process.env.OPENREPLAY_ALLOWED_BASE_URLS = 'http://10.0.0.5:9000/, https://replay.internal.example';
    await expect(resolveOpenReplayBaseUrl('http://10.0.0.5:9000')).resolves.toBe('http://10.0.0.5:9000');
    process.env.OPENREPLAY_BASE_URL = 'http://192.168.1.20';
    await expect(resolveOpenReplayBaseUrl(undefined)).resolves.toBe('http://192.168.1.20');
    await expect(resolveOpenReplayBaseUrl('http://10.0.0.6')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('is checked when a project is saved and again before each request', async () => {
    const service = new SessionReplayService();
    await expect(service.createProject('team', { name: 'x', openreplayProjectKey: '1', openreplayBaseUrl: 'http://169.254.169.254' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
    const project = await service.createProject('team', { name: 'ok', openreplayProjectKey: '1' });
    await expect(service.updateProject(project.id, { openreplayBaseUrl: 'http://127.0.0.1' })).rejects.toBeInstanceOf(BadRequestException);

    // A URL that got into storage some other way is still refused before the request is made
    const stored = (service as unknown as { projects: Map<string, any> }).projects.get(project.id);
    stored.openreplayBaseUrl = 'http://127.0.0.1:9200';
    stored.openreplayApiKey = 'plain-key';
    await expect(service.searchSessions(project.id, {})).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.getSession(project.id, 's-1')).rejects.toBeInstanceOf(BadRequestException);
  });
});
