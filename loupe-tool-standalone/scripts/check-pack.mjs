// Fails if package.json advertises a file (main, module, unpkg, types or any
// `exports` target) that `npm pack` would not ship. Run after `vite build`.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));

const advertised = new Set();
for (const field of ['main', 'module', 'unpkg', 'types']) {
  if (pkg[field]) advertised.add(pkg[field].replace(/^\.\//, ''));
}
const collect = (target) => {
  if (typeof target === 'string') advertised.add(target.replace(/^\.\//, ''));
  else if (target && typeof target === 'object') Object.values(target).forEach(collect);
};
collect(pkg.exports);

const [result] = JSON.parse(
  execFileSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], { cwd: root, encoding: 'utf8' })
);
const packed = new Set(result.files.map((f) => f.path));

const missing = [...advertised].filter((p) => !packed.has(p));
if (missing.length > 0) {
  console.error(`${pkg.name}: advertised but not in the package:\n  ${missing.join('\n  ')}`);
  console.error(`packed files:\n  ${[...packed].join('\n  ')}`);
  process.exit(1);
}
console.log(`${pkg.name}: all ${advertised.size} advertised files are in the package (${packed.size} files)`);
