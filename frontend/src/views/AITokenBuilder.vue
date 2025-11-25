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
                      AI Token Studio
                    </h1>
                    <span class="px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-300 border border-green-400/30">
                      DTCG Compliant
                    </span>
                  </div>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-4">
                    Create and manage design tokens for AI agents and GenAI applications. Standardize agent identity, confidence indicators, explainability, risk management, and more.
                  </p>
                  <div class="flex items-center gap-4 text-sm text-white/70">
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">smart_toy</span>
                      AI & GenAI
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
                        <linearGradient id="aiTokenStudioGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- AI-themed illustration: Neural network / connected nodes -->
                      <!-- Central node -->
                      <circle cx="100" cy="100" r="25" fill="url(#aiTokenStudioGradient)" opacity="0.8"/>
                      <circle cx="100" cy="100" r="15" fill="url(#aiTokenStudioGradient)" opacity="0.6"/>
                      
                      <!-- Surrounding nodes -->
                      <circle cx="50" cy="50" r="12" fill="url(#aiTokenStudioGradient)" opacity="0.6"/>
                      <circle cx="150" cy="50" r="12" fill="url(#aiTokenStudioGradient)" opacity="0.6"/>
                      <circle cx="50" cy="150" r="12" fill="url(#aiTokenStudioGradient)" opacity="0.6"/>
                      <circle cx="150" cy="150" r="12" fill="url(#aiTokenStudioGradient)" opacity="0.6"/>
                      <circle cx="100" cy="30" r="10" fill="url(#aiTokenStudioGradient)" opacity="0.5"/>
                      <circle cx="100" cy="170" r="10" fill="url(#aiTokenStudioGradient)" opacity="0.5"/>
                      <circle cx="30" cy="100" r="10" fill="url(#aiTokenStudioGradient)" opacity="0.5"/>
                      <circle cx="170" cy="100" r="10" fill="url(#aiTokenStudioGradient)" opacity="0.5"/>
                      
                      <!-- Connection lines -->
                      <line x1="100" y1="100" x2="50" y2="50" stroke="url(#aiTokenStudioGradient)" stroke-width="2" opacity="0.3"/>
                      <line x1="100" y1="100" x2="150" y2="50" stroke="url(#aiTokenStudioGradient)" stroke-width="2" opacity="0.3"/>
                      <line x1="100" y1="100" x2="50" y2="150" stroke="url(#aiTokenStudioGradient)" stroke-width="2" opacity="0.3"/>
                      <line x1="100" y1="100" x2="150" y2="150" stroke="url(#aiTokenStudioGradient)" stroke-width="2" opacity="0.3"/>
                      <line x1="100" y1="100" x2="100" y2="30" stroke="url(#aiTokenStudioGradient)" stroke-width="2" opacity="0.3"/>
                      <line x1="100" y1="100" x2="100" y2="170" stroke="url(#aiTokenStudioGradient)" stroke-width="2" opacity="0.3"/>
                      <line x1="100" y1="100" x2="30" y2="100" stroke="url(#aiTokenStudioGradient)" stroke-width="2" opacity="0.3"/>
                      <line x1="100" y1="100" x2="170" y2="100" stroke="url(#aiTokenStudioGradient)" stroke-width="2" opacity="0.3"/>
                      
                      <!-- Additional small nodes for depth -->
                      <circle cx="75" cy="75" r="6" fill="url(#aiTokenStudioGradient)" opacity="0.4"/>
                      <circle cx="125" cy="75" r="6" fill="url(#aiTokenStudioGradient)" opacity="0.4"/>
                      <circle cx="75" cy="125" r="6" fill="url(#aiTokenStudioGradient)" opacity="0.4"/>
                      <circle cx="125" cy="125" r="6" fill="url(#aiTokenStudioGradient)" opacity="0.4"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Main Content -->
          <div class="max-w-7xl mx-auto">
            <div class="grid lg:grid-cols-4 gap-6">
              <!-- Left Sidebar: AI Token Categories -->
              <div class="lg:col-span-1">
                <div 
                  class="rounded-lg border p-6 sticky top-8"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <div class="mb-6">
                    <h2 class="text-lg font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      <span class="material-symbols-outlined text-base text-indigo-600">category</span>
                      AI Token Categories
                    </h2>
                  </div>
                  
                  <div class="space-y-1">
                    <button
                      v-for="category in aiCategories"
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
                    <h3 class="text-sm font-semibold mb-3 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      <span class="material-symbols-outlined text-base text-indigo-600">swap_horiz</span>
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
                      <h2 class="text-xl font-semibold mb-1 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                        <span class="material-symbols-outlined text-lg text-indigo-600">{{ getCategoryIcon(selectedCategory) }}</span>
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
            <h3 :id="editingToken ? 'edit-token-title' : 'add-token-title'" class="text-xl font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              <span class="material-symbols-outlined text-lg text-indigo-600">{{ editingToken ? 'edit' : 'add' }}</span>
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
            <!-- Category Info -->
            <div class="mb-4 p-3 rounded-lg" :class="isDarkMode ? 'bg-slate-800' : 'bg-indigo-50'">
              <p class="text-sm font-medium mb-1" :class="isDarkMode ? 'text-indigo-300' : 'text-indigo-700'">
                Category: {{ getCategoryName(selectedCategory) }}
              </p>
              <p class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                {{ getCategoryDescription(selectedCategory) }}
              </p>
            </div>

            <!-- Token Template Selector -->
            <div v-if="availableTemplates.length > 0 && !editingToken" class="mb-4">
              <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                Create from Template
              </label>
              <div class="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 rounded-lg border" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'">
                <button
                  v-for="template in availableTemplates"
                  :key="template.name"
                  @click="createFromTemplate(template)"
                  :disabled="existingTokenNames.includes(getCategoryPrefix(selectedCategory) + template.name)"
                  class="text-left px-3 py-2 rounded text-sm transition-colors"
                  :class="existingTokenNames.includes(getCategoryPrefix(selectedCategory) + template.name)
                    ? (isDarkMode ? 'bg-slate-700 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')
                    : (isDarkMode ? 'bg-slate-700 text-gray-300 hover:bg-slate-600 hover:text-white' : 'bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 border border-gray-200')"
                >
                  <div class="font-mono text-xs mb-1">{{ template.name }}</div>
                  <div class="text-xs opacity-75">{{ template.description }}</div>
                  <span v-if="existingTokenNames.includes(getCategoryPrefix(selectedCategory) + template.name)" class="text-xs text-green-500 ml-2">✓ Created</span>
                </button>
              </div>
              <div class="mt-2 pt-2 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                <button
                  @click="tokenForm.fromTemplate = false"
                  class="text-sm text-indigo-600 hover:text-indigo-700"
                  :class="isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : ''"
                >
                  Or create custom token
                </button>
              </div>
            </div>

            <!-- Custom Token Name (shown when not using template) -->
            <div v-if="!tokenForm.fromTemplate">
              <!-- Token Name -->
              <div>
                <label for="token-name-input" class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Token Name <span class="text-red-500" aria-label="required">*</span>
                </label>
                <div class="flex items-center gap-2">
                  <span class="text-sm font-mono px-2 py-1 rounded" :class="isDarkMode ? 'bg-slate-800 text-gray-400' : 'bg-gray-100 text-gray-600'">
                    {{ getCategoryPrefix(selectedCategory) }}
                  </span>
                  <input
                    id="token-name-input"
                    v-model="tokenForm.name"
                    type="text"
                    :placeholder="getTokenNamePlaceholder(selectedCategory)"
                    @blur="validateTokenName"
                    class="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono text-sm"
                    :class="[
                      isDarkMode 
                        ? (tokenFormErrors.name ? 'border-red-500 bg-slate-700 text-white' : 'border-gray-600 bg-slate-700 text-white')
                        : (tokenFormErrors.name ? 'border-red-500 bg-white text-gray-900' : 'border-gray-300 bg-white text-gray-900')
                    ]"
                    aria-required="true"
                    :aria-invalid="!!tokenFormErrors.name"
                    :aria-describedby="tokenFormErrors.name ? 'token-name-error' : 'token-name-hint'"
                  />
                </div>
                <p v-if="tokenFormErrors.name" id="token-name-error" class="text-xs mt-1 text-red-500" role="alert">
                  {{ tokenFormErrors.name }}
                </p>
                <p v-else id="token-name-hint" class="text-xs mt-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                  Full name will be: <code class="font-mono">{{ getCategoryPrefix(selectedCategory) }}{{ tokenForm.name || '...' }}</code>
                </p>
              </div>
            </div>
            <!-- Template Token Name (read-only when using template) -->
            <div v-else class="mb-4 p-3 rounded-lg" :class="isDarkMode ? 'bg-slate-800' : 'bg-indigo-50'">
              <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                Token Name
              </label>
              <code class="text-sm font-mono" :class="isDarkMode ? 'text-indigo-300' : 'text-indigo-700'">
                {{ getCategoryPrefix(selectedCategory) }}{{ tokenForm.name }}
              </code>
            </div>

            <!-- Token Type -->
            <div>
              <label for="token-type-select" class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                Type <span class="text-red-500" aria-label="required">*</span>
              </label>
              <Dropdown
                id="token-type-select"
                v-model="tokenForm.$type"
                :options="tokenTypeOptions"
                :is-dark-mode="isDarkMode"
              />
            </div>

            <!-- Token Value -->
            <div>
              <label for="token-value-input" class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                Value <span class="text-red-500" aria-label="required">*</span>
              </label>
              <div class="flex items-center gap-3">
                <button
                  v-if="tokenForm.$type === 'color'"
                  @click="openColorPicker($event)"
                  class="w-16 h-12 rounded border-2 cursor-pointer transition-colors flex-shrink-0"
                  :class="isDarkMode 
                    ? 'border-gray-600 hover:border-indigo-400' 
                    : 'border-gray-300 hover:border-indigo-500'"
                  :style="{ backgroundColor: tokenForm.$value || '#000000' }"
                  title="Pick color"
                  aria-label="Open color picker"
                ></button>
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
              <p v-else :id="`token-value-hint-${tokenForm.$type}`" class="text-xs mt-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
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
                placeholder="e.g., AI Tokens 2024"
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

    <!-- Color Picker -->
    <ColorPicker
      :show="showColorPicker"
      :initial-color="pickerColor"
      :position="pickerPosition"
      @update:show="showColorPicker = $event"
      @apply="handleColorPickerApply"
      @cancel="showColorPicker = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute } from 'vue-router';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import { useDrawer } from '../composables/useDrawer.js';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import Dropdown from '../components/Dropdown.vue';
