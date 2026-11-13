/**
 * End-to-end tests for the built `ds` bin (dist/cli.js). `npm test` runs
 * `npm run build` first (pretest), so these always exercise fresh output.
 */
import { execFile } from 'child_process';
import * as fs from 'fs';
import * as http from 'http';
import { AddressInfo } from 'net';
import * as os from 'os';
import * as path from 'path';

const CLI = path.resolve(__dirname, '..', 'dist', 'cli.js');

interface RunResult {
  code: number;
  stdout: string;
  stderr: string;
}

/** Runs the CLI asynchronously (the mock server lives in this process). */
function runCli(args: string[], options: { env?: Record<string, string>; cwd?: string } = {}): Promise<RunResult> {
  const env: NodeJS.ProcessEnv = { PATH: process.env.PATH, FORCE_COLOR: '0', ...options.env };
  return new Promise((resolve) => {
    execFile(process.execPath, [CLI, ...args], { env, cwd: options.cwd }, (error, stdout, stderr) => {
      const code = error ? (typeof error.code === 'number' ? error.code : 1) : 0;
      resolve({ code, stdout: String(stdout), stderr: String(stderr) });
    });
  });
}

const tmpDirs: string[] = [];
function tmpDir(prefix: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `ds-cli-${prefix}-`));
  tmpDirs.push(dir);
  return dir;
}

interface Recorded {
  method: string;
  url: string;
  authorization?: string;
}

const API_KEY = 'test-key-0123456789abcdef';

const TOKENS = [
  { name: 'color-primary', value: '#0055ff', type: 'color', category: 'color', description: 'Brand primary' },
  { name: 'space-md', value: '16px', type: 'dimension', category: 'spacing' },
];

const BUTTON = {
  id: 'button',
  name: 'Button',
  description: 'A button',
  status: 'production',
  props: [],
  code: { vue: '<template><button>Hi</button></template>', react: 'export const Button = () => <button>Hi</button>;' },
};

let server: http.Server;
let baseURL: string;
const requests: Recorded[] = [];

