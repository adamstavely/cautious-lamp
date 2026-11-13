import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { Component, DesignSystemService } from '../design-system/design-system.service';

export interface ComponentTemplate {
  id: string;
  name: string;
  description: string;
  category: 'form' | 'display' | 'navigation' | 'feedback' | 'layout' | 'data' | 'custom';
  defaultProps: ComponentProp[];
  defaultStyles: ComponentStyles;
  defaultSlots: string[];
}

export interface ComponentProp {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'function' | 'date' | 'enum';
  defaultValue?: any;
  required?: boolean;
  options?: string[];
  description?: string;
  reflect?: boolean; // For Stencil.js @Prop({ reflect: true })
  mutable?: boolean; // For Stencil.js @Prop({ mutable: true })
}

export interface ComponentEvent {
  name: string;
  detail?: string; // TypeScript type for event detail
  bubbles?: boolean;
  cancelable?: boolean;
  composed?: boolean;
  description?: string;
}

export interface ComponentMethod {
  name: string;
  returnType?: string;
  parameters?: Array<{ name: string; type: string }>;
  description?: string;
}

export interface ComponentStyles {
  colors?: {
    background?: string;
    text?: string;
    border?: string;
  };
  typography?: {
    fontFamily?: string;
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
  };
  spacing?: {
    padding?: string;
    margin?: string;
    gap?: string;
  };
  border?: {
    radius?: string;
    width?: string;
    style?: string;
  };
  shadow?: string;
}

export interface ComponentScaffoldInput {
  name: string;
  description: string;
  templateId?: string;
  category: string;
  props: ComponentProp[];
  events?: ComponentEvent[];
  methods?: ComponentMethod[];
  slots?: string[];
  styles?: ComponentStyles;
  accessibility?: {
    ariaLabel?: string;
    ariaDescribedBy?: string;
    role?: string;
  };
  status?: 'production' | 'in-progress' | 'planned' | 'deprecated' | 'experimental';
}

export interface GeneratedComponent {
  componentCode: string;
  styleCode: string;
  testCode: string;
  documentation: string;
  readme: string;
  stencilConfig?: string;
}

export interface GeneratedFile {
  path: string;
  content: string;
}

export interface CreatedComponentResult {
  success: true;
  componentId: string;
  /** The component as registered in the design-system component list */
  component: Component;
  /** Generated source files; nothing is written on the server */
  files: GeneratedFile[];
}

const COMPONENT_NAME_PATTERN = /^[A-Za-z][A-Za-z0-9 _-]*$/;
const IDENTIFIER_PATTERN = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const DESIGN_SYSTEM_STATUSES = ['production', 'in-progress', 'planned', 'deprecated'] as const;

@Injectable()
export class ComponentScaffoldingService {
  private templates: ComponentTemplate[] = [];

  constructor(private readonly designSystemService: DesignSystemService) {
    this.initializeTemplates();
  }

