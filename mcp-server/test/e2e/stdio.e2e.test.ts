import { spawn, execFileSync, ChildProcessWithoutNullStreams } from 'child_process';
import * as path from 'path';

/**
 * Spawns the built server and talks JSON-RPC to it over stdio, the way an MCP
 * client does. stdout is the protocol channel, so every line on it must be a
 * JSON-RPC message; logs belong on stderr.
 */
const PACKAGE_DIR = path.resolve(__dirname, '../..');
const SERVER_ENTRY = path.join(PACKAGE_DIR, 'dist', 'index.js');

jest.setTimeout(60000);

function collectLines(stream: NodeJS.ReadableStream, sink: string[]): void {
  let buffer = '';
  stream.on('data', (chunk: Buffer) => {
    buffer += chunk.toString('utf-8');
    let newline: number;
    while ((newline = buffer.indexOf('\n')) !== -1) {
      sink.push(buffer.slice(0, newline));
      buffer = buffer.slice(newline + 1);
    }
  });
}

async function waitFor<T>(check: () => T | undefined, timeoutMs = 10000): Promise<T> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const value = check();
    if (value !== undefined) return value;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error('Timed out waiting for server output');
}

describe('MCP server over stdio', () => {
  let child: ChildProcessWithoutNullStreams;
  const stdoutLines: string[] = [];
  const stderrLines: string[] = [];

  beforeAll(() => {
    // Test the real compiled entry point
    execFileSync(process.execPath, [require.resolve('typescript/bin/tsc'), '-p', PACKAGE_DIR], { stdio: 'pipe' });

    child = spawn(process.execPath, [SERVER_ENTRY], {
      cwd: PACKAGE_DIR,
      env: {
        ...process.env,
        MCP_API_KEY: 'test-api-key',
        MCP_API_BASE_URL: 'http://127.0.0.1:9/api/v1',
        // Most verbose level, so any log written to stdout would show up
        LOG_LEVEL: 'debug',
        LOG_FORMAT: 'json',
      },
    });
    collectLines(child.stdout, stdoutLines);
    collectLines(child.stderr, stderrLines);
  });

  afterAll(() => {
    child?.kill();
  });

  function send(message: object): void {
    child.stdin.write(`${JSON.stringify(message)}\n`);
  }

  it('answers initialize with the first line on stdout, and logs only to stderr', async () => {
    // Wait for the startup log, which used to be written to stdout ahead of any response
    await waitFor(() => (stderrLines.some((l) => l.includes('running on stdio')) ? true : undefined));

    send({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'stdio-test', version: '1.0.0' },
      },
    });

    const firstLine = await waitFor(() => stdoutLines[0]);
    const response = JSON.parse(firstLine);

    expect(response.jsonrpc).toBe('2.0');
    expect(response.id).toBe(1);
    expect(response.result.serverInfo.name).toBe('design-system-mcp-server');
    expect(stderrLines.length).toBeGreaterThan(0);
  });

  it('keeps stdout pure JSON-RPC across a tool call with no arguments', async () => {
    send({ jsonrpc: '2.0', method: 'notifications/initialized' });
    send({ jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'get_asset_types' } });
    send({ jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'get_token' } });

    await waitFor(() => (stdoutLines.length >= 3 ? true : undefined));

    const messages = stdoutLines.map((line) => JSON.parse(line));
    const byId = new Map(messages.map((m) => [m.id, m]));

    expect(byId.get(2).result.isError).toBeFalsy();
    expect(JSON.parse(byId.get(2).result.content[0].text)).toContain('icon');
    expect(byId.get(3).result.isError).toBe(true);
    expect(byId.get(3).result.content[0].text).toContain('Invalid arguments for tool get_token');
  });
});
