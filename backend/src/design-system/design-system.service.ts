import { Injectable, Logger, ServiceUnavailableException, Optional, Inject } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { AnalyticsService } from '../analytics/analytics.service';
import { EncryptionService } from '../common/security/encryption.service';
import { NotFoundException as BundleComponentNotFound } from '@nestjs/common';
import { analyzeAllBundles, analyzeComponentBundle } from './bundle-analysis.service';
import { BUILTIN_RULES } from '../governance/builtin-rules';

export interface Token {
  name: string;
  value: string;
  type: string;
  category: string;
  description?: string;
  tags?: string[];
}

export interface ComponentVariant {
  name: string;
  description?: string;
  properties: {
    backgroundColor?: string; // Token reference or color value
    textColor?: string;
    borderColor?: string;
    borderWidth?: string;
    borderRadius?: string;
    padding?: string;
    fontSize?: string;
    fontWeight?: string;
    hover?: {
      backgroundColor?: string;
      textColor?: string;
      borderColor?: string;
    };
    active?: {
      backgroundColor?: string;
      textColor?: string;
      borderColor?: string;
    };
    disabled?: {
      backgroundColor?: string;
      textColor?: string;
      opacity?: string;
    };
  };
  generatedCode?: {
    vue?: string;
    react?: string;
    html?: string;
  };
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
  variants?: ComponentVariant[]; // Custom variants created via builder
  workspaceId?: string; // Workspace/team this component belongs to
  sharedWith?: string[]; // Workspace IDs this component is shared with
  isGlobal?: boolean; // If true, available to all workspaces
}

export interface ComponentProp {
  name: string;
  type: string;
  default?: any;
  required?: boolean;
  options?: string[];
  description?: string;
}

@Injectable()
export class DesignSystemService {
  private readonly logger = new Logger(DesignSystemService.name);

  private analyticsService?: AnalyticsService;

  constructor(
    @Optional() @Inject(ElasticsearchService) private readonly elasticsearchService?: ElasticsearchService,
    @Optional() @Inject(EncryptionService) private readonly encryptionService?: EncryptionService,
  ) {}

  // Set analytics service (called by module to avoid circular dependency)
  setAnalyticsService(analyticsService: AnalyticsService) {
    this.analyticsService = analyticsService;
  }

