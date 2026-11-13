#!/usr/bin/env node

import { Command, Option } from 'commander';
import chalk from 'chalk';
import { DesignSystemAPI, ComplianceCheck } from '@designsystem/api';
import * as fs from 'fs';
import * as path from 'path';
import {
  CONFIG_KEYS,
  displayValue,
  isConfigKey,
  loadConfig,
  resolveSettings,
  saveConfig,
} from './config';
import {
  CodeFormat,
  Framework,
  planComponentCode,
  planComponentScaffold,
  planTokenScaffold,
  writeFiles,
} from './files';

/** An expected failure: printed as a one-line error, exit code 1. */
class CliError extends Error {}

function getAPI(options: { requireKey?: boolean } = {}): DesignSystemAPI {
  const { apiKey, baseURL } = resolveSettings();
  if (!apiKey && options.requireKey !== false) {
    throw new CliError('API key not found. Set the DS_API_KEY environment variable or run: ds config set apiKey <key>');
  }
  const timeout = Number(process.env.DS_API_TIMEOUT) || 30000;
  return new DesignSystemAPI({ apiKey: apiKey?.value ?? '', baseURL: baseURL.value, timeout });
}

/** Turns axios/HTTP errors into a readable message without leaking request headers. */
function describeError(error: unknown): string {
  const err = error as {
    message?: string;
    code?: string;
    config?: { baseURL?: string; url?: string };
    response?: { status?: number; data?: { message?: unknown; error?: unknown } };
  };
  if (err?.response) {
    const status = err.response.status;
    const raw = err.response.data?.message ?? err.response.data?.error;
    const detail = Array.isArray(raw) ? raw.join('; ') : typeof raw === 'string' ? raw : '';
    return `API request failed (${status})${detail ? `: ${detail}` : ''}`;
  }
  if (err?.code === 'ECONNABORTED' || err?.code === 'ETIMEDOUT') {
    return `Request to ${err.config?.baseURL ?? 'the API'} timed out (set DS_API_TIMEOUT in ms to change the limit)`;
  }
  if (err?.code === 'ECONNREFUSED' || err?.code === 'ENOTFOUND') {
    return `Could not reach the API at ${err.config?.baseURL ?? 'the configured URL'} (${err.code}). Check DS_API_URL or: ds config set baseURL <url>`;
  }
  return err?.message ?? String(error);
}

/** Wraps an action so every failure prints one error line and sets exit code 1. */
function run<A extends unknown[]>(fn: (...args: A) => unknown | Promise<unknown>) {
  return async (...args: A): Promise<void> => {
    try {
      await fn(...args);
    } catch (error) {
      console.error(chalk.red(`Error: ${describeError(error)}`));
      process.exitCode = 1;
    }
  };
}

function parseCategories(value: string | undefined): string[] | undefined {
  if (!value) return undefined;
  const list = value.split(',').map((c) => c.trim()).filter(Boolean);
  return list.length > 0 ? list : undefined;
}

function printChecks(checks: ComplianceCheck[]): void {
  for (const check of checks) {
    const icon = check.status === 'pass' ? '✓' : check.status === 'warning' ? '⚠' : '✗';
    const color = check.status === 'pass' ? chalk.green : check.status === 'warning' ? chalk.yellow : chalk.red;
    console.log(color(`${icon} ${check.rule}`));
    console.log(`  ${check.message}`);
    if (check.component) console.log(`  Component: ${check.component}`);
    if (check.application) console.log(`  Application: ${check.application}`);
    if (check.file) console.log(`  File: ${check.file}${check.line ? `:${check.line}` : ''}`);
    console.log('');
  }
}

function reportWritten(files: string[], dryRun: boolean, rootDir: string): void {
  for (const file of files) {
    const rel = path.relative(rootDir, file) || file;
    console.log(dryRun ? chalk.yellow(`  would write ${rel}`) : chalk.green(`  wrote ${rel}`));
  }
}

