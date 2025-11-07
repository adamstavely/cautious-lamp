import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ComplianceScannerService, ScannerContext } from './compliance-scanner.service';
import { ApplicationScannerService, ApplicationScanContext } from './application-scanner.service';

export interface Token {
  name: string;
  value: string;
  type: string;
  category: string;
  description?: string;
  tags?: string[];
}

export interface Component {
  id: string;
  name: string;
  description: string;
  status: 'production' | 'in-progress' | 'planned' | 'deprecated';
  props: ComponentProp[];
  code: {
    vue: string;
    react: string;
    html?: string;
  };
  dependencies?: string[];
  examples?: string[];
  accessibility?: {
    wcag: string;
    notes?: string;
  };
}

export interface ComponentProp {
  name: string;
  type: string;
  default?: any;
  required?: boolean;
  options?: string[];
  description?: string;
}

export interface Application {
  id: string;
  name: string;
  repository?: string;
  version?: string;
  registeredAt: Date;
  lastScanned?: Date;
}

export interface ComplianceCheck {
  id: string;
  rule: string;
  status: 'pass' | 'warning' | 'error';
  message: string;
  component?: string;
  application?: string;
  file?: string;
  line?: number;
}

@Injectable()
export class DesignSystemService {
  private apiKeys = new Map<string, { name: string; createdAt: Date }>();
  private applications = new Map<string, Application>();
  private scannerService: ComplianceScannerService;
  private applicationScanner: ApplicationScannerService;
  
  // Initialize with a default API key for testing
  constructor() {
    this.scannerService = new ComplianceScannerService();
    this.applicationScanner = new ApplicationScannerService();
    this.apiKeys.set('test-api-key-123', { name: 'Default Test Key', createdAt: new Date() });
    
    // Initialize with sample applications (for demonstration)
    this.applications.set('app-1', {
      id: 'app-1',
      name: 'Marketing Site',
      repository: 'https://github.com/company/marketing-site',
      version: '2.1.0',
      registeredAt: new Date('2024-01-15'),
      lastScanned: new Date('2024-01-20')
    });
    this.applications.set('app-2', {
      id: 'app-2',
      name: 'Admin Dashboard',
      repository: 'https://github.com/company/admin-dashboard',
      version: '1.5.3',
      registeredAt: new Date('2024-01-10'),
      lastScanned: new Date('2024-01-18')
    });
    this.applications.set('app-3', {
      id: 'app-3',
      name: 'Mobile App',
      repository: 'https://github.com/company/mobile-app',
      version: '3.0.1',
      registeredAt: new Date('2024-01-05'),
      lastScanned: new Date('2024-01-19')
    });
  }

  validateApiKey(apiKey: string): boolean {
    return this.apiKeys.has(apiKey);
  }

