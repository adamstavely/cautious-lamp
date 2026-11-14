import http from 'http';
import type { AddressInfo } from 'net';
import { Linter } from 'eslint';
import plugin = require('../src/index');
import { clearRulesCache, convertToESLintRule, DesignSystemRule, fetchRules, toRuleId, unsupportedReason } from '../src/rule-converter';
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
    await expect(plugin.loadRulesFromAPI()).resolves.toEqual({ loaded: [], skipped: [], warnings: [] });
    await expect(plugin.loadRulesFromAPI(undefined as never)).resolves.toEqual({ loaded: [], skipped: [], warnings: [] });
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
          await expect(plugin.loadRulesFromAPI({ apiUrl: url, timeout: 1000 })).resolves.toEqual({ loaded: [], skipped: [], warnings: [] });
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
        await expect(plugin.loadRulesFromAPI({ apiUrl: url, timeout: 1000 })).resolves.toEqual({ loaded: [], skipped: [], warnings: [] });
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
            format: 'cautious-lamp-governance-rules',
            formatVersion: 1,
            rules: [
              {
                name: 'No Brand Colors!',
                category: 'design-system',
                enabled: true,
                severity: 'error',
                description: 'd',
                type: 'regex-absent',
                target: 'javascript',
                pattern: '#[0-9a-f]{6}',
                flags: 'i',
                message: 'Use a brand token'
              },
              { name: 'Disabled Rule', category: 'x', enabled: false, severity: 'error', description: '', type: 'regex-absent', target: 'javascript', pattern: 'x' },
              { name: 'Component Naming', category: 'x', enabled: true, severity: 'warning', description: '', type: 'builtin', target: 'html', builtin: 'component-naming' },
              { name: '!!!', category: 'x', enabled: true, severity: 'info', description: '' }
            ]
          })
        );
      },
      async url => {
        const result = await plugin.loadRulesFromAPI({ apiUrl: url, apiKey: 'k', timeout: 1000 });
        expect(result.loaded).toEqual(['no-brand-colors']);
        expect(result.skipped).toEqual(['Disabled Rule', 'Component Naming', '!!!']);
        expect(seen?.url).toBe('/api/v1/governance/rules/export');
        expect(seen?.headers.authorization).toBe('Bearer k');
      }
    );
    expect(plugin.rules['no-brand-colors']).toBeDefined();
    expect(plugin.rules['design-system/no-brand-colors']).toBeUndefined();
    // Built-in rule was not replaced.
    expect(plugin.rules['component-naming'].meta?.messages).toHaveProperty('invalidNaming');

    const messages = lint("const c = '#123456';", { 'design-system/no-brand-colors': 'error' });
    expect(messages.map(m => [m.ruleId, m.message, m.column])).toEqual([['design-system/no-brand-colors', 'Use a brand token', 12]]);
  });

  it('accepts static rules via config.rules without network', async () => {
    const result = await plugin.loadRulesFromAPI({
      rules: [
        {
          name: 'Static Spacing',
          category: 's',
          enabled: true,
          severity: 'warning',
          description: '',
          type: 'token-usage',
          target: 'css',
          properties: ['margin*']
        }
      ]
    });
    expect(result).toEqual({ loaded: ['static-spacing'], skipped: [], warnings: [] });
    expect(warn).not.toHaveBeenCalled();
  });

  it('skips rules ESLint cannot check, with a warning instead of a stand-in check', async () => {
    const base = { category: 'c', enabled: true, severity: 'error' as const, description: '' };
    const result = await plugin.loadRulesFromAPI({
      rules: [
        { ...base, name: 'Old Scanner', scannerCode: 'hardcoded color' } as never,
        { ...base, name: 'One H1', type: 'selector-count', target: 'html', selector: 'h1', min: 1, max: 1 },
        { ...base, name: 'Axe', type: 'builtin', target: 'html', builtin: 'axe' },
        { ...base, name: 'Html Regex', type: 'regex-absent', target: 'html', pattern: '<font' },
        { ...base, name: 'Complex Selector', type: 'selector-attribute', target: 'html', selector: 'input:not([type=hidden])', attribute: 'id' }
      ]
    });
    expect(result.loaded).toEqual([]);
    expect(result.skipped).toEqual(['Old Scanner', 'One H1', 'Axe', 'Html Regex', 'Complex Selector']);
    expect(result.warnings).toHaveLength(5);
    expect(result.warnings[0]).toMatch(/Old Scanner.*no declarative rule type/);
    expect(result.warnings[1]).toMatch(/selector-count/);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0][0])).toMatch(/Skipped 5 rule\(s\) ESLint can't check/);
    expect(plugin.rules['old-scanner']).toBeUndefined();
  });

  it('initializePlugin returns the plugin and never rejects', async () => {
    await expect(initializePlugin({ apiUrl: 'http://127.0.0.1:9', timeout: 500 })).resolves.toBe(plugin);
    await expect(initializePlugin()).resolves.toBe(plugin);
  });
});