export function createProgram(): Command {
  const program = new Command();

  program.name('ds').description('Design System CLI').version('1.0.0');

  // ---------------------------------------------------------------- config
  const configCmd = program
    .command('config')
    .description('Manage configuration (~/.designsystem/config.json); DS_API_KEY / DS_API_URL env vars override it');

  const keyHelp = `Configuration key (${CONFIG_KEYS.join(', ')})`;
  const requireKey = (key: string) => {
    if (!isConfigKey(key)) {
      throw new CliError(`Unknown configuration key '${key}'. Valid keys: ${CONFIG_KEYS.join(', ')}`);
    }
    return key;
  };

  configCmd
    .command('set')
    .description('Set a configuration value')
    .argument('<key>', keyHelp)
    .argument('<value>', 'Configuration value')
    .action(
      run((key: string, value: string) => {
        const k = requireKey(key);
        const config = loadConfig();
        config[k] = value;
        saveConfig(config);
        console.log(chalk.green(`✓ Set ${k} = ${displayValue(k, value)}`));
      }),
    );

  configCmd
    .command('get')
    .description('Get a configuration value (secrets are masked)')
    .argument('<key>', keyHelp)
    .action(
      run((key: string) => {
        const k = requireKey(key);
        const value = loadConfig()[k];
        if (!value) throw new CliError(`Configuration key '${k}' is not set`);
        console.log(displayValue(k, value));
      }),
    );

  configCmd
    .command('unset')
    .description('Remove a configuration value')
    .argument('<key>', keyHelp)
    .action(
      run((key: string) => {
        const k = requireKey(key);
        const config = loadConfig();
        delete config[k];
        saveConfig(config);
        console.log(chalk.green(`✓ Unset ${k}`));
      }),
    );

  configCmd
    .command('list')
    .description('Show the effective settings and where each comes from')
    .action(
      run(() => {
        const { apiKey, baseURL } = resolveSettings();
        console.log(`apiKey  = ${apiKey ? `${displayValue('apiKey', apiKey.value)} (${apiKey.source})` : chalk.dim('(not set)')}`);
        console.log(`baseURL = ${baseURL.value} (${baseURL.source})`);
      }),
    );

  // ------------------------------------------------------------ compliance
  program
    .command('compliance')
    .description('Run compliance checks (POST /compliance/scan)')
    .addOption(new Option('-s, --scope <scope>', 'Scope').choices(['design-system', 'applications']).default('design-system'))
    .option('-a, --application <id>', 'Application ID to scan')
    .option('-c, --categories <categories>', 'Comma-separated list of rule categories (e.g., accessibility,design-system,ux-hcd)')
    .addOption(new Option('-f, --format <format>', 'Output format').choices(['table', 'json']).default('table'))
    .action(
      run(async (options: { scope: 'design-system' | 'applications'; application?: string; categories?: string; format: string }) => {
        const api = getAPI();
        const categories = parseCategories(options.categories);
        const result = await api.scanCompliance(options.scope, options.application, categories);

        if (options.format === 'json') {
          console.log(JSON.stringify(result, null, 2));
          return;
        }
        console.log(chalk.bold(`\nCompliance Scan Results (${result.scope})\n`));
        if (categories) console.log(chalk.dim(`Categories: ${categories.join(', ')}\n`));
        console.log(chalk.green(`✓ Passed: ${result.passed}`));
        console.log(chalk.yellow(`⚠ Warnings: ${result.warnings}`));
        console.log(chalk.red(`✗ Failed: ${result.failed}\n`));
        printChecks(result.checks ?? []);
      }),
    );

  // ---------------------------------------------------------- applications
  program
    .command('register')
    .description('Register an application for compliance scanning (POST /applications/register)')
    .requiredOption('-n, --name <name>', 'Application name')
    .option('-r, --repository <repo>', 'Repository URL')
    .option('-d, --description <text>', 'Description')
    .option('-v, --app-version <version>', 'Application version')
    .action(
      run(async (options: { name: string; repository?: string; description?: string; appVersion?: string }) => {
        const api = getAPI();
        const app = await api.registerApplication(options.name, options.repository, options.appVersion, {
          description: options.description,
        });
        console.log(chalk.green(`✓ Application registered: ${app.id}`));
        console.log(`  Name: ${app.name}`);
        if (app.repository) console.log(`  Repository: ${app.repository}`);
        if (app.version) console.log(`  Version: ${app.version}`);
      }),
    );

  program
    .command('applications')
    .description('List registered applications (GET /applications)')
    .option('--team <teamId>', 'Filter by team ID')
    .addOption(new Option('--capability <capability>', 'Only apps with this capability enabled').choices(['governance', 'visualRegression', 'sessionReplay']))
    .addOption(new Option('-f, --format <format>', 'Output format').choices(['table', 'json']).default('table'))
    .action(
      run(async (options: { team?: string; capability?: 'governance' | 'visualRegression' | 'sessionReplay'; format: string }) => {
        const api = getAPI();
        const { applications } = await api.getApplications({ teamId: options.team, capability: options.capability });
        if (options.format === 'json') {
          console.log(JSON.stringify(applications, null, 2));
          return;
        }
        console.log(chalk.bold(`\nRegistered Applications (${applications.length})\n`));
        for (const app of applications) {
          console.log(chalk.cyan(app.name));
          console.log(`  ID: ${app.id}`);
          if (app.repository) console.log(`  Repository: ${app.repository}`);
          if (app.version) console.log(`  Version: ${app.version}`);
          if (app.registeredAt) console.log(`  Registered: ${new Date(app.registeredAt).toLocaleDateString()}`);
          if (app.lastScanned) console.log(`  Last Scanned: ${new Date(app.lastScanned).toLocaleDateString()}`);
          console.log('');
        }
      }),
    );

  program
    .command('scan')
    .description('Scan an application codebase for compliance (POST /compliance/scan-application)')
    .requiredOption('-a, --application <id>', 'Application ID to scan')
    .option('-c, --categories <categories>', 'Comma-separated list of rule categories (e.g., accessibility,design-system,ux-hcd)')
    .addOption(new Option('-f, --format <format>', 'Output format').choices(['table', 'json']).default('table'))
    .action(
      run(async (options: { application: string; categories?: string; format: string }) => {
        const api = getAPI();
        const categories = parseCategories(options.categories);
        const result = await api.scanApplicationCodebase(options.application, undefined, categories);

        if (options.format === 'json') {
          console.log(JSON.stringify(result, null, 2));
          return;
        }
        const checks = result.checks ?? [];
        console.log(chalk.bold(`\nCompliance Scan Results for ${result.applicationId ?? options.application}\n`));
        if (categories) console.log(chalk.dim(`Categories: ${categories.join(', ')}\n`));
        console.log(chalk.green(`✓ Passed: ${checks.filter((c) => c.status === 'pass').length}`));
        console.log(chalk.yellow(`⚠ Warnings: ${checks.filter((c) => c.status === 'warning').length}`));
        console.log(chalk.red(`✗ Failed: ${checks.filter((c) => c.status === 'error').length}\n`));
        printChecks(checks);
      }),
    );

  // ---------------------------------------------------------------- tokens
  program
    .command('tokens')
    .description('List tokens (GET /tokens)')
    .option('-c, --category <category>', 'Filter by category')
    .option('-t, --type <type>', 'Filter by type')
    .option('--tag <tag>', 'Filter by tag')
    .addOption(new Option('-f, --format <format>', 'Output format').choices(['table', 'json']).default('table'))
    .action(
      run(async (options: { category?: string; type?: string; tag?: string; format: string }) => {
        const api = getAPI();
        const filters = { category: options.category, type: options.type, tag: options.tag };
        const { tokens } =
          filters.category || filters.type || filters.tag ? await api.tokensFiltered(filters) : await api.tokens();

        if (options.format === 'json') {
          console.log(JSON.stringify(tokens, null, 2));
          return;
        }
        console.log(chalk.bold(`\nFound ${tokens.length} tokens\n`));
        for (const token of tokens) {
          console.log(chalk.cyan(String(token.name).padEnd(40)) + chalk.gray(String(token.value)));
          if (token.description) console.log('  ' + chalk.dim(token.description));
        }
      }),
    );

  program
    .command('token <name>')
    .description('Get a specific token (GET /tokens/:name)')
    .action(
      run(async (name: string) => {
        const api = getAPI();
        const token = await api.token(name);
        console.log(chalk.bold(`\n${token.name}\n`));
        console.log(`Value:    ${chalk.cyan(token.value)}`);
        console.log(`Type:     ${token.type}`);
        console.log(`Category: ${token.category}`);
        if (token.description) console.log(`Description: ${token.description}`);
        if (token.tags && token.tags.length > 0) console.log(`Tags:     ${token.tags.join(', ')}`);
      }),
    );

  // ------------------------------------------------------------ components
  program
    .command('components')
    .description('List components (GET /components, or /components/status/:status)')
    .option('-s, --status <status>', 'Filter by status')
    .addOption(new Option('-f, --format <format>', 'Output format').choices(['table', 'json']).default('table'))
    .action(
      run(async (options: { status?: string; format: string }) => {
        const api = getAPI();
        const { components } = options.status ? await api.componentsByStatus(options.status) : await api.components();

        if (options.format === 'json') {
          console.log(JSON.stringify(components, null, 2));
          return;
        }
        console.log(chalk.bold(`\nFound ${components.length} components\n`));
        for (const component of components) {
          const statusColor =
            component.status === 'production' ? chalk.green : component.status === 'in-progress' ? chalk.yellow : chalk.gray;
          console.log(chalk.cyan(component.id.padEnd(20)) + statusColor(String(component.status).padEnd(15)) + component.name);
          if (component.description) console.log('  ' + chalk.dim(component.description));
        }
      }),
    );

  program
    .command('component <id>')
    .description('Get a specific component (GET /components/:id)')
    .addOption(new Option('-c, --code <format>', 'Show code').choices(['vue', 'react', 'html', 'none']).default('vue'))
    .action(
      run(async (id: string, options: { code: CodeFormat | 'none' }) => {
        const api = getAPI();
        const component = await api.component(id);
        console.log(chalk.bold(`\n${component.name} (${component.id})\n`));
        console.log(`Status:       ${component.status}`);
        console.log(`Description:  ${component.description}`);
        if (component.dependencies && component.dependencies.length > 0) {
          console.log(`Dependencies: ${component.dependencies.join(', ')}`);
        }
        if (component.accessibility) console.log(`WCAG:         ${component.accessibility.wcag}`);
        console.log(chalk.bold(`\nProps:\n`));
        for (const prop of component.props ?? []) {
          console.log(`  ${chalk.cyan(prop.name.padEnd(20))} ${prop.type} ${prop.required ? chalk.red('*') : ''}`);
          if (prop.description) console.log(`    ${chalk.dim(prop.description)}`);
        }
        const code = options.code !== 'none' ? component.code?.[options.code] : undefined;
        if (code) {
          console.log(chalk.bold(`\n${options.code.toUpperCase()} Code:\n`));
          console.log(chalk.gray(code));
        }
      }),
    );

  // ---------------------------------------------------------------- health
  program
    .command('health')
    .description('Check API health (GET /health, no API key needed)')
    .action(
      run(async () => {
        const health = await getAPI({ requireKey: false }).health();
        console.log(chalk.green(`✓ API is healthy`));
        console.log(`Status:    ${health.status}`);
        console.log(`Version:   ${health.version}`);
        console.log(`Timestamp: ${health.timestamp}`);
      }),
    );

  // -------------------------------------------------------------- scaffold
  program
    .command('scaffold')
    .description('Scaffold a new component (src/components/<name>/) or token (tokens/<name>.json) on disk')
    .addArgument(program.createArgument('<type>', 'What to scaffold').choices(['component', 'token']))
    .requiredOption('-n, --name <name>', 'Name of the component/token')
    .addOption(new Option('--framework <framework>', 'Component framework').choices(['vue', 'react']).default('vue'))
    .option('-d, --dir <dir>', 'Target project directory', '.')
    .option('--force', 'Overwrite existing files')
    .option('--dry-run', 'Show the files that would be written without writing them')
    .action(
      run((type: 'component' | 'token', options: { name: string; framework: Framework; dir: string; force?: boolean; dryRun?: boolean }) => {
        const rootDir = path.resolve(options.dir);
        const planned =
          type === 'component'
            ? planComponentScaffold(rootDir, options.name, options.framework)
            : planTokenScaffold(rootDir, options.name);
        const written = writeFiles(planned, { force: options.force, dryRun: options.dryRun });
        const what = type === 'component' ? `${options.framework} component` : 'token';
        console.log(
          options.dryRun
            ? chalk.yellow(`[DRY RUN] Would scaffold ${what} '${options.name}' in ${rootDir}:`)
            : chalk.green(`✓ Scaffolded ${what} '${options.name}' in ${rootDir}:`),
        );
        reportWritten(written, !!options.dryRun, rootDir);
      }),
    );

  // -------------------------------------------------------------- validate
  program
    .command('validate')
    .description('Validate design system tokens and components (from the API, or a local JSON file)')
    .addOption(new Option('-t, --type <type>', 'Type to validate').choices(['tokens', 'components', 'all']).default('all'))
    .option('-f, --file <file>', 'Local JSON file to validate instead of the API')
    .action(
      run(async (options: { type: 'tokens' | 'components' | 'all'; file?: string }) => {
        if (options.file) validateFile(options.file);
        else await validateSystem(options.type);
      }),
    );

  // --------------------------------------------------------------- migrate
  program
    .command('migrate')
    .description("Write a component's current source from the API (GET /components/:id) into the project")
    .requiredOption('-c, --component <id>', 'Component ID to migrate')
    .addOption(new Option('--framework <framework>', 'Which code to write').choices(['vue', 'react', 'html']).default('vue'))
    .option('-d, --dir <dir>', 'Target project directory', '.')
    .option('--from <version>', 'Source version (informational: the API has no versioned migration endpoint)')
    .option('--to <version>', 'Target version (informational: the API only serves the current version)')
    .option('--force', 'Overwrite existing files')
    .option('--dry-run', 'Show what would be written without writing anything')
    .action(
      run(async (options: { component: string; framework: CodeFormat; dir: string; from?: string; to?: string; force?: boolean; dryRun?: boolean }) => {
        const api = getAPI();
        const component = await api.component(options.component);
        const code = component.code?.[options.framework];
        if (!code) {
          throw new CliError(`Component '${options.component}' has no ${options.framework} code in the API`);
        }
        const rootDir = path.resolve(options.dir);

        console.log(chalk.bold(`\nMigrating ${component.name} (${options.component})`));
        if (options.from || options.to) {
          console.log(
            chalk.yellow(
              `Note: the API has no versioned migration endpoint, so --from/--to are not applied; ` +
                `writing the component's current ${options.framework} source.`,
            ),
          );
        }
        const planned = planComponentCode(rootDir, options.component, options.framework, code);
        const written = writeFiles(planned, { force: options.force, dryRun: options.dryRun });
        console.log(options.dryRun ? chalk.yellow('\n[DRY RUN] Would write:') : chalk.green('\n✓ Migration written:'));
        reportWritten(written, !!options.dryRun, rootDir);
      }),
    );

  return program;
}

