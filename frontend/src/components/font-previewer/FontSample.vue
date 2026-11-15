<template>
  <div class="font-sample rounded-control border border-line p-4 break-words whitespace-pre-line"><slot /></div>
</template>

<script setup>
import { computed } from 'vue'

/**
 * Sample text in a font from the library with the previewer's settings: the
 * family, size, weight, line height and letter spacing, in the text and
 * background colours the user picked. Those are the user's data, so they reach
 * CSS through v-bind(), never style=. Unset values inherit.
 */
const props = defineProps({
  /** Family name from the library, e.g. "Inter" */
  family: { type: String, default: '' },
  /** Pixels */
  size: { type: Number, default: null },
  weight: { type: [Number, String], default: null },
  lineHeight: { type: Number, default: null },
  /** Pixels */
  letterSpacing: { type: Number, default: null },
  color: { type: String, default: '' },
  background: { type: String, default: '' },
})

const fontFamily = computed(() => (props.family ? `'${props.family}', sans-serif` : 'inherit'))
const fontSize = computed(() => (props.size === null ? 'inherit' : `${props.size}px`))
const fontWeight = computed(() => (props.weight === null ? 'inherit' : String(props.weight)))
const lineHeightValue = computed(() => (props.lineHeight === null ? 'inherit' : String(props.lineHeight)))
const tracking = computed(() => (props.letterSpacing === null ? 'normal' : `${props.letterSpacing}px`))
const ink = computed(() => props.color || 'inherit')
const fill = computed(() => props.background || 'transparent')
</script>

<style scoped>
.font-sample {
  font-family: v-bind(fontFamily);
  font-size: v-bind(fontSize);
  font-weight: v-bind(fontWeight);
  line-height: v-bind(lineHeightValue);
  letter-spacing: v-bind(tracking);
  color: v-bind(ink);
  background: v-bind(fill);
}
</style>
