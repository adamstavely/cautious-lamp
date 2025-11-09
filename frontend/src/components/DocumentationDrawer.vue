<template>
  <!-- Drawer - slides in/out from left, positioned next to sidebar -->
  <!-- When closed, show a small toggle button -->
  <div 
    v-if="!isOpen" 
    class="fixed left-24 top-16 h-[calc(100vh-4rem)] w-12 border-r z-30 flex items-start justify-center pt-4 transition-all duration-300"
    :class="isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'"
  >
    <button
      @click="toggle"
      class="p-2 rounded-lg transition-colors"
      :class="isDarkMode ? 'text-gray-300 hover:text-white hover:bg-slate-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
      title="Open drawer"
    >
      <span class="material-symbols-outlined">menu</span>
    </button>
  </div>
  
  <!-- Drawer - when open -->
  <div 
    v-if="isOpen"
    class="fixed left-24 top-16 h-[calc(100vh-4rem)] w-64 shadow-xl overflow-y-auto z-30 border-r transition-transform duration-300 ease-in-out"
    :class="isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'"
  >
    <!-- Drawer Content -->
    <div class="p-6">
      <!-- Foundations - only show when not on patterns route -->
      <div v-if="showMainSections" class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold uppercase tracking-wider" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">Foundations</h3>
          <button
            @click="toggle"
            class="p-2 rounded-lg transition-colors"
            :class="isDarkMode ? 'text-gray-300 hover:text-white hover:bg-slate-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
            title="Close drawer"
          >
            <span class="material-symbols-outlined">left_panel_close</span>
          </button>
        </div>
        <nav class="space-y-1">
          <button
            v-for="item in filteredFoundations"
            :key="item.link"
            @click="navigateToDoc(item.link)"
            class="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors group w-full text-left"
            :class="isDarkMode 
              ? 'text-gray-300 hover:bg-slate-700 hover:text-white' 
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'"
          >
            <span class="material-symbols-outlined text-lg">{{ item.icon }}</span>
            <span class="font-medium">{{ item.text }}</span>
          </button>
        </nav>
      </div>
      
      <!-- Patterns - only show when on patterns route -->
      <div v-if="showPatterns" class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold uppercase tracking-wider" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">Patterns</h3>
          <button
            @click="toggle"
            class="p-2 rounded-lg transition-colors"
            :class="isDarkMode ? 'text-gray-300 hover:text-white hover:bg-slate-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
            title="Close drawer"
          >
            <span class="material-symbols-outlined">left_panel_close</span>
          </button>
        </div>
        <nav class="space-y-6">
          <!-- Design Patterns -->
          <div>
            <h4 class="text-xs font-semibold uppercase tracking-wider mb-2 px-4" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">Design Patterns</h4>
            <div class="space-y-1">
              <router-link
                v-for="item in filteredDesignPatterns"
                :key="item.link"
                :to="item.link"
                class="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors group w-full text-left"
                :class="[
                  isActive(item.link)
                    ? (isDarkMode 
                      ? 'text-indigo-400 bg-indigo-900/20' 
                      : 'text-indigo-600 bg-indigo-50')
                    : (isDarkMode
                      ? 'text-gray-300 hover:bg-slate-700 hover:text-white' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900')
                ]"
              >
                <span class="material-symbols-outlined text-lg">{{ item.icon }}</span>
                <span class="font-medium">{{ item.text }}</span>
              </router-link>
            </div>
          </div>

          <!-- Code Patterns -->
          <div>
            <h4 class="text-xs font-semibold uppercase tracking-wider mb-2 px-4" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">Code Patterns</h4>
            <div class="space-y-1">
              <router-link
                v-for="item in filteredCodePatterns"
                :key="item.link"
                :to="item.link"
                class="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors group w-full text-left"
                :class="[
                  isActive(item.link)
                    ? (isDarkMode 
                      ? 'text-indigo-400 bg-indigo-900/20' 
                      : 'text-indigo-600 bg-indigo-50')
                    : (isDarkMode
                      ? 'text-gray-300 hover:bg-slate-700 hover:text-white' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900')
                ]"
              >
                <span class="material-symbols-outlined text-lg">{{ item.icon }}</span>
                <span class="font-medium">{{ item.text }}</span>
              </router-link>
            </div>
          </div>
        </nav>
      </div>
      
      <!-- Components - only show when on components route -->
      <div v-if="showComponents" class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold uppercase tracking-wider" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">Components</h3>
          <button
            @click="toggle"
            class="p-2 rounded-lg transition-colors"
            :class="isDarkMode ? 'text-gray-300 hover:text-white hover:bg-slate-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
            title="Close drawer"
          >
            <span class="material-symbols-outlined">left_panel_close</span>
          </button>
        </div>
        <nav class="space-y-6">
          <!-- Overview -->
          <div>
            <h4 class="text-xs font-semibold uppercase tracking-wider mb-2 px-4" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">Overview</h4>
            <div class="space-y-1">
              <router-link
                to="/components"
                class="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors group w-full text-left"
                :class="[
                  isActive('/components')
                    ? (isDarkMode 
                      ? 'text-indigo-400 bg-indigo-900/20' 
                      : 'text-indigo-600 bg-indigo-50')
                    : (isDarkMode
                      ? 'text-gray-300 hover:bg-slate-700 hover:text-white' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900')
                ]"
              >
                <span class="material-symbols-outlined text-lg">widgets</span>
                <span class="font-medium">Overview</span>
              </router-link>
            </div>
          </div>

          <!-- Utilities -->
          <div>
            <h4 class="text-xs font-semibold uppercase tracking-wider mb-2 px-4" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">Utilities</h4>
            <div class="space-y-1">
              <router-link
                v-for="item in filteredComponentUtilities"
                :key="item.link"
                :to="item.link"
                class="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors group w-full text-left"
                :class="[
                  isActive(item.link)
                    ? (isDarkMode 
                      ? 'text-indigo-400 bg-indigo-900/20' 
                      : 'text-indigo-600 bg-indigo-50')
                    : (isDarkMode
                      ? 'text-gray-300 hover:bg-slate-700 hover:text-white' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900')
                ]"
              >
                <ScanEye v-if="item.icon === 'scan-eye'" :size="20" :stroke-width="2" />
                <span v-else class="material-symbols-outlined text-lg">{{ item.icon }}</span>
                <span class="font-medium">{{ item.text }}</span>
              </router-link>
            </div>
          </div>

          <!-- Components -->
          <div>
            <h4 class="text-xs font-semibold uppercase tracking-wider mb-2 px-4" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">Components</h4>
            <div class="space-y-1">
              <router-link
                v-for="item in filteredComponentItems"
                :key="item.link"
                :to="item.link"
                class="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors group w-full text-left"
                :class="[
                  isActive(item.link)
                    ? (isDarkMode 
                      ? 'text-indigo-400 bg-indigo-900/20' 
                      : 'text-indigo-600 bg-indigo-50')
                    : (isDarkMode
                      ? 'text-gray-300 hover:bg-slate-700 hover:text-white' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900')
                ]"
              >
                <Pipette v-if="item.icon === 'pipette'" :size="20" :stroke-width="2" />
                <Captions v-else-if="item.icon === 'captions'" :size="20" :stroke-width="2" />
                <span v-else class="material-symbols-outlined text-lg">{{ item.icon }}</span>
                <span class="font-medium">{{ item.text }}</span>
              </router-link>
            </div>
          </div>
        </nav>
      </div>
      
      <!-- Getting Started - only show when on getting started route -->
      <div v-if="showGettingStarted" class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold uppercase tracking-wider" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">Getting Started</h3>
          <button
            @click="toggle"
            class="p-2 rounded-lg transition-colors"
            :class="isDarkMode ? 'text-gray-300 hover:text-white hover:bg-slate-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
            title="Close drawer"
          >
            <span class="material-symbols-outlined">left_panel_close</span>
          </button>
        </div>
        <nav class="space-y-6">
          <!-- Overview & Basics -->
          <div>
            <h4 class="text-xs font-semibold uppercase tracking-wider mb-2 px-4" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">Overview & Basics</h4>
            <div class="space-y-1">
              <router-link
                v-for="item in filteredGettingStartedBasics"
                :key="item.link"
                :to="item.link"
                class="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors group w-full text-left"
                :class="[
                  isActive(item.link)
                    ? (isDarkMode 
                      ? 'text-indigo-400 bg-indigo-900/20' 
                      : 'text-indigo-600 bg-indigo-50')
                    : (isDarkMode
                      ? 'text-gray-300 hover:bg-slate-700 hover:text-white' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900')
                ]"
              >
                <span class="material-symbols-outlined text-lg">{{ item.icon }}</span>
                <span class="font-medium">{{ item.text }}</span>
              </router-link>
            </div>
          </div>

          <!-- Design Principles -->
          <div>
            <h4 class="text-xs font-semibold uppercase tracking-wider mb-2 px-4" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">Design Principles</h4>
            <div class="space-y-1">
              <router-link
                v-for="item in filteredGettingStartedPrinciples"
                :key="item.link"
                :to="item.link"
                class="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors group w-full text-left"
                :class="[
                  isActive(item.link)
                    ? (isDarkMode 
                      ? 'text-indigo-400 bg-indigo-900/20' 
                      : 'text-indigo-600 bg-indigo-50')
                    : (isDarkMode
                      ? 'text-gray-300 hover:bg-slate-700 hover:text-white' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900')
                ]"
              >
                <span class="material-symbols-outlined text-lg">{{ item.icon }}</span>
                <span class="font-medium">{{ item.text }}</span>
              </router-link>
            </div>
          </div>

          <!-- Setup & Installation -->
          <div>
            <h4 class="text-xs font-semibold uppercase tracking-wider mb-2 px-4" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">Setup & Installation</h4>
            <div class="space-y-1">
              <router-link
                v-for="item in filteredGettingStartedSetup"
                :key="item.link"
                :to="item.link"
                class="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors group w-full text-left"
                :class="[
                  isActive(item.link)
                    ? (isDarkMode 
                      ? 'text-indigo-400 bg-indigo-900/20' 
                      : 'text-indigo-600 bg-indigo-50')
                    : (isDarkMode
                      ? 'text-gray-300 hover:bg-slate-700 hover:text-white' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900')
                ]"
              >
                <span class="material-symbols-outlined text-lg">{{ item.icon }}</span>
                <span class="font-medium">{{ item.text }}</span>
              </router-link>
            </div>
          </div>

          <!-- Resources & Support -->
          <div>
            <h4 class="text-xs font-semibold uppercase tracking-wider mb-2 px-4" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">Resources & Support</h4>
            <div class="space-y-1">
              <router-link
                v-for="item in filteredGettingStartedResources"
                :key="item.link"
                :to="item.link"
                class="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors group w-full text-left"
                :class="[
                  isActive(item.link)
                    ? (isDarkMode 
                      ? 'text-indigo-400 bg-indigo-900/20' 
                      : 'text-indigo-600 bg-indigo-50')
                    : (isDarkMode
                      ? 'text-gray-300 hover:bg-slate-700 hover:text-white' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900')
                ]"
              >
                <span class="material-symbols-outlined text-lg">{{ item.icon }}</span>
                <span class="font-medium">{{ item.text }}</span>
              </router-link>
            </div>
          </div>
        </nav>
      </div>
      
      <!-- Tools - only show when on tools route -->
      <div v-if="showTools" class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold uppercase tracking-wider" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">Tools</h3>
          <button
            @click="toggle"
            class="p-2 rounded-lg transition-colors"
            :class="isDarkMode ? 'text-gray-300 hover:text-white hover:bg-slate-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
            title="Close drawer"
          >
            <span class="material-symbols-outlined">left_panel_close</span>
          </button>
        </div>
        <nav class="space-y-6">
          <!-- Overview -->
          <div>
            <h4 class="text-xs font-semibold uppercase tracking-wider mb-2 px-4" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">Overview</h4>
            <div class="space-y-1">
              <router-link
                v-for="item in filteredToolGroups.overview"
                :key="item.link"
                :to="item.link"
                class="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors group w-full text-left"
                :class="[
                  isActive(item.link)
                    ? (isDarkMode 
                      ? 'text-indigo-400 bg-indigo-900/20' 
                      : 'text-indigo-600 bg-indigo-50')
                    : (isDarkMode
                      ? 'text-gray-300 hover:bg-slate-700 hover:text-white' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900')
                ]"
              >
                <span class="material-symbols-outlined text-lg">{{ item.icon }}</span>
                <span class="font-medium">{{ item.text }}</span>
              </router-link>
            </div>
          </div>

          <!-- Color -->
          <div>
            <h4 class="text-xs font-semibold uppercase tracking-wider mb-2 px-4" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">Color</h4>
            <div class="space-y-1">
              <router-link
                v-for="item in filteredToolGroups.color"
                :key="item.link"
                :to="item.link"
                class="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors group w-full text-left"
                :class="[
                  isActive(item.link)
                    ? (isDarkMode 
                      ? 'text-indigo-400 bg-indigo-900/20' 
                      : 'text-indigo-600 bg-indigo-50')
                    : (isDarkMode
                      ? 'text-gray-300 hover:bg-slate-700 hover:text-white' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900')
                ]"
              >
                <SwatchBook v-if="item.icon === 'swatch-book'" :size="20" :stroke-width="2" />
                <span v-else class="material-symbols-outlined text-lg">{{ item.icon }}</span>
                <span class="font-medium">{{ item.text }}</span>
              </router-link>
            </div>
          </div>

          <!-- Text & Content -->
          <div>
            <h4 class="text-xs font-semibold uppercase tracking-wider mb-2 px-4" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">Text & Content</h4>
            <div class="space-y-1">
              <router-link
                v-for="item in filteredToolGroups.text"
                :key="item.link"
                :to="item.link"
                class="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors group w-full text-left"
                :class="[
                  isActive(item.link)
                    ? (isDarkMode 
                      ? 'text-indigo-400 bg-indigo-900/20' 
                      : 'text-indigo-600 bg-indigo-50')
                    : (isDarkMode
                      ? 'text-gray-300 hover:bg-slate-700 hover:text-white' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900')
                ]"
              >
                <TextInitial v-if="item.icon === 'text-initial'" :size="20" :stroke-width="2" />
                <Tag v-else-if="item.icon === 'tag'" :size="20" :stroke-width="2" />
                <span v-else class="material-symbols-outlined text-lg">{{ item.icon }}</span>
                <span class="font-medium">{{ item.text }}</span>
              </router-link>
            </div>
          </div>

          <!-- Image & Video -->
          <div>
            <h4 class="text-xs font-semibold uppercase tracking-wider mb-2 px-4" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">Image & Video</h4>
            <div class="space-y-1">
              <router-link
                v-for="item in filteredToolGroups.image"
                :key="item.link"
                :to="item.link"
                class="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors group w-full text-left"
                :class="[
                  isActive(item.link)
                    ? (isDarkMode 
                      ? 'text-indigo-400 bg-indigo-900/20' 
                      : 'text-indigo-600 bg-indigo-50')
                    : (isDarkMode
                      ? 'text-gray-300 hover:bg-slate-700 hover:text-white' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900')
                ]"
              >
                <Captions v-if="item.icon === 'captions'" :size="20" :stroke-width="2" />
                <span v-else class="material-symbols-outlined text-lg">{{ item.icon }}</span>
                <span class="font-medium">{{ item.text }}</span>
              </router-link>
            </div>
          </div>
        </nav>
      </div>
      
      <!-- Review - only show when on review route -->
      <div v-if="showReview" class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold uppercase tracking-wider" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">Review</h3>
          <button
            @click="toggle"
            class="p-2 rounded-lg transition-colors"
            :class="isDarkMode ? 'text-gray-300 hover:text-white hover:bg-slate-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
            title="Close drawer"
          >
            <span class="material-symbols-outlined">left_panel_close</span>
          </button>
        </div>
        <nav class="space-y-1">
          <router-link
            v-for="item in filteredReviewItems"
            :key="item.link"
            :to="item.link"
            class="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors group w-full text-left"
            :class="[
              isActive(item.link)
                ? (isDarkMode 
                  ? 'text-indigo-400 bg-indigo-900/20' 
                  : 'text-indigo-600 bg-indigo-50')
                : (isDarkMode
                  ? 'text-gray-300 hover:bg-slate-700 hover:text-white' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900')
            ]"
          >
            <FolderKanban v-if="item.icon === 'folder-kanban'" :size="20" :stroke-width="2" />
            <span v-else class="material-symbols-outlined text-lg">{{ item.icon }}</span>
            <span class="font-medium">{{ item.text }}</span>
          </router-link>
        </nav>

        <!-- Utilities -->
        <div class="mt-6">
          <h4 class="text-xs font-semibold uppercase tracking-wider mb-2 px-4" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">Utilities</h4>
          <nav class="space-y-1">
            <router-link
              v-for="item in filteredReviewUtilities"
              :key="item.link"
              :to="item.link"
              class="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors group w-full text-left"
              :class="[
                isActive(item.link)
                  ? (isDarkMode 
                    ? 'text-indigo-400 bg-indigo-900/20' 
                    : 'text-indigo-600 bg-indigo-50')
                  : (isDarkMode
                    ? 'text-gray-300 hover:bg-slate-700 hover:text-white' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900')
              ]"
            >
              <span class="material-symbols-outlined text-lg">{{ item.icon }}</span>
              <span class="font-medium">{{ item.text }}</span>
            </router-link>
          </nav>
        </div>
      </div>
      
      <!-- HCD - only show when on research route -->
      <div v-if="showResearch" class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold uppercase tracking-wider" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">HCD</h3>
          <button
            @click="toggle"
            class="p-2 rounded-lg transition-colors"
            :class="isDarkMode ? 'text-gray-300 hover:text-white hover:bg-slate-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
            title="Close drawer"
          >
            <span class="material-symbols-outlined">left_panel_close</span>
          </button>
        </div>
        <nav class="space-y-6">
          <!-- HCD Guidelines -->
          <div>
            <h4 class="text-xs font-semibold uppercase tracking-wider mb-2 px-4" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">HCD Guidelines</h4>
            <div class="space-y-1">
              <router-link
                v-for="item in filteredHumanCenteredDesign"
                :key="item.link"
                :to="item.link"
                class="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors group w-full text-left"
                :class="[
                  isActive(item.link)
                    ? (isDarkMode 
                      ? 'text-indigo-400 bg-indigo-900/20' 
                      : 'text-indigo-600 bg-indigo-50')
                    : (isDarkMode
                      ? 'text-gray-300 hover:bg-slate-700 hover:text-white' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900')
                ]"
              >
                <span class="material-symbols-outlined text-lg">{{ item.icon }}</span>
                <span class="font-medium">{{ item.text }}</span>
              </router-link>
            </div>
          </div>

          <!-- Research Artifacts -->
          <div>
            <h4 class="text-xs font-semibold uppercase tracking-wider mb-2 px-4" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">Research Artifacts</h4>
            <div class="space-y-1">
              <router-link
                v-for="item in filteredResearchArtifacts"
                :key="item.link"
                :to="item.link"
                class="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors group w-full text-left"
                :class="[
                  isActive(item.link)
                    ? (isDarkMode 
                      ? 'text-indigo-400 bg-indigo-900/20' 
                      : 'text-indigo-600 bg-indigo-50')
                    : (isDarkMode
                      ? 'text-gray-300 hover:bg-slate-700 hover:text-white' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900')
                ]"
              >
                <span class="material-symbols-outlined text-lg">{{ item.icon }}</span>
                <span class="font-medium">{{ item.text }}</span>
              </router-link>
            </div>
          </div>

          <!-- UX Research Tools -->
          <div>
            <h4 class="text-xs font-semibold uppercase tracking-wider mb-2 px-4" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">UX Research Tools</h4>
            <div class="space-y-1">
              <router-link
                v-for="item in filteredUxResearchTools"
                :key="item.link"
                :to="item.link"
                class="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors group w-full text-left"
                :class="[
                  isActive(item.link)
                    ? (isDarkMode 
                      ? 'text-indigo-400 bg-indigo-900/20' 
                      : 'text-indigo-600 bg-indigo-50')
                    : (isDarkMode
                      ? 'text-gray-300 hover:bg-slate-700 hover:text-white' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900')
                ]"
              >
                <span class="material-symbols-outlined text-lg">{{ item.icon }}</span>
                <span class="font-medium">{{ item.text }}</span>
              </router-link>
            </div>
          </div>
        </nav>
      </div>
      
      <!-- AI - only show when on AI route -->
      <div v-if="showAI" class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold uppercase tracking-wider" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">Artificial Intelligence</h3>
          <button
            @click="toggle"
            class="p-2 rounded-lg transition-colors"
            :class="isDarkMode ? 'text-gray-300 hover:text-white hover:bg-slate-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
            title="Close drawer"
          >
            <span class="material-symbols-outlined">left_panel_close</span>
          </button>
        </div>
        <nav class="space-y-1">
          <router-link
            v-for="item in filteredArtificialIntelligence"
            :key="item.link"
            :to="item.link"
            class="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors group w-full text-left"
            :class="[
              isActive(item.link)
                ? (isDarkMode 
                  ? 'text-indigo-400 bg-indigo-900/20' 
                  : 'text-indigo-600 bg-indigo-50')
                : (isDarkMode
                  ? 'text-gray-300 hover:bg-slate-700 hover:text-white' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900')
            ]"
          >
            <span class="material-symbols-outlined text-lg">{{ item.icon }}</span>
            <span class="font-medium">{{ item.text }}</span>
          </router-link>
        </nav>
      </div>
      
      <!-- Design Assets - only show when on design assets route -->
      <div v-if="showDesignAssets" class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold uppercase tracking-wider" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">Design Assets</h3>
          <button
            @click="toggle"
            class="p-2 rounded-lg transition-colors"
            :class="isDarkMode ? 'text-gray-300 hover:text-white hover:bg-slate-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
            title="Close drawer"
          >
            <span class="material-symbols-outlined">left_panel_close</span>
          </button>
        </div>
        <nav class="space-y-1">
          <router-link
            v-for="item in filteredDesignAssets"
            :key="item.link"
            :to="item.link"
            class="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors group w-full text-left"
            :class="[
              isActive(item.link)
                ? (isDarkMode 
                  ? 'text-indigo-400 bg-indigo-900/20' 
                  : 'text-indigo-600 bg-indigo-50')
                : (isDarkMode
                  ? 'text-gray-300 hover:bg-slate-700 hover:text-white' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900')
            ]"
          >
            <span class="material-symbols-outlined text-lg">{{ item.icon }}</span>
            <span class="font-medium">{{ item.text }}</span>
          </router-link>
        </nav>
      </div>
      
      <!-- Admin - only show when on admin route -->
      <div v-if="showAdmin" class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold uppercase tracking-wider" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">Admin</h3>
          <button
            @click="toggle"
            class="p-2 rounded-lg transition-colors"
            :class="isDarkMode ? 'text-gray-300 hover:text-white hover:bg-slate-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
            title="Close drawer"
          >
            <span class="material-symbols-outlined">left_panel_close</span>
          </button>
        </div>
        <nav class="space-y-1">
          <router-link
            v-for="item in filteredAdminItems"
            :key="item.link"
            :to="item.link"
            class="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors group w-full text-left"
            :class="[
              isActive(item.link)
                ? (isDarkMode 
                  ? 'text-indigo-400 bg-indigo-900/20' 
                  : 'text-indigo-600 bg-indigo-50')
                : (isDarkMode
                  ? 'text-gray-300 hover:bg-slate-700 hover:text-white' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900')
            ]"
          >
            <span class="material-symbols-outlined text-lg">{{ item.icon }}</span>
            <span class="font-medium">{{ item.text }}</span>
          </router-link>
        </nav>
      </div>
      
      <!-- Tokens - only show when on tokens route -->
      <div v-if="showTokens" class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold uppercase tracking-wider" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">Tokens</h3>
          <button
            @click="toggle"
            class="p-2 rounded-lg transition-colors"
            :class="isDarkMode ? 'text-gray-300 hover:text-white hover:bg-slate-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
            title="Close drawer"
          >
            <span class="material-symbols-outlined">left_panel_close</span>
          </button>
        </div>
        <nav class="space-y-1">
          <router-link
            v-for="item in filteredTokenItems"
            :key="item.link"
            :to="item.link"
            class="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors group w-full text-left"
            :class="[
              isActive(item.link)
                ? (isDarkMode 
                  ? 'text-indigo-400 bg-indigo-900/20' 
                  : 'text-indigo-600 bg-indigo-50')
                : (isDarkMode
                  ? 'text-gray-300 hover:bg-slate-700 hover:text-white' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900')
            ]"
          >
            <span class="material-symbols-outlined text-lg">{{ item.icon }}</span>
            <span class="font-medium">{{ item.text }}</span>
          </router-link>
        </nav>

        <!-- Utilities -->
        <div class="mt-6">
          <h4 class="text-xs font-semibold uppercase tracking-wider mb-2 px-4" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">Utilities</h4>
          <nav class="space-y-1">
            <router-link
              v-for="item in filteredTokenUtilities"
              :key="item.link"
              :to="item.link"
              class="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors group w-full text-left"
              :class="[
                isActive(item.link)
                  ? (isDarkMode 
                    ? 'text-indigo-400 bg-indigo-900/20' 
                    : 'text-indigo-600 bg-indigo-50')
                  : (isDarkMode
                    ? 'text-gray-300 hover:bg-slate-700 hover:text-white' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900')
              ]"
            >
              <span class="material-symbols-outlined text-lg">{{ item.icon }}</span>
              <span class="font-medium">{{ item.text }}</span>
            </router-link>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { Pipette, ScanEye, Captions, Tag, TextInitial, SwatchBook, FolderKanban } from 'lucide-vue-next';
