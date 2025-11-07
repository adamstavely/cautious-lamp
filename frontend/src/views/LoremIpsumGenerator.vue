<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative flex">
    <!-- Drawer -->
    <DocumentationDrawer :isOpen="drawerOpen" @close="closeDrawer" @toggle="toggleDrawer" />
    
    <!-- Main Content Area -->
    <div 
      class="flex-1 h-full transition-all duration-300 relative overflow-hidden"
      :style="drawerOpen ? 'margin-left: 256px;' : 'margin-left: 48px;'"
    >
      <!-- Breadcrumbs -->
      <Breadcrumbs />
      
      <div class="h-full overflow-y-auto">
        <div class="p-8">
          <!-- Hero Section -->
          <div class="max-w-7xl mx-auto mb-8">
            <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
              <!-- Background texture/grain effect -->
              <div class="absolute inset-0 opacity-10 texture-pattern"></div>
              
              <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                <div class="flex-1">
                  <div class="flex items-center gap-4 mb-4">
                    <h1 class="text-5xl md:text-6xl font-bold text-white leading-tight">
                      Lorem Ipsum Generator
                    </h1>
                  </div>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-4">
                    Generate placeholder text for your designs. Create paragraphs, words, sentences, or lists with customizable options.
                  </p>
                  <div class="flex items-center gap-4 text-sm text-white/70">
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">text_fields</span>
                      Text Generator
                    </span>
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">update</span>
                      Updated {{ new Date().toLocaleDateString() }}
                    </span>
                  </div>
                </div>
                <div class="hidden md:block flex-shrink-0">
                  <div class="w-64 h-64 relative">
                    <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400">
                      <defs>
                        <linearGradient id="loremGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Stylized text icon -->
                      <rect x="30" y="50" width="140" height="20" rx="4" fill="url(#loremGradient)" opacity="0.4"/>
                      <rect x="30" y="80" width="120" height="20" rx="4" fill="url(#loremGradient)" opacity="0.5"/>
                      <rect x="30" y="110" width="130" height="20" rx="4" fill="url(#loremGradient)" opacity="0.4"/>
                      <rect x="30" y="140" width="100" height="20" rx="4" fill="url(#loremGradient)" opacity="0.5"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Generator Section -->
          <div class="max-w-7xl mx-auto">
            <div 
              class="rounded-lg shadow-lg border p-8"
              :class="isDarkMode 
                ? 'bg-slate-900 border-slate-700' 
                : 'bg-white border-gray-200'"
            >
              <!-- Controls -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <!-- Variant Selection -->
                <div>
                  <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-900'">Variant</label>
                  <Dropdown
                    v-model="variant"
                    :options="variantOptions"
                  />
                </div>

                <!-- Type Selection -->
                <div>
                  <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-900'">Type</label>
                  <Dropdown
                    v-model="type"
                    :options="typeOptions"
                  />
                </div>

                <!-- Count -->
                <div>
                  <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-900'">Count</label>
                  <input
                    v-model.number="count"
                    type="number"
                    min="1"
                    max="100"
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    :class="isDarkMode 
                      ? 'border-slate-600 bg-slate-700 text-gray-100 focus:ring-indigo-400 focus:border-indigo-400' 
                      : 'border-gray-300 bg-white text-gray-900'"
                  />
                </div>

                <!-- Generate Button -->
                <div class="flex items-end">
                  <button
                    @click="generate"
                    class="w-full px-6 py-2 text-white font-medium rounded-lg transition-colors"
                    :class="isDarkMode 
                      ? 'bg-indigo-500 hover:bg-indigo-400' 
                      : 'bg-indigo-600 hover:bg-indigo-700'"
                  >
                    Generate
                  </button>
                </div>
              </div>

              <!-- HTML Formatting Options -->
              <div class="mb-8">
                <label class="block text-sm font-medium mb-3" :class="isDarkMode ? 'text-gray-300' : 'text-gray-900'">HTML Formatting</label>
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      v-model="htmlOptions.links"
                      class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      :class="isDarkMode 
                        ? 'border-slate-600 bg-slate-700 accent-indigo-500' 
                        : 'border-gray-300 bg-white'"
                    />
                    <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Links</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      v-model="htmlOptions.bold"
                      class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      :class="isDarkMode 
                        ? 'border-slate-600 bg-slate-700 accent-indigo-500' 
                        : 'border-gray-300 bg-white'"
                    />
                    <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Bold</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      v-model="htmlOptions.italic"
                      class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      :class="isDarkMode 
                        ? 'border-slate-600 bg-slate-700 accent-indigo-500' 
                        : 'border-gray-300 bg-white'"
                    />
                    <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Italic</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      v-model="htmlOptions.headers"
                      class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      :class="isDarkMode 
                        ? 'border-slate-600 bg-slate-700 accent-indigo-500' 
                        : 'border-gray-300 bg-white'"
                    />
                    <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Headers</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      v-model="htmlOptions.unorderedLists"
                      class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      :class="isDarkMode 
                        ? 'border-slate-600 bg-slate-700 accent-indigo-500' 
                        : 'border-gray-300 bg-white'"
                    />
                    <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Unordered Lists</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      v-model="htmlOptions.orderedLists"
                      class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      :class="isDarkMode 
                        ? 'border-slate-600 bg-slate-700 accent-indigo-500' 
                        : 'border-gray-300 bg-white'"
                    />
                    <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Ordered Lists</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      v-model="htmlOptions.definitionLists"
                      class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      :class="isDarkMode 
                        ? 'border-slate-600 bg-slate-700 accent-indigo-500' 
                        : 'border-gray-300 bg-white'"
                    />
                    <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Definition Lists</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      v-model="htmlOptions.blockquotes"
                      class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      :class="isDarkMode 
                        ? 'border-slate-600 bg-slate-700 accent-indigo-500' 
                        : 'border-gray-300 bg-white'"
                    />
                    <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Block Quotes</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      v-model="htmlOptions.code"
                      class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      :class="isDarkMode 
                        ? 'border-slate-600 bg-slate-700 accent-indigo-500' 
                        : 'border-gray-300 bg-white'"
                    />
                    <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Code/Pre</span>
                  </label>
                </div>
              </div>

              <!-- Output -->
              <div>
                <div class="flex items-center justify-between mb-4">
                  <label class="block text-sm font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-900'">Generated Text</label>
                  <button
                    @click="copyToClipboard"
                    class="px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2"
                    :class="isDarkMode 
                      ? 'text-indigo-400 hover:text-indigo-300' 
                      : 'text-indigo-600 hover:text-indigo-700'"
                  >
                    <span class="material-symbols-outlined text-lg">content_copy</span>
                    Copy
                  </button>
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <!-- HTML Code View -->
                  <div>
                    <label class="block text-xs font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">HTML Code</label>
                    <textarea
                      v-model="output"
                      readonly
                      class="w-full px-4 py-3 border rounded-lg text-sm font-mono resize-none overflow-y-auto"
                      :class="isDarkMode 
                        ? 'border-slate-600 bg-slate-700 text-gray-100' 
                        : 'border-gray-300 bg-gray-50 text-gray-900'"
                      :style="{ minHeight: '200px', maxHeight: '300px' }"
                    ></textarea>
                  </div>
                  <!-- HTML Preview -->
                  <div>
                    <label class="block text-xs font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Preview</label>
                    <div
                      class="w-full px-4 py-3 border rounded-lg text-sm resize-none overflow-y-auto preview-pane"
                      :class="isDarkMode 
                        ? 'border-slate-600 bg-slate-800 text-gray-100' 
                        : 'border-gray-300 bg-white text-gray-900'"
                      :style="{ minHeight: '200px', maxHeight: '300px' }"
                    >
                      <div 
                        v-if="output"
                        v-html="output"
                      ></div>
                      <div 
                        v-else
                        class="text-gray-400 italic"
                      >
                        Generated text will appear here...
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import Dropdown from '../components/Dropdown.vue';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const variant = ref('classic');
const type = ref('paragraphs');
const count = ref(3);
const output = ref('');
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

