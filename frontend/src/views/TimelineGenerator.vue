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
                      Interactive Timeline Generator
                    </h1>
                  </div>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-4">
                    Create beautiful, customizable timelines with events, dates, and icons. Generate React or Vue components with interactive timeline displays.
                  </p>
                  <div class="flex items-center gap-4 text-sm text-white/70">
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">timeline</span>
                      Data Visualization
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
                        <linearGradient id="timelineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Timeline representation -->
                      <line x1="30" y1="100" x2="170" y2="100" stroke="url(#timelineGradient)" stroke-width="4" opacity="0.6"/>
                      <circle cx="50" cy="100" r="8" fill="url(#timelineGradient)" opacity="0.8"/>
                      <circle cx="100" cy="100" r="8" fill="url(#timelineGradient)" opacity="0.8"/>
                      <circle cx="150" cy="100" r="8" fill="url(#timelineGradient)" opacity="0.8"/>
                      <rect x="45" y="70" width="10" height="20" rx="2" fill="url(#timelineGradient)" opacity="0.5"/>
                      <rect x="95" y="70" width="10" height="20" rx="2" fill="url(#timelineGradient)" opacity="0.5"/>
                      <rect x="145" y="70" width="10" height="20" rx="2" fill="url(#timelineGradient)" opacity="0.5"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Main Content -->
          <div class="max-w-7xl mx-auto">
            <!-- Style Selector -->
            <div 
              class="rounded-lg shadow-sm border p-6 mb-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h2 class="text-lg font-semibold mb-6 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">tune</span>
                Timeline Style
              </h2>
              
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  v-for="style in timelineStyles"
                  :key="style.value"
                  @click="config.style = style.value"
                  class="rounded-lg border p-4 transition-all text-left"
                  :class="config.style === style.value
                    ? (isDarkMode 
                      ? 'bg-indigo-600 border-indigo-500 text-white' 
                      : 'bg-indigo-600 border-indigo-500 text-white')
                    : (isDarkMode
                      ? 'bg-slate-800 border-gray-700 text-gray-300 hover:border-indigo-400' 
                      : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-500')"
                >
                  <div class="flex items-center gap-3 mb-2">
                    <span class="material-symbols-outlined text-2xl">{{ style.icon }}</span>
                    <span class="font-semibold">{{ style.label }}</span>
                  </div>
                  <p class="text-xs opacity-80">{{ style.description }}</p>
                </button>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <!-- Configuration Panel -->
              <div class="lg:col-span-1">
                <div 
                  class="rounded-lg shadow-sm border p-6 mb-6 sticky top-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <h2 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    <span class="material-symbols-outlined text-indigo-600">settings</span>
                    Configuration
                  </h2>

                  <!-- Timeline Color -->
                  <div class="mb-4">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Timeline Color
                    </label>
                    <div class="flex gap-2">
                      <input
                        v-model="config.timelineColor"
                        type="color"
                        class="w-16 h-10 rounded border cursor-pointer"
                        :class="isDarkMode ? 'border-gray-600' : 'border-gray-300'"
                      />
                      <input
                        v-model="config.timelineColor"
                        type="text"
                        placeholder="#6366f1"
                        class="flex-1 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors font-mono text-sm"
                        :class="isDarkMode 
                          ? 'bg-slate-800 border-gray-600 text-white placeholder-gray-500' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                      />
                    </div>
                  </div>

                  <!-- Date Format -->
                  <div class="mb-4">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Date Format
                    </label>
                    <select
                      v-model="config.dateFormat"
                      class="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                      :class="isDarkMode 
                        ? 'bg-slate-800 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'"
                    >
                      <option value="short">Short (1/1/2024)</option>
                      <option value="medium">Medium (Jan 1, 2024)</option>
                      <option value="long">Long (January 1, 2024)</option>
                      <option value="full">Full (Monday, January 1, 2024)</option>
                    </select>
                  </div>

                  <!-- Spacing -->
                  <div class="mb-6">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Event Spacing: {{ config.spacing }}px
                    </label>
                    <input
                      v-model.number="config.spacing"
                      type="range"
                      min="40"
                      max="200"
                      step="10"
                      class="w-full h-2 rounded-lg appearance-none cursor-pointer"
                      :class="isDarkMode ? 'bg-slate-700 accent-indigo-500' : 'bg-gray-200 accent-indigo-600'"
                    />
                  </div>

                  <!-- Events Section -->
                  <div class="mb-4">
                    <div class="flex items-center justify-between mb-3">
                      <label class="block text-sm font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        Events ({{ events.length }})
                      </label>
                      <button
                        @click="addEvent"
                        class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                        :class="isDarkMode 
                          ? 'bg-indigo-500 text-white hover:bg-indigo-400' 
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'"
                      >
                        <span class="material-symbols-outlined text-sm mr-1 align-middle">add</span>
                        Add Event
                      </button>
                    </div>

                    <div class="space-y-3 max-h-96 overflow-y-auto">
                      <div
                        v-for="(event, index) in events"
                        :key="index"
                        class="border rounded-lg p-3"
                        :class="isDarkMode ? 'border-gray-700 bg-slate-800' : 'border-gray-200 bg-gray-50'"
                      >
                        <div class="flex items-center justify-between mb-2">
                          <span class="text-xs font-medium" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
                            Event {{ index + 1 }}
                          </span>
                          <button
                            @click="removeEvent(index)"
                            class="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            :disabled="events.length <= 1"
                          >
                            <span class="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>

                        <div class="space-y-2">
                          <input
                            v-model="event.date"
                            type="date"
                            class="w-full px-3 py-2 rounded border text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                            :class="isDarkMode 
                              ? 'bg-slate-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'"
                          />
                          <input
                            v-model="event.title"
                            type="text"
                            placeholder="Event title"
                            class="w-full px-3 py-2 rounded border text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                            :class="isDarkMode 
                              ? 'bg-slate-700 border-gray-600 text-white placeholder-gray-500' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                          />
                          <textarea
                            v-model="event.description"
                            placeholder="Event description"
                            rows="2"
                            class="w-full px-3 py-2 rounded border text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors resize-none"
                            :class="isDarkMode 
                              ? 'bg-slate-700 border-gray-600 text-white placeholder-gray-500' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                          ></textarea>
                          <div class="flex gap-2">
                            <select
                              v-model="event.icon"
                              class="flex-1 px-3 py-2 rounded border text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                              :class="isDarkMode 
                                ? 'bg-slate-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'"
                            >
                              <option value="">No Icon</option>
                              <option value="event">Event</option>
                              <option value="star">Star</option>
                              <option value="check_circle">Check</option>
                              <option value="flag">Flag</option>
                              <option value="location_on">Location</option>
                            </select>
                            <input
                              v-model="event.color"
                              type="color"
                              class="w-12 h-10 rounded border cursor-pointer"
                              :class="isDarkMode ? 'border-gray-600' : 'border-gray-300'"
                            />
                          </div>
                          <div v-if="config.style === 'zigzag'" class="flex gap-2">
                            <label class="flex items-center gap-2 cursor-pointer text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                              <input
                                v-model="event.position"
                                type="radio"
                                :value="'left'"
                                class="w-4 h-4"
                                :class="isDarkMode ? 'accent-indigo-500' : 'accent-indigo-600'"
                              />
                              Left
                            </label>
                            <label class="flex items-center gap-2 cursor-pointer text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                              <input
                                v-model="event.position"
                                type="radio"
                                :value="'right'"
                                class="w-4 h-4"
                                :class="isDarkMode ? 'accent-indigo-500' : 'accent-indigo-600'"
                              />
                              Right
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Preview and Export Panel -->
              <div class="lg:col-span-2">
                <!-- Preview Section -->
                <div 
                  class="rounded-lg shadow-sm border p-6 mb-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <h2 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    <span class="material-symbols-outlined text-indigo-600">preview</span>
                    Preview
                  </h2>
                  
                  <div class="p-8 rounded-lg overflow-x-auto"
                    :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'"
                  >
                    <div 
                      ref="timelinePreview" 
                      class="timeline-container"
                      :style="{
                        '--spacing': `${config.spacing}px`,
                        '--timeline-color': config.timelineColor
                      }"
                    >
                      <!-- Timeline will be rendered here -->
                      <div v-if="config.style === 'vertical'" class="timeline-vertical">
                        <div
                          v-for="(event, index) in sortedEvents"
                          :key="index"
                          class="timeline-event-vertical"
                          :style="{ marginBottom: index < sortedEvents.length - 1 ? `${config.spacing}px` : '0' }"
                        >
                          <div class="timeline-marker-vertical" :style="{ backgroundColor: event.color || config.timelineColor }">
                            <span v-if="event.icon" class="material-symbols-outlined text-sm text-white">
                              {{ getIconName(event.icon) }}
                            </span>
                          </div>
                          <div class="timeline-content-vertical">
                            <div class="timeline-date-vertical" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                              {{ formatDate(event.date) }}
                            </div>
                            <div class="timeline-title-vertical font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                              {{ event.title || 'Event ' + (index + 1) }}
                            </div>
                            <div v-if="event.description" class="timeline-description-vertical" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                              {{ event.description }}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div v-else-if="config.style === 'horizontal'" class="timeline-horizontal">
                        <div class="timeline-line-horizontal" :style="{ backgroundColor: config.timelineColor }"></div>
                        <div class="timeline-events-horizontal">
                          <div
                            v-for="(event, index) in sortedEvents"
                            :key="index"
                            class="timeline-event-horizontal"
                            :style="{ left: `${(index / (sortedEvents.length - 1 || 1)) * 100}%` }"
                          >
                            <div class="timeline-marker-horizontal" :style="{ backgroundColor: event.color || config.timelineColor }">
                              <span v-if="event.icon" class="material-symbols-outlined text-xs text-white">
                                {{ getIconName(event.icon) }}
                              </span>
                            </div>
                            <div class="timeline-content-horizontal">
                              <div class="timeline-date-horizontal text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                                {{ formatDate(event.date) }}
                              </div>
                              <div class="timeline-title-horizontal font-semibold text-sm" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                                {{ event.title || 'Event ' + (index + 1) }}
                              </div>
                              <div v-if="event.description" class="timeline-description-horizontal text-xs" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                                {{ event.description }}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div v-else-if="config.style === 'zigzag'" class="timeline-zigzag">
                        <div class="timeline-line-zigzag" :style="{ backgroundColor: config.timelineColor }"></div>
                        <div
                          v-for="(event, index) in sortedEvents"
                          :key="index"
                          class="timeline-event-zigzag"
                          :class="event.position === 'right' ? 'timeline-event-right' : 'timeline-event-left'"
                          :style="{ marginBottom: index < sortedEvents.length - 1 ? `${config.spacing}px` : '0' }"
                        >
                          <div class="timeline-marker-zigzag" :style="{ backgroundColor: event.color || config.timelineColor }">
                            <span v-if="event.icon" class="material-symbols-outlined text-sm text-white">
                              {{ getIconName(event.icon) }}
                            </span>
                          </div>
                          <div class="timeline-content-zigzag" :class="event.position === 'right' ? 'timeline-content-right' : 'timeline-content-left'">
                            <div class="timeline-date-zigzag text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                              {{ formatDate(event.date) }}
                            </div>
                            <div class="timeline-title-zigzag font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                              {{ event.title || 'Event ' + (index + 1) }}
                            </div>
                            <div v-if="event.description" class="timeline-description-zigzag text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                              {{ event.description }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Export Section -->
                <div 
                  class="rounded-lg shadow-sm border p-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <h2 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    <span class="material-symbols-outlined text-indigo-600">download</span>
                    Export
                  </h2>

                  <div class="space-y-4">
                    <!-- Export Format Selector -->
                    <div>
                      <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        Export Format
                      </label>
                      <div class="flex gap-2">
                        <button
                          v-for="format in exportFormats"
                          :key="format.value"
                          @click="selectedExportFormat = format.value"
                          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          :class="selectedExportFormat === format.value
                            ? (isDarkMode 
                              ? 'bg-indigo-600 text-white' 
                              : 'bg-indigo-600 text-white')
                            : (isDarkMode
                              ? 'bg-slate-800 text-gray-300 hover:bg-slate-700' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200')"
                        >
                          {{ format.label }}
                        </button>
                      </div>
                    </div>

                    <!-- Code Preview -->
                    <div>
                      <div class="flex items-center justify-between mb-2">
                        <label class="block text-sm font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                          Generated Code
                        </label>
                        <button
                          @click="copyCode"
                          class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                          :class="isDarkMode 
                            ? 'bg-indigo-500 text-white hover:bg-indigo-400' 
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'"
                        >
                          <span class="material-symbols-outlined text-sm mr-1 align-middle">content_copy</span>
                          Copy
                        </button>
                      </div>
                      <textarea
                        :value="generatedCode"
                        readonly
                        class="w-full h-64 px-4 py-3 border rounded-lg font-mono text-sm resize-none"
                        :class="isDarkMode 
                          ? 'bg-slate-950 text-gray-100 border-gray-700' 
                          : 'bg-gray-50 text-gray-900 border-gray-300'"
                      ></textarea>
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
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const timelinePreview = ref(null);

const timelineStyles = [
  { label: 'Vertical', value: 'vertical', icon: 'vertical_align_center', description: 'Events stacked vertically' },
  { label: 'Horizontal', value: 'horizontal', icon: 'horizontal_rule', description: 'Events in a horizontal line' },
  { label: 'Zigzag', value: 'zigzag', icon: 'timeline', description: 'Alternating left/right layout' }
];

const exportFormats = [
  { label: 'React', value: 'react' },
  { label: 'Vue', value: 'vue' },
  { label: 'SVG', value: 'svg' }
];

const config = ref({
  style: 'vertical',
  timelineColor: '#6366f1',
  dateFormat: 'medium',
  spacing: 80
});

const events = ref([
  {
    date: new Date().toISOString().split('T')[0],
    title: 'Project Start',
    description: 'Initial project kickoff',
    icon: 'event',
    color: '#6366f1',
    position: 'left'
  },
  {
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    title: 'Milestone 1',
    description: 'First major milestone achieved',
    icon: 'star',
    color: '#10b981',
    position: 'right'
  }
]);

const selectedExportFormat = ref('react');

const sortedEvents = computed(() => {
  return [...events.value].sort((a, b) => {
    return new Date(a.date) - new Date(b.date);
  });
});

const getIconName = (icon) => {
  const iconMap = {
    event: 'event',
    star: 'star',
    check_circle: 'check_circle',
    flag: 'flag',
    location_on: 'location_on'
  };
  return iconMap[icon] || 'event';
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const format = config.value.dateFormat;
  
  const options = {
    short: { month: 'numeric', day: 'numeric', year: 'numeric' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { month: 'long', day: 'numeric', year: 'numeric' },
    full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
  };
  
  return date.toLocaleDateString('en-US', options[format] || options.medium);
};

const addEvent = () => {
  events.value.push({
    date: new Date().toISOString().split('T')[0],
    title: '',
    description: '',
    icon: '',
    color: '#6366f1',
    position: 'left'
  });
};

const removeEvent = (index) => {
  if (events.value.length > 1) {
    events.value.splice(index, 1);
  }
};

const generatedCode = computed(() => {
  const eventsData = sortedEvents.value.map(e => ({
    date: e.date,
    title: e.title || 'Event',
    description: e.description || '',
    icon: e.icon || '',
    color: e.color || config.value.timelineColor
  }));
  
  if (selectedExportFormat.value === 'react') {
    return `import React from 'react';

export interface TimelineEvent {
  date: string;
  title: string;
  description?: string;
  icon?: string;
  color?: string;
  position?: 'left' | 'right';
}

export interface TimelineProps {
  events: TimelineEvent[];
  style?: 'vertical' | 'horizontal' | 'zigzag';
  timelineColor?: string;
  dateFormat?: 'short' | 'medium' | 'long' | 'full';
  spacing?: number;
}

export const Timeline: React.FC<TimelineProps> = ({
  events = ${JSON.stringify(eventsData, null, 2)},
  style = '${config.value.style}',
  timelineColor = '${config.value.timelineColor}',
  dateFormat = '${config.value.dateFormat}',
  spacing = ${config.value.spacing}
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options = {
      short: { month: 'numeric', day: 'numeric', year: 'numeric' },
      medium: { month: 'short', day: 'numeric', year: 'numeric' },
      long: { month: 'long', day: 'numeric', year: 'numeric' },
      full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
    };
    return date.toLocaleDateString('en-US', options[dateFormat] || options.medium);
  };

  const iconMap: Record<string, string> = {
    event: 'event',
    star: 'star',
    check_circle: 'check_circle',
    flag: 'flag',
    location_on: 'location_on'
  };

  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (style === 'vertical') {
    return (
      <div className="timeline-vertical">
        {sortedEvents.map((event, index) => (
          <div key={index} className="flex gap-4" style={{ marginBottom: index < sortedEvents.length - 1 ? \`\${spacing}px\` : '0' }}>
            <div className="flex flex-col items-center">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: event.color || timelineColor }}
              >
                {event.icon && <span className="material-symbols-outlined text-sm">{iconMap[event.icon] || 'event'}</span>}
              </div>
              {index < sortedEvents.length - 1 && (
                <div className="flex-1 w-0.5 my-2" style={{ backgroundColor: timelineColor }}></div>
              )}
            </div>
            <div className="flex-1 pb-4">
              <div className="text-sm text-gray-600 mb-1">{formatDate(event.date)}</div>
              <div className="font-semibold text-lg mb-1">{event.title}</div>
              {event.description && <div className="text-sm text-gray-700">{event.description}</div>}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Add horizontal and zigzag implementations...
  return <div>Timeline ({style})</div>;
};`;
  } else if (selectedExportFormat.value === 'vue') {
    const templateTag = String.fromCharCode(60) + 'template' + String.fromCharCode(62);
    const templateCloseTag = String.fromCharCode(60) + '/' + 'template' + String.fromCharCode(62);
    const scriptSetupTag = String.fromCharCode(60) + 'script setup' + String.fromCharCode(62);
    const scriptClose = String.fromCharCode(60) + '/' + 'script' + String.fromCharCode(62);
    
    return templateTag + `
  <div class="timeline-${config.value.style}">
    <div
      v-for="(event, index) in sortedEvents"
      :key="index"
      class="timeline-event"
    >
      <!-- Timeline event content -->
    </div>
  </div>
` + templateCloseTag + `

` + scriptSetupTag + `
import { computed } from 'vue';

const props = defineProps({
  events: {
    type: Array,
    default: () => ${JSON.stringify(eventsData, null, 4)}
  },
  style: {
    type: String,
    default: '${config.value.style}'
  },
  timelineColor: {
    type: String,
    default: '${config.value.timelineColor}'
  }
});

const sortedEvents = computed(() => {
  return [...props.events].sort((a, b) => new Date(a.date) - new Date(b.date));
});
` + scriptClose;
  } else {
    // SVG export
    return `<!-- SVG Timeline would be generated here -->`;
  }
});

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(generatedCode.value);
  } catch (error) {
    console.error('Copy failed:', error);
  }
};

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

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