import ColorPicker from '../components/ColorPicker.vue';

const route = useRoute();

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const { drawerOpen, closeDrawer, toggleDrawer } = useDrawer();
const selectedCategory = ref('agent-identity');
const showAddTokenModal = ref(false);
const showSaveModal = ref(false);
const editingToken = ref(null);
const saveDictionaryName = ref('');
const saveDictionaryDescription = ref('');

// Form validation errors
const tokenFormErrors = ref({
  name: '',
  type: '',
  value: ''
});

const saveFormErrors = ref({
  name: ''
});

// Color picker state
const showColorPicker = ref(false);
const pickerColor = ref('#000000');
const pickerPosition = ref({ left: 0, top: 0 });

// Token type options for dropdown
const tokenTypeOptions = [
  { label: 'Color', value: 'color' },
  { label: 'Dimension', value: 'dimension' },
  { label: 'Font Family', value: 'fontFamily' },
  { label: 'Font Weight', value: 'fontWeight' },
  { label: 'Duration', value: 'duration' },
  { label: 'Cubic Bezier', value: 'cubicBezier' },
  { label: 'Number', value: 'number' },
  { label: 'String', value: 'string' },
];

// AI Token Templates - specific tokens for each category
const aiTokenTemplates = {
  'agent-identity': [
    { name: 'id', type: 'string', description: 'Agent identifier' },
    { name: 'name', type: 'string', description: 'Agent name' },
    { name: 'role', type: 'string', description: 'Agent role (e.g., researcher, planner, classifier, summarizer)' },
    { name: 'persona.tone', type: 'string', description: 'Persona tone (e.g., formal/supportive/direct/brief)' },
    { name: 'persona.avatar', type: 'string', description: 'Persona avatar (SVG or raster)' },
    { name: 'badge.shape', type: 'string', description: 'Badge shape' },
    { name: 'badge.color', type: 'color', description: 'Badge color' },
    { name: 'trustLevel', type: 'number', description: 'Trust level (numeric or categorical)' }
  ],
  'confidence': [
    { name: 'level', type: 'number', description: 'Confidence level (0–1)' },
    { name: 'color.low', type: 'color', description: 'Color for low confidence' },
    { name: 'color.medium', type: 'color', description: 'Color for medium confidence' },
    { name: 'color.high', type: 'color', description: 'Color for high confidence' },
    { name: 'pattern', type: 'string', description: 'Pattern to signal uncertainty (dot/stripe/gradient)' },
    { name: 'iconography.low', type: 'string', description: 'Iconography for low confidence' },
    { name: 'iconography.high', type: 'string', description: 'Iconography for high confidence' },
    { name: 'animation', type: 'string', description: 'Animation for uncertain state (gentle pulse)' }
  ],
  'explainability': [
    { name: 'summaryStyle', type: 'string', description: 'Summary style' },
    { name: 'highlightColor', type: 'color', description: 'Highlight color for explanations' },
    { name: 'annotationShape', type: 'string', description: 'Annotation shape' },
    { name: 'stepIndicator.color', type: 'color', description: 'Step indicator color' },
    { name: 'stepIndicator.size', type: 'dimension', description: 'Step indicator size' },
    { name: 'callout.background', type: 'color', description: 'Callout background color' }
  ],
  'risk-safety': [
    { name: 'level', type: 'number', description: 'Risk level' },
    { name: 'color.low', type: 'color', description: 'Color for low risk' },
    { name: 'color.med', type: 'color', description: 'Color for medium risk' },
    { name: 'color.high', type: 'color', description: 'Color for high risk' },
    { name: 'color.critical', type: 'color', description: 'Color for critical risk' },
    { name: 'banner.style', type: 'string', description: 'Risk banner style' },
    { name: 'icon.warning', type: 'string', description: 'Warning icon' },
    { name: 'blocked.actionColor', type: 'color', description: 'Color for blocked actions' },
    { name: 'safety.disallowedContent.pattern', type: 'string', description: 'Pattern for disallowed content' },
    { name: 'safety.feedbackRequired', type: 'string', description: 'Feedback required indicator (boolean)' }
  ],
  'prompting': [
    { name: 'input.background', type: 'color', description: 'Prompt input background' },
    { name: 'input.placeholder', type: 'string', description: 'Prompt input placeholder' },
    { name: 'input.syntaxHighlighting', type: 'string', description: 'Syntax highlighting style' },
    { name: 'template.color', type: 'color', description: 'Prompt template color' },
    { name: 'tokenLimit.indicatorColor', type: 'color', description: 'Token limit indicator color' },
    { name: 'roleSystem.color', type: 'color', description: 'System role color' },
    { name: 'roleUser.color', type: 'color', description: 'User role color' },
    { name: 'roleAgent.color', type: 'color', description: 'Agent role color' }
  ],
  'message-state': [
    { name: 'thinking.color', type: 'color', description: 'Thinking state color' },
    { name: 'thinking.animation', type: 'string', description: 'Thinking animation (ellipsis, shimmer, pulse)' },
    { name: 'toolUse.color', type: 'color', description: 'Tool use state color' },
    { name: 'toolUse.icon', type: 'string', description: 'Tool use icon' },
    { name: 'streaming.cursorColor', type: 'color', description: 'Streaming cursor color' },
    { name: 'error.background', type: 'color', description: 'Error state background' },
    { name: 'error.borderColor', type: 'color', description: 'Error state border color' }
  ],
  'citation': [
    { name: 'badge.color', type: 'color', description: 'Citation badge color' },
    { name: 'badge.icon', type: 'string', description: 'Citation badge icon' },
    { name: 'number.color', type: 'color', description: 'Citation number color' },
    { name: 'hoverCard.background', type: 'color', description: 'Citation hover card background' },
    { name: 'provenance.sourceTypeColor.web', type: 'color', description: 'Web source type color' },
    { name: 'provenance.sourceTypeColor.pdf', type: 'color', description: 'PDF source type color' },
    { name: 'provenance.sourceTypeColor.image', type: 'color', description: 'Image source type color' },
    { name: 'provenance.sourceTypeColor.database', type: 'color', description: 'Database source type color' },
    { name: 'provenance.confidenceIndicator', type: 'string', description: 'Provenance confidence indicator' }
  ],
  'memory': [
    { name: 'shortTerm.icon', type: 'string', description: 'Short-term memory icon' },
    { name: 'shortTerm.badge.color', type: 'color', description: 'Short-term memory badge color' },
    { name: 'longTerm.icon', type: 'string', description: 'Long-term memory icon' },
    { name: 'longTerm.badge.color', type: 'color', description: 'Long-term memory badge color' },
    { name: 'memoryConflict.color', type: 'color', description: 'Memory conflict color' },
    { name: 'userEditable.background', type: 'color', description: 'User editable memory background' }
  ],
  'human-ai-teaming': [
    { name: 'hitl.requiredIndicator.color', type: 'color', description: 'HITL required indicator color' },
    { name: 'hotl.alert.style', type: 'string', description: 'HOTL alert style' },
    { name: 'ai.handoff.step.color', type: 'color', description: 'AI handoff step color' },
    { name: 'ai.handoff.callout.background', type: 'color', description: 'AI handoff callout background' },
    { name: 'ai.handoff.requiredAction.icon', type: 'string', description: 'AI handoff required action icon' }
  ],
  'safety-boundary': [
    { name: 'softLimit.color', type: 'color', description: 'Soft limit color' },
    { name: 'hardLimit.color', type: 'color', description: 'Hard limit color' },
    { name: 'animation', type: 'string', description: 'Boundary animation' },
    { name: 'moderation.flag.color', type: 'color', description: 'Moderation flag color' },
    { name: 'moderation.breakGlass.background', type: 'color', description: 'Break glass background color' }
  ],
  'model-behavior': [
    { name: 'type', type: 'string', description: 'Behavior type (reasoning | planning | retrieval | action)' },
    { name: 'color.reasoning', type: 'color', description: 'Reasoning behavior color' },
    { name: 'color.retrieval', type: 'color', description: 'Retrieval behavior color' },
    { name: 'color.action', type: 'color', description: 'Action behavior color' },
    { name: 'traceLine.color', type: 'color', description: 'Trace line color' },
    { name: 'traceNode.shape', type: 'string', description: 'Trace node shape' }
  ],
  'multi-agent': [
    { name: 'lineColor', type: 'color', description: 'Agent interaction line color' },
    { name: 'lineStyle', type: 'string', description: 'Line style (dotted, dashed, braided)' },
    { name: 'priority.color', type: 'color', description: 'Priority color' },
    { name: 'assignmentTag.background', type: 'color', description: 'Assignment tag background' }
  ]
};

