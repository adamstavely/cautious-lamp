<template>
  <div v-if="isActive" class="loupe-tool">
    <!-- Visual Breakpoint Ruler -->
    <div v-if="showRuler" class="breakpoint-ruler">
      <div class="ruler-container">
        <div class="ruler-scale">
          <LoupeBox
            v-for="bp in sortedBreakpoints"
            :key="`ruler-${bp.id}`"
            class="ruler-marker"
            :class="`loupe-tone-${getBreakpointTone(bp.id)}`"
            :left="`${((bp.minWidth || 0) / maxBreakpoint) * 100}%`"
            top="0"
            role="button"
            tabindex="0"
            :title="`${bp.label || bp.id}: ${formatBreakpointRange(bp)} - open the page at this width`"
            :aria-label="`Open this page at ${bp.minWidth || 0}px (${bp.label || bp.id})`"
            @click.stop="jumpToBreakpoint(bp)"
            @keydown.enter.prevent.stop="jumpToBreakpoint(bp)"
            @keydown.space.prevent.stop="jumpToBreakpoint(bp)"
          >
            <div class="marker-line-vertical"></div>
            <div class="marker-label">{{ bp.minWidth || 0 }}px</div>
          </LoupeBox>
          <LoupeBox
            v-for="bp in sortedBreakpoints.filter(b => b.maxWidth)"
            :key="`ruler-max-${bp.id}`"
            class="ruler-marker ruler-marker-max"
            :class="`loupe-tone-${getBreakpointTone(bp.id)}`"
            :left="`${(bp.maxWidth / maxBreakpoint) * 100}%`"
            top="0"
            :title="`${bp.label || bp.id} max: ${bp.maxWidth}px`"
          >
            <div class="marker-line-vertical"></div>
          </LoupeBox>
        </div>
        <LoupeBox class="ruler-viewport-indicator" :left="`${Math.min((viewportWidth / maxBreakpoint) * 100, 100)}%`" top="0">
          <div class="viewport-indicator-line"></div>
          <div class="viewport-indicator-label">{{ viewportWidth }}px</div>
        </LoupeBox>
      </div>
    </div>

    <!-- Grid/Layout Overlays -->
    <div v-if="showLayoutInspector" class="layout-overlays">
      <LoupeBox
        v-for="(layout, index) in detectedLayouts"
        :key="getLayoutId(layout, index)"
        class="layout-overlay"
        :class="{ 'layout-highlighted': highlightedLayoutIndex === index }"
        v-bind="getLayoutBox(layout, index)"
        @click.stop="selectLayoutItem(index)"
        @mouseenter="highlightedLayoutIndex = index"
        @mouseleave="highlightedLayoutIndex = null"
      >
        <div class="layout-label" v-if="highlightedLayoutIndex === index">
          {{ layout.type === 'grid' ? 'Grid' : 'Flex' }}
        </div>
      </LoupeBox>
    </div>

    <!-- Overlay for highlighting components (toggleable) -->
    <template v-if="showComponentHighlights">
      <LoupeBox
        v-for="(component, index) in detectedComponents"
        :key="`component-${index}-${component.element.id || component.name}`"
        class="component-highlight"
        v-bind="getHighlightBox(component.element)"
        @mouseenter="showInfo(component, $event)"
        @mouseleave="hideInfo"
        @mousemove="updateInfoPosition(component, $event)"
      />
    </template>

    <!-- Info Panel -->
    <LoupeBox
      v-if="activeComponent"
      class="info-panel"
      :left="infoPosition ? `${infoPosition.x}px` : 'auto'"
      :top="infoPosition ? `${infoPosition.y}px` : 'auto'"
      @mouseleave="hideInfo"
    >
      <div class="info-header">
        <div class="min-w-0 flex-1">
          <h3 class="component-name">
            <AppIcon :name="activeComponent.icon" v-if="activeComponent.icon" class="component-name-icon" />
            {{ activeComponent.name }}
          </h3>
          <p class="component-path">{{ activeComponent.path }}</p>
        </div>
        <button
          type="button"
          @click="closeLoupe"
          class="close-button"
          aria-label="Close Loupe"
        >
          <AppIcon name="x" />
        </button>
      </div>

      <div class="info-links">
        <a
          v-if="activeComponent.links.docs"
          :href="activeComponent.links.docs"
          target="_blank"
          rel="noopener noreferrer"
          class="info-link"
        >
          <AppIcon name="book-open" />
          <span>View in style guide</span>
          <AppIcon name="external-link" class="open-icon" />
        </a>
        <a
          v-if="activeComponent.links.github"
          :href="activeComponent.links.github"
          target="_blank"
          rel="noopener noreferrer"
          class="info-link"
        >
          <AppIcon name="github" />
          <span>View in GitHub</span>
          <AppIcon name="external-link" class="open-icon" />
        </a>
        <a
          v-if="activeComponent.links.figma"
          :href="activeComponent.links.figma"
          target="_blank"
          rel="noopener noreferrer"
          class="info-link"
        >
          <AppIcon name="figma" />
          <span>View in Figma</span>
          <AppIcon name="external-link" class="open-icon" />
        </a>
      </div>
    </LoupeBox>

    <!-- Unified Control Panel -->
    <div class="control-panel">
      <div class="panel-header">
        <div class="min-w-0 flex-1">
          <h3 class="panel-title">
            <AppIcon name="scan-eye" class="panel-title-icon" />
            Loupe
          </h3>
          <p class="panel-subtitle">Viewport: {{ viewportWidth }} × {{ viewportHeight }}px • {{ currentBreakpointLabel }}</p>
        </div>
        <button
          type="button"
          @click="closeLoupe"
          class="close-button"
          aria-label="Close Loupe"
        >
          <AppIcon name="x" />
        </button>
      </div>

      <!-- Feature Toggles -->
      <div class="panel-section">
        <div class="section-label">Features</div>
        <div class="feature-toggles">
          <UiCheckbox v-model="showComponentHighlights" label="Component highlights" />
          <UiCheckbox v-model="showRuler" label="Breakpoint ruler" />
          <UiCheckbox v-model="showLayoutInspector" label="Layout inspector" @update:model-value="onLayoutInspectorToggle" />
        </div>
      </div>

      <!-- Breakpoints Section -->
      <div class="panel-section">
        <div class="section-label">Breakpoints</div>
        <div class="breakpoints-list">
          <div
            v-for="bp in breakpointItems"
            :key="`${bp.id}-${viewportWidth}`"
            class="breakpoint-item"
            :class="[`loupe-tone-${getBreakpointTone(bp.id)}`, { active: bp.isActive }]"
          >
            <div class="breakpoint-item-header">
              <span class="breakpoint-name">{{ bp.label || bp.id }}</span>
              <UiChip :tone="bp.isActive ? 'accent' : 'neutral'">{{ bp.isActive ? 'Active' : 'Inactive' }}</UiChip>
            </div>
            <div class="breakpoint-range">{{ formatBreakpointRange(bp) }}</div>
            <button v-if="bp.minWidth !== undefined" type="button" class="breakpoint-open" @click="jumpToBreakpoint(bp)">
              Open at {{ Math.max(bp.minWidth, 320) }}px
            </button>
          </div>
        </div>
        <p v-if="breakpointMessage" class="breakpoint-message" role="status">{{ breakpointMessage }}</p>
      </div>

      <!-- Layout Inspector Section -->
      <div v-if="showLayoutInspector" class="panel-section">
        <div class="section-label">
          Layout containers
          <UiButton v-if="isScanning" size="sm" variant="secondary" @click="cancelScan">Cancel</UiButton>
          <UiButton v-else size="sm" variant="secondary" icon="refresh-cw" @click="refreshLayouts">Refresh</UiButton>
        </div>
        <div v-if="isScanning" class="scanning-indicator" role="status">
          <UiSpinner label="Scanning for layouts…" />
        </div>
        <div class="layout-list" ref="layoutListRef">
          <div
            v-for="(layout, index) in detectedLayouts"
            :key="`layout-item-${index}`"
            :ref="el => setLayoutItemRef(el, index)"
            class="layout-item"
            :class="{ active: highlightedLayoutIndex === index }"
            @click="toggleLayoutHighlight(index)"
            @mouseenter="highlightedLayoutIndex = index"
            @mouseleave="highlightedLayoutIndex = null"
          >
            <div class="layout-item-header">
              <UiChip :tone="layout.type === 'grid' ? 'accent' : 'success'">
                {{ layout.type === 'grid' ? 'Grid' : 'Flex' }}
              </UiChip>
              <span class="layout-selector">{{ layout.selector }}</span>
            </div>
            <div class="layout-properties">
              <div v-if="layout.properties.direction" class="layout-prop">
                <span class="prop-label">Direction:</span>
                <span class="prop-value">{{ layout.properties.direction }}</span>
              </div>
              <div v-if="layout.properties.gap" class="layout-prop">
                <span class="prop-label">Gap:</span>
                <span class="prop-value">{{ layout.properties.gap }}</span>
              </div>
              <div v-if="layout.properties.alignItems" class="layout-prop">
                <span class="prop-label">Align:</span>
                <span class="prop-value">{{ layout.properties.alignItems }}</span>
              </div>
              <div v-if="layout.properties.justifyContent" class="layout-prop">
                <span class="prop-label">Justify:</span>
                <span class="prop-value">{{ layout.properties.justifyContent }}</span>
              </div>
            </div>
          </div>
          <div v-if="detectedLayouts.length === 0 && !isScanning" class="no-layouts">
            No grid or flex containers detected
          </div>
        </div>
      </div>

      <!-- Instructions -->
      <div class="instructions-section">
        <p class="instruction-text">
          Press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>L</kbd> to toggle • <kbd>Esc</kbd> to close
        </p>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import LoupeBox from './loupe/LoupeBox.vue';
