<template>
  <PageShell>
    <PageHero
      :back="{ to: '/tools', label: 'Tools' }"
      title="Lorem ipsum generator"
      lead="Generate placeholder text for your designs. Create paragraphs, words, sentences, or lists with customizable options."
      spot="tools/lorem-ipsum-generator"
      size="tool"
    />

    <PageSection title="Generation settings" description="Pick a variant, what to generate and how much.">
      <UiPanel>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
          <UiSelect v-model="variant" label="Variant" :options="variantOptions" />
          <UiSelect v-model="type" label="Type" :options="typeOptions" />
          <UiInput v-model="count" type="number" label="Count" min="1" :max="MAX_COUNT" />
          <UiButton variant="primary" icon="autorenew" class="w-full" @click="generate">Generate</UiButton>
        </div>

        <fieldset class="mt-6">
          <legend class="text-sm font-medium text-ink-strong mb-3">HTML formatting</legend>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <UiCheckbox v-for="option in htmlOptionList" :key="option.key" v-model="htmlOptions[option.key]" :label="option.label" />
          </div>
        </fieldset>
      </UiPanel>
    </PageSection>

    <PageSection title="Generated text" description="The HTML and how it renders." divided>
      <template #actions>
        <UiButton variant="secondary" icon="content_copy" :disabled="!output" @click="copyToClipboard">Copy</UiButton>
      </template>
      <InlineNotice :notice="notice" class="mb-4" @dismiss="clearNotice" />
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <UiTextarea v-model="output" label="HTML code" readonly mono rows="10" class="resize-none" />
        <div>
          <p :id="previewLabelId" class="text-sm font-medium text-ink-strong mb-2">Preview</p>
          <div class="preview-pane" role="region" :aria-labelledby="previewLabelId" tabindex="0">
            <div v-if="output" v-html="previewHtml"></div>
            <p v-else class="text-ink-muted italic">Generated text will appear here...</p>
          </div>
        </div>
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { ref, computed, onMounted, useId } from 'vue';
import InlineNotice from '../components/InlineNotice.vue';
import { PageHero, PageSection, PageShell, UiButton, UiCheckbox, UiInput, UiPanel, UiSelect, UiTextarea } from '../components/ui';
import { useNotice } from '../composables/useNotice.js';

const { notice, showNotice, clearNotice } = useNotice();
const MAX_COUNT = 100;
const previewLabelId = `lorem-preview-${useId()}`;
const variant = ref('classic');
const type = ref('paragraphs');
const count = ref(3);
const output = ref('');
const outputIsHtml = ref(false);
const htmlOptions = ref({
  links: false,
  bold: false,
  italic: false,
  headers: false,
  unorderedLists: false,
  orderedLists: false,
  definitionLists: false,
  blockquotes: false,
  code: false
});

const htmlOptionList = [
  { key: 'links', label: 'Links' },
  { key: 'bold', label: 'Bold' },
  { key: 'italic', label: 'Italic' },
  { key: 'headers', label: 'Headers' },
  { key: 'unorderedLists', label: 'Unordered lists' },
  { key: 'orderedLists', label: 'Ordered lists' },
  { key: 'definitionLists', label: 'Definition lists' },
  { key: 'blockquotes', label: 'Block quotes' },
  { key: 'code', label: 'Code/Pre' },
];

const variantOptions = [
  { value: 'classic', label: 'Classic Lorem Ipsum' },
  { value: 'bacon', label: 'Bacon Ipsum' },
  { value: 'hipster', label: 'Hipster Ipsum' },
  { value: 'corporate', label: 'Corporate Ipsum' },
  { value: 'cupcake', label: 'Cupcake Ipsum' },
  { value: 'cat', label: 'Cat Ipsum' },
  { value: 'zombie', label: 'Zombie Ipsum' }
];

const typeOptions = [
  { value: 'paragraphs', label: 'Paragraphs' },
  { value: 'words', label: 'Words' },
  { value: 'sentences', label: 'Sentences' },
  { value: 'lists', label: 'Lists' }
];

