<template>
  <div class="markdown-viewer-container h-full flex">
    <!-- Main Content Area -->
    <div class="markdown-viewer flex-1 h-full overflow-hidden" :class="isDarkMode ? 'bg-slate-900 dark' : 'bg-white'">
      <!-- VitePress iframe for VitePress pages -->
      <div v-if="isVitePressPage" class="h-full w-full relative">
        <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-white dark:bg-slate-900 z-10">
          <div class="text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p class="text-gray-500 dark:text-gray-400">Loading VitePress page...</p>
            <p class="text-xs text-gray-400 mt-2 font-mono">{{ vitePressUrl }}</p>
          </div>
        </div>
        <iframe
          v-show="!loading && !error"
          :src="vitePressUrl"
          class="w-full h-full border-0"
          frameborder="0"
          @load="handleIframeLoad"
          @error="handleIframeError"
        ></iframe>
        <div v-if="error" class="absolute inset-0 flex items-center justify-center bg-white dark:bg-slate-900 z-10">
          <div class="text-center p-4">
            <p class="text-red-600 dark:text-red-400 font-semibold mb-2">Error loading VitePress page</p>
            <p class="text-gray-500 dark:text-gray-400 text-sm mb-2">{{ error }}</p>
            <p class="text-xs text-gray-400 font-mono">{{ vitePressUrl }}</p>
            <p class="text-xs text-gray-400 mt-4">Make sure the VitePress dev server is running: <code class="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">npm run docs:dev</code></p>
          </div>
        </div>
      </div>
      
      <!-- Markdown content for regular markdown files -->
      <div v-else class="h-full overflow-y-auto p-8">
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
          <div ref="markdownContentRef" v-html="renderedMarkdown" class="prose prose-slate dark:prose-invert max-w-none markdown-content"></div>
          
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
    </div>
    
    <!-- Right Sidebar - Table of Contents -->
    <aside 
      v-if="!isVitePressPage && toc.length > 0 && !loading && !error"
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
const markdownContentRef = ref(null);
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
  renderer: renderer,
  // Ensure HTML is not sanitized - marked preserves HTML by default but be explicit
  sanitize: false,
  silent: false
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
  },
  '/accessibility': {
    title: 'Accessibility',
    description: 'Guidelines and best practices for creating accessible, inclusive experiences that work for everyone. Ensure your designs meet WCAG standards and provide equal access to all users.',
    svg: `<svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="accessibilityGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <!-- Accessibility icon - person with arms raised in circle -->
      <circle cx="100" cy="100" r="50" fill="none" stroke="url(#accessibilityGradient)" stroke-width="4" opacity="0.6"/>
      <circle cx="100" cy="80" r="15" fill="url(#accessibilityGradient)" opacity="0.6"/>
      <path d="M 100 95 Q 70 95 70 125 L 70 150 L 130 150 L 130 125 Q 130 95 100 95" fill="url(#accessibilityGradient)" opacity="0.5"/>
      <!-- Arms raised -->
      <line x1="70" y1="110" x2="50" y2="90" stroke="url(#accessibilityGradient)" stroke-width="4" opacity="0.6" stroke-linecap="round"/>
      <line x1="130" y1="110" x2="150" y2="90" stroke="url(#accessibilityGradient)" stroke-width="4" opacity="0.6" stroke-linecap="round"/>
      <!-- Accessibility indicators -->
      <circle cx="50" cy="50" r="8" fill="url(#accessibilityGradient)" opacity="0.4"/>
      <circle cx="150" cy="50" r="8" fill="url(#accessibilityGradient)" opacity="0.4"/>
      <circle cx="50" cy="150" r="8" fill="url(#accessibilityGradient)" opacity="0.4"/>
      <circle cx="150" cy="150" r="8" fill="url(#accessibilityGradient)" opacity="0.4"/>
    </svg>`
  },
  '/tui-guidance': {
    title: 'Terminal UI (TUI) Guidance',
    description: 'Design standards for Terminal User Interfaces (TUIs) across command-line and console-based applications. Ensure consistency, accessibility, and scriptability in all terminal interfaces.',
    svg: `<svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="tuiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <!-- Terminal window frame -->
      <rect x="30" y="40" width="140" height="120" rx="4" fill="url(#tuiGradient)" opacity="0.2" stroke="url(#tuiGradient)" stroke-width="2"/>
      <!-- Terminal header bar -->
      <rect x="30" y="40" width="140" height="20" rx="4" fill="url(#tuiGradient)" opacity="0.4"/>
      <!-- Terminal window dots (close, minimize, maximize) -->
      <circle cx="42" cy="50" r="3" fill="url(#tuiGradient)" opacity="0.6"/>
      <circle cx="52" cy="50" r="3" fill="url(#tuiGradient)" opacity="0.6"/>
      <circle cx="62" cy="50" r="3" fill="url(#tuiGradient)" opacity="0.6"/>
      <!-- Terminal prompt and text lines -->
      <text x="40" y="75" font-family="monospace" font-size="10" fill="url(#tuiGradient)" opacity="0.8">$ tool deploy</text>
      <text x="40" y="95" font-family="monospace" font-size="10" fill="url(#tuiGradient)" opacity="0.6">✓ Deployment complete</text>
      <text x="40" y="115" font-family="monospace" font-size="10" fill="url(#tuiGradient)" opacity="0.6">> service-api [running]</text>
      <!-- Cursor blinking indicator -->
      <rect x="120" y="68" width="8" height="10" fill="url(#tuiGradient)" opacity="0.8">
        <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1s" repeatCount="indefinite"/>
      </rect>
      <!-- Command line prompt symbol -->
      <text x="40" y="135" font-family="monospace" font-size="10" fill="url(#tuiGradient)" opacity="0.7">$</text>
      <!-- Keyboard keys representation -->
      <rect x="50" y="150" width="20" height="12" rx="2" fill="url(#tuiGradient)" opacity="0.3"/>
      <rect x="75" y="150" width="20" height="12" rx="2" fill="url(#tuiGradient)" opacity="0.3"/>
      <rect x="100" y="150" width="20" height="12" rx="2" fill="url(#tuiGradient)" opacity="0.3"/>
      <rect x="125" y="150" width="20" height="12" rx="2" fill="url(#tuiGradient)" opacity="0.3"/>
    </svg>`
  },
  '/data-viz/types-of-dashboards': {
    title: 'Types of Dashboards',
    description: 'Learn about different dashboard types and their characteristics. Understand the distinction between curated dashboards and data collection dashboards, and discover when to use each type.',
    svg: `<svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="dashboardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <!-- Dashboard frame -->
      <rect x="20" y="30" width="160" height="140" rx="4" fill="url(#dashboardGradient)" opacity="0.1" stroke="url(#dashboardGradient)" stroke-width="2"/>
      <!-- Dashboard header -->
      <rect x="20" y="30" width="160" height="25" rx="4" fill="url(#dashboardGradient)" opacity="0.3"/>
      <!-- Dashboard title bar dots -->
      <circle cx="32" cy="42" r="3" fill="url(#dashboardGradient)" opacity="0.5"/>
      <circle cx="42" cy="42" r="3" fill="url(#dashboardGradient)" opacity="0.5"/>
      <circle cx="52" cy="42" r="3" fill="url(#dashboardGradient)" opacity="0.5"/>
      <!-- Chart elements - Bar chart -->
      <rect x="35" y="100" width="15" height="50" rx="2" fill="url(#dashboardGradient)" opacity="0.7"/>
      <rect x="55" y="80" width="15" height="70" rx="2" fill="url(#dashboardGradient)" opacity="0.7"/>
      <rect x="75" y="90" width="15" height="60" rx="2" fill="url(#dashboardGradient)" opacity="0.7"/>
      <rect x="95" y="70" width="15" height="80" rx="2" fill="url(#dashboardGradient)" opacity="0.7"/>
      <!-- Line chart -->
      <path d="M 35 120 Q 55 100, 75 110 T 115 105" stroke="url(#dashboardGradient)" stroke-width="2.5" fill="none" opacity="0.6"/>
      <circle cx="35" cy="120" r="3" fill="url(#dashboardGradient)" opacity="0.7"/>
      <circle cx="75" cy="110" r="3" fill="url(#dashboardGradient)" opacity="0.7"/>
      <circle cx="115" cy="105" r="3" fill="url(#dashboardGradient)" opacity="0.7"/>
      <!-- Pie chart segment -->
      <path d="M 140 100 L 140 100 A 20 20 0 0 1 155 110 Z" fill="url(#dashboardGradient)" opacity="0.5"/>
      <path d="M 140 100 L 155 110 A 20 20 0 0 1 140 120 Z" fill="url(#dashboardGradient)" opacity="0.6"/>
      <path d="M 140 100 L 140 120 A 20 20 0 0 1 125 110 Z" fill="url(#dashboardGradient)" opacity="0.4"/>
      <!-- Grid lines -->
      <line x1="30" y1="75" x2="120" y2="75" stroke="url(#dashboardGradient)" stroke-width="1" opacity="0.2" stroke-dasharray="2,2"/>
      <line x1="30" y1="95" x2="120" y2="95" stroke="url(#dashboardGradient)" stroke-width="1" opacity="0.2" stroke-dasharray="2,2"/>
      <line x1="30" y1="115" x2="120" y2="115" stroke="url(#dashboardGradient)" stroke-width="1" opacity="0.2" stroke-dasharray="2,2"/>
      <!-- Dashboard widgets/sections -->
      <rect x="130" y="70" width="40" height="25" rx="2" fill="url(#dashboardGradient)" opacity="0.2" stroke="url(#dashboardGradient)" stroke-width="1"/>
      <rect x="130" y="100" width="40" height="25" rx="2" fill="url(#dashboardGradient)" opacity="0.2" stroke="url(#dashboardGradient)" stroke-width="1"/>
      <rect x="130" y="130" width="40" height="25" rx="2" fill="url(#dashboardGradient)" opacity="0.2" stroke="url(#dashboardGradient)" stroke-width="1"/>
    </svg>`
  },
  '/data-viz/dashboard-patterns': {
    title: 'Dashboard Patterns',
    description: 'Explore comprehensive design patterns for dashboards including data information, visual representations, layout strategies, interactions, and color schemes. Learn how to effectively organize and present data.',
    svg: `<svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="patternsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <!-- Pattern grid background -->
      <rect x="20" y="20" width="160" height="160" rx="4" fill="url(#patternsGradient)" opacity="0.05" stroke="url(#patternsGradient)" stroke-width="1"/>
      <!-- Grid pattern -->
      <line x1="40" y1="40" x2="40" y2="160" stroke="url(#patternsGradient)" stroke-width="1" opacity="0.2"/>
      <line x1="80" y1="40" x2="80" y2="160" stroke="url(#patternsGradient)" stroke-width="1" opacity="0.2"/>
      <line x1="120" y1="40" x2="120" y2="160" stroke="url(#patternsGradient)" stroke-width="1" opacity="0.2"/>
      <line x1="160" y1="40" x2="160" y2="160" stroke="url(#patternsGradient)" stroke-width="1" opacity="0.2"/>
      <line x1="20" y1="60" x2="180" y2="60" stroke="url(#patternsGradient)" stroke-width="1" opacity="0.2"/>
      <line x1="20" y1="100" x2="180" y2="100" stroke="url(#patternsGradient)" stroke-width="1" opacity="0.2"/>
      <line x1="20" y1="140" x2="180" y2="140" stroke="url(#patternsGradient)" stroke-width="1" opacity="0.2"/>
      <!-- Pattern elements - various visualizations -->
      <!-- Bar chart pattern -->
      <rect x="30" y="110" width="12" height="30" rx="1" fill="url(#patternsGradient)" opacity="0.6"/>
      <rect x="45" y="100" width="12" height="40" rx="1" fill="url(#patternsGradient)" opacity="0.6"/>
      <rect x="60" y="115" width="12" height="25" rx="1" fill="url(#patternsGradient)" opacity="0.6"/>
      <!-- Line chart pattern -->
      <path d="M 90 120 Q 105 100, 120 110 T 150 105" stroke="url(#patternsGradient)" stroke-width="2" fill="none" opacity="0.6"/>
      <circle cx="90" cy="120" r="2.5" fill="url(#patternsGradient)" opacity="0.7"/>
      <circle cx="120" cy="110" r="2.5" fill="url(#patternsGradient)" opacity="0.7"/>
      <circle cx="150" cy="105" r="2.5" fill="url(#patternsGradient)" opacity="0.7"/>
      <!-- Pie chart pattern -->
      <path d="M 100 50 L 100 50 A 18 18 0 0 1 112 58 Z" fill="url(#patternsGradient)" opacity="0.5"/>
      <path d="M 100 50 L 112 58 A 18 18 0 0 1 100 68 Z" fill="url(#patternsGradient)" opacity="0.6"/>
      <path d="M 100 50 L 100 68 A 18 18 0 0 1 88 58 Z" fill="url(#patternsGradient)" opacity="0.4"/>
      <!-- Gauge pattern -->
      <path d="M 50 70 A 15 15 0 0 1 65 70" stroke="url(#patternsGradient)" stroke-width="3" fill="none" opacity="0.6"/>
      <line x1="50" y1="70" x2="57" y2="63" stroke="url(#patternsGradient)" stroke-width="2" opacity="0.6"/>
      <!-- Table/grid pattern -->
      <rect x="30" y="50" width="25" height="15" rx="1" fill="url(#patternsGradient)" opacity="0.2" stroke="url(#patternsGradient)" stroke-width="1"/>
      <rect x="58" y="50" width="25" height="15" rx="1" fill="url(#patternsGradient)" opacity="0.2" stroke="url(#patternsGradient)" stroke-width="1"/>
      <!-- Number/KPI pattern -->
      <text x="90" y="75" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="url(#patternsGradient)" opacity="0.7">42</text>
      <!-- Trend arrow pattern -->
      <path d="M 140 70 L 140 60 L 145 65 L 140 60 L 135 65 Z" fill="url(#patternsGradient)" opacity="0.6"/>
      <!-- Color swatches pattern -->
      <rect x="160" y="50" width="12" height="12" rx="1" fill="#10b981" opacity="0.7"/>
      <rect x="160" y="65" width="12" height="12" rx="1" fill="#f59e0b" opacity="0.7"/>
      <rect x="160" y="80" width="12" height="12" rx="1" fill="#ef4444" opacity="0.7"/>
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
    <div class="mb-12 -mx-4">
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

// Cache for loaded SVG content (synchronous cache for processed SVGs)
// Use a ref with a counter to trigger reactivity when cache updates
const svgContentCache = ref(new Map());
const svgCacheVersion = ref(0);

// Helper function to make all IDs unique (same logic as foundation pages, but more comprehensive)
const makeSvgIdsUnique = (svgContent, uniqueId) => {
  let processedSvg = svgContent;
  
  // Find all IDs in the SVG
  const idMatches = [...svgContent.matchAll(/id="([^"]+)"/g)];
  const idMap = new Map();
  
  for (const match of idMatches) {
    const originalId = match[1];
    // Only make IDs unique if they're not already unique
    if (!originalId.includes(uniqueId)) {
      const newId = `${originalId}-${uniqueId}`;
      idMap.set(originalId, newId);
    }
  }
  
  // Replace all ID definitions
  for (const [originalId, newId] of idMap) {
    const escapedId = originalId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    processedSvg = processedSvg.replace(new RegExp(`id="${escapedId}"`, 'g'), `id="${newId}"`);
  }
  
  // Replace all URL references to IDs (in stroke, fill, and other attributes)
  for (const [originalId, newId] of idMap) {
    const escapedId = originalId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const urlPattern = new RegExp(`url\\(#${escapedId}\\)`, 'g');
    processedSvg = processedSvg.replace(urlPattern, `url(#${newId})`);
  }
  
  return processedSvg;
};