import { getFeatureFlagForRoute } from '../router/featureFlagGuards';
import { flagCache } from '../composables/useFeatureFlags';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'toggle', 'navigate-doc']);

const route = useRoute();
const router = useRouter();
const isDarkMode = ref(document.documentElement.classList.contains('dark'));

const close = () => {
  emit('close');
};

const toggle = () => {
  emit('toggle');
};

const navigateToDoc = (link) => {
  emit('navigate-doc', link);
  // Navigate to guidelines page if not already there
  if (route.path !== '/guidelines') {
    router.push('/guidelines');
  }
};

const getDocUrl = (link) => {
  if (import.meta.env.DEV) {
    return `http://localhost:5173/guidelines${link === '/' ? '' : link}`;
  }
  return `/guidelines${link === '/' ? '/index.html' : link}.html`;
};

const foundations = [
  { text: 'Colors', link: '/colors', icon: 'palette' },
  { text: 'Typography', link: '/typography', icon: 'text_fields' },
  { text: 'Spacing', link: '/spacing', icon: 'space_dashboard' },
  { text: 'Shadows', link: '/shadows', icon: 'layers' }
];

const artificialIntelligence = [
  { text: 'AI Overview', link: '/ai/overview', icon: 'psychology' },
  { text: 'AI Patterns', link: '/ai/patterns', icon: 'auto_awesome' },
  { text: 'AI Components', link: '/ai/components', icon: 'smart_toy' }
];

