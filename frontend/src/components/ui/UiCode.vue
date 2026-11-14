<template>
  <code class="ui-code"><slot /></code>
</template>

<script setup>
/** Inline code: a token name, a value, a short snippet in running text */
</script>

<style scoped>
.ui-code {
  @apply inline-block px-1.5 py-0.5 rounded-control bg-fill font-code text-xs text-ink;
}
</style>