// Helper function to randomly apply HTML formatting to words
const applyHTMLFormatting = (text) => {
  if (!Object.values(htmlOptions.value).some(v => v)) {
    return text; // No HTML formatting selected
  }

  const words = text.split(/(\s+)/);
  const formattedWords = words.map((word) => {
    if (!word.trim() || word.match(/^\s+$/)) {
      return word; // Preserve whitespace
    }

    let formatted = word;
    const rand = Math.random();

    // Apply formatting with priority: code > links > bold/italic
    // Only one inline format per word to avoid nesting issues
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
  });

  return formattedWords.join('');
};

// Helper to wrap text in block-level HTML elements
const wrapInBlockElements = (content, paragraphs) => {
  if (type.value !== 'paragraphs' || paragraphs.length === 0) {
    return content;
  }

  const parts = content.split('\n\n');
  let result = [...parts];

  // Add headers (only for paragraphs type)
  if (htmlOptions.value.headers && result.length > 0) {
    const headerLevels = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    const numHeaders = Math.min(Math.floor(result.length / 3), 2); // Max 2 headers
    
    const usedIndices = new Set();
    for (let i = 0; i < numHeaders; i++) {
      let headerIndex;
      do {
        headerIndex = Math.floor(Math.random() * result.length);
      } while (usedIndices.has(headerIndex));
      usedIndices.add(headerIndex);
      
      const headerLevel = headerLevels[Math.floor(Math.random() * headerLevels.length)];
      // Extract first few words for header, removing HTML tags
      const headerText = result[headerIndex]
        .replace(/<[^>]*>/g, '')
        .split(' ')
        .slice(0, 5)
        .join(' ');
      
      result[headerIndex] = `<${headerLevel}>${headerText}</${headerLevel}>`;
    }
  }

  // Add blockquotes
  if (htmlOptions.value.blockquotes && result.length > 0 && Math.random() < 0.4) {
    const quoteIndex = Math.floor(Math.random() * result.length);
    result[quoteIndex] = `<blockquote>${result[quoteIndex]}</blockquote>`;
  }

  // Add code blocks (pre/code)
  if (htmlOptions.value.code && result.length > 0 && Math.random() < 0.3) {
    const codeIndex = Math.floor(Math.random() * result.length);
    // Extract text without HTML tags for code block
    const codeText = result[codeIndex]
      .replace(/<[^>]*>/g, '')
      .split(' ')
      .slice(0, 10)
      .join(' ');
    result[codeIndex] = `<pre><code>${codeText}</code></pre>`;
  }

  return result.join('\n\n');
};

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

