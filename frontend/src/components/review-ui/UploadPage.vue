<template>
  <div class="space-y-6 bg-transparent" v-if="currentUserRole === 'designer'">
    <!-- Two Column Layout -->
    <div>
      <!-- Demo Review Links -->
      <div :class="isDarkMode ? 'bg-slate-800' : 'bg-white'" class="rounded-lg shadow-lg">
        <div :class="isDarkMode ? 'border-slate-700' : 'border-gray-200'" class="border-b px-8 py-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3 flex-1">
              <svg :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'" class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <h2 :class="isDarkMode ? 'text-gray-100' : 'text-gray-900'" class="text-2xl font-bold">My Requested Reviews</h2>
            </div>
          </div>
          <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-600'" class="text-sm mt-1">Manage your design review requests</p>
        </div>
        <div class="p-8">
          <div v-if="filteredDemoLinks.length === 0" class="text-center py-12">
            <svg :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'" class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <p :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'" class="mb-2">No review requests yet</p>
            <p :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'" class="text-sm">Create your first design review request to get started</p>
          </div>
          
          <div v-else class="space-y-4">
            <div
              v-for="link in filteredDemoLinks"
              :key="link.id"
              @click="handleCardClick(link, $event)"
              class="flex items-start justify-between p-4 border rounded-lg transition-colors"
              :class="link.completed 
                ? (isDarkMode 
                  ? 'border-slate-600 bg-slate-700 opacity-75 cursor-not-allowed' 
                  : 'border-gray-300 bg-gray-50 opacity-75 cursor-not-allowed')
                : (isDarkMode
                  ? 'border-slate-700 hover:bg-slate-700 cursor-pointer'
                  : 'border-gray-200 hover:bg-gray-50 cursor-pointer')"
            >
              <div class="flex items-start gap-4 flex-1 min-w-0">
                <div :class="isDarkMode ? 'bg-indigo-900' : 'bg-indigo-100'" class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <h3 :class="isDarkMode ? 'text-gray-100' : 'text-gray-900'" class="text-base font-semibold mb-2">{{ link.filename }}</h3>
                  <div class="flex items-center gap-2 flex-wrap mb-1.5">
                    <v-chip
                      :color="getWorkflowColor(link.workflowState || 'draft')"
                      size="small"
                      class="font-medium"
                    >
                      {{ getWorkflowLabel(link.workflowState || 'draft') }}
                    </v-chip>
                    <span :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'" class="text-sm">|</span>
                    <span :class="isDarkMode ? 'text-gray-300' : 'text-gray-600'" class="text-sm">{{ getVersionCount(link) }}</span>
                  </div>
                  <div class="flex items-center gap-2 overflow-hidden">
                    <span :class="isDarkMode ? 'text-gray-300' : 'text-gray-600'" class="text-xs flex items-center gap-1 flex-shrink-0">
                      <svg v-if="link.password !== null && link.password !== undefined" :class="isDarkMode ? 'text-gray-300' : 'text-gray-600'" class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <svg v-else :class="isDarkMode ? 'text-gray-300' : 'text-gray-600'" class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                      </svg>
                      <span class="whitespace-nowrap">{{ getPasswordText(link) }}</span>
                    </span>
                    <span :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'" class="text-xs flex-shrink-0">|</span>
                    <span v-if="link.completed" :class="isDarkMode ? 'text-green-400' : 'text-green-600'" class="text-xs font-medium whitespace-nowrap flex-shrink-0">✓ Completed</span>
                    <template v-else-if="isExpired(link.expiresAt)">
                      <span :class="isDarkMode ? 'text-red-400' : 'text-red-600'" class="text-xs font-medium whitespace-nowrap flex-shrink-0">Expired: {{ formatDate(link.expiresAt) }}</span>
                    </template>
                    <template v-else-if="isExpiringSoon(link.expiresAt)">
                      <span :class="isDarkMode ? 'text-orange-400' : 'text-orange-500'" class="text-xs font-medium whitespace-nowrap flex-shrink-0">Expires: {{ formatDate(link.expiresAt) }}</span>
                    </template>
                    <template v-else>
                      <span :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'" class="text-xs whitespace-nowrap flex-shrink-0">Expires: {{ formatDate(link.expiresAt) }}</span>
                    </template>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-1 flex-shrink-0 ml-4">
                <v-tooltip text="Mark as Completed">
                  <template #activator="{ props }">
                    <button
                      v-if="isDesigner(link) && !link.completed"
                      @click.stop="handleMarkCompleted(link)"
                      class="p-2 rounded-lg transition-colors"
                      :class="isDarkMode 
                        ? 'text-green-400 hover:bg-green-900/20 hover:text-green-300' 
                        : 'text-green-600 hover:bg-green-50 hover:text-green-700'"
                      v-bind="props"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  </template>
                </v-tooltip>
                <v-tooltip text="Change Password">
                  <template #activator="{ props }">
                    <button
                      v-if="isDesigner(link) && !link.completed"
                      @click.stop="handleChangePassword(link)"
                      class="p-2 rounded-lg transition-colors"
                      :class="isDarkMode 
                        ? 'text-indigo-400 hover:bg-indigo-900/20 hover:text-indigo-300' 
                        : 'text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700'"
                      v-bind="props"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </button>
                  </template>
                </v-tooltip>
                <v-tooltip text="Extend Expiration">
                  <template #activator="{ props }">
                    <button
                      v-if="isDesigner(link) && !link.completed"
                      @click.stop="handleExtendExpiration(link)"
                      class="p-2 rounded-lg transition-colors"
                      :class="isDarkMode 
                        ? 'text-indigo-400 hover:bg-indigo-900/20 hover:text-indigo-300' 
                        : 'text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700'"
                      v-bind="props"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </template>
                </v-tooltip>
                <v-tooltip text="Upload New Version">
                  <template #activator="{ props }">
                    <button
                      v-if="isDesigner(link) && !link.completed"
                      @click.stop="handleUploadNewVersion(link)"
                      class="p-2 rounded-lg transition-colors"
                      :class="isDarkMode 
                        ? 'text-indigo-400 hover:bg-indigo-900/20 hover:text-indigo-300' 
                        : 'text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700'"
                      v-bind="props"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </button>
                  </template>
                </v-tooltip>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Non-Designer Layout -->
  <div v-else class="bg-transparent">
    <!-- Demo Links Card or Recently Viewed Links (for clients) -->
    <div :class="isDarkMode ? 'bg-slate-800' : 'bg-white'" class="rounded-lg shadow-lg w-full">
      <div :class="isDarkMode ? 'border-slate-700' : 'border-gray-200'" class="border-b px-8 py-6">
        <div class="flex items-center gap-3">
          <svg :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'" class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="currentUserRole === 'client'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <h2 :class="isDarkMode ? 'text-gray-100' : 'text-gray-900'" class="text-2xl font-bold">
            {{ currentUserRole === 'client' ? 'Recently Viewed Active Links' : 'My Requested Reviews' }}
          </h2>
        </div>
        <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-600'" class="text-sm mt-1">
          {{ currentUserRole === 'client' ? 'Your recently viewed review links' : 'Manage your design review requests' }}
        </p>
      </div>
      <div class="p-8">
        <div v-if="currentUserRole === 'client' && recentlyViewedLinks.length === 0" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'" class="text-center py-8 text-sm">
          <svg :class="isDarkMode ? 'text-gray-600' : 'text-gray-300'" class="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>No recently viewed links</p>
        </div>
        <div v-else-if="currentUserRole !== 'client' && filteredDemoLinks.length === 0" class="text-center py-12">
          <svg :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'" class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <p :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'" class="mb-2">No review requests yet</p>
          <p :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'" class="text-sm">Create your first design review request to get started</p>
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="link in (currentUserRole === 'client' ? recentlyViewedLinks : filteredDemoLinks)"
            :key="link.id"
            @click="handleCardClick(link, $event)"
              class="flex items-start justify-between p-4 border rounded-lg transition-colors"
              :class="link.completed 
                ? (isDarkMode 
                  ? 'border-slate-600 bg-slate-700 opacity-75 cursor-not-allowed' 
                  : 'border-gray-300 bg-gray-50 opacity-75 cursor-not-allowed')
                : (isDarkMode
                  ? 'border-slate-700 hover:bg-slate-700 cursor-pointer'
                  : 'border-gray-200 hover:bg-gray-50 cursor-pointer')"
          >
            <div class="flex items-start gap-4 flex-1 min-w-0">
              <div :class="isDarkMode ? 'bg-indigo-900' : 'bg-indigo-100'" class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <h3 :class="isDarkMode ? 'text-gray-100' : 'text-gray-900'" class="text-base font-semibold mb-2">{{ link.filename }}</h3>
                <div class="flex items-center gap-2 flex-wrap mb-1.5">
                  <v-chip
                    :color="getWorkflowColor(link.workflowState || 'draft')"
                    size="small"
                    class="font-medium"
                  >
                    {{ getWorkflowLabel(link.workflowState || 'draft') }}
                  </v-chip>
                  <span :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'" class="text-sm">|</span>
                  <span :class="isDarkMode ? 'text-gray-300' : 'text-gray-600'" class="text-sm">{{ getVersionCount(link) }}</span>
                </div>
                <div class="flex items-center gap-2 overflow-hidden">
                  <span :class="isDarkMode ? 'text-gray-300' : 'text-gray-600'" class="text-xs flex items-center gap-1 flex-shrink-0">
                    <svg v-if="link.password !== null && link.password !== undefined" :class="isDarkMode ? 'text-gray-300' : 'text-gray-600'" class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <svg v-else :class="isDarkMode ? 'text-gray-300' : 'text-gray-600'" class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                    <span class="whitespace-nowrap">{{ getPasswordText(link) }}</span>
                  </span>
                    <span :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'" class="text-xs flex-shrink-0">|</span>
                  <span v-if="link.completed" :class="isDarkMode ? 'text-green-400' : 'text-green-600'" class="text-xs font-medium whitespace-nowrap flex-shrink-0">✓ Completed</span>
                  <template v-else-if="isExpired(link.expiresAt)">
                    <span :class="isDarkMode ? 'text-red-400' : 'text-red-600'" class="text-xs font-medium whitespace-nowrap flex-shrink-0">Expired: {{ formatDate(link.expiresAt) }}</span>
                  </template>
                  <template v-else-if="isExpiringSoon(link.expiresAt)">
                    <span :class="isDarkMode ? 'text-orange-400' : 'text-orange-500'" class="text-xs font-medium whitespace-nowrap flex-shrink-0">Expires: {{ formatDate(link.expiresAt) }}</span>
                  </template>
                  <template v-else>
                      <span :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'" class="text-xs whitespace-nowrap flex-shrink-0">Expires: {{ formatDate(link.expiresAt) }}</span>
                  </template>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-1 flex-shrink-0 ml-4">
              <v-tooltip text="Mark as Completed">
                <template #activator="{ props }">
                  <button
                    v-if="isDesigner(link) && !link.completed"
                    @click.stop="handleMarkCompleted(link)"
                    class="p-2 rounded-lg transition-colors"
                    :class="isDarkMode 
                      ? 'text-green-400 hover:bg-green-900/20 hover:text-green-300' 
                      : 'text-green-600 hover:bg-green-50 hover:text-green-700'"
                    v-bind="props"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </template>
              </v-tooltip>
              <v-tooltip text="Change Password">
                <template #activator="{ props }">
                  <button
                    v-if="isDesigner(link) && !link.completed"
                    @click.stop="handleChangePassword(link)"
                      class="p-2 rounded-lg transition-colors"
                      :class="isDarkMode 
                        ? 'text-indigo-400 hover:bg-indigo-900/20 hover:text-indigo-300' 
                        : 'text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700'"
                    v-bind="props"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </button>
                </template>
              </v-tooltip>
              <v-tooltip text="Extend Expiration">
                <template #activator="{ props }">
                  <button
                    v-if="isDesigner(link) && !link.completed"
                    @click.stop="handleExtendExpiration(link)"
                      class="p-2 rounded-lg transition-colors"
                      :class="isDarkMode 
                        ? 'text-indigo-400 hover:bg-indigo-900/20 hover:text-indigo-300' 
                        : 'text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700'"
                    v-bind="props"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                </template>
              </v-tooltip>
              <v-tooltip text="Upload New Version">
                <template #activator="{ props }">
                  <button
                    v-if="isDesigner(link) && !link.completed"
                    @click.stop="handleUploadNewVersion(link)"
                      class="p-2 rounded-lg transition-colors"
                      :class="isDarkMode 
                        ? 'text-indigo-400 hover:bg-indigo-900/20 hover:text-indigo-300' 
                        : 'text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700'"
                    v-bind="props"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </button>
                </template>
              </v-tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>


  <!-- Modals - Outside all conditional blocks -->
  <!-- Version Upload Modal -->
  <VersionUploadModal
    v-model="showUploadModal"
    :review-id="selectedReviewId"
    @version-uploaded="handleVersionUploaded"
  />

  <!-- Change Password Modal -->
  <PromptModal
    v-model="showPasswordModal"
    title="Change Password"
    label="Enter new password (leave empty to remove password)"
    placeholder="Enter new password or leave empty"
    type="password"
    :required="false"
    @submit="handlePasswordChanged"
  />

  <!-- Confirm Completion Modal -->
  <ConfirmModal
    v-model="showConfirmModal"
    :title="confirmModalTitle"
    :message="confirmModalMessage"
    confirm-text="Mark as Completed"
    confirm-color="success"
    @confirm="confirmMarkCompleted"
  />

  <!-- Alert Modal -->
  <AlertModal
    v-model="showAlert"
    :title="alertTitle"
    :message="alertMessage"
    :type="alertType"
  />

  <!-- Upload Design Modal -->
  <v-dialog :model-value="showUploadDesignModal" @update:model-value="(val) => showUploadDesignModal = val" persistent max-width="800" :scrim="isDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)'">
    <v-card :class="isDarkMode ? 'bg-slate-800' : 'bg-white'" :style="isDarkMode ? 'background-color: #1e293b !important; opacity: 1 !important;' : 'background-color: #ffffff !important; opacity: 1 !important;'">
      <v-card-title :class="isDarkMode ? 'bg-slate-800' : 'bg-white'" class="d-flex align-center justify-space-between px-6 pt-10 pb-4" :style="isDarkMode ? 'background-color: #1e293b !important; opacity: 1 !important;' : 'background-color: #ffffff !important; opacity: 1 !important; font-family: inherit; font-weight: 600;'">
        <div class="d-flex align-center">
          <svg :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'" class="w-7 h-7 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <span :class="isDarkMode ? 'text-gray-100' : 'text-gray-900'" class="font-bold text-2xl">Design Review Request</span>
        </div>
        <button @click.stop="showUploadDesignModal = false" :class="isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'" class="transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </v-card-title>
      <v-divider />
      <v-card-text :class="isDarkMode ? 'bg-slate-800' : 'bg-white'" class="pt-0 px-6" :style="isDarkMode ? 'background-color: #1e293b !important; opacity: 1 !important;' : 'background-color: #ffffff !important; opacity: 1 !important;'">
        <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-600'" class="text-sm mb-6">Upload design files or link to a website under development for client review</p>
        <FileUpload @uploaded="handleUpload" />
        <div
          v-if="resultUrl"
          class="mt-6 p-4 rounded-lg border"
          :class="isDarkMode 
            ? 'bg-green-900/20 border-green-800' 
            : 'bg-green-50 border-green-200'"
        >
          <div class="flex items-start">
            <svg :class="isDarkMode ? 'text-green-400' : 'text-green-600'" class="w-5 h-5 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <div>
              <p :class="isDarkMode ? 'text-green-300' : 'text-green-800'" class="text-sm font-medium">Upload successful!</p>
              <a :href="resultUrl" target="_blank" 
                :class="isDarkMode 
                  ? 'text-green-400 hover:text-green-300' 
                  : 'text-green-600 hover:text-green-800'" 
                class="text-sm underline mt-1 block">{{ resultUrl }}</a>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import FileUpload from './FileUpload.vue';
