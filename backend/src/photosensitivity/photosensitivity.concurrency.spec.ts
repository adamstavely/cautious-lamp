import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { HttpException } from '@nestjs/common';
import { AnalysisRejectedException, PhotosensitivityService } from './photosensitivity.service';

const HEADER =
  'Frame,TimeStamp,AverageLuminance,FlashAreaLuminance,AverageLuminanceDiff,AverageLuminanceDiffAcc,AverageRed,FlashAreaRed,AverageRedDiff,AverageRedDiffAcc,LuminanceTransitions,RedTransitions,LuminanceExtendedFailCount,RedExtendedFailCount,LuminanceFrameResult,RedFrameResult,PatternArea,PatternDetectedLines,PatternFrameResult';
const row = (frame: number) => `${frame},00:00:00.${String(frame * 40).padStart(4, '0')},0.5,0.00%,0,0,10,0.00%,0,0,0,0,0,0,0,0,0.00%,0,0\0`;

/**
 * A stand-in for IrisApp that holds on until `release` exists in `dir`. While
 * running it keeps a file in `running/` named after its pid, and on start it
 * appends how many are running to `peaks.log`. It ignores SIGTERM, so only
 * SIGKILL stops it early.
 */
async function blockingIrisApp(dir: string, frames: number): Promise<string> {
  const script = path.join(dir, 'IrisApp');
  await fs.mkdir(path.join(dir, 'running'), { recursive: true });
  await fs.writeFile(
    script,
    `#!/usr/bin/env node
const fs = require('fs'), path = require('path');
process.on('SIGTERM', () => {});
const dir = ${JSON.stringify(dir)};
const video = process.argv[process.argv.indexOf('-v') + 1];
const mine = path.join(dir, 'running', String(process.pid));
fs.writeFileSync(mine, process.cwd());
fs.appendFileSync(path.join(dir, 'peaks.log'), fs.readdirSync(path.join(dir, 'running')).length + '\\n');
const timer = setInterval(() => {
  if (!fs.existsSync(path.join(dir, 'release'))) return;
  clearInterval(timer);
  fs.mkdirSync(path.join('Results', video), { recursive: true });
  const rows = [];
  for (let i = 0; i < ${frames}; i++) rows.push(${JSON.stringify(row(0))}.replace(/^0,/, i + ','));
  fs.writeFileSync(path.join('Results', video, 'framedata.csv'), ${JSON.stringify(HEADER + '\n')} + rows.join('\\n') + '\\n');
  fs.rmSync(mine);
}, 10);
`,
    { mode: 0o755 },
  );
  await fs.writeFile(path.join(dir, 'appsettings.json'), '{}');
  return script;
}

