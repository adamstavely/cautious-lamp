<template>
  <PageShell width="wide">
    <PageHero
      :back="{ to: '/design-assets', label: 'Design assets' }"
      title="Icon library"
      lead="Browse the Lucide icons the app ships with and the SVG icon sets your workspaces upload. Customize, copy and download them for your projects."
      spot="foundations/icon-library"
      size="tool"
    >
      <template #actions>
        <UiButton variant="primary" icon="upload" label="Upload icons" @click="openUpload" />
      </template>
    </PageHero>

    <PageSection title="Icon sets" description="Pick a set to browse its icons.">
      <template #actions>
        <UiInput v-model="searchQuery" type="search" label="Search icons" hide-label icon="search" placeholder="Search icons…" size="sm" />
      </template>

      <InlineNotice :notice="notice" class="mb-6" @dismiss="clearNotice" />

      <UiCallout v-if="library.error.value" tone="danger" role="alert" class="mb-6" title="Uploaded icon sets couldn't be loaded">
        {{ library.error.value }}
        <template #actions><UiButton size="sm" label="Try again" @click="library.load" /></template>
      </UiCallout>

      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          v-for="set in filteredSets"
          :key="set.id"
          type="button"
          class="set-card"
          :class="{ 'set-card-on': selectedSet === set.id }"
          :aria-pressed="selectedSet === set.id ? 'true' : 'false'"
          @click="selectedSet = set.id"
        >
          <span class="flex items-center justify-between gap-3 mb-2">
            <span class="flex items-center gap-2 text-lg font-semibold text-ink-strong">
              <AppIcon :name="set.builtIn ? 'sparkles' : 'shapes'" class="text-accent-text" />
              {{ set.name }}
            </span>
            <UiChip>{{ set.builtIn && loadingLucide ? 'Loading…' : `${set.icons.length} icons` }}</UiChip>
          </span>
          <span class="block text-sm text-ink-secondary">{{ set.description }}</span>
        </button>
      </div>

      <div v-if="library.loading.value && !library.loaded.value" class="flex justify-center py-6">
        <UiSpinner label="Loading uploaded icon sets…" />
      </div>
      <p v-else-if="library.loaded.value && uploadedSets.length === 0" class="mt-4 text-sm text-ink-secondary">
        No icon sets have been uploaded to your workspaces yet.
      </p>
    </PageSection>

    <PageSection v-if="currentSet" :title="`${currentSet.name} icons`" :description="currentSetDescription" divided>
      <template #actions>
        <UiSegmented v-model="viewMode" aria-label="View" :options="viewOptions" />
        <UiButton
          v-if="currentSet.canEdit"
          variant="danger"
          icon="trash-2"
          label="Delete set"
          :loading="deletingSet"
          @click="confirmDeleteOpen = true"
        />
      </template>

      <div class="grid lg:grid-cols-content-aside gap-6 items-start">
        <UiPanel>
          <div v-if="selectedIcons.length > 0" class="flex flex-wrap items-center gap-2 mb-4" role="status">
            <span class="text-sm text-ink-secondary">{{ selectedIcons.length }} selected</span>
            <UiButton size="sm" icon="copy" label="Copy selected" @click="copySelectedIcons" />
            <UiButton size="sm" icon="download" label="Download selected" @click="downloadSelectedIcons" />
            <UiButton size="sm" variant="ghost" label="Clear selection" @click="selectedIcons = []" />
          </div>

          <div v-if="currentSet.builtIn && loadingLucide" class="flex justify-center py-12">
            <UiSpinner label="Loading Lucide icons…" />
          </div>

          <UiEmptyState
            v-else-if="filteredIcons.length === 0"
            title="No icons match"
            :body="searchQuery || selectedCategory ? 'Try a different search or category.' : 'This set has no icons.'"
            :bordered="false"
          />

          <ul v-else-if="viewMode === 'grid'" class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-8 gap-3">
            <li v-for="icon in filteredIcons" :key="icon.id" class="group relative">
              <button
                type="button"
                class="icon-tile"
                :title="icon.name"
                :class="{ 'icon-tile-on': isIconSelected(icon.id) }"
                :aria-pressed="isIconSelected(icon.id) ? 'true' : 'false'"
                :aria-label="`Select ${icon.name}`"
                @click="toggleIconSelection(icon)"
              >
                <img v-if="iconSrc(icon)" :src="iconSrc(icon)" :width="iconSize" :height="iconSize" alt="" class="icon-img" />
                <span class="w-full truncate text-xs text-center text-ink-secondary">{{ icon.name }}</span>
                <span v-if="isIconSelected(icon.id)" class="icon-check" aria-hidden="true"><AppIcon name="check" class="text-xs" /></span>
              </button>
              <span class="icon-actions">
                <UiButton size="sm" variant="ghost" icon="copy" icon-only :label="`Copy ${icon.name}`" @click="copyIcon(icon)" />
                <UiButton size="sm" variant="ghost" icon="download" icon-only :label="`Download ${icon.name}`" @click="downloadIcon(icon)" />
              </span>
            </li>
          </ul>

          <ul v-else class="divide-y divide-line-faint">
            <li v-for="icon in filteredIcons" :key="icon.id" class="flex items-center gap-3 py-2">
              <button
                type="button"
                class="icon-row"
                :class="{ 'icon-tile-on': isIconSelected(icon.id) }"
                :aria-pressed="isIconSelected(icon.id) ? 'true' : 'false'"
                :aria-label="`Select ${icon.name}`"
                @click="toggleIconSelection(icon)"
              >
                <img v-if="iconSrc(icon)" :src="iconSrc(icon)" :width="iconSize" :height="iconSize" alt="" class="icon-img" />
                <span class="min-w-0 text-left">
                  <span class="block font-medium text-ink-strong truncate">{{ icon.name }}</span>
                  <span class="block text-xs text-ink-muted">{{ icon.category }}</span>
                </span>
                <AppIcon v-if="isIconSelected(icon.id)" name="check" class="ml-auto text-accent-text" />
              </button>
              <UiButton size="sm" variant="ghost" icon="copy" icon-only :label="`Copy ${icon.name}`" @click="copyIcon(icon)" />
              <UiButton size="sm" variant="ghost" icon="download" icon-only :label="`Download ${icon.name}`" @click="downloadIcon(icon)" />
            </li>
          </ul>
        </UiPanel>

        <div class="space-y-6 lg:w-80">
          <UiPanel title="Customizer" heading-tag="h3">
            <template #actions>
              <UiButton size="sm" variant="ghost" icon="rotate-ccw" icon-only label="Reset customizer" @click="resetCustomizer" />
            </template>
            <div class="space-y-4">
              <div>
                <p class="text-sm font-medium text-ink-strong mb-2">Color</p>
                <div class="flex items-center gap-3">
                  <button type="button" class="swatch-btn" aria-label="Pick icon color" @click="openColorPicker">
                    <UiSwatch :color="displayColor" :label="iconColor ? `Icon color ${iconColor}` : 'Icon color follows the theme'" size="fill" />
                  </button>
                  <span class="text-sm text-ink-secondary">{{ iconColor || 'Follows the theme' }}</span>
                </div>
              </div>
              <UiRange v-model="iconStrokeWidth" label="Stroke width" :min="1" :max="5" :step="0.5" unit="px" />
              <UiRange v-model="iconSize" label="Size" :min="16" :max="48" :step="2" unit="px" />
              <UiSwitch v-model="absoluteStrokeWidth" label="Absolute stroke width" hint="Keep the stroke width the same at every size" />
            </div>
          </UiPanel>

          <UiPanel v-if="categoriesWithCounts.length > 1" title="Categories" heading-tag="h3">
            <ul class="space-y-1">
              <li v-for="category in categoriesWithCounts" :key="category.name">
                <button
                  type="button"
                  class="category-btn"
                  :class="{ 'category-btn-on': selectedCategory === category.name }"
                  :aria-pressed="selectedCategory === category.name ? 'true' : 'false'"
                  @click="selectedCategory = selectedCategory === category.name ? null : category.name"
                >
                  <span>{{ category.name }}</span>
                  <span class="text-xs text-ink-muted">{{ category.count }}</span>
                </button>
              </li>
            </ul>
          </UiPanel>
        </div>
      </div>
    </PageSection>

    <!-- Upload: parse the SVG files and save each as an icons item in a workspace -->
    <UiDialog v-model:open="showUploadModal" title="Upload an icon set" size="lg">
      <UiCallout v-if="library.loaded.value && library.editableWorkspaces.value.length === 0" tone="info" title="Editor access needed">
        Uploaded icons are saved in a workspace. You need the editor role in a workspace to upload; ask a workspace admin, or
        create a workspace in Workspace management.
      </UiCallout>
      <form v-else id="icon-upload-form" class="space-y-4" @submit.prevent="uploadIconSet">
        <UiInput v-model="newSetName" label="Icon set name" placeholder="e.g., Product icons" required />
        <UiSelect
          v-model="uploadWorkspaceId"
          label="Workspace"
          hint="Members of this workspace, and workspaces it shares with, will see the set."
          :options="workspaceOptions"
          required
        />
        <UiFileDropZone
          ref="dropZone"
          label="SVG files"
          hint="SVG files, up to 100KB each. Each file becomes one icon, named after the file."
          accept=".svg,image/svg+xml"
          prompt="Drop SVG files here, or choose them."
          button-label="Choose files"
          multiple
          @select="addFile"
        />
        <ul v-if="selectedFiles.length > 0" class="divide-y divide-line-faint rounded-tile border border-line">
          <li v-for="(file, index) in selectedFiles" :key="`${file.name}-${index}`" class="flex items-center justify-between gap-3 px-3 py-2">
            <span class="text-sm text-ink truncate">{{ file.name }}</span>
            <UiButton size="sm" variant="ghost" icon="x" icon-only :label="`Remove ${file.name}`" @click="removeFile(index)" />
          </li>
        </ul>
        <UiCallout v-if="rejectedFiles.length > 0" tone="warning" title="Some files weren't uploaded">
          <ul class="list-disc pl-5">
            <li v-for="file in rejectedFiles" :key="file.fileName">{{ file.fileName }}: {{ file.reason }}</li>
          </ul>
        </UiCallout>
        <UiCallout v-if="uploadError" tone="danger" role="alert">{{ uploadError }}</UiCallout>
      </form>
      <template #footer>
        <UiButton label="Cancel" @click="showUploadModal = false" />
        <UiButton
          v-if="library.editableWorkspaces.value.length > 0"
          type="submit"
          form="icon-upload-form"
          variant="primary"
          icon="upload"
          :label="uploading ? `Uploading ${uploadProgress}…` : 'Upload'"
          :loading="uploading"
          :disabled="!newSetName.trim() || !uploadWorkspaceId || selectedFiles.length === 0"
        />
      </template>
    </UiDialog>

    <UiDialog v-model:open="confirmDeleteOpen" title="Delete icon set?" size="sm">
      <p class="text-sm text-ink">
        This deletes the {{ currentSet?.icons.length }} icons in “{{ currentSet?.name }}” from {{ currentSet?.workspaceName || 'its workspace' }}.
        It can't be undone.
      </p>
      <template #footer>
        <UiButton label="Cancel" @click="confirmDeleteOpen = false" />
        <UiButton variant="danger" icon="trash-2" label="Delete set" :loading="deletingSet" @click="deleteCurrentSet" />
      </template>
    </UiDialog>

    <ColorPicker
      :show="showColorPicker"
      :initial-color="pickerColor"
      :position="pickerPosition"
      @update:show="showColorPicker = $event"
      @apply="handleColorPickerApply"
      @cancel="showColorPicker = false"
    />
  </PageShell>