  createApiKey(name: string): string {
    const apiKey = `ds_${this.generateRandomString(32)}`;
    this.apiKeys.set(apiKey, { name, createdAt: new Date() });
    return apiKey;
  }

  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private tokens: Token[] = [
    { name: 'color.primary', value: '#4f46e5', type: 'color', category: 'colors', description: 'Primary brand color', tags: ['brand', 'primary'] },
    { name: 'color.secondary', value: '#6366f1', type: 'color', category: 'colors', description: 'Secondary brand color', tags: ['brand', 'secondary'] },
    { name: 'color.success', value: '#10b981', type: 'color', category: 'colors', description: 'Success state color', tags: ['semantic', 'success'] },
    { name: 'color.error', value: '#ef4444', type: 'color', category: 'colors', description: 'Error state color', tags: ['semantic', 'error'] },
    { name: 'color.warning', value: '#f59e0b', type: 'color', category: 'colors', description: 'Warning state color', tags: ['semantic', 'warning'] },
    { name: 'color.info', value: '#3b82f6', type: 'color', category: 'colors', description: 'Info state color', tags: ['semantic', 'info'] },
    { name: 'color.neutral.50', value: '#f9fafb', type: 'color', category: 'colors', description: 'Neutral color scale 50', tags: ['neutral', 'scale'] },
    { name: 'color.neutral.100', value: '#f3f4f6', type: 'color', category: 'colors', description: 'Neutral color scale 100', tags: ['neutral', 'scale'] },
    { name: 'color.neutral.500', value: '#6b7280', type: 'color', category: 'colors', description: 'Neutral color scale 500', tags: ['neutral', 'scale'] },
    { name: 'color.neutral.900', value: '#111827', type: 'color', category: 'colors', description: 'Neutral color scale 900', tags: ['neutral', 'scale'] },
    { name: 'spacing.xs', value: '0.25rem', type: 'dimension', category: 'spacing', description: 'Extra small spacing', tags: ['spacing', 'xs'] },
    { name: 'spacing.sm', value: '0.5rem', type: 'dimension', category: 'spacing', description: 'Small spacing', tags: ['spacing', 'sm'] },
    { name: 'spacing.md', value: '1rem', type: 'dimension', category: 'spacing', description: 'Medium spacing', tags: ['spacing', 'md'] },
    { name: 'spacing.lg', value: '1.5rem', type: 'dimension', category: 'spacing', description: 'Large spacing', tags: ['spacing', 'lg'] },
    { name: 'spacing.xl', value: '2rem', type: 'dimension', category: 'spacing', description: 'Extra large spacing', tags: ['spacing', 'xl'] },
    { name: 'spacing.2xl', value: '3rem', type: 'dimension', category: 'spacing', description: '2X large spacing', tags: ['spacing', '2xl'] },
    { name: 'typography.fontFamily.primary', value: 'Inter, sans-serif', type: 'fontFamily', category: 'typography', description: 'Primary font family', tags: ['font', 'primary'] },
    { name: 'typography.fontFamily.secondary', value: 'Georgia, serif', type: 'fontFamily', category: 'typography', description: 'Secondary font family', tags: ['font', 'secondary'] },
    { name: 'typography.fontSize.xs', value: '0.75rem', type: 'fontSize', category: 'typography', description: 'Extra small font size', tags: ['font-size', 'xs'] },
    { name: 'typography.fontSize.sm', value: '0.875rem', type: 'fontSize', category: 'typography', description: 'Small font size', tags: ['font-size', 'sm'] },
    { name: 'typography.fontSize.md', value: '1rem', type: 'fontSize', category: 'typography', description: 'Medium font size', tags: ['font-size', 'md'] },
    { name: 'typography.fontSize.lg', value: '1.25rem', type: 'fontSize', category: 'typography', description: 'Large font size', tags: ['font-size', 'lg'] },
    { name: 'typography.fontSize.xl', value: '1.5rem', type: 'fontSize', category: 'typography', description: 'Extra large font size', tags: ['font-size', 'xl'] },
    { name: 'typography.fontWeight.normal', value: '400', type: 'fontWeight', category: 'typography', description: 'Normal font weight', tags: ['font-weight'] },
    { name: 'typography.fontWeight.medium', value: '500', type: 'fontWeight', category: 'typography', description: 'Medium font weight', tags: ['font-weight'] },
    { name: 'typography.fontWeight.bold', value: '700', type: 'fontWeight', category: 'typography', description: 'Bold font weight', tags: ['font-weight'] },
    { name: 'shadow.sm', value: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', type: 'shadow', category: 'shadows', description: 'Small shadow', tags: ['shadow', 'sm'] },
    { name: 'shadow.md', value: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', type: 'shadow', category: 'shadows', description: 'Medium shadow', tags: ['shadow', 'md'] },
    { name: 'shadow.lg', value: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', type: 'shadow', category: 'shadows', description: 'Large shadow', tags: ['shadow', 'lg'] },
    { name: 'shadow.xl', value: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', type: 'shadow', category: 'shadows', description: 'Extra large shadow', tags: ['shadow', 'xl'] },
    { name: 'border.radius.sm', value: '0.25rem', type: 'dimension', category: 'borders', description: 'Small border radius', tags: ['border', 'radius'] },
    { name: 'border.radius.md', value: '0.5rem', type: 'dimension', category: 'borders', description: 'Medium border radius', tags: ['border', 'radius'] },
    { name: 'border.radius.lg', value: '0.75rem', type: 'dimension', category: 'borders', description: 'Large border radius', tags: ['border', 'radius'] },
    { name: 'border.width.thin', value: '1px', type: 'dimension', category: 'borders', description: 'Thin border width', tags: ['border', 'width'] },
    { name: 'border.width.medium', value: '2px', type: 'dimension', category: 'borders', description: 'Medium border width', tags: ['border', 'width'] },
  ];

  private components: Component[] = [
    {
      id: 'button',
      name: 'Button',
      description: 'Primary action component with multiple variants and sizes',
      status: 'production',
      props: [
        { name: 'variant', type: 'string', default: 'primary', options: ['primary', 'secondary', 'tertiary'], description: 'Button style variant', required: false },
        { name: 'size', type: 'string', default: 'md', options: ['sm', 'md', 'lg'], description: 'Button size', required: false },
        { name: 'disabled', type: 'boolean', default: false, description: 'Whether the button is disabled', required: false },
        { name: 'loading', type: 'boolean', default: false, description: 'Whether the button is in loading state', required: false },
      ],
      code: {
        vue: `<template>
  <button
    :class="[
      'px-4 py-2 rounded-lg font-medium transition-colors',
      variant === 'primary' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : '',
      variant === 'secondary' ? 'bg-gray-200 text-gray-900 hover:bg-gray-300' : '',
      variant === 'tertiary' ? 'text-indigo-600 hover:bg-indigo-50' : '',
      disabled || loading ? 'opacity-50 cursor-not-allowed' : ''
    ]"
    :disabled="disabled || loading"
  >
    <slot v-if="!loading" />
    <span v-else>Loading...</span>
  </button>
</template>

<script setup>
defineProps({
  variant: { type: String, default: 'primary' },
  size: { type: String, default: 'md' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false }
});
</script>`,
        react: `import React from 'react';

export const Button = ({ variant = 'primary', size = 'md', disabled = false, loading = false, children }) => {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors';
  const variantClasses = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    tertiary: 'text-indigo-600 hover:bg-indigo-50'
  };
  
  return (
    <button
      className={\`\${baseClasses} \${variantClasses[variant]} \${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}\`}
      disabled={disabled || loading}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
};`,
      },
      dependencies: [],
      examples: ['<Button variant="primary">Click me</Button>'],
      accessibility: {
        wcag: 'AA',
        notes: 'Button has proper focus states and keyboard navigation support',
      },
    },
    {
      id: 'card',
      name: 'Card',
      description: 'Container component for displaying content',
      status: 'production',
      props: [
        { name: 'padding', type: 'string', default: 'md', options: ['sm', 'md', 'lg'], description: 'Card padding size', required: false },
        { name: 'shadow', type: 'string', default: 'md', options: ['sm', 'md', 'lg', 'none'], description: 'Card shadow level', required: false },
        { name: 'border', type: 'boolean', default: true, description: 'Whether to show border', required: false },
      ],
      code: {
        vue: `<template>
  <div :class="[
    'rounded-lg bg-white',
    border ? 'border' : '',
    \`p-\${padding === 'sm' ? '4' : padding === 'lg' ? '8' : '6'}\`,
    shadow !== 'none' ? \`shadow-\${shadow}\` : ''
  ]">
    <slot />
  </div>
</template>

<script setup>
defineProps({
  padding: { type: String, default: 'md' },
  shadow: { type: String, default: 'md' },
  border: { type: Boolean, default: true }
});
</script>`,
        react: `import React from 'react';

export const Card = ({ padding = 'md', shadow = 'md', border = true, children }) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  return (
    <div className={\`rounded-lg bg-white \${border ? 'border' : ''} \${paddingClasses[padding]} \${shadow !== 'none' ? \`shadow-\${shadow}\` : ''}\`}>
      {children}
    </div>
  );
};`,
      },
      dependencies: [],
      examples: ['<Card padding="lg">Card content</Card>'],
      accessibility: {
        wcag: 'AA',
        notes: 'Card uses semantic HTML and proper ARIA attributes when interactive',
      },
    },
    {
      id: 'input',
      name: 'Input',
      description: 'Text input field component',
      status: 'production',
      props: [
        { name: 'type', type: 'string', default: 'text', options: ['text', 'email', 'password', 'number'], description: 'Input type', required: false },
        { name: 'placeholder', type: 'string', default: '', description: 'Placeholder text', required: false },
        { name: 'disabled', type: 'boolean', default: false, description: 'Whether input is disabled', required: false },
        { name: 'error', type: 'boolean', default: false, description: 'Whether input has error state', required: false },
        { name: 'label', type: 'string', default: '', description: 'Input label', required: false },
      ],
      code: {
        vue: `<template>
  <div>
    <label v-if="label" class="block text-sm font-medium mb-1">{{ label }}</label>
    <input
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="[
        'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
        error ? 'border-red-500' : 'border-gray-300',
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      ]"
    />
  </div>
</template>

<script setup>
defineProps({
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  error: { type: Boolean, default: false },
  label: { type: String, default: '' }
});
</script>`,
        react: `import React from 'react';

export const Input = ({ type = 'text', placeholder = '', disabled = false, error = false, label = '' }) => {
  return (
    <div>
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        className={\`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 \${error ? 'border-red-500' : 'border-gray-300'} \${disabled ? 'opacity-50 cursor-not-allowed' : ''}\`}
      />
    </div>
  );
};`,
      },
      dependencies: [],
      examples: ['<Input label="Email" type="email" placeholder="Enter your email" />'],
      accessibility: {
        wcag: 'AA',
        notes: 'Input has proper label association and error announcements',
      },
    },
    {
      id: 'select',
      name: 'Select',
      description: 'Dropdown select component',
      status: 'production',
      props: [
        { name: 'options', type: 'array', default: [], description: 'Select options', required: true },
        { name: 'placeholder', type: 'string', default: 'Select an option', description: 'Placeholder text', required: false },
        { name: 'disabled', type: 'boolean', default: false, description: 'Whether select is disabled', required: false },
        { name: 'label', type: 'string', default: '', description: 'Select label', required: false },
      ],
      code: {
        vue: `<template>
  <div>
    <label v-if="label" class="block text-sm font-medium mb-1">{{ label }}</label>
    <select
      :disabled="disabled"
      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
    >
      <option value="">{{ placeholder }}</option>
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<script setup>
defineProps({
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: 'Select an option' },
  disabled: { type: Boolean, default: false },
  label: { type: String, default: '' }
});
</script>`,
        react: `import React from 'react';

export const Select = ({ options = [], placeholder = 'Select an option', disabled = false, label = '' }) => {
  return (
    <div>
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}
      <select
        disabled={disabled}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      >
        <option value="">{placeholder}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
};`,
      },
      dependencies: ['input'],
      examples: ['<Select label="Country" :options="[{value: \'us\', label: \'United States\'}]" />'],
      accessibility: {
        wcag: 'AA',
        notes: 'Select has proper label association and keyboard navigation',
      },
    },
    {
      id: 'modal',
      name: 'Modal',
      description: 'Modal dialog component',
      status: 'production',
      props: [
        { name: 'open', type: 'boolean', default: false, description: 'Whether modal is open', required: true },
        { name: 'title', type: 'string', default: '', description: 'Modal title', required: false },
        { name: 'closeOnBackdrop', type: 'boolean', default: true, description: 'Close on backdrop click', required: false },
      ],
      code: {
        vue: `<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="closeOnBackdrop && $emit('close')">
    <div class="bg-white rounded-lg p-6 max-w-md w-full">
      <div class="flex items-center justify-between mb-4">
        <h2 v-if="title" class="text-xl font-bold">{{ title }}</h2>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700">×</button>
      </div>
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },
  closeOnBackdrop: { type: Boolean, default: true }
});

defineEmits(['close']);
</script>`,
        react: `import React from 'react';

export const Modal = ({ open = false, title = '', closeOnBackdrop = true, onClose, children }) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeOnBackdrop ? onClose : undefined}>
      <div className="bg-white rounded-lg p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          {title && <h2 className="text-xl font-bold">{title}</h2>}
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
        </div>
        {children}
      </div>
    </div>
  );
};`,
      },
      dependencies: ['button', 'card'],
      examples: ['<Modal :open="true" title="Confirm" @close="handleClose">Are you sure?</Modal>'],
      accessibility: {
        wcag: 'AA',
        notes: 'Modal traps focus and has proper ARIA attributes',
      },
    },
  ];

  getAllTokens(category?: string, type?: string, tag?: string): Token[] {
    let filtered = [...this.tokens];
    
    if (category) {
      filtered = filtered.filter(token => token.category === category);
    }
    
    if (type) {
      filtered = filtered.filter(token => token.type === type);
    }
    
    if (tag) {
      filtered = filtered.filter(token => token.tags?.includes(tag));
    }
    
    return filtered;
  }

  getTokenByName(name: string): Token | undefined {
    return this.tokens.find(token => token.name === name);
  }

  getTokensByCategory(category: string): Token[] {
    return this.tokens.filter(token => token.category === category);
  }

  getAllComponents(status?: string): Component[] {
    if (status) {
      return this.components.filter(component => component.status === status);
    }
    return this.components;
  }

  getComponentById(id: string): Component | undefined {
    return this.components.find(component => component.id === id);
  }

  getComponentsByStatus(status: string): Component[] {
    return this.components.filter(component => component.status === status);
  }

  registerApplication(name: string, repository?: string, version?: string): Application {
    const id = `app-${Date.now()}`;
    const application: Application = {
      id,
      name,
      repository,
      version,
      registeredAt: new Date()
    };
    this.applications.set(id, application);
    return application;
  }

  getAllApplications(): { applications: Application[]; count: number } {
    return {
      applications: Array.from(this.applications.values()),
      count: this.applications.size
    };
  }

  scanCompliance(scope: 'design-system' | 'applications', applicationId?: string, rules?: Array<{ name: string; scannerCode?: string }> | string[], codebase?: any, categories?: string[]): {
    scope: string;
    passed: number;
    warnings: number;
    failed: number;
    checks: ComplianceCheck[];
  } {
    // Handle both old format (string[]) and new format (Array<{name, scannerCode}>)
    let rulesToScan: string[];
    let customScanners: Map<string, string> = new Map();
    
    if (rules && rules.length > 0) {
      if (typeof rules[0] === 'string') {
        // Old format
        rulesToScan = rules as string[];
      } else {
        // New format with scanner code
        const ruleObjects = rules as Array<{ name: string; scannerCode?: string }>;
        rulesToScan = ruleObjects.map(r => r.name);
        ruleObjects.forEach(r => {
          if (r.scannerCode) {
            customScanners.set(r.name, r.scannerCode);
          }
        });
      }
    } else if (categories && categories.length > 0 && scope === 'applications') {
      // Filter by categories for application scans
      const allRules = this.getAllAvailableRules();
      rulesToScan = allRules
        .filter(rule => categories.includes(rule.category))
        .map(rule => rule.name);
    } else {
      // Default rules
      rulesToScan = ['Color Contrast WCAG AA', 'Spacing Consistency', 'Typography Scale', 'Component Naming', 'Accessibility Attributes', 'Token Usage'];
    }

    if (scope === 'design-system') {
      // Scan design system itself
      const context: ScannerContext = {
        components: this.components,
        tokens: this.tokens
      };

      // Use custom scanners if provided, otherwise use default scanner service
      let allChecks: ComplianceCheck[] = [];
      
      rulesToScan.forEach(ruleName => {
        if (customScanners.has(ruleName)) {
          // Execute custom scanner code
          try {
            const scannerCode = customScanners.get(ruleName)!;
            const scannerFunction = new Function('context', scannerCode);
            const checks = scannerFunction(context);
            if (Array.isArray(checks)) {
              allChecks.push(...checks);
            }
          } catch (error) {
            allChecks.push({
              id: `error-${ruleName}`,
              rule: ruleName,
              status: 'error',
              message: `Error executing custom scanner: ${error.message}`
            });
          }
        } else {
          // Use default scanner
          const checks = this.scannerService.scan([ruleName], context);
          allChecks.push(...checks);
        }
      });

      return {
        scope: 'design-system',
        passed: allChecks.filter(c => c.status === 'pass').length,
        warnings: allChecks.filter(c => c.status === 'warning').length,
        failed: allChecks.filter(c => c.status === 'error').length,
        checks: allChecks
      };
    } else {
      // Scan applications using ApplicationScannerService
      const application = applicationId ? this.applications.get(applicationId) : null;
      const allChecks: ComplianceCheck[] = [];
      
      // Create scan context from codebase parameter or empty
      const scanContext: ApplicationScanContext = {
        html: codebase?.html || '',
        css: codebase?.css || '',
        javascript: codebase?.javascript || '',
        components: codebase?.components || [],
        tokens: this.tokens,
        applicationName: application?.name || 'Unknown',
        file: codebase?.file
      };
      
      // Determine which rules to run based on categories or provided rules
      const allRules = this.getAllAvailableRules();
      let rulesToRun: Array<{ name: string; category: string; scannerCode?: string }> = [];
      
      if (rules && rules.length > 0) {
        // If specific rules provided, use them (for backward compatibility)
        if (typeof rules[0] === 'string') {
          rulesToRun = allRules.filter(rule => (rules as string[]).includes(rule.name));
        } else {
          const ruleObjects = rules as Array<{ name: string; scannerCode?: string }>;
          rulesToRun = allRules.filter(rule => ruleObjects.some(r => r.name === rule.name));
          ruleObjects.forEach(r => {
            const existingRule = rulesToRun.find(rt => rt.name === r.name);
            if (existingRule && r.scannerCode) {
              existingRule.scannerCode = r.scannerCode;
            }
          });
        }
      } else if (categories && categories.length > 0) {
        // Filter by categories
        rulesToRun = allRules.filter(rule => categories.includes(rule.category));
      } else {
        // Run all enabled rules
        rulesToRun = allRules.filter(rule => rule.enabled !== false);
      }
      
      rulesToRun.forEach((rule: any) => {
        const ruleName = rule.name;
        const scannerCode = rule.scannerCode || null;
        
        try {
          if (scannerCode) {
            // Execute custom scanner code
            const scannerFunction = new Function('context', scannerCode);
            const checks = scannerFunction(scanContext);
            if (Array.isArray(checks)) {
              allChecks.push(...checks);
            }
          } else {
            // Use ApplicationScannerService methods for default rules
            switch (ruleName) {
              case 'Design System Component Usage':
                allChecks.push(...this.applicationScanner.scanDesignSystemComponentUsage(scanContext));
                break;
              case 'Hardcoded Design Tokens':
                allChecks.push(...this.applicationScanner.scanHardcodedTokens(scanContext));
                break;
              case 'Design System Version':
                allChecks.push(...this.applicationScanner.scanDesignSystemVersion(scanContext));
                break;
              case 'Form Label Requirements':
                allChecks.push(...this.applicationScanner.scanFormLabels(scanContext));
                break;
              case 'Error Message Handling':
                allChecks.push(...this.applicationScanner.scanErrorHandling(scanContext));
                break;
              case 'Loading State Indicators':
                allChecks.push(...this.applicationScanner.scanLoadingStates(scanContext));
                break;
              case 'Empty State Handling':
                allChecks.push(...this.applicationScanner.scanEmptyStates(scanContext));
                break;
              case 'Destructive Action Confirmation':
                allChecks.push(...this.applicationScanner.scanDestructiveActions(scanContext));
                break;
              case 'Accessibility Scan (Comprehensive)':
                // This will be handled asynchronously in scanApplicationCodebase
                break;
              case 'Image Alt Text':
              case 'Heading Hierarchy':
                allChecks.push(...this.applicationScanner.basicAccessibilityScan(scanContext));
                break;
            }
          }
        } catch (error) {
          allChecks.push({
            id: `error-${ruleName}`,
            rule: ruleName,
            status: 'error',
            message: `Error executing scanner for rule "${ruleName}": ${error.message}`,
            application: application?.name
          });
        }
      });

      return {
        scope: 'applications',
        passed: allChecks.filter(c => c.status === 'pass').length,
        warnings: allChecks.filter(c => c.status === 'warning').length,
        failed: allChecks.filter(c => c.status === 'error').length,
        checks: allChecks
      };
    }
  }

  async scanApplicationCodebase(applicationId: string, codebase?: any, categories?: string[]): Promise<{
    applicationId: string;
    scannedAt: Date;
    checks: ComplianceCheck[];
  }> {
    const application = this.applications.get(applicationId);
    if (!application) {
      throw new Error(`Application ${applicationId} not found`);
    }

    // Update last scanned time
    application.lastScanned = new Date();
    this.applications.set(applicationId, application);

    // Create scan context from codebase
    const scanContext: ApplicationScanContext = {
      html: codebase?.html || '',
      css: codebase?.css || '',
      javascript: codebase?.javascript || '',
      components: codebase?.components || [],
      tokens: this.tokens,
      applicationName: application.name,
      file: codebase?.file
    };

    // Determine which rules to run based on categories
    const allRules = this.getAllAvailableRules();
    let rulesToRun: Array<{ name: string; category: string; scannerCode?: string }> = [];
    
    if (categories && categories.length > 0) {
      // Filter by categories
      rulesToRun = allRules.filter(rule => categories.includes(rule.category));
    } else {
      // Run all enabled rules if no categories specified
      rulesToRun = allRules.filter(rule => rule.enabled !== false);
    }

    // Run all application scans
    const allChecks: ComplianceCheck[] = [];
    
    rulesToRun.forEach(rule => {
      try {
        if (rule.scannerCode) {
          // Execute custom scanner code
          const scannerFunction = new Function('context', rule.scannerCode);
          const checks = scannerFunction(scanContext);
          if (Array.isArray(checks)) {
            allChecks.push(...checks);
          }
        } else {
          // Use ApplicationScannerService methods for default rules
          switch (rule.name) {
            case 'Design System Component Usage':
              allChecks.push(...this.applicationScanner.scanDesignSystemComponentUsage(scanContext));
              break;
            case 'Hardcoded Design Tokens':
              allChecks.push(...this.applicationScanner.scanHardcodedTokens(scanContext));
              break;
            case 'Design System Version':
              allChecks.push(...this.applicationScanner.scanDesignSystemVersion(scanContext));
              break;
            case 'Form Label Requirements':
              allChecks.push(...this.applicationScanner.scanFormLabels(scanContext));
              break;
            case 'Error Message Handling':
              allChecks.push(...this.applicationScanner.scanErrorHandling(scanContext));
              break;
            case 'Loading State Indicators':
              allChecks.push(...this.applicationScanner.scanLoadingStates(scanContext));
              break;
            case 'Empty State Handling':
              allChecks.push(...this.applicationScanner.scanEmptyStates(scanContext));
              break;
            case 'Destructive Action Confirmation':
              allChecks.push(...this.applicationScanner.scanDestructiveActions(scanContext));
              break;
            case 'Touch Target Sizes':
              allChecks.push(...this.applicationScanner.scanTouchTargetSizes(scanContext));
              break;
            case 'Success State Indicators':
              allChecks.push(...this.applicationScanner.scanSuccessStates(scanContext));
              break;
            case 'Navigation Consistency':
              allChecks.push(...this.applicationScanner.scanNavigationConsistency(scanContext));
              break;
            case 'Help Text and Tooltips':
              allChecks.push(...this.applicationScanner.scanHelpText(scanContext));
              break;
            case 'Border Radius Consistency':
              allChecks.push(...this.applicationScanner.scanBorderRadiusConsistency(scanContext));
              break;
            case 'Shadow/Elevation Consistency':
              allChecks.push(...this.applicationScanner.scanShadowConsistency(scanContext));
              break;
            case 'Z-index Layer Management':
              allChecks.push(...this.applicationScanner.scanZIndexManagement(scanContext));
              break;
            case 'Icon Usage Consistency':
              allChecks.push(...this.applicationScanner.scanIconUsage(scanContext));
              break;
            case 'Responsive Breakpoint Usage':
              allChecks.push(...this.applicationScanner.scanResponsiveBreakpoints(scanContext));
              break;
            case 'Animation/Transition Consistency':
              allChecks.push(...this.applicationScanner.scanAnimationConsistency(scanContext));
              break;
            case 'Component Variant Usage':
              allChecks.push(...this.applicationScanner.scanComponentVariantUsage(scanContext));
              break;
            case 'Search Functionality':
              allChecks.push(...this.applicationScanner.scanSearchFunctionality(scanContext));
              break;
            case 'Consistent Modal/Dialog Patterns':
              allChecks.push(...this.applicationScanner.scanModalConsistency(scanContext));
              break;
            case 'Consistent Toast/Notification Patterns':
              allChecks.push(...this.applicationScanner.scanToastConsistency(scanContext));
              break;
            case 'Page Load Performance Indicators':
              allChecks.push(...this.applicationScanner.scanPerformanceIndicators(scanContext));
              break;
            case 'Offline State Handling':
              allChecks.push(...this.applicationScanner.scanOfflineStateHandling(scanContext));
              break;
            case 'Content Hierarchy':
              allChecks.push(...this.applicationScanner.scanContentHierarchy(scanContext));
              break;
            case 'Accessibility Scan (Comprehensive)':
              // This will be handled asynchronously - for now use basic scan
              allChecks.push(...this.applicationScanner.basicAccessibilityScan(scanContext));
              break;
            case 'Image Alt Text':
            case 'Heading Hierarchy':
              allChecks.push(...this.applicationScanner.basicAccessibilityScan(scanContext));
              break;
          }
        }
      } catch (error: any) {
        allChecks.push({
          id: `error-${rule.name}`,
          rule: rule.name,
          status: 'error',
          message: `Error executing scanner for rule "${rule.name}": ${error.message}`,
          application: application.name
        });
      }
    });

    // Run comprehensive accessibility scan if accessibility category is included
    const hasAccessibilityCategory = !categories || categories.includes('accessibility');
    const hasAccessibilityRule = rulesToRun.some(rule => rule.category === 'accessibility');
    
    if (hasAccessibilityCategory && hasAccessibilityRule) {
      try {
        const accessibilityChecks = await this.applicationScanner.scanAccessibility(scanContext);
        // Filter out duplicates from basic scan
        const existingIds = new Set(allChecks.map(c => c.id));
        accessibilityChecks.forEach(check => {
          if (!existingIds.has(check.id)) {
            allChecks.push(check);
          }
        });
      } catch (error) {
        // Already handled by basic scan above
      }
    }

    return {
      applicationId,
      scannedAt: new Date(),
      checks: allChecks
    };
  }

  // Get all available rules (for filtering by category)
  getAllAvailableRules(): Array<{ name: string; category: string; enabled: boolean; scannerCode?: string }> {
    // Return list of all available rules with their categories
    // In a real implementation, this would come from a database or configuration
    return [
      // Design System Compliance Rules
      { name: 'Design System Component Usage', category: 'design-system', enabled: true },
      { name: 'Hardcoded Design Tokens', category: 'design-system', enabled: true },
      { name: 'Design System Version', category: 'design-system', enabled: true },
      { name: 'Color Contrast WCAG AA', category: 'design-system', enabled: true },
      { name: 'Spacing Consistency', category: 'design-system', enabled: true },
      { name: 'Typography Scale', category: 'design-system', enabled: true },
      { name: 'Component Naming', category: 'design-system', enabled: true },
      { name: 'Border Radius Consistency', category: 'design-system', enabled: true },
      { name: 'Shadow/Elevation Consistency', category: 'design-system', enabled: true },
      { name: 'Z-index Layer Management', category: 'design-system', enabled: true },
      { name: 'Icon Usage Consistency', category: 'design-system', enabled: true },
      { name: 'Responsive Breakpoint Usage', category: 'design-system', enabled: true },
      { name: 'Animation/Transition Consistency', category: 'design-system', enabled: true },
      { name: 'Component Variant Usage', category: 'design-system', enabled: true },
      
      // UX / HCD Best Practices Rules
      { name: 'Form Label Requirements', category: 'ux-hcd', enabled: true },
      { name: 'Error Message Handling', category: 'ux-hcd', enabled: true },
      { name: 'Loading State Indicators', category: 'ux-hcd', enabled: true },
      { name: 'Empty State Handling', category: 'ux-hcd', enabled: true },
      { name: 'Destructive Action Confirmation', category: 'ux-hcd', enabled: true },
      { name: 'Touch Target Sizes', category: 'ux-hcd', enabled: true },
      { name: 'Success State Indicators', category: 'ux-hcd', enabled: true },
      { name: 'Navigation Consistency', category: 'ux-hcd', enabled: true },
      { name: 'Help Text and Tooltips', category: 'ux-hcd', enabled: true },
      { name: 'Search Functionality', category: 'ux-hcd', enabled: true },
      { name: 'Consistent Modal/Dialog Patterns', category: 'ux-hcd', enabled: true },
      { name: 'Consistent Toast/Notification Patterns', category: 'ux-hcd', enabled: true },
      { name: 'Page Load Performance Indicators', category: 'ux-hcd', enabled: true },
      { name: 'Offline State Handling', category: 'ux-hcd', enabled: true },
      { name: 'Content Hierarchy', category: 'ux-hcd', enabled: true },
      
      // Accessibility Rules
      { name: 'Accessibility Scan (Comprehensive)', category: 'accessibility', enabled: true },
      { name: 'Image Alt Text', category: 'accessibility', enabled: true },
      { name: 'Heading Hierarchy', category: 'accessibility', enabled: true },
      { name: 'Accessibility Attributes', category: 'accessibility', enabled: true }
    ];
  }
}
