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
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    
                    <div>
                      <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        Age Range
                      </label>
                      <input
                        v-model="form.age"
                        type="text"
                        class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        :class="isDarkMode 
                          ? 'border-slate-600 bg-slate-700 text-gray-100 focus:ring-indigo-400 focus:border-indigo-400' 
                          : 'border-gray-300 bg-white text-gray-900'"
                        placeholder="e.g., 28-35"
                      />
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        Occupation
                      </label>
                      <input
                        v-model="form.occupation"
                        type="text"
                        class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        :class="isDarkMode 
                          ? 'border-slate-600 bg-slate-700 text-gray-100 focus:ring-indigo-400 focus:border-indigo-400' 
                          : 'border-gray-300 bg-white text-gray-900'"
                        placeholder="e.g., Marketing Manager"
                      />
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        Location
                      </label>
                      <input
                        v-model="form.location"
                        type="text"
                        class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        :class="isDarkMode 
                          ? 'border-slate-600 bg-slate-700 text-gray-100 focus:ring-indigo-400 focus:border-indigo-400' 
                          : 'border-gray-300 bg-white text-gray-900'"
                        placeholder="e.g., San Francisco, CA"
                      />
                    </div>
                  </div>
                </div>

                <!-- Demographics -->
                <div class="space-y-4">
                  <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-gray-200' : 'text-gray-900'">
                    Demographics & Background
                  </h3>
                  
                  <div>
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Education
                    </label>
                    <input
                      v-model="form.education"
                      type="text"
                      class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      :class="isDarkMode 
                        ? 'border-slate-600 bg-slate-700 text-gray-100 focus:ring-indigo-400 focus:border-indigo-400' 
                        : 'border-gray-300 bg-white text-gray-900'"
                      placeholder="e.g., Bachelor's in Business Administration"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Family Status
                    </label>
                    <input
                      v-model="form.familyStatus"
                      type="text"
                      class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      :class="isDarkMode 
                        ? 'border-slate-600 bg-slate-700 text-gray-100 focus:ring-indigo-400 focus:border-indigo-400' 
                        : 'border-gray-300 bg-white text-gray-900'"
                      placeholder="e.g., Married, 2 children"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Income Level
                    </label>
                    <input
                      v-model="form.income"
                      type="text"
                      class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      :class="isDarkMode 
                        ? 'border-slate-600 bg-slate-700 text-gray-100 focus:ring-indigo-400 focus:border-indigo-400' 
                        : 'border-gray-300 bg-white text-gray-900'"
                      placeholder="e.g., $75,000 - $100,000"
                    />
                  </div>
                </div>

                <!-- Goals & Motivations -->
                <div class="space-y-4">
                  <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-gray-200' : 'text-gray-900'">
                    Goals & Motivations
                  </h3>
                  
                  <div>
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Primary Goals
                    </label>
                    <textarea
                      v-model="form.goals"
                      rows="3"
                      class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      :class="isDarkMode 
                        ? 'border-slate-600 bg-slate-700 text-gray-100 focus:ring-indigo-400 focus:border-indigo-400' 
                        : 'border-gray-300 bg-white text-gray-900'"
                      placeholder="What are their primary goals? What are they trying to achieve?"
                    ></textarea>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Motivations
                    </label>
                    <textarea
                      v-model="form.motivations"
                      rows="3"
                      class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      :class="isDarkMode 
                        ? 'border-slate-600 bg-slate-700 text-gray-100 focus:ring-indigo-400 focus:border-indigo-400' 
                        : 'border-gray-300 bg-white text-gray-900'"
                      placeholder="What motivates them? What drives their decisions?"
                    ></textarea>
                  </div>
                </div>

                <!-- Pain Points & Frustrations -->
                <div class="space-y-4">
                  <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-gray-200' : 'text-gray-900'">
                    Pain Points & Frustrations
                  </h3>
                  
                  <div>
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Pain Points
                    </label>
                    <textarea
                      v-model="form.painPoints"
                      rows="3"
                      class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      :class="isDarkMode 
                        ? 'border-slate-600 bg-slate-700 text-gray-100 focus:ring-indigo-400 focus:border-indigo-400' 
                        : 'border-gray-300 bg-white text-gray-900'"
                      placeholder="What challenges do they face? What frustrates them?"
                    ></textarea>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Current Solutions
                    </label>
                    <textarea
                      v-model="form.currentSolutions"
                      rows="2"
                      class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      :class="isDarkMode 
                        ? 'border-slate-600 bg-slate-700 text-gray-100 focus:ring-indigo-400 focus:border-indigo-400' 
                        : 'border-gray-300 bg-white text-gray-900'"
                      placeholder="How do they currently solve these problems?"
                    ></textarea>
                  </div>
                </div>

                <!-- Behaviors & Preferences -->
                <div class="space-y-4">
                  <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-gray-200' : 'text-gray-900'">
                    Behaviors & Preferences
                  </h3>
                  
                  <div>
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Technology Comfort Level
                    </label>
                    <Dropdown
                      v-model="form.techComfort"
                      :options="techComfortOptions"
                      placeholder="Select comfort level"
                      class="w-full"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Preferred Communication Channels
                    </label>
                    <textarea
                      v-model="form.communicationChannels"
                      rows="2"
                      class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      :class="isDarkMode 
                        ? 'border-slate-600 bg-slate-700 text-gray-100 focus:ring-indigo-400 focus:border-indigo-400' 
                        : 'border-gray-300 bg-white text-gray-900'"
                      placeholder="e.g., Email, Slack, Phone calls"
                    ></textarea>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Typical Day / Routine
                    </label>
                    <textarea
                      v-model="form.typicalDay"
                      rows="3"
                      class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      :class="isDarkMode 
                        ? 'border-slate-600 bg-slate-700 text-gray-100 focus:ring-indigo-400 focus:border-indigo-400' 
                        : 'border-gray-300 bg-white text-gray-900'"
                      placeholder="Describe their typical day or routine..."
                    ></textarea>
                  </div>
                </div>

                <!-- Quote & Bio -->
                <div class="space-y-4">
                  <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-gray-200' : 'text-gray-900'">
                    Quote & Bio
                  </h3>
                  
                  <div>
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Representative Quote
                    </label>
                    <textarea
                      v-model="form.quote"
                      rows="2"
                      class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      :class="isDarkMode 
                        ? 'border-slate-600 bg-slate-700 text-gray-100 focus:ring-indigo-400 focus:border-indigo-400' 
                        : 'border-gray-300 bg-white text-gray-900'"
                      placeholder="A quote that represents this persona's perspective..."
                    ></textarea>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Bio / Summary
                    </label>
                    <textarea
                      v-model="form.bio"
                      rows="4"
                      class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      :class="isDarkMode 
                        ? 'border-slate-600 bg-slate-700 text-gray-100 focus:ring-indigo-400 focus:border-indigo-400' 
                        : 'border-gray-300 bg-white text-gray-900'"
                      placeholder="A brief summary or bio of this persona..."
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
import Dropdown from '../components/Dropdown.vue';

