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
              @click="activeTab = 'requests'"
              class="px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 border"
              :class="activeTab === 'requests'
                ? (isDarkMode ? 'border-indigo-500 bg-indigo-900/20 text-indigo-400' : 'border-indigo-500 bg-indigo-50 text-indigo-600')
                : (isDarkMode ? 'border-gray-600 bg-slate-800 hover:bg-slate-700 text-gray-300' : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-700')"
            >
              <span class="material-symbols-outlined">lightbulb</span>
              View Requests
            </button>
            <button
              @click="activeTab = 'issues'"
              class="px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 border"
              :class="activeTab === 'issues'
                ? (isDarkMode ? 'border-indigo-500 bg-indigo-900/20 text-indigo-400' : 'border-indigo-500 bg-indigo-50 text-indigo-600')
                : (isDarkMode ? 'border-gray-600 bg-slate-800 hover:bg-slate-700 text-gray-300' : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-700')"
            >
              <span class="material-symbols-outlined">report</span>
              View Issues
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
          <div 
            class="rounded-lg shadow-sm border"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <div class="p-6">
              <div class="space-y-4">
                <div
                  v-for="request in requests"
                  :key="request.id"
                  class="p-6 rounded-lg border transition-all"
                  :class="isDarkMode 
                    ? 'border-gray-700 bg-slate-800 hover:border-gray-600' 
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'"
                >
                  <div class="flex items-start justify-between gap-4 mb-4">
                    <div class="flex-1">
                      <h3 class="text-lg font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                        {{ request.title }}
                      </h3>
                      <p class="text-sm mb-3" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        {{ request.description }}
                      </p>
                      <div class="flex items-center gap-4 text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                        <span>Requested by {{ request.requestedBy }}</span>
                        <span>{{ formatDate(request.createdAt) }}</span>
                        <span 
                          class="px-2 py-1 rounded"
                          :class="getStatusClass(request.status)"
                        >
                          {{ request.status }}
                        </span>
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <button
                        @click="voteRequest(request.id)"
                        class="flex items-center gap-1 px-3 py-1 rounded-lg border transition-colors text-sm"
                        :class="request.userVoted
                          ? (isDarkMode ? 'border-indigo-500 bg-indigo-900/20 text-indigo-400' : 'border-indigo-500 bg-indigo-50 text-indigo-600')
                          : (isDarkMode ? 'border-gray-600 bg-slate-700 hover:bg-slate-600 text-gray-300' : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-700')"
                      >
                        <span class="material-symbols-outlined text-base">thumb_up</span>
                        {{ request.votes }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Issues List -->
        <div v-if="activeTab === 'issues'" class="max-w-7xl mx-auto mb-8">
          <div 
            class="rounded-lg shadow-sm border"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <div class="p-6">
              <div class="space-y-4">
                <div
                  v-for="issue in issues"
                  :key="issue.id"
                  class="p-6 rounded-lg border transition-all"
                  :class="isDarkMode 
                    ? 'border-gray-700 bg-slate-800 hover:border-gray-600' 
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'"
                >
                  <div class="flex items-start justify-between gap-4 mb-4">
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-2">
                        <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                          {{ issue.title }}
                        </h3>
                        <span 
                          class="px-2 py-1 rounded text-xs"
                          :class="getSeverityClass(issue.severity)"
                        >
                          {{ issue.severity }}
                        </span>
                      </div>
                      <p class="text-sm mb-3" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        {{ issue.description }}
                      </p>
                      <div class="flex items-center gap-4 text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                        <span>Reported by {{ issue.reportedBy }}</span>
                        <span>{{ formatDate(issue.createdAt) }}</span>
                        <span>Category: {{ issue.category }}</span>
                        <span 
                          class="px-2 py-1 rounded"
                          :class="getStatusClass(issue.status)"
                        >
                          {{ issue.status }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Request Modal -->
        <div
          v-if="showRequestModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          @click.self="showRequestModal = false"
        >
          <div 
            class="w-full max-w-2xl rounded-lg shadow-xl border p-6 max-h-[90vh] overflow-auto"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
            role="dialog"
            aria-modal="true"
            aria-labelledby="request-modal-title"
          >
            <div class="flex items-center justify-between mb-6">
              <h2 id="request-modal-title" class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Request New Feature
              </h2>
              <button
                @click="showRequestModal = false"
                class="p-2 rounded-lg transition-colors"
                :class="isDarkMode ? 'hover:bg-slate-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'"
                aria-label="Close modal"
              >
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            <form @submit.prevent="submitRequest" class="space-y-4">
              <div>
                <label for="request-title" class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Feature Name <span class="text-red-500">*</span>
                </label>
                <input
                  id="request-title"
                  v-model="requestForm.title"
                  type="text"
                  required
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  :class="isDarkMode 
                    ? 'border-gray-600 bg-slate-800 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'"
                  aria-required="true"
                />
              </div>
              <div>
                <label for="request-description" class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Description <span class="text-red-500">*</span>
                </label>
                <textarea
                  id="request-description"
                  v-model="requestForm.description"
                  required
                  rows="4"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  :class="isDarkMode 
                    ? 'border-gray-600 bg-slate-800 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'"
                  aria-required="true"
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
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  :class="isDarkMode 
                    ? 'border-gray-600 bg-slate-800 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'"
                ></textarea>
              </div>
              <div class="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  @click="showRequestModal = false"
                  class="px-4 py-2 rounded-lg border transition-colors"
                  :class="isDarkMode 
                    ? 'border-gray-600 bg-slate-800 hover:bg-slate-700 text-gray-300' 
                    : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-700'"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 rounded-lg font-medium transition-colors"
                  :class="isDarkMode 
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Issue Modal -->
        <div
          v-if="showIssueModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          @click.self="showIssueModal = false"
        >
          <div 
            class="w-full max-w-2xl rounded-lg shadow-xl border p-6 max-h-[90vh] overflow-auto"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
            role="dialog"
            aria-modal="true"
            aria-labelledby="issue-modal-title"
          >
            <div class="flex items-center justify-between mb-6">
              <h2 id="issue-modal-title" class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Report Issue
              </h2>
              <button
                @click="showIssueModal = false"
                class="p-2 rounded-lg transition-colors"
                :class="isDarkMode ? 'hover:bg-slate-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'"
                aria-label="Close modal"
              >
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            <form @submit.prevent="submitIssue" class="space-y-4">
              <div>
                <label for="issue-category" class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Category <span class="text-red-500">*</span>
                </label>
                <select
                  id="issue-category"
                  v-model="issueForm.category"
                  required
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  :class="isDarkMode 
                    ? 'border-gray-600 bg-slate-800 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'"
                  aria-required="true"
                >
                  <option value="">Select category</option>
                  <option value="Components">Components</option>
                  <option value="Tokens">Tokens</option>
                  <option value="Patterns">Patterns</option>
                  <option value="Guidelines">Guidelines</option>
                  <option value="Fonts">Fonts</option>
                  <option value="Tools">Tools</option>
                  <option value="Design Assets">Design Assets</option>
                  <option value="API">API</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label for="issue-title" class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Issue Title <span class="text-red-500">*</span>
                </label>
                <input
                  id="issue-title"
                  v-model="issueForm.title"
                  type="text"
                  required
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  :class="isDarkMode 
                    ? 'border-gray-600 bg-slate-800 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'"
                  aria-required="true"
                />
              </div>
              <div>
                <label for="issue-severity" class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Severity <span class="text-red-500">*</span>
                </label>
                <select
                  id="issue-severity"
                  v-model="issueForm.severity"
                  required
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  :class="isDarkMode 
                    ? 'border-gray-600 bg-slate-800 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'"
                  aria-required="true"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label for="issue-description" class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Description <span class="text-red-500">*</span>
                </label>
                <textarea
                  id="issue-description"
                  v-model="issueForm.description"
                  required
                  rows="4"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  :class="isDarkMode 
                    ? 'border-gray-600 bg-slate-800 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'"
                  aria-required="true"
                ></textarea>
              </div>
              <div class="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  @click="showIssueModal = false"
                  class="px-4 py-2 rounded-lg border transition-colors"
                  :class="isDarkMode 
                    ? 'border-gray-600 bg-slate-800 hover:bg-slate-700 text-gray-300' 
                    : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-700'"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 rounded-lg font-medium transition-colors"
                  :class="isDarkMode 
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
                >
                  Submit Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const activeTab = ref('requests');
const showRequestModal = ref(false);
const showIssueModal = ref(false);

const requestForm = ref({
  title: '',
  description: '',
  useCase: ''
});

const issueForm = ref({
  category: '',
  title: '',
  severity: 'medium',
  description: ''
});

const requests = ref([
  {
    id: 1,
    title: 'Data Table Component',
    description: 'A comprehensive data table component with sorting, filtering, and pagination capabilities.',
    requestedBy: 'John Doe',
    createdAt: new Date('2024-01-15'),
    votes: 24,
    status: 'planned',
    userVoted: false
  },
  {
    id: 2,
    title: 'Date Picker Component',
    description: 'A date picker component with range selection and calendar view.',
    requestedBy: 'Jane Smith',
    createdAt: new Date('2024-01-10'),
    votes: 18,
    status: 'in-progress',
    userVoted: true
  },
  {
    id: 3,
    title: 'Toast Notification Component',
    description: 'A toast notification system for displaying temporary messages.',
    requestedBy: 'Mike Johnson',
    createdAt: new Date('2024-01-08'),
    votes: 31,
    status: 'planned',
    userVoted: false
  }
]);

const issues = ref([
  {
    id: 1,
    title: 'Button hover state not working in dark mode',
    description: 'The button component does not show proper hover state when in dark mode. The background color change is barely visible.',
    reportedBy: 'Sarah Williams',
    createdAt: new Date('2024-01-20'),
    category: 'Components',
    severity: 'medium',
    status: 'open'
  },
  {
    id: 2,
    title: 'Token export format missing',
    description: 'The token export should include SCSS variables format, but it\'s currently missing from the export options.',
    reportedBy: 'Tom Brown',
    createdAt: new Date('2024-01-18'),
    category: 'Tokens',
    severity: 'high',
    status: 'in-progress'
  },
  {
    id: 3,
    title: 'Guidelines page loading slowly',
    description: 'The guidelines page takes too long to load, especially when navigating between sections.',
    reportedBy: 'Lisa Anderson',
    createdAt: new Date('2024-01-16'),
    category: 'Guidelines',
    severity: 'low',
    status: 'resolved'
  }
]);

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

const getStatusClass = (status) => {
  const classes = {
    'planned': isDarkMode.value ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700',
    'in-progress': isDarkMode.value ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700',
    'open': isDarkMode.value ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700',
    'resolved': isDarkMode.value ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
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

const voteRequest = (id) => {
  const request = requests.value.find(r => r.id === id);
  if (request) {
    if (request.userVoted) {
      request.votes--;
      request.userVoted = false;
    } else {
      request.votes++;
      request.userVoted = true;
    }
  }
};

const submitRequest = () => {
  const newRequest = {
    id: requests.value.length + 1,
    title: requestForm.value.title,
    description: requestForm.value.description,
    requestedBy: 'Current User',
    createdAt: new Date(),
    votes: 0,
    status: 'planned',
    userVoted: false
  };
  requests.value.unshift(newRequest);
  requestForm.value = { title: '', description: '', useCase: '' };
  showRequestModal.value = false;
};

const submitIssue = () => {
  const newIssue = {
    id: issues.value.length + 1,
    title: issueForm.value.title,
    description: issueForm.value.description,
    reportedBy: 'Current User',
    createdAt: new Date(),
    category: issueForm.value.category,
    severity: issueForm.value.severity,
    status: 'open'
  };
  issues.value.unshift(newIssue);
  issueForm.value = { category: '', title: '', severity: 'medium', description: '' };
  showIssueModal.value = false;
};

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

let darkModeObserver = null;
let darkModeInterval = null;

onMounted(() => {
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

