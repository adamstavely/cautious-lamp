<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:bg-slate-900 relative flex">
    <!-- Drawer -->
    <DocumentationDrawer :isOpen="drawerOpen" @close="closeDrawer" @toggle="toggleDrawer" />
    
    <!-- Main Content Area -->
    <div 
      class="flex-1 h-full transition-all duration-300 relative overflow-hidden"
      :style="drawerOpen ? 'margin-left: 256px;' : 'margin-left: 48px;'"
    >
      <!-- Breadcrumbs -->
      <Breadcrumbs />
      
      <div class="h-full overflow-y-auto">
        <div class="p-8">
          <!-- Hero Section -->
          <div class="max-w-7xl mx-auto mb-8">
            <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
              <!-- Background texture/grain effect -->
              <div class="absolute inset-0 opacity-10 texture-pattern"></div>
              
              <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                <div class="flex-1">
                  <div class="flex items-center gap-4 mb-4">
                    <h1 class="text-5xl md:text-6xl font-bold text-white leading-tight">
                      SEO Tagging Generator
                    </h1>
                  </div>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-4">
                    Generate SEO meta tags, Open Graph tags, and structured data for your web pages. Optimize your content for search engines and social media.
                  </p>
                  <div class="flex items-center gap-4 text-sm text-white/70">
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">search</span>
                      SEO Tool
                    </span>
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">update</span>
                      Updated {{ new Date().toLocaleDateString() }}
                    </span>
                  </div>
                </div>
                <div class="hidden md:block flex-shrink-0">
                  <div class="w-64 h-64 relative">
                    <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400">
                      <defs>
                        <linearGradient id="seoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Stylized SEO icon -->
                      <circle cx="100" cy="100" r="60" fill="url(#seoGradient)" opacity="0.2"/>
                      <circle cx="100" cy="100" r="40" fill="url(#seoGradient)" opacity="0.3"/>
                      <path d="M 70 100 L 90 85 L 110 85 L 130 100 L 110 115 L 90 115 Z" fill="url(#seoGradient)" opacity="0.5"/>
                      <circle cx="100" cy="100" r="15" fill="white" opacity="0.6"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Generator Section -->
          <div class="max-w-7xl mx-auto">
            <div class="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 p-8">
              <!-- Input Form -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <!-- Page Title -->
                <div>
                  <label class="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">Page Title</label>
                  <input
                    v-model="formData.title"
                    type="text"
                    placeholder="My Awesome Page"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 text-sm"
                  />
                </div>

                <!-- Description -->
                <div>
                  <label class="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">Description</label>
                  <input
                    v-model="formData.description"
                    type="text"
                    placeholder="A brief description of the page"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 text-sm"
                  />
                </div>

                <!-- URL -->
                <div>
                  <label class="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">URL</label>
                  <input
                    v-model="formData.url"
                    type="url"
                    placeholder="https://example.com/page"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 text-sm"
                  />
                </div>

                <!-- Image URL -->
                <div>
                  <label class="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">Image URL</label>
                  <input
                    v-model="formData.image"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 text-sm"
                  />
                </div>

                <!-- Site Name -->
                <div>
                  <label class="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">Site Name</label>
                  <input
                    v-model="formData.siteName"
                    type="text"
                    placeholder="My Website"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 text-sm"
                  />
                </div>

                <!-- Author -->
                <div>
                  <label class="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">Author</label>
                  <input
                    v-model="formData.author"
                    type="text"
                    placeholder="Author Name"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 text-sm"
                  />
                </div>

                <!-- Keywords -->
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">Keywords (comma-separated)</label>
                  <input
                    v-model="formData.keywords"
                    type="text"
                    placeholder="keyword1, keyword2, keyword3"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 text-sm"
                  />
                </div>
              </div>

              <!-- Tag Type Selection -->
              <div class="mb-8">
                <label class="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-4">Tag Types</label>
                <div class="flex flex-wrap gap-4">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      v-model="tagTypes"
                      type="checkbox"
                      value="meta"
                      class="w-4 h-4 text-indigo-600 dark:text-indigo-400 border-gray-300 dark:border-slate-600 rounded focus:ring-indigo-500 dark:focus:ring-indigo-400"
                    />
                    <span class="text-sm text-gray-900 dark:text-gray-300">Meta Tags</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      v-model="tagTypes"
                      type="checkbox"
                      value="og"
                      class="w-4 h-4 text-indigo-600 dark:text-indigo-400 border-gray-300 dark:border-slate-600 rounded focus:ring-indigo-500 dark:focus:ring-indigo-400"
                    />
                    <span class="text-sm text-gray-900 dark:text-gray-300">Open Graph</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      v-model="tagTypes"
                      type="checkbox"
                      value="twitter"
                      class="w-4 h-4 text-indigo-600 dark:text-indigo-400 border-gray-300 dark:border-slate-600 rounded focus:ring-indigo-500 dark:focus:ring-indigo-400"
                    />
                    <span class="text-sm text-gray-900 dark:text-gray-300">Twitter Cards</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      v-model="tagTypes"
                      type="checkbox"
                      value="jsonld"
                      class="w-4 h-4 text-indigo-600 dark:text-indigo-400 border-gray-300 dark:border-slate-600 rounded focus:ring-indigo-500 dark:focus:ring-indigo-400"
                    />
                    <span class="text-sm text-gray-900 dark:text-gray-300">JSON-LD</span>
                  </label>
                </div>
              </div>

              <!-- Generate Button -->
              <div class="mb-8">
                <button
                  @click="generate"
                  class="px-6 py-2 bg-indigo-600 dark:bg-indigo-500 text-white font-medium rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-400 transition-colors"
                >
                  Generate Tags
                </button>
              </div>

              <!-- Output -->
              <div>
                <div class="flex items-center justify-between mb-4">
                  <label class="block text-sm font-medium text-gray-900 dark:text-gray-300">Generated Tags</label>
                  <button
                    @click="copyToClipboard"
                    class="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors flex items-center gap-2"
                  >
                    <span class="material-symbols-outlined text-lg">content_copy</span>
                    Copy
                  </button>
                </div>
                <textarea
                  v-model="output"
                  readonly
                  rows="20"
                  class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-gray-100 text-sm font-mono resize-none"
                ></textarea>
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
import Breadcrumbs from '../components/Breadcrumbs.vue';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const tagTypes = ref(['meta', 'og', 'twitter', 'jsonld']);
const formData = ref({
  title: '',
  description: '',
  url: '',
  image: '',
  siteName: '',
  author: '',
  keywords: ''
});
const output = ref('');

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

