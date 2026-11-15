<template>
  <div class="md-viewer">
    <div class="md-main">
      <!-- VitePress iframe for VitePress pages -->
      <div v-if="isVitePressPage" class="relative w-full h-full">
        <UiSpinner v-if="loading" class="md-overlay" label="Loading page…" />
        <iframe
          v-show="!loading && !error"
          :src="vitePressUrl"
          class="w-full h-full border-0"
          title="Documentation page"
          @load="handleIframeLoad"
          @error="handleIframeError"
        ></iframe>
        <div v-if="error" class="md-overlay">
          <UiCallout tone="danger" title="This page didn't load">{{ error }}. Is the docs server running (<code>npm run docs:dev</code>)?</UiCallout>
        </div>
      </div>

      <!-- Markdown content for regular markdown files -->
      <div v-else ref="scrollRef" class="md-scroll">
        <div class="md-page">
          <UiSpinner v-if="loading" label="Loading content…" />
          <UiCallout v-else-if="error" tone="danger" title="This page didn't load">{{ error }}</UiCallout>
          <template v-else>
            <PageHero v-if="hero" size="tool" :title="hero.title" :lead="hero.description" :spot="hero.spot" class="md-hero" />
            <div ref="markdownContentRef" class="md-prose markdown-content" v-html="renderedMarkdown"></div>

            <footer class="md-footer">
              <UiLink :href="editPageUrl" external>Edit this page</UiLink>
              <span v-if="lastUpdated">Last updated {{ lastUpdated }}</span>
            </footer>
          </template>
        </div>
      </div>
    </div>

    <!-- Table of contents -->
    <aside v-if="!isVitePressPage && toc.length > 0 && !loading && !error" class="md-toc" aria-labelledby="md-toc-title">
      <h2 id="md-toc-title" class="md-toc-title">On this page</h2>
      <nav aria-labelledby="md-toc-title">
        <a
          v-for="item in toc"
          :key="item.id"
          :href="`#${item.id}`"
          class="md-toc-link"
          :class="[`md-toc-level-${Math.min(item.level, 3)}`, { 'md-toc-on': activeHeading === item.id }]"
          :aria-current="activeHeading === item.id ? 'location' : undefined"
          @click.prevent="scrollToHeading(item.id)"
        >
          {{ item.text }}
        </a>
      </nav>
    </aside>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { marked } from 'marked';
import { PageHero, UiCallout, UiLink, UiSpinner } from './ui';

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
const scrollRef = ref(null);

// Whichever element actually scrolls the article: its own box when the page gives
// it a fixed height, otherwise an ancestor such as the app's main column
const scroller = () => {
  for (let el = scrollRef.value; el; el = el.parentElement) {
    if (/(auto|scroll)/.test(getComputedStyle(el).overflowY) && el.scrollHeight > el.clientHeight) return el;
  }
  return document.scrollingElement;
};
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
    spot: 'foundations/colors'
  },
  '/typography': {
    title: 'Typography',
    description: 'Typography establishes visual hierarchy and ensures readability across all interfaces. Our type system includes font families, sizes, weights, and line heights.',
    spot: 'foundations/typography'
  },
  '/spacing': {
    title: 'Spacing',
    description: 'Consistent spacing creates rhythm and improves visual hierarchy. Our spacing system uses a consistent scale to maintain harmony across all components.',
    spot: 'foundations/spacing'
  },
  '/shadows': {
    title: 'Shadows',
    description: 'Shadows add depth and elevation to our interface, helping users understand the hierarchy and relationships between elements.',
    spot: 'foundations/shadows'
  },
  '/accessibility': {
    title: 'Accessibility',
    description: 'Guidelines and best practices for creating accessible, inclusive experiences that work for everyone. Ensure your designs meet WCAG standards and provide equal access to all users.',
    spot: 'foundations/accessibility'
  },
  '/tui-guidance': {
    title: 'Terminal UI (TUI) Guidance',
    description: 'Design standards for Terminal User Interfaces (TUIs) across command-line and console-based applications. Ensure consistency, accessibility, and scriptability in all terminal interfaces.',
    spot: 'foundations/tui-guidance'
  },
  '/data-viz/types-of-dashboards': {
    title: 'Types of Dashboards',
    description: 'Learn about different dashboard types and their characteristics. Understand the distinction between curated dashboards and data collection dashboards, and discover when to use each type.',
    spot: 'foundations/dashboard-types'
  },
  '/data-viz/dashboard-design': {
    title: 'Dashboard Design',
    description: 'Design dashboards around the decisions people need to make: choose the right dashboard type, prioritize what matters, and keep data easy to scan.',
    spot: 'foundations/dashboard-types',
  },
  '/data-viz/dashboard-patterns': {
    title: 'Dashboard Patterns',
    description: 'Explore comprehensive design patterns for dashboards including data information, visual representations, layout strategies, interactions, and color schemes. Learn how to effectively organize and present data.',
    spot: 'foundations/dashboard-patterns'
  }
};

