<template>
  <div>
    <InlineNotice :notice="notice" class="mb-6" @dismiss="clearNotice" />
    <UiAnnounce :text="resultsAnnouncement" />

    <PageSection title="Preview settings" description="Filter the library and set the text every card shows.">
      <template #actions>
        <UiButton icon="download" :disabled="!exportCount" @click="openExport">Export{{ exportCount ? ` (${exportCount})` : '' }}</UiButton>
      </template>
      <FontControls
        v-model:search="search"
        v-model:selected-tag="selectedTag"
        v-model:selected-script="selectedScript"
        v-model:selected-weight="selectedWeight"
        v-model:sample-text="sampleText"
        v-model:font-size="fontSize"
        v-model:font-weight="fontWeight"
        v-model:line-height="lineHeight"
        v-model:letter-spacing="letterSpacing"
        v-model:text-color="textColor"
        v-model:bg-color="bgColor"
        :options="options"
        :preview-dark-mode="previewDarkMode"
        @toggle-dark-mode="toggleDarkMode"
      />
    </PageSection>

    <PageSection v-if="comparisonFonts.length" title="Comparison" :description="`${comparisonFonts.length} of 3 families. Add a family from its card.`" divided>
      <template #actions>
        <UiButton v-if="comparisonFonts.length === 2" icon="columns-2" @click="startABTest(comparisonFonts[0], comparisonFonts[1])">A/B test</UiButton>
        <UiButton variant="ghost" icon="x" @click="compareList = []">Clear comparison</UiButton>
      </template>
      <ComparisonView :comparison-fonts="comparisonFonts" :sample-text="sampleText" :toggle-compare="toggleCompare" />
    </PageSection>

    <PageSection
      v-if="recommendations.length && !hasFilters"
      title="Pairs with your favourites"
      description="Families your favourites are known to pair well with."
      divided
    >
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <FontCard v-for="font in recommendations" :key="font.name" v-bind="cardProps(font)" @toggle-preview="quickPreview" @add-to-recently-viewed="addToRecentlyViewed" />
      </div>
    </PageSection>

    <PageSection v-if="recentFonts.length && !hasFilters" title="Recently viewed" divided>
      <template #actions>
        <UiButton variant="ghost" icon="x" @click="clearRecentlyViewed">Clear recently viewed</UiButton>
      </template>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <FontCard v-for="font in recentFonts" :key="font.name" v-bind="cardProps(font)" @toggle-preview="quickPreview" @add-to-recently-viewed="addToRecentlyViewed" />
      </div>
    </PageSection>

    <PageSection :title="hasFilters ? 'Results' : 'All fonts'" :description="resultsSummary" divided>
      <template v-if="hasFilters" #actions>
        <UiButton variant="ghost" icon="x" @click="clearFilters">Clear filters</UiButton>
      </template>
      <div v-if="hasFilters" class="mb-4 flex flex-wrap gap-2">
        <UiChip v-if="search">Name: “{{ search }}”</UiChip>
        <UiChip v-if="selectedTag">Category: {{ selectedTag }}</UiChip>
        <UiChip v-if="selectedScript">Script: {{ selectedScript }}</UiChip>
        <UiChip v-if="selectedWeight">Weight: {{ selectedWeight }}</UiChip>
      </div>
      <div v-if="filteredFonts.length" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <FontCard v-for="font in filteredFonts" :key="font.name" v-bind="cardProps(font)" @toggle-preview="quickPreview" @add-to-recently-viewed="addToRecentlyViewed" />
      </div>
      <UiEmptyState v-else title="No fonts match" body="Try another name, or clear a filter." spot="foundations/font-library">
        <template #actions><UiButton @click="clearFilters">Clear filters</UiButton></template>
      </UiEmptyState>
    </PageSection>

    <!-- Export -->
    <UiDialog v-model:open="showExportModal" title="Export fonts" size="lg">
      <div class="flex flex-col gap-6">
        <section v-if="favoriteFonts.length" class="flex flex-col gap-3">
          <h3 class="text-sm font-semibold text-ink-strong">Favourites ({{ favoriteFonts.length }})</h3>
          <div class="flex flex-wrap gap-2">
            <UiChip v-for="font in favoriteFonts" :key="font.name">{{ font.name }}</UiChip>
          </div>
          <div><UiButton size="sm" icon="download" @click="exportFavorites">Download JSON</UiButton></div>
        </section>
        <section v-if="comparisonFonts.length" class="flex flex-col gap-3">
          <h3 class="text-sm font-semibold text-ink-strong">Comparison ({{ comparisonFonts.length }})</h3>
          <div class="flex flex-wrap gap-2">
            <UiChip v-for="font in comparisonFonts" :key="font.name">{{ font.name }}</UiChip>
          </div>
          <div><UiButton size="sm" icon="download" @click="exportComparison">Download JSON</UiButton></div>
        </section>
        <section class="flex flex-col gap-3">
          <h3 class="text-sm font-semibold text-ink-strong">Code for these fonts</h3>
          <UiSelect v-model="cssFormat" label="Format" :options="cssFormatOptions" />
          <UiCodeBlock :code="generatedCSS" :label="cssFormatLabel" @copied="showNotice('Code copied to the clipboard.', 'success')" />
        </section>
      </div>
    </UiDialog>

    <!-- Every weight of one family -->
    <UiDialog v-model:open="showQuickPreview" :title="previewFont ? previewFont.name : 'Preview'" size="lg">
      <div v-if="previewFont" class="flex flex-col gap-3">
        <div v-for="weight in previewFont.weights || ['400']" :key="weight" class="flex flex-col gap-1">
          <p class="text-xs font-semibold text-ink-muted">{{ weightName(weight) }} ({{ weight }})</p>
          <FontSample :family="previewFont.name" :weight="weight" :size="20" :line-height="1.5" class="text-ink-strong">{{ sampleText || 'The quick brown fox jumps over the lazy dog.' }}</FontSample>
        </div>
      </div>
      <template v-if="previewFont" #footer>
        <UiButton icon="heart" :variant="isFavorite(previewFont) ? 'primary' : 'secondary'" :aria-pressed="isFavorite(previewFont)" @click="toggleFavorite(previewFont)">
          {{ isFavorite(previewFont) ? 'Favourite' : 'Add to favourites' }}
        </UiButton>
        <UiButton :icon="isInComparison(previewFont) ? 'circle-minus' : 'git-compare'" :disabled="!isInComparison(previewFont) && compareFull" @click="toggleCompare(previewFont)">
          {{ isInComparison(previewFont) ? 'Remove from comparison' : 'Add to comparison' }}
        </UiButton>
        <UiButton :to="`/font/${encodeURIComponent(previewFont.name)}`" variant="ghost" trailing-icon="arrow-right">Details</UiButton>
      </template>
    </UiDialog>

    <!-- A/B test of two families -->
    <UiDialog v-model:open="showABTesting" title="A/B font test" size="lg">
      <div v-if="abTestFont1 && abTestFont2" class="flex flex-col gap-6">
        <p class="text-sm text-ink-secondary">The two families side by side. Change the settings and both follow.</p>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <UiRange v-model="fontSize" label="Size" :min="12" :max="72" unit="px" />
          <UiSelect v-model="fontWeight" label="Weight" :options="weightOptions" />
          <UiRange v-model="lineHeight" label="Line height" :min="1" :max="2" :step="0.1" />
          <UiRange v-model="letterSpacing" label="Letter spacing" :min="-2" :max="5" :step="0.1" unit="px" />
          <UiInput v-model="textColor" type="color" label="Text colour" />
          <UiInput v-model="bgColor" type="color" label="Background colour" />
          <UiTextarea v-model="sampleText" label="Sample text" rows="2" class="sm:col-span-2" />
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          <div v-for="(font, index) in [abTestFont1, abTestFont2]" :key="font.name" class="flex flex-col gap-2">
            <h3 class="text-sm font-semibold text-ink-strong">Font {{ index === 0 ? 'A' : 'B' }}: {{ font.name }}</h3>
            <FontSample
              :family="font.name"
              :size="fontSize"
              :weight="fontWeight"
              :line-height="lineHeight"
              :letter-spacing="letterSpacing"
              :color="textColor"
              :background="bgColor"
            >{{ sampleText }}</FontSample>
            <p class="text-xs text-ink-muted">{{ font.tags?.join(', ') }}</p>
          </div>
        </div>
      </div>
    </UiDialog>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch, watchEffect } from 'vue'