import { UiButton, UiCheckbox, UiChip, UiSpinner } from './ui';
import { componentMetadataService } from '../services/componentMetadataService';

const isActive = ref(false);
const detectedComponents = ref([]);
const activeComponent = ref(null);
const infoPosition = ref(null);

// Component viewing toggle
const showComponentHighlights = ref(true);

// Breakpoint configuration
const breakpoints = ref([
  { id: 'sm', label: 'Small', minWidth: 640 },
  { id: 'md', label: 'Medium', minWidth: 768 },
  { id: 'lg', label: 'Large', minWidth: 1024 },
  { id: 'xl', label: 'Extra Large', minWidth: 1280 },
  { id: '2xl', label: '2X Large', minWidth: 1536 },
]);

// Viewport tracking
const viewportWidth = ref(window.innerWidth);
const viewportHeight = ref(window.innerHeight);
let resizeTimeout = null;

// Feature toggles
const showRuler = ref(true);
const showLayoutInspector = ref(false);

// Layout inspector state
const detectedLayouts = ref([]);
const highlightedLayoutIndex = ref(null);
const layoutOverlayStyles = ref(new Map());
const layoutListRef = ref(null);
const layoutItemRefs = ref(new Map());
const isScanning = ref(false);
const scanCancelToken = ref(null);
let styleUpdateTimeout = null;

