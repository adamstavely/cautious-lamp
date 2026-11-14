import { execFile } from 'child_process';
import { createReadStream } from 'fs';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { Transform, pipeline } from 'stream';
import { promisify } from 'util';
import { parse as parseStream } from 'csv-parse';
import { parse } from 'csv-parse/sync';

const execFileAsync = promisify(execFile);

/**
 * Runs EA's IRIS (github.com/electronicarts/IRIS) through its console program,
 * IrisApp. Its contract, from the IRIS source:
 * - `IrisApp -v <video> -p <0|1> -j <0|1>`; there is no output-path option.
 * - It reads `appsettings.json` from its working directory and writes
 *   `Results/<video file name>/framedata.csv` (one row per frame) there, plus
 *   `logs/core.log`.
 * - It exits 0 even when the video can't be read, so success means the CSV exists.
 * Each run gets its own temporary working directory.
 */

/** One frame of IRIS output. Flash and pattern areas are proportions of the frame (0-1). */
export interface IRISAnalysisResult {
  frame: number;
  timestamp: string;
  flashAreaLuminance: number;
  averageLuminanceDifferenceAccumulation: number;
  flashAreaRed: number;
  averageRedDifferenceAccumulation: number;
  luminanceTransitions: number;
  redTransitions: number;
  luminanceExtendedFailCount: number;
  redExtendedFailCount: number;
  patternArea: number;
  patternDetectedLines: number;
  /** IRIS FlashResult: 0 pass, 1 pass with warning, 2 extended failure, 3 flash failure */
  luminanceFrameResult: 0 | 1 | 2 | 3;
  redFrameResult: 0 | 1 | 2 | 3;
  /** IRIS PatternResult: 0 pass, 1 failure */
  patternFrameResult: 0 | 1;
}

export interface IrisSettings {
  /** IrisApp: an absolute path, or a name looked up on PATH */
  executable: string;
  /** appsettings.json; by default the one next to the executable */
  configPath?: string;
  /** Per video; IrisApp is killed and its files deleted when it runs longer */
  timeoutMs: number;
  /** Videos with more frames than this are refused (one CSV row per frame) */
  maxFrames?: number;
  /** IRIS's framedata.csv larger than this is refused unread */
  maxOutputBytes?: number;
}

/** How many analyses run and wait at once, and how long a refused caller should wait */
export interface IrisConcurrency {
  maxConcurrent: number;
  maxQueued: number;
  maxPerCaller: number;
  retryAfterSeconds: number;
}

const positive = (value: string | undefined, fallback: number) => (Number(value) > 0 ? Math.floor(Number(value)) : fallback);
const nonNegative = (value: string | undefined, fallback: number) =>
  value !== undefined && value.trim() !== '' && Number(value) >= 0 ? Math.floor(Number(value)) : fallback;

export const IRIS_DEFAULTS = {
  timeoutMs: 10 * 60 * 1000,
  // An hour at 60 frames per second
  maxFrames: 216_000,
  maxOutputBytes: 64 * 1024 * 1024,
  maxConcurrent: 2,
  maxQueued: 4,
  maxPerCaller: 2,
  retryAfterSeconds: 30,
};

export function irisSettingsFromEnv(env: NodeJS.ProcessEnv = process.env): IrisSettings {
  return {
    executable: env.IRIS_EXECUTABLE_PATH?.trim() || 'IrisApp',
    configPath: env.IRIS_CONFIG_PATH?.trim() || undefined,
    timeoutMs: positive(env.IRIS_TIMEOUT_MS, IRIS_DEFAULTS.timeoutMs),
    maxFrames: positive(env.IRIS_MAX_FRAMES, IRIS_DEFAULTS.maxFrames),
    maxOutputBytes: positive(env.IRIS_MAX_OUTPUT_BYTES, IRIS_DEFAULTS.maxOutputBytes),
  };
}

