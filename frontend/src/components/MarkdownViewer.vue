<template>
  <div class="markdown-viewer-container h-full flex">
    <!-- Main Content Area -->
    <div class="markdown-viewer flex-1 h-full overflow-y-auto p-8 bg-white dark:bg-slate-900" :class="isDarkMode ? 'dark' : ''">
      <div v-if="loading" class="flex items-center justify-center h-full">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p class="text-gray-500 dark:text-gray-400">Loading content...</p>
        </div>
      </div>
      <div v-else-if="error" class="flex items-center justify-center h-full">
        <div class="text-center">
          <p class="text-red-600 dark:text-red-400 font-semibold mb-2">Error loading content</p>
          <p class="text-gray-500 dark:text-gray-400 text-sm">{{ error }}</p>
        </div>
      </div>
      <div v-else>
        <div v-html="renderedMarkdown" class="prose prose-slate dark:prose-invert max-w-none"></div>
        
        <!-- Edit Page and Last Updated Footer -->
        <div class="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm">
          <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <span class="material-symbols-outlined text-base">edit</span>
            <a 
              :href="editPageUrl" 
              target="_blank" 
              rel="noopener noreferrer"
              class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Edit this page
            </a>
          </div>
          <div v-if="lastUpdated" class="text-gray-500 dark:text-gray-400">
            Last updated: {{ lastUpdated }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- Right Sidebar - Table of Contents -->
    <aside 
      v-if="toc.length > 0 && !loading && !error"
      class="toc-sidebar w-64 flex-shrink-0 border-l border-gray-200 dark:border-gray-700 p-6 overflow-y-auto"
      :class="isDarkMode ? 'bg-slate-900' : 'bg-white'"
    >
      <div class="sticky top-6">
        <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 uppercase tracking-wider">
          On this page
        </h3>
        <nav class="space-y-1">
          <a
            v-for="item in toc"
            :key="item.id"
            :href="`#${item.id}`"
            @click.prevent="scrollToHeading(item.id)"
            class="block py-1 px-2 rounded text-sm transition-colors"
            :class="[
              item.level === 1 ? 'font-semibold' : item.level === 2 ? 'font-medium pl-4' : 'pl-6 text-xs',
              activeHeading === item.id
                ? (isDarkMode 
                  ? 'text-indigo-400 bg-indigo-900/20' 
                  : 'text-indigo-600 bg-indigo-50')
                : (isDarkMode
                  ? 'text-gray-400 hover:text-gray-300 hover:bg-slate-800'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50')
            ]"
          >
            {{ item.text }}
          </a>
        </nav>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { marked } from 'marked';

const props = defineProps({
  docPath: {
    type: String,
    required: true
  }
});

const loading = ref(true);
const error = ref(null);
const markdownContent = ref('');
const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const toc = ref([]);
const activeHeading = ref('');
const lastUpdated = ref(null);
const editPageUrl = ref('');

// Custom renderer to extract headings for TOC
const renderer = new marked.Renderer();
const headings = [];

renderer.heading = function(token) {
  // marked v16+ uses token objects with tokens array
  let text = '';
  let level = token.depth || 1;
  
  // Extract text from token tokens array
  if (token.tokens && Array.isArray(token.tokens)) {
    text = token.tokens
      .map(t => t.text || t.raw || '')
      .join('');
  } else if (token.text) {
    text = token.text;
  } else if (token.raw) {
    text = token.raw;
  } else {
    text = String(token || '');
  }
  
  // Ensure text is a string
  if (typeof text !== 'string') {
    text = String(text || '');
  }
  
  const id = text.toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/-+/g, '-')      // Replace multiple hyphens with single
    .trim();
  
  headings.push({ text, level, id });
  
  return `<h${level} id="${id}">${text}</h${level}>`;
};

// Configure marked options with custom renderer
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: true,
  mangle: false,
  renderer: renderer
});

const renderedMarkdown = computed(() => {
  if (!markdownContent.value) return '';
  headings.length = 0; // Clear previous headings
  return marked.parse(markdownContent.value);
});

// Watch for rendered markdown to update TOC
watch(renderedMarkdown, async () => {
  await nextTick();
  toc.value = [...headings];
  updateActiveHeading();
  setupScrollSpy();
});

