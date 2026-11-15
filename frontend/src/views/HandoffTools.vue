<template>
  <PageShell>
    <PageHero
      :back="{ to: '/review', label: 'Review' }"
      title="Design-dev handoff"
      lead="Read the specs out of a design, match every value to the nearest design-system token, and export a handoff developers can build from."
      spot="site/handoff-tools"
      size="tool"
    />

    <InlineNotice :notice="notice" class="mb-6" @dismiss="clearNotice" />

    <PageSection title="1. Add the design" :description="`Upload or paste ${SUPPORTED_UPLOADS}. In Figma, Sketch or Illustrator, export the frame as SVG, or use Copy as SVG and paste it here.`">
      <div class="grid gap-6 lg:grid-cols-2">
        <UiPanel title="Upload">
          <UiFileDropZone
            label="Design file"
            :file="uploadedFile"
            accept=".svg,image/svg+xml,.json,application/json"
            prompt="Drop an SVG or token JSON file here, or choose one."
            :hint="SUPPORTED_UPLOADS"
            :error="uploadError"
            @select="selectDesignFile"
            @remove="clearDesign"
          />
        </UiPanel>
        <UiPanel title="Or paste">
          <div class="flex flex-col gap-4">
            <UiTextarea v-model="pastedText" label="SVG markup or token JSON" rows="6" mono />
            <div>
              <UiButton icon="scan-search" :disabled="!pastedText.trim()" @click="readPasted">Read specs</UiButton>
            </div>
          </div>
        </UiPanel>
      </div>
    </PageSection>

    <template v-if="spec">
      <PageSection title="2. Specs and tokens" :description="specDescription" divided>
        <template #actions>
          <UiButton size="sm" variant="ghost" icon="refresh-cw" :loading="tokensLoading" @click="loadDesignSystem">Reload tokens</UiButton>
        </template>

        <UiCallout v-if="tokensError" tone="danger" title="Couldn't load the design system's tokens" class="mb-4">
          {{ tokensError }} The values below are read from the design, but can't be matched to tokens until the tokens load.
        </UiCallout>

        <div v-if="spec.width || spec.height" class="mb-6 grid gap-4 sm:grid-cols-3">
          <UiStat icon="ruler" label="Width" :value="spec.width ? `${spec.width}px` : 'Not set'" />
          <UiStat icon="ruler" label="Height" :value="spec.height ? `${spec.height}px` : 'Not set'" />
          <UiStat icon="badge-check" label="Values on a token" :value="`${matchedCount} of ${matches.length}`" />
        </div>

        <UiPanel flush>
          <UiEmptyState v-if="!matches.length" title="No values found" body="The design has no colours, fonts or sizes this tool can read." :bordered="false" />
          <UiTable v-else caption="Design values and their nearest design-system tokens">
            <thead>
              <tr>
                <th scope="col">Kind</th>
                <th scope="col">Design value</th>
                <th scope="col">Uses</th>
                <th scope="col">Token</th>
                <th scope="col">Match</th>
                <th scope="col"><span class="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(match, index) in matches" :key="`${match.kind}-${match.value}-${index}`">
                <td class="whitespace-nowrap">{{ KIND_LABELS[match.kind] }}</td>
                <td class="whitespace-nowrap">
                  <span class="flex items-center gap-2">
                    <UiSwatch v-if="match.kind === 'color'" :color="match.value" size="sm" />
                    <UiCode>{{ formatSpecValue(match.kind, match.value) }}</UiCode>
                  </span>
                  <span v-if="match.names?.length" class="block text-xs text-ink-muted">{{ match.names.join(', ') }}</span>
                </td>
                <td>{{ match.count }}</td>
                <td>
                  <template v-if="match.token">
                    <UiCode>{{ match.token }}</UiCode>
                    <span class="block text-xs text-ink-muted">{{ match.tokenValue }}</span>
                  </template>
                  <span v-else class="text-sm text-ink-muted">{{ match.nearest ? `Nearest is ${match.nearest}, too far` : 'No token of this kind' }}</span>
                </td>
                <td class="whitespace-nowrap">
                  <UiChip :tone="MATCH_TONES[match.match]">{{ MATCH_LABELS[match.match] }}</UiChip>
                  <span v-if="match.match === 'close'" class="block text-xs text-ink-muted">{{ distanceText(match) }}</span>
                </td>
                <td>
                  <UiButton v-if="match.token" size="sm" variant="ghost" icon="copy" icon-only :label="`Copy ${match.token}`" @click="copyToken(match.token)" />
                </td>
              </tr>
            </tbody>
          </UiTable>
        </UiPanel>

        <UiPanel v-if="spec.texts.length" title="Text in the design" class="mt-6">
          <ul class="list-disc pl-5 text-sm text-ink">
            <li v-for="(text, index) in spec.texts" :key="index">{{ text }}</li>
          </ul>
        </UiPanel>
      </PageSection>

      <PageSection title="3. Code" description="CSS for the design's values, using design-system tokens where they match. Values with no token stay as they are, marked for review." divided>
        <div class="mb-4 w-64">
          <UiSelect v-model="codeFormat" label="Format" :options="codeFormats" />
        </div>
        <UiCodeBlock :code="generatedCode" :label="codeFormats.find((f) => f.value === codeFormat)?.label ?? 'Code'" @copy-failed="showNotice('Could not copy to the clipboard.', 'error')" />
      </PageSection>

      <PageSection title="4. Similar components" description="Design-system components the design names in its layers, file name or text. Reuse one before building another." divided>
        <UiSpinner v-if="componentsLoading" label="Loading components…" />
        <UiCallout v-else-if="componentsError" tone="danger" title="Couldn't load the components">{{ componentsError }}</UiCallout>
        <ul v-else-if="similarComponents.length" class="flex flex-col gap-3">
          <li v-for="{ component, reason } in similarComponents" :key="component.id" class="spec-row">
            <div class="min-w-0 flex-1">
              <p class="font-medium text-ink-strong">{{ component.name }}</p>
              <p class="text-sm text-ink-secondary">{{ component.description }}</p>
              <p class="text-xs text-ink-muted">Found by: {{ reason }}</p>
            </div>
            <UiButton size="sm" :to="componentRoute(component)" trailing-icon="arrow-right">
              {{ COMPONENT_ROUTES[component.id] ? 'View component' : 'Open the component library' }}<span class="sr-only">: {{ component.name }}</span>
            </UiButton>
          </li>
        </ul>
        <p v-else class="text-sm text-ink-muted">No design-system component is named in this design.</p>
      </PageSection>

      <PageSection title="5. Export" description="Download the handoff with every value and its token." divided>
        <div class="flex flex-wrap items-end gap-3">
          <div class="w-64">
            <UiSelect v-model="exportFormat" label="Format" :options="exportFormats" />
          </div>
          <UiButton variant="primary" icon="download" :loading="exporting" @click="downloadHandoff">Download</UiButton>
        </div>
      </PageSection>
    </template>
  </PageShell>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import InlineNotice from '../components/InlineNotice.vue';
