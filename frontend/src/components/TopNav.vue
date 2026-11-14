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
            <span class="material-symbols-outlined search-icon" aria-hidden="true">search</span>
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
              <span class="material-symbols-outlined text-sm" aria-hidden="true">tune</span>
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
                  <span class="material-symbols-outlined text-5xl mb-3 text-ink-disabled" aria-hidden="true">search_off</span>
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
                        <span class="material-symbols-outlined text-lg" aria-hidden="true">{{ result.icon }}</span>
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
          <span class="material-symbols-outlined" aria-hidden="true">live_help</span>
        </button>

        <!-- Feedback -->
        <router-link to="/feedback" class="icon-btn" title="Roadmap & Feedback" aria-label="View roadmap and submit feedback">
          <span class="material-symbols-outlined" aria-hidden="true">new_releases</span>
        </router-link>

        <!-- Notifications -->
        <div class="relative" ref="notificationsContainer">
          <button
            type="button"
            @click="toggleNotifications"
            class="icon-btn"
            title="Notifications"
            :aria-label="`Notifications${totalNotificationCount > 0 ? `, ${totalNotificationCount} unread` : ''}`"
            :aria-expanded="showNotifications"
            aria-haspopup="true"
          >
            <span class="material-symbols-outlined" aria-hidden="true">notifications</span>
            <span
              v-if="totalNotificationCount > 0"
              class="count-badge"
              :class="breakingChangeNotifications.length > 0 ? 'count-badge-danger' : 'count-badge-accent'"
              aria-hidden="true"
            >
              {{ totalNotificationCount > 9 ? '9+' : totalNotificationCount }}
            </span>
          </button>

          <!-- Notifications dropdown -->
          <div
            v-if="showNotifications"
            class="popover popover-end w-96 overflow-hidden"
            role="menu"
            aria-label="Recent activity notifications"
          >
            <!-- Header -->
            <div class="px-4 py-3 border-b border-line flex items-center justify-between">
              <h3 class="font-semibold text-lg text-ink-strong">Notifications</h3>
              <button type="button" @click="closeNotifications" class="close-btn" aria-label="Close notifications">
                <span class="material-symbols-outlined text-xl" aria-hidden="true">close</span>
              </button>
            </div>

            <!-- Tabs -->
            <div class="flex border-b border-line">
              <button
                type="button"
                @click="notificationTab = 'all'"
                class="notif-tab"
                :class="{ 'notif-tab-on': notificationTab === 'all' }"
              >
                All
                <span v-if="totalNotificationCount > 0" class="notif-tab-count">{{ totalNotificationCount }}</span>
              </button>
              <button
                type="button"
                @click="notificationTab = 'breaking'"
                class="notif-tab notif-tab-danger"
                :class="{ 'notif-tab-on': notificationTab === 'breaking' }"
              >
                Breaking Changes
                <span v-if="breakingChangeNotifications.length > 0" class="notif-tab-count">{{ breakingChangeNotifications.length }}</span>
              </button>
              <button
                type="button"
                @click="notificationTab = 'activity'"
                class="notif-tab"
                :class="{ 'notif-tab-on': notificationTab === 'activity' }"
              >
                Activity
                <span v-if="recentActivity.length > 0" class="notif-tab-count">{{ recentActivity.length }}</span>
              </button>
            </div>

            <!-- Notification list -->
            <div class="overflow-y-auto max-h-96">
              <!-- Breaking changes tab -->
              <div v-if="notificationTab === 'breaking'">
                <div v-if="breakingChangeNotifications.length === 0" class="p-8 text-center">
                  <span class="material-symbols-outlined text-4xl mb-3 block text-ink-disabled" aria-hidden="true">check_circle</span>
                  <p class="text-sm text-ink-muted">No breaking changes</p>
                </div>
                <div v-else class="divide-y divide-line">
                  <div
                    v-for="notification in breakingChangeNotifications"
                    :key="notification.id"
                    @click="goToComponent(notification.componentId)"
                    class="popover-row p-4 cursor-pointer"
                  >
                    <div class="flex items-start gap-3">
                      <div class="activity-icon activity-icon-danger">
                        <span class="material-symbols-outlined text-base" aria-hidden="true">warning</span>
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                          <h4 class="text-sm font-semibold text-ink-strong">Breaking Change</h4>
                          <UiChip tone="danger">{{ notification.componentName }}</UiChip>
                        </div>
                        <p class="text-sm mb-1 line-clamp-2 text-ink-secondary">{{ notification.message }}</p>
                        <p class="text-xs text-ink-muted">{{ formatRelativeTime(notification.timestamp) }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Activity tab -->
              <div v-else-if="notificationTab === 'activity'">
                <div v-if="recentActivity.length === 0" class="p-8 text-center">
                  <svg class="w-12 h-12 mx-auto mb-3 text-ink-disabled" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p class="text-sm text-ink-muted">No recent activity</p>
                </div>
                <div v-else class="divide-y divide-line">
                  <div
                    v-for="activity in recentActivity"
                    :key="activity.id"
                    @click="goToReview(activity.reviewId)"
                    class="popover-row p-4 cursor-pointer"
                  >
                    <div class="flex items-start gap-3">
                      <div class="activity-icon" :class="`activity-icon-${getActivityTone(activity.type, activity.action)}`">
                        <svg v-if="activity.type === 'comment'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <svg v-else-if="activity.action === 'uploaded' || activity.action === 'created_from_url'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span v-else-if="activity.action === 'version_uploaded'" class="material-symbols-outlined text-base" aria-hidden="true">difference</span>
                        <span v-else-if="activity.action === 'approved'" class="material-symbols-outlined text-base" aria-hidden="true">approval</span>
                        <span v-else-if="activity.action === 'completed'" class="material-symbols-outlined text-base" aria-hidden="true">done_all</span>
                        <span v-else-if="activity.action === 'rejected'" class="material-symbols-outlined text-base" aria-hidden="true">source_notes</span>
                        <span v-else-if="activity.action === 'moved_to_review'" class="material-symbols-outlined text-base" aria-hidden="true">graph_1</span>
                        <svg v-else-if="activity.type === 'workflow'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                          <h4 class="text-sm font-semibold truncate text-ink-strong">{{ activity.reviewName }}</h4>
                          <UiChip :tone="getWorkflowTone(activity.workflowState)">{{ getWorkflowLabel(activity.workflowState) }}</UiChip>
                        </div>
                        <p class="text-sm mb-1 line-clamp-2 text-ink-secondary">{{ activity.description }}</p>
                        <p class="text-xs text-ink-muted">{{ formatRelativeTime(activity.timestamp) }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- All tab -->
              <div v-else>
                <div v-if="totalNotificationCount === 0" class="p-8 text-center">
                  <span class="material-symbols-outlined text-4xl mb-3 block text-ink-disabled" aria-hidden="true">notifications_off</span>
                  <p class="text-sm text-ink-muted">No notifications</p>
                </div>
                <div v-else class="divide-y divide-line">
                  <!-- Breaking changes first -->
                  <div
                    v-for="notification in breakingChangeNotifications"
                    :key="`breaking-${notification.id}`"
                    @click="goToComponent(notification.componentId)"
                    class="popover-row popover-row-breaking p-4 cursor-pointer"
                  >
                    <div class="flex items-start gap-3">
                      <div class="activity-icon activity-icon-danger">
                        <span class="material-symbols-outlined text-base" aria-hidden="true">warning</span>
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                          <h4 class="text-sm font-semibold text-ink-strong">Breaking Change</h4>
                          <UiChip tone="danger">{{ notification.componentName }}</UiChip>
                        </div>
                        <p class="text-sm mb-1 line-clamp-2 text-ink-secondary">{{ notification.message }}</p>
                        <p class="text-xs text-ink-muted">{{ formatRelativeTime(notification.timestamp) }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Then activity -->
                  <div
                    v-for="activity in recentActivity"
                    :key="activity.id"
                    @click="goToReview(activity.reviewId)"
                    class="popover-row p-4 cursor-pointer"
                  >
                    <div class="flex items-start gap-3">
                      <div class="activity-icon" :class="`activity-icon-${getActivityTone(activity.type, activity.action)}`">
                        <svg v-if="activity.type === 'comment'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <svg v-else-if="activity.action === 'uploaded' || activity.action === 'created_from_url'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span v-else-if="activity.action === 'version_uploaded'" class="material-symbols-outlined text-base" aria-hidden="true">difference</span>
                        <span v-else-if="activity.action === 'approved'" class="material-symbols-outlined text-base" aria-hidden="true">approval</span>
                        <span v-else-if="activity.action === 'completed'" class="material-symbols-outlined text-base" aria-hidden="true">done_all</span>
                        <span v-else-if="activity.action === 'rejected'" class="material-symbols-outlined text-base" aria-hidden="true">source_notes</span>
                        <span v-else-if="activity.action === 'moved_to_review'" class="material-symbols-outlined text-base" aria-hidden="true">graph_1</span>
                        <svg v-else-if="activity.type === 'workflow'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                          <h4 class="text-sm font-semibold truncate text-ink-strong">{{ activity.reviewName }}</h4>
                          <UiChip :tone="getWorkflowTone(activity.workflowState)">{{ getWorkflowLabel(activity.workflowState) }}</UiChip>
                        </div>
                        <p class="text-sm mb-1 line-clamp-2 text-ink-secondary">{{ activity.description }}</p>
                        <p class="text-xs text-ink-muted">{{ formatRelativeTime(activity.timestamp) }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
                  <span class="material-symbols-outlined text-lg" aria-hidden="true">key</span>
                  Change password
                </button>
              </li>
              <li role="none">
                <button type="button" role="menuitem" tabindex="-1" class="user-menu-item" @click="signOut">
                  <span class="material-symbols-outlined text-lg" aria-hidden="true">logout</span>
                  Sign out
                </button>
              </li>
            </ul>
          </div>
        </div>

        <!-- App picker -->
        <button type="button" class="icon-btn" title="Switch App" aria-label="Switch application">
          <span class="material-symbols-outlined" aria-hidden="true">apps</span>
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { mockAPI, isMockMode, mockReviews, getCurrentUser } from '../mockData.js';
import { useAuth } from '../composables/useAuth.js';
import { authHeaders } from '../services/api.js';
import { canAccessPath } from '../router/rbacGuards.js';
import { UiChip } from './ui';

const router = useRouter();
const { user, initials, logout } = useAuth();
const notificationsContainer = ref(null);
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
  { id: 'getting-started', title: 'Getting Started', description: 'Learn the fundamentals, explore key concepts, and start building with confidence', category: 'Getting Started', path: '/getting-started', icon: 'rocket_launch', tags: ['getting-started', 'onboarding', 'tutorial'] },
  { id: 'why-design-system', title: 'Why a Design System?', description: 'Understand the value and philosophy behind our design system and how it enables teams to build better products', category: 'Getting Started', path: '/getting-started/why-design-system', icon: 'help_outline', tags: ['philosophy', 'value', 'benefits', 'why', 'design-system'] },
  { id: 'design-principles', title: 'Design Principles', description: 'The core principles that guide our design decisions and ensure extraordinary experiences for all users', category: 'Getting Started', path: '/getting-started/principles', icon: 'lightbulb', tags: ['principles', 'design', 'user-centric', 'accessibility', 'best-practices'] },
  { id: 'design-themes', title: 'Design Themes', description: 'Actionable design themes that expand on our principles and guide day-to-day design decisions', category: 'Getting Started', path: '/getting-started/themes', icon: 'palette', tags: ['themes', 'design', 'guidelines', 'practices', 'patterns'] },
  { id: 'contribute', title: 'Contribute', description: 'Learn how to contribute components, patterns, documentation, and feedback to the design system', category: 'Getting Started', path: '/getting-started/contribute', icon: 'groups', tags: ['contribute', 'contribution', 'guidelines', 'process', 'collaboration'] },
  { id: 'quick-start', title: 'Quick Start', description: 'Get up and running with the design system in minutes', category: 'Getting Started', path: '/getting-started/quick-start', icon: 'play_arrow', tags: ['quick-start', 'getting-started', 'tutorial', 'setup'] },
  { id: 'installation', title: 'Installation', description: 'Install and configure the design system in your project', category: 'Getting Started', path: '/getting-started/installation', icon: 'download', tags: ['installation', 'setup', 'npm', 'yarn', 'cdn'] },
  { id: 'best-practices', title: 'Best Practices', description: 'Recommended practices for using the design system effectively', category: 'Getting Started', path: '/getting-started/best-practices', icon: 'check_circle', tags: ['best-practices', 'guidelines', 'recommendations', 'standards'] },
  { id: 'resources', title: 'Resources', description: 'Helpful resources, tools, and links to help you work effectively with the design system', category: 'Getting Started', path: '/getting-started/resources', icon: 'book', tags: ['resources', 'tools', 'links', 'documentation'] },
  { id: 'support', title: 'Support & Help', description: 'Get help when you need it. Find answers to common questions, report issues, or contact the design system team', category: 'Getting Started', path: '/getting-started/support', icon: 'help', tags: ['support', 'help', 'faq', 'contact', 'assistance'] },
  { id: 'get-in-touch', title: 'Get in Touch', description: 'Have questions, feedback, or need support? We\'re here to help', category: 'Getting Started', path: '/getting-started/get-in-touch', icon: 'mail', tags: ['contact', 'support', 'feedback', 'help', 'communication'] },
  { id: 'adopt', title: 'Adopt', description: 'Learn how to successfully adopt the design system in your organization', category: 'Getting Started', path: '/getting-started/adopt', icon: 'trending_up', tags: ['adopt', 'adoption', 'implementation', 'onboarding', 'rollout'] },
  { id: 'improving-ux-through-acquisition', title: 'Improving UX Through Acquisition', description: 'Learn how design system adoption and user acquisition strategies work together to create exceptional user experiences', category: 'Getting Started', path: '/getting-started/improving-ux-through-acquisition', icon: 'insights', tags: ['ux', 'acquisition', 'user-experience', 'strategy', 'growth', 'adoption'] },
  { id: 'research-repo', title: 'HCD', description: 'Explore journey maps, user personas, HCD reports, and other human-centered design research artifacts', category: 'HCD', path: '/research', icon: 'note_stack', tags: ['research', 'personas', 'journey-maps', 'hcd', 'user-studies'] },
  { id: 'button', title: 'Button', description: 'Primary, secondary, and tertiary button variants with different sizes and states', category: 'Components', path: '/components/buttons', icon: 'smart_button', tags: ['interactive', 'form', 'action'] },
  { id: 'loupe-tool', title: 'Loupe', description: 'Inspect design system components on any page with keyboard shortcut', category: 'Components', path: '/components/loupe', icon: 'zoom_in', tags: ['loupe', 'inspector', 'components', 'keyboard-shortcut'] },
  { id: 'color-picker', title: 'Color Picker', description: 'Accessible color picker component with support for multiple color formats and WCAG compliance', category: 'Components', path: '/components/color-picker', icon: 'colorize', tags: ['color', 'picker', 'accessibility', 'wcag', 'component'] },
  { id: 'component-status', title: 'Component Status', description: 'Track component development status and availability', category: 'Components', path: '/components/status', icon: 'check_circle', tags: ['status', 'tracking'] },
  { id: 'component-versions', title: 'Component Versions', description: 'Track versions, changelogs, and breaking changes', category: 'Components', path: '/components/versions', icon: 'history', tags: ['version', 'changelog'] },
  { id: 'forms', title: 'Forms', description: 'Input fields, selects, checkboxes, and form controls', category: 'Components', path: '/components/forms', icon: 'description', tags: ['form', 'input', 'validation'] },
  { id: 'cards', title: 'Cards', description: 'Card components for displaying content and actions', category: 'Components', path: '/components/cards', icon: 'view_module', tags: ['layout', 'content'] },
  { id: 'navigation', title: 'Navigation', description: 'Menus, breadcrumbs, tabs, and navigation components', category: 'Components', path: '/components/navigation', icon: 'navigation', tags: ['navigation', 'menu'] },
  { id: 'data-display', title: 'Data Display', description: 'Tables, lists, and data visualization components', category: 'Components', path: '/components/data-display', icon: 'table_chart', tags: ['data', 'table', 'list'] },
  { id: 'token-studio', title: 'Token Studio', description: 'Create and manage design tokens with Style Dictionary', category: 'Tokens', path: '/tokens/studio', icon: 'tune', tags: ['tokens', 'design', 'style'] },
  { id: 'style-library', title: 'Style Library', description: 'View, edit, download, and retire style dictionaries', category: 'Tokens', path: '/tokens/library', icon: 'library_books', tags: ['tokens', 'library'] },
  { id: 'pattern-navigation', title: 'Navigation Pattern', description: 'Navigation patterns and best practices', category: 'Patterns', path: '/patterns/navigation', icon: 'navigation', tags: ['pattern', 'navigation'] },
  { id: 'pattern-layout', title: 'Layout Pattern', description: 'Grid systems, containers, and responsive layouts', category: 'Patterns', path: '/patterns/layout', icon: 'view_quilt', tags: ['pattern', 'layout'] },
  { id: 'pattern-forms', title: 'Form Pattern', description: 'Form patterns and validation guidelines', category: 'Patterns', path: '/patterns/forms', icon: 'description', tags: ['pattern', 'form'] },
  { id: 'pattern-feedback', title: 'Feedback Pattern', description: 'User feedback patterns and notifications', category: 'Patterns', path: '/patterns/feedback', icon: 'feedback', tags: ['pattern', 'feedback'] },
  { id: 'pattern-status', title: 'Pattern Status', description: 'Track pattern development status and availability', category: 'Patterns', path: '/patterns/status', icon: 'check_circle', tags: ['pattern', 'status', 'tracking'] },
  { id: 'pattern-form-validation', title: 'Form Validation Pattern', description: 'Code pattern for accessible form validation', category: 'Patterns', path: '/patterns/form-validation', icon: 'description', tags: ['pattern', 'form', 'validation', 'code'] },
  { id: 'pattern-accessible-modal', title: 'Accessible Modal Pattern', description: 'Code pattern for accessible modal dialogs', category: 'Patterns', path: '/patterns/accessible-modal', icon: 'fullscreen', tags: ['pattern', 'modal', 'accessibility', 'code'] },
  { id: 'pattern-sortable-table', title: 'Sortable Data Table Pattern', description: 'Code pattern for sortable data tables', category: 'Patterns', path: '/patterns/sortable-data-table', icon: 'table_chart', tags: ['pattern', 'table', 'data', 'code'] },
  { id: 'pattern-login-form', title: 'Login Form Pattern', description: 'Code pattern for login forms', category: 'Patterns', path: '/patterns/login-form', icon: 'lock', tags: ['pattern', 'form', 'login', 'code'] },
  { id: 'pattern-responsive-nav', title: 'Responsive Navigation Pattern', description: 'Code pattern for responsive navigation', category: 'Patterns', path: '/patterns/responsive-navigation', icon: 'menu', tags: ['pattern', 'navigation', 'responsive', 'code'] },
  { id: 'pattern-toast', title: 'Toast Notification Pattern', description: 'Code pattern for toast notifications', category: 'Patterns', path: '/patterns/toast-notification', icon: 'notifications', tags: ['pattern', 'toast', 'notification', 'code'] },
  { id: 'font-library', title: 'Font Library', description: 'Browse and preview hundreds of Google Fonts', category: 'Design Assets', path: '/design-assets/font-library', icon: 'library_books', tags: ['font', 'typography', 'design-assets'] },
  { id: 'font-scale', title: 'Font Scale', description: 'Typography scale and sizing system', category: 'Tools', path: '/tools/font-scale', icon: 'format_size', tags: ['font', 'scale', 'typography', 'tool'] },
  { id: 'font-stack', title: 'Font Stack & Subsetting', description: 'Build font stacks with fallback fonts and optimize Google Fonts by subsetting character sets', category: 'Tools', path: '/tools/font-stack', icon: 'layers', tags: ['font', 'stack', 'subsetting', 'typography', 'tool', 'optimization'] },
  { id: 'icon-library', title: 'Icon Library', description: 'Upload and manage icon sets from Material and Lucide', category: 'Design Assets', path: '/design-assets/icons', icon: 'star', tags: ['icons', 'assets'] },
  { id: 'country-flags', title: 'Country Flags', description: 'Collection of country flag assets for use in your designs', category: 'Design Assets', path: '/design-assets/country-flags', icon: 'flag', tags: ['flags', 'countries', 'assets'] },
  { id: 'usg-seals', title: 'USG Seals', description: 'Official US Government seals and emblems for authorized use', category: 'Design Assets', path: '/design-assets/usg-seals', icon: 'verified', tags: ['seals', 'usg', 'government', 'assets'] },
  { id: 'internal-seals', title: 'Internal Seals', description: 'Internal organizational seals and emblems for agency use', category: 'Design Assets', path: '/design-assets/internal-seals', icon: 'security', tags: ['seals', 'internal', 'organizational', 'assets'] },
  { id: 'interactives', title: 'Interactives', description: 'Interactive design assets and components for enhanced user experiences', category: 'Design Assets', path: '/design-assets/interactives', icon: 'touch_app', tags: ['interactive', 'components', 'assets'] },
  { id: 'stock-photos', title: 'Stock Photos', description: 'Curated collection of stock photography for use in your projects', category: 'Design Assets', path: '/design-assets/stock-photos', icon: 'photo_library', tags: ['photos', 'stock', 'photography', 'assets'] },
  { id: 'illustrations', title: 'Illustrations', description: 'Curated illustration collections for your designs', category: 'Design Assets', path: '/design-assets/illustrations', icon: 'draw', tags: ['illustrations', 'art', 'assets'] },
  { id: 'capability-logos', title: 'Capability Logos', description: 'Logos and branding assets for specific capabilities and services', category: 'Design Assets', path: '/design-assets/capability-logos', icon: 'workspace_premium', tags: ['logos', 'capability', 'branding', 'assets'] },
  { id: 'company-logos', title: 'Company Logos', description: 'Company and organization logos for partnership and collaboration materials', category: 'Design Assets', path: '/design-assets/company-logos', icon: 'business', tags: ['logos', 'company', 'organizations', 'assets'] },
  { id: 'color-converter', title: 'Color Converter', description: 'Convert colors between different formats (HEX, RGB, HSL, etc.)', category: 'Tools', path: '/tools/color-converter', icon: 'palette', tags: ['color', 'converter', 'tool'] },
  { id: 'nasa-tlx', title: 'NASA-TLX', description: 'Assess task workload across six dimensions for usability analysis', category: 'Tools', path: '/tools/nasa-tlx', icon: 'psychology', tags: ['usability', 'workload', 'assessment', 'nasa-tlx'] },
  { id: 'sus', title: 'System Usability Scale', description: 'Quick and reliable tool for measuring system usability', category: 'Tools', path: '/tools/sus', icon: 'psychology', tags: ['usability', 'sus', 'assessment', 'scale'] },
  { id: 'heuristic-evaluation', title: 'Heuristic Evaluation', description: 'Evaluate interfaces using Nielsen\'s 10 Usability Heuristics', category: 'Tools', path: '/tools/heuristic-evaluation', icon: 'checklist', tags: ['usability', 'heuristics', 'nielsen', 'evaluation', 'checklist'] },
  { id: 'user-persona-generator', title: 'User Persona Generator', description: 'Create detailed user personas from research data to inform design decisions', category: 'HCD', path: '/research/user-personas', icon: 'person', tags: ['persona', 'user-research', 'research', 'user-profile', 'archetype', 'hcd'] },
  { id: 'png-to-ico', title: 'PNG to ICO Converter', description: 'Convert PNG images to ICO format for favicons and app icons', category: 'Tools', path: '/tools/png-to-ico', icon: 'image', tags: ['image', 'converter', 'ico', 'favicon', 'icon'] },
  { id: 'alt-text-generator', title: 'Alt Text Generator', description: 'Generate accessible, descriptive alt text for images to improve web accessibility and SEO', category: 'Tools', path: '/tools/alt-text-generator', icon: 'text_fields', tags: ['alt-text', 'accessibility', 'images', 'seo', 'a11y'] },
  { id: 'color-contrast', title: 'Color Contrast Checker', description: 'Check color contrast ratios for accessibility', category: 'Tools', path: '/tools/color-contrast', icon: 'contrast', tags: ['color', 'accessibility', 'contrast'] },
  { id: 'gradient-generator', title: 'Gradient Generator', description: 'Create beautiful gradients with custom stops and directions', category: 'Tools', path: '/tools/gradient-generator', icon: 'gradient', tags: ['gradient', 'color', 'tool'] },
  { id: 'lorem-ipsum', title: 'Lorem Ipsum Generator', description: 'Generate placeholder text with various options', category: 'Tools', path: '/tools/lorem-ipsum', icon: 'text_fields', tags: ['text', 'placeholder', 'tool'] },
  { id: 'seo-tagging', title: 'SEO Tagging Generator', description: 'Generate SEO meta tags for your pages', category: 'Tools', path: '/tools/seo-tagging', icon: 'search', tags: ['seo', 'meta', 'tool'] },
  { id: 'color-scale', title: 'Color Scale Generator', description: 'Generate color scales with accessibility checks', category: 'Tools', path: '/tools/color-scale', icon: 'palette', tags: ['color', 'scale', 'accessibility'] },
  { id: 'admin-health', title: 'System Health', description: 'Monitor your design system\'s health, track adoption, and identify improvements', category: 'Admin', path: '/admin/health', icon: 'space_dashboard', tags: ['health', 'metrics', 'analytics'] },
  { id: 'admin-governance', title: 'Design System Governance', description: 'Enforce design system rules and check compliance', category: 'Admin', path: '/admin/governance', icon: 'admin_panel_settings', tags: ['governance', 'compliance', 'rules'] },
  { id: 'admin-audit', title: 'Audit Logs', description: 'Track and monitor all user actions, API calls, and system events', category: 'Admin', path: '/admin/audit', icon: 'history', tags: ['audit', 'logs', 'tracking', 'monitoring'] },
  { id: 'admin-roles', title: 'Role Management', description: 'Manage user roles and their access to design system features and permissions', category: 'Admin', path: '/admin/roles', icon: 'admin_panel_settings', tags: ['roles', 'permissions', 'rbac', 'access', 'management'] },
  { id: 'admin-feature-flags', title: 'Feature Flags', description: 'Control feature availability across your design system. Turn features on or off, target specific users or groups, and manage gradual rollouts', category: 'Admin', path: '/admin/feature-flags', icon: 'flag', tags: ['feature flags', 'feature toggles', 'rollout', 'targeting', 'openfeature'] },
  { id: 'admin-content', title: 'Component and Pattern Lifecycle Management', description: 'Create new pattern or component pages and edit/update statuses of existing pages', category: 'Admin', path: '/admin/content', icon: 'edit_document', tags: ['content', 'lifecycle', 'components', 'patterns', 'status', 'management'] },
  { id: 'admin-applications', title: 'Application Management', description: 'Register applications, manage capabilities, and configure scanners for governance, visual regression, and session replay', category: 'Admin', path: '/admin/applications', icon: 'apps', tags: ['applications', 'registration', 'governance', 'visual-regression', 'session-replay'] },
  { id: 'admin-applications-register', title: 'Application Registration', description: 'Register a new application with the design system and enable/disable scanners and capabilities', category: 'Admin', path: '/admin/applications/register', icon: 'add_circle', tags: ['applications', 'registration', 'onboarding', 'capabilities'] },
  { id: 'handoff-tools', title: 'Design-Dev Handoff', description: 'Generate specs, export assets, and measure designs', category: 'Review', path: '/review/handoff', icon: 'swap_horiz', tags: ['handoff', 'specs', 'export'] },
  { id: 'change-notifications', title: 'Change Notifications', description: 'Stay informed about component and token changes', category: 'Tools', path: '/notifications', icon: 'notifications', tags: ['notifications', 'changes', 'alerts'] },
  { id: 'ai-suggestions', title: 'AI-Powered Suggestions', description: 'Get intelligent recommendations for components and accessibility', category: 'Tools', path: '/ai-suggestions', icon: 'psychology', tags: ['ai', 'suggestions', 'accessibility'] },
  { id: 'multi-brand', title: 'Multi-Brand Support', description: 'Manage multiple brands and white-label systems', category: 'Tools', path: '/brands', icon: 'apps', tags: ['brands', 'white-label', 'themes'] },
  { id: 'theme-builder', title: 'Theme Builder', description: 'Visually customize your design system theme', category: 'Tools', path: '/theme-builder', icon: 'tune', tags: ['theme', 'customization', 'colors'] },
  { id: 'component-composition', title: 'Component Composition', description: 'Build complex components from primitives', category: 'Components', path: '/components/composition', icon: 'view_quilt', tags: ['composition', 'primitives', 'builder'] },
  { id: 'guidelines-colors', title: 'Color Guidelines', description: 'Color system and usage guidelines', category: 'Guidelines', path: '/colors', icon: 'palette', tags: ['guidelines', 'color', 'colors', 'palette', 'design-tokens'] },
  { id: 'guidelines-typography', title: 'Typography Guidelines', description: 'Typography system and best practices', category: 'Guidelines', path: '/typography', icon: 'text_fields', tags: ['guidelines', 'typography', 'fonts', 'text', 'type'] },
  { id: 'guidelines-spacing', title: 'Spacing Guidelines', description: 'Spacing system and layout guidelines', category: 'Guidelines', path: '/spacing', icon: 'space_dashboard', tags: ['guidelines', 'spacing', 'layout', 'margin', 'padding'] },
  { id: 'guidelines-shadows', title: 'Shadow Guidelines', description: 'Shadow system and elevation guidelines', category: 'Guidelines', path: '/shadows', icon: 'layers', tags: ['guidelines', 'shadows', 'elevation', 'depth', 'layers'] },
  { id: 'guidelines-accessibility', title: 'Accessibility Guidelines', description: 'Accessibility standards and best practices for inclusive design', category: 'Guidelines', path: '/accessibility', icon: 'accessibility', tags: ['guidelines', 'accessibility', 'a11y', 'wcag', 'inclusive', 'design'] },
  { id: 'guidelines-tui', title: 'Terminal UI (TUI) Guidance', description: 'Design standards for Terminal User Interfaces (TUIs) across command-line and console-based applications', category: 'Guidelines', path: '/tui-guidance', icon: 'terminal', tags: ['guidelines', 'tui', 'terminal', 'cli', 'command-line', 'console', 'ncurses', 'accessibility', 'scriptability'] },
  { id: 'performance-analysis', title: 'Performance Analysis', description: 'Analyze bundle sizes and set performance budgets', category: 'Admin', path: '/admin/performance', icon: 'speed', tags: ['performance', 'budgets', 'bundle', 'size', 'analysis', 'monitoring'] },
  { id: 'visual-regression', title: 'Visual Regression Testing', description: 'Catch visual bugs before production with automated visual testing powered by Argos', category: 'Tools', path: '/tools/visual-regression', icon: 'compare', tags: ['visual-regression', 'testing', 'argos', 'screenshots', 'qa'] },
  { id: 'session-replay', title: 'Session Replay', description: 'See exactly what users experience with session replay and heatmaps for your applications', category: 'HCD', path: '/hcd/session-replay', icon: 'videocam', tags: ['session-replay', 'openreplay', 'heatmaps', 'user-analytics', 'monitoring'] },
  { id: 'photosensitivity-analysis', title: 'Photosensitivity Analysis', description: 'Analyze video content for photosensitive epileptic risks using IRIS', category: 'Tools', path: '/tools/photosensitivity', icon: 'visibility', tags: ['photosensitivity', 'iris', 'accessibility', 'video', 'epilepsy', 'a11y'] },
  { id: 'ai-overview', title: 'AI Overview', description: 'Explore AI-powered features and capabilities in the design system', category: 'AI', path: '/ai', icon: 'psychology', tags: ['ai', 'artificial-intelligence', 'overview', 'features'] },
  { id: 'ai-patterns', title: 'AI Patterns', description: 'AI-generated design patterns and recommendations', category: 'AI', path: '/ai/patterns', icon: 'pattern', tags: ['ai', 'patterns', 'design', 'recommendations'] },
  { id: 'ai-components', title: 'AI Components', description: 'AI-generated component suggestions and recommendations', category: 'AI', path: '/ai/components', icon: 'widgets', tags: ['ai', 'components', 'suggestions', 'recommendations'] },
  { id: 'review-management', title: 'Review Management', description: 'Manage review workflows, teams, and review links', category: 'Review', path: '/review/management', icon: 'folder_kanban', tags: ['review', 'management', 'workflow', 'teams', 'kanban'] },
  { id: 'roadmap-feedback', title: 'Roadmap & Feedback', description: 'View roadmap, submit feedback, and see what\'s new', category: 'Tools', path: '/feedback', icon: 'new_releases', tags: ['roadmap', 'feedback', 'requests', 'whats-new'] },
  { id: 'chart-builder', title: 'Chart Builder', description: 'Create interactive charts and data visualizations with customizable options', category: 'Tools', path: '/tools/chart-builder', icon: 'bar_chart', tags: ['chart', 'data-visualization', 'graph', 'chartjs', 'tool'] },
  { id: 'timeline-generator', title: 'Timeline Generator', description: 'Create interactive timelines with events, dates, and custom styling', category: 'Tools', path: '/tools/timeline-generator', icon: 'timeline', tags: ['timeline', 'events', 'history', 'visualization', 'tool'] },
  { id: 'table-generator', title: 'Table Generator', description: 'Generate data tables with sorting, filtering, and pagination', category: 'Tools', path: '/tools/table-generator', icon: 'table_chart', tags: ['table', 'datatable', 'data', 'sorting', 'filtering', 'tool'] },
  { id: 'map-maker', title: 'Map Maker', description: 'Create choropleth maps and flow maps with customizable data visualization', category: 'Tools', path: '/tools/map-maker', icon: 'map', tags: ['map', 'choropleth', 'flow-map', 'geographic', 'data-visualization', 'tool'] },
  { id: 'palette-builder', title: 'Palette Builder', description: 'Build and customize color palettes for your design system', category: 'Tools', path: '/palette-builder', icon: 'palette', tags: ['palette', 'color', 'builder', 'design-tokens', 'tool'] },
  { id: 'font-scale', title: 'Font Scale', description: 'Typography scale and sizing system generator', category: 'Tools', path: '/tools/font-scale', icon: 'format_size', tags: ['font', 'scale', 'typography', 'sizing', 'tool'] },
  { id: 'font-stack', title: 'Font Stack & Subsetting', description: 'Build font stacks with fallback fonts and optimize Google Fonts by subsetting character sets', category: 'Tools', path: '/tools/font-stack', icon: 'layers', tags: ['font', 'stack', 'subsetting', 'typography', 'optimization', 'tool'] },
  { id: 'spacing-scale', title: 'Spacing Scale Generator', description: 'Generate consistent spacing scales for your design system', category: 'Tools', path: '/tools/spacing-scale', icon: 'space_dashboard', tags: ['spacing', 'scale', 'margin', 'padding', 'layout', 'tool'] },
  { id: 'box-shadow', title: 'Box Shadow Generator', description: 'Generate CSS box shadows with customizable properties', category: 'Tools', path: '/tools/box-shadow', icon: 'layers', tags: ['shadow', 'box-shadow', 'css', 'elevation', 'tool'] },
  { id: 'border-radius', title: 'Border Radius Generator', description: 'Generate border radius values for rounded corners', category: 'Tools', path: '/tools/border-radius', icon: 'rounded_corner', tags: ['border-radius', 'rounded', 'corners', 'css', 'tool'] },
  { id: 'html-viewer', title: 'HTML Viewer', description: 'Preview and inspect HTML code in a live viewer', category: 'Tools', path: '/tools/html-viewer', icon: 'preview', tags: ['html', 'viewer', 'preview', 'code', 'tool'] },
  { id: 'html-escaper', title: 'HTML Escaper', description: 'Escape and unescape HTML entities and special characters', category: 'Tools', path: '/tools/html-escaper', icon: 'lock', tags: ['html', 'escape', 'entities', 'security', 'tool'] },
  { id: 'px-converter', title: 'PX Unit Converter', description: 'Convert pixel values to other CSS units (rem, em, pt, etc.)', category: 'Tools', path: '/tools/px-converter', icon: 'straighten', tags: ['px', 'converter', 'units', 'css', 'rem', 'em', 'tool'] },
  { id: 'css-converter', title: 'CSS Converter', description: 'Convert CSS between different formats and syntaxes', category: 'Tools', path: '/tools/css-converter', icon: 'code', tags: ['css', 'converter', 'syntax', 'format', 'tool'] },
  { id: 'image-compressor', title: 'Image Compressor', description: 'Compress and optimize images to reduce file size while maintaining quality', category: 'Tools', path: '/tools/image-compressor', icon: 'compress', tags: ['image', 'compressor', 'optimization', 'file-size', 'tool'] },
  { id: 'css-animation', title: 'CSS Animation Generator', description: 'Generate CSS animations and keyframes with customizable properties', category: 'Tools', path: '/tools/css-animation', icon: 'animation', tags: ['css', 'animation', 'keyframes', 'transitions', 'tool'] },
  // Overview pages
  { id: 'components-overview', title: 'Components', description: 'Browse and explore all design system components', category: 'Components', path: '/components', icon: 'widgets', tags: ['components', 'overview', 'library'] },
  { id: 'tokens-overview', title: 'Tokens', description: 'Explore design tokens, color palettes, and style systems', category: 'Tokens', path: '/tokens', icon: 'tune', tags: ['tokens', 'overview', 'design-tokens'] },
  { id: 'patterns-overview', title: 'Patterns', description: 'Browse design patterns and best practices', category: 'Patterns', path: '/patterns', icon: 'pattern', tags: ['patterns', 'overview', 'design-patterns'] },
  { id: 'tools-overview', title: 'Tools', description: 'Access design and development tools', category: 'Tools', path: '/tools', icon: 'build', tags: ['tools', 'overview', 'utilities'] },
  { id: 'fonts-overview', title: 'Fonts', description: 'Browse typography resources and font tools', category: 'Design Assets', path: '/fonts', icon: 'text_fields', tags: ['fonts', 'typography', 'overview'] },
  { id: 'design-assets-overview', title: 'Design Assets', description: 'Browse icons, fonts, illustrations, and other design assets', category: 'Design Assets', path: '/design-assets', icon: 'collections', tags: ['design-assets', 'assets', 'overview'] },
  { id: 'review-overview', title: 'Review', description: 'Review system for design and development collaboration', category: 'Review', path: '/review', icon: 'rate_review', tags: ['review', 'collaboration', 'overview'] },
  { id: 'guidelines-overview', title: 'Guidelines', description: 'Design guidelines and documentation', category: 'Guidelines', path: '/guidelines', icon: 'menu_book', tags: ['guidelines', 'documentation', 'overview'] },
  // For pages
  { id: 'for-designers', title: 'For Designers', description: 'Resources and tools specifically for designers', category: 'Getting Started', path: '/for-designers', icon: 'palette', tags: ['designers', 'resources', 'tools'] },
  { id: 'for-developers', title: 'For Developers', description: 'Resources and tools specifically for developers', category: 'Getting Started', path: '/for-developers', icon: 'code', tags: ['developers', 'resources', 'tools'] },
  { id: 'for-researchers', title: 'For Researchers', description: 'Resources and tools specifically for researchers', category: 'Getting Started', path: '/for-researchers', icon: 'science', tags: ['researchers', 'resources', 'tools'] },
  // Component pages
  { id: 'component-export', title: 'Component Library Export', description: 'Export component libraries and documentation', category: 'Components', path: '/components/export', icon: 'download', tags: ['export', 'library', 'components'] },
  { id: 'component-deprecation', title: 'Deprecation Manager', description: 'Manage component deprecations and migrations', category: 'Components', path: '/components/deprecation', icon: 'warning', tags: ['deprecation', 'migration', 'components'] },
  { id: 'badge-generator', title: 'Badge Generator', description: 'Generate badge components with customizable styles', category: 'Components', path: '/components/badge-generator', icon: 'badge', tags: ['badge', 'generator', 'components'] },
  { id: 'progress-generator', title: 'Progress Generator', description: 'Generate progress bar components', category: 'Components', path: '/components/progress-generator', icon: 'progress_activity', tags: ['progress', 'generator', 'components'] },
  { id: 'loading-generator', title: 'Loading Spinner Generator', description: 'Generate loading spinner components', category: 'Components', path: '/components/loading-generator', icon: 'refresh', tags: ['loading', 'spinner', 'generator', 'components'] },
  { id: 'component-scaffold', title: 'Component Scaffolding Wizard', description: 'Scaffold new components with best practices', category: 'Components', path: '/components/scaffold', icon: 'auto_awesome', tags: ['scaffold', 'wizard', 'components', 'generator'] },
  { id: 'component-testing', title: 'Component Testing', description: 'Test components and ensure quality', category: 'Components', path: '/components/testing', icon: 'science', tags: ['testing', 'components', 'qa'] },
  { id: 'component-documentation', title: 'Documentation Generator', description: 'Generate component documentation automatically', category: 'Components', path: '/components/documentation', icon: 'description', tags: ['documentation', 'generator', 'components'] },
  { id: 'component-dependencies', title: 'Component Dependency Graph', description: 'Visualize component dependencies and relationships', category: 'Components', path: '/admin/dependencies', icon: 'account_tree', tags: ['dependencies', 'graph', 'components'] },
  { id: 'component-examples', title: 'Component Examples', description: 'Browse component examples and use cases', category: 'Components', path: '/components/examples', icon: 'view_module', tags: ['examples', 'components', 'use-cases'] },
  { id: 'component-feedback', title: 'Component Feedback', description: 'Submit and manage feedback for components', category: 'Components', path: '/components/feedback', icon: 'feedback', tags: ['feedback', 'components'] },
  { id: 'component-versions', title: 'Component Versions', description: 'Track component versions and changelogs', category: 'Components', path: '/components/versions', icon: 'history', tags: ['versions', 'changelog', 'components'] },
  // Token pages
  { id: 'token-playground', title: 'Token Playground', description: 'Experiment with design tokens in an interactive playground', category: 'Tokens', path: '/tokens/playground', icon: 'play_arrow', tags: ['tokens', 'playground', 'experiment'] },
  { id: 'color-palettes', title: 'Color Palettes', description: 'Browse and manage color palettes', category: 'Tokens', path: '/tokens/color-palettes', icon: 'palette', tags: ['color', 'palettes', 'tokens'] },
  { id: 'harmony-palette', title: 'Harmony Palette', description: 'Create harmonious color palettes', category: 'Tokens', path: '/tokens/color-palettes/harmony', icon: 'color_lens', tags: ['harmony', 'color', 'palette', 'tokens'] },
  { id: 'colored-text-palette', title: 'Colored Text Palette', description: 'Generate accessible colored text palettes', category: 'Tokens', path: '/tokens/color-palettes/colored-text', icon: 'format_color_text', tags: ['colored-text', 'color', 'palette', 'tokens', 'accessibility'] },
  { id: 'token-migration', title: 'Token Migration', description: 'Migrate and update design tokens', category: 'Tokens', path: '/tokens/migration', icon: 'swap_horiz', tags: ['migration', 'tokens', 'update'] },
  { id: 'token-relationships', title: 'Token Relationships', description: 'Visualize token relationships and dependencies', category: 'Tokens', path: '/tokens/relationships', icon: 'share', tags: ['relationships', 'tokens', 'dependencies'] },
  { id: 'token-sync', title: 'Token Sync', description: 'Synchronize tokens across platforms and tools', category: 'Tokens', path: '/tokens/sync', icon: 'sync', tags: ['sync', 'tokens', 'synchronization'] },
  { id: 'design-extractor', title: 'Design Extractor', description: 'Extract design tokens from design files', category: 'Tokens', path: '/tokens/extract', icon: 'extract', tags: ['extract', 'tokens', 'design-files'] },
  { id: 'ai-token-builder', title: 'AI Token Builder', description: 'Build design tokens with AI assistance', category: 'Tokens', path: '/tokens/ai-builder', icon: 'auto_awesome', tags: ['ai', 'tokens', 'builder', 'generator'] },
  { id: 'design-sync', title: 'Design Sync', description: 'Sync designs between tools and platforms', category: 'Tools', path: '/design-sync', icon: 'sync', tags: ['design-sync', 'sync', 'tools'] },
  // HCD/Research pages
  { id: 'hcd-principles', title: 'HCD Principles', description: 'Human-centered design principles and guidelines', category: 'HCD', path: '/hcd/principles', icon: 'lightbulb', tags: ['hcd', 'principles', 'human-centered-design'] },
  { id: 'hcd-research', title: 'HCD Research', description: 'User research methods and practices', category: 'HCD', path: '/hcd/research', icon: 'science', tags: ['hcd', 'research', 'user-research'] },
  { id: 'hcd-accessibility', title: 'HCD Accessibility', description: 'Accessibility in human-centered design', category: 'HCD', path: '/hcd/accessibility', icon: 'accessibility', tags: ['hcd', 'accessibility', 'a11y'] },
  { id: 'laws-of-ux', title: 'Laws of UX', description: 'Explore fundamental laws and principles of user experience design', category: 'HCD', path: '/hcd/laws-of-ux', icon: 'gavel', tags: ['laws-of-ux', 'ux', 'principles', 'hcd'] },
  { id: 'hcd-process', title: 'HCD Process', description: 'Human-centered design process and methodology', category: 'HCD', path: '/hcd/process', icon: 'timeline', tags: ['hcd', 'process', 'methodology'] },
  { id: 'recruiting-users', title: 'Recruiting Users', description: 'Guidelines and tools for recruiting research participants', category: 'HCD', path: '/hcd/recruiting-users', icon: 'people', tags: ['recruiting', 'users', 'research', 'hcd'] },
  { id: 'conducting-interviews', title: 'Conducting Interviews', description: 'Best practices for conducting user interviews', category: 'HCD', path: '/hcd/conducting-interviews', icon: 'mic', tags: ['interviews', 'user-research', 'hcd'] },
  { id: 'research-reports', title: 'Research Reports', description: 'Create and manage user research reports', category: 'HCD', path: '/hcd/research-reports', icon: 'description', tags: ['research-reports', 'reports', 'hcd'] },
  { id: 'research-methods', title: 'Research Methods', description: 'User research methods and techniques', category: 'HCD', path: '/hcd/research-methods', icon: 'psychology', tags: ['research-methods', 'methods', 'hcd'] },
  { id: 'hcd-council', title: 'HCD Council', description: 'Human-centered design council and governance', category: 'HCD', path: '/hcd/council', icon: 'groups', tags: ['hcd-council', 'council', 'governance', 'hcd'] },
  { id: 'journey-maps', title: 'Journey Maps', description: 'Create and visualize user journey maps', category: 'HCD', path: '/research/journey-maps', icon: 'map', tags: ['journey-maps', 'user-journey', 'research', 'hcd'] },
  { id: 'hcd-reports', title: 'HCD Reports', description: 'Browse human-centered design research reports', category: 'HCD', path: '/research/hcd-reports', icon: 'description', tags: ['hcd-reports', 'reports', 'research', 'hcd'] },
  { id: 'user-studies', title: 'User Studies', description: 'Browse and manage user studies', category: 'HCD', path: '/research/user-studies', icon: 'science', tags: ['user-studies', 'studies', 'research', 'hcd'] },
  { id: 'research-insights', title: 'Research Insights', description: 'Key insights from user research', category: 'HCD', path: '/research/insights', icon: 'insights', tags: ['research-insights', 'insights', 'research', 'hcd'] },
  { id: 'research-artifacts', title: 'Research Artifacts', description: 'Browse research artifacts and documentation', category: 'HCD', path: '/research/artifacts', icon: 'folder', tags: ['research-artifacts', 'artifacts', 'research', 'hcd'] },
  // Getting Started foundations
  { id: 'atomic-design', title: 'Atomic Design', description: 'Learn about atomic design methodology', category: 'Getting Started', path: '/getting-started/foundations/atomic-design', icon: 'science', tags: ['atomic-design', 'methodology', 'foundations'] },
  { id: 'building-trust', title: 'Building Trust', description: 'Design principles for building user trust', category: 'Getting Started', path: '/getting-started/foundations/building-trust', icon: 'verified', tags: ['trust', 'foundations', 'principles'] },
  { id: 'responsiveness', title: 'Responsiveness', description: 'Responsive design principles and practices', category: 'Getting Started', path: '/getting-started/foundations/responsiveness', icon: 'devices', tags: ['responsiveness', 'responsive', 'foundations'] },
  { id: 'usability', title: 'Usability', description: 'Usability principles and best practices', category: 'Getting Started', path: '/getting-started/foundations/usability', icon: 'touch_app', tags: ['usability', 'foundations', 'ux'] },
  { id: 'writing-content', title: 'Writing Content', description: 'Content writing guidelines and best practices', category: 'Getting Started', path: '/getting-started/foundations/writing-content', icon: 'edit', tags: ['content', 'writing', 'foundations'] },
  { id: 'purpose-and-benefits', title: 'Purpose and Benefits', description: 'Understand the purpose and benefits of the design system', category: 'Getting Started', path: '/getting-started/purpose-and-benefits', icon: 'info', tags: ['purpose', 'benefits', 'getting-started'] },
  { id: 'guidelines-voice-tone', title: 'Voice and Tone', description: 'Content voice and tone guidelines', category: 'Guidelines', path: '/guidelines/voice-and-tone', icon: 'record_voice_over', tags: ['voice', 'tone', 'content', 'guidelines'] },
  // Tools
  { id: 'svg-placeholder-text', title: 'SVG Placeholder Text Generator', description: 'Generate SVG placeholder text for designs', category: 'Tools', path: '/tools/svg-placeholder-text', icon: 'text_fields', tags: ['svg', 'placeholder', 'text', 'generator', 'tool'] },
  { id: 'apca-calculator', title: 'APCA Calculator', description: 'Calculate Advanced Perceptual Contrast Algorithm values', category: 'Tools', path: '/tools/apca-calculator', icon: 'calculate', tags: ['apca', 'contrast', 'accessibility', 'calculator', 'tool'] },
  { id: 'design-system-api', title: 'Design System API', description: 'Access the design system via API', category: 'Tools', path: '/api', icon: 'api', tags: ['api', 'design-system', 'integration'] },
  { id: 'design-system-search', title: 'Design System Search', description: 'Advanced search for design system content', category: 'Tools', path: '/search', icon: 'search', tags: ['search', 'design-system'] },
  // Admin pages
  { id: 'admin-workspaces', title: 'Workspace Management', description: 'Manage workspaces and teams', category: 'Admin', path: '/admin/workspaces', icon: 'workspace', tags: ['workspaces', 'teams', 'admin'] },
  { id: 'admin-users', title: 'User Management', description: 'Manage users and permissions', category: 'Admin', path: '/admin/users', icon: 'people', tags: ['users', 'permissions', 'admin'] },
  { id: 'admin-accessibility-reports', title: 'Accessibility Reports', description: 'View and manage accessibility reports', category: 'Admin', path: '/admin/accessibility-reports', icon: 'accessibility', tags: ['accessibility', 'reports', 'admin', 'a11y'] },
  // Reference pages
  { id: 'jaws-commands', title: 'JAWS Commands', description: 'Reference guide for JAWS screen reader commands and keyboard shortcuts', category: 'Tools', path: '/tools/references/jaws-commands', icon: 'keyboard', tags: ['jaws', 'screen-reader', 'accessibility', 'keyboard', 'commands', 'reference', 'a11y'] },
  { id: 'penpot-for-beginners', title: 'Penpot for Beginners', description: 'Getting started guide for Penpot design tool', category: 'Tools', path: '/tools/references/penpot-for-beginners', icon: 'draw', tags: ['penpot', 'design-tool', 'tutorial', 'beginners', 'reference'] },
  { id: 'units-of-measure', title: 'Units of Measure', description: 'Reference guide for units of measurement in design and development', category: 'Tools', path: '/tools/references/units-of-measure', icon: 'straighten', tags: ['units', 'measurement', 'reference', 'design', 'development'] },
  // Pattern pages (under /guidelines/patterns/)
  { id: 'agent-oriented-onboarding', title: 'Agent-Oriented Onboarding', description: 'Design patterns for AI agent onboarding experiences', category: 'Patterns', path: '/guidelines/patterns/agent-oriented-onboarding', icon: 'rocket_launch', tags: ['pattern', 'onboarding', 'ai', 'agent', 'interaction'] },
  { id: 'ai-disengagement-timeout-error', title: 'AI Disengagement Timeout Error', description: 'Patterns for handling AI disengagement and timeout errors', category: 'Patterns', path: '/guidelines/patterns/ai-disengagement-timeout-error', icon: 'timer_off', tags: ['pattern', 'ai', 'error', 'timeout', 'disengagement', 'interaction'] },
  { id: 'ai-thinking-states', title: 'AI Thinking States', description: 'Design patterns for displaying AI thinking and processing states', category: 'Patterns', path: '/guidelines/patterns/ai-thinking-states', icon: 'psychology', tags: ['pattern', 'ai', 'thinking', 'states', 'loading', 'interaction'] },
  { id: 'empty-loading-states', title: 'Empty Loading States', description: 'Design patterns for empty and loading states in user interfaces', category: 'Patterns', path: '/guidelines/patterns/empty-loading-states', icon: 'hourglass_empty', tags: ['pattern', 'empty', 'loading', 'states', 'ui', 'design'] },
  { id: 'error-handling', title: 'Error Handling', description: 'Design patterns for error handling and user feedback', category: 'Patterns', path: '/guidelines/patterns/error-handling', icon: 'error', tags: ['pattern', 'error', 'handling', 'feedback', 'ui', 'design'] },
  { id: 'multi-agent-orchestration', title: 'Multi-Agent Orchestration', description: 'Design patterns for orchestrating multiple AI agents', category: 'Patterns', path: '/guidelines/patterns/multi-agent-orchestration', icon: 'account_tree', tags: ['pattern', 'ai', 'agents', 'orchestration', 'multi-agent', 'interaction'] },
  { id: 'new-features-experiences', title: 'New Features Experiences', description: 'Design patterns for introducing new features to users', category: 'Patterns', path: '/guidelines/patterns/new-features-experiences', icon: 'new_releases', tags: ['pattern', 'features', 'onboarding', 'discovery', 'ui', 'design'] },
  // Guideline pages
  { id: 'color-contrast', title: 'Color Contrast', description: 'Guidelines for color contrast and accessibility in design', category: 'Guidelines', path: '/guidelines/color-contrast', icon: 'contrast', tags: ['guidelines', 'color', 'contrast', 'accessibility', 'a11y', 'wcag'] },
  { id: 'content-organization-navigation', title: 'Content Organization Navigation', description: 'Guidelines for organizing content and navigation structures', category: 'Guidelines', path: '/guidelines/content-organization-navigation', icon: 'navigation', tags: ['guidelines', 'content', 'organization', 'navigation', 'information-architecture'] },
  { id: 'css-grid-layout', title: 'CSS Grid Layout', description: 'Guidelines for using CSS Grid in layout design', category: 'Guidelines', path: '/guidelines/css-grid-layout', icon: 'view_quilt', tags: ['guidelines', 'css', 'grid', 'layout', 'design'] },
  { id: 'flashing', title: 'Flashing', description: 'Guidelines for handling flashing content and photosensitivity', category: 'Guidelines', path: '/guidelines/flashing', icon: 'flash_on', tags: ['guidelines', 'flashing', 'photosensitivity', 'accessibility', 'a11y', 'epilepsy'] },
  { id: 'focus', title: 'Focus', description: 'Guidelines for keyboard focus and accessibility', category: 'Guidelines', path: '/guidelines/focus', icon: 'center_focus_strong', tags: ['guidelines', 'focus', 'keyboard', 'accessibility', 'a11y'] },
  { id: 'iconography', title: 'Iconography', description: 'Guidelines for icon design and usage', category: 'Guidelines', path: '/guidelines/iconography', icon: 'image', tags: ['guidelines', 'icons', 'iconography', 'design', 'visual'] },
  { id: 'information-architecture', title: 'Information Architecture', description: 'Guidelines for information architecture and content structure', category: 'Guidelines', path: '/guidelines/information-architecture', icon: 'account_tree', tags: ['guidelines', 'information-architecture', 'ia', 'structure', 'content'] },
  { id: 'keyboard-gestures', title: 'Keyboard Gestures', description: 'Guidelines for keyboard gestures and shortcuts', category: 'Guidelines', path: '/guidelines/keyboard-gestures', icon: 'keyboard', tags: ['guidelines', 'keyboard', 'gestures', 'shortcuts', 'accessibility', 'a11y'] },
  { id: 'metadata-seo', title: 'Metadata SEO', description: 'Guidelines for metadata and SEO best practices', category: 'Guidelines', path: '/guidelines/metadata-seo', icon: 'search', tags: ['guidelines', 'metadata', 'seo', 'search', 'optimization'] },
  { id: 'multimedia-animation', title: 'Multimedia Animation', description: 'Guidelines for multimedia and animation in design', category: 'Guidelines', path: '/guidelines/multimedia-animation', icon: 'animation', tags: ['guidelines', 'multimedia', 'animation', 'video', 'motion'] },
  { id: 'text-graphics', title: 'Text Graphics', description: 'Guidelines for combining text and graphics in design', category: 'Guidelines', path: '/guidelines/text-graphics', icon: 'text_fields', tags: ['guidelines', 'text', 'graphics', 'typography', 'visual'] },
  { id: 'time', title: 'Time', description: 'Guidelines for time-based interactions and displays', category: 'Guidelines', path: '/guidelines/time', icon: 'schedule', tags: ['guidelines', 'time', 'temporal', 'interactions', 'display'] },
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
    component: 'widgets',
    token: 'tune',
    pattern: 'pattern',
    guideline: 'description',
    workspace: 'workspace',
    application: 'apps',
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
const recentActivity = ref([]);
const breakingChangeNotifications = ref([]);
const systemNotifications = ref([]);
const notificationTab = ref('all');

const totalNotificationCount = computed(() => {
  return breakingChangeNotifications.value.length + recentActivity.value.length;
});

// The signed-in user, as the review UI sees them
const reviewUser = computed(() => getCurrentUser());
const currentUser = computed(() => reviewUser.value.name);
const currentUserEmail = computed(() => reviewUser.value.email);
const currentUserRole = computed(() => reviewUser.value.role);

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

// Toggle notifications dropdown
const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
  if (showNotifications.value) closeUserMenu(false);
};

// Close notifications dropdown
const closeNotifications = () => {
  showNotifications.value = false;
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

// Load breaking change notifications
const loadBreakingChangeNotifications = async () => {
  try {
    // Mock breaking change notifications - in real app, this would come from an API
    breakingChangeNotifications.value = [
      {
        id: 'breaking-button-2.0.0',
        componentId: 'button',
        componentName: 'Button',
        version: '2.0.0',
        message: 'Breaking changes in Button v2.0.0: "type" prop renamed to "variant"',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        link: '/components/buttons'
      }
    ];
  } catch (error) {
    console.error('Failed to load breaking change notifications:', error);
  }
};

// Navigate to component page
const goToComponent = (componentId) => {
  const routeMap = {
    'button': '/components/buttons',
    'color-picker': '/components/color-picker',
    'input': '/components/forms',
    'card': '/components/cards'
  };
  const route = routeMap[componentId] || `/components/${componentId}`;
  router.push(route);
  closeNotifications();
};

// Load recent activity for designer
const loadRecentActivity = async () => {
  if (currentUserRole.value !== 'designer') return;
  
  try {
    const useMockMode = await isMockMode();
    const activities = [];
    
    if (useMockMode) {
      // Get designer's reviews (outstanding = not completed and not approved)
      const designerReviews = mockReviews.filter(review => 
        !review.completed &&
        review.workflowState !== 'approved' &&
        (review.designerEmail === currentUserEmail.value || review.designer === currentUser.value)
      );
      
      // Collect recent comments from outstanding reviews
      for (const review of designerReviews) {
        if (review.comments && review.comments.length > 0) {
          // Get most recent comments (last 2 per review)
          const recentComments = review.comments
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 2);
          
          recentComments.forEach(comment => {
            activities.push({
              id: `comment-${comment.id}`,
              type: 'comment',
              reviewId: review.id,
              reviewName: review.filename,
              workflowState: review.workflowState,
              description: `${comment.author}: ${comment.text.substring(0, 100)}${comment.text.length > 100 ? '...' : ''}`,
              timestamp: comment.timestamp
            });
          });
        }
        
        // Collect workflow history entries
        if (review.workflowHistory && review.workflowHistory.length > 0) {
          const recentHistory = review.workflowHistory
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 2);
          
          recentHistory.forEach(entry => {
            const actionLabels = {
              'moved_to_review': 'Moved to Review',
              'approved': 'Approved',
              'rejected': 'Rejected',
              'resubmitted': 'Resubmitted',
              'version_uploaded': 'New Version Uploaded',
              'extended': 'Expiration Extended',
              'password_set': 'Password Set',
              'password_removed': 'Password Removed'
            };
            
            activities.push({
              id: `history-${review.id}-${entry.timestamp}`,
              type: 'workflow',
              action: entry.action,
              reviewId: review.id,
              reviewName: review.filename,
              workflowState: review.workflowState,
              description: `${entry.user}: ${actionLabels[entry.action] || entry.action}`,
              timestamp: entry.timestamp
            });
          });
        }
      }
    } else {
      // In real app, would call API endpoint
      // const res = await fetch('/api/reviews/activity');
      // activities = await res.json();
    }
    
    // Sort by timestamp (newest first) and limit to 10
    recentActivity.value = activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);
  } catch (error) {
    console.error('Failed to load recent activity:', error);
  }
};

// Format relative time
const formatRelativeTime = (timestamp) => {
  if (!timestamp) return '';
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  } catch (error) {
    return '';
  }
};

