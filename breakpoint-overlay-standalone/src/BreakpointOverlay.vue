<template>
  <!-- Badge/Indicator: Always visible when mounted -->
  <div 
    v-if="!isExpanded" 
    class="breakpoint-badge" 
    :title="`Current: ${currentBreakpointLabel} (${viewportWidth}×${viewportHeight}) - Press ${hotkeyDisplay} to expand`"
    @click="toggleExpanded"
  >
    <span class="badge-label">{{ currentBreakpointLabel }}</span>
  </div>
  
  <!-- Visual Breakpoint Ruler -->
  <div v-if="isExpanded && showRuler" class="breakpoint-ruler">
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
  <div v-if="isExpanded && showLayoutInspector" class="layout-overlays">
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

  <!-- Expanded Overlay -->
  <div v-if="isExpanded" class="breakpoint-overlay" @click.self="toggleExpanded">
    <!-- Main Panel -->
    <div class="overlay-panel">
      <div class="panel-header">
        <div class="flex-1">
          <h3 class="panel-title">Breakpoint Overlay</h3>
          <p class="panel-subtitle">Viewport: {{ viewportWidth }} × {{ viewportHeight }}px</p>
        </div>
        <button
          @click="toggleExpanded"
          class="close-button"
          aria-label="Close Breakpoint Overlay"
        >
          <span class="close-icon">×</span>
        </button>
      </div>
      
      <!-- All Breakpoints List -->
      <div class="breakpoints-list-section">
        <div class="section-label">All Breakpoints</div>
        <div class="breakpoints-list">
          <div
            v-for="bp in breakpoints"
            :key="bp.id"
            class="breakpoint-item"
            :class="{ active: isBreakpointActive(bp) }"
            :style="isBreakpointActive(bp) ? { borderColor: getBreakpointColor(bp.id) } : {}"
          >
            <div class="breakpoint-item-header">
              <span class="breakpoint-name">{{ bp.label || bp.id }}</span>
              <span class="breakpoint-status" :class="{ 'status-active': isBreakpointActive(bp) }">
                {{ isBreakpointActive(bp) ? 'Active' : 'Inactive' }}
              </span>
            </div>
            <div class="breakpoint-range">{{ formatBreakpointRange(bp) }}</div>
          </div>
        </div>
      </div>
      
      <!-- Visual Breakpoint Indicator -->
      <div class="visual-indicator-section">
        <div class="section-label">Viewport Scale</div>
        <div class="viewport-scale">
          <div class="scale-bar">
            <div
              v-for="bp in sortedBreakpoints"
              :key="bp.id"
              class="scale-segment"
              :class="{ active: isBreakpointActive(bp) }"
              :style="{
                width: `${getBreakpointPercentage(bp)}%`,
                backgroundColor: isBreakpointActive(bp) ? getBreakpointColor(bp.id) : 'transparent',
                borderColor: getBreakpointColor(bp.id)
              }"
              :title="`${bp.label || bp.id}: ${formatBreakpointRange(bp)}`"
            ></div>
          </div>
          <div class="viewport-marker" :style="{ left: `${(viewportWidth / maxBreakpoint) * 100}%` }">
            <div class="marker-line"></div>
            <div class="marker-label">{{ viewportWidth }}px</div>
          </div>
        </div>
      </div>
      
      <!-- Feature Toggles -->
      <div class="features-section">
        <div class="section-label">Features</div>
        <div class="feature-toggles">
          <label class="feature-toggle">
            <input type="checkbox" v-model="showRuler" />
            <span>Visual Ruler</span>
          </label>
          <label class="feature-toggle">
            <input type="checkbox" v-model="showLayoutInspector" @change="onLayoutInspectorToggle" />
            <span>Layout Inspector</span>
          </label>
        </div>
      </div>

      <!-- Layout Inspector Panel -->
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
          <div v-if="detectedLayouts.length === 0" class="no-layouts">
            No grid or flex containers detected
          </div>
        </div>
      </div>

      <!-- Instructions -->
      <div class="instructions-section">
        <p class="instruction-text">
          Press <kbd>{{ hotkeyDisplay }}</kbd> to toggle • <kbd>Esc</kbd> to close
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';

