import { computed, ref } from 'vue';
import apiClient from '../services/api.js';

/**
 * Components and patterns with their lifecycle status, from the server:
 * components from GET /api/v1/components (only those the caller may see),
 * patterns from GET /patterns-library/patterns. Status changes are saved
 * there too (component:edit, pattern:edit; docs/AUTH.md).
 */

/** Lifecycle stages, the same for components and patterns (COMPONENT_STATUSES on the server) */
export const STATUSES = [
  { value: 'production', label: 'Production ready', icon: 'circle-check', tone: 'success' },
  { value: 'in-progress', label: 'In progress', icon: 'loader-circle', tone: 'accent' },
  { value: 'planned', label: 'Planned', icon: 'calendar-check', tone: 'info' },
  { value: 'deprecated', label: 'Deprecated', icon: 'triangle-alert', tone: 'danger' },
];

export const STATUS_OPTIONS = STATUSES.map(({ value, label }) => ({ value, label }));

export const statusLabel = (status) => STATUSES.find((s) => s.value === status)?.label ?? status ?? 'Unknown';
export const statusTone = (status) => STATUSES.find((s) => s.value === status)?.tone ?? 'neutral';

/** Pattern categories the patterns library accepts */
export const PATTERN_CATEGORIES = [
  { value: 'common', label: 'Common' },
  { value: 'best-practice', label: 'Best practice' },
  { value: 'anti-pattern', label: 'Anti-pattern' },
  { value: 'accessibility', label: 'Accessibility' },
  { value: 'performance', label: 'Performance' },
  { value: 'composition', label: 'Composition' },
];

export const categoryLabel = (category) => PATTERN_CATEGORIES.find((c) => c.value === category)?.label ?? category;

// Components and patterns with a documentation page of their own
const COMPONENT_PAGES = { button: '/components/buttons', 'color-picker': '/components/color-picker' };
const PATTERN_PAGES = new Set([
  'navigation',
  'notifications',
  'data-display',
  'layout',
  'forms',
  'feedback',
  'form-validation',
  'accessible-modal',
  'sortable-data-table',
  'login-form',
  'responsive-navigation',
  'toast-notification',
]);

const slug = (name) => String(name).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** The component's documentation page, or null when it has none */
export const componentPage = (id) => COMPONENT_PAGES[id] ?? null;
/** The pattern's guidance page, or null when it has none */
export const patternPage = (name) => (PATTERN_PAGES.has(slug(name)) ? `/patterns/${slug(name)}` : null);

export const toComponentId = slug;

export function useComponentPatternStatus() {
  const components = ref([]);
  const patterns = ref([]);
  const loadingComponents = ref(false);
  const loadingPatterns = ref(false);
  const componentsError = ref(null);
  const patternsError = ref(null);

  const loadComponents = async () => {
    loadingComponents.value = true;
    componentsError.value = null;
    try {
      const { data } = await apiClient.get('/api/v1/components');
      components.value = [...(data.components ?? [])].sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      componentsError.value = error;
    } finally {
      loadingComponents.value = false;
    }
  };

  const loadPatterns = async () => {
    loadingPatterns.value = true;
    patternsError.value = null;
    try {
      const { data } = await apiClient.get('/patterns-library/patterns');
      patterns.value = Array.isArray(data) ? data : [];
    } catch (error) {
      patternsError.value = error;
    } finally {
      loadingPatterns.value = false;
    }
  };

  const replace = (list, item) => {
    list.value = list.value.map((existing) => (existing.id === item.id ? item : existing));
    return item;
  };

  /** Puts a created or changed item into the list, keeping it sorted by name */
  const upsert = (list, item) => {
    const others = list.value.filter((existing) => existing.id !== item.id);
    list.value = [...others, item].sort((a, b) => a.name.localeCompare(b.name));
    return item;
  };

  /** Saves the status; the server's copy replaces the local one. Errors reach the caller. */
  const updateComponentStatus = async (id, status) => {
    const { data } = await apiClient.put(`/api/v1/components/${encodeURIComponent(id)}/status`, { status });
    return replace(components, data);
  };

  const updatePatternStatus = async (id, status) => {
    const { data } = await apiClient.put(`/patterns-library/patterns/${encodeURIComponent(id)}`, { status });
    return replace(patterns, data);
  };

  return {
    components: computed(() => components.value),
    patterns: computed(() => patterns.value),
    loadingComponents,
    loadingPatterns,
    componentsError,
    patternsError,
    loadComponents,
    loadPatterns,
    updateComponentStatus,
    updatePatternStatus,
    upsertComponent: (item) => upsert(components, item),
    upsertPattern: (item) => upsert(patterns, item),
  };
}

/** One component's status, for the chip on its documentation page; null until loaded or if it isn't in the library */
export function useComponentStatus(id) {
  const component = ref(null);
  apiClient
    .get(`/api/v1/components/${encodeURIComponent(id)}`)
    .then(({ data }) => {
      component.value = data;
    })
    .catch(() => {
      component.value = null;
    });
  return computed(() => (component.value ? { value: component.value.status, label: statusLabel(component.value.status), tone: statusTone(component.value.status) } : null));
}