// Process SVG img tags and embed SVG content inline during markdown rendering
const processSvgImages = (htmlContent) => {
  // Find all img tags with SVG sources
  const imgTagRegex = /<img([^>]*)\s+src="(\/svgs\/[^"]+\.svg)"([^>]*)>/gi;
  let processedContent = htmlContent;
  
  // Collect all matches first
  const matches = [];
  let match;
  imgTagRegex.lastIndex = 0;
  while ((match = imgTagRegex.exec(htmlContent)) !== null) {
    matches.push({
      fullMatch: match[0],
      beforeAttrs: match[1] || '',
      src: match[2],
      afterAttrs: match[3] || ''
    });
  }
  
  // Process matches in reverse order to avoid index shifting issues
  for (let i = matches.length - 1; i >= 0; i--) {
    const { fullMatch, beforeAttrs, src, afterAttrs } = matches[i];
    
    // Check cache first - if SVG is cached, embed it directly
    if (svgContentCache.value.has(src)) {
      const cachedSvg = svgContentCache.value.get(src);
      
      // Extract classes from img tag
      const classMatch = (beforeAttrs + ' ' + afterAttrs).match(/class="([^"]+)"/);
      const classes = classMatch ? classMatch[1] : 'w-full h-full';
      
      // Update SVG class if needed - preserve existing class or add new one
      // Also ensure SVG has proper namespace and attributes for rendering
      let svgWithClass = cachedSvg;
      const svgClassMatch = cachedSvg.match(/<svg([^>]*)>/i);
      if (svgClassMatch) {
        let updatedAttrs = svgClassMatch[1].trim();
        
        // Ensure SVG has proper xmlns namespace (required for gradients to work)
        // This is critical for gradient references to resolve correctly when embedded via v-html
        const svgNs = 'http://www.w3.org/2000/svg';
        if (!updatedAttrs.match(/xmlns\s*=/i)) {
          // Add xmlns at the beginning if it doesn't exist
          updatedAttrs = `xmlns="${svgNs}" ${updatedAttrs}`.trim();
        } else if (!updatedAttrs.includes(`xmlns="${svgNs}"`)) {
          // Replace existing xmlns with correct one (case-insensitive)
          updatedAttrs = updatedAttrs.replace(/xmlns\s*=\s*"[^"]*"/i, `xmlns="${svgNs}"`);
        }
        
        // Ensure viewBox is present (required for proper scaling)
        if (!updatedAttrs.match(/viewBox\s*=/i)) {
          // Extract viewBox from original if it exists
          const viewBoxMatch = cachedSvg.match(/viewBox\s*=\s*"([^"]+)"/i);
          if (viewBoxMatch) {
            updatedAttrs += ` viewBox="${viewBoxMatch[1]}"`;
          }
        }
        
        // Update or add class
        if (updatedAttrs.match(/class\s*=/i)) {
          updatedAttrs = updatedAttrs.replace(/class\s*=\s*"[^"]*"/i, `class="${classes}"`);
        } else {
          updatedAttrs += ` class="${classes}"`;
        }
        
        // Ensure there's a space before attributes
        if (updatedAttrs && !updatedAttrs.startsWith(' ')) {
          updatedAttrs = ' ' + updatedAttrs;
        }
        
        svgWithClass = cachedSvg.replace(/<svg[^>]*>/i, `<svg${updatedAttrs}>`);
      }
      
      // Replace this specific occurrence directly
      processedContent = processedContent.replace(fullMatch, svgWithClass);
    }
    // If not cached, keep the img tag - it will be processed async and cached
  }
  
  return processedContent;
};

