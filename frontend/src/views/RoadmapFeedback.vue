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
        <div class="max-w-7xl mx-auto mb-8">
          <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
            <div class="absolute inset-0 opacity-10 texture-pattern"></div>
            
            <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div class="flex-1">
                <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  Roadmap & Feedback
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  See what's new, share your feedback, and track our roadmap for design system evolution.
                </p>
              </div>
              <div class="hidden md:block flex-shrink-0">
                <div class="w-64 h-64 relative">
                  <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400">
                    <defs>
                      <linearGradient id="roadmapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <!-- Timeline path -->
                    <path d="M 20 100 Q 50 80, 80 100 T 140 100" stroke="url(#roadmapGradient)" stroke-width="3" fill="none" opacity="0.6"/>
                    <!-- Roadmap nodes -->
                    <circle cx="40" cy="100" r="8" fill="url(#roadmapGradient)" opacity="0.4"/>
                    <circle cx="80" cy="100" r="10" fill="url(#roadmapGradient)" opacity="0.5"/>
                    <circle cx="120" cy="100" r="8" fill="url(#roadmapGradient)" opacity="0.4"/>
                    <circle cx="160" cy="100" r="8" fill="url(#roadmapGradient)" opacity="0.3"/>
                    <!-- Speech bubble for feedback -->
                    <path d="M 60 50 Q 50 40, 40 50 L 30 60 L 40 55 Q 50 45, 60 55 Z" fill="url(#roadmapGradient)" opacity="0.5"/>
                    <circle cx="50" cy="50" r="3" fill="white" opacity="0.8"/>
                    <!-- Star for "What's New" -->
                    <path d="M 150 40 L 152 46 L 158 46 L 153 50 L 155 56 L 150 52 L 145 56 L 147 50 L 142 46 L 148 46 Z" fill="url(#roadmapGradient)" opacity="0.7"/>
                    <!-- Additional feedback bubble -->
                    <path d="M 130 150 Q 120 140, 110 150 L 100 160 L 110 155 Q 120 145, 130 155 Z" fill="url(#roadmapGradient)" opacity="0.4"/>
                    <circle cx="120" cy="150" r="2" fill="white" opacity="0.8"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="max-w-7xl mx-auto mb-8">
          <div class="flex gap-2 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
            <button
              @click="activeTab = 'whats-new'"
              class="px-6 py-3 font-medium transition-colors relative"
              :class="activeTab === 'whats-new'
                ? (isDarkMode ? 'text-indigo-400' : 'text-indigo-600')
                : (isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900')"
            >
              What's New
              <div 
                v-if="activeTab === 'whats-new'"
                class="absolute bottom-0 left-0 right-0 h-0.5"
                :class="isDarkMode ? 'bg-indigo-400' : 'bg-indigo-600'"
              ></div>
            </button>
            <button
              @click="activeTab = 'roadmap'"
              class="px-6 py-3 font-medium transition-colors relative"
              :class="activeTab === 'roadmap'
                ? (isDarkMode ? 'text-indigo-400' : 'text-indigo-600')
                : (isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900')"
            >
              Roadmap
              <div 
                v-if="activeTab === 'roadmap'"
                class="absolute bottom-0 left-0 right-0 h-0.5"
                :class="isDarkMode ? 'bg-indigo-400' : 'bg-indigo-600'"
              ></div>
            </button>
            <button
              @click="activeTab = 'feedback'"
              class="px-6 py-3 font-medium transition-colors relative"
              :class="activeTab === 'feedback'
                ? (isDarkMode ? 'text-indigo-400' : 'text-indigo-600')
                : (isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900')"
            >
              Feedback & Requests
              <div 
                v-if="activeTab === 'feedback'"
                class="absolute bottom-0 left-0 right-0 h-0.5"
                :class="isDarkMode ? 'bg-indigo-400' : 'bg-indigo-600'"
              ></div>
            </button>
          </div>
        </div>

        <!-- What's New Tab -->
        <div v-if="activeTab === 'whats-new'" class="max-w-7xl mx-auto">
          <div class="mb-8 flex items-center justify-between">
            <div>
              <h2 class="text-3xl font-bold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Release Notes</h2>
              <p :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Latest features, improvements, and updates to the design system.</p>
            </div>
            <button
              v-if="canEditReleaseNotes"
              @click="showReleaseNotesModal = true; editingReleaseNote = null"
              class="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <span class="material-symbols-outlined">add</span>
              Add Release Note
            </button>
          </div>

          <div class="space-y-6">
            <div
              v-for="release in releaseNotes"
              :key="release.version"
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-2">
                    <h3 class="text-xl font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      Version {{ release.version }}
                    </h3>
                    <span 
                      class="px-2 py-1 text-xs rounded-full font-medium"
                      :class="release.type === 'major' 
                        ? (isDarkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700')
                        : release.type === 'minor'
                        ? (isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700')
                        : (isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700')"
                    >
                      {{ release.type }}
                    </span>
                    <span class="text-sm" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                      {{ formatDate(release.date) }}
                    </span>
                  </div>
                  <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    {{ release.description }}
                  </p>
                </div>
              </div>

              <div class="space-y-3">
                <div v-if="release.features && release.features.length > 0">
                  <h4 class="text-sm font-semibold mb-2 flex items-center gap-2" :class="isDarkMode ? 'text-green-400' : 'text-green-600'">
                    <span class="material-symbols-outlined text-base">add_circle</span>
                    New Features
                  </h4>
                  <ul class="space-y-1 ml-6">
                    <li v-for="feature in release.features" :key="feature" class="text-sm flex items-start gap-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      <span class="mt-1 text-green-500">•</span>
                      <span>{{ feature }}</span>
                    </li>
                  </ul>
                </div>

                <div v-if="release.improvements && release.improvements.length > 0">
                  <h4 class="text-sm font-semibold mb-2 flex items-center gap-2" :class="isDarkMode ? 'text-blue-400' : 'text-blue-600'">
                    <span class="material-symbols-outlined text-base">trending_up</span>
                    Improvements
                  </h4>
                  <ul class="space-y-1 ml-6">
                    <li v-for="improvement in release.improvements" :key="improvement" class="text-sm flex items-start gap-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      <span class="mt-1 text-blue-500">•</span>
                      <span>{{ improvement }}</span>
                    </li>
                  </ul>
                </div>

                <div v-if="release.fixes && release.fixes.length > 0">
                  <h4 class="text-sm font-semibold mb-2 flex items-center gap-2" :class="isDarkMode ? 'text-yellow-400' : 'text-yellow-600'">
                    <span class="material-symbols-outlined text-base">bug_report</span>
                    Bug Fixes
                  </h4>
                  <ul class="space-y-1 ml-6">
                    <li v-for="fix in release.fixes" :key="fix" class="text-sm flex items-start gap-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      <span class="mt-1 text-yellow-500">•</span>
                      <span>{{ fix }}</span>
                    </li>
                  </ul>
                </div>

                <div v-if="release.breaking && release.breaking.length > 0">
                  <h4 class="text-sm font-semibold mb-2 flex items-center gap-2" :class="isDarkMode ? 'text-red-400' : 'text-red-600'">
                    <span class="material-symbols-outlined text-base">warning</span>
                    Breaking Changes
                  </h4>
                  <ul class="space-y-1 ml-6">
                    <li v-for="breaking in release.breaking" :key="breaking" class="text-sm flex items-start gap-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      <span class="mt-1 text-red-500">•</span>
                      <span>{{ breaking }}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div 
              v-if="releaseNotes.length === 0"
              class="rounded-lg shadow-sm border p-12 text-center"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <span class="material-symbols-outlined text-6xl mb-4" :class="isDarkMode ? 'text-gray-600' : 'text-gray-400'">
                new_releases
              </span>
              <h3 class="text-xl font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                No Release Notes Yet
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Release notes will appear here as new versions are published.
              </p>
            </div>
          </div>
        </div>

        <!-- Roadmap Tab -->
        <div v-if="activeTab === 'roadmap'" class="max-w-7xl mx-auto">
          <!-- Action Buttons -->
          <div class="mb-6 flex items-center justify-between">
            <div class="flex flex-wrap gap-3">
              <button
                v-for="status in ['all', 'planned', 'in-progress', 'completed', 'cancelled']"
                :key="status"
                @click="statusFilter = status"
                class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                :class="statusFilter === status
                  ? 'bg-indigo-600 dark:bg-indigo-500 text-white'
                  : isDarkMode
                    ? 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'"
              >
                {{ status.charAt(0).toUpperCase() + status.slice(1) }}
              </button>
            </div>
            <button
              v-if="canEditRoadmap"
              @click="showCreateModal = true"
              class="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <span class="material-symbols-outlined">add</span>
              Add Item
            </button>
          </div>

          <!-- Roadmap Items -->
          <div class="space-y-6">
            <div 
              v-for="item in filteredRoadmapItems"
              :key="item.id"
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-2">
                    <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      {{ item.title }}
                    </h3>
                    <span 
                      class="px-2 py-1 text-xs rounded-full font-medium"
                      :class="getStatusClass(item.status)"
                    >
                      {{ item.status }}
                    </span>
                    <span 
                      class="px-2 py-1 text-xs rounded-full font-medium"
                      :class="getPriorityClass(item.priority)"
                    >
                      {{ item.priority }} priority
                    </span>
                    <span 
                      class="px-2 py-1 text-xs rounded-full font-medium"
                      :class="getCategoryClass(item.category)"
                    >
                      {{ item.category }}
                    </span>
                  </div>
                  <p class="text-sm mb-3" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    {{ item.description }}
                  </p>
                  <div class="flex items-center gap-4 text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                    <span v-if="item.targetDate">
                      <span class="material-symbols-outlined text-sm align-middle">schedule</span>
                      Target: {{ formatDate(item.targetDate) }}
                    </span>
                    <span v-if="item.votes !== undefined">
                      <span class="material-symbols-outlined text-sm align-middle">thumb_up</span>
                      {{ item.votes }} votes
                    </span>
                  </div>
                </div>
                <div v-if="canEditRoadmap" class="flex items-center gap-2">
                  <button
                    @click="editRoadmapItem(item)"
                    class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'"
                  >
                    <span class="material-symbols-outlined text-lg">edit</span>
                  </button>
                  <button
                    @click="deleteRoadmapItem(item.id)"
                    class="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-red-600 dark:text-red-400"
                  >
                    <span class="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div 
              v-if="filteredRoadmapItems.length === 0"
              class="rounded-lg shadow-sm border p-12 text-center"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <span class="material-symbols-outlined text-6xl mb-4" :class="isDarkMode ? 'text-gray-600' : 'text-gray-400'">
                timeline
              </span>
              <h3 class="text-xl font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                No Roadmap Items
              </h3>
              <p class="text-sm mb-6" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                {{ statusFilter === 'all' ? 'Create your first roadmap item to get started.' : `No items with status "${statusFilter}".` }}
              </p>
              <button
                v-if="statusFilter === 'all' && canEditRoadmap"
                @click="showCreateModal = true"
                class="px-6 py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-400 transition-colors"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>

        <!-- Feedback Tab -->
        <div v-if="activeTab === 'feedback'" class="max-w-7xl mx-auto">
          <!-- Action Buttons -->
          <div class="mb-8 flex flex-wrap gap-4">
            <button
              @click="showRequestModal = true"
              class="px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
              :class="isDarkMode 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
            >
              <span class="material-symbols-outlined">add_circle</span>
              Request Feature
            </button>
            <button
              @click="showIssueModal = true"
              class="px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 border"
              :class="isDarkMode 
                ? 'border-gray-600 bg-slate-800 hover:bg-slate-700 text-gray-300' 
                : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-700'"
            >
              <span class="material-symbols-outlined">bug_report</span>
              Report Issue
            </button>
            <button
              @click="loadRequests"
              class="px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 border"
              :class="isDarkMode 
                ? 'border-gray-600 bg-slate-800 hover:bg-slate-700 text-gray-300' 
                : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-700'"
            >
              <span class="material-symbols-outlined">refresh</span>
              Refresh
            </button>
          </div>

          <!-- Feedback Tabs -->
          <div class="mb-8">
            <div class="flex gap-2 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
              <button
                @click="feedbackTab = 'requests'"
                class="px-6 py-3 font-medium transition-colors relative"
                :class="feedbackTab === 'requests'
                  ? (isDarkMode ? 'text-indigo-400' : 'text-indigo-600')
                  : (isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900')"
              >
                Feature Requests
                <div 
                  v-if="feedbackTab === 'requests'"
                  class="absolute bottom-0 left-0 right-0 h-0.5"
                  :class="isDarkMode ? 'bg-indigo-400' : 'bg-indigo-600'"
                ></div>
              </button>
              <button
                @click="feedbackTab = 'issues'"
                class="px-6 py-3 font-medium transition-colors relative"
                :class="feedbackTab === 'issues'
                  ? (isDarkMode ? 'text-indigo-400' : 'text-indigo-600')
                  : (isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900')"
              >
                Reported Issues
                <div 
                  v-if="feedbackTab === 'issues'"
                  class="absolute bottom-0 left-0 right-0 h-0.5"
                  :class="isDarkMode ? 'bg-indigo-400' : 'bg-indigo-600'"
                ></div>
              </button>
            </div>
          </div>

          <!-- Requests List -->
          <div v-if="feedbackTab === 'requests'" class="mb-8">
            <div v-if="loadingRequests" class="text-center py-12">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2" :class="isDarkMode ? 'border-indigo-400' : 'border-indigo-600'"></div>
              <p class="mt-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Loading requests...</p>
            </div>
            <div v-else-if="requests.length === 0" class="text-center py-12">
              <span class="material-symbols-outlined text-6xl mb-4" :class="isDarkMode ? 'text-gray-600' : 'text-gray-400'">inbox</span>
              <p class="text-lg" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">No requests yet. Be the first to request a feature!</p>
            </div>
            <div v-else class="space-y-4">
              <div
                v-for="request in requests"
                :key="request.id"
                class="p-6 rounded-lg border transition-all cursor-pointer"
                :class="isDarkMode 
                  ? 'border-gray-700 bg-slate-800 hover:border-gray-600' 
                  : 'border-gray-200 bg-white hover:border-gray-300'"
                @click="openRequestDetails(request)"
              >
                <div class="flex items-start justify-between gap-4 mb-4">
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                      <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                        {{ request.title }}
                      </h3>
                      <span 
                        class="px-2 py-1 rounded text-xs font-medium"
                        :class="getRequestStatusClass(request.status)"
                      >
                        {{ request.status }}
                      </span>
                      <span 
                        v-if="request.priority"
                        class="px-2 py-1 rounded text-xs font-medium"
                        :class="getPriorityClass(request.priority)"
                      >
                        {{ request.priority }}
                      </span>
                    </div>
                    <p class="text-sm mb-3" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      {{ request.description }}
                    </p>
                    <div class="flex items-center gap-4 text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                      <span>Requested by {{ request.requestedBy }}</span>
                      <span>{{ formatDate(request.createdAt) }}</span>
                      <span v-if="request.assignedTo">Assigned to {{ request.assignedTo }}</span>
                      <span v-if="request.componentId" class="text-indigo-500">Linked to component</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <button
                      @click.stop="voteRequest(request.id)"
                      class="flex items-center gap-1 px-3 py-1 rounded-lg border transition-colors text-sm"
                      :class="isUserVoted(request.id)
                        ? (isDarkMode ? 'border-indigo-500 bg-indigo-900/20 text-indigo-400' : 'border-indigo-500 bg-indigo-50 text-indigo-600')
                        : (isDarkMode ? 'border-gray-600 bg-slate-700 hover:bg-slate-600 text-gray-300' : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-700')"
                    >
                      <span class="material-symbols-outlined text-base">thumb_up</span>
                      {{ request.votes }}
                    </button>
                  </div>
                </div>
                <div v-if="request.comments && request.comments.length > 0" class="mt-4 pt-4 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                  <p class="text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                    {{ request.comments.length }} comment{{ request.comments.length !== 1 ? 's' : '' }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Issues List -->
          <div v-if="feedbackTab === 'issues'">
            <div v-if="loadingIssues" class="text-center py-12">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2" :class="isDarkMode ? 'border-indigo-400' : 'border-indigo-600'"></div>
              <p class="mt-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Loading issues...</p>
            </div>
            <div v-else-if="issues.length === 0" class="text-center py-12">
              <span class="material-symbols-outlined text-6xl mb-4" :class="isDarkMode ? 'text-gray-600' : 'text-gray-400'">check_circle</span>
              <p class="text-lg" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">No issues reported. Great job!</p>
            </div>
            <div v-else class="space-y-4">
              <div
                v-for="issue in issues"
                :key="issue.id"
                class="p-6 rounded-lg border transition-all"
                :class="isDarkMode 
                  ? 'border-gray-700 bg-slate-800 hover:border-gray-600' 
                  : 'border-gray-200 bg-white hover:border-gray-300'"
              >
                <div class="flex items-start justify-between gap-4 mb-4">
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                      <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                        {{ issue.title }}
                      </h3>
                      <span 
                        class="px-2 py-1 rounded text-xs font-medium"
                        :class="getSeverityClass(issue.severity)"
                      >
                        {{ issue.severity }}
                      </span>
                      <span 
                        class="px-2 py-1 rounded text-xs font-medium"
                        :class="getRequestStatusClass(issue.status)"
                      >
                        {{ issue.status }}
                      </span>
                    </div>
                    <p class="text-sm mb-3" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      {{ issue.description }}
                    </p>
                    <div class="flex items-center gap-4 text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                      <span>Reported by {{ issue.reportedBy }}</span>
                      <span>{{ formatDate(issue.createdAt) }}</span>
                      <span v-if="issue.componentId">Component: {{ issue.componentId }}</span>
                      <span v-if="issue.assignedTo">Assigned to {{ issue.assignedTo }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals (same as before, but consolidated) -->
    <!-- Roadmap Create/Edit Modal -->
    <div
      v-if="showCreateModal || editingRoadmapItem"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      @click.self="closeRoadmapModal"
    >
      <div 
        class="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="roadmap-modal-title"
      >
        <div class="p-6 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
          <div class="flex items-center justify-between">
            <h2 id="roadmap-modal-title" class="text-xl font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              {{ editingRoadmapItem ? 'Edit Roadmap Item' : 'Create Roadmap Item' }}
            </h2>
            <button
              @click="closeRoadmapModal"
              class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              aria-label="Close modal"
            >
              <span class="material-symbols-outlined" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">close</span>
            </button>
          </div>
        </div>
        
        <form @submit.prevent="saveRoadmapItem" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Title
            </label>
            <input
              v-model="roadmapForm.title"
              type="text"
              required
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              placeholder="e.g., Dark Mode Support"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Description
            </label>
            <textarea
              v-model="roadmapForm.description"
              required
              rows="4"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              placeholder="Describe the roadmap item..."
            ></textarea>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                Category
              </label>
              <select
                v-model="roadmapForm.category"
                required
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              >
                <option value="feature">Feature</option>
                <option value="improvement">Improvement</option>
                <option value="bug-fix">Bug Fix</option>
                <option value="deprecation">Deprecation</option>
                <option value="integration">Integration</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                Priority
              </label>
              <select
                v-model="roadmapForm.priority"
                required
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                Status
              </label>
              <select
                v-model="roadmapForm.status"
                required
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              >
                <option value="planned">Planned</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                Target Date
              </label>
              <input
                v-model="roadmapForm.targetDate"
                type="date"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              />
            </div>
          </div>
          
          <div class="flex items-center gap-4 pt-4">
            <button
              type="submit"
              class="flex-1 px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-400 transition-colors font-medium"
            >
              {{ editingRoadmapItem ? 'Update Item' : 'Create Item' }}
            </button>
            <button
              type="button"
              @click="closeRoadmapModal"
              class="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              :class="isDarkMode ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Request Modal -->
    <div
      v-if="showRequestModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="showRequestModal = false"
    >
      <div 
        class="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-modal-title"
      >
        <div class="p-6 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
          <div class="flex items-center justify-between">
            <h2 id="request-modal-title" class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              Request New Feature
            </h2>
            <button
              @click="showRequestModal = false"
              class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close modal"
            >
              <span class="material-symbols-outlined" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">close</span>
            </button>
          </div>
        </div>
        <form @submit.prevent="submitRequest" class="p-6 space-y-4">
          <div>
            <label for="request-title" class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Title *
            </label>
            <input
              id="request-title"
              v-model="requestForm.title"
              type="text"
              required
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              :class="isDarkMode ? 'bg-slate-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'"
              placeholder="e.g., Data Table Component"
            />
          </div>
          <div>
            <label for="request-description" class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Description *
            </label>
            <textarea
              id="request-description"
              v-model="requestForm.description"
              required
              rows="4"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              :class="isDarkMode ? 'bg-slate-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'"
              placeholder="Describe the component or feature you'd like to see..."
            ></textarea>
          </div>
          <div>
            <label for="request-use-case" class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Use Case
            </label>
            <textarea
              id="request-use-case"
              v-model="requestForm.useCase"
              rows="3"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              :class="isDarkMode ? 'bg-slate-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'"
              placeholder="How would you use this component?"
            ></textarea>
          </div>
          <div>
            <label for="request-category" class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Category *
            </label>
            <select
              id="request-category"
              v-model="requestForm.category"
              required
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              :class="isDarkMode ? 'bg-slate-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'"
            >
              <option value="">Select category</option>
              <option value="form-controls">Form Controls</option>
              <option value="data-display">Data Display</option>
              <option value="navigation">Navigation</option>
              <option value="feedback">Feedback</option>
              <option value="layout">Layout</option>
              <option value="utilities">Utilities</option>
            </select>
          </div>
          <div>
            <label for="request-priority" class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Priority
            </label>
            <select
              id="request-priority"
              v-model="requestForm.priority"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              :class="isDarkMode ? 'bg-slate-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'"
            >
              <option value="medium">Medium</option>
              <option value="low">Low</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div class="flex gap-3 pt-4">
            <button
              type="button"
              @click="showRequestModal = false"
              class="flex-1 px-4 py-2 border rounded-lg font-medium transition-colors"
              :class="isDarkMode 
                ? 'border-gray-600 bg-slate-700 hover:bg-slate-600 text-gray-300' 
                : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-700'"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="submittingRequest"
              class="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="submittingRequest">Submitting...</span>
              <span v-else>Submit Request</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Issue Modal -->
    <div
      v-if="showIssueModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="showIssueModal = false"
    >
      <div 
        class="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="issue-modal-title"
      >
        <div class="p-6 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
          <div class="flex items-center justify-between">
            <h2 id="issue-modal-title" class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              Report Issue
            </h2>
            <button
              @click="showIssueModal = false"
              class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close modal"
            >
              <span class="material-symbols-outlined" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">close</span>
            </button>
          </div>
        </div>
        <form @submit.prevent="submitIssue" class="p-6 space-y-4">
          <div>
            <label for="issue-title" class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Title *
            </label>
            <input
              id="issue-title"
              v-model="issueForm.title"
              type="text"
              required
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              :class="isDarkMode ? 'bg-slate-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'"
              placeholder="Brief description of the issue"
            />
          </div>
          <div>
            <label for="issue-description" class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Description *
            </label>
            <textarea
              id="issue-description"
              v-model="issueForm.description"
              required
              rows="4"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              :class="isDarkMode ? 'bg-slate-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'"
              placeholder="Describe the issue in detail..."
            ></textarea>
          </div>
          <div>
            <label for="issue-category" class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Category *
            </label>
            <select
              id="issue-category"
              v-model="issueForm.category"
              required
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              :class="isDarkMode ? 'bg-slate-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'"
            >
              <option value="">Select category</option>
              <option value="bug">Bug</option>
              <option value="components">Components</option>
              <option value="tokens">Tokens</option>
              <option value="guidelines">Guidelines</option>
              <option value="documentation">Documentation</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label for="issue-severity" class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Severity *
            </label>
            <select
              id="issue-severity"
              v-model="issueForm.severity"
              required
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              :class="isDarkMode ? 'bg-slate-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div class="flex gap-3 pt-4">
            <button
              type="button"
              @click="showIssueModal = false"
              class="flex-1 px-4 py-2 border rounded-lg font-medium transition-colors"
              :class="isDarkMode 
                ? 'border-gray-600 bg-slate-700 hover:bg-slate-600 text-gray-300' 
                : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-700'"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="submittingIssue"
              class="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="submittingIssue">Submitting...</span>
              <span v-else>Submit Issue</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Request Details Modal -->
    <div
      v-if="selectedRequest"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="selectedRequest = null"
    >
      <div 
        class="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <div class="p-6 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              {{ selectedRequest.title }}
            </h2>
            <button
              @click="selectedRequest = null"
              class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close modal"
            >
              <span class="material-symbols-outlined" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">close</span>
            </button>
          </div>
        </div>
        <div class="p-6 space-y-6">
          <div>
            <h3 class="text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Description</h3>
            <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">{{ selectedRequest.description }}</p>
          </div>
          <div v-if="selectedRequest.useCase">
            <h3 class="text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Use Case</h3>
            <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">{{ selectedRequest.useCase }}</p>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <h3 class="text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Status</h3>
              <span class="px-2 py-1 rounded text-xs font-medium" :class="getRequestStatusClass(selectedRequest.status)">
                {{ selectedRequest.status }}
              </span>
            </div>
            <div>
              <h3 class="text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Priority</h3>
              <span class="px-2 py-1 rounded text-xs font-medium" :class="getPriorityClass(selectedRequest.priority)">
                {{ selectedRequest.priority }}
              </span>
            </div>
          </div>
          <div v-if="selectedRequest.comments && selectedRequest.comments.length > 0">
            <h3 class="text-sm font-medium mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Comments</h3>
            <div class="space-y-4">
              <div
                v-for="comment in selectedRequest.comments"
                :key="comment.id"
                class="p-4 rounded-lg"
                :class="isDarkMode ? 'bg-slate-700' : 'bg-gray-50'"
              >
                <div class="flex items-center gap-2 mb-2">
                  <span class="font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ comment.author }}</span>
                  <span class="text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">{{ formatDate(comment.createdAt) }}</span>
                </div>
                <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">{{ comment.content }}</p>
              </div>
            </div>
          </div>
          <div>
            <h3 class="text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Add Comment</h3>
            <div class="flex gap-2">
              <input
                v-model="newComment"
                type="text"
                placeholder="Add a comment..."
                class="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                :class="isDarkMode ? 'bg-slate-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'"
                @keyup.enter="addComment(selectedRequest.id)"
              />
              <button
                @click="addComment(selectedRequest.id)"
                class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
              >
                Comment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import axios from 'axios';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const activeTab = ref('whats-new');
const feedbackTab = ref('requests');
const statusFilter = ref('all');
const showCreateModal = ref(false);
const editingRoadmapItem = ref(null);
const showRequestModal = ref(false);
const showIssueModal = ref(false);
const showReleaseNotesModal = ref(false);
const editingReleaseNote = ref(null);
const loadingRequests = ref(false);
const loadingIssues = ref(false);
const submittingRequest = ref(false);
const submittingIssue = ref(false);
const selectedRequest = ref(null);
const newComment = ref('');
const canEditRoadmap = ref(false);
const canEditReleaseNotes = ref(false);

const API_BASE_URL = 'http://localhost:3000/api/v1';
const API_KEY = 'test-api-key-123';

// Check RBAC permissions
const checkPermissions = async () => {
  try {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      canEditRoadmap.value = false;
      canEditReleaseNotes.value = false;
      return;
    }
    
    const roadmapEditResponse = await axios.get(
      `http://localhost:3000/api/v1/rbac/users/${userId}/permissions/roadmap:edit`
    );
    
    canEditRoadmap.value = roadmapEditResponse.data.hasPermission;
    canEditReleaseNotes.value = roadmapEditResponse.data.hasPermission; // Same permission for release notes
  } catch (error) {
    console.error('Error checking permissions:', error);
    // Fail open - allow viewing but not editing
    canEditRoadmap.value = false;
    canEditReleaseNotes.value = false;
  }
};

// Release Notes Data
const releaseNotes = ref([
  {
    version: '2.1.0',
    type: 'minor',
    date: '2024-01-20',
    description: 'Enhanced component playground integration and improved feedback system.',
    features: [
      'Integrated interactive playground into component pages',
      'Added props editor and live preview to component documentation',
      'Combined roadmap and feedback into unified page',
      'Added "What\'s New" release notes section'
    ],
    improvements: [
      'Improved code export functionality (Vue, React, HTML)',
      'Enhanced dark mode support across all pages',
      'Better mobile responsiveness'
    ],
    fixes: [
      'Fixed component preview rendering issues',
      'Resolved code generation formatting problems'
    ]
  },
  {
    version: '2.0.0',
    type: 'major',
    date: '2024-01-15',
    description: 'Major update with new governance features and enhanced design system tools.',
    features: [
      'Design System Governance and Compliance Scanner',
      'Component Request Workflow',
      'Performance Budgets',
      'Bundle Size Analysis',
      'Public Roadmap',
      'AI-Powered Design System Assistant (Eero)'
    ],
    improvements: [
      'Enhanced component versioning system',
      'Improved token management',
      'Better accessibility compliance checking'
    ],
    fixes: [
      'Fixed various dark mode issues',
      'Resolved navigation drawer problems'
    ]
  },
  {
    version: '1.5.0',
    type: 'minor',
    date: '2024-01-01',
    description: 'New tools and improvements to the design system.',
    features: [
      'Color Scale Generator',
      'Color Converter',
      'Color Contrast Checker',
      'Icon Library with Lucide icons',
      'Token Studio with Style Dictionary support'
    ],
    improvements: [
      'Enhanced color utilities',
      'Improved icon management',
      'Better token organization'
    ]
  }
]);

// Roadmap Data
const roadmapItems = ref([]);
const roadmapForm = ref({
  title: '',
  description: '',
  category: 'feature',
  priority: 'medium',
  status: 'planned',
  targetDate: ''
});

// Request/Issue Data
const requests = ref([]);
const issues = ref([]);
const userVotes = ref(new Set());

const requestForm = ref({
  title: '',
  description: '',
  useCase: '',
  category: '',
  priority: 'medium'
});

const issueForm = ref({
  category: '',
  title: '',
  severity: 'medium',
  description: ''
});

const filteredRoadmapItems = computed(() => {
  if (statusFilter.value === 'all') return roadmapItems.value;
  return roadmapItems.value.filter(item => item.status === statusFilter.value);
});

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// Roadmap Functions
const loadRoadmap = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/roadmap`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    roadmapItems.value = response.data;
  } catch (error) {
    console.error('Error loading roadmap:', error);
  }
};

const saveRoadmapItem = async () => {
  try {
    if (editingRoadmapItem.value) {
      await axios.put(
        `${API_BASE_URL}/roadmap/items/${editingRoadmapItem.value.id}`,
        roadmapForm.value,
        { headers: { Authorization: `Bearer ${API_KEY}` } }
      );
    } else {
      await axios.post(
        `${API_BASE_URL}/roadmap/items`,
        roadmapForm.value,
        { headers: { Authorization: `Bearer ${API_KEY}` } }
      );
    }
    closeRoadmapModal();
    loadRoadmap();
  } catch (error) {
    console.error('Error saving roadmap item:', error);
    alert('Error saving roadmap item. Please try again.');
  }
};

const editRoadmapItem = (item) => {
  editingRoadmapItem.value = item;
  roadmapForm.value = {
    title: item.title,
    description: item.description,
    category: item.category,
    priority: item.priority,
    status: item.status,
    targetDate: item.targetDate || ''
  };
  showCreateModal.value = true;
};

const deleteRoadmapItem = async (id) => {
  if (!confirm('Are you sure you want to delete this roadmap item?')) return;
  
  try {
    await axios.delete(`${API_BASE_URL}/roadmap/items/${id}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    loadRoadmap();
  } catch (error) {
    console.error('Error deleting item:', error);
    alert('Error deleting roadmap item. Please try again.');
  }
};

const closeRoadmapModal = () => {
  showCreateModal.value = false;
  editingRoadmapItem.value = null;
  roadmapForm.value = {
    title: '',
    description: '',
    category: 'feature',
    priority: 'medium',
    status: 'planned',
    targetDate: ''
  };
};

// Request/Issue Functions
const loadRequests = async () => {
  loadingRequests.value = true;
  try {
    const response = await axios.get(`${API_BASE_URL}/requests`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    requests.value = response.data || [];
    requests.value.forEach(req => {
      if (req.voters && req.voters.includes('current-user')) {
        userVotes.value.add(req.id);
      }
    });
  } catch (error) {
    console.error('Error loading requests:', error);
  } finally {
    loadingRequests.value = false;
  }
};

const loadIssues = async () => {
  loadingIssues.value = true;
  try {
    const response = await axios.get(`${API_BASE_URL}/issues`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    issues.value = response.data || [];
  } catch (error) {
    console.error('Error loading issues:', error);
  } finally {
    loadingIssues.value = false;
  }
};

const submitRequest = async () => {
  if (!requestForm.value.title || !requestForm.value.description || !requestForm.value.category) {
    alert('Please fill in all required fields (Title, Description, and Category)');
    return;
  }

  submittingRequest.value = true;
  try {
    const response = await axios.post(
      `${API_BASE_URL}/requests`,
      {
        title: requestForm.value.title,
        description: requestForm.value.description,
        useCase: requestForm.value.useCase || undefined,
        requestedBy: 'current-user',
        category: requestForm.value.category,
        priority: requestForm.value.priority || 'medium'
      },
      {
        headers: { Authorization: `Bearer ${API_KEY}` }
      }
    );

    requests.value.unshift(response.data);
    requestForm.value = { title: '', description: '', useCase: '', category: '', priority: 'medium' };
    showRequestModal.value = false;
  } catch (error) {
    console.error('Error submitting request:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
    alert(`Failed to submit request: ${errorMessage}`);
  } finally {
    submittingRequest.value = false;
  }
};

const submitIssue = async () => {
  if (!issueForm.value.title || !issueForm.value.description || !issueForm.value.category) {
    return;
  }

  submittingIssue.value = true;
  try {
    const response = await axios.post(
      `${API_BASE_URL}/issues`,
      {
        title: issueForm.value.title,
        description: issueForm.value.description,
        category: issueForm.value.category,
        severity: issueForm.value.severity,
        reportedBy: 'current-user'
      },
      {
        headers: { Authorization: `Bearer ${API_KEY}` }
      }
    );

    issues.value.unshift(response.data);
    issueForm.value = { category: '', title: '', severity: 'medium', description: '' };
    showIssueModal.value = false;
  } catch (error) {
    console.error('Error submitting issue:', error);
    alert('Failed to submit issue. Please try again.');
  } finally {
    submittingIssue.value = false;
  }
};

const voteRequest = async (requestId) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/requests/${requestId}/vote`,
      { userId: 'current-user' },
      {
        headers: { Authorization: `Bearer ${API_KEY}` }
      }
    );

    const request = requests.value.find(r => r.id === requestId);
    if (request) {
      request.votes = response.data.votes;
      request.voters = response.data.voters;
      
      if (userVotes.value.has(requestId)) {
        userVotes.value.delete(requestId);
      } else {
        userVotes.value.add(requestId);
      }
    }
  } catch (error) {
    console.error('Error voting:', error);
  }
};

const isUserVoted = (requestId) => {
  return userVotes.value.has(requestId);
};

const openRequestDetails = async (request) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/requests/${request.id}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    selectedRequest.value = response.data;
  } catch (error) {
    console.error('Error loading request details:', error);
    selectedRequest.value = request;
  }
};

const addComment = async (requestId) => {
  if (!newComment.value.trim()) return;

  try {
    const response = await axios.post(
      `${API_BASE_URL}/requests/${requestId}/comments`,
      {
        author: 'current-user',
        content: newComment.value
      },
      {
        headers: { Authorization: `Bearer ${API_KEY}` }
      }
    );

    if (selectedRequest.value) {
      if (!selectedRequest.value.comments) {
        selectedRequest.value.comments = [];
      }
      selectedRequest.value.comments.push(response.data);
    }

    const request = requests.value.find(r => r.id === requestId);
    if (request) {
      if (!request.comments) {
        request.comments = [];
      }
      request.comments.push(response.data);
    }

    newComment.value = '';
  } catch (error) {
    console.error('Error adding comment:', error);
  }
};

// Style Classes
const getStatusClass = (status) => {
  const classes = {
    'planned': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    'in-progress': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    'completed': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    'cancelled': 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
  };
  return classes[status] || classes.planned;
};

const getPriorityClass = (priority) => {
  const classes = {
    'high': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    'medium': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    'low': 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
  };
  return classes[priority] || classes.medium;
};

const getCategoryClass = (category) => {
  const classes = {
    'feature': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    'improvement': 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
    'bug-fix': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    'deprecation': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
    'integration': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
  };
  return classes[category] || classes.feature;
};

const getRequestStatusClass = (status) => {
  const classes = {
    'submitted': isDarkMode.value ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700',
    'under-review': isDarkMode.value ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700',
    'approved': isDarkMode.value ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700',
    'rejected': isDarkMode.value ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700',
    'needs-more-info': isDarkMode.value ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-700',
    'in-progress': isDarkMode.value ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-100 text-indigo-700',
    'completed': isDarkMode.value ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700',
    'released': isDarkMode.value ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700',
    'open': isDarkMode.value ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700',
    'investigating': isDarkMode.value ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700',
    'resolved': isDarkMode.value ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700',
    'closed': isDarkMode.value ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
  };
  return classes[status] || (isDarkMode.value ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-700');
};

const getSeverityClass = (severity) => {
  const classes = {
    'low': isDarkMode.value ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700',
    'medium': isDarkMode.value ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700',
    'high': isDarkMode.value ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-700',
    'critical': isDarkMode.value ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'
  };
  return classes[severity] || (isDarkMode.value ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-700');
};

let darkModeObserver = null;

onMounted(async () => {
  await checkPermissions();
  loadRoadmap();
  loadRequests();
  loadIssues();
  
  darkModeObserver = new MutationObserver(() => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  });
  darkModeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });
});

onBeforeUnmount(() => {
  if (darkModeObserver) {
    darkModeObserver.disconnect();
  }
});
</script>

<style scoped>
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>

