<template>
  <UiChip :tone="status === 'active' ? 'success' : 'neutral'" :icon="status === 'active' ? 'check_circle' : 'block'">
    {{ status === 'active' ? 'Active' : 'Disabled' }}
  </UiChip>
</template>

<script setup>
import UiChip from '../ui/UiChip.vue';

/** A user's status ('active' | 'disabled') as a chip with text and an icon, not colour alone. */
defineProps({
  status: { type: String, required: true },
});
</script>