// AI Token Categories with definitions
const aiCategories = ref([
  {
    id: 'agent-identity',
    name: 'Agent Identity',
    icon: 'smart_toy',
    prefix: 'agent.',
    description: 'Represent agent personality, role, trust profile, and visual identity'
  },
  {
    id: 'confidence',
    name: 'Confidence & Uncertainty',
    icon: 'trending_up',
    prefix: 'ai.confidence.',
    description: 'Visual and behavioral representation of model uncertainty'
  },
  {
    id: 'explainability',
    name: 'Explainability',
    icon: 'lightbulb',
    prefix: 'ai.explainability.',
    description: 'Standardizing how explanations appear'
  },
  {
    id: 'risk-safety',
    name: 'Risk & Safety',
    icon: 'shield',
    prefix: 'ai.risk.',
    description: 'GenAI guardrails and HOTL/HITL patterns'
  },
  {
    id: 'prompting',
    name: 'Prompting',
    icon: 'edit_note',
    prefix: 'prompt.',
    description: 'Tokens for chat UI and internal subsystem hints'
  },
  {
    id: 'message-state',
    name: 'Message State',
    icon: 'chat_bubble',
    prefix: 'message.state.',
    description: 'Reflecting streaming, thinking, planning, and tool-use states'
  },
  {
    id: 'citation',
    name: 'Citation & Provenance',
    icon: 'link',
    prefix: 'citation.',
    description: 'Essential for compliance and transparency'
  },
  {
    id: 'memory',
    name: 'Memory',
    icon: 'memory',
    prefix: 'memory.',
    description: 'Short-term and long-term memory tokens'
  },
  {
    id: 'human-ai-teaming',
    name: 'Human-AI Teaming',
    icon: 'handshake',
    prefix: 'hitl.',
    description: 'HITL/HOTL UX guidance tokens'
  },
  {
    id: 'safety-boundary',
    name: 'Safety & Boundary',
    icon: 'warning',
    prefix: 'ai.boundary.',
    description: 'GenAI guardrail UI tokens'
  },
  {
    id: 'model-behavior',
    name: 'Model Behavior',
    icon: 'psychology',
    prefix: 'model.behavior.',
    description: 'MCP, LangChain, LangGraph agent states'
  },
  {
    id: 'multi-agent',
    name: 'Multi-Agent Interaction',
    icon: 'groups',
    prefix: 'agent.interaction.',
    description: 'Agent Crowd / Team-of-Agents design tokens'
  }
]);

