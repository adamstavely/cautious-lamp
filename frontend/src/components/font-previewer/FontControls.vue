<template>
  <div class="grid gap-4 lg:grid-cols-content-aside">
    <UiPanel title="Find fonts" heading-tag="h3">
      <div class="flex flex-col gap-4">
        <UiInput v-model="search" type="search" label="Search" icon="search" placeholder="Font name" />
        <div class="grid gap-4 sm:grid-cols-3">
          <UiSelect v-model="selectedTag" label="Category" :options="options.categories" />
          <UiSelect v-model="selectedScript" label="Script" :options="options.scripts" />
          <UiSelect v-model="selectedWeight" label="Available weight" :options="options.weights" />
        </div>
      </div>
    </UiPanel>

    <UiPanel title="Sample text" heading-tag="h3">
      <div class="flex flex-col gap-4">
        <UiSelect :model-value="sampleType" label="Preset" :options="sampleTextOptions" @update:model-value="selectSampleText" />
        <UiTextarea v-model="sampleText" label="Text" hide-label rows="3" placeholder="Type something to preview" />
      </div>
    </UiPanel>

    <UiPanel title="Typography" heading-tag="h3" class="lg:col-span-2">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <UiRange v-model="fontSize" label="Size" :min="12" :max="72" unit="px" />
        <UiSelect v-model="fontWeight" label="Weight" :options="fontWeightOptions" />
        <UiRange v-model="lineHeight" label="Line height" :min="1" :max="2" :step="0.1" />
        <UiRange v-model="letterSpacing" label="Letter spacing" :min="-2" :max="5" :step="0.1" unit="px" />
        <UiInput v-model="textColor" type="color" label="Text colour" />
        <UiInput v-model="bgColor" type="color" label="Background colour" />
        <div class="flex items-end sm:col-span-2">
          <UiSwitch :model-value="previewDarkMode" label="Dark preview" hint="Light text on a dark background." @update:model-value="$emit('toggleDarkMode')" />
        </div>
      </div>
    </UiPanel>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { UiInput, UiPanel, UiRange, UiSelect, UiSwitch, UiTextarea } from '../ui'
import { WEIGHT_NAMES } from '../../utils/fontLibrary.js'

/**
 * The previewer's controls: find families (search and filters drawn from the
 * library) and set the sample text, size, weight, spacing and colours every
 * card shows.
 */
defineProps({
  /** { categories, scripts, weights } select options from filterOptions() */
  options: { type: Object, required: true },
  previewDarkMode: { type: Boolean, default: false },
})
defineEmits(['toggleDarkMode'])

const search = defineModel('search', { type: String, default: '' })
const selectedTag = defineModel('selectedTag', { type: String, default: '' })
const selectedScript = defineModel('selectedScript', { type: String, default: '' })
const selectedWeight = defineModel('selectedWeight', { type: String, default: '' })
const sampleText = defineModel('sampleText', { type: String, default: '' })
const fontSize = defineModel('fontSize', { type: Number, default: 24 })
const fontWeight = defineModel('fontWeight', { type: Number, default: 400 })
const lineHeight = defineModel('lineHeight', { type: Number, default: 1.4 })
const letterSpacing = defineModel('letterSpacing', { type: Number, default: 0 })
const textColor = defineModel('textColor', { type: String, default: '#000000' })
const bgColor = defineModel('bgColor', { type: String, default: '#FFFFFF' })

const fontWeightOptions = Object.entries(WEIGHT_NAMES).map(([value, name]) => ({ value: Number(value), label: `${name} (${value})` }))

const sampleTexts = {
  pangram: 'The quick brown fox jumps over the lazy dog.',
  headings: 'Heading 1\nHeading 2\nHeading 3\nHeading 4\nHeading 5\nHeading 6',
  paragraph: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  numbers: '0123456789',
  special: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  lorem: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
}

const sampleTextOptions = [
  { value: '', label: 'Custom' },
  { value: 'pangram', label: 'Pangram' },
  { value: 'headings', label: 'Headings' },
  { value: 'paragraph', label: 'Paragraph' },
  { value: 'numbers', label: 'Numbers' },
  { value: 'special', label: 'Special characters' },
  { value: 'lorem', label: 'Lorem ipsum' },
]

// The preset the current text matches, or Custom
const sampleType = computed(() => Object.keys(sampleTexts).find((key) => sampleTexts[key] === sampleText.value) ?? '')

function selectSampleText(type) {
  // Custom keeps the text so it can be edited
  if (sampleTexts[type]) sampleText.value = sampleTexts[type]
}
</script>
