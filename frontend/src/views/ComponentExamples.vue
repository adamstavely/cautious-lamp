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
                  Interactive Component Examples
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Explore detailed examples and use cases for all components. Copy code snippets and see components in action.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="max-w-7xl mx-auto">
          <!-- Component Filter -->
          <div 
            class="rounded-lg shadow-sm border p-6 mb-6"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <div class="flex items-center gap-4">
              <label class="text-sm font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                Filter by component:
              </label>
              <select
                v-model="selectedComponent"
                class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                :class="isDarkMode 
                  ? 'border-gray-600 bg-slate-700 text-white' 
                  : 'border-gray-300 bg-white text-gray-900'"
              >
                <option value="">All Components</option>
                <option value="button">Button</option>
                <option value="card">Card</option>
                <option value="input">Input</option>
                <option value="modal">Modal</option>
                <option value="form">Form</option>
                <option value="table">Table</option>
              </select>
            </div>
          </div>

          <!-- Component Examples -->
          <div class="space-y-8">
            <div
              v-for="component in filteredComponents"
              :key="component.id"
              class="rounded-lg shadow-sm border overflow-hidden"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <!-- Component Header -->
              <div 
                class="px-6 py-4 border-b"
                :class="isDarkMode ? 'border-gray-700 bg-slate-800' : 'border-gray-200 bg-gray-50'"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <h2 class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      {{ component.name }}
                    </h2>
                    <p class="text-sm mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      {{ component.description }}
                    </p>
                  </div>
                  <span class="px-3 py-1 rounded-full text-xs font-medium" :class="component.status === 'production' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'">
                    {{ component.status === 'production' ? 'Production' : 'Beta' }}
                  </span>
                </div>
              </div>

              <!-- Examples -->
              <div class="p-6 space-y-6">
                <div
                  v-for="(example, exampleIndex) in component.examples"
                  :key="exampleIndex"
                  class="rounded-lg border overflow-hidden"
                  :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'"
                >
                  <!-- Example Header -->
                  <div 
                    class="px-4 py-3 border-b flex items-center justify-between"
                    :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'"
                  >
                    <div>
                      <h3 class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                        {{ example.title }}
                      </h3>
                      <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        {{ example.description }}
                      </p>
                    </div>
                    <button
                      @click="copyExample(example.code)"
                      class="px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-2"
                      :class="isDarkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                    >
                      <span class="material-symbols-outlined text-sm">content_copy</span>
                      Copy Code
                    </button>
                  </div>

                  <!-- Live Preview -->
                  <div class="p-6" :class="isDarkMode ? 'bg-slate-950' : 'bg-white'">
                    <div v-html="example.preview"></div>
                  </div>

                  <!-- Code Snippet -->
                  <div 
                    class="border-t"
                    :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'"
                  >
                    <div class="p-4 bg-slate-950 overflow-x-auto">
                      <pre class="text-xs text-green-400 font-mono whitespace-pre-wrap"><code>{{ example.code }}</code></pre>
                    </div>
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const selectedComponent = ref('');

