<template>
  <Teleport to="body">
    <TransitionGroup
      name="toast"
      tag="div"
      class="toast-stack"
      role="status"
      aria-live="polite"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast"
        :class="`toast-${toneFor(toast.type)}`"
      >
        <AppIcon :name="getIcon(toast.type)" class="toast-icon" />
        <p class="toast-message">{{ toast.message }}</p>
        <button
          type="button"
          @click="removeToast(toast.id)"
          class="toast-close"
          aria-label="Close notification"
        >
          <AppIcon name="x" />
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

const toneFor = (type) => ({ error: 'danger', warning: 'warning', success: 'success' })[type] || 'info';

const getIcon = (type) => {
  const icons = {
    success: 'circle-check',
    error: 'circle-alert',
    warning: 'triangle-alert',
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
.toast-stack {
  @apply pointer-events-none fixed right-4 top-4 z-50 flex flex-col gap-2;
}
.toast {
  @apply pointer-events-auto flex w-80 max-w-full items-start gap-3 rounded-tile border bg-surface-raised p-4 shadow-overlay;
  /* Status tints are see-through: lay the tone over a solid surface so the page doesn't show through */
  background-image: linear-gradient(var(--toast-tint), var(--toast-tint));
}
.toast-icon {
  @apply flex-shrink-0 text-lg leading-5;
}
.toast-message {
  @apply min-w-0 flex-1 text-sm font-medium text-ink-strong;
}
.toast-close {
  @apply -m-1 flex-shrink-0 rounded p-1 text-ink-secondary transition-colors hover:bg-fill-hover hover:text-ink-strong;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 outline-focus;
}
.toast-info {
  @apply border-info-border text-info;
  --toast-tint: theme('colors.info.bg');
}
.toast-success {
  @apply border-success-border text-success;
  --toast-tint: theme('colors.success.bg');
}
.toast-warning {
  @apply border-warning-border text-warning;
  --toast-tint: theme('colors.warning.bg');
}
.toast-danger {
  @apply border-danger-border text-danger;
  --toast-tint: theme('colors.danger.bg');
}
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

