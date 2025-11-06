<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:bg-slate-900 relative flex">
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
            <div class="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 p-8">
              <!-- Controls -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <!-- Variant Selection -->
                <div>
                  <label class="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">Variant</label>
                  <Dropdown
                    v-model="variant"
                    :options="variantOptions"
                  />
                </div>

                <!-- Type Selection -->
                <div>
                  <label class="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">Type</label>
                  <Dropdown
                    v-model="type"
                    :options="typeOptions"
                  />
                </div>

                <!-- Count -->
                <div>
                  <label class="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">Count</label>
                  <input
                    v-model.number="count"
                    type="number"
                    min="1"
                    max="100"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 text-sm"
                  />
                </div>

                <!-- Generate Button -->
                <div class="flex items-end">
                  <button
                    @click="generate"
                    class="w-full px-6 py-2 bg-indigo-600 dark:bg-indigo-500 text-white font-medium rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-400 transition-colors"
                  >
                    Generate
                  </button>
                </div>
              </div>

              <!-- Output -->
              <div>
                <div class="flex items-center justify-between mb-4">
                  <label class="block text-sm font-medium text-gray-900 dark:text-gray-300">Generated Text</label>
                  <button
                    @click="copyToClipboard"
                    class="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors flex items-center gap-2"
                  >
                    <span class="material-symbols-outlined text-lg">content_copy</span>
                    Copy
                  </button>
                </div>
                <textarea
                  v-model="output"
                  readonly
                  rows="12"
                  class="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-gray-100 text-sm font-mono resize-none"
                ></textarea>
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
    paragraphs.push(paragraphSentences.join(' '));
  }
  
  return paragraphs.join('\n\n');
};

const generateWords = (num) => {
  const currentVariant = getCurrentVariant();
  const words = currentVariant.text.split(' ').filter(w => w.length > 0);
  const result = [];
  for (let i = 0; i < num; i++) {
    result.push(words[i % words.length]);
  }
  return result.join(' ');
};

const generateSentences = (num) => {
  const currentVariant = getCurrentVariant();
  const sentences = currentVariant.text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const result = [];
  for (let i = 0; i < num; i++) {
    const sentence = sentences[i % sentences.length].trim();
    result.push(sentence + (sentence.endsWith('.') ? '' : '.'));
  }
  return result.join(' ');
};

const generateLists = (num) => {
  const currentVariant = getCurrentVariant();
  const words = currentVariant.text.split(' ').filter(w => w.length > 0);
  const items = words.slice(0, Math.min(num, words.length));
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
</style>

