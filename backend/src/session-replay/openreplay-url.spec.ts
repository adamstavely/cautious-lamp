import { BadRequestException } from '@nestjs/common';
import {
  openReplayDashboardUrl,
  openReplayHeatmapsUrl,
  openReplayIngestPoint,
  openReplayPublicApiRoot,
  openReplaySessionUrl,
  resolveOpenReplayBaseUrl,
} from './openreplay-url';
import { SYSTEM_CREATOR, createProjectServices } from '../visual-regression/testing/services';

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
    const { sessionReplay: service, srProjects } = createProjectServices();
    const owner = { workspaceId: null, createdBy: SYSTEM_CREATOR };
    await expect(service.createProject('team', { name: 'x', openreplayProjectKey: 'abc123', openreplayBaseUrl: 'http://169.254.169.254' }, owner)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    const project = await service.createProject('team', { name: 'ok', openreplayProjectKey: 'abc123' }, owner);
    await expect(service.updateProject(project.id, { openreplayBaseUrl: 'http://127.0.0.1' })).rejects.toBeInstanceOf(BadRequestException);

    // A URL that got into storage some other way is still refused before the request is made
    const stored = (await srProjects.get(project.id))!.doc;
    srProjects.forceWrite({ ...stored, openreplayBaseUrl: 'http://127.0.0.1:9200', openreplayApiKey: 'plain-key' });
    await expect(service.searchSessions(project.id, { userId: 'u-1' })).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.listSessionEvents(project.id, 's-1', {})).rejects.toBeInstanceOf(BadRequestException);
  });
});

describe('OpenReplay addresses', () => {
  it('splits the cloud into api.openreplay.com and app.openreplay.com', () => {
    const cloud = 'https://api.openreplay.com';
    expect(openReplayPublicApiRoot(cloud)).toBe('https://api.openreplay.com/v2/public');
    expect(openReplayDashboardUrl(cloud)).toBe('https://app.openreplay.com');
    expect(openReplayIngestPoint(cloud)).toBeUndefined();
    expect(openReplaySessionUrl(cloud, 42, 'abc')).toBe('https://app.openreplay.com/42/session/abc');
    expect(openReplayHeatmapsUrl(cloud, 42)).toBe('https://app.openreplay.com/42/metrics');
    expect(openReplayHeatmapsUrl(cloud, 42, '9')).toBe('https://app.openreplay.com/42/metrics/9');
  });

  it('keeps a self-hosted instance on one host', () => {
    const own = 'https://replay.example.com/';
    expect(openReplayPublicApiRoot(own)).toBe('https://replay.example.com/v2/api/public');
    expect(openReplayDashboardUrl(own)).toBe('https://replay.example.com');
    expect(openReplayIngestPoint(own)).toBe('https://replay.example.com/ingest');
    expect(openReplaySessionUrl(own, 3, 'a/b')).toBe('https://replay.example.com/3/session/a%2Fb');
  });
});
