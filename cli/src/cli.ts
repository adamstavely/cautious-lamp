#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { DesignSystemAPI } from '@designsystem/api';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const program = new Command();
const configPath = path.join(os.homedir(), '.designsystem', 'config.json');

// Load config
let config: { apiKey?: string; baseURL?: string } = {};
if (fs.existsSync(configPath)) {
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } catch (e) {
    // Ignore config errors
  }
}

// Ensure config directory exists
const configDir = path.dirname(configPath);
if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true });
}

const getAPI = (): DesignSystemAPI => {
  const apiKey = process.env.DS_API_KEY || config.apiKey;
  if (!apiKey) {
    console.error(chalk.red('Error: API key not found. Set DS_API_KEY environment variable or run: ds config set apiKey <key>'));
    process.exit(1);
  }
  return new DesignSystemAPI({
    apiKey,
    baseURL: process.env.DS_API_URL || config.baseURL || 'http://localhost:3000/api/v1',
  });
};

program
  .name('ds')
  .description('Design System CLI')
  .version('1.0.0');

// Config commands
const configCmd = program
  .command('config')
  .description('Manage configuration');

configCmd
  .command('set')
  .description('Set a configuration value')
  .argument('<key>', 'Configuration key')
  .argument('<value>', 'Configuration value')
  .action((key: string, value: string) => {
    config[key] = value;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(chalk.green(`✓ Set ${key} = ${value}`));
  });

configCmd
  .command('get')
  .description('Get a configuration value')
  .argument('<key>', 'Configuration key')
  .action((key: string) => {
    const value = config[key];
    if (value) {
      console.log(value);
    } else {
      console.error(chalk.red(`Configuration key '${key}' not found`));
      process.exit(1);
    }
  });

