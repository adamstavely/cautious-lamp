<template>
  <div v-if="isActive" class="loupe-tool">
    <!-- Visual Breakpoint Ruler -->
    <div v-if="showRuler" class="breakpoint-ruler">
      <div class="ruler-container">
        <div class="ruler-scale">
          <div
            v-for="bp in sortedBreakpoints"
            :key="`ruler-${bp.id}`"
            class="ruler-marker"
            :style="{
              left: `${((bp.minWidth || 0) / maxBreakpoint) * 100}%`,
              color: getBreakpointColor(bp.id)
            }"
            :title="`${bp.label || bp.id}: ${formatBreakpointRange(bp)} - Click to jump`"
            @click.stop="jumpToBreakpoint(bp)"
          >
            <div class="marker-line-vertical"></div>
            <div class="marker-label">{{ bp.minWidth || 0 }}px</div>
          </div>
          <div
            v-for="bp in sortedBreakpoints.filter(b => b.maxWidth)"
            :key="`ruler-max-${bp.id}`"
            class="ruler-marker ruler-marker-max"
            :style="{
              left: `${(bp.maxWidth / maxBreakpoint) * 100}%`,
              color: getBreakpointColor(bp.id)
            }"
            :title="`${bp.label || bp.id} max: ${bp.maxWidth}px`"
          >
            <div class="marker-line-vertical"></div>
          </div>
        </div>
        <div class="ruler-viewport-indicator" :style="{ left: `${Math.min((viewportWidth / maxBreakpoint) * 100, 100)}%` }">
          <div class="viewport-indicator-line"></div>
          <div class="viewport-indicator-label">{{ viewportWidth }}px</div>
        </div>
      </div>
    </div>

    <!-- Grid/Layout Overlays -->
    <div v-if="showLayoutInspector" class="layout-overlays">
      <div
        v-for="(layout, index) in detectedLayouts"
        :key="getLayoutId(layout, index)"
        class="layout-overlay"
        :class="{ 'layout-highlighted': highlightedLayoutIndex === index }"
        :style="getLayoutOverlayStyle(layout, index)"
        @click.stop="selectLayoutItem(index)"
        @mouseenter="highlightedLayoutIndex = index"
        @mouseleave="highlightedLayoutIndex = null"
      >
        <div class="layout-label" v-if="highlightedLayoutIndex === index">
          {{ layout.type === 'grid' ? 'Grid' : 'Flex' }}
        </div>
      </div>
    </div>

    <!-- Overlay for highlighting components (toggleable) -->
    <div
      v-if="showComponentHighlights"
      v-for="(component, index) in detectedComponents"
      :key="`component-${index}-${component.element.id || component.name}`"
      class="component-highlight"
      :style="getHighlightStyle(component.element)"
      @mouseenter="showInfo(component, $event)"
      @mouseleave="hideInfo"
      @mousemove="updateInfoPosition(component, $event)"
    ></div>

    <!-- Info Panel -->
    <div
      v-if="activeComponent"
      class="info-panel"
      :style="infoPosition ? {
        left: `${infoPosition.x}px`,
        top: `${infoPosition.y}px`,
      } : {}"
      @mouseenter="() => {}"
      @mouseleave="hideInfo"
    >
      <div class="info-header">
        <div class="flex-1">
          <h3 class="component-name flex items-center gap-2">
            <span 
              v-if="activeComponent.icon" 
              class="material-symbols-outlined component-name-icon"
            >
              {{ activeComponent.icon }}
            </span>
            {{ activeComponent.name }}
          </h3>
          <p class="component-path">{{ activeComponent.path }}</p>
        </div>
        <button
          @click="closeLoupe"
          class="close-button"
          aria-label="Close Loupe"
        >
          <span class="material-symbols-outlined">close</span>
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
          <span class="material-symbols-outlined">menu_book</span>
          <span>View in Style Guide</span>
          <span class="material-symbols-outlined open-icon">open_in_new</span>
        </a>
        <a
          v-if="activeComponent.links.github"
          :href="activeComponent.links.github"
          target="_blank"
          rel="noopener noreferrer"
          class="info-link"
        >
          <svg class="github-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          <span>View in GitHub</span>
          <span class="material-symbols-outlined open-icon">open_in_new</span>
        </a>
        <a
          v-if="activeComponent.links.figma"
          :href="activeComponent.links.figma"
          target="_blank"
          rel="noopener noreferrer"
          class="info-link"
        >
          <svg class="figma-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.852 8.981h-4.588V0h4.588c2.476 0 4.375 1.717 4.375 4.49 0 2.775-1.899 4.491-4.375 4.491zM12.264 7.51h3.588c1.665 0 2.811-1.135 2.811-2.98 0-1.846-1.146-2.98-2.811-2.98H12.264V7.51zm0 1.471H8.26c-2.476 0-4.375-1.716-4.375-4.49C3.885 1.717 5.784 0 8.26 0h4.004v8.981zm-4.004-7.51c-1.665 0-2.811 1.134-2.811 2.98 0 1.845 1.146 2.98 2.811 2.98h4.004V1.471zm4.004 15.019H8.26c-2.476 0-4.375-1.716-4.375-4.49 0-2.774 1.899-4.49 4.375-4.49h4.004v8.98zm-4.004-7.509c-1.665 0-2.811 1.135-2.811 2.98 0 1.846 1.146 2.981 2.811 2.981h4.004v-5.961H8.26zm8.519 7.509c-2.476 0-4.375-1.716-4.375-4.49 0-2.774 1.899-4.49 4.375-4.49h4.588v8.98h-4.588zm-1.471-7.509c-1.665 0-2.811 1.135-2.811 2.98 0 1.846 1.146 2.981 2.811 2.981h3.117V9.45h-3.117z"/>
          </svg>
          <span>View in Figma</span>
          <span class="material-symbols-outlined open-icon">open_in_new</span>
        </a>
      </div>
    </div>

    <!-- Unified Control Panel -->
    <div class="control-panel">
      <div class="panel-header">
        <div class="flex-1">
          <h3 class="panel-title flex items-center gap-2">
            <ScanEye :size="20" class="scan-eye-icon" />
            Loupe
          </h3>
          <p class="panel-subtitle">Viewport: {{ viewportWidth }} × {{ viewportHeight }}px • {{ currentBreakpointLabel }}</p>
        </div>
        <button
          @click="closeLoupe"
          class="close-button"
          aria-label="Close Loupe"
        >
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <!-- Feature Toggles -->
      <div class="features-section">
        <div class="section-label">Features</div>
        <div class="feature-toggles">
          <label class="feature-toggle">
            <input type="checkbox" v-model="showComponentHighlights" />
            <span>Component Highlights</span>
          </label>
          <label class="feature-toggle">
            <input type="checkbox" v-model="showRuler" />
            <span>Breakpoint Ruler</span>
          </label>
          <label class="feature-toggle">
            <input type="checkbox" v-model="showLayoutInspector" @change="onLayoutInspectorToggle" />
            <span>Layout Inspector</span>
          </label>
        </div>
      </div>

      <!-- Breakpoints Section -->
      <div class="breakpoints-section">
        <div class="section-label">Breakpoints</div>
        <div class="breakpoints-list">
          <div
            v-for="bp in breakpointItems"
            :key="`${bp.id}-${viewportWidth}`"
            class="breakpoint-item"
            :class="{ active: bp.isActive }"
            :style="bp.isActive ? { borderColor: getBreakpointColor(bp.id) } : {}"
          >
            <div class="breakpoint-item-header">
              <span class="breakpoint-name">{{ bp.label || bp.id }}</span>
              <span class="breakpoint-status" :class="{ 'status-active': bp.isActive }">
                {{ bp.isActive ? 'Active' : 'Inactive' }}
              </span>
            </div>
            <div class="breakpoint-range">{{ formatBreakpointRange(bp) }}</div>
          </div>
        </div>
      </div>

      <!-- Layout Inspector Section -->
      <div v-if="showLayoutInspector" class="layout-inspector-section">
        <div class="section-label">
          Layout Containers
          <div class="section-actions">
            <button
              v-if="isScanning"
              @click="cancelScan"
              class="cancel-scan-button"
              title="Cancel scan"
            >
              Cancel
            </button>
            <button
              v-else
              @click="refreshLayouts"
              class="refresh-button"
              title="Refresh layouts"
            >
              ↻ Refresh
            </button>
          </div>
        </div>
        <div v-if="isScanning" class="scanning-indicator">
          <div class="scanning-spinner"></div>
          <span>Scanning for layouts...</span>
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
              <span class="layout-type-badge" :class="`type-${layout.type}`">
                {{ layout.type === 'grid' ? 'Grid' : 'Flex' }}
              </span>
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

    <!-- Instructions overlay (simplified) -->
    <div class="instructions-overlay">
      <div class="instructions-content">
          <h3 class="flex items-center gap-2">
          <ScanEye :size="20" class="scan-eye-icon" />
          Loupe Active
        </h3>
        <p v-if="showComponentHighlights">Hover over highlighted components to see details</p>
        <p v-else>Toggle features in the control panel</p>
        <p class="shortcut-hint">Press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>L</kbd> to close</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { ScanEye } from 'lucide-vue-next';
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
        icon: 'widgets',
        links: {},
      });
    }
  });
};