const scanForComponents = () => {
  detectedComponents.value = [];
  
  // Find all elements with data-ds-component attribute
  const elements = document.querySelectorAll('[data-ds-component]');
  
  console.log(`Scanning for components, found ${elements.length} elements with data-ds-component attribute`);
  
  elements.forEach((element) => {
    const componentName = element.getAttribute('data-ds-component');
    const componentPath = element.getAttribute('data-ds-path') || '';
    
    // Get component metadata
    const metadata = componentMetadataService.getComponentMetadata(componentName);
    
    if (metadata) {
      detectedComponents.value.push({
        element,
        name: metadata.name || componentName,
        path: componentPath || metadata.path || '',
        icon: metadata.icon || 'widgets',
        links: metadata.links || {},
      });
    } else {
      // Fallback: use component name if no metadata found
      detectedComponents.value.push({
        element,
        name: componentName,
        path: componentPath,
        icon: 'blocks',
        links: {},
      });
    }
  });
};

const px = (n) => `${n}px`;
const boxFor = (rect) => ({ left: px(rect.left), top: px(rect.top), width: px(rect.width), height: px(rect.height) });

const getHighlightBox = (element) => boxFor(element.getBoundingClientRect());

const showInfo = (component, event) => {
  console.log('Showing info for component:', component);
  activeComponent.value = component;
  
  // Use nextTick to ensure DOM is updated
  setTimeout(() => {
    const rect = component.element.getBoundingClientRect();
    const panelWidth = 320;
    const panelHeight = 200;
    
    // Position panel to the right of the component, or left if not enough space
    let x = rect.right + 10;
    let y = rect.top;
    
    if (x + panelWidth > window.innerWidth) {
      x = rect.left - panelWidth - 10;
    }
    
    if (y + panelHeight > window.innerHeight) {
      y = window.innerHeight - panelHeight - 10;
    }
    
    if (x < 0) x = 10;
    if (y < 0) y = 10;
    
    infoPosition.value = { x, y };
    console.log('Info panel positioned at:', { x, y });
  }, 0);
};