import VersionUploadModal from './VersionUploadModal.vue';
import PromptModal from './PromptModal.vue';
import ConfirmModal from './ConfirmModal.vue';
import AlertModal from './AlertModal.vue';
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { mockAPI, isMockMode, mockReviews, getCurrentUser, getFilteredReviews } from '../../mockData.js';

const $router = useRouter();

const resultUrl = ref('');
const showUploadDesignModal = ref(false);
const showUploadModal = ref(false);
const selectedReviewId = ref(null);
const showPasswordModal = ref(false);
const showConfirmModal = ref(false);
const selectedLink = ref(null);
const confirmModalTitle = ref('');
const confirmModalMessage = ref('');
const showAlert = ref(false);
const alertTitle = ref('');
const alertMessage = ref('');
const alertType = ref('success');

// Get current user (in real app, this would come from auth)
const currentUser = ref(localStorage.getItem('currentDesigner') || 'Sarah Johnson');
const currentUserEmail = ref(localStorage.getItem('currentUserEmail') || 'sarah@example.com');
const currentUserTeamId = ref(localStorage.getItem('currentUserTeamId') || 'team-1');

// Ensure Sarah Johnson always has designer role
const getStoredRole = () => {
  const storedRole = localStorage.getItem('userRole');
  const storedEmail = localStorage.getItem('currentUserEmail') || 'sarah@example.com';
  const storedName = localStorage.getItem('currentDesigner') || 'Sarah Johnson';
  
  // If user is Sarah Johnson, force designer role
  if (storedEmail === 'sarah@example.com' || storedName === 'Sarah Johnson') {
    if (storedRole !== 'designer') {
      localStorage.setItem('userRole', 'designer');
      return 'designer';
    }
    return 'designer';
  }
  
  return storedRole || 'designer';
};

