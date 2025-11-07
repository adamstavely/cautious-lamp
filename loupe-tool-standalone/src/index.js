import { createApp } from 'vue';
import LoupeTool from './LoupeTool.vue';

/**
 * Initialize the Loupe Tool in an application
 * @param {Object} options - Configuration options
 * @param {string} options.apiUrl - Design System API URL (default: 'http://localhost:3000/api/v1')
 * @param {string} options.apiKey - API key for authentication (optional)
 * @param {HTMLElement} options.container - Container element to mount the tool (default: document.body)
 */
export function initLoupeTool(options = {}) {
  const {
    apiUrl = 'http://localhost:3000/api/v1',
    apiKey = '',
    container = document.body,
  } = options;

  // Create a container for the Loupe Tool if it doesn't exist
  let toolContainer = document.getElementById('loupe-tool-container');
  if (!toolContainer) {
    toolContainer = document.createElement('div');
    toolContainer.id = 'loupe-tool-container';
    container.appendChild(toolContainer);
  }

  // Create Vue app and mount Loupe Tool
  const app = createApp(LoupeTool, {
    apiUrl,
    apiKey,
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
    const apiUrl = script.getAttribute('data-api-url') || 'http://localhost:3000/api/v1';
    const apiKey = script.getAttribute('data-api-key') || '';
    
    window.loupeTool = initLoupeTool({ apiUrl, apiKey });
  }
}

export default LoupeTool;