const props = defineProps({
  breakpoints: {
    type: Array,
    default: () => [
      { id: 'sm', label: 'Small', minWidth: 640 },
      { id: 'md', label: 'Medium', minWidth: 768 },
      { id: 'lg', label: 'Large', minWidth: 1024 },
      { id: 'xl', label: 'Extra Large', minWidth: 1280 },
      { id: '2xl', label: '2X Large', minWidth: 1536 },
    ],
  },
  hotkey: {
    type: String,
    default: 'alt+shift+o',
  },
  debounceMs: {
    type: Number,
    default: 150,
  },
});

const isExpanded = ref(false);
const viewportWidth = ref(window.innerWidth);
const viewportHeight = ref(window.innerHeight);

// Feature toggles
const showRuler = ref(true);
const showLayoutInspector = ref(false);

// Layout inspector state
const detectedLayouts = ref([]);
const highlightedLayoutIndex = ref(null);
const layoutOverlayStyles = ref(new Map()); // Cache overlay styles to prevent flashing
const layoutListRef = ref(null);
const layoutItemRefs = ref(new Map()); // Store refs to layout items for scrolling

// Parse hotkey string to display format
const hotkeyDisplay = computed(() => {
  return props.hotkey
    .split('+')
    .map(key => key.charAt(0).toUpperCase() + key.slice(1))
    .join(' + ');
});

// Get current breakpoint label (first active or "Base")
const currentBreakpointLabel = computed(() => {
  if (activeBreakpoints.value.length > 0) {
    return activeBreakpoints.value[0].label || activeBreakpoints.value[0].id;
  }
  return 'Base';
});

// Determine if a breakpoint is active
const isBreakpointActive = (breakpoint) => {
  const width = viewportWidth.value;
  
  if (breakpoint.minWidth !== undefined && breakpoint.maxWidth !== undefined) {
    // Range: both min and max
    return width >= breakpoint.minWidth && width <= breakpoint.maxWidth;
  } else if (breakpoint.minWidth !== undefined) {
    // Min-width: viewport >= minWidth
    return width >= breakpoint.minWidth;
  } else if (breakpoint.maxWidth !== undefined) {
    // Max-width: viewport <= maxWidth
    return width <= breakpoint.maxWidth;
  }
  
  return false;
};

// Get all active breakpoints
const activeBreakpoints = computed(() => {
  return props.breakpoints.filter(bp => isBreakpointActive(bp));
});

// Format breakpoint range for display
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

// Get color for breakpoint (consistent color based on ID)
const getBreakpointColor = (id) => {
  const colors = [
    '#6366f1', // indigo
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#f59e0b', // amber
    '#10b981', // emerald
    '#3b82f6', // blue
    '#ef4444', // red
    '#14b8a6', // teal
  ];
  const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
};

// Sort breakpoints by minWidth for visual indicator
const sortedBreakpoints = computed(() => {
  return [...props.breakpoints].sort((a, b) => {
    const aMin = a.minWidth || 0;
    const bMin = b.minWidth || 0;
    return aMin - bMin;
  });
});

// Get max breakpoint value for scale calculation
const maxBreakpoint = computed(() => {
  const maxValues = props.breakpoints.map(bp => {
    if (bp.maxWidth !== undefined) return bp.maxWidth;
    if (bp.minWidth !== undefined) return bp.minWidth;
    return 0;
  });
  return Math.max(...maxValues, viewportWidth.value, 1920);
});

