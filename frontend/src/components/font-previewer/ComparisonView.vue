<template>
  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    <UiPanel v-for="font in comparisonFonts" :key="font.name" :title="font.name" :description="font.tags?.join(', ')" heading-tag="h3">
      <template #actions>
        <UiButton icon="x" icon-only size="sm" variant="ghost" :label="`Remove ${font.name} from the comparison`" @click="toggleCompare(font)" />
      </template>
      <div class="flex flex-col gap-3">
        <FontSample :family="font.name" :size="18" :line-height="1.6" class="text-ink">{{ sampleText }}</FontSample>
        <FontSample :family="font.name" :size="24" :weight="700" :line-height="1.25" class="text-ink-strong">Heading text</FontSample>
        <FontSample :family="font.name" :size="14" :weight="600" class="text-ink-secondary">Button and label text, 0123456789</FontSample>
      </div>
    </UiPanel>
  </div>
</template>

<script setup>
import { UiButton, UiPanel } from '../ui'
import FontSample from './FontSample.vue'

/** The families picked for comparison, side by side at body, heading and UI sizes */
defineProps({
  comparisonFonts: { type: Array, required: true },
  sampleText: { type: String, default: '' },
  toggleCompare: { type: Function, required: true },
})
</script>
