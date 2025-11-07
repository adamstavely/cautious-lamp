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
                      Token Studio
                    </h1>
                    <span class="px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-300 border border-green-400/30">
                      DTCG Compliant
                    </span>
                  </div>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-4">
                    Create and manage design tokens compliant with the Design Token Community Group specification. Export to any platform using Style Dictionary.
                  </p>
                  <div class="flex items-center gap-4 text-sm text-white/70">
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">style</span>
                      Style Dictionary
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
                        <linearGradient id="tokenStudioGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Stylized token studio icon -->
                      <rect x="20" y="20" width="40" height="40" rx="4" fill="url(#tokenStudioGradient)" opacity="0.6"/>
                      <rect x="80" y="20" width="40" height="40" rx="4" fill="url(#tokenStudioGradient)" opacity="0.5"/>
                      <rect x="140" y="20" width="40" height="40" rx="4" fill="url(#tokenStudioGradient)" opacity="0.7"/>
                      <rect x="20" y="80" width="40" height="40" rx="4" fill="url(#tokenStudioGradient)" opacity="0.4"/>
                      <rect x="80" y="80" width="40" height="40" rx="4" fill="url(#tokenStudioGradient)" opacity="0.6"/>
                      <rect x="140" y="80" width="40" height="40" rx="4" fill="url(#tokenStudioGradient)" opacity="0.5"/>
                      <rect x="20" y="140" width="40" height="40" rx="4" fill="url(#tokenStudioGradient)" opacity="0.7"/>
                      <rect x="80" y="140" width="40" height="40" rx="4" fill="url(#tokenStudioGradient)" opacity="0.5"/>
                      <rect x="140" y="140" width="40" height="40" rx="4" fill="url(#tokenStudioGradient)" opacity="0.6"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Main Content -->
          <div class="max-w-7xl mx-auto">
            <div class="grid lg:grid-cols-4 gap-6">
              <!-- Left Sidebar: Token Categories -->
              <div class="lg:col-span-1">
                <div 
                  class="rounded-lg border p-6 sticky top-8"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <div class="flex items-center justify-between mb-6">
                    <h2 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      Categories
                    </h2>
                    <button
                      @click="showAddCategoryModal = true"
                      class="p-1.5 rounded-lg transition-colors"
                      :class="isDarkMode ? 'text-gray-400 hover:text-indigo-400 hover:bg-slate-700' : 'text-gray-400 hover:text-indigo-600 hover:bg-gray-100'"
                      title="Add category"
                    >
                      <span class="material-symbols-outlined text-lg">add</span>
                    </button>
                  </div>
                  
                  <div class="space-y-1">
                    <button
                      v-for="category in categories"
                      :key="category.id"
                      @click="selectedCategory = category.id"
                      class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors text-left"
                      :class="getCategoryButtonClass(category.id)"
                    >
                      <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-base">{{ category.icon }}</span>
                        <span>{{ category.name }}</span>
                      </div>
                      <span class="text-xs font-medium" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                        {{ getCategoryTokenCount(category.id) }}
                      </span>
                    </button>
                  </div>

                  <!-- Export Section -->
                  <div class="mt-8 pt-6 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                    <h3 class="text-sm font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      Import / Export
                    </h3>
                    <div class="space-y-2 mb-4">
                      <button
                        @click="importTokens"
                        class="w-full px-3 py-2 text-sm rounded-lg transition-colors text-left"
                        :class="isDarkMode ? 'bg-slate-800 text-gray-300 hover:bg-slate-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                      >
                        <span class="material-symbols-outlined text-base align-middle mr-2">upload</span>
                        Import JSON
                      </button>
                      <button
                        @click="showSaveModal = true"
                        class="w-full px-3 py-2 text-sm rounded-lg transition-colors text-left"
                        :class="isDarkMode ? 'bg-indigo-600 text-indigo-100 hover:bg-indigo-500' : 'bg-indigo-600 text-white hover:bg-indigo-700'"
                      >
                        <span class="material-symbols-outlined text-base align-middle mr-2">save</span>
                        Save to Library
                      </button>
                    </div>
                    <div class="space-y-2">
                      <button
                        @click="exportTokens('json')"
                        class="w-full px-3 py-2 text-sm rounded-lg transition-colors text-left"
                        :class="isDarkMode 
                          ? 'bg-slate-800 text-gray-300 hover:bg-slate-700' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                      >
                        <span class="material-symbols-outlined text-base align-middle mr-2">code</span>
                        JSON (DTCG)
                      </button>
                      <button
                        @click="exportTokens('css')"
                        class="w-full px-3 py-2 text-sm rounded-lg transition-colors text-left"
                        :class="isDarkMode 
                          ? 'bg-slate-800 text-gray-300 hover:bg-slate-700' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                      >
                        <span class="material-symbols-outlined text-base align-middle mr-2">css</span>
                        CSS Variables
                      </button>
                      <button
                        @click="exportTokens('ios')"
                        class="w-full px-3 py-2 text-sm rounded-lg transition-colors text-left"
                        :class="isDarkMode 
                          ? 'bg-slate-800 text-gray-300 hover:bg-slate-700' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                      >
                        <span class="material-symbols-outlined text-base align-middle mr-2">phone_iphone</span>
                        iOS
                      </button>
                      <button
                        @click="exportTokens('android')"
                        class="w-full px-3 py-2 text-sm rounded-lg transition-colors text-left"
                        :class="isDarkMode 
                          ? 'bg-slate-800 text-gray-300 hover:bg-slate-700' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                      >
                        <span class="material-symbols-outlined text-base align-middle mr-2">phone_android</span>
                        Android
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Main Content: Token List -->
              <div class="lg:col-span-3">
                <div 
                  class="rounded-lg border p-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <div class="flex items-center justify-between mb-6">
                    <div>
                      <h2 class="text-xl font-semibold mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                        {{ getCategoryName(selectedCategory) }} Tokens
                      </h2>
                      <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        {{ filteredTokens.length }} token{{ filteredTokens.length !== 1 ? 's' : '' }}
                      </p>
                    </div>
                    <button
                      @click="showAddTokenModal = true"
                      class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                      <span class="material-symbols-outlined text-lg">add</span>
                      Add Token
                    </button>
                  </div>

                  <!-- Token List -->
                  <div v-if="filteredTokens.length > 0" class="space-y-2">
                    <div
                      v-for="token in filteredTokens"
                      :key="token.id"
                      class="flex items-center justify-between p-4 rounded-lg border transition-colors group"
                      :class="isDarkMode ? 'border-gray-700 bg-slate-800 hover:border-indigo-600' : 'border-gray-200 bg-gray-50 hover:border-indigo-300'"
                    >
                      <div class="flex items-center gap-4 flex-1">
                        <!-- Token Preview (for colors) -->
                        <div 
                          v-if="getTokenType(token) === 'color'"
                          class="w-12 h-12 rounded-lg border-2 flex-shrink-0"
                          :class="isDarkMode ? 'border-gray-600' : 'border-gray-300'"
                          :style="{ backgroundColor: getTokenValue(token) }"
                        ></div>
                        <div 
                          v-else-if="getTokenType(token) === 'dimension'"
                          class="w-12 h-12 rounded-lg border-2 flex items-center justify-center flex-shrink-0"
                          :class="isDarkMode ? 'border-gray-600 bg-slate-700' : 'border-gray-300 bg-white'"
                        >
                          <span class="text-xs font-mono" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                            {{ getTokenValue(token) }}
                          </span>
                        </div>
                        <div 
                          v-else
                          class="w-12 h-12 rounded-lg border-2 flex items-center justify-center flex-shrink-0"
                          :class="isDarkMode ? 'border-gray-600 bg-slate-700' : 'border-gray-300 bg-white'"
                        >
                          <span class="material-symbols-outlined" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
                            {{ getTokenIcon(getTokenType(token)) }}
                          </span>
                        </div>
                        
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center gap-2 mb-1">
                            <code class="text-sm font-mono font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                              {{ token.name }}
                            </code>
                            <span 
                              class="px-2 py-0.5 rounded text-xs font-medium"
                              :class="isDarkMode ? 'bg-indigo-900/30 text-indigo-300' : 'bg-indigo-100 text-indigo-700'"
                            >
                              {{ getTokenType(token) }}
                            </span>
                          </div>
                          <div class="text-sm font-mono" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                            {{ getTokenValue(token) }}
                          </div>
                          <div v-if="getTokenDescription(token)" class="text-xs mt-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                            {{ getTokenDescription(token) }}
                          </div>
                        </div>
                      </div>
                      
                      <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          @click="editToken(token)"
                          class="p-2 rounded-lg transition-colors"
                          :class="isDarkMode ? 'text-gray-400 hover:text-indigo-400 hover:bg-slate-700' : 'text-gray-400 hover:text-indigo-600 hover:bg-gray-100'"
                          title="Edit token"
                        >
                          <span class="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button
                          @click="deleteToken(token.id)"
                          class="p-2 rounded-lg transition-colors"
                          :class="isDarkMode ? 'text-gray-400 hover:text-red-400 hover:bg-slate-700' : 'text-gray-400 hover:text-red-600 hover:bg-gray-100'"
                          title="Delete token"
                        >
                          <span class="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Empty State -->
                  <div v-else class="text-center py-12">
                    <span class="material-symbols-outlined text-6xl mb-4" :class="isDarkMode ? 'text-gray-600' : 'text-gray-300'">
                      {{ getCategoryIcon(selectedCategory) }}
                    </span>
                    <p class="text-lg font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      No tokens yet
                    </p>
                    <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                      Get started by adding your first {{ getCategoryName(selectedCategory).toLowerCase() }} token
                    </p>
                    <button
                      @click="showAddTokenModal = true"
                      class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Add Token
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Token Modal -->
    <div
      v-if="showAddTokenModal || editingToken"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      @click.self="closeTokenModal"
      @keydown.escape="closeTokenModal"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="editingToken ? 'edit-token-title' : 'add-token-title'"
    >
      <div 
        class="rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        :class="isDarkMode ? 'bg-slate-900' : 'bg-white'"
      >
        <div 
          class="p-6 border-b"
          :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'"
        >
          <div class="flex items-center justify-between">
            <h3 :id="editingToken ? 'edit-token-title' : 'add-token-title'" class="text-xl font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              {{ editingToken ? 'Edit Token' : 'Add Token' }}
            </h3>
            <button
              @click="closeTokenModal"
              class="p-2 rounded-lg transition-colors"
              :class="isDarkMode ? 'text-gray-400 hover:text-gray-300 hover:bg-slate-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'"
              aria-label="Close modal"
            >
              <span class="material-symbols-outlined" aria-hidden="true">close</span>
            </button>
          </div>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <!-- Token Name -->
            <div>
              <label for="token-name-input" class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                Token Name <span class="text-red-500" aria-label="required">*</span>
              </label>
              <input
                id="token-name-input"
                v-model="tokenForm.name"
                type="text"
                placeholder="e.g., color.primary.500"
                @blur="validateTokenName"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono text-sm"
                :class="[
                  isDarkMode 
                    ? (tokenFormErrors.name ? 'border-red-500 bg-slate-700 text-white' : 'border-gray-600 bg-slate-700 text-white')
                    : (tokenFormErrors.name ? 'border-red-500 bg-white text-gray-900' : 'border-gray-300 bg-white text-gray-900')
                ]"
                aria-required="true"
                :aria-invalid="!!tokenFormErrors.name"
                :aria-describedby="tokenFormErrors.name ? 'token-name-error' : 'token-name-hint'"
              />
              <p v-if="tokenFormErrors.name" id="token-name-error" class="text-xs mt-1 text-red-500" role="alert">
                {{ tokenFormErrors.name }}
              </p>
              <p v-else id="token-name-hint" class="text-xs mt-1 sr-only" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                Use dot notation (e.g., color.primary.500)
              </p>
            </div>

            <!-- Token Type -->
            <div>
              <label for="token-type-select" class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                Type <span class="text-red-500" aria-label="required">*</span>
              </label>
              <select
                id="token-type-select"
                v-model="tokenForm.$type"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                :class="isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'"
                aria-required="true"
              >
                <option value="color">Color</option>
                <option value="dimension">Dimension</option>
                <option value="fontFamily">Font Family</option>
                <option value="fontWeight">Font Weight</option>
                <option value="duration">Duration</option>
                <option value="cubicBezier">Cubic Bezier</option>
                <option value="number">Number</option>
                <option value="string">String</option>
              </select>
            </div>

            <!-- Token Value -->
            <div>
              <label for="token-value-input" class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                Value <span class="text-red-500" aria-label="required">*</span>
              </label>
              <div class="flex items-center gap-3">
                <input
                  v-if="tokenForm.$type === 'color'"
                  id="token-value-color"
                  v-model="tokenForm.$value"
                  type="color"
                  class="w-16 h-12 rounded border-2 cursor-pointer"
                  :class="isDarkMode ? 'border-gray-600' : 'border-gray-300'"
                  aria-label="Color picker for token value"
                />
                <input
                  id="token-value-input"
                  v-model="tokenForm.$value"
                  type="text"
                  :placeholder="getValuePlaceholder(tokenForm.$type)"
                  @blur="validateTokenValue"
                  class="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono text-sm"
                  :class="[
                    isDarkMode 
                      ? (tokenFormErrors.value ? 'border-red-500 bg-slate-700 text-white' : 'border-gray-600 bg-slate-700 text-white')
                      : (tokenFormErrors.value ? 'border-red-500 bg-white text-gray-900' : 'border-gray-300 bg-white text-gray-900')
                  ]"
                  aria-required="true"
                  :aria-invalid="!!tokenFormErrors.value"
                  :aria-describedby="tokenFormErrors.value ? `token-value-error-${tokenForm.$type}` : `token-value-hint-${tokenForm.$type}`"
                />
              </div>
              <p v-if="tokenFormErrors.value" :id="`token-value-error-${tokenForm.$type}`" class="text-xs mt-1 text-red-500" role="alert">
                {{ tokenFormErrors.value }}
              </p>
              <p v-else :id="`token-value-hint-${tokenForm.$type}`" class="text-xs mt-1 sr-only" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                {{ getValueHint(tokenForm.$type) }}
              </p>
            </div>

            <!-- Token Description -->
            <div>
              <label for="token-description-textarea" class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                Description
              </label>
              <textarea
                id="token-description-textarea"
                v-model="tokenForm.$description"
                rows="3"
                placeholder="Optional description for this token"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                :class="isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'"
                aria-label="Optional description for this token"
              ></textarea>
            </div>

            <!-- Extensions (for aliases/references) -->
            <div v-if="tokenForm.$type === 'color'">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="tokenForm.useAlias"
                  type="checkbox"
                  class="w-4 h-4 rounded"
                  :class="isDarkMode ? 'accent-indigo-500' : 'accent-indigo-600'"
                />
                <span class="text-sm font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Reference another token (alias)
                </span>
              </label>
              <input
                v-if="tokenForm.useAlias"
                v-model="tokenForm.$value"
                type="text"
                placeholder="{color.primary.500}"
                class="w-full mt-2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono text-sm"
                :class="isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'"
              />
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button
              @click="closeTokenModal"
              class="px-4 py-2 border rounded-lg transition-colors"
              :class="isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-slate-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'"
            >
              Cancel
            </button>
            <button
              @click="saveToken"
              :disabled="!tokenForm.name || !tokenForm.$type || !tokenForm.$value"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ editingToken ? 'Update' : 'Create' }} Token
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Category Modal -->
    <div
      v-if="showAddCategoryModal"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      @click.self="showAddCategoryModal = false"
      @keydown.escape="showAddCategoryModal = false"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-category-title"
    >
      <div 
        class="rounded-lg shadow-xl max-w-md w-full"
        :class="isDarkMode ? 'bg-slate-900' : 'bg-white'"
      >
        <div 
          class="p-6 border-b"
          :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'"
        >
          <div class="flex items-center justify-between">
            <h3 id="add-category-title" class="text-xl font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              Add Category
            </h3>
            <button
              @click="showAddCategoryModal = false"
              class="p-2 rounded-lg transition-colors"
              :class="isDarkMode ? 'text-gray-400 hover:text-gray-300 hover:bg-slate-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'"
              aria-label="Close modal"
            >
              <span class="material-symbols-outlined" aria-hidden="true">close</span>
            </button>
          </div>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div>
              <label for="category-name-input" class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                Category Name <span class="text-red-500" aria-label="required">*</span>
              </label>
              <input
                id="category-name-input"
                v-model="newCategoryName"
                type="text"
                placeholder="e.g., Border Radius"
                @blur="validateCategoryName"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                :class="[
                  isDarkMode 
                    ? (categoryFormErrors.name ? 'border-red-500 bg-slate-700 text-white' : 'border-gray-600 bg-slate-700 text-white')
                    : (categoryFormErrors.name ? 'border-red-500 bg-white text-gray-900' : 'border-gray-300 bg-white text-gray-900')
                ]"
                aria-required="true"
                :aria-invalid="!!categoryFormErrors.name"
                :aria-describedby="categoryFormErrors.name ? 'category-name-error' : undefined"
              />
              <p v-if="categoryFormErrors.name" id="category-name-error" class="text-xs mt-1 text-red-500" role="alert">
                {{ categoryFormErrors.name }}
              </p>
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button
              @click="showAddCategoryModal = false"
              class="px-4 py-2 border rounded-lg transition-colors"
              :class="isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-slate-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'"
            >
              Cancel
            </button>
            <button
              @click="addCategory"
              :disabled="!newCategoryName"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Category
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Save to Library Modal -->
    <div
      v-if="showSaveModal"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      @click.self="showSaveModal = false"
      @keydown.escape="showSaveModal = false"
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-library-title"
    >
      <div 
        class="rounded-lg shadow-xl max-w-md w-full"
        :class="isDarkMode ? 'bg-slate-900' : 'bg-white'"
      >
        <div 
          class="p-6 border-b"
          :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'"
        >
          <div class="flex items-center justify-between">
            <h3 id="save-library-title" class="text-xl font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              Save to Style Library
            </h3>
            <button
              @click="showSaveModal = false"
              class="p-2 rounded-lg transition-colors"
              :class="isDarkMode ? 'text-gray-400 hover:text-gray-300 hover:bg-slate-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'"
              aria-label="Close modal"
            >
              <span class="material-symbols-outlined" aria-hidden="true">close</span>
            </button>
          </div>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div>
              <label for="dictionary-name-input" class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                Dictionary Name <span class="text-red-500" aria-label="required">*</span>
              </label>
              <input
                id="dictionary-name-input"
                v-model="saveDictionaryName"
                type="text"
                placeholder="e.g., Brand Colors 2024"
                @blur="validateSaveDictionaryName"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                :class="[
                  isDarkMode 
                    ? (saveFormErrors.name ? 'border-red-500 bg-slate-700 text-white' : 'border-gray-600 bg-slate-700 text-white')
                    : (saveFormErrors.name ? 'border-red-500 bg-white text-gray-900' : 'border-gray-300 bg-white text-gray-900')
                ]"
                aria-required="true"
                :aria-invalid="!!saveFormErrors.name"
                :aria-describedby="saveFormErrors.name ? 'dictionary-name-error' : undefined"
              />
              <p v-if="saveFormErrors.name" id="dictionary-name-error" class="text-xs mt-1 text-red-500" role="alert">
                {{ saveFormErrors.name }}
              </p>
            </div>
            <div>
              <label for="dictionary-description-textarea" class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                Description
              </label>
              <textarea
                id="dictionary-description-textarea"
                v-model="saveDictionaryDescription"
                rows="3"
                placeholder="Optional description for this style dictionary"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                :class="isDarkMode ? 'border-gray-600 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-900'"
              ></textarea>
            </div>
            <div class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
              <span class="font-medium">{{ tokens.length }}</span> tokens will be saved
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button
              @click="showSaveModal = false"
              class="px-4 py-2 border rounded-lg transition-colors"
              :class="isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-slate-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'"
            >
              Cancel
            </button>
            <button
              @click="saveToLibrary"
              :disabled="!saveDictionaryName || tokens.length === 0"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save to Library
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute } from 'vue-router';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';