const humanCenteredDesign = [
  { text: 'HCD Principles', link: '/hcd/principles', icon: 'people' },
  { text: 'User Research', link: '/hcd/research', icon: 'search' },
  { text: 'Accessibility', link: '/hcd/accessibility', icon: 'accessibility' },
  { text: 'Laws of UX', link: '/hcd/laws-of-ux', icon: 'rule' }
];

const designPatterns = [
  { text: 'Overview', link: '/patterns', icon: 'view_quilt' },
  { text: 'Pattern Status', link: '/patterns/status', icon: 'check_circle' },
  { text: 'Layout Patterns', link: '/patterns/layout', icon: 'view_quilt' },
  { text: 'Navigation', link: '/patterns/navigation', icon: 'navigation' },
  { text: 'Data Display', link: '/patterns/data-display', icon: 'table_chart' },
  { text: 'Forms', link: '/patterns/forms', icon: 'description' },
  { text: 'Feedback', link: '/patterns/feedback', icon: 'feedback' }
];

const codePatterns = [
  { text: 'Form Validation', link: '/patterns/form-validation', icon: 'description' },
  { text: 'Accessible Modal', link: '/patterns/accessible-modal', icon: 'fullscreen' },
  { text: 'Sortable Data Table', link: '/patterns/sortable-data-table', icon: 'table_chart' },
  { text: 'Login Form', link: '/patterns/login-form', icon: 'lock' },
  { text: 'Responsive Navigation', link: '/patterns/responsive-navigation', icon: 'menu' },
  { text: 'Toast Notification', link: '/patterns/toast-notification', icon: 'notifications' }
];


