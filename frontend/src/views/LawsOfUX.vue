<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative flex">
    <!-- Drawer -->
    <DocumentationDrawer :isOpen="drawerOpen" @close="closeDrawer" @toggle="toggleDrawer" />
    
    <!-- Main Content Area -->
    <div 
      class="flex-1 h-full transition-all duration-300 relative overflow-hidden"
      :style="drawerOpen ? 'margin-left: 256px;' : 'margin-left: 48px;'"
    >
      <div class="h-full p-8 overflow-auto">
        <!-- Hero Section -->
        <div class="max-w-7xl mx-auto mb-12">
          <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
            <!-- Background texture/grain effect -->
            <div class="absolute inset-0 opacity-10 texture-pattern"></div>
            
            <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div class="flex-1">
                <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  Laws of UX
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  A collection of best practices that designers can consider when building user interfaces. These principles guide us in creating intuitive, effective, and user-centered designs.
                </p>
              </div>
              <div class="hidden md:block flex-shrink-0">
                <div class="w-64 h-64 relative">
                  <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
                    <defs>
                      <linearGradient id="lawsOfUXGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <!-- Central design/interface icon -->
                    <rect x="60" y="60" width="80" height="80" rx="8" fill="url(#lawsOfUXGradient)" opacity="0.4"/>
                    <rect x="70" y="70" width="60" height="60" rx="4" fill="url(#lawsOfUXGradient)" opacity="0.5"/>
                    <!-- UI elements -->
                    <rect x="75" y="75" width="20" height="8" rx="1" fill="url(#lawsOfUXGradient)" opacity="0.7"/>
                    <rect x="105" y="75" width="20" height="8" rx="1" fill="url(#lawsOfUXGradient)" opacity="0.7"/>
                    <rect x="75" y="90" width="50" height="8" rx="1" fill="url(#lawsOfUXGradient)" opacity="0.6"/>
                    <rect x="75" y="105" width="50" height="8" rx="1" fill="url(#lawsOfUXGradient)" opacity="0.6"/>
                    <!-- Law indicators around the center -->
                    <circle cx="100" cy="30" r="10" fill="url(#lawsOfUXGradient)" opacity="0.6"/>
                    <circle cx="170" cy="100" r="10" fill="url(#lawsOfUXGradient)" opacity="0.6"/>
                    <circle cx="100" cy="170" r="10" fill="url(#lawsOfUXGradient)" opacity="0.6"/>
                    <circle cx="30" cy="100" r="10" fill="url(#lawsOfUXGradient)" opacity="0.6"/>
                    <!-- Connecting lines representing relationships -->
                    <line x1="100" y1="50" x2="100" y2="40" stroke="url(#lawsOfUXGradient)" stroke-width="2" opacity="0.4"/>
                    <line x1="150" y1="100" x2="160" y2="100" stroke="url(#lawsOfUXGradient)" stroke-width="2" opacity="0.4"/>
                    <line x1="100" y1="150" x2="100" y2="160" stroke="url(#lawsOfUXGradient)" stroke-width="2" opacity="0.4"/>
                    <line x1="50" y1="100" x2="40" y2="100" stroke="url(#lawsOfUXGradient)" stroke-width="2" opacity="0.4"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Introduction -->
        <div class="max-w-7xl mx-auto mb-12">
          <div 
            class="rounded-lg shadow-sm border p-8"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <p class="text-lg leading-relaxed" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              The Laws of UX is a collection of best practices that designers can consider when building user interfaces. 
              These principles are based on psychological principles, user behavior research, and decades of design experience. 
              Understanding and applying these laws helps create more intuitive, efficient, and user-friendly interfaces.
            </p>
            <p class="text-sm mt-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
              Reference: <a href="https://lawsofux.com/" target="_blank" rel="noopener noreferrer" class="text-indigo-600 dark:text-indigo-400 hover:underline">Laws of UX</a> by Jon Yablonski
            </p>
          </div>
        </div>

        <!-- Laws Grid -->
        <div class="max-w-7xl mx-auto">
          <h2 class="text-3xl font-bold mb-8" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
            The Laws
          </h2>
          
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Law Card Component -->
            <router-link
              v-for="law in laws"
              :key="law.id"
              :to="`/hcd/laws-of-ux/${law.id}`"
              class="rounded-lg shadow-sm border p-6 transition-all hover:shadow-md block"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700 hover:border-indigo-500' 
                : 'bg-white border-gray-200 hover:border-indigo-500'"
            >
              <div class="flex items-start gap-4">
                <div class="flex-shrink-0 w-12 h-12" v-html="law.icon"></div>
                <div class="flex-1">
                  <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ law.name }}
                  </h3>
                  <p class="text-sm leading-relaxed" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    {{ law.description }}
                  </p>
                  <div class="mt-3 text-xs" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                    Learn more →
                  </div>
                </div>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