const updateInfoPosition = (component, event) => {
  // Update position as mouse moves to keep panel near cursor
  if (activeComponent.value === component && infoPosition.value) {
    const panelWidth = 320;
    const panelHeight = 200;
    
    let x = event.clientX + 15;
    let y = event.clientY + 15;
    
    if (x + panelWidth > window.innerWidth) {
      x = event.clientX - panelWidth - 15;
    }
    
    if (y + panelHeight > window.innerHeight) {
      y = event.clientY - panelHeight - 15;
    }
    
    if (x < 0) x = 10;
    if (y < 0) y = 10;
    
    infoPosition.value = { x, y };
  }
};

const hideInfo = () => {
  // Don't hide immediately - add small delay to prevent flickering
  setTimeout(() => {
    // Check if we're still hovering over the component or info panel
    const isHoveringComponent = activeComponent.value?.element.matches(':hover');
    const isHoveringPanel = document.querySelector('.info-panel')?.matches(':hover');
    
    if (!isHoveringComponent && !isHoveringPanel) {
      activeComponent.value = null;
      infoPosition.value = null;
    }
  }, 150);
};

// Breakpoint functions
const currentBreakpointLabel = computed(() => {
  // Access viewportWidth to ensure reactivity
  const width = viewportWidth.value;
  
  if (activeBreakpoints.value.length > 0) {
    // Get the largest active breakpoint (highest minWidth)
    // This ensures we show the most specific breakpoint that matches
    const largest = activeBreakpoints.value.reduce((prev, current) => {
      const prevMin = prev.minWidth || 0;
      const currentMin = current.minWidth || 0;
      return currentMin > prevMin ? current : prev;
    });
    return largest.label || largest.id;
  }
  return 'Base';
});

// Make breakpoint active check reactive
const isBreakpointActive = (breakpoint) => {
  // Access viewportWidth.value to ensure Vue tracks the dependency
  const width = viewportWidth.value;
  if (breakpoint.minWidth !== undefined && breakpoint.maxWidth !== undefined) {
    return width >= breakpoint.minWidth && width <= breakpoint.maxWidth;
  } else if (breakpoint.minWidth !== undefined) {
    return width >= breakpoint.minWidth;
  } else if (breakpoint.maxWidth !== undefined) {
    return width <= breakpoint.maxWidth;
  }
  return false;
};

// Computed property for breakpoint items with active state (for better reactivity)
const breakpointItems = computed(() => {
  return breakpoints.value.map(bp => ({
    ...bp,
    isActive: isBreakpointActive(bp)
  }));
});

const activeBreakpoints = computed(() => {
  // Explicitly access viewportWidth to ensure reactivity
  const width = viewportWidth.value;
  return breakpoints.value.filter(bp => {
    if (bp.minWidth !== undefined && bp.maxWidth !== undefined) {
      return width >= bp.minWidth && width <= bp.maxWidth;
    } else if (bp.minWidth !== undefined) {
      return width >= bp.minWidth;
    } else if (bp.maxWidth !== undefined) {
      return width <= bp.maxWidth;
    }
    return false;
  });
});

const formatBreakpointRange = (breakpoint) => {
  if (breakpoint.minWidth !== undefined && breakpoint.maxWidth !== undefined) {
    return `${breakpoint.minWidth}px - ${breakpoint.maxWidth}px`;
  } else if (breakpoint.minWidth !== undefined) {
    return `≥ ${breakpoint.minWidth}px`;
  } else if (breakpoint.maxWidth !== undefined) {
    return `≤ ${breakpoint.maxWidth}px`;
  }
  return 'All sizes';
};

// Each breakpoint keeps one of the six chart colours (loupe-tone-N in the styles)
const getBreakpointTone = (id) => {
  const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return (index % 6) + 1;
};

const sortedBreakpoints = computed(() => {
  return [...breakpoints.value].sort((a, b) => {
    const aMin = a.minWidth || 0;
    const bMin = b.minWidth || 0;
    return aMin - bMin;
  });
});

const maxBreakpoint = computed(() => {
  const maxValues = breakpoints.value.map(bp => {
    if (bp.maxWidth !== undefined) return bp.maxWidth;
    if (bp.minWidth !== undefined) return bp.minWidth;
    return 0;
  });
  return Math.max(...maxValues, viewportWidth.value, 1920);
});