const route = useRoute();

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const selectedCategory = ref('color');
const showAddTokenModal = ref(false);
const showAddCategoryModal = ref(false);
const showSaveModal = ref(false);
const editingToken = ref(null);
const newCategoryName = ref('');
const saveDictionaryName = ref('');
const saveDictionaryDescription = ref('');
const isLoading = ref(true);

// Form validation errors
const tokenFormErrors = ref({
  name: '',
  type: '',
  value: ''
});

const categoryFormErrors = ref({
  name: ''
});

const saveFormErrors = ref({
  name: ''
});

const categories = ref([
  { id: 'color', name: 'Colors', icon: 'palette' },
  { id: 'spacing', name: 'Spacing', icon: 'space_dashboard' },
  { id: 'typography', name: 'Typography', icon: 'text_fields' },
  { id: 'shadow', name: 'Shadows', icon: 'layers' },
  { id: 'border', name: 'Borders', icon: 'border_style' },
  { id: 'radius', name: 'Border Radius', icon: 'radio_button_checked' },
  { id: 'opacity', name: 'Opacity', icon: 'opacity' },
  { id: 'duration', name: 'Duration', icon: 'schedule' },
]);

const tokens = ref([
  // Example tokens
  {
    id: '1',
    name: 'color.primary.500',
    category: 'color',
    $type: 'color',
    $value: '#6366f1',
    $description: 'Primary brand color'
  },
  {
    id: '2',
    name: 'spacing.small',
    category: 'spacing',
    $type: 'dimension',
    $value: '8px',
    $description: 'Small spacing unit'
  }
]);

