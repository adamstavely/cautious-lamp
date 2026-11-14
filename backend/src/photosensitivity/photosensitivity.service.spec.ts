import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { ServiceUnavailableException, UnprocessableEntityException } from '@nestjs/common';
import { locateIris, parseIrisCsv } from './iris-runner';
import { PhotosensitivityService } from './photosensitivity.service';

/** framedata.csv as IRIS writes it: this header, "12.34%" areas, and a NUL at the end of each row */
const HEADER =
  'Frame,TimeStamp,AverageLuminance,FlashAreaLuminance,AverageLuminanceDiff,AverageLuminanceDiffAcc,AverageRed,FlashAreaRed,AverageRedDiff,AverageRedDiffAcc,LuminanceTransitions,RedTransitions,LuminanceExtendedFailCount,RedExtendedFailCount,LuminanceFrameResult,RedFrameResult,PatternArea,PatternDetectedLines,PatternFrameResult';
const row = (frame: number, lum: number, red: number, pattern: number) =>
  `${frame},00:00:00.${String(frame * 40).padStart(4, '0')},0.5,87.50%,0.2,0.25,10,0.00%,0,0,${lum ? 5 : 0},0,0,0,${lum},${red},12.34%,${pattern ? 7 : 0},${pattern}\0`;

/**
 * A stand-in for IrisApp that follows its contract: it needs appsettings.json
 * in its working directory, and writes Results/<video>/framedata.csv there,
 * or for an unreadable video only an error in logs/core.log (exit code 0).
 */
async function fakeIrisApp(dir: string, rows: string[]): Promise<string> {
  const script = path.join(dir, 'IrisApp');
  await fs.writeFile(
    script,
    `#!/usr/bin/env node
const fs = require('fs'), path = require('path');
const args = process.argv.slice(2);
const video = args[args.indexOf('-v') + 1];
fs.writeFileSync(path.join(${JSON.stringify(dir)}, 'last-call.json'), JSON.stringify({ args, cwd: process.cwd() }));
if (!fs.existsSync('appsettings.json')) { console.error('no appsettings.json'); process.exit(1); }
fs.mkdirSync('logs', { recursive: true });
if (fs.readFileSync(video, 'utf8').startsWith('broken')) {
  fs.writeFileSync('logs/core.log', '[12:00:00] [1] [error]: Could not open video file\\n');
  process.exit(0);
}
fs.mkdirSync(path.join('Results', video), { recursive: true });
fs.writeFileSync(path.join('Results', video, 'framedata.csv'), ${JSON.stringify(HEADER + '\n')} + ${JSON.stringify(rows.join('\n'))} + '\\n');
`,
    { mode: 0o755 },
  );
  await fs.writeFile(path.join(dir, 'appsettings.json'), '{}');
  return script;
}

