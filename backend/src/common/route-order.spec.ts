import * as fs from 'fs';
import * as path from 'path';

/**
 * Nest matches routes in declaration order, so a parameter route declared
 * first (GET tokens/:name) swallows a later static one (GET tokens/relationships),
 * which then can never be reached. This has bitten three routes; keep
 * catch-all routes after the static routes they overlap.
 */
describe('route order', () => {
  it('declares no static route after a parameter route that would capture it', () => {
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const name of fs.readdirSync(dir)) {
        const full = path.join(dir, name);
        if (fs.statSync(full).isDirectory()) walk(full);
        else if (name.endsWith('.controller.ts') && !name.includes(' 2')) files.push(full);
      }
    };
    walk(path.join(__dirname, '..'));

    const shadowed: string[] = [];
    for (const file of files) {
      const routes: Array<{ method: string; segments: string[]; line: number }> = [];
      let prefix = '';
      fs.readFileSync(file, 'utf8')
        .split('\n')
        .forEach((line, index) => {
          const controller = line.match(/@Controller\('([^']*)'\)/);
          if (controller) prefix = controller[1];
          const route = line.match(/@(Get|Post|Put|Patch|Delete)\((?:'([^']*)')?\)/);
          if (route) {
            const full = `/${prefix}/${route[2] ?? ''}`.replace(/\/+/g, '/').replace(/\/$/, '');
            routes.push({ method: route[1], segments: full.split('/'), line: index + 1 });
          }
        });

      routes.forEach((earlier, i) => {
        for (const later of routes.slice(i + 1)) {
          if (earlier.method !== later.method || earlier.segments.length !== later.segments.length) continue;
          let captures = true;
          let viaParam = false;
          earlier.segments.forEach((segment, k) => {
            const other = later.segments[k];
            if (segment === other) return;
            if (segment.startsWith(':') && !other.startsWith(':')) viaParam = true;
            else captures = false;
          });
          if (captures && viaParam) {
            shadowed.push(`${path.relative(path.join(__dirname, '..'), file)}:${later.line} ${later.method} ${later.segments.join('/')} is captured by ${earlier.segments.join('/')} (line ${earlier.line})`);
          }
        }
      });
    }

    expect(shadowed).toEqual([]);
  });
});
