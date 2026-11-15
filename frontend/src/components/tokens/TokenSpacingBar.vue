<template>
  <span class="token-spacing-bar" aria-hidden="true"></span>
</template>

<script setup>
/** A bar as wide as a spacing token's value (any CSS length), through v-bind() */
defineProps({
  size: { type: String, required: true },
});
</script>

<style scoped>
.token-spacing-bar {
  @apply block h-6 max-w-full rounded-control bg-accent;
  width: v-bind(size);
}
</style>
