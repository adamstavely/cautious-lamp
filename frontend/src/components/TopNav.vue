<template>
  <nav
    data-ds-component="topnav"
    data-ds-path="@design-system/components/topnav"
    class="topnav"
    role="navigation"
    aria-label="Top navigation"
  >
    <div class="flex items-center h-topbar">
      <!-- Phones: the side nav opens as a menu -->
      <button
        type="button"
        class="icon-btn phone-only ml-2"
        aria-label="Open menu"
        aria-controls="phone-nav"
        :aria-expanded="phoneNavOpen ? 'true' : 'false'"
        @click="phoneNavOpen = true"
      >
        <AppIcon name="menu" class="text-xl" />
      </button>
      <!-- Site title -->
      <router-link to="/" class="brand group" aria-label="DESIGN.COM home">
        <!-- Two carets, the right one overlapping the left by 25% -->
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="brand-mark"
          aria-hidden="true"
        >
          <path d="M10 6 L6 12 L10 18" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none" />
          <path d="M13 6 L17 12 L13 18" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none" />
        </svg>
        <span class="brand-name">DESIGN.COM</span>
      </router-link>

      <!-- Center search bar; on phones it opens over the bar from the search button -->
      <div class="search-area" :class="{ 'search-area-open': mobileSearchOpen }">
        <div class="w-full max-w-2xl sm:mx-8 flex items-center gap-1">
          <div class="relative flex-1 min-w-0" ref="searchContainer">
            <AppIcon name="search" class="search-icon" />
            <input
              ref="searchInput"
              v-model="searchQuery"
              type="search"
              placeholder="Search components, tokens, patterns…"
              @focus="showSearchResults = true"
              @input="performSearch"
              @keydown.escape="closeMobileSearch(); closeSearch()"
              @keydown.down.prevent="navigateSearchResults(1)"
              @keydown.up.prevent="navigateSearchResults(-1)"
              @keydown.enter.prevent="selectSearchResult"
              class="search-input"
              aria-label="Search design system"
              role="combobox"
              aria-autocomplete="list"
              aria-controls="top-search-results"
              :aria-expanded="resultsOpen ? 'true' : 'false'"
              :aria-activedescendant="resultsOpen && selectedSearchIndex >= 0 ? `top-search-option-${selectedSearchIndex}` : undefined"
            />
            <UiAnnounce :text="resultsAnnouncement" />
            <button
              v-if="searchQuery"
              type="button"
              ref="filtersToggle"
              @click="showAdvancedFilters = !showAdvancedFilters"
              class="search-filters-toggle"
              title="Advanced filters"
              aria-label="Advanced filters"
              :aria-expanded="showAdvancedFilters ? 'true' : 'false'"
            >
              <AppIcon name="sliders-horizontal" class="text-base" />
            </button>

            <!-- Advanced filters panel; Escape closes it and returns to its button -->
            <div v-if="showAdvancedFilters" class="popover p-4" @keydown.escape.stop="closeFilters">
              <div class="space-y-3">
                <div>
                  <p class="filter-label">Type</p>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="type in availableFilters?.types || []"
                      :key="type.value"
                      type="button"
                      @click="toggleSearchFilter('type', type.value)"
                      class="filter-chip"
                      :class="{ 'filter-chip-on': searchFilters.type?.includes(type.value) }"
                      :aria-pressed="searchFilters.type?.includes(type.value) ? 'true' : 'false'"
                    >
                      {{ type.label }} ({{ type.count }})
                    </button>
                  </div>
                </div>
                <div>
                  <p class="filter-label">Category</p>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="cat in availableFilters?.categories?.slice(0, 8) || []"
                      :key="cat.value"
                      type="button"
                      @click="toggleSearchFilter('category', cat.value)"
                      class="filter-chip"
                      :class="{ 'filter-chip-on': searchFilters.category?.includes(cat.value) }"
                      :aria-pressed="searchFilters.category?.includes(cat.value) ? 'true' : 'false'"
                    >
                      {{ cat.label }} ({{ cat.count }})
                    </button>
                  </div>
                </div>
                <div>
                  <p class="filter-label">Has Props</p>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="prop in availableFilters?.commonProps?.slice(0, 6) || []"
                      :key="prop.value"
                      type="button"
                      @click="toggleSearchFilter('hasProps', prop.value)"
                      class="filter-chip"
                      :class="{ 'filter-chip-on': searchFilters.hasProps?.includes(prop.value) }"
                      :aria-pressed="searchFilters.hasProps?.includes(prop.value) ? 'true' : 'false'"
                    >
                      {{ prop.label }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Search results dropdown -->
            <div v-if="resultsOpen" class="popover overflow-hidden">
              <div class="overflow-y-auto max-h-96">
                <div v-if="filteredSearchResults.length === 0 && searchQuery.trim()" class="p-8 text-center">
                  <AppIcon name="search-x" class="text-5xl mb-3 text-ink-disabled" />
                  <p class="text-sm font-medium mb-1 text-ink-secondary">No results found</p>
                  <p class="text-xs text-ink-muted">Try a different search term</p>
                </div>

                <!-- The input owns focus; options are reached with the arrow keys (aria-activedescendant), not Tab -->
                <div v-else-if="filteredSearchResults.length > 0" id="top-search-results" class="divide-y divide-line" role="listbox" aria-label="Search results">
                  <router-link
                    v-for="(result, index) in filteredSearchResults"
                    :id="`top-search-option-${index}`"
                    :key="result.id"
                    :to="result.path"
                    @click="finishSearch"
                    class="popover-row block px-4 py-3"
                    :class="{ 'popover-row-on': selectedSearchIndex === index }"
                    role="option"
                    tabindex="-1"
                    :aria-selected="selectedSearchIndex === index ? 'true' : 'false'"
                  >
                    <div class="flex items-start gap-3">
                      <div class="result-icon">
                        <AppIcon :name="result.icon" class="text-lg" />
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                          <h4 class="text-sm font-semibold text-ink-strong">{{ result.title }}</h4>
                          <UiChip :tone="getCategoryTone(result.category)">{{ result.category }}</UiChip>
                        </div>
                        <p class="text-xs mb-1 line-clamp-1 text-ink-secondary">{{ result.description }}</p>
                        <p class="text-xs text-ink-muted">{{ result.path }}</p>
                      </div>
                    </div>
                  </router-link>
                </div>

                <!-- Empty state (no query) -->
                <div v-else class="p-6">
                  <p class="text-sm text-center text-ink-secondary">Start typing to search...</p>
                </div>
              </div>
            </div>
          </div>
          <button v-if="mobileSearchOpen" type="button" class="icon-btn phone-only" aria-label="Close search" @click="closeMobileSearch">
            <AppIcon name="x" />
          </button>
        </div>
      </div>

      <!-- Right actions -->
      <div class="nav-actions">
        <button
          ref="mobileSearchButton"
          type="button"
          class="icon-btn phone-only"
          aria-label="Search"
          :aria-expanded="mobileSearchOpen ? 'true' : 'false'"
          @click="openMobileSearch"
        >
          <AppIcon name="search" />
        </button>

        <!-- Feedback (in the account menu on phones) -->
        <router-link to="/feedback" class="icon-btn wide-only" title="Roadmap and feedback" aria-label="View roadmap and submit feedback">
          <AppIcon name="badge-alert" />
        </router-link>

        <!-- Notifications: the signed-in person's own, from the API -->
        <div class="relative" ref="notificationsContainer" @keydown.esc.stop="closeNotifications(true)">
          <button
            ref="notificationsButton"
            type="button"
            @click="toggleNotifications"
            class="icon-btn"
            title="Notifications"
            :aria-label="`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`"
            :aria-expanded="showNotifications ? 'true' : 'false'"
            aria-haspopup="dialog"
            aria-controls="notifications-panel"
          >
            <AppIcon name="bell" />
            <span
              v-if="unreadCount > 0"
              class="count-badge"
              :class="hasUnreadBreaking ? 'count-badge-danger' : 'count-badge-accent'"
              aria-hidden="true"
            >
              {{ unreadCount > 9 ? '9+' : unreadCount }}
            </span>
          </button>

          <div
            v-if="showNotifications"
            id="notifications-panel"
            class="popover popover-end overflow-hidden"
            role="dialog"
            aria-labelledby="notifications-panel-title"
          >
            <div class="px-4 py-3 border-b border-line flex items-center justify-between gap-2">
              <h2 id="notifications-panel-title" class="font-semibold text-lg text-ink-strong">Notifications</h2>
              <div class="flex items-center gap-1">
                <UiButton v-if="unreadCount > 0" variant="ghost" size="sm" icon="check-check" :loading="markingAll" @click="markAllNotificationsRead">
                  Mark all read
                </UiButton>
                <button type="button" @click="closeNotifications(true)" class="close-btn" aria-label="Close notifications">
                  <AppIcon name="x" class="text-xl" />
                </button>
              </div>
            </div>

            <div class="max-h-96 overflow-y-auto">
              <p v-if="notificationsError && !notificationsLoaded" class="p-6 text-sm text-ink-secondary" role="alert">
                Notifications couldn't be loaded. Try again later.
              </p>
              <div v-else-if="!notificationsLoaded" class="flex justify-center p-8">
                <UiSpinner label="Loading notifications…" />
              </div>
              <div v-else-if="notifications.length === 0" class="p-8 text-center">
                <AppIcon name="bell-off" class="text-4xl mb-3 block text-ink-disabled" />
                <p class="text-sm font-medium text-ink-strong">No notifications</p>
                <p class="text-sm text-ink-muted mt-1">Follow components, tokens or patterns to hear when they change.</p>
              </div>
              <ul v-else class="divide-y divide-line">
                <li v-for="notification in recentNotifications" :key="notification.id">
                  <button
                    type="button"
                    class="popover-row notif-row"
                    :class="{ 'notif-row-unread': !notification.read }"
                    @click="openNotification(notification)"
                  >
                    <span class="activity-icon" :class="`activity-icon-${notification.breaking ? 'danger' : 'accent'}`" aria-hidden="true">
                      <AppIcon :name="notificationIcon(notification)" class="text-base" />
                    </span>
                    <span class="flex-1 min-w-0">
                      <span class="flex items-center gap-2 mb-1">
                        <span class="text-sm font-semibold truncate text-ink-strong">{{ notification.title }}</span>
                        <UiChip v-if="notification.breaking" tone="danger">Breaking</UiChip>
                      </span>
                      <span class="block text-sm mb-1 line-clamp-2 text-ink-secondary">{{ notification.message }}</span>
                      <span class="block text-xs text-ink-muted">
                        {{ formatRelativeTime(notification.createdAt) }}<span v-if="!notification.read" class="sr-only">, unread</span>
                      </span>
                    </span>
                    <span v-if="!notification.read" class="unread-dot" aria-hidden="true"></span>
                  </button>
                </li>
              </ul>
              <p v-if="notificationActionError" class="px-4 py-2 text-sm text-danger" role="alert">{{ notificationActionError }}</p>
            </div>

            <div class="px-4 py-3 border-t border-line">
              <UiLink to="/notifications" @click="closeNotifications(false)">See all notifications and settings</UiLink>
            </div>
          </div>
        </div>

        <!-- Account menu (menu button pattern) -->
        <div ref="userMenuContainer" class="relative" @keydown.esc.stop="closeUserMenu(true)">
          <button
            id="user-menu-button"
            ref="userMenuButton"
            type="button"
            class="account-btn"
            :title="user ? `${user.name || user.email} (${user.email})` : 'Account'"
            :aria-label="user ? `Account menu for ${user.name || user.email}` : 'Account menu'"
            aria-haspopup="menu"
            :aria-expanded="userMenuOpen ? 'true' : 'false'"
            :aria-controls="userMenuOpen ? 'user-menu' : undefined"
            @click="toggleUserMenu"
            @keydown.down.prevent="openUserMenu(0)"
            @keydown.up.prevent="openUserMenu(-1)"
          >
            <span class="avatar w-8 h-8" aria-hidden="true">{{ initials }}</span>
          </button>

          <div v-if="userMenuOpen" class="account-menu">
            <div class="flex items-center gap-3 px-4 py-4 border-b border-line">
              <span class="avatar w-10 h-10 shrink-0" aria-hidden="true">{{ initials }}</span>
              <div class="min-w-0">
                <p class="text-sm font-semibold text-ink-strong truncate">{{ user?.name || user?.email }}</p>
                <p class="text-sm text-ink-muted truncate">{{ user?.email }}</p>
              </div>
            </div>
            <ul
              id="user-menu"
              ref="userMenuList"
              role="menu"
              aria-labelledby="user-menu-button"
              class="py-1.5"
              @keydown="handleUserMenuKeydown"
            >
              <li role="none">
                <button type="button" role="menuitem" tabindex="-1" class="user-menu-item" @click="goTo('/feedback')">
                  <AppIcon name="badge-alert" class="text-lg" />
                  Roadmap and feedback
                </button>
              </li>
              <li role="none">
                <button type="button" role="menuitem" tabindex="-1" class="user-menu-item" @click="goToChangePassword">
                  <AppIcon name="key" class="text-lg" />
                  Change password
                </button>
              </li>
              <li role="none">
                <button type="button" role="menuitem" tabindex="-1" class="user-menu-item" @click="signOut">
                  <AppIcon name="log-out" class="text-lg" />
                  Sign out
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { usePhoneNav } from '../composables/usePhoneNav.js';
import { ref, computed, nextTick, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth.js';
import { apiErrorMessage, authHeaders } from '../services/api.js';
import { canAccessPath } from '../router/rbacGuards.js';
import { buildSearchIndex } from '../router/searchIndex.js';
import { UiAnnounce, UiButton, UiChip, UiLink, UiSpinner } from './ui';
import { formatRelativeTime, useNotifications } from '../composables/useNotifications.js';

const router = useRouter();
const { user, initials, logout } = useAuth();
const notificationsContainer = ref(null);
const notificationsButton = ref(null);
const searchContainer = ref(null);
const searchQuery = ref('');
const showSearchResults = ref(false);
const showAdvancedFilters = ref(false);
const selectedSearchIndex = ref(-1);
const filtersToggle = ref(null);
const closeFilters = () => {
  showAdvancedFilters.value = false;
  filtersToggle.value?.focus();
};
// Keep the option picked with the arrow keys in view
watch(selectedSearchIndex, (index) => {
  if (index >= 0) nextTick(() => document.getElementById(`top-search-option-${index}`)?.scrollIntoView({ block: 'nearest' }));
});
const searchFilters = ref({
  type: [],
  category: [],
  hasProps: [],
  useCase: '',
});
const availableFilters = ref(null);
const usingBackendSearch = ref(false);

// Every page the router knows, with titles and search tags (router/searchIndex.js)
const searchIndex = buildSearchIndex(router);

const backendSearchResults = ref([]);

const filteredSearchResults = computed(() => {
  if (!searchQuery.value.trim() && Object.values(searchFilters.value).every(v => 
    Array.isArray(v) ? v.length === 0 : !v
  )) {
    return [];
  }
  
  // Use backend search if filters are active or query is complex
  if (usingBackendSearch.value || 
      searchFilters.value.type.length > 0 || 
      searchFilters.value.category.length > 0 || 
      searchFilters.value.hasProps.length > 0 ||
      searchFilters.value.useCase) {
    return backendSearchResults.value;
  }
  
  // Fallback to local search
  const query = searchQuery.value.toLowerCase();
  return searchIndex.filter(item => canAccessPath(item.path)).filter(item => {
    return item.title.toLowerCase().includes(query) ||
           item.description.toLowerCase().includes(query) ||
           item.tags.some(tag => tag.toLowerCase().includes(query)) ||
           item.category.toLowerCase().includes(query);
  }).slice(0, 8); // Limit to 8 results
});

/** The results popup is on screen (what the combobox's aria-expanded reports) */
const resultsOpen = computed(() => showSearchResults.value && (searchQuery.value.trim() !== '' || filteredSearchResults.value.length > 0));
/** Read out once the results settle: how many there are, or that there are none */
const resultsAnnouncement = computed(() => {
  if (!resultsOpen.value || !searchQuery.value.trim()) return '';
  const n = filteredSearchResults.value.length;
  return n ? `${n} result${n === 1 ? '' : 's'}` : 'No results found';
});
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

const loadAvailableFilters = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/search/filters`, {
      headers: authHeaders()
    });
    if (response.ok) {
      availableFilters.value = await response.json();
    }
  } catch (error) {
    console.error('Failed to load search filters:', error);
  }
};

const toggleSearchFilter = (filterType, value) => {
  if (!searchFilters.value[filterType]) {
    searchFilters.value[filterType] = [];
  }
  const index = searchFilters.value[filterType].indexOf(value);
  if (index > -1) {
    searchFilters.value[filterType].splice(index, 1);
  } else {
    searchFilters.value[filterType].push(value);
  }
  performSearch();
};

// The chip tone for a result's category
const getCategoryTone = (category) =>
  ({
    Components: 'accent',
    Tokens: 'accent',
    Patterns: 'accent',
    Guidelines: 'accent',
    Review: 'warning',
    Admin: 'danger',
  })[category] || 'neutral';

const performSearch = async () => {
  selectedSearchIndex.value = -1;
  
  // Check if we should use backend search
  const shouldUseBackend = searchFilters.value.type.length > 0 || 
      searchFilters.value.category.length > 0 || 
      searchFilters.value.hasProps.length > 0 ||
      searchFilters.value.useCase;
  
  if (shouldUseBackend && searchQuery.value.trim()) {
    // Use backend search when filters are active
    showSearchResults.value = true;
    usingBackendSearch.value = true;
    
    try {
      const params = new URLSearchParams();
      if (searchQuery.value.trim()) {
        params.append('q', searchQuery.value);
      }
      if (searchFilters.value.type.length > 0) {
        params.append('type', searchFilters.value.type.join(','));
      }
      if (searchFilters.value.category.length > 0) {
        params.append('category', searchFilters.value.category.join(','));
      }
      if (searchFilters.value.hasProps.length > 0) {
        params.append('hasProps', searchFilters.value.hasProps.join(','));
      }
      if (searchFilters.value.useCase) {
        params.append('useCase', searchFilters.value.useCase);
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/search?${params.toString()}`, {
        headers: authHeaders()
      });
      
      if (response.ok) {
        const results = await response.json();
        // Transform backend results to match frontend format
        backendSearchResults.value = results.map(r => ({
          id: r.id,
          title: r.title,
          description: r.description,
          category: r.category || r.type,
          path: r.path,
          icon: getIconForType(r.type),
          tags: r.tags || [],
        })).slice(0, 8);
      } else {
        // Fallback to empty if backend fails
        backendSearchResults.value = [];
      }
    } catch (error) {
      console.error('Search error:', error);
      backendSearchResults.value = [];
      usingBackendSearch.value = false;
    }
  } else if (searchQuery.value.trim()) {
    // Use local search for simple queries without filters
    showSearchResults.value = true;
    usingBackendSearch.value = false;
    backendSearchResults.value = [];
  } else {
    showSearchResults.value = false;
    usingBackendSearch.value = false;
    backendSearchResults.value = [];
  }
};