const reviewItems = [
  { text: 'Overview', link: '/review', icon: 'rate_review' },
  { text: 'My Requested Reviews', link: '/review/my-requests', icon: 'view_module' },
  { text: 'Review Management', link: '/review/management', icon: 'folder-kanban' }
];

const reviewUtilities = [
  { text: 'Handoff Tools', link: '/review/handoff', icon: 'swap_horiz' },
  { text: 'Design-to-Code Sync', link: '/design-sync', icon: 'sync' },
  { text: 'Visual Regression Testing', link: '/tools/visual-regression', icon: 'compare' },
  { text: 'Theme Builder', link: '/theme-builder', icon: 'tune' }
];

const tools = [
  { text: 'Overview', link: '/tools', icon: 'build' },
  { text: 'Gradient Generator', link: '/tools/gradient-generator', icon: 'gradient' },
  { text: 'Lorem Ipsum Generator', link: '/tools/lorem-ipsum', icon: 'text_fields' },
  { text: 'SEO Tagging Generator', link: '/tools/seo-tagging', icon: 'search' },
  { text: 'Color Scale Generator', link: '/tools/color-scale', icon: 'palette' },
  { text: 'Color Converter', link: '/tools/color-converter', icon: 'swap_horiz' },
  { text: 'Color Contrast Checker', link: '/tools/color-contrast', icon: 'contrast' },
  { text: 'NASA-TLX', link: '/tools/nasa-tlx', icon: 'psychology' },
  { text: 'System Usability Scale', link: '/tools/sus', icon: 'psychology' },
  { text: 'Heuristic Evaluation', link: '/tools/heuristic-evaluation', icon: 'checklist' },
  { text: 'PNG to ICO Converter', link: '/tools/png-to-ico', icon: 'image' },
  { text: 'Theme Builder', link: '/theme-builder', icon: 'tune' },
];