const isFoundationPage = computed(() => {
  return foundationHeroCards.hasOwnProperty(props.docPath);
});

const hero = computed(() => (isFoundationPage.value ? foundationHeroCards[props.docPath] : null));

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
    '/data-viz/types-of-dashboards', '/data-viz/dashboard-patterns', '/data-viz/dashboard-design',
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
    '/data-viz/dashboard-design': '/docs/data-viz/dashboard-design.md',
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
  
  // /tools/references/xyz -> /docs/tools/references/xyz.md
  if (docPath.startsWith('/tools/references/')) {
    return `/docs/tools/references${docPath.replace('/tools/references', '')}.md`;
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
  
  // Handle guideline pages that don't have /guidelines/ prefix
  // These are pages like /color-contrast, /iconography, etc. that should map to /docs/guidelines/
  // Check if it's not a known foundation path, AI path, pattern path, etc.
  if (!docPath.startsWith('/ai/') && 
      !docPath.startsWith('/patterns/') && 
      !docPath.startsWith('/tools/') && 
      !docPath.startsWith('/data-viz/') && 
      !docPath.startsWith('/hcd/') &&
      !docPath.startsWith('/guidelines/') &&
      docPath !== '/colors' &&
      docPath !== '/typography' &&
      docPath !== '/spacing' &&
      docPath !== '/shadows' &&
      docPath !== '/accessibility' &&
      docPath !== '/ai' &&
      docPath !== '/patterns' &&
      docPath !== '/') {
    // This is likely a guideline page, map to /docs/guidelines/
    return `/docs/guidelines${docPath}.md`;
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
      // Check if we got HTML instead of markdown (likely a 404 page)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        throw new Error(`Markdown file not found at ${filePath}. The file may need to be copied to the public directory.`);
      }
      throw new Error(`Failed to load: ${response.statusText} (${response.status})`);
    }
    
    const content = await response.text();
    
    // Check if we got HTML instead of markdown (likely a 404 or error page)
    if (content.trim().startsWith('<!DOCTYPE') || content.trim().startsWith('<html') || content.trim().startsWith('<meta')) {
      throw new Error(`Markdown file not found at ${filePath}. Received HTML instead. The file may need to be copied to the public directory.`);
    }
    
    markdownContent.value = content;
    
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
  const container = scrollRef.value && scroller();
  if (element && container) {
    const viewTop = container === document.scrollingElement ? 0 : container.getBoundingClientRect().top;
    const top = element.getBoundingClientRect().top - viewTop + container.scrollTop - 24;
    container.scrollTo({ top, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });

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
  
  if (!scrollRef.value) return;
  const line = Math.max(scroller().getBoundingClientRect().top, 0) + 120; // a heading counts once it passes this line

  for (let i = headings.length - 1; i >= 0; i--) {
    const heading = headings[i];
    if (heading.element.getBoundingClientRect().top <= line) {
      activeHeading.value = heading.id;
      break;
    }
  }
};

let scrollSpyCleanup = null;

// Highlight the section being read as the article scrolls; replaces any earlier listener
const setupScrollSpy = () => {
  scrollSpyCleanup?.();
  if (!scrollRef.value) return null;
  const handleScroll = () => updateActiveHeading();
  // Scroll events don't bubble, but a capturing listener hears whichever ancestor scrolls
  document.addEventListener('scroll', handleScroll, { passive: true, capture: true });
  scrollSpyCleanup = () => document.removeEventListener('scroll', handleScroll, { capture: true });
  return scrollSpyCleanup;
};

onMounted(() => {
  loadMarkdown();
  
  // Setup scroll spy after content loads
  nextTick(setupScrollSpy);
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
  if (scrollSpyCleanup) {
    scrollSpyCleanup();
  }
});
</script>

