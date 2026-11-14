<template>
  <div class="page-shell">
    <DocumentationDrawer :is-open="drawerOpen" @close="closeDrawer" @toggle="toggleDrawer" @navigate-doc="openDoc" />

    <div class="page-main" :class="drawerOpen ? 'ml-drawer-open' : 'ml-drawer-closed'">
      <!-- A reference document opened from the drawer replaces the page -->
      <div v-if="activeDoc" class="flex flex-col h-full">
        <Breadcrumbs :custom-path="activeDoc" :on-navigate="leaveDoc" />
        <div class="flex-1 overflow-hidden">
          <MarkdownViewer :doc-path="activeDoc" />
        </div>
      </div>

      <div v-else class="h-full overflow-y-auto">
        <Breadcrumbs v-if="breadcrumbs" />
        <div class="page-body" :class="widthClass">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import Breadcrumbs from '../Breadcrumbs.vue';
import DocumentationDrawer from '../DocumentationDrawer.vue';
import MarkdownViewer from '../MarkdownViewer.vue';
import { useDrawer } from '../../composables/useDrawer.js';

/**
 * Every page's frame: the docs drawer, breadcrumbs and a scrolling body on the
 * page surface. A reference document opened from the drawer replaces the body
 * until the user goes back. Pages only provide their content.
 */
const props = defineProps({
  /** default: reading width (72rem) · wide: dashboards and tables (80rem) · full: workspaces such as editors and maps */
  width: { type: String, default: 'default', validator: (v) => ['default', 'wide', 'full'].includes(v) },
  breadcrumbs: { type: Boolean, default: true },
  /** Control the reference document from the route (index pages such as /tools/references/*); otherwise the shell keeps it */
  docLink: { type: String, default: undefined },
});

const emit = defineEmits(['update:docLink']);

const route = useRoute();
const { drawerOpen, closeDrawer, toggleDrawer } = useDrawer();
const ownDoc = ref(null);
const activeDoc = computed(() => (props.docLink !== undefined ? props.docLink : ownDoc.value));

const openDoc = (link) => {
  ownDoc.value = link;
  emit('update:docLink', link);
  drawerOpen.value = true;
};
const leaveDoc = () => {
  ownDoc.value = null;
  emit('update:docLink', null);
};

// Leaving the page closes any reference document it had open
watch(
  () => route.path,
  () => {
    ownDoc.value = null;
  },
);

onMounted(() => {
  // The side nav asks for the drawer to open on arrival
  if (sessionStorage.getItem('openDrawerOnLoad') === 'true') {
    drawerOpen.value = true;
    sessionStorage.removeItem('openDrawerOnLoad');
  }
});

const widthClass = computed(
  () =>
    ({
      default: 'max-w-6xl px-6 md:px-10 py-12 md:py-16',
      wide: 'max-w-7xl px-6 md:px-10 py-12 md:py-16',
      full: 'max-w-none px-6 py-8',
    })[props.width],
);
</script>

<style scoped>
.page-shell {
  @apply relative flex w-full h-full bg-surface text-ink;
}
.page-main {
  @apply relative flex-1 h-full overflow-hidden transition-all duration-300;
}
.page-body {
  @apply mx-auto;
}
</style>