const getIconForType = (type) => {
  const icons = {
    component: 'blocks',
    token: 'sliders-horizontal',
    pattern: 'layout-template',
    guideline: 'file-text',
    workspace: 'briefcase',
    application: 'layout-grid',
  };
  return icons[type] || 'search';
};

const closeSearch = () => {
  showSearchResults.value = false;
  selectedSearchIndex.value = -1;
};

/** After picking a result: close the results and, on phones, the search bar */
const finishSearch = () => {
  closeSearch();
  mobileSearchOpen.value = false;
};

const navigateSearchResults = (direction) => {
  if (filteredSearchResults.value.length === 0) return;
  
  selectedSearchIndex.value += direction;
  if (selectedSearchIndex.value < 0) {
    selectedSearchIndex.value = filteredSearchResults.value.length - 1;
  } else if (selectedSearchIndex.value >= filteredSearchResults.value.length) {
    selectedSearchIndex.value = 0;
  }
};

const selectSearchResult = () => {
  if (selectedSearchIndex.value >= 0 && selectedSearchIndex.value < filteredSearchResults.value.length) {
    const result = filteredSearchResults.value[selectedSearchIndex.value];
    router.push(result.path);
    finishSearch();
    searchQuery.value = '';
  } else if (filteredSearchResults.value.length > 0) {
    router.push(filteredSearchResults.value[0].path);
    finishSearch();
    searchQuery.value = '';
  }
};

