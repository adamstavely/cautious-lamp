// Loads the *built* package the way ESLint does: require() by package name
// (resolved through the workspace symlink to package.json "main"). Run after
// `npm run build` (the `pretest` script does this).
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const pkgDir = path.resolve(__dirname, '..');
const pkgJson = JSON.parse(fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf8'));

describe('built package', () => {
  it('package.json main/types point at real build output', () => {
    expect(fs.existsSync(path.join(pkgDir, pkgJson.main))).toBe(true);
    expect(fs.existsSync(path.join(pkgDir, pkgJson.types))).toBe(true);
  });

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const plugin = require(path.join(pkgDir, pkgJson.main));

  it('require() returns the plugin itself (not { default })', () => {
    expect(plugin.default).toBeUndefined();
    expect(plugin.meta).toEqual({ name: 'eslint-plugin-design-system', version: pkgJson.version });
    expect(typeof plugin.loadRulesFromAPI).toBe('function');
  });

  it('exposes rules and recommended configs', () => {
    expect(Object.keys(plugin.rules).sort()).toEqual(
      ['accessibility-attributes', 'component-naming', 'hardcoded-design-tokens', 'spacing-consistency', 'typography-scale']
    );
    for (const rule of Object.values<{ meta: unknown; create: unknown }>(plugin.rules)) {
      expect(rule.meta).toBeDefined();
      expect(typeof rule.create).toBe('function');
    }
    expect(plugin.configs.recommended).toBeDefined();
    expect(plugin.configs['legacy-recommended']).toBe(plugin.configs.recommended);
    expect(plugin.configs['flat/recommended'].plugins['design-system']).toBe(plugin);
  });

  it.each(['recommended', 'flat/recommended'])('every rule in configs[%s] is defined', name => {
    const ruleIds = Object.keys(plugin.configs[name].rules);
    expect(ruleIds.length).toBeGreaterThan(0);
    for (const id of ruleIds) {
      expect(id.startsWith('design-system/')).toBe(true);
      expect(plugin.rules[id.slice('design-system/'.length)]).toBeDefined();
    }
  });

  it('resolves by package name and does no network / axios work at require-time', () => {
    const out = execFileSync(
      process.execPath,
      [
        '-e',
        `const p = require('eslint-plugin-design-system');
         const axiosLoaded = Object.keys(require.cache).some(k => k.includes('/node_modules/axios/'));
         console.log(JSON.stringify({ rules: Object.keys(p.rules).length, axiosLoaded }));`
      ],
      { cwd: pkgDir, encoding: 'utf8', timeout: 10000 }
    );
    expect(JSON.parse(out)).toEqual({ rules: 5, axiosLoaded: false });
  });
});