// Pages can't resize their own window, so a breakpoint opens this page in a
// window whose viewport is exactly that wide (one window, reused)
const breakpointMessage = ref('');
const jumpToBreakpoint = (breakpoint) => {
  if (breakpoint.minWidth === undefined) return;
  const width = Math.max(breakpoint.minWidth, 320);
  const opened = window.open(
    window.location.href,
    'loupe-breakpoint-preview',
    `popup,width=${width},height=${Math.min(window.innerHeight, window.screen?.availHeight || window.innerHeight)}`,
  );
  if (opened) {
    breakpointMessage.value = `Opened this page in a ${width}px wide window (${breakpoint.label || breakpoint.id}).`;
    opened.focus?.();
  } else {
    breakpointMessage.value = `The browser blocked the ${width}px preview window. Allow pop-ups for this site, or resize the window to ${width}px.`;
  }
};

const updateViewport = () => {
  // Force reactivity by directly updating the refs
  const newWidth = window.innerWidth;
  const newHeight = window.innerHeight;
  
  // Only update if changed to trigger reactivity
  if (viewportWidth.value !== newWidth) {
    viewportWidth.value = newWidth;
  }
  if (viewportHeight.value !== newHeight) {
    viewportHeight.value = newHeight;
  }
};

// Overlays are position: fixed at viewport coordinates, so they're redrawn on scroll (once per frame)
let scrollFrame = null;
const handleScroll = () => {
  if (scrollFrame !== null) return;
  scrollFrame = requestAnimationFrame(() => {
    scrollFrame = null;
    if (!isActive.value) return;
    scanForComponents();
    if (showLayoutInspector.value && detectedLayouts.value.length > 0) {
      updateLayoutOverlayStyles();
    }
  });
};

const handleResize = () => {
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
  }
  resizeTimeout = setTimeout(() => {
    // Force update viewport immediately for breakpoint detection
    viewportWidth.value = window.innerWidth;
    viewportHeight.value = window.innerHeight;
    updateViewport(); // This also updates, but we do it above to ensure reactivity
    if (showLayoutInspector.value && detectedLayouts.value.length > 0) {
      updateLayoutOverlayStyles();
    }
  }, 50); // Reduced debounce for more responsive breakpoint updates
};

const activateLoupe = () => {
  console.log('Activating Developer Tools...');
  isActive.value = true;
  document.body.style.overflow = 'hidden';
  updateViewport();
  scanForComponents();
  
  // Scan for layouts if inspector is enabled
  if (showLayoutInspector.value && detectedLayouts.value.length === 0) {
    scanForLayouts();
  }
  
  console.log(`Found ${detectedComponents.value.length} components`);
  
  // Re-scan periodically in case DOM changes
  const interval = setInterval(() => {
    if (isActive.value) {
      scanForComponents();
    } else {
      clearInterval(interval);
    }
  }, 1000);
};

const closeLoupe = () => {
  isActive.value = false;
  activeComponent.value = null;
  infoPosition.value = null;
  detectedComponents.value = [];
  document.body.style.overflow = '';
  
  // Cancel layout scanning
  if (scanCancelToken.value) {
    scanCancelToken.value.cancelled = true;
  }
  highlightedLayoutIndex.value = null;
  if (styleUpdateTimeout) {
    clearTimeout(styleUpdateTimeout);
  }
};

// Layout Inspector functions
const scanForLayouts = async () => {
  if (scanCancelToken.value) {
    scanCancelToken.value.cancelled = true;
  }
  
  const cancelToken = { cancelled: false };
  scanCancelToken.value = cancelToken;
  
  isScanning.value = true;
  detectedLayouts.value = [];
  
  try {
    const layouts = await scanForLayoutsAsync(cancelToken);
    
    if (!cancelToken.cancelled) {
      const filteredLayouts = layouts.filter((layout, index) => {
        return !layouts.some((other, otherIndex) => {
          if (index >= otherIndex) return false;
          return other.element.contains(layout.element);
        });
      });
      
      detectedLayouts.value = filteredLayouts;
      layoutItemRefs.value.clear();
      updateLayoutOverlayStyles();
    }
  } catch (error) {
    console.error('Layout scan error:', error);
  } finally {
    if (!cancelToken.cancelled) {
      isScanning.value = false;
    }
  }
};