const currentUserRole = ref(getStoredRole());

// Watch for role changes and ensure Sarah Johnson stays as designer
watch(() => [currentUser.value, currentUserEmail.value], () => {
  const storedEmail = localStorage.getItem('currentUserEmail') || 'sarah@example.com';
  const storedName = localStorage.getItem('currentDesigner') || 'Sarah Johnson';
  
  if (storedEmail === 'sarah@example.com' || storedName === 'Sarah Johnson') {
    if (currentUserRole.value !== 'designer') {
      currentUserRole.value = 'designer';
      localStorage.setItem('userRole', 'designer');
    }
  }
}, { immediate: true });

// Recently viewed links for clients
const recentlyViewedLinks = ref([]);

// Load recently viewed links for clients
const loadRecentlyViewedLinks = async () => {
  if (currentUserRole.value !== 'client') return;
  
  try {
    const useMockMode = await isMockMode();
    
    if (useMockMode) {
      // Get recently viewed links from localStorage
      const stored = localStorage.getItem('recentlyViewedLinks');
      const viewedIds = stored ? JSON.parse(stored) : [];
      
      // Filter to only active (not completed, not expired) links
      const activeLinks = [];
      for (const linkId of viewedIds) {
        // Try to find in demoLinks first
        let link = demoLinks.value.find(l => l.id === linkId || l.reviewId === linkId);
        
        // If not found, try to find in mockReviews
        if (!link) {
          const review = mockReviews.find(r => r.id === linkId);
          if (review && !review.completed && !isExpired(review.expiresAt)) {
            // Convert review to link format
            link = {
              id: review.id,
              filename: review.filename,
              description: `${review.versions.length} versions available`,
              url: `/review/${review.id}`,
              reviewId: review.id,
              expiresAt: review.expiresAt,
              designer: review.designer,
              password: review.password,
              completed: review.completed,
              workflowState: review.workflowState
            };
          }
        }
        
        if (link && !link.completed && !isExpired(link.expiresAt)) {
          activeLinks.push(link);
        }
      }
      
      recentlyViewedLinks.value = activeLinks.slice(0, 10); // Limit to 10 most recent
    } else {
      // In real app, would call API endpoint
      // const res = await fetch('/api/reviews/recently-viewed');
      // recentlyViewedLinks.value = await res.json();
    }
  } catch (error) {
    console.error('Failed to load recently viewed links:', error);
  }
};