beforeAll(async () => {
  if (!fs.existsSync(CLI)) throw new Error(`${CLI} not found: run npm run build first`);

  server = http.createServer((req, res) => {
    requests.push({ method: req.method ?? '', url: req.url ?? '', authorization: req.headers.authorization });
    const send = (status: number, body: unknown) => {
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(body));
    };
    const url = new URL(req.url ?? '/', 'http://localhost');

    if (url.pathname === '/api/v1/health') return send(200, { status: 'ok', version: '1.0.0', timestamp: 'now' });
    if (req.headers.authorization !== `Bearer ${API_KEY}`) {
      return send(401, { statusCode: 401, message: 'Invalid or missing API key' });
    }
    if (req.method === 'GET' && url.pathname === '/api/v1/tokens') {
      const category = url.searchParams.get('category');
      const tokens = category ? TOKENS.filter((t) => t.category === category) : TOKENS;
      return send(200, { tokens, count: tokens.length, filters: { category } });
    }
    if (req.method === 'GET' && url.pathname === '/api/v1/components/button') return send(200, BUTTON);
    return send(404, { statusCode: 404, message: `Cannot ${req.method} ${url.pathname}` });
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseURL = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/v1`;
});

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
  for (const dir of tmpDirs) fs.rmSync(dir, { recursive: true, force: true });
});

beforeEach(() => {
  requests.length = 0;
});

describe('bin', () => {
  it('starts with a node shebang and is executable', () => {
    expect(fs.readFileSync(CLI, 'utf-8').split('\n', 1)[0]).toBe('#!/usr/bin/env node');
    expect(fs.statSync(CLI).mode & 0o111).not.toBe(0);
  });

  it('--help lists every command', async () => {
    const { code, stdout } = await runCli(['--help'], { env: { HOME: tmpDir('home') } });
    expect(code).toBe(0);
    for (const cmd of [
      'config',
      'compliance',
      'register',
      'applications',
      'scan',
      'tokens',
      'token',
      'components',
      'component',
      'health',
      'scaffold',
      'validate',
      'migrate',
    ]) {
      expect(stdout).toMatch(new RegExp(`^\\s+${cmd}\\b`, 'm'));
    }
  });
});

describe('config', () => {
  let home: string;
  beforeEach(() => {
    home = tmpDir('home');
  });

  it('set/get round-trips through ~/.designsystem/config.json', async () => {
    const set = await runCli(['config', 'set', 'baseURL', 'https://ds.example.com/api/v1'], { env: { HOME: home } });
    expect(set.code).toBe(0);
    const file = path.join(home, '.designsystem', 'config.json');
    expect(JSON.parse(fs.readFileSync(file, 'utf-8'))).toEqual({ baseURL: 'https://ds.example.com/api/v1' });

    const get = await runCli(['config', 'get', 'baseURL'], { env: { HOME: home } });
    expect(get).toMatchObject({ code: 0, stdout: 'https://ds.example.com/api/v1\n' });
  });

  it('never prints the API key in full and stores it 0600', async () => {
    const set = await runCli(['config', 'set', 'apiKey', API_KEY], { env: { HOME: home } });
    expect(set.code).toBe(0);
    expect(set.stdout).not.toContain(API_KEY);

    const get = await runCli(['config', 'get', 'apiKey'], { env: { HOME: home } });
    expect(get.code).toBe(0);
    expect(get.stdout).not.toContain(API_KEY);
    expect(get.stdout.trim()).toBe('test…cdef');

    const list = await runCli(['config', 'list'], { env: { HOME: home, DS_API_URL: 'http://env.example/api/v1' } });
    expect(list.stdout).not.toContain(API_KEY);
    expect(list.stdout).toContain('(config)');
    expect(list.stdout).toContain('http://env.example/api/v1 (env)');

    const file = path.join(home, '.designsystem', 'config.json');
    expect(JSON.parse(fs.readFileSync(file, 'utf-8')).apiKey).toBe(API_KEY);
    expect(fs.statSync(file).mode & 0o777).toBe(0o600);
  });

  it('rejects unknown keys and reports unset keys', async () => {
    const bad = await runCli(['config', 'set', 'nope', 'x'], { env: { HOME: home } });
    expect(bad.code).toBe(1);
    expect(bad.stderr).toContain("Unknown configuration key 'nope'");
    expect(fs.existsSync(path.join(home, '.designsystem', 'config.json'))).toBe(false);

    const missing = await runCli(['config', 'get', 'apiKey'], { env: { HOME: home } });
    expect(missing.code).toBe(1);
    expect(missing.stderr).toContain('not set');
  });
});

describe('tokens (against a mock API)', () => {
  it('lists tokens using DS_API_URL / DS_API_KEY', async () => {
    const { code, stdout, stderr } = await runCli(['tokens'], {
      env: { HOME: tmpDir('home'), DS_API_URL: baseURL, DS_API_KEY: API_KEY },
    });
    expect(stderr).toBe('');
    expect(code).toBe(0);
    expect(stdout).toContain('Found 2 tokens');
    expect(stdout).toContain('color-primary');
    expect(stdout).toContain('#0055ff');
    expect(requests).toEqual([{ method: 'GET', url: '/api/v1/tokens', authorization: `Bearer ${API_KEY}` }]);
  });

  it('reads the key and URL from the config file and sends filters as query params', async () => {
    const home = tmpDir('home');
    await runCli(['config', 'set', 'apiKey', API_KEY], { env: { HOME: home } });
    await runCli(['config', 'set', 'baseURL', baseURL], { env: { HOME: home } });

    const { code, stdout } = await runCli(['tokens', '--category', 'spacing', '--format', 'json'], { env: { HOME: home } });
    expect(code).toBe(0);
    expect(JSON.parse(stdout)).toEqual([TOKENS[1]]);
    expect(requests.at(-1)).toEqual({
      method: 'GET',
      url: '/api/v1/tokens?category=spacing',
      authorization: `Bearer ${API_KEY}`,
    });
  });

  it('env DS_API_KEY overrides the config file', async () => {
    const home = tmpDir('home');
    await runCli(['config', 'set', 'apiKey', 'wrong-key-from-config'], { env: { HOME: home } });
    const { code } = await runCli(['tokens'], { env: { HOME: home, DS_API_URL: baseURL, DS_API_KEY: API_KEY } });
    expect(code).toBe(0);
  });

  it('shows the server message on HTTP errors without echoing the key', async () => {
    const { code, stdout, stderr } = await runCli(['tokens'], {
      env: { HOME: tmpDir('home'), DS_API_URL: baseURL, DS_API_KEY: 'bad-key-0123456789' },
    });
    expect(code).toBe(1);
    expect(stderr).toContain('API request failed (401): Invalid or missing API key');
    expect(stdout + stderr).not.toContain('bad-key-0123456789');
  });

  it('fails clearly when no API key is configured', async () => {
    const { code, stderr } = await runCli(['tokens'], { env: { HOME: tmpDir('home'), DS_API_URL: baseURL } });
    expect(code).toBe(1);
    expect(stderr).toContain('API key not found');
    expect(requests).toHaveLength(0);
  });

  it('health works without an API key', async () => {
    const { code, stdout } = await runCli(['health'], { env: { HOME: tmpDir('home'), DS_API_URL: baseURL } });
    expect(code).toBe(0);
    expect(stdout).toContain('API is healthy');
  });
});

describe('scaffold', () => {
  const env = () => ({ HOME: tmpDir('home') });

  it('writes a vue component into the target directory', async () => {
    const dir = tmpDir('proj');
    const { code, stdout } = await runCli(['scaffold', 'component', '--name', 'my-button', '--dir', dir], { env: env() });
    expect(code).toBe(0);
    expect(stdout).toContain('wrote src/components/my-button/MyButton.vue');
    const vue = fs.readFileSync(path.join(dir, 'src/components/my-button/MyButton.vue'), 'utf-8');
    expect(vue).toContain('<div class="my-button">');
    expect(fs.existsSync(path.join(dir, 'src/components/my-button/MyButton.test.js'))).toBe(true);
  });

  it('writes a react component and a token, defaulting to the cwd', async () => {
    const dir = tmpDir('proj');
    expect((await runCli(['scaffold', 'component', '-n', 'Card', '--framework', 'react'], { env: env(), cwd: dir })).code).toBe(0);
    expect(fs.readFileSync(path.join(dir, 'src/components/Card/Card.jsx'), 'utf-8')).toContain('export const Card');
    expect(fs.existsSync(path.join(dir, 'src/components/Card/Card.test.jsx'))).toBe(true);

    expect((await runCli(['scaffold', 'token', '-n', 'brand-blue'], { env: env(), cwd: dir })).code).toBe(0);
    const token = JSON.parse(fs.readFileSync(path.join(dir, 'tokens/brand-blue.json'), 'utf-8'));
    expect(token['brand-blue']).toMatchObject({ type: 'color' });
  });

  it('refuses to overwrite existing files unless --force', async () => {
    const dir = tmpDir('proj');
    const file = path.join(dir, 'tokens', 'brand.json');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, 'ORIGINAL');

    const refused = await runCli(['scaffold', 'token', '-n', 'brand', '-d', dir], { env: env() });
    expect(refused.code).toBe(1);
    expect(refused.stderr).toContain('Refusing to overwrite');
    expect(fs.readFileSync(file, 'utf-8')).toBe('ORIGINAL');

    const forced = await runCli(['scaffold', 'token', '-n', 'brand', '-d', dir, '--force'], { env: env() });
    expect(forced.code).toBe(0);
    expect(fs.readFileSync(file, 'utf-8')).not.toBe('ORIGINAL');
  });

  it('--dry-run writes nothing, and path-like names are rejected', async () => {
    const dir = tmpDir('proj');
    const dry = await runCli(['scaffold', 'component', '-n', 'x', '-d', dir, '--dry-run'], { env: env() });
    expect(dry.code).toBe(0);
    expect(dry.stdout).toContain('would write');
    expect(fs.readdirSync(dir)).toEqual([]);

    const evil = await runCli(['scaffold', 'token', '-n', '../evil', '-d', dir], { env: env() });
    expect(evil.code).toBe(1);
    expect(fs.readdirSync(dir)).toEqual([]);
  });
});

describe('migrate (against a mock API)', () => {
  it("writes the component's code from the API into the target directory", async () => {
    const dir = tmpDir('proj');
    const env = { HOME: tmpDir('home'), DS_API_URL: baseURL, DS_API_KEY: API_KEY };
    const first = await runCli(['migrate', '-c', 'button', '-d', dir], { env });
    expect(first.code).toBe(0);
    const file = path.join(dir, 'src/components/button/Button.vue');
    expect(fs.readFileSync(file, 'utf-8')).toBe(`${BUTTON.code.vue}\n`);
    expect(requests.at(-1)).toMatchObject({ method: 'GET', url: '/api/v1/components/button' });

    const again = await runCli(['migrate', '-c', 'button', '-d', dir], { env });
    expect(again.code).toBe(1);
    expect(again.stderr).toContain('Refusing to overwrite');

    const react = await runCli(['migrate', '-c', 'button', '-d', dir, '--framework', 'react'], { env });
    expect(react.code).toBe(0);
    expect(fs.existsSync(path.join(dir, 'src/components/button/Button.jsx'))).toBe(true);
  });

  it('fails when the component has no code for the framework', async () => {
    const dir = tmpDir('proj');
    const env = { HOME: tmpDir('home'), DS_API_URL: baseURL, DS_API_KEY: API_KEY };
    const res = await runCli(['migrate', '-c', 'button', '-d', dir, '--framework', 'html'], { env });
    expect(res.code).toBe(1);
    expect(res.stderr).toContain('no html code');
    expect(fs.readdirSync(dir)).toEqual([]);
  });
});