import { useNotice } from '../composables/useNotice.js';
import apiClient, { apiErrorMessage } from '../services/api.js';
import {
  PageHero,
  PageSection,
  PageShell,
  UiButton,
  UiCallout,
  UiChip,
  UiCode,
  UiCodeBlock,
  UiEmptyState,
  UiFileDropZone,
  UiPanel,
  UiSelect,
  UiSpinner,
  UiStat,
  UiSwatch,
  UiTable,
  UiTextarea,
} from '../components/ui';
import { fromDesignSystemTokens } from '../utils/designTokens.js';
import {
  KIND_LABELS,
  SUPPORTED_UPLOADS,
  findSimilarComponents,
  formatSpecValue,
  handoffHtml,
  handoffMarkdown,
  handoffPdf,
  matchToTokens,
  parseSvgSpec,
  parseTokenSpec,
  unsupportedMessage,
  uploadKind,
} from '../utils/handoffSpec.js';

const { notice, showNotice, clearNotice } = useNotice();

const MATCH_LABELS = { exact: 'Exact', close: 'Nearest', none: 'No match' };
const MATCH_TONES = { exact: 'success', close: 'warning', none: 'neutral' };
// Component pages that exist; every other component links to the library
const COMPONENT_ROUTES = { button: '/components/buttons', 'color-picker': '/components/color-picker' };