const tokenForm = ref({
  name: '',
  category: '',
  $type: 'color',
  $value: '',
  $description: '',
  useAlias: false
});

const filteredTokens = computed(() => {
  return tokens.value.filter(token => {
    const tokenCategory = token.category || getCategoryFromTokenName(token.name);
    return tokenCategory === selectedCategory.value;
  });
});

const getCategoryTokenCount = (categoryId) => {
  return tokens.value.filter(token => {
    const tokenCategory = token.category || getCategoryFromTokenName(token.name);
    return tokenCategory === categoryId;
  }).length;
};

const getCategoryName = (categoryId) => {
  const category = categories.value.find(c => c.id === categoryId);
  return category ? category.name : 'All';
};

const getCategoryIcon = (categoryId) => {
  const category = categories.value.find(c => c.id === categoryId);
  return category ? category.icon : 'style';
};

const getCategoryFromTokenName = (name) => {
  const parts = name.split('.');
  return parts[0] || 'other';
};

const getCategoryButtonClass = (categoryId) => {
  const isSelected = selectedCategory.value === categoryId;
  if (isSelected) {
    return isDarkMode.value 
      ? 'bg-indigo-900/30 text-indigo-300 border-l-2 border-indigo-400' 
      : 'bg-indigo-50 text-indigo-700 border-l-2 border-indigo-600';
  }
  return isDarkMode.value
    ? 'text-gray-400 hover:text-gray-300 hover:bg-slate-800' 
    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50';
};

