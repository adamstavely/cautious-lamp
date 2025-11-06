<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
    <!-- Hero Section -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
      <div class="text-center">
        <h1 class="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Design System
          <span class="block text-indigo-600 mt-2">Super App</span>
        </h1>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
          Build, manage, and scale your design system with AI-augmented tools for colors, components, tokens, and patterns.
        </p>
        
        <!-- Quick Actions -->
        <div class="flex flex-wrap justify-center gap-4 mb-16">
          <router-link
            to="/palette-builder"
            class="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-lg hover:shadow-xl"
          >
            <span class="material-symbols-outlined">palette</span>
            <span>Build Color Palette</span>
          </router-link>
          <router-link
            to="/tools/gradient-generator"
            class="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-medium border-2 border-indigo-600 shadow-lg hover:shadow-xl"
          >
            <span class="material-symbols-outlined">gradient</span>
            <span>Create Gradients</span>
          </router-link>
        </div>
      </div>

      <!-- Feature Cards -->
      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
        <!-- Tokens -->
        <router-link
          to="/tokens"
          class="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-indigo-500"
        >
          <div class="p-6">
            <div class="flex items-center justify-center w-14 h-14 bg-indigo-100 rounded-lg mb-4 group-hover:bg-indigo-500 transition-colors">
              <span class="material-symbols-outlined text-3xl text-indigo-600 group-hover:text-white transition-colors">
                style
              </span>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">Design Tokens</h3>
            <p class="text-sm text-gray-600">
              Manage colors, spacing, typography, and more
            </p>
          </div>
        </router-link>

        <!-- Components -->
        <router-link
          to="/components"
          class="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-indigo-500"
        >
          <div class="p-6">
            <div class="flex items-center justify-center w-14 h-14 bg-indigo-100 rounded-lg mb-4 group-hover:bg-indigo-500 transition-colors">
              <span class="material-symbols-outlined text-3xl text-indigo-600 group-hover:text-white transition-colors">
                widgets
              </span>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">Components</h3>
            <p class="text-sm text-gray-600">
              Browse and manage your component library
            </p>
          </div>
        </router-link>

        <!-- Patterns -->
        <router-link
          to="/patterns"
          class="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-indigo-500"
        >
          <div class="p-6">
            <div class="flex items-center justify-center w-14 h-14 bg-indigo-100 rounded-lg mb-4 group-hover:bg-indigo-500 transition-colors">
              <span class="material-symbols-outlined text-3xl text-indigo-600 group-hover:text-white transition-colors">
                pattern
              </span>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">Patterns</h3>
            <p class="text-sm text-gray-600">
              Explore design patterns and UI patterns
            </p>
          </div>
        </router-link>

        <!-- Fonts -->
        <router-link
          to="/fonts"
          class="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-indigo-500"
        >
          <div class="p-6">
            <div class="flex items-center justify-center w-14 h-14 bg-indigo-100 rounded-lg mb-4 group-hover:bg-indigo-500 transition-colors">
              <span class="material-symbols-outlined text-3xl text-indigo-600 group-hover:text-white transition-colors">
                text_fields
              </span>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">Typography</h3>
            <p class="text-sm text-gray-600">
              Manage fonts and typography scales
            </p>
          </div>
        </router-link>
      </div>

      <!-- Stats Section -->
      <div class="mt-20 grid md:grid-cols-3 gap-8">
        <div class="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/80">
          <div class="text-3xl font-bold text-indigo-600 mb-2">AI-Augmented</div>
          <p class="text-gray-600">Smart suggestions and automated workflows</p>
        </div>
        <div class="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/80">
          <div class="text-3xl font-bold text-indigo-600 mb-2">All-in-One</div>
          <p class="text-gray-600">Complete design system management platform</p>
        </div>
        <div class="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/80">
          <div class="text-3xl font-bold text-indigo-600 mb-2">Scalable</div>
          <p class="text-gray-600">Grow your design system with confidence</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>
