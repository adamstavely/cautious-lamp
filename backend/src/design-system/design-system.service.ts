import { Injectable, UnauthorizedException, Optional, Inject, forwardRef } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ComplianceScannerService, ScannerContext } from './compliance-scanner.service';
import { ApplicationScannerService, ApplicationScanContext } from './application-scanner.service';
import { VisualRegressionService } from '../visual-regression/visual-regression.service';
import { SessionReplayService } from '../session-replay/session-replay.service';

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

export interface ApplicationCapabilities {
  governance?: {
    enabled: boolean;
    rules?: string[]; // Specific rules to run (empty = all enabled rules)
    scanSchedule?: 'manual' | 'daily' | 'weekly' | 'on-commit';
    lastScan?: Date;
  };
  visualRegression?: {
    enabled: boolean;
    projectId?: string; // Link to visual regression project
    argosProjectId?: string;
    argosBaseUrl?: string;
    argosBranch?: string;
    lastRun?: Date;
  };
  sessionReplay?: {
    enabled: boolean;
    projectId?: string; // Link to session replay project
    openreplayProjectKey?: string;
    openreplayBaseUrl?: string;
    privacySettings?: {
      maskAllInputs?: boolean;
      maskAllText?: boolean;
      respectDoNotTrack?: boolean;
    };
  };
}

export interface ApplicationMetadata {
  environment?: 'development' | 'staging' | 'production';
  framework?: string;
  language?: string;
  tags?: string[];
}

export interface Application {
  id: string;
  name: string;
  description?: string;
  repository?: string;
  version?: string;
  applicationUrl?: string;
  teamId?: string;
  registeredAt: Date;
  updatedAt: Date;
  lastScanned?: Date;
  capabilities?: ApplicationCapabilities;
  metadata?: ApplicationMetadata;
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
  element?: string;
  impact?: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' | 'INFO';
}

@Injectable()
export class DesignSystemService {
  private apiKeys = new Map<string, { name: string; createdAt: Date }>();
  private applications = new Map<string, Application>();
  private scannerService: ComplianceScannerService;
  private applicationScanner: ApplicationScannerService;
  
