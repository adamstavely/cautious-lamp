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
          <!-- Loading State -->
          <div v-if="loading" class="max-w-7xl mx-auto py-12 text-center">
            <div class="flex justify-center mb-4">
              <div class="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Loading workspace...</p>
          </div>

          <!-- Workspace Content -->
          <div v-else-if="workspace" class="max-w-7xl mx-auto">
            <!-- Header -->
            <div class="mb-8">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <span class="material-symbols-outlined text-indigo-600 text-3xl">folder</span>
                  <div>
                    <h1 class="text-4xl font-bold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      {{ workspace.name }}
                    </h1>
                    <p v-if="workspace.description" class="text-lg" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      {{ workspace.description }}
                    </p>
                  </div>
                </div>
                <button
                  @click="router.push('/admin/workspaces')"
                  class="px-4 py-2 rounded-lg font-medium transition-colors"
                  :class="isDarkMode 
                    ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                >
                  <span class="material-symbols-outlined">arrow_back</span>
                  Back to Workspaces
                </button>
              </div>
            </div>

            <!-- Tabs -->
            <div class="mb-6 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
              <div class="flex gap-2">
                <button
                  @click="activeTab = 'overview'"
                  class="px-6 py-3 font-medium transition-colors relative"
                  :class="activeTab === 'overview'
                    ? (isDarkMode ? 'text-indigo-400' : 'text-indigo-600')
                    : (isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900')"
                >
                  Overview
                  <div 
                    v-if="activeTab === 'overview'"
                    class="absolute bottom-0 left-0 right-0 h-0.5"
                    :class="isDarkMode ? 'bg-indigo-400' : 'bg-indigo-600'"
                  ></div>
                </button>
                <button
                  @click="activeTab = 'members'"
                  class="px-6 py-3 font-medium transition-colors relative"
                  :class="activeTab === 'members'
                    ? (isDarkMode ? 'text-indigo-400' : 'text-indigo-600')
                    : (isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900')"
                >
                  Members
                  <div 
                    v-if="activeTab === 'members'"
                    class="absolute bottom-0 left-0 right-0 h-0.5"
                    :class="isDarkMode ? 'bg-indigo-400' : 'bg-indigo-600'"
                  ></div>
                </button>
                <button
                  @click="activeTab = 'analytics'"
                  class="px-6 py-3 font-medium transition-colors relative"
                  :class="activeTab === 'analytics'
                    ? (isDarkMode ? 'text-indigo-400' : 'text-indigo-600')
                    : (isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900')"
                >
                  Analytics
                  <div 
                    v-if="activeTab === 'analytics'"
                    class="absolute bottom-0 left-0 right-0 h-0.5"
                    :class="isDarkMode ? 'bg-indigo-400' : 'bg-indigo-600'"
                  ></div>
                </button>
                <button
                  @click="activeTab = 'settings'"
                  class="px-6 py-3 font-medium transition-colors relative"
                  :class="activeTab === 'settings'
                    ? (isDarkMode ? 'text-indigo-400' : 'text-indigo-600')
                    : (isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900')"
                >
                  Settings
                  <div 
                    v-if="activeTab === 'settings'"
                    class="absolute bottom-0 left-0 right-0 h-0.5"
                    :class="isDarkMode ? 'bg-indigo-400' : 'bg-indigo-600'"
                  ></div>
                </button>
              </div>
            </div>

            <!-- Overview Tab -->
            <div v-if="activeTab === 'overview'" class="space-y-8">
              <!-- Analytics Cards -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="rounded-lg border p-4" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
                  <div class="text-sm mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Components</div>
                  <div class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ workspaceAnalytics?.totalComponents || 0 }}
                  </div>
                </div>
                <div class="rounded-lg border p-4" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
                  <div class="text-sm mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Applications</div>
                  <div class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ workspaceAnalytics?.totalApplications || 0 }}
                  </div>
                </div>
                <div class="rounded-lg border p-4" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
                  <div class="text-sm mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Adoption Rate</div>
                  <div class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ workspaceAnalytics?.adoptionRate || 0 }}%
                  </div>
                </div>
                <div class="rounded-lg border p-4" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
                  <div class="text-sm mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Health Score</div>
                  <div class="text-2xl font-bold" :class="getHealthScoreColor(workspaceAnalytics?.healthScore || 0)">
                    {{ workspaceAnalytics?.healthScore || 0 }}
                  </div>
                </div>
              </div>

              <!-- Components Section -->
              <div class="rounded-lg border p-6" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
                <div class="flex items-center justify-between mb-4">
                  <h2 class="text-xl font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Components</h2>
                  <button
                    @click="shareComponentModal = true"
                    class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    :class="isDarkMode 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
                  >
                    Share Component
                  </button>
                </div>
                <div v-if="workspaceComponents.length === 0" class="text-center py-8 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  No components in this workspace yet
                </div>
                <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    v-for="component in workspaceComponents"
                    :key="component.id"
                    class="p-4 rounded-lg border"
                    :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'"
                  >
                    <div class="flex items-start justify-between mb-2">
                      <div>
                        <h5 class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ component.name }}</h5>
                        <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ component.description }}</p>
                      </div>
                      <span 
                        class="px-2 py-1 text-xs rounded"
                        :class="component.isGlobal 
                          ? (isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700')
                          : (isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700')"
                      >
                        {{ component.isGlobal ? 'Global' : 'Workspace' }}
                      </span>
                    </div>
                    <div class="flex items-center gap-2 mt-3">
                      <button
                        v-if="!component.isGlobal"
                        @click="shareComponent(component)"
                        class="text-xs px-2 py-1 rounded transition-colors"
                        :class="isDarkMode 
                          ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                      >
                        Share
                      </button>
                      <button
                        v-if="!component.isGlobal"
                        @click="makeGlobal(component)"
                        class="text-xs px-2 py-1 rounded transition-colors"
                        :class="isDarkMode 
                          ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                      >
                        Make Global
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Fonts Section -->
              <div class="rounded-lg border p-6" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
                <div class="flex items-center justify-between mb-4">
                  <h2 class="text-xl font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Fonts</h2>
                  <button
                    @click="showAddFontModal = true"
                    class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    :class="isDarkMode 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
                  >
                    <span class="material-symbols-outlined text-base mr-1">add</span>
                    Add Font
                  </button>
                </div>
                <div v-if="workspaceFonts.length === 0" class="text-center py-8 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  No fonts yet
                </div>
                <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div
                    v-for="font in workspaceFonts"
                    :key="font.id"
                    class="rounded-lg border p-4"
                    :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'"
                  >
                    <div class="flex items-start justify-between mb-2">
                      <div>
                        <h5 class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ font.name }}</h5>
                        <p class="text-sm mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ font.family }}</p>
                      </div>
                      <span 
                        class="px-2 py-1 text-xs rounded"
                        :class="font.isGlobal 
                          ? (isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700')
                          : (isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700')"
                      >
                        {{ font.isGlobal ? 'Global' : 'Workspace' }}
                      </span>
                    </div>
                    <div class="text-xs space-y-1 mt-3" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      <div><span class="font-medium">Source:</span> {{ font.source }}</div>
                      <div><span class="font-medium">Weights:</span> {{ font.weights.join(', ') }}</div>
                    </div>
                    <div class="flex items-center gap-2 mt-3">
                      <button
                        v-if="!font.isGlobal"
                        @click="shareFont(font)"
                        class="text-xs px-2 py-1 rounded transition-colors"
                        :class="isDarkMode 
                          ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                      >
                        Share
                      </button>
                      <button
                        v-if="!font.isGlobal"
                        @click="makeFontGlobal(font)"
                        class="text-xs px-2 py-1 rounded transition-colors"
                        :class="isDarkMode 
                          ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                      >
                        Make Global
                      </button>
                      <button
                        @click="deleteFont(font.id)"
                        class="text-xs px-2 py-1 rounded transition-colors text-red-600 hover:bg-red-50"
                        :class="isDarkMode ? 'hover:bg-red-900/30' : ''"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Assets Section -->
              <div class="rounded-lg border p-6" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
                <div class="flex items-center justify-between mb-4">
                  <h2 class="text-xl font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Assets</h2>
                  <button
                    @click="showAddAssetModal = true"
                    class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    :class="isDarkMode 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
                  >
                    <span class="material-symbols-outlined text-base mr-1">add</span>
                    Add Asset
                  </button>
                </div>
                <div v-if="workspaceAssets.length === 0" class="text-center py-8 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  No assets yet
                </div>
                <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div
                    v-for="asset in workspaceAssets"
                    :key="asset.id"
                    class="rounded-lg border p-4"
                    :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'"
                  >
                    <div v-if="asset.thumbnailUrl || asset.url" class="mb-3 rounded overflow-hidden bg-gray-100" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-100'">
                      <img :src="asset.thumbnailUrl || asset.url" :alt="asset.name" class="w-full h-32 object-contain" />
                    </div>
                    <div class="flex items-start justify-between mb-2">
                      <div>
                        <h5 class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ asset.name }}</h5>
                        <p class="text-xs mt-1 capitalize" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ asset.type }}</p>
                      </div>
                      <span 
                        class="px-2 py-1 text-xs rounded"
                        :class="asset.isGlobal 
                          ? (isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700')
                          : (isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700')"
                      >
                        {{ asset.isGlobal ? 'Global' : 'Workspace' }}
                      </span>
                    </div>
                    <div class="flex items-center gap-2 mt-3">
                      <button
                        v-if="!asset.isGlobal"
                        @click="shareAsset(asset)"
                        class="text-xs px-2 py-1 rounded transition-colors"
                        :class="isDarkMode 
                          ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                      >
                        Share
                      </button>
                      <button
                        v-if="!asset.isGlobal"
                        @click="makeAssetGlobal(asset)"
                        class="text-xs px-2 py-1 rounded transition-colors"
                        :class="isDarkMode 
                          ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                      >
                        Make Global
                      </button>
                      <button
                        @click="deleteAsset(asset.id)"
                        class="text-xs px-2 py-1 rounded transition-colors text-red-600 hover:bg-red-50"
                        :class="isDarkMode ? 'hover:bg-red-900/30' : ''"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tokens Section -->
              <div class="rounded-lg border p-6" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
                <div class="flex items-center justify-between mb-4">
                  <h2 class="text-xl font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Tokens</h2>
                  <button
                    @click="showAddTokenModal = true"
                    class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    :class="isDarkMode 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
                  >
                    <span class="material-symbols-outlined text-base mr-1">add</span>
                    Add Token
                  </button>
                </div>
                <div v-if="workspaceTokens.length === 0" class="text-center py-8 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  No tokens yet
                </div>
                <div v-else class="space-y-2">
                  <div
                    v-for="token in workspaceTokens"
                    :key="token.id"
                    class="flex items-center justify-between p-3 rounded-lg border"
                    :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'"
                  >
                    <div class="flex items-center gap-4 flex-1">
                      <div class="flex-1">
                        <div class="flex items-center gap-2">
                          <code class="text-sm font-semibold" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">{{ token.name }}</code>
                          <span 
                            class="px-2 py-0.5 text-xs rounded"
                            :class="token.isGlobal 
                              ? (isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700')
                              : (isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700')"
                          >
                            {{ token.isGlobal ? 'Global' : 'Workspace' }}
                          </span>
                        </div>
                        <div class="text-xs mt-1 flex items-center gap-3" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                          <span>{{ token.value }}</span>
                          <span class="capitalize">{{ token.category }}</span>
                        </div>
                      </div>
                      <div class="flex items-center gap-2">
                        <button
                          v-if="!token.isGlobal"
                          @click="shareToken(token)"
                          class="text-xs px-2 py-1 rounded transition-colors"
                          :class="isDarkMode 
                            ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                        >
                          Share
                        </button>
                        <button
                          v-if="!token.isGlobal"
                          @click="makeTokenGlobal(token)"
                          class="text-xs px-2 py-1 rounded transition-colors"
                          :class="isDarkMode 
                            ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                        >
                          Make Global
                        </button>
                        <button
                          @click="deleteToken(token.id)"
                          class="text-xs px-2 py-1 rounded transition-colors text-red-600 hover:bg-red-50"
                          :class="isDarkMode ? 'hover:bg-red-900/30' : ''"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Reviews Section -->
              <div class="rounded-lg border p-6" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
                <div class="flex items-center justify-between mb-4">
                  <h2 class="text-xl font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Reviews</h2>
                  <button
                    @click="showAddReviewModal = true"
                    class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    :class="isDarkMode 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
                  >
                    <span class="material-symbols-outlined text-base mr-1">add</span>
                    Add Review
                  </button>
                </div>
                <div v-if="workspaceReviews.length === 0" class="text-center py-8 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  No reviews yet
                </div>
                <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    v-for="review in workspaceReviews"
                    :key="review.id"
                    class="p-4 rounded-lg border"
                    :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'"
                  >
                    <div class="flex items-start justify-between mb-2">
                      <div>
                        <h5 class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ review.title || review.name }}</h5>
                        <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ review.description }}</p>
                      </div>
                      <span 
                        class="px-2 py-1 text-xs rounded"
                        :class="review.isGlobal 
                          ? (isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700')
                          : (isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700')"
                      >
                        {{ review.isGlobal ? 'Global' : 'Workspace' }}
                      </span>
                    </div>
                    <div class="flex items-center gap-2 mt-3">
                      <button
                        v-if="!review.isGlobal"
                        @click="shareResource('reviews', review)"
                        class="text-xs px-2 py-1 rounded transition-colors"
                        :class="isDarkMode 
                          ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                      >
                        Share
                      </button>
                      <button
                        v-if="!review.isGlobal"
                        @click="makeResourceGlobal('reviews', review)"
                        class="text-xs px-2 py-1 rounded transition-colors"
                        :class="isDarkMode 
                          ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                      >
                        Make Global
                      </button>
                      <button
                        @click="deleteResource('reviews', review.id)"
                        class="text-xs px-2 py-1 rounded transition-colors text-red-600 hover:bg-red-50"
                        :class="isDarkMode ? 'hover:bg-red-900/30' : ''"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Session Replays Section -->
              <div class="rounded-lg border p-6" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
                <div class="flex items-center justify-between mb-4">
                  <h2 class="text-xl font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Session Replays</h2>
                  <button
                    @click="showAddSessionReplayModal = true"
                    class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    :class="isDarkMode 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
                  >
                    <span class="material-symbols-outlined text-base mr-1">add</span>
                    Add Session Replay
                  </button>
                </div>
                <div v-if="workspaceSessionReplays.length === 0" class="text-center py-8 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  No session replays yet
                </div>
                <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    v-for="replay in workspaceSessionReplays"
                    :key="replay.id"
                    class="p-4 rounded-lg border"
                    :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'"
                  >
                    <div class="flex items-start justify-between mb-2">
                      <div>
                        <h5 class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ replay.name || replay.title }}</h5>
                        <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ replay.description }}</p>
                      </div>
                      <span 
                        class="px-2 py-1 text-xs rounded"
                        :class="replay.isGlobal 
                          ? (isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700')
                          : (isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700')"
                      >
                        {{ replay.isGlobal ? 'Global' : 'Workspace' }}
                      </span>
                    </div>
                    <div class="flex items-center gap-2 mt-3">
                      <button
                        v-if="!replay.isGlobal"
                        @click="shareResource('session-replays', replay)"
                        class="text-xs px-2 py-1 rounded transition-colors"
                        :class="isDarkMode 
                          ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                      >
                        Share
                      </button>
                      <button
                        v-if="!replay.isGlobal"
                        @click="makeResourceGlobal('session-replays', replay)"
                        class="text-xs px-2 py-1 rounded transition-colors"
                        :class="isDarkMode 
                          ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                      >
                        Make Global
                      </button>
                      <button
                        @click="deleteResource('session-replays', replay.id)"
                        class="text-xs px-2 py-1 rounded transition-colors text-red-600 hover:bg-red-50"
                        :class="isDarkMode ? 'hover:bg-red-900/30' : ''"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Journey Maps Section -->
              <div class="rounded-lg border p-6" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
                <div class="flex items-center justify-between mb-4">
                  <h2 class="text-xl font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Journey Maps</h2>
                  <button
                    @click="showAddJourneyMapModal = true"
                    class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    :class="isDarkMode 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
                  >
                    <span class="material-symbols-outlined text-base mr-1">add</span>
                    Add Journey Map
                  </button>
                </div>
                <div v-if="workspaceJourneyMaps.length === 0" class="text-center py-8 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  No journey maps yet
                </div>
                <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    v-for="map in workspaceJourneyMaps"
                    :key="map.id"
                    class="p-4 rounded-lg border"
                    :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'"
                  >
                    <div class="flex items-start justify-between mb-2">
                      <div>
                        <h5 class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ map.title || map.name }}</h5>
                        <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ map.description }}</p>
                      </div>
                      <span 
                        class="px-2 py-1 text-xs rounded"
                        :class="map.isGlobal 
                          ? (isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700')
                          : (isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700')"
                      >
                        {{ map.isGlobal ? 'Global' : 'Workspace' }}
                      </span>
                    </div>
                    <div class="flex items-center gap-2 mt-3">
                      <button
                        v-if="!map.isGlobal"
                        @click="shareResource('journey-maps', map)"
                        class="text-xs px-2 py-1 rounded transition-colors"
                        :class="isDarkMode 
                          ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                      >
                        Share
                      </button>
                      <button
                        v-if="!map.isGlobal"
                        @click="makeResourceGlobal('journey-maps', map)"
                        class="text-xs px-2 py-1 rounded transition-colors"
                        :class="isDarkMode 
                          ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                      >
                        Make Global
                      </button>
                      <button
                        @click="deleteResource('journey-maps', map.id)"
                        class="text-xs px-2 py-1 rounded transition-colors text-red-600 hover:bg-red-50"
                        :class="isDarkMode ? 'hover:bg-red-900/30' : ''"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- HCD Reports Section -->
              <div class="rounded-lg border p-6" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
                <div class="flex items-center justify-between mb-4">
                  <h2 class="text-xl font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">HCD Reports</h2>
                  <button
                    @click="showAddHcdReportModal = true"
                    class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    :class="isDarkMode 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
                  >
                    <span class="material-symbols-outlined text-base mr-1">add</span>
                    Add HCD Report
                  </button>
                </div>
                <div v-if="workspaceHcdReports.length === 0" class="text-center py-8 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  No HCD reports yet
                </div>
                <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    v-for="report in workspaceHcdReports"
                    :key="report.id"
                    class="p-4 rounded-lg border"
                    :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'"
                  >
                    <div class="flex items-start justify-between mb-2">
                      <div>
                        <h5 class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ report.title || report.name }}</h5>
                        <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ report.description }}</p>
                      </div>
                      <span 
                        class="px-2 py-1 text-xs rounded"
                        :class="report.isGlobal 
                          ? (isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700')
                          : (isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700')"
                      >
                        {{ report.isGlobal ? 'Global' : 'Workspace' }}
                      </span>
                    </div>
                    <div class="flex items-center gap-2 mt-3">
                      <button
                        v-if="!report.isGlobal"
                        @click="shareResource('hcd-reports', report)"
                        class="text-xs px-2 py-1 rounded transition-colors"
                        :class="isDarkMode 
                          ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                      >
                        Share
                      </button>
                      <button
                        v-if="!report.isGlobal"
                        @click="makeResourceGlobal('hcd-reports', report)"
                        class="text-xs px-2 py-1 rounded transition-colors"
                        :class="isDarkMode 
                          ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                      >
                        Make Global
                      </button>
                      <button
                        @click="deleteResource('hcd-reports', report.id)"
                        class="text-xs px-2 py-1 rounded transition-colors text-red-600 hover:bg-red-50"
                        :class="isDarkMode ? 'hover:bg-red-900/30' : ''"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- User Personas Section -->
              <div class="rounded-lg border p-6" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
                <div class="flex items-center justify-between mb-4">
                  <h2 class="text-xl font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">User Personas</h2>
                  <button
                    @click="showAddUserPersonaModal = true"
                    class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    :class="isDarkMode 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
                  >
                    <span class="material-symbols-outlined text-base mr-1">add</span>
                    Add User Persona
                  </button>
                </div>
                <div v-if="workspaceUserPersonas.length === 0" class="text-center py-8 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  No user personas yet
                </div>
                <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    v-for="persona in workspaceUserPersonas"
                    :key="persona.id"
                    class="p-4 rounded-lg border"
                    :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'"
                  >
                    <div class="flex items-start justify-between mb-2">
                      <div>
                        <h5 class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ persona.name || persona.title }}</h5>
                        <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ persona.description }}</p>
                      </div>
                      <span 
                        class="px-2 py-1 text-xs rounded"
                        :class="persona.isGlobal 
                          ? (isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700')
                          : (isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700')"
                      >
                        {{ persona.isGlobal ? 'Global' : 'Workspace' }}
                      </span>
                    </div>
                    <div class="flex items-center gap-2 mt-3">
                      <button
                        v-if="!persona.isGlobal"
                        @click="shareResource('user-personas', persona)"
                        class="text-xs px-2 py-1 rounded transition-colors"
                        :class="isDarkMode 
                          ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                      >
                        Share
                      </button>
                      <button
                        v-if="!persona.isGlobal"
                        @click="makeResourceGlobal('user-personas', persona)"
                        class="text-xs px-2 py-1 rounded transition-colors"
                        :class="isDarkMode 
                          ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                      >
                        Make Global
                      </button>
                      <button
                        @click="deleteResource('user-personas', persona.id)"
                        class="text-xs px-2 py-1 rounded transition-colors text-red-600 hover:bg-red-50"
                        :class="isDarkMode ? 'hover:bg-red-900/30' : ''"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Research Artifacts Section -->
              <div class="rounded-lg border p-6" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
                <div class="flex items-center justify-between mb-4">
                  <h2 class="text-xl font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Research Artifacts</h2>
                  <button
                    @click="showAddResearchArtifactModal = true"
                    class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    :class="isDarkMode 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
                  >
                    <span class="material-symbols-outlined text-base mr-1">add</span>
                    Add Research Artifact
                  </button>
                </div>
                <div v-if="workspaceResearchArtifacts.length === 0" class="text-center py-8 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  No research artifacts yet
                </div>
                <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    v-for="artifact in workspaceResearchArtifacts"
                    :key="artifact.id"
                    class="p-4 rounded-lg border"
                    :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'"
                  >
                    <div class="flex items-start justify-between mb-2">
                      <div>
                        <h5 class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ artifact.title || artifact.name }}</h5>
                        <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ artifact.description }}</p>
                      </div>
                      <span 
                        class="px-2 py-1 text-xs rounded"
                        :class="artifact.isGlobal 
                          ? (isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700')
                          : (isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700')"
                      >
                        {{ artifact.isGlobal ? 'Global' : 'Workspace' }}
                      </span>
                    </div>
                    <div class="flex items-center gap-2 mt-3">
                      <button
                        v-if="!artifact.isGlobal"
                        @click="shareResource('research-artifacts', artifact)"
                        class="text-xs px-2 py-1 rounded transition-colors"
                        :class="isDarkMode 
                          ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                      >
                        Share
                      </button>
                      <button
                        v-if="!artifact.isGlobal"
                        @click="makeResourceGlobal('research-artifacts', artifact)"
                        class="text-xs px-2 py-1 rounded transition-colors"
                        :class="isDarkMode 
                          ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                      >
                        Make Global
                      </button>
                      <button
                        @click="deleteResource('research-artifacts', artifact.id)"
                        class="text-xs px-2 py-1 rounded transition-colors text-red-600 hover:bg-red-50"
                        :class="isDarkMode ? 'hover:bg-red-900/30' : ''"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Insights Section -->
              <div class="rounded-lg border p-6" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
                <div class="flex items-center justify-between mb-4">
                  <h2 class="text-xl font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Insights</h2>
                  <button
                    @click="showAddInsightModal = true"
                    class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    :class="isDarkMode 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
                  >
                    <span class="material-symbols-outlined text-base mr-1">add</span>
                    Add Insight
                  </button>
                </div>
                <div v-if="workspaceInsights.length === 0" class="text-center py-8 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  No insights yet
                </div>
                <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    v-for="insight in workspaceInsights"
                    :key="insight.id"
                    class="p-4 rounded-lg border"
                    :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'"
                  >
                    <div class="flex items-start justify-between mb-2">
                      <div>
                        <h5 class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ insight.title || insight.name }}</h5>
                        <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ insight.description }}</p>
                      </div>
                      <span 
                        class="px-2 py-1 text-xs rounded"
                        :class="insight.isGlobal 
                          ? (isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700')
                          : (isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700')"
                      >
                        {{ insight.isGlobal ? 'Global' : 'Workspace' }}
                      </span>
                    </div>
                    <div class="flex items-center gap-2 mt-3">
                      <button
                        v-if="!insight.isGlobal"
                        @click="shareResource('insights', insight)"
                        class="text-xs px-2 py-1 rounded transition-colors"
                        :class="isDarkMode 
                          ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                      >
                        Share
                      </button>
                      <button
                        v-if="!insight.isGlobal"
                        @click="makeResourceGlobal('insights', insight)"
                        class="text-xs px-2 py-1 rounded transition-colors"
                        :class="isDarkMode 
                          ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                      >
                        Make Global
                      </button>
                      <button
                        @click="deleteResource('insights', insight.id)"
                        class="text-xs px-2 py-1 rounded transition-colors text-red-600 hover:bg-red-50"
                        :class="isDarkMode ? 'hover:bg-red-900/30' : ''"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Patterns Section -->
              <div class="rounded-lg border p-6" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
                <div class="flex items-center justify-between mb-4">
                  <h2 class="text-xl font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Patterns</h2>
                  <button
                    @click="showAddPatternModal = true"
                    class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    :class="isDarkMode 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
                  >
                    <span class="material-symbols-outlined text-base mr-1">add</span>
                    Add Pattern
                  </button>
                </div>
                <div v-if="workspacePatterns.length === 0" class="text-center py-8 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  No patterns yet
                </div>
                <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    v-for="pattern in workspacePatterns"
                    :key="pattern.id"
                    class="p-4 rounded-lg border"
                    :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'"
                  >
                    <div class="flex items-start justify-between mb-2">
                      <div>
                        <h5 class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ pattern.name || pattern.title }}</h5>
                        <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ pattern.description }}</p>
                      </div>
                      <span 
                        class="px-2 py-1 text-xs rounded"
                        :class="pattern.isGlobal 
                          ? (isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700')
                          : (isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700')"
                      >
                        {{ pattern.isGlobal ? 'Global' : 'Workspace' }}
                      </span>
                    </div>
                    <div class="flex items-center gap-2 mt-3">
                      <button
                        v-if="!pattern.isGlobal"
                        @click="shareResource('patterns', pattern)"
                        class="text-xs px-2 py-1 rounded transition-colors"
                        :class="isDarkMode 
                          ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                      >
                        Share
                      </button>
                      <button
                        v-if="!pattern.isGlobal"
                        @click="makeResourceGlobal('patterns', pattern)"
                        class="text-xs px-2 py-1 rounded transition-colors"
                        :class="isDarkMode 
                          ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                      >
                        Make Global
                      </button>
                      <button
                        @click="deleteResource('patterns', pattern.id)"
                        class="text-xs px-2 py-1 rounded transition-colors text-red-600 hover:bg-red-50"
                        :class="isDarkMode ? 'hover:bg-red-900/30' : ''"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Icons Section -->
              <div class="rounded-lg border p-6" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
                <div class="flex items-center justify-between mb-4">
                  <h2 class="text-xl font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Icons</h2>
                  <button
                    @click="showAddIconModal = true"
                    class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    :class="isDarkMode 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
                  >
                    <span class="material-symbols-outlined text-base mr-1">add</span>
                    Add Icon
                  </button>
                </div>
                <div v-if="workspaceIcons.length === 0" class="text-center py-8 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  No icons yet
                </div>
                <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    v-for="icon in workspaceIcons"
                    :key="icon.id"
                    class="p-4 rounded-lg border"
                    :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'"
                  >
                    <div class="flex items-start justify-between mb-2">
                      <div>
                        <h5 class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ icon.name || icon.title }}</h5>
                        <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ icon.description }}</p>
                      </div>
                      <span 
                        class="px-2 py-1 text-xs rounded"
                        :class="icon.isGlobal 
                          ? (isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700')
                          : (isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700')"
                      >
                        {{ icon.isGlobal ? 'Global' : 'Workspace' }}
                      </span>
                    </div>
                    <div class="flex items-center gap-2 mt-3">
                      <button
                        v-if="!icon.isGlobal"
                        @click="shareResource('icons', icon)"
                        class="text-xs px-2 py-1 rounded transition-colors"
                        :class="isDarkMode 
                          ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                      >
                        Share
                      </button>
                      <button
                        v-if="!icon.isGlobal"
                        @click="makeResourceGlobal('icons', icon)"
                        class="text-xs px-2 py-1 rounded transition-colors"
                        :class="isDarkMode 
                          ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                      >
                        Make Global
                      </button>
                      <button
                        @click="deleteResource('icons', icon.id)"
                        class="text-xs px-2 py-1 rounded transition-colors text-red-600 hover:bg-red-50"
                        :class="isDarkMode ? 'hover:bg-red-900/30' : ''"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Interactives Section -->
              <div class="rounded-lg border p-6" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
                <div class="flex items-center justify-between mb-4">
                  <h2 class="text-xl font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Interactives</h2>
                  <button
                    @click="showAddInteractiveModal = true"
                    class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    :class="isDarkMode 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
                  >
                    <span class="material-symbols-outlined text-base mr-1">add</span>
                    Add Interactive
                  </button>
                </div>
                <div v-if="workspaceInteractives.length === 0" class="text-center py-8 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  No interactives yet
                </div>
                <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    v-for="interactive in workspaceInteractives"
                    :key="interactive.id"
                    class="p-4 rounded-lg border"
                    :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'"
                  >
                    <div class="flex items-start justify-between mb-2">
                      <div>
                        <h5 class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ interactive.name || interactive.title }}</h5>
                        <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ interactive.description }}</p>
                      </div>
                      <span 
                        class="px-2 py-1 text-xs rounded"
                        :class="interactive.isGlobal 
                          ? (isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700')
                          : (isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700')"
                      >
                        {{ interactive.isGlobal ? 'Global' : 'Workspace' }}
                      </span>
                    </div>
                    <div class="flex items-center gap-2 mt-3">
                      <button
                        v-if="!interactive.isGlobal"
                        @click="shareResource('interactives', interactive)"
                        class="text-xs px-2 py-1 rounded transition-colors"
                        :class="isDarkMode 
                          ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                      >
                        Share
                      </button>
                      <button
                        v-if="!interactive.isGlobal"
                        @click="makeResourceGlobal('interactives', interactive)"
                        class="text-xs px-2 py-1 rounded transition-colors"
                        :class="isDarkMode 
                          ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                      >
                        Make Global
                      </button>
                      <button
                        @click="deleteResource('interactives', interactive.id)"
                        class="text-xs px-2 py-1 rounded transition-colors text-red-600 hover:bg-red-50"
                        :class="isDarkMode ? 'hover:bg-red-900/30' : ''"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Stock Photos Section -->
              <div class="rounded-lg border p-6" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
                <div class="flex items-center justify-between mb-4">
                  <h2 class="text-xl font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Stock Photos</h2>
                  <button
                    @click="showAddStockPhotoModal = true"
                    class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    :class="isDarkMode 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
                  >
                    <span class="material-symbols-outlined text-base mr-1">add</span>
                    Add Stock Photo
                  </button>
                </div>
                <div v-if="workspaceStockPhotos.length === 0" class="text-center py-8 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  No stock photos yet
                </div>
                <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    v-for="photo in workspaceStockPhotos"
                    :key="photo.id"
                    class="p-4 rounded-lg border"
                    :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'"
                  >
                    <div class="flex items-start justify-between mb-2">
                      <div>
                        <h5 class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ photo.name || photo.title }}</h5>
                        <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ photo.description }}</p>
                      </div>
                      <span 
                        class="px-2 py-1 text-xs rounded"
                        :class="photo.isGlobal 
                          ? (isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700')
                          : (isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700')"
                      >
                        {{ photo.isGlobal ? 'Global' : 'Workspace' }}
                      </span>
                    </div>
                    <div class="flex items-center gap-2 mt-3">
                      <button
                        v-if="!photo.isGlobal"
                        @click="shareResource('stock-photos', photo)"
                        class="text-xs px-2 py-1 rounded transition-colors"
                        :class="isDarkMode 
                          ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                      >
                        Share
                      </button>
                      <button
                        v-if="!photo.isGlobal"
                        @click="makeResourceGlobal('stock-photos', photo)"
                        class="text-xs px-2 py-1 rounded transition-colors"
                        :class="isDarkMode 
                          ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                      >
                        Make Global
                      </button>
                      <button
                        @click="deleteResource('stock-photos', photo.id)"
                        class="text-xs px-2 py-1 rounded transition-colors text-red-600 hover:bg-red-50"
                        :class="isDarkMode ? 'hover:bg-red-900/30' : ''"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Illustrations Section -->
              <div class="rounded-lg border p-6" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
                <div class="flex items-center justify-between mb-4">
                  <h2 class="text-xl font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Illustrations</h2>
                  <button
                    @click="showAddIllustrationModal = true"
                    class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    :class="isDarkMode 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
                  >
                    <span class="material-symbols-outlined text-base mr-1">add</span>
                    Add Illustration
                  </button>
                </div>
                <div v-if="workspaceIllustrations.length === 0" class="text-center py-8 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  No illustrations yet
                </div>
                <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    v-for="illustration in workspaceIllustrations"
                    :key="illustration.id"
                    class="p-4 rounded-lg border"
                    :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'"
                  >
                    <div class="flex items-start justify-between mb-2">
                      <div>
                        <h5 class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ illustration.name || illustration.title }}</h5>
                        <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ illustration.description }}</p>
                      </div>
                      <span 
                        class="px-2 py-1 text-xs rounded"
                        :class="illustration.isGlobal 
                          ? (isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700')
                          : (isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700')"
                      >
                        {{ illustration.isGlobal ? 'Global' : 'Workspace' }}
                      </span>
                    </div>
                    <div class="flex items-center gap-2 mt-3">
                      <button
                        v-if="!illustration.isGlobal"
                        @click="shareResource('illustrations', illustration)"
                        class="text-xs px-2 py-1 rounded transition-colors"
                        :class="isDarkMode 
                          ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                      >
                        Share
                      </button>
                      <button
                        v-if="!illustration.isGlobal"
                        @click="makeResourceGlobal('illustrations', illustration)"
                        class="text-xs px-2 py-1 rounded transition-colors"
                        :class="isDarkMode 
                          ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                      >
                        Make Global
                      </button>
                      <button
                        @click="deleteResource('illustrations', illustration.id)"
                        class="text-xs px-2 py-1 rounded transition-colors text-red-600 hover:bg-red-50"
                        :class="isDarkMode ? 'hover:bg-red-900/30' : ''"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Capability Logos Section -->
              <div class="rounded-lg border p-6" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
                <div class="flex items-center justify-between mb-4">
                  <h2 class="text-xl font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Capability Logos</h2>
                  <button
                    @click="showAddCapabilityLogoModal = true"
                    class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    :class="isDarkMode 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
                  >
                    <span class="material-symbols-outlined text-base mr-1">add</span>
                    Add Capability Logo
                  </button>
                </div>
                <div v-if="workspaceCapabilityLogos.length === 0" class="text-center py-8 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  No capability logos yet
                </div>
                <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    v-for="logo in workspaceCapabilityLogos"
                    :key="logo.id"
                    class="p-4 rounded-lg border"
                    :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'"
                  >
                    <div class="flex items-start justify-between mb-2">
                      <div>
                        <h5 class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ logo.name || logo.title }}</h5>
                        <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ logo.description }}</p>
                      </div>
                      <span 
                        class="px-2 py-1 text-xs rounded"
                        :class="logo.isGlobal 
                          ? (isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700')
                          : (isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700')"
                      >
                        {{ logo.isGlobal ? 'Global' : 'Workspace' }}
                      </span>
                    </div>
                    <div class="flex items-center gap-2 mt-3">
                      <button
                        v-if="!logo.isGlobal"
                        @click="shareResource('capability-logos', logo)"
                        class="text-xs px-2 py-1 rounded transition-colors"
                        :class="isDarkMode 
                          ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                      >
                        Share
                      </button>
                      <button
                        v-if="!logo.isGlobal"
                        @click="makeResourceGlobal('capability-logos', logo)"
                        class="text-xs px-2 py-1 rounded transition-colors"
                        :class="isDarkMode 
                          ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                      >
                        Make Global
                      </button>
                      <button
                        @click="deleteResource('capability-logos', logo.id)"
                        class="text-xs px-2 py-1 rounded transition-colors text-red-600 hover:bg-red-50"
                        :class="isDarkMode ? 'hover:bg-red-900/30' : ''"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Style Dictionaries Section -->
              <div class="rounded-lg border p-6" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
                <div class="flex items-center justify-between mb-4">
                  <h2 class="text-xl font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Style Dictionaries</h2>
                  <button
                    @click="showAddStyleDictionaryModal = true"
                    class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    :class="isDarkMode 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
                  >
                    <span class="material-symbols-outlined text-base mr-1">add</span>
                    Add Style Dictionary
                  </button>
                </div>
                <div v-if="workspaceStyleDictionaries.length === 0" class="text-center py-8 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  No style dictionaries yet
                </div>
                <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    v-for="dict in workspaceStyleDictionaries"
                    :key="dict.id"
                    class="p-4 rounded-lg border"
                    :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'"
                  >
                    <div class="flex items-start justify-between mb-2">
                      <div>
                        <h5 class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ dict.name || dict.title }}</h5>
                        <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ dict.description }}</p>
                      </div>
                      <span 
                        class="px-2 py-1 text-xs rounded"
                        :class="dict.isGlobal 
                          ? (isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700')
                          : (isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700')"
                      >
                        {{ dict.isGlobal ? 'Global' : 'Workspace' }}
                      </span>
                    </div>
                    <div class="flex items-center gap-2 mt-3">
                      <button
                        v-if="!dict.isGlobal"
                        @click="shareResource('style-dictionaries', dict)"
                        class="text-xs px-2 py-1 rounded transition-colors"
                        :class="isDarkMode 
                          ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                      >
                        Share
                      </button>
                      <button
                        v-if="!dict.isGlobal"
                        @click="makeResourceGlobal('style-dictionaries', dict)"
                        class="text-xs px-2 py-1 rounded transition-colors"
                        :class="isDarkMode 
                          ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                      >
                        Make Global
                      </button>
                      <button
                        @click="deleteResource('style-dictionaries', dict.id)"
                        class="text-xs px-2 py-1 rounded transition-colors text-red-600 hover:bg-red-50"
                        :class="isDarkMode ? 'hover:bg-red-900/30' : ''"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Guidelines Section -->
              <div class="rounded-lg border p-6" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
                <div class="flex items-center justify-between mb-4">
                  <h2 class="text-xl font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Guidelines</h2>
                  <button
                    @click="showAddGuidelineModal = true"
                    class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    :class="isDarkMode 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
                  >
                    <span class="material-symbols-outlined text-base mr-1">add</span>
                    Add Guideline
                  </button>
                </div>
                <div v-if="workspaceGuidelines.length === 0" class="text-center py-8 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  No guidelines yet
                </div>
                <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    v-for="guideline in workspaceGuidelines"
                    :key="guideline.id"
                    class="p-4 rounded-lg border"
                    :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'"
                  >
                    <div class="flex items-start justify-between mb-2">
                      <div>
                        <h5 class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ guideline.title || guideline.name }}</h5>
                        <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ guideline.description }}</p>
                      </div>
                      <span 
                        class="px-2 py-1 text-xs rounded"
                        :class="guideline.isGlobal 
                          ? (isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700')
                          : (isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700')"
                      >
                        {{ guideline.isGlobal ? 'Global' : 'Workspace' }}
                      </span>
                    </div>
                    <div class="flex items-center gap-2 mt-3">
                      <button
                        v-if="!guideline.isGlobal"
                        @click="shareResource('guidelines', guideline)"
                        class="text-xs px-2 py-1 rounded transition-colors"
                        :class="isDarkMode 
                          ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                      >
                        Share
                      </button>
                      <button
                        v-if="!guideline.isGlobal"
                        @click="makeResourceGlobal('guidelines', guideline)"
                        class="text-xs px-2 py-1 rounded transition-colors"
                        :class="isDarkMode 
                          ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                      >
                        Make Global
                      </button>
                      <button
                        @click="deleteResource('guidelines', guideline.id)"
                        class="text-xs px-2 py-1 rounded transition-colors text-red-600 hover:bg-red-50"
                        :class="isDarkMode ? 'hover:bg-red-900/30' : ''"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Members Tab -->
            <div v-if="activeTab === 'members'" class="space-y-4">
              <div class="flex items-center justify-between">
                <h2 class="text-xl font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Workspace Members</h2>
                <button
                  @click="showAddMemberModal = true"
                  class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  :class="isDarkMode 
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
                >
                  Add Member
                </button>
              </div>
              <div class="space-y-2">
                <div
                  v-for="member in workspace.members"
                  :key="member.userId"
                  class="flex items-center justify-between p-3 rounded-lg border"
                  :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'"
                >
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-100'">
                      <span class="material-symbols-outlined" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">person</span>
                    </div>
                    <div>
                      <div class="font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ member.email }}</div>
                      <div class="text-xs flex items-center gap-2 mt-1">
                        <span 
                          class="px-2 py-0.5 rounded capitalize"
                          :class="member.role === 'owner'
                            ? (isDarkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700')
                            : member.role === 'admin'
                            ? (isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700')
                            : member.role === 'editor'
                            ? (isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700')
                            : (isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700')"
                        >
                          {{ member.role }}
                        </span>
                        <span class="text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                          Added {{ formatDate(member.addedAt) }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <Dropdown
                      v-if="member.role !== 'owner'"
                      :model-value="member.role"
                      @update:model-value="updateMemberRole(member.userId, $event)"
                      :options="[
                        { value: 'admin', label: 'Admin' },
                        { value: 'editor', label: 'Editor' },
                        { value: 'viewer', label: 'Viewer' }
                      ]"
                      :is-dark-mode="isDarkMode"
                    />
                    <button
                      v-if="member.role !== 'owner'"
                      @click="removeMember(member.userId)"
                      class="p-2 rounded-lg transition-colors text-red-600 hover:bg-red-50"
                      :class="isDarkMode ? 'hover:bg-red-900/30' : ''"
                      title="Remove Member"
                    >
                      <span class="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Analytics Tab -->
            <div v-if="activeTab === 'analytics'" class="space-y-6">
              <div class="rounded-lg border p-6" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
                <h2 class="text-xl font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Workspace Analytics</h2>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <div class="text-sm mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Total Components</div>
                    <div class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      {{ workspaceAnalytics?.totalComponents || 0 }}
                    </div>
                  </div>
                  <div>
                    <div class="text-sm mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Design Debt</div>
                    <div class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      {{ workspaceAnalytics?.designDebt || 0 }}
                    </div>
                  </div>
                  <div>
                    <div class="text-sm mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Adoption Rate</div>
                    <div class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      {{ workspaceAnalytics?.adoptionRate || 0 }}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Settings Tab -->
            <div v-if="activeTab === 'settings'" class="space-y-4">
              <div class="rounded-lg border p-4" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
                <h2 class="text-xl font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Workspace Settings</h2>
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="font-medium mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Allow External Sharing</div>
                      <div class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Allow sharing workspace resources with other workspaces</div>
                    </div>
                    <input
                      type="checkbox"
                      :checked="workspace.settings?.allowExternalSharing !== false"
                      @change="updateWorkspaceSetting('allowExternalSharing', $event.target.checked)"
                      class="w-5 h-5 rounded accent-indigo-600"
                    />
                  </div>
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="font-medium mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Require Approval for Sharing</div>
                      <div class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Require workspace owner approval before sharing resources</div>
                    </div>
                    <input
                      type="checkbox"
                      :checked="workspace.settings?.requireApprovalForSharing === true"
                      @change="updateWorkspaceSetting('requireApprovalForSharing', $event.target.checked)"
                      class="w-5 h-5 rounded accent-indigo-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <!-- Add Member Modal -->
    <div
      v-if="showAddMemberModal && workspace"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      @click.self="showAddMemberModal = false"
    >
      <div 
        class="rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
        :class="isDarkMode ? 'bg-slate-800' : 'bg-white'"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
            <span class="material-symbols-outlined text-indigo-600 text-2xl">person_add</span>
            Add Member
          </h3>
          <button
            @click="showAddMemberModal = false; resetAddMemberForm()"
            class="text-gray-400 hover:text-gray-600"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Email *
            </label>
            <input
              v-model="newMember.email"
              type="email"
              placeholder="user@example.com"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              :class="isDarkMode 
                ? 'border-gray-600 bg-slate-700 text-white' 
                : 'border-gray-300 bg-white text-gray-900'"
            />
          </div>
          <div>
            <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Role *
            </label>
            <Dropdown
              :model-value="newMember.role"
              @update:model-value="newMember.role = $event"
              :options="[
                { value: 'admin', label: 'Admin' },
                { value: 'editor', label: 'Editor' },
                { value: 'viewer', label: 'Viewer' }
              ]"
              :is-dark-mode="isDarkMode"
            />
          </div>
          <div class="flex items-center gap-2 pt-4 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
            <button
              @click="addMember"
              :disabled="!newMember.email || addingMember"
              class="px-4 py-2 rounded-lg font-medium transition-colors flex-1"
              :class="newMember.email && !addingMember
                ? (isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white')
                : (isDarkMode ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')"
            >
              {{ addingMember ? 'Adding...' : 'Add Member' }}
            </button>
            <button
              @click="showAddMemberModal = false; resetAddMemberForm()"
              class="px-4 py-2 rounded-lg font-medium transition-colors"
              :class="isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Share Component Modal -->
    <div
      v-if="shareComponentModal && workspace"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      @click.self="shareComponentModal = false"
    >
      <div 
        class="rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
        :class="isDarkMode ? 'bg-slate-800' : 'bg-white'"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
            <span class="material-symbols-outlined text-indigo-600 text-2xl">share</span>
            Share Component
          </h3>
          <button
            @click="shareComponentModal = false; sharingComponent = null"
            class="text-gray-400 hover:text-gray-600"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Select Workspaces
            </label>
            <div class="space-y-2 max-h-64 overflow-y-auto">
              <div
                v-for="ws in []"
                :key="ws.id"
                class="flex items-center gap-2 p-2 rounded"
                :class="isDarkMode ? 'bg-slate-700' : 'bg-gray-50'"
              >
                <input
                  type="checkbox"
                  :value="ws.id"
                  v-model="selectedWorkspacesForSharing"
                  class="accent-indigo-600"
                />
                <span class="text-sm" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ ws.name }}</span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2 pt-4 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
            <button
              @click="shareComponentWithWorkspaces"
              :disabled="!sharingComponent || selectedWorkspacesForSharing.length === 0 || sharing"
              class="px-4 py-2 rounded-lg font-medium transition-colors flex-1"
              :class="sharingComponent && selectedWorkspacesForSharing.length > 0 && !sharing
                ? (isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white')
                : (isDarkMode ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')"
            >
              {{ sharing ? 'Sharing...' : 'Share' }}
            </button>
            <button
              @click="shareComponentModal = false; sharingComponent = null; selectedWorkspacesForSharing = []"
              class="px-4 py-2 rounded-lg font-medium transition-colors"
              :class="isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Font Modal -->
    <div
      v-if="showAddFontModal && workspace"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      @click.self="showAddFontModal = false"
    >
      <div 
        class="rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
        :class="isDarkMode ? 'bg-slate-800' : 'bg-white'"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
            <span class="material-symbols-outlined text-indigo-600 text-2xl">font_download</span>
            Add Font
          </h3>
          <button
            @click="showAddFontModal = false"
            class="text-gray-400 hover:text-gray-600"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Font Name *
            </label>
            <input
              v-model="newFont.name"
              type="text"
              placeholder="e.g., Inter, Roboto"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              :class="isDarkMode 
                ? 'border-gray-600 bg-slate-700 text-white' 
                : 'border-gray-300 bg-white text-gray-900'"
            />
          </div>
          <div>
            <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Font Family *
            </label>
            <input
              v-model="newFont.family"
              type="text"
              placeholder="e.g., Inter, sans-serif"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              :class="isDarkMode 
                ? 'border-gray-600 bg-slate-700 text-white' 
                : 'border-gray-300 bg-white text-gray-900'"
            />
          </div>
          <div class="flex items-center gap-2 pt-4 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
            <button
              @click="addFont"
              :disabled="!newFont.name || !newFont.family"
              class="px-4 py-2 rounded-lg font-medium transition-colors flex-1"
              :class="newFont.name && newFont.family
                ? (isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white')
                : (isDarkMode ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')"
            >
              Add Font
            </button>
            <button
              @click="showAddFontModal = false"
              class="px-4 py-2 rounded-lg font-medium transition-colors"
              :class="isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Asset Modal -->
    <div
      v-if="showAddAssetModal && workspace"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      @click.self="showAddAssetModal = false"
    >
      <div 
        class="rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
        :class="isDarkMode ? 'bg-slate-800' : 'bg-white'"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
            <span class="material-symbols-outlined text-indigo-600 text-2xl">image</span>
            Add Asset
          </h3>
          <button
            @click="showAddAssetModal = false"
            class="text-gray-400 hover:text-gray-600"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Asset Name *
            </label>
            <input
              v-model="newAsset.name"
              type="text"
              placeholder="e.g., Logo, Icon Set"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              :class="isDarkMode 
                ? 'border-gray-600 bg-slate-700 text-white' 
                : 'border-gray-300 bg-white text-gray-900'"
            />
          </div>
          <div>
            <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              URL *
            </label>
            <input
              v-model="newAsset.url"
              type="url"
              placeholder="https://example.com/asset.png"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              :class="isDarkMode 
                ? 'border-gray-600 bg-slate-700 text-white' 
                : 'border-gray-300 bg-white text-gray-900'"
            />
          </div>
          <div class="flex items-center gap-2 pt-4 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
            <button
              @click="addAsset"
              :disabled="!newAsset.name || !newAsset.url"
              class="px-4 py-2 rounded-lg font-medium transition-colors flex-1"
              :class="newAsset.name && newAsset.url
                ? (isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white')
                : (isDarkMode ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')"
            >
              Add Asset
            </button>
            <button
              @click="showAddAssetModal = false"
              class="px-4 py-2 rounded-lg font-medium transition-colors"
              :class="isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Token Modal -->
    <div
      v-if="showAddTokenModal && workspace"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      @click.self="showAddTokenModal = false"
    >
      <div 
        class="rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
        :class="isDarkMode ? 'bg-slate-800' : 'bg-white'"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
            <span class="material-symbols-outlined text-indigo-600 text-2xl">palette</span>
            Add Token
          </h3>
          <button
            @click="showAddTokenModal = false"
            class="text-gray-400 hover:text-gray-600"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Token Name *
            </label>
            <input
              v-model="newToken.name"
              type="text"
              placeholder="e.g., color.primary"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              :class="isDarkMode 
                ? 'border-gray-600 bg-slate-700 text-white' 
                : 'border-gray-300 bg-white text-gray-900'"
            />
          </div>
          <div>
            <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Value *
            </label>
            <input
              v-model="newToken.value"
              type="text"
              placeholder="e.g., #4f46e5"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              :class="isDarkMode 
                ? 'border-gray-600 bg-slate-700 text-white' 
                : 'border-gray-300 bg-white text-gray-900'"
            />
          </div>
          <div class="flex items-center gap-2 pt-4 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
            <button
              @click="addToken"
              :disabled="!newToken.name || !newToken.value"
              class="px-4 py-2 rounded-lg font-medium transition-colors flex-1"
              :class="newToken.name && newToken.value
                ? (isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white')
                : (isDarkMode ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')"
            >
              Add Token
            </button>
            <button
              @click="showAddTokenModal = false"
              class="px-4 py-2 rounded-lg font-medium transition-colors"
              :class="isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Review Modal -->
    <div
      v-if="showAddReviewModal && workspace"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      @click.self="showAddReviewModal = false"
    >
      <div 
        class="rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
        :class="isDarkMode ? 'bg-slate-800' : 'bg-white'"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
            <span class="material-symbols-outlined text-indigo-600 text-2xl">rate_review</span>
            Add Review
          </h3>
          <button @click="showAddReviewModal = false" class="text-gray-400 hover:text-gray-600">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Title *</label>
            <input v-model="newReview.title" type="text" placeholder="Review title" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" :class="isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'" />
          </div>
          <div>
            <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Description</label>
            <textarea v-model="newReview.description" rows="3" placeholder="Review description" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" :class="isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'"></textarea>
          </div>
          <div class="flex items-center gap-2 pt-4 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
            <button @click="addReview" :disabled="!newReview.title" class="px-4 py-2 rounded-lg font-medium transition-colors flex-1" :class="newReview.title ? (isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white') : (isDarkMode ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')">Add Review</button>
            <button @click="showAddReviewModal = false" class="px-4 py-2 rounded-lg font-medium transition-colors" :class="isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'">Cancel</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Session Replay Modal -->
    <div
      v-if="showAddSessionReplayModal && workspace"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      @click.self="showAddSessionReplayModal = false"
    >
      <div 
        class="rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
        :class="isDarkMode ? 'bg-slate-800' : 'bg-white'"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
            <span class="material-symbols-outlined text-indigo-600 text-2xl">videocam</span>
            Add Session Replay
          </h3>
          <button @click="showAddSessionReplayModal = false" class="text-gray-400 hover:text-gray-600">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Name *</label>
            <input v-model="newSessionReplay.name" type="text" placeholder="Session replay name" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" :class="isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'" />
          </div>
          <div>
            <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">URL</label>
            <input v-model="newSessionReplay.url" type="url" placeholder="https://..." class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" :class="isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'" />
          </div>
          <div class="flex items-center gap-2 pt-4 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
            <button @click="addSessionReplay" :disabled="!newSessionReplay.name" class="px-4 py-2 rounded-lg font-medium transition-colors flex-1" :class="newSessionReplay.name ? (isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white') : (isDarkMode ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')">Add Session Replay</button>
            <button @click="showAddSessionReplayModal = false" class="px-4 py-2 rounded-lg font-medium transition-colors" :class="isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'">Cancel</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Journey Map Modal -->
    <div
      v-if="showAddJourneyMapModal && workspace"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      @click.self="showAddJourneyMapModal = false"
    >
      <div 
        class="rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
        :class="isDarkMode ? 'bg-slate-800' : 'bg-white'"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
            <span class="material-symbols-outlined text-indigo-600 text-2xl">map</span>
            Add Journey Map
          </h3>
          <button @click="showAddJourneyMapModal = false" class="text-gray-400 hover:text-gray-600">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Title *</label>
            <input v-model="newJourneyMap.title" type="text" placeholder="Journey map title" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" :class="isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'" />
          </div>
          <div>
            <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Persona</label>
            <input v-model="newJourneyMap.persona" type="text" placeholder="Associated persona" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" :class="isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'" />
          </div>
          <div class="flex items-center gap-2 pt-4 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
            <button @click="addJourneyMap" :disabled="!newJourneyMap.title" class="px-4 py-2 rounded-lg font-medium transition-colors flex-1" :class="newJourneyMap.title ? (isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white') : (isDarkMode ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')">Add Journey Map</button>
            <button @click="showAddJourneyMapModal = false" class="px-4 py-2 rounded-lg font-medium transition-colors" :class="isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'">Cancel</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add HCD Report Modal -->
    <div
      v-if="showAddHcdReportModal && workspace"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      @click.self="showAddHcdReportModal = false"
    >
      <div 
        class="rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
        :class="isDarkMode ? 'bg-slate-800' : 'bg-white'"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
            <span class="material-symbols-outlined text-indigo-600 text-2xl">description</span>
            Add HCD Report
          </h3>
          <button @click="showAddHcdReportModal = false" class="text-gray-400 hover:text-gray-600">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Title *</label>
            <input v-model="newHcdReport.title" type="text" placeholder="HCD report title" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" :class="isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'" />
          </div>
          <div>
            <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Type</label>
            <input v-model="newHcdReport.type" type="text" placeholder="Report type" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" :class="isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'" />
          </div>
          <div class="flex items-center gap-2 pt-4 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
            <button @click="addHcdReport" :disabled="!newHcdReport.title" class="px-4 py-2 rounded-lg font-medium transition-colors flex-1" :class="newHcdReport.title ? (isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white') : (isDarkMode ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')">Add HCD Report</button>
            <button @click="showAddHcdReportModal = false" class="px-4 py-2 rounded-lg font-medium transition-colors" :class="isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'">Cancel</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add User Persona Modal -->
    <div
      v-if="showAddUserPersonaModal && workspace"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      @click.self="showAddUserPersonaModal = false"
    >
      <div 
        class="rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
        :class="isDarkMode ? 'bg-slate-800' : 'bg-white'"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
            <span class="material-symbols-outlined text-indigo-600 text-2xl">person</span>
            Add User Persona
          </h3>
          <button @click="showAddUserPersonaModal = false" class="text-gray-400 hover:text-gray-600">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Name *</label>
            <input v-model="newUserPersona.name" type="text" placeholder="Persona name" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" :class="isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'" />
          </div>
          <div>
            <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Description</label>
            <textarea v-model="newUserPersona.description" rows="3" placeholder="Persona description" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" :class="isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'"></textarea>
          </div>
          <div class="flex items-center gap-2 pt-4 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
            <button @click="addUserPersona" :disabled="!newUserPersona.name" class="px-4 py-2 rounded-lg font-medium transition-colors flex-1" :class="newUserPersona.name ? (isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white') : (isDarkMode ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')">Add User Persona</button>
            <button @click="showAddUserPersonaModal = false" class="px-4 py-2 rounded-lg font-medium transition-colors" :class="isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'">Cancel</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Research Artifact Modal -->
    <div
      v-if="showAddResearchArtifactModal && workspace"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      @click.self="showAddResearchArtifactModal = false"
    >
      <div 
        class="rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
        :class="isDarkMode ? 'bg-slate-800' : 'bg-white'"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
            <span class="material-symbols-outlined text-indigo-600 text-2xl">science</span>
            Add Research Artifact
          </h3>
          <button @click="showAddResearchArtifactModal = false" class="text-gray-400 hover:text-gray-600">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Title *</label>
            <input v-model="newResearchArtifact.title" type="text" placeholder="Artifact title" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" :class="isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'" />
          </div>
          <div>
            <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Type</label>
            <input v-model="newResearchArtifact.type" type="text" placeholder="Artifact type" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" :class="isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'" />
          </div>
          <div class="flex items-center gap-2 pt-4 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
            <button @click="addResearchArtifact" :disabled="!newResearchArtifact.title" class="px-4 py-2 rounded-lg font-medium transition-colors flex-1" :class="newResearchArtifact.title ? (isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white') : (isDarkMode ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')">Add Research Artifact</button>
            <button @click="showAddResearchArtifactModal = false" class="px-4 py-2 rounded-lg font-medium transition-colors" :class="isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'">Cancel</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Insight Modal -->
    <div
      v-if="showAddInsightModal && workspace"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      @click.self="showAddInsightModal = false"
    >
      <div 
        class="rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
        :class="isDarkMode ? 'bg-slate-800' : 'bg-white'"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
            <span class="material-symbols-outlined text-indigo-600 text-2xl">lightbulb</span>
            Add Insight
          </h3>
          <button @click="showAddInsightModal = false" class="text-gray-400 hover:text-gray-600">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Title *</label>
            <input v-model="newInsight.title" type="text" placeholder="Insight title" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" :class="isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'" />
          </div>
          <div>
            <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Category</label>
            <input v-model="newInsight.category" type="text" placeholder="Insight category" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" :class="isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'" />
          </div>
          <div class="flex items-center gap-2 pt-4 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
            <button @click="addInsight" :disabled="!newInsight.title" class="px-4 py-2 rounded-lg font-medium transition-colors flex-1" :class="newInsight.title ? (isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white') : (isDarkMode ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')">Add Insight</button>
            <button @click="showAddInsightModal = false" class="px-4 py-2 rounded-lg font-medium transition-colors" :class="isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'">Cancel</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Pattern Modal -->
    <div
      v-if="showAddPatternModal && workspace"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      @click.self="showAddPatternModal = false"
    >
      <div 
        class="rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
        :class="isDarkMode ? 'bg-slate-800' : 'bg-white'"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
            <span class="material-symbols-outlined text-indigo-600 text-2xl">pattern</span>
            Add Pattern
          </h3>
          <button @click="showAddPatternModal = false" class="text-gray-400 hover:text-gray-600">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Name *</label>
            <input v-model="newPattern.name" type="text" placeholder="Pattern name" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" :class="isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'" />
          </div>
          <div>
            <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Category</label>
            <input v-model="newPattern.category" type="text" placeholder="Pattern category" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" :class="isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'" />
          </div>
          <div class="flex items-center gap-2 pt-4 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
            <button @click="addPattern" :disabled="!newPattern.name" class="px-4 py-2 rounded-lg font-medium transition-colors flex-1" :class="newPattern.name ? (isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white') : (isDarkMode ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')">Add Pattern</button>
            <button @click="showAddPatternModal = false" class="px-4 py-2 rounded-lg font-medium transition-colors" :class="isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'">Cancel</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Icon Modal -->
    <div
      v-if="showAddIconModal && workspace"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      @click.self="showAddIconModal = false"
    >
      <div 
        class="rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
        :class="isDarkMode ? 'bg-slate-800' : 'bg-white'"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
            <span class="material-symbols-outlined text-indigo-600 text-2xl">image</span>
            Add Icon
          </h3>
          <button @click="showAddIconModal = false" class="text-gray-400 hover:text-gray-600">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Name *</label>
            <input v-model="newIcon.name" type="text" placeholder="Icon name" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" :class="isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'" />
          </div>
          <div>
            <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">SVG</label>
            <textarea v-model="newIcon.svg" rows="4" placeholder="SVG code" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono text-xs" :class="isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'"></textarea>
          </div>
          <div class="flex items-center gap-2 pt-4 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
            <button @click="addIcon" :disabled="!newIcon.name" class="px-4 py-2 rounded-lg font-medium transition-colors flex-1" :class="newIcon.name ? (isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white') : (isDarkMode ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')">Add Icon</button>
            <button @click="showAddIconModal = false" class="px-4 py-2 rounded-lg font-medium transition-colors" :class="isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'">Cancel</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Interactive Modal -->
    <div
      v-if="showAddInteractiveModal && workspace"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      @click.self="showAddInteractiveModal = false"
    >
      <div 
        class="rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
        :class="isDarkMode ? 'bg-slate-800' : 'bg-white'"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
            <span class="material-symbols-outlined text-indigo-600 text-2xl">interactive_space</span>
            Add Interactive
          </h3>
          <button @click="showAddInteractiveModal = false" class="text-gray-400 hover:text-gray-600">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Name *</label>
            <input v-model="newInteractive.name" type="text" placeholder="Interactive name" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" :class="isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'" />
          </div>
          <div>
            <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">URL</label>
            <input v-model="newInteractive.url" type="url" placeholder="https://..." class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" :class="isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'" />
          </div>
          <div class="flex items-center gap-2 pt-4 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
            <button @click="addInteractive" :disabled="!newInteractive.name" class="px-4 py-2 rounded-lg font-medium transition-colors flex-1" :class="newInteractive.name ? (isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white') : (isDarkMode ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')">Add Interactive</button>
            <button @click="showAddInteractiveModal = false" class="px-4 py-2 rounded-lg font-medium transition-colors" :class="isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'">Cancel</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Stock Photo Modal -->
    <div
      v-if="showAddStockPhotoModal && workspace"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      @click.self="showAddStockPhotoModal = false"
    >
      <div 
        class="rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
        :class="isDarkMode ? 'bg-slate-800' : 'bg-white'"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
            <span class="material-symbols-outlined text-indigo-600 text-2xl">photo_library</span>
            Add Stock Photo
          </h3>
          <button @click="showAddStockPhotoModal = false" class="text-gray-400 hover:text-gray-600">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Name *</label>
            <input v-model="newStockPhoto.name" type="text" placeholder="Photo name" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" :class="isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'" />
          </div>
          <div>
            <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">URL *</label>
            <input v-model="newStockPhoto.url" type="url" placeholder="https://..." class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" :class="isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'" />
          </div>
          <div class="flex items-center gap-2 pt-4 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
            <button @click="addStockPhoto" :disabled="!newStockPhoto.name || !newStockPhoto.url" class="px-4 py-2 rounded-lg font-medium transition-colors flex-1" :class="newStockPhoto.name && newStockPhoto.url ? (isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white') : (isDarkMode ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')">Add Stock Photo</button>
            <button @click="showAddStockPhotoModal = false" class="px-4 py-2 rounded-lg font-medium transition-colors" :class="isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'">Cancel</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Illustration Modal -->
    <div
      v-if="showAddIllustrationModal && workspace"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      @click.self="showAddIllustrationModal = false"
    >
      <div 
        class="rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
        :class="isDarkMode ? 'bg-slate-800' : 'bg-white'"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
            <span class="material-symbols-outlined text-indigo-600 text-2xl">draw</span>
            Add Illustration
          </h3>
          <button @click="showAddIllustrationModal = false" class="text-gray-400 hover:text-gray-600">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Name *</label>
            <input v-model="newIllustration.name" type="text" placeholder="Illustration name" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" :class="isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'" />
          </div>
          <div>
            <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">URL *</label>
            <input v-model="newIllustration.url" type="url" placeholder="https://..." class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" :class="isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'" />
          </div>
          <div class="flex items-center gap-2 pt-4 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
            <button @click="addIllustration" :disabled="!newIllustration.name || !newIllustration.url" class="px-4 py-2 rounded-lg font-medium transition-colors flex-1" :class="newIllustration.name && newIllustration.url ? (isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white') : (isDarkMode ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')">Add Illustration</button>
            <button @click="showAddIllustrationModal = false" class="px-4 py-2 rounded-lg font-medium transition-colors" :class="isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'">Cancel</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Capability Logo Modal -->
    <div
      v-if="showAddCapabilityLogoModal && workspace"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      @click.self="showAddCapabilityLogoModal = false"
    >
      <div 
        class="rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
        :class="isDarkMode ? 'bg-slate-800' : 'bg-white'"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
            <span class="material-symbols-outlined text-indigo-600 text-2xl">workspace_premium</span>
            Add Capability Logo
          </h3>
          <button @click="showAddCapabilityLogoModal = false" class="text-gray-400 hover:text-gray-600">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Name *</label>
            <input v-model="newCapabilityLogo.name" type="text" placeholder="Logo name" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" :class="isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'" />
          </div>
          <div>
            <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">URL *</label>
            <input v-model="newCapabilityLogo.url" type="url" placeholder="https://..." class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" :class="isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'" />
          </div>
          <div class="flex items-center gap-2 pt-4 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
            <button @click="addCapabilityLogo" :disabled="!newCapabilityLogo.name || !newCapabilityLogo.url" class="px-4 py-2 rounded-lg font-medium transition-colors flex-1" :class="newCapabilityLogo.name && newCapabilityLogo.url ? (isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white') : (isDarkMode ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')">Add Capability Logo</button>
            <button @click="showAddCapabilityLogoModal = false" class="px-4 py-2 rounded-lg font-medium transition-colors" :class="isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'">Cancel</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Style Dictionary Modal -->
    <div
      v-if="showAddStyleDictionaryModal && workspace"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      @click.self="showAddStyleDictionaryModal = false"
    >
      <div 
        class="rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
        :class="isDarkMode ? 'bg-slate-800' : 'bg-white'"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
            <span class="material-symbols-outlined text-indigo-600 text-2xl">book</span>
            Add Style Dictionary
          </h3>
          <button @click="showAddStyleDictionaryModal = false" class="text-gray-400 hover:text-gray-600">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Name *</label>
            <input v-model="newStyleDictionary.name" type="text" placeholder="Style dictionary name" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" :class="isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'" />
          </div>
          <div>
            <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Format</label>
            <input v-model="newStyleDictionary.format" type="text" placeholder="e.g., style-dictionary" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" :class="isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'" />
          </div>
          <div class="flex items-center gap-2 pt-4 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
            <button @click="addStyleDictionary" :disabled="!newStyleDictionary.name" class="px-4 py-2 rounded-lg font-medium transition-colors flex-1" :class="newStyleDictionary.name ? (isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white') : (isDarkMode ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')">Add Style Dictionary</button>
            <button @click="showAddStyleDictionaryModal = false" class="px-4 py-2 rounded-lg font-medium transition-colors" :class="isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'">Cancel</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Guideline Modal -->
    <div
      v-if="showAddGuidelineModal && workspace"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      @click.self="showAddGuidelineModal = false"
    >
      <div 
        class="rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
        :class="isDarkMode ? 'bg-slate-800' : 'bg-white'"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
            <span class="material-symbols-outlined text-indigo-600 text-2xl">rule</span>
            Add Guideline
          </h3>
          <button @click="showAddGuidelineModal = false" class="text-gray-400 hover:text-gray-600">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Title *</label>
            <input v-model="newGuideline.title" type="text" placeholder="Guideline title" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" :class="isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'" />
          </div>
          <div>
            <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Category</label>
            <input v-model="newGuideline.category" type="text" placeholder="Guideline category" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" :class="isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'" />
          </div>
          <div class="flex items-center gap-2 pt-4 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
            <button @click="addGuideline" :disabled="!newGuideline.title" class="px-4 py-2 rounded-lg font-medium transition-colors flex-1" :class="newGuideline.title ? (isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white') : (isDarkMode ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')">Add Guideline</button>
            <button @click="showAddGuidelineModal = false" class="px-4 py-2 rounded-lg font-medium transition-colors" :class="isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import Dropdown from '../components/Dropdown.vue';
import axios from 'axios';

const router = useRouter();
const route = useRoute();
const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const workspace = ref(null);
const loading = ref(true);
const activeTab = ref('overview');
const workspaceComponents = ref([]);
const workspaceAnalytics = ref(null);
const workspaceFonts = ref([]);
const workspaceAssets = ref([]);
const workspaceTokens = ref([]);
const workspaceReviews = ref([]);
const workspaceSessionReplays = ref([]);
const workspaceJourneyMaps = ref([]);
const workspaceHcdReports = ref([]);
const workspaceUserPersonas = ref([]);
const workspaceResearchArtifacts = ref([]);
const workspaceInsights = ref([]);
const workspacePatterns = ref([]);
const workspaceIcons = ref([]);
const workspaceInteractives = ref([]);
const workspaceStockPhotos = ref([]);
const workspaceIllustrations = ref([]);
const workspaceCapabilityLogos = ref([]);
const workspaceStyleDictionaries = ref([]);
const workspaceGuidelines = ref([]);
const showAddMemberModal = ref(false);
const newMember = ref({ email: '', role: 'viewer' });
const addingMember = ref(false);
const shareComponentModal = ref(false);
const sharingComponent = ref(null);
const selectedWorkspacesForSharing = ref([]);
const showAddFontModal = ref(false);
const showAddAssetModal = ref(false);
const showAddTokenModal = ref(false);
const showAddReviewModal = ref(false);
const showAddSessionReplayModal = ref(false);
const showAddJourneyMapModal = ref(false);
const showAddHcdReportModal = ref(false);
const showAddUserPersonaModal = ref(false);
const showAddResearchArtifactModal = ref(false);
const showAddInsightModal = ref(false);
const showAddPatternModal = ref(false);
const showAddIconModal = ref(false);
const showAddInteractiveModal = ref(false);
const showAddStockPhotoModal = ref(false);
const showAddIllustrationModal = ref(false);
const showAddCapabilityLogoModal = ref(false);
const showAddStyleDictionaryModal = ref(false);
const showAddGuidelineModal = ref(false);
const newFont = ref({ name: '', family: '', weights: [], styles: [], source: 'google', url: '', fallback: '' });
const newAsset = ref({ name: '', type: 'image', url: '', description: '', tags: [] });
const newToken = ref({ name: '', value: '', type: 'color', category: 'colors', description: '', tags: [] });
const newReview = ref({ title: '', description: '', status: 'draft', tags: [] });
const newSessionReplay = ref({ name: '', description: '', url: '', tags: [] });
const newJourneyMap = ref({ title: '', description: '', persona: '', tags: [] });
const newHcdReport = ref({ title: '', description: '', type: '', tags: [] });
const newUserPersona = ref({ name: '', description: '', demographics: {}, tags: [] });
const newResearchArtifact = ref({ title: '', description: '', type: '', tags: [] });
const newInsight = ref({ title: '', description: '', category: '', tags: [] });
const newPattern = ref({ name: '', description: '', category: '', tags: [] });
const newIcon = ref({ name: '', description: '', svg: '', tags: [] });
const newInteractive = ref({ name: '', description: '', url: '', tags: [] });
const newStockPhoto = ref({ name: '', description: '', url: '', tags: [] });
const newIllustration = ref({ name: '', description: '', url: '', tags: [] });
const newCapabilityLogo = ref({ name: '', description: '', url: '', tags: [] });
const newStyleDictionary = ref({ name: '', description: '', format: 'style-dictionary', tags: [] });
const newGuideline = ref({ title: '', description: '', category: '', tags: [] });
const sharing = ref(false);

const API_BASE_URL = 'http://localhost:3000/api/v1';
const API_KEY = 'test-api-key-123';
const CURRENT_USER_ID = 'user-123';
const CURRENT_USER_EMAIL = 'user@example.com';

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

const loadWorkspace = async () => {
  const workspaceId = route.params.id;
  if (!workspaceId) {
    router.push('/admin/workspaces');
    return;
  }

  try {
    loading.value = true;
    const response = await axios.get(`${API_BASE_URL}/workspaces/${workspaceId}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    workspace.value = response.data;
    
    await Promise.all([
      loadWorkspaceAnalytics(workspaceId),
      loadWorkspaceComponents(workspaceId),
      loadWorkspaceFonts(workspaceId),
      loadWorkspaceAssets(workspaceId),
      loadWorkspaceTokens(workspaceId),
      loadWorkspaceReviews(workspaceId),
      loadWorkspaceSessionReplays(workspaceId),
      loadWorkspaceJourneyMaps(workspaceId),
      loadWorkspaceHcdReports(workspaceId),
      loadWorkspaceUserPersonas(workspaceId),
      loadWorkspaceResearchArtifacts(workspaceId),
      loadWorkspaceInsights(workspaceId),
      loadWorkspacePatterns(workspaceId),
      loadWorkspaceIcons(workspaceId),
      loadWorkspaceInteractives(workspaceId),
      loadWorkspaceStockPhotos(workspaceId),
      loadWorkspaceIllustrations(workspaceId),
      loadWorkspaceCapabilityLogos(workspaceId),
      loadWorkspaceStyleDictionaries(workspaceId),
      loadWorkspaceGuidelines(workspaceId),
    ]);
  } catch (error) {
    console.error('Failed to load workspace:', error);
    workspace.value = {
      id: workspaceId,
      name: 'Workspace',
      description: 'Workspace description',
      slug: 'workspace',
      createdAt: new Date(),
      updatedAt: new Date(),
      ownerId: CURRENT_USER_ID,
      members: [
        { userId: CURRENT_USER_ID, email: CURRENT_USER_EMAIL, role: 'owner', addedAt: new Date(), addedBy: CURRENT_USER_ID },
      ],
      settings: {
        allowExternalSharing: true,
        requireApprovalForSharing: false,
      },
    };
  } finally {
    loading.value = false;
  }
};

const loadWorkspaceAnalytics = async (workspaceId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/workspaces/${workspaceId}/analytics`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    workspaceAnalytics.value = response.data;
  } catch (error) {
    console.error(`Failed to load analytics for workspace ${workspaceId}:`, error);
    workspaceAnalytics.value = {
      totalComponents: Math.floor(Math.random() * 20) + 5,
      componentsByStatus: {
        production: Math.floor(Math.random() * 10) + 3,
        'in-progress': Math.floor(Math.random() * 5) + 1,
        planned: Math.floor(Math.random() * 3),
        deprecated: Math.floor(Math.random() * 2),
      },
      totalApplications: Math.floor(Math.random() * 5) + 1,
      adoptionRate: Math.floor(Math.random() * 20) + 75,
      designDebt: Math.floor(Math.random() * 3),
      mostUsedComponents: [],
      healthScore: Math.floor(Math.random() * 20) + 75,
    };
  }
};

const loadWorkspaceComponents = async (workspaceId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/workspaces/${workspaceId}/components?userId=${CURRENT_USER_ID}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    workspaceComponents.value = response.data.components || [];
  } catch (error) {
    console.error(`Failed to load components for workspace ${workspaceId}:`, error);
    workspaceComponents.value = [];
  }
};

const loadWorkspaceFonts = async (workspaceId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/workspaces/${workspaceId}/fonts?userId=${CURRENT_USER_ID}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    workspaceFonts.value = response.data || [];
  } catch (error) {
    console.error(`Failed to load fonts for workspace ${workspaceId}:`, error);
    workspaceFonts.value = [];
  }
};

const loadWorkspaceAssets = async (workspaceId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/workspaces/${workspaceId}/assets?userId=${CURRENT_USER_ID}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    workspaceAssets.value = response.data || [];
  } catch (error) {
    console.error(`Failed to load assets for workspace ${workspaceId}:`, error);
    workspaceAssets.value = [];
  }
};

const loadWorkspaceTokens = async (workspaceId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/workspaces/${workspaceId}/tokens?userId=${CURRENT_USER_ID}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    workspaceTokens.value = response.data || [];
  } catch (error) {
    console.error(`Failed to load tokens for workspace ${workspaceId}:`, error);
    workspaceTokens.value = [];
  }
};

const loadWorkspaceReviews = async (workspaceId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/workspaces/${workspaceId}/reviews?userId=${CURRENT_USER_ID}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    workspaceReviews.value = response.data || [];
  } catch (error) {
    console.error(`Failed to load reviews for workspace ${workspaceId}:`, error);
    workspaceReviews.value = [];
  }
};

const loadWorkspaceSessionReplays = async (workspaceId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/workspaces/${workspaceId}/session-replays?userId=${CURRENT_USER_ID}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    workspaceSessionReplays.value = response.data || [];
  } catch (error) {
    console.error(`Failed to load session replays for workspace ${workspaceId}:`, error);
    workspaceSessionReplays.value = [];
  }
};

const loadWorkspaceJourneyMaps = async (workspaceId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/workspaces/${workspaceId}/journey-maps?userId=${CURRENT_USER_ID}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    workspaceJourneyMaps.value = response.data || [];
  } catch (error) {
    console.error(`Failed to load journey maps for workspace ${workspaceId}:`, error);
    workspaceJourneyMaps.value = [];
  }
};

const loadWorkspaceHcdReports = async (workspaceId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/workspaces/${workspaceId}/hcd-reports?userId=${CURRENT_USER_ID}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    workspaceHcdReports.value = response.data || [];
  } catch (error) {
    console.error(`Failed to load HCD reports for workspace ${workspaceId}:`, error);
    workspaceHcdReports.value = [];
  }
};

const loadWorkspaceUserPersonas = async (workspaceId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/workspaces/${workspaceId}/user-personas?userId=${CURRENT_USER_ID}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    workspaceUserPersonas.value = response.data || [];
  } catch (error) {
    console.error(`Failed to load user personas for workspace ${workspaceId}:`, error);
    workspaceUserPersonas.value = [];
  }
};

const loadWorkspaceResearchArtifacts = async (workspaceId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/workspaces/${workspaceId}/research-artifacts?userId=${CURRENT_USER_ID}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    workspaceResearchArtifacts.value = response.data || [];
  } catch (error) {
    console.error(`Failed to load research artifacts for workspace ${workspaceId}:`, error);
    workspaceResearchArtifacts.value = [];
  }
};

const loadWorkspaceInsights = async (workspaceId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/workspaces/${workspaceId}/insights?userId=${CURRENT_USER_ID}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    workspaceInsights.value = response.data || [];
  } catch (error) {
    console.error(`Failed to load insights for workspace ${workspaceId}:`, error);
    workspaceInsights.value = [];
  }
};

const loadWorkspacePatterns = async (workspaceId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/workspaces/${workspaceId}/patterns?userId=${CURRENT_USER_ID}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    workspacePatterns.value = response.data || [];
  } catch (error) {
    console.error(`Failed to load patterns for workspace ${workspaceId}:`, error);
    workspacePatterns.value = [];
  }
};

const loadWorkspaceIcons = async (workspaceId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/workspaces/${workspaceId}/icons?userId=${CURRENT_USER_ID}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    workspaceIcons.value = response.data || [];
  } catch (error) {
    console.error(`Failed to load icons for workspace ${workspaceId}:`, error);
    workspaceIcons.value = [];
  }
};

