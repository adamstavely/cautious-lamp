<template>
  <router-link :to="to" class="ui-link-row group">
    <SpotArt v-if="spot" :name="spot" size="sm" />
    <div class="min-w-0">
      <h3 class="ui-link-row-title">{{ title }}</h3>
      <p v-if="body" class="ui-link-row-body">{{ body }}</p>
    </div>
  </router-link>
</template>

<script setup>
import SpotArt from './SpotArt.vue';

/** A compact link: small illustration, title and one line. For shortlists ("Popular tools"); use UiCard for full grids. */
defineProps({
  to: { type: [String, Object], required: true },
  title: { type: String, required: true },
  body: { type: String, default: '' },
  spot: { type: String, default: '' },
});
</script>

<style scoped>
.ui-link-row {
  @apply flex items-center gap-4 -mx-2 p-2 rounded-tile transition-colors hover:bg-fill-hover;
  @apply focus-visible:outline focus-visible:outline-2 outline-focus;
}
.ui-link-row-title {
  @apply font-medium text-ink transition-colors group-hover:text-accent-text;
}
.ui-link-row-body {
  @apply text-sm text-ink-muted;
}
</style>
