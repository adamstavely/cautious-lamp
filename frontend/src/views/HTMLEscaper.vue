<template>
  <PageShell>
    <PageHero
      :back="{ to: '/tools', label: 'Tools' }"
      title="HTML escaper"
      lead="Escape and unescape HTML special characters. Convert HTML entities to their character equivalents and vice versa."
      spot="tools/html-escaper"
      size="tool"
    />

    <PageSection>
      <UiPanel class="mb-6">
        <UiSegmented v-model="conversionMode" label="Conversion mode" :options="modeOptions" />
      </UiPanel>

      <InlineNotice :notice="notice" class="mb-4" @dismiss="clearNotice" />

      <div class="grid lg:grid-cols-2 gap-6">
        <UiPanel title="Input">
          <template #actions>
            <UiButton size="sm" variant="ghost" icon="close" @click="clearInput">Clear</UiButton>
            <UiButton size="sm" variant="secondary" icon="content_copy" @click="copyInput">Copy</UiButton>
          </template>
          <UiTextarea
            v-model="inputText"
            :label="conversionMode === 'escape' ? 'HTML to escape' : 'Escaped HTML to unescape'"
            mono
            rows="12"
            class="resize-none"
            :placeholder="conversionMode === 'escape' ? 'Enter HTML to escape...' : 'Enter escaped HTML to unescape...'"
          />
        </UiPanel>

        <UiPanel title="Output">
          <template #actions>
            <UiButton size="sm" variant="primary" icon="content_copy" @click="copyOutput">Copy</UiButton>
            <UiButton size="sm" variant="secondary" icon="download" @click="downloadOutput">Download</UiButton>
          </template>
          <UiTextarea
            :model-value="outputText"
            :label="conversionMode === 'escape' ? 'Escaped HTML' : 'Unescaped HTML'"
            readonly
            mono
            rows="12"
            class="resize-none"
            placeholder="Converted output will appear here..."
          />
        </UiPanel>
      </div>
    </PageSection>

    <PageSection title="What is HTML escaping" divided>
      <p class="text-sm leading-relaxed text-ink-secondary max-w-3xl">
        HTML escaping is the process of converting special characters in HTML to their corresponding HTML entities. This is essential for displaying HTML code as text, preventing XSS attacks, and ensuring proper rendering in web applications.
      </p>
    </PageSection>

    <PageSection title="Common HTML entities" divided>
      <UiPanel flush>
        <UiTable caption="Common characters and their HTML entities">
          <thead>
            <tr>
              <th scope="col">Character</th>
              <th scope="col">Entity</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entity in commonEntities" :key="entity.entity">
              <td><UiCode>{{ entity.char }}</UiCode></td>
              <td><UiCode>{{ entity.entity }}</UiCode></td>
            </tr>
          </tbody>
        </UiTable>
      </UiPanel>
    </PageSection>

    <PageSection title="Common use cases" divided>
      <ul class="list-disc pl-5 space-y-2 text-sm text-ink-secondary">
        <li>Preventing XSS (Cross-Site Scripting) attacks by escaping user input</li>
        <li>Displaying HTML code as text in documentation or tutorials</li>
        <li>Encoding special characters in URLs and data attributes</li>
        <li>Converting HTML entities back to readable text</li>
        <li>Preparing content for safe storage in databases</li>
      </ul>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { ref, computed } from 'vue';
import InlineNotice from '../components/InlineNotice.vue';
import { PageHero, PageSection, PageShell, UiButton, UiCode, UiPanel, UiSegmented, UiTable, UiTextarea } from '../components/ui';
import { useNotice } from '../composables/useNotice.js';

const { notice, showNotice, clearNotice } = useNotice();
const conversionMode = ref('escape');
const inputText = ref('');

const modeOptions = [
  { value: 'escape', label: 'Escape HTML' },
  { value: 'unescape', label: 'Unescape HTML' },
];

const commonEntities = [
  { char: '<', entity: '&lt;' },
  { char: '>', entity: '&gt;' },
  { char: '&', entity: '&amp;' },
  { char: '"', entity: '&quot;' },
  { char: "'", entity: '&#39;' },
  { char: '©', entity: '&copy;' },
];

const ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const escapeHTML = (text) => text.replace(/[&<>"']/g, (char) => ESCAPE_MAP[char]);

// Named entities recognised when unescaping. Pure string mapping: the input is
// never parsed as HTML, so nothing in it can execute or be injected.
const NAMED_ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: '\u00A0',
  copy: '\u00A9',
  reg: '\u00AE',
  trade: '\u2122',
  hellip: '\u2026',
  mdash: '\u2014',
  ndash: '\u2013',
  lsquo: '\u2018',
  rsquo: '\u2019',
  ldquo: '\u201C',
  rdquo: '\u201D',
  laquo: '\u00AB',
  raquo: '\u00BB',
  deg: '\u00B0',
  euro: '\u20AC',
  pound: '\u00A3',
  yen: '\u00A5',
  cent: '\u00A2',
  sect: '\u00A7',
  middot: '\u00B7',
  bull: '\u2022',
  times: '\u00D7',
  divide: '\u00F7',
};

const toCodePoint = (match, code) => {
  // Valid Unicode scalar values only (no NUL, no surrogates, nothing past U+10FFFF).
  if (Number.isNaN(code) || code <= 0 || code > 0x10ffff || (code >= 0xd800 && code <= 0xdfff)) {
    return match;
  }
  return String.fromCodePoint(code);
};

// Single pass, so "&amp;lt;" becomes "&lt;" (not "<"): escape/unescape round-trip exactly.
const unescapeHTML = (text) =>
  text.replace(/&(?:#[xX]([0-9a-fA-F]+)|#(\d+)|([a-zA-Z][a-zA-Z0-9]*));/g, (match, hex, dec, name) => {
    if (hex !== undefined) return toCodePoint(match, parseInt(hex, 16));
    if (dec !== undefined) return toCodePoint(match, parseInt(dec, 10));
    return Object.prototype.hasOwnProperty.call(NAMED_ENTITIES, name) ? NAMED_ENTITIES[name] : match;
  });

const outputText = computed(() => {
  if (!inputText.value) return '';
  return conversionMode.value === 'escape' ? escapeHTML(inputText.value) : unescapeHTML(inputText.value);
});

const clearInput = () => {
  inputText.value = '';
};

const copyText = async (text, label) => {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    showNotice(`${label} copied to clipboard.`, 'success');
  } catch (error) {
    console.error('Copy failed:', error);
    showNotice('Could not copy to the clipboard. Select the text and copy it manually.', 'error');
  }
};

const copyInput = () => copyText(inputText.value, 'Input');
const copyOutput = () => copyText(outputText.value, 'Output');

const downloadOutput = () => {
  if (!outputText.value) return;

  const blob = new Blob([outputText.value], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `html-${conversionMode.value === 'escape' ? 'escaped' : 'unescaped'}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
</script>
