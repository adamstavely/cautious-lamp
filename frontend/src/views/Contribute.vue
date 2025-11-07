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
          <div class="max-w-7xl mx-auto mb-12">
            <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
              <!-- Background texture/grain effect -->
              <div class="absolute inset-0 opacity-10 texture-pattern"></div>
              
              <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                <div class="flex-1">
                  <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                    Contribute
                  </h1>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                    Help us build and improve the design system. Whether you're contributing components, patterns, documentation, or feedback, your contributions make the system better for everyone.
                  </p>
                </div>
                <div class="hidden md:block flex-shrink-0">
                  <div class="w-64 h-64 relative">
                    <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
                      <defs>
                        <linearGradient id="contributeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Stylized collaboration icon -->
                      <circle cx="70" cy="70" r="25" fill="url(#contributeGradient)" opacity="0.4"/>
                      <circle cx="130" cy="70" r="25" fill="url(#contributeGradient)" opacity="0.5"/>
                      <circle cx="100" cy="130" r="25" fill="url(#contributeGradient)" opacity="0.4"/>
                      <!-- Connecting lines -->
                      <line x1="85" y1="85" x2="95" y2="115" stroke="url(#contributeGradient)" stroke-width="3" opacity="0.3"/>
                      <line x1="115" y1="85" x2="105" y2="115" stroke="url(#contributeGradient)" stroke-width="3" opacity="0.3"/>
                      <line x1="90" y1="90" x2="110" y2="90" stroke="url(#contributeGradient)" stroke-width="3" opacity="0.3"/>
                      <!-- Plus signs for contribution -->
                      <line x1="65" y1="70" x2="75" y2="70" stroke="white" stroke-width="2" opacity="0.8"/>
                      <line x1="70" y1="65" x2="70" y2="75" stroke="white" stroke-width="2" opacity="0.8"/>
                      <line x1="125" y1="70" x2="135" y2="70" stroke="white" stroke-width="2" opacity="0.8"/>
                      <line x1="130" y1="65" x2="130" y2="75" stroke="white" stroke-width="2" opacity="0.8"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Ways to Contribute -->
          <div class="max-w-7xl mx-auto mb-12">
            <h2 class="text-3xl font-bold mb-8" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              Ways to Contribute
            </h2>
            <div class="grid md:grid-cols-2 gap-6">
              <!-- Components -->
              <div 
                class="rounded-lg shadow-sm border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                  <span class="material-symbols-outlined text-5xl">widgets</span>
                </div>
                <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Components
                </h3>
                <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Propose new components or improve existing ones. Ensure they follow our design principles, accessibility standards, and component patterns.
                </p>
                <ul class="list-disc list-inside space-y-1 ml-2 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  <li>New component proposals</li>
                  <li>Component enhancements</li>
                  <li>Bug fixes and improvements</li>
                  <li>Accessibility improvements</li>
                </ul>
              </div>

              <!-- Design Tokens -->
              <div 
                class="rounded-lg shadow-sm border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                  <span class="material-symbols-outlined text-5xl">style</span>
                </div>
                <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Design Tokens
                </h3>
                <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Contribute new design tokens, update existing ones, or propose changes to our token structure. All tokens must follow DTCG standards.
                </p>
                <ul class="list-disc list-inside space-y-1 ml-2 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  <li>New color, spacing, or typography tokens</li>
                  <li>Token value updates</li>
                  <li>Token structure improvements</li>
                  <li>Token documentation</li>
                </ul>
              </div>

              <!-- Patterns -->
              <div 
                class="rounded-lg shadow-sm border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                  <span class="material-symbols-outlined text-5xl">pattern</span>
                </div>
                <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Patterns
                </h3>
                <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Share design patterns, layouts, and interaction patterns that solve common problems. Document use cases and best practices.
                </p>
                <ul class="list-disc list-inside space-y-1 ml-2 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  <li>New design patterns</li>
                  <li>Pattern documentation</li>
                  <li>Use case examples</li>
                  <li>Pattern improvements</li>
                </ul>
              </div>

              <!-- Documentation -->
              <div 
                class="rounded-lg shadow-sm border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                  <span class="material-symbols-outlined text-5xl">menu_book</span>
                </div>
                <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Documentation
                </h3>
                <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Improve documentation, add examples, fix typos, or clarify guidelines. Great documentation helps everyone use the system effectively.
                </p>
                <ul class="list-disc list-inside space-y-1 ml-2 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  <li>Documentation improvements</li>
                  <li>Code examples and demos</li>
                  <li>Guideline clarifications</li>
                  <li>Translation and localization</li>
                </ul>
              </div>

              <!-- Feedback -->
              <div 
                class="rounded-lg shadow-sm border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                  <span class="material-symbols-outlined text-5xl">feedback</span>
                </div>
                <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Feedback & Issues
                </h3>
                <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Report bugs, suggest improvements, or request new features. Your feedback helps us prioritize and improve the system.
                </p>
                <ul class="list-disc list-inside space-y-1 ml-2 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  <li>Bug reports</li>
                  <li>Feature requests</li>
                  <li>Usability feedback</li>
                  <li>Accessibility issues</li>
                </ul>
              </div>

              <!-- Tools & Resources -->
              <div 
                class="rounded-lg shadow-sm border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                  <span class="material-symbols-outlined text-5xl">build</span>
                </div>
                <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Tools & Resources
                </h3>
                <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Contribute new tools, improve existing ones, or create resources that help teams work more effectively with the design system.
                </p>
                <ul class="list-disc list-inside space-y-1 ml-2 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  <li>New design tools</li>
                  <li>CLI improvements</li>
                  <li>SDK enhancements</li>
                  <li>Integration examples</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Contribution Process -->
          <div class="max-w-7xl mx-auto mb-12">
            <h2 class="text-3xl font-bold mb-8" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              Contribution Process
            </h2>
            <div class="space-y-6">
              <!-- Step 1 -->
              <div 
                class="rounded-lg shadow-sm border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="flex items-start gap-4">
                  <div class="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xl">
                    1
                  </div>
                  <div class="flex-1">
                    <h3 class="text-xl font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      Propose Your Contribution
                    </h3>
                    <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Before starting work, create an issue or discussion to propose your contribution. This helps ensure alignment with design system goals and prevents duplicate work. Include:
                    </p>
                    <ul class="list-disc list-inside space-y-1 ml-4 mt-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      <li>Description of the contribution</li>
                      <li>Use case or problem it solves</li>
                      <li>Design mockups or examples (if applicable)</li>
                      <li>Any questions or concerns</li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- Step 2 -->
              <div 
                class="rounded-lg shadow-sm border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="flex items-start gap-4">
                  <div class="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xl">
                    2
                  </div>
                  <div class="flex-1">
                    <h3 class="text-xl font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      Get Feedback & Approval
                    </h3>
                    <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Wait for feedback from the design system team and other contributors. Address questions, incorporate suggestions, and get approval before proceeding with implementation.
                    </p>
                  </div>
                </div>
              </div>

              <!-- Step 3 -->
              <div 
                class="rounded-lg shadow-sm border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="flex items-start gap-4">
                  <div class="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xl">
                    3
                  </div>
                  <div class="flex-1">
                    <h3 class="text-xl font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      Create Your Contribution
                    </h3>
                    <p class="mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Follow our contribution guidelines:
                    </p>
                    <ul class="list-disc list-inside space-y-1 ml-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      <li>Follow design principles and accessibility standards</li>
                      <li>Use existing design tokens and patterns</li>
                      <li>Write comprehensive documentation</li>
                      <li>Include examples and use cases</li>
                      <li>Ensure code quality and test coverage</li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- Step 4 -->
              <div 
                class="rounded-lg shadow-sm border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="flex items-start gap-4">
                  <div class="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xl">
                    4
                  </div>
                  <div class="flex-1">
                    <h3 class="text-xl font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      Submit for Review
                    </h3>
                    <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Create a pull request with your contribution. Include a clear description, link to the original issue, and any relevant screenshots or examples. The design system team will review your contribution and provide feedback.
                    </p>
                  </div>
                </div>
              </div>

              <!-- Step 5 -->
              <div 
                class="rounded-lg shadow-sm border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="flex items-start gap-4">
                  <div class="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xl">
                    5
                  </div>
                  <div class="flex-1">
                    <h3 class="text-xl font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      Iterate & Merge
                    </h3>
                    <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Address review feedback, make requested changes, and work with reviewers until your contribution is ready. Once approved, it will be merged into the design system and released.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Contribution Guidelines -->
          <div class="max-w-7xl mx-auto mb-12">
            <h2 class="text-3xl font-bold mb-8" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              Contribution Guidelines
            </h2>
            <div class="grid md:grid-cols-2 gap-6">
              <!-- Code Standards -->
              <div 
                class="rounded-lg shadow-sm border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Code Standards
                </h3>
                <ul class="list-disc list-inside space-y-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  <li>Follow our coding style guide and conventions</li>
                  <li>Write clean, maintainable, and well-documented code</li>
                  <li>Include unit tests and integration tests</li>
                  <li>Ensure all tests pass before submitting</li>
                  <li>Follow semantic versioning for breaking changes</li>
                </ul>
              </div>

              <!-- Design Standards -->
              <div 
                class="rounded-lg shadow-sm border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Design Standards
                </h3>
                <ul class="list-disc list-inside space-y-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  <li>Adhere to our design principles and themes</li>
                  <li>Use existing design tokens (colors, spacing, typography)</li>
                  <li>Ensure WCAG 2.1 AA accessibility compliance</li>
                  <li>Follow component patterns and conventions</li>
                  <li>Provide design mockups and specifications</li>
                </ul>
              </div>

              <!-- Documentation Standards -->
              <div 
                class="rounded-lg shadow-sm border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Documentation Standards
                </h3>
                <ul class="list-disc list-inside space-y-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  <li>Write clear, concise documentation</li>
                  <li>Include usage examples and code snippets</li>
                  <li>Document props, APIs, and configuration options</li>
                  <li>Provide accessibility notes and considerations</li>
                  <li>Include migration guides for breaking changes</li>
                </ul>
              </div>

              <!-- Review Process -->
              <div 
                class="rounded-lg shadow-sm border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Review Process
                </h3>
                <ul class="list-disc list-inside space-y-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  <li>All contributions require review and approval</li>
                  <li>Be responsive to feedback and questions</li>
                  <li>Address all review comments before merging</li>
                  <li>Maintain a respectful and collaborative tone</li>
                  <li>Be patient—reviews may take time</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Getting Help -->
          <div class="max-w-7xl mx-auto mb-12">
            <h2 class="text-3xl font-bold mb-8" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              Need Help?
            </h2>
            <div 
              class="rounded-lg shadow-sm border p-8"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    Questions?
                  </h3>
                  <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Have questions about contributing? Not sure where to start? Reach out to the design system team or start a discussion in our contribution forum.
                  </p>
                  <button
                    class="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                    :class="isDarkMode ? 'bg-indigo-500 hover:bg-indigo-400' : ''"
                  >
                    Contact the Team
                  </button>
                </div>
                <div>
                  <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    Resources
                  </h3>
                  <ul class="space-y-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    <li>
                      <router-link to="/getting-started/principles" class="text-indigo-600 hover:text-indigo-700 underline" :class="isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : ''">
                        Design Principles
                      </router-link>
                    </li>
                    <li>
                      <router-link to="/getting-started/best-practices" class="text-indigo-600 hover:text-indigo-700 underline" :class="isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : ''">
                        Best Practices
                      </router-link>
                    </li>
                    <li>
                      <router-link to="/components" class="text-indigo-600 hover:text-indigo-700 underline" :class="isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : ''">
                        Component Library
                      </router-link>
                    </li>
                    <li>
                      <router-link to="/tokens" class="text-indigo-600 hover:text-indigo-700 underline" :class="isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : ''">
                        Design Tokens
                      </router-link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';

const drawerOpen = ref(false);
const isDarkMode = ref(false);

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

onMounted(() => {
  isDarkMode.value = document.documentElement.classList.contains('dark');
  
  const observer = new MutationObserver(() => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  });
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });
});
</script>

<style scoped>
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>

