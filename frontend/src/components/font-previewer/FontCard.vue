<template>
  <article class="flex h-full flex-col gap-3 rounded-card border bg-surface-raised p-4" :class="selected ? 'border-accent-highlight' : 'border-line'">
    <header class="flex items-start justify-between gap-2">
      <div class="min-w-0">
        <h3 class="text-base font-semibold text-ink-strong">
          <RouterLink :to="detailLink" class="hover:text-accent-text focus-visible:outline focus-visible:outline-2 outline-focus rounded-control" @click="$emit('addToRecentlyViewed', font.name)">{{ font.name }}</RouterLink>
        </h3>
        <p class="text-xs text-ink-muted">
          {{ styleCount }} {{ styleCount === 1 ? 'style' : 'styles' }}<span v-if="font.tags?.length"> · {{ font.tags.join(', ') }}</span>
        </p>
      </div>
      <UiButton
        icon="heart"
        icon-only
        size="sm"
        :variant="selected ? 'primary' : 'ghost'"
        :label="selected ? `Remove ${font.name} from favourites` : `Add ${font.name} to favourites`"
        :aria-pressed="selected"
        @click="toggleFavorite(font)"
      />
    </header>

    <FontSample
      :family="font.name"
      :size="fontSize"
      :weight="fontWeight"
      :line-height="lineHeight"
      :letter-spacing="letterSpacing"
      :color="textColor"
      :background="bgColor"
      class="flex-1"
    >{{ sampleText }}</FontSample>

    <p class="text-xs text-ink-muted">Scripts: {{ font.supports?.join(', ') || 'latin' }}</p>

    <p v-if="pairs.length" class="text-xs text-ink-muted">
      Pairs with
      <template v-for="(pair, index) in pairs" :key="pair.name">
        <UiLink v-if="pair.inLibrary" :to="`/font/${encodeURIComponent(pair.name)}`" class="text-xs">{{ pair.name }}</UiLink>
        <span v-else>{{ pair.name }}</span><span v-if="index < pairs.length - 1">, </span>
      </template>
    </p>

    <footer class="mt-auto flex flex-wrap items-center justify-end gap-1 border-t border-line pt-3">
      <UiButton icon="eye" icon-only size="sm" variant="ghost" :label="`Preview every weight of ${font.name}`" @click="$emit('togglePreview', font)" />
      <UiButton icon="copy" icon-only size="sm" variant="ghost" :label="`Copy the ${font.name} stylesheet URL`" @click="copyFont(font)" />
      <UiButton icon="external-link" icon-only size="sm" variant="ghost" :label="`${font.name} on Google Fonts (opens in a new tab)`" :href="specimenUrl(font)" target="_blank" rel="noopener noreferrer" />
      <UiButton
        :icon="isInComparison ? 'circle-minus' : 'git-compare'"
        icon-only
        size="sm"
        :variant="isInComparison ? 'secondary' : 'ghost'"
        :label="isInComparison ? `Remove ${font.name} from the comparison` : `Add ${font.name} to the comparison`"
        :aria-pressed="isInComparison"
        :disabled="!isInComparison && compareFull"
        @click="toggleCompare(font)"
      />
    </footer>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { UiButton, UiLink } from '../ui'
import FontSample from './FontSample.vue'
import { specimenUrl } from '../../utils/fontLibrary.js'

const props = defineProps({
  font: { type: Object, required: true },
  fontSize: { type: Number, default: 24 },
  fontWeight: { type: Number, default: 400 },
  lineHeight: { type: Number, default: 1.4 },
  letterSpacing: { type: Number, default: 0 },
  textColor: { type: String, default: '' },
  bgColor: { type: String, default: '' },
  sampleText: { type: String, default: '' },
  selected: { type: Boolean, default: false },
  isInComparison: { type: Boolean, default: false },
  /** The comparison holds at most three families */
  compareFull: { type: Boolean, default: false },
  /** Family names in the library, to link pairings that have a page */
  libraryNames: { type: Array, default: () => [] },
  copyFont: { type: Function, required: true },
  toggleFavorite: { type: Function, required: true },
  toggleCompare: { type: Function, required: true },
})

defineEmits(['togglePreview', 'addToRecentlyViewed'])

const detailLink = computed(() => `/font/${encodeURIComponent(props.font.name)}`)
const styleCount = computed(() => props.font.weights?.length || 1)
const pairs = computed(() =>
  (props.font.pairsWellWith ?? []).slice(0, 2).map((name) => ({ name, inLibrary: props.libraryNames.includes(name) })),
)
</script>