/* Vertical Timeline Styles */
.timeline-vertical {
  position: relative;
  padding-left: 2rem;
}

.timeline-event-vertical {
  display: flex;
  gap: 1rem;
  position: relative;
}

.timeline-marker-vertical {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
}

.timeline-event-vertical:not(:last-child) .timeline-marker-vertical::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: calc(var(--spacing, 80px) - 3rem);
  background-color: var(--timeline-color, #6366f1);
}

.timeline-content-vertical {
  flex: 1;
  padding-bottom: 1rem;
}

.timeline-date-vertical {
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.timeline-title-vertical {
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
}

.timeline-description-vertical {
  font-size: 0.875rem;
  line-height: 1.5;
}

/* Horizontal Timeline Styles */
.timeline-horizontal {
  position: relative;
  padding: 2rem 0;
  min-height: 200px;
}

.timeline-line-horizontal {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 4px;
  transform: translateY(-50%);
}

.timeline-events-horizontal {
  position: relative;
  display: flex;
  justify-content: space-between;
}

.timeline-event-horizontal {
  position: absolute;
  top: 0;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 150px;
}

.timeline-marker-horizontal {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
  margin-bottom: 0.5rem;
}

.timeline-content-horizontal {
  text-align: center;
  margin-top: 0.5rem;
}

.timeline-date-horizontal {
  margin-bottom: 0.25rem;
}

.timeline-title-horizontal {
  margin-bottom: 0.25rem;
}

.timeline-description-horizontal {
  line-height: 1.4;
}

/* Zigzag Timeline Styles */
.timeline-zigzag {
  position: relative;
  padding: 2rem 0;
}

.timeline-line-zigzag {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 4px;
  transform: translateX(-50%);
}

.timeline-event-zigzag {
  position: relative;
  display: flex;
  align-items: flex-start;
  min-height: 100px;
}

.timeline-event-left {
  flex-direction: row;
}

.timeline-event-right {
  flex-direction: row-reverse;
}

.timeline-marker-zigzag {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
  margin: 0 1rem;
}

.timeline-content-zigzag {
  flex: 1;
  max-width: 45%;
  padding: 0.75rem;
  border-radius: 0.5rem;
  background-color: var(--bg-color, rgba(255, 255, 255, 0.1));
}

.timeline-content-left {
  text-align: left;
}

.timeline-content-right {
  text-align: right;
}

.timeline-date-zigzag {
  margin-bottom: 0.25rem;
}

.timeline-title-zigzag {
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.timeline-description-zigzag {
  line-height: 1.5;
}
</style>