  private initializeTemplates() {
    this.templates = [
      {
        id: 'button',
        name: 'Button',
        description: 'Interactive button component with variants and states',
        category: 'form',
        defaultProps: [
          { name: 'variant', type: 'enum', defaultValue: 'primary', options: ['primary', 'secondary', 'tertiary'], required: false, description: 'Button style variant' },
          { name: 'size', type: 'enum', defaultValue: 'md', options: ['sm', 'md', 'lg'], required: false, description: 'Button size' },
          { name: 'disabled', type: 'boolean', defaultValue: false, required: false, description: 'Whether the button is disabled' },
          { name: 'loading', type: 'boolean', defaultValue: false, required: false, description: 'Whether the button is in loading state' },
        ],
        defaultStyles: {
          colors: { background: '#4f46e5', text: '#ffffff' },
          typography: { fontFamily: 'Inter, sans-serif', fontSize: '1rem', fontWeight: '500' },
          spacing: { padding: '0.5rem 1rem' },
          border: { radius: '0.5rem' },
        },
        defaultSlots: ['default'],
      },
      {
        id: 'input',
        name: 'Input',
        description: 'Text input field with validation and states',
        category: 'form',
        defaultProps: [
          { name: 'type', type: 'enum', defaultValue: 'text', options: ['text', 'email', 'password', 'number', 'tel', 'url'], required: false },
          { name: 'placeholder', type: 'string', defaultValue: '', required: false },
          { name: 'value', type: 'string', defaultValue: '', required: false, mutable: true },
          { name: 'disabled', type: 'boolean', defaultValue: false, required: false },
          { name: 'required', type: 'boolean', defaultValue: false, required: false },
          { name: 'readonly', type: 'boolean', defaultValue: false, required: false },
        ],
        defaultStyles: {
          colors: { background: '#ffffff', text: '#111827', border: '#d1d5db' },
          spacing: { padding: '0.5rem 0.75rem' },
          border: { radius: '0.5rem', width: '1px' },
        },
        defaultSlots: [],
      },
      {
        id: 'card',
        name: 'Card',
        description: 'Container component for grouping related content',
        category: 'layout',
        defaultProps: [
          { name: 'elevation', type: 'enum', defaultValue: 'md', options: ['sm', 'md', 'lg'], required: false },
          { name: 'padding', type: 'enum', defaultValue: 'md', options: ['sm', 'md', 'lg'], required: false },
        ],
        defaultStyles: {
          colors: { background: '#ffffff' },
          border: { radius: '0.75rem' },
          shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        },
        defaultSlots: ['header', 'default', 'footer'],
      },
      {
        id: 'modal',
        name: 'Modal',
        description: 'Dialog component for overlaying content',
        category: 'feedback',
        defaultProps: [
          { name: 'open', type: 'boolean', defaultValue: false, required: false, mutable: true },
          { name: 'closable', type: 'boolean', defaultValue: true, required: false },
          { name: 'size', type: 'enum', defaultValue: 'md', options: ['sm', 'md', 'lg', 'xl'], required: false },
        ],
        defaultStyles: {
          colors: { background: '#ffffff' },
          border: { radius: '0.75rem' },
          shadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        },
        defaultSlots: ['header', 'default', 'footer'],
      },
    ];
  }

  getTemplates(): ComponentTemplate[] {
    return this.templates;
  }

  getTemplate(id: string): ComponentTemplate | null {
    return this.templates.find(t => t.id === id) || null;
  }

  async scaffoldComponent(rawInput: ComponentScaffoldInput): Promise<GeneratedComponent> {
    const input = this.normalizeInput(rawInput);
    const componentCode = this.generateStencilComponent(input);
    const styleCode = this.generateStyleSheet(input);
    const testCode = this.generateTests(input);
    const documentation = this.generateDocumentation(input);
    const readme = this.generateReadme(input);
    const stencilConfig = this.generateStencilConfig(input);

    return {
      componentCode,
      styleCode,
      testCode,
      documentation,
      readme,
      stencilConfig,
    };
  }

  private generateStencilComponent(input: ComponentScaffoldInput): string {
    const className = this.toPascalCase(input.name);
    const tagName = this.toKebabCase(input.name);
    const props = this.generateProps(input.props);
    const events = this.generateEvents(input.events || []);
    const methods = this.generateMethods(input.methods || []);
    const slots = this.generateSlots(input.slots || []);
    const accessibility = this.generateAccessibility(input.accessibility);

    const ariaLabelAttr = accessibility.ariaLabel ? `aria-label="${input.accessibility?.ariaLabel}"` : '';
    const roleAttr = accessibility.role ? `role="${input.accessibility?.role}"` : '';
    const attrs = [ariaLabelAttr, roleAttr].filter(Boolean).join(' ');

    return `import { Component, Prop, Event, EventEmitter, Method, h } from '@stencil/core';

/**
 * ${input.description}
 * 
 * @component ${tagName}
 * @category ${input.category}
 */
@Component({
  tag: '${tagName}',
  styleUrl: '${tagName}.css',
  shadow: true,
})
export class ${className} {
${props}

${events}

${methods}

  /**
   * Render the component
   */
  render() {
    return (
      <div
        class="${tagName}"
        ${attrs}
      >
        ${slots}
      </div>
    );
  }
}`;
  }