const showNotifications = ref(false);
const {
  notifications,
  unreadCount,
  loaded: notificationsLoaded,
  error: notificationsError,
  load: loadNotifications,
  markRead,
  markAllRead,
} = useNotifications();
const markingAll = ref(false);
const notificationActionError = ref('');

/** The bell shows the newest ten; the notifications page has the rest */
const recentNotifications = computed(() => notifications.value.slice(0, 10));
const hasUnreadBreaking = computed(() => notifications.value.some((n) => n.breaking && !n.read));

// Account menu
const userMenuOpen = ref(false);
const userMenuContainer = ref(null);
const userMenuButton = ref(null);
const userMenuList = ref(null);

const userMenuItems = () => Array.from(userMenuList.value?.querySelectorAll('[role="menuitem"]') ?? []);

const focusUserMenuItem = (index) => {
  const items = userMenuItems();
  if (!items.length) return;
  items[(index + items.length) % items.length].focus();
};

/** Open the menu and focus an item (0 = first, -1 = last). */
const openUserMenu = async (focusIndex = 0) => {
  userMenuOpen.value = true;
  showNotifications.value = false;
  await nextTick();
  focusUserMenuItem(focusIndex);
};

const closeUserMenu = (returnFocus = false) => {
  if (!userMenuOpen.value) return;
  userMenuOpen.value = false;
  if (returnFocus) userMenuButton.value?.focus();
};