</template>

<script setup>
import { computed, createApp, h, nextTick, onMounted, ref, watch } from 'vue';
import * as LucideIcons from 'lucide-vue-next';
import ColorPicker from '../components/ColorPicker.vue';
import InlineNotice from '../components/InlineNotice.vue';
import {
  PageHero,
  PageSection,
  PageShell,
  UiButton,
  UiCallout,
  UiChip,
  UiDialog,
  UiEmptyState,
  UiFileDropZone,
  UiInput,
  UiPanel,
  UiRange,
  UiSegmented,
  UiSelect,
  UiSpinner,
  UiSwatch,
  UiSwitch,
} from '../components/ui';
import { svgDataUri } from '../components/workspaces/safeContent.js';
import { useChartTheme } from '../composables/useChartTheme.js';
import { useNotice } from '../composables/useNotice.js';
import { useResourceLibrary } from '../composables/useResourceLibrary.js';
import { readSvgFiles } from '../utils/svgIconFiles.js';

const { notice, showNotice, clearNotice } = useNotice();
const theme = useChartTheme();

// Uploaded icon sets: workspace `icons` items, grouped by their iconSet
const library = useResourceLibrary('icons');

const searchQuery = ref('');
const selectedSet = ref('lucide');
const viewMode = ref('grid');
const viewOptions = [
  { value: 'grid', label: 'Grid', icon: 'layout-grid' },
  { value: 'list', label: 'List', icon: 'list' },
];
const loadingLucide = ref(false);
const lucideIcons = ref([]);