const codeFormats = [
  { value: 'css', label: 'CSS' },
  { value: 'scss', label: 'SCSS' },
  { value: 'json', label: 'JSON spec' },
];
const exportFormats = [
  { value: 'html', label: 'HTML page' },
  { value: 'pdf', label: 'PDF document' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'json', label: 'JSON spec' },
];

const uploadedFile = ref(null);
const uploadError = ref('');
const pastedText = ref('');
const spec = ref(null);
const codeFormat = ref('css');
const exportFormat = ref('html');
const exporting = ref(false);

const designTokens = ref([]);
const tokensLoading = ref(false);
const tokensError = ref('');
const components = ref([]);
const componentsLoading = ref(false);
const componentsError = ref('');

const loadDesignSystem = async () => {
  tokensLoading.value = true;
  tokensError.value = '';
  try {
    const { data } = await apiClient.get('/api/v1/tokens');
    designTokens.value = fromDesignSystemTokens(data.tokens ?? []);
  } catch (error) {
    tokensError.value = apiErrorMessage(error, 'The token library did not answer.');
  } finally {
    tokensLoading.value = false;
  }
};

const loadComponents = async () => {
  componentsLoading.value = true;
  componentsError.value = '';
  try {
    const { data } = await apiClient.get('/api/v1/components');
    components.value = data.components ?? [];
  } catch (error) {
    componentsError.value = apiErrorMessage(error, 'The component library did not answer.');
  } finally {
    componentsLoading.value = false;
  }
};

const readSpec = (text, name, kind) => {
  try {
    spec.value = kind === 'svg' ? parseSvgSpec(text, name) : parseTokenSpec(text, name);
    return true;
  } catch (error) {
    spec.value = null;
    uploadError.value = error.message;
    return false;
  }
};

const selectDesignFile = async (file) => {
  uploadedFile.value = file;
  uploadError.value = '';
  const kind = uploadKind(file);
  if (!kind) {
    spec.value = null;
    uploadError.value = unsupportedMessage(file);
    return;
  }
  let text;
  try {
    text = await (typeof file.text === 'function' ? file.text() : new Response(file).text());
  } catch {
    uploadError.value = `Couldn't read ${file.name}.`;
    return;
  }
  if (readSpec(text, file.name, kind)) showNotice(`Read ${spec.value.values.length} values from ${file.name}.`, 'success');
};

const readPasted = () => {
  uploadedFile.value = null;
  uploadError.value = '';
  const text = pastedText.value.trim();
  const kind = text.startsWith('<') ? 'svg' : 'tokens';
  if (readSpec(text, kind === 'svg' ? 'pasted.svg' : 'pasted-tokens.json', kind)) showNotice(`Read ${spec.value.values.length} values.`, 'success');
  else showNotice(uploadError.value, 'error');
};

const clearDesign = () => {
  uploadedFile.value = null;
  uploadError.value = '';
  spec.value = null;
};

const matches = computed(() => (spec.value ? matchToTokens(spec.value.values, designTokens.value) : []));
const matchedCount = computed(() => matches.value.filter((m) => m.token).length);
const similarComponents = computed(() => (spec.value ? findSimilarComponents(spec.value, components.value) : []));

