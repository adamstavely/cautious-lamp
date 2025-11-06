<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative flex">
    <!-- Drawer -->
    <DocumentationDrawer :isOpen="drawerOpen" @close="closeDrawer" @toggle="toggleDrawer" />
    
    <!-- Main Content Area -->
    <div 
      class="flex-1 h-full transition-all duration-300 relative overflow-hidden"
      :style="drawerOpen ? 'margin-left: 256px;' : 'margin-left: 48px;'"
    >
      <!-- Breadcrumbs -->
      <Breadcrumbs />
      
      <div class="h-full overflow-y-auto">
        <div class="p-8">
          <!-- Hero Section -->
          <div class="max-w-7xl mx-auto mb-8">
            <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
              <!-- Background texture/grain effect -->
              <div class="absolute inset-0 opacity-10 texture-pattern"></div>
              
              <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                <div class="flex-1">
                  <div class="flex items-center gap-4 mb-4">
                    <h1 class="text-5xl md:text-6xl font-bold text-white leading-tight">
                      My Requested Reviews
                    </h1>
                    <span class="px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-300 border border-green-400/30">
                      Kanban View
                    </span>
                  </div>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-4">
                    Track all your design review requests in a visual kanban board. See where each review is in the workflow and manage them efficiently.
                  </p>
                  <div class="flex items-center gap-4 text-sm text-white/70">
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">view_module</span>
                      Kanban Board
                    </span>
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">update</span>
                      Updated {{ new Date().toLocaleDateString() }}
                    </span>
                  </div>
                </div>
                <div class="hidden md:block flex-shrink-0">
                  <div class="w-64 h-64 relative">
                    <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400">
                      <defs>
                        <linearGradient id="kanbanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Stylized kanban icon -->
                      <rect x="20" y="20" width="50" height="160" rx="4" fill="url(#kanbanGradient)" opacity="0.3"/>
                      <rect x="75" y="20" width="50" height="160" rx="4" fill="url(#kanbanGradient)" opacity="0.5"/>
                      <rect x="130" y="20" width="50" height="160" rx="4" fill="url(#kanbanGradient)" opacity="0.7"/>
                      <circle cx="45" cy="50" r="8" fill="white" opacity="0.6"/>
                      <circle cx="100" cy="80" r="8" fill="white" opacity="0.6"/>
                      <circle cx="155" cy="120" r="8" fill="white" opacity="0.6"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Kanban Board -->
          <div class="max-w-7xl mx-auto">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <!-- Draft Column -->
              <div class="w-full">
                <div 
                  class="rounded-lg border shadow-sm"
                  :class="isDarkMode 
                    ? 'bg-slate-800 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <div 
                    class="p-4 border-b"
                    :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'"
                  >
                    <div class="flex items-center justify-between">
                      <h3 class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Draft</h3>
                      <span 
                        class="px-2 py-1 text-xs font-medium rounded-full"
                        :class="isDarkMode 
                          ? 'bg-slate-700 text-gray-300' 
                          : 'bg-gray-100 text-gray-700'"
                      >
                        {{ getReviewsByState('draft').length }}
                      </span>
                    </div>
                  </div>
                  <div class="p-4 space-y-3 min-h-[400px] max-h-[calc(100vh-300px)] overflow-y-auto">
                    <div
                      v-for="review in getReviewsByState('draft')"
                      :key="review.id"
                      @click="openReview(review)"
                      class="p-4 rounded-lg border cursor-pointer transition-all"
                      :class="isDarkMode 
                        ? 'bg-slate-700 border-gray-600 hover:border-indigo-400' 
                        : 'bg-gray-50 border-gray-200 hover:border-indigo-500'"
                    >
                      <h4 class="font-medium mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ review.filename }}</h4>
                      <div class="flex items-center gap-2 mb-2">
                        <v-chip
                          :color="getWorkflowColor(review.workflowState || 'draft')"
                          size="small"
                          class="font-medium"
                        >
                          {{ getWorkflowLabel(review.workflowState || 'draft') }}
                        </v-chip>
                      </div>
                      <div class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
                        {{ formatDate(review.createdAt) }}
                      </div>
                    </div>
                    <div 
                      v-if="getReviewsByState('draft').length === 0" 
                      class="text-center py-8 text-sm"
                      :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'"
                    >
                      No drafts
                    </div>
                  </div>
                </div>
              </div>

              <!-- In Review Column -->
              <div class="w-full">
                <div 
                  class="rounded-lg border shadow-sm"
                  :class="isDarkMode 
                    ? 'bg-slate-800 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <div 
                    class="p-4 border-b"
                    :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'"
                  >
                    <div class="flex items-center justify-between">
                      <h3 class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">In Review</h3>
                      <span 
                        class="px-2 py-1 text-xs font-medium rounded-full"
                        :class="isDarkMode 
                          ? 'bg-blue-900/30 text-blue-300' 
                          : 'bg-blue-100 text-blue-700'"
                      >
                        {{ getReviewsInReview().length }}
                      </span>
                    </div>
                  </div>
                  <div class="p-4 space-y-3 min-h-[400px] max-h-[calc(100vh-300px)] overflow-y-auto">
                    <div
                      v-for="review in getReviewsInReview()"
                      :key="review.id"
                      @click="openReview(review)"
                      class="p-4 rounded-lg border cursor-pointer transition-all"
                      :class="isDarkMode 
                        ? 'bg-slate-700 border-gray-600 hover:border-indigo-400' 
                        : 'bg-gray-50 border-gray-200 hover:border-indigo-500'"
                    >
                      <h4 class="font-medium mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ review.filename }}</h4>
                      <div class="flex items-center gap-2 mb-2">
                        <v-chip
                          :color="getWorkflowColor(review.workflowState || 'draft')"
                          size="small"
                          class="font-medium"
                        >
                          {{ getWorkflowLabel(review.workflowState || 'draft') }}
                        </v-chip>
                      </div>
                      <div class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
                        {{ formatDate(review.createdAt) }}
                      </div>
                    </div>
                    <div 
                      v-if="getReviewsInReview().length === 0" 
                      class="text-center py-8 text-sm"
                      :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'"
                    >
                      No reviews in progress
                    </div>
                  </div>
                </div>
              </div>

              <!-- Changes Requested Column -->
              <div class="w-full">
                <div 
                  class="rounded-lg border shadow-sm"
                  :class="isDarkMode 
                    ? 'bg-slate-800 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <div 
                    class="p-4 border-b"
                    :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'"
                  >
                    <div class="flex items-center justify-between">
                      <h3 class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Changes Requested</h3>
                      <span 
                        class="px-2 py-1 text-xs font-medium rounded-full"
                        :class="isDarkMode 
                          ? 'bg-orange-900/30 text-orange-300' 
                          : 'bg-orange-100 text-orange-700'"
                      >
                        {{ getReviewsChangesRequested().length }}
                      </span>
                    </div>
                  </div>
                  <div class="p-4 space-y-3 min-h-[400px] max-h-[calc(100vh-300px)] overflow-y-auto">
                    <div
                      v-for="review in getReviewsChangesRequested()"
                      :key="review.id"
                      @click="openReview(review)"
                      class="p-4 rounded-lg border cursor-pointer transition-all"
                      :class="isDarkMode 
                        ? 'bg-slate-700 border-gray-600 hover:border-indigo-400' 
                        : 'bg-gray-50 border-gray-200 hover:border-indigo-500'"
                    >
                      <h4 class="font-medium mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ review.filename }}</h4>
                      <div class="flex items-center gap-2 mb-2">
                        <v-chip
                          :color="getWorkflowColor(review.workflowState || 'draft')"
                          size="small"
                          class="font-medium"
                        >
                          {{ getWorkflowLabel(review.workflowState || 'draft') }}
                        </v-chip>
                      </div>
                      <div class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
                        {{ formatDate(review.createdAt) }}
                      </div>
                    </div>
                    <div 
                      v-if="getReviewsChangesRequested().length === 0" 
                      class="text-center py-8 text-sm"
                      :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'"
                    >
                      No changes requested
                    </div>
                  </div>
                </div>
              </div>

              <!-- Approved Column -->
              <div class="w-full">
                <div 
                  class="rounded-lg border shadow-sm"
                  :class="isDarkMode 
                    ? 'bg-slate-800 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <div 
                    class="p-4 border-b"
                    :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'"
                  >
                    <div class="flex items-center justify-between">
                      <h3 class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Approved</h3>
                      <span 
                        class="px-2 py-1 text-xs font-medium rounded-full"
                        :class="isDarkMode 
                          ? 'bg-green-900/30 text-green-300' 
                          : 'bg-green-100 text-green-700'"
                      >
                        {{ getReviewsApproved().length }}
                      </span>
                    </div>
                  </div>
                  <div class="p-4 space-y-3 min-h-[400px] max-h-[calc(100vh-300px)] overflow-y-auto">
                    <div
                      v-for="review in getReviewsApproved()"
                      :key="review.id"
                      @click="openReview(review)"
                      class="p-4 rounded-lg border cursor-pointer transition-all"
                      :class="isDarkMode 
                        ? 'bg-slate-700 border-gray-600 hover:border-indigo-400' 
                        : 'bg-gray-50 border-gray-200 hover:border-indigo-500'"
                    >
                      <h4 class="font-medium mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ review.filename }}</h4>
                      <div class="flex items-center gap-2 mb-2">
                        <v-chip
                          :color="getWorkflowColor(review.workflowState || 'draft')"
                          size="small"
                          class="font-medium"
                        >
                          {{ getWorkflowLabel(review.workflowState || 'draft') }}
                        </v-chip>
                      </div>
                      <div class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
                        {{ formatDate(review.createdAt) }}
                      </div>
                    </div>
                    <div 
                      v-if="getReviewsApproved().length === 0" 
                      class="text-center py-8 text-sm"
                      :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'"
                    >
                      No approved reviews
                    </div>
                  </div>
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import { mockAPI, isMockMode, mockReviews } from '../mockData.js';