describe('convertToESLintRule', () => {
  const run = (def: Partial<DesignSystemRule>, code: string) => {
    const rule = convertToESLintRule({ name: 't', category: 'c', enabled: true, severity: 'error', description: '', message: 'bad', ...def });
    plugin.rules['converter-test'] = rule;
    try {
      return lint(code, { 'design-system/converter-test': 'error' });
    } finally {
      delete plugin.rules['converter-test'];
    }
  };

  it('regex-absent reports each match with its location', () => {
    const messages = run({ type: 'regex-absent', target: 'javascript', pattern: 'console\\.log', message: 'No console.log' }, 'a();\nconsole.log(1);\nconsole.log(2);');
    expect(messages.map(m => [m.message, m.line, m.column])).toEqual([
      ['No console.log', 2, 1],
      ['No console.log', 3, 1]
    ]);
  });

  it('regex-present reports a file without a match, and skips empty files', () => {
    const def = { type: 'regex-present' as const, target: 'javascript' as const, pattern: 'use strict', message: 'Missing use strict' };
    expect(run(def, 'const a = 1;').map(m => m.message)).toEqual(['Missing use strict']);
    expect(run(def, "'use strict'; const a = 1;")).toHaveLength(0);
    expect(run(def, '')).toHaveLength(0);
  });

  it('token-usage checks CSS-in-JS objects and template literals', () => {
    const def = { type: 'token-usage' as const, target: 'css' as const, properties: ['color', 'margin*'], allowedValues: ['4px'], message: 'Use a token' };
    const code = [
      "const a = { color: '#fff', marginTop: '8px', padding: '3px' };",
      "const b = { color: 'var(--brand)', margin: '4px auto', marginLeft: 0, backgroundColor: 'red' };",
      'const c = css`color: red; margin-bottom: ${space.md};`;',
      'const d = <div style={{ marginRight: 12 }} />;',
      "import x from 'color: red';"
    ].join('\n');
    expect(run(def, code).map(m => m.message)).toEqual([
      'Use a token (color: #fff)',
      'Use a token (margintop: 8px)',
      'Use a token (color: red)',
      'Use a token (marginright: 12)'
    ]);
  });

  it('token-usage accepts configured design token values', () => {
    const rule = convertToESLintRule(
      { name: 't', category: 'c', enabled: true, severity: 'error', description: '', type: 'token-usage', target: 'css', properties: ['color'], message: 'm' },
      { tokenValues: ['#0055FF'] }
    );
    plugin.rules['converter-test'] = rule;
    try {
      expect(lint("const a = { color: '#0055ff' };", { 'design-system/converter-test': 'error' })).toHaveLength(0);
    } finally {
      delete plugin.rules['converter-test'];
    }
  });

  it('selector-attribute checks native JSX elements for any of the attributes', () => {
    const def = { type: 'selector-attribute' as const, target: 'html' as const, selector: 'img, area', attribute: 'alt|aria-label', message: 'Needs alt' };
    const code = '<><img src="a" /><img alt="x" /><img aria-label="y" /><Img /><img {...props} /><area /></>';
    expect(run(def, code).map(m => m.message)).toEqual(['Needs alt', 'Needs alt']);
  });

  it('selector-attribute with a pattern checks literal values only', () => {
    const def = { type: 'selector-attribute' as const, target: 'html' as const, selector: 'a', attribute: 'rel', pattern: 'noopener', message: 'rel=noopener' };
    expect(run(def, '<><a rel="nofollow" /><a rel="noopener" /><a rel={r} /><a /></>')).toHaveLength(2);
  });

  it('builtin component-naming flags non-PascalCase components', () => {
    const messages = run({ type: 'builtin', target: 'html', builtin: 'component-naming' }, 'const _x = 1; const MAX_SIZE = 3; const Bad_Name = 4;');
    expect(messages.map(m => m.message)).toEqual(['Component "Bad_Name" should follow PascalCase convention']);
  });

  it('refuses unsupported rules instead of guessing a check', () => {
    expect(() => run({ type: 'selector-count', target: 'html', selector: 'h1', min: 1 }, '')).toThrow(/whole page/);
    expect(() => run({}, '')).toThrow(/no declarative rule type/);
    expect(unsupportedReason({ name: 'r', category: 'c', enabled: true, severity: 'error', description: '', type: 'regex-absent', target: 'javascript', pattern: 'a', flags: 'g' })).toMatch(/flags/);
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