// Variant text corpora
const variants = {
  classic: {
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    start: 'Lorem ipsum'
  },
  bacon: {
    text: 'Bacon ipsum dolor amet pork belly brisket shankle, ribeye capicola ham hock turducken. Sirloin pork chop bresaola, beef ribs jerky pastrami pork belly. T-bone pork chop brisket, beef ribs jerky pastrami pork belly. Short ribs pork chop brisket, beef ribs jerky pastrami pork belly. T-bone pork chop brisket, beef ribs jerky pastrami pork belly.',
    start: 'Bacon ipsum'
  },
  hipster: {
    text: 'Hipster ipsum dolor amet craft beer activated charcoal, sustainable pug aesthetic cold-pressed. Tote bag shabby chic pug, activated charcoal craft beer sustainable. Tote bag shabby chic pug, activated charcoal craft beer sustainable. Tote bag shabby chic pug, activated charcoal craft beer sustainable. Tote bag shabby chic pug, activated charcoal craft beer sustainable.',
    start: 'Hipster ipsum'
  },
  corporate: {
    text: 'Corporate ipsum dolor sit amet, leverage agile frameworks to provide a robust synopsis. High-level overviews value proposition. Iterative approaches to corporate strategy foster collaborative thinking. Organically grow the holistic world view of disruptive innovation. Bring to the table win-win survival strategies.',
    start: 'Corporate ipsum'
  },
  cupcake: {
    text: 'Cupcake ipsum dolor sit amet, candy canes marshmallow. Jelly beans chocolate bar candy canes marshmallow. Jelly beans chocolate bar candy canes marshmallow. Jelly beans chocolate bar candy canes marshmallow. Jelly beans chocolate bar candy canes marshmallow.',
    start: 'Cupcake ipsum'
  },
  cat: {
    text: 'Cat ipsum dolor sit amet, meow meow meow. Purr purr purr, meow meow meow. Purr purr purr, meow meow meow. Purr purr purr, meow meow meow. Purr purr purr, meow meow meow. Purr purr purr, meow meow meow.',
    start: 'Cat ipsum'
  },
  zombie: {
    text: 'Zombie ipsum reversus ab viral inferno, nam rick grimes malum cerebro. De carne lumbering animata corpora quaeritis. Summus brains sit, morbo vel maleficia? De apocalypsi gorger omero undead survivor dictum mauris. Hi mindless mortuis soulless creaturas, imo evil stalking monstra adventus resi dentevil vultus comedat cerebella viventium.',
    start: 'Zombie ipsum'
  }
};

const getCurrentVariant = () => {
  return variants[variant.value] || variants.classic;
};

// Everything placed into the generated HTML is escaped first, so the preview
// (rendered with v-html) can only ever contain the tags this generator adds.
const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const hasHtmlOptions = () => Object.values(htmlOptions.value).some(Boolean);

const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1);
const cleanWord = (word) => word.replace(/[.,!?;:]/g, '');

// Count from the input, clamped to 1..MAX_COUNT (the input can be empty or out of range).
const safeCount = () => {
  const n = Math.floor(Number(count.value));
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, MAX_COUNT);
};

// Randomly apply inline HTML formatting to words (input is plain, unescaped text)
const applyHTMLFormatting = (text) => {
  const words = text.split(/(\s+)/);
  return words
    .map((word) => {
      if (!word.trim()) {
        return word; // Preserve whitespace
      }

      if (!hasHtmlOptions()) return word; // plain text; escaped for the preview
      let formatted = escapeHtml(word);
      const rand = Math.random();

      // Only one of code/link per word to avoid nesting issues
      if (htmlOptions.value.code && rand < 0.15) {
        formatted = `<code>${formatted}</code>`;
      } else if (htmlOptions.value.links && rand < 0.2) {
        formatted = `<a href="#">${formatted}</a>`;
      } else {
        // Can combine bold and italic
        if (htmlOptions.value.bold && Math.random() < 0.3) {
          formatted = `<strong>${formatted}</strong>`;
        }
        if (htmlOptions.value.italic && Math.random() < 0.3) {
          formatted = `<em>${formatted}</em>`;
        }
      }
      return formatted;
    })
    .join('');
};

