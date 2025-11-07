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

program.parse();