const generateParagraphs = (num) => {
  const currentVariant = getCurrentVariant();
  // Split text into sentences
  const sentences = currentVariant.text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Target 3-5 sentences per paragraph for natural flow
  const sentencesPerParagraph = 4;
  const paragraphs = [];
  
  for (let i = 0; i < num; i++) {
    const paragraphSentences = [];
    for (let j = 0; j < sentencesPerParagraph; j++) {
      const sentenceIndex = (i * sentencesPerParagraph + j) % sentences.length;
      let sentence = sentences[sentenceIndex].trim();
      // Ensure sentence ends with punctuation
      if (!sentence.match(/[.!?]$/)) {
        sentence += '.';
      }
      paragraphSentences.push(sentence);
    }
    let paragraph = paragraphSentences.join(' ');
    
    // Apply inline HTML formatting
    paragraph = applyHTMLFormatting(paragraph);
    
    paragraphs.push(paragraph);
  }
  
  let result = paragraphs.join('\n\n');
  
  // Add lists if requested
  if ((htmlOptions.value.unorderedLists || htmlOptions.value.orderedLists || htmlOptions.value.definitionLists) && Math.random() < 0.4) {
    const listItems = currentVariant.text.split(' ').filter(w => w.length > 3).slice(0, 5);
    let listHTML = '';
    
    if (htmlOptions.value.definitionLists && Math.random() < 0.5) {
      listHTML = '<dl>\n';
      listItems.forEach((item, idx) => {
        if (idx % 2 === 0) {
          listHTML += `  <dt>${item.charAt(0).toUpperCase() + item.slice(1).replace(/[.,!?;:]/g, '')}</dt>\n`;
        } else {
          listHTML += `  <dd>${item.charAt(0).toUpperCase() + item.slice(1).replace(/[.,!?;:]/g, '')} description text.</dd>\n`;
        }
      });
      listHTML += '</dl>';
    } else if (htmlOptions.value.orderedLists && Math.random() < 0.5) {
      listHTML = '<ol>\n';
      listItems.forEach(item => {
        const cleanItem = item.replace(/[.,!?;:]/g, '');
        listHTML += `  <li>${cleanItem.charAt(0).toUpperCase() + cleanItem.slice(1)}</li>\n`;
      });
      listHTML += '</ol>';
    } else if (htmlOptions.value.unorderedLists) {
      listHTML = '<ul>\n';
      listItems.forEach(item => {
        const cleanItem = item.replace(/[.,!?;:]/g, '');
        listHTML += `  <li>${cleanItem.charAt(0).toUpperCase() + cleanItem.slice(1)}</li>\n`;
      });
      listHTML += '</ul>';
    }
    
    if (listHTML) {
      result += '\n\n' + listHTML;
    }
  }
  
  // Apply block-level formatting
  result = wrapInBlockElements(result, paragraphs);
  
  return result;
};

