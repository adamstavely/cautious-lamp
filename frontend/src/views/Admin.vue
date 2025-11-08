<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative flex">
    <!-- Drawer -->
    <DocumentationDrawer :isOpen="drawerOpen" @close="closeDrawer" @toggle="toggleDrawer" />
    
    <!-- Main Content Area -->
    <div 
      class="flex-1 h-full transition-all duration-300 relative overflow-hidden"
      :style="drawerOpen ? 'margin-left: 256px;' : 'margin-left: 48px;'"
    >
      <div class="h-full p-8 overflow-auto">
        <!-- Hero Section -->
        <div class="max-w-7xl mx-auto mb-16">
          <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
            <!-- Background texture/grain effect -->
            <div class="absolute inset-0 opacity-10 texture-pattern"></div>
            
            <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div class="flex-1">
                <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  Admin
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Manage system health, governance, and administrative settings for your design system.
                </p>
              </div>
              <div class="hidden md:block flex-shrink-0">
                <div class="w-64 h-64 relative">
                  <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
                    <defs>
                      <linearGradient id="adminGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <!-- Shield icon representing admin/security -->
                    <path d="M 100 40 L 125 50 L 125 75 Q 125 105, 100 120 Q 75 105, 75 75 L 75 50 Z" fill="url(#adminGradient)" opacity="0.4"/>
                    <path d="M 100 55 L 115 62 L 115 80 Q 115 95, 100 105 Q 85 95, 85 80 L 85 62 Z" fill="url(#adminGradient)" opacity="0.6"/>
                    <!-- Dashboard/grid representing system health -->
                    <rect x="35" y="140" width="35" height="35" rx="4" fill="url(#adminGradient)" opacity="0.3"/>
                    <rect x="82.5" y="140" width="35" height="35" rx="4" fill="url(#adminGradient)" opacity="0.5"/>
                    <rect x="130" y="140" width="35" height="35" rx="4" fill="url(#adminGradient)" opacity="0.4"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Admin Tools Grid -->
        <div class="max-w-7xl mx-auto">
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- System Health Card -->
            <router-link 
              to="/admin/health"
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">space_dashboard</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                System Health
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Monitor your design system's health, track component adoption, and identify improvements.
              </p>
            </router-link>

            <!-- Governance Card -->
            <router-link 
              to="/admin/governance"
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">gavel</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Governance
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Enforce design system rules and check compliance. Monitor both the design system and applications.
              </p>
            </router-link>

            <!-- Audit Logs Card -->
            <router-link 
              to="/admin/audit"
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">history</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Audit Logs
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Track and monitor all user actions, API calls, and system events with exportable audit trails.
              </p>
            </router-link>

            <!-- Site Banners Card -->
            <div
              @click="showBannerModal = true"
              class="group rounded-2xl p-6 border transition-all cursor-pointer"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">campaign</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Site Banners
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Create and manage info banners to notify users of important issues or updates.
              </p>
            </div>

            <!-- Role Management Card -->
            <router-link 
              to="/admin/roles"
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">admin_panel_settings</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Role Management
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Manage user roles and their access to design system features and permissions.
              </p>
            </router-link>

            <!-- Feature Flags Card -->
            <router-link 
              to="/admin/feature-flags"
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">flag</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Feature Flags
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Control feature availability across your design system. Turn features on or off, target specific users or groups, and manage gradual rollouts.
              </p>
            </router-link>

            <!-- Content Management Card -->
            <router-link 
              to="/admin/content"
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">edit_document</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Component and Pattern Lifecycle Management
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Create new pattern and component pages, and manage statuses throughout their lifecycle.
              </p>
            </router-link>

            <!-- Code Quality Card -->
            <router-link 
              to="/admin/code-quality"
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">check_circle</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Code Quality
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Lint, format, and enforce best practices to maintain high code quality standards across the design system.
              </p>
            </router-link>

            <!-- Vulnerability Scanner Card -->
            <router-link 
              to="/admin/security"
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">security</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Vulnerability Scanner
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Scan dependencies for security vulnerabilities and get recommendations for updates to keep the design system secure.
              </p>
            </router-link>

            <!-- Performance Analysis Card -->
            <router-link 
              to="/admin/performance"
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">speed</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Performance Analysis
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Analyze component bundle sizes and set performance budgets to monitor and prevent regressions.
              </p>
            </router-link>

            <!-- Accessibility Reports Card -->
            <router-link 
              to="/admin/accessibility-reports"
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">accessibility</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Accessibility Reports
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Automated WCAG compliance monitoring, trend tracking, and prioritized fix recommendations.
              </p>
            </router-link>

            <!-- Application Management Card -->
            <router-link 
              to="/admin/applications"
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">apps</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Application Management
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Register applications, manage capabilities, and configure scanners for governance, visual regression, and session replay.
              </p>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Banner Management Modal -->
    <div
      v-if="showBannerModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      @click.self="showBannerModal = false"
    >
      <div
        class="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg shadow-xl"
        :class="isDarkMode ? 'bg-slate-800' : 'bg-white'"
      >
        <div class="sticky top-0 p-6 border-b flex items-center justify-between"
          :class="isDarkMode ? 'border-gray-700 bg-slate-800' : 'border-gray-200 bg-white'"
        >
          <h2 class="text-2xl font-bold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
            <span class="material-symbols-outlined text-2xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">campaign</span>
            Site Banners
          </h2>
          <button
            @click="showBannerModal = false"
            class="p-2 rounded-lg transition-colors"
            :class="isDarkMode ? 'text-gray-400 hover:text-white hover:bg-slate-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="p-6">
          <div class="mb-6 flex justify-between items-center">
            <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              Active Banners
            </h3>
            <button
              @click="openCreateBanner"
              class="px-4 py-2 rounded-lg transition-colors text-sm font-medium"
              :class="isDarkMode 
                ? 'bg-indigo-500 text-white hover:bg-indigo-400' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700'"
            >
              <span class="material-symbols-outlined text-sm mr-1 align-middle">add</span>
              Create Banner
            </button>
          </div>

          <div v-if="banners.length === 0" class="text-center py-12">
            <span class="material-symbols-outlined text-6xl mb-4" :class="isDarkMode ? 'text-gray-600' : 'text-gray-300'">
              campaign
            </span>
            <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
              No banners created yet. Create your first banner to notify users.
            </p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="banner in banners"
              :key="banner.id"
              class="p-4 rounded-lg border"
              :class="isDarkMode ? 'border-gray-700 bg-slate-900' : 'border-gray-200 bg-gray-50'"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <span
                      class="px-2 py-1 rounded text-xs font-medium"
                      :class="getTypeBadgeClasses(banner.type)"
                    >
                      {{ banner.type.toUpperCase() }}
                    </span>
                    <span
                      v-if="banner.isActive"
                      class="px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-300 border border-green-400/30"
                    >
                      Active
                    </span>
                    <span
                      v-else
                      class="px-2 py-1 rounded text-xs font-medium bg-gray-500/20 text-gray-300 border border-gray-400/30"
                    >
                      Inactive
                    </span>
                  </div>
                  <h4 class="font-semibold mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ banner.title }}
                  </h4>
                  <p class="text-sm mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    {{ banner.message }}
                  </p>
                  <p class="text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                    Created: {{ new Date(banner.createdAt).toLocaleString() }}
                    <span v-if="banner.expiresAt">
                      | Expires: {{ new Date(banner.expiresAt).toLocaleString() }}
                    </span>
                  </p>
                </div>
                <div class="flex gap-2 ml-4">
                  <button
                    @click="editBanner(banner)"
                    class="p-2 rounded-lg transition-colors"
                    :class="isDarkMode ? 'text-gray-400 hover:text-white hover:bg-slate-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'"
                  >
                    <span class="material-symbols-outlined text-sm">edit</span>
                  </button>
                  <button
                    @click="toggleBannerStatus(banner)"
                    class="p-2 rounded-lg transition-colors"
                    :class="isDarkMode ? 'text-gray-400 hover:text-white hover:bg-slate-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'"
                  >
                    <span class="material-symbols-outlined text-sm">
                      {{ banner.isActive ? 'visibility_off' : 'visibility' }}
                    </span>
                  </button>
                  <button
                    @click="deleteBanner(banner.id)"
                    class="p-2 rounded-lg transition-colors"
                    :class="isDarkMode ? 'text-red-400 hover:text-red-300 hover:bg-slate-700' : 'text-red-600 hover:text-red-700 hover:bg-gray-100'"
                  >
                    <span class="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Banner Modal -->
    <div
      v-if="showBannerForm"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      @click.self="showBannerForm = false"
    >
      <div
        class="w-full max-w-2xl rounded-lg shadow-xl"
        :class="isDarkMode ? 'bg-slate-800' : 'bg-white'"
      >
        <div class="p-6 border-b flex items-center justify-between"
          :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'"
        >
          <h2 class="text-xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
            {{ editingBanner ? 'Edit Banner' : 'Create Banner' }}
          </h2>
          <button
            @click="showBannerForm = false"
            class="p-2 rounded-lg transition-colors"
            :class="isDarkMode ? 'text-gray-400 hover:text-white hover:bg-slate-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <form @submit.prevent="saveBanner" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Title
            </label>
            <input
              v-model="bannerForm.title"
              type="text"
              required
              class="w-full px-3 py-2 border rounded-lg"
              :class="isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Message
            </label>
            <textarea
              v-model="bannerForm.message"
              required
              rows="3"
              class="w-full px-3 py-2 border rounded-lg"
              :class="isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Type
            </label>
            <select
              v-model="bannerForm.type"
              class="w-full px-3 py-2 border rounded-lg"
              :class="isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'"
            >
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="success">Success</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Expiration Date
            </label>
            <div class="space-y-2">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="bannerForm.noExpiration"
                  type="checkbox"
                  class="rounded"
                  :class="isDarkMode ? 'accent-indigo-500' : 'accent-indigo-600'"
                  @change="handleNoExpirationChange"
                />
                <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  No expiration (banner will remain active until manually removed)
                </span>
              </label>
              <input
                v-if="!bannerForm.noExpiration"
                v-model="bannerForm.expiresAt"
                type="datetime-local"
                class="w-full px-3 py-2 border rounded-lg"
                :class="isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'"
              />
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              @click="showBannerForm = false"
              class="px-4 py-2 rounded-lg transition-colors text-sm font-medium"
              :class="isDarkMode 
                ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 rounded-lg transition-colors text-sm font-medium"
              :class="isDarkMode 
                ? 'bg-indigo-500 text-white hover:bg-indigo-400' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700'"
            >
              {{ editingBanner ? 'Update' : 'Create' }} Banner
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import axios from 'axios';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const showBannerModal = ref(false);
const showBannerForm = ref(false);
const banners = ref([]);
const editingBanner = ref(null);
const bannerForm = ref({
  title: '',
  message: '',
  type: 'info',
  expiresAt: '',
  noExpiration: true
});

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