// Load SVG files and cache them (runs async when markdown changes)
const loadSvgFiles = async () => {
  if (!markdownContent.value) return;
  
  // Find all SVG img tags in the markdown content (after it's parsed to HTML)
  // We need to check the rendered markdown, not the raw markdown
  const renderedHtml = marked.parse(markdownContent.value);
  const imgTagRegex = /<img[^>]*\s+src="(\/svgs\/[^"]+\.svg)"[^>]*>/gi;
  const matches = [...renderedHtml.matchAll(imgTagRegex)];
  
  // Extract unique SVG sources
  const svgSources = [...new Set(matches.map(m => m[1]))];
  
  if (svgSources.length === 0) return;
  
  // Load each SVG that's not already cached
  let hasNewCache = false;
  for (const src of svgSources) {
    if (svgContentCache.value.has(src)) {
      continue; // Already cached
    }
    
    try {
      const response = await fetch(src);
      if (!response.ok) {
        console.warn(`Failed to load SVG: ${src}`, response.status);
        continue;
      }
      
      let svgContent = await response.text();
      
      // Make gradient IDs unique (same logic as foundation pages)
      // Create unique ID from the path
      const uniqueId = src.replace(/\//g, '-').replace(/\.svg$/, '').replace(/^-/, '');
      svgContent = makeSvgIdsUnique(svgContent, uniqueId);
      
      // Cache the processed SVG
      svgContentCache.value.set(src, svgContent);
      hasNewCache = true;
    } catch (error) {
      console.error(`Error loading SVG ${src}:`, error);
    }
  }
  
  // If we cached new SVGs, trigger a re-render by incrementing version
  // This will cause renderedMarkdown computed to re-run
  if (hasNewCache) {
    // Single increment after all SVGs are loaded to trigger reactivity
    svgCacheVersion.value++;
    // Wait for next tick to ensure reactivity is processed
    await nextTick();
  }
};

