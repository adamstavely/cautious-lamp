<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative flex">
    <!-- Main Content Area -->
    <div 
      class="flex-1 h-full transition-all duration-300 relative overflow-hidden"
      :style="'margin-left: 48px;'"
    >
      <div class="h-full p-8 overflow-hidden">
        <!-- Hero Section -->
        <div class="max-w-7xl mx-auto mb-16">
          <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
            <!-- Background texture/grain effect -->
            <div class="absolute inset-0 opacity-10 texture-pattern"></div>
            
            <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div class="flex-1">
                <div class="mb-4">
                  <router-link 
                    to="/" 
                    class="inline-flex items-center text-white/80 hover:text-white transition-colors text-sm mb-4"
                  >
                    <span class="material-symbols-outlined mr-2 text-lg">arrow_back</span>
                    Back to Home
                  </router-link>
                </div>
                <h1 class="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                  Tools for Developers
                  <span class="block text-indigo-400 mt-2 text-3xl md:text-4xl">Component library, APIs, and developer tools</span>
                </h1>
                <p class="text-base md:text-lg text-white/90 leading-relaxed max-w-2xl">
                  Build faster with our component library, APIs, and developer tools. Code snippets, testing frameworks, and seamless integrations.
                </p>
              </div>
              <div class="hidden md:block flex-shrink-0">
                <div class="w-64 h-64 relative">
                  <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400">
                    <defs>
                      <linearGradient id="developerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <!-- Code-focused illustration -->
                    <rect x="40" y="40" width="120" height="120" rx="8" fill="url(#developerGradient)" opacity="0.3"/>
                    <rect x="60" y="60" width="80" height="80" rx="4" fill="url(#developerGradient)" opacity="0.4"/>
                    <line x1="80" y1="90" x2="120" y2="90" stroke="url(#developerGradient)" stroke-width="4" opacity="0.6"/>
                    <line x1="80" y1="110" x2="140" y2="110" stroke="url(#developerGradient)" stroke-width="4" opacity="0.6"/>
                    <line x1="80" y1="130" x2="100" y2="130" stroke="url(#developerGradient)" stroke-width="4" opacity="0.6"/>
                    <circle cx="70" cy="90" r="3" fill="white" opacity="0.8"/>
                    <circle cx="70" cy="110" r="3" fill="white" opacity="0.8"/>
                    <circle cx="70" cy="130" r="3" fill="white" opacity="0.8"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Access Tools Grid -->
        <div class="max-w-7xl mx-auto mb-16">
          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8">
            Component Development
          </h2>
          
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
            <!-- Component Library -->
            <router-link 
              to="/components" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">widgets</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Component Library
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Browse and use reusable UI components with full documentation.
              </p>
            </router-link>

            <!-- Component Playground -->
            <router-link 
              to="/components" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">play_arrow</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Component Playground
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Live code editor with Vue/React export and real-time preview.
              </p>
            </router-link>

            <!-- Component Testing -->
            <router-link 
              to="/components/testing" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">science</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Testing Framework
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Automated test generation and execution for components.
              </p>
            </router-link>

            <!-- Component Scaffolding -->
            <router-link 
              to="/components/scaffold" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">auto_awesome</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Scaffolding Wizard
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Interactive wizard to scaffold new components with templates.
              </p>
            </router-link>
          </div>

          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8 mt-16">
            APIs & Integration
          </h2>
          
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
            <!-- Design System API -->
            <router-link 
              to="/api" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">api</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Design System API
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Access tokens and components via REST and GraphQL APIs.
              </p>
            </router-link>

            <!-- REST API -->
            <router-link 
              to="/api" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">http</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                REST API
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                RESTful API documentation and interactive explorer.
              </p>
            </router-link>

            <!-- GraphQL API -->
            <router-link 
              to="/api" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">schema</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                GraphQL API
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                GraphQL endpoint with interactive query builder.
              </p>
            </router-link>

            <!-- JavaScript SDK -->
            <router-link 
              to="/api" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">javascript</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                JavaScript SDK
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                TypeScript SDK for easy integration in your projects.
              </p>
            </router-link>
          </div>

          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8 mt-16">
            Developer Tools
          </h2>
          
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
            <!-- CLI Tool -->
            <a 
              href="https://github.com/your-org/design-system-cli" 
              target="_blank"
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">terminal</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                CLI Tool
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Command-line tools for scaffolding, validation, and migration.
              </p>
            </a>

            <!-- Code Snippets -->
            <router-link 
              to="/components" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">code_blocks</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Code Snippets
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Pre-built code snippets for common use cases.
              </p>
            </router-link>

            <!-- Migration Assistant -->
            <router-link 
              to="/tokens/migration" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">swap_horiz</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Migration Assistant
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Component and token migration tools with guides.
              </p>
            </router-link>

            <!-- Loupe Tool -->
            <router-link 
              to="/components/loupe" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">search</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Loupe Tool
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Component inspector for design system components.
              </p>
            </router-link>
          </div>

          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8 mt-16">
            Documentation
          </h2>
          
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
            <!-- Component Documentation -->
            <router-link 
              to="/components/documentation" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">menu_book</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Component Docs
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Comprehensive component documentation with examples.
              </p>
            </router-link>

            <!-- API Reference -->
            <router-link 
              to="/api" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">description</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                API Reference
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Complete API reference with endpoints and examples.
              </p>
            </router-link>

            <!-- Integration Guides -->
            <router-link 
              to="/guidelines" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">integration_instructions</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Integration Guides
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Step-by-step guides for integrating the design system.
              </p>
            </router-link>
          </div>
        </div>

        <!-- Featured Workflows Section -->
        <div class="max-w-7xl mx-auto mb-16">
          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8">
            Featured Workflows
          </h2>
          
          <div class="grid md:grid-cols-3 gap-6">
            <!-- Get Started with Components -->
            <router-link 
              to="/components" 
              class="group rounded-2xl p-8 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-16 h-16 mb-6 rounded-xl flex items-center justify-center" :class="isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'">
                <span class="material-symbols-outlined text-4xl">widgets</span>
              </div>
              <h3 
                class="font-bold text-2xl transition-colors mb-3"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Get Started with Components
              </h3>
              <p class="text-base" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Browse the component library, view examples, and copy code snippets to get started quickly.
              </p>
            </router-link>

            <!-- Integrate via API -->
            <router-link 
              to="/api" 
              class="group rounded-2xl p-8 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-16 h-16 mb-6 rounded-xl flex items-center justify-center" :class="isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'">
                <span class="material-symbols-outlined text-4xl">api</span>
              </div>
              <h3 
                class="font-bold text-2xl transition-colors mb-3"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Integrate via API
              </h3>
              <p class="text-base" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Access design tokens and components programmatically using our REST or GraphQL APIs.
              </p>
            </router-link>

            <!-- Run Tests -->
            <router-link 
              to="/components/testing" 
              class="group rounded-2xl p-8 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-16 h-16 mb-6 rounded-xl flex items-center justify-center" :class="isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'">
                <span class="material-symbols-outlined text-4xl">science</span>
              </div>
              <h3 
                class="font-bold text-2xl transition-colors mb-3"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Run Tests
              </h3>
              <p class="text-base" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Generate and run automated tests for components with visual regression and accessibility testing.
              </p>
            </router-link>
          </div>
        </div>

        <!-- Getting Started Section -->
        <div class="max-w-7xl mx-auto">
          <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-600 border" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
            <h2 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Getting Started
            </h2>
            <p class="text-lg text-gray-700 dark:text-gray-300 mb-8 max-w-3xl">
              New to the design system? Start here with our developer-focused guides, code examples, and quick start tutorials.
            </p>
            <div class="grid md:grid-cols-2 gap-6">
              <router-link 
                to="/components" 
                class="group rounded-xl p-6 border transition-all"
                :class="isDarkMode 
                  ? 'border-gray-600 bg-slate-800 hover:border-indigo-400' 
                  : 'border-gray-300 bg-white hover:border-indigo-500'"
              >
                <h3 
                  class="font-semibold text-xl transition-colors mb-2"
                  :class="isDarkMode 
                    ? 'text-white group-hover:text-indigo-400' 
                    : 'text-gray-900 group-hover:text-indigo-600'"
                >
                  Component Quick Start
                </h3>
                <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  Learn how to use components in your project with code examples.
                </p>
              </router-link>
              <router-link 
                to="/api" 
                class="group rounded-xl p-6 border transition-all"
                :class="isDarkMode 
                  ? 'border-gray-600 bg-slate-800 hover:border-indigo-400' 
                  : 'border-gray-300 bg-white hover:border-indigo-500'"
              >
                <h3 
                  class="font-semibold text-xl transition-colors mb-2"
                  :class="isDarkMode 
                    ? 'text-white group-hover:text-indigo-400' 
                    : 'text-gray-900 group-hover:text-indigo-600'"
                >
                  API Integration Guide
                </h3>
                <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  Step-by-step guide to integrating the design system API.
                </p>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));

let darkModeObserver = null;
let darkModeInterval = null;

onMounted(() => {
  darkModeObserver = new MutationObserver(() => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  });
  
  darkModeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });
  
  const checkDarkMode = () => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  };
  
  checkDarkMode();
  darkModeInterval = setInterval(checkDarkMode, 100);
});

onBeforeUnmount(() => {
  if (darkModeObserver) {
    darkModeObserver.disconnect();
  }
  if (darkModeInterval) {
    clearInterval(darkModeInterval);
  }
});
</script>

<style scoped>
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>