const toggleUserMenu = () => {
  if (userMenuOpen.value) closeUserMenu(true);
  else openUserMenu(0);
};

const handleUserMenuKeydown = (event) => {
  const items = userMenuItems();
  const current = items.indexOf(document.activeElement);
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      focusUserMenuItem(current + 1);
      break;
    case 'ArrowUp':
      event.preventDefault();
      focusUserMenuItem(current - 1);
      break;
    case 'Home':
      event.preventDefault();
      focusUserMenuItem(0);
      break;
    case 'End':
      event.preventDefault();
      focusUserMenuItem(-1);
      break;
    case 'Tab':
      closeUserMenu(false);
      break;
    default:
      break;
  }
};

const goTo = (path) => {
  closeUserMenu(false);
  router.push(path);
};

const goToChangePassword = () => goTo('/change-password');

// Phones: the search box opens over the bar from a button
const mobileSearchOpen = ref(false);
const phoneNavOpen = usePhoneNav();
const searchInput = ref(null);
const mobileSearchButton = ref(null);

const openMobileSearch = async () => {
  mobileSearchOpen.value = true;
  closeUserMenu(false);
  closeNotifications(false);
  await nextTick();
  searchInput.value?.focus();
};

const closeMobileSearch = async () => {
  if (!mobileSearchOpen.value) return;
  mobileSearchOpen.value = false;
  await nextTick();
  mobileSearchButton.value?.focus();
};