const generateWords = (num) => {
  const currentVariant = getCurrentVariant();
  const words = currentVariant.text.split(' ').filter(w => w.length > 0);
  const result = [];
  for (let i = 0; i < num; i++) {
    result.push(words[i % words.length]);
  }
  let text = result.join(' ');
  return applyHTMLFormatting(text);
};

const generateSentences = (num) => {
  const currentVariant = getCurrentVariant();
  const sentences = currentVariant.text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const result = [];
  for (let i = 0; i < num; i++) {
    const sentence = sentences[i % sentences.length].trim();
    result.push(sentence + (sentence.endsWith('.') ? '' : '.'));
  }
  let text = result.join(' ');
  return applyHTMLFormatting(text);
};

const generateLists = (num) => {
  const currentVariant = getCurrentVariant();
  const words = currentVariant.text.split(' ').filter(w => w.length > 0);
  const items = words.slice(0, Math.min(num, words.length));
  
  // If HTML list options are enabled, generate HTML lists
  if (htmlOptions.value.unorderedLists || htmlOptions.value.orderedLists || htmlOptions.value.definitionLists) {
    let listHTML = '';
    
    if (htmlOptions.value.definitionLists && Math.random() < 0.4) {
      listHTML = '<dl>\n';
      items.forEach((item, idx) => {
        const cleanItem = item.replace(/[.,!?;:]/g, '');
        if (idx % 2 === 0) {
          listHTML += `  <dt>${cleanItem.charAt(0).toUpperCase() + cleanItem.slice(1)}</dt>\n`;
        } else {
          listHTML += `  <dd>${cleanItem.charAt(0).toUpperCase() + cleanItem.slice(1)} description text.</dd>\n`;
        }
      });
      listHTML += '</dl>';
    } else if (htmlOptions.value.orderedLists && Math.random() < 0.5) {
      listHTML = '<ol>\n';
      items.forEach(item => {
        const cleanItem = item.replace(/[.,!?;:]/g, '');
        listHTML += `  <li>${cleanItem.charAt(0).toUpperCase() + cleanItem.slice(1)}</li>\n`;
      });
      listHTML += '</ol>';
    } else if (htmlOptions.value.unorderedLists) {
      listHTML = '<ul>\n';
      items.forEach(item => {
        const cleanItem = item.replace(/[.,!?;:]/g, '');
        listHTML += `  <li>${cleanItem.charAt(0).toUpperCase() + cleanItem.slice(1)}</li>\n`;
      });
      listHTML += '</ul>';
    } else {
      // Fallback to plain numbered list
      return items.map((word, index) => {
        const cleanWord = word.replace(/[.,!?;:]/g, '');
        return `${index + 1}. ${cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1)}`;
      }).join('\n');
    }
    
    return listHTML;
  }
  
  // Default: plain numbered list
  return items.map((word, index) => {
    const cleanWord = word.replace(/[.,!?;:]/g, '');
    return `${index + 1}. ${cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1)}`;
  }).join('\n');
};