export function irisConcurrencyFromEnv(env: NodeJS.ProcessEnv = process.env): IrisConcurrency {
  return {
    maxConcurrent: positive(env.IRIS_MAX_CONCURRENT, IRIS_DEFAULTS.maxConcurrent),
    maxQueued: nonNegative(env.IRIS_MAX_QUEUED, IRIS_DEFAULTS.maxQueued),
    maxPerCaller: positive(env.IRIS_MAX_PER_CALLER, IRIS_DEFAULTS.maxPerCaller),
    retryAfterSeconds: positive(env.IRIS_RETRY_AFTER_SECONDS, IRIS_DEFAULTS.retryAfterSeconds),
  };
}

export interface IrisLocation {
  executable: string | null;
  config: string | null;
  /** Why IRIS can't run, for the status page; null when it can */
  problem: string | null;
}

/** Finds IrisApp and its appsettings.json without running anything */
export async function locateIris(settings: IrisSettings): Promise<IrisLocation> {
  const executable = await resolveExecutable(settings.executable);
  if (!executable) {
    return {
      executable: null,
      config: null,
      problem: `IRIS isn't installed: "${settings.executable}" wasn't found. Use the backend Docker image, which includes it, or set IRIS_EXECUTABLE_PATH to IrisApp.`,
    };
  }
  const config = settings.configPath ?? path.join(path.dirname(executable), 'appsettings.json');
  if (!(await isReadable(config))) {
    return {
      executable,
      config: null,
      problem: `IRIS's appsettings.json wasn't found at ${config}. Set IRIS_CONFIG_PATH to IRIS's config/appsettings.json.`,
    };
  }
  return { executable, config, problem: null };
}

export class IrisUnavailableError extends Error {}

/** Why IRIS couldn't analyse a video; `code` is the API error code */
export type IrisAnalysisErrorCode = 'IRIS_ANALYSIS_FAILED' | 'IRIS_TIMEOUT' | 'IRIS_VIDEO_TOO_LONG' | 'IRIS_CANCELLED';
export class IrisAnalysisError extends Error {
  constructor(
    message: string,
    readonly code: IrisAnalysisErrorCode = 'IRIS_ANALYSIS_FAILED',
  ) {
    super(message);
  }
}

/**
 * Analyses one video. The video is moved into the run's working directory and
 * deleted with it, whatever happens. IrisApp is killed (SIGKILL) when it runs
 * past the timeout or `signal` aborts, and its working directory goes too.
 */
export async function runIris(
  videoPath: string,
  options: { patternDetection: boolean; signal?: AbortSignal },
  settings: IrisSettings,
): Promise<IRISAnalysisResult[]> {
  const location = await locateIris(settings);
  if (location.problem) {
    await fs.rm(videoPath, { force: true });
    throw new IrisUnavailableError(location.problem);
  }

  const work = await fs.mkdtemp(path.join(os.tmpdir(), 'iris-'));
  try {
    // A fixed name, so nothing from the upload reaches the command line or the results path
    const videoName = `video${safeExtension(videoPath)}`;
    await moveFile(videoPath, path.join(work, videoName));
    await fs.copyFile(location.config!, path.join(work, 'appsettings.json'));

    try {
      if (options.signal?.aborted) throw new IrisAnalysisError('The analysis was cancelled', 'IRIS_CANCELLED');
      const run = execFileAsync(location.executable!, ['-v', videoName, '-p', options.patternDetection ? '1' : '0', '-j', '0'], {
        cwd: work,
        timeout: settings.timeoutMs,
        // SIGTERM can be ignored; a timed-out or cancelled run must stop
        killSignal: 'SIGKILL',
        maxBuffer: 1024 * 1024,
      });
      // Not execFile's own `signal` option: that sends SIGTERM and returns before the process has gone
      const kill = () => run.child.kill('SIGKILL');
      options.signal?.addEventListener('abort', kill, { once: true });
      try {
        await run;
      } finally {
        options.signal?.removeEventListener('abort', kill);
      }
    } catch (error) {
      if (error instanceof IrisAnalysisError) throw error;
      const err = error as NodeJS.ErrnoException & { killed?: boolean; signal?: string };
      if (options.signal?.aborted) {
        throw new IrisAnalysisError('The analysis was cancelled', 'IRIS_CANCELLED');
      }
      if (err.killed || err.signal === 'SIGKILL' || err.signal === 'SIGTERM') {
        throw new IrisAnalysisError(`IRIS took longer than ${Math.ceil(settings.timeoutMs / 1000)} seconds`, 'IRIS_TIMEOUT');
      }
      throw new IrisAnalysisError(`IRIS failed: ${err.message}`);
    }

    const csvPath = path.join(work, 'Results', videoName, 'framedata.csv');
    const size = await fs.stat(csvPath).then((stat) => stat.size).catch(() => null);
    if (size === null) {
      // IRIS exits 0 when it can't open the video; its log says why
      throw new IrisAnalysisError(`IRIS produced no results; the video may be unreadable. ${lastErrorLine(await readTail(path.join(work, 'logs', 'core.log')))}`.trim());
    }
    const maxOutputBytes = settings.maxOutputBytes ?? IRIS_DEFAULTS.maxOutputBytes;
    if (size > maxOutputBytes) {
      throw new IrisAnalysisError(`The video is too long to analyse: IRIS's results are over ${formatBytes(maxOutputBytes)}`, 'IRIS_VIDEO_TOO_LONG');
    }
    return await readIrisCsv(csvPath, settings.maxFrames ?? IRIS_DEFAULTS.maxFrames);
  } finally {
    await fs.rm(work, { recursive: true, force: true });
    await fs.rm(videoPath, { force: true });
  }
}