// Calculate percentage width for scale segment
const getBreakpointPercentage = (breakpoint) => {
  if (breakpoint.minWidth !== undefined && breakpoint.maxWidth !== undefined) {
    return ((breakpoint.maxWidth - breakpoint.minWidth) / maxBreakpoint.value) * 100;
  } else if (breakpoint.minWidth !== undefined) {
    // For min-width only, show a small segment
    const nextBreakpoint = sortedBreakpoints.value.find(bp => 
      bp.minWidth > breakpoint.minWidth
    );
    if (nextBreakpoint && nextBreakpoint.minWidth) {
      return ((nextBreakpoint.minWidth - breakpoint.minWidth) / maxBreakpoint.value) * 100;
    }
    return 10; // Default width if no next breakpoint
  } else if (breakpoint.maxWidth !== undefined) {
    return (breakpoint.maxWidth / maxBreakpoint.value) * 100;
  }
  return 5;
};

// Update viewport dimensions
let resizeTimeout = null;
const updateViewport = () => {
  viewportWidth.value = window.innerWidth;
  viewportHeight.value = window.innerHeight;
};

const handleResize = () => {
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
  }
  resizeTimeout = setTimeout(() => {
    updateViewport();
    // Update layout overlay positions on resize (debounced)
    if (showLayoutInspector.value && detectedLayouts.value.length > 0) {
      updateLayoutOverlayStyles();
    }
  }, props.debounceMs);
};

// Toggle expanded state
const toggleExpanded = () => {
  console.log('Toggle expanded called, current state:', isExpanded.value);
  isExpanded.value = !isExpanded.value;
  console.log('New state:', isExpanded.value);
  
  // Prevent body scroll when expanded (like loupe tool)
  if (isExpanded.value) {
    document.body.style.overflow = 'hidden';
    // Scan for layouts if inspector is enabled (one-time scan on open)
    if (showLayoutInspector.value && detectedLayouts.value.length === 0) {
      scanForLayouts();
    }
  } else {
    document.body.style.overflow = '';
    // Stop layout scanning
    if (layoutScanInterval) {
      clearInterval(layoutScanInterval);
      layoutScanInterval = null;
    }
    highlightedLayoutIndex.value = null;
  }
};

// Parse hotkey string to event matcher
const parseHotkey = (hotkeyString) => {
  const parts = hotkeyString.toLowerCase().split('+').map(s => s.trim());
  const modifiers = {
    alt: false,
    ctrl: false,
    shift: false,
    meta: false,
  };
  let key = '';
  
  parts.forEach(part => {
    if (part === 'alt') modifiers.alt = true;
    else if (part === 'ctrl' || part === 'control') modifiers.ctrl = true;
    else if (part === 'shift') modifiers.shift = true;
    else if (part === 'meta' || part === 'cmd' || part === 'command') modifiers.meta = true;
    else key = part;
  });
  
  return { modifiers, key };
};

// Handle keyboard shortcuts
const hotkeyConfig = computed(() => parseHotkey(props.hotkey));

const handleKeyDown = (event) => {
  // Skip if hotkey is disabled
  if (!props.hotkey || props.hotkey.trim() === '') {
    return;
  }
  
  // Check for configured hotkey
  const { modifiers, key } = hotkeyConfig.value;
  const keyMatches = 
    event.key.toLowerCase() === key.toLowerCase() ||
    event.code.toLowerCase() === `key${key.toLowerCase()}`;
  
  const modifiersMatch = 
    event.altKey === modifiers.alt &&
    event.ctrlKey === modifiers.ctrl &&
    event.shiftKey === modifiers.shift &&
    event.metaKey === modifiers.meta;
  
  const matchesHotkey = modifiersMatch && keyMatches;
  
  if (matchesHotkey && !isEditableTarget(event.target)) {
    event.preventDefault();
    event.stopPropagation();
    toggleExpanded();
  }
  
  // Escape to close
  if (event.key === 'Escape' && isExpanded.value) {
    event.preventDefault();
    isExpanded.value = false;
  }
};

