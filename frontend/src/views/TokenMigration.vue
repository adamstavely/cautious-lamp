<template>
  <PageShell width="wide">
    <PageHero
      :back="{ to: '/tokens', label: 'Tokens' }"
      title="Token migration"
      lead="Rename design-token references in your code. Build a rename map from your token files, add the files that use them, check the diff, and download the changed files."
      spot="foundations/token-migration"
      size="tool"
    />

    <UiCallout title="Everything happens in this browser" class="mb-6">
      Your files are read here and never uploaded. No server, repository or token library is changed: you get a zip of the rewritten files to review and commit yourself.
    </UiCallout>

    <InlineNotice :notice="notice" class="mb-6" @dismiss="clearNotice" />

    <PageSection title="1. Rename map" description="Where the old and new token names come from. Renames are paired by value; anything left over you can name by hand.">
      <div class="flex flex-col gap-6">
        <UiSegmented v-model="mapSource" :options="mapSourceOptions" label="Build the map from" />

        <div v-if="mapSource !== 'manual'" class="grid gap-6 lg:grid-cols-2">
          <UiPanel title="Old tokens" description="The token file your code uses today (W3C design tokens or Tokens Studio JSON).">
            <div class="flex flex-col gap-4">
              <UiFileDropZone label="Token file" accept=".json,application/json" :file="oldTokens.file" hint="JSON" @select="(file) => readTokenFile(oldTokens, file)" @remove="clearTokenSet(oldTokens)" />
              <UiTextarea v-model="oldTokens.text" label="Or paste the JSON" rows="5" mono @update:model-value="oldTokens.file = null" />
              <p v-if="oldTokens.error" class="text-sm text-danger">{{ oldTokens.error }}</p>
            </div>
          </UiPanel>

          <UiPanel v-if="mapSource === 'files'" title="New tokens" description="The token file you're moving to.">
            <div class="flex flex-col gap-4">
              <UiFileDropZone label="Token file" accept=".json,application/json" :file="newTokens.file" hint="JSON" @select="(file) => readTokenFile(newTokens, file)" @remove="clearTokenSet(newTokens)" />
              <UiTextarea v-model="newTokens.text" label="Or paste the JSON" rows="5" mono @update:model-value="newTokens.file = null" />
              <p v-if="newTokens.error" class="text-sm text-danger">{{ newTokens.error }}</p>
            </div>
          </UiPanel>

          <UiPanel v-else title="New tokens" description="The design system's current tokens.">
            <UiSpinner v-if="designSystem.loading" label="Loading the design system's tokens…" />
            <UiCallout v-else-if="designSystem.error" tone="danger" title="Couldn't load the design system's tokens">
              {{ designSystem.error }}
              <template #actions>
                <UiButton size="sm" icon="refresh-cw" @click="loadDesignSystemTokens">Try again</UiButton>
              </template>
            </UiCallout>
            <p v-else class="text-sm text-ink-secondary">{{ designSystem.tokens.length }} tokens loaded from the design system.</p>
          </UiPanel>
        </div>

        <div v-if="mapSource !== 'manual'">
          <UiButton variant="primary" icon="git-compare" :disabled="!canInfer" @click="findRenames">Find renames</UiButton>
        </div>

        <UiPanel v-if="inferred" title="Renames found" :description="inferredSummary" flush>
          <UiEmptyState v-if="!inferred.renames.length && !inferred.unmatched.length" title="Nothing to rename" body="Every old token name still exists in the new set." :bordered="false" />
          <UiTable v-else caption="Old token names and their new names">
            <thead>
              <tr>
                <th scope="col">Old name</th>
                <th scope="col">New name</th>
                <th scope="col">Why</th>
                <th scope="col"><span class="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in inferred.renames" :key="`r-${row.from}`">
                <td><UiCode>{{ row.from }}</UiCode></td>
                <td><UiInput v-model="row.to" size="sm" mono hide-label :label="`New name for ${row.from}`" /></td>
                <td class="text-sm text-ink-secondary">{{ row.reason }}</td>
                <td><UiButton icon-only icon="x" variant="ghost" size="sm" :label="`Don't rename ${row.from}`" @click="inferred.renames.splice(index, 1)" /></td>
              </tr>
              <tr v-for="row in inferred.unmatched" :key="`u-${row.name}`">
                <td><UiCode>{{ row.name }}</UiCode></td>
                <td>
                  <UiInput v-model="row.to" size="sm" mono hide-label :label="`New name for ${row.name}`" placeholder="Type a new name, or leave empty" />
                </td>
                <td class="text-sm text-ink-secondary">
                  <template v-if="row.candidates.length">Several tokens share its value: {{ row.candidates.join(', ') }}</template>
                  <template v-else>Removed, and no new token has its value</template>
                </td>
                <td></td>
              </tr>
            </tbody>
          </UiTable>
        </UiPanel>

        <UiPanel title="Renames by hand" description="Add renames, or replace the ones above. One per line as old.name -> new.name, or a JSON object.">
          <UiTextarea v-model="manualText" label="Renames" hide-label rows="4" mono :error="manualErrors.join(' ')" />
          <UiInput v-model="cssPrefix" label="CSS variable prefix (optional)" hint="If your CSS variables have a prefix, such as --ds-color-primary, enter ds-" mono />
        </UiPanel>

        <UiCallout v-if="mapProblems.length" tone="warning" title="Fix the rename map first">
          <ul class="list-disc pl-5">
            <li v-for="problem in mapProblems" :key="problem">{{ problem }}</li>
          </ul>
        </UiCallout>
      </div>
    </PageSection>

    <PageSection title="2. Files" description="The code that uses the tokens: CSS, SCSS, JavaScript, TypeScript, Vue and more." divided>
      <div class="grid gap-6 lg:grid-cols-2">
        <UiPanel title="Add files">
          <UiFileDropZone
            label="Source files"
            multiple
            :accept="sourceAccept"
            prompt="Drop files here, or choose them."
            button-label="Choose files"
            :hint="`Text files: ${SOURCE_EXTENSIONS.map((e) => `.${e}`).join(', ')}`"
            @select="addSourceFile"
          />
        </UiPanel>
        <UiPanel title="Or paste a file">
          <div class="flex flex-col gap-4">
            <UiInput v-model="pasted.name" label="File name" placeholder="button.css" hint="The extension decides which kinds of reference are rewritten." mono />
            <UiTextarea v-model="pasted.text" label="Contents" rows="5" mono />
            <div>
              <UiButton icon="plus" :disabled="!pasted.text.trim() || !isSupportedSource(pasted.name)" @click="addPasted">Add file</UiButton>
            </div>
          </div>
        </UiPanel>
      </div>

      <UiPanel v-if="sourceFiles.length" :title="`${sourceFiles.length} ${sourceFiles.length === 1 ? 'file' : 'files'}`" class="mt-6" flush>
        <template #actions>
          <UiButton size="sm" variant="ghost" icon="trash-2" @click="clearFiles">Remove all</UiButton>
        </template>
        <ul class="divide-y divide-line">
          <li v-for="(file, index) in sourceFiles" :key="file.id" class="flex items-center gap-3 px-4 py-2">
            <AppIcon name="file-code" class="text-ink-muted" />
            <span class="flex-1 truncate font-code text-sm text-ink">{{ file.name }}</span>
            <span class="text-xs text-ink-muted">{{ lineCount(file.text) }} lines</span>
            <UiButton icon-only icon="x" variant="ghost" size="sm" :label="`Remove ${file.name}`" @click="removeFile(index)" />
          </li>
        </ul>
      </UiPanel>
    </PageSection>

    <PageSection title="3. Migrate" description="Rewrite the references, then review every changed line before downloading." divided>
      <template #actions>
        <UiButton variant="primary" icon="play" :disabled="!canMigrate" @click="runMigration">Rewrite references</UiButton>
      </template>

      <p v-if="!canMigrate && !result" class="text-sm text-ink-secondary">{{ migrateBlocker }}</p>

      <template v-if="result">
        <div class="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <UiStat icon="file-code" label="Files changed" :value="`${result.totals.filesChanged} of ${result.totals.files}`" />
          <UiStat icon="arrow-right-left" label="References rewritten" :value="result.totals.replacements" />
          <UiStat icon="diff" label="Lines changed" :value="result.totals.linesChanged" />
          <UiStat
            icon="triangle-alert"
            label="Old names still used"
            :value="result.totals.leftovers"
            :tone="result.totals.leftovers ? 'warning' : 'neutral'"
            hint="Removed tokens with no new name"
          />
        </div>

        <div class="mb-6 flex flex-wrap gap-3">
          <UiButton variant="primary" icon="download" :disabled="!result.totals.filesChanged" :loading="zipping === 'changed'" @click="downloadZip('changed')">Download changed files</UiButton>
          <UiButton icon="download" :loading="zipping === 'original'" @click="downloadZip('original')">Download originals</UiButton>
          <UiButton variant="ghost" icon="undo-2" @click="discardResult">Discard result</UiButton>
        </div>
        <UiCallout class="mb-6" title="Rolling back">
          Nothing outside this page has changed, so there's nothing to undo on a server. Discard the result to start again, or download the originals if you pasted files you haven't saved elsewhere.
        </UiCallout>

        <UiPanel title="References per rename" class="mb-6" flush>
          <UiTable caption="How many references each rename rewrote">
            <thead>
              <tr>
                <th scope="col">Old name</th>
                <th scope="col">New name</th>
                <th scope="col">References</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in result.byRename" :key="row.from">
                <td><UiCode>{{ row.from }}</UiCode></td>
                <td><UiCode>{{ row.to }}</UiCode></td>
                <td>
                  <span v-if="row.count">{{ row.count }}</span>
                  <span v-else class="text-ink-muted">Not used in these files</span>
                </td>
              </tr>
            </tbody>
          </UiTable>
        </UiPanel>

        <div class="flex flex-col gap-4">
          <UiPanel v-for="file in result.files" :key="file.name" :title="file.name" heading-tag="h3" flush>
            <template #actions>
              <UiChip :tone="file.changed ? 'accent' : 'neutral'">
                {{ file.changed ? `${file.replacements.length} ${file.replacements.length === 1 ? 'reference' : 'references'}, ${file.changedLines.length} ${file.changedLines.length === 1 ? 'line' : 'lines'}` : 'No changes' }}
              </UiChip>
            </template>
            <ol v-if="file.changedLines.length" class="diff" :aria-label="`Changes in ${file.name}`">
              <li v-for="change in file.changedLines" :key="change.line" class="diff-hunk">
                <span class="diff-line-number">Line {{ change.line }}</span>
                <span class="diff-removed"><span class="sr-only">Before: </span>- {{ change.before }}</span>
                <span class="diff-added"><span class="sr-only">After: </span>+ {{ change.after }}</span>
              </li>
            </ol>
            <div v-if="file.leftovers.length" class="p-4">
              <UiCallout tone="warning" title="Old names with no new name">
                <ul class="list-disc pl-5">
                  <li v-for="leftover in file.leftovers" :key="`${leftover.line}-${leftover.name}`">
                    Line {{ leftover.line }}: <UiCode>{{ leftover.name }}</UiCode>
                  </li>
                </ul>
              </UiCallout>
            </div>
          </UiPanel>
        </div>
      </template>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import InlineNotice from '../components/InlineNotice.vue';
