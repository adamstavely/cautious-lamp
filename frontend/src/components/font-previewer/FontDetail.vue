<template>
  <PageShell>
    <template v-if="font">
      <PageHero :back="{ to: '/design-assets/font-library', label: 'Font library' }" :title="font.name" :lead="font.description" spot="foundations/font-library" size="tool">
        <template #actions>
          <UiButton icon="heart" :variant="isFavorite(font) ? 'primary' : 'secondary'" :aria-pressed="isFavorite(font)" @click="toggleFavorite(font)">
            {{ isFavorite(font) ? 'Favourite' : 'Add to favourites' }}
          </UiButton>
          <UiButton icon="copy" @click="copyFont(font)">Copy URL</UiButton>
        </template>
      </PageHero>

      <InlineNotice :notice="notice" class="mb-6" @dismiss="clearNotice" />

      <div class="mb-8 flex flex-wrap gap-2">
        <UiChip v-for="tag in font.tags" :key="tag">{{ tag }}</UiChip>
        <UiChip v-for="script in font.supports || []" :key="script" tone="accent">{{ script }}</UiChip>
      </div>

      <PageSection title="Preview" description="The font at heading, body and caption sizes, and in every weight it comes in.">
        <div class="flex flex-col gap-4">
          <UiPanel v-for="level in hierarchy" :key="level.label" :title="level.label" heading-tag="h3">
            <UiTypeSample :family="family" :size="level.size" :weight="level.weight" :line-height="level.lineHeight" class="text-ink-strong">
              {{ level.long ? `${sampleText} This is a longer example of body text to show how the font performs in paragraphs and extended reading.` : sampleText }}
            </UiTypeSample>
          </UiPanel>
        </div>
      </PageSection>

      <PageSection title="Weights" divided>
        <div class="flex flex-col gap-4">
          <UiPanel v-for="weight in font.weights || ['400']" :key="weight" :title="`${getWeightName(weight)} (${weight})`" heading-tag="h3">
            <UiTypeSample :family="family" :size="24" :weight="weight" :line-height="1.4" class="text-ink-strong">{{ sampleText }}</UiTypeSample>
          </UiPanel>
          <UiPanel title="Numbers and special characters" heading-tag="h3">
            <UiTypeSample :family="family" :size="24" :line-height="1.4" class="text-ink-strong">0123456789 !@#$%^&amp;*()_+-=[]{}|;':",./&lt;&gt;?`~</UiTypeSample>
          </UiPanel>
        </div>
      </PageSection>

      <PageSection title="Performance" description="Measured in this browser when the font loaded. A value that couldn't be measured says so." divided>
        <UiSpinner v-if="measuring" label="Measuring the font…" />
        <template v-else-if="metrics">
          <div class="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <UiStat icon="hard-drive" label="Downloaded" :value="formatBytes(metrics.bytes)" :hint="sizeHint" />
            <UiStat icon="timer-off" label="Load time" :value="formatMs(metrics.loadTime)" :hint="metrics.loadSource ? `From ${metrics.loadSource}` : 'Not measurable here'" />
            <UiStat icon="file-code" label="Format" :value="metrics.formats.join(', ') || 'Unknown'" />
            <UiStat icon="clock" label="font-display" :value="metrics.display || 'Not set'" />
          </div>
          <UiCallout v-if="metrics.error" tone="warning" title="Part of the measurement failed" class="mb-4">{{ metrics.error }}</UiCallout>
          <UiCallout v-if="metrics.recommendations.length" title="Recommendations">
            <ul class="list-disc pl-5">
              <li v-for="rec in metrics.recommendations" :key="rec">{{ rec }}</li>
            </ul>
          </UiCallout>
          <UiCallout v-else tone="success" title="Nothing to improve">WOFF2, font-display set, and under 100 KB downloaded.</UiCallout>
          <div class="mt-4">
            <UiButton size="sm" variant="ghost" icon="refresh-cw" @click="measure">Measure again</UiButton>
          </div>
        </template>
      </PageSection>

      <PageSection title="License" divided>
        <p class="text-sm text-ink">
          {{ font.name }} is served by Google Fonts, whose fonts are open source (most under the SIL Open Font License, some under Apache 2.0) and free for personal and commercial use. Check the exact license on the font's page before you ship it.
        </p>
        <UiLink class="mt-2" :href="`https://fonts.google.com/specimen/${encodeURIComponent(font.name).replace(/%20/g, '+')}/license`" external>{{ font.name }} license on Google Fonts</UiLink>
      </PageSection>
    </template>
  </PageShell>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import fontData from '../../assets/fonts.json'