// Group tools by category
const toolGroups = computed(() => ({
  overview: [
    { text: 'Overview', link: '/tools', icon: 'build' }
  ],
  color: [
    { text: 'Gradient Generator', link: '/tools/gradient-generator', icon: 'gradient' },
    { text: 'Palette Builder', link: '/palette-builder', icon: 'swatch-book' },
    { text: 'Color Scale Generator', link: '/tools/color-scale', icon: 'format_color_fill' },
    { text: 'Color Converter', link: '/tools/color-converter', icon: 'swap_horiz' },
    { text: 'Color Contrast Checker', link: '/tools/color-contrast', icon: 'contrast' }
  ],
  text: [
    { text: 'Lorem Ipsum Generator', link: '/tools/lorem-ipsum', icon: 'text-initial' },
    { text: 'SEO Tagging Generator', link: '/tools/seo-tagging', icon: 'tag' },
    { text: 'Font Scale', link: '/tools/font-scale', icon: 'format_size' },
    { text: 'Font Stack & Subsetting', link: '/tools/font-stack', icon: 'layers' }
  ],
  development: [
  ],
  image: [
    { text: 'PNG to ICO Converter', link: '/tools/png-to-ico', icon: 'image' },
    { text: 'Alt Text Generator', link: '/tools/alt-text-generator', icon: 'captions' },
    { text: 'Photosensitivity Analysis', link: '/tools/photosensitivity', icon: 'visibility' }
  ]
}));