import FontControls from './FontControls.vue'
import FontCard from './FontCard.vue'
import FontSample from './FontSample.vue'
import ComparisonView from './ComparisonView.vue'
import InlineNotice from '../InlineNotice.vue'
import { PageSection, UiAnnounce, UiButton, UiChip, UiCodeBlock, UiDialog, UiEmptyState, UiInput, UiRange, UiSelect, UiTextarea } from '../ui'
import { loadFont } from '../../composables/useFontLoader.js'
import { useLocalStorage } from '../../composables/useLocalStorage.js'
import { useNotice } from '../../composables/useNotice.js'
import { generateCSS } from '../../composables/useCSSGenerator.js'
import { WEIGHT_NAMES, filterFonts, filterOptions, pairingRecommendations, weightName } from '../../utils/fontLibrary.js'
import fontData from '../../assets/fonts.json'

/**
 * The font library's previewer: every family in src/assets/fonts.json with the
 * user's sample text and settings, plus favourites, recently viewed and a
 * comparison of up to three families. Favourites and recently viewed are kept
 * in this browser (FontDetail reads the same keys).
 */

const MAX_COMPARE = 3
const LIGHT_PREVIEW = { text: '#000000', background: '#ffffff' }
const DARK_PREVIEW = { text: '#f1f5f9', background: '#1e293b' }

