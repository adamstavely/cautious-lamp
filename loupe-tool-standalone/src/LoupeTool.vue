<template>
  <!-- Debug: Always show a small indicator when mounted -->
  <div 
    v-if="!isActive" 
    class="loupe-tool-indicator" 
    title="Press Ctrl+Shift+L to activate Loupe Tool (or click here)"
    @click="activateLoupe"
  >
    <ScanEye :size="24" />
  </div>
  
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
          aria-label="Close Loupe Tool"
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

    <!-- Instructions overlay -->
    <div class="instructions-overlay">
      <div class="instructions-content">
        <h3 class="flex items-center gap-2">
          <ScanEye :size="20" class="scan-eye-icon" />
          Loupe Tool Active
        </h3>
        <p>Hover over highlighted components to see details</p>
        <p class="shortcut-hint">Press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>L</kbd> to close</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { ScanEye } from 'lucide-vue-next';

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

const loadComponentMetadata = async () => {
  try {
    const response = await fetch(`${props.apiUrl}/components/metadata`, {
      headers: {
        'Authorization': `Bearer ${props.apiKey || localStorage.getItem('apiKey') || 'dev-key'}`,
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      componentMetadata.value = data;
      console.log('Component metadata loaded:', Object.keys(data).length, 'components');
    }
  } catch (error) {
    console.warn('Failed to load component metadata from API:', error);
    // Fallback to local metadata
    componentMetadata.value = getDefaultMetadata();
  }
};

const getDefaultMetadata = () => {
  return {
    'button': { name: 'Button', path: '@design-system/components/button', icon: 'smart_button', links: { docs: '/components/buttons', github: '', figma: '' } },
    'card': { name: 'Card', path: '@design-system/components/card', icon: 'view_module', links: { docs: '/components/cards', github: '', figma: '' } },
    'input': { name: 'Input', path: '@design-system/components/input', icon: 'input', links: { docs: '/components/forms', github: '', figma: '' } },
    'dropdown': { name: 'Dropdown', path: '@design-system/components/dropdown', icon: 'arrow_drop_down', links: { docs: '/components/forms', github: '', figma: '' } },
    'sidebar': { name: 'Sidebar', path: '@design-system/components/sidebar', icon: 'menu', links: { docs: '/components/navigation', github: '', figma: '' } },
    'topnav': { name: 'Top Navigation', path: '@design-system/components/topnav', icon: 'menu', links: { docs: '/components/navigation', github: '', figma: '' } },
    'breadcrumbs': { name: 'Breadcrumbs', path: '@design-system/components/breadcrumbs', icon: 'navigate_next', links: { docs: '/components/navigation', github: '', figma: '' } },
  };
};

const scanForComponents = () => {
  detectedComponents.value = [];
  
  const elements = document.querySelectorAll('[data-ds-component]');
  
  console.log(`Scanning for components, found ${elements.length} elements with data-ds-component attribute`);
  
  elements.forEach((element) => {
    const componentName = element.getAttribute('data-ds-component');
    const componentPath = element.getAttribute('data-ds-path') || '';
    
    const metadata = componentMetadata.value[componentName?.toLowerCase()] || null;
    
    if (metadata) {
      detectedComponents.value.push({
        element,
        name: metadata.name || componentName,
        path: componentPath || metadata.path || '',
        icon: metadata.icon || 'widgets',
        links: metadata.links || {},
      });
    } else {
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
    console.log('Info panel positioned at:', { x, y });
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
  console.log('Activating Loupe Tool...');
  isActive.value = true;
  document.body.style.overflow = 'hidden';
  scanForComponents();
  
  console.log(`Found ${detectedComponents.value.length} components`);
  
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
  
  console.log('Loupe Tool mounted and listening for keyboard shortcuts');
  
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
  font-size: 18px;
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
  cursor: pointer;
  transition: all 0.2s;
  opacity: 0.7;
}

.loupe-tool-indicator:hover {
  opacity: 1;
  transform: scale(1.1);
  background: #818cf8;
}

.loupe-tool-indicator svg {
  color: white;
}
</style>

