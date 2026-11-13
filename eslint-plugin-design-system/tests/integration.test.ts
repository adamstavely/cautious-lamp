// Lints real files through ESLint's public API with the plugin's recommended
// configs, loading the built plugin by package name the way users do.
import fs from 'fs';
import path from 'path';
import { ESLint } from 'eslint';

const pkgDir = path.resolve(__dirname, '..');
const fixtures = path.join(__dirname, 'fixtures');
const sample = path.join(fixtures, 'sample.jsx');
const emptyFile = path.join(fixtures, 'empty.js');

// The installed ESLint is 8.x; its ESLint class is the eslintrc one, and the
// flat-config class lives in eslint/use-at-your-own-risk (it is the default in 9).
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { FlatESLint } = require('eslint/use-at-your-own-risk');
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LegacyESLint: any = ESLint;

const EXPECTED = [
  { ruleId: 'design-system/component-naming', line: 7, severity: 1 },
  { ruleId: 'design-system/hardcoded-design-tokens', line: 8, severity: 2 },
  { ruleId: 'design-system/spacing-consistency', line: 8, severity: 1 },
  { ruleId: 'design-system/typography-scale', line: 8, severity: 1 },
  { ruleId: 'design-system/accessibility-attributes', line: 12, severity: 2 }
];

type Msg = { ruleId: string | null; line: number; severity: number; message: string; fatal?: boolean };
const summarize = (messages: Msg[]) =>
  messages
    .map(({ ruleId, line, severity }) => ({ ruleId, line, severity }))
    .sort((a, b) => a.line - b.line || String(a.ruleId).localeCompare(String(b.ruleId)));

describe('ESLint integration', () => {
  it('eslintrc: extends plugin:design-system/recommended', async () => {
    const eslint = new LegacyESLint({
      cwd: pkgDir,
      useEslintrc: false,
      resolvePluginsRelativeTo: pkgDir,
      overrideConfig: {
        extends: ['plugin:design-system/recommended'],
        parserOptions: { ecmaVersion: 2022, sourceType: 'module', ecmaFeatures: { jsx: true } },
        env: { browser: true, es2022: true }
      }
    });
    const [result, empty] = await eslint.lintFiles([sample, emptyFile]);
    expect(result.messages.filter((m: Msg) => m.fatal)).toEqual([]);
    expect(summarize(result.messages)).toEqual(EXPECTED);
    expect(empty.messages).toEqual([]);
  });

  it('eslintrc: works with @typescript-eslint/parser on TSX', async () => {
    const eslint = new LegacyESLint({
      cwd: pkgDir,
      useEslintrc: false,
      resolvePluginsRelativeTo: pkgDir,
      overrideConfig: {
        parser: '@typescript-eslint/parser',
        extends: ['plugin:design-system/recommended'],
        parserOptions: { ecmaVersion: 2022, sourceType: 'module', ecmaFeatures: { jsx: true } }
      }
    });
    const code = fs.readFileSync(sample, 'utf8').replace('({ label })', '({ label }: { label: string })');
    const [result] = await eslint.lintText(code, { filePath: path.join(fixtures, 'sample.tsx') });
    expect(result.messages.filter((m: Msg) => m.fatal)).toEqual([]);
    expect(summarize(result.messages)).toEqual(EXPECTED);
  });

  it('flat config: configs["flat/recommended"]', async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const plugin = require('eslint-plugin-design-system');
    const eslint = new FlatESLint({
      cwd: pkgDir,
      overrideConfigFile: true,
      overrideConfig: [
        plugin.configs['flat/recommended'],
        {
          files: ['**/*.js', '**/*.jsx'],
          languageOptions: { ecmaVersion: 2022, sourceType: 'module', parserOptions: { ecmaFeatures: { jsx: true } } }
        }
      ]
    });
    const [result, empty] = await eslint.lintFiles([sample, emptyFile]);
    expect(result.messages.filter((m: Msg) => m.fatal)).toEqual([]);
    expect(summarize(result.messages)).toEqual(EXPECTED);
    expect(empty.messages).toEqual([]);
  });
});