// SVG icon generator helper
const createIcon = (svgContent) => {
  return `<svg viewBox="0 0 100 100" class="w-full h-full">${svgContent}</svg>`;
};

// Laws data with icons
const laws = ref([
  {
    id: 'aesthetic-usability',
    name: 'Aesthetic-Usability Effect',
    description: 'Users often perceive aesthetically pleasing design as design that\'s more usable.',
    icon: createIcon(`
      <defs>
        <linearGradient id="aestheticGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="35" fill="url(#aestheticGrad)" opacity="0.2"/>
      <path d="M 30 50 Q 50 30 70 50 Q 50 70 30 50" fill="url(#aestheticGrad)" opacity="0.6"/>
      <circle cx="50" cy="50" r="8" fill="url(#aestheticGrad)" opacity="0.8"/>
    `)
  },
  {
    id: 'choice-overload',
    name: 'Choice Overload',
    description: 'The tendency for people to get overwhelmed when they are presented with a large number of options, often used interchangeably with the term paradox of choice.',
    icon: createIcon(`
      <defs>
        <linearGradient id="choiceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="35" fill="url(#choiceGrad)" opacity="0.2"/>
      <circle cx="30" cy="30" r="8" fill="url(#choiceGrad)" opacity="0.7"/>
      <circle cx="50" cy="30" r="8" fill="url(#choiceGrad)" opacity="0.7"/>
      <circle cx="70" cy="30" r="8" fill="url(#choiceGrad)" opacity="0.7"/>
      <circle cx="30" cy="50" r="8" fill="url(#choiceGrad)" opacity="0.7"/>
      <circle cx="70" cy="50" r="8" fill="url(#choiceGrad)" opacity="0.7"/>
      <circle cx="30" cy="70" r="8" fill="url(#choiceGrad)" opacity="0.7"/>
      <circle cx="50" cy="70" r="8" fill="url(#choiceGrad)" opacity="0.7"/>
      <circle cx="70" cy="70" r="8" fill="url(#choiceGrad)" opacity="0.7"/>
    `)
  },
  {
    id: 'chunking',
    name: 'Chunking',
    description: 'A process by which individual pieces of an information set are broken down and then grouped together in a meaningful whole.',
    icon: createIcon(`
      <defs>
        <linearGradient id="chunkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect x="20" y="30" width="25" height="15" rx="2" fill="url(#chunkGrad)" opacity="0.6"/>
      <rect x="50" y="30" width="25" height="15" rx="2" fill="url(#chunkGrad)" opacity="0.6"/>
      <rect x="20" y="50" width="25" height="15" rx="2" fill="url(#chunkGrad)" opacity="0.6"/>
      <rect x="50" y="50" width="25" height="15" rx="2" fill="url(#chunkGrad)" opacity="0.6"/>
      <line x1="45" y1="37" x2="50" y2="37" stroke="url(#chunkGrad)" stroke-width="2" opacity="0.4"/>
      <line x1="45" y1="57" x2="50" y2="57" stroke="url(#chunkGrad)" stroke-width="2" opacity="0.4"/>
    `)
  },
  {
    id: 'cognitive-bias',
    name: 'Cognitive Bias',
    description: 'A systematic error of thinking or rationality in judgment that influence our perception of the world and our decision-making ability.',
    icon: createIcon(`
      <defs>
        <linearGradient id="biasGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="30" fill="none" stroke="url(#biasGrad)" stroke-width="3" opacity="0.5"/>
      <path d="M 50 20 Q 70 50 50 80 Q 30 50 50 20" fill="url(#biasGrad)" opacity="0.4"/>
      <circle cx="50" cy="50" r="5" fill="url(#biasGrad)" opacity="0.8"/>
    `)
  },
  {
    id: 'cognitive-load',
    name: 'Cognitive Load',
    description: 'The amount of mental resources needed to understand and interact with an interface.',
    icon: createIcon(`
      <defs>
        <linearGradient id="loadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect x="30" y="40" width="40" height="30" rx="3" fill="url(#loadGrad)" opacity="0.3"/>
      <rect x="35" y="45" width="30" height="5" rx="1" fill="url(#loadGrad)" opacity="0.6"/>
      <rect x="35" y="55" width="30" height="5" rx="1" fill="url(#loadGrad)" opacity="0.6"/>
      <rect x="35" y="65" width="20" height="5" rx="1" fill="url(#loadGrad)" opacity="0.6"/>
      <circle cx="50" cy="25" r="8" fill="url(#loadGrad)" opacity="0.7"/>
      <path d="M 50 17 L 45 12 M 50 17 L 55 12" stroke="url(#loadGrad)" stroke-width="2" opacity="0.7" stroke-linecap="round"/>
    `)
  },
  {
    id: 'doherty-threshold',
    name: 'Doherty Threshold',
    description: 'Productivity soars when a computer and its users interact at a pace (<400ms) that ensures that neither has to wait on the other.',
    icon: createIcon(`
      <defs>
        <linearGradient id="dohertyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="30" fill="url(#dohertyGrad)" opacity="0.2"/>
      <path d="M 20 50 L 50 30 L 80 50 L 50 70 Z" fill="url(#dohertyGrad)" opacity="0.5"/>
      <circle cx="50" cy="50" r="8" fill="url(#dohertyGrad)" opacity="0.8"/>
      <line x1="50" y1="20" x2="50" y2="30" stroke="url(#dohertyGrad)" stroke-width="2" opacity="0.6"/>
    `)
  },
  {
    id: 'fitts-law',
    name: 'Fitts\'s Law',
    description: 'The time to acquire a target is a function of the distance to and size of the target.',
    icon: createIcon(`
      <defs>
        <linearGradient id="fittsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="30" cy="50" r="12" fill="url(#fittsGrad)" opacity="0.5"/>
      <circle cx="70" cy="50" r="20" fill="url(#fittsGrad)" opacity="0.6"/>
      <line x1="42" y1="50" x2="50" y2="50" stroke="url(#fittsGrad)" stroke-width="3" opacity="0.7" stroke-linecap="round"/>
      <path d="M 50 50 L 55 45 L 55 55 Z" fill="url(#fittsGrad)" opacity="0.7"/>
    `)
  },
  {
    id: 'flow',
    name: 'Flow',
    description: 'The mental state in which a person performing some activity is fully immersed in a feeling of energized focus, full involvement, and enjoyment in the process of the activity.',
    icon: createIcon(`
      <defs>
        <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <path d="M 20 50 Q 35 30 50 50 T 80 50" fill="none" stroke="url(#flowGrad)" stroke-width="4" opacity="0.6" stroke-linecap="round"/>
      <circle cx="20" cy="50" r="5" fill="url(#flowGrad)" opacity="0.8"/>
      <circle cx="50" cy="50" r="5" fill="url(#flowGrad)" opacity="0.8"/>
      <circle cx="80" cy="50" r="5" fill="url(#flowGrad)" opacity="0.8"/>
    `)
  },
  {
    id: 'goal-gradient',
    name: 'Goal-Gradient Effect',
    description: 'The tendency to approach a goal increases with proximity to the goal.',
    icon: createIcon(`
      <defs>
        <linearGradient id="goalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <line x1="20" y1="70" x2="80" y2="30" stroke="url(#goalGrad)" stroke-width="3" opacity="0.5"/>
      <circle cx="25" cy="65" r="6" fill="url(#goalGrad)" opacity="0.6"/>
      <circle cx="40" cy="55" r="6" fill="url(#goalGrad)" opacity="0.7"/>
      <circle cx="55" cy="45" r="6" fill="url(#goalGrad)" opacity="0.8"/>
      <circle cx="70" cy="35" r="8" fill="url(#goalGrad)" opacity="0.9"/>
      <path d="M 80 30 L 75 25 L 75 35 Z" fill="url(#goalGrad)" opacity="0.9"/>
    `)
  },
  {
    id: 'hick-law',
    name: 'Hick\'s Law',
    description: 'The time it takes to make a decision increases with the number and complexity of choices.',
    icon: createIcon(`
      <defs>
        <linearGradient id="hickGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="25" fill="url(#hickGrad)" opacity="0.2"/>
      <path d="M 50 25 L 30 50 L 50 75 L 70 50 Z" fill="url(#hickGrad)" opacity="0.5"/>
      <circle cx="50" cy="50" r="8" fill="url(#hickGrad)" opacity="0.8"/>
      <line x1="50" y1="25" x2="50" y2="42" stroke="url(#hickGrad)" stroke-width="2" opacity="0.6"/>
      <line x1="30" y1="50" x2="42" y2="50" stroke="url(#hickGrad)" stroke-width="2" opacity="0.6"/>
      <line x1="50" y1="75" x2="50" y2="58" stroke="url(#hickGrad)" stroke-width="2" opacity="0.6"/>
      <line x1="70" y1="50" x2="58" y2="50" stroke="url(#hickGrad)" stroke-width="2" opacity="0.6"/>
    `)
  },
  {
    id: 'jakob-law',
    name: 'Jakob\'s Law',
    description: 'Users spend most of their time on other sites. This means that users prefer your site to work the same way as all the other sites they already know.',
    icon: createIcon(`
      <defs>
        <linearGradient id="jakobGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect x="25" y="30" width="20" height="40" rx="2" fill="url(#jakobGrad)" opacity="0.5"/>
      <rect x="55" y="30" width="20" height="40" rx="2" fill="url(#jakobGrad)" opacity="0.5"/>
      <line x1="45" y1="50" x2="55" y2="50" stroke="url(#jakobGrad)" stroke-width="3" opacity="0.7" stroke-linecap="round"/>
      <circle cx="50" cy="50" r="3" fill="url(#jakobGrad)" opacity="0.9"/>
    `)
  },
  {
    id: 'common-region',
    name: 'Law of Common Region',
    description: 'Elements tend to be perceived into groups if they are sharing an area with a clearly defined boundary.',
    icon: createIcon(`
      <defs>
        <linearGradient id="regionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect x="20" y="30" width="60" height="40" rx="3" fill="none" stroke="url(#regionGrad)" stroke-width="3" opacity="0.6"/>
      <circle cx="35" cy="45" r="6" fill="url(#regionGrad)" opacity="0.7"/>
      <circle cx="50" cy="45" r="6" fill="url(#regionGrad)" opacity="0.7"/>
      <circle cx="65" cy="45" r="6" fill="url(#regionGrad)" opacity="0.7"/>
    `)
  },
  {
    id: 'proximity',
    name: 'Law of Proximity',
    description: 'Objects that are near, or proximate to each other, tend to be grouped together.',
    icon: createIcon(`
      <defs>
        <linearGradient id="proximityGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="35" cy="40" r="8" fill="url(#proximityGrad)" opacity="0.7"/>
      <circle cx="45" cy="40" r="8" fill="url(#proximityGrad)" opacity="0.7"/>
      <circle cx="55" cy="60" r="8" fill="url(#proximityGrad)" opacity="0.7"/>
      <circle cx="65" cy="60" r="8" fill="url(#proximityGrad)" opacity="0.7"/>
    `)
  },
  {
    id: 'pragnanz',
    name: 'Law of Prägnanz',
    description: 'People will perceive and interpret ambiguous or complex images as the simplest form possible, because it is the interpretation that requires the least cognitive effort of us.',
    icon: createIcon(`
      <defs>
        <linearGradient id="pragnanzGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="30" fill="url(#pragnanzGrad)" opacity="0.3"/>
      <circle cx="50" cy="50" r="20" fill="none" stroke="url(#pragnanzGrad)" stroke-width="3" opacity="0.6"/>
      <circle cx="50" cy="50" r="10" fill="url(#pragnanzGrad)" opacity="0.8"/>
    `)
  },
  {
    id: 'similarity',
    name: 'Law of Similarity',
    description: 'The human eye tends to perceive similar elements as a complete picture, shape, or group, even if those elements are separated.',
    icon: createIcon(`
      <defs>
        <linearGradient id="similarityGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="30" cy="30" r="8" fill="url(#similarityGrad)" opacity="0.7"/>
      <circle cx="50" cy="30" r="8" fill="url(#similarityGrad)" opacity="0.7"/>
      <circle cx="70" cy="30" r="8" fill="url(#similarityGrad)" opacity="0.7"/>
      <rect x="22" y="50" width="16" height="16" rx="2" fill="url(#similarityGrad)" opacity="0.7"/>
      <rect x="42" y="50" width="16" height="16" rx="2" fill="url(#similarityGrad)" opacity="0.7"/>
      <rect x="62" y="50" width="16" height="16" rx="2" fill="url(#similarityGrad)" opacity="0.7"/>
    `)
  },
  {
    id: 'uniform-connectedness',
    name: 'Law of Uniform Connectedness',
    description: 'Elements that are visually connected are perceived as more related than elements with no connection.',
    icon: createIcon(`
      <defs>
        <linearGradient id="connectedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="30" cy="40" r="6" fill="url(#connectedGrad)" opacity="0.7"/>
      <circle cx="50" cy="40" r="6" fill="url(#connectedGrad)" opacity="0.7"/>
      <circle cx="70" cy="40" r="6" fill="url(#connectedGrad)" opacity="0.7"/>
      <line x1="36" y1="40" x2="44" y2="40" stroke="url(#connectedGrad)" stroke-width="3" opacity="0.6"/>
      <line x1="56" y1="40" x2="64" y2="40" stroke="url(#connectedGrad)" stroke-width="3" opacity="0.6"/>
      <circle cx="30" cy="60" r="6" fill="url(#connectedGrad)" opacity="0.4"/>
      <circle cx="50" cy="60" r="6" fill="url(#connectedGrad)" opacity="0.4"/>
      <circle cx="70" cy="60" r="6" fill="url(#connectedGrad)" opacity="0.4"/>
    `)
  },
  {
    id: 'mental-model',
    name: 'Mental Model',
    description: 'A compressed model based on what we think we know about a system and how it works.',
    icon: createIcon(`
      <defs>
        <linearGradient id="mentalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="25" fill="url(#mentalGrad)" opacity="0.2"/>
      <path d="M 30 50 Q 50 30 70 50 Q 50 70 30 50" fill="url(#mentalGrad)" opacity="0.5"/>
      <circle cx="50" cy="50" r="8" fill="url(#mentalGrad)" opacity="0.8"/>
      <path d="M 50 42 L 45 35 M 50 42 L 55 35" stroke="url(#mentalGrad)" stroke-width="2" opacity="0.7" stroke-linecap="round"/>
    `)
  },
  {
    id: 'miller-law',
    name: 'Miller\'s Law',
    description: 'The average person can only keep 7 (plus or minus 2) items in their working memory.',
    icon: createIcon(`
      <defs>
        <linearGradient id="millerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="30" fill="url(#millerGrad)" opacity="0.2"/>
      <circle cx="30" cy="35" r="5" fill="url(#millerGrad)" opacity="0.7"/>
      <circle cx="45" cy="30" r="5" fill="url(#millerGrad)" opacity="0.7"/>
      <circle cx="60" cy="30" r="5" fill="url(#millerGrad)" opacity="0.7"/>
      <circle cx="75" cy="35" r="5" fill="url(#millerGrad)" opacity="0.7"/>
      <circle cx="35" cy="55" r="5" fill="url(#millerGrad)" opacity="0.7"/>
      <circle cx="50" cy="50" r="5" fill="url(#millerGrad)" opacity="0.7"/>
      <circle cx="65" cy="55" r="5" fill="url(#millerGrad)" opacity="0.7"/>
    `)
  },
  {
    id: 'occam-razor',
    name: 'Occam\'s Razor',
    description: 'Among competing hypotheses that predict equally well, the one with the fewest assumptions should be selected.',
    icon: createIcon(`
      <defs>
        <linearGradient id="occamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <line x1="30" y1="50" x2="70" y2="50" stroke="url(#occamGrad)" stroke-width="4" opacity="0.6" stroke-linecap="round"/>
      <path d="M 70 50 L 65 45 L 65 55 Z" fill="url(#occamGrad)" opacity="0.6"/>
      <circle cx="35" cy="50" r="4" fill="url(#occamGrad)" opacity="0.8"/>
      <circle cx="50" cy="50" r="4" fill="url(#occamGrad)" opacity="0.8"/>
    `)
  },
  {
    id: 'paradox-active-user',
    name: 'Paradox of the Active User',
    description: 'Users never read manuals but start using the software immediately.',
    icon: createIcon(`
      <defs>
        <linearGradient id="paradoxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect x="30" y="40" width="40" height="30" rx="3" fill="url(#paradoxGrad)" opacity="0.3"/>
      <rect x="35" y="45" width="30" height="5" rx="1" fill="url(#paradoxGrad)" opacity="0.6"/>
      <rect x="35" y="55" width="30" height="5" rx="1" fill="url(#paradoxGrad)" opacity="0.6"/>
      <circle cx="50" cy="25" r="8" fill="url(#paradoxGrad)" opacity="0.7"/>
      <path d="M 50 17 L 45 12 M 50 17 L 55 12" stroke="url(#paradoxGrad)" stroke-width="2" opacity="0.7" stroke-linecap="round"/>
      <line x1="50" y1="33" x2="50" y2="40" stroke="url(#paradoxGrad)" stroke-width="2" opacity="0.7"/>
    `)
  },
  {
    id: 'pareto',
    name: 'Pareto Principle',
    description: 'The Pareto principle states that, for many events, roughly 80% of the effects come from 20% of the causes.',
    icon: createIcon(`
      <defs>
        <linearGradient id="paretoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <path d="M 50 80 L 50 40 Q 50 30 60 30 L 80 30" fill="none" stroke="url(#paretoGrad)" stroke-width="4" opacity="0.6" stroke-linecap="round"/>
      <circle cx="50" cy="80" r="5" fill="url(#paretoGrad)" opacity="0.8"/>
      <circle cx="60" cy="30" r="5" fill="url(#paretoGrad)" opacity="0.8"/>
      <circle cx="80" cy="30" r="5" fill="url(#paretoGrad)" opacity="0.8"/>
      <text x="50" y="90" font-size="12" fill="url(#paretoGrad)" opacity="0.7" text-anchor="middle">80%</text>
      <text x="80" y="25" font-size="12" fill="url(#paretoGrad)" opacity="0.7" text-anchor="middle">20%</text>
    `)
  },
  {
    id: 'parkinson',
    name: 'Parkinson\'s Law',
    description: 'Any task will inflate until all of the available time is spent.',
    icon: createIcon(`
      <defs>
        <linearGradient id="parkinsonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect x="30" y="60" width="15" height="20" rx="2" fill="url(#parkinsonGrad)" opacity="0.6"/>
      <rect x="50" y="50" width="15" height="30" rx="2" fill="url(#parkinsonGrad)" opacity="0.7"/>
      <rect x="70" y="40" width="15" height="40" rx="2" fill="url(#parkinsonGrad)" opacity="0.8"/>
      <line x1="20" y1="80" x2="85" y2="80" stroke="url(#parkinsonGrad)" stroke-width="2" opacity="0.5"/>
    `)
  },
  {
    id: 'peak-end',
    name: 'Peak-End Rule',
    description: 'People judge an experience largely based on how they felt at its peak and at its end, rather than the total sum or average of every moment of the experience.',
    icon: createIcon(`
      <defs>
        <linearGradient id="peakGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <path d="M 20 70 Q 40 30 60 50 T 80 50" fill="none" stroke="url(#peakGrad)" stroke-width="3" opacity="0.6"/>
      <circle cx="40" cy="30" r="6" fill="url(#peakGrad)" opacity="0.9"/>
      <circle cx="80" cy="50" r="6" fill="url(#peakGrad)" opacity="0.9"/>
    `)
  },
  {
    id: 'postel',
    name: 'Postel\'s Law',
    description: 'Be liberal in what you accept, and conservative in what you send.',
    icon: createIcon(`
      <defs>
        <linearGradient id="postelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <path d="M 30 50 L 50 30 L 70 50" fill="none" stroke="url(#postelGrad)" stroke-width="4" opacity="0.6" stroke-linecap="round"/>
      <path d="M 30 50 L 50 70 L 70 50" fill="url(#postelGrad)" opacity="0.4"/>
      <circle cx="50" cy="50" r="5" fill="url(#postelGrad)" opacity="0.8"/>
    `)
  },
  {
    id: 'selective-attention',
    name: 'Selective Attention',
    description: 'The process of focusing our attention only to a subset of stimuli in an environment — usually those related to our goals.',
    icon: createIcon(`
      <defs>
        <linearGradient id="attentionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="30" fill="none" stroke="url(#attentionGrad)" stroke-width="3" opacity="0.4"/>
      <circle cx="50" cy="50" r="20" fill="none" stroke="url(#attentionGrad)" stroke-width="3" opacity="0.5"/>
      <circle cx="50" cy="50" r="10" fill="url(#attentionGrad)" opacity="0.8"/>
      <circle cx="30" cy="30" r="4" fill="url(#attentionGrad)" opacity="0.3"/>
      <circle cx="70" cy="30" r="4" fill="url(#attentionGrad)" opacity="0.3"/>
      <circle cx="30" cy="70" r="4" fill="url(#attentionGrad)" opacity="0.3"/>
      <circle cx="70" cy="70" r="4" fill="url(#attentionGrad)" opacity="0.3"/>
    `)
  },
  {
    id: 'serial-position',
    name: 'Serial Position Effect',
    description: 'Users have a propensity to best remember the first and last items in a series.',
    icon: createIcon(`
      <defs>
        <linearGradient id="serialGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect x="25" y="30" width="12" height="40" rx="2" fill="url(#serialGrad)" opacity="0.9"/>
      <rect x="40" y="40" width="12" height="30" rx="2" fill="url(#serialGrad)" opacity="0.5"/>
      <rect x="55" y="45" width="12" height="25" rx="2" fill="url(#serialGrad)" opacity="0.5"/>
      <rect x="70" y="30" width="12" height="40" rx="2" fill="url(#serialGrad)" opacity="0.9"/>
    `)
  },
  {
    id: 'tesler',
    name: 'Tesler\'s Law',
    description: 'Tesler\'s Law, also known as The Law of Conservation of Complexity, states that for any system there is a certain amount of complexity which cannot be reduced.',
    icon: createIcon(`
      <defs>
        <linearGradient id="teslerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect x="30" y="40" width="40" height="30" rx="3" fill="url(#teslerGrad)" opacity="0.3"/>
      <path d="M 30 40 L 50 30 L 70 40" fill="none" stroke="url(#teslerGrad)" stroke-width="3" opacity="0.6"/>
      <path d="M 30 70 L 50 60 L 70 70" fill="none" stroke="url(#teslerGrad)" stroke-width="3" opacity="0.6"/>
      <circle cx="50" cy="50" r="5" fill="url(#teslerGrad)" opacity="0.8"/>
    `)
  },
  {
    id: 'von-restorff',
    name: 'Von Restorff Effect',
    description: 'The Von Restorff effect, also known as The Isolation Effect, predicts that when multiple similar objects are present, the one that differs from the rest is most likely to be remembered.',
    icon: createIcon(`
      <defs>
        <linearGradient id="restorffGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="30" cy="40" r="6" fill="url(#restorffGrad)" opacity="0.5"/>
      <circle cx="50" cy="40" r="6" fill="url(#restorffGrad)" opacity="0.5"/>
      <circle cx="70" cy="40" r="10" fill="url(#restorffGrad)" opacity="0.9"/>
      <circle cx="30" cy="60" r="6" fill="url(#restorffGrad)" opacity="0.5"/>
      <circle cx="50" cy="60" r="6" fill="url(#restorffGrad)" opacity="0.5"/>
      <circle cx="70" cy="60" r="6" fill="url(#restorffGrad)" opacity="0.5"/>
    `)
  },
  {
    id: 'working-memory',
    name: 'Working Memory',
    description: 'A cognitive system that temporarily holds and manipulates information needed to complete tasks.',
    icon: createIcon(`
      <defs>
        <linearGradient id="memoryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect x="30" y="35" width="40" height="30" rx="3" fill="url(#memoryGrad)" opacity="0.3"/>
      <rect x="35" y="40" width="30" height="5" rx="1" fill="url(#memoryGrad)" opacity="0.6"/>
      <rect x="35" y="50" width="30" height="5" rx="1" fill="url(#memoryGrad)" opacity="0.6"/>
      <rect x="35" y="60" width="20" height="5" rx="1" fill="url(#memoryGrad)" opacity="0.6"/>
      <circle cx="50" cy="25" r="6" fill="url(#memoryGrad)" opacity="0.7"/>
    `)
  },
  {
    id: 'zeigarnik',
    name: 'Zeigarnik Effect',
    description: 'People remember uncompleted or interrupted tasks better than completed tasks.',
    icon: createIcon(`
      <defs>
        <linearGradient id="zeigarnikGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="30" fill="none" stroke="url(#zeigarnikGrad)" stroke-width="4" opacity="0.5" stroke-dasharray="10 5"/>
      <circle cx="50" cy="50" r="20" fill="none" stroke="url(#zeigarnikGrad)" stroke-width="3" opacity="0.7" stroke-dasharray="8 4"/>
      <circle cx="50" cy="50" r="10" fill="url(#zeigarnikGrad)" opacity="0.8"/>
      <line x1="50" y1="20" x2="50" y2="10" stroke="url(#zeigarnikGrad)" stroke-width="3" opacity="0.7" stroke-linecap="round"/>
    `)
  }
]);

onMounted(() => {
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