  private tokens: Token[] = [
    { name: 'color.primary', value: '#4f46e5', type: 'color', category: 'colors', description: 'Primary brand color', tags: ['brand', 'primary'] },
    { name: 'color.primary.500', value: '{color.primary}', type: 'color', category: 'colors', description: 'Primary color at 500 scale', tags: ['brand', 'primary', 'scale'] },
    { name: 'color.button.primary', value: '{color.primary.500}', type: 'color', category: 'colors', description: 'Primary button color', tags: ['button', 'primary'] },
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
    {
      id: 'navigation',
      name: 'Navigation',
      description: 'Navigation component with tabs, breadcrumbs, and pagination support',
      status: 'production',
      props: [
        { name: 'type', type: 'string', default: 'tabs', options: ['tabs', 'breadcrumbs', 'pagination', 'menu'], description: 'Navigation type', required: false },
        { name: 'items', type: 'array', default: [], description: 'Navigation items', required: true },
        { name: 'activeItem', type: 'string', default: '', description: 'Active navigation item ID', required: false },
        { name: 'orientation', type: 'string', default: 'horizontal', options: ['horizontal', 'vertical'], description: 'Navigation orientation', required: false },
        { name: 'variant', type: 'string', default: 'default', options: ['default', 'underline', 'pills', 'minimal'], description: 'Visual variant', required: false },
      ],
      code: {
        vue: `<template>
  <nav :class="[
    'flex',
    orientation === 'vertical' ? 'flex-col' : 'flex-row',
    'gap-2'
  ]">
    <template v-if="type === 'tabs'">
      <button
        v-for="item in items"
        :key="item.id"
        :class="[
          'px-4 py-2 rounded-lg font-medium transition-colors',
          activeItem === item.id
            ? variant === 'underline' 
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : variant === 'pills'
              ? 'bg-indigo-600 text-white'
              : 'bg-indigo-50 text-indigo-700'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        ]"
        @click="$emit('item-click', item.id)"
      >
        {{ item.label }}
      </button>
    </template>
    <template v-else-if="type === 'breadcrumbs'">
      <ol class="flex items-center space-x-2">
        <li v-for="(item, index) in items" :key="item.id" class="flex items-center">
          <a
            v-if="index < items.length - 1"
            :href="item.href"
            class="text-gray-500 hover:text-gray-700"
            @click.prevent="$emit('item-click', item.id)"
          >
            {{ item.label }}
          </a>
          <span v-else class="text-gray-900 font-medium">{{ item.label }}</span>
          <span v-if="index < items.length - 1" class="mx-2 text-gray-400">/</span>
        </li>
      </ol>
    </template>
    <template v-else-if="type === 'pagination'">
      <div class="flex items-center gap-2">
        <button
          :disabled="currentPage === 1"
          class="px-3 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed"
          @click="$emit('page-change', currentPage - 1)"
        >
          Previous
        </button>
        <button
          v-for="page in pages"
          :key="page"
          :class="[
            'px-4 py-2 rounded-lg border',
            page === currentPage ? 'bg-indigo-600 text-white' : 'hover:bg-gray-50'
          ]"
          @click="$emit('page-change', page)"
        >
          {{ page }}
        </button>
        <button
          :disabled="currentPage === totalPages"
          class="px-3 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed"
          @click="$emit('page-change', currentPage + 1)"
        >
          Next
        </button>
      </div>
    </template>
  </nav>
</template>

<script setup>
defineProps({
  type: { type: String, default: 'tabs' },
  items: { type: Array, default: () => [] },
  activeItem: { type: String, default: '' },
  orientation: { type: String, default: 'horizontal' },
  variant: { type: String, default: 'default' },
  currentPage: { type: Number, default: 1 },
  totalPages: { type: Number, default: 1 }
});

defineEmits(['item-click', 'page-change']);
</script>`,
        react: `import React from 'react';

export const Navigation = ({ 
  type = 'tabs', 
  items = [], 
  activeItem = '', 
  orientation = 'horizontal',
  variant = 'default',
  currentPage = 1,
  totalPages = 1,
  onItemClick,
  onPageChange
}) => {
  const baseClasses = \`flex gap-2 \${orientation === 'vertical' ? 'flex-col' : 'flex-row'}\`;
  
  if (type === 'tabs') {
    return (
      <nav className={baseClasses}>
        {items.map(item => (
          <button
            key={item.id}
            className={\`px-4 py-2 rounded-lg font-medium transition-colors \${
              activeItem === item.id
                ? variant === 'underline'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : variant === 'pills'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-indigo-50 text-indigo-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }\`}
            onClick={() => onItemClick?.(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    );
  }
  
  if (type === 'breadcrumbs') {
    return (
      <nav>
        <ol className="flex items-center space-x-2">
          {items.map((item, index) => (
            <li key={item.id} className="flex items-center">
              {index < items.length - 1 ? (
                <a
                  href={item.href}
                  className="text-gray-500 hover:text-gray-700"
                  onClick={(e) => {
                    e.preventDefault();
                    onItemClick?.(item.id);
                  }}
                >
                  {item.label}
                </a>
              ) : (
                <span className="text-gray-900 font-medium">{item.label}</span>
              )}
              {index < items.length - 1 && <span className="mx-2 text-gray-400">/</span>}
            </li>
          ))}
        </ol>
      </nav>
    );
  }
  
  if (type === 'pagination') {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    return (
      <nav className="flex items-center gap-2">
        <button
          disabled={currentPage === 1}
          className="px-3 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => onPageChange?.(currentPage - 1)}
        >
          Previous
        </button>
        {pages.map(page => (
          <button
            key={page}
            className={\`px-4 py-2 rounded-lg border \${
              page === currentPage ? 'bg-indigo-600 text-white' : 'hover:bg-gray-50'
            }\`}
            onClick={() => onPageChange?.(page)}
          >
            {page}
          </button>
        ))}
        <button
          disabled={currentPage === totalPages}
          className="px-3 py-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => onPageChange?.(currentPage + 1)}
        >
          Next
        </button>
      </nav>
    );
  }
  
  return null;
};`,
      },
      dependencies: ['button'],
      examples: [
        '<Navigation type="tabs" :items="[{id: \'tab1\', label: \'Tab 1\'}]" :active-item="\'tab1\'" />',
        '<Navigation type="breadcrumbs" :items="breadcrumbItems" />',
        '<Navigation type="pagination" :current-page="1" :total-pages="10" />'
      ],
      accessibility: {
        wcag: 'AA',
        notes: 'Navigation has proper ARIA labels, keyboard navigation, and focus management',
      },
    },
    {
      id: 'table',
      name: 'Table',
      description: 'Data table component with sorting, filtering, and pagination',
      status: 'production',
      props: [
        { name: 'columns', type: 'array', default: [], description: 'Table column definitions', required: true },
        { name: 'data', type: 'array', default: [], description: 'Table data rows', required: true },
        { name: 'sortable', type: 'boolean', default: false, description: 'Enable column sorting', required: false },
        { name: 'filterable', type: 'boolean', default: false, description: 'Enable row filtering', required: false },
        { name: 'paginated', type: 'boolean', default: false, description: 'Enable pagination', required: false },
        { name: 'pageSize', type: 'number', default: 10, description: 'Rows per page', required: false },
        { name: 'stripe', type: 'boolean', default: false, description: 'Alternating row colors', required: false },
        { name: 'hover', type: 'boolean', default: true, description: 'Row hover effect', required: false },
      ],
      code: {
        vue: `<template>
  <div class="overflow-x-auto">
    <table :class="[
      'min-w-full divide-y divide-gray-200',
      stripe ? 'bg-white' : 'bg-gray-50'
    ]">
      <thead class="bg-gray-50">
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            :class="[
              'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
              sortable && column.sortable !== false ? 'cursor-pointer hover:bg-gray-100' : ''
            ]"
            @click="sortable && column.sortable !== false ? handleSort(column.key) : null"
          >
            <div class="flex items-center gap-2">
              {{ column.label }}
              <span v-if="sortable && column.sortable !== false && sortColumn === column.key" class="material-symbols-outlined text-sm">
                {{ sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward' }}
              </span>
            </div>
          </th>
        </tr>
      </thead>
      <tbody :class="[
        'bg-white divide-y divide-gray-200',
        stripe ? '' : ''
      ]">
        <tr
          v-for="(row, index) in paginatedData"
          :key="index"
          :class="[
            hover ? 'hover:bg-gray-50' : '',
            stripe && index % 2 === 0 ? 'bg-gray-50' : ''
          ]"
        >
          <td
            v-for="column in columns"
            :key="column.key"
            class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
          >
            <slot :name="\`cell-\${column.key}\`" :row="row" :value="row[column.key]">
              {{ row[column.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="paginated" class="mt-4 flex items-center justify-between">
      <div class="text-sm text-gray-700">
        Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, data.length) }} of {{ data.length }} results
      </div>
      <div class="flex gap-2">
        <button
          :disabled="currentPage === 1"
          class="px-3 py-2 rounded-lg border disabled:opacity-50"
          @click="currentPage--"
        >
          Previous
        </button>
        <button
          :disabled="currentPage >= totalPages"
          class="px-3 py-2 rounded-lg border disabled:opacity-50"
          @click="currentPage++"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  columns: { type: Array, default: () => [] },
  data: { type: Array, default: () => [] },
  sortable: { type: Boolean, default: false },
  filterable: { type: Boolean, default: false },
  paginated: { type: Boolean, default: false },
  pageSize: { type: Number, default: 10 },
  stripe: { type: Boolean, default: false },
  hover: { type: Boolean, default: true }
});

const currentPage = ref(1);
const sortColumn = ref(null);
const sortDirection = ref('asc');

const sortedData = computed(() => {
  if (!props.sortable || !sortColumn.value) return props.data;
  
  return [...props.data].sort((a, b) => {
    const aVal = a[sortColumn.value];
    const bVal = b[sortColumn.value];
    const modifier = sortDirection.value === 'asc' ? 1 : -1;
    return aVal > bVal ? modifier : aVal < bVal ? -modifier : 0;
  });
});

const totalPages = computed(() => Math.ceil(sortedData.value.length / props.pageSize));

const paginatedData = computed(() => {
  if (!props.paginated) return sortedData.value;
  const start = (currentPage.value - 1) * props.pageSize;
  return sortedData.value.slice(start, start + props.pageSize);
});

const handleSort = (columnKey) => {
  if (sortColumn.value === columnKey) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn.value = columnKey;
    sortDirection.value = 'asc';
  }
};
</script>`,
        react: `import React, { useState, useMemo } from 'react';

export const Table = ({
  columns = [],
  data = [],
  sortable = false,
  filterable = false,
  paginated = false,
  pageSize = 10,
  stripe = false,
  hover = true
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const sortedData = useMemo(() => {
    if (!sortable || !sortColumn) return data;
    
    return [...data].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      const modifier = sortDirection === 'asc' ? 1 : -1;
      return aVal > bVal ? modifier : aVal < bVal ? -modifier : 0;
    });
  }, [data, sortable, sortColumn, sortDirection]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const paginatedData = useMemo(() => {
    if (!paginated) return sortedData;
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, paginated, currentPage, pageSize]);

  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className={\`min-w-full divide-y divide-gray-200 \${stripe ? 'bg-white' : 'bg-gray-50'}\`}>
        <thead className="bg-gray-50">
          <tr>
            {columns.map(column => (
              <th
                key={column.key}
                className={\`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider \${
                  sortable && column.sortable !== false ? 'cursor-pointer hover:bg-gray-100' : ''
                }\`}
                onClick={sortable && column.sortable !== false ? () => handleSort(column.key) : undefined}
              >
                <div className="flex items-center gap-2">
                  {column.label}
                  {sortable && column.sortable !== false && sortColumn === column.key && (
                    <span className="material-symbols-outlined text-sm">
                      {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {paginatedData.map((row, index) => (
            <tr
              key={index}
              className={\`\${
                hover ? 'hover:bg-gray-50' : ''
              } \${
                stripe && index % 2 === 0 ? 'bg-gray-50' : ''
              }\`}
            >
              {columns.map(column => (
                <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {paginated && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, data.length)} of {data.length} results
          </div>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-lg border disabled:opacity-50"
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </button>
            <button
              disabled={currentPage >= totalPages}
              className="px-3 py-2 rounded-lg border disabled:opacity-50"
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};`,
      },
      dependencies: ['navigation', 'button'],
      examples: [
        '<Table :columns="columns" :data="tableData" :sortable="true" />',
        '<Table :columns="columns" :data="tableData" :paginated="true" :page-size="20" />',
        '<Table :columns="columns" :data="tableData" :stripe="true" :hover="true" />'
      ],
      accessibility: {
        wcag: 'AA',
        notes: 'Table has proper ARIA labels, keyboard navigation, and screen reader support',
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

  /**
   * Get token relationships - analyzes references, aliases, semantic relationships, and dependencies
   */
  getTokenRelationships(tokenName?: string): {
    nodes: Array<{
      id: string;
      name: string;
      category: string;
      type: string;
      value: string;
      isBase: boolean;
      isAlias: boolean;
    }>;
    edges: Array<{
      from: string;
      to: string;
      type: 'reference' | 'semantic' | 'category' | 'scale';
      strength: number;
    }>;
    relationships: {
      references: Record<string, string[]>;
      referencedBy: Record<string, string[]>;
      semantic: Record<string, string[]>;
      category: Record<string, string[]>;
      scale: Record<string, string[]>;
    };
  } {
    const allTokens = this.getAllTokens();
    const nodes: Array<{
      id: string;
      name: string;
      category: string;
      type: string;
      value: string;
      isBase: boolean;
      isAlias: boolean;
    }> = [];
    const edges: Array<{
      from: string;
      to: string;
      type: 'reference' | 'semantic' | 'category' | 'scale';
      strength: number;
    }> = [];
    const references: Record<string, string[]> = {};
    const referencedBy: Record<string, string[]> = {};
    const semantic: Record<string, string[]> = {};
    const category: Record<string, string[]> = {};
    const scale: Record<string, string[]> = {};

    // Build nodes
    allTokens.forEach(token => {
      const isAlias = this.isTokenReference(token.value);
      const isBase = !isAlias;
      
      nodes.push({
        id: token.name,
        name: token.name,
        category: token.category,
        type: token.type,
        value: token.value,
        isBase,
        isAlias,
      });

      // Initialize relationship maps
      references[token.name] = [];
      referencedBy[token.name] = [];
      semantic[token.name] = [];
      category[token.name] = [];
      scale[token.name] = [];
    });

    // Analyze references/aliases
    allTokens.forEach(token => {
      const referencedTokens = this.extractTokenReferences(token.value);
      referencedTokens.forEach(refTokenName => {
        if (allTokens.find(t => t.name === refTokenName)) {
          references[token.name].push(refTokenName);
          if (!referencedBy[refTokenName]) {
            referencedBy[refTokenName] = [];
          }
          referencedBy[refTokenName].push(token.name);
          
          edges.push({
            from: token.name,
            to: refTokenName,
            type: 'reference',
            strength: 1.0,
          });
        }
      });
    });

    // Analyze semantic relationships (same semantic meaning across categories)
    const semanticGroups: Record<string, string[]> = {};
    allTokens.forEach(token => {
      const semanticKey = this.extractSemanticKey(token.name);
      if (semanticKey) {
        if (!semanticGroups[semanticKey]) {
          semanticGroups[semanticKey] = [];
        }
        semanticGroups[semanticKey].push(token.name);
      }
    });

    Object.values(semanticGroups).forEach(group => {
      if (group.length > 1) {
        for (let i = 0; i < group.length; i++) {
          for (let j = i + 1; j < group.length; j++) {
            semantic[group[i]].push(group[j]);
            semantic[group[j]].push(group[i]);
            
            edges.push({
              from: group[i],
              to: group[j],
              type: 'semantic',
              strength: 0.5,
            });
          }
        }
      }
    });

    // Analyze category relationships (same category)
    const categoryGroups: Record<string, string[]> = {};
    allTokens.forEach(token => {
      if (!categoryGroups[token.category]) {
        categoryGroups[token.category] = [];
      }
      categoryGroups[token.category].push(token.name);
    });

    Object.entries(categoryGroups).forEach(([cat, tokens]) => {
      if (tokens.length > 1) {
        for (let i = 0; i < tokens.length; i++) {
          for (let j = i + 1; j < tokens.length; j++) {
            category[tokens[i]].push(tokens[j]);
            category[tokens[j]].push(tokens[i]);
            
            edges.push({
              from: tokens[i],
              to: tokens[j],
              type: 'category',
              strength: 0.3,
            });
          }
        }
      }
    });

    // Analyze scale relationships (same scale progression)
    const scaleGroups: Record<string, string[]> = {};
    allTokens.forEach(token => {
      const scaleKey = this.extractScaleKey(token.name);
      if (scaleKey) {
        if (!scaleGroups[scaleKey]) {
          scaleGroups[scaleKey] = [];
        }
        scaleGroups[scaleKey].push(token.name);
      }
    });

    Object.values(scaleGroups).forEach(group => {
      if (group.length > 1) {
        // Sort by scale value if possible
        const sorted = group.sort((a, b) => {
          const aValue = this.extractScaleValue(a);
          const bValue = this.extractScaleValue(b);
          if (aValue !== null && bValue !== null) {
            return aValue - bValue;
          }
          return a.localeCompare(b);
        });

        for (let i = 0; i < sorted.length - 1; i++) {
          scale[sorted[i]].push(sorted[i + 1]);
          scale[sorted[i + 1]].push(sorted[i]);
          
          edges.push({
            from: sorted[i],
            to: sorted[i + 1],
            type: 'scale',
            strength: 0.4,
          });
        }
      }
    });

    // Filter by tokenName if provided
    if (tokenName) {
      const relatedTokens = new Set<string>();
      relatedTokens.add(tokenName);
      
      // Add all related tokens
      [references, referencedBy, semantic, category, scale].forEach(relMap => {
        if (relMap[tokenName]) {
          relMap[tokenName].forEach(t => relatedTokens.add(t));
        }
      });

      const filteredNodes = nodes.filter(n => relatedTokens.has(n.id));
      const filteredEdges = edges.filter(e => 
        relatedTokens.has(e.from) && relatedTokens.has(e.to)
      );

      return {
        nodes: filteredNodes,
        edges: filteredEdges,
        relationships: {
          references,
          referencedBy,
          semantic,
          category,
          scale,
        },
      };
    }

    return {
      nodes,
      edges,
      relationships: {
        references,
        referencedBy,
        semantic,
        category,
        scale,
      },
    };
  }

  /**
   * Get impact analysis for a token - what tokens/components would be affected if this token changes
   */
  getTokenImpactAnalysis(tokenName: string): {
    token: Token | null;
    directlyAffected: string[];
    indirectlyAffected: string[];
    affectedComponents: string[];
    totalImpact: number;
  } {
    const token = this.tokens.find(t => t.name === tokenName);
    if (!token) {
      return {
        token: null,
        directlyAffected: [],
        indirectlyAffected: [],
        affectedComponents: [],
        totalImpact: 0,
      };
    }

    const relationships = this.getTokenRelationships();
    const directlyAffected = relationships.relationships.referencedBy[tokenName] || [];
    
    // Get indirectly affected (tokens that reference the directly affected tokens)
    const indirectlyAffected = new Set<string>();
    directlyAffected.forEach(affectedToken => {
      const subAffected = relationships.relationships.referencedBy[affectedToken] || [];
      subAffected.forEach(t => indirectlyAffected.add(t));
    });

    // Find components that use this token (simplified - in real system would scan component code)
    const affectedComponents: string[] = [];
    this.components.forEach(component => {
      const code = component.code.vue || component.code.react || '';
      if (code.includes(tokenName) || code.includes(`{${tokenName}}`)) {
        affectedComponents.push(component.name);
      }
    });

    return {
      token,
      directlyAffected,
      indirectlyAffected: Array.from(indirectlyAffected),
      affectedComponents,
      totalImpact: directlyAffected.length + indirectlyAffected.size + affectedComponents.length,
    };
  }

  /**
   * Helper: Check if a value is a token reference
   */
  private isTokenReference(value: string): boolean {
    return value.startsWith('{') && value.endsWith('}');
  }

  /**
   * Helper: Extract token references from a value
   */
  private extractTokenReferences(value: string): string[] {
    const references: string[] = [];
    const regex = /\{([^}]+)\}/g;
    let match;
    while ((match = regex.exec(value)) !== null) {
      references.push(match[1]);
    }
    return references;
  }

  /**
   * Helper: Extract semantic key from token name (e.g., "primary", "secondary")
   */
  private extractSemanticKey(tokenName: string): string | null {
    const parts = tokenName.split('.');
    const semanticKeywords = ['primary', 'secondary', 'tertiary', 'success', 'error', 'warning', 'info', 'neutral'];
    for (const part of parts) {
      if (semanticKeywords.includes(part.toLowerCase())) {
        return part.toLowerCase();
      }
    }
    return null;
  }

  /**
   * Helper: Extract scale key from token name (e.g., "color.neutral" from "color.neutral.500")
   */
  private extractScaleKey(tokenName: string): string | null {
    const parts = tokenName.split('.');
    if (parts.length >= 3) {
      // Check if last part is a scale value (number or size like xs, sm, md, lg)
      const lastPart = parts[parts.length - 1];
      const scaleValues = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
      if (scaleValues.includes(lastPart.toLowerCase()) || /^\d+$/.test(lastPart)) {
        return parts.slice(0, -1).join('.');
      }
    }
    return null;
  }

  /**
   * Helper: Extract scale value for sorting
   */
  private extractScaleValue(tokenName: string): number | null {
    const parts = tokenName.split('.');
    const lastPart = parts[parts.length - 1];
    const scaleMap: Record<string, number> = {
      'xs': 1, 'sm': 2, 'md': 3, 'lg': 4, 'xl': 5, '2xl': 6,
      '50': 50, '100': 100, '200': 200, '300': 300, '400': 400,
      '500': 500, '600': 600, '700': 700, '800': 800, '900': 900,
    };
    if (scaleMap[lastPart.toLowerCase()]) {
      return scaleMap[lastPart.toLowerCase()];
    }
    const numMatch = lastPart.match(/^\d+$/);
    if (numMatch) {
      return parseInt(numMatch[0], 10);
    }
    return null;
  }

  getAllComponents(status?: string, workspaceId?: string): Component[] {
    let filtered = this.components;

    // Filter by workspace if provided
    if (workspaceId) {
      filtered = filtered.filter(
        c => c.workspaceId === workspaceId || c.isGlobal || c.sharedWith?.includes(workspaceId),
      );
    }

    // Filter by status if provided
    if (status) {
      filtered = filtered.filter(component => component.status === status);
    }

    return filtered;
  }

  /**
   * Get component variants (both built-in and custom)
   */
  getComponentVariants(componentId: string): ComponentVariant[] {
    const component = this.getComponentById(componentId);
    if (!component) {
      return [];
    }
    
    // Extract built-in variants from props
    const variantProp = component.props.find(p => p.name === 'variant');
    const builtInVariants: ComponentVariant[] = [];
    
    if (variantProp && variantProp.options) {
      variantProp.options.forEach(option => {
        builtInVariants.push({
          name: option,
          description: `Built-in ${option} variant`,
          properties: {}, // Will be generated from code
        });
      });
    }
    
    // Merge with custom variants
    const customVariants = component.variants || [];
    
    return [...builtInVariants, ...customVariants];
  }

  /**
   * Add or update a component variant
   */
  saveComponentVariant(componentId: string, variant: ComponentVariant): ComponentVariant {
    const component = this.getComponentById(componentId);
    if (!component) {
      throw new Error(`Component ${componentId} not found`);
    }
    
    if (!component.variants) {
      component.variants = [];
    }
    
    // Generate code for the variant
    variant.generatedCode = this.generateVariantCode(component, variant);
    
    // Update or add variant
    const existingIndex = component.variants.findIndex(v => v.name === variant.name);
    if (existingIndex >= 0) {
      component.variants[existingIndex] = variant;
    } else {
      component.variants.push(variant);
    }
    
    // Update variant prop options if needed
    const variantProp = component.props.find(p => p.name === 'variant');
    if (variantProp && !variantProp.options?.includes(variant.name)) {
      if (!variantProp.options) {
        variantProp.options = [];
      }
      variantProp.options.push(variant.name);
    }
    
    return variant;
  }

  /**
   * Delete a component variant
   */
  deleteComponentVariant(componentId: string, variantName: string): boolean {
    const component = this.getComponentById(componentId);
    if (!component || !component.variants) {
      return false;
    }
    
    const index = component.variants.findIndex(v => v.name === variantName);
    if (index >= 0) {
      component.variants.splice(index, 1);
      return true;
    }
    
    return false;
  }

  /**
   * Generate code for a variant
   */
  private generateVariantCode(component: Component, variant: ComponentVariant): {
    vue?: string;
    react?: string;
    html?: string;
  } {
    const props = variant.properties;
    const classes: string[] = [];
    
    // Build Tailwind classes from properties
    if (props.backgroundColor) {
      if (props.backgroundColor.startsWith('{')) {
        // Token reference - would need to resolve
        classes.push(`bg-[var(--${props.backgroundColor.slice(1, -1).replace(/\./g, '-')})]`);
      } else {
        classes.push(`bg-${props.backgroundColor}`);
      }
    }
    
    if (props.textColor) {
      if (props.textColor.startsWith('{')) {
        classes.push(`text-[var(--${props.textColor.slice(1, -1).replace(/\./g, '-')})]`);
      } else {
        classes.push(`text-${props.textColor}`);
      }
    }
    
    if (props.borderColor) {
      classes.push(`border-${props.borderColor}`);
    }
    
    if (props.borderWidth) {
      classes.push(`border-${props.borderWidth}`);
    }
    
    if (props.borderRadius) {
      classes.push(`rounded-${props.borderRadius}`);
    }
    
    if (props.padding) {
      classes.push(`p-${props.padding}`);
    }
    
    if (props.fontSize) {
      classes.push(`text-${props.fontSize}`);
    }
    
    if (props.fontWeight) {
      classes.push(`font-${props.fontWeight}`);
    }
    
    // Hover states
    if (props.hover) {
      if (props.hover.backgroundColor) {
        classes.push(`hover:bg-${props.hover.backgroundColor}`);
      }
      if (props.hover.textColor) {
        classes.push(`hover:text-${props.hover.textColor}`);
      }
    }
    
    const classString = classes.join(' ');
    
    return {
      vue: `<button class="${classString}">${variant.name}</button>`,
      react: `<button className="${classString}">${variant.name}</button>`,
      html: `<button class="${classString}">${variant.name}</button>`,
    };
  }

  getComponentById(id: string): Component | undefined {
    return this.components.find(component => component.id === id);
  }

  getComponentsByStatus(status: string): Component[] {
    return this.components.filter(component => component.status === status);
  }

  /**
   * Test coverage for a component.
   *
   * The design system stores no test runs or coverage reports for its
   * components, so there is no coverage to report: the percentages are null and
   * `available` is false. What can be stated truthfully is the component's
   * testable surface, counted from its real prop definitions.
   */
  calculateTestCoverage(componentId: string): {
    componentId: string;
    componentName: string;
    available: boolean;
    reason: string;
    statements: number | null;
    branches: number | null;
    functions: number | null;
    lines: number | null;
    surface: {
      props: number;
      requiredProps: number;
      booleanProps: number;
      enumProps: number;
      enumOptions: number;
      functionProps: number;
      /** One case per prop, plus one per extra enum option and the false state of each boolean */
      suggestedTestCases: number;
    };
  } {
    const component = this.getComponentById(componentId);
    if (!component) {
      throw new BundleComponentNotFound(`Component '${componentId}' not found`);
    }

    const props = component.props || [];
    const enumProps = props.filter(p => Array.isArray(p.options) && p.options.length > 0);
    const booleanProps = props.filter(p => p.type === 'boolean');
    const enumOptions = enumProps.reduce((sum, p) => sum + p.options!.length, 0);
    const suggestedTestCases =
      props.length +
      enumProps.reduce((sum, p) => sum + (p.options!.length - 1), 0) +
      booleanProps.length;

    return {
      componentId: component.id,
      componentName: component.name,
      available: false,
      reason: 'No test runs or coverage reports are recorded for this component, so coverage cannot be reported.',
      statements: null,
      branches: null,
      functions: null,
      lines: null,
      surface: {
        props: props.length,
        requiredProps: props.filter(p => p.required).length,
        booleanProps: booleanProps.length,
        enumProps: enumProps.length,
        enumOptions,
        functionProps: props.filter(p => p.type === 'function').length,
        suggestedTestCases,
      },
    };
  }

  /**
   * Create a new component and auto-link to matching requests
   */
  createComponent(data: {
    id: string;
    name: string;
    description: string;
    status?: 'production' | 'in-progress' | 'planned' | 'deprecated';
    props?: ComponentProp[];
    code?: { vue?: string; react?: string; html?: string };
    dependencies?: string[];
    examples?: string[];
    accessibility?: { wcag: string; notes?: string };
    linkedRequestId?: string; // Optional: explicitly link to a specific request
    workspaceId?: string; // Optional: workspace this component belongs to
    isGlobal?: boolean; // Optional: make component available to all workspaces
  }): Component {
    const component: Component = {
      id: data.id,
      name: data.name,
      description: data.description,
      status: data.status || 'in-progress',
      props: data.props || [],
      code: data.code ? {
        vue: data.code.vue || '',
        react: data.code.react || '',
        html: data.code.html,
      } : { vue: '', react: '' },
      dependencies: data.dependencies || [],
      examples: data.examples || [],
      accessibility: data.accessibility,
      workspaceId: data.workspaceId,
      isGlobal: data.isGlobal || false,
    };

    this.components.push(component);

    // Auto-link to matching component requests
    // This will be called via ComponentRequestsService if available
    // We'll use a callback pattern to avoid circular dependency
    if (typeof (this as any).onComponentCreatedCallback === 'function') {
      (this as any).onComponentCreatedCallback(component.id, component.name, data.linkedRequestId);
    }

    return component;
  }

  /**
   * Set callback for component creation (called from ComponentRequestsService)
   */
  setComponentCreatedCallback(callback: (componentId: string, componentName: string, linkedRequestId?: string) => void) {
    (this as any).onComponentCreatedCallback = callback;
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
    const rules = BUILTIN_RULES;
    
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

  // Bundle Size Analysis: raw, gzip and brotli sizes measured from the stored
  // component source with zlib (see bundle-analysis.service.ts)
  getBundleAnalysis() {
    return analyzeAllBundles(this.components);
  }

  analyzeBundle(componentId?: string, includeDependencies: boolean = true) {
    if (componentId) {
      const component = this.components.find(c => c.id === componentId);
      if (!component) {
        throw new BundleComponentNotFound(`Component '${componentId}' not found`);
      }
      return analyzeComponentBundle(component, this.components, includeDependencies !== false);
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

    return this.storeSurveyResponse('nasa-tlx', document);
  }

  /**
   * Stores a survey response. Fails with 503 rather than reporting a save that didn't happen.
   */
  private async storeSurveyResponse<T extends object>(index: string, document: T): Promise<T & { id: string }> {
    if (!this.elasticsearchService) {
      throw new ServiceUnavailableException('Survey storage is not configured');
    }
    try {
      const result = await this.elasticsearchService.index({ index, document, refresh: 'wait_for' });
      return { id: result._id, ...document };
    } catch (error) {
      this.logger.error(`Failed to store ${index} response: ${(error as Error).message}`);
      throw new ServiceUnavailableException('Survey storage is unavailable, please try again later');
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

    return this.storeSurveyResponse('sus-scores', document);
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

    return this.storeSurveyResponse('heuristic-evaluations', document);
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
