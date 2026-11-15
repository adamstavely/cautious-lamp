import { createApp } from 'vue';
import BreakpointOverlay from './BreakpointOverlay.vue';
import { DEFAULT_DEBOUNCE_MS, DEFAULT_HOTKEY, autoInitOptions, defaultBreakpoints } from './breakpoint-core.mjs';

/**
 * Initialize the Breakpoint Overlay in an application
 * @param {Object} options - Configuration options
 * @param {Array} options.breakpoints - Array of breakpoint definitions (default: Tailwind breakpoints)
 * @param {string} options.hotkey - Keyboard shortcut in modifier+...+key form (default: 'alt+shift+o'; '' disables it)
 * @param {number} options.debounceMs - Debounce interval for resize events in ms (default: 150)
 * @param {Function} options.onSelect - Called with `{ breakpoint, mediaQuery, copied }` when a ruler marker is clicked
 * @param {HTMLElement} options.container - Container element to mount the tool (default: document.body)
 * @returns {Object} Handle with destroy method
 */
export function initBreakpointOverlay(options = {}) {
  const {
    breakpoints = defaultBreakpoints(),
    hotkey = DEFAULT_HOTKEY,
    debounceMs = DEFAULT_DEBOUNCE_MS,
    onSelect,
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
    ...(onSelect ? { onSelect } : {}),
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
  const script = document.currentScript;
  if (script && script.hasAttribute('data-auto-init')) {
    window.breakpointOverlay = initBreakpointOverlay(autoInitOptions(script));
  }
}

export { BreakpointOverlay };
export default BreakpointOverlay;