const { notice, showNotice, clearNotice } = useNotice()

const search = ref('')
const selectedTag = ref('')
const selectedScript = ref('')
const selectedWeight = ref('')
const sampleText = ref('The quick brown fox jumps over the lazy dog.')
const fontSize = ref(24)
const fontWeight = ref(400)
const lineHeight = ref(1.4)
const letterSpacing = ref(0)
const textColor = ref(LIGHT_PREVIEW.text)
const bgColor = ref(LIGHT_PREVIEW.background)
const previewDarkMode = ref(false)

const showExportModal = ref(false)
const showQuickPreview = ref(false)
const showABTesting = ref(false)
const previewFont = ref(null)
const abTestFont1 = ref(null)
const abTestFont2 = ref(null)
const cssFormat = ref('css')

const recentlyViewedStorage = useLocalStorage('fontPreviewer_recentlyViewed', [])
const favoritesStorage = useLocalStorage('fontPreviewer_favorites', [])
const known = (names) => (Array.isArray(names) ? names.filter((name) => fontData.some((font) => font.name === name)) : [])
const favorites = ref(known(favoritesStorage.get()))
const recentlyViewed = ref(known(recentlyViewedStorage.get()))
const compareList = ref([])

const options = filterOptions(fontData)
const libraryNames = fontData.map((font) => font.name)
const byName = (name) => fontData.find((font) => font.name === name)

const hasFilters = computed(() => !!(search.value.trim() || selectedTag.value || selectedScript.value || selectedWeight.value))
const filteredFonts = computed(() =>
  filterFonts(fontData, { search: search.value, tag: selectedTag.value, script: selectedScript.value, weight: selectedWeight.value }),
)
const comparisonFonts = computed(() => compareList.value.map(byName).filter(Boolean))
const favoriteFonts = computed(() => favorites.value.map(byName).filter(Boolean))
const recentFonts = computed(() => recentlyViewed.value.slice(0, 8).map(byName).filter(Boolean))
const recommendations = computed(() => pairingRecommendations(fontData, favorites.value))
const compareFull = computed(() => compareList.value.length >= MAX_COMPARE)
const exportCount = computed(() => new Set([...favorites.value, ...compareList.value]).size)

// The count shown in the results heading, said once the filters settle
const resultsSummary = computed(() => `${filteredFonts.value.length} of ${fontData.length} ${fontData.length === 1 ? 'family' : 'families'}`)
const resultsAnnouncement = ref('')
let resultsTimer
watch([search, selectedTag, selectedScript, selectedWeight], () => {
  clearTimeout(resultsTimer)
  resultsTimer = setTimeout(() => {
    resultsAnnouncement.value = resultsSummary.value
  }, 400)
})
onBeforeUnmount(() => clearTimeout(resultsTimer))

const weightOptions = Object.entries(WEIGHT_NAMES).map(([value, name]) => ({ value: Number(value), label: `${name} (${value})` }))