// Track when a review is viewed (called from router or review page)
const trackReviewView = (reviewId) => {
  if (currentUserRole.value !== 'client') return;
  
  try {
    const stored = localStorage.getItem('recentlyViewedLinks');
    const viewedIds = stored ? JSON.parse(stored) : [];
    
    // Remove if already exists (to move to front)
    const index = viewedIds.indexOf(reviewId);
    if (index > -1) {
      viewedIds.splice(index, 1);
    }
    
    // Add to front
    viewedIds.unshift(reviewId);
    
    // Keep only last 20
    const trimmed = viewedIds.slice(0, 20);
    
    localStorage.setItem('recentlyViewedLinks', JSON.stringify(trimmed));
  } catch (error) {
    console.error('Failed to track review view:', error);
  }
};

const openUploadDesignModal = () => {
  console.log('Opening upload modal - function called');
  showUploadDesignModal.value = true;
  console.log('showUploadDesignModal is now:', showUploadDesignModal.value);
};

const closeUploadDesignModal = () => {
  showUploadDesignModal.value = false;
  resultUrl.value = '';
};

const handleUpload = (url) => {
  resultUrl.value = url;
  // Close modal after a short delay to show success message
  setTimeout(() => {
    closeUploadDesignModal();
  }, 2000);
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
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return formatDate(timestamp);
  } catch (error) {
    return timestamp;
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

// Navigate to review
const goToReview = (reviewId) => {
  $router.push(`/review/${reviewId}`);
};

// Demo links for testing
const demoLinks = ref([
  {
    id: 'demo-1',
    filename: 'Website Design v2.pdf',
    description: '3 versions available | No password required',
    url: '/review/review-1',
    reviewId: 'review-1',
    icon: 'mdi-file-pdf-box',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    designer: 'Sarah Johnson',
    password: null,
    completed: false,
    workflowState: 'client_review'
  },
  {
    id: 'demo-2',
    filename: 'Mobile App Wireframes.sketch',
    description: '2 versions available | Password: design123',
    url: '/review/review-2',
    reviewId: 'review-2',
    icon: 'mdi-file-image',
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    designer: 'Mike Chen',
    password: 'design123',
    completed: false,
    workflowState: 'client_approved'
  },
  {
    id: 'demo-3',
    filename: 'Brand Guidelines.ai',
    description: '4 versions available | Password: brand2024',
    url: '/review/review-3',
    reviewId: 'review-3',
    icon: 'mdi-palette',
    expiresAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Expired
    designer: 'Alex Rodriguez',
    password: 'brand2024',
    completed: false,
    workflowState: 'approved'
  }
]);

// Filter demo links based on user role
const filteredDemoLinks = computed(() => {
  let filtered = [];
  
  if (currentUserRole.value === 'creative_director') {
    // Creative Director sees all reviews across all teams
    filtered = demoLinks.value;
  } else if (currentUserRole.value === 'art_director') {
    // Art Director sees all reviews in their team
    filtered = demoLinks.value.filter(link => {
      const review = mockReviews.find(r => r.id === link.reviewId);
      return review && review.teamId === currentUserTeamId.value;
    });
  } else if (currentUserRole.value === 'designer') {
    // Designer sees only their own reviews
    filtered = demoLinks.value.filter(link => {
      return link.designer === currentUser.value || 
             mockReviews.find(r => r.id === link.reviewId)?.designerEmail === currentUserEmail.value;
    });
  } else {
    // Default: return all (for clients/admins)
    filtered = demoLinks.value;
  }
  
  // Exclude completed reviews from the list
  return filtered.filter(link => {
    const review = mockReviews.find(r => r.id === link.reviewId);
    return !review || !review.completed;
  });
});

// Check if current user is the designer for a given link
const isDesigner = (link) => {
  return currentUser.value === link.designer;
};

// Get version count text
const getVersionCount = (link) => {
  const versionMatch = link.description.match(/^(\d+)\s+versions/);
  const versionCount = versionMatch ? versionMatch[1] : '0';
  return `${versionCount} versions available`;
};

// Get password text
const getPasswordText = (link) => {
  const hasPassword = link.password !== null && link.password !== undefined;
  if (hasPassword) {
    if (isDesigner(link)) {
      return `Password: ${link.password}`;
    } else {
      return 'Password required';
    }
  } else {
    return 'No password required';
  }
};

// Get description based on user role
const getDescription = (link) => {
  // Extract version count from the link's stored description
  const versionMatch = link.description.match(/^(\d+)\s+versions/);
  const versionCount = versionMatch ? versionMatch[1] : '0';
  
  // Check if password exists
  const hasPassword = link.password !== null && link.password !== undefined;
  
  if (hasPassword) {
    if (isDesigner(link)) {
      // Designer sees the actual password
      return `${versionCount} versions available | Password: ${link.password}`;
    } else {
      // Client only sees that password is required
      return `${versionCount} versions available | Password required`;
    }
  } else {
    return `${versionCount} versions available | No password required`;
  }
};

// Handle card click - navigate to review page
const handleCardClick = (link, event) => {
  // Don't navigate if clicking on a button
  if (event.target.closest('button')) {
    return;
  }
  // Don't navigate if review is completed
  if (link.completed) {
    return;
  }
  
  // Track view for clients
  if (currentUserRole.value === 'client') {
    trackReviewView(link.reviewId || link.id);
  }
  
  $router.push(link.url);
};

// Handle change password - open password modal
const handleChangePassword = (link) => {
  selectedLink.value = link;
  showPasswordModal.value = true;
};

// Handle password changed from modal
const handlePasswordChanged = async (newPassword) => {
  if (!selectedLink.value) return;
  
  try {
    const useMockMode = await isMockMode();
    
    // Update password (empty string means remove password)
    const passwordValue = newPassword.trim() || null;
    
    if (useMockMode) {
      // Update mock data - find review by reviewId
      const review = mockReviews.find(r => r.id === selectedLink.value.reviewId);
      if (review) {
        const hadPassword = !!review.password;
        const hasPassword = !!passwordValue;
        
        review.password = passwordValue;
        
        // Add history entry for any password change
        if (!review.workflowHistory) {
          review.workflowHistory = [];
        }
        review.workflowHistory.push({
          stage: review.workflowState || 'draft',
          action: hasPassword ? 'password_set' : 'password_removed',
          user: review.designer || 'Designer',
          timestamp: new Date().toISOString()
        });
      }
      
      // Update demo link
      const linkIndex = demoLinks.value.findIndex(l => l.id === selectedLink.value.id);
      if (linkIndex !== -1) {
        demoLinks.value[linkIndex].password = passwordValue;
        // Update description
        const versionCount = demoLinks.value[linkIndex].description.split(' ')[0];
        demoLinks.value[linkIndex].description = passwordValue 
          ? `${versionCount} versions available | Password: ${passwordValue}`
          : `${versionCount} versions available | No password required`;
      }
    } else {
      // Use real API - would need to call API endpoint here
      const linkIndex = demoLinks.value.findIndex(l => l.id === selectedLink.value.id);
      if (linkIndex !== -1) {
        demoLinks.value[linkIndex].password = passwordValue;
        // Update description
        const versionCount = demoLinks.value[linkIndex].description.split(' ')[0];
        demoLinks.value[linkIndex].description = passwordValue 
          ? `${versionCount} versions available | Password: ${passwordValue}`
          : `${versionCount} versions available | No password required`;
      }
    }
    
    const message = passwordValue 
      ? 'Password updated successfully!'
      : 'Password removed successfully!';
    showAlertMessage('Success', message, 'success');
  } catch (error) {
    console.error('Failed to change password:', error);
    showAlertMessage('Error', 'Failed to change password. Please try again.', 'error');
  }
};

// Handle mark as completed - show confirmation modal
const handleMarkCompleted = (link) => {
  selectedLink.value = link;
  confirmModalTitle.value = 'Mark Review as Completed';
  confirmModalMessage.value = `Are you sure you want to mark "${link.filename}" as completed? The review link will be disabled, but comments and information will be preserved.`;
  showConfirmModal.value = true;
};

// Confirm mark as completed
const confirmMarkCompleted = async () => {
  if (!selectedLink.value) return;
  
  try {
    const useMockMode = await isMockMode();
    
    if (useMockMode) {
      // Update mock data - mark review as completed
      const linkIndex = demoLinks.value.findIndex(l => l.id === selectedLink.value.id);
      if (linkIndex !== -1) {
        demoLinks.value[linkIndex].completed = true;
      }
      
      // Also update mock reviews
      const review = mockReviews.find(r => r.id === selectedLink.value.reviewId);
      if (review) {
        review.completed = true;
      }
    } else {
      // Use real API - would need to call API endpoint here
      const linkIndex = demoLinks.value.findIndex(l => l.id === selectedLink.value.id);
      if (linkIndex !== -1) {
        demoLinks.value[linkIndex].completed = true;
      }
    }
    
    showAlertMessage('Success', 'Review marked as completed. The link is now disabled.', 'success');
  } catch (error) {
    console.error('Failed to mark review as completed:', error);
    showAlertMessage('Error', 'Failed to mark review as completed. Please try again.', 'error');
  }
};

// Handle extend expiration - extend by 30 days
const handleExtendExpiration = async (link) => {
  try {
    const useMockMode = await isMockMode();
    
    // Calculate new expiration date: 30 days from now
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 30);
    newExpiresAt.setHours(23, 59, 59, 999); // Set to end of day
    const newExpiresAtISO = newExpiresAt.toISOString();
    
    if (useMockMode) {
      // Update mock data - find review by reviewId
      const review = mockReviews.find(r => r.id === link.reviewId);
      if (review) {
        review.expiresAt = newExpiresAtISO;
        
        // Add history entry
        if (!review.workflowHistory) {
          review.workflowHistory = [];
        }
        review.workflowHistory.push({
          stage: review.workflowState || 'draft',
          action: 'extended',
          user: review.designer || 'Designer',
          timestamp: new Date().toISOString(),
          days: 30
        });
      }
      
      // Update demo link
      const linkIndex = demoLinks.value.findIndex(l => l.id === link.id);
      if (linkIndex !== -1) {
        demoLinks.value[linkIndex].expiresAt = newExpiresAtISO;
      }
    } else {
      // Use real API - would need to call API endpoint here
      const linkIndex = demoLinks.value.findIndex(l => l.id === link.id);
      if (linkIndex !== -1) {
        demoLinks.value[linkIndex].expiresAt = newExpiresAtISO;
      }
    }
    
    showAlertMessage('Success', 'Expiration date extended by 30 days!', 'success');
  } catch (error) {
    console.error('Failed to extend expiration:', error);
    showAlertMessage('Error', 'Failed to extend expiration date. Please try again.', 'error');
  }
};

