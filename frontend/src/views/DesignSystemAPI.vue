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
                  Design System API
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Access design tokens and components programmatically via REST and GraphQL APIs.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- API Overview -->
        <div class="max-w-7xl mx-auto mb-8">
          <div 
            class="rounded-lg shadow-sm border p-6"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <div class="flex items-start gap-4 mb-6">
              <div class="p-3 rounded-lg" :class="isDarkMode ? 'bg-indigo-900/30' : 'bg-indigo-50'">
                <span class="material-symbols-outlined text-2xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                  code
                </span>
              </div>
              <div class="flex-1">
                <h2 class="text-2xl font-bold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  API Endpoints
                </h2>
                <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  Base URL: <code class="px-2 py-1 rounded" :class="isDarkMode ? 'bg-slate-800 text-indigo-400' : 'bg-gray-100 text-indigo-600'">https://api.designsystem.com/v1</code>
                </p>
              </div>
            </div>

            <!-- REST API -->
            <div class="mb-8">
              <h3 class="text-xl font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                REST API
              </h3>
              <div class="space-y-4">
                <!-- Get All Tokens -->
                <div class="border rounded-lg overflow-hidden" :class="isDarkMode ? 'border-gray-700 bg-slate-800' : 'border-gray-200 bg-gray-50'">
                  <div class="flex items-center gap-3 p-4 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                    <span class="px-3 py-1 rounded text-sm font-medium bg-green-500 text-white">GET</span>
                    <code class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">/tokens</code>
                  </div>
                  <div class="p-4">
                    <p class="text-sm mb-3" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      Retrieve all design tokens
                    </p>
                    <div class="bg-slate-950 rounded p-4 overflow-x-auto">
                      <pre class="text-xs text-gray-300"><code>{
  "tokens": [
    {
      "name": "color.primary",
      "value": "#4f46e5",
      "type": "color",
      "category": "colors"
    }
  ]
}</code></pre>
                    </div>
                  </div>
                </div>

                <!-- Get Component -->
                <div class="border rounded-lg overflow-hidden" :class="isDarkMode ? 'border-gray-700 bg-slate-800' : 'border-gray-200 bg-gray-50'">
                  <div class="flex items-center gap-3 p-4 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                    <span class="px-3 py-1 rounded text-sm font-medium bg-green-500 text-white">GET</span>
                    <code class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">/components/:id</code>
                  </div>
                  <div class="p-4">
                    <p class="text-sm mb-3" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      Get component details and code
                    </p>
                    <div class="bg-slate-950 rounded p-4 overflow-x-auto">
                      <pre class="text-xs text-gray-300"><code>{
  "id": "button",
  "name": "Button",
  "description": "Primary action component",
  "props": [...],
  "code": {
    "vue": "...",
    "react": "..."
  }
}</code></pre>
                    </div>
                  </div>
                </div>

                <!-- Get Token by Category -->
                <div class="border rounded-lg overflow-hidden" :class="isDarkMode ? 'border-gray-700 bg-slate-800' : 'border-gray-200 bg-gray-50'">
                  <div class="flex items-center gap-3 p-4 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                    <span class="px-3 py-1 rounded text-sm font-medium bg-green-500 text-white">GET</span>
                    <code class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">/tokens?category=colors</code>
                  </div>
                  <div class="p-4">
                    <p class="text-sm mb-3" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      Filter tokens by category
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- GraphQL API -->
            <div class="mb-8">
              <h3 class="text-xl font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                GraphQL API
              </h3>
              <div class="border rounded-lg overflow-hidden" :class="isDarkMode ? 'border-gray-700 bg-slate-800' : 'border-gray-200 bg-gray-50'">
                <div class="flex items-center gap-3 p-4 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                  <span class="px-3 py-1 rounded text-sm font-medium bg-purple-500 text-white">POST</span>
                  <code class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">/graphql</code>
                </div>
                <div class="p-4">
                  <p class="text-sm mb-3" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    Query design tokens and components
                  </p>
                  <div class="bg-slate-950 rounded p-4 overflow-x-auto">
                    <pre class="text-xs text-gray-300"><code>query {
  tokens(category: "colors") {
    name
    value
    type
  }
  component(id: "button") {
    name
    props
    code {
      vue
      react
    }
  }
}</code></pre>
                  </div>
                </div>
              </div>
            </div>

            <!-- Authentication -->
            <div class="mb-8">
              <h3 class="text-xl font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Authentication
              </h3>
              <div class="border rounded-lg overflow-hidden" :class="isDarkMode ? 'border-gray-700 bg-slate-800' : 'border-gray-200 bg-gray-50'">
                <div class="p-4">
                  <p class="text-sm mb-3" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    Include your API key in the Authorization header:
                  </p>
                  <div class="bg-slate-950 rounded p-4 overflow-x-auto">
                    <pre class="text-xs text-gray-300"><code>Authorization: Bearer YOUR_API_KEY</code></pre>
                  </div>
                </div>
              </div>
            </div>

            <!-- SDKs -->
            <div>
              <h3 class="text-xl font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                SDKs & Libraries
              </h3>
              <div class="grid md:grid-cols-2 gap-4">
                <div class="border rounded-lg p-4" :class="isDarkMode ? 'border-gray-700 bg-slate-800' : 'border-gray-200 bg-gray-50'">
                  <h4 class="font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">JavaScript</h4>
                  <code class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">npm install @designsystem/api</code>
                </div>
                <div class="border rounded-lg p-4" :class="isDarkMode ? 'border-gray-700 bg-slate-800' : 'border-gray-200 bg-gray-50'">
                  <h4 class="font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Python</h4>
                  <code class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">pip install designsystem-api</code>
                </div>
                <div class="border rounded-lg p-4" :class="isDarkMode ? 'border-gray-700 bg-slate-800' : 'border-gray-200 bg-gray-50'">
                  <h4 class="font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">CLI Tool</h4>
                  <code class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">npm install -g @designsystem/cli</code>
                </div>
                <div class="border rounded-lg p-4" :class="isDarkMode ? 'border-gray-700 bg-slate-800' : 'border-gray-200 bg-gray-50'">
                  <h4 class="font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Webhooks</h4>
                  <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    Subscribe to design system updates
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Code Examples -->
        <div class="max-w-7xl mx-auto mb-8">
          <div 
            class="rounded-lg shadow-sm border"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <div class="p-6 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
              <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Code Examples
              </h3>
            </div>
            <div class="p-6">
              <div class="space-y-6">
                <!-- JavaScript Example -->
                <div>
                  <h4 class="text-sm font-semibold mb-3" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    JavaScript / Node.js
                  </h4>
                  <div class="bg-slate-950 rounded p-4 overflow-x-auto">
                    <pre class="text-xs text-gray-300"><code>import { DesignSystemAPI } from '@designsystem/api';