import InlineNotice from '../InlineNotice.vue'
import { PageHero, PageSection, PageShell, UiButton, UiCallout, UiChip, UiLink, UiPanel, UiSpinner, UiStat, UiTypeSample } from '../ui'
import { useLocalStorage } from '../../composables/useLocalStorage.js'
import { loadFont } from '../../composables/useFontLoader.js'
import { useNotice } from '../../composables/useNotice.js'
import { formatBytes, formatMs, measureFont, whenStylesheetLoaded } from '../../utils/fontMetrics.js'

const route = useRoute()
const router = useRouter()
const { notice, showNotice, clearNotice } = useNotice()

const font = ref(null)
const sampleText = ref('The quick brown fox jumps over the lazy dog.')
const metrics = ref(null)
const measuring = ref(false)

const favoritesStorage = useLocalStorage('fontPreviewer_favorites', [])
const favorites = ref([])
const recentlyViewedStorage = useLocalStorage('fontPreviewer_recentlyViewed', [])

const family = computed(() => (font.value ? `'${font.value.name}', sans-serif` : ''))

const hierarchy = [
  { label: 'Heading 1', size: 36, weight: 700, lineHeight: 1.25 },
  { label: 'Heading 2', size: 30, weight: 700, lineHeight: 1.25 },
  { label: 'Heading 3', size: 24, weight: 600, lineHeight: 1.375 },
  { label: 'Body', size: 16, weight: 400, lineHeight: 1.625, long: true },
  { label: 'Caption', size: 14, weight: 400, lineHeight: 1.5 },
]

const sizeHint = computed(() => {
  if (!metrics.value || metrics.value.bytes === null) return 'Not measurable here'
  const files = metrics.value.files
  return `${files} ${files === 1 ? 'file' : 'files'}, from ${metrics.value.sizeSource}`
})

const measure = async () => {
  if (!font.value) return
  measuring.value = true
  try {
    await whenStylesheetLoaded(font.value.url)
    metrics.value = await measureFont(font.value)
  } finally {
    measuring.value = false
  }
}

onMounted(() => {
  favorites.value = favoritesStorage.get()
  const fontName = decodeURIComponent(route.params.fontName)
  font.value = fontData.find(f => f.name === fontName)

  if (!font.value) {
    router.push('/fonts')
    return
  }

  addToRecentlyViewed(font.value.name)
  loadFont(font.value.name, font.value.url)
  measure()
})

function addToRecentlyViewed(fontName) {
  if (!fontName) return
  // Read the stored list so other tabs' changes aren't lost; newest first, at most 20
  const current = (recentlyViewedStorage.get() || []).filter(name => name !== fontName)
  current.unshift(fontName)
  recentlyViewedStorage.set(current.slice(0, 20))
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

function toggleFavorite(font) {
  const index = favorites.value.indexOf(font.name)
  if (index === -1) {
    favorites.value.push(font.name)
  } else {
    favorites.value.splice(index, 1)
  }
  favoritesStorage.set(favorites.value)
}

function isFavorite(font) {
  return favorites.value.includes(font.name)
}

async function copyFont(font) {
  try {
    await navigator.clipboard.writeText(font.url)
    showNotice('Font URL copied to the clipboard.', 'success')
  } catch {
    showNotice('Could not copy to the clipboard.', 'error')
  }
}
</script>