const renderedMarkdown = computed(() => {
  if (!markdownContent.value) return '';
  headings.length = 0; // Clear previous headings
  
  // Access svgCacheVersion to make this computed reactive to cache changes
  const _ = svgCacheVersion.value;
  
  // Parse markdown - marked should preserve HTML img tags
  let parsedMarkdown = marked.parse(markdownContent.value);
  
  // Process SVG img tags - embed cached SVGs directly, keep img tags for uncached ones
  parsedMarkdown = processSvgImages(parsedMarkdown);
  
  // Prepend hero card for foundation pages
  if (isFoundationPage.value) {
    return getHeroCardHTML() + parsedMarkdown;
  }
  return parsedMarkdown;
});

// Watch for markdown content changes to load SVG files
watch(markdownContent, async () => {
  // Load SVG files asynchronously and cache them
  await loadSvgFiles();
  // Force re-computation of renderedMarkdown after caching
  // The svgCacheVersion change should trigger reactivity, but ensure it does
  await nextTick();
}, { immediate: true });

// Also watch svgCacheVersion to ensure reactivity
watch(svgCacheVersion, () => {
  // This ensures renderedMarkdown computed re-runs when cache updates
  // The computed already accesses svgCacheVersion, but this ensures it's tracked
}, { immediate: false });