// Customizer state; a null colour follows the theme's text colour
const iconColor = ref(null);
const iconStrokeWidth = ref(2);
const iconSize = ref(24);
const absoluteStrokeWidth = ref(false);
const selectedCategory = ref(null);
const selectedIcons = ref([]);
const showColorPicker = ref(false);
const pickerColor = ref('#000000');
const pickerPosition = ref({ left: 0, top: 0 });

// A curated list of Lucide icons, grouped by use. Names Lucide doesn't export are skipped.
const LUCIDE_CATEGORIES = {
  Navigation: ['House', 'Search', 'Menu', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'ChevronLeft', 'ChevronRight', 'ChevronUp', 'ChevronDown'],
  Actions: ['Plus', 'Minus', 'X', 'Check', 'Pencil', 'Trash2', 'Copy', 'Save', 'Download', 'Upload', 'Share2', 'Heart', 'Star', 'Bookmark', 'Flag'],
  Media: ['Play', 'Pause', 'SkipForward', 'SkipBack', 'Volume2', 'VolumeX', 'Mic', 'Camera', 'Image', 'Video', 'Music'],
  Communication: ['Mail', 'Phone', 'MessageSquare', 'Bell', 'Send', 'Reply', 'Forward', 'Archive', 'Inbox'],
  Files: ['File', 'Folder', 'FileText', 'FileCode', 'FolderOpen', 'FolderPlus'],
  Settings: ['Settings', 'User', 'Users', 'Shield', 'Lock', 'LockOpen', 'Key', 'SlidersHorizontal', 'Funnel'],
  Shapes: ['Circle', 'Square', 'Triangle', 'Hexagon', 'Pentagon', 'Diamond'],
  Charts: ['ChartColumn', 'ChartLine', 'ChartPie', 'TrendingUp', 'TrendingDown', 'Activity', 'Gauge'],
  Weather: ['Sun', 'Moon', 'Cloud', 'CloudRain', 'CloudSnow', 'Wind', 'Droplet', 'Umbrella'],
  Food: ['Coffee', 'Pizza', 'Apple', 'Banana', 'Cherry', 'Grape'],
  Objects: ['Box', 'Package', 'Gift', 'ShoppingCart', 'CreditCard', 'Wallet', 'Tag', 'Tags', 'Book', 'BookOpen'],
  Status: ['CircleCheck', 'CircleX', 'CircleAlert', 'Info', 'CircleHelp', 'Zap', 'TriangleAlert'],
  Devices: ['Monitor', 'Laptop', 'Smartphone', 'Tablet', 'Watch', 'Headphones', 'Speaker', 'Printer', 'Wifi', 'Bluetooth'],
  Editing: ['Crop', 'RotateCw', 'RotateCcw', 'FlipHorizontal', 'FlipVertical', 'ZoomIn', 'ZoomOut', 'Eraser', 'Brush', 'Paintbrush', 'Palette'],
  Layout: ['LayoutGrid', 'List', 'Columns2', 'Rows2', 'PanelLeft', 'LayoutDashboard', 'Layers'],
  Text: ['Bold', 'Italic', 'Underline', 'Strikethrough', 'Heading', 'Pilcrow', 'Quote', 'ListOrdered'],
  Development: ['Code', 'Terminal', 'Database', 'Server', 'QrCode', 'Barcode', 'Fingerprint', 'Scan'],
  Misc: ['Sparkles', 'WandSparkles', 'Target', 'Smile', 'ThumbsUp', 'ThumbsDown', 'Award', 'Trophy', 'Calendar', 'Clock', 'Map', 'Globe', 'Link', 'ExternalLink', 'Eye', 'EyeOff'],
};