const scanForLayoutsAsync = async (cancelToken) => {
  const MAX_ELEMENTS = 2000;
  const BATCH_SIZE = 50;
  const MAX_TIME = 2000;
  const startTime = Date.now();
  
  const layouts = [];
  const allElements = Array.from(document.querySelectorAll('*'));
  const elementsToScan = allElements.slice(0, MAX_ELEMENTS);
  
  for (let i = 0; i < elementsToScan.length; i += BATCH_SIZE) {
    if (cancelToken.cancelled) break;
    if (Date.now() - startTime > MAX_TIME) break;
    
    const batch = elementsToScan.slice(i, i + BATCH_SIZE);
    
    for (const element of batch) {
      if (cancelToken.cancelled) break;
      if (element.offsetParent === null && element !== document.body) continue;
      
      const tagName = element.tagName?.toLowerCase();
      if (['script', 'style', 'meta', 'link', 'noscript', 'template'].includes(tagName)) continue;
      
      try {
        const styles = window.getComputedStyle(element);
        const display = styles.display;
        
        if (display === 'grid' || display === 'flex') {
          const rect = element.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight + 1000) {
            const properties = {
              direction: display === 'flex' ? styles.flexDirection : 'grid',
              gap: styles.gap || styles.gridGap || '0',
              alignItems: styles.alignItems || 'stretch',
              justifyContent: styles.justifyContent || 'normal',
            };
            
            let selector = element.tagName.toLowerCase();
            if (element.id) {
              selector = `#${element.id}`;
            } else if (element.className) {
              const classes = Array.from(element.classList).slice(0, 2).join('.');
              if (classes) selector += `.${classes}`;
            }
            
            layouts.push({ element, type: display, selector, properties, rect });
          }
        }
      } catch (error) {
        continue;
      }
    }
    
    if (i + BATCH_SIZE < elementsToScan.length) {
      await new Promise(resolve => {
        if (window.requestIdleCallback) {
          window.requestIdleCallback(resolve, { timeout: 100 });
        } else {
          setTimeout(resolve, 0);
        }
      });
    }
  }
  
  return layouts;
};

const onLayoutInspectorToggle = async () => {
  if (showLayoutInspector.value) {
    if (scanCancelToken.value) {
      scanCancelToken.value.cancelled = true;
    }
    if (detectedLayouts.value.length === 0) {
      await scanForLayouts();
    }
  } else {
    if (scanCancelToken.value) {
      scanCancelToken.value.cancelled = true;
    }
    highlightedLayoutIndex.value = null;
    isScanning.value = false;
  }
};

const refreshLayouts = async () => {
  if (showLayoutInspector.value) {
    await scanForLayouts();
  }
};

const cancelScan = () => {
  if (scanCancelToken.value) {
    scanCancelToken.value.cancelled = true;
  }
  isScanning.value = false;
};

const setLayoutItemRef = (el, index) => {
  if (el) {
    layoutItemRefs.value.set(index, el);
  } else {
    layoutItemRefs.value.delete(index);
  }
};

const selectLayoutItem = (index) => {
  highlightedLayoutIndex.value = index;
  scrollToLayoutItem(index);
};

const toggleLayoutHighlight = (index) => {
  if (highlightedLayoutIndex.value === index) {
    highlightedLayoutIndex.value = null;
  } else {
    highlightedLayoutIndex.value = index;
    scrollToLayoutItem(index);
  }
};

const scrollToLayoutItem = async (index) => {
  await nextTick();
  setTimeout(() => {
    const itemRef = layoutItemRefs.value.get(index);
    if (itemRef) {
      itemRef.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
      });
    }
  }, 10);
};

const getLayoutId = (layout, index) => {
  return layout.element.id 
    ? `layout-${layout.element.id}`
    : layout.element.className 
    ? `layout-${index}-${layout.element.className.split(' ')[0]}`
    : `layout-${index}-${layout.element.tagName}`;
};

const updateLayoutOverlayStyles = () => {
  if (!showLayoutInspector.value || !isActive.value) return;
  
  if (styleUpdateTimeout) {
    clearTimeout(styleUpdateTimeout);
  }
  
  styleUpdateTimeout = setTimeout(() => {
    if (!showLayoutInspector.value || !isActive.value) return;
    
    const newStyles = new Map();
    detectedLayouts.value.forEach((layout, index) => {
      try {
        const id = getLayoutId(layout, index);
        newStyles.set(id, boxFor(layout.element.getBoundingClientRect()));
      } catch (error) {
        console.warn('Layout element no longer available:', error);
      }
    });
    layoutOverlayStyles.value = newStyles;
  }, 100);
};

const getLayoutBox = (layout, index) => layoutOverlayStyles.value.get(getLayoutId(layout, index)) || boxFor(layout.rect);