// Check if target is an editable element
const isEditableTarget = (target) => {
  if (!target) return false;
  const tagName = target.tagName?.toLowerCase();
  const isInput = tagName === 'input' || tagName === 'textarea' || tagName === 'select';
  const isContentEditable = target.contentEditable === 'true';
  return isInput || isContentEditable;
};

onMounted(() => {
  updateViewport();
  window.addEventListener('resize', handleResize);
  window.addEventListener('keydown', handleKeyDown, true);
  
  console.log('Breakpoint Overlay mounted and listening for keyboard shortcuts');
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('keydown', handleKeyDown, true);
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
  }
});

// Watch for breakpoints changes
watch(() => props.breakpoints, () => {
  updateViewport();
}, { deep: true });

// Visual Breakpoint Ruler - Jump to breakpoint
const jumpToBreakpoint = (breakpoint) => {
  if (breakpoint.minWidth !== undefined) {
    // Resize window to breakpoint (note: this may not work in all browsers due to security)
    // As a fallback, we'll just log it and show a message
    console.log(`Would jump to breakpoint: ${breakpoint.minWidth}px`);
    // In a real implementation, you might use browser dev tools API or show instructions
    alert(`To test at ${breakpoint.minWidth}px, resize your browser window or use dev tools.`);
  }
};

// Layout Inspector - Scan for grid/flex containers (optimized async version)
const isScanning = ref(false);
const scanCancelToken = ref(null);