const signOut = async () => {
  closeUserMenu(false);
  await logout();
  router.replace({ path: '/login', query: { signedOut: '1' } });
};

// Notifications panel: refreshed each time it opens
const toggleNotifications = () => {
  if (showNotifications.value) {
    closeNotifications(false);
    return;
  }
  showNotifications.value = true;
  notificationActionError.value = '';
  closeUserMenu(false);
  loadNotifications();
};

const closeNotifications = (returnFocus = false) => {
  if (!showNotifications.value) return;
  showNotifications.value = false;
  if (returnFocus === true) notificationsButton.value?.focus();
};

const markAllNotificationsRead = async () => {
  markingAll.value = true;
  notificationActionError.value = '';
  try {
    await markAllRead();
  } catch (error) {
    notificationActionError.value = apiErrorMessage(error, "Notifications couldn't be marked read.");
  } finally {
    markingAll.value = false;
  }
};

/** Opening a notification marks it read and goes to what it's about */
const openNotification = async (notification) => {
  notificationActionError.value = '';
  if (!notification.read) {
    try {
      await markRead(notification.id);
    } catch (error) {
      notificationActionError.value = apiErrorMessage(error, "The notification couldn't be marked read.");
      return;
    }
  }
  if (notification.link) {
    closeNotifications(false);
    router.push(notification.link);
  }
};