const fetchBanners = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/v1/banners');
    banners.value = response.data;
  } catch (error) {
    console.error('Failed to fetch banners:', error);
  }
};

const openCreateBanner = () => {
  editingBanner.value = null;
  bannerForm.value = {
    title: '',
    message: '',
    type: 'info',
    expiresAt: '',
    noExpiration: true
  };
  showBannerForm.value = true;
};

const handleNoExpirationChange = () => {
  if (bannerForm.value.noExpiration) {
    bannerForm.value.expiresAt = '';
  }
};

const editBanner = (banner) => {
  editingBanner.value = banner;
  bannerForm.value = {
    title: banner.title,
    message: banner.message,
    type: banner.type,
    expiresAt: banner.expiresAt ? new Date(banner.expiresAt).toISOString().slice(0, 16) : '',
    noExpiration: !banner.expiresAt
  };
  showBannerForm.value = true;
};

const saveBanner = async () => {
  try {
    const apiKey = localStorage.getItem('apiKey') || 'dev-key';
    const headers = { Authorization: `Bearer ${apiKey}` };
    
    const payload = {
      title: bannerForm.value.title,
      message: bannerForm.value.message,
      type: bannerForm.value.type,
      expiresAt: bannerForm.value.noExpiration ? undefined : (bannerForm.value.expiresAt || undefined)
    };

    if (editingBanner.value) {
      await axios.put(`http://localhost:3000/api/v1/banners/${editingBanner.value.id}`, payload, { headers });
    } else {
      await axios.post('http://localhost:3000/api/v1/banners', payload, { headers });
    }

    showBannerForm.value = false;
    await fetchBanners();
  } catch (error) {
    console.error('Failed to save banner:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to save banner. Please try again.';
    alert(errorMessage);
  }
};

const toggleBannerStatus = async (banner) => {
  try {
    const apiKey = localStorage.getItem('apiKey') || 'dev-key';
    const headers = { Authorization: `Bearer ${apiKey}` };
    
    await axios.put(`http://localhost:3000/api/v1/banners/${banner.id}`, {
      isActive: !banner.isActive
    }, { headers });

    await fetchBanners();
  } catch (error) {
    console.error('Failed to toggle banner status:', error);
    alert('Failed to update banner status. Please try again.');
  }
};

const deleteBanner = async (id) => {
  if (!confirm('Are you sure you want to delete this banner?')) return;
  
  try {
    const apiKey = localStorage.getItem('apiKey') || 'dev-key';
    const headers = { Authorization: `Bearer ${apiKey}` };
    
    await axios.delete(`http://localhost:3000/api/v1/banners/${id}`, { headers });
    await fetchBanners();
  } catch (error) {
    console.error('Failed to delete banner:', error);
    alert('Failed to delete banner. Please try again.');
  }
};

const getTypeBadgeClasses = (type) => {
  switch (type) {
    case 'error':
      return 'bg-red-500/20 text-red-300 border border-red-400/30';
    case 'warning':
      return 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30';
    case 'success':
      return 'bg-green-500/20 text-green-300 border border-green-400/30';
    default:
      return 'bg-blue-500/20 text-blue-300 border border-blue-400/30';
  }
};

let darkModeObserver = null;
let darkModeInterval = null;

onMounted(() => {
  // Auto-open drawer if navigating from sidebar
  if (sessionStorage.getItem('openDrawerOnLoad') === 'true') {
    drawerOpen.value = true;
    sessionStorage.removeItem('openDrawerOnLoad');
  }
  
  fetchBanners();
  
  darkModeObserver = new MutationObserver(() => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  });
  
  darkModeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });
  
  const checkDarkMode = () => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  };
  
  checkDarkMode();
  darkModeInterval = setInterval(checkDarkMode, 100);
});

onBeforeUnmount(() => {
  if (darkModeObserver) {
    darkModeObserver.disconnect();
  }
  if (darkModeInterval) {
    clearInterval(darkModeInterval);
  }
});
</script>

<style scoped>
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>

