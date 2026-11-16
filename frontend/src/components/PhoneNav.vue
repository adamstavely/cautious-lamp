<template>
  <!-- The side nav on phones: a sheet from the left on the native <dialog>, so
       focus moves in and back, Escape closes it and the page behind is inert -->
  <dialog
    id="phone-nav"
    ref="dialog"
    class="phone-nav"
    aria-labelledby="phone-nav-title"
    @close="open = false"
    @cancel.prevent="open = false"
    @click="closeOnBackdrop"
  >
    <div class="phone-nav-head">
      <h2 id="phone-nav-title" class="phone-nav-title">Menu</h2>
      <UiButton icon-only icon="x" label="Close menu" variant="ghost" size="sm" @click="open = false" />
    </div>
    <nav aria-label="Main navigation" class="phone-nav-body">
      <ul class="phone-nav-list">
        <li v-for="item in items" :key="item.path" :class="{ 'phone-nav-divided': NAV_DIVIDERS_AFTER.includes(item.path) }">
          <router-link
            :to="item.path"
            class="phone-nav-item"
            :class="{ on: active(item.path) }"
            :aria-current="active(item.path) ? 'page' : undefined"
            @click="open = false"
          >
            <AppIcon :name="item.icon" class="phone-nav-icon" />
            {{ item.label }}
          </router-link>
        </li>
      </ul>
    </nav>
    <div class="phone-nav-foot">
      <button type="button" class="phone-nav-item" @click="toggleDarkMode">
        <AppIcon :name="darkTheme ? 'sun' : 'moon'" class="phone-nav-icon" />
        {{ darkTheme ? 'Light mode' : 'Dark mode' }}
      </button>
    </div>
  </dialog>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { usePhoneNav } from '../composables/usePhoneNav.js';
import { useTheme } from '../composables/useTheme.js';
import { ADMIN_NAV, MAIN_NAV, NAV_DIVIDERS_AFTER, isSectionActive } from '../navigation.js';
import { canAccessPath } from '../router/rbacGuards.js';
import { UiButton } from './ui';

const route = useRoute();
const open = usePhoneNav();
const dialog = ref(null);
const { darkTheme, toggleDarkMode } = useTheme();

const items = computed(() => (canAccessPath(ADMIN_NAV.path) ? [...MAIN_NAV, ADMIN_NAV] : MAIN_NAV));
const active = (path) => isSectionActive(path, route.path);

const sync = (isOpen) => {
  const el = dialog.value;
  if (!el || typeof el.showModal !== 'function') return;
  if (isOpen && !el.open) el.showModal();
  if (!isOpen && el.open) el.close();
};
watch(open, sync);
onMounted(() => sync(open.value));

// Navigating anywhere closes the menu (a link inside it, or the browser's back button)
watch(() => route.path, () => {
  open.value = false;
});

// A click on the backdrop lands on the <dialog> itself
const closeOnBackdrop = (event) => {
  if (event.target === dialog.value) open.value = false;
};
</script>

<style scoped>
.phone-nav {
  @apply m-0 p-0 h-full max-h-full w-drawer-open max-w-full flex-col border-r border-line bg-surface text-ink shadow-overlay;
}
.phone-nav[open] {
  @apply flex;
}
.phone-nav::backdrop {
  @apply bg-surface-inverse opacity-40;
}
.phone-nav-head {
  @apply flex items-center justify-between h-topbar px-4 border-b border-line;
}
.phone-nav-title {
  @apply text-base font-semibold text-ink-strong;
}
.phone-nav-body {
  @apply flex-1 overflow-y-auto p-2;
}
.phone-nav-list {
  @apply flex flex-col gap-1;
}
.phone-nav-divided {
  @apply pb-1 mb-1 border-b border-line;
}
.phone-nav-item {
  @apply flex items-center gap-3 w-full min-h-11 px-3 rounded-tile text-sm font-medium text-ink-secondary transition-colors;
  @apply hover:bg-fill-hover hover:text-ink-strong focus-visible:outline focus-visible:outline-2 outline-focus;
}
.phone-nav-item.on {
  @apply bg-accent-subtle text-accent-text font-semibold;
}
.phone-nav-icon {
  @apply text-lg text-ink-muted;
}
.phone-nav-item.on .phone-nav-icon {
  @apply text-accent-text;
}
.phone-nav-foot {
  @apply p-2 border-t border-line;
}
</style>