const notificationIcon = (notification) => {
  if (notification.breaking) return 'triangle-alert';
  if (notification.type === 'design-system-change') return 'history';
  if (notification.type === 'request-commented') return 'message-square';
  return 'bell';
};

// Click outside handler
const handleClickOutside = (event) => {
  if (userMenuOpen.value && userMenuContainer.value && !userMenuContainer.value.contains(event.target)) {
    closeUserMenu(false);
  }
  if (showNotifications.value && notificationsContainer.value && !notificationsContainer.value.contains(event.target)) {
    closeNotifications();
  }
  if (showSearchResults.value && searchContainer.value && !searchContainer.value.contains(event.target)) {
    closeSearch();
  }
};

onMounted(() => {
  // The unread count on the bell
  loadNotifications();

  // Add click outside listener
  document.addEventListener('click', handleClickOutside);
  // Other pages (the not-found page) ask for the search box
  window.addEventListener('open-top-search', openMobileSearch);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('open-top-search', openMobileSearch);
});
</script>

<style scoped>
/* z-50 like the sidebar, and later in the page, so its menus can open over the sidebar on phones */
.topnav {
  @apply sticky top-0 z-50 bg-surface border-b border-line;
}

.brand {
  @apply flex items-center gap-2 pl-3 pr-2 sm:pr-4 lg:pl-12 flex-shrink-0 rounded-control;
  @apply focus-visible:outline focus-visible:outline-2 outline-focus;
}
.brand-mark {
  @apply flex-shrink-0 stroke-accent transition-transform group-hover:scale-110;
}
.brand-name {
  @apply hidden sm:inline text-lg sm:text-xl font-semibold tracking-tight whitespace-nowrap text-ink-strong;
}