const designAssets = [
  { text: 'Overview', link: '/design-assets', icon: 'collections' },
  { text: 'Icons', link: '/design-assets/icons', icon: 'star' },
  { text: 'Font Library', link: '/design-assets/font-library', icon: 'library_books' },
  { text: 'Country Flags', link: '/design-assets/country-flags', icon: 'flag' },
  { text: 'USG Seals', link: '/design-assets/usg-seals', icon: 'verified' },
  { text: 'Internal Seals', link: '/design-assets/internal-seals', icon: 'security' },
  { text: 'Interactives', link: '/design-assets/interactives', icon: 'touch_app' },
  { text: 'Stock Photos', link: '/design-assets/stock-photos', icon: 'photo_library' },
  { text: 'Illustrations', link: '/design-assets/illustrations', icon: 'draw' },
  { text: 'Capability Logos', link: '/design-assets/capability-logos', icon: 'workspace_premium' },
  { text: 'Company Logos', link: '/design-assets/company-logos', icon: 'business' }
];

const componentUtilities = [
  { text: 'Loupe', link: '/components/loupe', icon: 'scan-eye' },
  { text: 'Component Status', link: '/components/status', icon: 'check_circle' },
  { text: 'Component Examples', link: '/components/examples', icon: 'preview' },
  { text: 'Testing Framework', link: '/components/testing', icon: 'bug_report' },
  { text: 'Documentation Generator', link: '/components/documentation', icon: 'description' },
  { text: 'Component Composition', link: '/components/composition', icon: 'view_quilt' },
  { text: 'Deprecation Manager', link: '/components/deprecation', icon: 'warning' }
];

const componentItems = [
  { text: 'Component Scaffolding Wizard', link: '/components/scaffold', icon: 'auto_fix_high' },
  { text: 'Buttons', link: '/components/buttons', icon: 'smart_button' },
  { text: 'Color Picker', link: '/components/color-picker', icon: 'pipette' },
  { text: 'Forms', link: '/components/forms', icon: 'description' },
  { text: 'Cards', link: '/components/cards', icon: 'view_module' },
  { text: 'Navigation', link: '/components/navigation', icon: 'navigation' },
  { text: 'Data Display', link: '/components/data-display', icon: 'table_chart' }
];

const adminItems = [
  { text: 'Audit Logs', link: '/admin/audit', icon: 'history' },
  { text: 'Overview', link: '/admin', icon: 'admin_panel_settings' },
  { text: 'System Health', link: '/admin/health', icon: 'space_dashboard' },
  { text: 'Governance', link: '/admin/governance', icon: 'gavel' },
  { text: 'Role Management', link: '/admin/roles', icon: 'admin_panel_settings' },
  { text: 'Feature Flags', link: '/admin/feature-flags', icon: 'flag' },
  { text: 'Component and Pattern Lifecycle Management', link: '/admin/content', icon: 'edit_document' },
  { text: 'Application Management', link: '/admin/applications', icon: 'apps' },
  { text: 'Code Quality', link: '/admin/code-quality', icon: 'check_circle' },
  { text: 'Vulnerability Scanner', link: '/admin/security', icon: 'security' },
  { text: 'Performance Analysis', link: '/admin/performance', icon: 'speed' },
  { text: 'Accessibility Reports', link: '/admin/accessibility-reports', icon: 'accessibility' }
];

