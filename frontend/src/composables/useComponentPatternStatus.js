import { ref, computed, watch } from 'vue';

// Shared state for component and pattern statuses
const components = ref([]);
const patterns = ref([]);

// Initialize from localStorage or use defaults
const STORAGE_KEY_COMPONENTS = 'ds_components_status';
const STORAGE_KEY_PATTERNS = 'ds_patterns_status';

// Default component data
const defaultComponents = [
  { name: 'Button', icon: 'smart_button', status: 'Production Ready', version: '1.0.0', documentation: 'Complete', lastUpdated: '2024-01-15' },
  { name: 'Input', icon: 'input', status: 'Production Ready', version: '1.0.0', documentation: 'Complete', lastUpdated: '2024-01-10' },
  { name: 'Card', icon: 'view_module', status: 'Production Ready', version: '1.0.0', documentation: 'Complete', lastUpdated: '2024-01-12' },
  { name: 'Modal', icon: 'fullscreen', status: 'Production Ready', version: '1.0.0', documentation: 'Complete', lastUpdated: '2024-01-08' },
  { name: 'Dropdown', icon: 'arrow_drop_down', status: 'Production Ready', version: '1.0.0', documentation: 'Complete', lastUpdated: '2024-01-05' },
  { name: 'Checkbox', icon: 'check_box', status: 'Production Ready', version: '1.0.0', documentation: 'Complete', lastUpdated: '2024-01-03' },
  { name: 'Radio', icon: 'radio_button_checked', status: 'Production Ready', version: '1.0.0', documentation: 'Complete', lastUpdated: '2024-01-02' },
  { name: 'Switch', icon: 'toggle_on', status: 'Production Ready', version: '1.0.0', documentation: 'Complete', lastUpdated: '2023-12-28' },
  { name: 'Color Picker', icon: 'pipette', status: 'Production Ready', version: '1.0.0', documentation: 'Complete', lastUpdated: '2024-01-15' },
  { name: 'Tabs', icon: 'tab', status: 'In Progress', version: '0.9.0', documentation: 'Partial', lastUpdated: '2024-01-20' },
  { name: 'Accordion', icon: 'expand_more', status: 'In Progress', version: '0.8.0', documentation: 'Partial', lastUpdated: '2024-01-18' },
  { name: 'Tooltip', icon: 'info', status: 'In Progress', version: '0.7.0', documentation: 'Partial', lastUpdated: '2024-01-16' },
  { name: 'Popover', icon: 'open_in_new', status: 'In Progress', version: '0.6.0', documentation: 'Partial', lastUpdated: '2024-01-14' },
  { name: 'Breadcrumbs', icon: 'navigate_next', status: 'Planned', version: '-', documentation: 'Not Started', lastUpdated: '-' },
  { name: 'Pagination', icon: 'more_horiz', status: 'Planned', version: '-', documentation: 'Not Started', lastUpdated: '-' },
  { name: 'Data Table', icon: 'table_chart', status: 'Planned', version: '-', documentation: 'Not Started', lastUpdated: '-' },
];