const router = useRouter();
const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const reviews = ref([]);

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
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

// Get current user (in real app, this would come from auth)
const currentUser = ref(localStorage.getItem('currentDesigner') || 'Sarah Johnson');
const currentUserEmail = ref(localStorage.getItem('currentUserEmail') || 'sarah@example.com');
const currentUserRole = ref(localStorage.getItem('userRole') || 'designer');

// Filter reviews by state
const getReviewsByState = (state) => {
  return reviews.value.filter(review => (review.workflowState || 'draft') === state);
};

const getReviewsInReview = () => {
  return reviews.value.filter(review => {
    const state = review.workflowState || 'draft';
    return ['client_review', 'art_director_review', 'creative_director_review'].includes(state);
  });
};

const getReviewsChangesRequested = () => {
  return reviews.value.filter(review => {
    const state = review.workflowState || 'draft';
    return ['ad_changes_requested', 'cd_changes_requested'].includes(state);
  });
};

const getReviewsApproved = () => {
  return reviews.value.filter(review => {
    const state = review.workflowState || 'draft';
    return ['client_approved', 'art_director_approved', 'approved'].includes(state);
  });
};

const formatDate = (dateString) => {
  if (!dateString) return 'No date';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const openReview = (review) => {
  router.push(`/review/${review.reviewId || review.id}`);
};

let darkModeObserver = null;
let darkModeInterval = null;

onMounted(async () => {
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
  
  // Load reviews
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      // Get reviews from mockReviews where designer matches current user
      const designerReviews = mockReviews.filter(review => {
        if (currentUserRole.value === 'designer') {
          return review.designer === currentUser.value || review.designerEmail === currentUserEmail.value;
        }
        // For other roles, show all reviews
        return true;
      });
      
      // Convert to the format expected by the kanban board
      reviews.value = designerReviews.map(review => ({
        id: review.id,
        reviewId: review.id,
        filename: review.filename || `Review ${review.id}`,
        workflowState: review.workflowState || 'draft',
        createdAt: review.createdAt || review.workflowHistory?.[0]?.timestamp || new Date().toISOString(),
        completed: review.completed || false
      }));
    } else {
      // In a real app, fetch from API
      // const response = await reviewAPI.getByDesigner(currentUser.value);
      // reviews.value = response.data;
    }
  } catch (error) {
    console.error('Error loading reviews:', error);
  }
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