  private generateProps(props: ComponentProp[]): string {
    if (props.length === 0) return '';

    return props.map(prop => {
      const decoratorOptions: string[] = [];
      
      if (prop.reflect) decoratorOptions.push('reflect: true');
      if (prop.mutable) decoratorOptions.push('mutable: true');
      
      const decorator = decoratorOptions.length > 0 
        ? `@Prop({ ${decoratorOptions.join(', ')} })`
        : '@Prop()';
      
      const typeScriptType = this.getTypeScriptType(prop.type, prop.options);
      const defaultValue = prop.defaultValue !== undefined 
        ? ` = ${this.formatDefaultValue(prop.defaultValue, prop.type)}`
        : '';
      
      const comment = prop.description 
        ? `  /**\n   * ${prop.description}\n   */\n`
        : '';

      return `${comment}  ${decorator}\n  ${prop.name}${prop.required ? '' : '?'}: ${typeScriptType}${defaultValue};`;
    }).join('\n\n');
  }

  private generateEvents(events: ComponentEvent[]): string {
    if (events.length === 0) return '';

    return events.map(event => {
      const decoratorOptions: string[] = [];
      if (event.bubbles !== undefined) decoratorOptions.push(`bubbles: ${event.bubbles}`);
      if (event.cancelable !== undefined) decoratorOptions.push(`cancelable: ${event.cancelable}`);
      if (event.composed !== undefined) decoratorOptions.push(`composed: ${event.composed}`);
      
      const decorator = decoratorOptions.length > 0
        ? `@Event({ ${decoratorOptions.join(', ')} })`
        : '@Event()';
      
      const detailType = event.detail || 'any';
      const comment = event.description 
        ? `  /**\n   * ${event.description}\n   */\n`
        : '';

      return `${comment}  ${decorator}\n  ${event.name}: EventEmitter<${detailType}>;`;
    }).join('\n\n');
  }

  private generateMethods(methods: ComponentMethod[]): string {
    if (methods.length === 0) return '';

    return methods.map(method => {
      const params = method.parameters?.map(p => `${p.name}: ${p.type}`).join(', ') || '';
      const returnType = method.returnType || 'void';
      const comment = method.description 
        ? `  /**\n   * ${method.description}\n   */\n`
        : '';

      return `${comment}  @Method()\n  async ${method.name}(${params}): Promise<${returnType}> {\n    // TODO: Implement method\n    return ${returnType === 'void' ? '' : 'null'};\n  }`;
    }).join('\n\n');
  }

  private generateStyles(styles?: ComponentStyles): string {
    if (!styles) return '';

    const styleLines: string[] = [];
    
    if (styles.colors) {
      Object.entries(styles.colors).forEach(([key, value]) => {
        styleLines.push(`  ${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`);
      });
    }
    
    if (styles.typography) {
      Object.entries(styles.typography).forEach(([key, value]) => {
        styleLines.push(`  ${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`);
      });
    }
    
    if (styles.spacing) {
      Object.entries(styles.spacing).forEach(([key, value]) => {
        styleLines.push(`  ${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`);
      });
    }
    
    if (styles.border) {
      Object.entries(styles.border).forEach(([key, value]) => {
        styleLines.push(`  ${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`);
      });
    }
    
    if (styles.shadow) {
      styleLines.push(`  box-shadow: ${styles.shadow};`);
    }

    return styleLines.length > 0 ? `\n:host {\n${styleLines.join('\n')}\n}` : '';
  }