// Default pattern data
const defaultPatterns = [
  // Design Patterns
  { name: 'Layout', icon: 'view_quilt', type: 'Design Pattern', status: 'Production Ready', category: 'Layout', documentation: 'Complete', lastUpdated: '2024-01-15', route: '/patterns/layout' },
  { name: 'Navigation', icon: 'navigation', type: 'Design Pattern', status: 'Production Ready', category: 'Navigation', documentation: 'Complete', lastUpdated: '2024-01-12', route: '/patterns/navigation' },
  { name: 'Data Display', icon: 'table_chart', type: 'Design Pattern', status: 'Production Ready', category: 'Data Display', documentation: 'Complete', lastUpdated: '2024-01-10', route: '/patterns/data-display' },
  { name: 'Forms', icon: 'description', type: 'Design Pattern', status: 'Production Ready', category: 'Forms', documentation: 'Complete', lastUpdated: '2024-01-08', route: '/patterns/forms' },
  { name: 'Feedback', icon: 'feedback', type: 'Design Pattern', status: 'Production Ready', category: 'Feedback', documentation: 'Complete', lastUpdated: '2024-01-05', route: '/patterns/feedback' },
  
  // Code Patterns
  { name: 'Form Validation', icon: 'verified', type: 'Code Pattern', status: 'Production Ready', category: 'Forms', documentation: 'Complete', lastUpdated: '2024-01-20', route: '/patterns/form-validation' },
  { name: 'Accessible Modal', icon: 'fullscreen', type: 'Code Pattern', status: 'Production Ready', category: 'Feedback', documentation: 'Complete', lastUpdated: '2024-01-18', route: '/patterns/accessible-modal' },
  { name: 'Sortable Data Table', icon: 'sort', type: 'Code Pattern', status: 'Production Ready', category: 'Data Display', documentation: 'Complete', lastUpdated: '2024-01-16', route: '/patterns/sortable-data-table' },
  { name: 'Login Form', icon: 'lock', type: 'Code Pattern', status: 'Production Ready', category: 'Authentication', documentation: 'Complete', lastUpdated: '2024-01-14', route: '/patterns/login-form' },
  { name: 'Responsive Navigation', icon: 'menu', type: 'Code Pattern', status: 'In Progress', category: 'Navigation', documentation: 'Partial', lastUpdated: '2024-01-22', route: '/patterns/responsive-navigation' },
  { name: 'Toast Notification', icon: 'notifications', type: 'Code Pattern', status: 'Production Ready', category: 'Feedback', documentation: 'Complete', lastUpdated: '2024-01-12', route: '/patterns/toast-notification' },
  
  // Planned Patterns
  { name: 'Dashboard Layout', icon: 'dashboard', type: 'Design Pattern', status: 'Planned', category: 'Layout', documentation: 'Not Started', lastUpdated: '-', route: '/patterns' },
  { name: 'Search Interface', icon: 'search', type: 'Design Pattern', status: 'Planned', category: 'Navigation', documentation: 'Not Started', lastUpdated: '-', route: '/patterns' },
  { name: 'Data Visualization', icon: 'bar_chart', type: 'Design Pattern', status: 'Planned', category: 'Data Display', documentation: 'Not Started', lastUpdated: '-', route: '/patterns' },
];

// Load from localStorage
const loadFromStorage = () => {
  try {
    const storedComponents = localStorage.getItem(STORAGE_KEY_COMPONENTS);
    const storedPatterns = localStorage.getItem(STORAGE_KEY_PATTERNS);
    
    if (storedComponents) {
      const parsed = JSON.parse(storedComponents);
      // Merge with defaults to ensure all components exist
      const merged = defaultComponents.map(defaultComp => {
        const stored = parsed.find(c => c.name === defaultComp.name);
        return stored ? { ...defaultComp, ...stored } : defaultComp;
      });
      components.value = merged;
    } else {
      components.value = [...defaultComponents];
    }
    
    if (storedPatterns) {
      const parsed = JSON.parse(storedPatterns);
      // Merge with defaults to ensure all patterns exist
      const merged = defaultPatterns.map(defaultPattern => {
        const stored = parsed.find(p => p.name === defaultPattern.name);
        return stored ? { ...defaultPattern, ...stored } : defaultPattern;
      });
      patterns.value = merged;
    } else {
      patterns.value = [...defaultPatterns];
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    components.value = [...defaultComponents];
    patterns.value = [...defaultPatterns];
  }
};

// Save to localStorage
const saveToStorage = () => {
  try {
    localStorage.setItem(STORAGE_KEY_COMPONENTS, JSON.stringify(components.value));
    localStorage.setItem(STORAGE_KEY_PATTERNS, JSON.stringify(patterns.value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

// Watch for changes and save
watch(components, () => {
  saveToStorage();
}, { deep: true });

watch(patterns, () => {
  saveToStorage();
}, { deep: true });

// Initialize on first import
loadFromStorage();

export function useComponentPatternStatus() {
  // Update component status
  const updateComponentStatus = (componentName, newStatus) => {
    const component = components.value.find(c => c.name === componentName);
    if (component) {
      component.status = newStatus;
      // Trigger reactivity
      components.value = [...components.value];
    }
  };

  // Update pattern status
  const updatePatternStatus = (patternName, newStatus) => {
    const pattern = patterns.value.find(p => p.name === patternName);
    if (pattern) {
      pattern.status = newStatus;
      // Trigger reactivity
      patterns.value = [...patterns.value];
    }
  };

  // Get component by name
  const getComponent = (componentName) => {
    return components.value.find(c => c.name === componentName);
  };

  // Get pattern by name
  const getPattern = (patternName) => {
    return patterns.value.find(p => p.name === patternName);
  };

  return {
    components: computed(() => components.value),
    patterns: computed(() => patterns.value),
    updateComponentStatus,
    updatePatternStatus,
    getComponent,
    getPattern,
    refresh: loadFromStorage
  };
}

