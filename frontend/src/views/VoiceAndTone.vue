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
                  <h1 class="text-5xl md:text-6xl font-bold text-white leading-tight mb-4">
                    Voice and Tone
                  </h1>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                    A comprehensive guide to communicating with users across different stages of their journey. Use this cheatsheet to maintain consistent voice and tone throughout all touchpoints.
                  </p>
                </div>
                <div class="hidden md:block flex-shrink-0">
                  <div class="w-64 h-64 relative">
                    <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400">
                      <defs>
                        <linearGradient id="voiceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Speech bubble -->
                      <path d="M 40 60 Q 30 50 40 40 L 120 40 Q 160 40 160 80 L 160 120 Q 160 160 120 160 L 60 160 L 40 180 Z" 
                            fill="url(#voiceGradient)" 
                            opacity="0.3"/>
                      <path d="M 50 50 Q 45 45 50 40 L 110 40 Q 150 40 150 80 L 150 110 Q 150 150 110 150 L 60 150 L 50 170 Z" 
                            fill="url(#voiceGradient)" 
                            opacity="0.5"/>
                      <!-- Sound waves -->
                      <path d="M 30 100 Q 20 90 30 80 M 30 100 Q 20 110 30 120" 
                            stroke="url(#voiceGradient)" 
                            stroke-width="3" 
                            fill="none" 
                            opacity="0.6"/>
                      <path d="M 170 100 Q 180 90 170 80 M 170 100 Q 180 110 170 120" 
                            stroke="url(#voiceGradient)" 
                            stroke-width="3" 
                            fill="none" 
                            opacity="0.6"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Voice and Tone Cheatsheet -->
          <div class="max-w-7xl mx-auto">
            <!-- Introduction -->
            <div 
              class="rounded-lg shadow-sm border p-6 mb-8"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h2 class="text-2xl font-bold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Understanding the Cheatsheet
              </h2>
              <p class="mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Each scenario below represents a different stage of user interaction. The sliders indicate the recommended intensity for three key tone attributes:
              </p>
              <div class="grid md:grid-cols-3 gap-4">
                <div class="p-4 rounded-lg" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                  <h3 class="font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">To-the-point</h3>
                  <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    Direct, concise, and efficient communication without unnecessary words.
                  </p>
                </div>
                <div class="p-4 rounded-lg" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                  <h3 class="font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Approachable</h3>
                  <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    Friendly, warm, and human—making users feel comfortable and understood.
                  </p>
                </div>
                <div class="p-4 rounded-lg" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                  <h3 class="font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Upfront</h3>
                  <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    Transparent, honest, and clear—no hidden agendas or confusing language.
                  </p>
                </div>
              </div>
            </div>

            <!-- Voice and Tone Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div
                v-for="scenario in scenarios"
                :key="scenario.id"
                class="rounded-lg border p-6 transition-all hover:shadow-lg"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700 hover:border-indigo-500' 
                  : 'bg-white border-gray-200 hover:border-indigo-300'"
              >
                <!-- Scenario Title -->
                <h3 class="text-xl font-bold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  {{ scenario.title }}
                </h3>
                
                <!-- Description -->
                <p class="text-sm mb-4 leading-relaxed" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  {{ scenario.description }}
                </p>
                
                <!-- Tone Sliders -->
                <div class="space-y-3 mb-4">
                  <div v-for="tone in scenario.tones" :key="tone.name">
                    <div class="flex items-center justify-between mb-1.5">
                      <span class="text-xs font-semibold" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        {{ tone.name }}
                      </span>
                    </div>
                    <div class="relative h-3 rounded-full overflow-hidden" :class="isDarkMode ? 'bg-slate-700' : 'bg-gray-200'">
                      <div
                        class="absolute left-0 top-0 h-full rounded-full transition-all duration-300"
                        :style="{
                          width: `${tone.value}%`,
                          backgroundColor: '#10b981'
                        }"
                      ></div>
                    </div>
                  </div>
                </div>
                
                <!-- Touchpoints & Channels -->
                <div class="mt-4 pt-4 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                  <h4 class="text-xs font-semibold uppercase tracking-wider mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
                    Touchpoints & Channels
                  </h4>
                  <ul class="space-y-1">
                    <li
                      v-for="touchpoint in scenario.touchpoints"
                      :key="touchpoint"
                      class="text-xs flex items-start gap-2"
                      :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'"
                    >
                      <span class="mt-0.5">•</span>
                      <span>{{ touchpoint }}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Usage Guidelines -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h2 class="text-2xl font-bold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Best Practices
              </h2>
              <div class="space-y-4">
                <div>
                  <h3 class="font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    Context is Key
                  </h3>
                  <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    Always consider the user's emotional state and the context of their interaction. A user troubleshooting an issue needs different communication than someone celebrating a success.
                  </p>
                </div>
                <div>
                  <h3 class="font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    Consistency Across Channels
                  </h3>
                  <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    While tone may vary slightly based on context, your brand voice should remain consistent. Users should recognize your brand whether they're reading an email, using the app, or contacting support.
                  </p>
                </div>
                <div>
                  <h3 class="font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    Test and Iterate
                  </h3>
                  <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    Voice and tone guidelines are living documents. Regularly review user feedback, A/B test messaging, and adjust your approach based on what resonates with your audience.
                  </p>
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
const isDarkMode = ref(document.documentElement.classList.contains('dark'));