const kebab = (name) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([a-zA-Z])([0-9])/g, '$1-$2').toLowerCase();

/** Renders the curated Lucide icons once and keeps their SVG markup */
const loadLucideIcons = async () => {
  loadingLucide.value = true;
  try {
    const entries = Object.entries(LUCIDE_CATEGORIES).flatMap(([category, names]) =>
      names.filter((name) => LucideIcons[name]).map((name) => ({ name, category })),
    );
    const unique = [...new Map(entries.map((entry) => [entry.name, entry])).values()];
    const host = document.createElement('div');
    const app = createApp({
      render: () => h('div', unique.map(({ name }) => h(LucideIcons[name], { size: 24, strokeWidth: 2, 'data-icon': name }))),
    });
    app.mount(host);
    await nextTick();
    lucideIcons.value = unique
      .map(({ name, category }) => {
        const svg = host.querySelector(`[data-icon="${name}"]`);
        if (!svg) return null;
        svg.removeAttribute('data-icon');
        svg.removeAttribute('class');
        return { id: `lucide-${kebab(name)}`, name: kebab(name), category, svg: svg.outerHTML };
      })
      .filter(Boolean);
    app.unmount();
  } catch (error) {
    console.error('Error loading Lucide icons:', error);
    showNotice("Lucide icons couldn't be loaded.", 'error');
  } finally {
    loadingLucide.value = false;
  }
};

