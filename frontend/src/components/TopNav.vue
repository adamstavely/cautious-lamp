<template>
  <nav 
    data-ds-component="topnav"
    data-ds-path="@design-system/components/topnav"
    class="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 shadow-sm relative" 
    role="navigation" 
    aria-label="Top navigation"
  >
    <div class="flex items-center h-16">
      <!-- Left spacer for sidebar -->
      <div class="w-24 flex-shrink-0"></div>
      
      <!-- Site Title - Left Justified -->
      <router-link
        to="/"
        class="flex items-center gap-2 pl-[50px] pr-4 transition-all group flex-shrink-0 -ml-24"
      >
        <!-- Custom Carets Icon (overlapping by 25%) -->
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          class="transition-transform group-hover:scale-110 flex-shrink-0"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="caretGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style="stop-color:#312e81;stop-opacity:1" />
              <stop offset="50%" style="stop-color:#3730a3;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#4338ca;stop-opacity:1" />
            </linearGradient>
            <linearGradient id="caretGradientDark" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
              <stop offset="50%" style="stop-color:#a5b4fc;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#c7d2fe;stop-opacity:1" />
            </linearGradient>
          </defs>
          <!-- Left caret < (width: 4 units, from x=6 to x=10) -->
          <path 
            d="M10 6 L6 12 L10 18" 
            :stroke="isDarkMode ? 'url(#caretGradientDark)' : 'url(#caretGradient)'"
            stroke-width="2.5" 
            stroke-linecap="round" 
            stroke-linejoin="round"
            fill="none"
          />
          <!-- Right caret > (width: 4 units, from x=9 to x=13, overlapping left by 1 unit = 25%) -->
          <path 
            d="M13 6 L17 12 L13 18" 
            :stroke="isDarkMode ? 'url(#caretGradientDark)' : 'url(#caretGradient)'"
            stroke-width="2.5" 
            stroke-linecap="round" 
            stroke-linejoin="round"
            fill="none"
          />
        </svg>
        <span class="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-700 dark:from-indigo-300 dark:via-indigo-400 dark:to-indigo-500 bg-clip-text text-transparent whitespace-nowrap hidden sm:inline">DESIGN.COM</span>
      </router-link>
      
      <!-- Center Search Bar -->
      <div class="flex-1 flex justify-center min-w-0">
        <div class="w-full max-w-2xl mx-4 sm:mx-8">
          <div class="relative" ref="searchContainer">
            <span class="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-xl pointer-events-none"
              :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'"
              aria-hidden="true"
            >
              search
            </span>
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
              class="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-colors"
              :class="isDarkMode 
                ? 'border-slate-600 bg-slate-700 text-gray-100 placeholder-gray-400' 
                : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'"
              aria-label="Search design system"
              aria-expanded="showSearchResults"
              aria-haspopup="listbox"
            />
            <button
              v-if="searchQuery"
              @click="showAdvancedFilters = !showAdvancedFilters"
              class="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded"
              :class="isDarkMode 
                ? 'text-gray-400 hover:text-white hover:bg-slate-600' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'"
              title="Advanced filters"
            >
              <span class="material-symbols-outlined text-sm">tune</span>
            </button>
            
            <!-- Advanced Filters Panel -->
            <div
              v-if="showAdvancedFilters"
              class="absolute left-0 right-0 top-full mt-2 rounded-lg shadow-xl border z-50 p-4"
              :class="isDarkMode 
                ? 'bg-slate-900 border-slate-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="space-y-3">
                <div>
                  <label class="block text-xs font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Type</label>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="type in availableFilters?.types || []"
                      :key="type.value"
                      @click="toggleSearchFilter('type', type.value)"
                      class="px-2 py-1 rounded text-xs"
                      :class="searchFilters.type?.includes(type.value)
                        ? (isDarkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white')
                        : (isDarkMode ? 'bg-slate-800 text-gray-300' : 'bg-gray-100 text-gray-700')"
                    >
                      {{ type.label }} ({{ type.count }})
                    </button>
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Category</label>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="cat in availableFilters?.categories?.slice(0, 8) || []"
                      :key="cat.value"
                      @click="toggleSearchFilter('category', cat.value)"
                      class="px-2 py-1 rounded text-xs"
                      :class="searchFilters.category?.includes(cat.value)
                        ? (isDarkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white')
                        : (isDarkMode ? 'bg-slate-800 text-gray-300' : 'bg-gray-100 text-gray-700')"
                    >
                      {{ cat.label }} ({{ cat.count }})
                    </button>
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Has Props</label>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="prop in availableFilters?.commonProps?.slice(0, 6) || []"
                      :key="prop.value"
                      @click="toggleSearchFilter('hasProps', prop.value)"
                      class="px-2 py-1 rounded text-xs"
                      :class="searchFilters.hasProps?.includes(prop.value)
                        ? (isDarkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white')
                        : (isDarkMode ? 'bg-slate-800 text-gray-300' : 'bg-gray-100 text-gray-700')"
                    >
                      {{ prop.label }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Search Results Dropdown -->
            <div
              v-if="showSearchResults && (searchQuery.trim() || filteredSearchResults.length > 0)"
              class="absolute left-0 right-0 top-full mt-2 max-h-[500px] overflow-hidden rounded-lg shadow-xl border z-50"
              :class="isDarkMode 
                ? 'bg-slate-900 border-slate-700' 
                : 'bg-white border-gray-200'"
              role="listbox"
              aria-label="Search results"
            >
              <!-- Results List -->
              <div class="overflow-y-auto max-h-[500px]">
                <div v-if="filteredSearchResults.length === 0 && searchQuery.trim()" class="p-8 text-center">
                  <span class="material-symbols-outlined text-5xl mb-3" :class="isDarkMode ? 'text-gray-600' : 'text-gray-300'">
                    search_off
                  </span>
                  <p class="text-sm font-medium mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    No results found
                  </p>
                  <p class="text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                    Try a different search term
                  </p>
                </div>
                
                <div v-else-if="filteredSearchResults.length > 0" class="divide-y" :class="isDarkMode ? 'divide-slate-700' : 'divide-gray-200'">
                  <router-link
                    v-for="(result, index) in filteredSearchResults"
                    :key="result.id"
                    :to="result.path"
                    @click="closeSearch"
                    class="block px-4 py-3 transition-colors"
                    :class="[
                      selectedSearchIndex === index
                        ? (isDarkMode ? 'bg-indigo-900/30' : 'bg-indigo-50')
                        : (isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-50')
                    ]"
                    role="option"
                    :aria-selected="selectedSearchIndex === index"
                  >
                    <div class="flex items-start gap-3">
                      <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                        :class="isDarkMode ? 'bg-indigo-900/30' : 'bg-indigo-100'"
                      >
                        <span class="material-symbols-outlined text-lg" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                          {{ result.icon }}
                        </span>
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                          <h4 class="text-sm font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                            {{ result.title }}
                          </h4>
                          <span 
                            class="px-2 py-0.5 rounded text-xs font-medium"
                            :class="getCategoryBadgeClass(result.category)"
                          >
                            {{ result.category }}
                          </span>
                        </div>
                        <p class="text-xs mb-1 line-clamp-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                          {{ result.description }}
                        </p>
                        <p class="text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                          {{ result.path }}
                        </p>
                      </div>
                    </div>
                  </router-link>
                </div>
                
                <!-- Empty State (when no query) -->
                <div v-else class="p-6">
                  <p class="text-sm text-center" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    Start typing to search...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Actions -->
      <div class="flex items-center gap-4 px-4 sm:px-6 lg:px-8 flex-shrink-0">
        <!-- Live Chat -->
        <button
          class="relative flex items-center justify-center p-2 rounded-lg transition-colors"
          :class="isDarkMode 
            ? 'text-gray-300 hover:text-indigo-400 hover:bg-indigo-900/20' 
            : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'"
          title="Live Chat"
          aria-label="Live Chat"
        >
          <span class="material-symbols-outlined flex items-center justify-center" aria-hidden="true">live_help</span>
        </button>

        <!-- Feedback -->
        <router-link
          to="/feedback"
          class="relative flex items-center justify-center p-2 rounded-lg transition-colors"
          :class="isDarkMode 
            ? 'text-gray-300 hover:text-indigo-400 hover:bg-indigo-900/20' 
            : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'"
          title="Roadmap & Feedback"
          aria-label="View roadmap and submit feedback"
        >
          <span class="material-symbols-outlined flex items-center justify-center" aria-hidden="true">new_releases</span>
        </router-link>

        <!-- Notifications -->
        <div class="relative" ref="notificationsContainer">
          <button
            @click="toggleNotifications"
            class="relative flex items-center justify-center p-2 rounded-lg transition-colors"
            :class="isDarkMode 
              ? 'text-gray-300 hover:text-indigo-400 hover:bg-indigo-900/20' 
              : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'"
            title="Notifications"
            :aria-label="`Notifications${totalNotificationCount > 0 ? `, ${totalNotificationCount} unread` : ''}`"
            :aria-expanded="showNotifications"
            aria-haspopup="true"
          >
            <span class="material-symbols-outlined flex items-center justify-center" aria-hidden="true">notifications</span>
            <span 
              v-if="totalNotificationCount > 0"
              class="absolute top-1 right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-xs font-semibold px-1"
              :class="breakingChangeNotifications.length > 0 
                ? (isDarkMode ? 'bg-red-400 text-red-900' : 'bg-red-600 text-white')
                : (isDarkMode ? 'bg-indigo-400 text-indigo-900' : 'bg-indigo-600 text-white')"
              aria-hidden="true"
            >
              {{ totalNotificationCount > 9 ? '9+' : totalNotificationCount }}
            </span>
          </button>
          
          <!-- Notifications Dropdown -->
          <div
            v-if="showNotifications"
            class="absolute right-0 top-full mt-2 w-96 max-h-[600px] overflow-hidden rounded-lg shadow-xl border z-50"
            :class="isDarkMode 
              ? 'bg-slate-900 border-slate-700' 
              : 'bg-white border-gray-200'"
            role="menu"
            aria-label="Recent activity notifications"
          >
            <!-- Header -->
            <div class="px-4 py-3 border-b flex items-center justify-between"
              :class="isDarkMode ? 'border-slate-700' : 'border-gray-200'"
            >
              <h3 :class="isDarkMode ? 'text-gray-100' : 'text-gray-900'" class="font-semibold text-lg">Notifications</h3>
              <button
                @click="closeNotifications"
                class="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                :class="isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'"
              >
                <span class="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            
            <!-- Tabs -->
            <div class="flex border-b" :class="isDarkMode ? 'border-slate-700' : 'border-gray-200'">
              <button
                @click="notificationTab = 'all'"
                class="flex-1 px-4 py-2 text-sm font-medium transition-colors border-b-2"
                :class="notificationTab === 'all'
                  ? (isDarkMode ? 'border-indigo-400 text-indigo-400' : 'border-indigo-600 text-indigo-600')
                  : (isDarkMode ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-500 hover:text-gray-700')"
              >
                All
                <span v-if="totalNotificationCount > 0" class="ml-2 px-1.5 py-0.5 rounded text-xs"
                  :class="isDarkMode ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-100 text-indigo-700'"
                >
                  {{ totalNotificationCount }}
                </span>
              </button>
              <button
                @click="notificationTab = 'breaking'"
                class="flex-1 px-4 py-2 text-sm font-medium transition-colors border-b-2"
                :class="notificationTab === 'breaking'
                  ? (isDarkMode ? 'border-red-400 text-red-400' : 'border-red-600 text-red-600')
                  : (isDarkMode ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-500 hover:text-gray-700')"
              >
                Breaking Changes
                <span v-if="breakingChangeNotifications.length > 0" class="ml-2 px-1.5 py-0.5 rounded text-xs"
                  :class="isDarkMode ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-700'"
                >
                  {{ breakingChangeNotifications.length }}
                </span>
              </button>
              <button
                @click="notificationTab = 'activity'"
                class="flex-1 px-4 py-2 text-sm font-medium transition-colors border-b-2"
                :class="notificationTab === 'activity'
                  ? (isDarkMode ? 'border-indigo-400 text-indigo-400' : 'border-indigo-600 text-indigo-600')
                  : (isDarkMode ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-500 hover:text-gray-700')"
              >
                Activity
                <span v-if="recentActivity.length > 0" class="ml-2 px-1.5 py-0.5 rounded text-xs"
                  :class="isDarkMode ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-100 text-indigo-700'"
                >
                  {{ recentActivity.length }}
                </span>
              </button>
            </div>
            
            <!-- Notification List -->
            <div class="overflow-y-auto max-h-[500px]">
              <!-- Breaking Changes Tab -->
              <div v-if="notificationTab === 'breaking'">
                <div v-if="breakingChangeNotifications.length === 0" class="p-8 text-center">
                  <span class="material-symbols-outlined text-4xl mb-3 block" :class="isDarkMode ? 'text-gray-600' : 'text-gray-400'">check_circle</span>
                  <p :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'" class="text-sm">No breaking changes</p>
                </div>
                <div v-else class="divide-y" :class="isDarkMode ? 'divide-slate-700' : 'divide-gray-200'">
                  <div
                    v-for="notification in breakingChangeNotifications"
                    :key="notification.id"
                    @click="goToComponent(notification.componentId)"
                    class="p-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-slate-700"
                  >
                    <div class="flex items-start gap-3">
                      <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-red-100 dark:bg-red-900/30">
                        <span class="material-symbols-outlined text-base text-red-600 dark:text-red-400">warning</span>
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                          <h4 :class="isDarkMode ? 'text-gray-100' : 'text-gray-900'" class="text-sm font-semibold">Breaking Change</h4>
                          <span class="px-2 py-0.5 rounded text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                            {{ notification.componentName }}
                          </span>
                        </div>
                        <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-600'" class="text-sm mb-1 line-clamp-2">{{ notification.message }}</p>
                        <p :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'" class="text-xs">{{ formatRelativeTime(notification.timestamp) }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Activity Tab -->
              <div v-else-if="notificationTab === 'activity'">
                <div v-if="recentActivity.length === 0" class="p-8 text-center">
                <svg :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'" class="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'" class="text-sm">No recent activity</p>
              </div>
              <div v-else class="divide-y"
                :class="isDarkMode ? 'divide-slate-700' : 'divide-gray-200'"
              >
                <div
                  v-for="activity in recentActivity"
                  :key="activity.id"
                  @click="goToReview(activity.reviewId)"
                  class="p-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-slate-700"
                >
                  <div class="flex items-start gap-3">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" :class="getActivityIconBg(activity.type, activity.action)">
                      <svg v-if="activity.type === 'comment'" class="w-4 h-4" :class="getActivityIconColor(activity.type, activity.action)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <svg v-else-if="activity.action === 'uploaded' || activity.action === 'created_from_url'" class="w-4 h-4" :class="getActivityIconColor(activity.type, activity.action)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span v-else-if="activity.action === 'version_uploaded'" class="material-symbols-outlined w-4 h-4" :class="getActivityIconColor(activity.type, activity.action)" style="font-size: 16px;">difference</span>
                      <span v-else-if="activity.action === 'approved'" class="material-symbols-outlined w-4 h-4" :class="getActivityIconColor(activity.type, activity.action)" style="font-size: 16px;">approval</span>
                      <span v-else-if="activity.action === 'completed'" class="material-symbols-outlined w-4 h-4" :class="getActivityIconColor(activity.type, activity.action)" style="font-size: 16px;">done_all</span>
                      <span v-else-if="activity.action === 'rejected'" class="material-symbols-outlined w-4 h-4" :class="getActivityIconColor(activity.type, activity.action)" style="font-size: 16px;">source_notes</span>
                      <span v-else-if="activity.action === 'moved_to_review'" class="material-symbols-outlined w-4 h-4" :class="getActivityIconColor(activity.type, activity.action)" style="font-size: 16px;">graph_1</span>
                      <svg v-else-if="activity.type === 'workflow'" class="w-4 h-4" :class="getActivityIconColor(activity.type, activity.action)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <svg v-else class="w-4 h-4" :class="getActivityIconColor(activity.type, activity.action)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-1">
                        <h4 :class="isDarkMode ? 'text-gray-100' : 'text-gray-900'" class="text-sm font-semibold truncate">{{ activity.reviewName }}</h4>
                        <v-chip
                          :color="getWorkflowColor(activity.workflowState)"
                          size="x-small"
                          class="font-medium"
                        >
                          {{ getWorkflowLabel(activity.workflowState) }}
                        </v-chip>
                      </div>
                      <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-600'" class="text-sm mb-1 line-clamp-2">{{ activity.description }}</p>
                      <p :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'" class="text-xs">{{ formatRelativeTime(activity.timestamp) }}</p>
                    </div>
                  </div>
                </div>
              </div>
              </div>
              
              <!-- All Tab -->
              <div v-else>
                <div v-if="totalNotificationCount === 0" class="p-8 text-center">
                  <span class="material-symbols-outlined text-4xl mb-3 block" :class="isDarkMode ? 'text-gray-600' : 'text-gray-400'">notifications_off</span>
                  <p :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'" class="text-sm">No notifications</p>
                </div>
                <div v-else class="divide-y" :class="isDarkMode ? 'divide-slate-700' : 'divide-gray-200'">
                  <!-- Breaking Changes First -->
                  <div
                    v-for="notification in breakingChangeNotifications"
                    :key="`breaking-${notification.id}`"
                    @click="goToComponent(notification.componentId)"
                    class="p-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-slate-700 border-l-4"
                    :class="isDarkMode ? 'border-red-500 bg-red-900/10' : 'border-red-500 bg-red-50'"
                  >
                    <div class="flex items-start gap-3">
                      <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-red-100 dark:bg-red-900/30">
                        <span class="material-symbols-outlined text-base text-red-600 dark:text-red-400">warning</span>
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                          <h4 :class="isDarkMode ? 'text-gray-100' : 'text-gray-900'" class="text-sm font-semibold">Breaking Change</h4>
                          <span class="px-2 py-0.5 rounded text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                            {{ notification.componentName }}
                          </span>
                        </div>
                        <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-600'" class="text-sm mb-1 line-clamp-2">{{ notification.message }}</p>
                        <p :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'" class="text-xs">{{ formatRelativeTime(notification.timestamp) }}</p>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Then Activity -->
                  <div
                    v-for="activity in recentActivity"
                    :key="activity.id"
                    @click="goToReview(activity.reviewId)"
                    class="p-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-slate-700"
                  >
                    <div class="flex items-start gap-3">
                      <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" :class="getActivityIconBg(activity.type, activity.action)">
                        <svg v-if="activity.type === 'comment'" class="w-4 h-4" :class="getActivityIconColor(activity.type, activity.action)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <svg v-else-if="activity.action === 'uploaded' || activity.action === 'created_from_url'" class="w-4 h-4" :class="getActivityIconColor(activity.type, activity.action)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span v-else-if="activity.action === 'version_uploaded'" class="material-symbols-outlined w-4 h-4" :class="getActivityIconColor(activity.type, activity.action)" style="font-size: 16px;">difference</span>
                        <span v-else-if="activity.action === 'approved'" class="material-symbols-outlined w-4 h-4" :class="getActivityIconColor(activity.type, activity.action)" style="font-size: 16px;">approval</span>
                        <span v-else-if="activity.action === 'completed'" class="material-symbols-outlined w-4 h-4" :class="getActivityIconColor(activity.type, activity.action)" style="font-size: 16px;">done_all</span>
                        <span v-else-if="activity.action === 'rejected'" class="material-symbols-outlined w-4 h-4" :class="getActivityIconColor(activity.type, activity.action)" style="font-size: 16px;">source_notes</span>
                        <span v-else-if="activity.action === 'moved_to_review'" class="material-symbols-outlined w-4 h-4" :class="getActivityIconColor(activity.type, activity.action)" style="font-size: 16px;">graph_1</span>
                        <svg v-else-if="activity.type === 'workflow'" class="w-4 h-4" :class="getActivityIconColor(activity.type, activity.action)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <svg v-else class="w-4 h-4" :class="getActivityIconColor(activity.type, activity.action)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                          <h4 :class="isDarkMode ? 'text-gray-100' : 'text-gray-900'" class="text-sm font-semibold truncate">{{ activity.reviewName }}</h4>
                          <v-chip
                            :color="getWorkflowColor(activity.workflowState)"
                            size="x-small"
                            class="font-medium"
                          >
                            {{ getWorkflowLabel(activity.workflowState) }}
                          </v-chip>
                        </div>
                        <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-600'" class="text-sm mb-1 line-clamp-2">{{ activity.description }}</p>
                        <p :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'" class="text-xs">{{ formatRelativeTime(activity.timestamp) }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- User Avatar -->
        <button
          class="flex items-center gap-2 p-1 rounded-lg transition-colors"
          :class="isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'"
          title="User Menu"
          aria-label="User menu"
          aria-haspopup="true"
        >
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
            :class="isDarkMode ? 'bg-indigo-500' : 'bg-indigo-600'"
            aria-hidden="true"
          >
            A
          </div>
        </button>

        <!-- App Picker -->
        <button
          class="flex items-center justify-center p-2 rounded-lg transition-colors"
          :class="isDarkMode 
            ? 'text-gray-300 hover:text-indigo-400 hover:bg-indigo-900/20' 
            : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'"
          title="Switch App"
          aria-label="Switch application"
        >
          <span class="material-symbols-outlined flex items-center justify-center" aria-hidden="true">apps</span>
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { mockAPI, isMockMode, mockReviews } from '../mockData.js';

const router = useRouter();
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
  { id: 'ai-overview', title: 'AI Overview', description: 'Explore AI-powered features and capabilities in the design system', category: 'AI', path: '/ai/overview', icon: 'psychology', tags: ['ai', 'artificial-intelligence', 'overview', 'features'] },
  { id: 'ai-patterns', title: 'AI Patterns', description: 'AI-generated design patterns and recommendations', category: 'AI', path: '/ai/patterns', icon: 'pattern', tags: ['ai', 'patterns', 'design', 'recommendations'] },
  { id: 'ai-components', title: 'AI Components', description: 'AI-generated component suggestions and recommendations', category: 'AI', path: '/ai/components', icon: 'widgets', tags: ['ai', 'components', 'suggestions', 'recommendations'] },
  { id: 'review-management', title: 'Review Management', description: 'Manage review workflows, teams, and review links', category: 'Review', path: '/review/management', icon: 'folder_kanban', tags: ['review', 'management', 'workflow', 'teams', 'kanban'] },
  { id: 'roadmap-feedback', title: 'Roadmap & Feedback', description: 'View roadmap, submit feedback, and see what\'s new', category: 'Tools', path: '/feedback', icon: 'new_releases', tags: ['roadmap', 'feedback', 'requests', 'whats-new'] },
  { id: 'chart-builder', title: 'Chart Builder', description: 'Create interactive charts and data visualizations with customizable options', category: 'Tools', path: '/tools/chart-builder', icon: 'bar_chart', tags: ['chart', 'data-visualization', 'graph', 'chartjs', 'tool'] },
  { id: 'timeline-generator', title: 'Timeline Generator', description: 'Create interactive timelines with events, dates, and custom styling', category: 'Tools', path: '/tools/timeline-generator', icon: 'timeline', tags: ['timeline', 'events', 'history', 'visualization', 'tool'] },
  { id: 'table-generator', title: 'Table Generator', description: 'Generate data tables with sorting, filtering, and pagination', category: 'Tools', path: '/tools/table-generator', icon: 'table_chart', tags: ['table', 'datatable', 'data', 'sorting', 'filtering', 'tool'] },
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
  return searchIndex.filter(item => {
    return item.title.toLowerCase().includes(query) ||
           item.description.toLowerCase().includes(query) ||
           item.tags.some(tag => tag.toLowerCase().includes(query)) ||
           item.category.toLowerCase().includes(query);
  }).slice(0, 8); // Limit to 8 results
});
const API_BASE_URL = 'http://localhost:3000';
const API_KEY = 'test-api-key-123';

const loadAvailableFilters = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/search/filters`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
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

const getCategoryBadgeClass = (category) => {
  const classes = {
    'Components': isDarkMode.value ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700',
    'Tokens': isDarkMode.value ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700',
    'Patterns': isDarkMode.value ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700',
    'Guidelines': isDarkMode.value ? 'bg-indigo-900/30 text-indigo-300' : 'bg-indigo-100 text-indigo-700',
    'Fonts': isDarkMode.value ? 'bg-orange-900/30 text-orange-300' : 'bg-orange-100 text-orange-700',
    'Tools': isDarkMode.value ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-700',
    'Design Assets': isDarkMode.value ? 'bg-pink-900/30 text-pink-300' : 'bg-pink-100 text-pink-700',
    'Getting Started': isDarkMode.value ? 'bg-teal-900/30 text-teal-300' : 'bg-teal-100 text-teal-700',
    'HCD': isDarkMode.value ? 'bg-cyan-900/30 text-cyan-300' : 'bg-cyan-100 text-cyan-700',
    'Admin': isDarkMode.value ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700',
    'AI': isDarkMode.value ? 'bg-violet-900/30 text-violet-300' : 'bg-violet-100 text-violet-700',
    'Review': isDarkMode.value ? 'bg-amber-900/30 text-amber-300' : 'bg-amber-100 text-amber-700',
  };
  return classes[category] || (isDarkMode.value ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700');
};

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
        headers: { Authorization: `Bearer ${API_KEY}` }
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

// Check if dark mode is active - make it reactive
const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const showNotifications = ref(false);
const recentActivity = ref([]);
const breakingChangeNotifications = ref([]);
const systemNotifications = ref([]);
const notificationTab = ref('all');

const totalNotificationCount = computed(() => {
  return breakingChangeNotifications.value.length + recentActivity.value.length;
});

// Get current user (in real app, this would come from auth)
const currentUser = ref(localStorage.getItem('currentDesigner') || 'Sarah Johnson');
const currentUserEmail = ref(localStorage.getItem('currentUserEmail') || 'sarah@example.com');
const currentUserRole = ref(localStorage.getItem('userRole') || 'designer');

// Toggle notifications dropdown
const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
};

// Close notifications dropdown
const closeNotifications = () => {
  showNotifications.value = false;
};

// Click outside handler
const handleClickOutside = (event) => {
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

// Get activity icon background color
const getActivityIconBg = (type, action) => {
  if (type === 'comment') return isDarkMode.value ? 'bg-blue-900/30' : 'bg-blue-100';
  if (action === 'uploaded' || action === 'created_from_url') return isDarkMode.value ? 'bg-indigo-900/30' : 'bg-indigo-100';
  if (action === 'version_uploaded') return isDarkMode.value ? 'bg-purple-900/30' : 'bg-purple-100';
  if (action === 'approved') return isDarkMode.value ? 'bg-green-900/30' : 'bg-green-100';
  if (action === 'completed') return isDarkMode.value ? 'bg-green-900/30' : 'bg-green-100';
  if (action === 'rejected') return isDarkMode.value ? 'bg-orange-900/30' : 'bg-orange-100';
  if (action === 'moved_to_review') return isDarkMode.value ? 'bg-indigo-900/30' : 'bg-indigo-100';
  if (type === 'workflow') return isDarkMode.value ? 'bg-purple-900/30' : 'bg-purple-100';
  return isDarkMode.value ? 'bg-gray-700' : 'bg-gray-100';
};

// Get activity icon color
const getActivityIconColor = (type, action) => {
  if (type === 'comment') return isDarkMode.value ? 'text-blue-400' : 'text-blue-600';
  if (action === 'uploaded' || action === 'created_from_url') return isDarkMode.value ? 'text-indigo-400' : 'text-indigo-600';
  if (action === 'version_uploaded') return isDarkMode.value ? 'text-purple-400' : 'text-purple-600';
  if (action === 'approved') return isDarkMode.value ? 'text-green-400' : 'text-green-600';
  if (action === 'completed') return isDarkMode.value ? 'text-green-400' : 'text-green-600';
  if (action === 'rejected') return isDarkMode.value ? 'text-orange-400' : 'text-orange-600';
  if (action === 'moved_to_review') return isDarkMode.value ? 'text-indigo-400' : 'text-indigo-600';
  if (type === 'workflow') return isDarkMode.value ? 'text-purple-400' : 'text-purple-600';
  return isDarkMode.value ? 'text-gray-400' : 'text-gray-600';
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

const getWorkflowColor = (state) => {
  const colors = {
    'draft': 'grey',
    'client_review': 'blue',
    'client_approved': 'light-blue',
    'art_director_review': 'purple',
    'art_director_approved': 'deep-purple',
    'ad_changes_requested': 'orange',
    'creative_director_review': 'indigo',
    'cd_changes_requested': 'orange',
    'approved': 'green'
  };
  return colors[state] || 'grey';
};

// Navigate to review
const goToReview = (reviewId) => {
  router.push(`/review/${reviewId}`);
  closeNotifications();
};

// Watch for dark class changes on html element using MutationObserver
let darkModeObserver = null;
let darkModeInterval = null;

onMounted(() => {
  // Set up dark mode observer
  darkModeObserver = new MutationObserver(() => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  });
  
  darkModeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });
  
  // Also check periodically as a fallback
  const checkDarkMode = () => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  };
  
  // Check immediately
  checkDarkMode();
  
  // Check every 100ms as fallback
  darkModeInterval = setInterval(checkDarkMode, 100);
  
  // Load recent activity
  loadRecentActivity();
  
  // Load breaking change notifications
  loadBreakingChangeNotifications();
  
  // Add click outside listener
  document.addEventListener('click', handleClickOutside);
});

// Cleanup observer and interval on unmount
onBeforeUnmount(() => {
  if (darkModeObserver) {
    darkModeObserver.disconnect();
  }
  if (darkModeInterval) {
    clearInterval(darkModeInterval);
  }
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style>
/* Ensure dark mode styles apply to TopNav */
html.dark nav.sticky {
  background-color: rgb(15 23 42) !important; /* slate-900 */
  border-color: rgb(51 65 85) !important; /* slate-700 */
}
</style>

