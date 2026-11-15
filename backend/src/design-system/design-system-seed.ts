import type { Component, Token } from './design-system.service';

/**
 * The design system's starting content. DesignSystemService seeds these into
 * Elasticsearch once, when the indexes are empty; after that the stored
 * documents are the source of truth and these arrays are not read again.
 */
export const SEED_TOKENS: readonly Token[] = [
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

// Indented as they were inside DesignSystemService: the code strings below keep their exact whitespace
export const SEED_COMPONENTS: readonly Component[] = [
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