import {
  PageHero,
  PageSection,
  PageShell,
  UiButton,
  UiCallout,
  UiChip,
  UiCode,
  UiEmptyState,
  UiFileDropZone,
  UiInput,
  UiPanel,
  UiSegmented,
  UiSpinner,
  UiStat,
  UiTable,
  UiTextarea,
} from '../components/ui';
import { useNotice } from '../composables/useNotice.js';
import apiClient, { apiErrorMessage } from '../services/api.js';
import { fromDesignSystemTokens, parseTokenText } from '../utils/designTokens.js';
import {
  SOURCE_EXTENSIONS,
  inferRenames,
  isSupportedSource,
  migrateFiles,
  parseRenameText,
  validateRenames,
  zipFiles,
} from '../utils/tokenMigration.js';

const { notice, showNotice, clearNotice } = useNotice();

const mapSourceOptions = [
  { value: 'files', label: 'Two token files' },
  { value: 'design-system', label: 'A token file and the design system' },
  { value: 'manual', label: 'Renames by hand only' },
];
const mapSource = ref('files');

const tokenSet = () => reactive({ file: null, text: '', error: '' });
const oldTokens = tokenSet();
const newTokens = tokenSet();
const designSystem = reactive({ tokens: [], loading: false, error: '', loaded: false });