const gettingStartedBasics = [
  { text: 'Overview', link: '/getting-started', icon: 'rocket_launch' },
  { text: 'Why a Design System?', link: '/getting-started/why-design-system', icon: 'help_outline' },
  { text: 'Quick Start', link: '/getting-started/quick-start', icon: 'play_arrow' }
];

const gettingStartedPrinciples = [
  { text: 'Design Principles', link: '/getting-started/principles', icon: 'lightbulb' },
  { text: 'Design Themes', link: '/getting-started/themes', icon: 'palette' }
];

const gettingStartedSetup = [
  { text: 'Installation', link: '/getting-started/installation', icon: 'download' },
  { text: 'Best Practices', link: '/getting-started/best-practices', icon: 'check_circle' },
  { text: 'Contribute', link: '/getting-started/contribute', icon: 'groups' }
];

const gettingStartedResources = [
  { text: 'Resources', link: '/getting-started/resources', icon: 'book' },
  { text: 'Support', link: '/getting-started/support', icon: 'help' }
];

const researchArtifacts = [
  { text: 'Overview', link: '/research', icon: 'note_stack' },
  { text: 'Journey Maps', link: '/research/journey-maps', icon: 'map' },
  { text: 'HCD Reports', link: '/research/hcd-reports', icon: 'description' },
  { text: 'User Personas', link: '/research/user-studies', icon: 'groups' },
  { text: 'Research Artifacts', link: '/research/artifacts', icon: 'folder' },
  { text: 'Insights & Findings', link: '/research/insights', icon: 'insights' }
];

const uxResearchTools = [
  { text: 'User Persona Generator', link: '/research/user-personas', icon: 'person' },
  { text: 'NASA-TLX', link: '/tools/nasa-tlx', icon: 'psychology' },
  { text: 'System Usability Scale', link: '/tools/sus', icon: 'psychology' },
  { text: 'Heuristic Evaluation', link: '/tools/heuristic-evaluation', icon: 'checklist' },
  { text: 'Session Replay', link: '/tools/session-replay', icon: 'videocam' }
];

const tokenItems = [
  { text: 'Overview', link: '/tokens', icon: 'style' },
  { text: 'Token Studio', link: '/tokens/studio', icon: 'tune' },
  { text: 'Token Playground', link: '/tokens/playground', icon: 'palette' },
  { text: 'Style Library', link: '/tokens/library', icon: 'library_books' },
  { text: 'Token Relationships', link: '/tokens/relationships', icon: 'account_tree' }
];

const tokenUtilities = [
  { text: 'Token Migration', link: '/tokens/migration', icon: 'swap_horiz' },
  { text: 'Token Sync', link: '/tokens/sync', icon: 'sync' }
];

const showAdmin = computed(() => {
  return route.path === '/admin' || route.path.startsWith('/admin/');
});

const showGettingStarted = computed(() => {
  return route.path === '/getting-started' || route.path.startsWith('/getting-started/');
});

const showResearch = computed(() => {
  return route.path === '/research' || 
         route.path.startsWith('/research/') ||
         route.path.startsWith('/hcd/') ||
         route.path === '/tools/nasa-tlx' ||
         route.path === '/tools/sus' ||
         route.path === '/tools/heuristic-evaluation';
});

const showTokens = computed(() => {
  return route.path === '/tokens' || route.path.startsWith('/tokens/');
});

const showReview = computed(() => {
  return route.path === '/review' || route.path.startsWith('/review/') || route.path === '/design-sync' || route.path.startsWith('/design-sync/') || route.path === '/theme-builder' || route.path === '/tools/visual-regression';
});

const showPatterns = computed(() => {
  return route.path === '/patterns' || route.path.startsWith('/patterns/');
});


const showTools = computed(() => {
  const path = route.path;
  // Exclude UX Research tools (they're now in HCD)
  // Exclude Theme Builder and Visual Regression (they're now in Review Utilities)
  if (path === '/tools/nasa-tlx' || path === '/tools/sus' || path === '/tools/heuristic-evaluation' || path === '/theme-builder' || path === '/tools/visual-regression') {
    return false;
  }
  return path === '/tools' || path.startsWith('/tools/') || path === '/palette-builder';
});

const showDesignAssets = computed(() => {
  return route.path === '/design-assets' || route.path.startsWith('/design-assets/');
});

const showComponents = computed(() => {
  return route.path === '/components' || route.path.startsWith('/components/');
});

const showAI = computed(() => {
  return route.path === '/ai' || route.path.startsWith('/ai/');
});

const showMainSections = computed(() => {
  return !showPatterns.value && !showComponents.value && !showTools.value && !showDesignAssets.value && !showReview.value && !showTokens.value && !showAdmin.value && !showGettingStarted.value && !showResearch.value && !showAI.value;
});

const isActive = (path) => {
  return route.path === path || route.path.startsWith(path + '/');
};

// Helper function to check if a route is enabled via feature flag
// This function accesses flagCache, making computed properties that use it reactive
const isRouteEnabled = (routePath) => {
  const flagKey = getFeatureFlagForRoute(routePath);
  if (!flagKey) {
    // No feature flag for this route, allow it (show it)
    return true;
  }
  // Check if the feature flag is enabled (uses cache)
  // Access flagCache directly (it's reactive) - Vue will track this dependency
  const enabled = flagCache[flagKey];
  // Default to false if flag not found (hide until we know it's enabled)
  // This ensures items are hidden when flags are disabled
  return enabled === true; // Only show if explicitly enabled
};

// Filter arrays based on feature flags
// flagCache is reactive, so accessing it in computed properties makes them reactive
const filteredFoundations = computed(() => {
  return foundations.filter(item => isRouteEnabled(item.link));
});

const filteredArtificialIntelligence = computed(() => {
  return artificialIntelligence.filter(item => isRouteEnabled(item.link));
});

const filteredHumanCenteredDesign = computed(() => {
  return humanCenteredDesign.filter(item => isRouteEnabled(item.link));
});