<style scoped>
.md-viewer {
  @apply flex h-full bg-surface text-ink;
}
.md-main {
  @apply flex-1 min-w-0 h-full overflow-hidden;
}
.md-scroll {
  @apply h-full overflow-y-auto;
}
.md-page {
  @apply max-w-4xl mx-auto px-6 md:px-10 pt-8 pb-16;
}
.md-overlay {
  @apply absolute inset-0 z-10 flex items-center justify-center p-6 bg-surface;
}
.md-hero {
  @apply mb-10;
}
.md-footer {
  @apply mt-16 pt-6 border-t border-line flex flex-wrap items-center justify-between gap-4 text-sm text-ink-secondary;
}

/* Table of contents */
.md-toc {
  @apply hidden xl:block sticky top-0 self-start w-64 shrink-0 max-h-screen overflow-y-auto border-l border-line bg-surface px-5 py-8;
}
.md-toc-title {
  @apply mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-ink-muted;
}
.md-toc-link {
  @apply block rounded-control px-2 py-1 text-sm leading-snug text-ink-secondary transition-colors hover:bg-surface-sunken hover:text-ink;
  @apply focus-visible:outline focus-visible:outline-2 outline-focus;
}
.md-toc-level-1 {
  @apply font-semibold text-ink;
}
.md-toc-level-2 {
  @apply pl-4;
}
.md-toc-level-3 {
  @apply pl-6 text-xs;
}
.md-toc-on {
  @apply bg-accent-subtle text-accent-text;
}

/* Markdown content */
.md-prose {
  @apply text-base leading-relaxed text-ink-secondary;
}
.md-prose :deep(h1) {
  @apply mt-0 mb-6 text-3xl md:text-4xl font-semibold tracking-tight leading-tight text-ink-strong;
}
.md-prose :deep(h2) {
  @apply mt-14 mb-4 pt-8 border-t border-line text-2xl font-semibold tracking-tight text-ink-strong scroll-mt-6;
}
.md-prose :deep(h3) {
  @apply mt-10 mb-3 text-lg font-semibold text-ink-strong scroll-mt-6;
}
.md-prose :deep(h4) {
  @apply mt-8 mb-2 text-base font-semibold text-ink-strong scroll-mt-6;
}
.md-prose :deep(p) {
  @apply my-4;
}
.md-prose :deep(ul),
.md-prose :deep(ol) {
  @apply my-4 pl-6 space-y-1.5;
}
.md-prose :deep(ul) {
  @apply list-disc;
}
.md-prose :deep(ol) {
  @apply list-decimal;
}
.md-prose :deep(li::marker) {
  @apply text-ink-muted;
}
.md-prose :deep(a) {
  @apply font-medium text-accent-text underline underline-offset-4 decoration-accent-border hover:decoration-current;
}
.md-prose :deep(strong) {
  @apply font-semibold text-ink;
}
.md-prose :deep(code) {
  @apply rounded-control bg-surface-sunken px-1.5 py-0.5 font-mono text-sm text-ink;
}
.md-prose :deep(pre) {
  @apply my-6 overflow-x-auto rounded-card border border-line bg-surface-sunken p-5 text-sm leading-relaxed;
}
.md-prose :deep(pre code) {
  @apply bg-transparent p-0 text-ink;
}
.md-prose :deep(blockquote) {
  @apply my-6 border-l-4 border-accent bg-accent-subtle rounded-control px-5 py-3 text-ink;
}
.md-prose :deep(blockquote p) {
  @apply my-1;
}
.md-prose :deep(hr) {
  @apply my-10 border-line;
}
.md-prose :deep(table) {
  @apply my-6 w-full border-collapse text-sm;
}
.md-prose :deep(thead th) {
  @apply border-b border-line px-3 py-2 text-left font-semibold text-ink;
}
.md-prose :deep(tbody td) {
  @apply border-b border-line-faint px-3 py-2 align-top;
}
.md-prose :deep(img) {
  @apply block max-w-full h-auto;
}

/* SVGs embedded from markdown keep their own size and gradients */
.md-prose :deep(svg) {
  @apply block w-full h-full overflow-visible;
}
.md-prose :deep(svg defs) {
  @apply absolute w-0 h-0 overflow-hidden;
}
</style>
