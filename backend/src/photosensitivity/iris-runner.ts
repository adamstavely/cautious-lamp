import { execFile } from 'child_process';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { promisify } from 'util';
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
  timeoutMs: number;
}

export function irisSettingsFromEnv(env: NodeJS.ProcessEnv = process.env): IrisSettings {
  return {
    executable: env.IRIS_EXECUTABLE_PATH?.trim() || 'IrisApp',
    configPath: env.IRIS_CONFIG_PATH?.trim() || undefined,
    timeoutMs: Number(env.IRIS_TIMEOUT_MS) > 0 ? Number(env.IRIS_TIMEOUT_MS) : 10 * 60 * 1000,
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
export class IrisAnalysisError extends Error {}

/**
 * Analyses one video. The video is moved into the run's working directory and
 * deleted with it, whatever happens.
 */
export async function runIris(
  videoPath: string,
  options: { patternDetection: boolean },
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
      await execFileAsync(location.executable!, ['-v', videoName, '-p', options.patternDetection ? '1' : '0', '-j', '0'], {
        cwd: work,
        timeout: settings.timeoutMs,
        maxBuffer: 10 * 1024 * 1024,
      });
    } catch (error) {
      const err = error as NodeJS.ErrnoException & { killed?: boolean; signal?: string };
      if (err.killed || err.signal === 'SIGTERM') {
        throw new IrisAnalysisError(`IRIS took longer than ${Math.round(settings.timeoutMs / 1000)} seconds`);
      }
      throw new IrisAnalysisError(`IRIS failed: ${err.message}`);
    }

    const csvPath = path.join(work, 'Results', videoName, 'framedata.csv');
    let csv: string;
    try {
      csv = await fs.readFile(csvPath, 'utf8');
    } catch {
      // IRIS exits 0 when it can't open the video; its log says why
      const log = await fs.readFile(path.join(work, 'logs', 'core.log'), 'utf8').catch(() => '');
      throw new IrisAnalysisError(`IRIS produced no results; the video may be unreadable. ${lastErrorLine(log)}`.trim());
    }
    return parseIrisCsv(csv);
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

/** IRIS's framedata.csv: rows end with a NUL character, and areas are percentages like "12.34%" */
export function parseIrisCsv(content: string): IRISAnalysisResult[] {
  const records: Record<string, string>[] = parse(content.replace(/\0/g, ''), {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
  if (records.length > 0) {
    const missing = REQUIRED_COLUMNS.filter((column) => !(column in records[0]));
    if (missing.length) throw new IrisAnalysisError(`IRIS output is missing columns: ${missing.join(', ')}`);
  }
  return records.map((row) => ({
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
  }));
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
