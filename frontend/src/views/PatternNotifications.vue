<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative flex">
    <!-- Drawer -->
    <DocumentationDrawer :isOpen="drawerOpen" @close="closeDrawer" @toggle="toggleDrawer" />
    
    <!-- Main Content Area -->
    <div 
      class="flex-1 h-full transition-all duration-300 relative overflow-hidden"
      :style="drawerOpen ? 'margin-left: 256px;' : 'margin-left: 48px;'"
    >
      <!-- Breadcrumbs -->
      <Breadcrumbs />
      
      <div class="h-full overflow-y-auto">
        <div class="p-8">
          <!-- Hero Section -->
          <div class="max-w-7xl mx-auto mb-16">
            <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
              <!-- Background texture/grain effect -->
              <div class="absolute inset-0 opacity-10 texture-pattern"></div>
              
              <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                <div class="flex-1">
                  <div class="flex items-center gap-4 mb-4">
                    <h1 class="text-5xl md:text-6xl font-bold text-white leading-tight">
                      Notification Patterns
                    </h1>
                    <span class="px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-300 border border-green-400/30">
                      Production Ready
                    </span>
                  </div>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-4">
                    Choose the right notification component for your use case. Follow the decision tree to determine when to use modals, banners, toasts, or dialogs.
                  </p>
                  <div class="flex items-center gap-4 text-sm text-white/70">
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">label</span>
                      Pattern Library
                    </span>
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">update</span>
                      Updated Jan 15, 2024
                    </span>
                  </div>
                </div>
                <div class="hidden md:block flex-shrink-0">
                  <div class="w-64 h-64 relative">
                    <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400">
                      <defs>
                        <linearGradient id="notifGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Stylized notification icon -->
                      <circle cx="100" cy="80" r="30" fill="url(#notifGradient)" opacity="0.6"/>
                      <path d="M 85 80 L 100 65 L 115 80 L 100 95 Z" fill="white" opacity="0.8"/>
                      <rect x="70" y="120" width="60" height="8" rx="4" fill="url(#notifGradient)" opacity="0.5"/>
                      <rect x="75" y="135" width="50" height="8" rx="4" fill="url(#notifGradient)" opacity="0.4"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Overview Section -->
          <div class="max-w-7xl mx-auto mb-16">
            <div class="mb-8">
              <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Overview</h2>
              <p class="text-gray-600 dark:text-gray-400">Notifications help users understand system status, errors, and important information. Choose the right component based on urgency and required action.</p>
            </div>
            
            <div class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
              <div class="flex items-start gap-6">
                <div class="flex-shrink-0 w-16 h-16">
                  <svg viewBox="0 0 64 64" class="w-full h-full">
                    <defs>
                      <linearGradient id="notifOverviewGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <circle cx="32" cy="20" r="12" fill="url(#notifOverviewGradient)" opacity="0.6"/>
                    <path d="M 24 20 L 32 12 L 40 20 L 32 28 Z" fill="white" opacity="0.8"/>
                    <rect x="16" y="36" width="32" height="4" rx="2" fill="url(#notifOverviewGradient)" opacity="0.5"/>
                    <rect x="18" y="44" width="28" height="4" rx="2" fill="url(#notifOverviewGradient)" opacity="0.4"/>
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
                    Effective notification patterns are crucial for user experience. They provide feedback, alert users to important information, and guide actions. This guide helps you choose the right notification component based on your specific use case, urgency, and required user interaction.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Decision Tree Section -->
          <div class="max-w-7xl mx-auto mb-16">
            <div class="mb-8">
              <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">UI Notifications Decision Tree</h2>
              <p class="text-gray-600 dark:text-gray-400">Follow this decision tree to determine which notification component to use.</p>
            </div>
            
            <div class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 md:p-8 overflow-x-hidden">
              <!-- Decision Tree Visualization -->
              <div class="decision-tree-wrapper max-w-5xl mx-auto">
                <!-- Starting Point -->
                <div class="flex justify-center mb-6">
                  <div class="decision-box start-box max-w-xs w-full mx-auto">
                    <p class="text-center font-semibold text-white text-sm md:text-base">What Notification Should I Use?</p>
                  </div>
                </div>

                <!-- Level 1: Is action required? -->
                <div class="flex justify-center mb-6">
                  <div class="decision-box max-w-xs w-full mx-auto bg-white dark:bg-slate-800 border-2 border-indigo-600 dark:border-indigo-400 text-gray-900 dark:text-white">
                    <p class="text-center font-semibold text-sm md:text-base text-gray-900 dark:text-white">Is action required?</p>
                  </div>
                </div>

                <!-- Level 2: Yes/No branches -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-8">
                  <!-- Left Branch: Yes -->
                  <div class="flex flex-col items-center space-y-4">
                    <div class="answer-oval bg-blue-100 dark:bg-blue-900/50 border-2 border-blue-600 dark:border-blue-400 text-blue-900 dark:text-blue-200">
                      <p class="text-center font-medium text-sm">Yes</p>
                    </div>
                    <div class="arrow-down bg-gray-400 dark:bg-slate-500"></div>
                    <div class="decision-box max-w-xs w-full mx-auto bg-white dark:bg-slate-800 border-2 border-indigo-600 dark:border-indigo-400 text-gray-900 dark:text-white">
                      <p class="text-center font-semibold text-sm text-gray-900 dark:text-white">Is immediate attention required?</p>
                    </div>
                    
                    <!-- Level 3: Immediate attention branches -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 w-full">
                      <!-- Yes: Use Modal -->
                      <div class="flex flex-col items-center space-y-3">
                        <div class="answer-oval bg-blue-100 dark:bg-blue-900/50 border-2 border-blue-600 dark:border-blue-400 text-blue-900 dark:text-blue-200">
                          <p class="text-center font-medium text-xs">Yes</p>
                        </div>
                        <div class="arrow-down bg-gray-400 dark:bg-slate-500"></div>
                        <div class="decision-box w-full max-w-[280px] mx-auto bg-gray-50 dark:bg-slate-900 border-2 border-green-600 dark:border-green-400 text-gray-900 dark:text-white">
                          <p class="text-center font-semibold mb-3 text-sm">Use Modal Component</p>
                          <div class="notification-example bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-gray-600">
                            <div class="flex justify-between items-start mb-3">
                              <h4 class="font-semibold text-sm text-gray-900 dark:text-white">Title</h4>
                              <span class="text-gray-500 dark:text-gray-400 cursor-pointer">×</span>
                            </div>
                            <p class="text-xs text-gray-600 dark:text-gray-300 mb-4">Body Text</p>
                            <div class="flex gap-2 flex-wrap">
                              <button class="px-3 py-1.5 bg-blue-600 text-white rounded text-xs">Primary</button>
                              <button class="px-3 py-1.5 bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded text-xs">Secondary</button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <!-- No: Use Banner -->
                      <div class="flex flex-col items-center space-y-3">
                        <div class="answer-oval bg-yellow-100 dark:bg-yellow-900/50 border-2 border-yellow-600 dark:border-yellow-400 text-yellow-900 dark:text-yellow-200">
                          <p class="text-center font-medium text-xs">No</p>
                        </div>
                        <div class="arrow-down bg-gray-400 dark:bg-slate-500"></div>
                        <div class="decision-box w-full max-w-[280px] mx-auto bg-gray-50 dark:bg-slate-900 border-2 border-green-600 dark:border-green-400 text-gray-900 dark:text-white">
                          <p class="text-center font-semibold mb-3 text-sm">Use Banner</p>
                          <div class="notification-example bg-red-100 dark:bg-red-800 border border-red-300 dark:border-red-600">
                            <div class="flex items-center gap-2 flex-wrap">
                              <span class="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white text-xs flex-shrink-0">!</span>
                              <span class="font-medium text-sm text-red-900 dark:text-red-100">3 Errors</span>
                              <button class="ml-auto px-2 py-1 bg-white/20 dark:bg-white/10 rounded text-xs text-red-900 dark:text-red-100">View All</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Right Branch: No -->
                  <div class="flex flex-col items-center space-y-4">
                    <div class="answer-oval bg-yellow-100 dark:bg-yellow-900/50 border-2 border-yellow-600 dark:border-yellow-400 text-yellow-900 dark:text-yellow-200">
                      <p class="text-center font-medium text-sm">No</p>
                    </div>
                    <div class="arrow-down bg-gray-400 dark:bg-slate-500"></div>
                    <div class="decision-box max-w-xs w-full mx-auto bg-white dark:bg-slate-800 border-2 border-indigo-600 dark:border-indigo-400 text-gray-900 dark:text-white">
                      <p class="text-center font-semibold text-sm text-gray-900 dark:text-white">Does the notification communicate status?</p>
                    </div>
                    
                    <!-- Level 3: Status branches -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 w-full">
                      <!-- Yes: Use Toast -->
                      <div class="flex flex-col items-center space-y-3">
                        <div class="answer-oval bg-blue-100 dark:bg-blue-900/50 border-2 border-blue-600 dark:border-blue-400 text-blue-900 dark:text-blue-200">
                          <p class="text-center font-medium text-xs">Yes</p>
                        </div>
                        <div class="arrow-down bg-gray-400 dark:bg-slate-500"></div>
                        <div class="decision-box w-full max-w-[280px] mx-auto bg-gray-50 dark:bg-slate-900 border-2 border-green-600 dark:border-green-400 text-gray-900 dark:text-white">
                          <p class="text-center font-semibold mb-3 text-sm">Use Toast</p>
                          <div class="notification-example bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-600 border-l-4 border-l-green-500">
                            <div class="flex items-center gap-2">
                              <span class="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white text-xs flex-shrink-0">✓</span>
                              <span class="text-xs text-gray-900 dark:text-white">Success! You've completed the task.</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <!-- No: Continue to next question -->
                      <div class="flex flex-col items-center space-y-3 w-full">
                        <div class="answer-oval bg-yellow-100 dark:bg-yellow-900/50 border-2 border-yellow-600 dark:border-yellow-400 text-yellow-900 dark:text-yellow-200">
                          <p class="text-center font-medium text-xs">No</p>
                        </div>
                        <div class="arrow-down bg-gray-400 dark:bg-slate-500"></div>
                        <div class="decision-box max-w-xs w-full mx-auto bg-white dark:bg-slate-800 border-2 border-indigo-600 dark:border-indigo-400 text-gray-900 dark:text-white">
                          <p class="text-center font-semibold text-sm text-gray-900 dark:text-white">Is the notification an alert?</p>
                        </div>
                        
                        <!-- Level 4: Alert branches -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 w-full">
                          <!-- Yes: Can be dismissed? -->
                          <div class="flex flex-col items-center space-y-4">
                            <div class="answer-oval bg-blue-100 dark:bg-blue-900/50 border-2 border-blue-600 dark:border-blue-400 text-blue-900 dark:text-blue-200">
                              <p class="text-center font-medium text-sm">Yes</p>
                            </div>
                            <div class="arrow-down bg-gray-400 dark:bg-slate-500"></div>
                            <div class="decision-box max-w-[280px] w-full mx-auto bg-white dark:bg-slate-800 border-2 border-indigo-600 dark:border-indigo-400 text-gray-900 dark:text-white">
                              <p class="text-center font-semibold text-sm text-gray-900 dark:text-white">Can the alert be easily dismissed?</p>
                            </div>
                            
                            <!-- Level 5: Dismissible branches -->
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-8 w-full max-w-3xl">
                              <!-- Yes: Use Toast -->
                              <div class="flex flex-col items-center space-y-4">
                                <div class="answer-oval bg-blue-100 dark:bg-blue-900/50 border-2 border-blue-600 dark:border-blue-400 text-blue-900 dark:text-blue-200">
                                  <p class="text-center font-medium text-sm">Yes</p>
                                </div>
                                <div class="arrow-down bg-gray-400 dark:bg-slate-500"></div>
                                <div class="decision-box w-full max-w-[280px] mx-auto bg-gray-50 dark:bg-slate-900 border-2 border-green-600 dark:border-green-400 text-gray-900 dark:text-white">
                                  <p class="text-center font-semibold mb-4 text-sm">Use Toast</p>
                                  <div class="notification-example bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-600 border-l-4 border-l-orange-500">
                                    <div class="flex items-center gap-2 flex-wrap">
                                      <span class="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs flex-shrink-0">!</span>
                                      <span class="text-sm text-gray-900 dark:text-gray-100">There's been an error completing your task.</span>
                                      <span class="ml-auto text-gray-500 dark:text-gray-400 cursor-pointer flex-shrink-0">×</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <!-- No: Use Banner -->
                              <div class="flex flex-col items-center space-y-4">
                                <div class="answer-oval bg-yellow-100 dark:bg-yellow-900/50 border-2 border-yellow-600 dark:border-yellow-400 text-yellow-900 dark:text-yellow-200">
                                  <p class="text-center font-medium text-sm">No</p>
                                </div>
                                <div class="arrow-down bg-gray-400 dark:bg-slate-500"></div>
                                <div class="decision-box w-full max-w-[280px] mx-auto bg-gray-50 dark:bg-slate-900 border-2 border-green-600 dark:border-green-400 text-gray-900 dark:text-white">
                                  <p class="text-center font-semibold mb-4 text-sm">Use Banner</p>
                                  <div class="notification-example bg-yellow-100 dark:bg-orange-800 border border-yellow-300 dark:border-orange-600">
                                    <div class="flex items-center gap-2 flex-wrap">
                                      <span class="w-4 h-4 text-orange-500 dark:text-orange-200 flex-shrink-0">⚠</span>
                                      <span class="font-medium text-sm text-yellow-900 dark:text-orange-100">3 Alerts</span>
                                      <button class="ml-auto px-2 py-1 bg-white/20 dark:bg-white/10 rounded text-xs text-yellow-900 dark:text-orange-100">View All</button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <!-- No: Use Dialog -->
                          <div class="flex flex-col items-center space-y-4">
                            <div class="answer-oval bg-yellow-100 dark:bg-yellow-900/50 border-2 border-yellow-600 dark:border-yellow-400 text-yellow-900 dark:text-yellow-200">
                              <p class="text-center font-medium text-sm">No</p>
                            </div>
                            <div class="arrow-down bg-gray-400 dark:bg-slate-500"></div>
                            <div class="decision-box max-w-[280px] w-full mx-auto bg-gray-50 dark:bg-slate-900 border-2 border-green-600 dark:border-green-400 text-gray-900 dark:text-white">
                              <p class="text-center font-semibold mb-3 text-sm">Use Dialog Component</p>
                              <div class="notification-example bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-gray-600">
                                <div class="flex justify-between items-start mb-3">
                                  <h4 class="font-semibold text-gray-900 dark:text-white text-sm">Title</h4>
                                  <span class="text-gray-500 dark:text-gray-400 cursor-pointer">×</span>
                                </div>
                                <p class="text-xs text-gray-600 dark:text-gray-300 mb-4">Body Text</p>
                                <div class="flex gap-2 flex-wrap">
                                  <button class="px-3 py-1.5 bg-blue-600 text-white rounded text-xs">Primary</button>
                                  <button class="px-3 py-1.5 bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded text-xs">Secondary</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Component Details Section -->
          <div class="max-w-7xl mx-auto mb-16">
            <div class="mb-8">
              <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Component Details</h2>
              <p class="text-gray-600 dark:text-gray-400">Learn more about each notification component and when to use them.</p>
            </div>
            
            <div class="grid md:grid-cols-2 gap-6">
              <!-- Modal -->
              <div class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <div class="flex items-center gap-3 mb-4">
                  <span class="material-symbols-outlined text-2xl text-indigo-600 dark:text-indigo-400">fullscreen</span>
                  <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Modal</h3>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Use modals when immediate attention is required and user action is necessary. Modals block interaction with the rest of the page until resolved.
                </p>
                <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-2">Use when:</h4>
                  <ul class="text-xs space-y-1 text-gray-700 dark:text-gray-300">
                    <li>• Critical actions require confirmation</li>
                    <li>• Immediate user attention is needed</li>
                    <li>• Action is required before continuing</li>
                  </ul>
                </div>
              </div>

              <!-- Banner -->
              <div class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <div class="flex items-center gap-3 mb-4">
                  <span class="material-symbols-outlined text-2xl text-indigo-600 dark:text-indigo-400">campaign</span>
                  <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Banner</h3>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Use banners for persistent notifications that require action but don't need immediate attention. Banners remain visible until dismissed or resolved.
                </p>
                <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-2">Use when:</h4>
                  <ul class="text-xs space-y-1 text-gray-700 dark:text-gray-300">
                    <li>• Action is required but not urgent</li>
                    <li>• Multiple errors or alerts need attention</li>
                    <li>• Notification should persist until resolved</li>
                  </ul>
                </div>
              </div>

              <!-- Toast -->
              <div class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <div class="flex items-center gap-3 mb-4">
                  <span class="material-symbols-outlined text-2xl text-indigo-600 dark:text-indigo-400">notifications</span>
                  <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Toast</h3>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Use toasts for non-blocking status updates and easily dismissible alerts. Toasts appear temporarily and don't require user interaction.
                </p>
                <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-2">Use when:</h4>
                  <ul class="text-xs space-y-1 text-gray-700 dark:text-gray-300">
                    <li>• Communicating status updates</li>
                    <li>• Alert can be easily dismissed</li>
                    <li>• No action is required</li>
                  </ul>
                </div>
              </div>

              <!-- Dialog -->
              <div class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <div class="flex items-center gap-3 mb-4">
                  <span class="material-symbols-outlined text-2xl text-indigo-600 dark:text-indigo-400">chat_bubble</span>
                  <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Dialog</h3>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Use dialogs for informational content or non-critical actions. Dialogs are less intrusive than modals and can be dismissed without action.
                </p>
                <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-2">Use when:</h4>
                  <ul class="text-xs space-y-1 text-gray-700 dark:text-gray-300">
                    <li>• Displaying additional information</li>
                    <li>• Non-critical actions or confirmations</li>
                    <li>• Not an alert and no status to communicate</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Accessibility -->
          <div class="max-w-7xl mx-auto mb-16">
            <div class="border rounded-2xl p-8 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <div class="flex items-start gap-4">
                <span class="material-symbols-outlined text-3xl flex-shrink-0 text-blue-600 dark:text-blue-400">accessibility</span>
                <div>
                  <h3 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Accessibility</h3>
                  <ul class="space-y-2 text-gray-700 dark:text-gray-300">
                    <li class="flex items-start gap-2">
                      <span class="mt-1 text-blue-600 dark:text-blue-400">•</span>
                      <span>Ensure all notifications are announced to screen readers using ARIA live regions</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="mt-1 text-blue-600 dark:text-blue-400">•</span>
                      <span>Provide clear focus management for modals and dialogs</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="mt-1 text-blue-600 dark:text-blue-400">•</span>
                      <span>Use appropriate ARIA roles (alert, dialog, banner) for each notification type</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="mt-1 text-blue-600 dark:text-blue-400">•</span>
                      <span>Ensure sufficient color contrast and don't rely solely on color to convey meaning</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="mt-1 text-blue-600 dark:text-blue-400">•</span>
                      <span>Provide keyboard shortcuts for dismissing notifications</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="mt-1 text-blue-600 dark:text-blue-400">•</span>
                      <span>Use appropriate timeout durations for auto-dismissing notifications</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Related Patterns -->
          <div class="max-w-7xl mx-auto">
            <div class="mb-8">
              <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Related Patterns</h2>
              <p class="text-gray-600 dark:text-gray-400">Other patterns that complement notification design.</p>
            </div>
            
            <div class="grid md:grid-cols-3 gap-6">
              <router-link to="/patterns/feedback" class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all group">
                <div class="flex items-center gap-3 mb-3">
                  <span class="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-2xl">feedback</span>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Feedback Patterns
                  </h3>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Explore other feedback patterns and user communication methods.
                </p>
              </router-link>

              <router-link to="/patterns/forms" class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all group">
                <div class="flex items-center gap-3 mb-3">
                  <span class="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-2xl">description</span>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Form Patterns
                  </h3>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Learn how notifications work with form validation and user input.
                </p>
              </router-link>

              <router-link to="/patterns/navigation" class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all group">
                <div class="flex items-center gap-3 mb-3">
                  <span class="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-2xl">navigation</span>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Navigation Patterns
                  </h3>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  See how notifications integrate with navigation patterns.
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
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import { useDrawer } from '../composables/useDrawer.js';
import Breadcrumbs from '../components/Breadcrumbs.vue';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const { drawerOpen, closeDrawer, toggleDrawer } = useDrawer();





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

.decision-tree-wrapper {
  position: relative;
  width: 100%;
}

.decision-box {
  padding: 12px 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

:global(.dark) .decision-box {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.start-box {
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
  color: white;
}

.answer-oval {
  padding: 8px 20px;
  border-radius: 20px;
  min-width: 60px;
  text-align: center;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: background-color 0.2s, border-color 0.2s, color 0.2s;
}

.arrow-down {
  width: 2px;
  height: 24px;
  margin: 6px 0;
  transition: background-color 0.2s;
  flex-shrink: 0;
}

.arrow-right {
  width: 24px;
  height: 2px;
  margin: 0 6px;
  transition: background-color 0.2s;
  flex-shrink: 0;
}

.notification-example {
  padding: 12px;
  border-radius: 8px;
  margin-top: 8px;
  font-size: 12px;
  transition: background-color 0.2s, border-color 0.2s;
}

@media (max-width: 640px) {
  .decision-box {
    padding: 10px 12px;
  }
  
  .notification-example {
    font-size: 10px;
    padding: 8px;
  }
  
  .answer-oval {
    min-width: 50px;
    padding: 6px 14px;
    font-size: 11px;
  }
  
  .arrow-down {
    height: 20px;
    margin: 4px 0;
  }
}

</style>

<style>
/* Non-scoped styles for dark mode overrides - ensures they work correctly */
.dark .bg-white.rounded-2xl,
.dark .bg-white.dark\:bg-slate-800 {
  background-color: rgb(30 41 59) !important; /* slate-800 */
}

.dark .border-gray-200.rounded-2xl,
.dark .border-gray-200.dark\:border-gray-700 {
  border-color: rgb(51 65 85) !important; /* slate-700 */
}

/* Target router-link elements (Related Patterns cards) */
.dark a.bg-white.rounded-2xl,
.dark router-link.bg-white.rounded-2xl {
  background-color: rgb(30 41 59) !important; /* slate-800 */
}

.dark a.border-gray-200.rounded-2xl,
.dark router-link.border-gray-200.rounded-2xl {
  border-color: rgb(51 65 85) !important; /* slate-700 */
}

/* Component Details cards - more specific selector */
.dark .grid.md\:grid-cols-2 > div.bg-white.rounded-2xl {
  background-color: rgb(30 41 59) !important; /* slate-800 */
  border-color: rgb(51 65 85) !important; /* slate-700 */
}

/* Overview section card */
.dark .max-w-7xl.mx-auto.mb-16 > div.bg-white.rounded-2xl {
  background-color: rgb(30 41 59) !important; /* slate-800 */
  border-color: rgb(51 65 85) !important; /* slate-700 */
}

/* Ensure decision box question text is readable in dark mode */
.dark .decision-box p {
  color: rgb(255 255 255) !important;
}

.dark .decision-box.bg-white p,
.dark .decision-box.bg-gray-50 p {
  color: rgb(255 255 255) !important;
}
</style>