.search-area {
  @apply hidden sm:flex flex-1 justify-center min-w-0;
}
.search-area-open {
  @apply flex absolute inset-0 z-10 items-center px-2 bg-surface sm:static sm:px-0;
}
.nav-actions {
  @apply flex items-center gap-1 sm:gap-2 lg:gap-4 ml-auto px-2 sm:px-6 lg:px-8 flex-shrink-0;
}

.search-icon {
  @apply absolute left-3 top-1/2 -translate-y-1/2 text-xl text-ink-muted pointer-events-none;
}
.search-input {
  @apply w-full h-10 pl-10 pr-10 rounded-pill border border-solid border-line bg-surface-sunken text-sm text-ink placeholder:text-ink-muted transition-colors;
  @apply hover:border-line-control-hover focus:outline focus:outline-2 focus:outline-offset-0 outline-focus focus:border-transparent focus:bg-surface-control;
}
/* At least 24px, the WCAG 2.5.8 minimum */
.search-filters-toggle {
  @apply absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center min-w-6 min-h-6 p-1 rounded-control text-ink-muted hover:bg-fill-hover hover:text-ink-strong;
  @apply focus-visible:outline focus-visible:outline-2 outline-focus;
}

/* Dropdowns under the search box and the notifications button */
.popover {
  @apply absolute left-0 right-0 top-full mt-2 z-50 rounded-tile border border-line bg-surface-overlay shadow-overlay;
}
/* Menus from the right-hand buttons span the screen on phones */
.popover-end {
  @apply fixed left-2 right-2 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:w-96;
}
.popover-row {
  @apply transition-colors hover:bg-fill-hover;
}
.popover-row-on {
  @apply bg-accent-subtle;
}