const getTokenValue = (token) => {
  if (token.$value && token.$value.startsWith('{') && token.$value.endsWith('}')) {
    // This is an alias/reference
    return token.$value;
  }
  return token.$value || '';
};

const getTokenType = (token) => {
  return token.$type || 'string';
};

const getTokenDescription = (token) => {
  return token.$description || '';
};

const getTokenIcon = (type) => {
  const icons = {
    color: 'palette',
    dimension: 'straighten',
    fontFamily: 'text_fields',
    fontWeight: 'format_bold',
    duration: 'schedule',
    cubicBezier: 'timeline',
    number: 'numbers',
    string: 'text_fields'
  };
  return icons[type] || 'style';
};

const getValuePlaceholder = (type) => {
  const placeholders = {
    color: '#6366f1',
    dimension: '16px',
    fontFamily: 'Inter, sans-serif',
    fontWeight: '400',
    duration: '200ms',
    cubicBezier: '0.4, 0.0, 0.2, 1',
    number: '1.5',
    string: 'value'
  };
  return placeholders[type] || '';
};

const getValueHint = (type) => {
  const hints = {
    color: 'Hex, RGB, HSL, or reference another token with {token.name}',
    dimension: 'Value with unit (px, rem, em, etc.)',
    fontFamily: 'Font family name or stack',
    fontWeight: 'Numeric weight (100-900)',
    duration: 'Time value with unit (ms, s)',
    cubicBezier: 'Four comma-separated values (0.4, 0.0, 0.2, 1)',
    number: 'Numeric value',
    string: 'Text value'
  };
  return hints[type] || '';
};