const components = ref([
  {
    id: 1,
    name: 'Button',
    description: 'Interactive buttons for triggering actions',
    status: 'production',
    examples: [
      {
        title: 'Basic Button',
        description: 'Simple button with default styling',
        preview: '<button class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">Click me</button>',
        code: '<button class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">\n  Click me\n</button>'
      },
      {
        title: 'Button Variants',
        description: 'Primary, secondary, and tertiary variants',
        preview: '<div class="flex gap-3"><button class="px-4 py-2 bg-indigo-600 text-white rounded-lg">Primary</button><button class="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg">Secondary</button><button class="px-4 py-2 text-indigo-600 rounded-lg">Tertiary</button></div>',
        code: '<button class="px-4 py-2 bg-indigo-600 text-white rounded-lg">Primary</button>\n<button class="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg">Secondary</button>\n<button class="px-4 py-2 text-indigo-600 rounded-lg">Tertiary</button>'
      },
      {
        title: 'Button Sizes',
        description: 'Small, medium, and large button sizes',
        preview: '<div class="flex items-center gap-3"><button class="px-2 py-1 text-sm bg-indigo-600 text-white rounded">Small</button><button class="px-4 py-2 bg-indigo-600 text-white rounded-lg">Medium</button><button class="px-6 py-3 text-lg bg-indigo-600 text-white rounded-lg">Large</button></div>',
        code: '<button class="px-2 py-1 text-sm bg-indigo-600 text-white rounded">Small</button>\n<button class="px-4 py-2 bg-indigo-600 text-white rounded-lg">Medium</button>\n<button class="px-6 py-3 text-lg bg-indigo-600 text-white rounded-lg">Large</button>'
      },
      {
        title: 'Button with Icon',
        description: 'Button with leading icon',
        preview: '<button class="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>Add Item</button>',
        code: '<button class="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2">\n  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">\n    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>\n  </svg>\n  Add Item\n</button>'
      },
      {
        title: 'Loading State',
        description: 'Button in loading state',
        preview: '<button disabled class="px-4 py-2 bg-indigo-600 text-white rounded-lg opacity-50 cursor-not-allowed flex items-center gap-2"><svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Loading...</button>',
        code: '<button disabled class="px-4 py-2 bg-indigo-600 text-white rounded-lg opacity-50 cursor-not-allowed flex items-center gap-2">\n  <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">\n    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>\n    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>\n  </svg>\n  Loading...\n</button>'
      }
    ]
  },
  {
    id: 2,
    name: 'Card',
    description: 'Container component for grouping related content',
    status: 'production',
    examples: [
      {
        title: 'Basic Card',
        description: 'Simple card with title and content',
        preview: '<div class="border rounded-lg p-6 max-w-sm"><h3 class="text-lg font-semibold mb-2">Card Title</h3><p class="text-gray-600">Card content goes here. This is a simple example of a card component.</p></div>',
        code: '<div class="border rounded-lg p-6">\n  <h3 class="text-lg font-semibold mb-2">Card Title</h3>\n  <p class="text-gray-600">Card content goes here.</p>\n</div>'
      },
      {
        title: 'Card with Image',
        description: 'Card with header image',
        preview: '<div class="border rounded-lg overflow-hidden max-w-sm"><img src="https://via.placeholder.com/400x200" alt="Card image" class="w-full h-48 object-cover"><div class="p-6"><h3 class="text-lg font-semibold mb-2">Card with Image</h3><p class="text-gray-600">This card includes an image header.</p></div></div>',
        code: '<div class="border rounded-lg overflow-hidden">\n  <img src="/image.jpg" alt="Card image" class="w-full h-48 object-cover">\n  <div class="p-6">\n    <h3 class="text-lg font-semibold mb-2">Card with Image</h3>\n    <p class="text-gray-600">This card includes an image header.</p>\n  </div>\n</div>'
      },
      {
        title: 'Card with Actions',
        description: 'Card with footer actions',
        preview: '<div class="border rounded-lg p-6 max-w-sm"><h3 class="text-lg font-semibold mb-2">Card Title</h3><p class="text-gray-600 mb-4">Card content with actions.</p><div class="flex gap-2"><button class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">Action</button><button class="px-4 py-2 border rounded-lg text-sm">Cancel</button></div></div>',
        code: '<div class="border rounded-lg p-6">\n  <h3 class="text-lg font-semibold mb-2">Card Title</h3>\n  <p class="text-gray-600 mb-4">Card content with actions.</p>\n  <div class="flex gap-2">\n    <button class="px-4 py-2 bg-indigo-600 text-white rounded-lg">Action</button>\n    <button class="px-4 py-2 border rounded-lg">Cancel</button>\n  </div>\n</div>'
      }
    ]
  },
  {
    id: 3,
    name: 'Input',
    description: 'Form input fields for user data entry',
    status: 'production',
    examples: [
      {
        title: 'Text Input',
        description: 'Basic text input field',
        preview: '<div class="max-w-sm"><label class="block text-sm font-medium mb-1">Name</label><input type="text" placeholder="Enter your name" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"></div>',
        code: '<label class="block text-sm font-medium mb-1">Name</label>\n<input type="text" placeholder="Enter your name" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none">'
      },
      {
        title: 'Input with Error',
        description: 'Input field with error state',
        preview: '<div class="max-w-sm"><label class="block text-sm font-medium mb-1 text-red-600">Email</label><input type="email" placeholder="email@example.com" class="w-full px-4 py-2 border border-red-500 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"><p class="text-xs text-red-600 mt-1">Please enter a valid email</p></div>',
        code: '<label class="block text-sm font-medium mb-1 text-red-600">Email</label>\n<input type="email" class="w-full px-4 py-2 border border-red-500 rounded-lg focus:ring-2 focus:ring-red-500 outline-none">\n<p class="text-xs text-red-600 mt-1">Please enter a valid email</p>'
      },
      {
        title: 'Input with Icon',
        description: 'Input field with leading icon',
        preview: '<div class="max-w-sm relative"><label class="block text-sm font-medium mb-1">Search</label><div class="relative"><span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span><input type="text" placeholder="Search..." class="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"></div></div>',
        code: '<div class="relative">\n  <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>\n  <input type="text" placeholder="Search..." class="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">\n</div>'
      }
    ]
  },
  {
    id: 4,
    name: 'Modal',
    description: 'Dialog component for overlaying content',
    status: 'production',
    examples: [
      {
        title: 'Basic Modal',
        description: 'Simple modal dialog',
        preview: '<div class="border rounded-lg p-6 max-w-md bg-white shadow-lg"><div class="flex items-center justify-between mb-4"><h3 class="text-lg font-semibold">Modal Title</h3><button class="text-gray-400 hover:text-gray-600">×</button></div><p class="text-gray-600 mb-4">Modal content goes here.</p><div class="flex justify-end gap-2"><button class="px-4 py-2 border rounded-lg">Cancel</button><button class="px-4 py-2 bg-indigo-600 text-white rounded-lg">Confirm</button></div></div>',
        code: '<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">\n  <div class="bg-white rounded-lg p-6 max-w-md">\n    <div class="flex items-center justify-between mb-4">\n      <h3 class="text-lg font-semibold">Modal Title</h3>\n      <button>×</button>\n    </div>\n    <p class="text-gray-600 mb-4">Modal content goes here.</p>\n    <div class="flex justify-end gap-2">\n      <button class="px-4 py-2 border rounded-lg">Cancel</button>\n      <button class="px-4 py-2 bg-indigo-600 text-white rounded-lg">Confirm</button>\n    </div>\n  </div>\n</div>'
      }
    ]
  },
  {
    id: 5,
    name: 'Form',
    description: 'Complete form components with validation',
    status: 'production',
    examples: [
      {
        title: 'Login Form',
        description: 'Complete login form example',
        preview: '<div class="max-w-sm border rounded-lg p-6"><h3 class="text-lg font-semibold mb-4">Login</h3><div class="space-y-4"><div><label class="block text-sm font-medium mb-1">Email</label><input type="email" placeholder="email@example.com" class="w-full px-4 py-2 border rounded-lg"></div><div><label class="block text-sm font-medium mb-1">Password</label><input type="password" placeholder="••••••••" class="w-full px-4 py-2 border rounded-lg"></div><button class="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg">Sign In</button></div></div>',
        code: '<form class="space-y-4">\n  <div>\n    <label class="block text-sm font-medium mb-1">Email</label>\n    <input type="email" placeholder="email@example.com" class="w-full px-4 py-2 border rounded-lg">\n  </div>\n  <div>\n    <label class="block text-sm font-medium mb-1">Password</label>\n    <input type="password" placeholder="••••••••" class="w-full px-4 py-2 border rounded-lg">\n  </div>\n  <button type="submit" class="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg">Sign In</button>\n</form>'
      }
    ]
  },
  {
    id: 6,
    name: 'Table',
    description: 'Data table component for displaying structured data',
    status: 'beta',
    examples: [
      {
        title: 'Basic Table',
        description: 'Simple data table',
        preview: '<div class="border rounded-lg overflow-hidden"><table class="w-full"><thead class="bg-gray-50"><tr><th class="px-4 py-2 text-left text-sm font-medium">Name</th><th class="px-4 py-2 text-left text-sm font-medium">Email</th><th class="px-4 py-2 text-left text-sm font-medium">Role</th></tr></thead><tbody><tr class="border-t"><td class="px-4 py-2">John Doe</td><td class="px-4 py-2">john@example.com</td><td class="px-4 py-2">Admin</td></tr><tr class="border-t"><td class="px-4 py-2">Jane Smith</td><td class="px-4 py-2">jane@example.com</td><td class="px-4 py-2">User</td></tr></tbody></table></div>',
        code: '<table class="w-full border rounded-lg">\n  <thead class="bg-gray-50">\n    <tr>\n      <th class="px-4 py-2 text-left">Name</th>\n      <th class="px-4 py-2 text-left">Email</th>\n      <th class="px-4 py-2 text-left">Role</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr class="border-t">\n      <td class="px-4 py-2">John Doe</td>\n      <td class="px-4 py-2">john@example.com</td>\n      <td class="px-4 py-2">Admin</td>\n    </tr>\n  </tbody>\n</table>'
      }
    ]
  }
]);

const filteredComponents = computed(() => {
  if (!selectedComponent.value) return components.value;
  return components.value.filter(c => c.name.toLowerCase() === selectedComponent.value.toLowerCase());
});

const copyExample = async (code) => {
  try {
    await navigator.clipboard.writeText(code);
    // Could add a toast notification here
  } catch (err) {
    console.error('Failed to copy:', err);
  }
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