const getFilePath = (docPath) => {
  const pathMap = {
    '/colors': '/docs/colors.md',
    '/typography': '/docs/typography.md',
    '/spacing': '/docs/spacing.md',
    '/shadows': '/docs/shadows.md',
    '/ai/overview': '/docs/ai/overview.md',
    '/ai/patterns': '/docs/ai/patterns.md',
    '/ai/components': '/docs/ai/components.md',
    '/hcd/principles': '/docs/hcd/principles.md',
    '/hcd/research': '/docs/hcd/research.md',
    '/hcd/accessibility': '/docs/hcd/accessibility.md',
    '/patterns': '/docs/patterns.md',
    '/patterns/navigation': '/docs/patterns/navigation.md',
    '/patterns/data-display': '/docs/patterns/data-display.md',
    '/patterns/layout': '/docs/patterns/layout.md',
    '/patterns/forms': '/docs/patterns/forms.md',
    '/patterns/feedback': '/docs/patterns/feedback.md',
    '/': '/docs/index.md'
  };
  
  // If path is in the map, use it
  if (pathMap[docPath]) {
    return pathMap[docPath];
  }
  
  // Otherwise, try to construct the path dynamically
  // Handle pattern paths: /patterns/xyz -> /docs/patterns/xyz.md
  if (docPath.startsWith('/patterns/')) {
    return `/docs${docPath}.md`;
  }
  
  // Default fallback
  return `/docs${docPath}.md`;
};

const getGitHubEditUrl = (docPath) => {
  const filePath = getFilePath(docPath).replace('/docs/', 'docs/');
  // Update this with your actual GitHub repository URL
  return `https://github.com/adamstavely/cautious-lamp/edit/main/frontend/${filePath}`;
};