  private generateSlots(slots: string[]): string {
    if (slots.length === 0) {
      return '<slot></slot>';
    }

    return slots.map(slot => {
      if (slot === 'default') {
        return '<slot></slot>';
      }
      return `<slot name="${slot}"></slot>`;
    }).join('\n        ');
  }

  private generateAccessibility(accessibility?: ComponentScaffoldInput['accessibility']): { ariaLabel?: string; role?: string } {
    return {
      ariaLabel: accessibility?.ariaLabel,
      role: accessibility?.role,
    };
  }

  private generateTests(input: ComponentScaffoldInput): string {
    const className = this.toPascalCase(input.name);
    const tagName = this.toKebabCase(input.name);

    return `import { newSpecPage } from '@stencil/core/testing';
import { ${className} } from './${this.toKebabCase(input.name)}';

describe('${className}', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [${className}],
      html: \`<${tagName}></${tagName}>\`,
    });
    expect(page.root).toEqualHtml(\`
      <${tagName}>
        <mock:shadow-root>
          <div class="${this.toKebabCase(input.name)}">
            <slot></slot>
          </div>
        </mock:shadow-root>
      </${tagName}>
    \`);
  });

${input.props.map(prop => this.generatePropTest(prop, tagName, className)).join('\n\n')}

${input.events?.map(event => this.generateEventTest(event, tagName, className)).join('\n\n') || ''}
});`;
  }

  private generatePropTest(prop: ComponentProp, tagName: string, className: string): string {
    const testValue = this.getTestValue(prop.type, prop.options);
    return `  it('handles ${prop.name} prop', async () => {
    const page = await newSpecPage({
      components: [${className}],
      html: \`<${tagName} ${prop.name}="${testValue}"></${tagName}>\`,
    });
    expect(page.root.${prop.name}).toBe(${this.formatTestValue(testValue, prop.type)});
  });`;
  }

  private generateEventTest(event: ComponentEvent, tagName: string, className: string): string {
    return `  it('emits ${event.name} event', async () => {
    const page = await newSpecPage({
      components: [${className}],
      html: \`<${tagName}></${tagName}>\`,
    });
    const component = page.rootInstance;
    const spy = jest.fn();
    page.doc.addEventListener('${event.name}', spy);
    component.${event.name}.emit();
    expect(spy).toHaveBeenCalled();
  });`;
  }

  private generateDocumentation(input: ComponentScaffoldInput): string {
    const tagName = this.toKebabCase(input.name);
    
    return `# ${input.name}

${input.description}

## Usage

\`\`\`html
<${tagName}></${tagName}>
\`\`\`

## Properties

| Property | Attribute | Description | Type | Default |
|----------|-----------|-------------|------|---------|
${input.props.map(prop => {
  const attribute = prop.reflect ? prop.name : '-';
  return `| \`${prop.name}\` | \`${attribute}\` | ${prop.description || ''} | \`${prop.type}${prop.options ? ` (${prop.options.join(', ')})` : ''}\` | ${prop.defaultValue !== undefined ? `\`${prop.defaultValue}\`` : '-'} |`;
}).join('\n')}

${input.events && input.events.length > 0 ? `## Events

| Event | Description | Type |
|-------|-------------|------|
${input.events.map(event => `| \`${event.name}\` | ${event.description || ''} | \`CustomEvent<${event.detail || 'any'}>\` |`).join('\n')}

` : ''}${input.methods && input.methods.length > 0 ? `## Methods

| Method | Description | Signature |
|--------|-------------|-----------|
${input.methods.map(method => {
  const params = method.parameters?.map(p => `${p.name}: ${p.type}`).join(', ') || '';
  return `| \`${method.name}\` | ${method.description || ''} | \`${method.name}(${params}): Promise<${method.returnType || 'void'}>\` |`;
}).join('\n')}

` : ''}## Accessibility

${input.accessibility?.ariaLabel ? `- **Aria Label**: ${input.accessibility.ariaLabel}` : ''}
${input.accessibility?.role ? `- **Role**: ${input.accessibility.role}` : ''}

## Examples

### Basic Usage

\`\`\`html
<${tagName}></${tagName}>
\`\`\`

${input.props.length > 0 ? `### With Props

\`\`\`html
<${tagName} ${input.props[0].name}="${input.props[0].defaultValue || ''}"></${tagName}>
\`\`\`

` : ''}## Status