const loadWorkspaceInteractives = async (workspaceId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/workspaces/${workspaceId}/interactives?userId=${CURRENT_USER_ID}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    workspaceInteractives.value = response.data || [];
  } catch (error) {
    console.error(`Failed to load interactives for workspace ${workspaceId}:`, error);
    workspaceInteractives.value = [];
  }
};

const loadWorkspaceStockPhotos = async (workspaceId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/workspaces/${workspaceId}/stock-photos?userId=${CURRENT_USER_ID}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    workspaceStockPhotos.value = response.data || [];
  } catch (error) {
    console.error(`Failed to load stock photos for workspace ${workspaceId}:`, error);
    workspaceStockPhotos.value = [];
  }
};

const loadWorkspaceIllustrations = async (workspaceId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/workspaces/${workspaceId}/illustrations?userId=${CURRENT_USER_ID}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    workspaceIllustrations.value = response.data || [];
  } catch (error) {
    console.error(`Failed to load illustrations for workspace ${workspaceId}:`, error);
    workspaceIllustrations.value = [];
  }
};

const loadWorkspaceCapabilityLogos = async (workspaceId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/workspaces/${workspaceId}/capability-logos?userId=${CURRENT_USER_ID}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    workspaceCapabilityLogos.value = response.data || [];
  } catch (error) {
    console.error(`Failed to load capability logos for workspace ${workspaceId}:`, error);
    workspaceCapabilityLogos.value = [];
  }
};