// The tone of an activity's icon: comments and uploads in the accent, approvals in success, rejections in warning
const getActivityTone = (type, action) => {
  if (action === 'approved' || action === 'completed') return 'success';
  if (action === 'rejected') return 'warning';
  if (type === 'comment' || type === 'workflow' || ['uploaded', 'created_from_url', 'version_uploaded', 'moved_to_review'].includes(action)) return 'accent';
  return 'neutral';
};

// Workflow helper functions
const getWorkflowLabel = (state) => {
  const labels = {
    'draft': 'Draft',
    'client_review': 'Client Review',
    'client_approved': 'Client Approved',
    'art_director_review': 'Art Director Review',
    'art_director_approved': 'Art Director Approved',
    'ad_changes_requested': 'AD Changes Requested',
    'creative_director_review': 'Creative Director Review',
    'cd_changes_requested': 'CD Changes Requested',
    'approved': 'Approved & Released'
  };
  return labels[state] || state;
};

// The chip tone for a review's workflow state
const getWorkflowTone = (state) => {
  if (state === 'approved' || state === 'client_approved' || state === 'art_director_approved') return 'success';
  if (state === 'ad_changes_requested' || state === 'cd_changes_requested') return 'warning';
  if (state && state.endsWith('_review')) return 'accent';
  return 'neutral';
};

