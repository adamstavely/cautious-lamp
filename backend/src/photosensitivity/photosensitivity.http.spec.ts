import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { AuthGuard } from '../auth/auth.guard';
import { AuthService } from '../auth/auth.service';
import { AuthPrincipal } from '../auth/principal';
import { SecurityAuditService } from '../common/security/security-audit.service';
import { PhotosensitivityController } from './photosensitivity.controller';
import { PhotosensitivityService } from './photosensitivity.service';

const HEADER =
  'Frame,TimeStamp,AverageLuminance,FlashAreaLuminance,AverageLuminanceDiff,AverageLuminanceDiffAcc,AverageRed,FlashAreaRed,AverageRedDiff,AverageRedDiffAcc,LuminanceTransitions,RedTransitions,LuminanceExtendedFailCount,RedExtendedFailCount,LuminanceFrameResult,RedFrameResult,PatternArea,PatternDetectedLines,PatternFrameResult';

const authStub = {
  /** As AuthService.authenticate: these stand-ins never report an expired or revoked credential */
  async authenticate(credential?: string) {
    return { principal: await this.resolve(credential) };
  },
  async resolve(credential?: string): Promise<AuthPrincipal | null> {
    const name = credential?.startsWith('tok-') ? credential.slice(4) : '';
    if (!name) return null;
    return { type: 'user', id: `usr_${name}`, email: `${name}@example.com`, name, roles: [], permissions: new Set(), mustChangePassword: false };
  },
};

/** An IrisApp stand-in that waits for `release` in `dir`, keeping a file in `running/` meanwhile */
async function waitingIrisApp(dir: string): Promise<string> {
  const script = path.join(dir, 'IrisApp');
  await fs.mkdir(path.join(dir, 'running'), { recursive: true });
  await fs.writeFile(
    script,
    `#!/usr/bin/env node
const fs = require('fs'), path = require('path');
const dir = ${JSON.stringify(dir)};
const video = process.argv[process.argv.indexOf('-v') + 1];
const mine = path.join(dir, 'running', String(process.pid));
fs.writeFileSync(mine, '');
const timer = setInterval(() => {
  if (!fs.existsSync(path.join(dir, 'release'))) return;
  clearInterval(timer);
  fs.mkdirSync(path.join('Results', video), { recursive: true });
  fs.writeFileSync(path.join('Results', video, 'framedata.csv'), ${JSON.stringify(`${HEADER}\n0,00:00:00.0000,0.5,0.00%,0,0,10,0.00%,0,0,0,0,0,0,0,0,0.00%,0,0\0\n`)});
  fs.rmSync(mine);
}, 10);
`,
    { mode: 0o755 },
  );
  await fs.writeFile(path.join(dir, 'appsettings.json'), '{}');
  return script;
}

const until = async (check: () => Promise<boolean>, ms = 5000) => {
  const end = Date.now() + ms;
  while (!(await check())) {
    if (Date.now() > end) throw new Error('timed out waiting');
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
};

/** POST /analyze through the real guards, upload interceptor and controller */
describe('Photosensitivity HTTP API admission', () => {
  let app: INestApplication;
  let base: string;
  let dir: string;
  const env = { ...process.env };
  const uploads = path.resolve('uploads', 'videos');

  beforeEach(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), 'iris-http-'));
    process.env.IRIS_EXECUTABLE_PATH = await waitingIrisApp(dir);
    process.env.IRIS_MAX_CONCURRENT = '1';
    process.env.IRIS_MAX_QUEUED = '1';
    process.env.IRIS_MAX_PER_CALLER = '1';
    process.env.IRIS_RETRY_AFTER_SECONDS = '7';
    const moduleRef = await Test.createTestingModule({
      controllers: [PhotosensitivityController],
      providers: [
        PhotosensitivityService,
        { provide: AuthService, useValue: authStub },
        { provide: SecurityAuditService, useValue: { logPermissionDenied: jest.fn(async () => undefined) } },
        { provide: APP_GUARD, useClass: AuthGuard },
      ],
    }).compile();
    app = moduleRef.createNestApplication({ logger: false });
    await app.listen(0, '127.0.0.1');
    base = (await app.getUrl()).replace('[::1]', '127.0.0.1');
  });

  afterEach(async () => {
    await fs.writeFile(path.join(dir, 'release'), '');
    await app.close();
    process.env = { ...env };
    await fs.rm(dir, { recursive: true, force: true });
  });

  const analyze = async (as: string) => {
    const form = new FormData();
    form.append('video', new Blob([Buffer.alloc(64 * 1024, 1)], { type: 'video/mp4' }), 'clip.mp4');
    const res = await fetch(`${base}/api/v1/photosensitivity/analyze`, { method: 'POST', headers: { Authorization: `Bearer tok-${as}` }, body: form });
    return { status: res.status, retryAfter: res.headers.get('retry-after'), body: await res.json() };
  };
  const staged = async () => (await fs.readdir(uploads).catch(() => [] as string[])).length;
  const running = async () => (await fs.readdir(path.join(dir, 'running'))).length;

  it('refuses work beyond the per-caller quota (429) and the queue (503) with Retry-After, before staging the upload', async () => {
    const before = await staged();

    const alice = analyze('alice');
    await until(async () => (await running()) === 1);
    const bob = analyze('bob');
    const service = app.get(PhotosensitivityService);
    await until(async () => service.pool.stats().queued === 1);

    const aliceAgain = await analyze('alice');
    expect(aliceAgain).toMatchObject({ status: 429, retryAfter: '7', body: { code: 'PHOTOSENSITIVITY_QUOTA_EXCEEDED', retryAfterSeconds: 7 } });
    const carol = await analyze('carol');
    expect(carol).toMatchObject({ status: 503, retryAfter: '7', body: { code: 'PHOTOSENSITIVITY_BUSY', retryAfterSeconds: 7 } });
    // Bob's upload is staged and waiting; the refused ones never were
    expect(await staged()).toBe(before + 1);
    expect(await running()).toBe(1);

    await fs.writeFile(path.join(dir, 'release'), '');
    // No analysis storage here: the result comes back, without an id that would lead nowhere
    expect(await alice).toMatchObject({ status: 201, body: { analysisId: null, saved: false, saveError: 'Analysis storage is not configured' } });
    expect((await bob).status).toBe(201);
    expect(await staged()).toBe(before);
    expect(service.pool.stats()).toEqual({ running: 0, queued: 0, admitted: 0 });

    // Places are given back: Alice can analyse again
    expect((await analyze('alice')).status).toBe(201);
  });

  it('gives the place back when the request is refused after admission, such as a wrong file type', async () => {
    const form = new FormData();
    form.append('video', new Blob(['text'], { type: 'text/plain' }), 'notes.txt');
    const res = await fetch(`${base}/api/v1/photosensitivity/analyze`, { method: 'POST', headers: { Authorization: 'Bearer tok-dave' }, body: form });
    expect(res.status).toBe(400);
    await until(async () => app.get(PhotosensitivityService).pool.stats().admitted === 0);
  });
});
