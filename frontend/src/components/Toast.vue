<template>
  <Teleport to="body">
    <TransitionGroup
      name="toast"
      tag="div"
      class="fixed top-4 right-4 z-50 space-y-2 pointer-events-none"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto min-w-[300px] max-w-md rounded-lg shadow-lg border p-4 flex items-start gap-3"
        :class="getToastClasses(toast.type)"
      >
        <span class="material-symbols-outlined flex-shrink-0" :class="getIconClass(toast.type)">
          {{ getIcon(toast.type) }}
        </span>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium" :class="getTextClass(toast.type)">
            {{ toast.message }}
          </p>
        </div>
        <button
          @click="removeToast(toast.id)"
          class="flex-shrink-0 p-1 rounded hover:bg-black/10 transition-colors"
          :class="getTextClass(toast.type)"
          aria-label="Close notification"
        >
          <span class="material-symbols-outlined text-base">close</span>
        </button>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const toasts = ref([]);
let toastId = 0;
let timeoutIds = new Map();

const showToast = (message, type = 'info', duration = 5000) => {
  const id = toastId++;
  toasts.value.push({ id, message, type });
  
  if (duration > 0) {
    const timeoutId = setTimeout(() => {
      removeToast(id);
    }, duration);
    timeoutIds.set(id, timeoutId);
  }
  
  return id;
};

const removeToast = (id) => {
  const index = toasts.value.findIndex(t => t.id === id);
  if (index > -1) {
    toasts.value.splice(index, 1);
  }
  
  const timeoutId = timeoutIds.get(id);
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutIds.delete(id);
  }
};

const getToastClasses = (type) => {
  const isDark = document.documentElement.classList.contains('dark');
  const classes = {
    success: isDark 
      ? 'bg-green-900/90 border-green-700 text-green-100' 
      : 'bg-green-50 border-green-200 text-green-800',
    error: isDark 
      ? 'bg-red-900/90 border-red-700 text-red-100' 
      : 'bg-red-50 border-red-200 text-red-800',
    warning: isDark 
      ? 'bg-yellow-900/90 border-yellow-700 text-yellow-100' 
      : 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: isDark 
      ? 'bg-blue-900/90 border-blue-700 text-blue-100' 
      : 'bg-blue-50 border-blue-200 text-blue-800',
  };
  return classes[type] || classes.info;
};

const getIconClass = (type) => {
  const isDark = document.documentElement.classList.contains('dark');
  const classes = {
    success: isDark ? 'text-green-400' : 'text-green-600',
    error: isDark ? 'text-red-400' : 'text-red-600',
    warning: isDark ? 'text-yellow-400' : 'text-yellow-600',
    info: isDark ? 'text-blue-400' : 'text-blue-600',
  };
  return classes[type] || classes.info;
};

const getTextClass = (type) => {
  const isDark = document.documentElement.classList.contains('dark');
  const classes = {
    success: isDark ? 'text-green-100' : 'text-green-800',
    error: isDark ? 'text-red-100' : 'text-red-800',
    warning: isDark ? 'text-yellow-100' : 'text-yellow-800',
    info: isDark ? 'text-blue-100' : 'text-blue-800',
  };
  return classes[type] || classes.info;
};

const getIcon = (type) => {
  const icons = {
    success: 'check_circle',
    error: 'error',
    warning: 'warning',
    info: 'info',
  };
  return icons[type] || icons.info;
};

// Expose methods globally via provide/inject or window
onMounted(() => {
  window.showToast = showToast;
});

onBeforeUnmount(() => {
  timeoutIds.forEach(id => clearTimeout(id));
  timeoutIds.clear();
});

defineExpose({
  showToast,
  removeToast,
});
</script>

<style scoped>
.toast-enter-active {
  transition: all 0.3s ease-out;
}

.toast-leave-active {
  transition: all 0.2s ease-in;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>

