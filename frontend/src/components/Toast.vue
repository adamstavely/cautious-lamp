<template>
  <Teleport to="body">
    <!-- Errors interrupt (assertive); other messages are read when the reader is idle -->
    <p class="sr-only" aria-live="assertive" aria-atomic="true">{{ urgentText }}</p>
    <!-- Hovering or focusing a message holds every message until the pointer or focus leaves -->
    <TransitionGroup
      name="toast"
      tag="div"
      class="toast-stack"
      role="status"
      aria-live="polite"
      @mouseenter="pause"
      @mouseleave="resume"
      @focusin="pause"
      @focusout="resume"
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
import { nextTick, ref, onMounted, onBeforeUnmount } from 'vue';

const toasts = ref([]);
let toastId = 0;
let timeoutIds = new Map();
/** Time left for each message that closes itself, so a pause can resume where it stopped */
const remaining = new Map();
const startedAt = new Map();
let paused = false;
const urgentText = ref('');

const schedule = (id, ms) => {
  remaining.set(id, ms);
  startedAt.set(id, Date.now());
  timeoutIds.set(id, setTimeout(() => removeToast(id), ms));
};

/**
 * Errors stay until closed; other messages close themselves after `duration`
 * ms (0 keeps them), unless the pointer or focus is on the stack.
 */
const showToast = (message, type = 'info', duration = 5000) => {
  const id = toastId++;
  toasts.value.push({ id, message, type });
  if (type === 'error') {
    urgentText.value = '';
    nextTick(() => {
      urgentText.value = message;
    });
  } else if (duration > 0) {
    if (paused) remaining.set(id, duration);
    else schedule(id, duration);
  }
  return id;
};

const pause = () => {
  if (paused) return;
  paused = true;
  timeoutIds.forEach((timeoutId, id) => {
    clearTimeout(timeoutId);
    remaining.set(id, Math.max(1000, remaining.get(id) - (Date.now() - startedAt.get(id))));
  });
  timeoutIds.clear();
};

const resume = (event) => {
  // Moving between messages inside the stack isn't leaving it
  if (event?.relatedTarget && event.currentTarget?.contains?.(event.relatedTarget)) return;
  if (!paused) return;
  paused = false;
  remaining.forEach((ms, id) => schedule(id, ms));
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
  remaining.delete(id);
  startedAt.delete(id);
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
/* Below the top bar, so messages never cover its notification and account buttons */
.toast-stack {
  @apply pointer-events-none fixed right-4 top-topbar mt-2 z-50 flex flex-col gap-2 max-w-full;
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