// Validation functions
const validateTokenName = () => {
  if (!tokenForm.value.name || tokenForm.value.name.trim() === '') {
    tokenFormErrors.value.name = 'Token name is required';
  } else if (!tokenForm.value.name.match(/^[a-zA-Z][a-zA-Z0-9._-]*$/)) {
    tokenFormErrors.value.name = 'Token name must start with a letter and contain only letters, numbers, dots, underscores, or hyphens';
  } else {
    tokenFormErrors.value.name = '';
  }
};

const validateTokenValue = () => {
  if (!tokenForm.value.$value || tokenForm.value.$value.trim() === '') {
    tokenFormErrors.value.value = 'Token value is required';
  } else {
    tokenFormErrors.value.value = '';
  }
};

const validateCategoryName = () => {
  if (!newCategoryName.value || newCategoryName.value.trim() === '') {
    categoryFormErrors.value.name = 'Category name is required';
  } else if (categories.value.some(c => c.name.toLowerCase() === newCategoryName.value.toLowerCase())) {
    categoryFormErrors.value.name = 'A category with this name already exists';
  } else {
    categoryFormErrors.value.name = '';
  }
};

const validateSaveDictionaryName = () => {
  if (!saveDictionaryName.value || saveDictionaryName.value.trim() === '') {
    saveFormErrors.value.name = 'Dictionary name is required';
  } else {
    saveFormErrors.value.name = '';
  }
};

