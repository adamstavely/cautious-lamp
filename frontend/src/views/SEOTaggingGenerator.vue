<template>
  <PageShell>
    <PageHero
      :back="{ to: '/tools', label: 'Tools' }"
      title="SEO tagging generator"
      lead="Generate SEO meta tags, Open Graph tags, and structured data for your web pages. Optimize your content for search engines and social media."
      spot="tools/seo-tagging-generator"
      size="tool"
    />

    <PageSection title="Page details" description="Fill in what you have; empty fields are left out of the tags.">
      <UiPanel>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UiInput v-model="formData.title" label="Page title" placeholder="My Awesome Page" />
          <UiInput v-model="formData.description" label="Description" placeholder="A brief description of the page" />
          <UiInput v-model="formData.url" type="url" label="URL" placeholder="https://example.com/page" />
          <UiInput v-model="formData.image" type="url" label="Image URL" placeholder="https://example.com/image.jpg" />
          <UiInput v-model="formData.siteName" label="Site name" placeholder="My Website" />
          <UiInput v-model="formData.author" label="Author" placeholder="Author Name" />
          <UiInput v-model="formData.keywords" class="md:col-span-2" label="Keywords" hint="Comma-separated" placeholder="keyword1, keyword2, keyword3" />
        </div>

        <fieldset class="mt-6">
          <legend class="text-sm font-medium text-ink-strong mb-3">Tag types</legend>
          <div class="flex flex-wrap gap-x-6 gap-y-3">
            <UiCheckbox v-for="option in tagTypeOptions" :key="option.value" v-model="tagTypes" :value="option.value" :label="option.label" />
          </div>
        </fieldset>

        <template #footer>
          <UiButton variant="primary" icon="sell" @click="generate">Generate tags</UiButton>
        </template>
      </UiPanel>
    </PageSection>

    <PageSection title="Generated tags" description="Paste these into the page's head." divided>
      <InlineNotice :notice="notice" class="mb-4" @dismiss="clearNotice" />
      <UiCodeBlock
        v-if="output"
        :code="output"
        label="HTML"
        @copied="showNotice('Copied to clipboard.', 'success')"
        @copy-failed="showNotice('Could not copy to the clipboard.', 'error')"
      />
      <UiEmptyState v-else title="No tags yet" body="Fill in the page details and choose Generate tags." />
    </PageSection>
  </PageShell>
</template>

<script setup>
import { ref } from 'vue';
import InlineNotice from '../components/InlineNotice.vue';
import { PageHero, PageSection, PageShell, UiButton, UiCheckbox, UiCodeBlock, UiEmptyState, UiInput, UiPanel } from '../components/ui';
import { useNotice } from '../composables/useNotice.js';

const { notice, showNotice, clearNotice } = useNotice();
const tagTypeOptions = [
  { value: 'meta', label: 'Meta tags' },
  { value: 'og', label: 'Open Graph' },
  { value: 'twitter', label: 'Twitter cards' },
  { value: 'jsonld', label: 'JSON-LD' },
];
const tagTypes = ref(['meta', 'og', 'twitter', 'jsonld']);
const formData = ref({
  title: '',
  description: '',
  url: '',
  image: '',
  siteName: '',
  author: '',
  keywords: ''
});
const output = ref('');

const generateMetaTags = () => {
  const tags = [];
  
  if (formData.value.title) {
    tags.push(`<meta name="title" content="${escapeHtml(formData.value.title)}">`);
    tags.push(`<title>${escapeHtml(formData.value.title)}</title>`);
  }
  
  if (formData.value.description) {
    tags.push(`<meta name="description" content="${escapeHtml(formData.value.description)}">`);
  }
  
  if (formData.value.keywords) {
    tags.push(`<meta name="keywords" content="${escapeHtml(formData.value.keywords)}">`);
  }
  
  if (formData.value.author) {
    tags.push(`<meta name="author" content="${escapeHtml(formData.value.author)}">`);
  }
  
  return tags.join('\n');
};

const generateOpenGraphTags = () => {
  const tags = [];
  
  tags.push('<meta property="og:type" content="website">');
  
  if (formData.value.title) {
    tags.push(`<meta property="og:title" content="${escapeHtml(formData.value.title)}">`);
  }
  
  if (formData.value.description) {
    tags.push(`<meta property="og:description" content="${escapeHtml(formData.value.description)}">`);
  }
  
  if (formData.value.url) {
    tags.push(`<meta property="og:url" content="${escapeHtml(formData.value.url)}">`);
  }
  
  if (formData.value.image) {
    tags.push(`<meta property="og:image" content="${escapeHtml(formData.value.image)}">`);
  }
  
  if (formData.value.siteName) {
    tags.push(`<meta property="og:site_name" content="${escapeHtml(formData.value.siteName)}">`);
  }
  
  return tags.join('\n');
};

const generateTwitterTags = () => {
  const tags = [];
  
  tags.push('<meta name="twitter:card" content="summary_large_image">');
  
  if (formData.value.title) {
    tags.push(`<meta name="twitter:title" content="${escapeHtml(formData.value.title)}">`);
  }
  
  if (formData.value.description) {
    tags.push(`<meta name="twitter:description" content="${escapeHtml(formData.value.description)}">`);
  }
  
  if (formData.value.image) {
    tags.push(`<meta name="twitter:image" content="${escapeHtml(formData.value.image)}">`);
  }
  
  return tags.join('\n');
};

const generateJSONLD = () => {
  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'WebPage'
  };
  
  if (formData.value.title) {
    jsonld.name = formData.value.title;
  }
  
  if (formData.value.description) {
    jsonld.description = formData.value.description;
  }
  
  if (formData.value.url) {
    jsonld.url = formData.value.url;
  }
  
  if (formData.value.author) {
    jsonld.author = {
      '@type': 'Person',
      name: formData.value.author
    };
  }
  
  // Escape <, >, & and the JS line separators so a value such as
  // a closing script tag cannot end the script element early.
  const json = JSON.stringify(jsonld, null, 2)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
  return `<script type="application/ld+json">\n${json}\n<\/script>`;
};

// Escape for both text content and double- or single-quoted attribute values
// (every tag here puts the value inside content="...").
const escapeHtml = (text) => String(text ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const generate = () => {
  const sections = [];
  
  if (tagTypes.value.includes('meta')) {
    sections.push('<!-- Meta Tags -->');
    sections.push(generateMetaTags());
  }
  
  if (tagTypes.value.includes('og')) {
    if (sections.length > 0) sections.push('');
    sections.push('<!-- Open Graph Tags -->');
    sections.push(generateOpenGraphTags());
  }
  
  if (tagTypes.value.includes('twitter')) {
    if (sections.length > 0) sections.push('');
    sections.push('<!-- Twitter Card Tags -->');
    sections.push(generateTwitterTags());
  }
  
  if (tagTypes.value.includes('jsonld')) {
    if (sections.length > 0) sections.push('');
    sections.push('<!-- JSON-LD Structured Data -->');
    sections.push(generateJSONLD());
  }
  
  output.value = sections.join('\n');
};

</script>