const generate = () => {
  let result = '';
  
  if (type.value === 'paragraphs') {
    result = generateParagraphs(count.value);
  } else if (type.value === 'words') {
    result = generateWords(count.value);
  } else if (type.value === 'sentences') {
    result = generateSentences(count.value);
  } else if (type.value === 'lists') {
    result = generateLists(count.value);
  }
  
  output.value = result;
};

const copyToClipboard = async () => {
  if (!output.value) return;
  
  try {
    await navigator.clipboard.writeText(output.value);
    // You could add a toast notification here
  } catch (error) {
    console.error('Failed to copy:', error);
  }
};

let darkModeObserver = null;
let darkModeInterval = null;

onMounted(() => {
  darkModeObserver = new MutationObserver(() => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  });
  
  darkModeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });
  
  const checkDarkMode = () => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  };
  
  checkDarkMode();
  darkModeInterval = setInterval(checkDarkMode, 100);
  
  // Generate initial text
  generate();
});

onBeforeUnmount(() => {
  if (darkModeObserver) {
    darkModeObserver.disconnect();
  }
  if (darkModeInterval) {
    clearInterval(darkModeInterval);
  }
});
</script>

<style scoped>
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

/* Preview pane styling */
.preview-pane :deep(h1) {
  font-size: 2em;
  font-weight: bold;
  margin-top: 0.67em;
  margin-bottom: 0.67em;
}

.preview-pane :deep(h2) {
  font-size: 1.5em;
  font-weight: bold;
  margin-top: 0.83em;
  margin-bottom: 0.83em;
}

.preview-pane :deep(h3) {
  font-size: 1.17em;
  font-weight: bold;
  margin-top: 1em;
  margin-bottom: 1em;
}

.preview-pane :deep(h4) {
  font-size: 1em;
  font-weight: bold;
  margin-top: 1.33em;
  margin-bottom: 1.33em;
}

.preview-pane :deep(h5) {
  font-size: 0.83em;
  font-weight: bold;
  margin-top: 1.67em;
  margin-bottom: 1.67em;
}

.preview-pane :deep(h6) {
  font-size: 0.67em;
  font-weight: bold;
  margin-top: 2.33em;
  margin-bottom: 2.33em;
}

.preview-pane :deep(p) {
  margin-top: 1em;
  margin-bottom: 1em;
}

.preview-pane :deep(ul),
.preview-pane :deep(ol) {
  margin-top: 1em;
  margin-bottom: 1em;
  padding-left: 2em;
}

.preview-pane :deep(ul) {
  list-style-type: disc;
}

.preview-pane :deep(ol) {
  list-style-type: decimal;
}

.preview-pane :deep(li) {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}

.preview-pane :deep(dl) {
  margin-top: 1em;
  margin-bottom: 1em;
}

.preview-pane :deep(dt) {
  font-weight: bold;
  margin-top: 0.5em;
}

.preview-pane :deep(dd) {
  margin-left: 2em;
  margin-bottom: 0.5em;
}

.preview-pane :deep(blockquote) {
  margin: 1em 2em;
  padding-left: 1em;
  border-left: 4px solid #6366f1;
  font-style: italic;
}

.dark .preview-pane :deep(blockquote) {
  border-left-color: #818cf8;
}

.preview-pane :deep(pre) {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 1em;
  border-radius: 4px;
  overflow-x: auto;
  margin: 1em 0;
}

.dark .preview-pane :deep(pre) {
  background-color: rgba(255, 255, 255, 0.05);
}

.preview-pane :deep(code) {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: monospace;
  font-size: 0.9em;
}

.dark .preview-pane :deep(code) {
  background-color: rgba(255, 255, 255, 0.1);
}

.preview-pane :deep(pre code) {
  background-color: transparent;
  padding: 0;
}

.preview-pane :deep(a) {
  color: #6366f1;
  text-decoration: underline;
}

.preview-pane :deep(a:hover) {
  color: #818cf8;
}

.dark .preview-pane :deep(a) {
  color: #818cf8;
}

.dark .preview-pane :deep(a:hover) {
  color: #a5b4fc;
}

.preview-pane :deep(strong) {
  font-weight: bold;
}

.preview-pane :deep(em) {
  font-style: italic;
}
</style>