// Watch for rendered markdown to update TOC
watch(renderedMarkdown, async () => {
  await nextTick();
  toc.value = [...headings];
  updateActiveHeading();
  setupScrollSpy();
}, { immediate: false });

// Check if a path is a VitePress page (new pages that should be loaded via VitePress)
// Actually, let's just load them as markdown files directly instead of using iframe
const isVitePressPagePath = (docPath) => {
  // Disable iframe approach - load markdown directly instead
  return false;
  
  /* Original VitePress iframe detection - disabled
  // Direct markdown file mappings (not VitePress)
  const directMarkdownPaths = [
    '/colors', '/typography', '/spacing', '/shadows', '/accessibility',
    '/ai', '/ai/patterns', '/ai/components',
    '/hcd/principles', '/hcd/research', '/hcd/accessibility',
    '/patterns', '/patterns/navigation', '/patterns/data-display', '/patterns/layout', '/patterns/forms', '/patterns/feedback',
    '/guidelines/tui-guidance', '/tui-guidance',
    '/data-viz/types-of-dashboards', '/data-viz/dashboard-patterns',
    '/'
  ];
  
  // If it's a direct markdown path, not VitePress
  if (directMarkdownPaths.includes(docPath)) {
    return false;
  }
  
  // Check if it's a new VitePress page path (paths may include /guidelines/ prefix)
  // New AI pages: /guidelines/ai/agent-roles-mental-models or /ai/agent-roles-mental-models
  if ((docPath.startsWith('/guidelines/ai/') || docPath.startsWith('/ai/')) && 
      docPath !== '/ai/patterns' && docPath !== '/ai/components' &&
      docPath !== '/guidelines/ai/patterns' && docPath !== '/guidelines/ai/components') {
    return true;
  }
  
  // New pattern pages: /guidelines/patterns/agent-oriented-onboarding or /patterns/agent-oriented-onboarding
  const existingPatternPaths = ['/patterns', '/patterns/navigation', '/patterns/data-display', '/patterns/layout', '/patterns/forms', '/patterns/feedback'];
  const existingGuidelinesPatternPaths = ['/guidelines/patterns', '/guidelines/patterns/navigation', '/guidelines/patterns/data-display', '/guidelines/patterns/layout', '/guidelines/patterns/forms', '/guidelines/patterns/feedback'];
  if ((docPath.startsWith('/guidelines/patterns/') || docPath.startsWith('/patterns/')) && 
      !existingPatternPaths.includes(docPath) && !existingGuidelinesPatternPaths.includes(docPath)) {
    return true;
  }
  
  // New guideline pages: /guidelines/color-contrast, etc. (but not /guidelines/tui-guidance)
  if (docPath.startsWith('/guidelines/') && docPath !== '/guidelines/tui-guidance' &&
      !docPath.startsWith('/guidelines/ai/') && !docPath.startsWith('/guidelines/patterns/') &&
      !docPath.startsWith('/guidelines/tools/')) {
    return true;
  }
  
  // New tools/references pages: /guidelines/tools/references/... or /tools/references/...
  if (docPath.startsWith('/guidelines/tools/references/') || docPath.startsWith('/tools/references/')) {
    return true;
  }
  
  return false;
  */
};

