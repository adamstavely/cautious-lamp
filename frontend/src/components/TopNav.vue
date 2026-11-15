<template>
  <nav
    data-ds-component="topnav"
    data-ds-path="@design-system/components/topnav"
    class="topnav"
    role="navigation"
    aria-label="Top navigation"
  >
    <div class="flex items-center h-16">
      <!-- Site title -->
      <router-link to="/" class="brand group">
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

      <!-- Center search bar -->
      <div class="flex-1 flex justify-center min-w-0">
        <div class="w-full max-w-2xl mx-4 sm:mx-8">
          <div class="relative" ref="searchContainer">
            <AppIcon name="search" class="search-icon" />
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Search components, tokens, patterns... (use filters: type:component, hasProps:label)"
              @focus="showSearchResults = true"
              @input="performSearch"
              @keydown.escape="closeSearch"
              @keydown.down.prevent="navigateSearchResults(1)"
              @keydown.up.prevent="navigateSearchResults(-1)"
              @keydown.enter.prevent="selectSearchResult"
              class="search-input"
              aria-label="Search design system"
              :aria-expanded="showSearchResults ? 'true' : 'false'"
              aria-haspopup="listbox"
            />
            <button
              v-if="searchQuery"
              type="button"
              @click="showAdvancedFilters = !showAdvancedFilters"
              class="search-filters-toggle"
              title="Advanced filters"
              aria-label="Advanced filters"
              :aria-expanded="showAdvancedFilters ? 'true' : 'false'"
            >
              <AppIcon name="sliders-horizontal" class="text-sm" />
            </button>

            <!-- Advanced filters panel -->
            <div v-if="showAdvancedFilters" class="popover p-4">
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
            <div
              v-if="showSearchResults && (searchQuery.trim() || filteredSearchResults.length > 0)"
              class="popover overflow-hidden"
              role="listbox"
              aria-label="Search results"
            >
              <div class="overflow-y-auto max-h-96">
                <div v-if="filteredSearchResults.length === 0 && searchQuery.trim()" class="p-8 text-center">
                  <AppIcon name="search-x" class="text-5xl mb-3 text-ink-disabled" />
                  <p class="text-sm font-medium mb-1 text-ink-secondary">No results found</p>
                  <p class="text-xs text-ink-muted">Try a different search term</p>
                </div>

                <div v-else-if="filteredSearchResults.length > 0" class="divide-y divide-line">
                  <router-link
                    v-for="(result, index) in filteredSearchResults"
                    :key="result.id"
                    :to="result.path"
                    @click="closeSearch"
                    class="popover-row block px-4 py-3"
                    :class="{ 'popover-row-on': selectedSearchIndex === index }"
                    role="option"
                    :aria-selected="selectedSearchIndex === index"
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
        </div>
      </div>

      <!-- Right actions -->
      <div class="flex items-center gap-4 px-4 sm:px-6 lg:px-8 flex-shrink-0">
        <!-- Live chat -->
        <button type="button" class="icon-btn" title="Live Chat" aria-label="Live Chat">
          <AppIcon name="message-circle-question" />
        </button>

        <!-- Feedback -->
        <router-link to="/feedback" class="icon-btn" title="Roadmap & Feedback" aria-label="View roadmap and submit feedback">
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
            class="popover popover-end w-96 overflow-hidden"
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

        <!-- App picker -->
        <button type="button" class="icon-btn" title="Switch App" aria-label="Switch application">
          <AppIcon name="layout-grid" />
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth.js';
import { apiErrorMessage, authHeaders } from '../services/api.js';
import { canAccessPath } from '../router/rbacGuards.js';
import { UiButton, UiChip, UiLink, UiSpinner } from './ui';
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
const searchFilters = ref({
  type: [],
  category: [],
  hasProps: [],
  useCase: '',
});
const availableFilters = ref(null);
const usingBackendSearch = ref(false);

