<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
    <div class="max-w-4xl w-full">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-5xl font-bold text-gray-900 mb-4">Color Tools</h1>
        <p class="text-xl text-gray-600">Create beautiful color palettes and gradients</p>
      </div>

      <!-- Tool Cards -->
      <div class="grid md:grid-cols-2 gap-6">
        <!-- Palette Builder Card -->
        <router-link
          to="/palette-builder"
          class="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-blue-500"
        >
          <div class="p-8">
            <div class="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-lg mb-6 group-hover:bg-blue-500 transition-colors">
              <span class="material-symbols-outlined text-4xl text-blue-600 group-hover:text-white transition-colors">
                palette
              </span>
            </div>
            <h2 class="text-2xl font-bold text-gray-900 mb-3">Palette Builder</h2>
            <p class="text-gray-600 mb-6">
              Build and analyze color palettes with harmony checks, contrast testing, and accessibility validation.
            </p>
            <div class="flex items-center text-blue-600 font-semibold group-hover:text-blue-700">
              <span>Get Started</span>
              <span class="material-symbols-outlined ml-2 group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </div>
          </div>
        </router-link>

        <!-- Gradient Generator Card -->
        <router-link
          to="/gradient-generator"
          class="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-purple-500"
        >
          <div class="p-8">
            <div class="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-lg mb-6 group-hover:bg-purple-500 transition-colors">
              <span class="material-symbols-outlined text-4xl text-purple-600 group-hover:text-white transition-colors">
                gradient
              </span>
            </div>
            <h2 class="text-2xl font-bold text-gray-900 mb-3">Gradient Generator</h2>
            <p class="text-gray-600 mb-6">
              Create beautiful color gradients with custom stops, angles, and color interpolation.
            </p>
            <div class="flex items-center text-purple-600 font-semibold group-hover:text-purple-700">
              <span>Get Started</span>
              <span class="material-symbols-outlined ml-2 group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