const loadMarkdown = async () => {
  loading.value = true;
  error.value = null;
  toc.value = [];
  
  try {
    const filePath = getFilePath(props.docPath);
    
    // Set edit URL
    editPageUrl.value = getGitHubEditUrl(props.docPath);
    
    // Fetch the markdown file from public directory
    const response = await fetch(filePath);
    
    if (!response.ok) {
      throw new Error(`Failed to load: ${response.statusText}`);
    }
    
    markdownContent.value = await response.text();
    
    // Try to get last modified date from response headers
    const lastModified = response.headers.get('last-modified');
    if (lastModified) {
      const date = new Date(lastModified);
      lastUpdated.value = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } else {
      // Fallback to current date
      lastUpdated.value = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  } catch (err) {
    console.error('Error loading markdown:', err);
    error.value = err.message;
    // Fallback content
    markdownContent.value = `# Content Not Found\n\nThe requested documentation page could not be loaded.\n\n**Path:** ${props.docPath}\n\nPlease ensure the markdown file exists at the expected location.`;
  } finally {
    loading.value = false;
  }
};

const scrollToHeading = (id) => {
  const element = document.getElementById(id);
  if (element) {
    const offset = 100; // Account for fixed header
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
    
    // Update URL hash without scrolling again
    history.pushState(null, null, `#${id}`);
    activeHeading.value = id;
  }
};

const updateActiveHeading = () => {
  const headings = toc.value.map(item => ({
    id: item.id,
    element: document.getElementById(item.id)
  })).filter(item => item.element);
  
  if (headings.length === 0) return;
  
  const scrollPosition = window.pageYOffset + 150; // Offset for header
  
  for (let i = headings.length - 1; i >= 0; i--) {
    const heading = headings[i];
    if (heading.element.offsetTop <= scrollPosition) {
      activeHeading.value = heading.id;
      break;
    }
  }
};

const setupScrollSpy = () => {
  const handleScroll = () => {
    updateActiveHeading();
  };
  
  window.addEventListener('scroll', handleScroll);
  
  // Cleanup on component unmount
  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
};

let scrollSpyCleanup = null;

// Watch for dark mode changes
let darkModeObserver = null;
let darkModeInterval = null;

onMounted(() => {
  loadMarkdown();
  
  // Watch for dark mode changes
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
  
  // Setup scroll spy after content loads
  nextTick(() => {
    if (scrollSpyCleanup) {
      scrollSpyCleanup();
    }
    scrollSpyCleanup = setupScrollSpy();
  });
});

watch(() => props.docPath, () => {
  loadMarkdown();
}, { immediate: false });

// Cleanup
onBeforeUnmount(() => {
  if (darkModeObserver) {
    darkModeObserver.disconnect();
  }
  if (darkModeInterval) {
    clearInterval(darkModeInterval);
  }
  if (scrollSpyCleanup) {
    scrollSpyCleanup();
  }
});
</script>

<style scoped>
.markdown-viewer-container {
  max-width: 100%;
}

.markdown-viewer {
  max-width: 100%;
}

.toc-sidebar {
  max-height: calc(100vh - 4rem);
  position: sticky;
  top: 0;
}

/* Prose styles for markdown content */
.markdown-viewer :deep(.prose) {
  color: #1f2937;
}

.markdown-viewer.dark :deep(.prose) {
  color: #e5e7eb;
}

.markdown-viewer :deep(.prose h1) {
  font-size: 2.25em;
  font-weight: 700;
  margin-top: 0;
  margin-bottom: 0.8888889em;
  line-height: 1.1111111;
  color: #111827;
}

.markdown-viewer.dark :deep(.prose h1) {
  color: #f9fafb;
}

.markdown-viewer :deep(.prose h2) {
  font-size: 1.5em;
  font-weight: 600;
  margin-top: 2em;
  margin-bottom: 1em;
  line-height: 1.3333333;
  color: #111827;
}

.markdown-viewer.dark :deep(.prose h2) {
  color: #f9fafb;
}

.markdown-viewer :deep(.prose h3) {
  font-size: 1.25em;
  font-weight: 600;
  margin-top: 1.6em;
  margin-bottom: 0.6em;
  line-height: 1.6;
  color: #111827;
}

.markdown-viewer.dark :deep(.prose h3) {
  color: #f9fafb;
}

.markdown-viewer :deep(.prose p) {
  margin-top: 1.25em;
  margin-bottom: 1.25em;
  line-height: 1.75;
}

.markdown-viewer :deep(.prose ul),
.markdown-viewer :deep(.prose ol) {
  margin-top: 1.25em;
  margin-bottom: 1.25em;
  padding-left: 1.625em;
}

.markdown-viewer :deep(.prose li) {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}

.markdown-viewer :deep(.prose code) {
  font-size: 0.875em;
  font-weight: 600;
  color: #111827;
  background-color: #f3f4f6;
  padding: 0.125em 0.375em;
  border-radius: 0.25rem;
}

.markdown-viewer.dark :deep(.prose code) {
  color: #f9fafb;
  background-color: #374151;
}

.markdown-viewer :deep(.prose pre) {
  color: #e5e7eb;
  background-color: #1f2937;
  overflow-x: auto;
  font-weight: 400;
  font-size: 0.875em;
  line-height: 1.7142857;
  margin-top: 1.7142857em;
  margin-bottom: 1.7142857em;
  border-radius: 0.375rem;
  padding: 0.8571429em 1.1428571em;
}

.markdown-viewer.dark :deep(.prose pre) {
  background-color: #111827;
}

.markdown-viewer :deep(.prose pre code) {
  background-color: transparent;
  border-width: 0;
  border-radius: 0;
  padding: 0;
  font-weight: inherit;
  color: inherit;
  font-size: inherit;
  font-family: inherit;
  line-height: inherit;
}

.markdown-viewer :deep(.prose a) {
  color: #4f46e5;
  text-decoration: underline;
  font-weight: 500;
}

.markdown-viewer.dark :deep(.prose a) {
  color: #818cf8;
}

.markdown-viewer :deep(.prose a:hover) {
  color: #4338ca;
}

.markdown-viewer.dark :deep(.prose a:hover) {
  color: #a5b4fc;
}

.markdown-viewer :deep(.prose strong) {
  color: #111827;
  font-weight: 600;
}

.markdown-viewer.dark :deep(.prose strong) {
  color: #f9fafb;
}

.markdown-viewer :deep(.prose blockquote) {
  font-weight: 500;
  font-style: italic;
  color: #111827;
  border-left-width: 0.25rem;
  border-left-color: #e5e7eb;
  quotes: "\201C""\201D""\2018""\2019";
  margin-top: 1.6em;
  margin-bottom: 1.6em;
  padding-left: 1em;
}

.markdown-viewer.dark :deep(.prose blockquote) {
  color: #e5e7eb;
  border-left-color: #374151;
}

.markdown-viewer :deep(.prose hr) {
  border-color: #e5e7eb;
  border-top-width: 1px;
  margin-top: 3em;
  margin-bottom: 3em;
}

.markdown-viewer.dark :deep(.prose hr) {
  border-color: #374151;
}

.markdown-viewer :deep(.prose table) {
  width: 100%;
  table-layout: auto;
  text-align: left;
  margin-top: 2em;
  margin-bottom: 2em;
  font-size: 0.875em;
  line-height: 1.7142857;
}

.markdown-viewer :deep(.prose thead) {
  border-bottom-width: 1px;
  border-bottom-color: #e5e7eb;
}

.markdown-viewer.dark :deep(.prose thead) {
  border-bottom-color: #374151;
}

.markdown-viewer :deep(.prose thead th) {
  color: #111827;
  font-weight: 600;
  vertical-align: bottom;
  padding-right: 0.5714286em;
  padding-bottom: 0.5714286em;
  padding-left: 0.5714286em;
}

.markdown-viewer.dark :deep(.prose thead th) {
  color: #f9fafb;
}

.markdown-viewer :deep(.prose tbody tr) {
  border-bottom-width: 1px;
  border-bottom-color: #e5e7eb;
}

.markdown-viewer.dark :deep(.prose tbody tr) {
  border-bottom-color: #374151;
}

.markdown-viewer :deep(.prose tbody td) {
  vertical-align: baseline;
  padding-top: 0.5714286em;
  padding-right: 0.5714286em;
  padding-bottom: 0.5714286em;
  padding-left: 0.5714286em;
}
</style>