const generateMetaTags = () => {
  const tags = [];
  
  if (formData.value.title) {
    tags.push(`<meta name="title" content="${escapeHtml(formData.value.title)}">`);
    tags.push(`<title>${escapeHtml(formData.value.title)}</title>`);
  }
  
  if (formData.value.description) {
    tags.push(`<meta name="description" content="${escapeHtml(formData.value.description)}">`);
  }
  
  if (formData.value.keywords) {
    tags.push(`<meta name="keywords" content="${escapeHtml(formData.value.keywords)}">`);
  }
  
  if (formData.value.author) {
    tags.push(`<meta name="author" content="${escapeHtml(formData.value.author)}">`);
  }
  
  return tags.join('\n');
};

const generateOpenGraphTags = () => {
  const tags = [];
  
  tags.push('<meta property="og:type" content="website">');
  
  if (formData.value.title) {
    tags.push(`<meta property="og:title" content="${escapeHtml(formData.value.title)}">`);
  }
  
  if (formData.value.description) {
    tags.push(`<meta property="og:description" content="${escapeHtml(formData.value.description)}">`);
  }
  
  if (formData.value.url) {
    tags.push(`<meta property="og:url" content="${escapeHtml(formData.value.url)}">`);
  }
  
  if (formData.value.image) {
    tags.push(`<meta property="og:image" content="${escapeHtml(formData.value.image)}">`);
  }
  
  if (formData.value.siteName) {
    tags.push(`<meta property="og:site_name" content="${escapeHtml(formData.value.siteName)}">`);
  }
  
  return tags.join('\n');
};

const generateTwitterTags = () => {
  const tags = [];
  
  tags.push('<meta name="twitter:card" content="summary_large_image">');
  
  if (formData.value.title) {
    tags.push(`<meta name="twitter:title" content="${escapeHtml(formData.value.title)}">`);
  }
  
  if (formData.value.description) {
    tags.push(`<meta name="twitter:description" content="${escapeHtml(formData.value.description)}">`);
  }
  
  if (formData.value.image) {
    tags.push(`<meta name="twitter:image" content="${escapeHtml(formData.value.image)}">`);
  }
  
  return tags.join('\n');
};

const generateJSONLD = () => {
  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'WebPage'
  };
  
  if (formData.value.title) {
    jsonld.name = formData.value.title;
  }
  
  if (formData.value.description) {
    jsonld.description = formData.value.description;
  }
  
  if (formData.value.url) {
    jsonld.url = formData.value.url;
  }
  
  if (formData.value.author) {
    jsonld.author = {
      '@type': 'Person',
      name: formData.value.author
    };
  }
  
  return `<script type="application/ld+json">\n${JSON.stringify(jsonld, null, 2)}\n<\/script>`;
};

const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

const generate = () => {
  const sections = [];
  
  if (tagTypes.value.includes('meta')) {
    sections.push('<!-- Meta Tags -->');
    sections.push(generateMetaTags());
  }
  
  if (tagTypes.value.includes('og')) {
    if (sections.length > 0) sections.push('');
    sections.push('<!-- Open Graph Tags -->');
    sections.push(generateOpenGraphTags());
  }
  
  if (tagTypes.value.includes('twitter')) {
    if (sections.length > 0) sections.push('');
    sections.push('<!-- Twitter Card Tags -->');
    sections.push(generateTwitterTags());
  }
  
  if (tagTypes.value.includes('jsonld')) {
    if (sections.length > 0) sections.push('');
    sections.push('<!-- JSON-LD Structured Data -->');
    sections.push(generateJSONLD());
  }
  
  output.value = sections.join('\n');
};

const copyToClipboard = async () => {
  if (!output.value) return;
  
  try {
    await navigator.clipboard.writeText(output.value);
    // You could add a toast notification here
  } catch (error) {
    console.error('Failed to copy:', error);
  }
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