const workspaceName = (id) => library.workspaceName(id);

const uploadedSets = computed(() => {
  const groups = new Map();
  for (const item of library.items.value) {
    const name = item.iconSet || 'Ungrouped icons';
    const id = `ws:${item.workspaceId}:${name}`;
    if (!groups.has(id)) {
      groups.set(id, { id, name, workspaceId: item.workspaceId, workspaceName: workspaceName(item.workspaceId), builtIn: false, items: [] });
    }
    groups.get(id).items.push(item);
  }
  return [...groups.values()]
    .map((group) => ({
      ...group,
      description: group.workspaceName ? `Uploaded to ${group.workspaceName}` : 'Shared with your workspaces',
      canEdit: group.items.every((item) => library.canEdit(item)),
      icons: group.items.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.tags?.[0] || 'Uncategorized',
        svg: item.svg || '',
      })),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
});

const iconSets = computed(() => [
  {
    id: 'lucide',
    name: 'Lucide',
    description: 'A curated set of the Lucide icons the app is built with.',
    builtIn: true,
    canEdit: false,
    icons: lucideIcons.value,
  },
  ...uploadedSets.value,
]);

const currentSet = computed(() => iconSets.value.find((set) => set.id === selectedSet.value) || null);
const currentSetDescription = computed(() =>
  currentSet.value?.builtIn ? 'Select icons to copy or download them together.' : `${currentSet.value?.description}. Select icons to copy or download them together.`,
);

const filteredSets = computed(() => {
  if (!searchQuery.value) return iconSets.value;
  const query = searchQuery.value.toLowerCase();
  return iconSets.value.filter(
    (set) =>
      set.name.toLowerCase().includes(query) ||
      set.description.toLowerCase().includes(query) ||
      set.icons.some((icon) => icon.name.toLowerCase().includes(query)),
  );
});

const filteredIcons = computed(() => {
  let icons = currentSet.value?.icons || [];
  if (selectedCategory.value) icons = icons.filter((icon) => icon.category === selectedCategory.value);
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    icons = icons.filter((icon) => icon.name.toLowerCase().includes(query) || icon.category.toLowerCase().includes(query));
  }
  return icons;
});

const categoriesWithCounts = computed(() => {
  const counts = {};
  for (const icon of currentSet.value?.icons || []) counts[icon.category] = (counts[icon.category] || 0) + 1;
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
});

/** The colour icons are drawn in on the page: the picked one, or the theme's strong text */
const displayColor = computed(() => iconColor.value || theme.value.title);

/** The icon's SVG with the customizer applied; `color` defaults to currentColor for copies and downloads */
const customizeSvg = (icon, color = iconColor.value || 'currentColor') => {
  if (!icon.svg) return '';
  const doc = new DOMParser().parseFromString(icon.svg, 'image/svg+xml');
  const svgElement = doc.documentElement;
  if (!svgElement || svgElement.localName !== 'svg') return icon.svg;

  const hasFill = svgElement.getAttribute('fill') && svgElement.getAttribute('fill') !== 'none';
  if (hasFill) {
    svgElement.setAttribute('fill', color);
  } else {
    // Stroke icons (Lucide and most line sets)
    svgElement.setAttribute('stroke', color);
    svgElement.setAttribute('fill', 'none');
    const strokeWidth = absoluteStrokeWidth.value ? (iconStrokeWidth.value * 24) / iconSize.value : iconStrokeWidth.value;
    svgElement.setAttribute('stroke-width', String(strokeWidth));
  }
  if (!svgElement.getAttribute('xmlns')) svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svgElement.setAttribute('width', String(iconSize.value));
  svgElement.setAttribute('height', String(iconSize.value));
  return new XMLSerializer().serializeToString(svgElement);
};