const getHighlightStyle = (element) => {
  const rect = element.getBoundingClientRect();
  return {
    position: 'fixed',
    left: `${rect.left + window.scrollX}px`,
    top: `${rect.top + window.scrollY}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    zIndex: 9998,
  };
};

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

const getBreakpointColor = (id) => {
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6'];
  const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
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

const jumpToBreakpoint = (breakpoint) => {
  if (breakpoint.minWidth !== undefined) {
    alert(`To test at ${breakpoint.minWidth}px, resize your browser window or use dev tools.`);
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
        const rect = layout.element.getBoundingClientRect();
        newStyles.set(id, {
          position: 'fixed',
          left: `${rect.left + window.scrollX}px`,
          top: `${rect.top + window.scrollY}px`,
          width: `${rect.width}px`,
          height: `${rect.height}px`,
          zIndex: 9997,
        });
      } catch (error) {
        console.warn('Layout element no longer available:', error);
      }
    });
    layoutOverlayStyles.value = newStyles;
  }, 100);
};

const getLayoutOverlayStyle = (layout, index) => {
  const id = getLayoutId(layout, index);
  return layoutOverlayStyles.value.get(id) || {
    position: 'fixed',
    left: `${layout.rect.left + window.scrollX}px`,
    top: `${layout.rect.top + window.scrollY}px`,
    width: `${layout.rect.width}px`,
    height: `${layout.rect.height}px`,
    zIndex: 9997,
  };
};

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
.loupe-tool {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  pointer-events: none;
}

.component-highlight {
  position: fixed;
  border: 2px solid #6366f1;
  background: rgba(99, 102, 241, 0.1);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.3);
  pointer-events: auto;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 9998;
}

.component-highlight:hover {
  border-color: #818cf8;
  background: rgba(129, 140, 248, 0.15);
  box-shadow: 0 0 0 4px rgba(129, 140, 248, 0.4);
}

.info-panel {
  position: fixed;
  width: 320px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 10000;
  pointer-events: auto;
  overflow: hidden;
}

.dark .info-panel {
  background: #1e293b;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.dark .info-header {
  border-bottom-color: #334155;
}

.component-name {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.component-name-icon {
  color: #6366f1;
  flex-shrink: 0;
}

.dark .component-name {
  color: #f1f5f9;
}

.dark .component-name-icon {
  color: #818cf8;
}

.component-path {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.dark .component-path {
  color: #94a3b8;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-button:hover {
  background: #f3f4f6;
  color: #111827;
}

.dark .close-button {
  color: #94a3b8;
}

.dark .close-button:hover {
  background: #334155;
  color: #f1f5f9;
}

.info-links {
  padding: 8px;
}

.info-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 6px;
  text-decoration: none;
  color: #374151;
  transition: all 0.2s;
  margin-bottom: 4px;
}

.info-link:hover {
  background: #f3f4f6;
  color: #111827;
}

.dark .info-link {
  color: #cbd5e1;
}

.dark .info-link:hover {
  background: #334155;
  color: #f1f5f9;
}

.info-link .material-symbols-outlined {
  font-size: 20px;
  width: 20px;
  height: 20px;
}

.github-icon,
.figma-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.open-icon {
  margin-left: auto;
  font-size: 16px;
  opacity: 0.6;
}

.instructions-overlay {
  position: fixed;
  top: 20px;
  right: 20px;
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 10001;
  pointer-events: auto;
  max-width: 280px;
}

.dark .instructions-overlay {
  background: #1e293b;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
}

.instructions-content h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 8px;
}

.instructions-content h3 .scan-eye-icon {
  color: #6366f1;
  flex-shrink: 0;
}

.dark .instructions-content h3 {
  color: #f1f5f9;
}

.dark .instructions-content h3 .scan-eye-icon {
  color: #818cf8;
}

.instructions-content p {
  margin: 4px 0;
  font-size: 14px;
  color: #6b7280;
}

.dark .instructions-content p {
  color: #94a3b8;
}

.shortcut-hint {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #e5e7eb;
}

.dark .shortcut-hint {
  border-top-color: #334155;
}

kbd {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 12px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  color: #374151;
}

.dark kbd {
  background: #334155;
  border-color: #475569;
  color: #cbd5e1;
}

/* Unified Control Panel */
.control-panel {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 400px;
  max-width: calc(100vw - 40px);
  max-height: calc(100vh - 40px);
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  z-index: 10002;
  pointer-events: auto;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

.dark .control-panel {
  background: #1e293b;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.dark .panel-header {
  border-bottom-color: #334155;
}

.panel-title {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.panel-title .scan-eye-icon {
  color: #6366f1;
  flex-shrink: 0;
}

.dark .panel-title {
  color: #f1f5f9;
}

.dark .panel-title .scan-eye-icon {
  color: #818cf8;
}

.panel-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.dark .panel-subtitle {
  color: #94a3b8;
}

/* Breakpoint Ruler */
.breakpoint-ruler {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-bottom: 2px solid #e5e7eb;
  z-index: 9998;
  pointer-events: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.dark .breakpoint-ruler {
  background: rgba(30, 41, 59, 0.95);
  border-bottom-color: #334155;
}

.ruler-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.ruler-scale {
  position: relative;
  width: 100%;
  height: 100%;
}

.ruler-marker {
  position: absolute;
  top: 0;
  bottom: 0;
  pointer-events: auto;
  cursor: pointer;
  transition: all 0.2s;
}

.ruler-marker:hover {
  opacity: 0.8;
}

.marker-line-vertical {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: currentColor;
  opacity: 0.6;
}

.ruler-marker-max .marker-line-vertical {
  opacity: 0.3;
  width: 1px;
}

.marker-label {
  position: absolute;
  top: 4px;
  left: 4px;
  font-size: 10px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.9);
  padding: 2px 4px;
  border-radius: 3px;
  white-space: nowrap;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  pointer-events: none;
}

.dark .marker-label {
  background: rgba(30, 41, 59, 0.9);
  color: #f1f5f9;
}

.ruler-viewport-indicator {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  transform: translateX(-50%);
  z-index: 10;
  pointer-events: none;
}

.viewport-indicator-line {
  width: 2px;
  height: 100%;
  background: #ef4444;
  box-shadow: 0 0 4px rgba(239, 68, 68, 0.6);
}

.viewport-indicator-label {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  background: #ef4444;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

/* Layout Overlays */
.layout-overlays {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9996;
  pointer-events: none;
}

.layout-overlay {
  border: 2px solid #6366f1;
  background: rgba(99, 102, 241, 0.1);
  pointer-events: auto;
  cursor: pointer;
  transition: all 0.2s;
}

.layout-overlay:hover,
.layout-overlay.layout-highlighted {
  border-color: #818cf8;
  background: rgba(129, 140, 248, 0.2);
  box-shadow: 0 0 0 4px rgba(129, 140, 248, 0.3);
}

.layout-label {
  position: absolute;
  top: 4px;
  left: 4px;
  background: #6366f1;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  pointer-events: none;
}

/* Sections */
.features-section,
.breakpoints-section,
.layout-inspector-section {
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.dark .features-section,
.dark .breakpoints-section,
.dark .layout-inspector-section {
  border-bottom-color: #334155;
}

.section-label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dark .section-label {
  color: #94a3b8;
}

.feature-toggles {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.feature-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #111827;
}

.dark .feature-toggle {
  color: #f1f5f9;
}

.feature-toggle input[type="checkbox"] {
  cursor: pointer;
}

.breakpoints-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.breakpoint-item {
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  transition: all 0.2s;
}

.dark .breakpoint-item {
  border-color: #334155;
  background: #0f172a;
}

.breakpoint-item.active {
  border-width: 2px;
  background: rgba(99, 102, 241, 0.1);
}

.breakpoint-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.breakpoint-name {
  font-weight: 600;
  color: #111827;
  font-size: 14px;
}

.dark .breakpoint-name {
  color: #f1f5f9;
}

.breakpoint-range {
  font-size: 12px;
  color: #6b7280;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.dark .breakpoint-range {
  color: #94a3b8;
}

.breakpoint-status {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 12px;
  background: #e5e7eb;
  color: #6b7280;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.dark .breakpoint-status {
  background: #334155;
  color: #94a3b8;
}

.breakpoint-status.status-active {
  background: #6366f1;
  color: white;
}

/* Layout Inspector Styles */
.section-actions {
  display: flex;
  gap: 4px;
}

.cancel-scan-button,
.refresh-button {
  padding: 4px 8px;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: none;
  letter-spacing: 0;
}

.cancel-scan-button {
  background: #ef4444;
}

.cancel-scan-button:hover {
  background: #dc2626;
}

.refresh-button:hover {
  background: #818cf8;
}

.scanning-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f3f4f6;
  border-radius: 6px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #6b7280;
}

.dark .scanning-indicator {
  background: #0f172a;
  color: #94a3b8;
}

.scanning-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #e5e7eb;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.dark .scanning-spinner {
  border-color: #334155;
  border-top-color: #818cf8;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.layout-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.layout-item {
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  cursor: pointer;
  transition: all 0.2s;
}

.dark .layout-item {
  border-color: #334155;
  background: #0f172a;
}

.layout-item:hover,
.layout-item.active {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.1);
}

.layout-item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.layout-type-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.layout-type-badge.type-grid {
  background: #6366f1;
  color: white;
}

.layout-type-badge.type-flex {
  background: #10b981;
  color: white;
}

.layout-selector {
  font-size: 11px;
  color: #6b7280;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dark .layout-selector {
  color: #94a3b8;
}

.layout-properties {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 11px;
}

.layout-prop {
  display: flex;
  gap: 4px;
}

.prop-label {
  color: #6b7280;
  font-weight: 600;
}

.dark .prop-label {
  color: #94a3b8;
}

.prop-value {
  color: #111827;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.dark .prop-value {
  color: #f1f5f9;
}

.no-layouts {
  padding: 12px;
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
  font-style: italic;
}

.dark .no-layouts {
  color: #64748b;
}

.instructions-section {
  padding: 16px 20px;
}

.instruction-text {
  font-size: 12px;
  color: #6b7280;
  text-align: center;
  margin: 0;
}

.dark .instruction-text {
  color: #94a3b8;
}

.flex-1 {
  flex: 1;
}

</style>