const tokens = ref([]);

const tokenForm = ref({
  name: '',
  category: '',
  $type: 'color',
  $value: '',
  $description: '',
  useAlias: false,
  fromTemplate: false
});

const showTemplateSelector = ref(false);
const availableTemplates = computed(() => {
  return aiTokenTemplates[selectedCategory.value] || [];
});

const existingTokenNames = computed(() => {
  return filteredTokens.value.map(t => t.name);
});

const getTemplatesForCategory = (categoryId) => {
  return aiTokenTemplates[categoryId] || [];
};

const filteredTokens = computed(() => {
  return tokens.value.filter(token => {
    const tokenAiCategory = token.aiCategory || getCategoryFromTokenName(token.name);
    return tokenAiCategory === selectedCategory.value;
  });
});

const getCategoryTokenCount = (categoryId) => {
  return tokens.value.filter(token => {
    const tokenAiCategory = token.aiCategory || getCategoryFromTokenName(token.name);
    return tokenAiCategory === categoryId;
  }).length;
};

const getCategoryName = (categoryId) => {
  const category = aiCategories.value.find(c => c.id === categoryId);
  return category ? category.name : 'All';
};

const getCategoryIcon = (categoryId) => {
  const category = aiCategories.value.find(c => c.id === categoryId);
  return category ? category.icon : 'style';
};