// Build an HTML list of the given words, choosing randomly among the enabled list types.
const buildHtmlList = (items) => {
  const kinds = [];
  if (htmlOptions.value.unorderedLists) kinds.push('ul');
  if (htmlOptions.value.orderedLists) kinds.push('ol');
  if (htmlOptions.value.definitionLists) kinds.push('dl');
  if (kinds.length === 0 || items.length === 0) return '';
  const kind = kinds[Math.floor(Math.random() * kinds.length)];
  const labels = items.map((item) => escapeHtml(capitalize(cleanWord(item))));

  if (kind === 'dl') {
    const rows = [];
    for (let i = 0; i < labels.length; i += 2) {
      rows.push(`  <dt>${labels[i]}</dt>`);
      rows.push(`  <dd>${labels[i + 1] ?? labels[i]} description text.</dd>`);
    }
    return `<dl>\n${rows.join('\n')}\n</dl>`;
  }
  return `<${kind}>\n${labels.map((label) => `  <li>${label}</li>`).join('\n')}\n</${kind}>`;
};

const pickDistinct = (n, used) => {
  const free = [];
  for (let i = 0; i < n; i++) if (!used.has(i)) free.push(i);
  if (free.length === 0) return -1;
  const index = free[Math.floor(Math.random() * free.length)];
  used.add(index);
  return index;
};

const stripTags = (html) => html.replace(/<[^>]*>/g, '');

// Add block-level elements around/next to the generated paragraphs without
// dropping any of them. `blocks` are already-escaped paragraph strings.
const addBlockElements = (blocks) => {
  const before = blocks.map(() => []);
  const after = blocks.map(() => []);
  const wrapped = [...blocks];
  const used = new Set();

  if (htmlOptions.value.headers) {
    const headerLevels = ['h2', 'h3', 'h4'];
    const numHeaders = Math.max(1, Math.min(Math.floor(blocks.length / 3), 2));
    for (let i = 0; i < numHeaders; i++) {
      const index = pickDistinct(blocks.length, used);
      if (index < 0) break;
      const level = headerLevels[Math.floor(Math.random() * headerLevels.length)];
      const headerText = stripTags(blocks[index]).split(' ').slice(0, 5).join(' ').replace(/[.,!?;:]+$/, '');
      before[index].push(`<${level}>${headerText}</${level}>`);
    }
  }

  const blockIndex = () => Math.floor(Math.random() * blocks.length);

  if (htmlOptions.value.blockquotes && blocks.length > 1 && Math.random() < 0.6) {
    const index = blockIndex();
    wrapped[index] = `<blockquote>${wrapped[index]}</blockquote>`;
  }

  if (htmlOptions.value.code && Math.random() < 0.5) {
    const index = blockIndex();
    const codeText = stripTags(blocks[index]).split(' ').slice(0, 10).join(' ');
    after[index].push(`<pre><code>${codeText}</code></pre>`);
  }

  return blocks
    .flatMap((_, i) => [
      ...before[i],
      wrapped[i].startsWith('<blockquote>') ? wrapped[i] : `<p>${wrapped[i]}</p>`,
      ...after[i],
    ])
    .join('\n\n');
};

const splitSentences = (text) =>
  text
    .split(/[.!?]+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0)
    .map((sentence) => `${sentence}.`);

const generateParagraphs = (num) => {
  const currentVariant = getCurrentVariant();
  const sentences = splitSentences(currentVariant.text);

  const sentencesPerParagraph = 4;
  const paragraphs = [];
  for (let i = 0; i < num; i++) {
    const paragraphSentences = [];
    for (let j = 0; j < sentencesPerParagraph; j++) {
      paragraphSentences.push(sentences[(i * sentencesPerParagraph + j) % sentences.length]);
    }
    paragraphs.push(applyHTMLFormatting(paragraphSentences.join(' ')));
  }

  if (!hasHtmlOptions()) {
    return paragraphs.join('\n\n');
  }

  let result = addBlockElements(paragraphs);
  const listHTML = buildHtmlList(currentVariant.text.split(' ').filter((w) => w.length > 3).slice(0, 5));
  if (listHTML) {
    result += '\n\n' + listHTML;
  }
  return result;
};