const editToken = (token) => {
  editingToken.value = token;
  tokenForm.value = {
    name: token.name,
    category: token.category || getCategoryFromTokenName(token.name),
    $type: token.$type,
    $value: token.$value,
    $description: token.$description || '',
    useAlias: token.$value && token.$value.startsWith('{') && token.$value.endsWith('}')
  };
  showAddTokenModal.value = true;
};

const deleteToken = (tokenId) => {
  if (confirm('Are you sure you want to delete this token?')) {
    const index = tokens.value.findIndex(t => t.id === tokenId);
    if (index > -1) {
      tokens.value.splice(index, 1);
      saveTokensToStorage();
    }
  }
};

const saveToken = () => {
  // Validate all fields
  validateTokenName();
  validateTokenValue();
  
  if (tokenFormErrors.value.name || tokenFormErrors.value.value || !tokenForm.value.name || !tokenForm.value.$type || !tokenForm.value.$value) {
    return;
  }

  const tokenData = {
    id: editingToken.value?.id || Date.now().toString(),
    name: tokenForm.value.name,
    category: selectedCategory.value,
    $type: tokenForm.value.$type,
    $value: tokenForm.value.$value,
    $description: tokenForm.value.$description || undefined
  };

  if (editingToken.value) {
    const index = tokens.value.findIndex(t => t.id === editingToken.value.id);
    if (index > -1) {
      tokens.value[index] = tokenData;
    }
  } else {
    tokens.value.push(tokenData);
  }

  saveTokensToStorage();
  closeTokenModal();
};

const closeTokenModal = () => {
  showAddTokenModal.value = false;
  editingToken.value = null;
  // Reset errors
  tokenFormErrors.value = { name: '', type: '', value: '' };
  tokenForm.value = {
    name: '',
    category: '',
    $type: 'color',
    $value: '',
    $description: '',
    useAlias: false
  };
};

const addCategory = () => {
  validateCategoryName();
  if (categoryFormErrors.value.name || !newCategoryName.value) return;
  
  const newCategory = {
    id: newCategoryName.value.toLowerCase().replace(/\s+/g, '-'),
    name: newCategoryName.value,
    icon: 'folder'
  };
  
  categories.value.push(newCategory);
  newCategoryName.value = '';
  categoryFormErrors.value.name = ''; // Reset errors
  showAddCategoryModal.value = false;
  saveCategoriesToStorage();
};