const until = async (check: () => Promise<boolean> | boolean, ms = 5000) => {
  const end = Date.now() + ms;
  while (!(await check())) {
    if (Date.now() > end) throw new Error('timed out waiting');
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
};

const alive = (pid: number) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

const exists = (file: string) =>
  fs.access(file).then(
    () => true,
    () => false,
  );

describe('IRIS analysis limits', () => {
  let dir: string;
  const env = { ...process.env };

  beforeEach(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), 'iris-limits-'));
  });

  afterEach(async () => {
    // Lets any fake still waiting finish, so no process outlives the test
    await fs.writeFile(path.join(dir, 'release'), '');
    process.env = { ...env };
    await new Promise((resolve) => setTimeout(resolve, 50));
    await fs.rm(dir, { recursive: true, force: true });
  });

  const upload = async (name: string) => {
    const file = path.join(dir, name);
    await fs.writeFile(file, 'a video');
    return file;
  };
  const runningPids = async () => (await fs.readdir(path.join(dir, 'running'))).map(Number);
  const peaks = async () =>
    (await fs.readFile(path.join(dir, 'peaks.log'), 'utf8').catch(() => ''))
      .split('\n')
      .filter(Boolean)
      .map(Number);

  it('keeps IRIS processes and the queue within their limits and refuses the excess with a retryable 503', async () => {
    process.env.IRIS_EXECUTABLE_PATH = await blockingIrisApp(dir, 2);
    process.env.IRIS_MAX_CONCURRENT = '2';
    process.env.IRIS_MAX_QUEUED = '3';
    process.env.IRIS_MAX_PER_CALLER = '10';
    process.env.IRIS_RETRY_AFTER_SECONDS = '12';
    const service = new PhotosensitivityService();

    const accepted: Array<Promise<unknown>> = [];
    const refused: AnalysisRejectedException[] = [];
    for (let i = 0; i < 9; i++) {
      try {
        const ticket = service.admit(`user:${i}`);
        accepted.push(service.analyzeVideo(await upload(`clip-${i}.mp4`), {}, ticket));
      } catch (error) {
        refused.push(error as AnalysisRejectedException);
      }
    }
    expect(accepted).toHaveLength(5);
    expect(refused).toHaveLength(4);
    for (const error of refused) {
      expect(error).toBeInstanceOf(AnalysisRejectedException);
      expect(error.getStatus()).toBe(503);
      expect(error.getResponse()).toMatchObject({ code: 'PHOTOSENSITIVITY_BUSY', retryAfterSeconds: 12 });
    }

    await until(async () => (await runningPids()).length === 2);
    // Give a third process the chance to start if anything let it
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(await runningPids()).toHaveLength(2);
    expect(service.pool.stats()).toEqual({ running: 2, queued: 3, admitted: 5 });

    await fs.writeFile(path.join(dir, 'release'), '');
    const results = (await Promise.all(accepted)) as Array<{ summary: { totalFrames: number } }>;
    expect(results.map((r) => r.summary.totalFrames)).toEqual([2, 2, 2, 2, 2]);
    expect(Math.max(...(await peaks()))).toBeLessThanOrEqual(2);
    expect(await peaks()).toHaveLength(5);
    expect(service.pool.stats()).toEqual({ running: 0, queued: 0, admitted: 0 });
  });

  it('gives each caller at most IRIS_MAX_PER_CALLER places, with a retryable 429', async () => {
    process.env.IRIS_EXECUTABLE_PATH = await blockingIrisApp(dir, 1);
    process.env.IRIS_MAX_PER_CALLER = '2';
    const service = new PhotosensitivityService();
    service.admit('user:alice');
    service.admit('user:alice');
    const error = (() => {
      try {
        service.admit('user:alice');
      } catch (e) {
        return e as AnalysisRejectedException;
      }
    })();
    expect(error?.getStatus()).toBe(429);
    expect(error?.getResponse()).toMatchObject({ code: 'PHOTOSENSITIVITY_QUOTA_EXCEEDED', retryAfterSeconds: 30 });
    expect(() => service.admit('user:bob')).not.toThrow();
  });

  it('cancelling kills the running IRIS process and deletes its files, and drops a queued video', async () => {
    process.env.IRIS_EXECUTABLE_PATH = await blockingIrisApp(dir, 1);
    process.env.IRIS_MAX_CONCURRENT = '1';
    const service = new PhotosensitivityService();

    const runningVideo = await upload('running.mp4');
    const runningTicket = service.admit('user:a');
    const running = service.analyzeVideo(runningVideo, {}, runningTicket).catch((e) => e);
    await until(async () => (await runningPids()).length === 1);
    const [pid] = await runningPids();
    const workDir = await fs.readFile(path.join(dir, 'running', String(pid)), 'utf8');

    const queuedVideo = await upload('queued.mp4');
    const queuedTicket = service.admit('user:b');
    const queued = service.analyzeVideo(queuedVideo, {}, queuedTicket).catch((e) => e);
    await until(() => service.pool.stats().queued === 1);

    queuedTicket.cancel();
    const queuedError = (await queued) as HttpException;
    expect(queuedError.getResponse()).toMatchObject({ code: 'IRIS_CANCELLED' });
    expect(await exists(queuedVideo)).toBe(false);

    runningTicket.cancel();
    const runningError = (await running) as HttpException;
    expect(runningError.getResponse()).toMatchObject({ code: 'IRIS_CANCELLED' });
    expect(alive(pid)).toBe(false);
    expect(await exists(workDir)).toBe(false);
    expect(await exists(runningVideo)).toBe(false);
    expect(service.pool.stats()).toEqual({ running: 0, queued: 0, admitted: 0 });
  });

  it('kills IRIS when it runs past IRIS_TIMEOUT_MS, even though it ignores SIGTERM, and deletes its files', async () => {
    process.env.IRIS_EXECUTABLE_PATH = await blockingIrisApp(dir, 1);
    process.env.IRIS_TIMEOUT_MS = '300';
    const service = new PhotosensitivityService();
    const video = await upload('slow.mp4');

    const pending = service.analyzeVideo(video).catch((e) => e);
    await until(async () => (await runningPids()).length === 1);
    const [pid] = await runningPids();
    const workDir = await fs.readFile(path.join(dir, 'running', String(pid)), 'utf8');

    const error = (await pending) as HttpException;
    expect(error.getStatus()).toBe(422);
    expect(error.getResponse()).toMatchObject({ code: 'IRIS_TIMEOUT' });
    expect(alive(pid)).toBe(false);
    expect(await exists(workDir)).toBe(false);
    expect(await exists(video)).toBe(false);
    expect(service.pool.stats().admitted).toBe(0);
  });

  it('refuses results over IRIS_MAX_FRAMES or IRIS_MAX_OUTPUT_BYTES', async () => {
    process.env.IRIS_EXECUTABLE_PATH = await blockingIrisApp(dir, 5);
    await fs.writeFile(path.join(dir, 'release'), '');

    process.env.IRIS_MAX_FRAMES = '4';
    const tooManyFrames = (await new PhotosensitivityService().analyzeVideo(await upload('long.mp4')).catch((e) => e)) as HttpException;
    expect(tooManyFrames.getStatus()).toBe(422);
    expect(tooManyFrames.getResponse()).toMatchObject({ code: 'IRIS_VIDEO_TOO_LONG' });
    expect(tooManyFrames.message).toContain('more than 4 frames');

    process.env.IRIS_MAX_FRAMES = '5';
    expect((await new PhotosensitivityService().analyzeVideo(await upload('ok.mp4'))).summary.totalFrames).toBe(5);

    process.env.IRIS_MAX_OUTPUT_BYTES = '200';
    const tooBig = (await new PhotosensitivityService().analyzeVideo(await upload('big.mp4')).catch((e) => e)) as HttpException;
    expect(tooBig.getResponse()).toMatchObject({ code: 'IRIS_VIDEO_TOO_LONG' });
  });
});
