<template>
  <button
    v-if="!isActive"
    type="button"
    class="loupe-tool-indicator"
    :class="{ 'needs-config': metadataState === 'missing-key' }"
    :title="metadataState === 'missing-key' ? 'Loupe Tool: configure apiKey to load component details' : 'Press Ctrl+Shift+L to activate Loupe Tool (or click here)'"
    aria-label="Activate Loupe Tool"
    @click="activateLoupe"
  >
    <ScanEye :size="24" aria-hidden="true" />
  </button>
  
  <div v-if="isActive" class="loupe-tool">
    <!-- Overlay for highlighting components -->
    <div
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
            <component :is="componentIcon(activeComponent.icon)" :size="18" class="component-name-icon" aria-hidden="true" />
            {{ activeComponent.name }}
          </h3>
          <p class="component-path">{{ activeComponent.path }}</p>
        </div>
        <button
          @click="closeLoupe"
          class="close-button"
          aria-label="Close Loupe Tool"
        >
          <X :size="20" aria-hidden="true" />
        </button>
      </div>
      
      <div v-if="hasLinks(activeComponent)" class="info-links">
        <a
          v-if="activeComponent.links.docs"
          :href="activeComponent.links.docs"
          target="_blank"
          rel="noopener noreferrer"
          class="info-link"
        >
          <BookOpen :size="20" aria-hidden="true" />
          <span>View in Style Guide</span>
          <ExternalLink :size="16" class="open-icon" aria-hidden="true" />
        </a>
        <a
          v-if="activeComponent.links.github"
          :href="activeComponent.links.github"
          target="_blank"
          rel="noopener noreferrer"
          class="info-link"
        >
          <Github :size="20" aria-hidden="true" />
          <span>View source</span>
          <ExternalLink :size="16" class="open-icon" aria-hidden="true" />
        </a>
        <a
          v-if="activeComponent.links.figma"
          :href="activeComponent.links.figma"
          target="_blank"
          rel="noopener noreferrer"
          class="info-link"
        >
          <Figma :size="20" aria-hidden="true" />
          <span>View in Figma</span>
          <ExternalLink :size="16" class="open-icon" aria-hidden="true" />
        </a>
      </div>
      <p v-else class="info-empty">{{ metadataNotice || 'No links are configured for this component.' }}</p>
    </div>

    <!-- Instructions overlay -->
    <div class="instructions-overlay">
      <div class="instructions-content">
        <h3 class="flex items-center gap-2">
          <ScanEye :size="20" class="scan-eye-icon" />
          Loupe Tool Active
        </h3>
        <p>Hover over highlighted components to see details</p>
        <p v-if="metadataNotice" class="metadata-notice" role="status">
          <component :is="metadataState === 'missing-key' ? KeyRound : TriangleAlert" :size="16" aria-hidden="true" />
          <span>{{ metadataNotice }}</span>
        </p>
        <p class="shortcut-hint">Press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>L</kbd> to close</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import { BookOpen, ExternalLink, Figma, Github, KeyRound, ScanEye, TriangleAlert, X } from 'lucide-vue-next';
import { describeComponent, fetchComponentMetadata, highlightStyle } from './loupe-core.mjs';
import { componentIcon } from './icons.js';

const props = defineProps({
  apiUrl: {
    type: String,
    default: 'http://localhost:3000/api/v1',
  },
  apiKey: {
    type: String,
    default: '',
  },
});

const isActive = ref(false);
const detectedComponents = ref([]);
const activeComponent = ref(null);
const infoPosition = ref(null);
const componentMetadata = ref({});
// 'loading', 'ready', 'missing-key' or 'error' (see fetchComponentMetadata)
const metadataState = ref('loading');
const metadataError = ref('');

const readStoredKey = () => {
  try {
    return localStorage.getItem('apiKey') || '';
  } catch {
    return '';
  }
};

const loadComponentMetadata = async () => {
  const result = await fetchComponentMetadata(props.apiUrl, props.apiKey || readStoredKey());
  componentMetadata.value = result.metadata;
  metadataState.value = result.status;
  metadataError.value = result.error || '';
};

const metadataNotice = computed(() => {
  if (metadataState.value === 'missing-key') {
    return 'Configure apiKey to load component details. Until then components show only their names.';
  }
  if (metadataState.value === 'error') {
    return `Component details could not be loaded (${metadataError.value}). Components show only their names.`;
  }
  return '';
});

const hasLinks = (component) => Object.keys(component.links).length > 0;

const scanForComponents = () => {
  detectedComponents.value = [];
  
  const elements = document.querySelectorAll('[data-ds-component]');
  
  elements.forEach((element) => {
    detectedComponents.value.push({
      element,
      ...describeComponent(
        element.getAttribute('data-ds-component'),
        element.getAttribute('data-ds-path') || '',
        componentMetadata.value,
      ),
    });
  });
};

// Bumped on scroll and resize so highlights follow their elements between scans
const layoutVersion = ref(0);
const onLayoutChange = () => {
  layoutVersion.value++;
};

const getHighlightStyle = (element) => {
  // Read layoutVersion so Vue re-renders the highlights when it changes
  void layoutVersion.value;
  return highlightStyle(element.getBoundingClientRect());
};

const showInfo = (component, event) => {
  activeComponent.value = component;
  
  setTimeout(() => {
    const rect = component.element.getBoundingClientRect();
    const panelWidth = 320;
    const panelHeight = 200;
    
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
  }, 0);
};

const updateInfoPosition = (component, event) => {
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
  setTimeout(() => {
    const isHoveringComponent = activeComponent.value?.element.matches(':hover');
    const isHoveringPanel = document.querySelector('.info-panel')?.matches(':hover');
    
    if (!isHoveringComponent && !isHoveringPanel) {
      activeComponent.value = null;
      infoPosition.value = null;
    }
  }, 150);
};

const activateLoupe = () => {
  isActive.value = true;
  document.body.style.overflow = 'hidden';
  // Capture: scrolling inside any scroll container moves elements too
  window.addEventListener('scroll', onLayoutChange, true);
  window.addEventListener('resize', onLayoutChange);
  scanForComponents();
  
  
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
  window.removeEventListener('scroll', onLayoutChange, true);
  window.removeEventListener('resize', onLayoutChange);
};

const handleKeyDown = (event) => {
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
  
  if (event.key === 'Escape' && isActive.value) {
    event.preventDefault();
    closeLoupe();
  }
};

onMounted(async () => {
  window.addEventListener('keydown', handleKeyDown, true);
  
  
  await loadComponentMetadata();
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown, true);
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

.info-link svg {
  flex-shrink: 0;
}

.open-icon {
  margin-left: auto;
  opacity: 0.6;
}

.info-empty {
  margin: 0;
  padding: 12px 16px;
  font-size: 13px;
  color: #6b7280;
}

.dark .info-empty {
  color: #94a3b8;
}

.metadata-notice {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  color: #b45309;
}

.metadata-notice svg {
  flex-shrink: 0;
  margin-top: 2px;
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

.loupe-tool-indicator {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #6366f1;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 9997;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all 0.2s;
  opacity: 0.7;
}

.loupe-tool-indicator:hover {
  opacity: 1;
  transform: scale(1.1);
  background: #818cf8;
}

.loupe-tool-indicator.needs-config {
  background: #b45309;
}

.loupe-tool-indicator svg {
  color: white;
}
</style>

