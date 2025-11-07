<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative flex">
    <!-- Drawer -->
    <DocumentationDrawer :isOpen="drawerOpen" @close="closeDrawer" @toggle="toggleDrawer" />
    
    <!-- Main Content Area -->
    <div 
      class="flex-1 h-full transition-all duration-300 relative overflow-hidden"
      :style="drawerOpen ? 'margin-left: 256px;' : 'margin-left: 48px;'"
    >
      <div class="h-full p-8 overflow-auto">
        <!-- Hero Section -->
        <div class="max-w-7xl mx-auto mb-8">
          <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
            <div class="absolute inset-0 opacity-10 texture-pattern"></div>
            
            <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div class="flex-1">
                <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  Component Playground
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Experiment with components in real-time. Edit props, see live previews, and export code snippets.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Playground Interface -->
        <div class="max-w-7xl mx-auto">
          <div class="grid lg:grid-cols-2 gap-6 mb-6">
            <!-- Component Selector -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                Select Component
              </label>
              <select
                v-model="selectedComponent"
                @change="loadComponent"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                :class="isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'"
              >
                <option value="">Choose a component...</option>
                <option value="button">Button</option>
                <option value="card">Card</option>
                <option value="input">Input</option>
                <option value="select">Select</option>
                <option value="checkbox">Checkbox</option>
                <option value="radio">Radio Button</option>
                <option value="textarea">Textarea</option>
                <option value="badge">Badge</option>
                <option value="alert">Alert</option>
              </select>
            </div>

            <!-- Code Export -->
            <div 
              class="rounded-lg shadow-sm border p-6 flex items-center gap-4"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <button
                @click="copyCode"
                class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                :disabled="!selectedComponent"
              >
                Copy Code
              </button>
              <button
                @click="exportAsVue"
                class="flex-1 px-4 py-2 border rounded-lg transition-colors text-sm font-medium"
                :class="isDarkMode 
                  ? 'border-gray-600 text-gray-300 hover:bg-slate-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'"
                :disabled="!selectedComponent"
              >
                Export Vue
              </button>
              <button
                @click="exportAsReact"
                class="flex-1 px-4 py-2 border rounded-lg transition-colors text-sm font-medium"
                :class="isDarkMode 
                  ? 'border-gray-600 text-gray-300 hover:bg-slate-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'"
                :disabled="!selectedComponent"
              >
                Export React
              </button>
            </div>
          </div>

          <!-- Main Playground Area -->
          <div class="grid lg:grid-cols-2 gap-6">
            <!-- Props Editor -->
            <div 
              class="rounded-lg shadow-sm border"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="p-4 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Props Editor
                </h3>
              </div>
              <div class="p-6">
                <div v-if="!selectedComponent" class="text-center py-12">
                  <span class="material-symbols-outlined text-6xl mb-4" :class="isDarkMode ? 'text-gray-600' : 'text-gray-300'">
                    code
                  </span>
                  <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    Select a component to start editing props
                  </p>
                </div>
                <div v-else class="space-y-4">
                  <div v-for="prop in componentProps" :key="prop.name">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      {{ prop.label }}
                      <span v-if="prop.required" class="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      v-if="prop.type === 'text' || prop.type === 'number'"
                      v-model="propValues[prop.name]"
                      :type="prop.type"
                      :placeholder="prop.placeholder"
                      class="w-full px-3 py-2 border rounded-lg text-sm"
                      :class="isDarkMode 
                        ? 'border-gray-600 bg-slate-700 text-white' 
                        : 'border-gray-300 bg-white text-gray-900'"
                    />
                    <select
                      v-else-if="prop.type === 'select'"
                      v-model="propValues[prop.name]"
                      class="w-full px-3 py-2 border rounded-lg text-sm"
                      :class="isDarkMode 
                        ? 'border-gray-600 bg-slate-700 text-white' 
                        : 'border-gray-300 bg-white text-gray-900'"
                    >
                      <option v-for="option in prop.options" :key="option" :value="option">
                        {{ option }}
                      </option>
                    </select>
                    <label v-else-if="prop.type === 'checkbox'" class="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        v-model="propValues[prop.name]"
                        class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        {{ prop.label }}
                      </span>
                    </label>
                    <div v-if="prop.description" class="text-xs mt-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                      {{ prop.description }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Preview Area -->
            <div 
              class="rounded-lg shadow-sm border"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="p-4 border-b flex items-center justify-between" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Live Preview
                </h3>
                <button
                  @click="toggleFullscreen"
                  class="p-2 rounded-lg transition-colors"
                  :class="isDarkMode 
                    ? 'text-gray-400 hover:text-gray-300 hover:bg-slate-700' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'"
                  aria-label="Toggle fullscreen"
                >
                  <span class="material-symbols-outlined">fullscreen</span>
                </button>
              </div>
              <div class="p-8 min-h-[400px] flex items-center justify-center" :class="isDarkMode ? 'bg-slate-950' : 'bg-gray-50'">
                <div v-if="!selectedComponent" class="text-center">
                  <span class="material-symbols-outlined text-6xl mb-4" :class="isDarkMode ? 'text-gray-600' : 'text-gray-300'">
                    preview
                  </span>
                  <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    Component preview will appear here
                  </p>
                </div>
                <component-preview 
                  v-else
                  :key="`${selectedComponent}-${JSON.stringify(propValues)}`"
                  :component="selectedComponent"
                  :props="propValues"
                />
              </div>
            </div>
          </div>

          <!-- Code Output -->
          <div 
            v-if="selectedComponent"
            class="mt-6 rounded-lg shadow-sm border"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <div class="p-4 border-b flex items-center justify-between" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
              <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Generated Code
              </h3>
              <div class="flex gap-2">
                <button
                  @click="codeFormat = 'vue'"
                  class="px-3 py-1 rounded text-xs font-medium transition-colors"
                  :class="codeFormat === 'vue' 
                    ? (isDarkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white')
                    : (isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900')"
                >
                  Vue
                </button>
                <button
                  @click="codeFormat = 'react'"
                  class="px-3 py-1 rounded text-xs font-medium transition-colors"
                  :class="codeFormat === 'react' 
                    ? (isDarkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white')
                    : (isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900')"
                >
                  React
                </button>
                <button
                  @click="codeFormat = 'html'"
                  class="px-3 py-1 rounded text-xs font-medium transition-colors"
                  :class="codeFormat === 'html' 
                    ? (isDarkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white')
                    : (isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900')"
                >
                  HTML
                </button>
              </div>
            </div>
            <div class="p-6">
              <div class="rounded-lg p-4 overflow-x-auto" :class="isDarkMode ? 'bg-slate-950' : 'bg-gray-900'">
                <pre class="text-green-400 text-sm font-mono"><code>{{ generatedCode }}</code></pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import ComponentPreview from '../components/ComponentPreview.vue';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const selectedComponent = ref('');
const propValues = reactive({});
const codeFormat = ref('vue');

const componentDefinitions = {
  button: {
    props: [
      { name: 'label', label: 'Label', type: 'text', required: true, placeholder: 'Click me', description: 'Button text' },
      { name: 'variant', label: 'Variant', type: 'select', options: ['primary', 'secondary', 'tertiary', 'danger'], default: 'primary' },
      { name: 'size', label: 'Size', type: 'select', options: ['sm', 'md', 'lg'], default: 'md' },
      { name: 'disabled', label: 'Disabled', type: 'checkbox', default: false },
      { name: 'loading', label: 'Loading', type: 'checkbox', default: false },
    ]
  },
  card: {
    props: [
      { name: 'title', label: 'Title', type: 'text', placeholder: 'Card Title', description: 'Card header title' },
      { name: 'content', label: 'Content', type: 'text', placeholder: 'Card content goes here...', description: 'Card body content' },
      { name: 'variant', label: 'Variant', type: 'select', options: ['default', 'elevated', 'outlined'], default: 'default' },
      { name: 'showActions', label: 'Show Actions', type: 'checkbox', default: false },
    ]
  },
  input: {
    props: [
      { name: 'label', label: 'Label', type: 'text', placeholder: 'Input Label', description: 'Input field label' },
      { name: 'placeholder', label: 'Placeholder', type: 'text', placeholder: 'Enter text...', description: 'Placeholder text' },
      { name: 'type', label: 'Type', type: 'select', options: ['text', 'email', 'password', 'number'], default: 'text' },
      { name: 'required', label: 'Required', type: 'checkbox', default: false },
      { name: 'disabled', label: 'Disabled', type: 'checkbox', default: false },
    ]
  },
  select: {
    props: [
      { name: 'label', label: 'Label', type: 'text', placeholder: 'Select Label', description: 'Select field label' },
      { name: 'options', label: 'Options', type: 'text', placeholder: 'Option 1, Option 2, Option 3', description: 'Comma-separated options' },
      { name: 'required', label: 'Required', type: 'checkbox', default: false },
      { name: 'disabled', label: 'Disabled', type: 'checkbox', default: false },
    ]
  },
  checkbox: {
    props: [
      { name: 'label', label: 'Label', type: 'text', placeholder: 'Checkbox Label', description: 'Checkbox label text' },
      { name: 'checked', label: 'Checked', type: 'checkbox', default: false },
      { name: 'disabled', label: 'Disabled', type: 'checkbox', default: false },
    ]
  },
  radio: {
    props: [
      { name: 'label', label: 'Label', type: 'text', placeholder: 'Radio Label', description: 'Radio button label' },
      { name: 'options', label: 'Options', type: 'text', placeholder: 'Option 1, Option 2, Option 3', description: 'Comma-separated options' },
      { name: 'name', label: 'Name', type: 'text', placeholder: 'radio-group', description: 'Group name for radio buttons' },
    ]
  },
  textarea: {
    props: [
      { name: 'label', label: 'Label', type: 'text', placeholder: 'Textarea Label', description: 'Textarea field label' },
      { name: 'placeholder', label: 'Placeholder', type: 'text', placeholder: 'Enter text...', description: 'Placeholder text' },
      { name: 'rows', label: 'Rows', type: 'number', placeholder: '4', description: 'Number of rows' },
      { name: 'required', label: 'Required', type: 'checkbox', default: false },
      { name: 'disabled', label: 'Disabled', type: 'checkbox', default: false },
    ]
  },
  badge: {
    props: [
      { name: 'label', label: 'Label', type: 'text', placeholder: 'Badge', description: 'Badge text' },
      { name: 'variant', label: 'Variant', type: 'select', options: ['default', 'success', 'warning', 'error', 'info'], default: 'default' },
      { name: 'size', label: 'Size', type: 'select', options: ['sm', 'md', 'lg'], default: 'md' },
    ]
  },
  alert: {
    props: [
      { name: 'title', label: 'Title', type: 'text', placeholder: 'Alert Title', description: 'Alert title' },
      { name: 'message', label: 'Message', type: 'text', placeholder: 'Alert message...', description: 'Alert message content' },
      { name: 'variant', label: 'Variant', type: 'select', options: ['info', 'success', 'warning', 'error'], default: 'info' },
      { name: 'dismissible', label: 'Dismissible', type: 'checkbox', default: false },
    ]
  },
};

const componentProps = computed(() => {
  if (!selectedComponent.value || !componentDefinitions[selectedComponent.value]) {
    return [];
  }
  return componentDefinitions[selectedComponent.value].props;
});

const generatedCode = computed(() => {
  if (!selectedComponent.value) return '';
  
  const props = Object.entries(propValues)
    .filter(([key, value]) => value !== '' && value !== false && value !== null && value !== undefined)
    .map(([key, value]) => {
      if (typeof value === 'string') {
        return `  ${key}="${value}"`;
      } else if (typeof value === 'boolean') {
        return value ? `  :${key}="true"` : '';
      } else {
        return `  :${key}="${value}"`;
      }
    })
    .filter(Boolean)
    .join('\n');

  if (codeFormat.value === 'vue') {
    return `<${selectedComponent.value}${props ? '\n' + props + '\n' : ''} />`;
  } else if (codeFormat.value === 'react') {
    const reactProps = Object.entries(propValues)
      .filter(([key, value]) => value !== '' && value !== false && value !== null && value !== undefined)
      .map(([key, value]) => {
        if (typeof value === 'string') {
          return `  ${key}="${value}"`;
        } else if (typeof value === 'boolean') {
          return value ? `  ${key}={true}` : '';
        } else {
          return `  ${key}={${value}}`;
        }
      })
      .filter(Boolean)
      .join('\n');
    return `<${selectedComponent.value.charAt(0).toUpperCase() + selectedComponent.value.slice(1)}${reactProps ? '\n' + reactProps + '\n' : ''} />`;
  } else {
    // HTML
    const htmlProps = Object.entries(propValues)
      .filter(([key, value]) => value !== '' && value !== false && value !== null && value !== undefined)
      .map(([key, value]) => {
        if (typeof value === 'boolean' && value) {
          return ` ${key}`;
        } else if (typeof value === 'string') {
          return ` ${key}="${value}"`;
        } else {
          return ` ${key}="${value}"`;
        }
      })
      .filter(Boolean)
      .join('');
    return `<${selectedComponent.value}${htmlProps}></${selectedComponent.value}>`;
  }
});

const loadComponent = () => {
  // Clear existing props
  Object.keys(propValues).forEach(key => {
    delete propValues[key];
  });
  
  if (!selectedComponent.value) {
    return;
  }
  
  const def = componentDefinitions[selectedComponent.value];
  if (def) {
    def.props.forEach(prop => {
      propValues[prop.name] = prop.default !== undefined ? prop.default : (prop.type === 'checkbox' ? false : '');
    });
  }
};

const copyCode = async (codeToCopy = null) => {
  try {
    const code = codeToCopy || generatedCode.value;
    await navigator.clipboard.writeText(code);
    // Could add a toast notification here
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

const generateCodeForFormat = (format) => {
  if (!selectedComponent.value) return '';
  
  const props = Object.entries(propValues)
    .filter(([key, value]) => value !== '' && value !== false && value !== null && value !== undefined)
    .map(([key, value]) => {
      if (typeof value === 'string') {
        return `  ${key}="${value}"`;
      } else if (typeof value === 'boolean') {
        return value ? `  :${key}="true"` : '';
      } else {
        return `  :${key}="${value}"`;
      }
    })
    .filter(Boolean)
    .join('\n');

  if (format === 'vue') {
    return `<${selectedComponent.value}${props ? '\n' + props + '\n' : ''} />`;
  } else if (format === 'react') {
    const reactProps = Object.entries(propValues)
      .filter(([key, value]) => value !== '' && value !== false && value !== null && value !== undefined)
      .map(([key, value]) => {
        if (typeof value === 'string') {
          return `  ${key}="${value}"`;
        } else if (typeof value === 'boolean') {
          return value ? `  ${key}={true}` : '';
        } else {
          return `  ${key}={${value}}`;
        }
      })
      .filter(Boolean)
      .join('\n');
    return `<${selectedComponent.value.charAt(0).toUpperCase() + selectedComponent.value.slice(1)}${reactProps ? '\n' + reactProps + '\n' : ''} />`;
  } else {
    // HTML
    const htmlProps = Object.entries(propValues)
      .filter(([key, value]) => value !== '' && value !== false && value !== null && value !== undefined)
      .map(([key, value]) => {
        if (typeof value === 'boolean' && value) {
          return ` ${key}`;
        } else if (typeof value === 'string') {
          return ` ${key}="${value}"`;
        } else {
          return ` ${key}="${value}"`;
        }
      })
      .filter(Boolean)
      .join('');
    return `<${selectedComponent.value}${htmlProps}></${selectedComponent.value}>`;
  }
};

const exportAsVue = async () => {
  codeFormat.value = 'vue';
  await nextTick();
  const vueCode = generateCodeForFormat('vue');
  await copyCode(vueCode);
};

const exportAsReact = async () => {
  codeFormat.value = 'react';
  await nextTick();
  const reactCode = generateCodeForFormat('react');
  await copyCode(reactCode);
};

const toggleFullscreen = () => {
  // Could implement fullscreen preview
};

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

// Watch for dark mode changes
let darkModeObserver = null;
let darkModeInterval = null;

onMounted(() => {
  darkModeObserver = new MutationObserver(() => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  });
  
  darkModeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });
  
  const checkDarkMode = () => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  };
  
  checkDarkMode();
  darkModeInterval = setInterval(checkDarkMode, 100);
});

onBeforeUnmount(() => {
  if (darkModeObserver) {
    darkModeObserver.disconnect();
  }
  if (darkModeInterval) {
    clearInterval(darkModeInterval);
  }
});
</script>

<style scoped>
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>

