<template>
  <div class="page-shell">
    <DocumentationDrawer :is-open="drawerOpen" @close="closeDrawer" @toggle="toggleDrawer" @navigate-doc="openDoc" />

    <!-- On phones the open drawer covers the page instead of pushing it off screen -->
    <div class="page-main" :class="drawerOpen ? 'ml-drawer-closed sm:ml-drawer-open' : 'ml-drawer-closed'">
      <!-- A reference document opened from the drawer replaces the page -->
      <div v-if="activeDoc" class="flex flex-col h-full">
        <Breadcrumbs :custom-path="docTrail || activeDoc" :on-navigate="leaveDoc" />
        <div class="flex-1 overflow-hidden">
          <MarkdownViewer :doc-path="activeDoc" />
        </div>
      </div>

      <div v-else class="h-full overflow-y-auto">
        <div class="page-body" :class="[widthClass, breadcrumbs ? 'page-body-crumbs' : 'page-body-plain']">
          <Breadcrumbs v-if="breadcrumbs" inline class="page-crumbs" />
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
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
  /** The breadcrumb trail for that document when it differs from its path (e.g. /guidelines/colors for /colors) */
  docTrail: { type: String, default: null },
});

const emit = defineEmits(['update:docLink']);

const route = useRoute();
const router = useRouter();
const { drawerOpen, closeDrawer, toggleDrawer } = useDrawer();
const ownDoc = ref(null);
const activeDoc = computed(() => (props.docLink !== undefined ? props.docLink : ownDoc.value));

const openDoc = (link) => {
  ownDoc.value = link;
  emit('update:docLink', link);
  drawerOpen.value = true;
};
/** A breadcrumb closes the document and goes where it points */
const leaveDoc = (path) => {
  ownDoc.value = null;
  emit('update:docLink', null);
  if (path && path !== route.path) router.push(path);
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
      default: 'max-w-6xl px-4 sm:px-6 md:px-10',
      wide: 'max-w-7xl px-4 sm:px-6 md:px-10',
      full: 'max-w-none px-4 sm:px-6',
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
  @apply mx-auto pb-12 md:pb-16;
}
/* Breadcrumbs sit at the top of the page column, lined up with its content */
.page-body-crumbs {
  @apply pt-6 md:pt-8;
}
.page-body-plain {
  @apply pt-12 md:pt-16;
}
.page-crumbs {
  @apply mb-10 md:mb-12;
}
</style>
