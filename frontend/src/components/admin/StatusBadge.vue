<template>
  <span
    class="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium"
    :class="status === 'active'
      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
      : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'"
  >
    <span class="material-symbols-outlined text-sm" aria-hidden="true">{{ status === 'active' ? 'check_circle' : 'block' }}</span>
    {{ status === 'active' ? 'Active' : 'Disabled' }}
  </span>
</template>

<script setup>
/** A user's status ('active' | 'disabled') as a badge with text, not colour alone. */
defineProps({
  status: { type: String, required: true },
});
</script>
