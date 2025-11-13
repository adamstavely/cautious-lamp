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
          <div class="max-w-7xl mx-auto mb-8">
            <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
              <!-- Background texture/grain effect -->
              <div class="absolute inset-0 opacity-10 texture-pattern"></div>
              
              <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                <div class="flex-1">
                  <div class="flex items-center gap-4 mb-4">
                    <h1 class="text-5xl md:text-6xl font-bold text-white leading-tight">
                      User Persona Generator
                    </h1>
                  </div>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-4">
                    Create detailed user personas from research data. Generate structured persona documents that inform design decisions and keep teams aligned on user needs.
                  </p>
                  <div class="flex items-center gap-4 text-sm text-white/70">
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">person</span>
                      Research Tool
                    </span>
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">update</span>
                      Updated {{ new Date().toLocaleDateString() }}
                    </span>
                  </div>
                </div>
                <div class="hidden md:block flex-shrink-0">
                  <div class="w-64 h-64 relative">
                    <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400">
                      <defs>
                        <linearGradient id="personaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Stylized person icon -->
                      <circle cx="100" cy="70" r="30" fill="url(#personaGradient)" opacity="0.4"/>
                      <path d="M 50 140 Q 50 120 70 120 L 130 120 Q 150 120 150 140 L 150 180 L 50 180 Z" fill="url(#personaGradient)" opacity="0.5"/>
                      <!-- Data points representing research -->
                      <circle cx="40" cy="50" r="4" fill="url(#personaGradient)" opacity="0.6"/>
                      <circle cx="160" cy="60" r="4" fill="url(#personaGradient)" opacity="0.5"/>
                      <circle cx="50" cy="160" r="4" fill="url(#personaGradient)" opacity="0.4"/>
                      <circle cx="150" cy="170" r="4" fill="url(#personaGradient)" opacity="0.5"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Main Content -->
          <div class="max-w-7xl mx-auto">
            <div 
              class="rounded-lg shadow-sm border p-6 mb-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <form @submit.prevent="generatePersona" class="space-y-6">
                <!-- Basic Information -->
                <div class="space-y-4">
                  <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-gray-200' : 'text-gray-900'">
                    Basic Information
                  </h3>
                  
                  <div>
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Persona Name *
                    </label>
                    <input
                      v-model="form.name"
                      type="text"
                      required
                      class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      :class="isDarkMode 
                        ? 'border-slate-600 bg-slate-700 text-gray-100 focus:ring-indigo-400 focus:border-indigo-400' 
                        : 'border-gray-300 bg-white text-gray-900'"
                      placeholder="e.g., Sarah, The Busy Professional"
                    />
                  </div>
                </div>

                <!-- Persona Details -->
                <div class="space-y-4">
                  <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-gray-200' : 'text-gray-900'">
                    Persona Details
                  </h3>
                  
                  <div>
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      How They See Themselves
                    </label>
                    <textarea
                      v-model="form.howTheySeeThemselves"
                      rows="3"
                      class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      :class="isDarkMode 
                        ? 'border-slate-600 bg-slate-700 text-gray-100 focus:ring-indigo-400 focus:border-indigo-400' 
                        : 'border-gray-300 bg-white text-gray-900'"
                      placeholder="How does this persona see themselves? What is their self-perception?"
                    ></textarea>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Great Enablers
                    </label>
                    <textarea
                      v-model="form.greatEnablers"
                      rows="3"
                      class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      :class="isDarkMode 
                        ? 'border-slate-600 bg-slate-700 text-gray-100 focus:ring-indigo-400 focus:border-indigo-400' 
                        : 'border-gray-300 bg-white text-gray-900'"
                      placeholder="What are the great enablers for this persona? What helps them succeed?"
                    ></textarea>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Greatest Pain Points
                    </label>
                    <textarea
                      v-model="form.greatestPainPoints"
                      rows="3"
                      class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      :class="isDarkMode 
                        ? 'border-slate-600 bg-slate-700 text-gray-100 focus:ring-indigo-400 focus:border-indigo-400' 
                        : 'border-gray-300 bg-white text-gray-900'"
                      placeholder="What are their greatest pain points? What causes them the most frustration?"
                    ></textarea>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      How They Described Their Needs
                    </label>
                    <textarea
                      v-model="form.howTheyDescribedNeeds"
                      rows="3"
                      class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      :class="isDarkMode 
                        ? 'border-slate-600 bg-slate-700 text-gray-100 focus:ring-indigo-400 focus:border-indigo-400' 
                        : 'border-gray-300 bg-white text-gray-900'"
                      placeholder="How did they describe their needs? What did they say they need?"
                    ></textarea>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Current Experience
                    </label>
                    <textarea
                      v-model="form.currentExperience"
                      rows="3"
                      class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      :class="isDarkMode 
                        ? 'border-slate-600 bg-slate-700 text-gray-100 focus:ring-indigo-400 focus:border-indigo-400' 
                        : 'border-gray-300 bg-white text-gray-900'"
                      placeholder="What is their current experience? How do they currently interact with similar products or services?"
                    ></textarea>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex justify-end gap-4">
                  <button
                    type="button"
                    @click="resetForm"
                    class="px-6 py-2 border rounded-lg font-medium transition-colors"
                    :class="isDarkMode 
                      ? 'border-slate-600 text-gray-300 hover:bg-slate-800' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    @click="generatePersona"
                    class="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                    :class="isDarkMode ? 'bg-indigo-500 hover:bg-indigo-400' : ''"
                  >
                    Generate Persona
                  </button>
                  <button
                    v-if="personaGenerated"
                    type="button"
                    @click="exportPersona"
                    class="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                    :class="isDarkMode ? 'bg-green-500 hover:bg-green-400' : ''"
                  >
                    Export Persona
                  </button>
                </div>
              </form>
            </div>

            <!-- Generated Persona Preview -->
            <div 
              v-if="personaGenerated"
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-gray-200' : 'text-gray-900'">
                  Generated Persona
                </h3>
                <button
                  @click="exportPersona"
                  class="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  :class="isDarkMode ? 'bg-indigo-500 hover:bg-indigo-400' : ''"
                >
                  Export
                </button>
              </div>
              
              <div class="prose max-w-none" :class="isDarkMode ? 'prose-invert' : ''">
                <div class="persona-preview" v-html="generatedPersonaHTML"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';