const cssFormatOptions = [
  { value: 'css', label: 'CSS (@import and classes)' },
  { value: 'css-variables', label: 'CSS custom properties' },
  { value: 'tailwind', label: 'Tailwind config' },
  { value: 'embed', label: 'Google Fonts <link> tags' },
]
const cssFormatLabel = computed(() => cssFormatOptions.find((option) => option.value === cssFormat.value)?.label ?? 'Code')
// Favourites first, then the comparison, each family once
const exportFonts = computed(() => [...new Set([...favorites.value, ...compareList.value])].map(byName).filter(Boolean))
const generatedCSS = computed(() => (exportFonts.value.length ? generateCSS(exportFonts.value, { format: cssFormat.value, includeVariables: true }) : ''))

const cardProps = (font) => ({
  font,
  fontSize: fontSize.value,
  fontWeight: fontWeight.value,
  lineHeight: lineHeight.value,
  letterSpacing: letterSpacing.value,
  textColor: textColor.value,
  bgColor: bgColor.value,
  sampleText: sampleText.value,
  selected: isFavorite(font),
  isInComparison: isInComparison(font),
  compareFull: compareFull.value,
  libraryNames,
  copyFont,
  toggleFavorite,
  toggleCompare,
})

function toggleDarkMode() {
  // Only the preview's colours change, never the app's theme
  previewDarkMode.value = !previewDarkMode.value
  const colours = previewDarkMode.value ? DARK_PREVIEW : LIGHT_PREVIEW
  textColor.value = colours.text
  bgColor.value = colours.background
}

function clearFilters() {
  search.value = ''
  selectedTag.value = ''
  selectedScript.value = ''
  selectedWeight.value = ''
}

function addToRecentlyViewed(fontName) {
  if (!fontName) return
  // Read the stored list so other tabs' changes aren't lost; newest first, at most 20
  const current = (recentlyViewedStorage.get() || []).filter((name) => name !== fontName)
  current.unshift(fontName)
  recentlyViewed.value = known(current.slice(0, 20))
  recentlyViewedStorage.set(current.slice(0, 20))
}

function clearRecentlyViewed() {
  recentlyViewed.value = []
  recentlyViewedStorage.set([])
}

function isFavorite(font) {
  return favorites.value.includes(font.name)
}

function toggleFavorite(font) {
  favorites.value = isFavorite(font) ? favorites.value.filter((name) => name !== font.name) : [...favorites.value, font.name]
  favoritesStorage.set(favorites.value)
}

function isInComparison(font) {
  return compareList.value.includes(font.name)
}

function toggleCompare(font) {
  if (isInComparison(font)) compareList.value = compareList.value.filter((name) => name !== font.name)
  else if (!compareFull.value) compareList.value = [...compareList.value, font.name]
  else showNotice(`The comparison holds ${MAX_COMPARE} families. Remove one first.`, 'error')
}

async function copyFont(font) {
  try {
    await navigator.clipboard.writeText(font.url)
    showNotice(`${font.name} stylesheet URL copied to the clipboard.`, 'success')
  } catch {
    showNotice('Could not copy to the clipboard.', 'error')
  }
}

function quickPreview(font) {
  previewFont.value = font
  showQuickPreview.value = true
  addToRecentlyViewed(font.name)
}

function startABTest(font1, font2) {
  abTestFont1.value = font1
  abTestFont2.value = font2
  showABTesting.value = true
}

function openExport() {
  showExportModal.value = true
}

function download(fonts, filename) {
  const json = JSON.stringify({ fonts: fonts.map((font) => ({ name: font.name, url: font.url, tags: font.tags })) }, null, 2)
  const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
  showNotice(`Downloaded ${filename}.`, 'success')
}

const exportFavorites = () => download(favoriteFonts.value, 'favorite-fonts.json')
const exportComparison = () => download(comparisonFonts.value, 'comparison-fonts.json')

// Nothing left to export: close the dialog rather than show it empty
watch(exportCount, (count) => {
  if (!count) showExportModal.value = false
})

watchEffect(() => {
  for (const font of filteredFonts.value) loadFont(font.name, font.url)
})

defineExpose({ filteredFonts, favorites, compareList, recommendations })
</script>
