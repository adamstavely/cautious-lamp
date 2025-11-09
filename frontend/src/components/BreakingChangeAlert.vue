<template>
  <div 
    v-if="shouldShow"
    class="max-w-7xl mx-auto mb-8"
  >
    <div 
      class="rounded-lg border-2 p-6 relative overflow-hidden"
      :class="isDarkMode 
        ? 'bg-red-950/20 border-red-500/50' 
        : 'bg-red-50 border-red-500'"
    >
      <!-- Background pattern -->
      <div class="absolute inset-0 opacity-5">
        <div class="absolute inset-0" style="background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 20px);"></div>
      </div>
      
      <div class="relative z-10">
        <div class="flex items-start gap-4">
          <div class="flex-shrink-0">
            <span class="material-symbols-outlined text-4xl" :class="isDarkMode ? 'text-red-400' : 'text-red-600'">
              warning
            </span>
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <h3 class="text-xl font-bold" :class="isDarkMode ? 'text-red-300' : 'text-red-900'">
                Breaking Changes Detected
              </h3>
              <span 
                class="px-2 py-1 rounded text-xs font-semibold"
                :class="isDarkMode ? 'bg-red-900/50 text-red-200' : 'bg-red-600 text-white'"
              >
                {{ breakingChangesCount }} {{ breakingChangesCount === 1 ? 'Change' : 'Changes' }}
              </span>
            </div>
            <p class="text-sm mb-4" :class="isDarkMode ? 'text-red-200/80' : 'text-red-800'">
              This component has breaking changes that may require code updates. Review the migration guide below.
            </p>
            
            <!-- Breaking Changes List -->
            <div class="space-y-2 mb-4">
              <div 
                v-for="(change, idx) in breakingChangesList"
                :key="idx"
                class="flex items-start gap-2 p-3 rounded-lg"
                :class="isDarkMode ? 'bg-red-900/30' : 'bg-red-100'"
              >
                <span class="material-symbols-outlined text-sm mt-0.5 flex-shrink-0" :class="isDarkMode ? 'text-red-400' : 'text-red-600'">
                  error
                </span>
                <div class="flex-1">
                  <p class="text-sm font-medium" :class="isDarkMode ? 'text-red-200' : 'text-red-900'">
                    {{ change.description }}
                  </p>
                  <p v-if="change.version" class="text-xs mt-1" :class="isDarkMode ? 'text-red-300/70' : 'text-red-700'">
                    Introduced in v{{ change.version }}
                  </p>
                </div>
              </div>
            </div>
            
            <!-- Actions -->
            <div class="flex items-center gap-3">
              <button
                @click="scrollToMigration"
                class="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                :class="isDarkMode 
                  ? 'bg-red-600 hover:bg-red-500 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'"
              >
                <span class="material-symbols-outlined text-base">arrow_downward</span>
                View Migration Guide
              </button>
              <button
                @click="dismissAlert"
                class="px-4 py-2 rounded-lg text-sm font-medium transition-colors border"
                :class="isDarkMode 
                  ? 'border-red-700 bg-red-900/30 text-red-300 hover:bg-red-900/50' 
                  : 'border-red-300 bg-white text-red-700 hover:bg-red-50'"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  componentVersions: {
    type: Array,
    default: () => []
  },
  componentId: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['dismiss']);

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const isDismissed = ref(false);

// Check if already dismissed on mount
const checkDismissed = () => {
  if (!props.componentId) {
    isDismissed.value = false;
    return;
  }
  const dismissed = JSON.parse(localStorage.getItem('dismissedBreakingChanges') || '[]');
  isDismissed.value = dismissed.includes(props.componentId);
};

const hasBreakingChanges = computed(() => {
  return props.componentVersions.some(v => v.breaking === true);
});

const breakingChangesCount = computed(() => {
  return props.componentVersions.filter(v => v.breaking === true).length;
});

const breakingChangesList = computed(() => {
  const breaking = props.componentVersions
    .filter(v => v.breaking === true)
    .map(v => ({
      version: v.version,
      description: v.migrationGuide || v.description || 'Breaking change in this version',
      changelog: v.changelog?.filter(c => c.type === 'breaking') || []
    }))
    .flatMap(v => 
      v.changelog.length > 0 
        ? v.changelog.map(c => ({ version: v.version, description: c.description }))
        : [{ version: v.version, description: v.description }]
    );
  
  return breaking;
});

const scrollToMigration = () => {
  // Find the migration section on the page
  const migrationSection = document.querySelector('[data-migration-section]');
  if (migrationSection) {
    migrationSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    // Fallback: scroll to version history
    const versionSection = document.querySelector('[data-version-history]');
    if (versionSection) {
      versionSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
};

const dismissAlert = () => {
  // Store dismissal in localStorage
  const dismissed = JSON.parse(localStorage.getItem('dismissedBreakingChanges') || '[]');
  if (!dismissed.includes(props.componentId)) {
    dismissed.push(props.componentId);
    localStorage.setItem('dismissedBreakingChanges', JSON.stringify(dismissed));
  }
  // Update reactive state
  isDismissed.value = true;
  emit('dismiss');
};

const shouldShow = computed(() => {
  return hasBreakingChanges.value && !isDismissed.value;
});

let darkModeObserver = null;
let darkModeInterval = null;

onMounted(() => {
  // Check if already dismissed
  checkDismissed();
  
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
</style>