**Status**: ${input.status || 'in-progress'}
`;
  }

  private generateReadme(input: ComponentScaffoldInput): string {
    return `# ${input.name} Component

${input.description}

## Installation

\`\`\`bash
npm install @design-system/${this.toKebabCase(input.name)}
\`\`\`

## Usage

\`\`\`typescript
import '@design-system/${this.toKebabCase(input.name)}';
\`\`\`

\`\`\`html
<${this.toKebabCase(input.name)}></${this.toKebabCase(input.name)}>
\`\`\`

## Framework Integration

### React

\`\`\`tsx
import { ${this.toPascalCase(input.name)} } from '@design-system/${this.toKebabCase(input.name)}/react';

function App() {
  return <${this.toPascalCase(input.name)} />;
}
\`\`\`

### Vue

\`\`\`vue
<template>
  <${this.toKebabCase(input.name)} />
</template>

<script setup>
import '@design-system/${this.toKebabCase(input.name)}';
</script>
\`\`\`

## Properties

See the [documentation](./docs/${this.toKebabCase(input.name)}.md) for full property reference.

## License

MIT
`;
  }

  private generateStencilConfig(input: ComponentScaffoldInput): string {
    return `import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'design-system',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements',
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      serviceWorker: null, // disable service workers
    },
  ],
  globalScript: 'src/global/app.ts',
  globalStyle: 'src/global/app.css',
};`;
  }

  // Utility methods
  private toPascalCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase()
      .split(/[-_\s]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  private toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase()
      .replace(/[-_\s]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private getTypeScriptType(type: string, options?: string[]): string {
    if (options && options.length > 0) {
      return options.map(opt => this.quote(opt)).join(' | ');
    }
    
    const typeMap: Record<string, string> = {
      'string': 'string',
      'number': 'number',
      'boolean': 'boolean',
      'object': 'Record<string, any>',
      'array': 'any[]',
      'function': 'Function',
      'date': 'Date',
      'enum': 'string',
    };
    
    return typeMap[type] || 'any';
  }

  private quote(value: unknown): string {
    return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}'`;
  }

  private formatDefaultValue(value: any, type: string): string {
    if (type === 'string' || type === 'enum') {
      return this.quote(value);
    }
    if (type === 'boolean') {
      return value ? 'true' : 'false';
    }
    if (type === 'number') {
      return String(value);
    }
    if (type === 'array') {
      return JSON.stringify(value);
    }
    if (type === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  }

  private getTestValue(type: string, options?: string[]): string {
    if (options && options.length > 0) {
      return options[0];
    }
    
    const testValues: Record<string, string> = {
      'string': 'test',
      'number': '42',
      'boolean': 'true',
      'date': '2024-01-01',
    };
    
    return testValues[type] || 'test';
  }

  private formatTestValue(value: string, type: string): string {
    if (type === 'string') {
      return `'${value}'`;
    }
    if (type === 'boolean') {
      return value === 'true' ? 'true' : 'false';
    }
    if (type === 'number') {
      return value;
    }
    return `'${value}'`;
  }

  /**
   * Validate the input and fill in optional lists, so generation never sees
   * undefined props/events and the generated code stays syntactically valid.
   */
  private normalizeInput(input: ComponentScaffoldInput): ComponentScaffoldInput {
    if (!input || typeof input !== 'object') {
      throw new BadRequestException('A component definition is required');
    }
    const name = typeof input.name === 'string' ? input.name.trim() : '';
    if (!name || !COMPONENT_NAME_PATTERN.test(name)) {
      throw new BadRequestException(
        'Component name is required and may only contain letters, numbers, spaces, hyphens and underscores, starting with a letter',
      );
    }
    const props = Array.isArray(input.props) ? input.props : [];
    const events = Array.isArray(input.events) ? input.events : [];
    const methods = Array.isArray(input.methods) ? input.methods : [];
    for (const [kind, list] of [['prop', props], ['event', events], ['method', methods]] as const) {
      for (const item of list as Array<{ name?: string }>) {
        if (!item?.name || !IDENTIFIER_PATTERN.test(item.name)) {
          throw new BadRequestException(`Invalid ${kind} name '${item?.name ?? ''}': use a JavaScript identifier`);
        }
      }
    }
    return {
      ...input,
      name,
      description: typeof input.description === 'string' ? input.description : '',
      category: input.category || 'custom',
      props,
      events,
      methods,
      slots: Array.isArray(input.slots) ? input.slots : [],
    };
  }

  /** The stylesheet the generated component's styleUrl points at */
  private generateStyleSheet(input: ComponentScaffoldInput): string {
    const tagName = this.toKebabCase(input.name);
    const hostStyles = this.generateStyles(input.styles);
    return `${hostStyles ? hostStyles.trimStart() : ':host {\n  display: block;\n}'}\n\n.${tagName} {\n  box-sizing: border-box;\n}\n`;
  }

  /** The generated files, laid out as a Stencil project */
  buildFiles(input: ComponentScaffoldInput, generated: GeneratedComponent): GeneratedFile[] {
    const tagName = this.toKebabCase(input.name);
    const dir = `src/components/${tagName}`;
    const files: GeneratedFile[] = [
      { path: `${dir}/${tagName}.tsx`, content: generated.componentCode },
      { path: `${dir}/${tagName}.css`, content: generated.styleCode },
      { path: `${dir}/${tagName}.spec.ts`, content: generated.testCode },
      { path: `docs/${tagName}.md`, content: generated.documentation },
      { path: 'README.md', content: generated.readme },
    ];
    if (generated.stencilConfig) {
      files.push({ path: 'stencil.config.ts', content: generated.stencilConfig });
    }
    return files;
  }

  /**
   * Generate the component and register it in the design-system component
   * list (DesignSystemService.createComponent). Returns the generated files
   * for the client to download; nothing is written to the server filesystem.
   */
  async createComponentFromScaffold(rawInput: ComponentScaffoldInput): Promise<CreatedComponentResult> {
    const input = this.normalizeInput(rawInput);
    const componentId = this.toKebabCase(input.name);
    if (this.designSystemService.getComponentById(componentId)) {
      throw new ConflictException(`A component with id '${componentId}' already exists`);
    }

    const generated = await this.scaffoldComponent(input);
    const files = this.buildFiles(input, generated);

    const status = (DESIGN_SYSTEM_STATUSES as readonly string[]).includes(input.status ?? '')
      ? (input.status as (typeof DESIGN_SYSTEM_STATUSES)[number])
      : 'in-progress';

    const component = this.designSystemService.createComponent({
      id: componentId,
      name: input.name,
      description: input.description,
      status,
      props: input.props.map(prop => ({
        name: prop.name,
        type: prop.type,
        default: prop.defaultValue,
        required: prop.required ?? false,
        options: prop.options,
        description: prop.description,
      })),
      // The scaffold is a Stencil web component; there is no Vue or React source
      code: { vue: '', react: '' },
      dependencies: [],
      examples: [],
      accessibility: input.accessibility?.role || input.accessibility?.ariaLabel
        ? {
            wcag: 'AA',
            notes: [
              input.accessibility?.role ? `role="${input.accessibility.role}"` : '',
              input.accessibility?.ariaLabel ? `aria-label="${input.accessibility.ariaLabel}"` : '',
            ].filter(Boolean).join(', '),
          }
        : undefined,
    });

    return { success: true, componentId, component, files };
  }
}