const handleKeyDown = (event) => {
  // Ctrl+Shift+L or Cmd+Shift+L
  // Check for both uppercase and lowercase 'L' since Shift+L produces uppercase
  const isLoupeShortcut = (event.ctrlKey || event.metaKey) && event.shiftKey && (event.key === 'L' || event.key === 'l' || event.keyCode === 76 || event.code === 'KeyL');
  
  if (isLoupeShortcut) {
    event.preventDefault();
    event.stopPropagation();
    if (isActive.value) {
      closeLoupe();
    } else {
      activateLoupe();
    }
  }
  
  // Escape to close
  if (event.key === 'Escape' && isActive.value) {
    event.preventDefault();
    closeLoupe();
  }
};

onMounted(async () => {
  updateViewport();
  window.addEventListener('keydown', handleKeyDown, true);
  window.addEventListener('resize', handleResize);
  window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
  
  console.log('Developer Tools mounted and listening for keyboard shortcuts');
  
  // Load component metadata from API
  try {
    await componentMetadataService.loadFromAPI();
    console.log('Component metadata loaded');
  } catch (error) {
    console.warn('Failed to load component metadata:', error);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown, true);
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('scroll', handleScroll, { capture: true });
  if (scrollFrame !== null) cancelAnimationFrame(scrollFrame);
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
  }
  if (scanCancelToken.value) {
    scanCancelToken.value.cancelled = true;
  }
  if (styleUpdateTimeout) {
    clearTimeout(styleUpdateTimeout);
  }
  if (isActive.value) {
    closeLoupe();
  }
});
</script>

<style scoped>
/* The Loupe floats over whatever page is open, above the app's own layers */
.loupe-tool {
  @apply pointer-events-none fixed inset-0;
  z-index: 9999;
}

/* A see-through accent wash, so highlights don't hide the page under them */
.loupe-tool {
  --loupe-wash: color-mix(in srgb, theme('colors.accent.DEFAULT') 12%, transparent);
  --loupe-wash-strong: color-mix(in srgb, theme('colors.accent.DEFAULT') 22%, transparent);
}

/* Breakpoint colours: the chart palette, one per breakpoint */
.loupe-tone-1 { --loupe-tone: theme('colors.chart.1'); }
.loupe-tone-2 { --loupe-tone: theme('colors.chart.2'); }
.loupe-tone-3 { --loupe-tone: theme('colors.chart.3'); }
.loupe-tone-4 { --loupe-tone: theme('colors.chart.4'); }
.loupe-tone-5 { --loupe-tone: theme('colors.chart.5'); }
.loupe-tone-6 { --loupe-tone: theme('colors.chart.6'); }

.component-highlight {
  @apply pointer-events-auto fixed cursor-pointer rounded-control border-2 border-accent transition-colors;
  background: var(--loupe-wash);
  z-index: 9998;
}
.component-highlight:hover {
  @apply border-accent-hover;
  background: var(--loupe-wash-strong);
}

.info-panel {
  @apply pointer-events-auto fixed w-80 max-w-full overflow-hidden rounded-tile border border-line-faint bg-surface-raised shadow-overlay;
  z-index: 10000;
}
.info-header,
.panel-header {
  @apply flex items-start justify-between gap-3 border-b border-line-faint p-4;
}
.component-name,
.panel-title {
  @apply mb-1 flex items-center gap-2 font-semibold text-ink-strong;
}
.component-name {
  @apply text-lg;
}
.panel-title {
  @apply text-xl;
}
.component-name-icon,
.panel-title-icon {
  @apply flex-shrink-0 text-accent-text;
}
.component-path,
.panel-subtitle {
  @apply font-code text-xs text-ink-secondary;
}
.panel-subtitle {
  @apply text-sm;
}
.close-button {
  @apply flex flex-shrink-0 items-center justify-center rounded-control p-1 text-ink-secondary transition-colors hover:bg-fill-hover hover:text-ink-strong;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 outline-focus;
}
.info-links {
  @apply flex flex-col gap-1 p-2;
}
.info-link {
  @apply flex items-center gap-3 rounded-control p-3 text-sm text-ink no-underline transition-colors hover:bg-fill-hover hover:text-ink-strong;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 outline-focus;
}
.open-icon {
  @apply ml-auto text-base text-ink-muted;
}

kbd {
  @apply rounded border border-line-control bg-fill-subtle px-1.5 py-0.5 font-code text-xs text-ink;
}