describe('IRIS', () => {
  let dir: string;
  const env = { ...process.env };

  beforeEach(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), 'iris-spec-'));
  });

  afterEach(async () => {
    process.env = { ...env };
    await fs.rm(dir, { recursive: true, force: true });
  });

  const upload = async (name: string, content = 'a video') => {
    const file = path.join(dir, name);
    await fs.writeFile(file, content);
    return file;
  };
  const lastCall = async () => JSON.parse(await fs.readFile(path.join(dir, 'last-call.json'), 'utf8'));

  it('parses framedata.csv as IRIS writes it', () => {
    const [frame] = parseIrisCsv(`${HEADER}\n${row(3, 2, 0, 1)}\n`);
    expect(frame).toEqual({
      frame: 3,
      timestamp: '00:00:00.0120',
      flashAreaLuminance: 0.875,
      averageLuminanceDifferenceAccumulation: 0.25,
      flashAreaRed: 0,
      averageRedDifferenceAccumulation: 0,
      luminanceTransitions: 5,
      redTransitions: 0,
      luminanceExtendedFailCount: 0,
      redExtendedFailCount: 0,
      patternArea: 0.1234,
      patternDetectedLines: 7,
      luminanceFrameResult: 2,
      redFrameResult: 0,
      patternFrameResult: 1,
    });
    expect(() => parseIrisCsv('Frame,Something\n1,2\n')).toThrow('missing columns');
  });

  it('runs IrisApp in its own working directory with the video under a fixed name, then deletes both', async () => {
    process.env.IRIS_EXECUTABLE_PATH = await fakeIrisApp(dir, [row(0, 0, 0, 0), row(1, 1, 0, 0)]);
    const video = await upload('x.$(touch pwned).mp4');

    const { summary, results } = await new PhotosensitivityService().analyzeVideo(video, { enablePatternDetection: false });

    expect(results).toHaveLength(2);
    expect(summary).toMatchObject({ totalFrames: 2, luminanceWarnings: 1, status: 'warning' });
    const call = await lastCall();
    expect(call.args).toEqual(['-v', 'video.mp4', '-p', '0', '-j', '0']);
    expect(call.cwd).not.toBe(dir);
    await expect(fs.access(call.cwd)).rejects.toThrow();
    await expect(fs.access(video)).rejects.toThrow();
    await expect(fs.access(path.join(dir, 'pwned'))).rejects.toThrow();
  });

  it('counts extended failures (result 2) as failures, not warnings', async () => {
    process.env.IRIS_EXECUTABLE_PATH = await fakeIrisApp(dir, [row(0, 2, 0, 0), row(1, 3, 0, 0), row(2, 0, 2, 0), row(3, 0, 0, 1), row(4, 1, 1, 0)]);
    const service = new PhotosensitivityService();
    const { summary } = await service.analyzeVideo(await upload('clip.webm'));
    expect(summary).toMatchObject({
      luminanceFailures: 2,
      luminanceExtendedFailures: 1,
      redFailures: 1,
      redExtendedFailures: 1,
      patternFailures: 1,
      luminanceWarnings: 1,
      redWarnings: 1,
      maxLuminanceTransitions: 5,
      hasFailures: true,
      status: 'failure',
    });
    const checks = service.convertToComplianceChecks(summary, 'App');
    expect(checks.filter((c) => c.status === 'error')).toHaveLength(3);
    expect(checks.find((c) => c.rule === 'Photosensitivity: Luminance Flashes' && c.status === 'error')?.message).toContain('sustained over 5 seconds (1 of them)');
  });

  it("reports an unreadable video as 422 with the reason from IRIS's log", async () => {
    process.env.IRIS_EXECUTABLE_PATH = await fakeIrisApp(dir, []);
    const video = await upload('clip.mov', 'broken bytes');
    const error = await new PhotosensitivityService().analyzeVideo(video).catch((e) => e);
    expect(error).toBeInstanceOf(UnprocessableEntityException);
    expect(error.message).toContain('Could not open video file');
    await expect(fs.access(video)).rejects.toThrow();
  });

  it('answers 503 and deletes the upload when IRIS is not installed or has no config', async () => {
    process.env.IRIS_EXECUTABLE_PATH = path.join(dir, 'missing', 'IrisApp');
    const video = await upload('clip.mp4');
    const error = await new PhotosensitivityService().analyzeVideo(video).catch((e) => e);
    expect(error).toBeInstanceOf(ServiceUnavailableException);
    expect(error.message).toContain("IRIS isn't installed");
    await expect(fs.access(video)).rejects.toThrow();

    const script = await fakeIrisApp(dir, []);
    await fs.rm(path.join(dir, 'appsettings.json'));
    expect((await locateIris({ executable: script, timeoutMs: 1000 })).problem).toContain('appsettings.json');
  });

  it('finds IrisApp on PATH and checks it without running it', async () => {
    await fakeIrisApp(dir, []);
    process.env.PATH = `${dir}${path.delimiter}${env.PATH}`;
    const status = await locateIris({ executable: 'IrisApp', timeoutMs: 1000 });
    expect(status).toEqual({ executable: path.join(dir, 'IrisApp'), config: path.join(dir, 'appsettings.json'), problem: null });
    await expect(fs.access(path.join(dir, 'last-call.json'))).rejects.toThrow();
  });
});