// The corpus repeated as needed to produce n words.
const takeWords = (num) => {
  const words = getCurrentVariant().text.split(' ').filter((w) => w.length > 0);
  return Array.from({ length: num }, (_, i) => words[i % words.length]);
};

const generateWords = (num) => applyHTMLFormatting(takeWords(num).join(' '));

const generateSentences = (num) => {
  const sentences = splitSentences(getCurrentVariant().text);
  const result = Array.from({ length: num }, (_, i) => sentences[i % sentences.length]);
  return applyHTMLFormatting(result.join(' '));
};

const generateLists = (num) => {
  const items = takeWords(num);
  const listHTML = buildHtmlList(items);
  if (listHTML) return listHTML;

  // Plain numbered list
  return items.map((word, index) => `${index + 1}. ${capitalize(cleanWord(word))}`).join('\n');
};

const generate = () => {
  const num = safeCount();
  count.value = num;
  let result = '';

  if (type.value === 'paragraphs') {
    result = generateParagraphs(num);
  } else if (type.value === 'words') {
    result = generateWords(num);
  } else if (type.value === 'sentences') {
    result = generateSentences(num);
  } else if (type.value === 'lists') {
    result = generateLists(num);
  }

  output.value = result;
  // A plain numbered list is produced when no list type is enabled.
  outputIsHtml.value = hasHtmlOptions() && /</.test(result);
};

// Output that is plain text (no HTML options, or a plain numbered list) is
// escaped and its line breaks kept; HTML output was escaped while it was built.
const previewHtml = computed(() => {
  const text = output.value;
  if (!text) return '';
  if (outputIsHtml.value) return text;
  return text
    .split(/\n{2,}/)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, '<br>')}</p>`)
    .join('');
});

const copyToClipboard = async () => {
  if (!output.value) return;

  try {
    await navigator.clipboard.writeText(output.value);
    showNotice('Copied to clipboard.', 'success');
  } catch (error) {
    console.error('Failed to copy:', error);
    showNotice('Could not copy to the clipboard. Select the text and copy it manually.', 'error');
  }
};

onMounted(() => {
  // Generate initial text
  generate();
});
</script>

<style scoped>
/* The preview renders the generated HTML */
.preview-pane {
  @apply w-full min-h-48 max-h-72 overflow-y-auto px-4 py-3 rounded-field border border-solid border-line bg-surface-raised text-sm text-ink;
  @apply focus-visible:outline focus-visible:outline-2 outline-focus;
}
.preview-pane :deep(h2) {
  @apply text-xl font-semibold text-ink-strong my-3;
}
.preview-pane :deep(h3) {
  @apply text-lg font-semibold text-ink-strong my-3;
}
.preview-pane :deep(h4) {
  @apply text-base font-semibold text-ink-strong my-3;
}
.preview-pane :deep(p) {
  @apply my-3;
}
.preview-pane :deep(ul),
.preview-pane :deep(ol) {
  @apply my-3 pl-8;
}
.preview-pane :deep(ul) {
  @apply list-disc;
}
.preview-pane :deep(ol) {
  @apply list-decimal;
}
.preview-pane :deep(li) {
  @apply my-2;
}
.preview-pane :deep(dl) {
  @apply my-3;
}
.preview-pane :deep(dt) {
  @apply font-semibold mt-2;
}
.preview-pane :deep(dd) {
  @apply ml-8 mb-2;
}
.preview-pane :deep(blockquote) {
  @apply my-3 mx-8 pl-4 border-0 border-l-4 border-solid border-accent italic;
}
.preview-pane :deep(pre) {
  @apply bg-fill-subtle p-4 rounded-control overflow-x-auto my-3;
}
.preview-pane :deep(code) {
  @apply bg-fill px-1.5 py-0.5 rounded-control font-code text-xs;
}
.preview-pane :deep(pre code) {
  @apply bg-transparent p-0;
}
.preview-pane :deep(a) {
  @apply text-accent-text underline hover:text-accent-hover;
}
.preview-pane :deep(strong) {
  @apply font-semibold;
}
.preview-pane :deep(em) {
  @apply italic;
}
</style>
