<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
    <!-- Controls -->
    <FontControls
      :key="`font-controls-${isDarkMode}`"
      v-model:search="search"
      v-model:selectedTag="selectedTag"
      v-model:selectedScript="selectedScript"
      v-model:selectedWeight="selectedWeight"
      v-model:sampleText="sampleText"
      v-model:fontSize="fontSize"
      v-model:fontWeight="fontWeight"
      v-model:lineHeight="lineHeight"
      v-model:letterSpacing="letterSpacing"
      v-model:textColor="textColor"
      v-model:bgColor="bgColor"
      v-model:fontTokens="fontTokens"
      :styleJSON="styleJSON"
      :favorites="favorites"
      :comparisonFonts="comparisonFonts"
      :isDarkMode="isDarkMode"
      :previewDarkMode="previewDarkMode"
      :fontCount="filteredFonts.length"
      @toggleDarkMode="toggleDarkMode"
      @showTypographyScale="showTypographyScale = true"
      @showExportModal="showExportModal = true"
    />

    <!-- Comparison View -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <ComparisonView
        v-if="comparisonFonts.length > 0"
      :comparisonFonts="comparisonFonts"
      :sampleText="sampleText"
        :toggleCompare="toggleCompare"
        :startABTest="startABTest"
      />
    </div>

    <!-- Font Grid -->
    <main :key="`font-grid-${isDarkMode}`" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 -mt-8">
      <!-- Recommendations Section -->
      <div 
        v-if="computedRecommendations.length > 0 && favorites.length > 0 && !search && !selectedTag && !selectedScript && !selectedWeight" 
        class="mb-6 rounded-lg border p-6" 
        :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'"
      >
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recommended Fonts</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <FontCard
            v-for="font in computedRecommendations"
            :key="font.name"
            :font="font"
            :fontSize="fontSize"
            :fontWeight="fontWeight"
            :lineHeight="lineHeight"
            :letterSpacing="letterSpacing"
            :textColor="textColor"
            :bgColor="bgColor"
            :sampleText="sampleText"
            :selected="isFavorite(font)"
            :isInComparison="isInComparison(font)"
            :previewDarkMode="previewDarkMode"
            :copyFont="copyFont"
            :getCustomFilename="getCustomFilename"
            :toggleFavorite="toggleFavorite"
            :toggleCompare="toggleCompare"
            :getContrastLevel="getContrastLevel"
            :showFontInfo="showFontInfo"
            @togglePreview="quickPreview"
            @addToRecentlyViewed="addToRecentlyViewed"
          />
        </div>
      </div>

      <!-- Recently Viewed Section -->
      <div 
        v-if="recentlyViewed.length > 0" 
        class="mb-6 rounded-lg border p-6" 
        :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'"
      >
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <span class="material-symbols-outlined text-base text-indigo-600">history</span>
            Recently Viewed
          </h2>
          <button @click="recentlyViewed = []; recentlyViewedStorage.set([])" class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            Clear
          </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <FontCard
            v-for="fontName in recentlyViewed.slice(0, 8)"
            :key="fontName"
            :font="fontData.find(f => f.name === fontName) || {}"
            :fontSize="fontSize"
            :fontWeight="fontWeight"
            :lineHeight="lineHeight"
            :letterSpacing="letterSpacing"
            :textColor="textColor"
            :bgColor="bgColor"
            :sampleText="sampleText"
            :selected="isFavorite(fontData.find(f => f.name === fontName))"
            :isInComparison="isInComparison(fontData.find(f => f.name === fontName))"
            :previewDarkMode="previewDarkMode"
            :copyFont="copyFont"
            :getCustomFilename="getCustomFilename"
            :toggleFavorite="toggleFavorite"
            :toggleCompare="toggleCompare"
            :getContrastLevel="getContrastLevel"
            :showFontInfo="showFontInfo"
            @togglePreview="quickPreview"
            @addToRecentlyViewed="addToRecentlyViewed"
          />
        </div>
      </div>

      <div 
        v-if="search || selectedTag || selectedScript || selectedWeight" 
        class="mb-6 rounded-lg border p-6" 
        :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'"
      >
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Search Results</h2>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">{{ filteredFonts.length }} font families found</p>
        <div v-if="search || selectedTag || selectedScript || selectedWeight" class="flex flex-wrap items-center gap-2">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Active filters:</span>
          <span v-if="search" class="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded">Search: "{{ search }}"</span>
          <span v-if="selectedTag" class="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded">Category: {{ selectedTag }}</span>
          <span v-if="selectedScript" class="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded">Script: {{ selectedScript }}</span>
          <span v-if="selectedWeight" class="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded">Weight: {{ selectedWeight }}</span>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <FontCard
        v-for="font in filteredFonts"
        :key="font.name"
        :font="font"
        :fontSize="fontSize"
        :fontWeight="fontWeight"
        :lineHeight="lineHeight"
        :letterSpacing="letterSpacing"
        :textColor="textColor"
        :bgColor="bgColor"
        :sampleText="sampleText"
        :selected="isFavorite(font)"
        :isInComparison="isInComparison(font)"
        :previewDarkMode="previewDarkMode"
        :copyFont="copyFont"
        :getCustomFilename="getCustomFilename"
        :toggleFavorite="toggleFavorite"
        :toggleCompare="toggleCompare"
        :getContrastLevel="getContrastLevel"
        :showFontInfo="showFontInfo"
        @togglePreview="quickPreview"
        @addToRecentlyViewed="addToRecentlyViewed"
      />
    </div>
    </main>

    <!-- Simple Export Modal -->
    <div v-if="showExportModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm" @click="showExportModal = false">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 relative" @click.stop>
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 class="text-xl font-bold text-gray-900">Export Fonts</h3>
          <button @click="showExportModal = false" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <span class="material-symbols-outlined text-gray-600">close</span>
          </button>
        </div>
        
        <div class="p-6">
          <div v-if="favorites.length > 0" class="mb-6">
            <h4 class="text-lg font-semibold text-gray-900 mb-3">Favorites ({{ favorites.length }})</h4>
            <div class="flex flex-wrap gap-2 mb-4">
              <span v-for="font in favorites" :key="font.name" class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg">{{ font.name }}</span>
            </div>
            <button @click="exportFavorites" class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              <span class="material-symbols-outlined">download</span>
              Export Favorites
            </button>
          </div>
          
          <div v-if="comparisonFonts.length > 0">
            <h4 class="text-lg font-semibold text-gray-900 mb-3">Comparison ({{ comparisonFonts.length }})</h4>
            <div class="flex flex-wrap gap-2 mb-4">
              <span v-for="font in comparisonFonts" :key="font.name" class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg">{{ font.name }}</span>
            </div>
            <button @click="exportComparison" class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              <span class="material-symbols-outlined">compare</span>
              Export Comparison
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Contrast Analyzer Modal -->
    <div v-if="showContrastModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm" @click="showContrastModal = false">
      <div class="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 relative" @click.stop>
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 class="text-xl font-bold text-gray-900">Contrast Analyzer</h3>
          <button @click="showContrastModal = false" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <span class="material-symbols-outlined text-gray-600">close</span>
          </button>
        </div>
        
        <div class="p-6">
          <div v-if="contrastResult" class="space-y-4">
            <div class="p-4 bg-gray-50 rounded-lg">
              <div class="text-3xl font-bold mb-2" :style="{ color: textColor, backgroundColor: bgColor, padding: '1rem', borderRadius: '0.5rem' }">
                Sample Text
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div class="p-4 border border-gray-200 rounded-lg">
                <div class="text-sm text-gray-600 mb-1">Contrast Ratio</div>
                <div class="text-2xl font-bold text-gray-900">{{ contrastResult.ratio }}:1</div>
              </div>
              
              <div class="p-4 border border-gray-200 rounded-lg">
                <div class="text-sm text-gray-600 mb-1">WCAG Level</div>
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-semibold">Normal Text:</span>
                    <span :class="contrastResult.passes.normalAA ? 'text-green-600' : 'text-red-600'">
                      {{ contrastResult.passes.normalAA ? '✓ AA' : '✗ AA' }}
                    </span>
                    <span :class="contrastResult.passes.normalAAA ? 'text-green-600' : 'text-red-600'">
                      {{ contrastResult.passes.normalAAA ? '✓ AAA' : '✗ AAA' }}
                    </span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-semibold">Large Text:</span>
                    <span :class="contrastResult.passes.largeAA ? 'text-green-600' : 'text-red-600'">
                      {{ contrastResult.passes.largeAA ? '✓ AA' : '✗ AA' }}
                    </span>
                    <span :class="contrastResult.passes.largeAAA ? 'text-green-600' : 'text-red-600'">
                      {{ contrastResult.passes.largeAAA ? '✓ AAA' : '✗ AAA' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="text-xs text-gray-500">
              <p><strong>WCAG Guidelines:</strong></p>
              <p>• Normal text (16px): AA requires 4.5:1, AAA requires 7:1</p>
              <p>• Large text (18px+ or bold): AA requires 3:1, AAA requires 4.5:1</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- CSS Generator Modal -->
    <div v-if="showCSSGenerator" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm" @click="showCSSGenerator = false">
      <div class="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto relative" @click.stop>
        <div class="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h3 class="text-xl font-bold text-gray-900">CSS Code Generator</h3>
          <button @click="showCSSGenerator = false" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <span class="material-symbols-outlined text-gray-600">close</span>
          </button>
        </div>
        
        <div class="p-6">
          <div class="mb-4 flex gap-2">
            <select v-model="cssFormat" @change="generateCSSCode" class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white">
              <option value="css">CSS</option>
              <option value="css-variables">CSS Variables</option>
              <option value="tailwind">Tailwind Config</option>
              <option value="embed">Google Fonts Embed</option>
            </select>
            <button @click="copyCSS" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              <span class="material-symbols-outlined text-lg">content_copy</span> Copy
            </button>
          </div>
          
          <pre class="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm"><code>{{ generatedCSS }}</code></pre>
        </div>
      </div>
    </div>

    <!-- Quick Preview Modal -->
    <div v-if="showQuickPreview && previewFont" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm" @click="showQuickPreview = false">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" @click.stop>
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 class="text-xl font-bold text-gray-900">{{ previewFont.name }}</h3>
          <button @click="showQuickPreview = false" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <span class="material-symbols-outlined text-gray-600">close</span>
          </button>
        </div>
        
        <div class="p-6">
          <div class="mb-6 space-y-4">
            <div v-for="weight in (previewFont.weights || ['400'])" :key="weight" class="p-4 bg-gray-50 rounded-lg border border-gray-200" :style="{ fontFamily: `'${previewFont.name}', sans-serif`, fontWeight: weight }">
              <div class="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">{{ getWeightName(weight) }} ({{ weight }})</div>
              <div class="text-lg text-gray-900 leading-relaxed">The quick brown fox jumps over the lazy dog.</div>
            </div>
          </div>
          
          <div class="flex gap-3 pt-4 border-t border-gray-200">
            <button @click="toggleFavorite(previewFont)" class="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors" :class="{ 'bg-indigo-50 border-indigo-500 text-indigo-700': isFavorite(previewFont) }">
              <span class="material-symbols-outlined">{{ isFavorite(previewFont) ? 'favorite' : 'favorite_border' }}</span>
              {{ isFavorite(previewFont) ? 'Remove from Favorites' : 'Add to Favorites' }}
            </button>
            <button @click="toggleCompare(previewFont)" class="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors" :class="{ 'bg-indigo-50 border-indigo-500 text-indigo-700': isInComparison(previewFont) }">
              <span class="material-symbols-outlined">{{ isInComparison(previewFont) ? 'remove_circle' : 'compare' }}</span>
              {{ isInComparison(previewFont) ? 'Remove from Comparison' : 'Add to Comparison' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Collections Modal -->
    <div v-if="showCollectionsModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm" @click="showCollectionsModal = false">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative" @click.stop>
        <div class="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h3 class="text-xl font-bold text-gray-900">Font Collections</h3>
          <button @click="showCollectionsModal = false" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <span class="material-symbols-outlined text-gray-600">close</span>
          </button>
        </div>
        
        <div class="p-6">
          <div class="mb-6">
            <h4 class="text-lg font-semibold text-gray-900 mb-3">Create New Collection</h4>
            <div class="flex gap-2">
              <input 
                v-model="newCollectionName" 
                type="text" 
                placeholder="Collection name..."
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                @keyup.enter="createCollection"
              />
              <button @click="createCollection" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Create
              </button>
            </div>
          </div>
          
          <div v-if="collections.length > 0">
            <h4 class="text-lg font-semibold text-gray-900 mb-3">Your Collections</h4>
            <div class="space-y-3">
              <div v-for="collection in collections" :key="collection.id" class="p-4 border border-gray-200 rounded-lg">
                <div class="flex items-center justify-between mb-2">
                  <h5 class="font-semibold text-gray-900">{{ collection.name }}</h5>
                  <div class="flex gap-2">
                    <button @click="shareCollection(collection)" class="text-indigo-600 hover:text-indigo-700" title="Share">
                      <span class="material-symbols-outlined text-lg">share</span>
                    </button>
                    <button @click="deleteCollectionById(collection.id)" class="text-red-600 hover:text-red-700" title="Delete">
                      <span class="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>
                <div class="flex flex-wrap gap-2">
                  <span v-for="fontName in collection.fonts.slice(0, 5)" :key="fontName" class="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">{{ fontName }}</span>
                  <span v-if="collection.fonts.length > 5" class="px-2 py-1 text-xs text-gray-500">+{{ collection.fonts.length - 5 }} more</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Typography Presets Modal -->
    <div v-if="showTypographyPresets" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm" @click="showTypographyPresets = false">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative" @click.stop>
        <div class="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h3 class="text-xl font-bold text-gray-900">Typography Presets</h3>
          <button @click="showTypographyPresets = false" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <span class="material-symbols-outlined text-gray-600">close</span>
          </button>
        </div>
        
        <div class="p-6">
          <div class="mb-6">
            <button @click="saveTypographyPreset" class="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              Save Current Settings as Preset
            </button>
          </div>
          
          <div v-if="typographyPresets.length > 0">
            <h4 class="text-lg font-semibold text-gray-900 mb-3">Saved Presets</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div v-for="preset in typographyPresets" :key="preset.id" class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer" @click="loadTypographyPreset(preset)">
                <div class="font-semibold text-gray-900 mb-2">{{ preset.name }}</div>
                <div class="text-xs text-gray-600 space-y-1">
                  <div>Size: {{ preset.fontSize }}px</div>
                  <div>Weight: {{ preset.fontWeight }}</div>
                  <div>Line Height: {{ preset.lineHeight }}</div>
                  <div>Letter Spacing: {{ preset.letterSpacing }}px</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Font Info Modal -->
    <div v-if="showFontInfoModal && fontInfo" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm" @click="showFontInfoModal = false">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative" @click.stop>
        <div class="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h3 class="text-xl font-bold text-gray-900">{{ fontInfo.name }}</h3>
          <button @click="showFontInfoModal = false" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <span class="material-symbols-outlined text-gray-600">close</span>
          </button>
        </div>
        
        <div class="p-6">
          <div class="space-y-4">
            <div v-if="fontInfo.description">
              <h4 class="font-semibold text-gray-900 mb-2">Description</h4>
              <p class="text-gray-600">{{ fontInfo.description }}</p>
            </div>
            
            <div>
              <h4 class="font-semibold text-gray-900 mb-2">Weights Available</h4>
              <div class="flex flex-wrap gap-2">
                <span v-for="weight in (fontInfo.weights || ['400'])" :key="weight" class="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg">
                  {{ getWeightName(weight) }} ({{ weight }})
                </span>
              </div>
            </div>
            
            <div v-if="fontInfo.supports">
              <h4 class="font-semibold text-gray-900 mb-2">Scripts Supported</h4>
              <div class="flex flex-wrap gap-2">
                <span v-for="script in fontInfo.supports" :key="script" class="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg capitalize">
                  {{ script }}
                </span>
              </div>
            </div>
            
            <div v-if="fontInfo.tags">
              <h4 class="font-semibold text-gray-900 mb-2">Category</h4>
              <div class="flex flex-wrap gap-2">
                <span v-for="tag in fontInfo.tags" :key="tag" class="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg capitalize">
                  {{ tag }}
                </span>
              </div>
            </div>
            
            <div v-if="fontInfo.pairsWellWith">
              <h4 class="font-semibold text-gray-900 mb-2">Pairs Well With</h4>
              <div class="flex flex-wrap gap-2">
                <span v-for="pair in fontInfo.pairsWellWith" :key="pair" class="px-3 py-1 bg-green-100 text-green-700 rounded-lg">
                  {{ pair }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Line Length Calculator Modal -->
    <div v-if="showLineLengthCalc" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm" @click="showLineLengthCalc = false">
      <div class="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 relative" @click.stop>
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 class="text-xl font-bold text-gray-900">Line Length Calculator</h3>
          <button @click="showLineLengthCalc = false" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <span class="material-symbols-outlined text-gray-600">close</span>
          </button>
        </div>
        
        <div class="p-6">
          <div class="mb-4">
            <label class="text-sm text-gray-600 mb-2 block">Font Size (px)</label>
            <input 
              v-model.number="fontSize" 
              type="number" 
              min="12" 
              max="72"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          
          <div v-if="fontSize" class="space-y-4">
            <div class="p-4 bg-gray-50 rounded-lg">
              <div class="text-sm text-gray-600 mb-2">Optimal Character Count</div>
              <div class="text-2xl font-bold text-gray-900">{{ calculateOptimalLineLength(fontSize).optimalChars }} characters</div>
              <div class="text-xs text-gray-500 mt-1">Range: {{ calculateOptimalLineLength(fontSize).minChars }} - {{ calculateOptimalLineLength(fontSize).maxChars }} characters</div>
            </div>
            
            <div class="p-4 bg-gray-50 rounded-lg">
              <div class="text-sm text-gray-600 mb-2">Optimal Width (px)</div>
              <div class="text-2xl font-bold text-gray-900">{{ calculateOptimalLineLength(fontSize).optimalWidth }}px</div>
              <div class="text-xs text-gray-500 mt-1">Range: {{ calculateOptimalLineLength(fontSize).minWidth }}px - {{ calculateOptimalLineLength(fontSize).maxWidth }}px</div>
            </div>
            
            <div class="p-4 border border-gray-200 rounded-lg">
              <div class="text-sm text-gray-600 mb-2">Preview</div>
              <div class="text-gray-900 leading-relaxed" :style="{ fontSize: fontSize + 'px', maxWidth: calculateOptimalLineLength(fontSize).optimalWidth + 'px' }">
                The quick brown fox jumps over the lazy dog. This is a sample of text that demonstrates optimal line length for readability. Notice how the text is neither too narrow nor too wide.
              </div>
            </div>
            
            <div class="text-xs text-gray-500">
              <p><strong>Guidelines:</strong></p>
              <p>• Optimal line length improves readability and reduces eye strain</p>
              <p>• Too short: frequent line breaks interrupt reading flow</p>
              <p>• Too long: eyes struggle to find the next line</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- A/B Testing Modal -->
    <div v-if="showABTesting && abTestFont1 && abTestFont2" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" @click="showABTesting = false; activeABColorPicker = null">
      <div class="bg-white rounded-lg shadow-xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto relative" @click.stop>
        <div class="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div class="flex-1">
            <div class="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0 items-start">
              <span class="material-symbols-outlined text-indigo-600 row-span-2">compare</span>
              <h3 class="text-xl font-bold text-gray-900">
                A/B Font Testing
              </h3>
              <p class="text-sm text-gray-600 text-left col-start-1 col-end-3 mt-2">Compare these fonts side-by-side. You can adjust typography settings and see how both fonts respond.</p>
            </div>
          </div>
          <button @click="showABTesting = false" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <span class="material-symbols-outlined text-gray-600">close</span>
          </button>
        </div>
        
        <div class="p-6" @click="activeABColorPicker = null">
          <!-- Typography Controls -->
          <div class="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 class="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <span class="material-symbols-outlined text-base text-indigo-600">text_fields</span>
              Typography Settings
            </h4>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <!-- Font Size -->
              <div class="flex flex-col gap-2">
                <label class="text-xs font-medium text-gray-600">Size</label>
                <div class="flex items-center gap-2">
                  <input 
                    type="range" 
                    v-model.number="fontSize" 
                    min="12" 
                    max="72" 
                    class="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <span class="text-xs text-gray-500 w-12 text-right">{{ fontSize }}px</span>
                </div>
              </div>
              
              <!-- Font Weight -->
              <div class="flex flex-col gap-2">
                <label class="text-xs font-medium text-gray-600">Weight</label>
                <select v-model.number="fontWeight" class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white">
                  <option value="100">Thin (100)</option>
                  <option value="200">Extra Light (200)</option>
                  <option value="300">Light (300)</option>
                  <option value="400">Regular (400)</option>
                  <option value="500">Medium (500)</option>
                  <option value="600">Semi-Bold (600)</option>
                  <option value="700">Bold (700)</option>
                  <option value="800">Extra Bold (800)</option>
                  <option value="900">Black (900)</option>
                </select>
              </div>
              
              <!-- Line Height -->
              <div class="flex flex-col gap-2">
                <label class="text-xs font-medium text-gray-600">Line Height</label>
                <div class="flex items-center gap-2">
                  <input 
                    type="range" 
                    v-model.number="lineHeight" 
                    min="1" 
                    max="2" 
                    step="0.1" 
                    class="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <span class="text-xs text-gray-500 w-12 text-right">{{ lineHeight }}</span>
                </div>
              </div>
              
              <!-- Letter Spacing -->
              <div class="flex flex-col gap-2">
                <label class="text-xs font-medium text-gray-600">Letter Spacing</label>
                <div class="flex items-center gap-2">
                  <input 
                    type="range" 
                    v-model.number="letterSpacing" 
                    min="-2" 
                    max="5" 
                    step="0.1" 
                    class="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <span class="text-xs text-gray-500 w-12 text-right">{{ letterSpacing }}px</span>
                </div>
              </div>
            </div>
            
            <!-- Color Controls -->
            <div class="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
              <!-- Text Color -->
              <div class="flex flex-col gap-2">
                <label class="text-xs font-medium text-gray-600">Text Color</label>
                <div class="relative">
                  <button 
                    ref="abTextColorButtonRef"
                    @click.stop="openABColorPicker('text', $event)"
                    class="relative w-12 h-12 rounded-lg overflow-hidden shadow-sm border border-gray-300 hover:border-gray-400 transition-colors cursor-pointer block"
                    :style="{ backgroundColor: textColor }"
                  >
                    <div class="absolute inset-0 border border-gray-200 rounded-lg pointer-events-none"></div>
                  </button>
                  
                  <!-- Color Picker Popup -->
                  <ColorPickerPopup
                    v-if="activeABColorPicker === 'text'"
                    :initial-color="textColor"
                    @apply="(hex) => { textColor = hex; activeABColorPicker = null; }"
                    @cancel="activeABColorPicker = null"
                    :picker-style="abTextColorPickerStyle"
                  />
                </div>
              </div>
              
              <!-- Background Color -->
              <div class="flex flex-col gap-2">
                <label class="text-xs font-medium text-gray-600">Background Color</label>
                <div class="relative">
                  <button 
                    ref="abBgColorButtonRef"
                    @click.stop="openABColorPicker('bg', $event)"
                    class="relative w-12 h-12 rounded-lg overflow-hidden shadow-sm border border-gray-300 hover:border-gray-400 transition-colors cursor-pointer block"
                    :style="{ backgroundColor: bgColor }"
                  >
                    <div class="absolute inset-0 border border-gray-200 rounded-lg pointer-events-none"></div>
                  </button>
                  
                  <!-- Color Picker Popup -->
                  <ColorPickerPopup
                    v-if="activeABColorPicker === 'bg'"
                    :initial-color="bgColor"
                    @apply="(hex) => { bgColor = hex; activeABColorPicker = null; }"
                    @cancel="activeABColorPicker = null"
                    :picker-style="abBgColorPickerStyle"
                  />
                </div>
              </div>
            </div>
            
            <!-- Sample Text -->
            <div class="mt-4 pt-4 border-t border-gray-200">
              <label class="text-xs font-medium text-gray-600 mb-2 block">Sample Text</label>
              <textarea 
                v-model="sampleText" 
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white resize-none"
                rows="2"
                placeholder="Enter sample text..."
              ></textarea>
            </div>
          </div>
          
          <!-- Font Comparison -->
          <div class="grid grid-cols-2 gap-6">
            <div class="border-r border-gray-200 pr-6">
              <div class="text-sm font-semibold text-gray-600 mb-3">Font A: {{ abTestFont1.name }}</div>
              <div class="p-4 bg-gray-50 rounded-lg mb-4" :style="{ fontFamily: `'${abTestFont1.name}', sans-serif`, fontSize: fontSize + 'px', fontWeight: fontWeight, lineHeight: lineHeight, letterSpacing: letterSpacing + 'px', color: textColor, backgroundColor: bgColor }">
                {{ sampleText }}
              </div>
              <div class="text-xs text-gray-500">{{ abTestFont1.tags?.join(', ') }}</div>
            </div>
            
            <div>
              <div class="text-sm font-semibold text-gray-600 mb-3">Font B: {{ abTestFont2.name }}</div>
              <div class="p-4 bg-gray-50 rounded-lg mb-4" :style="{ fontFamily: `'${abTestFont2.name}', sans-serif`, fontSize: fontSize + 'px', fontWeight: fontWeight, lineHeight: lineHeight, letterSpacing: letterSpacing + 'px', color: textColor, backgroundColor: bgColor }">
                {{ sampleText }}
              </div>
              <div class="text-xs text-gray-500">{{ abTestFont2.tags?.join(', ') }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Typography Hierarchy Builder Modal -->
    <div v-if="showTypographyHierarchy" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm" @click="showTypographyHierarchy = false">
      <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto relative" @click.stop>
        <div class="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h3 class="text-xl font-bold text-gray-900">Typography Hierarchy Builder</h3>
          <button @click="showTypographyHierarchy = false" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <span class="material-symbols-outlined text-gray-600">close</span>
          </button>
        </div>
        
        <div class="p-6">
          <div class="mb-6">
            <label class="text-sm text-gray-600 mb-2 block">Select Font</label>
            <select 
              v-model="selectedFontForHierarchy"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="">Choose a font...</option>
              <option v-for="font in fontData" :key="font.name" :value="font.name">{{ font.name }}</option>
            </select>
          </div>
          
          <div v-if="selectedFontForHierarchy" class="space-y-6">
            <div v-for="(style, element) in buildTypographyHierarchy()" :key="element" class="p-4 border border-gray-200 rounded-lg">
              <div class="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">{{ element === 'h1' ? 'Heading 1' : element === 'h2' ? 'Heading 2' : element === 'h3' ? 'Heading 3' : element === 'h4' ? 'Heading 4' : element === 'h5' ? 'Heading 5' : element === 'h6' ? 'Heading 6' : element === 'body' ? 'Body Text' : 'Small Text' }}</div>
              <div class="text-gray-900 mb-2" :style="{ fontFamily: `'${selectedFontForHierarchy}', sans-serif`, fontSize: style.fontSize + 'px', fontWeight: style.fontWeight, lineHeight: style.lineHeight, letterSpacing: style.letterSpacing + 'px', marginBottom: style.marginBottom + 'px' }">
                {{ element === 'body' ? 'This is body text. It flows naturally and is easy to read over long paragraphs.' : element === 'small' ? 'Small text for captions and fine print' : element.toUpperCase() + ' Heading Example' }}
              </div>
              <div class="text-xs text-gray-500 space-y-1">
                <div>Size: {{ style.fontSize }}px • Weight: {{ style.fontWeight }} • Line Height: {{ style.lineHeight }} • Letter Spacing: {{ style.letterSpacing }}px</div>
              </div>
            </div>
            
            <div class="p-4 bg-gray-50 rounded-lg">
              <h4 class="font-semibold text-gray-900 mb-3">Complete Hierarchy Preview</h4>
              <div class="space-y-3" :style="{ fontFamily: `'${selectedFontForHierarchy}', sans-serif` }">
                <div v-for="(style, element) in buildTypographyHierarchy()" :key="element" :style="{ fontSize: style.fontSize + 'px', fontWeight: style.fontWeight, lineHeight: style.lineHeight, letterSpacing: style.letterSpacing + 'px', marginBottom: style.marginBottom + 'px' }">
                  {{ element === 'body' ? 'Body text flows naturally and is easy to read over long paragraphs.' : element === 'small' ? 'Small text for captions' : element.toUpperCase() + ' Heading' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Responsive Preview Modal -->
    <div v-if="showResponsivePreview" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm" @click="showResponsivePreview = false">
      <div class="bg-white rounded-lg shadow-xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto relative" @click.stop>
        <div class="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h3 class="text-xl font-bold text-gray-900">Responsive Preview</h3>
          <button @click="showResponsivePreview = false" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <span class="material-symbols-outlined text-gray-600">close</span>
          </button>
        </div>
        
        <div class="p-6">
          <div class="mb-6">
            <label class="text-sm text-gray-600 mb-2 block">Select Font</label>
            <select 
              v-model="selectedFontForResponsive"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="">Choose a font...</option>
              <option v-for="font in [...fontData, ...customFonts]" :key="font.name" :value="font.name">{{ font.name }}</option>
            </select>
          </div>
          
          <div v-if="selectedFontForResponsive" class="space-y-6">
            <div class="border border-gray-300 rounded-lg overflow-hidden">
              <div class="bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">Mobile (375px)</div>
              <div class="p-4" style="width: 375px; max-width: 100%;">
                <div :style="{ fontFamily: `'${selectedFontForResponsive}', sans-serif`, fontSize: fontSize * 0.875 + 'px', fontWeight: fontWeight, lineHeight: lineHeight, letterSpacing: letterSpacing + 'px', color: textColor }">
                  {{ sampleText }}
                </div>
              </div>
            </div>
            
            <div class="border border-gray-300 rounded-lg overflow-hidden">
              <div class="bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">Tablet (768px)</div>
              <div class="p-4" style="width: 768px; max-width: 100%;">
                <div :style="{ fontFamily: `'${selectedFontForResponsive}', sans-serif`, fontSize: fontSize + 'px', fontWeight: fontWeight, lineHeight: lineHeight, letterSpacing: letterSpacing + 'px', color: textColor }">
                  {{ sampleText }}
                </div>
              </div>
            </div>
            
            <div class="border border-gray-300 rounded-lg overflow-hidden">
              <div class="bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">Desktop (1024px)</div>
              <div class="p-4" style="width: 1024px; max-width: 100%;">
                <div :style="{ fontFamily: `'${selectedFontForResponsive}', sans-serif`, fontSize: fontSize * 1.125 + 'px', fontWeight: fontWeight, lineHeight: lineHeight, letterSpacing: letterSpacing + 'px', color: textColor }">
                  {{ sampleText }}
                </div>
              </div>
            </div>
            
            <div class="border border-gray-300 rounded-lg overflow-hidden">
              <div class="bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">Large Desktop (1440px)</div>
              <div class="p-4" style="width: 1440px; max-width: 100%;">
                <div :style="{ fontFamily: `'${selectedFontForResponsive}', sans-serif`, fontSize: fontSize * 1.25 + 'px', fontWeight: fontWeight, lineHeight: lineHeight, letterSpacing: letterSpacing + 'px', color: textColor }">
                  {{ sampleText }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Custom Font Upload Modal -->
    <div v-if="showCustomFontUpload" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm" @click="showCustomFontUpload = false">
      <div class="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 relative" @click.stop>
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 class="text-xl font-bold text-gray-900">Upload Custom Font</h3>
          <button @click="showCustomFontUpload = false" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <span class="material-symbols-outlined text-gray-600">close</span>
          </button>
        </div>
        
        <div class="p-6">
          <div class="mb-4">
            <label class="text-sm text-gray-600 mb-2 block">Upload Font File (.woff, .woff2, .ttf, or .otf)</label>
            <input 
              type="file" 
              @change="handleCustomFontUpload"
              accept=".woff,.woff2,.ttf,.otf"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          
          <div v-if="customFonts.length > 0" class="mt-6">
            <h4 class="font-semibold text-gray-900 mb-3">Uploaded Fonts</h4>
            <div class="space-y-2">
              <div v-for="font in customFonts" :key="font.name" class="p-3 border border-gray-200 rounded-lg flex items-center justify-between">
                <span class="font-medium text-gray-900">{{ font.name }}</span>
                <button @click="customFonts = customFonts.filter(f => f.name !== font.name); fontData = fontData.filter(f => f.name !== font.name)" class="text-red-600 hover:text-red-700">
                  <span class="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            </div>
          </div>
          
          <div class="mt-4 text-xs text-gray-500">
            <p><strong>Note:</strong> Uploaded fonts are stored in browser memory and will be cleared when you refresh the page.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Export to Design Tools Modal -->
    <div v-if="showExportModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm" @click="showExportModal = false">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 relative" @click.stop>
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 class="text-xl font-bold text-gray-900">Export Fonts</h3>
          <button @click="showExportModal = false" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <span class="material-symbols-outlined text-gray-600">close</span>
          </button>
        </div>
        
        <div class="p-6">
          <div v-if="favorites.length > 0" class="mb-6">
            <h4 class="text-lg font-semibold text-gray-900 mb-3">Favorites ({{ favorites.length }})</h4>
            <div class="flex flex-wrap gap-2 mb-4">
              <span v-for="fontName in favorites" :key="fontName" class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg">{{ fontName }}</span>
            </div>
            <div class="flex gap-2">
              <button @click="exportFavorites" class="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                <span class="material-symbols-outlined">download</span>
                Export JSON
              </button>
              <button @click="exportToDesignTool('figma')" class="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                Figma
              </button>
            </div>
          </div>
          
          <div v-if="comparisonFonts.length > 0">
            <h4 class="text-lg font-semibold text-gray-900 mb-3">Comparison ({{ comparisonFonts.length }})</h4>
            <div class="flex flex-wrap gap-2 mb-4">
              <span v-for="font in comparisonFonts" :key="font.name" class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg">{{ font.name }}</span>
            </div>
            <div class="flex gap-2">
              <button @click="exportComparison" class="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                <span class="material-symbols-outlined">compare</span>
                Export JSON
              </button>
              <button @click="exportToDesignTool('adobe')" class="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Adobe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Font Playlists Modal -->
    <div v-if="showFontPlaylists" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm" @click="showFontPlaylists = false">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative" @click.stop>
        <div class="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h3 class="text-xl font-bold text-gray-900">Font Playlists</h3>
          <button @click="showFontPlaylists = false" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <span class="material-symbols-outlined text-gray-600">close</span>
          </button>
        </div>
        
        <div class="p-6">
          <div class="mb-6">
            <h4 class="text-lg font-semibold text-gray-900 mb-3">Create New Playlist</h4>
            <div class="flex gap-2">
              <input 
                v-model="newPlaylistName"
                type="text" 
                placeholder="Playlist name..."
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                @keyup.enter="createPlaylist(newPlaylistName, [...favorites.value, ...comparisonFonts.value.map(f => f.name)]); newPlaylistName = ''"
              />
              <button @click="createPlaylist(newPlaylistName, [...favorites.value, ...comparisonFonts.value.map(f => f.name)]); newPlaylistName = ''" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Create
              </button>
            </div>
          </div>
          
          <div v-if="fontPlaylists.length > 0">
            <h4 class="text-lg font-semibold text-gray-900 mb-3">Your Playlists</h4>
            <div class="space-y-3">
              <div v-for="playlist in fontPlaylists" :key="playlist.id" class="p-4 border border-gray-200 rounded-lg">
                <div class="flex items-center justify-between mb-2">
                  <h5 class="font-semibold text-gray-900">{{ playlist.name }}</h5>
                  <button @click="deletePlaylist(playlist.id)" class="text-red-600 hover:text-red-700">
                    <span class="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
                <div class="flex flex-wrap gap-2">
                  <span v-for="fontName in playlist.fonts.slice(0, 5)" :key="fontName" class="px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded">{{ fontName }}</span>
                  <span v-if="playlist.fonts.length > 5" class="px-2 py-1 text-xs text-gray-500">+{{ playlist.fonts.length - 5 }} more</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Custom Tags Modal -->
    <div v-if="showCustomTags" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm" @click="showCustomTags = false">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative" @click.stop>
        <div class="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h3 class="text-xl font-bold text-gray-900">Custom Tags</h3>
          <button @click="showCustomTags = false" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <span class="material-symbols-outlined text-gray-600">close</span>
          </button>
        </div>
        
        <div class="p-6">
          <div class="mb-6">
            <label class="text-sm text-gray-600 mb-2 block">Select Font</label>
            <select 
              v-model="selectedFontForTagging"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="">Choose a font...</option>
              <option v-for="font in fontData" :key="font.name" :value="font.name">{{ font.name }}</option>
            </select>
          </div>
          
          <div v-if="selectedFontForTagging" class="space-y-4">
            <div>
              <label class="text-sm text-gray-600 mb-2 block">Add Tag</label>
              <div class="flex gap-2">
                <input 
                  v-model="newTagName"
                  type="text" 
                  placeholder="Tag name..."
                  class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  @keyup.enter="addCustomTag(selectedFontForTagging, newTagName); newTagName = ''"
                />
                <button @click="addCustomTag(selectedFontForTagging, newTagName); newTagName = ''" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  Add
                </button>
              </div>
            </div>
            
            <div v-if="customTags[selectedFontForTagging] && customTags[selectedFontForTagging].length > 0">
              <h4 class="font-semibold text-gray-900 mb-2">Current Tags</h4>
              <div class="flex flex-wrap gap-2">
                <span v-for="tag in customTags[selectedFontForTagging]" :key="tag" class="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg flex items-center gap-2">
                  {{ tag }}
                  <button @click="removeCustomTag(selectedFontForTagging, tag)" class="text-red-600 hover:text-red-700">
                    <span class="material-symbols-outlined text-sm">close</span>
                  </button>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Performance Metrics Modal -->
    <div v-if="showPerformanceMetrics" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm" @click="showPerformanceMetrics = false">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative" @click.stop>
        <div class="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h3 class="text-xl font-bold text-gray-900">Font Performance Metrics</h3>
          <button @click="showPerformanceMetrics = false" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <span class="material-symbols-outlined text-gray-600">close</span>
          </button>
        </div>
        
        <div class="p-6">
          <div class="mb-6">
            <label class="text-sm text-gray-600 mb-2 block">Select Font</label>
            <select 
              v-model="selectedFontForMetrics"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="">Choose a font...</option>
              <option v-for="font in fontData" :key="font.name" :value="font.name">{{ font.name }}</option>
            </select>
          </div>
          
          <div v-if="selectedFontForMetrics" class="space-y-4">
            <div v-if="getFontPerformanceMetrics(fontData.find(f => f.name === selectedFontForMetrics))" class="grid grid-cols-2 gap-4">
              <div class="p-4 bg-gray-50 rounded-lg">
                <div class="text-sm text-gray-600 mb-1">File Size</div>
                <div class="text-2xl font-bold text-gray-900">{{ getFontPerformanceMetrics(fontData.find(f => f.name === selectedFontForMetrics)).fileSize }}</div>
              </div>
              
              <div class="p-4 bg-gray-50 rounded-lg">
                <div class="text-sm text-gray-600 mb-1">Load Time</div>
                <div class="text-2xl font-bold text-gray-900">{{ getFontPerformanceMetrics(fontData.find(f => f.name === selectedFontForMetrics)).loadTime }}</div>
              </div>
              
              <div class="p-4 bg-gray-50 rounded-lg">
                <div class="text-sm text-gray-600 mb-1">Format</div>
                <div class="text-lg font-semibold text-gray-900">{{ getFontPerformanceMetrics(fontData.find(f => f.name === selectedFontForMetrics)).format }}</div>
              </div>
              
              <div class="p-4 bg-gray-50 rounded-lg">
                <div class="text-sm text-gray-600 mb-1">Optimized</div>
                <div class="text-lg font-semibold text-green-600">{{ getFontPerformanceMetrics(fontData.find(f => f.name === selectedFontForMetrics)).optimized ? 'Yes' : 'No' }}</div>
              </div>
            </div>
            
            <div class="p-4 bg-indigo-50 rounded-lg">
              <h4 class="font-semibold text-gray-900 mb-2">Optimization Recommendations</h4>
              <ul class="list-disc list-inside space-y-1 text-sm text-gray-700">
                <li v-for="rec in getFontPerformanceMetrics(fontData.find(f => f.name === selectedFontForMetrics)).recommendations" :key="rec">{{ rec }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Variable Font Support Modal -->
    <div v-if="showVariableFont" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm" @click="showVariableFont = false">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative" @click.stop>
        <div class="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h3 class="text-xl font-bold text-gray-900">Variable Font Support</h3>
          <button @click="showVariableFont = false" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <span class="material-symbols-outlined text-gray-600">close</span>
          </button>
        </div>
        
        <div class="p-6">
          <div class="mb-6">
            <label class="text-sm text-gray-600 mb-2 block">Select Font</label>
            <select 
              v-model="selectedVariableFont"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="">Choose a font...</option>
              <option v-for="font in fontData" :key="font.name" :value="font.name">{{ font.name }}</option>
            </select>
          </div>
          
          <div v-if="selectedVariableFont" class="space-y-6">
            <div>
              <label class="text-sm text-gray-600 mb-2 block">Weight: {{ variableWeight }}</label>
              <input 
                v-model.number="variableWeight" 
                type="range" 
                min="100" 
                max="900" 
                step="10"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
            
            <div>
              <label class="text-sm text-gray-600 mb-2 block">Width: {{ variableWidth }}%</label>
              <input 
                v-model.number="variableWidth" 
                type="range" 
                min="50" 
                max="200" 
                step="5"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
            
            <div>
              <label class="text-sm text-gray-600 mb-2 block">Slant: {{ variableSlant }}deg</label>
              <input 
                v-model.number="variableSlant" 
                type="range" 
                min="-15" 
                max="15" 
                step="1"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
            
            <div class="p-4 bg-gray-50 rounded-lg">
              <div class="text-sm text-gray-600 mb-2">Preview</div>
              <div class="text-2xl text-gray-900" :style="{ 
                fontFamily: `'${selectedVariableFont}', sans-serif`, 
                fontWeight: variableWeight,
                fontStretch: variableWidth + '%',
                fontStyle: variableSlant !== 0 ? `oblique ${variableSlant}deg` : 'normal'
              }">
                The quick brown fox jumps over the lazy dog.
              </div>
            </div>
            
            <div class="p-4 bg-gray-900 text-green-400 rounded-lg font-mono text-sm">
              <div class="mb-2">CSS:</div>
              <div>font-family: '{{ selectedVariableFont }}', sans-serif;</div>
              <div>font-weight: {{ variableWeight }};</div>
              <div>font-stretch: {{ variableWidth }}%;</div>
              <div v-if="variableSlant !== 0">font-style: oblique {{ variableSlant }}deg;</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Usage Examples Modal -->
    <div v-if="showUsageExamples" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm" @click="showUsageExamples = false">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative" @click.stop>
        <div class="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h3 class="text-xl font-bold text-gray-900">Usage Examples</h3>
          <button @click="showUsageExamples = false" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <span class="material-symbols-outlined text-gray-600">close</span>
          </button>
        </div>
        
        <div class="p-6">
          <div class="mb-6">
            <label class="text-sm text-gray-600 mb-2 block">Select Font</label>
            <select 
              v-model="selectedFontForExamples"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="">Choose a font...</option>
              <option v-for="font in fontData" :key="font.name" :value="font.name">{{ font.name }}</option>
            </select>
          </div>
          
          <div v-if="selectedFontForExamples" class="space-y-4">
            <div v-for="example in getUsageExamples(fontData.find(f => f.name === selectedFontForExamples))" :key="example.context" class="p-4 border border-gray-200 rounded-lg">
              <div class="text-sm font-semibold text-gray-600 mb-2">{{ example.context }}</div>
              <div class="text-lg text-gray-900" :style="{ fontFamily: `'${selectedFontForExamples}', sans-serif` }">
                {{ example.example }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- License Checker Modal -->
    <div v-if="showLicenseChecker" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm" @click="showLicenseChecker = false">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative" @click.stop>
        <div class="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h3 class="text-xl font-bold text-gray-900">Font License Checker</h3>
          <button @click="showLicenseChecker = false" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <span class="material-symbols-outlined text-gray-600">close</span>
          </button>
        </div>
        
        <div class="p-6">
          <div class="mb-6">
            <label class="text-sm text-gray-600 mb-2 block">Select Font</label>
            <select 
              v-model="selectedFontForLicense"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="">Choose a font...</option>
              <option v-for="font in fontData" :key="font.name" :value="font.name">{{ font.name }}</option>
            </select>
          </div>
          
          <div v-if="selectedFontForLicense" class="space-y-4">
            <div v-if="getFontLicense(fontData.find(f => f.name === selectedFontForLicense))" class="p-4 bg-gray-50 rounded-lg">
              <div class="text-sm text-gray-600 mb-2">License Type</div>
              <div class="text-xl font-bold text-gray-900">{{ getFontLicense(fontData.find(f => f.name === selectedFontForLicense)).type }}</div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div class="p-4 border border-gray-200 rounded-lg">
                <div class="text-sm text-gray-600 mb-1">Commercial Use</div>
                <div :class="getFontLicense(fontData.find(f => f.name === selectedFontForLicense)).commercial ? 'text-green-600' : 'text-red-600'">
                  {{ getFontLicense(fontData.find(f => f.name === selectedFontForLicense)).commercial ? '✓ Allowed' : '✗ Not Allowed' }}
                </div>
              </div>
              
              <div class="p-4 border border-gray-200 rounded-lg">
                <div class="text-sm text-gray-600 mb-1">Modification</div>
                <div :class="getFontLicense(fontData.find(f => f.name === selectedFontForLicense)).modification ? 'text-green-600' : 'text-red-600'">
                  {{ getFontLicense(fontData.find(f => f.name === selectedFontForLicense)).modification ? '✓ Allowed' : '✗ Not Allowed' }}
                </div>
              </div>
              
              <div class="p-4 border border-gray-200 rounded-lg">
                <div class="text-sm text-gray-600 mb-1">Distribution</div>
                <div :class="getFontLicense(fontData.find(f => f.name === selectedFontForLicense)).distribution ? 'text-green-600' : 'text-red-600'">
                  {{ getFontLicense(fontData.find(f => f.name === selectedFontForLicense)).distribution ? '✓ Allowed' : '✗ Not Allowed' }}
                </div>
              </div>
              
              <div class="p-4 border border-gray-200 rounded-lg">
                <div class="text-sm text-gray-600 mb-1">Embedding</div>
                <div :class="getFontLicense(fontData.find(f => f.name === selectedFontForLicense)).embedding ? 'text-green-600' : 'text-red-600'">
                  {{ getFontLicense(fontData.find(f => f.name === selectedFontForLicense)).embedding ? '✓ Allowed' : '✗ Not Allowed' }}
                </div>
              </div>
            </div>
            
            <div class="p-4 bg-indigo-50 rounded-lg">
              <div class="text-sm text-gray-700">{{ getFontLicense(fontData.find(f => f.name === selectedFontForLicense)).details }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Analytics Dashboard Modal -->
    <div v-if="showAnalyticsDashboard" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm" @click="showAnalyticsDashboard = false">
      <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto relative" @click.stop>
        <div class="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h3 class="text-xl font-bold text-gray-900">Font Analytics Dashboard</h3>
          <button @click="showAnalyticsDashboard = false" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <span class="material-symbols-outlined text-gray-600">close</span>
          </button>
        </div>
        
        <div class="p-6">
          <div v-if="getFontAnalytics()" class="space-y-6">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="p-4 bg-indigo-50 rounded-lg">
                <div class="text-sm text-gray-600 mb-1">Total Fonts</div>
                <div class="text-2xl font-bold text-indigo-900">{{ getFontAnalytics().totalFonts }}</div>
              </div>
              
              <div class="p-4 bg-green-50 rounded-lg">
                <div class="text-sm text-gray-600 mb-1">Total Views</div>
                <div class="text-2xl font-bold text-green-900">{{ getFontAnalytics().totalViews }}</div>
              </div>
              
              <div class="p-4 bg-purple-50 rounded-lg">
                <div class="text-sm text-gray-600 mb-1">Favorites</div>
                <div class="text-2xl font-bold text-purple-900">{{ getFontAnalytics().totalFavorites }}</div>
              </div>
              
              <div class="p-4 bg-orange-50 rounded-lg">
                <div class="text-sm text-gray-600 mb-1">Collections</div>
                <div class="text-2xl font-bold text-orange-900">{{ getFontAnalytics().totalCollections }}</div>
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="p-4 border border-gray-200 rounded-lg">
                <h4 class="font-semibold text-gray-900 mb-3">Category Breakdown</h4>
                <div class="space-y-2">
                  <div v-for="(count, category) in getFontAnalytics().categoryBreakdown" :key="category" class="flex items-center justify-between">
                    <span class="text-sm text-gray-700 capitalize">{{ category }}</span>
                    <span class="text-sm font-semibold text-gray-900">{{ count }}</span>
                  </div>
                </div>
              </div>
              
              <div class="p-4 border border-gray-200 rounded-lg">
                <h4 class="font-semibold text-gray-900 mb-3">Most Viewed Fonts</h4>
                <div class="space-y-2">
                  <div v-for="(fontName, index) in getFontAnalytics().mostViewed" :key="fontName" class="flex items-center justify-between">
                    <span class="text-sm text-gray-700">#{{ index + 1 }} {{ fontName }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="p-4 border border-gray-200 rounded-lg">
              <h4 class="font-semibold text-gray-900 mb-3">Most Favorited Fonts</h4>
              <div class="flex flex-wrap gap-2">
                <span v-for="fontName in getFontAnalytics().mostFavorited" :key="fontName" class="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-lg">
                  {{ fontName }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watchEffect, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import FontControls from './FontControls.vue'
import FontCard from './FontCard.vue'
import ComparisonView from './ComparisonView.vue'
import ColorPickerPopup from './ColorPickerPopup.vue'
import { loadFont } from '../../composables/useFontLoader.js'
import { useLocalStorage } from '../../composables/useLocalStorage.js'
import { calculateContrast } from '../../composables/useContrast.js'
import { generateCSS } from '../../composables/useCSSGenerator.js'
import { useCollections } from '../../composables/useCollections.js'

import fontData from '../../assets/fonts.json'

const route = useRoute()

const search = ref('')
const selectedTag = ref('')
const selectedScript = ref('')
const selectedWeight = ref('')
const sampleText = ref('The quick brown fox jumps over the lazy dog.')
const showExportModal = ref(false)
const showQuickPreview = ref(false)
const showContrastModal = ref(false)
const showCSSGenerator = ref(false)
const showCollectionsModal = ref(false)
const showFontInfoModal = ref(false)
const showTypographyPresets = ref(false)
const showLineLengthCalc = ref(false)
const showABTesting = ref(false)
const showTypographyHierarchy = ref(false)
const showResponsivePreview = ref(false)
const showCustomFontUpload = ref(false)
const showFontPlaylists = ref(false)
const showCustomTags = ref(false)
const showPerformanceMetrics = ref(false)
const showVariableFont = ref(false)
const showUsageExamples = ref(false)
const showLicenseChecker = ref(false)
const showAnalyticsDashboard = ref(false)
const customFonts = ref([])
const uploadedFontFile = ref(null)
const fontHistory = ref([])
const fontPlaylists = ref([])
const customTags = ref({})
const newPlaylistName = ref('')
const selectedFontForTagging = ref('')
const newTagName = ref('')
const selectedFontForMetrics = ref('')
const selectedVariableFont = ref('')
const variableWeight = ref(400)
const variableWidth = ref(100)
const variableSlant = ref(0)
const selectedFontForSubsetting = ref('')
const selectedWeightForSubsetting = ref('')
const selectedSubsets = ref([])
const selectedFontForExamples = ref('')
const selectedFontForLicense = ref('')
const abTestFont1 = ref(null)
const abTestFont2 = ref(null)
const activeABColorPicker = ref(null)
const abTextColorButtonRef = ref(null)
const abBgColorButtonRef = ref(null)
const abTextColorPickerStyle = ref({})
const abBgColorPickerStyle = ref({})
const fontStack = ref(['Arial', 'Helvetica', 'sans-serif'])
const selectedFontForStack = ref('')
const newFontInStack = ref('')
const defaultFontStack = ref(['Arial', 'Helvetica', 'sans-serif'])
const selectedFontForHierarchy = ref('')
const selectedFontForResponsive = ref('')
const previewFont = ref(null)
const contrastResult = ref(null)
const generatedCSS = ref('')
const cssFormat = ref('css')
const collections = ref([])
const newCollectionName = ref('')
const selectedCollection = ref(null)
const typographyPresets = ref([])
const currentPreset = ref(null)
const fontInfo = ref(null)
const fontSize = ref(24)
const fontWeight = ref(400)
const lineHeight = ref(1.4)
const letterSpacing = ref(0)
const textColor = ref('#000000')
const bgColor = ref('#FFFFFF')
// Initialize dark mode from localStorage or document class
const getInitialDarkMode = () => {
  // Check if dark class is already on html
  if (document.documentElement.classList.contains('dark')) {
    return true;
  }
  // Check localStorage
  const saved = localStorage.getItem('darkMode');
  if (saved !== null) {
    return saved === 'true';
  }
  return false;
};

const isDarkMode = ref(getInitialDarkMode())
const previewDarkMode = ref(false)
const theme = ref('light')
const mobileMode = ref(false)
const favorites = ref([])
const compareList = ref([])
const recentlyViewed = ref([])
const fontTokens = ref({
  heading: '',
  body: '',
  ui: ''
})
const styleJSON = ref('')

// Load from localStorage
const recentlyViewedStorage = useLocalStorage('fontPreviewer_recentlyViewed', [])
const favoritesStorage = useLocalStorage('fontPreviewer_favorites', [])
const presetsStorage = useLocalStorage('fontPreviewer_presets', [])
const historyStorage = useLocalStorage('fontPreviewer_history', [])
const playlistsStorage = useLocalStorage('fontPreviewer_playlists', [])
const customTagsStorage = useLocalStorage('fontPreviewer_customTags', {})
const { getCollections, saveCollection, deleteCollection, updateCollection } = useCollections()

let darkModeObserver = null

// Watch isDarkMode and sync with document class
watch(isDarkMode, (newValue) => {
  // Apply class synchronously
  if (newValue) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}, { immediate: true })

onMounted(() => {
  recentlyViewed.value = recentlyViewedStorage.get()
  favorites.value = favoritesStorage.get()
  collections.value = getCollections()
  typographyPresets.value = presetsStorage.get()
  fontHistory.value = historyStorage.get()
  fontPlaylists.value = playlistsStorage.get()
  customTags.value = customTagsStorage.get()
  loadCollectionFromURL()
  
  // Watch for external dark mode changes (from other components)
  darkModeObserver = new MutationObserver(() => {
    const hasDarkClass = document.documentElement.classList.contains('dark')
    if (hasDarkClass !== isDarkMode.value) {
      isDarkMode.value = hasDarkClass
    }
  })
  
  darkModeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })
})

onBeforeUnmount(() => {
  if (darkModeObserver) {
    darkModeObserver.disconnect()
  }
})

// Watch route changes to refresh recentlyViewed when returning to homepage
watch(() => route.path, (newPath) => {
  if (newPath === '/') {
    // Always refresh from localStorage when route changes to home
    recentlyViewed.value = recentlyViewedStorage.get() || []
  }
}, { immediate: true })

// Filter and lazy load
const filteredFonts = computed(() =>
  fontData.filter((font) => {
    return (
      (!search.value || font.name.toLowerCase().includes(search.value.toLowerCase())) &&
      (!selectedTag.value || font.tags.includes(selectedTag.value)) &&
      (!selectedScript.value || (font.supports && font.supports.includes(selectedScript.value))) &&
      (!selectedWeight.value || (font.weights && font.weights.includes(selectedWeight.value)))
    )
  })
)

const comparisonFonts = computed(() =>
  fontData.filter((f) => compareList.value.includes(f.name))
)

const computedRecommendations = computed(() => getFontRecommendations())

const computedTypographyScale = computed(() => {
  const ratio = 1.333 // Major third
  const baseSize = fontSize.value
  return {
    h1: Math.round(baseSize * Math.pow(ratio, 3)),
    h2: Math.round(baseSize * Math.pow(ratio, 2)),
    h3: Math.round(baseSize * ratio),
    h4: baseSize,
    h5: Math.round(baseSize / ratio),
    h6: Math.round(baseSize / Math.pow(ratio, 2)),
    body: baseSize,
    small: Math.round(baseSize * 0.875)
  }
})

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}

function toggleDarkMode() {
  // Only toggle preview dark mode, not global dark mode
  previewDarkMode.value = !previewDarkMode.value
  
  // Update preview box colors based on preview dark mode
  if (previewDarkMode.value) {
    bgColor.value = '#1e293b' // slate-800
    textColor.value = '#f1f5f9' // slate-100
  } else {
    bgColor.value = '#FFFFFF'
    textColor.value = '#000000'
  }
  
  // Force Vue to re-render by triggering a style recalculation
  nextTick(() => {
    // Force a repaint to ensure Tailwind classes are applied
    document.body.offsetHeight
  })
}

function addToRecentlyViewed(fontName) {
  if (!fontName) return
  
  // Get current list from localStorage to ensure we have the latest
  const current = recentlyViewedStorage.get() || []
  const index = current.indexOf(fontName)
  
  // Remove if already exists
  if (index !== -1) {
    current.splice(index, 1)
  }
  
  // Add to beginning
  current.unshift(fontName)
  
  // Limit to 20 items
  if (current.length > 20) {
    current.pop()
  }
  
  // Update both local ref and localStorage
  recentlyViewed.value = current
  recentlyViewedStorage.set(current)
}

function toggleFavorite(font) {
  const index = favorites.value.indexOf(font.name)
  if (index === -1) {
    favorites.value.push(font.name)
  } else {
    favorites.value.splice(index, 1)
  }
  favoritesStorage.set(favorites.value)
  addToRecentlyViewed(font.name)
}

function isFavorite(font) {
  return favorites.value.includes(font.name)
}

function isInComparison(font) {
  return compareList.value.includes(font.name)
}

function toggleCompare(font) {
  const index = compareList.value.indexOf(font.name)
  if (index === -1 && compareList.value.length < 3) compareList.value.push(font.name)
  else compareList.value.splice(index, 1)
}

function copyFont(font) {
  navigator.clipboard.writeText(font.url)
}

function getCustomFilename(font) {
  return font.name.toLowerCase().replace(/\s+/g, '-') + '.woff2'
}

function getContrastLevel(textColor, bgColor) {
  const result = calculateContrast(textColor, bgColor)
  if (!result) return 'Fail'
  if (result.ratio >= 7) return 'AAA'
  if (result.ratio >= 4.5) return 'AA'
  return 'Fail'
}

function showContrastAnalyzer() {
  contrastResult.value = calculateContrast(textColor.value, bgColor.value)
  showContrastModal.value = true
}

function generateCSSCode() {
  const favoriteFonts = favorites.value.map(name => fontData.find(f => f.name === name)).filter(Boolean)
  const fontsToExport = [...favoriteFonts, ...comparisonFonts.value]
  if (fontsToExport.length === 0) {
    alert('Please add fonts to favorites or comparison first')
    return
  }
  generatedCSS.value = generateCSS(fontsToExport, { format: cssFormat.value, includeVariables: true })
  showCSSGenerator.value = true
}

function copyCSS() {
  navigator.clipboard.writeText(generatedCSS.value)
  alert('CSS copied to clipboard!')
}

function createCollection() {
  if (!newCollectionName.value.trim()) return
  const fontsToSave = [...favorites.value, ...comparisonFonts.value.map(f => f.name)]
  if (fontsToSave.length === 0) {
    alert('Please add fonts to favorites or comparison first')
    return
  }
  const collection = saveCollection(newCollectionName.value, fontsToSave)
  collections.value.push(collection)
  newCollectionName.value = ''
  alert('Collection created!')
}

function deleteCollectionById(id) {
  deleteCollection(id)
  collections.value = getCollections()
}

function showFontInfo(font) {
  fontInfo.value = font
  showFontInfoModal.value = true
}

function saveTypographyPreset() {
  const preset = {
    id: Date.now().toString(),
    name: `Preset ${typographyPresets.value.length + 1}`,
    fontSize: fontSize.value,
    fontWeight: fontWeight.value,
    lineHeight: lineHeight.value,
    letterSpacing: letterSpacing.value,
    textColor: textColor.value,
    bgColor: bgColor.value,
    createdAt: new Date().toISOString()
  }
  typographyPresets.value.push(preset)
  presetsStorage.set(typographyPresets.value)
  alert('Preset saved!')
}

function loadTypographyPreset(preset) {
  fontSize.value = preset.fontSize
  fontWeight.value = preset.fontWeight
  lineHeight.value = preset.lineHeight
  letterSpacing.value = preset.letterSpacing
  textColor.value = preset.textColor
  bgColor.value = preset.bgColor
  showTypographyPresets.value = false
}

function calculateOptimalLineLength(fontSize) {
  // Optimal line length: 45-75 characters, or 2-3 times the font size
  const minChars = 45
  const maxChars = 75
  const minWidth = fontSize * 2
  const maxWidth = fontSize * 3
  return {
    minChars,
    maxChars,
    minWidth: Math.round(minWidth),
    maxWidth: Math.round(maxWidth),
    optimalChars: Math.round((minChars + maxChars) / 2),
    optimalWidth: Math.round((minWidth + maxWidth) / 2)
  }
}

function getSelectedFontForStack() {
  if (!selectedFontForStack.value) return null
  return fontData.find(f => f.name === selectedFontForStack.value)
}

function addToFontStack(fontName) {
  if (!fontName || !fontName.trim()) return
  const trimmed = fontName.trim()
  if (!fontStack.value.includes(trimmed)) {
    fontStack.value.push(trimmed)
  }
  newFontInStack.value = ''
}

function removeFromFontStack(index) {
  if (index > 0 && index < fontStack.value.length) {
    fontStack.value.splice(index, 1)
  }
}

function resetFontStack() {
  if (selectedFontForStack.value) {
    fontStack.value = buildFontStack(selectedFontForStack.value)
  } else {
    fontStack.value = [...defaultFontStack.value]
  }
}

function copyFontStack() {
  const css = `font-family: ${fontStack.value.map(f => `'${f}'`).join(', ')};`
  navigator.clipboard.writeText(css).then(() => {
    alert('Font stack CSS copied to clipboard!')
  }).catch(() => {
    alert('Failed to copy to clipboard')
  })
}

function buildFontStack(fontName) {
  const stacks = {
    'serif': [fontName, 'Georgia', 'Times New Roman', 'serif'],
    'sans-serif': [fontName, 'Arial', 'Helvetica', 'sans-serif'],
    'monospace': [fontName, 'Courier New', 'Courier', 'monospace'],
    'display': [fontName, 'Impact', 'Arial Black', 'sans-serif'],
    'handwriting': [fontName, 'cursive']
  }
  
  const font = fontData.find(f => f.name === fontName)
  if (font && font.tags && font.tags.length > 0) {
    return stacks[font.tags[0]] || stacks['sans-serif']
  }
  return stacks['sans-serif']
}

function startABTest(font1, font2) {
  abTestFont1.value = font1
  abTestFont2.value = font2
  showABTesting.value = true
}

function openABColorPicker(type, event) {
  if (activeABColorPicker.value === type) {
    activeABColorPicker.value = null
    return
  }
  
  activeABColorPicker.value = type
  
  // Get button reference
  const buttonRef = type === 'text' ? abTextColorButtonRef.value : abBgColorButtonRef.value
  if (!buttonRef) return
  
  // Calculate position relative to viewport
  const rect = buttonRef.getBoundingClientRect()
  const pickerWidth = 280
  const pickerHeight = 500 // Approximate height of color picker
  const gap = 16
  
  // Try positioning to the right first
  let left = rect.right + gap
  let top = rect.top
  
  // If there's not enough space on the right, show on the left
  if (left + pickerWidth > window.innerWidth) {
    left = rect.left - pickerWidth - gap
  }
  
  // If there's not enough space below, position above
  if (top + pickerHeight > window.innerHeight) {
    top = rect.bottom - pickerHeight
  }
  
  // Ensure it doesn't go off-screen horizontally
  left = Math.max(gap, Math.min(left, window.innerWidth - pickerWidth - gap))
  
  // Ensure it doesn't go off-screen vertically
  top = Math.max(gap, Math.min(top, window.innerHeight - pickerHeight - gap))
  
  // If still doesn't fit, center it horizontally
  if (top + pickerHeight > window.innerHeight) {
    top = Math.max(gap, (window.innerHeight - pickerHeight) / 2)
  }
  
  const style = {
    left: `${left}px`,
    top: `${top}px`,
    width: `${pickerWidth}px`,
    position: 'fixed', // Use fixed positioning to stay within viewport
  }
  
  if (type === 'text') {
    abTextColorPickerStyle.value = style
  } else {
    abBgColorPickerStyle.value = style
  }
}

function findSimilarFonts(font) {
  // Find fonts with similar tags and characteristics
  const similar = fontData.filter(f => {
    if (f.name === font.name) return false
    const sharedTags = f.tags?.filter(tag => font.tags?.includes(tag)) || []
    return sharedTags.length > 0 || 
           (f.tags?.includes('sans-serif') && font.tags?.includes('sans-serif'))
  }).slice(0, 5)
  return similar
}

function getFontRecommendations() {
  // Simple recommendation algorithm based on tags and pairsWellWith
  const recommendations = []
  favorites.value.forEach(fontName => {
    const font = fontData.find(f => f.name === fontName)
    if (font && font.pairsWellWith) {
      font.pairsWellWith.forEach(pairName => {
        const pairFont = fontData.find(f => f.name === pairName)
        if (pairFont && !recommendations.find(r => r.name === pairFont.name)) {
          recommendations.push(pairFont)
        }
      })
    }
  })
  return recommendations.slice(0, 8)
}

function getBrowserCompatibility(font) {
  // All Google Fonts are compatible with modern browsers
  return {
    chrome: '✓',
    firefox: '✓',
    safari: '✓',
    edge: '✓',
    opera: '✓',
    ios: '✓',
    android: '✓'
  }
}

function suggestFontPairings(font) {
  // Suggest font pairings based on design principles
  const pairings = []
  if (font.tags?.includes('serif')) {
    // Serif pairs well with sans-serif
    const sansSerifFonts = fontData.filter(f => f.tags?.includes('sans-serif')).slice(0, 3)
    pairings.push(...sansSerifFonts.map(f => ({ font: f, reason: 'Serif pairs well with sans-serif' })))
  }
  if (font.tags?.includes('sans-serif')) {
    // Sans-serif pairs well with serif or another sans-serif
    const serifFonts = fontData.filter(f => f.tags?.includes('serif')).slice(0, 2)
    const sansSerifFonts = fontData.filter(f => f.tags?.includes('sans-serif') && f.name !== font.name).slice(0, 2)
    pairings.push(...serifFonts.map(f => ({ font: f, reason: 'Sans-serif pairs well with serif' })))
    pairings.push(...sansSerifFonts.map(f => ({ font: f, reason: 'Complementary sans-serif' })))
  }
  if (font.pairsWellWith) {
    font.pairsWellWith.forEach(pairName => {
      const pairFont = fontData.find(f => f.name === pairName)
      if (pairFont && !pairings.find(p => p.font.name === pairFont.name)) {
        pairings.push({ font: pairFont, reason: 'Recommended pairing' })
      }
    })
  }
  return pairings.slice(0, 6)
}

function generateShareableLink(collection) {
  // Generate a shareable link for collections
  const encoded = btoa(JSON.stringify({ fonts: collection.fonts, name: collection.name }))
  return `${window.location.origin}${window.location.pathname}?collection=${encoded}`
}

function shareCollection(collection) {
  const link = generateShareableLink(collection)
  navigator.clipboard.writeText(link)
  alert('Shareable link copied to clipboard!')
}

function loadCollectionFromURL() {
  const params = new URLSearchParams(window.location.search)
  const collectionParam = params.get('collection')
  if (collectionParam) {
    try {
      const decoded = JSON.parse(atob(collectionParam))
      // Could show a modal to load the collection
      console.log('Collection to load:', decoded)
    } catch (e) {
      console.error('Invalid collection parameter')
    }
  }
}

function buildTypographyHierarchy() {
  // Build a complete typography system with all elements
  const scale = computedTypographyScale.value
  return {
    h1: {
      fontSize: scale.h1,
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: -0.5,
      marginBottom: scale.h1 * 0.5
    },
    h2: {
      fontSize: scale.h2,
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: -0.3,
      marginBottom: scale.h2 * 0.5
    },
    h3: {
      fontSize: scale.h3,
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: 0,
      marginBottom: scale.h3 * 0.5
    },
    h4: {
      fontSize: scale.h4,
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: 0,
      marginBottom: scale.h4 * 0.5
    },
    h5: {
      fontSize: scale.h5,
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: 0,
      marginBottom: scale.h5 * 0.5
    },
    h6: {
      fontSize: scale.h6,
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: 0,
      marginBottom: scale.h6 * 0.5
      },
      body: {
      fontSize: scale.body,
      fontWeight: 400,
      lineHeight: lineHeight.value,
      letterSpacing: letterSpacing.value,
      marginBottom: scale.body * lineHeight.value
    },
    small: {
      fontSize: scale.small,
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: 0.5,
      marginBottom: scale.small * 0.5
    }
  }
}

function handleCustomFontUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  
  if (!file.name.match(/\.(woff|woff2|ttf|otf)$/i)) {
    alert('Please upload a valid font file (.woff, .woff2, .ttf, or .otf)')
    return
  }
  
  const fontName = file.name.replace(/\.[^/.]+$/, '')
  const url = URL.createObjectURL(file)
  
  const customFont = {
    name: fontName,
    url: url,
    tags: ['custom'],
    weights: ['400'],
    supports: ['latin'],
    isCustom: true
  }
  
  customFonts.value.push(customFont)
  fontData.push(customFont)
  
  // Load the font
  loadFont(fontName, url)
  
  alert(`Custom font "${fontName}" uploaded successfully!`)
}

function exportToDesignTool(format) {
  const favoriteFonts = favorites.value.map(name => fontData.find(f => f.name === name)).filter(Boolean)
  const fontsToExport = [...favoriteFonts, ...comparisonFonts.value]
  if (fontsToExport.length === 0) {
    alert('Please add fonts to favorites or comparison first')
    return
  }
  
  let output = ''
  if (format === 'figma') {
    output = fontsToExport.map(f => `Font: ${f.name}\nURL: ${f.url}`).join('\n\n')
  } else if (format === 'adobe') {
    // Adobe Creative Cloud compatible format
    const adobeFormat = {
      version: '1.0',
      metadata: {
        created: new Date().toISOString(),
        source: 'Font Previewer',
        format: 'adobe-creative-cloud',
        application: 'Adobe Creative Cloud'
      },
      fonts: fontsToExport.map(f => {
        // Extract font family name (remove style/weight suffixes)
        const familyName = f.name.split(/\s*(?:Regular|Bold|Italic|Light|Medium|Black|Thin|Extra|Semi|Condensed|Extended)/i)[0].trim()
        
        // Get all available weights
        const weights = f.weights || ['400']
        const weightNames = {
          '100': 'Thin',
          '200': 'Extra Light',
          '300': 'Light',
          '400': 'Regular',
          '500': 'Medium',
          '600': 'Semi Bold',
          '700': 'Bold',
          '800': 'Extra Bold',
          '900': 'Black'
        }
        
        // Create variants array with all weights
        const variants = weights.map(w => ({
          weight: parseInt(w),
          style: weightNames[w] || 'Regular',
          url: f.url
        }))
        
        return {
          family: familyName,
          displayName: f.name,
          category: f.tags?.[0] || 'sans-serif',
          source: 'google-fonts',
          url: f.url,
          subsets: f.supports || ['latin'],
          variants: variants,
          defaultWeight: parseInt(weights[0] || '400'),
          defaultStyle: weightNames[weights[0]] || 'Regular'
        }
      })
    }
    output = JSON.stringify(adobeFormat, null, 2)
  } else if (format === 'xd') {
    output = fontsToExport.map(f => `${f.name}: ${f.url}`).join('\n')
  }
  
  const blob = new Blob([output], { type: format === 'adobe' ? 'application/json' : 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `fonts-export-${format}.${format === 'adobe' ? 'json' : 'txt'}`
  a.click()
  URL.revokeObjectURL(url)
}

function saveSearchHistory() {
  // Debounce to avoid saving on every keystroke
  clearTimeout(saveSearchHistory.timeout)
  saveSearchHistory.timeout = setTimeout(() => {
    if (!search.value && !selectedTag.value && !selectedScript.value && !selectedWeight.value) return
    
    const historyEntry = {
      id: Date.now().toString(),
      search: search.value,
      tag: selectedTag.value,
      script: selectedScript.value,
      weight: selectedWeight.value,
      timestamp: new Date().toISOString()
    }
    fontHistory.value.unshift(historyEntry)
    if (fontHistory.value.length > 50) {
      fontHistory.value.pop()
    }
    historyStorage.set(fontHistory.value)
  }, 1000)
}

function addCustomTag(fontName, tag) {
  if (!customTags.value[fontName]) {
    customTags.value[fontName] = []
  }
  if (!customTags.value[fontName].includes(tag)) {
    customTags.value[fontName].push(tag)
    customTagsStorage.set(customTags.value)
  }
}

function removeCustomTag(fontName, tag) {
  if (customTags.value[fontName]) {
    customTags.value[fontName] = customTags.value[fontName].filter(t => t !== tag)
    customTagsStorage.set(customTags.value)
  }
}

function createPlaylist(name, fonts) {
  const playlist = {
    id: Date.now().toString(),
    name,
    fonts,
    createdAt: new Date().toISOString()
  }
  fontPlaylists.value.push(playlist)
  playlistsStorage.set(fontPlaylists.value)
  return playlist
}

function deletePlaylist(id) {
  fontPlaylists.value = fontPlaylists.value.filter(p => p.id !== id)
  playlistsStorage.set(fontPlaylists.value)
}

function getFontPerformanceMetrics(font) {
  // Simulate performance metrics
  return {
    fileSize: Math.round(Math.random() * 200 + 50) + ' KB',
    loadTime: (Math.random() * 100 + 50).toFixed(0) + 'ms',
    format: 'WOFF2',
    optimized: true,
    recommendations: [
      'Use font-display: swap for better performance',
      'Consider subsetting for smaller file size',
      'Preload critical fonts'
    ]
  }
}

function getFontLicense(font) {
  // Google Fonts are open source
  return {
    type: 'Open Font License (OFL)',
    commercial: true,
    modification: true,
    distribution: true,
    embedding: true,
    details: 'Google Fonts are open source and free to use for both personal and commercial projects. You can modify and redistribute them.'
  }
}

function getUsageExamples(font) {
  return [
    { context: 'Website Headings', example: 'Modern, clean headings for websites' },
    { context: 'Mobile Apps', example: 'UI text in mobile applications' },
    { context: 'Print Design', example: 'Magazines and printed materials' },
    { context: 'Branding', example: 'Corporate identity and logos' },
    { context: 'Display Text', example: 'Large, attention-grabbing headlines' }
  ]
}

function getFontAnalytics() {
  return {
    totalFonts: fontData.length,
    totalViews: recentlyViewed.value.length,
    totalFavorites: favorites.value.length,
    totalCollections: collections.value.length,
    totalPlaylists: fontPlaylists.value.length,
    mostViewed: recentlyViewed.value.slice(0, 5),
    mostFavorited: [...favorites.value].slice(0, 5),
    categoryBreakdown: {
      'sans-serif': fontData.filter(f => f.tags?.includes('sans-serif')).length,
      'serif': fontData.filter(f => f.tags?.includes('serif')).length,
      'display': fontData.filter(f => f.tags?.includes('display')).length,
      'monospace': fontData.filter(f => f.tags?.includes('monospace')).length,
      'handwriting': fontData.filter(f => f.tags?.includes('handwriting')).length
    }
  }
}

function exportFavorites() {
  const favoriteFonts = favorites.value.map(name => fontData.find(f => f.name === name)).filter(Boolean)
  const output = {
    fonts: favoriteFonts.map(font => ({
      name: font.name,
      url: font.url,
      tags: font.tags
    }))
  }
  const json = JSON.stringify(output, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'favorite-fonts.json'
  a.click()
  URL.revokeObjectURL(url)
  showExportModal.value = false
}

function exportComparison() {
  const output = {
    fonts: comparisonFonts.value.map(font => ({
      name: font.name,
      url: font.url,
      tags: font.tags
    }))
  }
  const json = JSON.stringify(output, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'comparison-fonts.json'
  a.click()
  URL.revokeObjectURL(url)
  showExportModal.value = false
}

function quickPreview(font) {
  // Show a quick preview modal with the font in different weights
  showQuickPreview.value = true
  previewFont.value = font
  addToRecentlyViewed(font.name)
}

function getSelectedFontForSubsetting() {
  if (!selectedFontForSubsetting.value) return null
  return fontData.find(f => f.name === selectedFontForSubsetting.value)
}

function getAvailableWeightsForSubsetting() {
  const font = getSelectedFontForSubsetting()
  if (!font || !font.weights) return []
  return font.weights.sort((a, b) => parseInt(a) - parseInt(b))
}

function getAvailableSubsetsForFont() {
  const font = getSelectedFontForSubsetting()
  if (!font || !font.supports) return []
  
  const allSubsets = [
    { value: 'latin', label: 'Latin', base: 'latin' },
    { value: 'latin-ext', label: 'Latin Extended', base: 'latin' },
    { value: 'cyrillic', label: 'Cyrillic', base: 'cyrillic' },
    { value: 'cyrillic-ext', label: 'Cyrillic Extended', base: 'cyrillic' },
    { value: 'greek', label: 'Greek', base: 'greek' },
    { value: 'greek-ext', label: 'Greek Extended', base: 'greek' },
    { value: 'arabic', label: 'Arabic', base: 'arabic' },
    { value: 'devanagari', label: 'Devanagari', base: 'devanagari' },
    { value: 'chinese', label: 'Chinese', base: 'chinese' }
  ]
  
  // Filter to only show subsets for scripts the font supports
  return allSubsets.filter(subset => {
    return font.supports.includes(subset.base)
  })
}

function copySubsetURL() {
  if (!selectedFontForSubsetting.value || selectedSubsets.value.length === 0 || !selectedWeightForSubsetting.value) return
  const url = `https://fonts.googleapis.com/css2?family=${selectedFontForSubsetting.value.replace(/\s/g, '+')}:wght@${selectedWeightForSubsetting.value}&subset=${selectedSubsets.value.join(',')}`
  navigator.clipboard.writeText(url).then(() => {
    alert('Font subset URL copied to clipboard!')
  }).catch(() => {
    alert('Failed to copy to clipboard')
  })
}

function getWeightName(weight) {
  const weightNames = {
    '100': 'Thin',
    '200': 'Extra Light',
    '300': 'Light',
    '400': 'Regular',
    '500': 'Medium',
    '600': 'Semi Bold',
    '700': 'Bold',
    '800': 'Extra Bold',
    '900': 'Black'
  }
  return weightNames[weight.toString()] || 'Unknown'
}


watchEffect(() => {
  filteredFonts.value.forEach(font => {
    loadFont(font.name, font.url)
  })
})

watchEffect(() => {
  saveSearchHistory()
})
</script>