const REQUIRED_COLUMNS = [
  'Frame',
  'TimeStamp',
  'FlashAreaLuminance',
  'AverageLuminanceDiffAcc',
  'FlashAreaRed',
  'AverageRedDiffAcc',
  'LuminanceTransitions',
  'RedTransitions',
  'LuminanceExtendedFailCount',
  'RedExtendedFailCount',
  'LuminanceFrameResult',
  'RedFrameResult',
  'PatternArea',
  'PatternDetectedLines',
  'PatternFrameResult',
];

const CSV_OPTIONS = { columns: true, skip_empty_lines: true, trim: true } as const;

function checkColumns(row: Record<string, string>): void {
  const missing = REQUIRED_COLUMNS.filter((column) => !(column in row));
  if (missing.length) throw new IrisAnalysisError(`IRIS output is missing columns: ${missing.join(', ')}`);
}

const tooManyFrames = (maxFrames: number) =>
  new IrisAnalysisError(`The video is too long to analyse: it has more than ${maxFrames} frames`, 'IRIS_VIDEO_TOO_LONG');

/** IRIS's framedata.csv: rows end with a NUL character, and areas are percentages like "12.34%" */
export function parseIrisCsv(content: string, maxFrames = Infinity): IRISAnalysisResult[] {
  const records: Record<string, string>[] = parse(content.replace(/\0/g, ''), CSV_OPTIONS);
  if (records.length > 0) checkColumns(records[0]);
  if (records.length > maxFrames) throw tooManyFrames(maxFrames);
  return records.map(toResult);
}

/** parseIrisCsv for a file, streamed: stops reading as soon as it passes `maxFrames` rows */
export async function readIrisCsv(file: string, maxFrames: number): Promise<IRISAnalysisResult[]> {
  const input = createReadStream(file, { encoding: 'utf8' });
  const stripNul = new Transform({
    decodeStrings: false,
    transform(chunk: string, _encoding, done) {
      done(null, chunk.replace(/\0/g, ''));
    },
  });
  const records = parseStream(CSV_OPTIONS);
  // An error anywhere destroys the whole chain, which ends the loop below with it
  pipeline(input, stripNul, records, () => undefined);
  const results: IRISAnalysisResult[] = [];
  try {
    for await (const row of records as AsyncIterable<Record<string, string>>) {
      if (results.length === 0) checkColumns(row);
      if (results.length >= maxFrames) throw tooManyFrames(maxFrames);
      results.push(toResult(row));
    }
  } finally {
    // Stops reading when the loop ends early
    input.destroy();
  }
  return results;
}

