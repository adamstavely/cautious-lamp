#!/usr/bin/env node
/**
 * Every icon is a Lucide icon from components/ui/icons.js, shown with
 * <AppIcon>. Fails on any Material Symbols markup left in src, and on any icon
 * name written in the source that icons.js doesn't have: AppIcon names,
 * `icon`/`trailing-icon` props, `icon:`/`symbol:` data and the quoted
 * strings inside a bound `:name`/`:icon`.
 */
import { readFileSync } from 'node:fs';
import { globSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const registry = readFileSync(join(root, 'src/components/ui/icons.js'), 'utf8');
const known = new Set([...registry.matchAll(/^\s+'([a-z0-9-]+)':/gm)].map((m) => m[1]));
// Data files whose `icon` isn't an icon name (laws of UX use it for their illustration)
const skip = new Set(['src/data/lawsOfUX.js', 'src/utils/timelineExport.js', 'src/data/componentButtonExamples.js', 'src/components/ui/icons.js']);

const files = globSync('src/**/*.{vue,js}', { cwd: root }).filter((f) => !/ \d+\.(vue|js)$/.test(f) && !skip.has(f));
const problems = [];
const literal = (file, line, name, where) => {
  if (!known.has(name)) problems.push(`${file}:${line}  ${where} "${name}" is not in components/ui/icons.js`);
};

for (const file of files) {
  const lines = readFileSync(join(root, file), 'utf8').split('\n');
  lines.forEach((text, index) => {
    const line = index + 1;
    if (/material-(symbols|icons)/.test(text)) problems.push(`${file}:${line}  Material Symbols markup: use <AppIcon>`);
    for (const m of text.matchAll(/<AppIcon\b[^>]*?\sname="([^"]+)"/g)) literal(file, line, m[1], 'AppIcon name');
    for (const m of text.matchAll(/\s(?:[a-z]+-)*icon="([a-z0-9_-]+)"/g)) literal(file, line, m[1], 'icon prop');
    for (const m of text.matchAll(/\b(?:[a-zA-Z]*Icon|icon|symbol)\s*:\s*'([a-z0-9_-]+)'/g)) {
      if (!m[1].startsWith('text-')) literal(file, line, m[1], 'icon data');
    }
    for (const m of text.matchAll(/\s:(?:name|(?:[a-z]+-)*icon)="([^"]+)"/g)) {
      if (!/<AppIcon|icon=/.test(text)) continue;
      for (const q of m[1].matchAll(/'([a-z0-9_-]+)'\s*(?![!=]==?)/g)) {
        const before = m[1].slice(0, q.index);
        if (!/[!=]==?\s*$/.test(before)) literal(file, line, q[1], 'bound icon');
      }
    }
  });
}

if (problems.length) {
  console.error(`${problems.length} icon problem(s):\n${problems.join('\n')}`);
  process.exit(1);
}
console.log(`Icons OK: ${files.length} files, ${known.size} Lucide icons.`);