const drawerOpen = ref(false);
const isDarkMode = ref(false);
const personaGenerated = ref(false);

const form = reactive({
  name: '',
  howTheySeeThemselves: '',
  greatEnablers: '',
  greatestPainPoints: '',
  howTheyDescribedNeeds: '',
  currentExperience: ''
});

const generatedPersonaHTML = computed(() => {
  if (!personaGenerated.value) return '';
  
  return `
    <div class="persona-card">
      <div class="persona-header mb-6">
        <h2 class="text-3xl font-bold mb-2">${form.name || 'Persona Name'}</h2>
      </div>
      
      ${form.howTheySeeThemselves ? `
        <div class="mb-6">
          <h3 class="text-xl font-semibold mb-2">How They See Themselves</h3>
          <p>${form.howTheySeeThemselves}</p>
        </div>
      ` : ''}
      
      ${form.greatEnablers ? `
        <div class="mb-6">
          <h3 class="text-xl font-semibold mb-2">Great Enablers</h3>
          <p>${form.greatEnablers}</p>
        </div>
      ` : ''}
      
      ${form.greatestPainPoints ? `
        <div class="mb-6">
          <h3 class="text-xl font-semibold mb-2">Greatest Pain Points</h3>
          <p>${form.greatestPainPoints}</p>
        </div>
      ` : ''}
      
      ${form.howTheyDescribedNeeds ? `
        <div class="mb-6">
          <h3 class="text-xl font-semibold mb-2">How They Described Their Needs</h3>
          <p>${form.howTheyDescribedNeeds}</p>
        </div>
      ` : ''}
      
      ${form.currentExperience ? `
        <div class="mb-6">
          <h3 class="text-xl font-semibold mb-2">Current Experience</h3>
          <p>${form.currentExperience}</p>
        </div>
      ` : ''}
    </div>
  `;
});

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

const resetForm = () => {
  Object.keys(form).forEach(key => {
    form[key] = '';
  });
  personaGenerated.value = false;
};

const generatePersona = () => {
  if (!form.name) {
    alert('Please enter at least a persona name.');
    return;
  }
  personaGenerated.value = true;
};

const exportPersona = () => {
  // Create a formatted text version
  let text = `USER PERSONA\n`;
  text += `============\n\n`;
  text += `Name: ${form.name}\n\n`;
  
  if (form.howTheySeeThemselves) {
    text += `How They See Themselves:\n${form.howTheySeeThemselves}\n\n`;
  }
  
  if (form.greatEnablers) {
    text += `Great Enablers:\n${form.greatEnablers}\n\n`;
  }
  
  if (form.greatestPainPoints) {
    text += `Greatest Pain Points:\n${form.greatestPainPoints}\n\n`;
  }
  
  if (form.howTheyDescribedNeeds) {
    text += `How They Described Their Needs:\n${form.howTheyDescribedNeeds}\n\n`;
  }
  
  if (form.currentExperience) {
    text += `Current Experience:\n${form.currentExperience}\n`;
  }
  
  // Create and download file
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${form.name.replace(/\s+/g, '_')}_Persona.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
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

.persona-preview :deep(h2) {
  margin-top: 0;
}

.persona-preview :deep(h3) {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

.persona-preview :deep(ul) {
  list-style-type: disc;
  padding-left: 1.5em;
}

.persona-preview :deep(blockquote) {
  border-left: 4px solid #6366f1;
  padding-left: 1em;
  margin: 1em 0;
  font-style: italic;
}
</style>