const inferred = ref(null);
const manualText = ref('');
const cssPrefix = ref('');

const sourceFiles = ref([]);
const pasted = reactive({ name: '', text: '' });
const sourceAccept = SOURCE_EXTENSIONS.map((ext) => `.${ext}`).join(',');
let nextFileId = 1;

const result = ref(null);
const zipping = ref('');

const readText = (file) => (typeof file.text === 'function' ? file.text() : new Response(file).text());

const readTokenFile = async (set, file) => {
  set.file = file;
  set.error = '';
  try {
    set.text = await readText(file);
  } catch {
    set.error = `Couldn't read ${file.name}.`;
  }
};

const clearTokenSet = (set) => {
  set.file = null;
  set.text = '';
  set.error = '';
};

const loadDesignSystemTokens = async () => {
  designSystem.loading = true;
  designSystem.error = '';
  try {
    const { data } = await apiClient.get('/api/v1/tokens');
    designSystem.tokens = fromDesignSystemTokens(data.tokens ?? []);
    designSystem.loaded = true;
  } catch (error) {
    designSystem.error = apiErrorMessage(error, 'The token library did not answer.');
  } finally {
    designSystem.loading = false;
  }
};

watch(mapSource, (source) => {
  inferred.value = null;
  if (source === 'design-system' && !designSystem.loaded && !designSystem.loading) loadDesignSystemTokens();
});

