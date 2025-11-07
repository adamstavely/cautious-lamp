<template>
  <div
    v-if="banners.length > 0"
    class="sticky top-16 z-40 transition-all duration-300"
    :style="drawerOffset"
    role="alert"
    aria-live="polite"
  >
    <div class="p-8">
      <div class="max-w-7xl mx-auto">
        <div
          v-for="banner in banners"
          :key="banner.id"
          class="border rounded-lg mb-4"
          :class="getBannerClasses(banner.type)"
        >
          <div class="px-4 sm:px-6 lg:px-8 py-3">
            <div class="flex items-start gap-3">
              <span class="material-symbols-outlined flex-shrink-0 mt-0.5" :class="getIconClasses(banner.type)">
                {{ getIcon(banner.type) }}
              </span>
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-sm mb-1" :class="getTextClasses(banner.type)">
                  {{ banner.title }}
                </h3>
                <p class="text-sm" :class="getTextClasses(banner.type, true)">
                  {{ banner.message }}
                </p>
              </div>
              <button
                @click="dismissBanner(banner.id)"
                class="flex-shrink-0 p-1 rounded transition-colors"
                :class="getCloseButtonClasses(banner.type)"
                aria-label="Dismiss banner"
              >
                <span class="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import axios from 'axios';

const banners = ref([]);
const dismissedBanners = ref(new Set());
const isDrawerOpen = ref(false);

const isDarkMode = ref(document.documentElement.classList.contains('dark'));

// Calculate drawer offset - matches the pattern used in page views
const drawerOffset = computed(() => {
  // The banner is already offset by the sidebar in the flex layout
  // We only need to account for the drawer width
  // Drawer closed width: 48px (w-12)
  // Drawer open width: 256px (w-64)
  // This matches the margin-left pattern used in page views
  return isDrawerOpen.value 
    ? 'margin-left: 256px;' 
    : 'margin-left: 48px;';
});

// Check if drawer is open by looking for the drawer element
const checkDrawerState = () => {
  // Find all fixed elements at left-24 top-16 (drawer position)
  const drawerElements = Array.from(document.querySelectorAll('.fixed')).filter(el => {
    const classes = el.className;
    return classes.includes('left-24') && classes.includes('top-16');
  });
  
  // Check if any drawer element has w-64 (open) or w-12 (closed)
  const openDrawer = drawerElements.find(el => {
    const classes = el.className;
    return classes.includes('w-64') && el.offsetParent !== null;
  });
  
  const closedDrawer = drawerElements.find(el => {
    const classes = el.className;
    return classes.includes('w-12') && el.offsetParent !== null;
  });
  
  // Drawer is open if we find the w-64 element
  if (openDrawer) {
    isDrawerOpen.value = true;
  } else if (closedDrawer) {
    isDrawerOpen.value = false;
  }
};

const fetchBanners = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/v1/banners?active=true');
    banners.value = response.data.filter(banner => !dismissedBanners.value.has(banner.id));
  } catch (error) {
    console.error('Failed to fetch banners:', error);
  }
};

const dismissBanner = (id) => {
  dismissedBanners.value.add(id);
  banners.value = banners.value.filter(banner => banner.id !== id);
  // Store dismissed banners in localStorage
  localStorage.setItem('dismissedBanners', JSON.stringify(Array.from(dismissedBanners.value)));
};

const getBannerClasses = (type) => {
  const base = isDarkMode.value ? 'bg-slate-800' : 'bg-white';
  switch (type) {
    case 'error':
      return `${base} border-red-500/50 ${isDarkMode.value ? 'bg-red-950/30' : 'bg-red-50'}`;
    case 'warning':
      return `${base} border-yellow-500/50 ${isDarkMode.value ? 'bg-yellow-950/30' : 'bg-yellow-50'}`;
    case 'success':
      return `${base} border-green-500/50 ${isDarkMode.value ? 'bg-green-950/30' : 'bg-green-50'}`;
    default:
      return `${base} border-blue-500/50 ${isDarkMode.value ? 'bg-blue-950/30' : 'bg-blue-50'}`;
  }
};

const getIconClasses = (type) => {
  switch (type) {
    case 'error':
      return isDarkMode.value ? 'text-red-400' : 'text-red-600';
    case 'warning':
      return isDarkMode.value ? 'text-yellow-400' : 'text-yellow-600';
    case 'success':
      return isDarkMode.value ? 'text-green-400' : 'text-green-600';
    default:
      return isDarkMode.value ? 'text-blue-400' : 'text-blue-600';
  }
};

const getTextClasses = (type, isMessage = false) => {
  if (isMessage) {
    return isDarkMode.value ? 'text-gray-300' : 'text-gray-700';
  }
  switch (type) {
    case 'error':
      return isDarkMode.value ? 'text-red-300' : 'text-red-900';
    case 'warning':
      return isDarkMode.value ? 'text-yellow-300' : 'text-yellow-900';
    case 'success':
      return isDarkMode.value ? 'text-green-300' : 'text-green-900';
    default:
      return isDarkMode.value ? 'text-blue-300' : 'text-blue-900';
  }
};

const getCloseButtonClasses = (type) => {
  const base = isDarkMode.value 
    ? 'text-gray-400 hover:text-white hover:bg-slate-700' 
    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100';
  return base;
};

const getIcon = (type) => {
  switch (type) {
    case 'error':
      return 'error';
    case 'warning':
      return 'warning';
    case 'success':
      return 'check_circle';
    default:
      return 'info';
  }
};

let interval = null;
let observer = null;
let drawerObserver = null;

onMounted(() => {
  // Load dismissed banners from localStorage
  const stored = localStorage.getItem('dismissedBanners');
  if (stored) {
    dismissedBanners.value = new Set(JSON.parse(stored));
  }
  
  fetchBanners();
  
  // Refresh banners every 30 seconds
  interval = setInterval(fetchBanners, 30000);
  
  // Watch for dark mode changes
  observer = new MutationObserver(() => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  });
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });
  
  // Watch for drawer state changes
  checkDrawerState();
  drawerObserver = new MutationObserver(() => {
    checkDrawerState();
  });
  
  // Observe the entire document for drawer changes
  drawerObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class']
  });
  
  // Also check periodically as fallback
  const drawerCheckInterval = setInterval(checkDrawerState, 100);
  
  // Store interval for cleanup
  window._bannerDrawerInterval = drawerCheckInterval;
});

onBeforeUnmount(() => {
  if (interval) {
    clearInterval(interval);
  }
  if (observer) {
    observer.disconnect();
  }
  if (drawerObserver) {
    drawerObserver.disconnect();
  }
  if (window._bannerDrawerInterval) {
    clearInterval(window._bannerDrawerInterval);
  }
});
</script>