const isVitePressPage = computed(() => {
  const result = isVitePressPagePath(props.docPath);
  console.log('Checking if VitePress page:', props.docPath, '->', result);
  return result;
});

const vitePressUrl = computed(() => {
  if (!isVitePressPage.value) return '';
  
  // Normalize the path - remove /guidelines prefix if present since VitePress base is /guidelines/
  let normalizedPath = props.docPath;
  if (normalizedPath.startsWith('/guidelines/')) {
    normalizedPath = normalizedPath.replace('/guidelines', '');
  }
  
  if (import.meta.env.DEV) {
    return `http://localhost:5175/guidelines${normalizedPath === '/' ? '' : normalizedPath}`;
  }
  return `/guidelines${normalizedPath === '/' ? '/index.html' : normalizedPath}.html`;
});

const getFilePath = (docPath) => {
  const pathMap = {
    '/colors': '/docs/colors.md',
    '/typography': '/docs/typography.md',
    '/spacing': '/docs/spacing.md',
    '/shadows': '/docs/shadows.md',
    '/accessibility': '/docs/hcd/accessibility.md',
    '/ai': '/docs/ai/overview.md',
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
    '/guidelines/tui-guidance': '/docs/guidelines/tui-guidance.md',
    '/tui-guidance': '/docs/guidelines/tui-guidance.md',
    '/data-viz/types-of-dashboards': '/docs/data-viz/types-of-dashboards.md',
    '/data-viz/dashboard-patterns': '/docs/data-viz/dashboard-patterns.md',
    '/': '/docs/index.md'
  };
  
  // If path is in the map, use it
  if (pathMap[docPath]) {
    return pathMap[docPath];
  }
  
  // Handle new VitePress pages - they're in docs/ directory
  // /guidelines/ai/xyz -> /docs/ai/xyz.md
  if (docPath.startsWith('/guidelines/ai/')) {
    return `/docs/ai${docPath.replace('/guidelines/ai', '')}.md`;
  }
  
  // /guidelines/patterns/xyz -> /docs/patterns/xyz.md
  if (docPath.startsWith('/guidelines/patterns/')) {
    return `/docs/patterns${docPath.replace('/guidelines/patterns', '')}.md`;
  }
  
  // /guidelines/guidelines/xyz -> /docs/guidelines/xyz.md
  if (docPath.startsWith('/guidelines/guidelines/')) {
    return `/docs/guidelines${docPath.replace('/guidelines/guidelines', '')}.md`;
  }
  
  // /guidelines/tools/references/xyz -> /docs/tools/references/xyz.md
  if (docPath.startsWith('/guidelines/tools/references/')) {
    return `/docs/tools/references${docPath.replace('/guidelines/tools/references', '')}.md`;
  }
  
  // Otherwise, try to construct the path dynamically
  // Handle pattern paths: /patterns/xyz -> /docs/patterns/xyz.md
  if (docPath.startsWith('/patterns/')) {
    return `/docs${docPath}.md`;
  }
  
  // Handle guidelines paths: /guidelines/xyz -> /docs/guidelines/xyz.md
  if (docPath.startsWith('/guidelines/')) {
    return `/docs${docPath.replace('/guidelines', '/guidelines')}.md`;
  }
  
  // Handle data-viz paths: /data-viz/xyz -> /docs/data-viz/xyz.md
  if (docPath.startsWith('/data-viz/')) {
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

const handleIframeLoad = () => {
  console.log('VitePress iframe loaded successfully');
  loading.value = false;
  error.value = null;
};

const handleIframeError = () => {
  console.error('VitePress iframe failed to load');
  loading.value = false;
  error.value = 'Failed to load VitePress page. Make sure the VitePress dev server is running on port 5175.';
};

const loadMarkdown = async () => {
  // Skip loading markdown if this is a VitePress page (will use iframe)
  if (isVitePressPage.value) {
    loading.value = true;
    error.value = null;
    return;
  }
  
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
  console.log('MarkdownViewer docPath changed:', props.docPath);
  console.log('Is VitePress page:', isVitePressPage.value);
  console.log('VitePress URL:', vitePressUrl.value);
  
  if (!isVitePressPage.value) {
    loadMarkdown();
  } else {
    loading.value = true;
    error.value = null;
  }
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
  transition: background-color 0.3s ease;
}

.markdown-viewer {
  max-width: 100%;
  transition: background-color 0.3s ease;
}

.markdown-viewer.bg-white {
  background-color: #ffffff !important;
}

.markdown-viewer.bg-slate-900 {
  background-color: #0f172a !important;
}

.toc-sidebar {
  height: 100%;
  transition: background-color 0.3s ease;
}

.toc-sidebar.bg-white {
  background-color: #ffffff !important;
}

.toc-sidebar.bg-slate-900 {
  background-color: #0f172a !important;
}

/* Prose styles for markdown content */
.markdown-viewer :deep(.prose) {
  color: #1f2937;
  transition: color 0.3s ease;
}

.markdown-viewer.dark :deep(.prose),
.markdown-viewer.bg-slate-900 :deep(.prose) {
  color: #e5e7eb;
}

.markdown-viewer :deep(.prose h1) {
  font-size: 2.25em;
  font-weight: 700;
  margin-top: 0;
  margin-bottom: 0.8888889em;
  line-height: 1.1111111;
  color: #111827;
  transition: color 0.3s ease;
}

.markdown-viewer.dark :deep(.prose h1),
.markdown-viewer.bg-slate-900 :deep(.prose h1) {
  color: #f9fafb;
}

.markdown-viewer :deep(.prose h2) {
  font-size: 1.5em;
  font-weight: 600;
  margin-top: 2em;
  margin-bottom: 1em;
  line-height: 1.3333333;
  color: #111827;
  transition: color 0.3s ease;
}

.markdown-viewer.dark :deep(.prose h2),
.markdown-viewer.bg-slate-900 :deep(.prose h2) {
  color: #f9fafb;
}

.markdown-viewer :deep(.prose h3) {
  font-size: 1.25em;
  font-weight: 600;
  margin-top: 1.6em;
  margin-bottom: 0.6em;
  line-height: 1.6;
  color: #111827;
  transition: color 0.3s ease;
}

.markdown-viewer.dark :deep(.prose h3),
.markdown-viewer.bg-slate-900 :deep(.prose h3) {
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
  transition: color 0.3s ease, background-color 0.3s ease;
}

.markdown-viewer.dark :deep(.prose code),
.markdown-viewer.bg-slate-900 :deep(.prose code) {
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

.markdown-viewer.dark :deep(.prose pre),
.markdown-viewer.bg-slate-900 :deep(.prose pre) {
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
  transition: color 0.3s ease;
}

.markdown-viewer.dark :deep(.prose a),
.markdown-viewer.bg-slate-900 :deep(.prose a) {
  color: #818cf8;
}

.markdown-viewer :deep(.prose a:hover) {
  color: #4338ca;
}

.markdown-viewer.dark :deep(.prose a:hover),
.markdown-viewer.bg-slate-900 :deep(.prose a:hover) {
  color: #a5b4fc;
}

.markdown-viewer :deep(.prose strong) {
  color: #111827;
  font-weight: 600;
  transition: color 0.3s ease;
}

.markdown-viewer.dark :deep(.prose strong),
.markdown-viewer.bg-slate-900 :deep(.prose strong) {
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
  transition: color 0.3s ease, border-color 0.3s ease;
}

.markdown-viewer.dark :deep(.prose blockquote),
.markdown-viewer.bg-slate-900 :deep(.prose blockquote) {
  color: #e5e7eb;
  border-left-color: #374151;
}

.markdown-viewer :deep(.prose hr) {
  border-color: #e5e7eb;
  border-top-width: 1px;
  margin-top: 3em;
  margin-bottom: 3em;
  transition: border-color 0.3s ease;
}

.markdown-viewer.dark :deep(.prose hr),
.markdown-viewer.bg-slate-900 :deep(.prose hr) {
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
  transition: border-color 0.3s ease;
}

.markdown-viewer.dark :deep(.prose thead),
.markdown-viewer.bg-slate-900 :deep(.prose thead) {
  border-bottom-color: #374151;
}

.markdown-viewer :deep(.prose thead th) {
  color: #111827;
  font-weight: 600;
  vertical-align: bottom;
  padding-right: 0.5714286em;
  padding-bottom: 0.5714286em;
  padding-left: 0.5714286em;
  transition: color 0.3s ease;
}

.markdown-viewer.dark :deep(.prose thead th),
.markdown-viewer.bg-slate-900 :deep(.prose thead th) {
  color: #f9fafb;
}

.markdown-viewer :deep(.prose tbody tr) {
  border-bottom-width: 1px;
  border-bottom-color: #e5e7eb;
  transition: border-color 0.3s ease;
}

.markdown-viewer.dark :deep(.prose tbody tr),
.markdown-viewer.bg-slate-900 :deep(.prose tbody tr) {
  border-bottom-color: #374151;
}

.markdown-viewer :deep(.prose tbody td) {
  vertical-align: baseline;
  padding-top: 0.5714286em;
  padding-right: 0.5714286em;
  padding-bottom: 0.5714286em;
  padding-left: 0.5714286em;
}

/* Ensure images in markdown are visible */
.markdown-viewer :deep(.prose img),
.markdown-content :deep(img) {
  display: block !important;
  max-width: 100% !important;
  height: auto !important;
}

.markdown-viewer :deep(.prose img[src*="/svgs/"]) {
  width: 100% !important;
  height: 100% !important;
  object-fit: contain !important;
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

/* Ensure SVG elements render correctly */
.markdown-content :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
  position: relative;
}

/* Ensure line elements are visible and render correctly */
.markdown-content :deep(svg line) {
  display: block !important;
  visibility: visible !important;
  opacity: inherit !important;
  stroke-linecap: round;
  stroke-linejoin: round;
  vector-effect: non-scaling-stroke;
  /* Ensure stroke is applied */
  stroke-width: inherit;
  stroke: inherit;
}

/* Ensure defs and gradients are properly rendered */
.markdown-content :deep(svg defs) {
  display: block;
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
}

.markdown-content :deep(svg defs linearGradient),
.markdown-content :deep(svg defs radialGradient) {
  display: block;
}

/* Ensure gradient references resolve correctly */
.markdown-content :deep(svg [fill*="url(#"]),
.markdown-content :deep(svg [stroke*="url(#"]) {
  /* Don't override - let the gradient work */
}
</style>