const api = new DesignSystemAPI({
  apiKey: 'YOUR_API_KEY'
});

// Get all tokens
const tokens = await api.tokens.getAll();

// Get tokens by category
const colors = await api.tokens.getByCategory('colors');

// Get component
const button = await api.components.get('button');</code></pre>
                  </div>
                </div>

                <!-- Python Example -->
                <div>
                  <h4 class="text-sm font-semibold mb-3" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Python
                  </h4>
                  <div class="bg-slate-950 rounded p-4 overflow-x-auto">
                    <pre class="text-xs text-gray-300"><code>from designsystem import API

api = API(api_key='YOUR_API_KEY')

# Get all tokens
tokens = api.tokens.get_all()

# Get tokens by category
colors = api.tokens.get_by_category('colors')

# Get component
button = api.components.get('button')</code></pre>
                  </div>
                </div>

                <!-- cURL Example -->
                <div>
                  <h4 class="text-sm font-semibold mb-3" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    cURL
                  </h4>
                  <div class="bg-slate-950 rounded p-4 overflow-x-auto">
                    <pre class="text-xs text-gray-300"><code>curl -X GET \
  https://api.designsystem.com/v1/tokens \
  -H "Authorization: Bearer YOUR_API_KEY"</code></pre>
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
import { ref, onMounted, onBeforeUnmount } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);

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

