#!/usr/bin/env node
// Copies Trench Coat's design tokens and spot illustrations into the app.
//   node scripts/sync-trenchcoat.mjs <path to an unpacked @adamstavely/trenchcoat package>
// Trench Coat is a private package, so the app keeps copies instead of installing it.
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const source = process.argv[2];
if (!source || !existsSync(path.join(source, 'package.json'))) {
  console.error('Usage: node scripts/sync-trenchcoat.mjs <path to the @adamstavely/trenchcoat package>');
  process.exit(1);
}
const { version } = JSON.parse(readFileSync(path.join(source, 'package.json'), 'utf8'));
const frontend = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const tokensOut = path.join(frontend, 'src/styles/trenchcoat/tokens.css');
mkdirSync(path.dirname(tokensOut), { recursive: true });
writeFileSync(
  tokensOut,
  `/* Trench Coat ${version} tokens, copied by scripts/sync-trenchcoat.mjs. Don't edit: override in ../tokens.css. */\n` +
    readFileSync(path.join(source, 'tokens/tokens.css'), 'utf8'),
);

const spotsOut = path.join(frontend, 'src/assets/illustrations/spot');
rmSync(spotsOut, { recursive: true, force: true });
cpSync(path.join(source, 'illustrations/spot'), spotsOut, { recursive: true, filter: (f) => !f.endsWith('README.md') });
writeFileSync(path.join(frontend, 'src/styles/trenchcoat/VERSION'), `${version}\n`);
console.log(`Copied Trench Coat ${version} tokens and spot illustrations`);
