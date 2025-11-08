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
        <div v-html="renderedMarkdown" class="prose prose-slate dark:prose-invert max-w-none markdown-content"></div>
        
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
      class="toc-sidebar w-64 flex-shrink-0 border-l border-gray-200 dark:border-gray-700 p-6 h-full overflow-y-auto"
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

// Foundation page hero card data
const foundationHeroCards = {
  '/colors': {
    title: 'Colors',
    description: 'Our color system is built on a foundation of semantic colors and a comprehensive palette that supports both light and dark modes.',
    svg: `<svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="colorsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <!-- Color swatches -->
      <circle cx="60" cy="60" r="25" fill="url(#colorsGradient)" opacity="0.8"/>
      <circle cx="140" cy="60" r="25" fill="#10b981" opacity="0.8"/>
      <circle cx="60" cy="140" r="25" fill="#f59e0b" opacity="0.8"/>
      <circle cx="140" cy="140" r="25" fill="#ef4444" opacity="0.8"/>
      <!-- Central palette icon -->
      <rect x="85" y="85" width="30" height="30" rx="4" fill="url(#colorsGradient)" opacity="0.6"/>
    </svg>`
  },
  '/typography': {
    title: 'Typography',
    description: 'Typography establishes visual hierarchy and ensures readability across all interfaces. Our type system includes font families, sizes, weights, and line heights.',
    svg: `<svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="typographyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <!-- Typography lines -->
      <line x1="40" y1="60" x2="160" y2="60" stroke="url(#typographyGradient)" stroke-width="4" opacity="0.8"/>
      <line x1="40" y1="90" x2="160" y2="90" stroke="url(#typographyGradient)" stroke-width="3" opacity="0.7"/>
      <line x1="40" y1="120" x2="160" y2="120" stroke="url(#typographyGradient)" stroke-width="2" opacity="0.6"/>
      <line x1="40" y1="150" x2="160" y2="150" stroke="url(#typographyGradient)" stroke-width="2" opacity="0.5"/>
      <!-- Letter "A" representation -->
      <path d="M 100 50 L 70 150 L 85 150 L 95 120 L 105 120 L 115 150 L 130 150 L 100 50 Z" fill="url(#typographyGradient)" opacity="0.3"/>
    </svg>`
  },
  '/spacing': {
    title: 'Spacing',
    description: 'Consistent spacing creates rhythm and improves visual hierarchy. Our spacing system uses a consistent scale to maintain harmony across all components.',
    svg: `<svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="spacingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <!-- Spacing blocks -->
      <rect x="50" y="50" width="20" height="20" fill="url(#spacingGradient)" opacity="0.8"/>
      <rect x="90" y="50" width="20" height="20" fill="url(#spacingGradient)" opacity="0.8"/>
      <rect x="130" y="50" width="20" height="20" fill="url(#spacingGradient)" opacity="0.8"/>
      <rect x="50" y="90" width="20" height="20" fill="url(#spacingGradient)" opacity="0.8"/>
      <rect x="130" y="90" width="20" height="20" fill="url(#spacingGradient)" opacity="0.8"/>
      <rect x="50" y="130" width="20" height="20" fill="url(#spacingGradient)" opacity="0.8"/>
      <rect x="90" y="130" width="20" height="20" fill="url(#spacingGradient)" opacity="0.8"/>
      <rect x="130" y="130" width="20" height="20" fill="url(#spacingGradient)" opacity="0.8"/>
    </svg>`
  },
  '/shadows': {
    title: 'Shadows',
    description: 'Shadows add depth and elevation to our interface, helping users understand the hierarchy and relationships between elements.',
    svg: `<svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="shadowsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
        </linearGradient>
        <filter id="shadowFilter">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
          <feOffset dx="2" dy="2" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <!-- Layered cards with shadows -->
      <rect x="50" y="50" width="100" height="100" rx="8" fill="url(#shadowsGradient)" opacity="0.9" filter="url(#shadowFilter)"/>
      <rect x="60" y="60" width="100" height="100" rx="8" fill="url(#shadowsGradient)" opacity="0.7" filter="url(#shadowFilter)"/>
      <rect x="70" y="70" width="100" height="100" rx="8" fill="url(#shadowsGradient)" opacity="0.5" filter="url(#shadowFilter)"/>
    </svg>`
  }
};

const isFoundationPage = computed(() => {
  return foundationHeroCards.hasOwnProperty(props.docPath);
});

const getHeroCardHTML = () => {
  if (!isFoundationPage.value) return '';
  const hero = foundationHeroCards[props.docPath];
  // Make gradient IDs unique by adding the doc path
  const uniqueId = props.docPath.replace(/\//g, '-').replace(/^-/, '');
  let svgWithUniqueIds = hero.svg;
  
  // Replace gradient IDs
  svgWithUniqueIds = svgWithUniqueIds.replace(/id="([^"]+Gradient)"/g, `id="$1-${uniqueId}"`);
  // Replace filter IDs
  svgWithUniqueIds = svgWithUniqueIds.replace(/id="([^"]+Filter)"/g, `id="$1-${uniqueId}"`);
  // Replace URL references to gradients
  svgWithUniqueIds = svgWithUniqueIds.replace(/url\(#([^)]+Gradient)\)/g, `url(#$1-${uniqueId})`);
  // Replace URL references to filters
  svgWithUniqueIds = svgWithUniqueIds.replace(/url\(#([^)]+Filter)\)/g, `url(#$1-${uniqueId})`);
  
  return `
    <div class="mb-12 -mx-8">
      <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
        <div class="absolute inset-0 opacity-10 texture-pattern"></div>
        <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
          <div class="flex-1">
            <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">${hero.title}</h1>
            <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">${hero.description}</p>
          </div>
          <div class="hidden md:block flex-shrink-0">
            <div class="w-64 h-64 relative">${svgWithUniqueIds}</div>
          </div>
        </div>
      </div>
    </div>
  `;
};

const renderedMarkdown = computed(() => {
  if (!markdownContent.value) return '';
  headings.length = 0; // Clear previous headings
  const parsedMarkdown = marked.parse(markdownContent.value);
  // Prepend hero card for foundation pages
  if (isFoundationPage.value) {
    return getHeroCardHTML() + parsedMarkdown;
  }
  return parsedMarkdown;
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
  height: 100%;
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

/* Hero card styles within markdown */
.markdown-content :deep(.texture-pattern) {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

/* Ensure hero card h1 doesn't conflict with prose styles */
.markdown-content :deep(.mb-12 h1) {
  margin-top: 0 !important;
  margin-bottom: 0 !important;
}
</style>