const saveToLibrary = () => {
  validateSaveDictionaryName();
  if (saveFormErrors.value.name || !saveDictionaryName.value || tokens.value.length === 0) return;
  
  const dictionaries = JSON.parse(localStorage.getItem('styleDictionaries') || '[]');
  
  // Check if we're updating an existing dictionary
  const dictionaryId = route.query.load;
  let dictionary;
  
  if (dictionaryId) {
    const index = dictionaries.findIndex(d => d.id === dictionaryId);
    if (index > -1) {
      // Update existing dictionary
      dictionary = dictionaries[index];
      dictionary.name = saveDictionaryName.value;
      dictionary.description = saveDictionaryDescription.value || '';
      dictionary.tokens = JSON.parse(JSON.stringify(tokens.value));
      dictionary.updatedAt = new Date().toISOString();
      dictionaries[index] = dictionary;
    }
  }
  
  if (!dictionary) {
    // Create new dictionary
    dictionary = {
      id: Date.now().toString(),
      name: saveDictionaryName.value,
      description: saveDictionaryDescription.value || '',
      tokens: JSON.parse(JSON.stringify(tokens.value)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      retired: false
    };
    dictionaries.push(dictionary);
  }
  
  localStorage.setItem('styleDictionaries', JSON.stringify(dictionaries));
  
  saveDictionaryName.value = '';
  saveDictionaryDescription.value = '';
  showSaveModal.value = false;
  
  alert(dictionaryId ? 'Style dictionary updated!' : 'Style dictionary saved to library!');
};

const loadTokensFromStorage = () => {
  isLoading.value = true;
  const stored = localStorage.getItem('designTokens');
  if (stored) {
    try {
      tokens.value = JSON.parse(stored);
    } catch (e) {
      console.error('Error loading tokens:', e);
    }
  }
  isLoading.value = false;
};

const saveCategoriesToStorage = () => {
  localStorage.setItem('tokenCategories', JSON.stringify(categories.value));
};

const loadCategoriesFromStorage = () => {
  const stored = localStorage.getItem('tokenCategories');
  if (stored) {
    try {
      const storedCategories = JSON.parse(stored);
      categories.value = [...categories.value, ...storedCategories.filter(c => !categories.value.find(existing => existing.id === c.id))];
    } catch (e) {
      console.error('Error loading categories:', e);
    }
  }
};

const exportTokens = async (format) => {
  // Convert tokens to DTCG format
  const dtcgTokens = convertToDTCGFormat(tokens.value);
  
  if (format === 'json') {
    downloadJSON(dtcgTokens, 'tokens.json');
    return;
  }

  try {
    let content = '';
    
    if (format === 'css') {
      content = exportToCSS(dtcgTokens);
    } else if (format === 'ios') {
      content = exportToIOS(dtcgTokens);
    } else if (format === 'android') {
      content = exportToAndroid(dtcgTokens);
    }
    
    downloadFile(content, `tokens.${getFileExtension(format)}`, getMimeType(format));
  } catch (error) {
    console.error('Export error:', error);
    alert('Error exporting tokens. Please check the console for details.');
  }
};

const importTokens = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        const importedTokens = convertFromDTCGFormat(importedData);
        
        // Merge with existing tokens (avoid duplicates)
        importedTokens.forEach(newToken => {
          const exists = tokens.value.find(t => t.name === newToken.name);
          if (!exists) {
            tokens.value.push(newToken);
          }
        });
        
        saveTokensToStorage();
        alert(`Imported ${importedTokens.length} token(s)`);
      } catch (error) {
        console.error('Import error:', error);
        alert('Error importing tokens. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };
  input.click();
};

const convertFromDTCGFormat = (dtcgData) => {
  const tokens = [];
  
  const flatten = (obj, prefix = '') => {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (value.$value !== undefined) {
        tokens.push({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: fullKey,
          category: getCategoryFromTokenName(fullKey),
          $type: value.$type || 'string',
          $value: value.$value,
          $description: value.$description
        });
      } else if (typeof value === 'object' && value !== null) {
        flatten(value, fullKey);
      }
    }
  };
  
  flatten(dtcgData);
  return tokens;
};

const convertToDTCGFormat = (tokens) => {
  const dtcg = {};
  
  tokens.forEach(token => {
    const parts = token.name.split('.');
    let current = dtcg;
    
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }
    
    const tokenData = {
      $value: token.$value,
      $type: token.$type
    };
    
    if (token.$description) {
      tokenData.$description = token.$description;
    }
    
    current[parts[parts.length - 1]] = tokenData;
  });
  
  return dtcg;
};

