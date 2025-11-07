// Component Metadata Service
// Stores metadata for design system components including links to docs, GitHub, and Figma

const componentMetadata = {
  'button': {
    name: 'Button',
    path: '@design-system/components/button',
    icon: 'smart_button',
    links: {
      docs: '/components/buttons',
      github: 'https://github.com/your-org/design-system/tree/main/packages/components/src/Button',
      figma: 'https://www.figma.com/file/your-design-system/components#button',
    },
  },
  'card': {
    name: 'Card',
    path: '@design-system/components/card',
    icon: 'view_module',
    links: {
      docs: '/components/cards',
      github: 'https://github.com/your-org/design-system/tree/main/packages/components/src/Card',
      figma: 'https://www.figma.com/file/your-design-system/components#card',
    },
  },
  'input': {
    name: 'Input',
    path: '@design-system/components/input',
    icon: 'input',
    links: {
      docs: '/components/forms',
      github: 'https://github.com/your-org/design-system/tree/main/packages/components/src/Input',
      figma: 'https://www.figma.com/file/your-design-system/components#input',
    },
  },
  'dropdown': {
    name: 'Dropdown',
    path: '@design-system/components/dropdown',
    icon: 'arrow_drop_down',
    links: {
      docs: '/components/forms',
      github: 'https://github.com/your-org/design-system/tree/main/packages/components/src/Dropdown',
      figma: 'https://www.figma.com/file/your-design-system/components#dropdown',
    },
  },
  'navigation': {
    name: 'Navigation',
    path: '@design-system/components/navigation',
    icon: 'navigation',
    links: {
      docs: '/components/navigation',
      github: 'https://github.com/your-org/design-system/tree/main/packages/components/src/Navigation',
      figma: 'https://www.figma.com/file/your-design-system/components#navigation',
    },
  },
  'sidebar': {
    name: 'Sidebar',
    path: '@design-system/components/sidebar',
    icon: 'menu',
    links: {
      docs: '/components/navigation',
      github: 'https://github.com/your-org/design-system/tree/main/packages/components/src/Sidebar',
      figma: 'https://www.figma.com/file/your-design-system/components#sidebar',
    },
  },
  'topnav': {
    name: 'Top Navigation',
    path: '@design-system/components/topnav',
    icon: 'menu',
    links: {
      docs: '/components/navigation',
      github: 'https://github.com/your-org/design-system/tree/main/packages/components/src/TopNav',
      figma: 'https://www.figma.com/file/your-design-system/components#topnav',
    },
  },
  'breadcrumbs': {
    name: 'Breadcrumbs',
    path: '@design-system/components/breadcrumbs',
    icon: 'navigate_next',
    links: {
      docs: '/components/navigation',
      github: 'https://github.com/your-org/design-system/tree/main/packages/components/src/Breadcrumbs',
      figma: 'https://www.figma.com/file/your-design-system/components#breadcrumbs',
    },
  },
  'table': {
    name: 'Table',
    path: '@design-system/components/table',
    icon: 'table_chart',
    links: {
      docs: '/components/data-display',
      github: 'https://github.com/your-org/design-system/tree/main/packages/components/src/Table',
      figma: 'https://www.figma.com/file/your-design-system/components#table',
    },
  },
  'modal': {
    name: 'Modal',
    path: '@design-system/components/modal',
    icon: 'fullscreen',
    links: {
      docs: '/components/overlays',
      github: 'https://github.com/your-org/design-system/tree/main/packages/components/src/Modal',
      figma: 'https://www.figma.com/file/your-design-system/components#modal',
    },
  },
  'tooltip': {
    name: 'Tooltip',
    path: '@design-system/components/tooltip',
    icon: 'info',
    links: {
      docs: '/components/overlays',
      github: 'https://github.com/your-org/design-system/tree/main/packages/components/src/Tooltip',
      figma: 'https://www.figma.com/file/your-design-system/components#tooltip',
    },
  },
  'drawer': {
    name: 'Drawer',
    path: '@design-system/components/drawer',
    icon: 'left_panel_close',
    links: {
      docs: '/components/overlays',
      github: 'https://github.com/your-org/design-system/tree/main/packages/components/src/Drawer',
      figma: 'https://www.figma.com/file/your-design-system/components#drawer',
    },
  },
};

export const componentMetadataService = {
  /**
   * Get metadata for a component by name
   * @param {string} componentName - The component name (e.g., 'button', 'card')
   * @returns {Object|null} Component metadata or null if not found
   */
  getComponentMetadata(componentName) {
    if (!componentName) return null;
    return componentMetadata[componentName.toLowerCase()] || null;
  },

  /**
   * Register or update component metadata
   * @param {string} componentName - The component name
   * @param {Object} metadata - Component metadata
   */
  registerComponent(componentName, metadata) {
    componentMetadata[componentName.toLowerCase()] = {
      name: metadata.name || componentName,
      path: metadata.path || '',
      icon: metadata.icon || 'widgets',
      links: {
        docs: metadata.links?.docs || '',
        github: metadata.links?.github || '',
        figma: metadata.links?.figma || '',
      },
    };
  },

  /**
   * Get all registered components
   * @returns {Object} All component metadata
   */
  getAllComponents() {
    return componentMetadata;
  },

  /**
   * Load component metadata from API
   * This can be used to fetch metadata from the backend
   */
  async loadFromAPI() {
    try {
      const response = await fetch('http://localhost:3000/api/v1/component-metadata', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('apiKey') || 'dev-key'}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        // Merge API data with local metadata
        Object.entries(data).forEach(([name, metadata]) => {
          this.registerComponent(name, metadata);
        });
      }
    } catch (error) {
      console.warn('Failed to load component metadata from API:', error);
      // Continue with local metadata
    }
  },
};