const scanForLayouts = async () => {
  // Cancel any existing scan
  if (scanCancelToken.value) {
    scanCancelToken.value.cancelled = true;
  }
  
  const cancelToken = { cancelled: false };
  scanCancelToken.value = cancelToken;
  
  isScanning.value = true;
  detectedLayouts.value = [];
  
  try {
    // Use async batching to avoid blocking the UI
    const layouts = await scanForLayoutsAsync(cancelToken);
    
    if (!cancelToken.cancelled) {
      // Remove duplicates and nested layouts (keep only top-level)
      const filteredLayouts = layouts.filter((layout, index) => {
        return !layouts.some((other, otherIndex) => {
          if (index >= otherIndex) return false;
          return other.element.contains(layout.element);
        });
      });
      
      detectedLayouts.value = filteredLayouts;
      // Clear old refs when layouts change
      layoutItemRefs.value.clear();
      // Update overlay styles after scan completes (debounced)
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

// Async batched scanning function
const scanForLayoutsAsync = async (cancelToken) => {
  const MAX_ELEMENTS = 2000; // Limit to prevent freezing
  const BATCH_SIZE = 50; // Process in batches
  const MAX_TIME = 2000; // Max 2 seconds
  const startTime = Date.now();
  
  const layouts = [];
  const allElements = Array.from(document.querySelectorAll('*'));
  
  // Limit total elements to scan
  const elementsToScan = allElements.slice(0, MAX_ELEMENTS);
  
  // Process in batches with yield points
  for (let i = 0; i < elementsToScan.length; i += BATCH_SIZE) {
    // Check for cancellation
    if (cancelToken.cancelled) {
      break;
    }
    
    // Check timeout
    if (Date.now() - startTime > MAX_TIME) {
      console.warn('Layout scan timeout - stopping early');
      break;
    }
    
    // Process batch
    const batch = elementsToScan.slice(i, i + BATCH_SIZE);
    
    for (const element of batch) {
      if (cancelToken.cancelled) break;
      
      // Skip hidden elements early (cheap check)
      if (element.offsetParent === null && element !== document.body) {
        continue;
      }
      
      // Skip script, style, and other non-visual elements
      const tagName = element.tagName?.toLowerCase();
      if (['script', 'style', 'meta', 'link', 'noscript', 'template'].includes(tagName)) {
        continue;
      }
      
      try {
        const styles = window.getComputedStyle(element);
        const display = styles.display;
        
        if (display === 'grid' || display === 'flex') {
          const rect = element.getBoundingClientRect();
          
          // Only include visible elements with dimensions
          if (rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight + 1000) {
            // Get layout properties
            const properties = {
              direction: display === 'flex' ? styles.flexDirection : 'grid',
              gap: styles.gap || styles.gridGap || '0',
              alignItems: styles.alignItems || 'stretch',
              justifyContent: styles.justifyContent || 'normal',
            };
            
            // Generate selector
            let selector = element.tagName.toLowerCase();
            if (element.id) {
              selector = `#${element.id}`;
            } else if (element.className) {
              const classes = Array.from(element.classList).slice(0, 2).join('.');
              if (classes) selector += `.${classes}`;
            }
            
            layouts.push({
              element,
              type: display,
              selector,
              properties,
              rect,
            });
          }
        }
      } catch (error) {
        // Skip elements that cause errors (e.g., detached from DOM)
        continue;
      }
    }
    
    // Yield to browser between batches
    if (i + BATCH_SIZE < elementsToScan.length) {
      await new Promise(resolve => {
        if (window.requestIdleCallback) {
          window.requestIdleCallback(resolve, { timeout: 100 });
        } else {
          // Fallback for browsers without requestIdleCallback
          setTimeout(resolve, 0);
        }
      });
    }
  }
  
  return layouts;
};

const onLayoutInspectorToggle = async () => {
  if (showLayoutInspector.value) {
    // Cancel any existing scan
    if (scanCancelToken.value) {
      scanCancelToken.value.cancelled = true;
    }
    
    // Only scan on initial enable (not on every toggle)
    if (detectedLayouts.value.length === 0) {
      await scanForLayouts();
    }
  } else {
    // Cancel scan if in progress
    if (scanCancelToken.value) {
      scanCancelToken.value.cancelled = true;
    }
    
    highlightedLayoutIndex.value = null;
    isScanning.value = false;
  }
};

// Manual refresh function
const refreshLayouts = async () => {
  if (showLayoutInspector.value) {
    await scanForLayouts();
  }
};

// Set layout item ref
const setLayoutItemRef = (el, index) => {
  if (el) {
    layoutItemRefs.value.set(index, el);
  } else {
    layoutItemRefs.value.delete(index);
  }
};

// Select layout item (from overlay click - always selects, doesn't toggle)
const selectLayoutItem = (index) => {
  highlightedLayoutIndex.value = index;
  scrollToLayoutItem(index);
};

// Toggle layout highlight (from list click - can toggle off)
const toggleLayoutHighlight = (index) => {
  if (highlightedLayoutIndex.value === index) {
    highlightedLayoutIndex.value = null;
  } else {
    highlightedLayoutIndex.value = index;
    scrollToLayoutItem(index);
  }
};

// Scroll to layout item in the list
const scrollToLayoutItem = async (index) => {
  // Wait for Vue to update the DOM
  await nextTick();
  
  // Small additional delay to ensure refs are properly set
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

// Generate stable ID for layout
const getLayoutId = (layout, index) => {
  return layout.element.id 
    ? `layout-${layout.element.id}`
    : layout.element.className 
    ? `layout-${index}-${layout.element.className.split(' ')[0]}`
    : `layout-${index}-${layout.element.tagName}`;
};

// Cache overlay styles to prevent flashing
let styleUpdateTimeout = null;
const updateLayoutOverlayStyles = () => {
  // Only update if inspector is enabled and overlay is expanded
  if (!showLayoutInspector.value || !isExpanded.value) {
    return;
  }
  
  if (styleUpdateTimeout) {
    clearTimeout(styleUpdateTimeout);
  }
  
  styleUpdateTimeout = setTimeout(() => {
    // Double-check visibility before updating
    if (!showLayoutInspector.value || !isExpanded.value) {
      return;
    }
    
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
          zIndex: 99997,
        });
      } catch (error) {
        // Skip elements that are no longer in DOM
        console.warn('Layout element no longer available:', error);
      }
    });
    layoutOverlayStyles.value = newStyles;
  }, 100); // Debounce style updates
};