const canInfer = computed(() => {
  if (!oldTokens.text.trim()) return false;
  return mapSource.value === 'files' ? !!newTokens.text.trim() : designSystem.loaded;
});

const parseSet = (set) => {
  try {
    set.error = '';
    return parseTokenText(set.text);
  } catch (error) {
    set.error = error.message;
    return null;
  }
};

const findRenames = () => {
  const before = parseSet(oldTokens);
  const after = mapSource.value === 'files' ? parseSet(newTokens) : designSystem.tokens;
  if (!before || !after) return;
  const found = inferRenames(before, after);
  inferred.value = {
    ...found,
    renames: found.renames.map((r) => ({ ...r })),
    unmatched: found.unmatched.map((u) => ({ ...u, to: '' })),
  };
  result.value = null;
};

const inferredSummary = computed(() => {
  if (!inferred.value) return '';
  const { renames, unmatched, kept } = inferred.value;
  return `${renames.length} paired by value, ${unmatched.length} without a match, ${kept} unchanged.`;
});

const manual = computed(() => parseRenameText(manualText.value));
const manualErrors = computed(() => manual.value.errors);

// The map the rewrite uses: renames found (as edited), then by hand (which win)
const renameMap = computed(() => {
  const byFrom = new Map();
  if (mapSource.value !== 'manual' && inferred.value) {
    for (const row of inferred.value.renames) if (row.to.trim()) byFrom.set(row.from, row.to.trim());
    for (const row of inferred.value.unmatched) if (row.to.trim()) byFrom.set(row.name, row.to.trim());
  }
  for (const row of manual.value.renames) byFrom.set(row.from, row.to);
  return [...byFrom].map(([from, to]) => ({ from, to }));
});

