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
            
            <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div class="flex-1">
                <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  Feedback & Requests
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Request new features, report issues, vote on ideas, and contribute to the design system.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="max-w-7xl mx-auto mb-8">
          <div class="flex flex-wrap gap-4">
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
        </div>

        <!-- Tabs -->
        <div class="max-w-7xl mx-auto mb-8">
          <div class="flex gap-2 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
            <button
              @click="activeTab = 'requests'"
              class="px-6 py-3 font-medium transition-colors relative"
              :class="activeTab === 'requests'
                ? (isDarkMode ? 'text-indigo-400' : 'text-indigo-600')
                : (isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900')"
            >
              Feature Requests
              <div 
                v-if="activeTab === 'requests'"
                class="absolute bottom-0 left-0 right-0 h-0.5"
                :class="isDarkMode ? 'bg-indigo-400' : 'bg-indigo-600'"
              ></div>
            </button>
            <button
              @click="activeTab = 'issues'"
              class="px-6 py-3 font-medium transition-colors relative"
              :class="activeTab === 'issues'
                ? (isDarkMode ? 'text-indigo-400' : 'text-indigo-600')
                : (isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900')"
            >
              Reported Issues
              <div 
                v-if="activeTab === 'issues'"
                class="absolute bottom-0 left-0 right-0 h-0.5"
                :class="isDarkMode ? 'bg-indigo-400' : 'bg-indigo-600'"
              ></div>
            </button>
          </div>
        </div>

        <!-- Requests List -->
        <div v-if="activeTab === 'requests'" class="max-w-7xl mx-auto mb-8">
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
                      :class="getStatusClass(request.status)"
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
        <div v-if="activeTab === 'issues'" class="max-w-7xl mx-auto mb-8">
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
                      :class="getStatusClass(issue.status)"
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
                  <span class="px-2 py-1 rounded text-xs font-medium" :class="getStatusClass(selectedRequest.status)">
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
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';

const router = useRouter();
const API_BASE_URL = 'http://localhost:3000/api/v1';
const API_KEY = 'test-api-key-123';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const activeTab = ref('requests');
const showRequestModal = ref(false);
const showIssueModal = ref(false);
const loadingRequests = ref(false);
const loadingIssues = ref(false);
const submittingRequest = ref(false);
const submittingIssue = ref(false);
const selectedRequest = ref(null);
const newComment = ref('');

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

const requests = ref([]);
const issues = ref([]);
const userVotes = ref(new Set()); // Track which requests user has voted on

const loadRequests = async () => {
  loadingRequests.value = true;
  try {
    const response = await axios.get(`${API_BASE_URL}/requests`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    requests.value = response.data || [];
    // Track user votes (in real app, this would come from backend)
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
        requestedBy: 'current-user', // In real app, get from auth
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
    console.error('Full error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: errorMessage
    });
    alert(`Failed to submit request: ${errorMessage}\n\nPlease check the browser console for more details.`);
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
        reportedBy: 'current-user' // In real app, get from auth
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

    // Update in list
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

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

const getStatusClass = (status) => {
  const classes = {
    'submitted': isDarkMode.value ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700',
    'under-review': isDarkMode.value ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700',
    'approved': isDarkMode.value ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700',
    'rejected': isDarkMode.value ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700',
    'needs-more-info': isDarkMode.value ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-700',
    'in-progress': isDarkMode.value ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-100 text-indigo-700',
    'completed': isDarkMode.value ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700',
    'released': isDarkMode.value ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700',
    'planned': isDarkMode.value ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700',
    'open': isDarkMode.value ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700',
    'investigating': isDarkMode.value ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700',
    'resolved': isDarkMode.value ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700',
    'closed': isDarkMode.value ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
  };
  return classes[status] || (isDarkMode.value ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-700');
};

const getPriorityClass = (priority) => {
  const classes = {
    'low': isDarkMode.value ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700',
    'medium': isDarkMode.value ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700',
    'high': isDarkMode.value ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-700',
    'critical': isDarkMode.value ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'
  };
  return classes[priority] || (isDarkMode.value ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-700');
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

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

// Watch for tab changes to load appropriate data
const watchTab = () => {
  if (activeTab.value === 'requests') {
    loadRequests();
  } else if (activeTab.value === 'issues') {
    loadIssues();
  }
};

let darkModeObserver = null;
let darkModeInterval = null;

onMounted(() => {
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
  if (darkModeInterval) {
    clearInterval(darkModeInterval);
  }
});
</script>