const exportToCSS = (tokens) => {
  let css = ':root {\n';
  
  const flattenTokens = (obj, prefix = '') => {
    const result = [];
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}-${key}` : key;
      if (value.$value !== undefined) {
        const cssVar = `--${fullKey.replace(/\./g, '-')}`;
        result.push(`  ${cssVar}: ${value.$value};`);
      } else if (typeof value === 'object' && value !== null) {
        result.push(...flattenTokens(value, fullKey));
      }
    }
    return result;
  };
  
  css += flattenTokens(tokens).join('\n');
  css += '\n}';
  
  return css;
};

const exportToIOS = (tokens) => {
  let plist = '<?xml version="1.0" encoding="UTF-8"?>\n';
  plist += '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n';
  plist += '<plist version="1.0">\n<dict>\n';
  
  const flattenTokens = (obj, prefix = '') => {
    const result = [];
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (value.$value !== undefined) {
        const tokenKey = fullKey.replace(/\./g, '_');
        let plistValue = value.$value;
        if (value.$type === 'color') {
          // Convert hex to RGB for iOS
          plistValue = convertHexToRGB(plistValue);
        }
        result.push(`  <key>${tokenKey}</key>\n  <string>${plistValue}</string>`);
      } else if (typeof value === 'object' && value !== null) {
        result.push(...flattenTokens(value, fullKey));
      }
    }
    return result;
  };
  
  plist += flattenTokens(tokens).join('\n');
  plist += '\n</dict>\n</plist>';
  
  return plist;
};

const exportToAndroid = (tokens) => {
  let xml = '<?xml version="1.0" encoding="utf-8"?>\n';
  xml += '<resources>\n';
  
  const flattenTokens = (obj, prefix = '') => {
    const result = [];
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}_${key}` : key;
      if (value.$value !== undefined) {
        const androidKey = fullKey.replace(/\./g, '_').replace(/-/g, '_');
        let androidValue = value.$value;
        if (value.$type === 'color') {
          androidValue = convertHexToAndroidColor(androidValue);
        } else if (value.$type === 'dimension') {
          androidValue = androidValue.replace('px', 'dp');
        }
        result.push(`  <color name="${androidKey}">${androidValue}</color>`);
      } else if (typeof value === 'object' && value !== null) {
        result.push(...flattenTokens(value, fullKey));
      }
    }
    return result;
  };
  
  xml += flattenTokens(tokens).join('\n');
  xml += '\n</resources>';
  
  return xml;
};

const convertHexToRGB = (hex) => {
  if (!hex.startsWith('#')) return hex;
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)}`;
};

const convertHexToAndroidColor = (hex) => {
  if (!hex.startsWith('#')) return hex;
  // Android uses #AARRGGBB format
  if (hex.length === 7) {
    return `#FF${hex.slice(1)}`;
  }
  return hex;
};

const getFileExtension = (format) => {
  const extensions = {
    css: 'css',
    ios: 'plist',
    android: 'xml',
    json: 'json'
  };
  return extensions[format] || 'json';
};

const getMimeType = (format) => {
  const mimeTypes = {
    css: 'text/css',
    ios: 'application/xml',
    android: 'application/xml',
    json: 'application/json'
  };
  return mimeTypes[format] || 'application/json';
};

const downloadJSON = (data, filename) => {
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, filename, 'application/json');
};

const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

let darkModeObserver = null;
let darkModeInterval = null;

const loadDictionaryFromLibrary = (dictionaryId) => {
  try {
    isLoading.value = true;
    const dictionaries = JSON.parse(localStorage.getItem('styleDictionaries') || '[]');
    const dictionary = dictionaries.find(d => d.id === dictionaryId || d.id === String(dictionaryId));
    
    if (dictionary && dictionary.tokens) {
      tokens.value = JSON.parse(JSON.stringify(dictionary.tokens));
      saveDictionaryName.value = dictionary.name || '';
      saveDictionaryDescription.value = dictionary.description || '';
      saveTokensToStorage();
      isLoading.value = false;
      return true;
    } else {
      console.warn('Dictionary not found:', dictionaryId);
      // Fall back to loading from storage
      loadTokensFromStorage();
      isLoading.value = false;
      return false;
    }
  } catch (error) {
    console.error('Error loading dictionary:', error);
    loadTokensFromStorage();
    isLoading.value = false;
    return false;
  }
};

let isInitialLoad = true;

watch(() => route.query.load, (dictionaryId) => {
  if (dictionaryId) {
    loadDictionaryFromLibrary(dictionaryId);
  } else if (!isInitialLoad) {
    // Only reset if this is a navigation change, not initial load
    loadTokensFromStorage();
  }
});

onMounted(() => {
  isLoading.value = true;
  // Check if we should load a dictionary from the library
  const dictionaryId = route.query.load;
  if (dictionaryId) {
    loadDictionaryFromLibrary(dictionaryId);
  } else {
    loadTokensFromStorage();
  }
  
  loadCategoriesFromStorage();
  isInitialLoad = false;
  
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