// Removed tokens still without a new name: reported where code still uses them
const unmatchedNames = computed(() =>
  mapSource.value === 'manual' || !inferred.value ? [] : inferred.value.unmatched.map((row) => row.name).filter((name) => !renameMap.value.some((r) => r.from === name)),
);

const mapProblems = computed(() => validateRenames(renameMap.value));

const addSourceFile = async (file) => {
  if (!isSupportedSource(file.name)) {
    showNotice(`${file.name} isn't a supported source file. Add ${SOURCE_EXTENSIONS.map((e) => `.${e}`).join(', ')} files.`, 'error');
    return;
  }
  try {
    sourceFiles.value.push({ id: nextFileId++, name: file.name, text: await readText(file) });
    result.value = null;
  } catch {
    showNotice(`Couldn't read ${file.name}.`, 'error');
  }
};

const addPasted = () => {
  sourceFiles.value.push({ id: nextFileId++, name: pasted.name.trim(), text: pasted.text });
  pasted.name = '';
  pasted.text = '';
  result.value = null;
};

const removeFile = (index) => {
  sourceFiles.value.splice(index, 1);
  result.value = null;
};

const clearFiles = () => {
  sourceFiles.value = [];
  result.value = null;
};

const lineCount = (text) => text.split('\n').length;

const canMigrate = computed(() => renameMap.value.length > 0 && sourceFiles.value.length > 0 && !mapProblems.value.length && !manualErrors.value.length);
const migrateBlocker = computed(() => {
  if (!renameMap.value.length) return 'Add at least one rename.';
  if (!sourceFiles.value.length) return 'Add the files to migrate.';
  if (mapProblems.value.length || manualErrors.value.length) return 'Fix the rename map first.';
  return '';
});

const runMigration = () => {
  result.value = migrateFiles(sourceFiles.value, renameMap.value, { unmatched: unmatchedNames.value, cssPrefix: cssPrefix.value });
  const { replacements, filesChanged } = result.value.totals;
  showNotice(replacements ? `Rewrote ${replacements} ${replacements === 1 ? 'reference' : 'references'} in ${filesChanged} ${filesChanged === 1 ? 'file' : 'files'}.` : 'No references to these tokens were found.', replacements ? 'success' : 'info');
};

const downloadZip = async (which) => {
  if (!result.value) return;
  zipping.value = which;
  try {
    const entries = which === 'changed'
      ? result.value.files.filter((f) => f.changed).map((f) => ({ name: f.name, text: f.output }))
      : result.value.files.map((f) => ({ name: f.name, text: f.original }));
    const blob = await zipFiles(entries);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = which === 'changed' ? 'token-migration.zip' : 'token-migration-originals.zip';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  } catch {
    showNotice("Couldn't build the zip file.", 'error');
  } finally {
    zipping.value = '';
  }
};

const discardResult = () => {
  result.value = null;
  showNotice('Result discarded. Your files are as you added them.', 'info');
};

onMounted(() => {
  if (mapSource.value === 'design-system') loadDesignSystemTokens();
});
</script>

<style scoped>
.diff {
  @apply divide-y divide-line-faint font-code text-sm;
}
.diff-hunk {
  @apply flex flex-col;
}
.diff-line-number {
  @apply px-4 pt-2 pb-1 text-xs text-ink-muted font-ui;
}
.diff-removed {
  @apply whitespace-pre-wrap break-all bg-danger-bg px-4 py-1 text-danger;
}
.diff-added {
  @apply whitespace-pre-wrap break-all bg-success-bg px-4 py-1 text-success;
}
</style>
