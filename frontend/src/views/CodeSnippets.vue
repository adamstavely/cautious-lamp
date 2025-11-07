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
                  Code Snippets Library
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Pre-built code snippets for common use cases. Copy, customize, and integrate into your projects.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="max-w-7xl mx-auto mb-8">
          <div 
            class="rounded-lg shadow-sm border p-6"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <div class="flex flex-wrap items-center gap-4">
              <div class="flex-1 min-w-[200px]">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search snippets..."
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  :class="isDarkMode 
                    ? 'border-gray-600 bg-slate-700 text-white placeholder-gray-400' 
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'"
                />
              </div>
              <select
                v-model="selectedCategory"
                class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                :class="isDarkMode 
                  ? 'border-gray-600 bg-slate-700 text-white' 
                  : 'border-gray-300 bg-white text-gray-900'"
              >
                <option value="">All Categories</option>
                <option value="forms">Forms</option>
                <option value="navigation">Navigation</option>
                <option value="data-display">Data Display</option>
                <option value="feedback">Feedback</option>
                <option value="layout">Layout</option>
                <option value="authentication">Authentication</option>
                <option value="utilities">Utilities</option>
              </select>
              <select
                v-model="selectedFramework"
                class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                :class="isDarkMode 
                  ? 'border-gray-600 bg-slate-700 text-white' 
                  : 'border-gray-300 bg-white text-gray-900'"
              >
                <option value="">All Frameworks</option>
                <option value="vue">Vue</option>
                <option value="react">React</option>
                <option value="html">HTML</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Snippets Grid -->
        <div class="max-w-7xl mx-auto">
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="snippet in filteredSnippets"
              :key="snippet.id"
              class="rounded-lg shadow-sm border overflow-hidden transition-all hover:shadow-md"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700 hover:border-indigo-500' 
                : 'bg-white border-gray-200 hover:border-indigo-500'"
            >
              <div class="p-6">
                <div class="flex items-start justify-between mb-4">
                  <div class="flex-1">
                    <h3 class="text-lg font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      {{ snippet.title }}
                    </h3>
                    <p class="text-sm mb-3" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      {{ snippet.description }}
                    </p>
                  </div>
                  <span 
                    class="px-2 py-1 rounded text-xs font-medium"
                    :class="getCategoryBadgeClass(snippet.category)"
                  >
                    {{ snippet.category }}
                  </span>
                </div>
                
                <div class="flex items-center gap-2 mb-4">
                  <span 
                    v-for="tag in snippet.tags"
                    :key="tag"
                    class="px-2 py-1 rounded text-xs"
                    :class="isDarkMode ? 'bg-slate-800 text-gray-400' : 'bg-gray-100 text-gray-600'"
                  >
                    {{ tag }}
                  </span>
                </div>

                <!-- Code Preview -->
                <div class="rounded-lg overflow-hidden mb-4" :class="isDarkMode ? 'bg-slate-950' : 'bg-gray-900'">
                  <div class="px-4 py-2 flex items-center justify-between border-b" :class="isDarkMode ? 'border-gray-800' : 'border-gray-800'">
                    <span class="text-xs font-medium text-gray-400">{{ snippet.framework.toUpperCase() }}</span>
                    <button
                      @click="copySnippet(snippet)"
                      class="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                      aria-label="Copy snippet"
                    >
                      <span class="material-symbols-outlined text-sm">content_copy</span>
                      Copy
                    </button>
                  </div>
                  <div class="p-4 overflow-x-auto">
                    <pre class="text-xs text-green-400 font-mono"><code>{{ getSnippetCode(snippet) }}</code></pre>
                  </div>
                </div>

                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-4 text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                    <span>{{ snippet.useCase }}</span>
                    <span>{{ snippet.complexity }}</span>
                  </div>
                  <button
                    @click="viewSnippet(snippet)"
                    class="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                  >
                    View Details →
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="filteredSnippets.length === 0" class="text-center py-12">
            <span class="material-symbols-outlined text-6xl mb-4" :class="isDarkMode ? 'text-gray-600' : 'text-gray-300'">
              code_off
            </span>
            <p class="text-lg font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
              No snippets found
            </p>
            <p class="text-sm" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
              Try adjusting your filters or search query
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Snippet Detail Modal -->
    <div
      v-if="selectedSnippet"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      @click.self="selectedSnippet = null"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="`snippet-modal-${selectedSnippet.id}`"
    >
      <div 
        class="relative w-full max-w-4xl max-h-[90vh] rounded-lg shadow-xl border overflow-hidden"
        :class="isDarkMode 
          ? 'bg-slate-900 border-gray-700' 
          : 'bg-white border-gray-200'"
      >
        <div class="p-6 border-b flex items-center justify-between" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
          <h2 :id="`snippet-modal-${selectedSnippet.id}`" class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
            {{ selectedSnippet.title }}
          </h2>
          <button
            @click="selectedSnippet = null"
            class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <span class="material-symbols-outlined" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">close</span>
          </button>
        </div>
        <div class="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <p class="text-sm mb-6" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
            {{ selectedSnippet.description }}
          </p>
          
          <!-- Full Code -->
          <div class="mb-6">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Code</h3>
              <div class="flex items-center gap-2">
                <button
                  v-for="fw in ['vue', 'react', 'html']"
                  :key="fw"
                  @click="viewingFramework = fw"
                  class="px-3 py-1 rounded text-xs font-medium transition-colors"
                  :class="viewingFramework === fw
                    ? (isDarkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white')
                    : (isDarkMode ? 'bg-slate-800 text-gray-400 hover:bg-slate-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')"
                >
                  {{ fw.toUpperCase() }}
                </button>
                <button
                  @click="copySnippet(selectedSnippet)"
                  class="px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1"
                  :class="isDarkMode 
                    ? 'bg-slate-800 text-gray-300 hover:bg-slate-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                >
                  <span class="material-symbols-outlined text-sm">content_copy</span>
                  Copy
                </button>
              </div>
            </div>
            <div class="rounded-lg overflow-hidden" :class="isDarkMode ? 'bg-slate-950' : 'bg-gray-900'">
              <div class="p-4 overflow-x-auto">
                <pre class="text-sm text-green-400 font-mono"><code>{{ getSnippetCode(selectedSnippet, viewingFramework) }}</code></pre>
              </div>
            </div>
          </div>

          <!-- Usage Example -->
          <div v-if="selectedSnippet.usageExample" class="mb-6">
            <h3 class="text-sm font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Usage Example</h3>
            <div class="rounded-lg p-4" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
              <p class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                {{ selectedSnippet.usageExample }}
              </p>
            </div>
          </div>

          <!-- Props/Dependencies -->
          <div v-if="selectedSnippet.props && selectedSnippet.props.length > 0" class="mb-6">
            <h3 class="text-sm font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Props</h3>
            <div class="space-y-2">
              <div
                v-for="prop in selectedSnippet.props"
                :key="prop.name"
                class="flex items-start gap-4 p-3 rounded-lg"
                :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'"
              >
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <code class="text-sm font-mono font-semibold" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                      {{ prop.name }}
                    </code>
                    <span class="text-xs px-2 py-0.5 rounded" :class="prop.required 
                      ? (isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700')
                      : (isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600')">
                      {{ prop.type }}
                    </span>
                    <span v-if="prop.required" class="text-xs text-red-500">*</span>
                  </div>
                  <p class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    {{ prop.description }}
                  </p>
                  <p v-if="prop.default" class="text-xs mt-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                    Default: <code class="font-mono">{{ prop.default }}</code>
                  </p>
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const searchQuery = ref('');
const selectedCategory = ref('');
const selectedFramework = ref('');
const selectedSnippet = ref(null);
const viewingFramework = ref('vue');

const snippets = ref([
  {
    id: 'form-validation',
    title: 'Form Validation',
    description: 'Complete form validation with error handling and accessibility',
    category: 'forms',
    framework: 'vue',
    tags: ['form', 'validation', 'accessibility'],
    useCase: 'User Input',
    complexity: 'Intermediate',
    code: {
      vue: `<template>
  <form @submit.prevent="handleSubmit">
    <div class="form-group">
      <label for="email">Email</label>
      <input
        id="email"
        v-model="form.email"
        type="email"
        :aria-invalid="errors.email ? 'true' : 'false'"
        :aria-describedby="errors.email ? 'email-error' : undefined"
      />
      <div v-if="errors.email" id="email-error" role="alert" class="error">
        {{ errors.email }}
      </div>
    </div>
    <button type="submit" :disabled="!isValid">Submit</button>
  </form>
</template>

<script setup>
import { ref, computed } from 'vue';

const form = ref({ email: '' });
const errors = ref({});

const isValid = computed(() => {
  return form.value.email && !errors.value.email;
});

const validateEmail = (email) => {
  const re = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return re.test(email);
};

const handleSubmit = () => {
  errors.value = {};
  if (!validateEmail(form.value.email)) {
    errors.value.email = 'Please enter a valid email address';
  }
  if (isValid.value) {
    // Submit form
  }
};
<\/script>`,
      react: `import React, { useState } from 'react';

function FormValidation() {
  const [form, setForm] = useState({ email: '' });
  const [errors, setErrors] = useState({});

  const validateEmail = (email) => {
    const re = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!validateEmail(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      // Submit form
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <div id="email-error" role="alert" className="error">
            {errors.email}
          </div>
        )}
      </div>
      <button type="submit" disabled={!form.email || errors.email}>
        Submit
      </button>
    </form>
  );
}`,
      html: (() => {
        const lt = '<';
        const gt = '>';
        const slash = '/';
        const parts = [];
        parts.push('<!DOCTYPE html>');
        parts.push(lt + 'html' + gt);
        parts.push(lt + 'head' + gt);
        parts.push('  ' + lt + 'title' + gt + 'Form Validation' + lt + slash + 'title' + gt);
        parts.push(lt + slash + 'head' + gt);
        parts.push(lt + 'body' + gt);
        parts.push('  ' + lt + 'form id="myForm"' + gt);
        parts.push('    ' + lt + 'div class="form-group"' + gt);
        parts.push('      ' + lt + 'label for="email"' + gt + 'Email' + lt + slash + 'label' + gt);
        parts.push('      ' + lt + 'input id="email" type="email" required /' + gt);
        parts.push('      ' + lt + 'div id="email-error" role="alert" class="error" style="display: none;"' + gt + lt + slash + 'div' + gt);
        parts.push('    ' + lt + slash + 'div' + gt);
        parts.push('    ' + lt + 'button type="submit"' + gt + 'Submit' + lt + slash + 'button' + gt);
        parts.push('  ' + lt + slash + 'form' + gt);
        parts.push('  ' + lt + 'script' + gt);
        parts.push('    document.getElementById(\'myForm\').addEventListener(\'submit\', (e) => {');
        parts.push('      e.preventDefault();');
        parts.push('      const email = document.getElementById(\'email\').value;');
        parts.push('      const errorDiv = document.getElementById(\'email-error\');');
        parts.push('      const re = /^[^\\\\s@]+@[^\\\\s@]+\\\\.[^\\\\s@]+$/;');
        parts.push('      if (!re.test(email)) {');
        parts.push('        errorDiv.textContent = \'Please enter a valid email address\';');
        parts.push('        errorDiv.style.display = \'block\';');
        parts.push('        document.getElementById(\'email\').setAttribute(\'aria-invalid\', \'true\');');
        parts.push('      } else {');
        parts.push('        errorDiv.style.display = \'none\';');
        parts.push('        document.getElementById(\'email\').setAttribute(\'aria-invalid\', \'false\');');
        parts.push('        // Submit form');
        parts.push('      }');
        parts.push('    });');
        parts.push('  ' + lt + slash + 'script' + gt);
        parts.push(lt + slash + 'body' + gt);
        parts.push(lt + slash + 'html' + gt);
        return parts.join('\n');
      })()
    },
    usageExample: 'Use this snippet for any form that requires email validation with proper error handling and accessibility.',
    props: [
      { name: 'email', type: 'string', required: true, description: 'Email address to validate', default: '' }
    ]
  },
  {
    id: 'modal-component',
    title: 'Accessible Modal',
    description: 'Fully accessible modal dialog with focus trap and keyboard support',
    category: 'feedback',
    framework: 'vue',
    tags: ['modal', 'dialog', 'accessibility'],
    useCase: 'User Feedback',
    complexity: 'Advanced',
    code: {
      vue: `<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal" role="dialog" aria-modal="true" :aria-labelledby="titleId">
      <div class="modal-header">
        <h2 :id="titleId">{{ title }}</h2>
        <button @click="close" aria-label="Close modal">×</button>
      </div>
      <div class="modal-body">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  title: { type: String, required: true }
});

const emit = defineEmits(['close']);

const titleId = computed(() => \`modal-title-\${props.title.toLowerCase().replace(/\\s/g, '-')}\`);

const close = () => {
  emit('close');
};

const handleEscape = (e) => {
  if (e.key === 'Escape' && props.isOpen) {
    close();
  }
};

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);
  } else {
    document.body.style.overflow = '';
    document.removeEventListener('keydown', handleEscape);
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleEscape);
  document.body.style.overflow = '';
});
<\/script>`,
      react: `import React, { useEffect } from 'react';

function Modal({ isOpen, title, onClose, children }) {
  const titleId = \`modal-title-\${title.toLowerCase().replace(/\\s/g, '-')}\`;

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id={titleId}>{title}</h2>
          <button onClick={onClose} aria-label="Close modal">×</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}`,
      html: (() => {
        const lt = '<';
        const gt = '>';
        const slash = '/';
        const parts = [];
        parts.push('<!DOCTYPE html>');
        parts.push(lt + 'html' + gt);
        parts.push(lt + 'head' + gt);
        parts.push('  ' + lt + 'title' + gt + 'Accessible Modal' + lt + slash + 'title' + gt);
        parts.push(lt + slash + 'head' + gt);
        parts.push(lt + 'body' + gt);
        parts.push('  ' + lt + 'button onclick="openModal()"' + gt + 'Open Modal' + lt + slash + 'button' + gt);
        parts.push('  ' + lt + 'div id="modal" class="modal-overlay" style="display: none;" onclick="closeModal(event)"' + gt);
        parts.push('    ' + lt + 'div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onclick="event.stopPropagation()"' + gt);
        parts.push('      ' + lt + 'div class="modal-header"' + gt);
        parts.push('        ' + lt + 'h2 id="modal-title"' + gt + 'Modal Title' + lt + slash + 'h2' + gt);
        parts.push('        ' + lt + 'button onclick="closeModal()" aria-label="Close modal"' + gt + '×' + lt + slash + 'button' + gt);
        parts.push('      ' + lt + slash + 'div' + gt);
        parts.push('      ' + lt + 'div class="modal-body"' + gt);
        parts.push('        Modal content here');
        parts.push('      ' + lt + slash + 'div' + gt);
        parts.push('    ' + lt + slash + 'div' + gt);
        parts.push('  ' + lt + slash + 'div' + gt);
        parts.push('  ' + lt + 'script' + gt);
        parts.push('    function openModal() {');
        parts.push('      document.getElementById(\'modal\').style.display = \'flex\';');
        parts.push('      document.body.style.overflow = \'hidden\';');
        parts.push('      document.addEventListener(\'keydown\', handleEscape);');
        parts.push('    }');
        parts.push('    function closeModal(e) {');
        parts.push('      if (!e || e.target.classList.contains(\'modal-overlay\')) {');
        parts.push('        document.getElementById(\'modal\').style.display = \'none\';');
        parts.push('        document.body.style.overflow = \'\';');
        parts.push('        document.removeEventListener(\'keydown\', handleEscape);');
        parts.push('      }');
        parts.push('    }');
        parts.push('    function handleEscape(e) {');
        parts.push('      if (e.key === \'Escape\') closeModal();');
        parts.push('    }');
        parts.push('  ' + lt + slash + 'script' + gt);
        parts.push(lt + slash + 'body' + gt);
        parts.push(lt + slash + 'html' + gt);
        return parts.join('\n');
      })()
    },
    usageExample: 'Use this modal component for any dialog that needs to be accessible and keyboard-friendly.',
    props: [
      { name: 'isOpen', type: 'boolean', required: true, description: 'Controls modal visibility', default: false },
      { name: 'title', type: 'string', required: true, description: 'Modal title', default: '' }
    ]
  },
  {
    id: 'data-table',
    title: 'Sortable Data Table',
    description: 'Data table with sorting, filtering, and pagination',
    category: 'data-display',
    framework: 'vue',
    tags: ['table', 'data', 'sorting'],
    useCase: 'Data Display',
    complexity: 'Advanced',
    code: {
      vue: `<template>
  <div>
    <input v-model="searchQuery" placeholder="Search..." />
    <table>
      <thead>
        <tr>
          <th @click="sort('name')">
            Name
            <span v-if="sortKey === 'name'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
          </th>
          <th @click="sort('email')">
            Email
            <span v-if="sortKey === 'email'">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in paginatedData" :key="item.id">
          <td>{{ item.name }}</td>
          <td>{{ item.email }}</td>
        </tr>
      </tbody>
    </table>
    <div class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const data = ref([...]);
const searchQuery = ref('');
const sortKey = ref('');
const sortOrder = ref('asc');
const currentPage = ref(1);
const itemsPerPage = 10;

const filteredData = computed(() => {
  return data.value.filter(item => 
    item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    item.email.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const sortedData = computed(() => {
  if (!sortKey.value) return filteredData.value;
  return [...filteredData.value].sort((a, b) => {
    const aVal = a[sortKey.value];
    const bVal = b[sortKey.value];
    return sortOrder.value === 'asc' 
      ? aVal.localeCompare(bVal)
      : bVal.localeCompare(aVal);
  });
});

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return sortedData.value.slice(start, start + itemsPerPage);
});

const totalPages = computed(() => Math.ceil(sortedData.value.length / itemsPerPage));

const sort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};
<\/script>`,
      react: `import React, { useState, useMemo } from 'react';

function DataTable({ data }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredData = useMemo(() => {
    return data.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      return sortOrder === 'asc' 
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });
  }, [filteredData, sortKey, sortOrder]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const sort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  return (
    <div>
      <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." />
      <table>
        <thead>
          <tr>
            <th onClick={() => sort('name')}>
              Name {sortKey === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => sort('email')}>
              Email {sortKey === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
            </th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.map(item => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}`,
      html: (() => {
        const lt = '<';
        const gt = '>';
        const slash = '/';
        const parts = [];
        parts.push('<!DOCTYPE html>');
        parts.push(lt + 'html' + gt);
        parts.push(lt + 'head' + gt);
        parts.push('  ' + lt + 'title' + gt + 'Sortable Data Table' + lt + slash + 'title' + gt);
        parts.push(lt + slash + 'head' + gt);
        parts.push(lt + 'body' + gt);
        parts.push('  ' + lt + 'input id="search" type="text" placeholder="Search..." /' + gt);
        parts.push('  ' + lt + 'table id="dataTable"' + gt);
        parts.push('    ' + lt + 'thead' + gt);
        parts.push('      ' + lt + 'tr' + gt);
        parts.push('        ' + lt + 'th onclick="sort(\'name\')"' + gt + 'Name ' + lt + 'span id="name-sort"' + gt + lt + slash + 'span' + gt + lt + slash + 'th' + gt);
        parts.push('        ' + lt + 'th onclick="sort(\'email\')"' + gt + 'Email ' + lt + 'span id="email-sort"' + gt + lt + slash + 'span' + gt + lt + slash + 'th' + gt);
        parts.push('      ' + lt + slash + 'tr' + gt);
        parts.push('    ' + lt + slash + 'thead' + gt);
        parts.push('    ' + lt + 'tbody id="tableBody"' + gt + lt + slash + 'tbody' + gt);
        parts.push('  ' + lt + slash + 'table' + gt);
        parts.push('  ' + lt + 'div class="pagination"' + gt);
        parts.push('    ' + lt + 'button onclick="prevPage()" id="prevBtn"' + gt + 'Previous' + lt + slash + 'button' + gt);
        parts.push('    ' + lt + 'span id="pageInfo"' + gt + 'Page 1 of 1' + lt + slash + 'span' + gt);
        parts.push('    ' + lt + 'button onclick="nextPage()" id="nextBtn"' + gt + 'Next' + lt + slash + 'button' + gt);
        parts.push('  ' + lt + slash + 'div' + gt);
        parts.push('  ' + lt + 'script' + gt);
        parts.push('    let data = [...];');
        parts.push('    let searchQuery = \'\';');
        parts.push('    let sortKey = \'\';');
        parts.push('    let sortOrder = \'asc\';');
        parts.push('    let currentPage = 1;');
        parts.push('    const itemsPerPage = 10;');
        parts.push('');
        parts.push('    document.getElementById(\'search\').addEventListener(\'input\', (e) => {');
        parts.push('      searchQuery = e.target.value.toLowerCase();');
        parts.push('      renderTable();');
        parts.push('    });');
        parts.push('');
        parts.push('    function sort(key) {');
        parts.push('      if (sortKey === key) {');
        parts.push('        sortOrder = sortOrder === \'asc\' ? \'desc\' : \'asc\';');
        parts.push('      } else {');
        parts.push('        sortKey = key;');
        parts.push('        sortOrder = \'asc\';');
        parts.push('      }');
        parts.push('      renderTable();');
        parts.push('    }');
        parts.push('');
        parts.push('    function renderTable() {');
        parts.push('      // Filter, sort, paginate and render');
        parts.push('    }');
        parts.push('');
        parts.push('    function nextPage() {');
        parts.push('      const totalPages = Math.ceil(filteredData.length / itemsPerPage);');
        parts.push('      if (currentPage < totalPages) {');
        parts.push('        currentPage++;');
        parts.push('        renderTable();');
        parts.push('      }');
        parts.push('    }');
        parts.push('');
        parts.push('    function prevPage() {');
        parts.push('      if (currentPage > 1) {');
        parts.push('        currentPage--;');
        parts.push('        renderTable();');
        parts.push('      }');
        parts.push('    }');
        parts.push('  ' + lt + slash + 'script' + gt);
        parts.push(lt + slash + 'body' + gt);
        parts.push(lt + slash + 'html' + gt);
        return parts.join('\n');
      })()
    },
    usageExample: 'Use this table component for displaying large datasets with search, sort, and pagination capabilities.',
    props: [
      { name: 'data', type: 'array', required: true, description: 'Array of data objects to display', default: '[]' },
      { name: 'itemsPerPage', type: 'number', required: false, description: 'Number of items per page', default: 10 }
    ]
  },
  {
    id: 'authentication-form',
    title: 'Login Form',
    description: 'Complete authentication form with validation and error handling',
    category: 'authentication',
    framework: 'vue',
    tags: ['auth', 'form', 'security'],
    useCase: 'Authentication',
    complexity: 'Intermediate',
    code: {
      vue: `<template>
  <form @submit.prevent="handleLogin">
    <div class="form-group">
      <label for="username">Username</label>
      <input
        id="username"
        v-model="form.username"
        type="text"
        required
        autocomplete="username"
      />
    </div>
    <div class="form-group">
      <label for="password">Password</label>
      <input
        id="password"
        v-model="form.password"
        type="password"
        required
        autocomplete="current-password"
      />
    </div>
    <div v-if="error" class="error" role="alert">
      {{ error }}
    </div>
    <button type="submit" :disabled="loading">
      {{ loading ? 'Logging in...' : 'Login' }}
    </button>
  </form>
</template>

<script setup>
import { ref } from 'vue';

const form = ref({ username: '', password: '' });
const loading = ref(false);
const error = ref('');

const handleLogin = async () => {
  loading.value = true;
  error.value = '';
  try {
    // API call
    await login(form.value);
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};
<\/script>`,
      react: `import React, { useState } from 'react';

function LoginForm() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // API call
      await login(form);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <div className="form-group">
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
          autoComplete="username"
        />
      </div>
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          autoComplete="current-password"
        />
      </div>
      {error && <div className="error" role="alert">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}`,
      html: (() => {
        const lt = '<';
        const gt = '>';
        const slash = '/';
        const parts = [];
        parts.push('<!DOCTYPE html>');
        parts.push(lt + 'html' + gt);
        parts.push(lt + 'head' + gt);
        parts.push('  ' + lt + 'title' + gt + 'Login Form' + lt + slash + 'title' + gt);
        parts.push(lt + slash + 'head' + gt);
        parts.push(lt + 'body' + gt);
        parts.push('  ' + lt + 'form id="loginForm"' + gt);
        parts.push('    ' + lt + 'div class="form-group"' + gt);
        parts.push('      ' + lt + 'label for="username"' + gt + 'Username' + lt + slash + 'label' + gt);
        parts.push('      ' + lt + 'input id="username" type="text" required autocomplete="username" /' + gt);
        parts.push('    ' + lt + slash + 'div' + gt);
        parts.push('    ' + lt + 'div class="form-group"' + gt);
        parts.push('      ' + lt + 'label for="password"' + gt + 'Password' + lt + slash + 'label' + gt);
        parts.push('      ' + lt + 'input id="password" type="password" required autocomplete="current-password" /' + gt);
        parts.push('    ' + lt + slash + 'div' + gt);
        parts.push('    ' + lt + 'div id="error" class="error" role="alert" style="display: none;"' + gt + lt + slash + 'div' + gt);
        parts.push('    ' + lt + 'button type="submit"' + gt + 'Login' + lt + slash + 'button' + gt);
        parts.push('  ' + lt + slash + 'form' + gt);
        parts.push('  ' + lt + 'script' + gt);
        parts.push('    document.getElementById(\'loginForm\').addEventListener(\'submit\', async (e) => {');
        parts.push('      e.preventDefault();');
        parts.push('      const username = document.getElementById(\'username\').value;');
        parts.push('      const password = document.getElementById(\'password\').value;');
        parts.push('      const errorDiv = document.getElementById(\'error\');');
        parts.push('      try {');
        parts.push('        // API call');
        parts.push('        await login({ username, password });');
        parts.push('      } catch (err) {');
        parts.push('        errorDiv.textContent = err.message;');
        parts.push('        errorDiv.style.display = \'block\';');
        parts.push('      }');
        parts.push('    });');
        parts.push('  ' + lt + slash + 'script' + gt);
        parts.push(lt + slash + 'body' + gt);
        parts.push(lt + slash + 'html' + gt);
        return parts.join('\n');
      })()
    },
    usageExample: 'Use this form for user authentication with proper security practices and error handling.',
    props: [
      { name: 'username', type: 'string', required: true, description: 'User username', default: '' },
      { name: 'password', type: 'string', required: true, description: 'User password', default: '' }
    ]
  },
  {
    id: 'navigation-menu',
    title: 'Responsive Navigation',
    description: 'Mobile-responsive navigation menu with dropdowns',
    category: 'navigation',
    framework: 'vue',
    tags: ['navigation', 'menu', 'responsive'],
    useCase: 'Navigation',
    complexity: 'Intermediate',
    code: {
      vue: `<template>
  <nav class="navbar">
    <div class="nav-container">
      <button @click="toggleMobileMenu" class="mobile-toggle" aria-label="Toggle menu">
        ☰
      </button>
      <ul :class="['nav-menu', { active: mobileMenuOpen }]">
        <li v-for="item in menuItems" :key="item.id">
          <a :href="item.href" @click="closeMobileMenu">{{ item.label }}</a>
          <ul v-if="item.children" class="dropdown">
            <li v-for="child in item.children" :key="child.id">
              <a :href="child.href">{{ child.label }}</a>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue';

const mobileMenuOpen = ref(false);
const menuItems = ref([...]);

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

const closeMobileMenu = () => {
  mobileMenuOpen.value = false;
};
<\/script>`,
      react: `import React, { useState } from 'react';

function Navigation({ menuItems }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="mobile-toggle" aria-label="Toggle menu">
          ☰
        </button>
        <ul className={\`nav-menu \${mobileMenuOpen ? 'active' : ''}\`}>
          {menuItems.map(item => (
            <li key={item.id}>
              <a href={item.href} onClick={() => setMobileMenuOpen(false)}>{item.label}</a>
              {item.children && (
                <ul className="dropdown">
                  {item.children.map(child => (
                    <li key={child.id}>
                      <a href={child.href}>{child.label}</a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}`,
      html: (() => {
        const lt = '<';
        const gt = '>';
        const slash = '/';
        const parts = [];
        parts.push('<!DOCTYPE html>');
        parts.push(lt + 'html' + gt);
        parts.push(lt + 'head' + gt);
        parts.push('  ' + lt + 'title' + gt + 'Responsive Navigation' + lt + slash + 'title' + gt);
        parts.push(lt + slash + 'head' + gt);
        parts.push(lt + 'body' + gt);
        parts.push('  ' + lt + 'nav class="navbar"' + gt);
        parts.push('    ' + lt + 'div class="nav-container"' + gt);
        parts.push('      ' + lt + 'button onclick="toggleMobileMenu()" class="mobile-toggle" aria-label="Toggle menu"' + gt + '☰' + lt + slash + 'button' + gt);
        parts.push('      ' + lt + 'ul id="navMenu" class="nav-menu"' + gt);
        parts.push('        ' + lt + 'li' + gt + lt + 'a href="#home"' + gt + 'Home' + lt + slash + 'a' + gt + lt + slash + 'li' + gt);
        parts.push('        ' + lt + 'li' + gt);
        parts.push('          ' + lt + 'a href="#about"' + gt + 'About' + lt + slash + 'a' + gt);
        parts.push('          ' + lt + 'ul class="dropdown"' + gt);
        parts.push('            ' + lt + 'li' + gt + lt + 'a href="#team"' + gt + 'Team' + lt + slash + 'a' + gt + lt + slash + 'li' + gt);
        parts.push('            ' + lt + 'li' + gt + lt + 'a href="#history"' + gt + 'History' + lt + slash + 'a' + gt + lt + slash + 'li' + gt);
        parts.push('          ' + lt + slash + 'ul' + gt);
        parts.push('        ' + lt + slash + 'li' + gt);
        parts.push('        ' + lt + 'li' + gt + lt + 'a href="#contact"' + gt + 'Contact' + lt + slash + 'a' + gt + lt + slash + 'li' + gt);
        parts.push('      ' + lt + slash + 'ul' + gt);
        parts.push('    ' + lt + slash + 'div' + gt);
        parts.push('  ' + lt + slash + 'nav' + gt);
        parts.push('  ' + lt + 'script' + gt);
        parts.push('    function toggleMobileMenu() {');
        parts.push('      document.getElementById(\'navMenu\').classList.toggle(\'active\');');
        parts.push('    }');
        parts.push('  ' + lt + slash + 'script' + gt);
        parts.push(lt + slash + 'body' + gt);
        parts.push(lt + slash + 'html' + gt);
        return parts.join('\n');
      })()
    },
    usageExample: 'Use this navigation component for responsive menus that work on both desktop and mobile devices.',
    props: [
      { name: 'menuItems', type: 'array', required: true, description: 'Array of menu items with optional children', default: '[]' }
    ]
  },
  {
    id: 'toast-notification',
    title: 'Toast Notification',
    description: 'Toast notification system for temporary messages',
    category: 'feedback',
    framework: 'vue',
    tags: ['notification', 'toast', 'feedback'],
    useCase: 'User Feedback',
    complexity: 'Beginner',
    code: {
      vue: `<template>
  <div class="toast-container">
    <transition-group name="toast" tag="div">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['toast', \`toast-\${toast.type}\`]"
        role="alert"
      >
        {{ toast.message }}
        <button @click="removeToast(toast.id)" aria-label="Close">×</button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const toasts = ref([]);
let toastId = 0;

const showToast = (message, type = 'info', duration = 3000) => {
  const id = toastId++;
  toasts.value.push({ id, message, type });
  setTimeout(() => removeToast(id), duration);
};

const removeToast = (id) => {
  const index = toasts.value.findIndex(t => t.id === id);
  if (index > -1) {
    toasts.value.splice(index, 1);
  }
};
<\/script>`,
      react: `import React, { useState } from 'react';

function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  let toastId = 0;

  const showToast = (message, type = 'info', duration = 3000) => {
    const id = toastId++;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={\`toast toast-\${toast.type}\`} role="alert">
          {toast.message}
          <button onClick={() => removeToast(toast.id)} aria-label="Close">×</button>
        </div>
      ))}
    </div>
  );
}`,
      html: (() => {
        const lt = '<';
        const gt = '>';
        const slash = '/';
        const parts = [];
        parts.push('<!DOCTYPE html>');
        parts.push(lt + 'html' + gt);
        parts.push(lt + 'head' + gt);
        parts.push('  ' + lt + 'title' + gt + 'Toast Notification' + lt + slash + 'title' + gt);
        parts.push(lt + slash + 'head' + gt);
        parts.push(lt + 'body' + gt);
        parts.push('  ' + lt + 'div id="toastContainer" class="toast-container"' + gt + lt + slash + 'div' + gt);
        parts.push('  ' + lt + 'script' + gt);
        parts.push('    let toastId = 0;');
        parts.push('    function showToast(message, type = \'info\', duration = 3000) {');
        parts.push('      const id = toastId++;');
        parts.push('      const toast = document.createElement(\'div\');');
        parts.push('      toast.id = \\`toast-\\${id}\\`;');
        parts.push('      toast.className = \\`toast toast-\\${type}\\`;');
        parts.push('      toast.setAttribute(\'role\', \'alert\');');
        parts.push('      toast.innerHTML = \\`\\${message} ' + lt + 'button onclick="removeToast(\\${id})" aria-label="Close"' + gt + '×' + lt + slash + 'button' + gt + '\\`;');
        parts.push('      document.getElementById(\'toastContainer\').appendChild(toast);');
        parts.push('      setTimeout(() => removeToast(id), duration);');
        parts.push('    }');
        parts.push('    function removeToast(id) {');
        parts.push('      const toast = document.getElementById(\\`toast-\\${id}\\`);');
        parts.push('      if (toast) toast.remove();');
        parts.push('    }');
        parts.push('  ' + lt + slash + 'script' + gt);
        parts.push(lt + slash + 'body' + gt);
        parts.push(lt + slash + 'html' + gt);
        return parts.join('\n');
      })()
    },
    usageExample: 'Use this toast system to show temporary success, error, or info messages to users.',
    props: [
      { name: 'message', type: 'string', required: true, description: 'Toast message text', default: '' },
      { name: 'type', type: 'string', required: false, description: 'Toast type (success, error, info, warning)', default: 'info' },
      { name: 'duration', type: 'number', required: false, description: 'Display duration in milliseconds', default: 3000 }
    ]
  }
]);

const filteredSnippets = computed(() => {
  let result = snippets.value;

  if (selectedCategory.value) {
    result = result.filter(s => s.category === selectedCategory.value);
  }

  if (selectedFramework.value) {
    result = result.filter(s => s.framework === selectedFramework.value);
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(s =>
      s.title.toLowerCase().includes(query) ||
      s.description.toLowerCase().includes(query) ||
      s.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }

  return result;
});

const getCategoryBadgeClass = (category) => {
  const classes = {
    'forms': isDarkMode.value ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700',
    'navigation': isDarkMode.value ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700',
    'data-display': isDarkMode.value ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700',
    'feedback': isDarkMode.value ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-700',
    'layout': isDarkMode.value ? 'bg-indigo-900/30 text-indigo-300' : 'bg-indigo-100 text-indigo-700',
    'authentication': isDarkMode.value ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700',
    'utilities': isDarkMode.value ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
  };
  return classes[category] || (isDarkMode.value ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700');
};

const getSnippetCode = (snippet, framework = null) => {
  const fw = framework || viewingFramework.value || snippet.framework;
  return snippet.code[fw] || snippet.code.vue || '';
};

const copySnippet = async (snippet) => {
  const code = getSnippetCode(snippet, viewingFramework.value || snippet.framework);
  try {
    await navigator.clipboard.writeText(code);
    // Could add toast notification here
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

const viewSnippet = (snippet) => {
  selectedSnippet.value = snippet;
  viewingFramework.value = snippet.framework;
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

