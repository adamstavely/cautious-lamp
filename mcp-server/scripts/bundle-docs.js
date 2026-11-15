// Copies the Markdown the docs resource serves (top-level docs/ and
// frontend/docs/) into bundled-docs/, so an installed server has them outside
// the repository. Runs before `npm pack` / `npm publish`.
const fs = require('fs');
const path = require('path');

const packageDir = path.resolve(__dirname, '..');
const repoRoot = path.resolve(packageDir, '..');
const outDir = path.join(packageDir, 'bundled-docs');
const DOC_DIRS = ['docs', path.join('frontend', 'docs')];

function copyMarkdown(from, to) {
  let count = 0;
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    // Hidden directories (.vitepress) and stray sync copies ("x 2.md") are left out
    if (entry.name.startsWith('.') || / \d+(\.|$)/.test(entry.name)) continue;
    const source = path.join(from, entry.name);
    const target = path.join(to, entry.name);
    if (entry.isDirectory()) {
      count += copyMarkdown(source, target);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      fs.mkdirSync(to, { recursive: true });
      fs.copyFileSync(source, target);
      count += 1;
    }
  }
  return count;
}

fs.rmSync(outDir, { recursive: true, force: true });
for (const dir of DOC_DIRS) {
  const source = path.join(repoRoot, dir);
  if (!fs.existsSync(source)) {
    console.error(`bundle-docs: ${source} is missing; run this from the repository`);
    process.exit(1);
  }
  // stderr, so `npm pack --json` output stays JSON
  console.error(`bundle-docs: ${copyMarkdown(source, path.join(outDir, dir))} files from ${dir}`);
}
