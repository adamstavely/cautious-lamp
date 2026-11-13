// Compiles every .vue file under src/ (parse, script, template) and fails on
// any error, so template mistakes are caught without a full production build.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc';

const root = new URL('../src/', import.meta.url).pathname;

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return walk(path);
    return path.endsWith('.vue') ? [path] : [];
  });

const failures = [];
for (const file of walk(root)) {
  const id = relative(root, file);
  try {
    const { descriptor, errors } = parse(readFileSync(file, 'utf8'), { filename: file });
    if (errors.length) {
      failures.push(`${id}: ${errors.map((e) => `${e.message} (line ${e.loc?.start.line ?? '?'})`).join('; ')}`);
      continue;
    }
    const script = descriptor.script || descriptor.scriptSetup ? compileScript(descriptor, { id }) : null;
    if (descriptor.template) {
      const { errors: templateErrors } = compileTemplate({
        source: descriptor.template.content,
        filename: file,
        id,
        compilerOptions: { bindingMetadata: script?.bindings },
      });
      if (templateErrors.length) failures.push(`${id}: ${templateErrors.map(String).join('; ')}`);
    }
  } catch (error) {
    failures.push(`${id}: ${error.message}`);
  }
}

if (failures.length) {
  console.error(`${failures.length} file(s) failed to compile:\n${failures.join('\n')}`);
  process.exit(1);
}
console.log('All .vue files compile.');