async function validateSystem(type: 'tokens' | 'components' | 'all'): Promise<void> {
  const api = getAPI();
  const errors: string[] = [];

  if (type === 'tokens' || type === 'all') {
    try {
      const { tokens } = await api.tokens();
      for (const token of tokens) {
        if (!token.name || !token.value || !token.type) errors.push(`Invalid token: ${token.name || 'unknown'}`);
      }
      console.log(chalk.green(`✓ Validated ${tokens.length} tokens`));
    } catch (error) {
      errors.push(`Token validation error: ${describeError(error)}`);
    }
  }

  if (type === 'components' || type === 'all') {
    try {
      const { components } = await api.components();
      for (const component of components) {
        if (!component.id || !component.name) errors.push(`Invalid component: ${component.id || 'unknown'}`);
      }
      console.log(chalk.green(`✓ Validated ${components.length} components`));
    } catch (error) {
      errors.push(`Component validation error: ${describeError(error)}`);
    }
  }

  if (errors.length > 0) {
    throw new CliError(`Found ${errors.length} validation errors:\n${errors.map((e) => `  - ${e}`).join('\n')}`);
  }
  console.log(chalk.green('\n✓ All validations passed'));
}

function validateFile(filePath: string): void {
  if (!fs.existsSync(filePath)) throw new CliError(`File not found: ${filePath}`);

  const data: unknown = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new CliError('File must contain a JSON object');
  }
  console.log(chalk.green(`✓ File '${filePath}' is valid JSON`));

  const record = data as Record<string, unknown>;
  const looksLikeTokens =
    'tokens' in record ||
    Object.values(record).some((v) => !!v && typeof v === 'object' && 'value' in (v as Record<string, unknown>));
  if (looksLikeTokens) console.log(chalk.green(`✓ File appears to contain valid token structure`));
}

if (require.main === module) {
  createProgram()
    .parseAsync(process.argv)
    .catch((error: unknown) => {
      console.error(chalk.red(`Error: ${describeError(error)}`));
      process.exitCode = 1;
    });
}
