import * as fs from 'fs';
import * as path from 'path';

export interface PlannedFile {
  /** Absolute path */
  path: string;
  content: string;
}

export class FileConflictError extends Error {
  constructor(public readonly existing: string[]) {
    super(
      `Refusing to overwrite existing file(s):\n${existing.map((f) => `  - ${f}`).join('\n')}\nRe-run with --force to overwrite.`,
    );
  }
}

/**
 * Writes every planned file, or none: if any target already exists and
 * `force` is not set, nothing is written and a FileConflictError is thrown.
 */
export function writeFiles(files: PlannedFile[], options: { force?: boolean; dryRun?: boolean } = {}): string[] {
  const existing = files.filter((f) => fs.existsSync(f.path)).map((f) => f.path);
  if (existing.length > 0 && !options.force) {
    throw new FileConflictError(existing);
  }
  if (options.dryRun) return files.map((f) => f.path);
  for (const file of files) {
    fs.mkdirSync(path.dirname(file.path), { recursive: true });
    fs.writeFileSync(file.path, file.content);
  }
  return files.map((f) => f.path);
}

const COMPONENT_NAME = /^[A-Za-z][A-Za-z0-9_-]*$/;
const TOKEN_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

export function assertComponentName(name: string): void {
  if (!COMPONENT_NAME.test(name)) {
    throw new Error(`Invalid component name '${name}'. Use letters, digits, '-' or '_', starting with a letter.`);
  }
}

export function assertTokenName(name: string): void {
  if (!TOKEN_NAME.test(name)) {
    throw new Error(`Invalid token name '${name}'. Use letters, digits, '.', '-' or '_'.`);
  }
}

/** my-button / my_button / myButton -> MyButton */
export function pascalCase(name: string): string {
  return name
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

/** MyButton / my_button -> my-button */
export function kebabCase(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/_/g, '-')
    .toLowerCase();
}

export type Framework = 'vue' | 'react';

export function planComponentScaffold(rootDir: string, name: string, framework: Framework): PlannedFile[] {
  assertComponentName(name);
  const componentName = pascalCase(name);
  const cssClass = kebabCase(name);
  const dir = path.resolve(rootDir, 'src', 'components', name);

  if (framework === 'vue') {
    return [
      {
        path: path.join(dir, `${componentName}.vue`),
        content: `<template>
  <div class="${cssClass}">
    <!-- Component content -->
  </div>
</template>

<script setup>
// Component logic
</script>

<style scoped>
.${cssClass} {
  /* Component styles */
}
</style>
`,
      },
      {
        path: path.join(dir, `${componentName}.test.js`),
        content: `import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ${componentName} from './${componentName}.vue';

describe('${componentName}', () => {
  it('renders correctly', () => {
    const wrapper = mount(${componentName});
    expect(wrapper.exists()).toBe(true);
  });
});
`,
      },
    ];
  }

  return [
    {
      path: path.join(dir, `${componentName}.jsx`),
      content: `import React from 'react';

export const ${componentName} = () => {
  return (
    <div className="${cssClass}">
      {/* Component content */}
    </div>
  );
};
`,
    },
    {
      path: path.join(dir, `${componentName}.test.jsx`),
      content: `import React from 'react';
import { render } from '@testing-library/react';
import { ${componentName} } from './${componentName}';

describe('${componentName}', () => {
  it('renders correctly', () => {
    const { container } = render(<${componentName} />);
    expect(container.querySelector('.${cssClass}')).not.toBeNull();
  });
});
`,
    },
  ];
}

export function planTokenScaffold(rootDir: string, name: string): PlannedFile[] {
  assertTokenName(name);
  const template = {
    [name]: {
      value: '#000000',
      type: 'color',
      category: 'colors',
      description: 'Token description',
    },
  };
  return [
    {
      path: path.resolve(rootDir, 'tokens', `${name}.json`),
      content: JSON.stringify(template, null, 2) + '\n',
    },
  ];
}

export type CodeFormat = 'vue' | 'react' | 'html';

const CODE_EXTENSIONS: Record<CodeFormat, string> = { vue: 'vue', react: 'jsx', html: 'html' };

/** Plans the component source file `ds migrate` writes from the API's current code. */
export function planComponentCode(rootDir: string, componentId: string, format: CodeFormat, code: string): PlannedFile[] {
  assertComponentName(componentId);
  const dir = path.resolve(rootDir, 'src', 'components', componentId);
  return [
    {
      path: path.join(dir, `${pascalCase(componentId)}.${CODE_EXTENSIONS[format]}`),
      content: code.endsWith('\n') ? code : code + '\n',
    },
  ];
}