const drawerOpen = ref(false);
const isDarkMode = ref(false);
const personaGenerated = ref(false);

const techComfortOptions = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' }
];

const form = reactive({
  name: '',
  age: '',
  occupation: '',
  location: '',
  education: '',
  familyStatus: '',
  income: '',
  goals: '',
  motivations: '',
  painPoints: '',
  currentSolutions: '',
  techComfort: '',
  communicationChannels: '',
  typicalDay: '',
  quote: '',
  bio: ''
});

const generatedPersonaHTML = computed(() => {
  if (!personaGenerated.value) return '';
  
  return `
    <div class="persona-card">
      <div class="persona-header mb-6">
        <h2 class="text-3xl font-bold mb-2">${form.name || 'Persona Name'}</h2>
        ${form.occupation ? `<p class="text-xl text-gray-600 dark:text-gray-400">${form.occupation}</p>` : ''}
      </div>
      
      ${form.quote ? `
        <blockquote class="border-l-4 border-indigo-500 pl-4 py-2 mb-6 italic text-lg">
          "${form.quote}"
        </blockquote>
      ` : ''}
      
      ${form.bio ? `
        <div class="mb-6">
          <h3 class="text-xl font-semibold mb-2">About</h3>
          <p>${form.bio}</p>
        </div>
      ` : ''}
      
      <div class="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 class="text-xl font-semibold mb-3">Demographics</h3>
          <ul class="space-y-2">
            ${form.age ? `<li><strong>Age:</strong> ${form.age}</li>` : ''}
            ${form.location ? `<li><strong>Location:</strong> ${form.location}</li>` : ''}
            ${form.education ? `<li><strong>Education:</strong> ${form.education}</li>` : ''}
            ${form.familyStatus ? `<li><strong>Family:</strong> ${form.familyStatus}</li>` : ''}
            ${form.income ? `<li><strong>Income:</strong> ${form.income}</li>` : ''}
          </ul>
        </div>
        
        <div>
          <h3 class="text-xl font-semibold mb-3">Behaviors</h3>
          <ul class="space-y-2">
            ${form.techComfort ? `<li><strong>Tech Comfort:</strong> ${techComfortOptions.find(o => o.value === form.techComfort)?.label || form.techComfort}</li>` : ''}
            ${form.communicationChannels ? `<li><strong>Communication:</strong> ${form.communicationChannels}</li>` : ''}
          </ul>
        </div>
      </div>
      
      ${form.goals ? `
        <div class="mb-6">
          <h3 class="text-xl font-semibold mb-2">Goals</h3>
          <p>${form.goals}</p>
        </div>
      ` : ''}
      
      ${form.motivations ? `
        <div class="mb-6">
          <h3 class="text-xl font-semibold mb-2">Motivations</h3>
          <p>${form.motivations}</p>
        </div>
      ` : ''}
      
      ${form.painPoints ? `
        <div class="mb-6">
          <h3 class="text-xl font-semibold mb-2">Pain Points</h3>
          <p>${form.painPoints}</p>
        </div>
      ` : ''}
      
      ${form.currentSolutions ? `
        <div class="mb-6">
          <h3 class="text-xl font-semibold mb-2">Current Solutions</h3>
          <p>${form.currentSolutions}</p>
        </div>
      ` : ''}
      
      ${form.typicalDay ? `
        <div class="mb-6">
          <h3 class="text-xl font-semibold mb-2">Typical Day</h3>
          <p>${form.typicalDay}</p>
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
  text += `Name: ${form.name}\n`;
  if (form.occupation) text += `Occupation: ${form.occupation}\n`;
  if (form.age) text += `Age: ${form.age}\n`;
  if (form.location) text += `Location: ${form.location}\n\n`;
  
  if (form.quote) {
    text += `Quote: "${form.quote}"\n\n`;
  }
  
  if (form.bio) {
    text += `About:\n${form.bio}\n\n`;
  }
  
  text += `Demographics:\n`;
  if (form.education) text += `- Education: ${form.education}\n`;
  if (form.familyStatus) text += `- Family: ${form.familyStatus}\n`;
  if (form.income) text += `- Income: ${form.income}\n\n`;
  
  if (form.goals) {
    text += `Goals:\n${form.goals}\n\n`;
  }
  
  if (form.motivations) {
    text += `Motivations:\n${form.motivations}\n\n`;
  }
  
  if (form.painPoints) {
    text += `Pain Points:\n${form.painPoints}\n\n`;
  }
  
  if (form.currentSolutions) {
    text += `Current Solutions:\n${form.currentSolutions}\n\n`;
  }
  
  if (form.techComfort) {
    text += `Technology Comfort: ${techComfortOptions.find(o => o.value === form.techComfort)?.label || form.techComfort}\n`;
  }
  
  if (form.communicationChannels) {
    text += `Communication Channels: ${form.communicationChannels}\n`;
  }
  
  if (form.typicalDay) {
    text += `\nTypical Day:\n${form.typicalDay}\n`;
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

