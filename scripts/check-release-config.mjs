// Checks that every package .github/workflows/release.yml can publish is ready
// for GitHub Packages: scoped to the repository owner, pointed at
// npm.pkg.github.com, with repository.directory and a `files` list, and that
// the workflow's tag prefixes, inputs and directories agree.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCOPE = '@adamstavely';
const REGISTRY = 'https://npm.pkg.github.com';
const REPOSITORY = 'git+https://github.com/adamstavely/cautious-lamp.git';

// Release key (tag prefix `<key>-v`, workflow input) -> package directory
const PACKAGES = {
  sdk: 'sdk',
  cli: 'cli',
  'mcp-server': 'mcp-server',
  'eslint-plugin': 'eslint-plugin-design-system',
  'loupe-tool': 'loupe-tool-standalone',
  'breakpoint-overlay': 'breakpoint-overlay-standalone',
};

const workflow = readFileSync(path.join(root, '.github/workflows/release.yml'), 'utf8');
const problems = [];
const names = new Map();

for (const [key, dir] of Object.entries(PACKAGES)) {
  const pkg = JSON.parse(readFileSync(path.join(root, dir, 'package.json'), 'utf8'));
  const where = `${dir}/package.json`;
  names.set(pkg.name, dir);
  if (!pkg.name?.startsWith(`${SCOPE}/`)) problems.push(`${where}: name ${pkg.name} is not in the ${SCOPE} scope`);
  if (pkg.private) problems.push(`${where}: private packages can't be published`);
  if (pkg.publishConfig?.registry !== REGISTRY) problems.push(`${where}: publishConfig.registry must be ${REGISTRY}`);
  if (pkg.repository?.url !== REPOSITORY || pkg.repository?.directory !== dir) {
    problems.push(`${where}: repository must be { url: ${REPOSITORY}, directory: ${dir} }`);
  }
  if (!Array.isArray(pkg.files) || pkg.files.length === 0) problems.push(`${where}: needs a files list`);
  if (!workflow.includes(`- "${key}-v*"`)) problems.push(`release.yml: no tag trigger "${key}-v*"`);
  if (!new RegExp(`^\\s+- ${key}$`, 'm').test(workflow)) problems.push(`release.yml: no workflow_dispatch option ${key}`);
  if (!new RegExp(`^\\s+${key}\\) dir=${dir} ;;$`, 'm').test(workflow)) problems.push(`release.yml: ${key} doesn't map to ${dir}`);
}

// Dependencies between the packages must use the published names
for (const dir of Object.values(PACKAGES)) {
  const pkg = JSON.parse(readFileSync(path.join(root, dir, 'package.json'), 'utf8'));
  for (const dep of Object.keys({ ...pkg.dependencies, ...pkg.peerDependencies })) {
    if (dep.startsWith('@designsystem/')) problems.push(`${dir}/package.json: depends on unpublished ${dep}`);
  }
}

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`release config: ${names.size} packages ready for ${REGISTRY} (${[...names.keys()].join(', ')})`);