// Search index - in a real app, this would come from an API or be generated
const searchIndex = [
  { id: 'getting-started', title: 'Getting Started', description: 'Learn the fundamentals, explore key concepts, and start building with confidence', category: 'Getting Started', path: '/getting-started', icon: 'rocket', tags: ['getting-started', 'onboarding', 'tutorial'] },
  { id: 'why-design-system', title: 'Why a Design System?', description: 'Understand the value and philosophy behind our design system and how it enables teams to build better products', category: 'Getting Started', path: '/getting-started/why-design-system', icon: 'circle-help', tags: ['philosophy', 'value', 'benefits', 'why', 'design-system'] },
  { id: 'design-principles', title: 'Design Principles', description: 'The core principles that guide our design decisions and ensure extraordinary experiences for all users', category: 'Getting Started', path: '/getting-started/principles', icon: 'lightbulb', tags: ['principles', 'design', 'user-centric', 'accessibility', 'best-practices'] },
  { id: 'design-themes', title: 'Design Themes', description: 'Actionable design themes that expand on our principles and guide day-to-day design decisions', category: 'Getting Started', path: '/getting-started/themes', icon: 'palette', tags: ['themes', 'design', 'guidelines', 'practices', 'patterns'] },
  { id: 'contribute', title: 'Contribute', description: 'Learn how to contribute components, patterns, documentation, and feedback to the design system', category: 'Getting Started', path: '/getting-started/contribute', icon: 'users-round', tags: ['contribute', 'contribution', 'guidelines', 'process', 'collaboration'] },
  { id: 'quick-start', title: 'Quick Start', description: 'Get up and running with the design system in minutes', category: 'Getting Started', path: '/getting-started/quick-start', icon: 'play', tags: ['quick-start', 'getting-started', 'tutorial', 'setup'] },
  { id: 'installation', title: 'Installation', description: 'Install and configure the design system in your project', category: 'Getting Started', path: '/getting-started/installation', icon: 'download', tags: ['installation', 'setup', 'npm', 'yarn', 'cdn'] },
  { id: 'best-practices', title: 'Best Practices', description: 'Recommended practices for using the design system effectively', category: 'Getting Started', path: '/getting-started/best-practices', icon: 'circle-check', tags: ['best-practices', 'guidelines', 'recommendations', 'standards'] },
  { id: 'resources', title: 'Resources', description: 'Helpful resources, tools, and links to help you work effectively with the design system', category: 'Getting Started', path: '/getting-started/resources', icon: 'book', tags: ['resources', 'tools', 'links', 'documentation'] },
  { id: 'support', title: 'Support & Help', description: 'Get help when you need it. Find answers to common questions, report issues, or contact the design system team', category: 'Getting Started', path: '/getting-started/support', icon: 'circle-help', tags: ['support', 'help', 'faq', 'contact', 'assistance'] },
  { id: 'get-in-touch', title: 'Get in Touch', description: 'Have questions, feedback, or need support? We\'re here to help', category: 'Getting Started', path: '/getting-started/get-in-touch', icon: 'mail', tags: ['contact', 'support', 'feedback', 'help', 'communication'] },
  { id: 'adopt', title: 'Adopt', description: 'Learn how to successfully adopt the design system in your organization', category: 'Getting Started', path: '/getting-started/adopt', icon: 'trending-up', tags: ['adopt', 'adoption', 'implementation', 'onboarding', 'rollout'] },
  { id: 'improving-ux-through-acquisition', title: 'Improving UX Through Acquisition', description: 'Learn how design system adoption and user acquisition strategies work together to create exceptional user experiences', category: 'Getting Started', path: '/getting-started/improving-ux-through-acquisition', icon: 'lightbulb', tags: ['ux', 'acquisition', 'user-experience', 'strategy', 'growth', 'adoption'] },
  { id: 'research-repo', title: 'HCD', description: 'Explore journey maps, user personas, HCD reports, and other human-centered design research artifacts', category: 'HCD', path: '/research', icon: 'notebook-tabs', tags: ['research', 'personas', 'journey-maps', 'hcd', 'user-studies'] },
  { id: 'button', title: 'Button', description: 'Primary, secondary, and tertiary button variants with different sizes and states', category: 'Components', path: '/components/buttons', icon: 'rectangle-horizontal', tags: ['interactive', 'form', 'action'] },
  { id: 'loupe-tool', title: 'Loupe', description: 'Inspect design system components on any page with keyboard shortcut', category: 'Components', path: '/components/loupe', icon: 'zoom-in', tags: ['loupe', 'inspector', 'components', 'keyboard-shortcut'] },
  { id: 'color-picker', title: 'Color Picker', description: 'Accessible color picker component with support for multiple color formats and WCAG compliance', category: 'Components', path: '/components/color-picker', icon: 'pipette', tags: ['color', 'picker', 'accessibility', 'wcag', 'component'] },
  { id: 'component-status', title: 'Component Status', description: 'Track component development status and availability', category: 'Components', path: '/components/status', icon: 'circle-check', tags: ['status', 'tracking'] },
  { id: 'component-versions', title: 'Component Versions', description: 'Track versions, changelogs, and breaking changes', category: 'Components', path: '/components/versions', icon: 'history', tags: ['version', 'changelog'] },
  { id: 'forms', title: 'Forms', description: 'Input fields, selects, checkboxes, and form controls', category: 'Components', path: '/components/forms', icon: 'file-text', tags: ['form', 'input', 'validation'] },
  { id: 'cards', title: 'Cards', description: 'Card components for displaying content and actions', category: 'Components', path: '/components/cards', icon: 'layout-grid', tags: ['layout', 'content'] },
  { id: 'navigation', title: 'Navigation', description: 'Menus, breadcrumbs, tabs, and navigation components', category: 'Components', path: '/components/navigation', icon: 'navigation', tags: ['navigation', 'menu'] },
  { id: 'data-display', title: 'Data Display', description: 'Tables, lists, and data visualization components', category: 'Components', path: '/components/data-display', icon: 'table-2', tags: ['data', 'table', 'list'] },
  { id: 'token-studio', title: 'Token Studio', description: 'Create and manage design tokens with Style Dictionary', category: 'Tokens', path: '/tokens/studio', icon: 'sliders-horizontal', tags: ['tokens', 'design', 'style'] },
  { id: 'style-library', title: 'Style Library', description: 'View, edit, download, and retire style dictionaries', category: 'Tokens', path: '/tokens/library', icon: 'library', tags: ['tokens', 'library'] },
  { id: 'pattern-navigation', title: 'Navigation Pattern', description: 'Navigation patterns and best practices', category: 'Patterns', path: '/patterns/navigation', icon: 'navigation', tags: ['pattern', 'navigation'] },
  { id: 'pattern-layout', title: 'Layout Pattern', description: 'Grid systems, containers, and responsive layouts', category: 'Patterns', path: '/patterns/layout', icon: 'layout-dashboard', tags: ['pattern', 'layout'] },
  { id: 'pattern-forms', title: 'Form Pattern', description: 'Form patterns and validation guidelines', category: 'Patterns', path: '/patterns/forms', icon: 'file-text', tags: ['pattern', 'form'] },
  { id: 'pattern-feedback', title: 'Feedback Pattern', description: 'User feedback patterns and notifications', category: 'Patterns', path: '/patterns/feedback', icon: 'message-square-warning', tags: ['pattern', 'feedback'] },
  { id: 'pattern-status', title: 'Pattern Status', description: 'Track pattern development status and availability', category: 'Patterns', path: '/patterns/status', icon: 'circle-check', tags: ['pattern', 'status', 'tracking'] },
  { id: 'pattern-form-validation', title: 'Form Validation Pattern', description: 'Code pattern for accessible form validation', category: 'Patterns', path: '/patterns/form-validation', icon: 'file-text', tags: ['pattern', 'form', 'validation', 'code'] },
  { id: 'pattern-accessible-modal', title: 'Accessible Modal Pattern', description: 'Code pattern for accessible modal dialogs', category: 'Patterns', path: '/patterns/accessible-modal', icon: 'maximize', tags: ['pattern', 'modal', 'accessibility', 'code'] },
  { id: 'pattern-sortable-table', title: 'Sortable Data Table Pattern', description: 'Code pattern for sortable data tables', category: 'Patterns', path: '/patterns/sortable-data-table', icon: 'table-2', tags: ['pattern', 'table', 'data', 'code'] },
  { id: 'pattern-login-form', title: 'Login Form Pattern', description: 'Code pattern for login forms', category: 'Patterns', path: '/patterns/login-form', icon: 'lock', tags: ['pattern', 'form', 'login', 'code'] },
  { id: 'pattern-responsive-nav', title: 'Responsive Navigation Pattern', description: 'Code pattern for responsive navigation', category: 'Patterns', path: '/patterns/responsive-navigation', icon: 'menu', tags: ['pattern', 'navigation', 'responsive', 'code'] },
  { id: 'pattern-toast', title: 'Toast Notification Pattern', description: 'Code pattern for toast notifications', category: 'Patterns', path: '/patterns/toast-notification', icon: 'bell', tags: ['pattern', 'toast', 'notification', 'code'] },
  { id: 'font-library', title: 'Font Library', description: 'Browse and preview hundreds of Google Fonts', category: 'Design Assets', path: '/design-assets/font-library', icon: 'library', tags: ['font', 'typography', 'design-assets'] },
  { id: 'font-scale', title: 'Font Scale', description: 'Typography scale and sizing system', category: 'Tools', path: '/tools/font-scale', icon: 'a-large-small', tags: ['font', 'scale', 'typography', 'tool'] },
  { id: 'font-stack', title: 'Font Stack & Subsetting', description: 'Build font stacks with fallback fonts and optimize Google Fonts by subsetting character sets', category: 'Tools', path: '/tools/font-stack', icon: 'layers', tags: ['font', 'stack', 'subsetting', 'typography', 'tool', 'optimization'] },
  { id: 'icon-library', title: 'Icon Library', description: 'Upload and manage icon sets from Material and Lucide', category: 'Design Assets', path: '/design-assets/icons', icon: 'star', tags: ['icons', 'assets'] },
  { id: 'country-flags', title: 'Country Flags', description: 'Collection of country flag assets for use in your designs', category: 'Design Assets', path: '/design-assets/country-flags', icon: 'flag', tags: ['flags', 'countries', 'assets'] },
  { id: 'usg-seals', title: 'USG Seals', description: 'Official US Government seals and emblems for authorized use', category: 'Design Assets', path: '/design-assets/usg-seals', icon: 'badge-check', tags: ['seals', 'usg', 'government', 'assets'] },
  { id: 'internal-seals', title: 'Internal Seals', description: 'Internal organizational seals and emblems for agency use', category: 'Design Assets', path: '/design-assets/internal-seals', icon: 'shield', tags: ['seals', 'internal', 'organizational', 'assets'] },
  { id: 'interactives', title: 'Interactives', description: 'Interactive design assets and components for enhanced user experiences', category: 'Design Assets', path: '/design-assets/interactives', icon: 'pointer', tags: ['interactive', 'components', 'assets'] },
  { id: 'stock-photos', title: 'Stock Photos', description: 'Curated collection of stock photography for use in your projects', category: 'Design Assets', path: '/design-assets/stock-photos', icon: 'images', tags: ['photos', 'stock', 'photography', 'assets'] },
  { id: 'illustrations', title: 'Illustrations', description: 'Curated illustration collections for your designs', category: 'Design Assets', path: '/design-assets/illustrations', icon: 'pencil-line', tags: ['illustrations', 'art', 'assets'] },
  { id: 'capability-logos', title: 'Capability Logos', description: 'Logos and branding assets for specific capabilities and services', category: 'Design Assets', path: '/design-assets/capability-logos', icon: 'award', tags: ['logos', 'capability', 'branding', 'assets'] },
  { id: 'company-logos', title: 'Company Logos', description: 'Company and organization logos for partnership and collaboration materials', category: 'Design Assets', path: '/design-assets/company-logos', icon: 'building-2', tags: ['logos', 'company', 'organizations', 'assets'] },
  { id: 'color-converter', title: 'Color Converter', description: 'Convert colors between different formats (HEX, RGB, HSL, etc.)', category: 'Tools', path: '/tools/color-converter', icon: 'palette', tags: ['color', 'converter', 'tool'] },
  { id: 'nasa-tlx', title: 'NASA-TLX', description: 'Assess task workload across six dimensions for usability analysis', category: 'Tools', path: '/tools/nasa-tlx', icon: 'brain', tags: ['usability', 'workload', 'assessment', 'nasa-tlx'] },
  { id: 'sus', title: 'System Usability Scale', description: 'Quick and reliable tool for measuring system usability', category: 'Tools', path: '/tools/sus', icon: 'brain', tags: ['usability', 'sus', 'assessment', 'scale'] },
  { id: 'heuristic-evaluation', title: 'Heuristic Evaluation', description: 'Evaluate interfaces using Nielsen\'s 10 Usability Heuristics', category: 'Tools', path: '/tools/heuristic-evaluation', icon: 'list-checks', tags: ['usability', 'heuristics', 'nielsen', 'evaluation', 'checklist'] },
  { id: 'user-persona-generator', title: 'User Persona Generator', description: 'Create detailed user personas from research data to inform design decisions', category: 'HCD', path: '/research/user-personas', icon: 'user', tags: ['persona', 'user-research', 'research', 'user-profile', 'archetype', 'hcd'] },
  { id: 'png-to-ico', title: 'PNG to ICO Converter', description: 'Convert PNG images to ICO format for favicons and app icons', category: 'Tools', path: '/tools/png-to-ico', icon: 'image', tags: ['image', 'converter', 'ico', 'favicon', 'icon'] },
  { id: 'alt-text-generator', title: 'Alt Text Generator', description: 'Generate accessible, descriptive alt text for images to improve web accessibility and SEO', category: 'Tools', path: '/tools/alt-text-generator', icon: 'type', tags: ['alt-text', 'accessibility', 'images', 'seo', 'a11y'] },
  { id: 'color-contrast', title: 'Color Contrast Checker', description: 'Check color contrast ratios for accessibility', category: 'Tools', path: '/tools/color-contrast', icon: 'contrast', tags: ['color', 'accessibility', 'contrast'] },
  { id: 'gradient-generator', title: 'Gradient Generator', description: 'Create beautiful gradients with custom stops and directions', category: 'Tools', path: '/tools/gradient-generator', icon: 'blend', tags: ['gradient', 'color', 'tool'] },
  { id: 'lorem-ipsum', title: 'Lorem Ipsum Generator', description: 'Generate placeholder text with various options', category: 'Tools', path: '/tools/lorem-ipsum', icon: 'type', tags: ['text', 'placeholder', 'tool'] },
  { id: 'seo-tagging', title: 'SEO Tagging Generator', description: 'Generate SEO meta tags for your pages', category: 'Tools', path: '/tools/seo-tagging', icon: 'search', tags: ['seo', 'meta', 'tool'] },
  { id: 'color-scale', title: 'Color Scale Generator', description: 'Generate color scales with accessibility checks', category: 'Tools', path: '/tools/color-scale', icon: 'palette', tags: ['color', 'scale', 'accessibility'] },
  { id: 'admin-health', title: 'System Health', description: 'Monitor your design system\'s health, track adoption, and identify improvements', category: 'Admin', path: '/admin/health', icon: 'layout-panel-left', tags: ['health', 'metrics', 'analytics'] },
  { id: 'admin-governance', title: 'Design System Governance', description: 'Enforce design system rules and check compliance', category: 'Admin', path: '/admin/governance', icon: 'shield-user', tags: ['governance', 'compliance', 'rules'] },
  { id: 'admin-audit', title: 'Audit Logs', description: 'Track and monitor all user actions, API calls, and system events', category: 'Admin', path: '/admin/audit', icon: 'history', tags: ['audit', 'logs', 'tracking', 'monitoring'] },
  { id: 'admin-roles', title: 'Role Management', description: 'Manage user roles and their access to design system features and permissions', category: 'Admin', path: '/admin/roles', icon: 'shield-user', tags: ['roles', 'permissions', 'rbac', 'access', 'management'] },
  { id: 'admin-feature-flags', title: 'Feature Flags', description: 'Control feature availability across your design system. Turn features on or off, target specific users or groups, and manage gradual rollouts', category: 'Admin', path: '/admin/feature-flags', icon: 'flag', tags: ['feature flags', 'feature toggles', 'rollout', 'targeting', 'openfeature'] },
  { id: 'admin-content', title: 'Component and Pattern Lifecycle Management', description: 'Create new pattern or component pages and edit/update statuses of existing pages', category: 'Admin', path: '/admin/content', icon: 'file-pen-line', tags: ['content', 'lifecycle', 'components', 'patterns', 'status', 'management'] },
  { id: 'admin-applications', title: 'Application Management', description: 'Register applications, manage capabilities, and configure scanners for governance, visual regression, and session replay', category: 'Admin', path: '/admin/applications', icon: 'layout-grid', tags: ['applications', 'registration', 'governance', 'visual-regression', 'session-replay'] },
  { id: 'admin-applications-register', title: 'Application Registration', description: 'Register a new application with the design system and enable/disable scanners and capabilities', category: 'Admin', path: '/admin/applications/register', icon: 'circle-plus', tags: ['applications', 'registration', 'onboarding', 'capabilities'] },
  { id: 'handoff-tools', title: 'Design-Dev Handoff', description: 'Generate specs, export assets, and measure designs', category: 'Review', path: '/review/handoff', icon: 'arrow-left-right', tags: ['handoff', 'specs', 'export'] },
  { id: 'change-notifications', title: 'Change Notifications', description: 'Stay informed about component and token changes', category: 'Tools', path: '/notifications', icon: 'bell', tags: ['notifications', 'changes', 'alerts'] },
  { id: 'ai-suggestions', title: 'AI-Powered Suggestions', description: 'Get intelligent recommendations for components and accessibility', category: 'Tools', path: '/ai-suggestions', icon: 'brain', tags: ['ai', 'suggestions', 'accessibility'] },
  { id: 'multi-brand', title: 'Multi-Brand Support', description: 'Manage multiple brands and white-label systems', category: 'Tools', path: '/brands', icon: 'layout-grid', tags: ['brands', 'white-label', 'themes'] },
  { id: 'theme-builder', title: 'Theme Builder', description: 'Visually customize your design system theme', category: 'Tools', path: '/theme-builder', icon: 'sliders-horizontal', tags: ['theme', 'customization', 'colors'] },
  { id: 'component-composition', title: 'Component Composition', description: 'Build complex components from primitives', category: 'Components', path: '/components/composition', icon: 'layout-dashboard', tags: ['composition', 'primitives', 'builder'] },
  { id: 'guidelines-colors', title: 'Color Guidelines', description: 'Color system and usage guidelines', category: 'Guidelines', path: '/colors', icon: 'palette', tags: ['guidelines', 'color', 'colors', 'palette', 'design-tokens'] },
  { id: 'guidelines-typography', title: 'Typography Guidelines', description: 'Typography system and best practices', category: 'Guidelines', path: '/typography', icon: 'type', tags: ['guidelines', 'typography', 'fonts', 'text', 'type'] },
  { id: 'guidelines-spacing', title: 'Spacing Guidelines', description: 'Spacing system and layout guidelines', category: 'Guidelines', path: '/spacing', icon: 'layout-panel-left', tags: ['guidelines', 'spacing', 'layout', 'margin', 'padding'] },
  { id: 'guidelines-shadows', title: 'Shadow Guidelines', description: 'Shadow system and elevation guidelines', category: 'Guidelines', path: '/shadows', icon: 'layers', tags: ['guidelines', 'shadows', 'elevation', 'depth', 'layers'] },
  { id: 'guidelines-accessibility', title: 'Accessibility Guidelines', description: 'Accessibility standards and best practices for inclusive design', category: 'Guidelines', path: '/accessibility', icon: 'accessibility', tags: ['guidelines', 'accessibility', 'a11y', 'wcag', 'inclusive', 'design'] },
  { id: 'guidelines-tui', title: 'Terminal UI (TUI) Guidance', description: 'Design standards for Terminal User Interfaces (TUIs) across command-line and console-based applications', category: 'Guidelines', path: '/tui-guidance', icon: 'terminal', tags: ['guidelines', 'tui', 'terminal', 'cli', 'command-line', 'console', 'ncurses', 'accessibility', 'scriptability'] },
  { id: 'performance-analysis', title: 'Performance Analysis', description: 'Analyze bundle sizes and set performance budgets', category: 'Admin', path: '/admin/performance', icon: 'gauge', tags: ['performance', 'budgets', 'bundle', 'size', 'analysis', 'monitoring'] },
  { id: 'visual-regression', title: 'Visual Regression Testing', description: 'Catch visual bugs before production with automated visual testing powered by Argos', category: 'Tools', path: '/tools/visual-regression', icon: 'git-compare', tags: ['visual-regression', 'testing', 'argos', 'screenshots', 'qa'] },
  { id: 'session-replay', title: 'Session Replay', description: 'See exactly what users experience with session replay and heatmaps for your applications', category: 'HCD', path: '/hcd/session-replay', icon: 'video', tags: ['session-replay', 'openreplay', 'heatmaps', 'user-analytics', 'monitoring'] },
  { id: 'photosensitivity-analysis', title: 'Photosensitivity Analysis', description: 'Analyze video content for photosensitive epileptic risks using IRIS', category: 'Tools', path: '/tools/photosensitivity', icon: 'eye', tags: ['photosensitivity', 'iris', 'accessibility', 'video', 'epilepsy', 'a11y'] },
  { id: 'ai-overview', title: 'AI Overview', description: 'Explore AI-powered features and capabilities in the design system', category: 'AI', path: '/ai', icon: 'brain', tags: ['ai', 'artificial-intelligence', 'overview', 'features'] },
  { id: 'ai-patterns', title: 'AI Patterns', description: 'AI-generated design patterns and recommendations', category: 'AI', path: '/ai/patterns', icon: 'layout-template', tags: ['ai', 'patterns', 'design', 'recommendations'] },
  { id: 'ai-components', title: 'AI Components', description: 'AI-generated component suggestions and recommendations', category: 'AI', path: '/ai/components', icon: 'blocks', tags: ['ai', 'components', 'suggestions', 'recommendations'] },
  { id: 'review-management', title: 'Review Management', description: 'Manage review workflows, teams, and review links', category: 'Review', path: '/review/management', icon: 'folder-kanban', tags: ['review', 'management', 'workflow', 'teams', 'kanban'] },
  { id: 'roadmap-feedback', title: 'Roadmap & Feedback', description: 'View roadmap, submit feedback, and see what\'s new', category: 'Tools', path: '/feedback', icon: 'badge-alert', tags: ['roadmap', 'feedback', 'requests', 'whats-new'] },
  { id: 'chart-builder', title: 'Chart Builder', description: 'Create interactive charts and data visualizations with customizable options', category: 'Tools', path: '/tools/chart-builder', icon: 'chart-column', tags: ['chart', 'data-visualization', 'graph', 'chartjs', 'tool'] },
  { id: 'timeline-generator', title: 'Timeline Generator', description: 'Create interactive timelines with events, dates, and custom styling', category: 'Tools', path: '/tools/timeline-generator', icon: 'chart-gantt', tags: ['timeline', 'events', 'history', 'visualization', 'tool'] },
  { id: 'table-generator', title: 'Table Generator', description: 'Generate data tables with sorting, filtering, and pagination', category: 'Tools', path: '/tools/table-generator', icon: 'table-2', tags: ['table', 'datatable', 'data', 'sorting', 'filtering', 'tool'] },
  { id: 'map-maker', title: 'Map Maker', description: 'Create choropleth maps and flow maps with customizable data visualization', category: 'Tools', path: '/tools/map-maker', icon: 'map', tags: ['map', 'choropleth', 'flow-map', 'geographic', 'data-visualization', 'tool'] },
  { id: 'palette-builder', title: 'Palette Builder', description: 'Build and customize color palettes for your design system', category: 'Tools', path: '/palette-builder', icon: 'palette', tags: ['palette', 'color', 'builder', 'design-tokens', 'tool'] },
  { id: 'font-scale', title: 'Font Scale', description: 'Typography scale and sizing system generator', category: 'Tools', path: '/tools/font-scale', icon: 'a-large-small', tags: ['font', 'scale', 'typography', 'sizing', 'tool'] },
  { id: 'font-stack', title: 'Font Stack & Subsetting', description: 'Build font stacks with fallback fonts and optimize Google Fonts by subsetting character sets', category: 'Tools', path: '/tools/font-stack', icon: 'layers', tags: ['font', 'stack', 'subsetting', 'typography', 'optimization', 'tool'] },
  { id: 'spacing-scale', title: 'Spacing Scale Generator', description: 'Generate consistent spacing scales for your design system', category: 'Tools', path: '/tools/spacing-scale', icon: 'layout-panel-left', tags: ['spacing', 'scale', 'margin', 'padding', 'layout', 'tool'] },
  { id: 'box-shadow', title: 'Box Shadow Generator', description: 'Generate CSS box shadows with customizable properties', category: 'Tools', path: '/tools/box-shadow', icon: 'layers', tags: ['shadow', 'box-shadow', 'css', 'elevation', 'tool'] },
  { id: 'border-radius', title: 'Border Radius Generator', description: 'Generate border radius values for rounded corners', category: 'Tools', path: '/tools/border-radius', icon: 'square-round-corner', tags: ['border-radius', 'rounded', 'corners', 'css', 'tool'] },
  { id: 'html-viewer', title: 'HTML Viewer', description: 'Preview and inspect HTML code in a live viewer', category: 'Tools', path: '/tools/html-viewer', icon: 'eye', tags: ['html', 'viewer', 'preview', 'code', 'tool'] },
  { id: 'html-escaper', title: 'HTML Escaper', description: 'Escape and unescape HTML entities and special characters', category: 'Tools', path: '/tools/html-escaper', icon: 'lock', tags: ['html', 'escape', 'entities', 'security', 'tool'] },
  { id: 'px-converter', title: 'PX Unit Converter', description: 'Convert pixel values to other CSS units (rem, em, pt, etc.)', category: 'Tools', path: '/tools/px-converter', icon: 'ruler', tags: ['px', 'converter', 'units', 'css', 'rem', 'em', 'tool'] },
  { id: 'css-converter', title: 'CSS Converter', description: 'Convert CSS between different formats and syntaxes', category: 'Tools', path: '/tools/css-converter', icon: 'code', tags: ['css', 'converter', 'syntax', 'format', 'tool'] },
  { id: 'image-compressor', title: 'Image Compressor', description: 'Compress and optimize images to reduce file size while maintaining quality', category: 'Tools', path: '/tools/image-compressor', icon: 'shrink', tags: ['image', 'compressor', 'optimization', 'file-size', 'tool'] },
  { id: 'css-animation', title: 'CSS Animation Generator', description: 'Generate CSS animations and keyframes with customizable properties', category: 'Tools', path: '/tools/css-animation', icon: 'wand-sparkles', tags: ['css', 'animation', 'keyframes', 'transitions', 'tool'] },
  // Overview pages
  { id: 'components-overview', title: 'Components', description: 'Browse and explore all design system components', category: 'Components', path: '/components', icon: 'blocks', tags: ['components', 'overview', 'library'] },
  { id: 'tokens-overview', title: 'Tokens', description: 'Explore design tokens, color palettes, and style systems', category: 'Tokens', path: '/tokens', icon: 'sliders-horizontal', tags: ['tokens', 'overview', 'design-tokens'] },
  { id: 'patterns-overview', title: 'Patterns', description: 'Browse design patterns and best practices', category: 'Patterns', path: '/patterns', icon: 'layout-template', tags: ['patterns', 'overview', 'design-patterns'] },
  { id: 'tools-overview', title: 'Tools', description: 'Access design and development tools', category: 'Tools', path: '/tools', icon: 'wrench', tags: ['tools', 'overview', 'utilities'] },
  { id: 'fonts-overview', title: 'Fonts', description: 'Browse typography resources and font tools', category: 'Design Assets', path: '/fonts', icon: 'type', tags: ['fonts', 'typography', 'overview'] },
  { id: 'design-assets-overview', title: 'Design Assets', description: 'Browse icons, fonts, illustrations, and other design assets', category: 'Design Assets', path: '/design-assets', icon: 'images', tags: ['design-assets', 'assets', 'overview'] },
  { id: 'review-overview', title: 'Review', description: 'Review system for design and development collaboration', category: 'Review', path: '/review', icon: 'message-square-text', tags: ['review', 'collaboration', 'overview'] },
  { id: 'guidelines-overview', title: 'Guidelines', description: 'Design guidelines and documentation', category: 'Guidelines', path: '/guidelines', icon: 'book-open', tags: ['guidelines', 'documentation', 'overview'] },
  // For pages
  { id: 'for-designers', title: 'For Designers', description: 'Resources and tools specifically for designers', category: 'Getting Started', path: '/for-designers', icon: 'palette', tags: ['designers', 'resources', 'tools'] },
  { id: 'for-developers', title: 'For Developers', description: 'Resources and tools specifically for developers', category: 'Getting Started', path: '/for-developers', icon: 'code', tags: ['developers', 'resources', 'tools'] },
  { id: 'for-researchers', title: 'For Researchers', description: 'Resources and tools specifically for researchers', category: 'Getting Started', path: '/for-researchers', icon: 'flask-conical', tags: ['researchers', 'resources', 'tools'] },
  // Component pages
  { id: 'component-export', title: 'Component Library Export', description: 'Export component libraries and documentation', category: 'Components', path: '/components/export', icon: 'download', tags: ['export', 'library', 'components'] },
  { id: 'component-deprecation', title: 'Deprecation Manager', description: 'Manage component deprecations and migrations', category: 'Components', path: '/components/deprecation', icon: 'triangle-alert', tags: ['deprecation', 'migration', 'components'] },
  { id: 'badge-generator', title: 'Badge Generator', description: 'Generate badge components with customizable styles', category: 'Components', path: '/components/badge-generator', icon: 'id-card', tags: ['badge', 'generator', 'components'] },
  { id: 'progress-generator', title: 'Progress Generator', description: 'Generate progress bar components', category: 'Components', path: '/components/progress-generator', icon: 'loader-circle', tags: ['progress', 'generator', 'components'] },
  { id: 'loading-generator', title: 'Loading Spinner Generator', description: 'Generate loading spinner components', category: 'Components', path: '/components/loading-generator', icon: 'refresh-cw', tags: ['loading', 'spinner', 'generator', 'components'] },
  { id: 'component-scaffold', title: 'Component Scaffolding Wizard', description: 'Scaffold new components with best practices', category: 'Components', path: '/components/scaffold', icon: 'sparkles', tags: ['scaffold', 'wizard', 'components', 'generator'] },
  { id: 'component-testing', title: 'Component Testing', description: 'Test components and ensure quality', category: 'Components', path: '/components/testing', icon: 'flask-conical', tags: ['testing', 'components', 'qa'] },
  { id: 'component-documentation', title: 'Documentation Generator', description: 'Generate component documentation automatically', category: 'Components', path: '/components/documentation', icon: 'file-text', tags: ['documentation', 'generator', 'components'] },
  { id: 'component-dependencies', title: 'Component Dependency Graph', description: 'Visualize component dependencies and relationships', category: 'Components', path: '/admin/dependencies', icon: 'network', tags: ['dependencies', 'graph', 'components'] },
  { id: 'component-examples', title: 'Component Examples', description: 'Browse component examples and use cases', category: 'Components', path: '/components/examples', icon: 'layout-grid', tags: ['examples', 'components', 'use-cases'] },
  { id: 'component-feedback', title: 'Component Feedback', description: 'Submit and manage feedback for components', category: 'Components', path: '/components/feedback', icon: 'message-square-warning', tags: ['feedback', 'components'] },
  { id: 'component-versions', title: 'Component Versions', description: 'Track component versions and changelogs', category: 'Components', path: '/components/versions', icon: 'history', tags: ['versions', 'changelog', 'components'] },
  // Token pages
  { id: 'token-playground', title: 'Token Playground', description: 'Experiment with design tokens in an interactive playground', category: 'Tokens', path: '/tokens/playground', icon: 'play', tags: ['tokens', 'playground', 'experiment'] },
  { id: 'color-palettes', title: 'Color Palettes', description: 'Browse and manage color palettes', category: 'Tokens', path: '/tokens/color-palettes', icon: 'palette', tags: ['color', 'palettes', 'tokens'] },
  { id: 'harmony-palette', title: 'Harmony Palette', description: 'Create harmonious color palettes', category: 'Tokens', path: '/tokens/color-palettes/harmony', icon: 'palette', tags: ['harmony', 'color', 'palette', 'tokens'] },
  { id: 'colored-text-palette', title: 'Colored Text Palette', description: 'Generate accessible colored text palettes', category: 'Tokens', path: '/tokens/color-palettes/colored-text', icon: 'baseline', tags: ['colored-text', 'color', 'palette', 'tokens', 'accessibility'] },
  { id: 'token-migration', title: 'Token Migration', description: 'Migrate and update design tokens', category: 'Tokens', path: '/tokens/migration', icon: 'arrow-left-right', tags: ['migration', 'tokens', 'update'] },
  { id: 'token-relationships', title: 'Token Relationships', description: 'Visualize token relationships and dependencies', category: 'Tokens', path: '/tokens/relationships', icon: 'share-2', tags: ['relationships', 'tokens', 'dependencies'] },
  { id: 'token-sync', title: 'Token Sync', description: 'Synchronize tokens across platforms and tools', category: 'Tokens', path: '/tokens/sync', icon: 'refresh-cw', tags: ['sync', 'tokens', 'synchronization'] },
  { id: 'design-extractor', title: 'Design Extractor', description: 'Extract design tokens from design files', category: 'Tokens', path: '/tokens/extract', icon: 'file-output', tags: ['extract', 'tokens', 'design-files'] },
  { id: 'ai-token-builder', title: 'AI Token Builder', description: 'Build design tokens with AI assistance', category: 'Tokens', path: '/tokens/ai-builder', icon: 'sparkles', tags: ['ai', 'tokens', 'builder', 'generator'] },
  { id: 'design-sync', title: 'Design Sync', description: 'Sync designs between tools and platforms', category: 'Tools', path: '/design-sync', icon: 'refresh-cw', tags: ['design-sync', 'sync', 'tools'] },
  // HCD/Research pages
  { id: 'hcd-principles', title: 'HCD Principles', description: 'Human-centered design principles and guidelines', category: 'HCD', path: '/hcd/principles', icon: 'lightbulb', tags: ['hcd', 'principles', 'human-centered-design'] },
  { id: 'hcd-research', title: 'HCD Research', description: 'User research methods and practices', category: 'HCD', path: '/hcd/research', icon: 'flask-conical', tags: ['hcd', 'research', 'user-research'] },
  { id: 'hcd-accessibility', title: 'HCD Accessibility', description: 'Accessibility in human-centered design', category: 'HCD', path: '/hcd/accessibility', icon: 'accessibility', tags: ['hcd', 'accessibility', 'a11y'] },
  { id: 'laws-of-ux', title: 'Laws of UX', description: 'Explore fundamental laws and principles of user experience design', category: 'HCD', path: '/hcd/laws-of-ux', icon: 'gavel', tags: ['laws-of-ux', 'ux', 'principles', 'hcd'] },
  { id: 'hcd-process', title: 'HCD Process', description: 'Human-centered design process and methodology', category: 'HCD', path: '/hcd/process', icon: 'chart-gantt', tags: ['hcd', 'process', 'methodology'] },
  { id: 'recruiting-users', title: 'Recruiting Users', description: 'Guidelines and tools for recruiting research participants', category: 'HCD', path: '/hcd/recruiting-users', icon: 'users', tags: ['recruiting', 'users', 'research', 'hcd'] },
  { id: 'conducting-interviews', title: 'Conducting Interviews', description: 'Best practices for conducting user interviews', category: 'HCD', path: '/hcd/conducting-interviews', icon: 'mic', tags: ['interviews', 'user-research', 'hcd'] },
  { id: 'research-reports', title: 'Research Reports', description: 'Create and manage user research reports', category: 'HCD', path: '/hcd/research-reports', icon: 'file-text', tags: ['research-reports', 'reports', 'hcd'] },
  { id: 'research-methods', title: 'Research Methods', description: 'User research methods and techniques', category: 'HCD', path: '/hcd/research-methods', icon: 'brain', tags: ['research-methods', 'methods', 'hcd'] },
  { id: 'hcd-council', title: 'HCD Council', description: 'Human-centered design council and governance', category: 'HCD', path: '/hcd/council', icon: 'users-round', tags: ['hcd-council', 'council', 'governance', 'hcd'] },
  { id: 'journey-maps', title: 'Journey Maps', description: 'Create and visualize user journey maps', category: 'HCD', path: '/research/journey-maps', icon: 'map', tags: ['journey-maps', 'user-journey', 'research', 'hcd'] },
  { id: 'hcd-reports', title: 'HCD Reports', description: 'Browse human-centered design research reports', category: 'HCD', path: '/research/hcd-reports', icon: 'file-text', tags: ['hcd-reports', 'reports', 'research', 'hcd'] },
  { id: 'user-studies', title: 'User Studies', description: 'Browse and manage user studies', category: 'HCD', path: '/research/user-studies', icon: 'flask-conical', tags: ['user-studies', 'studies', 'research', 'hcd'] },
  { id: 'research-insights', title: 'Research Insights', description: 'Key insights from user research', category: 'HCD', path: '/research/insights', icon: 'lightbulb', tags: ['research-insights', 'insights', 'research', 'hcd'] },
  { id: 'research-artifacts', title: 'Research Artifacts', description: 'Browse research artifacts and documentation', category: 'HCD', path: '/research/artifacts', icon: 'folder', tags: ['research-artifacts', 'artifacts', 'research', 'hcd'] },
  // Getting Started foundations
  { id: 'atomic-design', title: 'Atomic Design', description: 'Learn about atomic design methodology', category: 'Getting Started', path: '/getting-started/foundations/atomic-design', icon: 'flask-conical', tags: ['atomic-design', 'methodology', 'foundations'] },
  { id: 'building-trust', title: 'Building Trust', description: 'Design principles for building user trust', category: 'Getting Started', path: '/getting-started/foundations/building-trust', icon: 'badge-check', tags: ['trust', 'foundations', 'principles'] },
  { id: 'responsiveness', title: 'Responsiveness', description: 'Responsive design principles and practices', category: 'Getting Started', path: '/getting-started/foundations/responsiveness', icon: 'monitor-smartphone', tags: ['responsiveness', 'responsive', 'foundations'] },
  { id: 'usability', title: 'Usability', description: 'Usability principles and best practices', category: 'Getting Started', path: '/getting-started/foundations/usability', icon: 'pointer', tags: ['usability', 'foundations', 'ux'] },
  { id: 'writing-content', title: 'Writing Content', description: 'Content writing guidelines and best practices', category: 'Getting Started', path: '/getting-started/foundations/writing-content', icon: 'pencil', tags: ['content', 'writing', 'foundations'] },
  { id: 'purpose-and-benefits', title: 'Purpose and Benefits', description: 'Understand the purpose and benefits of the design system', category: 'Getting Started', path: '/getting-started/purpose-and-benefits', icon: 'info', tags: ['purpose', 'benefits', 'getting-started'] },
  { id: 'guidelines-voice-tone', title: 'Voice and Tone', description: 'Content voice and tone guidelines', category: 'Guidelines', path: '/guidelines/voice-and-tone', icon: 'speech', tags: ['voice', 'tone', 'content', 'guidelines'] },
  // Tools
  { id: 'svg-placeholder-text', title: 'SVG Placeholder Text Generator', description: 'Generate SVG placeholder text for designs', category: 'Tools', path: '/tools/svg-placeholder-text', icon: 'type', tags: ['svg', 'placeholder', 'text', 'generator', 'tool'] },
  { id: 'apca-calculator', title: 'APCA Calculator', description: 'Calculate Advanced Perceptual Contrast Algorithm values', category: 'Tools', path: '/tools/apca-calculator', icon: 'calculator', tags: ['apca', 'contrast', 'accessibility', 'calculator', 'tool'] },
  { id: 'design-system-api', title: 'Design System API', description: 'Access the design system via API', category: 'Tools', path: '/api', icon: 'webhook', tags: ['api', 'design-system', 'integration'] },
  { id: 'design-system-search', title: 'Design System Search', description: 'Advanced search for design system content', category: 'Tools', path: '/search', icon: 'search', tags: ['search', 'design-system'] },
  // Admin pages
  { id: 'admin-workspaces', title: 'Workspace Management', description: 'Manage workspaces and teams', category: 'Admin', path: '/admin/workspaces', icon: 'briefcase', tags: ['workspaces', 'teams', 'admin'] },
  { id: 'admin-users', title: 'User Management', description: 'Manage users and permissions', category: 'Admin', path: '/admin/users', icon: 'users', tags: ['users', 'permissions', 'admin'] },
  { id: 'admin-accessibility-reports', title: 'Accessibility Reports', description: 'View and manage accessibility reports', category: 'Admin', path: '/admin/accessibility-reports', icon: 'accessibility', tags: ['accessibility', 'reports', 'admin', 'a11y'] },
  // Reference pages
  { id: 'jaws-commands', title: 'JAWS Commands', description: 'Reference guide for JAWS screen reader commands and keyboard shortcuts', category: 'Tools', path: '/tools/references/jaws-commands', icon: 'keyboard', tags: ['jaws', 'screen-reader', 'accessibility', 'keyboard', 'commands', 'reference', 'a11y'] },
  { id: 'penpot-for-beginners', title: 'Penpot for Beginners', description: 'Getting started guide for Penpot design tool', category: 'Tools', path: '/tools/references/penpot-for-beginners', icon: 'pencil-line', tags: ['penpot', 'design-tool', 'tutorial', 'beginners', 'reference'] },
  { id: 'units-of-measure', title: 'Units of Measure', description: 'Reference guide for units of measurement in design and development', category: 'Tools', path: '/tools/references/units-of-measure', icon: 'ruler', tags: ['units', 'measurement', 'reference', 'design', 'development'] },
  // Pattern pages (under /guidelines/patterns/)
  { id: 'agent-oriented-onboarding', title: 'Agent-Oriented Onboarding', description: 'Design patterns for AI agent onboarding experiences', category: 'Patterns', path: '/guidelines/patterns/agent-oriented-onboarding', icon: 'rocket', tags: ['pattern', 'onboarding', 'ai', 'agent', 'interaction'] },
  { id: 'ai-disengagement-timeout-error', title: 'AI Disengagement Timeout Error', description: 'Patterns for handling AI disengagement and timeout errors', category: 'Patterns', path: '/guidelines/patterns/ai-disengagement-timeout-error', icon: 'timer-off', tags: ['pattern', 'ai', 'error', 'timeout', 'disengagement', 'interaction'] },
  { id: 'ai-thinking-states', title: 'AI Thinking States', description: 'Design patterns for displaying AI thinking and processing states', category: 'Patterns', path: '/guidelines/patterns/ai-thinking-states', icon: 'brain', tags: ['pattern', 'ai', 'thinking', 'states', 'loading', 'interaction'] },
  { id: 'empty-loading-states', title: 'Empty Loading States', description: 'Design patterns for empty and loading states in user interfaces', category: 'Patterns', path: '/guidelines/patterns/empty-loading-states', icon: 'hourglass', tags: ['pattern', 'empty', 'loading', 'states', 'ui', 'design'] },
  { id: 'error-handling', title: 'Error Handling', description: 'Design patterns for error handling and user feedback', category: 'Patterns', path: '/guidelines/patterns/error-handling', icon: 'circle-alert', tags: ['pattern', 'error', 'handling', 'feedback', 'ui', 'design'] },
  { id: 'multi-agent-orchestration', title: 'Multi-Agent Orchestration', description: 'Design patterns for orchestrating multiple AI agents', category: 'Patterns', path: '/guidelines/patterns/multi-agent-orchestration', icon: 'network', tags: ['pattern', 'ai', 'agents', 'orchestration', 'multi-agent', 'interaction'] },
  { id: 'new-features-experiences', title: 'New Features Experiences', description: 'Design patterns for introducing new features to users', category: 'Patterns', path: '/guidelines/patterns/new-features-experiences', icon: 'badge-alert', tags: ['pattern', 'features', 'onboarding', 'discovery', 'ui', 'design'] },
  // Guideline pages
  { id: 'color-contrast', title: 'Color Contrast', description: 'Guidelines for color contrast and accessibility in design', category: 'Guidelines', path: '/guidelines/color-contrast', icon: 'contrast', tags: ['guidelines', 'color', 'contrast', 'accessibility', 'a11y', 'wcag'] },
  { id: 'content-organization-navigation', title: 'Content Organization Navigation', description: 'Guidelines for organizing content and navigation structures', category: 'Guidelines', path: '/guidelines/content-organization-navigation', icon: 'navigation', tags: ['guidelines', 'content', 'organization', 'navigation', 'information-architecture'] },
  { id: 'css-grid-layout', title: 'CSS Grid Layout', description: 'Guidelines for using CSS Grid in layout design', category: 'Guidelines', path: '/guidelines/css-grid-layout', icon: 'layout-dashboard', tags: ['guidelines', 'css', 'grid', 'layout', 'design'] },
  { id: 'flashing', title: 'Flashing', description: 'Guidelines for handling flashing content and photosensitivity', category: 'Guidelines', path: '/guidelines/flashing', icon: 'zap', tags: ['guidelines', 'flashing', 'photosensitivity', 'accessibility', 'a11y', 'epilepsy'] },
  { id: 'focus', title: 'Focus', description: 'Guidelines for keyboard focus and accessibility', category: 'Guidelines', path: '/guidelines/focus', icon: 'focus', tags: ['guidelines', 'focus', 'keyboard', 'accessibility', 'a11y'] },
  { id: 'iconography', title: 'Iconography', description: 'Guidelines for icon design and usage', category: 'Guidelines', path: '/guidelines/iconography', icon: 'image', tags: ['guidelines', 'icons', 'iconography', 'design', 'visual'] },
  { id: 'information-architecture', title: 'Information Architecture', description: 'Guidelines for information architecture and content structure', category: 'Guidelines', path: '/guidelines/information-architecture', icon: 'network', tags: ['guidelines', 'information-architecture', 'ia', 'structure', 'content'] },
  { id: 'keyboard-gestures', title: 'Keyboard Gestures', description: 'Guidelines for keyboard gestures and shortcuts', category: 'Guidelines', path: '/guidelines/keyboard-gestures', icon: 'keyboard', tags: ['guidelines', 'keyboard', 'gestures', 'shortcuts', 'accessibility', 'a11y'] },
  { id: 'metadata-seo', title: 'Metadata SEO', description: 'Guidelines for metadata and SEO best practices', category: 'Guidelines', path: '/guidelines/metadata-seo', icon: 'search', tags: ['guidelines', 'metadata', 'seo', 'search', 'optimization'] },
  { id: 'multimedia-animation', title: 'Multimedia Animation', description: 'Guidelines for multimedia and animation in design', category: 'Guidelines', path: '/guidelines/multimedia-animation', icon: 'wand-sparkles', tags: ['guidelines', 'multimedia', 'animation', 'video', 'motion'] },
  { id: 'text-graphics', title: 'Text Graphics', description: 'Guidelines for combining text and graphics in design', category: 'Guidelines', path: '/guidelines/text-graphics', icon: 'type', tags: ['guidelines', 'text', 'graphics', 'typography', 'visual'] },
  { id: 'time', title: 'Time', description: 'Guidelines for time-based interactions and displays', category: 'Guidelines', path: '/guidelines/time', icon: 'clock', tags: ['guidelines', 'time', 'temporal', 'interactions', 'display'] },
];

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
    closeSearch();
    searchQuery.value = '';
  } else if (filteredSearchResults.value.length > 0) {
    router.push(filteredSearchResults.value[0].path);
    closeSearch();
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

const goToChangePassword = () => {
  closeUserMenu(false);
  router.push('/change-password');
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
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.topnav {
  @apply sticky top-0 z-40 bg-surface border-b border-line;
}

.brand {
  @apply flex items-center gap-2 pl-12 pr-4 flex-shrink-0 rounded-control;
  @apply focus-visible:outline focus-visible:outline-2 outline-focus;
}
.brand-mark {
  @apply flex-shrink-0 stroke-accent transition-transform group-hover:scale-110;
}
.brand-name {
  @apply hidden sm:inline text-lg sm:text-xl font-semibold tracking-tight whitespace-nowrap text-ink-strong;
}

.search-icon {
  @apply absolute left-3 top-1/2 -translate-y-1/2 text-xl text-ink-muted pointer-events-none;
}
.search-input {
  @apply w-full h-10 pl-10 pr-4 rounded-pill border border-solid border-line bg-surface-sunken text-sm text-ink placeholder:text-ink-muted transition-colors;
  @apply hover:border-line-control-hover focus:outline focus:outline-2 focus:outline-offset-0 outline-focus focus:border-transparent focus:bg-surface-control;
}
.search-filters-toggle {
  @apply absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-control text-ink-muted hover:bg-fill-hover hover:text-ink-strong;
  @apply focus-visible:outline focus-visible:outline-2 outline-focus;
}

/* Dropdowns under the search box and the notifications button */
.popover {
  @apply absolute left-0 right-0 top-full mt-2 z-50 rounded-tile border border-line bg-surface-overlay shadow-overlay;
}
.popover-end {
  @apply left-auto right-0;
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
  @apply absolute right-0 mt-2 w-72 z-50 overflow-hidden rounded-card border border-line bg-surface-overlay shadow-overlay;
}
.user-menu-item {
  @apply w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left text-ink hover:bg-fill-hover focus:bg-fill-hover focus:outline-none;
}
</style>