function toResult(row: Record<string, string>): IRISAnalysisResult {
  return {
    frame: int(row.Frame),
    timestamp: row.TimeStamp,
    flashAreaLuminance: percentage(row.FlashAreaLuminance),
    averageLuminanceDifferenceAccumulation: float(row.AverageLuminanceDiffAcc),
    flashAreaRed: percentage(row.FlashAreaRed),
    averageRedDifferenceAccumulation: float(row.AverageRedDiffAcc),
    luminanceTransitions: int(row.LuminanceTransitions),
    redTransitions: int(row.RedTransitions),
    luminanceExtendedFailCount: int(row.LuminanceExtendedFailCount),
    redExtendedFailCount: int(row.RedExtendedFailCount),
    patternArea: percentage(row.PatternArea),
    patternDetectedLines: int(row.PatternDetectedLines),
    luminanceFrameResult: flashResult(row.LuminanceFrameResult),
    redFrameResult: flashResult(row.RedFrameResult),
    patternFrameResult: int(row.PatternFrameResult) === 1 ? 1 : 0,
  };
}

const int = (value: string) => {
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : 0;
};
const float = (value: string) => {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
};
const percentage = (value: string) => float(String(value ?? '').replace('%', '')) / 100;
const flashResult = (value: string): 0 | 1 | 2 | 3 => {
  const n = int(value);
  return n === 1 || n === 2 || n === 3 ? n : 0;
};

const VIDEO_EXTENSIONS = new Set(['.mp4', '.webm', '.mov', '.avi', '.mkv']);
function safeExtension(file: string): string {
  const ext = path.extname(file).toLowerCase();
  return VIDEO_EXTENSIONS.has(ext) ? ext : '.mp4';
}

function lastErrorLine(log: string): string {
  const line = log
    .split('\n')
    .reverse()
    .find((l) => /\[(error|critical)\]/i.test(l));
  return line ? `IRIS log: ${line.replace(/^.*\]:\s*/, '').slice(0, 300)}` : '';
}

const formatBytes = (bytes: number) => (bytes >= 1024 * 1024 ? `${Math.round(bytes / (1024 * 1024))}MB` : `${bytes} bytes`);

/** The end of a log file, so a huge log is never read whole */
async function readTail(file: string, bytes = 64 * 1024): Promise<string> {
  let handle: fs.FileHandle | undefined;
  try {
    handle = await fs.open(file, 'r');
    const { size } = await handle.stat();
    const length = Math.min(size, bytes);
    const buffer = Buffer.alloc(length);
    await handle.read(buffer, 0, length, size - length);
    return buffer.toString('utf8');
  } catch {
    return '';
  } finally {
    await handle?.close();
  }
}

async function moveFile(from: string, to: string): Promise<void> {
  try {
    await fs.rename(from, to);
  } catch (error) {
    // Across filesystems (an upload directory on a volume, the temp dir elsewhere)
    if ((error as NodeJS.ErrnoException).code !== 'EXDEV') throw error;
    await fs.copyFile(from, to);
    await fs.rm(from, { force: true });
  }
}

async function isReadable(file: string): Promise<boolean> {
  try {
    await fs.access(file, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

async function isExecutable(file: string): Promise<boolean> {
  try {
    const stat = await fs.stat(file);
    if (!stat.isFile()) return false;
    await fs.access(file, fs.constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

async function resolveExecutable(executable: string): Promise<string | null> {
  if (executable.includes('/') || executable.includes(path.sep)) {
    const absolute = path.resolve(executable);
    return (await isExecutable(absolute)) ? absolute : null;
  }
  for (const dir of (process.env.PATH ?? '').split(path.delimiter).filter(Boolean)) {
    const candidate = path.join(dir, executable);
    if (await isExecutable(candidate)) return candidate;
  }
  return null;
}
