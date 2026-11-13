import http from 'http';
import type { AddressInfo } from 'net';
import { Linter } from 'eslint';
import plugin = require('../src/index');
import { clearRulesCache, convertToESLintRule, fetchRules, toRuleId } from '../src/rule-converter';
import { processor, initializePlugin } from '../src/processor';

type Handler = (req: http.IncomingMessage, res: http.ServerResponse) => void;

async function withServer(handler: Handler, fn: (url: string) => Promise<void>): Promise<void> {
  const sockets = new Set<import('net').Socket>();
  const server = http.createServer(handler);
  server.on('connection', s => {
    sockets.add(s);
    s.on('close', () => sockets.delete(s));
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;
  try {
    await fn(`http://127.0.0.1:${port}/api/v1`);
  } finally {
    sockets.forEach(s => s.destroy());
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
}

function lint(code: string, rules: Linter.RulesRecord): Linter.LintMessage[] {
  const linter = new Linter({ configType: 'flat' });
  return linter.verify(code, [
    {
      files: ['**/*.js'],
      plugins: { 'design-system': plugin as never },
      languageOptions: { ecmaVersion: 2022, sourceType: 'module', parserOptions: { ecmaFeatures: { jsx: true } } },
      rules
    }
  ], 'file.js');
}

let warn: jest.SpyInstance;
beforeEach(() => {
  clearRulesCache();
  warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
});
afterEach(() => warn.mockRestore());

describe('fetchRules / loadRulesFromAPI', () => {
  it('does nothing without an apiUrl', async () => {
    await expect(fetchRules({})).resolves.toEqual([]);
    await expect(plugin.loadRulesFromAPI()).resolves.toEqual({ loaded: [], skipped: [] });
    await expect(plugin.loadRulesFromAPI(undefined as never)).resolves.toEqual({ loaded: [], skipped: [] });
    expect(warn).not.toHaveBeenCalled();
  });

  it('resolves (no throw) when the API is down', async () => {
    // Port 9 (discard) on localhost is closed in practice; connection is refused.
    const result = await plugin.loadRulesFromAPI({ apiUrl: 'http://127.0.0.1:9/api/v1', timeout: 1000 });
    expect(result.loaded).toEqual([]);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('times out on a hanging API', async () => {
    await withServer(
      () => {
        /* never respond */
      },
      async url => {
        const start = Date.now();
        const result = await plugin.loadRulesFromAPI({ apiUrl: url, timeout: 200 });
        expect(Date.now() - start).toBeLessThan(3000);
        expect(result.loaded).toEqual([]);
        expect(String(warn.mock.calls[0][0])).toMatch(/timed out after 200ms/);
      }
    );
  });

  it('handles malformed responses', async () => {
    for (const body of ['not json', '{"rules": "nope"}', '{}', '{"rules": [null, 1, {"name": ""}, {"enabled": true}]}']) {
      clearRulesCache();
      await withServer(
        (_req, res) => {
          res.setHeader('content-type', 'application/json');
          res.end(body);
        },
        async url => {
          await expect(plugin.loadRulesFromAPI({ apiUrl: url, timeout: 1000 })).resolves.toEqual({ loaded: [], skipped: [] });
        }
      );
    }
  });

  it('handles HTTP errors', async () => {
    await withServer(
      (_req, res) => {
        res.statusCode = 500;
        res.end('boom');
      },
      async url => {
        await expect(plugin.loadRulesFromAPI({ apiUrl: url, timeout: 1000 })).resolves.toEqual({ loaded: [], skipped: [] });
        expect(warn).toHaveBeenCalledTimes(1);
      }
    );
  });

  it('registers fetched rules under unprefixed ids so they can be configured', async () => {
    let seen: http.IncomingMessage | undefined;
    await withServer(
      (req, res) => {
        seen = req;
        res.setHeader('content-type', 'application/json');
        res.end(
          JSON.stringify({
            rules: [
              { name: 'No Brand Colors!', category: 'Color', enabled: true, severity: 'error', description: 'd', scannerCode: 'hardcoded color' },
              { name: 'Disabled Rule', category: 'x', enabled: false, severity: 'error', description: '' },
              { name: 'Component Naming', category: 'x', enabled: true, severity: 'warning', description: '' },
              { name: '!!!', category: 'x', enabled: true, severity: 'info', description: '' }
            ]
          })
        );
      },
      async url => {
        const result = await plugin.loadRulesFromAPI({ apiUrl: url, apiKey: 'k', timeout: 1000 });
        expect(result.loaded).toEqual(['no-brand-colors']);
        expect(result.skipped).toEqual(['Disabled Rule', 'Component Naming', '!!!']);
        expect(seen?.url).toBe('/api/v1/rules/export?format=eslint');
        expect(seen?.headers.authorization).toBe('Bearer k');
      }
    );
    expect(plugin.rules['no-brand-colors']).toBeDefined();
    expect(plugin.rules['design-system/no-brand-colors']).toBeUndefined();
    // Built-in rule was not replaced.
    expect(plugin.rules['component-naming'].meta?.messages).toHaveProperty('invalidNaming');

    const messages = lint("const c = '#123456';", { 'design-system/no-brand-colors': 'error' });
    expect(messages.map(m => m.ruleId)).toEqual(['design-system/no-brand-colors']);
  });

  it('accepts static rules via config.rules without network', async () => {
    const result = await plugin.loadRulesFromAPI({
      rules: [{ name: 'Static Spacing', category: 's', enabled: true, severity: 'warning', description: '', scannerCode: 'spacing' }]
    });
    expect(result.loaded).toEqual(['static-spacing']);
    expect(warn).not.toHaveBeenCalled();
  });

  it('initializePlugin returns the plugin and never rejects', async () => {
    await expect(initializePlugin({ apiUrl: 'http://127.0.0.1:9', timeout: 500 })).resolves.toBe(plugin);
    await expect(initializePlugin()).resolves.toBe(plugin);
  });
});

describe('convertToESLintRule', () => {
  const run = (scannerCode: string | undefined, code: string) => {
    const rule = convertToESLintRule({ name: 't', category: 'c', enabled: true, severity: 'error', description: '', scannerCode });
    plugin.rules['converter-test'] = rule;
    try {
      return lint(code, { 'design-system/converter-test': 'error' });
    } finally {
      delete plugin.rules['converter-test'];
    }
  };

  it('runs every matched pattern (handlers on the same node type are merged)', () => {
    const messages = run('check hardcoded color and spacing', "const a = '#ffffff'; const b = '16px';");
    expect(messages.map(m => m.message)).toEqual([
      'Found hardcoded color: #ffffff. Use design token instead.',
      'Found hardcoded spacing: 16px. Use design token instead.'
    ]);
  });

  it('naming pattern ignores private/constant names', () => {
    const messages = run('naming', 'const _x = 1; const $y = 2; const MAX_SIZE = 3; const Bad_Name = 4;');
    expect(messages).toHaveLength(1);
    expect(messages[0].message).toBe('Component "Bad_Name" should follow PascalCase convention');
  });

  it('aria pattern handles JSX edge cases without crashing', () => {
    const messages = run('aria', '<><svg:button /><ui.button /><button>ok</button><button /></>');
    expect(messages).toHaveLength(1);
    expect(messages[0].message).toBe('Missing required attribute: aria-label or aria-labelledby');
  });

  it('token pattern checks template literals; default pattern checks literals', () => {
    expect(run('token', 'const c = `color: #abcdef`;')).toHaveLength(1);
    expect(run(undefined, "const c = '#abc'; const t = '';")).toHaveLength(1);
    expect(run('', '')).toHaveLength(0);
  });

  it('toRuleId sanitizes names', () => {
    expect(toRuleId('  No  Brand -- Colors! ')).toBe('no-brand-colors');
    expect(toRuleId('!!!')).toBe('');
  });
});

describe('processor', () => {
  it('passes text through and flattens messages', () => {
    expect(processor.preprocess('', 'a.js')).toEqual(['']);
    expect(processor.preprocess(undefined as never, 'a.js')).toEqual(['']);
    const m = { ruleId: 'x', message: 'm', line: 1, column: 1, severity: 2 } as Linter.LintMessage;
    expect(processor.postprocess([[m], []], 'a.js')).toEqual([m]);
    expect(processor.postprocess(undefined as never, 'a.js')).toEqual([]);
  });
});