// Navigate to review
const goToReview = (reviewId) => {
  router.push(`/review/${reviewId}`);
  closeNotifications();
};

onMounted(() => {
  // Load recent activity
  loadRecentActivity();
  
  // Load breaking change notifications
  loadBreakingChangeNotifications();
  
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
.popover-row-breaking {
  @apply border-l-4 border-l-danger-solid bg-danger-bg;
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

.notif-tab {
  @apply flex-1 px-4 py-2 border-b-2 border-transparent text-sm font-medium text-ink-muted transition-colors hover:text-ink;
}
.notif-tab-on {
  @apply border-accent text-accent-text hover:text-accent-text;
}
.notif-tab-danger.notif-tab-on {
  @apply border-danger-solid text-danger hover:text-danger;
}
.notif-tab-count {
  @apply ml-2 px-1.5 py-0.5 rounded-control bg-accent-subtle text-xs text-accent-text;
}
.notif-tab-danger .notif-tab-count {
  @apply bg-danger-bg text-danger;
}

.activity-icon {
  @apply flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-pill;
}
.activity-icon-accent {
  @apply bg-accent-subtle text-accent-text;
}
.activity-icon-success {
  @apply bg-success-bg text-success;
}
.activity-icon-warning {
  @apply bg-warning-bg text-warning;
}
.activity-icon-danger {
  @apply bg-danger-bg text-danger;
}
.activity-icon-neutral {
  @apply bg-fill text-ink-secondary;
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