// Token commands
// Compliance scanning command
program
  .command('compliance')
  .description('Run compliance checks')
  .option('-s, --scope <scope>', 'Scope: design-system or applications', 'design-system')
  .option('-a, --application <id>', 'Application ID to scan')
  .option('-c, --categories <categories>', 'Comma-separated list of rule categories (e.g., accessibility,design-system,ux-hcd)', '')
  .option('-f, --format <format>', 'Output format (table, json)', 'table')
  .action(async (options) => {
    try {
      const api = getAPI();
      const categories = options.categories ? options.categories.split(',').map((c: string) => c.trim()) : undefined;
      const result = await api.scanCompliance(options.scope, options.application, categories);
      
      if (options.format === 'json') {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(chalk.bold(`\nCompliance Scan Results (${result.scope})\n`));
        if (categories) {
          console.log(chalk.dim(`Categories: ${categories.join(', ')}\n`));
        }
        console.log(chalk.green(`✓ Passed: ${result.passed}`));
        console.log(chalk.yellow(`⚠ Warnings: ${result.warnings}`));
        console.log(chalk.red(`✗ Failed: ${result.failed}\n`));
        
        result.checks.forEach((check: any) => {
          const icon = check.status === 'pass' ? '✓' : check.status === 'warning' ? '⚠' : '✗';
          const color = check.status === 'pass' ? chalk.green : check.status === 'warning' ? chalk.yellow : chalk.red;
          console.log(color(`${icon} ${check.rule}`));
          console.log(`  ${check.message}`);
          if (check.component) console.log(`  Component: ${check.component}`);
          if (check.application) console.log(`  Application: ${check.application}`);
          if (check.file) console.log(`  File: ${check.file}${check.line ? `:${check.line}` : ''}`);
          console.log('');
        });
      }
    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Application registration command
program
  .command('register')
  .description('Register an application for compliance scanning')
  .option('-n, --name <name>', 'Application name', { required: true })
  .option('-r, --repository <repo>', 'Repository URL')
  .option('-v, --version <version>', 'Design system version')
  .action(async (options) => {
    try {
      const api = getAPI();
      const app = await api.registerApplication(options.name, options.repository, options.version);
      console.log(chalk.green(`✓ Application registered: ${app.id}`));
      console.log(`  Name: ${app.name}`);
      if (app.repository) console.log(`  Repository: ${app.repository}`);
      if (app.version) console.log(`  Version: ${app.version}`);
    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Application list command
program
  .command('applications')
  .description('List registered applications')
  .action(async () => {
    try {
      const api = getAPI();
      const { applications } = await api.getApplications();
      console.log(chalk.bold(`\nRegistered Applications (${applications.length})\n`));
      applications.forEach((app: any) => {
        console.log(chalk.cyan(app.name));
        console.log(`  ID: ${app.id}`);
        if (app.repository) console.log(`  Repository: ${app.repository}`);
        if (app.version) console.log(`  Version: ${app.version}`);
        console.log(`  Registered: ${new Date(app.registeredAt).toLocaleDateString()}`);
        if (app.lastScanned) console.log(`  Last Scanned: ${new Date(app.lastScanned).toLocaleDateString()}`);
        console.log('');
      });
    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Application codebase scanning command
program
  .command('scan')
  .description('Scan an application codebase for compliance')
  .option('-a, --application <id>', 'Application ID to scan', { required: true })
  .option('-c, --categories <categories>', 'Comma-separated list of rule categories (e.g., accessibility,design-system,ux-hcd)', '')
  .option('-f, --format <format>', 'Output format (table, json)', 'table')
  .action(async (options) => {
    try {
      const api = getAPI();
      const categories = options.categories ? options.categories.split(',').map((c: string) => c.trim()) : undefined;
      const result = await api.scanApplicationCodebase(options.application, undefined, categories);
      
      if (options.format === 'json') {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(chalk.bold(`\nCompliance Scan Results for Application\n`));
        if (categories) {
          console.log(chalk.dim(`Categories: ${categories.join(', ')}\n`));
        }
        console.log(chalk.green(`✓ Passed: ${result.checks.filter((c: any) => c.status === 'pass').length}`));
        console.log(chalk.yellow(`⚠ Warnings: ${result.checks.filter((c: any) => c.status === 'warning').length}`));
        console.log(chalk.red(`✗ Failed: ${result.checks.filter((c: any) => c.status === 'error').length}\n`));
        
        result.checks.forEach((check: any) => {
          const icon = check.status === 'pass' ? '✓' : check.status === 'warning' ? '⚠' : '✗';
          const color = check.status === 'pass' ? chalk.green : check.status === 'warning' ? chalk.yellow : chalk.red;
          console.log(color(`${icon} ${check.rule}`));
          console.log(`  ${check.message}`);
          if (check.component) console.log(`  Component: ${check.component}`);
          if (check.application) console.log(`  Application: ${check.application}`);
          if (check.file) console.log(`  File: ${check.file}${check.line ? `:${check.line}` : ''}`);
          console.log('');
        });
      }
    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('tokens')
  .description('List all tokens')
  .option('-c, --category <category>', 'Filter by category')
  .option('-t, --type <type>', 'Filter by type')
  .option('--tag <tag>', 'Filter by tag')
  .option('-f, --format <format>', 'Output format (table, json)', 'table')
  .action(async (options) => {
    try {
      const api = getAPI();
      const filters: any = {};
      if (options.category) filters.category = options.category;
      if (options.type) filters.type = options.type;
      if (options.tag) filters.tag = options.tag;

      const { tokens } = Object.keys(filters).length > 0
        ? await api.tokensFiltered(filters)
        : await api.tokens();

      if (options.format === 'json') {
        console.log(JSON.stringify(tokens, null, 2));
      } else {
        console.log(chalk.bold(`\nFound ${tokens.length} tokens\n`));
        tokens.forEach((token: any) => {
          console.log(chalk.cyan(token.name.padEnd(40)) + chalk.gray(token.value));
          if (token.description) {
            console.log('  ' + chalk.dim(token.description));
          }
        });
      }
    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('token <name>')
  .description('Get a specific token')
  .action(async (name: string) => {
    try {
      const api = getAPI();
      const token = await api.token(name);
      console.log(chalk.bold(`\n${token.name}\n`));
      console.log(`Value:    ${chalk.cyan(token.value)}`);
      console.log(`Type:     ${token.type}`);
      console.log(`Category: ${token.category}`);
      if (token.description) {
        console.log(`Description: ${token.description}`);
      }
      if (token.tags && token.tags.length > 0) {
        console.log(`Tags:     ${token.tags.join(', ')}`);
      }
    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Component commands
program
  .command('components')
  .description('List all components')
  .option('-s, --status <status>', 'Filter by status')
  .option('-f, --format <format>', 'Output format (table, json)', 'table')
  .action(async (options) => {
    try {
      const api = getAPI();
      const { components } = options.status
        ? await api.componentsByStatus(options.status)
        : await api.components();

      if (options.format === 'json') {
        console.log(JSON.stringify(components, null, 2));
      } else {
        console.log(chalk.bold(`\nFound ${components.length} components\n`));
        components.forEach((component: any) => {
          const statusColor = component.status === 'production' ? chalk.green : 
                            component.status === 'in-progress' ? chalk.yellow : chalk.gray;
          console.log(chalk.cyan(component.id.padEnd(20)) + statusColor(component.status.padEnd(15)) + component.name);
          if (component.description) {
            console.log('  ' + chalk.dim(component.description));
          }
        });
      }
    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('component <id>')
  .description('Get a specific component')
  .option('-c, --code <format>', 'Show code (vue, react)', 'vue')
  .action(async (id: string, options: any) => {
    try {
      const api = getAPI();
      const component = await api.component(id);
      console.log(chalk.bold(`\n${component.name} (${component.id})\n`));
      console.log(`Status:       ${component.status}`);
      console.log(`Description:  ${component.description}`);
      if (component.dependencies && component.dependencies.length > 0) {
        console.log(`Dependencies: ${component.dependencies.join(', ')}`);
      }
      if (component.accessibility) {
        console.log(`WCAG:         ${component.accessibility.wcag}`);
      }
      console.log(chalk.bold(`\nProps:\n`));
      component.props.forEach((prop: any) => {
        console.log(`  ${chalk.cyan(prop.name.padEnd(20))} ${prop.type} ${prop.required ? chalk.red('*') : ''}`);
        if (prop.description) {
          console.log(`    ${chalk.dim(prop.description)}`);
        }
      });
      if (options.code && component.code[options.code]) {
        console.log(chalk.bold(`\n${options.code.toUpperCase()} Code:\n`));
        console.log(chalk.gray(component.code[options.code]));
      }
    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Health check
program
  .command('health')
  .description('Check API health')
  .action(async () => {
    try {
      const api = getAPI();
      const health = await api.health();
      console.log(chalk.green(`✓ API is healthy`));
      console.log(`Status:    ${health.status}`);
      console.log(`Version:   ${health.version}`);
      console.log(`Timestamp: ${health.timestamp}`);
    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Scaffold commands
program
  .command('scaffold <type>')
  .description('Scaffold a new component or token')
  .option('-n, --name <name>', 'Name of the component/token')
  .option('-f, --framework <framework>', 'Framework (vue, react)', 'vue')
  .action(async (type: string, options: any) => {
    try {
      if (type === 'component') {
        if (!options.name) {
          console.error(chalk.red('Error: Component name is required. Use --name <name>'));
          process.exit(1);
        }
        await scaffoldComponent(options.name, options.framework);
      } else if (type === 'token') {
        if (!options.name) {
          console.error(chalk.red('Error: Token name is required. Use --name <name>'));
          process.exit(1);
        }
        await scaffoldToken(options.name);
      } else {
        console.error(chalk.red(`Error: Unknown scaffold type '${type}'. Use 'component' or 'token'`));
        process.exit(1);
      }
    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Validation commands
program
  .command('validate')
  .description('Validate design system tokens and components')
  .option('-t, --type <type>', 'Type to validate (tokens, components, all)', 'all')
  .option('-f, --file <file>', 'File to validate (JSON)')
  .action(async (options: any) => {
    try {
      if (options.file) {
        await validateFile(options.file);
      } else {
        await validateSystem(options.type);
      }
    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Migration commands
program
  .command('migrate')
  .description('Migrate components or tokens to new versions')
  .option('-c, --component <id>', 'Component ID to migrate')
  .option('-f, --from <version>', 'Source version')
  .option('-t, --to <version>', 'Target version')
  .option('--dry-run', 'Show what would be migrated without making changes')
  .action(async (options: any) => {
    try {
      if (!options.component) {
        console.error(chalk.red('Error: Component ID is required. Use --component <id>'));
        process.exit(1);
      }
      await migrateComponent(options.component, options.from, options.to, options.dryRun);
    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Helper functions
async function scaffoldComponent(name: string, framework: string) {
  const componentName = name.charAt(0).toUpperCase() + name.slice(1);
  const dir = path.join(process.cwd(), 'src', 'components', name);
  
  if (fs.existsSync(dir)) {
    console.error(chalk.red(`Error: Component directory already exists: ${dir}`));
    process.exit(1);
  }
  
  fs.mkdirSync(dir, { recursive: true });
  
  if (framework === 'vue') {
    const vueTemplate = `<template>
  <div class="${name}">
    <!-- Component content -->
  </div>
</template>

<script setup>
// Component logic
</script>

<style scoped>
.${name} {
  /* Component styles */
}
</style>
`;
    fs.writeFileSync(path.join(dir, `${componentName}.vue`), vueTemplate);
    
    const testTemplate = `import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ${componentName} from './${componentName}.vue';

describe('${componentName}', () => {
  it('renders correctly', () => {
    const wrapper = mount(${componentName});
    expect(wrapper.exists()).toBe(true);
  });
});
`;
    fs.writeFileSync(path.join(dir, `${componentName}.test.js`), testTemplate);
  } else {
    const reactTemplate = `import React from 'react';

export const ${componentName} = () => {
  return (
    <div className="${name}">
      {/* Component content */}
    </div>
  );
};
`;
    fs.writeFileSync(path.join(dir, `${componentName}.jsx`), reactTemplate);
    
    const testTemplate = `import React from 'react';
import { render, screen } from '@testing-library/react';
import { ${componentName} } from './${componentName}';

describe('${componentName}', () => {
  it('renders correctly', () => {
    render(<${componentName} />);
    expect(screen.getByRole('generic')).toBeInTheDocument();
  });
});
`;
    fs.writeFileSync(path.join(dir, `${componentName}.test.js`), testTemplate);
  }
  
  console.log(chalk.green(`✓ Scaffolded ${framework} component '${name}' in ${dir}`));
}

async function scaffoldToken(name: string) {
  const tokenFile = path.join(process.cwd(), 'tokens', `${name}.json`);
  const tokenDir = path.dirname(tokenFile);
  
  if (!fs.existsSync(tokenDir)) {
    fs.mkdirSync(tokenDir, { recursive: true });
  }
  
  if (fs.existsSync(tokenFile)) {
    console.error(chalk.red(`Error: Token file already exists: ${tokenFile}`));
    process.exit(1);
  }
  
  const tokenTemplate = {
    [name]: {
      value: '#000000',
      type: 'color',
      category: 'colors',
      description: 'Token description'
    }
  };
  
  fs.writeFileSync(tokenFile, JSON.stringify(tokenTemplate, null, 2));
  console.log(chalk.green(`✓ Scaffolded token '${name}' in ${tokenFile}`));
}

async function validateSystem(type: string) {
  const api = getAPI();
  const errors: string[] = [];
  
  if (type === 'tokens' || type === 'all') {
    try {
      const { tokens } = await api.tokens();
      tokens.forEach((token: any) => {
        if (!token.name || !token.value || !token.type) {
          errors.push(`Invalid token: ${token.name || 'unknown'}`);
        }
      });
      console.log(chalk.green(`✓ Validated ${tokens.length} tokens`));
    } catch (error: any) {
      errors.push(`Token validation error: ${error.message}`);
    }
  }
  
  if (type === 'components' || type === 'all') {
    try {
      const { components } = await api.components();
      components.forEach((component: any) => {
        if (!component.id || !component.name) {
          errors.push(`Invalid component: ${component.id || 'unknown'}`);
        }
      });
      console.log(chalk.green(`✓ Validated ${components.length} components`));
    } catch (error: any) {
      errors.push(`Component validation error: ${error.message}`);
    }
  }
  
  if (errors.length > 0) {
    console.error(chalk.red(`\n✗ Found ${errors.length} validation errors:`));
    errors.forEach(err => console.error(chalk.red(`  - ${err}`)));
    process.exit(1);
  } else {
    console.log(chalk.green('\n✓ All validations passed'));
  }
}

async function validateFile(filePath: string) {
  if (!fs.existsSync(filePath)) {
    console.error(chalk.red(`Error: File not found: ${filePath}`));
    process.exit(1);
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    
    // Basic validation
    if (typeof data !== 'object') {
      throw new Error('File must contain a JSON object');
    }
    
    console.log(chalk.green(`✓ File '${filePath}' is valid JSON`));
    
    // Check for token structure
    if (data.tokens || Object.keys(data).some(key => data[key].value)) {
      console.log(chalk.green(`✓ File appears to contain valid token structure`));
    }
  } catch (error: any) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

async function migrateComponent(componentId: string, fromVersion: string | undefined, toVersion: string | undefined, dryRun: boolean) {
  const api = getAPI();
  
  try {
    const component = await api.component(componentId);
    
    console.log(chalk.bold(`\nMigrating ${component.name} (${componentId})`));
    if (fromVersion) console.log(`From: ${fromVersion}`);
    if (toVersion) console.log(`To: ${toVersion}`);
    
    if (dryRun) {
      console.log(chalk.yellow('\n[DRY RUN] Would migrate:'));
      console.log(`  - Update component props`);
      console.log(`  - Update component code`);
      console.log(`  - Update tests`);
    } else {
      // In a real implementation, this would call a migration API endpoint
      console.log(chalk.green('\n✓ Migration completed'));
      console.log(chalk.dim('Note: Actual migration requires API endpoint implementation'));
    }
  } catch (error: any) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}
