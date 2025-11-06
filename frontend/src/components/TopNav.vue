<template>
  <nav class="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm dark:bg-slate-800 dark:border-slate-700 relative">
    <div class="flex items-center h-16">
      <!-- Left spacer for sidebar -->
      <div class="w-24 flex-shrink-0"></div>
      
      <!-- Site Title - Left Justified (positioned absolutely) -->
      <router-link
        to="/"
        class="absolute left-0 flex items-center gap-2 pl-[50px] transition-all group"
      >
        <!-- Custom Carets Icon (overlapping by 25%) -->
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          class="transition-transform group-hover:scale-110"
        >
          <defs>
            <linearGradient id="caretGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style="stop-color:#312e81;stop-opacity:1" />
              <stop offset="50%" style="stop-color:#3730a3;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#4338ca;stop-opacity:1" />
            </linearGradient>
            <linearGradient id="caretGradientDark" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style="stop-color:#1e1b4b;stop-opacity:1" />
              <stop offset="50%" style="stop-color:#312e81;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#3730a3;stop-opacity:1" />
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
            <span class="text-2xl font-bold bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-700 dark:from-indigo-950 dark:via-indigo-900 dark:to-indigo-800 bg-clip-text text-transparent">Design System</span>
      </router-link>
      
      <!-- Center Search Bar -->
      <div class="flex-1 flex justify-center">
        <div class="w-full max-w-2xl mx-8">
          <div class="relative">
            <span class="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-xl pointer-events-none"
              :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'"
            >
              search
            </span>
            <input
              type="text"
              placeholder="Search design system..."
              class="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-colors"
              :class="isDarkMode 
                ? 'border-slate-600 bg-slate-700 text-gray-100 placeholder-gray-400' 
                : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'"
            />
          </div>
        </div>
      </div>

      <!-- Right Actions -->
      <div class="flex items-center gap-4 px-4 sm:px-6 lg:px-8 flex-shrink-0">
        <!-- Live Chat -->
        <button
          @click="toggleChat"
          class="relative flex items-center justify-center p-2 rounded-lg transition-colors"
          :class="isDarkMode 
            ? 'text-gray-300 hover:text-indigo-400 hover:bg-indigo-900/20' 
            : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'"
          title="Live Chat"
        >
          <span class="material-symbols-outlined flex items-center justify-center">live_help</span>
        </button>

        <!-- Notifications -->
        <div class="relative" ref="notificationsContainer">
          <button
            @click="toggleNotifications"
            class="relative flex items-center justify-center p-2 rounded-lg transition-colors"
            :class="isDarkMode 
              ? 'text-gray-300 hover:text-indigo-400 hover:bg-indigo-900/20' 
              : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'"
            title="Notifications"
          >
            <span class="material-symbols-outlined flex items-center justify-center">notifications</span>
            <span 
              v-if="recentActivity.length > 0"
              class="absolute top-1 right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-xs font-semibold px-1"
              :class="isDarkMode ? 'bg-indigo-400 text-indigo-900' : 'bg-indigo-600 text-white'"
            >
              {{ recentActivity.length > 9 ? '9+' : recentActivity.length }}
            </span>
          </button>
          
          <!-- Notifications Dropdown -->
          <div
            v-if="showNotifications"
            class="absolute right-0 top-full mt-2 w-96 max-h-[600px] overflow-hidden rounded-lg shadow-xl border z-50"
            :class="isDarkMode 
              ? 'bg-slate-800 border-slate-700' 
              : 'bg-white border-gray-200'"
          >
            <!-- Header -->
            <div class="px-4 py-3 border-b flex items-center justify-between"
              :class="isDarkMode ? 'border-slate-700' : 'border-gray-200'"
            >
              <h3 :class="isDarkMode ? 'text-gray-100' : 'text-gray-900'" class="font-semibold text-lg">Recent Activity</h3>
              <button
                @click="closeNotifications"
                class="p-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                :class="isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'"
              >
                <span class="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            
            <!-- Activity List -->
            <div class="overflow-y-auto max-h-[500px]">
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
          </div>
        </div>

        <!-- User Avatar -->
        <button
          class="flex items-center gap-2 p-1 rounded-lg transition-colors"
          :class="isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'"
          title="User Menu"
        >
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
            :class="isDarkMode ? 'bg-indigo-500' : 'bg-indigo-600'"
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
        >
          <span class="material-symbols-outlined flex items-center justify-center">apps</span>
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { mockAPI, isMockMode, mockReviews } from '../mockData.js';

const router = useRouter();
const notificationsContainer = ref(null);

// Check if dark mode is active - make it reactive
const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const showNotifications = ref(false);
const recentActivity = ref([]);

// Get current user (in real app, this would come from auth)
const currentUser = ref(localStorage.getItem('currentDesigner') || 'Sarah Johnson');
const currentUserEmail = ref(localStorage.getItem('currentUserEmail') || 'sarah@example.com');
const currentUserRole = ref(localStorage.getItem('userRole') || 'designer');

// Toggle chat (opens Eero chatbot via FAB)
const toggleChat = () => {
  // Emit event to parent to open chat
  // This will be handled by App.vue which controls the FAB
  const event = new CustomEvent('open-eero-chat');
  window.dispatchEvent(event);
};

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

