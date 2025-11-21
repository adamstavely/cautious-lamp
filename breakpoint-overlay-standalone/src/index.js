import { createApp } from 'vue';
import BreakpointOverlay from './BreakpointOverlay.vue';

/**
 * Initialize the Breakpoint Overlay in an application
 * @param {Object} options - Configuration options
 * @param {Array} options.breakpoints - Array of breakpoint definitions (default: Tailwind breakpoints)
 * @param {string} options.hotkey - Keyboard shortcut in modifier+...+key form (default: 'alt+shift+o')
 * @param {number} options.debounceMs - Debounce interval for resize events in ms (default: 150)
 * @param {HTMLElement} options.container - Container element to mount the tool (default: document.body)
 * @returns {Object} Handle with destroy method
 */
export function initBreakpointOverlay(options = {}) {
  const {
    breakpoints = [
      { id: 'sm', label: 'Small', minWidth: 640 },
      { id: 'md', label: 'Medium', minWidth: 768 },
      { id: 'lg', label: 'Large', minWidth: 1024 },
      { id: 'xl', label: 'Extra Large', minWidth: 1280 },
      { id: '2xl', label: '2X Large', minWidth: 1536 },
    ],
    hotkey = 'alt+shift+o',
    debounceMs = 150,
    container = document.body,
  } = options;

  // Create a container for the Breakpoint Overlay if it doesn't exist
  let toolContainer = document.getElementById('breakpoint-overlay-container');
  if (!toolContainer) {
    toolContainer = document.createElement('div');
    toolContainer.id = 'breakpoint-overlay-container';
    container.appendChild(toolContainer);
  }

  // Create Vue app and mount Breakpoint Overlay
  const app = createApp(BreakpointOverlay, {
    breakpoints,
    hotkey,
    debounceMs,
  });

  app.mount(toolContainer);

  return {
    destroy: () => {
      app.unmount();
      if (toolContainer && toolContainer.parentNode) {
        toolContainer.parentNode.removeChild(toolContainer);
      }
    },
  };
}

// Auto-initialize if script is loaded directly
if (typeof window !== 'undefined') {
  // Check for auto-init attribute
  const script = document.currentScript;
  if (script && script.hasAttribute('data-auto-init')) {
    // Parse breakpoints from data attribute if provided
    let breakpoints = [
      { id: 'sm', label: 'Small', minWidth: 640 },
      { id: 'md', label: 'Medium', minWidth: 768 },
      { id: 'lg', label: 'Large', minWidth: 1024 },
      { id: 'xl', label: 'Extra Large', minWidth: 1280 },
      { id: '2xl', label: '2X Large', minWidth: 1536 },
    ];
    
    const breakpointsAttr = script.getAttribute('data-breakpoints');
    if (breakpointsAttr) {
      try {
        breakpoints = JSON.parse(breakpointsAttr);
      } catch (e) {
        console.warn('Failed to parse data-breakpoints attribute:', e);
      }
    }
    
    const hotkey = script.getAttribute('data-hotkey') || 'alt+shift+o';
    const debounceMs = parseInt(script.getAttribute('data-debounce-ms') || '150', 10);
    
    window.breakpointOverlay = initBreakpointOverlay({
      breakpoints,
      hotkey,
      debounceMs,
    });
  }
}

export default BreakpointOverlay;