/* Unified Control Panel */
.control-panel {
  @apply pointer-events-auto fixed right-5 top-5 flex w-96 flex-col overflow-y-auto overflow-x-hidden rounded-card border border-line-faint bg-surface-raised shadow-overlay;
  max-width: calc(100vw - 2.5rem);
  max-height: calc(100vh - 2.5rem);
  z-index: 10002;
}

/* Breakpoint Ruler */
.breakpoint-ruler {
  @apply pointer-events-none fixed inset-x-0 top-0 h-16 border-b-2 border-line-faint bg-surface-raised shadow-raised backdrop-blur;
  z-index: 9998;
}
.ruler-container,
.ruler-scale {
  @apply relative h-full w-full;
}
.ruler-marker {
  @apply pointer-events-auto absolute bottom-0 cursor-pointer transition-opacity hover:opacity-80;
  color: var(--loupe-tone);
}
.ruler-marker:focus-visible {
  @apply outline outline-2 outline-offset-2 outline-focus;
}
.marker-line-vertical {
  @apply absolute inset-y-0 left-0 w-0.5 bg-current opacity-60;
}
.ruler-marker-max .marker-line-vertical {
  @apply w-px opacity-30;
}
.marker-label {
  @apply pointer-events-none absolute left-1 top-1 whitespace-nowrap rounded bg-surface-raised px-1 py-0.5 font-code text-xs font-semibold;
}
.ruler-viewport-indicator {
  @apply pointer-events-none absolute bottom-0 z-10 w-0.5 -translate-x-1/2;
}
.viewport-indicator-line {
  @apply h-full w-0.5 bg-danger;
}
.viewport-indicator-label {
  @apply absolute bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-danger px-1.5 py-0.5 font-code text-xs font-semibold text-ink-on-accent;
}

/* Layout Overlays */
.layout-overlays {
  @apply pointer-events-none fixed inset-0;
  z-index: 9996;
}
.layout-overlay {
  @apply pointer-events-auto fixed cursor-pointer border-2 border-chart-2 transition-colors;
  z-index: 9997;
}
.layout-overlay:hover,
.layout-overlay.layout-highlighted {
  @apply border-accent shadow-raised;
  background: var(--loupe-wash-strong);
}
.layout-label {
  @apply pointer-events-none absolute left-1 top-1 rounded bg-accent px-1.5 py-0.5 text-xs font-semibold text-ink-on-accent;
}

/* Sections */
.panel-section {
  @apply border-b border-line-faint px-5 py-4;
}
.section-label {
  @apply mb-3 flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-ink-secondary;
}
.feature-toggles,
.breakpoints-list,
.layout-list {
  @apply flex flex-col gap-2;
}
.breakpoint-item {
  @apply rounded-control border border-line-faint bg-surface-sunken p-3 transition-colors;
}
.breakpoint-item.active {
  @apply border-2 bg-accent-subtle;
  border-color: var(--loupe-tone);
}
.breakpoint-item-header {
  @apply mb-1 flex items-center justify-between;
}
.breakpoint-name {
  @apply text-sm font-semibold text-ink-strong;
}
.breakpoint-open {
  @apply mt-2 text-xs font-medium text-accent-text underline underline-offset-2 rounded-control;
  @apply focus-visible:outline focus-visible:outline-2 outline-focus;
}
.breakpoint-message {
  @apply mt-2 text-xs text-ink-secondary;
}
.breakpoint-range {
  @apply font-code text-xs text-ink-secondary;
}

/* Layout Inspector */
.scanning-indicator {
  @apply mb-3 rounded-control bg-surface-sunken p-3 text-sm text-ink-secondary;
}
.layout-list {
  @apply max-h-52 overflow-y-auto;
}
.layout-item {
  @apply cursor-pointer rounded-control border border-line-faint bg-surface-sunken p-3 transition-colors;
}
.layout-item:hover,
.layout-item.active {
  @apply border-accent bg-accent-subtle;
}
.layout-item-header {
  @apply mb-2 flex items-center gap-2;
}
.layout-selector {
  @apply flex-1 truncate font-code text-xs text-ink-secondary;
}
.layout-properties {
  @apply flex flex-wrap gap-2 text-xs;
}
.layout-prop {
  @apply flex gap-1;
}
.prop-label {
  @apply font-semibold text-ink-secondary;
}
.prop-value {
  @apply font-code text-ink-strong;
}
.no-layouts {
  @apply p-3 text-center text-sm italic text-ink-muted;
}
.instructions-section {
  @apply px-5 py-4;
}
.instruction-text {
  @apply text-center text-xs text-ink-secondary;
}
</style>