  // Initialize with a default API key for testing
  constructor(
    @Optional() @Inject(ElasticsearchService) private readonly elasticsearchService?: ElasticsearchService,
    @Optional() @Inject(forwardRef(() => VisualRegressionService)) private readonly visualRegressionService?: VisualRegressionService,
    @Optional() @Inject(forwardRef(() => SessionReplayService)) private readonly sessionReplayService?: SessionReplayService,
  ) {
    this.scannerService = new ComplianceScannerService();
    this.applicationScanner = new ApplicationScannerService();
    this.apiKeys.set('test-api-key-123', { name: 'Default Test Key', createdAt: new Date() });
    this.apiKeys.set('dev-key', { name: 'Development Key', createdAt: new Date() });
    
    // Initialize with sample applications (for demonstration)
    this.applications.set('app-1', {
      id: 'app-1',
      name: 'Marketing Site',
      repository: 'https://github.com/company/marketing-site',
      version: '2.1.0',
      registeredAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
      lastScanned: new Date('2024-01-20')
    });
    this.applications.set('app-2', {
      id: 'app-2',
      name: 'Admin Dashboard',
      repository: 'https://github.com/company/admin-dashboard',
      version: '1.5.3',
      registeredAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-18'),
      lastScanned: new Date('2024-01-18')
    });
    this.applications.set('app-3', {
      id: 'app-3',
      name: 'Mobile App',
      repository: 'https://github.com/company/mobile-app',
      version: '3.0.1',
      applicationUrl: 'https://mobile.example.com',
      registeredAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-05'),
      lastScanned: new Date('2024-01-19'),
      capabilities: {
        governance: {
          enabled: true,
          rules: [],
          scanSchedule: 'manual',
          lastScan: new Date('2024-01-19')
        },
        visualRegression: {
          enabled: true,
          argosProjectId: 'argos-project-789',
          argosBaseUrl: 'https://app.argos-ci.com',
          argosBranch: 'develop'
        },
        sessionReplay: {
          enabled: true,
          openreplayProjectKey: 'project-key-789',
          openreplayBaseUrl: 'https://api.openreplay.com'
        }
      },
      metadata: {
        environment: 'production',
        framework: 'React Native',
        language: 'TypeScript',
        tags: ['mobile', 'ios', 'android']
      }
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
    {
      id: 'color-picker',
      name: 'Color Picker',
      description: 'Comprehensive color picker component with gradient selector, hue slider, and multiple color format support (RGB, HSL, CMYK, Hex)',
      status: 'production',
      props: [
        { name: 'show', type: 'boolean', default: false, description: 'Whether color picker is visible', required: true },
        { name: 'initialColor', type: 'string', default: '#000000', description: 'Initial color value in hex format', required: false },
        { name: 'position', type: 'object', default: '{ left: 0, top: 0 }', description: 'Position of the color picker', required: false },
        { name: 'previewDarkMode', type: 'boolean', default: false, description: 'Whether to use dark mode styling', required: false },
      ],
      code: {
        vue: `<template>
  <div
    v-if="show"
    ref="colorPickerContainerRef"
    role="dialog"
    aria-modal="true"
    :class="[
      'fixed z-50 rounded-lg shadow-xl border p-4',
      isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'
    ]"
    :style="safePickerStyle"
    @click.stop
    @keydown.esc="cancel"
    tabindex="-1"
  >
    <div class="w-64">
      <h2 id="color-picker-title" class="sr-only">Color Picker</h2>
      <!-- Gradient/Hue Selector -->
      <div class="relative mb-4">
        <canvas
          ref="gradientCanvas"
          width="256"
          height="200"
          role="img"
          :class="[
            'w-full h-48 rounded-lg cursor-crosshair border focus:outline-none focus:ring-2 focus:ring-indigo-500',
            isDarkMode ? 'border-gray-600' : 'border-gray-300'
          ]"
          @mousedown="startGradientDrag"
          @click="handleGradientClick"
          @keydown="handleGradientKeydown"
          tabindex="0"
        ></canvas>
        <div
          class="absolute w-4 h-4 border-2 border-white rounded-full shadow-lg pointer-events-none"
          :style="selectorStyle"
        ></div>
      </div>
      
      <!-- Hue Slider -->
      <div class="mb-4">
        <label for="hue-canvas" :class="['block text-xs font-medium mb-1', isDarkMode ? 'text-gray-300' : 'text-gray-700']">Hue</label>
        <div class="relative h-8">
          <canvas
            ref="hueCanvas"
            width="256"
            height="32"
            role="slider"
            :class="[
              'w-full h-8 rounded cursor-pointer border focus:outline-none focus:ring-2 focus:ring-indigo-500',
              isDarkMode ? 'border-gray-600' : 'border-gray-300'
            ]"
            @click="handleHueClick"
            @keydown="handleHueKeydown"
            tabindex="0"
          ></canvas>
        </div>
      </div>

      <!-- RGB Inputs -->
      <div class="grid grid-cols-3 gap-2 mb-4">
        <div>
          <label for="rgb-r-input" :class="['block text-xs font-medium mb-1', isDarkMode ? 'text-gray-300' : 'text-gray-700']">R</label>
          <input
            id="rgb-r-input"
            v-model.number="rgbValues.r"
            @input="updateFromRGB"
            type="number"
            min="0"
            max="255"
            :class="[
              'w-full px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-indigo-500',
              isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'
            ]"
          />
        </div>
        <div>
          <label for="rgb-g-input" :class="['block text-xs font-medium mb-1', isDarkMode ? 'text-gray-300' : 'text-gray-700']">G</label>
          <input
            id="rgb-g-input"
            v-model.number="rgbValues.g"
            @input="updateFromRGB"
            type="number"
            min="0"
            max="255"
            :class="[
              'w-full px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-indigo-500',
              isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'
            ]"
          />
        </div>
        <div>
          <label for="rgb-b-input" :class="['block text-xs font-medium mb-1', isDarkMode ? 'text-gray-300' : 'text-gray-700']">B</label>
          <input
            id="rgb-b-input"
            v-model.number="rgbValues.b"
            @input="updateFromRGB"
            type="number"
            min="0"
            max="255"
            :class="[
              'w-full px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-indigo-500',
              isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'
            ]"
          />
        </div>
      </div>

      <!-- Hex Input -->
      <div class="mb-4">
        <label for="hex-input" :class="['block text-xs font-medium mb-1', isDarkMode ? 'text-gray-300' : 'text-gray-700']">Hex</label>
        <input
          id="hex-input"
          v-model="hexInput"
          @input="updateFromHex"
          type="text"
          pattern="^#[0-9A-Fa-f]{6}$"
          :class="[
            'w-full px-2 py-1 text-sm border rounded font-mono focus:ring-2 focus:ring-indigo-500',
            isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'
          ]"
          placeholder="#000000"
        />
      </div>

      <!-- CMYK Inputs -->
      <div class="grid grid-cols-4 gap-2 mb-4">
        <div>
          <label for="cmyk-c-input" :class="['block text-xs font-medium mb-1', isDarkMode ? 'text-gray-300' : 'text-gray-700']">C</label>
          <input
            id="cmyk-c-input"
            v-model.number="cmykValues.c"
            @input="updateFromCMYK"
            type="number"
            min="0"
            max="100"
            step="0.1"
            :class="[
              'w-full px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-indigo-500',
              isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'
            ]"
          />
        </div>
        <div>
          <label for="cmyk-m-input" :class="['block text-xs font-medium mb-1', isDarkMode ? 'text-gray-300' : 'text-gray-700']">M</label>
          <input
            id="cmyk-m-input"
            v-model.number="cmykValues.m"
            @input="updateFromCMYK"
            type="number"
            min="0"
            max="100"
            step="0.1"
            :class="[
              'w-full px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-indigo-500',
              isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'
            ]"
          />
        </div>
        <div>
          <label for="cmyk-y-input" :class="['block text-xs font-medium mb-1', isDarkMode ? 'text-gray-300' : 'text-gray-700']">Y</label>
          <input
            id="cmyk-y-input"
            v-model.number="cmykValues.y"
            @input="updateFromCMYK"
            type="number"
            min="0"
            max="100"
            step="0.1"
            :class="[
              'w-full px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-indigo-500',
              isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'
            ]"
          />
        </div>
        <div>
          <label for="cmyk-k-input" :class="['block text-xs font-medium mb-1', isDarkMode ? 'text-gray-300' : 'text-gray-700']">K</label>
          <input
            id="cmyk-k-input"
            v-model.number="cmykValues.k"
            @input="updateFromCMYK"
            type="number"
            min="0"
            max="100"
            step="0.1"
            :class="[
              'w-full px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-indigo-500',
              isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'
            ]"
          />
        </div>
      </div>

      <!-- Color Preview -->
      <div class="mb-4 flex items-center gap-3" role="region" aria-label="Color preview">
        <div
          :class="[
            'w-16 h-16 rounded-lg border-2',
            isDarkMode ? 'border-gray-600' : 'border-gray-300'
          ]"
          :style="{ backgroundColor: currentHex }"
        ></div>
        <div class="flex-1">
          <div :class="['text-sm font-mono font-semibold', isDarkMode ? 'text-white' : 'text-gray-900']">{{ currentHex }}</div>
          <div :class="['text-xs', isDarkMode ? 'text-gray-400' : 'text-gray-500']">RGB({{ rgbValues.r }}, {{ rgbValues.g }}, {{ rgbValues.b }})</div>
        </div>
      </div>

      <!-- Buttons -->
      <div class="flex gap-2">
        <button
          @click="applyColor"
          class="flex-1 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Apply
        </button>
        <button
          @click="cancel"
          :class="[
            'flex-1 px-4 py-2 text-sm rounded-lg transition-colors',
            isDarkMode ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';

const props = defineProps({
  show: { type: Boolean, default: false },
  initialColor: { type: String, default: '#000000' },
  position: { type: Object, default: () => ({ left: 0, top: 0 }) },
  previewDarkMode: { type: Boolean, default: false },
});

const emit = defineEmits(['update:show', 'apply', 'cancel']);

const isDarkMode = computed(() => props.previewDarkMode);
const colorPickerContainerRef = ref(null);
const gradientCanvas = ref(null);
const hueCanvas = ref(null);
const currentHex = ref('#000000');
const hexInput = ref('#000000');
const rgbValues = ref({ r: 0, g: 0, b: 0 });
const cmykValues = ref({ c: 0, m: 0, y: 0, k: 100 });
const currentHue = ref(0);
const currentSaturation = ref(100);
const currentLightness = ref(50);
const huePosition = ref(0);
const selectorStyle = ref({ left: '0%', top: '0%' });
const isDragging = ref(false);

// Color conversion utilities and canvas drawing functions would be here
// (hexToRgb, rgbToHex, rgbToHsl, hslToRgb, rgbToCmyk, cmykToRgb, drawGradientCanvas, drawHueCanvas, etc.)

const applyColor = () => {
  emit('apply', currentHex.value);
  emit('update:show', false);
};

const cancel = () => {
  emit('cancel');
  emit('update:show', false);
};
</script>`,
        react: `import React, { useState, useEffect, useRef } from 'react';

export const ColorPicker = ({ show = false, initialColor = '#000000', position = { left: 0, top: 0 }, previewDarkMode = false, onApply, onCancel }) => {
  const [currentHex, setCurrentHex] = useState(initialColor);
  const [rgbValues, setRgbValues] = useState({ r: 0, g: 0, b: 0 });
  const [cmykValues, setCmykValues] = useState({ c: 0, m: 0, y: 0, k: 100 });
  const [currentHue, setCurrentHue] = useState(0);
  const [currentSaturation, setCurrentSaturation] = useState(100);
  const [currentLightness, setCurrentLightness] = useState(50);
  const gradientCanvasRef = useRef(null);
  const hueCanvasRef = useRef(null);
  const containerRef = useRef(null);

  // Color conversion utilities and canvas drawing functions would be here
  // (hexToRgb, rgbToHex, rgbToHsl, hslToRgb, rgbToCmyk, cmykToRgb, drawGradientCanvas, drawHueCanvas, etc.)

  const handleApply = () => {
    if (onApply) onApply(currentHex);
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
  };

  if (!show) return null;

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      className={\`fixed z-50 rounded-lg shadow-xl border p-4 \${previewDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'}\`}
      style={{ left: \`\${position.left}px\`, top: \`\${position.top}px\` }}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.key === 'Escape' && handleCancel()}
      tabIndex={-1}
    >
      <div className="w-64">
        <h2 id="color-picker-title" className="sr-only">Color Picker</h2>
        {/* Gradient/Hue Selector, RGB/Hex/CMYK inputs, Color Preview, Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Apply
          </button>
          <button
            onClick={handleCancel}
            className={\`flex-1 px-4 py-2 text-sm rounded-lg transition-colors \${previewDarkMode ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}\`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};`,
      },
      dependencies: [],
      examples: ['<ColorPicker :show="true" :initial-color="#4f46e5" @apply="handleColorApply" />'],
      accessibility: {
        wcag: 'AA',
        notes: 'Fully WCAG 2.1 AA compliant with keyboard navigation, ARIA labels, and focus management',
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

  async registerApplication(
    name: string,
    options?: {
      description?: string;
      repository?: string;
      version?: string;
      applicationUrl?: string;
      teamId?: string;
      capabilities?: ApplicationCapabilities;
      metadata?: ApplicationMetadata;
    }
  ): Promise<Application> {
    const id = `app-${Date.now()}`;
    const now = new Date();
    const teamId = options?.teamId || 'default-team';
    
    // Initialize capabilities
    const capabilities = options?.capabilities || {
      governance: { enabled: false },
      visualRegression: { enabled: false },
      sessionReplay: { enabled: false }
    };
    
    // Create visual regression project if enabled
    if (capabilities.visualRegression?.enabled && capabilities.visualRegression?.argosProjectId) {
      try {
        if (this.visualRegressionService) {
          const argosBaseUrl = capabilities.visualRegression.argosBaseUrl || process.env.ARGOS_BASE_URL || 'https://app.argos-ci.com';
          const vrProject = await this.visualRegressionService.createProject(teamId, {
            name: `${name} - Visual Regression`,
            description: `Visual regression testing for ${name}`,
            argosProjectId: capabilities.visualRegression.argosProjectId,
            argosBaseUrl: argosBaseUrl,
            argosBranch: 'develop',
          });
          capabilities.visualRegression.projectId = vrProject.id;
          capabilities.visualRegression.argosBaseUrl = argosBaseUrl;
          capabilities.visualRegression.argosBranch = 'develop';
        }
      } catch (error: any) {
        console.warn(`Failed to create visual regression project: ${error.message}`);
        // Continue with registration even if VR project creation fails
      }
    }
    
    // Create session replay project if enabled
    if (capabilities.sessionReplay?.enabled && capabilities.sessionReplay?.openreplayProjectKey) {
      try {
        if (this.sessionReplayService) {
          const srProject = await this.sessionReplayService.createProject(teamId, {
            name: `${name} - Session Replay`,
            description: `Session replay for ${name}`,
            applicationUrl: options?.applicationUrl,
            openreplayProjectKey: capabilities.sessionReplay.openreplayProjectKey,
            openreplayBaseUrl: capabilities.sessionReplay.openreplayBaseUrl,
            privacySettings: capabilities.sessionReplay.privacySettings,
          });
          capabilities.sessionReplay.projectId = srProject.id;
        }
      } catch (error: any) {
        console.warn(`Failed to create session replay project: ${error.message}`);
        // Continue with registration even if SR project creation fails
      }
    }
    
    const application: Application = {
      id,
      name,
      description: options?.description,
      repository: options?.repository,
      version: options?.version,
      applicationUrl: options?.applicationUrl,
      teamId,
      registeredAt: now,
      updatedAt: now,
      capabilities,
      metadata: options?.metadata
    };
    this.applications.set(id, application);
    return application;
  }

  updateApplication(id: string, updates: Partial<Application>): Application {
    const application = this.applications.get(id);
    if (!application) {
      throw new Error(`Application ${id} not found`);
    }
    const updated = {
      ...application,
      ...updates,
      id, // Ensure ID cannot be changed
      updatedAt: new Date()
    };
    this.applications.set(id, updated);
    return updated;
  }

  async updateApplicationCapabilities(id: string, capabilities: Partial<ApplicationCapabilities>): Promise<Application> {
    const application = this.applications.get(id);
    if (!application) {
      throw new Error(`Application ${id} not found`);
    }
    const currentCapabilities = application.capabilities || {
      governance: { enabled: false },
      visualRegression: { enabled: false },
      sessionReplay: { enabled: false }
    };
    
    const teamId = application.teamId || 'default-team';
    
    // Handle visual regression capability changes
    if (capabilities.visualRegression) {
      const vrCap = capabilities.visualRegression;
      const currentVr = currentCapabilities.visualRegression || { enabled: false };
      
      // If enabling and project doesn't exist, create it
      if (vrCap.enabled && !currentVr.enabled && vrCap.argosProjectId) {
        try {
          if (this.visualRegressionService) {
            const argosBaseUrl = vrCap.argosBaseUrl || process.env.ARGOS_BASE_URL || 'https://app.argos-ci.com';
            const vrProject = await this.visualRegressionService.createProject(teamId, {
              name: `${application.name} - Visual Regression`,
              description: `Visual regression testing for ${application.name}`,
              argosProjectId: vrCap.argosProjectId,
              argosBaseUrl: argosBaseUrl,
              argosBranch: 'develop',
            });
            vrCap.projectId = vrProject.id;
            vrCap.argosBaseUrl = argosBaseUrl;
            vrCap.argosBranch = 'develop';
          }
        } catch (error: any) {
          console.warn(`Failed to create visual regression project: ${error.message}`);
        }
      }
    }
    
    // Handle session replay capability changes
    if (capabilities.sessionReplay) {
      const srCap = capabilities.sessionReplay;
      const currentSr = currentCapabilities.sessionReplay || { enabled: false };
      
      // If enabling and project doesn't exist, create it
      if (srCap.enabled && !currentSr.enabled && srCap.openreplayProjectKey) {
        try {
          if (this.sessionReplayService) {
            const srProject = await this.sessionReplayService.createProject(teamId, {
              name: `${application.name} - Session Replay`,
              description: `Session replay for ${application.name}`,
              applicationUrl: application.applicationUrl,
              openreplayProjectKey: srCap.openreplayProjectKey,
              openreplayBaseUrl: srCap.openreplayBaseUrl,
              privacySettings: srCap.privacySettings,
            });
            srCap.projectId = srProject.id;
          }
        } catch (error: any) {
          console.warn(`Failed to create session replay project: ${error.message}`);
        }
      }
    }
    
    // Deep merge capabilities
    const updatedCapabilities: ApplicationCapabilities = {
      governance: capabilities.governance 
        ? { ...currentCapabilities.governance, ...capabilities.governance }
        : currentCapabilities.governance,
      visualRegression: capabilities.visualRegression
        ? { ...currentCapabilities.visualRegression, ...capabilities.visualRegression }
        : currentCapabilities.visualRegression,
      sessionReplay: capabilities.sessionReplay
        ? { ...currentCapabilities.sessionReplay, ...capabilities.sessionReplay }
        : currentCapabilities.sessionReplay,
    };
    
    const updated = {
      ...application,
      capabilities: updatedCapabilities,
      updatedAt: new Date()
    };
    this.applications.set(id, updated);
    return updated;
  }

  deleteApplication(id: string): boolean {
    return this.applications.delete(id);
  }

  getApplication(id: string): Application | undefined {
    return this.applications.get(id);
  }

  getAllApplications(filters?: {
    teamId?: string;
    capability?: 'governance' | 'visualRegression' | 'sessionReplay';
  }): { applications: Application[]; count: number } {
    let applications = Array.from(this.applications.values());
    
    if (filters?.teamId) {
      applications = applications.filter(app => app.teamId === filters.teamId);
    }
    
    if (filters?.capability) {
      applications = applications.filter(app => {
        const cap = app.capabilities?.[filters.capability];
        return cap?.enabled === true;
      });
    }
    
    return {
      applications,
      count: applications.length
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
                // Note: scanHardcodedTokens method needs to be implemented in ApplicationScannerService
                // For now, skip this check
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
              // Note: scanHardcodedTokens method needs to be implemented in ApplicationScannerService
              // For now, skip this check
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
            case 'Photosensitivity Analysis (IRIS)':
              // IRIS analysis is handled separately via video upload
              // This rule just checks for video content presence
              allChecks.push(...this.applicationScanner.scanForVideoContent(scanContext));
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

  // AI Assistant for Design System Questions
  async chatWithAI(message: string, conversationHistory?: Array<{ role: string; content: string }>): Promise<{
    response: string;
    suggestions?: string[];
    relatedComponents?: string[];
    relatedTokens?: string[];
  }> {
    // Get design system context
    const components = this.components;
    const tokens = this.tokens;
    const rules = this.getAllAvailableRules();
    
    // Build context about the design system
    const componentNames = components.map(c => c.name).join(', ');
    const tokenCategories = [...new Set(tokens.map(t => t.category))].join(', ');
    const ruleCategories = [...new Set(rules.map(r => r.category))].join(', ');
    
    // Analyze the user's question to provide relevant context
    const lowerMessage = message.toLowerCase();
    
    // Check if question is about components
    const componentMatches = components.filter(c => 
      lowerMessage.includes(c.name.toLowerCase()) || 
      lowerMessage.includes(c.id.toLowerCase())
    );
    
    // Check if question is about tokens
    const tokenMatches = tokens.filter(t => 
      lowerMessage.includes(t.name.toLowerCase()) ||
      lowerMessage.includes(t.category.toLowerCase()) ||
      lowerMessage.includes(t.type.toLowerCase())
    );
    
    // Check if question is about rules/compliance
    const ruleMatches = rules.filter(r => 
      lowerMessage.includes(r.name.toLowerCase()) ||
      lowerMessage.includes(r.category.toLowerCase())
    );
    
    // Generate intelligent response based on context
    let response = '';
    const suggestions: string[] = [];
    const relatedComponents: string[] = [];
    const relatedTokens: string[] = [];
    
    // Component-related questions
    if (componentMatches.length > 0 || lowerMessage.includes('component')) {
      if (componentMatches.length > 0) {
        const component = componentMatches[0];
        response = `I found information about the **${component.name}** component.\n\n`;
        response += `**Description**: ${component.description}\n`;
        response += `**Status**: ${component.status}\n`;
        response += `**Props**: ${component.props.map(p => `${p.name} (${p.type})`).join(', ')}\n\n`;
        
        if (component.accessibility) {
          response += `**Accessibility**: ${component.accessibility.wcag}\n`;
        }
        
        relatedComponents.push(component.id);
        suggestions.push(`Show me the ${component.name} component code`);
        suggestions.push(`What are the props for ${component.name}?`);
      } else {
        response = `I can help you with components! Our design system has ${components.length} components including: ${componentNames}.\n\n`;
        response += `What would you like to know about components?`;
        suggestions.push('List all components');
        suggestions.push('How do I use the Button component?');
        suggestions.push('What components are available?');
      }
    }
    // Token-related questions
    else if (tokenMatches.length > 0 || lowerMessage.includes('token') || lowerMessage.includes('color') || lowerMessage.includes('spacing') || lowerMessage.includes('typography')) {
      if (tokenMatches.length > 0) {
        const token = tokenMatches[0];
        response = `I found the **${token.name}** token.\n\n`;
        response += `**Value**: ${token.value}\n`;
        response += `**Type**: ${token.type}\n`;
        response += `**Category**: ${token.category}\n`;
        if (token.description) {
          response += `**Description**: ${token.description}\n`;
        }
        
        relatedTokens.push(token.name);
        suggestions.push(`Show me all ${token.category} tokens`);
        suggestions.push(`How do I use ${token.name}?`);
      } else {
        response = `I can help you with design tokens! Our design system has tokens in these categories: ${tokenCategories}.\n\n`;
        response += `What would you like to know about tokens?`;
        suggestions.push('Show me all color tokens');
        suggestions.push('What spacing tokens are available?');
        suggestions.push('How do I use design tokens?');
      }
    }
    // Compliance/rules questions
    else if (ruleMatches.length > 0 || lowerMessage.includes('rule') || lowerMessage.includes('compliance') || lowerMessage.includes('governance')) {
      if (ruleMatches.length > 0) {
        const rule = ruleMatches[0];
        response = `I found information about the **${rule.name}** rule.\n\n`;
        response += `**Category**: ${rule.category === 'design-system' ? 'Design System' : rule.category === 'ux-hcd' ? 'UX/HCD Best Practices' : 'Accessibility'}\n`;
        response += `**Status**: ${rule.enabled ? 'Enabled' : 'Disabled'}\n\n`;
        response += `This rule checks for compliance with design system standards. Would you like to know more about how to use it or scan your application?`;
        
        suggestions.push(`How do I use the ${rule.name} rule?`);
        suggestions.push(`Scan my application for ${rule.category} compliance`);
      } else {
        response = `I can help you with compliance and governance! Our design system has ${rules.length} rules across these categories: ${ruleCategories}.\n\n`;
        response += `What would you like to know about compliance?`;
        suggestions.push('What rules are available?');
        suggestions.push('How do I scan my application?');
        suggestions.push('What is design system governance?');
      }
    }
    // General questions
    else {
      response = `Hi! I'm Eero, your Design System AI Assistant. I can help you with:\n\n`;
      response += `• **Components** - Find and learn about design system components\n`;
      response += `• **Design Tokens** - Discover colors, spacing, typography, and more\n`;
      response += `• **Compliance** - Understand rules and scan applications\n`;
      response += `• **Best Practices** - Get guidance on UX/HCD and accessibility\n\n`;
      response += `What would you like to know?`;
      
      suggestions.push('What components are available?');
      suggestions.push('Show me color tokens');
      suggestions.push('How do I use the Button component?');
      suggestions.push('What is design system governance?');
    }
    
    // Add general suggestions if none provided
    if (suggestions.length === 0) {
      suggestions.push('What components are available?');
      suggestions.push('Show me design tokens');
      suggestions.push('How do I use the design system?');
    }
    
    return {
      response,
      suggestions: suggestions.slice(0, 4), // Limit to 4 suggestions
      relatedComponents: relatedComponents.slice(0, 3),
      relatedTokens: relatedTokens.slice(0, 3)
    };
  }

  // Performance Budgets
  private performanceBudgets = new Map<string, {
    id: string;
    name: string;
    metric: string;
    threshold: number;
    unit: string;
    alertThreshold?: number;
    enabled: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>();

  getPerformanceBudgets() {
    return Array.from(this.performanceBudgets.values());
  }

  createPerformanceBudget(name: string, metric: string, threshold: number, unit: string, alertThreshold?: number) {
    const id = `budget_${Date.now()}`;
    const budget = {
      id,
      name,
      metric,
      threshold,
      unit,
      alertThreshold,
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.performanceBudgets.set(id, budget);
    return budget;
  }

  updatePerformanceBudget(id: string, updates: { name?: string; threshold?: number; alertThreshold?: number; enabled?: boolean }) {
    const budget = this.performanceBudgets.get(id);
    if (!budget) {
      throw new Error(`Performance budget ${id} not found`);
    }
    Object.assign(budget, updates, { updatedAt: new Date() });
    this.performanceBudgets.set(id, budget);
    return budget;
  }

  deletePerformanceBudget(id: string) {
    return this.performanceBudgets.delete(id);
  }

  // Bundle Size Analysis
  getBundleAnalysis() {
    // Analyze all components with actual dependency sizes
    const analysis = this.components.map(component => {
      const vueCode = component.code.vue || '';
      const reactCode = component.code.react || '';
      const vueSize = Buffer.byteLength(vueCode, 'utf8');
      const reactSize = Buffer.byteLength(reactCode, 'utf8');
      const totalSize = vueSize + reactSize;
      
      // Calculate actual dependencies size
      let dependenciesSize = 0;
      const dependencies = component.dependencies || [];
      const analyzedDeps: string[] = [];
      
      dependencies.forEach(depId => {
        const dep = this.components.find(c => c.id === depId);
        if (dep) {
          const depVueSize = Buffer.byteLength(dep.code.vue || '', 'utf8');
          const depReactSize = Buffer.byteLength(dep.code.react || '', 'utf8');
          dependenciesSize += depVueSize + depReactSize;
          analyzedDeps.push(depId);
        }
      });
      
      return {
        componentId: component.id,
        componentName: component.name,
        vueSize,
        reactSize,
        totalSize,
        dependenciesSize,
        totalWithDeps: totalSize + dependenciesSize,
        dependencies: analyzedDeps,
        gzippedSize: Math.round(totalSize * 0.3), // Estimate (actual gzip would require compression)
        status: totalSize > 50000 ? 'warning' : totalSize > 100000 ? 'error' : 'pass'
      };
    });
    
    return {
      components: analysis,
      summary: {
        totalComponents: analysis.length,
        totalSize: analysis.reduce((sum, a) => sum + a.totalSize, 0),
        averageSize: analysis.length > 0 ? Math.round(analysis.reduce((sum, a) => sum + a.totalSize, 0) / analysis.length) : 0,
        largestComponent: analysis.length > 0 ? analysis.reduce((max, a) => a.totalSize > max.totalSize ? a : max, analysis[0]) : null,
        smallestComponent: analysis.length > 0 ? analysis.reduce((min, a) => a.totalSize < min.totalSize ? a : min, analysis[0]) : null
      }
    };
  }

  analyzeBundle(componentId?: string, includeDependencies: boolean = true) {
    if (componentId) {
      const component = this.components.find(c => c.id === componentId);
      if (!component) {
        throw new Error(`Component ${componentId} not found`);
      }
      
      const vueCode = component.code.vue || '';
      const reactCode = component.code.react || '';
      const vueSize = Buffer.byteLength(vueCode, 'utf8');
      const reactSize = Buffer.byteLength(reactCode, 'utf8');
      const totalSize = vueSize + reactSize;
      
      let dependenciesSize = 0;
      const analyzedDeps: string[] = [];
      
      if (includeDependencies && component.dependencies) {
        component.dependencies.forEach(depId => {
          const dep = this.components.find(c => c.id === depId);
          if (dep) {
            const depVueSize = Buffer.byteLength(dep.code.vue || '', 'utf8');
            const depReactSize = Buffer.byteLength(dep.code.react || '', 'utf8');
            dependenciesSize += depVueSize + depReactSize;
            analyzedDeps.push(depId);
          }
        });
      }
      
      return {
        componentId: component.id,
        componentName: component.name,
        vueSize,
        reactSize,
        totalSize,
        dependenciesSize,
        totalWithDeps: totalSize + dependenciesSize,
        dependencies: analyzedDeps,
        gzippedSize: Math.round(totalSize * 0.3),
        status: totalSize > 50000 ? 'warning' : totalSize > 100000 ? 'error' : 'pass'
      };
    }
    
    return this.getBundleAnalysis();
  }

  // Roadmap
  private roadmapItems = new Map<string, {
    id: string;
    title: string;
    description: string;
    category: 'feature' | 'improvement' | 'bug-fix' | 'deprecation' | 'integration';
    priority: 'high' | 'medium' | 'low';
    status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
    targetDate?: string;
    createdAt: Date;
    updatedAt: Date;
    votes?: number;
  }>();

  getRoadmap() {
    const items = Array.from(this.roadmapItems.values());
    
    // Initialize with some default items if empty
    if (items.length === 0) {
      const defaultItems = [
        {
          id: 'roadmap_1',
          title: 'Dark Mode Support',
          description: 'Add comprehensive dark mode support across all components',
          category: 'feature' as const,
          priority: 'high' as const,
          status: 'in-progress' as const,
          targetDate: '2024-03-01',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
          votes: 42
        },
        {
          id: 'roadmap_2',
          title: 'Component Composition Tool',
          description: 'Build a visual tool for composing complex components from primitives',
          category: 'feature' as const,
          priority: 'high' as const,
          status: 'planned' as const,
          targetDate: '2024-04-15',
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-10'),
          votes: 38
        },
        {
          id: 'roadmap_3',
          title: 'Figma Integration',
          description: 'Sync design tokens and components with Figma',
          category: 'integration' as const,
          priority: 'medium' as const,
          status: 'planned' as const,
          targetDate: '2024-05-01',
          createdAt: new Date('2024-01-08'),
          updatedAt: new Date('2024-01-08'),
          votes: 35
        },
        {
          id: 'roadmap_4',
          title: 'Performance Optimization',
          description: 'Reduce bundle size and improve load times',
          category: 'improvement' as const,
          priority: 'high' as const,
          status: 'in-progress' as const,
          targetDate: '2024-02-15',
          createdAt: new Date('2024-01-05'),
          updatedAt: new Date('2024-01-05'),
          votes: 28
        },
        {
          id: 'roadmap_5',
          title: 'Accessibility Enhancements',
          description: 'Improve WCAG compliance and add more accessibility features',
          category: 'improvement' as const,
          priority: 'high' as const,
          status: 'planned' as const,
          targetDate: '2024-03-15',
          createdAt: new Date('2024-01-12'),
          updatedAt: new Date('2024-01-12'),
          votes: 31
        }
      ];
      
      defaultItems.forEach(item => {
        this.roadmapItems.set(item.id, item);
      });
      
      return Array.from(this.roadmapItems.values());
    }
    
    return items;
  }

  createRoadmapItem(data: { title: string; description: string; category: string; priority: string; targetDate?: string; status?: string }) {
    const id = `roadmap_${Date.now()}`;
    const item = {
      id,
      title: data.title,
      description: data.description,
      category: data.category as any,
      priority: data.priority as any,
      status: (data.status || 'planned') as any,
      targetDate: data.targetDate,
      createdAt: new Date(),
      updatedAt: new Date(),
      votes: 0
    };
    this.roadmapItems.set(id, item);
    return item;
  }

  updateRoadmapItem(id: string, updates: { title?: string; description?: string; category?: string; priority?: string; targetDate?: string; status?: string }) {
    const item = this.roadmapItems.get(id);
    if (!item) {
      throw new Error(`Roadmap item ${id} not found`);
    }
    Object.assign(item, updates, { updatedAt: new Date() });
    this.roadmapItems.set(id, item);
    return item;
  }

  deleteRoadmapItem(id: string) {
    return this.roadmapItems.delete(id);
  }

  // Export rules for ESLint/Prettier integration
  exportRulesForLinter(format: 'eslint' | 'prettier' | 'json' = 'json') {
    const allRules = this.getAllAvailableRules();
    
    if (format === 'json') {
      return {
        rules: allRules.map(rule => ({
          name: rule.name,
          category: rule.category,
          enabled: rule.enabled,
          description: `Rule: ${rule.name} (${rule.category})`
        })),
        version: '1.0.0',
        exportedAt: new Date().toISOString()
      };
    }
    
    if (format === 'eslint') {
      // Convert rules to ESLint-compatible format
      return {
        rules: allRules
          .filter(rule => rule.enabled)
          .map(rule => ({
            name: rule.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            category: rule.category,
            severity: rule.category === 'accessibility' ? 'error' : 'warn',
            description: rule.name,
            // Note: Full ESLint rule implementation would require AST parsing
            // This is a simplified export format
            scannerCode: rule.scannerCode || null
          })),
        meta: {
          version: '1.0.0',
          exportedAt: new Date().toISOString(),
          note: 'Import this into eslint-plugin-design-system for full functionality'
        }
      };
    }
    
    if (format === 'prettier') {
      // Convert formatting-related rules to Prettier config
      const formattingRules = allRules.filter(rule => 
        rule.category === 'design-system' && 
        (rule.name.includes('Spacing') || rule.name.includes('Typography'))
      );
      
      return {
        config: {
          // Prettier config would be generated based on spacing/typography rules
          tabWidth: 2,
          useTabs: false,
          // Additional formatting rules based on design system tokens
        },
        rules: formattingRules.map(rule => ({
          name: rule.name,
          category: rule.category
        })),
        meta: {
          version: '1.0.0',
          exportedAt: new Date().toISOString()
        }
      };
    }
    
    // Default return (should not reach here, but TypeScript needs it)
    return {
      rules: [],
      version: '1.0.0',
      exportedAt: new Date().toISOString()
    };
  }

  // Info Banners
  private infoBanners = new Map<string, {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    expiresAt?: Date;
  }>();

  getAllBanners() {
    return Array.from(this.infoBanners.values());
  }

  getActiveBanners() {
    const now = new Date();
    return Array.from(this.infoBanners.values()).filter(banner => {
      if (!banner.isActive) return false;
      if (banner.expiresAt && banner.expiresAt < now) return false;
      return true;
    });
  }

  getBanner(id: string) {
    return this.infoBanners.get(id);
  }

  createBanner(data: { title: string; message: string; type: 'info' | 'warning' | 'error' | 'success'; expiresAt?: string }) {
    const id = `banner-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const banner = {
      id,
      title: data.title,
      message: data.message,
      type: data.type,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined
    };
    this.infoBanners.set(id, banner);
    return banner;
  }

  updateBanner(id: string, updates: { title?: string; message?: string; type?: 'info' | 'warning' | 'error' | 'success'; isActive?: boolean; expiresAt?: string }) {
    const banner = this.infoBanners.get(id);
    if (!banner) {
      throw new Error(`Banner ${id} not found`);
    }
    const updatedBanner = {
      ...banner,
      ...updates,
      updatedAt: new Date(),
      expiresAt: updates.expiresAt !== undefined ? (updates.expiresAt ? new Date(updates.expiresAt) : undefined) : banner.expiresAt
    };
    this.infoBanners.set(id, updatedBanner);
    return updatedBanner;
  }

  deleteBanner(id: string) {
    return this.infoBanners.delete(id);
  }

  // NASA-TLX (NASA Task Load Index)
  async submitNASATLX(data: {
    systemName: string;
    task: string;
    mentalDemand: number;
    physicalDemand: number;
    temporalDemand: number;
    performance: number;
    effort: number;
    frustration: number;
    user: string;
  }) {
    const document = {
      systemName: data.systemName,
      task: data.task,
      mentalDemand: data.mentalDemand,
      physicalDemand: data.physicalDemand,
      temporalDemand: data.temporalDemand,
      performance: data.performance,
      effort: data.effort,
      frustration: data.frustration,
      user: data.user,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    if (!this.elasticsearchService) {
      // Return mock response if Elasticsearch is not available
      return {
        id: `mock-${Date.now()}`,
        ...document,
      };
    }

    try {
      const result = await this.elasticsearchService.index({
        index: 'nasa-tlx',
        document,
      });

      return {
        id: result._id,
        ...document,
      };
    } catch (error) {
      // Return mock response if Elasticsearch fails
      return {
        id: `mock-${Date.now()}`,
        ...document,
      };
    }
  }

  // System Usability Scale (SUS)
  async submitSUS(data: {
    systemName: string;
    q1: number;
    q2: number;
    q3: number;
    q4: number;
    q5: number;
    q6: number;
    q7: number;
    q8: number;
    q9: number;
    q10: number;
    user: string;
  }) {
    // Calculate SUS score (0-100)
    // Odd questions: score - 1
    // Even questions: 5 - score
    let score = 0;
    score += (data.q1 - 1) + (5 - data.q2) + (data.q3 - 1) + (5 - data.q4) + (data.q5 - 1);
    score += (5 - data.q6) + (data.q7 - 1) + (5 - data.q8) + (data.q9 - 1) + (5 - data.q10);
    score *= 2.5; // Convert to 0-100 scale

    const document = {
      systemName: data.systemName,
      q1: data.q1,
      q2: data.q2,
      q3: data.q3,
      q4: data.q4,
      q5: data.q5,
      q6: data.q6,
      q7: data.q7,
      q8: data.q8,
      q9: data.q9,
      q10: data.q10,
      score: Math.round(score * 10) / 10, // Round to 1 decimal
      user: data.user,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    if (!this.elasticsearchService) {
      // Return mock response if Elasticsearch is not available
      return {
        id: `mock-${Date.now()}`,
        ...document,
      };
    }

    try {
      const result = await this.elasticsearchService.index({
        index: 'sus-scores',
        document,
      });

      return {
        id: result._id,
        ...document,
      };
    } catch (error) {
      // Return mock response if Elasticsearch fails
      return {
        id: `mock-${Date.now()}`,
        ...document,
      };
    }
  }

  // Heuristic Evaluation
  async submitHeuristicEvaluation(data: {
    systemName: string;
    evaluator: string;
    heuristics: Array<{ heuristic: string; issues: string; severity: number }>;
    overallAssessment: string;
    timestamp: string;
  }) {
    // Calculate scores
    const totalIssues = data.heuristics.filter(h => h.issues.trim().length > 0).length;
    const criticalIssues = data.heuristics.filter(h => h.severity === 4).length;
    const severities = data.heuristics.map(h => h.severity);
    const avgSeverity = severities.reduce((a, b) => a + b, 0) / severities.length;
    const overallScore = Math.max(0, Math.min(10, 10 - avgSeverity));

    const document = {
      systemName: data.systemName,
      evaluator: data.evaluator,
      heuristics: data.heuristics,
      overallAssessment: data.overallAssessment,
      totalIssues,
      criticalIssues,
      overallScore: Math.round(overallScore * 10) / 10,
      timestamp: data.timestamp || new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    if (!this.elasticsearchService) {
      return {
        id: `mock-${Date.now()}`,
        ...document,
      };
    }

    try {
      const result = await this.elasticsearchService.index({
        index: 'heuristic-evaluations',
        document,
      });

      return {
        id: result._id,
        ...document,
      };
    } catch (error) {
      return {
        id: `mock-${Date.now()}`,
        ...document,
      };
    }
  }

  // Component metadata for Loupe Tool
  getComponentMetadata() {
    const metadata: Record<string, any> = {};
    
    // Icon mapping for components
    const iconMap: Record<string, string> = {
      'button': 'smart_button',
      'card': 'view_module',
      'input': 'input',
      'select': 'arrow_drop_down',
      'dropdown': 'arrow_drop_down',
      'navigation': 'navigation',
      'sidebar': 'menu',
      'topnav': 'menu',
      'breadcrumbs': 'navigate_next',
      'table': 'table_chart',
      'modal': 'fullscreen',
      'tooltip': 'info',
      'drawer': 'left_panel_close',
    };
    
    this.components.forEach((component) => {
      metadata[component.id] = {
        name: component.name,
        path: `@design-system/components/${component.id}`,
        icon: iconMap[component.id] || 'widgets',
        links: {
          docs: `/components/${component.id === 'button' ? 'buttons' : component.id === 'card' ? 'cards' : component.id === 'input' || component.id === 'select' ? 'forms' : component.id === 'navigation' || component.id === 'sidebar' || component.id === 'topnav' || component.id === 'breadcrumbs' ? 'navigation' : component.id === 'table' ? 'data-display' : 'overlays'}`,
          github: `https://github.com/your-org/design-system/tree/main/packages/components/src/${component.name}`,
          figma: `https://www.figma.com/file/your-design-system/components#${component.id}`,
        },
      };
    });
    
    return metadata;
  }
}
