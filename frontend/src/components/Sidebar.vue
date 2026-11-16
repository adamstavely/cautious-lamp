<template>
  <!-- From the sm breakpoint; on phones the top bar's menu button opens the same links (PhoneNav) -->
  <nav
    id="navigation"
    data-ds-component="sidebar"
    data-ds-path="@design-system/components/sidebar"
    class="side"
    aria-label="Main navigation"
  >
    <div class="flex-1 overflow-y-auto overflow-x-hidden pt-16 pb-4 px-2">
      <template v-for="item in MAIN_NAV" :key="item.path">
        <div v-if="NAV_DIVIDERS_BEFORE[item.path]" class="side-divider" aria-hidden="true">
          <span class="side-divider-label">{{ NAV_DIVIDERS_BEFORE[item.path] }}</span>
        </div>
        <router-link
          :to="item.path"
          :class="['side-item mb-1', { on: active(item.path) }]"
          :aria-current="active(item.path) ? 'page' : undefined"
          @click="openDrawerOnArrival"
        >
          <AppIcon :name="item.icon" class="side-ic" />
          <span class="side-label">{{ item.label }}</span>
        </router-link>
      </template>
    </div>

    <!-- Admin Section (only for people who can open it) -->
    <div v-if="canAccessPath(ADMIN_NAV.path)" class="px-2 pb-2">
      <router-link
        :to="ADMIN_NAV.path"
        :class="['side-item', { on: active(ADMIN_NAV.path) }]"
        :aria-current="active(ADMIN_NAV.path) ? 'page' : undefined"
        @click="openDrawerOnArrival"
      >
        <AppIcon :name="ADMIN_NAV.icon" class="side-ic" />
        <span class="side-label">{{ ADMIN_NAV.label }}</span>
      </router-link>
    </div>

    <!-- Dark Mode Toggle -->
    <div class="px-2 pb-4">
      <button
        type="button"
        class="side-item w-full"
        :aria-label="darkTheme ? 'Switch to light mode' : 'Switch to dark mode'"
        @click="toggleDarkMode"
      >
        <AppIcon :name="darkTheme ? 'sun' : 'moon'" class="side-ic flex-shrink-0" />
      </button>
    </div>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { useTheme } from '../composables/useTheme.js';
import { ADMIN_NAV, MAIN_NAV, NAV_DIVIDERS_BEFORE, isSectionActive } from '../navigation.js';
import { canAccessPath } from '../router/rbacGuards.js';

const route = useRoute();
const { darkTheme, toggleDarkMode } = useTheme();
const active = (path) => isSectionActive(path, route.path);

// Arriving from the side nav opens the section's docs drawer (PageShell reads this)
const openDrawerOnArrival = () => {
  sessionStorage.setItem('openDrawerOnLoad', 'true');
};
</script>

<style scoped>
.side {
  @apply hidden sm:flex sticky top-0 h-screen flex-col flex-shrink-0 w-sidenav z-50 bg-surface border-r border-line text-ink-secondary transition-colors;
}
.side-item {
  @apply flex flex-col items-center gap-1.5 px-1 py-2.5 rounded-tile transition-colors hover:bg-fill-hover hover:text-ink-strong;
  @apply focus-visible:outline focus-visible:outline-2 outline-focus;
}
.side-item.on {
  @apply bg-accent-subtle text-accent-text;
}
.side-ic {
  @apply text-ink-muted transition-colors;
}
.side-item:hover .side-ic,
.side-item.on .side-ic {
  @apply text-accent-text;
}
.side-label {
  @apply text-xs font-medium text-center leading-tight;
}
.side-item.on .side-label {
  @apply font-semibold;
}
.side-divider {
  @apply flex items-center gap-1.5 mx-1 my-2;
}
.side-divider::before,
.side-divider::after {
  content: '';
  @apply flex-1 h-px bg-line;
}
.side-divider-label {
  @apply text-xs leading-none text-ink-muted select-none;
}
</style>
