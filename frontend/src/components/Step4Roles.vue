<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-900 mb-2">Step 4: Assign Color Roles</h2>
    <p class="text-gray-600 mb-8">
      Give each color a job: Hero, Accent, or Neutral. This step turns your palette into a ready-to-use brand system — so when you design, you know exactly which color goes where.
    </p>

    <div class="mb-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 class="font-semibold text-blue-900 mb-2">🎯 Hero</h3>
          <p class="text-sm text-blue-800">
            Your primary brand color. Use for CTAs, headers, and key UI elements.
          </p>
        </div>
        <div class="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h3 class="font-semibold text-purple-900 mb-2">✨ Accent</h3>
          <p class="text-sm text-purple-800">
            Secondary colors for highlights, links, and emphasis.
          </p>
        </div>
        <div class="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 class="font-semibold text-gray-900 mb-2">⚪ Neutral</h3>
          <p class="text-sm text-gray-800">
            Backgrounds, borders, and text colors for balance.
          </p>
        </div>
      </div>

      <!-- Color Assignment -->
      <div class="space-y-4">
        <div
          v-for="(color, index) in palette.colors"
          :key="index"
          class="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors"
        >
          <div class="flex items-center gap-4">
            <div
              class="w-16 h-16 rounded-lg shadow-md flex-shrink-0"
              :style="{ backgroundColor: color.hex }"
            ></div>
            <div class="flex-1">
              <div class="font-mono text-sm text-gray-700 mb-2">{{ color.hex }}</div>
              <div class="flex gap-2">
                <button
                  v-for="role in roles"
                  :key="role.value"
                  @click="assignRole(index, role.value)"
                  class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  :class="
                    color.role === role.value
                      ? role.classes.active
                      : role.classes.inactive
                  "
                >
                  {{ role.label }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Export Options -->
    <div class="mb-8 p-6 bg-indigo-50 border border-indigo-200 rounded-lg">
      <h3 class="text-lg font-semibold text-indigo-900 mb-4">Export Your Palette</h3>
      <div class="flex flex-wrap gap-4">
        <button
          @click="exportJSON"
          class="px-6 py-2 bg-white border border-indigo-300 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
        >
          Export JSON
        </button>
        <button
          @click="exportCSS"
          class="px-6 py-2 bg-white border border-indigo-300 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
        >
          Export CSS Variables
        </button>
        <button
          @click="exportSCSS"
          class="px-6 py-2 bg-white border border-indigo-300 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
        >
          Export SCSS Variables
        </button>
        <button
          @click="savePalette"
          class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Save Palette
        </button>
      </div>
    </div>

    <!-- Navigation -->
    <div class="flex justify-between mt-8">
      <button
        @click="$emit('back')"
        class="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
      >
        ← Back
      </button>
      <button
        @click="complete"
        class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Complete ✅
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import axios from 'axios';

const props = defineProps({
  palette: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['update-palette', 'back', 'export']);

const roles = [
  {
    value: 'hero',
    label: 'Hero',
    classes: {
      active: 'bg-blue-600 text-white',
      inactive: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    },
  },
  {
    value: 'accent',
    label: 'Accent',
    classes: {
      active: 'bg-purple-600 text-white',
      inactive: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    },
  },
  {
    value: 'neutral',
    label: 'Neutral',
    classes: {
      active: 'bg-gray-600 text-white',
      inactive: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    },
  },
];

const assignRole = (index, role) => {
  const newPalette = {
    ...props.palette,
    colors: props.palette.colors.map((c, i) =>
      i === index ? { ...c, role } : c
    ),
  };
  emit('update-palette', newPalette);
};

const exportJSON = () => {
  const dataStr = JSON.stringify(props.palette, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${props.palette.name || 'palette'}.json`;
  link.click();
};

const exportCSS = () => {
  let css = ':root {\n';
  props.palette.colors.forEach((color, index) => {
    const role = color.role || 'color';
    css += `  --color-${role}-${index + 1}: ${color.hex};\n`;
  });
  css += '}\n';
  
  const dataBlob = new Blob([css], { type: 'text/css' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${props.palette.name || 'palette'}.css`;
  link.click();
};

const exportSCSS = () => {
  let scss = '';
  props.palette.colors.forEach((color, index) => {
    const role = color.role || 'color';
    scss += `$color-${role}-${index + 1}: ${color.hex};\n`;
  });
  
  const dataBlob = new Blob([scss], { type: 'text/scss' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${props.palette.name || 'palette'}.scss`;
  link.click();
};

const savePalette = async () => {
  try {
    const response = await axios.post('http://localhost:3000/api/palettes', props.palette);
    alert('Palette saved successfully!');
    emit('export', response.data);
  } catch (error) {
    console.error('Error saving palette:', error);
    alert('Error saving palette. Please try again.');
  }
};

const complete = () => {
  emit('export', props.palette);
};
</script>

