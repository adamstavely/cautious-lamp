<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:bg-slate-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">Fonts</h1>
      <p class="text-gray-600 mb-8">Manage your design system typography and font families.</p>
    </div>
    <FontPreviewer />
  </div>
</template>

<script setup>
import FontPreviewer from '../components/font-previewer/FontPreviewer.vue'
</script>