const scenarios = [
  {
    id: 'first-impressions',
    title: 'First impressions',
    description: 'Capture interest and spark curiosity with bold and clever language.',
    tones: [
      { name: 'To-the-point', value: 20 },
      { name: 'Approachable', value: 85 },
      { name: 'Upfront', value: 25 }
    ],
    touchpoints: [
      'In-app product flows',
      'Transactional email',
      'Transactional notifications'
    ]
  },
  {
    id: 'consideration',
    title: 'Consideration',
    description: 'Drive understanding and earn trust by breaking down products, how they work, and results.',
    tones: [
      { name: 'To-the-point', value: 80 },
      { name: 'Approachable', value: 70 },
      { name: 'Upfront', value: 85 }
    ],
    touchpoints: [
      'Product pages',
      'Campaign landers',
      'App store'
    ]
  },
  {
    id: 'education',
    title: 'Education',
    description: 'Provide information for decisions, build control, safety, and confidence, using social proof, metaphors, and data.',
    tones: [
      { name: 'To-the-point', value: 85 },
      { name: 'Approachable', value: 70 },
      { name: 'Upfront', value: 80 }
    ],
    touchpoints: [
      'Product announcement emails',
      'Tooltips',
      'New user states',
      'Half sheets'
    ]
  },
  {
    id: 'product-use',
    title: 'Product use',
    description: 'Help customers efficiently complete tasks with clear actions, helpful copy, and a natural, approachable brand expression.',
    tones: [
      { name: 'To-the-point', value: 75 },
      { name: 'Approachable', value: 90 },
      { name: 'Upfront', value: 75 }
    ],
    touchpoints: [
      'In-app product flows',
      'Transactional email',
      'Transactional notifications'
    ]
  },
  {
    id: 'engagement',
    title: 'Engagement',
    description: 'Keep customers interested in Cash App as a companion and a surprising brand, potentially through financial literacy, art, fashion, giveaways, or elevated experiences.',
    tones: [
      { name: 'To-the-point', value: 40 },
      { name: 'Approachable', value: 90 },
      { name: 'Upfront', value: 35 }
    ],
    touchpoints: [
      'Social',
      'Lifecycle marketing',
      'Event marketing'
    ]
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    description: 'Help users overcome obstacles with empathetic, clear, and concise language in error messages and support communications.',
    tones: [
      { name: 'To-the-point', value: 90 },
      { name: 'Approachable', value: 95 },
      { name: 'Upfront', value: 90 }
    ],
    touchpoints: [
      '@CashSupport',
      'Chatbot',
      'Quick texts'
    ]
  },
  {
    id: 'bad-news',
    title: 'Bad news',
    description: 'Deliver bad news with hyper-awareness of the customer\'s emotional state to ensure they feel heard and reassured.',
    tones: [
      { name: 'To-the-point', value: 75 },
      { name: 'Approachable', value: 95 },
      { name: 'Upfront', value: 75 }
    ],
    touchpoints: [
      'Compliance emails',
      'Error states',
      'Chatbot',
      'Quick texts'
    ]
  },
  {
    id: 'success',
    title: 'Success',
    description: 'Share good news and add delight after task completion, sign-ups, or purchases.',
    tones: [
      { name: 'To-the-point', value: 75 },
      { name: 'Approachable', value: 90 },
      { name: 'Upfront', value: 20 }
    ],
    touchpoints: [
      'Confirmation messages',
      'Transactional email',
      'Lifecycle marketing'
    ]
  },
  {
    id: 'moments-of-pause',
    title: 'Moments of pause',
    description: 'Foster connection in insignificant moments with unexpected language and diction.',
    tones: [
      { name: 'To-the-point', value: 15 },
      { name: 'Approachable', value: 85 },
      { name: 'Upfront', value: 15 }
    ],
    touchpoints: [
      'Empty states',
      'Logged out state',
      'Time out',
      'Footer'
    ]
  }
];


const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

const closeDrawer = () => {
  drawerOpen.value = false;
};

onMounted(() => {
  // Watch for dark mode changes
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