const specDescription = computed(() => {
  if (!spec.value) return '';
  const what = spec.value.kind === 'svg' ? 'Read from the SVG' : `Read from ${spec.value.tokenCount} tokens`;
  return `${what} (${spec.value.source}). Each value is matched to the nearest design-system token: exact, nearest (close but not equal), or no match.`;
});

const distanceText = (match) => (match.kind === 'color' ? `Colour difference ${match.distance}` : `${match.distance}px away`);

const componentRoute = (component) => COMPONENT_ROUTES[component.id] ?? '/components';

// Token name -> CSS custom property / Sass variable
const cssVar = (token) => `var(--${token.replace(/\./g, '-')})`;
const sassVar = (token) => `$${token.replace(/\./g, '-')}`;

const specJson = computed(() => {
  if (!spec.value) return '';
  const { source, width, height, texts } = spec.value;
  return JSON.stringify({ source, width, height, values: matches.value.map(({ kind, value, count, token, match }) => ({ kind, value, count, token, match })), texts }, null, 2);
});

const generatedCode = computed(() => {
  if (!spec.value) return '';
  if (codeFormat.value === 'json') return specJson.value;
  const toVar = codeFormat.value === 'scss' ? sassVar : cssVar;
  const use = (match) => (match?.token ? `${toVar(match.token)}; /* ${formatSpecValue(match.kind, match.value)} */` : `${formatSpecValue(match.kind, match.value)}; /* no token: review */`);
  const first = (kind) => matches.value.find((m) => m.kind === kind);
  const lines = [`/* From ${spec.value.source} */`, '.component {'];
  if (spec.value.width) lines.push(`  width: ${spec.value.width}px;`);
  if (spec.value.height) lines.push(`  height: ${spec.value.height}px;`);
  if (first('dimension') && spec.value.kind === 'svg') lines.push(`  border-radius: ${use(first('dimension'))}`);
  for (const [kind, prop] of [['fontFamily', 'font-family'], ['fontSize', 'font-size'], ['fontWeight', 'font-weight']]) {
    if (first(kind)) lines.push(`  ${prop}: ${use(first(kind))}`);
  }
  lines.push('}');
  const colors = matches.value.filter((m) => m.kind === 'color');
  if (colors.length) {
    lines.push('', '/* Colours, most used first: apply each where the design uses it */');
    colors.forEach((m) => lines.push(`/* ${m.value} (${m.count}×) -> ${m.token ? toVar(m.token) : 'no token: review'} */`));
  }
  return lines.join('\n');
});

const copyToken = async (token) => {
  try {
    await navigator.clipboard.writeText(token);
    showNotice(`Copied ${token}.`, 'success');
  } catch {
    showNotice('Could not copy to the clipboard.', 'error');
  }
};

const saveBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const downloadHandoff = async () => {
  if (!spec.value) return;
  const base = `handoff-${spec.value.source.replace(/\.[^.]+$/, '').replace(/[^\w-]+/g, '-')}`;
  exporting.value = true;
  try {
    if (exportFormat.value === 'pdf') {
      const doc = await handoffPdf(spec.value, matches.value);
      doc.save(`${base}.pdf`);
    } else if (exportFormat.value === 'html') {
      saveBlob(new Blob([handoffHtml(spec.value, matches.value)], { type: 'text/html' }), `${base}.html`);
    } else if (exportFormat.value === 'markdown') {
      saveBlob(new Blob([handoffMarkdown(spec.value, matches.value)], { type: 'text/markdown' }), `${base}.md`);
    } else {
      saveBlob(new Blob([specJson.value], { type: 'application/json' }), `${base}.json`);
    }
  } catch {
    showNotice("Couldn't create the export.", 'error');
  } finally {
    exporting.value = false;
  }
};

onMounted(() => {
  loadDesignSystem();
  loadComponents();
});
</script>

<style scoped>
.spec-row {
  @apply flex flex-wrap items-center gap-3 rounded-tile border border-line bg-surface-sunken p-4;
}
</style>