const getLayoutOverlayStyle = (layout, index) => {
  const id = getLayoutId(layout, index);
  return layoutOverlayStyles.value.get(id) || {
    position: 'fixed',
    left: `${layout.rect.left + window.scrollX}px`,
    top: `${layout.rect.top + window.scrollY}px`,
    width: `${layout.rect.width}px`,
    height: `${layout.rect.height}px`,
    zIndex: 99997,
  };
};


// Cancel scan function
const cancelScan = () => {
  if (scanCancelToken.value) {
    scanCancelToken.value.cancelled = true;
  }
  isScanning.value = false;
};

// Cleanup on unmount
onBeforeUnmount(() => {
  if (scanCancelToken.value) {
    scanCancelToken.value.cancelled = true;
  }
  if (styleUpdateTimeout) {
    clearTimeout(styleUpdateTimeout);
  }
});
</script>

<style scoped>
.breakpoint-badge {
  position: fixed;
  bottom: 20px;
  right: 20px;
  min-width: 60px;
  height: 36px;
  border-radius: 18px;
  background: #6366f1;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 99999;
  cursor: pointer;
  transition: all 0.2s;
  opacity: 0.8;
  padding: 0 12px;
  font-size: 12px;
  font-weight: 600;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  pointer-events: auto;
}

.breakpoint-badge:hover {
  opacity: 1;
  transform: scale(1.05);
  background: #818cf8;
}

.badge-label {
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.breakpoint-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99998;
  pointer-events: none;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 20px;
}

.overlay-panel {
  width: 400px;
  max-width: calc(100vw - 40px);
  max-height: calc(100vh - 40px);
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  z-index: 10000;
  pointer-events: auto;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

.dark .overlay-panel {
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
}

.dark .panel-title {
  color: #f1f5f9;
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
  width: 32px;
  height: 32px;
  font-size: 24px;
  line-height: 1;
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

.close-icon {
  font-size: 24px;
  line-height: 1;
}

.breakpoints-list-section,
.visual-indicator-section {
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.dark .breakpoints-list-section,
.dark .visual-indicator-section {
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

.breakpoints-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
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

.viewport-scale {
  position: relative;
  height: 80px;
  margin-top: 8px;
}

.scale-bar {
  position: relative;
  height: 40px;
  background: #f3f4f6;
  border-radius: 6px;
  display: flex;
  overflow: hidden;
}

.dark .scale-bar {
  background: #0f172a;
}

.scale-segment {
  height: 100%;
  border-right: 1px solid #d1d5db;
  transition: all 0.2s;
  position: relative;
}

.dark .scale-segment {
  border-right-color: #334155;
}

.scale-segment.active {
  opacity: 0.6;
}

.viewport-marker {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  transform: translateX(-50%);
  z-index: 10;
}

.marker-line {
  width: 2px;
  height: 100%;
  background: #ef4444;
  box-shadow: 0 0 4px rgba(239, 68, 68, 0.5);
}

.marker-label {
  position: absolute;
  top: -24px;
  left: 50%;
  transform: translateX(-50%);
  background: #ef4444;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
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

kbd {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 11px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  color: #374151;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.1);
}

.dark kbd {
  background: #334155;
  border-color: #475569;
  color: #cbd5e1;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.3);
}

.flex-1 {
  flex: 1;
}

/* Visual Breakpoint Ruler */
.breakpoint-ruler {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-bottom: 2px solid #e5e7eb;
  z-index: 99997;
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

/* Layout Inspector */
.layout-overlays {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99996;
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

.features-section,
.layout-inspector-section {
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.dark .features-section,
.dark .layout-inspector-section {
  border-bottom-color: #334155;
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

.section-actions {
  display: flex;
  gap: 4px;
}

.cancel-scan-button {
  padding: 4px 8px;
  background: #ef4444;
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

.cancel-scan-button:hover {
  background: #dc2626;
}

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

.refresh-button:hover {
  background: #818cf8;
}

/* Copy/Export Tools */
</style>