const getCategoryDescription = (categoryId) => {
  const category = aiCategories.value.find(c => c.id === categoryId);
  return category ? category.description : '';
};

const getCategoryPrefix = (categoryId) => {
  const category = aiCategories.value.find(c => c.id === categoryId);
  return category ? category.prefix : '';
};

const getCategoryFromTokenName = (name) => {
  // Map token prefixes to category IDs
  if (name.startsWith('agent.') && !name.startsWith('agent.interaction.')) {
    return 'agent-identity';
  } else if (name.startsWith('agent.interaction.')) {
    return 'multi-agent';
  } else if (name.startsWith('ai.confidence.')) {
    return 'confidence';
  } else if (name.startsWith('ai.explainability.')) {
    return 'explainability';
  } else if (name.startsWith('ai.risk.') || name.startsWith('ai.safety.')) {
    return 'risk-safety';
  } else if (name.startsWith('prompt.')) {
    return 'prompting';
  } else if (name.startsWith('message.state.')) {
    return 'message-state';
  } else if (name.startsWith('citation.') || name.startsWith('provenance.')) {
    return 'citation';
  } else if (name.startsWith('memory.')) {
    return 'memory';
  } else if (name.startsWith('hitl.') || name.startsWith('hotl.') || name.startsWith('ai.handoff.')) {
    return 'human-ai-teaming';
  } else if (name.startsWith('ai.boundary.') || name.startsWith('ai.moderation.')) {
    return 'safety-boundary';
  } else if (name.startsWith('model.behavior.')) {
    return 'model-behavior';
  }
  return 'agent-identity'; // default
};

