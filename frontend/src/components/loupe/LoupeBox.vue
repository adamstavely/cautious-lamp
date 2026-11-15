<template>
  <div class="loupe-box" :class="{ 'loupe-box-sized': width }"><slot /></div>
</template>

<script setup>
/**
 * A box the Loupe places over the page: a highlight on a measured element, a
 * marker on the ruler, the info panel by the pointer. Positions are measured
 * at runtime, so they reach CSS through v-bind(); classes and listeners fall
 * through to the box.
 */
defineProps({
  left: { type: String, default: 'auto' },
  top: { type: String, default: 'auto' },
  /** Only set for boxes that cover an element; others keep their own size */
  width: { type: String, default: null },
  height: { type: String, default: null },
});
</script>

<style scoped>
.loupe-box {
  left: v-bind(left);
  top: v-bind(top);
}
.loupe-box-sized {
  width: v-bind(width);
  height: v-bind(height);
}
</style>
