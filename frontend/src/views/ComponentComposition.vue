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
                  Component Composition
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Build complex components from primitives. Drag and drop components to create new compositions.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="max-w-7xl mx-auto grid lg:grid-cols-4 gap-6">
          <!-- Left Column: Component Library & Templates -->
          <div class="lg:col-span-1 space-y-6">
            <!-- Primitives -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Primitives
                </h3>
                <select
                  v-model="primitiveFilter"
                  class="px-2 py-1 border rounded text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  :class="isDarkMode 
                    ? 'border-gray-600 bg-slate-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'"
                >
                  <option value="all">All</option>
                  <option value="component">Components</option>
                  <option value="layout">Layouts</option>
                  <option value="element">Elements</option>
                </select>
              </div>
              <div class="space-y-2 max-h-64 overflow-y-auto">
                <div
                  v-for="primitive in filteredPrimitives"
                  :key="primitive.id"
                  @dragstart="handleDragStart($event, primitive)"
                  draggable="true"
                  class="p-3 rounded-lg border cursor-move transition-colors"
                  :class="isDarkMode 
                    ? 'bg-slate-800 border-gray-700 hover:border-indigo-500' 
                    : 'bg-gray-50 border-gray-200 hover:border-indigo-500'"
                >
                  <div class="text-sm font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ primitive.name }}
                  </div>
                  <div class="text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    {{ primitive.type }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Templates -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Templates
              </h3>
              <div class="space-y-2">
                <button
                  v-for="template in templates"
                  :key="template.id"
                  @click="loadTemplate(template)"
                  class="w-full p-3 rounded-lg border text-left transition-colors text-sm"
                  :class="isDarkMode 
                    ? 'bg-slate-800 border-gray-700 hover:border-indigo-500' 
                    : 'bg-gray-50 border-gray-200 hover:border-indigo-500'"
                >
                  <div class="font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ template.name }}
                  </div>
                  <div class="text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    {{ template.components.length }} components
                  </div>
                </button>
              </div>
            </div>

            <!-- Layout Options -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Layout Options
              </h3>
              <div class="space-y-2">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" v-model="layoutType" value="stack" class="accent-indigo-600" />
                  <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Stack (Vertical)</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" v-model="layoutType" value="flex" class="accent-indigo-600" />
                  <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Flex (Horizontal)</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" v-model="layoutType" value="grid" class="accent-indigo-600" />
                  <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Grid</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Center Column: Canvas & Live Preview -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Composition Canvas -->
            <div 
              class="rounded-lg shadow-sm border p-6 min-h-[400px]"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
              @drop="handleDrop"
              @dragover.prevent
            >
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Composition Canvas
                </h3>
                <div class="flex items-center gap-2">
                  <button
                    @click="saveComposition"
                    :disabled="composition.length === 0"
                    class="px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                    :class="composition.length > 0
                      ? (isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white')
                      : (isDarkMode ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')"
                  >
                    Save
                  </button>
                  <button
                    @click="clearCanvas"
                    class="px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                    :class="isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div v-if="composition.length === 0" class="flex items-center justify-center h-full min-h-[350px] border-2 border-dashed rounded-lg" :class="isDarkMode ? 'border-gray-600' : 'border-gray-300'">
                <div class="text-center">
                  <span class="material-symbols-outlined text-5xl mb-3" :class="isDarkMode ? 'text-gray-600' : 'text-gray-300'">
                    view_quilt
                  </span>
                  <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    Drag components here to build
                  </p>
                </div>
              </div>
              <div v-else class="space-y-3">
                <div
                  v-for="(item, index) in composition"
                  :key="item.id || index"
                  class="p-4 rounded-lg border relative group"
                  :class="selectedItemIndex === index
                    ? (isDarkMode ? 'bg-indigo-900/30 border-indigo-500' : 'bg-indigo-50 border-indigo-500')
                    : (isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200')"
                  @click="selectedItemIndex = index"
                  @drop="handleNestedDrop($event, index)"
                  @dragover.prevent
                >
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-sm cursor-move" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">drag_indicator</span>
                      <span class="text-sm font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                        {{ item.name }}
                      </span>
                      <span 
                        v-if="item.children && item.children.length > 0"
                        class="text-xs px-2 py-1 rounded"
                        :class="isDarkMode ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-100 text-indigo-700'"
                      >
                        {{ item.children.length }} nested
                      </span>
                    </div>
                    <div class="flex items-center gap-1">
                      <button
                        @click.stop="configureItem(index)"
                        class="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-700"
                        aria-label="Configure"
                      >
                        <span class="material-symbols-outlined text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">settings</span>
                      </button>
                      <button
                        @click.stop="removeFromComposition(index)"
                        class="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-700"
                        aria-label="Remove component"
                      >
                        <span class="material-symbols-outlined text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">close</span>
                      </button>
                    </div>
                  </div>
                  <div class="text-xs mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    {{ item.type }}
                  </div>
                  <div v-if="item.props && Object.keys(item.props).length > 0" class="text-xs mt-2 p-2 rounded" :class="isDarkMode ? 'bg-slate-700' : 'bg-gray-100'">
                    <div v-for="(value, key) in item.props" :key="key" class="flex items-center gap-2">
                      <span class="font-mono" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">{{ key }}:</span>
                      <span :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ value }}</span>
                    </div>
                  </div>
                  <div v-if="item.children && item.children.length > 0" class="mt-3 ml-4 space-y-2 border-l-2 pl-3" :class="isDarkMode ? 'border-gray-700' : 'border-gray-300'">
                    <div
                      v-for="(child, childIndex) in item.children"
                      :key="childIndex"
                      class="p-2 rounded text-xs"
                      :class="isDarkMode ? 'bg-slate-700' : 'bg-gray-100'"
                    >
                      {{ child.name }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Live Preview -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Live Preview
                </h3>
                <button
                  @click="refreshPreview"
                  class="px-2 py-1 rounded text-xs font-medium transition-colors"
                  :class="isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                  title="Refresh preview"
                >
                  <span class="material-symbols-outlined text-sm">refresh</span>
                </button>
              </div>
              <div class="rounded-lg border p-6 min-h-[200px]" :class="isDarkMode ? 'bg-slate-950 border-gray-800' : 'bg-gray-50 border-gray-200'">
                <div v-if="composition.length === 0" class="text-center py-12">
                  <span class="material-symbols-outlined text-4xl mb-3" :class="isDarkMode ? 'text-gray-600' : 'text-gray-300'">
                    preview
                  </span>
                  <p class="text-sm" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                    Preview will appear here
                  </p>
                </div>
                <div v-else :class="getLayoutClass()">
                  <component
                    v-for="(item, index) in composition"
                    :is="getPreviewComponent(item)"
                    :key="`${item.id || index}-${previewKey}`"
                    :item="item"
                    :is-dark-mode="isDarkMode"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Properties & Export -->
          <div class="lg:col-span-1 space-y-6">
            <!-- Component Properties -->
            <div 
              v-if="selectedItemIndex !== null && composition[selectedItemIndex]"
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Properties
              </h3>
              <div class="space-y-3">
                <div v-for="prop in getComponentProps(composition[selectedItemIndex])" :key="prop.name">
                  <label class="block text-sm mb-1" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    {{ prop.name }}
                  </label>
                  <input
                    v-if="prop.type === 'string'"
                    v-model="composition[selectedItemIndex].props[prop.name]"
                    type="text"
                    class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="isDarkMode 
                      ? 'border-gray-600 bg-slate-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'"
                  />
                  <input
                    v-else-if="prop.type === 'boolean'"
                    type="checkbox"
                    v-model="composition[selectedItemIndex].props[prop.name]"
                    class="accent-indigo-600"
                  />
                  <input
                    v-else-if="prop.type === 'number'"
                    v-model.number="composition[selectedItemIndex].props[prop.name]"
                    type="number"
                    class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="isDarkMode 
                      ? 'border-gray-600 bg-slate-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'"
                  />
                </div>
              </div>
            </div>

            <!-- Generated Code -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Generated Code
                </h3>
                <select
                  v-model="codeFormat"
                  class="px-2 py-1 border rounded text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  :class="isDarkMode 
                    ? 'border-gray-600 bg-slate-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'"
                >
                  <option value="vue">Vue</option>
                  <option value="react">React</option>
                  <option value="html">HTML</option>
                </select>
              </div>
              <div v-if="composition.length > 0" class="rounded-lg overflow-hidden" :class="isDarkMode ? 'bg-slate-950' : 'bg-gray-900'">
                <div class="p-3 overflow-x-auto max-h-64 overflow-y-auto">
                  <pre class="text-xs text-green-400 font-mono whitespace-pre-wrap"><code>{{ getGeneratedCode() }}</code></pre>
                </div>
                <div class="p-2 border-t flex items-center justify-end gap-2" :class="isDarkMode ? 'border-gray-800' : 'border-gray-800'">
                  <button
                    @click="copyCode"
                    class="px-2 py-1 rounded text-xs font-medium transition-colors"
                    :class="isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                  >
                    Copy
                  </button>
                  <button
                    @click="exportCode"
                    class="px-2 py-1 rounded text-xs font-medium transition-colors"
                    :class="isDarkMode 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
                  >
                    Export
                  </button>
                </div>
              </div>
              <div v-else class="text-center py-8">
                <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  Add components to generate code
                </p>
              </div>
            </div>

            <!-- Component Relationships -->
            <div 
              v-if="composition.length > 1"
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Relationships
              </h3>
              <div class="space-y-2 text-sm">
                <div
                  v-for="(item, index) in composition"
                  :key="index"
                  class="p-2 rounded"
                  :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'"
                >
                  <div class="font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ item.name }}
                  </div>
                  <div v-if="item.children && item.children.length > 0" class="text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    Contains: {{ item.children.map(c => c.name).join(', ') }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, h } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';

// Helper function to get preview component (defined first)
let getPreviewComponent = null;

// Preview Components
const PreviewButton = {
  props: ['item', 'isDarkMode'],
  setup(props) {
    return () => h('button', {
      class: [
        'px-4 py-2 rounded-lg transition-colors text-sm font-medium',
        props.item.props?.variant === 'primary' || !props.item.props?.variant
          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
          : props.item.props?.variant === 'secondary'
          ? 'border border-indigo-600 text-indigo-600 hover:bg-indigo-50'
          : 'bg-gray-200 text-gray-800 hover:bg-gray-300',
        props.item.props?.size === 'small' ? 'px-2 py-1 text-xs' : props.item.props?.size === 'large' ? 'px-6 py-3 text-lg' : ''
      ],
      disabled: props.item.props?.disabled || false
    }, props.item.props?.label || 'Button');
  }
};

const PreviewCard = {
  props: ['item', 'isDarkMode'],
  setup(props) {
    return () => h('div', {
      class: [
        'rounded-lg border p-4',
        props.isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'
      ]
    }, [
      h('h3', {
        class: ['text-sm font-semibold mb-2', props.isDarkMode ? 'text-white' : 'text-gray-900']
      }, props.item.props?.title || 'Card Title'),
      h('p', {
        class: ['text-xs', props.isDarkMode ? 'text-gray-400' : 'text-gray-600']
      }, props.item.props?.content || 'Card content'),
      props.item.children && props.item.children.length > 0
        ? h('div', { class: 'mt-3 space-y-2' }, props.item.children.map(child => {
            if (child.name === 'Button') return h(PreviewButton, { item: child, isDarkMode: props.isDarkMode });
            if (child.name === 'Text') return h(PreviewText, { item: child, isDarkMode: props.isDarkMode });
            return h('div', { class: 'text-xs text-gray-500' }, child.name);
          }))
        : null
    ]);
  }
};

const PreviewInput = {
  props: ['item', 'isDarkMode'],
  setup(props) {
    return () => h('input', {
      type: props.item.props?.type || 'text',
      placeholder: props.item.props?.placeholder || 'Enter text...',
      class: [
        'w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500',
        props.isDarkMode
          ? 'bg-slate-700 border-gray-600 text-white placeholder-gray-400'
          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
      ]
    });
  }
};

const PreviewText = {
  props: ['item', 'isDarkMode'],
  setup(props) {
    return () => h('p', {
      class: [
        'text-sm',
        props.isDarkMode ? 'text-gray-300' : 'text-gray-700'
      ]
    }, props.item.props?.content || 'Text content');
  }
};

const PreviewContainer = {
  props: ['item', 'isDarkMode'],
  setup(props) {
    return () => h('div', {
      class: [
        'p-4 rounded-lg border',
        props.isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-100 border-gray-200'
      ]
    }, [
      h('div', { class: ['text-xs mb-2 font-medium', props.isDarkMode ? 'text-gray-400' : 'text-gray-600'] }, 'Container'),
      props.item.children && props.item.children.length > 0
        ? h('div', { class: 'space-y-2' }, props.item.children.map(child => {
            let PreviewComp = PreviewGeneric;
            if (child.type === 'component') {
              if (child.name === 'Button') PreviewComp = PreviewButton;
              else if (child.name === 'Card') PreviewComp = PreviewCard;
              else if (child.name === 'Input') PreviewComp = PreviewInput;
              else if (child.name === 'Modal') PreviewComp = PreviewModal;
              else if (child.name === 'Form') PreviewComp = PreviewForm;
            } else if (child.type === 'layout') {
              if (child.name === 'Container') PreviewComp = PreviewContainer;
              else if (child.name === 'Stack') PreviewComp = PreviewStack;
              else if (child.name === 'Grid') PreviewComp = PreviewGrid;
            } else if (child.type === 'element' && child.name === 'Text') {
              PreviewComp = PreviewText;
            }
            return h(PreviewComp, { item: child, isDarkMode: props.isDarkMode });
          }))
        : null
    ]);
  }
};

const PreviewStack = {
  props: ['item', 'isDarkMode'],
  setup(props) {
    return () => h('div', {
      class: [
        'flex flex-col gap-2 p-2 rounded',
        props.isDarkMode ? 'bg-slate-800' : 'bg-gray-100'
      ]
    }, [
      h('div', { class: ['text-xs mb-1 font-medium', props.isDarkMode ? 'text-gray-400' : 'text-gray-600'] }, 'Stack'),
      props.item.children && props.item.children.length > 0
        ? props.item.children.map(child => {
            let PreviewComp = PreviewGeneric;
            if (child.type === 'component') {
              if (child.name === 'Button') PreviewComp = PreviewButton;
              else if (child.name === 'Card') PreviewComp = PreviewCard;
              else if (child.name === 'Input') PreviewComp = PreviewInput;
              else if (child.name === 'Modal') PreviewComp = PreviewModal;
              else if (child.name === 'Form') PreviewComp = PreviewForm;
            } else if (child.type === 'layout') {
              if (child.name === 'Container') PreviewComp = PreviewContainer;
              else if (child.name === 'Stack') PreviewComp = PreviewStack;
              else if (child.name === 'Grid') PreviewComp = PreviewGrid;
            } else if (child.type === 'element' && child.name === 'Text') {
              PreviewComp = PreviewText;
            }
            return h(PreviewComp, { item: child, isDarkMode: props.isDarkMode });
          })
        : null
    ]);
  }
};

const PreviewGrid = {
  props: ['item', 'isDarkMode'],
  setup(props) {
    return () => h('div', {
      class: [
        'grid gap-2 p-2 rounded',
        `grid-cols-${props.item.props?.columns || 3}`,
        props.isDarkMode ? 'bg-slate-800' : 'bg-gray-100'
      ]
    }, [
      h('div', { class: ['text-xs mb-1 font-medium col-span-full', props.isDarkMode ? 'text-gray-400' : 'text-gray-600'] }, 'Grid'),
      props.item.children && props.item.children.length > 0
        ? props.item.children.map(child => {
            let PreviewComp = PreviewGeneric;
            if (child.type === 'component') {
              if (child.name === 'Button') PreviewComp = PreviewButton;
              else if (child.name === 'Card') PreviewComp = PreviewCard;
              else if (child.name === 'Input') PreviewComp = PreviewInput;
              else if (child.name === 'Modal') PreviewComp = PreviewModal;
              else if (child.name === 'Form') PreviewComp = PreviewForm;
            } else if (child.type === 'layout') {
              if (child.name === 'Container') PreviewComp = PreviewContainer;
              else if (child.name === 'Stack') PreviewComp = PreviewStack;
              else if (child.name === 'Grid') PreviewComp = PreviewGrid;
            } else if (child.type === 'element' && child.name === 'Text') {
              PreviewComp = PreviewText;
            }
            return h(PreviewComp, { item: child, isDarkMode: props.isDarkMode });
          })
        : null
    ]);
  }
};

const PreviewForm = {
  props: ['item', 'isDarkMode'],
  setup(props) {
    return () => h('form', {
      class: [
        'space-y-3 p-4 rounded-lg border',
        props.isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'
      ]
    }, [
      h('div', { class: ['text-xs mb-2 font-medium', props.isDarkMode ? 'text-gray-400' : 'text-gray-600'] }, 'Form'),
      props.item.children && props.item.children.length > 0
        ? props.item.children.map(child => {
            let PreviewComp = PreviewGeneric;
            if (child.type === 'component') {
              if (child.name === 'Button') PreviewComp = PreviewButton;
              else if (child.name === 'Card') PreviewComp = PreviewCard;
              else if (child.name === 'Input') PreviewComp = PreviewInput;
              else if (child.name === 'Modal') PreviewComp = PreviewModal;
              else if (child.name === 'Form') PreviewComp = PreviewForm;
            } else if (child.type === 'layout') {
              if (child.name === 'Container') PreviewComp = PreviewContainer;
              else if (child.name === 'Stack') PreviewComp = PreviewStack;
              else if (child.name === 'Grid') PreviewComp = PreviewGrid;
            } else if (child.type === 'element' && child.name === 'Text') {
              PreviewComp = PreviewText;
            }
            return h(PreviewComp, { item: child, isDarkMode: props.isDarkMode });
          })
        : null
    ]);
  }
};

const PreviewModal = {
  props: ['item', 'isDarkMode'],
  setup(props) {
    return () => h('div', {
      class: [
        'p-4 rounded-lg border shadow-lg',
        props.isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'
      ]
    }, [
      h('div', { class: 'flex items-center justify-between mb-2' }, [
        h('h3', { class: ['text-sm font-semibold', props.isDarkMode ? 'text-white' : 'text-gray-900'] }, props.item.props?.title || 'Modal'),
        h('button', { class: 'text-gray-400 hover:text-gray-600' }, '×')
      ]),
      h('p', { class: ['text-xs', props.isDarkMode ? 'text-gray-400' : 'text-gray-600'] }, props.item.props?.content || 'Modal content'),
      props.item.children && props.item.children.length > 0
        ? h('div', { class: 'mt-3 space-y-2' }, props.item.children.map(child => {
            const PreviewComp = getPreviewComponent(child);
            return h(PreviewComp, { item: child, isDarkMode: props.isDarkMode });
          }))
        : null
    ]);
  }
};

const PreviewGeneric = {
  props: ['item', 'isDarkMode'],
  setup(props) {
    return () => h('div', {
      class: [
        'p-3 rounded border text-xs',
        props.isDarkMode ? 'bg-slate-800 border-gray-700 text-gray-300' : 'bg-gray-100 border-gray-200 text-gray-700'
      ]
    }, props.item.name);
  }
};

// Define getPreviewComponent function after all preview components are defined
getPreviewComponent = (item) => {
  if (item.type === 'component') {
    if (item.name === 'Button') return PreviewButton;
    if (item.name === 'Card') return PreviewCard;
    if (item.name === 'Input') return PreviewInput;
    if (item.name === 'Modal') return PreviewModal;
    if (item.name === 'Form') return PreviewForm;
  }
  if (item.type === 'layout') {
    if (item.name === 'Container') return PreviewContainer;
    if (item.name === 'Stack') return PreviewStack;
    if (item.name === 'Grid') return PreviewGrid;
  }
  if (item.type === 'element') {
    if (item.name === 'Text') return PreviewText;
  }
  return PreviewGeneric;
};

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const composition = ref([]);
const draggedItem = ref(null);
const selectedItemIndex = ref(null);
const primitiveFilter = ref('all');
const layoutType = ref('stack');
const codeFormat = ref('vue');
let compositionIdCounter = 0;

const primitives = ref([
  { id: 1, name: 'Button', type: 'component', props: { label: 'Click me', variant: 'primary', size: 'medium' } },
  { id: 2, name: 'Card', type: 'component', props: { padding: 'medium', shadow: true } },
  { id: 3, name: 'Input', type: 'component', props: { placeholder: 'Enter text', type: 'text' } },
  { id: 4, name: 'Text', type: 'element', props: { content: 'Text content' } },
  { id: 5, name: 'Container', type: 'layout', props: { maxWidth: 'lg', padding: true } },
  { id: 6, name: 'Stack', type: 'layout', props: { direction: 'vertical', gap: 'medium' } },
  { id: 7, name: 'Grid', type: 'layout', props: { columns: 3, gap: 'medium' } },
  { id: 8, name: 'Modal', type: 'component', props: { title: 'Modal Title', isOpen: false } },
  { id: 9, name: 'Form', type: 'component', props: { onSubmit: 'handleSubmit' } }
]);

const templates = ref([
  {
    id: 1,
    name: 'Login Form',
    components: [
      { id: 1, name: 'Form', type: 'component', props: {}, children: [
        { id: 2, name: 'Input', type: 'component', props: { placeholder: 'Email' } },
        { id: 3, name: 'Input', type: 'component', props: { placeholder: 'Password', type: 'password' } },
        { id: 4, name: 'Button', type: 'component', props: { label: 'Login' } }
      ]}
    ]
  },
  {
    id: 2,
    name: 'Card with Actions',
    components: [
      { id: 1, name: 'Card', type: 'component', props: {}, children: [
        { id: 2, name: 'Text', type: 'element', props: { content: 'Card Title' } },
        { id: 3, name: 'Text', type: 'element', props: { content: 'Card description' } },
        { id: 4, name: 'Button', type: 'component', props: { label: 'Action' } }
      ]}
    ]
  },
  {
    id: 3,
    name: 'Data Table',
    components: [
      { id: 1, name: 'Container', type: 'layout', props: {}, children: [
        { id: 2, name: 'Input', type: 'component', props: { placeholder: 'Search...' } },
        { id: 3, name: 'Grid', type: 'layout', props: { columns: 3 } }
      ]}
    ]
  }
]);

const filteredPrimitives = computed(() => {
  if (primitiveFilter.value === 'all') return primitives.value;
  return primitives.value.filter(p => p.type === primitiveFilter.value);
});

const handleDragStart = (event, item) => {
  draggedItem.value = item;
  event.dataTransfer.effectAllowed = 'move';
};

const handleDrop = (event) => {
  event.preventDefault();
  if (draggedItem.value) {
    const newItem = {
      ...draggedItem.value,
      id: ++compositionIdCounter,
      props: { ...draggedItem.value.props },
      children: []
    };
    composition.value.push(newItem);
    draggedItem.value = null;
  }
};

const handleNestedDrop = (event, parentIndex) => {
  event.preventDefault();
  event.stopPropagation();
  if (draggedItem.value && parentIndex !== null) {
    if (!composition.value[parentIndex].children) {
      composition.value[parentIndex].children = [];
    }
    const newChild = {
      ...draggedItem.value,
      id: ++compositionIdCounter,
      props: { ...draggedItem.value.props }
    };
    composition.value[parentIndex].children.push(newChild);
    draggedItem.value = null;
  }
};

const removeFromComposition = (index) => {
  composition.value.splice(index, 1);
  if (selectedItemIndex.value === index) {
    selectedItemIndex.value = null;
  } else if (selectedItemIndex.value > index) {
    selectedItemIndex.value--;
  }
};

const clearCanvas = () => {
  composition.value = [];
  selectedItemIndex.value = null;
};

const configureItem = (index) => {
  selectedItemIndex.value = index;
};

const loadTemplate = (template) => {
  composition.value = JSON.parse(JSON.stringify(template.components));
  composition.value.forEach((item, index) => {
    item.id = ++compositionIdCounter;
    if (item.children) {
      item.children.forEach(child => {
        child.id = ++compositionIdCounter;
      });
    }
  });
};

const saveComposition = () => {
  const saved = JSON.parse(localStorage.getItem('compositions') || '[]');
  const newComposition = {
    id: Date.now(),
    name: `Composition ${saved.length + 1}`,
    components: JSON.parse(JSON.stringify(composition.value)),
    createdAt: new Date().toISOString()
  };
  saved.push(newComposition);
  localStorage.setItem('compositions', JSON.stringify(saved));
  alert('Composition saved!');
};

const getComponentProps = (item) => {
  if (!item || !item.props) return [];
  return Object.keys(item.props).map(key => ({
    name: key,
    type: typeof item.props[key],
    value: item.props[key]
  }));
};

const previewKey = ref(0);

const refreshPreview = () => {
  previewKey.value++;
};

// Watch for changes in composition or props to refresh preview
watch([composition, layoutType], () => {
  previewKey.value++;
}, { deep: true });

const getLayoutClass = () => {
  if (layoutType.value === 'flex') return 'flex gap-4 flex-wrap';
  if (layoutType.value === 'grid') return 'grid grid-cols-3 gap-4';
  return 'flex flex-col gap-4';
};


const getGeneratedCode = () => {
  if (composition.value.length === 0) return '';
  
  const generateItemCode = (item, indent = 0) => {
    const indentStr = '  '.repeat(indent);
    const propsStr = item.props && Object.keys(item.props).length > 0
      ? ' ' + Object.entries(item.props).map(([k, v]) => {
          if (typeof v === 'string') return `${k}="${v}"`;
          if (typeof v === 'boolean') return v ? k : '';
          return `:${k}="${v}"`;
        }).filter(Boolean).join(' ')
      : '';
    
    if (codeFormat.value === 'vue') {
      if (item.children && item.children.length > 0) {
        const childrenCode = item.children.map(child => generateItemCode(child, indent + 1)).join('\n');
        return `${indentStr}<${item.name}${propsStr}>\n${childrenCode}\n${indentStr}</${item.name}>`;
      }
      return `${indentStr}<${item.name}${propsStr} />`;
    } else if (codeFormat.value === 'react') {
      if (item.children && item.children.length > 0) {
        const childrenCode = item.children.map(child => generateItemCode(child, indent + 1)).join('\n');
        return `${indentStr}<${item.name}${propsStr}>\n${childrenCode}\n${indentStr}</${item.name}>`;
      }
      return `${indentStr}<${item.name}${propsStr} />`;
    } else {
      if (item.children && item.children.length > 0) {
        const childrenCode = item.children.map(child => generateItemCode(child, indent + 1)).join('\n');
        return `${indentStr}<${item.name}${propsStr}>\n${childrenCode}\n${indentStr}</${item.name}>`;
      }
      return `${indentStr}<${item.name}${propsStr}></${item.name}>`;
    }
  };
  
  return composition.value.map(item => generateItemCode(item)).join('\n\n');
};

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(getGeneratedCode());
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

const exportCode = () => {
  const extension = codeFormat.value === 'vue' ? 'vue' : codeFormat.value === 'react' ? 'jsx' : 'html';
  const filename = `composition.${extension}`;
  const blob = new Blob([getGeneratedCode()], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

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