const getTokenNamePlaceholder = (categoryId) => {
  const placeholders = {
    'agent-identity': 'id, name, role, persona.tone',
    'confidence': 'level, color.low, color.medium, color.high',
    'explainability': 'summaryStyle, highlightColor, stepIndicator.color',
    'risk-safety': 'level, color.low, color.med, color.high, color.critical',
    'prompting': 'input.background, input.placeholder, roleSystem.color',
    'message-state': 'thinking.color, toolUse.color, streaming.cursorColor',
    'citation': 'badge.color, badge.icon, number.color',
    'memory': 'shortTerm.icon, longTerm.badge.color, memoryConflict.color',
    'human-ai-teaming': 'requiredIndicator.color, alert.style, handoff.step.color',
    'safety-boundary': 'softLimit.color, hardLimit.color, moderation.flag.color',
    'model-behavior': 'type, color.reasoning, color.retrieval, color.action',
    'multi-agent': 'lineColor, lineStyle, priority.color'
  };
  return placeholders[categoryId] || 'token.name';
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

const validateSaveDictionaryName = () => {
  if (!saveDictionaryName.value || saveDictionaryName.value.trim() === '') {
    saveFormErrors.value.name = 'Dictionary name is required';
  } else {
    saveFormErrors.value.name = '';
  }
};

const editToken = (token) => {
  editingToken.value = token;
  const fullName = token.name;
  const prefix = getCategoryPrefix(token.aiCategory || getCategoryFromTokenName(fullName));
  const nameWithoutPrefix = fullName.startsWith(prefix) ? fullName.slice(prefix.length) : fullName;
  
  tokenForm.value = {
    name: nameWithoutPrefix,
    category: token.category || 'ai',
    $type: token.$type,
    $value: token.$value,
    $description: token.$description || '',
    useAlias: token.$value && token.$value.startsWith('{') && token.$value.endsWith('}')
  };
  selectedCategory.value = token.aiCategory || getCategoryFromTokenName(fullName);
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
  validateTokenName();
  validateTokenValue();
  
  if (tokenFormErrors.value.name || tokenFormErrors.value.value || !tokenForm.value.name || !tokenForm.value.$type || !tokenForm.value.$value) {
    return;
  }

  const prefix = getCategoryPrefix(selectedCategory.value);
  const fullTokenName = prefix + tokenForm.value.name;

  const tokenData = {
    id: editingToken.value?.id || Date.now().toString(),
    name: fullTokenName,
    category: 'ai', // All AI tokens have category 'ai'
    aiCategory: selectedCategory.value, // Specific AI category
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

const createFromTemplate = (template) => {
  const fullName = getCategoryPrefix(selectedCategory.value) + template.name;
  if (existingTokenNames.value.includes(fullName)) {
    return; // Token already exists
  }
  
  tokenForm.value = {
    name: template.name,
    category: 'ai',
    $type: template.type,
    $value: getDefaultValueForType(template.type),
    $description: template.description,
    useAlias: false,
    fromTemplate: true
  };
  
  showAddTokenModal.value = true;
};

const getDefaultValueForType = (type) => {
  const defaults = {
    color: '#6366f1',
    dimension: '16px',
    fontFamily: 'Inter, sans-serif',
    fontWeight: '400',
    duration: '200ms',
    cubicBezier: '0.4, 0.0, 0.2, 1',
    number: '0',
    string: ''
  };
  return defaults[type] || '';
};

const closeTokenModal = () => {
  showAddTokenModal.value = false;
  editingToken.value = null;
  showColorPicker.value = false;
  showTemplateSelector.value = false;
  tokenFormErrors.value = { name: '', type: '', value: '' };
  tokenForm.value = {
    name: '',
    category: '',
    $type: 'color',
    $value: '',
    $description: '',
    useAlias: false,
    fromTemplate: false
  };
};

const openColorPicker = (event) => {
  if (event) {
    event.stopPropagation();
    const rect = event.target.getBoundingClientRect();
    
    const pickerWidth = 300;
    const pickerHeight = 550;
    const padding = 16;
    
    let left = rect.right + padding;
    let top = rect.top;
    
    if (left + pickerWidth > window.innerWidth - padding) {
      left = rect.left - pickerWidth - padding;
    }
    
    if (left < padding) {
      left = padding;
    }
    
    if (top + pickerHeight > window.innerHeight - padding) {
      const spaceAbove = rect.top - padding;
      const spaceBelow = window.innerHeight - rect.bottom - padding;
      
      if (spaceAbove >= pickerHeight) {
        top = rect.top - pickerHeight - padding;
      } else if (spaceBelow >= pickerHeight) {
        top = rect.bottom + padding;
      } else {
        top = Math.max(padding, (window.innerHeight - pickerHeight) / 2);
      }
    }
    
    if (top < padding) {
      top = padding;
    }
    
    left = Math.max(padding, Math.min(left, window.innerWidth - pickerWidth - padding));
    top = Math.max(padding, Math.min(top, window.innerHeight - pickerHeight - padding));
    
    pickerPosition.value = { left, top };
  }
  pickerColor.value = tokenForm.value.$value || '#000000';
  showColorPicker.value = true;
};

const handleColorPickerApply = (color) => {
  tokenForm.value.$value = color;
  showColorPicker.value = false;
};

const saveToLibrary = () => {
  validateSaveDictionaryName();
  if (saveFormErrors.value.name || !saveDictionaryName.value || tokens.value.length === 0) return;
  
  const dictionaries = JSON.parse(localStorage.getItem('styleDictionaries') || '[]');
  
  const dictionaryId = route.query.load;
  let dictionary;
  
  if (dictionaryId) {
    const index = dictionaries.findIndex(d => d.id === dictionaryId);
    if (index > -1) {
      dictionary = dictionaries[index];
      dictionary.name = saveDictionaryName.value;
      dictionary.description = saveDictionaryDescription.value || '';
      dictionary.tokens = JSON.parse(JSON.stringify(tokens.value));
      dictionary.updatedAt = new Date().toISOString();
      dictionaries[index] = dictionary;
    }
  }
  
  if (!dictionary) {
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

const saveTokensToStorage = () => {
  localStorage.setItem('aiDesignTokens', JSON.stringify(tokens.value));
};

const loadTokensFromStorage = () => {
  const stored = localStorage.getItem('aiDesignTokens');
  if (stored) {
    try {
      tokens.value = JSON.parse(stored);
    } catch (e) {
      console.error('Error loading AI tokens:', e);
    }
  }
};

const exportTokens = async (format) => {
  const dtcgTokens = convertToDTCGFormat(tokens.value);
  
  if (format === 'json') {
    downloadJSON(dtcgTokens, 'ai-tokens.json');
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
    
    downloadFile(content, `ai-tokens.${getFileExtension(format)}`, getMimeType(format));
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
          category: 'ai',
          aiCategory: getCategoryFromTokenName(fullKey),
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

let darkModeObserver = null;
let darkModeInterval = null;

onMounted(() => {
  loadTokensFromStorage();
  
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

