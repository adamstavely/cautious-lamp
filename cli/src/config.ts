import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

export const DEFAULT_BASE_URL = 'http://localhost:3000/api/v1';

/** Keys `ds config` accepts. Anything else is rejected. */
export const CONFIG_KEYS = ['apiKey', 'baseURL'] as const;
export type ConfigKey = (typeof CONFIG_KEYS)[number];
export type DsConfig = Partial<Record<ConfigKey, string>>;

/** Keys whose values are secrets and must never be printed in full. */
const SECRET_KEYS: ReadonlySet<ConfigKey> = new Set<ConfigKey>(['apiKey']);

export function isConfigKey(key: string): key is ConfigKey {
  return (CONFIG_KEYS as readonly string[]).includes(key);
}

/** Resolved lazily so HOME can be changed (e.g. in tests). */
export function getConfigPath(): string {
  return path.join(os.homedir(), '.designsystem', 'config.json');
}

export function loadConfig(): DsConfig {
  const file = getConfigPath();
  if (!fs.existsSync(file)) return {};
  try {
    const raw: unknown = JSON.parse(fs.readFileSync(file, 'utf-8'));
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
    const config: DsConfig = {};
    for (const key of CONFIG_KEYS) {
      const value = (raw as Record<string, unknown>)[key];
      if (typeof value === 'string' && value !== '') config[key] = value;
    }
    return config;
  } catch {
    return {};
  }
}

export function saveConfig(config: DsConfig): void {
  const file = getConfigPath();
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
  fs.writeFileSync(file, JSON.stringify(config, null, 2) + '\n', { mode: 0o600 });
  // writeFileSync's mode only applies on creation; tighten an existing file too.
  fs.chmodSync(file, 0o600);
}

/** Shows only enough of a secret to recognise it. */
export function maskSecret(value: string): string {
  if (value.length < 12) return '****';
  return `${value.slice(0, 4)}…${value.slice(-4)}`;
}

export function displayValue(key: ConfigKey, value: string): string {
  return SECRET_KEYS.has(key) ? maskSecret(value) : value;
}

export type Source = 'env' | 'config' | 'default';

export interface ResolvedSettings {
  apiKey?: { value: string; source: Exclude<Source, 'default'> };
  baseURL: { value: string; source: Source };
}

/** Env vars (DS_API_KEY / DS_API_URL) win over the config file. */
export function resolveSettings(
  config: DsConfig = loadConfig(),
  env: NodeJS.ProcessEnv = process.env,
): ResolvedSettings {
  const settings: ResolvedSettings = {
    baseURL: env.DS_API_URL
      ? { value: env.DS_API_URL, source: 'env' }
      : config.baseURL
        ? { value: config.baseURL, source: 'config' }
        : { value: DEFAULT_BASE_URL, source: 'default' },
  };
  if (env.DS_API_KEY) settings.apiKey = { value: env.DS_API_KEY, source: 'env' };
  else if (config.apiKey) settings.apiKey = { value: config.apiKey, source: 'config' };
  return settings;
}