const filteredDesignPatterns = computed(() => {
  return designPatterns.filter(item => isRouteEnabled(item.link));
});

const filteredCodePatterns = computed(() => {
  return codePatterns.filter(item => isRouteEnabled(item.link));
});

const filteredComponentUtilities = computed(() => {
  return componentUtilities.filter(item => isRouteEnabled(item.link));
});

const filteredComponentItems = computed(() => {
  return componentItems.filter(item => isRouteEnabled(item.link));
});

const filteredAdminItems = computed(() => {
  return adminItems.filter(item => isRouteEnabled(item.link));
});

const filteredGettingStartedBasics = computed(() => {
  return gettingStartedBasics.filter(item => isRouteEnabled(item.link));
});

const filteredGettingStartedPrinciples = computed(() => {
  return gettingStartedPrinciples.filter(item => isRouteEnabled(item.link));
});

const filteredGettingStartedSetup = computed(() => {
  return gettingStartedSetup.filter(item => isRouteEnabled(item.link));
});

const filteredGettingStartedResources = computed(() => {
  return gettingStartedResources.filter(item => isRouteEnabled(item.link));
});

const filteredResearchArtifacts = computed(() => {
  return researchArtifacts.filter(item => isRouteEnabled(item.link));
});

const filteredUxResearchTools = computed(() => {
  return uxResearchTools.filter(item => isRouteEnabled(item.link));
});

const filteredTokenItems = computed(() => {
  return tokenItems.filter(item => isRouteEnabled(item.link));
});

const filteredTokenUtilities = computed(() => {
  return tokenUtilities.filter(item => isRouteEnabled(item.link));
});

const filteredDesignAssets = computed(() => {
  return designAssets.filter(item => isRouteEnabled(item.link));
});

const filteredToolGroups = computed(() => {
  return {
    overview: toolGroups.value.overview.filter(item => isRouteEnabled(item.link)),
    color: toolGroups.value.color.filter(item => isRouteEnabled(item.link)),
    text: toolGroups.value.text.filter(item => isRouteEnabled(item.link)),
    development: toolGroups.value.development.filter(item => isRouteEnabled(item.link)),
    image: toolGroups.value.image.filter(item => isRouteEnabled(item.link))
  };
});

const filteredReviewItems = computed(() => {
  return reviewItems.filter(item => isRouteEnabled(item.link));
});

const filteredReviewUtilities = computed(() => {
  return reviewUtilities.filter(item => isRouteEnabled(item.link));
});

// Watch for dark mode changes and Escape key
let darkModeObserver = null;
let darkModeInterval = null;
let escapeHandler = null;

// Function to get all flag keys used in the drawer
const getAllDrawerFlagKeys = () => {
  const allRoutes = [
    ...foundations.map(f => f.link),
    ...artificialIntelligence.map(a => a.link),
    ...humanCenteredDesign.map(h => h.link),
    ...designPatterns.map(d => d.link),
    ...codePatterns.map(c => c.link),
    ...componentUtilities.map(c => c.link),
    ...componentItems.map(c => c.link),
    ...adminItems.map(a => a.link),
    ...gettingStartedBasics.map(g => g.link),
    ...gettingStartedPrinciples.map(g => g.link),
    ...gettingStartedSetup.map(g => g.link),
    ...gettingStartedResources.map(g => g.link),
    ...researchArtifacts.map(r => r.link),
    ...uxResearchTools.map(u => u.link),
    ...tokenItems.map(t => t.link),
    ...designAssets.map(d => d.link),
    ...reviewItems.map(r => r.link),
    ...reviewUtilities.map(r => r.link),
    ...toolGroups.value.overview.map(t => t.link),
    ...toolGroups.value.color.map(t => t.link),
    ...toolGroups.value.text.map(t => t.link),
    ...toolGroups.value.development.map(t => t.link),
    ...toolGroups.value.image.map(t => t.link),
  ];
  
  // Get unique flag keys for all routes
  const flagKeys = new Set();
  allRoutes.forEach(route => {
    const flagKey = getFeatureFlagForRoute(route);
    if (flagKey) {
      flagKeys.add(flagKey);
    }
  });
  
  return flagKeys;
};

// Function to load all drawer flags
const loadDrawerFlags = async () => {
  const flagKeys = getAllDrawerFlagKeys();
  if (flagKeys.size > 0) {
    try {
      const context = {
        userId: localStorage.getItem('userId') || undefined,
        userGroups: localStorage.getItem('userGroups') 
          ? JSON.parse(localStorage.getItem('userGroups'))
          : undefined,
      };
      
      // Load all flags in parallel
      await Promise.all(
        Array.from(flagKeys).map(async (flagKey) => {
          try {
            const enabled = await OpenFeature.getBooleanValue(flagKey, false, context);
            flagCache[flagKey] = enabled;
          } catch (error) {
            console.warn(`Failed to load flag ${flagKey}:`, error);
            flagCache[flagKey] = false; // Default to disabled on error
          }
        })
      );
    } catch (error) {
      console.warn('Failed to preload drawer flags:', error);
    }
  }
};

let flagUpdateHandler = null;

onMounted(async () => {
  // Load flags on mount
  await loadDrawerFlags();
  
  // Listen for feature flag updates and refresh drawer flags
  flagUpdateHandler = () => {
    loadDrawerFlags();
  };
  window.addEventListener('feature-flags-updated', flagUpdateHandler);
  
  // Dark mode observer
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
  
  // Escape key handler
  escapeHandler = (e) => {
    if (e.key === 'Escape' && props.isOpen) {
      close();
    }
  };
  window.addEventListener('keydown', escapeHandler);
});

onBeforeUnmount(() => {
  if (flagUpdateHandler) {
    window.removeEventListener('feature-flags-updated', flagUpdateHandler);
  }
  if (darkModeObserver) {
    darkModeObserver.disconnect();
  }
  if (darkModeInterval) {
    clearInterval(darkModeInterval);
  }
  if (escapeHandler) {
    window.removeEventListener('keydown', escapeHandler);
  }
});
</script>