.filter-label {
  @apply block text-xs font-medium mb-2 text-ink-secondary;
}
.filter-chip {
  @apply px-2 py-1 rounded-control bg-fill text-xs text-ink-secondary hover:bg-fill-hover;
  @apply focus-visible:outline focus-visible:outline-2 outline-focus;
}
.filter-chip-on,
.filter-chip-on:hover {
  @apply bg-accent text-ink-on-accent;
}

.result-icon {
  @apply flex items-center justify-center flex-shrink-0 w-8 h-8 mt-0.5 rounded-control bg-accent-subtle text-accent-text;
}

.icon-btn {
  @apply relative flex items-center justify-center p-2 rounded-pill text-ink-muted transition-colors hover:bg-fill-hover hover:text-accent-text;
  @apply focus-visible:outline focus-visible:outline-2 outline-focus;
}
/* After .icon-btn, which sets display */
.phone-only {
  @apply sm:hidden;
}
.wide-only {
  @apply hidden sm:flex;
}
.count-badge {
  @apply absolute top-1 right-1 flex items-center justify-center h-5 min-w-5 px-1 rounded-pill text-xs font-semibold;
}
.count-badge-accent {
  @apply bg-accent text-ink-on-accent;
}
.count-badge-danger {
  @apply bg-danger-solid text-ink-on-accent;
}

.close-btn {
  @apply p-1 rounded-control text-ink-muted transition-colors hover:bg-fill-hover hover:text-ink-strong;
  @apply focus-visible:outline focus-visible:outline-2 outline-focus;
}

.notif-row {
  @apply w-full flex items-start gap-3 p-4 text-left;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 outline-focus;
}
.notif-row-unread {
  @apply bg-accent-subtle;
}
.unread-dot {
  @apply flex-shrink-0 w-2 h-2 mt-2 rounded-pill bg-accent;
}

.activity-icon {
  @apply flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-pill;
}
.activity-icon-accent {
  @apply bg-accent-subtle text-accent-text;
}
.activity-icon-danger {
  @apply bg-danger-bg text-danger;
}

.account-btn {
  @apply flex items-center gap-2 p-1 rounded-pill transition-colors hover:bg-fill-hover;
  @apply focus-visible:outline focus-visible:outline-2 outline-focus;
}
.avatar {
  @apply flex items-center justify-center rounded-pill bg-accent-highlight text-sm font-semibold text-accent-text;
}
.account-menu {
  @apply fixed left-2 right-2 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-72 z-50 overflow-hidden rounded-card border border-line bg-surface-overlay shadow-overlay;
}
/* The fill alone is too faint to see, so focus also draws the ring (inset, inside the menu) */
.user-menu-item {
  @apply w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left text-ink hover:bg-fill-hover focus:bg-fill-hover;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 outline-focus;
}
</style>