// Handle upload new version - open modal
const handleUploadNewVersion = (link) => {
  selectedReviewId.value = link.reviewId;
  showUploadModal.value = true;
};

// Handle version uploaded successfully
const handleVersionUploaded = () => {
  // Modal will close automatically, but we could show a success message here
  showUploadModal.value = false;
};

const showAlertMessage = (title, message, type = 'success') => {
  alertTitle.value = title;
  alertMessage.value = message;
  alertType.value = type;
  showAlert.value = true;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const year = date.getUTCFullYear();
    const month = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
    const day = date.getUTCDate();
    
    return `${month} ${day}, ${year}`;
  } catch (error) {
    if (typeof dateString === 'string' && dateString.includes('T')) {
      const dateOnly = dateString.split('T')[0];
      const [y, m, d] = dateOnly.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${monthNames[parseInt(m) - 1]} ${parseInt(d)}, ${y}`;
    }
    return dateString;
  }
};

const isExpired = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return date < new Date();
};

const isExpiringSoon = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const now = new Date();
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  
  // Not expired and expires within 7 days
  return date >= now && date <= sevenDaysFromNow;
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

// Check if dark mode is active - make it reactive
const isDarkMode = ref(document.documentElement.classList.contains('dark'));

// Watch for dark class changes on html element using MutationObserver
let darkModeObserver = null;
let darkModeInterval = null;

// Load demo links and sync workflow state from mock data
onMounted(async () => {
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
  
  // Original onMounted logic
  try {
    const useMockMode = await isMockMode();
    if (useMockMode) {
      // Sync workflow state from mockReviews
      demoLinks.value.forEach(link => {
        const review = mockReviews.find(r => r.id === link.reviewId);
        if (review) {
          link.workflowState = review.workflowState || 'draft';
        }
      });
    }
    
    // Load recent activity for designers
    if (currentUserRole.value === 'designer') {
      await loadRecentActivity();
    }
    
    // Load recently viewed links for clients
    if (currentUserRole.value === 'client') {
      await loadRecentlyViewedLinks();
    }
  } catch (error) {
    console.error('Failed to load demo links:', error);
  }
});

// Cleanup observer and interval on unmount
onBeforeUnmount(() => {
  if (darkModeObserver) {
    darkModeObserver.disconnect();
  }
  if (darkModeInterval) {
    clearInterval(darkModeInterval);
  }
});

// Expose the modal ref so parent components can trigger it
defineExpose({
  showUploadDesignModal
});
</script>

<style scoped>
/* Ensure modal is fully opaque and visible */
:deep(.v-overlay__scrim) {
  opacity: 1 !important;
}

:deep(.v-card) {
  opacity: 1 !important;
  background-color: inherit !important;
}

:deep(.v-dialog .v-card) {
  opacity: 1 !important;
}
</style>