const loadWorkspaceStyleDictionaries = async (workspaceId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/workspaces/${workspaceId}/style-dictionaries?userId=${CURRENT_USER_ID}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    workspaceStyleDictionaries.value = response.data || [];
  } catch (error) {
    console.error(`Failed to load style dictionaries for workspace ${workspaceId}:`, error);
    workspaceStyleDictionaries.value = [];
  }
};

const loadWorkspaceGuidelines = async (workspaceId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/workspaces/${workspaceId}/guidelines?userId=${CURRENT_USER_ID}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    workspaceGuidelines.value = response.data || [];
  } catch (error) {
    console.error(`Failed to load guidelines for workspace ${workspaceId}:`, error);
    workspaceGuidelines.value = [];
  }
};

const addMember = async () => {
  if (!newMember.value.email || !workspace.value) return;

  try {
    addingMember.value = true;
    const response = await axios.post(`${API_BASE_URL}/workspaces/${workspace.value.id}/members`, {
      userId: `user-${Date.now()}`,
      email: newMember.value.email,
      role: newMember.value.role,
      addedBy: CURRENT_USER_ID,
    }, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    
    workspace.value = response.data;
    showAddMemberModal.value = false;
    resetAddMemberForm();
  } catch (error) {
    console.error('Failed to add member:', error);
    alert('Failed to add member. Please try again.');
  } finally {
    addingMember.value = false;
  }
};

const resetAddMemberForm = () => {
  newMember.value = { email: '', role: 'viewer' };
};

const removeMember = async (userId) => {
  if (!workspace.value) return;
  if (!confirm('Are you sure you want to remove this member?')) return;

  try {
    const response = await axios.delete(`${API_BASE_URL}/workspaces/${workspace.value.id}/members/${userId}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    
    workspace.value = response.data;
  } catch (error) {
    console.error('Failed to remove member:', error);
    alert('Failed to remove member. Please try again.');
  }
};

const updateMemberRole = async (userId, role) => {
  if (!workspace.value) return;

  try {
    const response = await axios.patch(`${API_BASE_URL}/workspaces/${workspace.value.id}/members/${userId}/role`, {
      role,
    }, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    
    workspace.value = response.data;
  } catch (error) {
    console.error('Failed to update member role:', error);
    alert('Failed to update member role. Please try again.');
  }
};

const updateWorkspaceSetting = async (setting, value) => {
  if (!workspace.value) return;

  try {
    const response = await axios.put(`${API_BASE_URL}/workspaces/${workspace.value.id}`, {
      settings: {
        ...workspace.value.settings,
        [setting]: value,
      },
    }, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    
    workspace.value = response.data;
  } catch (error) {
    console.error('Failed to update workspace setting:', error);
    alert('Failed to update setting. Please try again.');
  }
};

const shareComponent = (component) => {
  sharingComponent.value = component.id;
  shareComponentModal.value = true;
  selectedWorkspacesForSharing.value = component.sharedWith || [];
};

const shareComponentWithWorkspaces = async () => {
  if (!sharingComponent.value || !workspace.value || selectedWorkspacesForSharing.value.length === 0) return;

  try {
    sharing.value = true;
    await axios.post(`${API_BASE_URL}/components/${sharingComponent.value}/share`, {
      workspaceIds: selectedWorkspacesForSharing.value,
      requestingWorkspaceId: workspace.value.id,
    }, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    
    await loadWorkspaceComponents(workspace.value.id);
    shareComponentModal.value = false;
    sharingComponent.value = null;
    selectedWorkspacesForSharing.value = [];
  } catch (error) {
    console.error('Failed to share component:', error);
    alert('Failed to share component. Please try again.');
  } finally {
    sharing.value = false;
  }
};

const makeGlobal = async (component) => {
  if (!workspace.value) return;
  if (!confirm('Make this component available to all workspaces? This action cannot be undone.')) return;

  try {
    await axios.post(`${API_BASE_URL}/components/${component.id}/make-global`, {
      requestingWorkspaceId: workspace.value.id,
    }, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    
    await loadWorkspaceComponents(workspace.value.id);
  } catch (error) {
    console.error('Failed to make component global:', error);
    alert('Failed to make component global. Please try again.');
  }
};

const addFont = async () => {
  if (!newFont.value.name || !newFont.value.family || !workspace.value) return;

  try {
    await axios.post(`${API_BASE_URL}/workspaces/${workspace.value.id}/fonts`, {
      ...newFont.value,
      createdBy: CURRENT_USER_ID,
    }, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    
    await loadWorkspaceFonts(workspace.value.id);
    showAddFontModal.value = false;
    newFont.value = { name: '', family: '', weights: [], styles: [], source: 'google', url: '', fallback: '' };
  } catch (error) {
    console.error('Failed to add font:', error);
    alert('Failed to add font. Please try again.');
  }
};

const deleteFont = async (fontId) => {
  if (!workspace.value || !confirm('Delete this font?')) return;

  try {
    await axios.delete(`${API_BASE_URL}/workspaces/${workspace.value.id}/fonts/${fontId}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    
    await loadWorkspaceFonts(workspace.value.id);
  } catch (error) {
    console.error('Failed to delete font:', error);
    alert('Failed to delete font. Please try again.');
  }
};

const shareFont = (font) => {
  sharingComponent.value = font.id;
  shareComponentModal.value = true;
  selectedWorkspacesForSharing.value = font.sharedWith || [];
};

const makeFontGlobal = async (font) => {
  if (!workspace.value || !confirm('Make this font available to all workspaces?')) return;

  try {
    await axios.post(`${API_BASE_URL}/workspaces/${workspace.value.id}/fonts/${font.id}/make-global`, {
      requestingWorkspaceId: workspace.value.id,
    }, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    
    await loadWorkspaceFonts(workspace.value.id);
  } catch (error) {
    console.error('Failed to make font global:', error);
    alert('Failed to make font global. Please try again.');
  }
};

const addAsset = async () => {
  if (!newAsset.value.name || !newAsset.value.url || !workspace.value) return;

  try {
    await axios.post(`${API_BASE_URL}/workspaces/${workspace.value.id}/assets`, {
      ...newAsset.value,
      createdBy: CURRENT_USER_ID,
    }, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    
    await loadWorkspaceAssets(workspace.value.id);
    showAddAssetModal.value = false;
    newAsset.value = { name: '', type: 'image', url: '', description: '', tags: [] };
  } catch (error) {
    console.error('Failed to add asset:', error);
    alert('Failed to add asset. Please try again.');
  }
};

const deleteAsset = async (assetId) => {
  if (!workspace.value || !confirm('Delete this asset?')) return;

  try {
    await axios.delete(`${API_BASE_URL}/workspaces/${workspace.value.id}/assets/${assetId}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    
    await loadWorkspaceAssets(workspace.value.id);
  } catch (error) {
    console.error('Failed to delete asset:', error);
    alert('Failed to delete asset. Please try again.');
  }
};

const shareAsset = (asset) => {
  sharingComponent.value = asset.id;
  shareComponentModal.value = true;
  selectedWorkspacesForSharing.value = asset.sharedWith || [];
};

const makeAssetGlobal = async (asset) => {
  if (!workspace.value || !confirm('Make this asset available to all workspaces?')) return;

  try {
    await axios.post(`${API_BASE_URL}/workspaces/${workspace.value.id}/assets/${asset.id}/make-global`, {
      requestingWorkspaceId: workspace.value.id,
    }, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    
    await loadWorkspaceAssets(workspace.value.id);
  } catch (error) {
    console.error('Failed to make asset global:', error);
    alert('Failed to make asset global. Please try again.');
  }
};

const addToken = async () => {
  if (!newToken.value.name || !newToken.value.value || !workspace.value) return;

  try {
    await axios.post(`${API_BASE_URL}/workspaces/${workspace.value.id}/tokens`, {
      ...newToken.value,
      createdBy: CURRENT_USER_ID,
    }, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    
    await loadWorkspaceTokens(workspace.value.id);
    showAddTokenModal.value = false;
    newToken.value = { name: '', value: '', type: 'color', category: 'colors', description: '', tags: [] };
  } catch (error) {
    console.error('Failed to add token:', error);
    alert('Failed to add token. Please try again.');
  }
};

const deleteToken = async (tokenId) => {
  if (!workspace.value || !confirm('Delete this token?')) return;

  try {
    await axios.delete(`${API_BASE_URL}/workspaces/${workspace.value.id}/tokens/${tokenId}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    
    await loadWorkspaceTokens(workspace.value.id);
  } catch (error) {
    console.error('Failed to delete token:', error);
    alert('Failed to delete token. Please try again.');
  }
};

const shareToken = (token) => {
  sharingComponent.value = token.id;
  shareComponentModal.value = true;
  selectedWorkspacesForSharing.value = token.sharedWith || [];
};

const makeTokenGlobal = async (token) => {
  if (!workspace.value || !confirm('Make this token available to all workspaces?')) return;

  try {
    await axios.post(`${API_BASE_URL}/workspaces/${workspace.value.id}/tokens/${token.id}/make-global`, {
      requestingWorkspaceId: workspace.value.id,
    }, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    
    await loadWorkspaceTokens(workspace.value.id);
  } catch (error) {
    console.error('Failed to make token global:', error);
    alert('Failed to make token global. Please try again.');
  }
};

// Generic resource helper functions
const shareResource = (resourceType, resource) => {
  sharingComponent.value = resource.id;
  shareComponentModal.value = true;
  selectedWorkspacesForSharing.value = resource.sharedWith || [];
};

const makeResourceGlobal = async (resourceType, resource) => {
  if (!workspace.value || !confirm(`Make this ${resourceType.replace('-', ' ')} available to all workspaces?`)) return;

  try {
    await axios.post(`${API_BASE_URL}/workspaces/${workspace.value.id}/${resourceType}/${resource.id}/make-global`, {
      requestingWorkspaceId: workspace.value.id,
    }, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    
    // Reload the appropriate resource list
    const loadFunctions = {
      'reviews': loadWorkspaceReviews,
      'session-replays': loadWorkspaceSessionReplays,
      'journey-maps': loadWorkspaceJourneyMaps,
      'hcd-reports': loadWorkspaceHcdReports,
      'user-personas': loadWorkspaceUserPersonas,
      'research-artifacts': loadWorkspaceResearchArtifacts,
      'insights': loadWorkspaceInsights,
      'patterns': loadWorkspacePatterns,
      'icons': loadWorkspaceIcons,
      'interactives': loadWorkspaceInteractives,
      'stock-photos': loadWorkspaceStockPhotos,
      'illustrations': loadWorkspaceIllustrations,
      'capability-logos': loadWorkspaceCapabilityLogos,
      'style-dictionaries': loadWorkspaceStyleDictionaries,
      'guidelines': loadWorkspaceGuidelines,
    };
    
    if (loadFunctions[resourceType]) {
      await loadFunctions[resourceType](workspace.value.id);
    }
  } catch (error) {
    console.error(`Failed to make ${resourceType} global:`, error);
    alert(`Failed to make ${resourceType.replace('-', ' ')} global. Please try again.`);
  }
};

const deleteResource = async (resourceType, resourceId) => {
  if (!workspace.value || !confirm(`Delete this ${resourceType.replace('-', ' ')}?`)) return;

  try {
    await axios.delete(`${API_BASE_URL}/workspaces/${workspace.value.id}/${resourceType}/${resourceId}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    
    // Reload the appropriate resource list
    const loadFunctions = {
      'reviews': loadWorkspaceReviews,
      'session-replays': loadWorkspaceSessionReplays,
      'journey-maps': loadWorkspaceJourneyMaps,
      'hcd-reports': loadWorkspaceHcdReports,
      'user-personas': loadWorkspaceUserPersonas,
      'research-artifacts': loadWorkspaceResearchArtifacts,
      'insights': loadWorkspaceInsights,
      'patterns': loadWorkspacePatterns,
      'icons': loadWorkspaceIcons,
      'interactives': loadWorkspaceInteractives,
      'stock-photos': loadWorkspaceStockPhotos,
      'illustrations': loadWorkspaceIllustrations,
      'capability-logos': loadWorkspaceCapabilityLogos,
      'style-dictionaries': loadWorkspaceStyleDictionaries,
      'guidelines': loadWorkspaceGuidelines,
    };
    
    if (loadFunctions[resourceType]) {
      await loadFunctions[resourceType](workspace.value.id);
    }
  } catch (error) {
    console.error(`Failed to delete ${resourceType}:`, error);
    alert(`Failed to delete ${resourceType.replace('-', ' ')}. Please try again.`);
  }
};

// Add functions for each resource type
const addReview = async () => {
  if (!newReview.value.title || !workspace.value) return;
  try {
    await axios.post(`${API_BASE_URL}/workspaces/${workspace.value.id}/reviews`, {
      ...newReview.value,
      createdBy: CURRENT_USER_ID,
    }, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    await loadWorkspaceReviews(workspace.value.id);
    showAddReviewModal.value = false;
    newReview.value = { title: '', description: '', status: 'draft', tags: [] };
  } catch (error) {
    console.error('Failed to add review:', error);
    alert('Failed to add review. Please try again.');
  }
};

const addSessionReplay = async () => {
  if (!newSessionReplay.value.name || !workspace.value) return;
  try {
    await axios.post(`${API_BASE_URL}/workspaces/${workspace.value.id}/session-replays`, {
      ...newSessionReplay.value,
      createdBy: CURRENT_USER_ID,
    }, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    await loadWorkspaceSessionReplays(workspace.value.id);
    showAddSessionReplayModal.value = false;
    newSessionReplay.value = { name: '', description: '', url: '', tags: [] };
  } catch (error) {
    console.error('Failed to add session replay:', error);
    alert('Failed to add session replay. Please try again.');
  }
};

const addJourneyMap = async () => {
  if (!newJourneyMap.value.title || !workspace.value) return;
  try {
    await axios.post(`${API_BASE_URL}/workspaces/${workspace.value.id}/journey-maps`, {
      ...newJourneyMap.value,
      createdBy: CURRENT_USER_ID,
    }, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    await loadWorkspaceJourneyMaps(workspace.value.id);
    showAddJourneyMapModal.value = false;
    newJourneyMap.value = { title: '', description: '', persona: '', tags: [] };
  } catch (error) {
    console.error('Failed to add journey map:', error);
    alert('Failed to add journey map. Please try again.');
  }
};

const addHcdReport = async () => {
  if (!newHcdReport.value.title || !workspace.value) return;
  try {
    await axios.post(`${API_BASE_URL}/workspaces/${workspace.value.id}/hcd-reports`, {
      ...newHcdReport.value,
      createdBy: CURRENT_USER_ID,
    }, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    await loadWorkspaceHcdReports(workspace.value.id);
    showAddHcdReportModal.value = false;
    newHcdReport.value = { title: '', description: '', type: '', tags: [] };
  } catch (error) {
    console.error('Failed to add HCD report:', error);
    alert('Failed to add HCD report. Please try again.');
  }
};

const addUserPersona = async () => {
  if (!newUserPersona.value.name || !workspace.value) return;
  try {
    await axios.post(`${API_BASE_URL}/workspaces/${workspace.value.id}/user-personas`, {
      ...newUserPersona.value,
      createdBy: CURRENT_USER_ID,
    }, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    await loadWorkspaceUserPersonas(workspace.value.id);
    showAddUserPersonaModal.value = false;
    newUserPersona.value = { name: '', description: '', demographics: {}, tags: [] };
  } catch (error) {
    console.error('Failed to add user persona:', error);
    alert('Failed to add user persona. Please try again.');
  }
};

const addResearchArtifact = async () => {
  if (!newResearchArtifact.value.title || !workspace.value) return;
  try {
    await axios.post(`${API_BASE_URL}/workspaces/${workspace.value.id}/research-artifacts`, {
      ...newResearchArtifact.value,
      createdBy: CURRENT_USER_ID,
    }, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    await loadWorkspaceResearchArtifacts(workspace.value.id);
    showAddResearchArtifactModal.value = false;
    newResearchArtifact.value = { title: '', description: '', type: '', tags: [] };
  } catch (error) {
    console.error('Failed to add research artifact:', error);
    alert('Failed to add research artifact. Please try again.');
  }
};

const addInsight = async () => {
  if (!newInsight.value.title || !workspace.value) return;
  try {
    await axios.post(`${API_BASE_URL}/workspaces/${workspace.value.id}/insights`, {
      ...newInsight.value,
      createdBy: CURRENT_USER_ID,
    }, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    await loadWorkspaceInsights(workspace.value.id);
    showAddInsightModal.value = false;
    newInsight.value = { title: '', description: '', category: '', tags: [] };
  } catch (error) {
    console.error('Failed to add insight:', error);
    alert('Failed to add insight. Please try again.');
  }
};

const addPattern = async () => {
  if (!newPattern.value.name || !workspace.value) return;
  try {
    await axios.post(`${API_BASE_URL}/workspaces/${workspace.value.id}/patterns`, {
      ...newPattern.value,
      createdBy: CURRENT_USER_ID,
    }, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    await loadWorkspacePatterns(workspace.value.id);
    showAddPatternModal.value = false;
    newPattern.value = { name: '', description: '', category: '', tags: [] };
  } catch (error) {
    console.error('Failed to add pattern:', error);
    alert('Failed to add pattern. Please try again.');
  }
};

const addIcon = async () => {
  if (!newIcon.value.name || !workspace.value) return;
  try {
    await axios.post(`${API_BASE_URL}/workspaces/${workspace.value.id}/icons`, {
      ...newIcon.value,
      createdBy: CURRENT_USER_ID,
    }, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    await loadWorkspaceIcons(workspace.value.id);
    showAddIconModal.value = false;
    newIcon.value = { name: '', description: '', svg: '', tags: [] };
  } catch (error) {
    console.error('Failed to add icon:', error);
    alert('Failed to add icon. Please try again.');
  }
};

const addInteractive = async () => {
  if (!newInteractive.value.name || !workspace.value) return;
  try {
    await axios.post(`${API_BASE_URL}/workspaces/${workspace.value.id}/interactives`, {
      ...newInteractive.value,
      createdBy: CURRENT_USER_ID,
    }, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    await loadWorkspaceInteractives(workspace.value.id);
    showAddInteractiveModal.value = false;
    newInteractive.value = { name: '', description: '', url: '', tags: [] };
  } catch (error) {
    console.error('Failed to add interactive:', error);
    alert('Failed to add interactive. Please try again.');
  }
};

const addStockPhoto = async () => {
  if (!newStockPhoto.value.name || !workspace.value) return;
  try {
    await axios.post(`${API_BASE_URL}/workspaces/${workspace.value.id}/stock-photos`, {
      ...newStockPhoto.value,
      createdBy: CURRENT_USER_ID,
    }, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    await loadWorkspaceStockPhotos(workspace.value.id);
    showAddStockPhotoModal.value = false;
    newStockPhoto.value = { name: '', description: '', url: '', tags: [] };
  } catch (error) {
    console.error('Failed to add stock photo:', error);
    alert('Failed to add stock photo. Please try again.');
  }
};

const addIllustration = async () => {
  if (!newIllustration.value.name || !workspace.value) return;
  try {
    await axios.post(`${API_BASE_URL}/workspaces/${workspace.value.id}/illustrations`, {
      ...newIllustration.value,
      createdBy: CURRENT_USER_ID,
    }, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    await loadWorkspaceIllustrations(workspace.value.id);
    showAddIllustrationModal.value = false;
    newIllustration.value = { name: '', description: '', url: '', tags: [] };
  } catch (error) {
    console.error('Failed to add illustration:', error);
    alert('Failed to add illustration. Please try again.');
  }
};

const addCapabilityLogo = async () => {
  if (!newCapabilityLogo.value.name || !workspace.value) return;
  try {
    await axios.post(`${API_BASE_URL}/workspaces/${workspace.value.id}/capability-logos`, {
      ...newCapabilityLogo.value,
      createdBy: CURRENT_USER_ID,
    }, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    await loadWorkspaceCapabilityLogos(workspace.value.id);
    showAddCapabilityLogoModal.value = false;
    newCapabilityLogo.value = { name: '', description: '', url: '', tags: [] };
  } catch (error) {
    console.error('Failed to add capability logo:', error);
    alert('Failed to add capability logo. Please try again.');
  }
};

const addStyleDictionary = async () => {
  if (!newStyleDictionary.value.name || !workspace.value) return;
  try {
    await axios.post(`${API_BASE_URL}/workspaces/${workspace.value.id}/style-dictionaries`, {
      ...newStyleDictionary.value,
      createdBy: CURRENT_USER_ID,
    }, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    await loadWorkspaceStyleDictionaries(workspace.value.id);
    showAddStyleDictionaryModal.value = false;
    newStyleDictionary.value = { name: '', description: '', format: 'style-dictionary', tags: [] };
  } catch (error) {
    console.error('Failed to add style dictionary:', error);
    alert('Failed to add style dictionary. Please try again.');
  }
};

const addGuideline = async () => {
  if (!newGuideline.value.title || !workspace.value) return;
  try {
    await axios.post(`${API_BASE_URL}/workspaces/${workspace.value.id}/guidelines`, {
      ...newGuideline.value,
      createdBy: CURRENT_USER_ID,
    }, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    await loadWorkspaceGuidelines(workspace.value.id);
    showAddGuidelineModal.value = false;
    newGuideline.value = { title: '', description: '', category: '', tags: [] };
  } catch (error) {
    console.error('Failed to add guideline:', error);
    alert('Failed to add guideline. Please try again.');
  }
};

const getHealthScoreColor = (score) => {
  if (score >= 80) return isDarkMode.value ? 'text-green-400' : 'text-green-600';
  if (score >= 60) return isDarkMode.value ? 'text-yellow-400' : 'text-yellow-600';
  return isDarkMode.value ? 'text-red-400' : 'text-red-600';
};

const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString();
};

let darkModeObserver = null;

onMounted(() => {
  loadWorkspace();
  
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