/**
 * Icons are shown as sanitized SVG images, never as page markup. Worked out
 * once per icon shown and customizer change, not on every render.
 */
const iconSources = computed(() => new Map(filteredIcons.value.map((icon) => [icon.id, svgDataUri(customizeSvg(icon, displayColor.value))])));
const iconSrc = (icon) => iconSources.value.get(icon.id);

// Selection
const toggleIconSelection = (icon) => {
  const index = selectedIcons.value.findIndex((i) => i.id === icon.id);
  if (index > -1) selectedIcons.value.splice(index, 1);
  else selectedIcons.value.push(icon);
};
const isIconSelected = (iconId) => selectedIcons.value.some((i) => i.id === iconId);

// Copy and download
const copyIcon = async (icon) => {
  try {
    await navigator.clipboard.writeText(customizeSvg(icon));
    showNotice(`Copied ${icon.name} to the clipboard.`, 'success');
  } catch {
    showNotice("The icon couldn't be copied. Your browser may block clipboard access.", 'error');
  }
};

const downloadIcon = (icon) => {
  const blob = new Blob([customizeSvg(icon)], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${icon.name}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const copySelectedIcons = async () => {
  if (selectedIcons.value.length === 0) return;
  try {
    await navigator.clipboard.writeText(selectedIcons.value.map((icon) => customizeSvg(icon)).join('\n\n'));
    showNotice(`Copied ${selectedIcons.value.length} icons to the clipboard.`, 'success');
  } catch {
    showNotice("The icons couldn't be copied. Your browser may block clipboard access.", 'error');
  }
};

const downloadSelectedIcons = () => {
  selectedIcons.value.forEach((icon, index) => {
    setTimeout(() => downloadIcon(icon), index * 100); // browsers drop downloads started together
  });
};

const resetCustomizer = () => {
  iconColor.value = null;
  iconStrokeWidth.value = 2;
  iconSize.value = 24;
  absoluteStrokeWidth.value = false;
};

// Colour picker, placed beside the swatch and kept on screen
const openColorPicker = (event) => {
  const rect = event.currentTarget.getBoundingClientRect();
  const width = 300;
  const height = 550;
  const padding = 16;
  let left = rect.right + padding;
  if (left + width > window.innerWidth) left = rect.left - width - padding;
  pickerPosition.value = {
    left: Math.max(padding, Math.min(left, window.innerWidth - width - padding)),
    top: Math.max(padding, Math.min(rect.top, window.innerHeight - height - padding)),
  };
  pickerColor.value = iconColor.value || '#000000';
  showColorPicker.value = true;
};

const handleColorPickerApply = (color) => {
  iconColor.value = color;
  showColorPicker.value = false;
};

// Upload
const showUploadModal = ref(false);
const newSetName = ref('');
const uploadWorkspaceId = ref('');
const selectedFiles = ref([]);
const rejectedFiles = ref([]);
const uploadError = ref('');
const uploading = ref(false);
const uploadProgress = ref('');
const dropZone = ref(null);

const workspaceOptions = computed(() => library.editableWorkspaces.value.map((ws) => ({ value: ws.id, label: ws.name })));

const openUpload = () => {
  newSetName.value = '';
  selectedFiles.value = [];
  rejectedFiles.value = [];
  uploadError.value = '';
  uploadWorkspaceId.value = library.editableWorkspaces.value.length === 1 ? library.editableWorkspaces.value[0].id : '';
  showUploadModal.value = true;
  if (!library.loaded.value) library.load();
};

const addFile = (file) => {
  selectedFiles.value.push(file);
};
const removeFile = (index) => {
  selectedFiles.value.splice(index, 1);
};

/** Saves each valid SVG file as an icons item in the chosen workspace */
const uploadIconSet = async () => {
  const setName = newSetName.value.trim();
  if (!setName || !uploadWorkspaceId.value || selectedFiles.value.length === 0) return;
  uploading.value = true;
  uploadError.value = '';
  try {
    const { icons, rejected } = await readSvgFiles(selectedFiles.value);
    rejectedFiles.value = rejected;
    if (icons.length === 0) {
      uploadError.value = 'None of the files is an SVG icon that can be uploaded.';
      return;
    }
    const failed = [];
    let saved = 0;
    for (const [index, icon] of icons.entries()) {
      uploadProgress.value = `${index + 1} of ${icons.length}`;
      try {
        await library.create(uploadWorkspaceId.value, { name: icon.name, iconSet: setName, svg: icon.svg });
        saved++;
      } catch (error) {
        failed.push({ fileName: icon.fileName, reason: error.message });
      }
    }
    rejectedFiles.value = [...rejected, ...failed];
    if (saved > 0) {
      selectedSet.value = `ws:${uploadWorkspaceId.value}:${setName}`;
      showNotice(`Uploaded ${saved} ${saved === 1 ? 'icon' : 'icons'} to “${setName}”.`, 'success');
    }
    if (rejectedFiles.value.length === 0) {
      showUploadModal.value = false;
      selectedFiles.value = [];
    } else {
      // Keep the dialog open with the reasons; only the files that failed stay listed
      const failedNames = new Set(rejectedFiles.value.map((f) => f.fileName));
      selectedFiles.value = selectedFiles.value.filter((file) => failedNames.has(file.name));
      dropZone.value?.reset?.();
    }
  } catch (error) {
    uploadError.value = error.message || "The icons couldn't be uploaded.";
  } finally {
    uploading.value = false;
    uploadProgress.value = '';
  }
};

// Deleting an uploaded set deletes its items
const confirmDeleteOpen = ref(false);
const deletingSet = ref(false);

const deleteCurrentSet = async () => {
  const set = currentSet.value;
  if (!set || set.builtIn) return;
  deletingSet.value = true;
  let deleted = 0;
  try {
    for (const item of set.items) {
      await library.remove(item);
      deleted++;
    }
    confirmDeleteOpen.value = false;
    selectedSet.value = 'lucide';
    showNotice(`Deleted “${set.name}”.`, 'success');
  } catch (error) {
    confirmDeleteOpen.value = false;
    showNotice(`Deleted ${deleted} of ${set.items.length} icons. ${error.message}`, 'error');
  } finally {
    deletingSet.value = false;
  }
};

watch(selectedSet, () => {
  selectedIcons.value = [];
  selectedCategory.value = null;
});
watch(selectedCategory, () => {
  selectedIcons.value = [];
});

onMounted(() => {
  loadLucideIcons();
  library.load();
});
</script>

<style scoped>
.set-card {
  @apply flex flex-col text-left rounded-card border border-line bg-surface-raised p-5 transition-all hover:border-accent-border;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 outline-focus;
}
.set-card-on {
  @apply border-line-selected bg-accent-subtle;
}
.icon-tile {
  @apply relative w-full flex flex-col items-center gap-2 rounded-tile border border-transparent bg-surface-sunken p-3 pt-4 transition-colors hover:border-accent-border;
  @apply focus-visible:outline focus-visible:outline-2 outline-focus;
}
.icon-row {
  @apply flex flex-1 min-w-0 items-center gap-3 rounded-tile border border-transparent p-2 transition-colors hover:bg-fill-hover;
  @apply focus-visible:outline focus-visible:outline-2 outline-focus;
}
.icon-tile-on {
  @apply border-line-selected bg-accent-subtle;
}
.icon-img {
  @apply flex-shrink-0;
}
.icon-check {
  @apply absolute top-1.5 left-1.5 flex items-center justify-center w-5 h-5 rounded-pill bg-accent text-ink-on-accent;
}
.icon-actions {
  @apply absolute top-0 right-0 flex opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100;
}
.swatch-btn {
  @apply w-10 h-10 overflow-hidden rounded-pill border border-line-control;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 outline-focus;
}
.category-btn {
  @apply w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-control text-sm text-left text-ink-secondary transition-colors hover:bg-fill-hover hover:text-ink-strong;
  @apply focus-visible:outline focus-visible:outline-2 outline-focus;
}
.category-btn-on {
  @apply bg-accent-subtle text-accent-text;
}
</style>
