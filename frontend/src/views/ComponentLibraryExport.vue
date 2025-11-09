<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative flex">
    <!-- Drawer -->
    <DocumentationDrawer :isOpen="drawerOpen" @close="closeDrawer" @toggle="toggleDrawer" />
    
    <!-- Main Content Area -->
    <div 
      class="flex-1 h-full transition-all duration-300 relative overflow-hidden"
      :style="drawerOpen ? 'margin-left: 256px;' : 'margin-left: 48px;'"
    >
      <div class="h-full p-8 overflow-auto">
        <!-- Hero Section -->
        <div class="max-w-7xl mx-auto mb-8">
          <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
            <div class="absolute inset-0 opacity-10 texture-pattern"></div>
            
            <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div class="flex-1">
                <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  Component Library Export
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Export your design system components and documentation in various formats.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Export Options -->
        <div class="max-w-7xl mx-auto mb-8">
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Storybook -->
            <div 
              class="rounded-lg shadow-sm border p-6 cursor-pointer transition-all hover:shadow-md"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700 hover:border-indigo-500' 
                : 'bg-white border-gray-200 hover:border-indigo-500'"
              @click="exportFormat = 'storybook'"
            >
              <div class="flex items-center gap-3 mb-4">
                <div class="p-2 rounded-lg" :class="isDarkMode ? 'bg-indigo-900/30' : 'bg-indigo-50'">
                  <span class="material-symbols-outlined text-xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                    library_books
                  </span>
                </div>
                <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Storybook
                </h3>
              </div>
              <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Generate a Storybook instance with all components, stories, and documentation.
              </p>
              <button
                @click.stop="exportStorybook"
                class="w-full px-4 py-2 rounded-lg font-medium transition-colors"
                :class="isDarkMode 
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
              >
                Export Storybook
              </button>
            </div>

            <!-- PDF Documentation -->
            <div 
              class="rounded-lg shadow-sm border p-6 cursor-pointer transition-all hover:shadow-md"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700 hover:border-indigo-500' 
                : 'bg-white border-gray-200 hover:border-indigo-500'"
              @click="exportFormat = 'pdf'"
            >
              <div class="flex items-center gap-3 mb-4">
                <div class="p-2 rounded-lg" :class="isDarkMode ? 'bg-red-900/30' : 'bg-red-50'">
                  <span class="material-symbols-outlined text-xl" :class="isDarkMode ? 'text-red-400' : 'text-red-600'">
                    description
                  </span>
                </div>
                <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  PDF Documentation
                </h3>
              </div>
              <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Generate a comprehensive PDF document with all components and guidelines.
              </p>
              <button
                @click.stop="exportPDF"
                class="w-full px-4 py-2 rounded-lg font-medium transition-colors"
                :class="isDarkMode 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'"
              >
                Export PDF
              </button>
            </div>

            <!-- Markdown -->
            <div 
              class="rounded-lg shadow-sm border p-6 cursor-pointer transition-all hover:shadow-md"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700 hover:border-indigo-500' 
                : 'bg-white border-gray-200 hover:border-indigo-500'"
              @click="exportFormat = 'markdown'"
            >
              <div class="flex items-center gap-3 mb-4">
                <div class="p-2 rounded-lg" :class="isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'">
                  <span class="material-symbols-outlined text-xl" :class="isDarkMode ? 'text-blue-400' : 'text-blue-600'">
                    article
                  </span>
                </div>
                <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Markdown
                </h3>
              </div>
              <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Export all documentation as Markdown files for version control.
              </p>
              <button
                @click.stop="exportMarkdown"
                class="w-full px-4 py-2 rounded-lg font-medium transition-colors"
                :class="isDarkMode 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'"
              >
                Export Markdown
              </button>
            </div>

            <!-- NPM Package -->
            <div 
              class="rounded-lg shadow-sm border p-6 cursor-pointer transition-all hover:shadow-md"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700 hover:border-indigo-500' 
                : 'bg-white border-gray-200 hover:border-indigo-500'"
              @click="exportFormat = 'npm'"
            >
              <div class="flex items-center gap-3 mb-4">
                <div class="p-2 rounded-lg" :class="isDarkMode ? 'bg-green-900/30' : 'bg-green-50'">
                  <span class="material-symbols-outlined text-xl" :class="isDarkMode ? 'text-green-400' : 'text-green-600'">
                    package_2
                  </span>
                </div>
                <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  NPM Package
                </h3>
              </div>
              <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Generate an NPM package with all components ready to publish.
              </p>
              <button
                @click.stop="exportNPM"
                class="w-full px-4 py-2 rounded-lg font-medium transition-colors"
                :class="isDarkMode 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'"
              >
                Export NPM
              </button>
            </div>

            <!-- Static Site -->
            <div 
              class="rounded-lg shadow-sm border p-6 cursor-pointer transition-all hover:shadow-md"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700 hover:border-indigo-500' 
                : 'bg-white border-gray-200 hover:border-indigo-500'"
              @click="exportFormat = 'static'"
            >
              <div class="flex items-center gap-3 mb-4">
                <div class="p-2 rounded-lg" :class="isDarkMode ? 'bg-purple-900/30' : 'bg-purple-50'">
                  <span class="material-symbols-outlined text-xl" :class="isDarkMode ? 'text-purple-400' : 'text-purple-600'">
                    public
                  </span>
                </div>
                <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Static Site
                </h3>
              </div>
              <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Export as a static HTML site for hosting anywhere.
              </p>
              <button
                @click.stop="exportStatic"
                class="w-full px-4 py-2 rounded-lg font-medium transition-colors"
                :class="isDarkMode 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                  : 'bg-purple-600 hover:bg-purple-700 text-white'"
              >
                Export Static
              </button>
            </div>

            <!-- Figma Plugin -->
            <div 
              class="rounded-lg shadow-sm border p-6 cursor-pointer transition-all hover:shadow-md"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700 hover:border-indigo-500' 
                : 'bg-white border-gray-200 hover:border-indigo-500'"
              @click="exportFormat = 'figma'"
            >
              <div class="flex items-center gap-3 mb-4">
                <div class="p-2 rounded-lg" :class="isDarkMode ? 'bg-orange-900/30' : 'bg-orange-50'">
                  <span class="material-symbols-outlined text-xl" :class="isDarkMode ? 'text-orange-400' : 'text-orange-600'">
                    extension
                  </span>
                </div>
                <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Figma Plugin
                </h3>
              </div>
              <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Generate a Figma plugin to sync tokens and components.
              </p>
              <button
                @click.stop="exportFigma"
                class="w-full px-4 py-2 rounded-lg font-medium transition-colors"
                :class="isDarkMode 
                  ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                  : 'bg-orange-600 hover:bg-orange-700 text-white'"
              >
                Export Plugin
              </button>
            </div>

            <!-- PenPot -->
            <div 
              class="rounded-lg shadow-sm border p-6 cursor-pointer transition-all hover:shadow-md"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700 hover:border-indigo-500' 
                : 'bg-white border-gray-200 hover:border-indigo-500'"
              @click="exportFormat = 'penpot'"
            >
              <div class="flex items-center gap-3 mb-4">
                <div class="p-2 rounded-lg" :class="isDarkMode ? 'bg-pink-900/30' : 'bg-pink-50'">
                  <span class="material-symbols-outlined text-xl" :class="isDarkMode ? 'text-pink-400' : 'text-pink-600'">
                    draw
                  </span>
                </div>
                <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  PenPot
                </h3>
              </div>
              <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Export components and tokens for PenPot design tool.
              </p>
              <button
                @click.stop="exportPenPot"
                class="w-full px-4 py-2 rounded-lg font-medium transition-colors"
                :class="isDarkMode 
                  ? 'bg-pink-600 hover:bg-pink-700 text-white' 
                  : 'bg-pink-600 hover:bg-pink-700 text-white'"
              >
                Export PenPot
              </button>
            </div>

            <!-- Adobe XD -->
            <div 
              class="rounded-lg shadow-sm border p-6 cursor-pointer transition-all hover:shadow-md"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700 hover:border-indigo-500' 
                : 'bg-white border-gray-200 hover:border-indigo-500'"
              @click="exportFormat = 'adobe-xd'"
            >
              <div class="flex items-center gap-3 mb-4">
                <div class="p-2 rounded-lg" :class="isDarkMode ? 'bg-purple-900/30' : 'bg-purple-50'">
                  <span class="material-symbols-outlined text-xl" :class="isDarkMode ? 'text-purple-400' : 'text-purple-600'">
                    palette
                  </span>
                </div>
                <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Adobe XD
                </h3>
              </div>
              <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Export design tokens and component specifications for Adobe XD.
              </p>
              <button
                @click.stop="exportAdobeXD"
                class="w-full px-4 py-2 rounded-lg font-medium transition-colors"
                :class="isDarkMode 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                  : 'bg-purple-600 hover:bg-purple-700 text-white'"
              >
                Export Adobe XD
              </button>
            </div>
          </div>
        </div>

        <!-- Export Settings -->
        <div v-if="exportFormat" class="max-w-7xl mx-auto mb-8">
          <div 
            class="rounded-lg shadow-sm border p-6"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              Export Settings
            </h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Include Components
                </label>
                <div class="space-y-2">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" v-model="exportSettings.includeComponents" class="accent-indigo-600" />
                    <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">All components</span>
                  </label>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Include Tokens
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="exportSettings.includeTokens" class="accent-indigo-600" />
                  <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Design tokens</span>
                </label>
              </div>
              <div>
                <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Include Documentation
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="exportSettings.includeDocs" class="accent-indigo-600" />
                  <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Guidelines and examples</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Export Status -->
        <div v-if="exportStatus" class="max-w-7xl mx-auto">
          <div 
            class="rounded-lg shadow-sm border p-6"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <div class="flex items-center gap-3">
              <span 
                class="material-symbols-outlined"
                :class="exportStatus === 'success' 
                  ? (isDarkMode ? 'text-green-400' : 'text-green-600')
                  : (isDarkMode ? 'text-yellow-400' : 'text-yellow-600')"
              >
                {{ exportStatus === 'success' ? 'check_circle' : 'hourglass_empty' }}
              </span>
              <div class="flex-1">
                <p class="font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  {{ exportStatus === 'success' ? 'Export completed successfully!' : 'Exporting...' }}
                </p>
                <p v-if="exportStatus === 'success'" class="text-sm mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  Your export is ready for download.
                </p>
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
import jsPDF from 'jspdf';
import JSZip from 'jszip';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const exportFormat = ref('');
const exportStatus = ref('');
const exportSettings = ref({
  includeComponents: true,
  includeTokens: true,
  includeDocs: true
});

// Mock component and token data - in production, this would come from an API
const mockComponents = [
  {
    id: 'button',
    name: 'Button',
    description: 'Primary action component',
    props: [{ name: 'variant', type: 'string' }],
    code: { vue: '<button>Click me</button>', react: '<button>Click me</button>' }
  },
  {
    id: 'card',
    name: 'Card',
    description: 'Container component',
    props: [{ name: 'padding', type: 'string' }],
    code: { vue: '<div class="card">Card</div>', react: '<div className="card">Card</div>' }
  }
];

const mockTokens = [
  { name: 'color.primary', value: '#4f46e5', type: 'color', category: 'colors' },
  { name: 'spacing.md', value: '1rem', type: 'dimension', category: 'spacing' }
];

const downloadFile = (content, filename, mimeType = 'text/plain') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const downloadZip = async (files, zipFilename) => {
  try {
    const zip = new JSZip();
    
    files.forEach(file => {
      zip.file(file.name, file.content);
    });
    
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = zipFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('ZIP creation error:', error);
    // Fallback to text file if ZIP fails
    const manifestContent = JSON.stringify({ files: files.map(f => f.name) }, null, 2);
    const filesContent = files.map(f => `\n\n=== FILE: ${f.name} ===\n${f.content}`).join('\n');
    downloadFile(manifestContent + filesContent, zipFilename.replace('.zip', '.txt'), 'text/plain');
  }
};

const exportStorybook = async () => {
  exportFormat.value = 'storybook';
  exportStatus.value = 'processing';
  
  try {
    const files = [];
    
    // package.json
    const packageJson = {
      name: 'design-system-storybook',
      version: '1.0.0',
      scripts: {
        storybook: 'start-storybook -p 6006',
        'build-storybook': 'build-storybook'
      },
      dependencies: {
        '@storybook/vue': '^7.0.0',
        '@storybook/react': '^7.0.0'
      }
    };
    files.push({ name: 'package.json', content: JSON.stringify(packageJson, null, 2), type: 'application/json' });
    
    // Storybook config
    const storybookConfig = `module.exports = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-essentials'],
};`;
    files.push({ name: '.storybook/main.js', content: storybookConfig, type: 'text/javascript' });
    
    // Component stories
    if (exportSettings.value.includeComponents) {
      mockComponents.forEach(comp => {
        const story = `import ${comp.name} from './${comp.id}.vue';

export default {
  title: 'Components/${comp.name}',
  component: ${comp.name},
};

export const Default = {
  args: {},
};`;
        files.push({ name: `src/components/${comp.id}.stories.js`, content: story, type: 'text/javascript' });
      });
    }
    
    await downloadZip(files, 'design-system-storybook.zip');
    exportStatus.value = 'success';
    setTimeout(() => { exportStatus.value = ''; }, 3000);
  } catch (error) {
    console.error('Export error:', error);
    exportStatus.value = '';
  }
};

const exportPDF = () => {
  exportFormat.value = 'pdf';
  exportStatus.value = 'processing';
  
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = margin;
    
    // Title
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Design System Documentation', pageWidth / 2, yPos, { align: 'center' });
    yPos += 20;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 20;
    
    // Components section
    if (exportSettings.value.includeComponents) {
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Components', margin, yPos);
      yPos += 15;
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      mockComponents.forEach(comp => {
        if (yPos > 270) {
          doc.addPage();
          yPos = margin;
        }
        doc.setFont('helvetica', 'bold');
        doc.text(comp.name, margin, yPos);
        yPos += 8;
        doc.setFont('helvetica', 'normal');
        doc.text(comp.description, margin + 5, yPos);
        yPos += 12;
      });
    }
    
    // Tokens section
    if (exportSettings.value.includeTokens) {
      if (yPos > 250) {
        doc.addPage();
        yPos = margin;
      }
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Design Tokens', margin, yPos);
      yPos += 15;
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      mockTokens.forEach(token => {
        if (yPos > 270) {
          doc.addPage();
          yPos = margin;
        }
        doc.text(`${token.name}: ${token.value}`, margin, yPos);
        yPos += 10;
      });
    }
    
    doc.save('design-system-documentation.pdf');
    exportStatus.value = 'success';
    setTimeout(() => { exportStatus.value = ''; }, 3000);
  } catch (error) {
    console.error('Export error:', error);
    exportStatus.value = '';
  }
};

const exportMarkdown = () => {
  exportFormat.value = 'markdown';
  exportStatus.value = 'processing';
  
  try {
    let markdown = '# Design System Documentation\n\n';
    markdown += `Generated on ${new Date().toLocaleDateString()}\n\n`;
    
    if (exportSettings.value.includeComponents) {
      markdown += '## Components\n\n';
      mockComponents.forEach(comp => {
        markdown += `### ${comp.name}\n\n`;
        markdown += `${comp.description}\n\n`;
        markdown += '**Props:**\n';
        comp.props.forEach(prop => {
          markdown += `- ${prop.name}: ${prop.type}\n`;
        });
        markdown += '\n';
      });
    }
    
    if (exportSettings.value.includeTokens) {
      markdown += '## Design Tokens\n\n';
      mockTokens.forEach(token => {
        markdown += `- \`${token.name}\`: ${token.value}\n`;
      });
    }
    
    downloadFile(markdown, 'design-system-documentation.md', 'text/markdown');
    exportStatus.value = 'success';
    setTimeout(() => { exportStatus.value = ''; }, 3000);
  } catch (error) {
    console.error('Export error:', error);
    exportStatus.value = '';
  }
};

const exportNPM = async () => {
  exportFormat.value = 'npm';
  exportStatus.value = 'processing';
  
  try {
    const files = [];
    
    // package.json
    const packageJson = {
      name: '@designsystem/components',
      version: '1.0.0',
      description: 'Design System Component Library',
      main: 'index.js',
      files: ['dist', 'src'],
      scripts: {
        build: 'vite build',
        dev: 'vite'
      },
      dependencies: {
        vue: '^3.3.4'
      }
    };
    files.push({ name: 'package.json', content: JSON.stringify(packageJson, null, 2), type: 'application/json' });
    
    // README
    const readme = `# Design System Components\n\nComponent library for the design system.`;
    files.push({ name: 'README.md', content: readme, type: 'text/markdown' });
    
    // Component files
    if (exportSettings.value.includeComponents) {
      mockComponents.forEach(comp => {
        files.push({ name: `src/components/${comp.id}.vue`, content: comp.code.vue, type: 'text/vue' });
      });
    }
    
    // Index file
    const indexContent = mockComponents.map(comp => 
      `export { default as ${comp.name} } from './components/${comp.id}.vue';`
    ).join('\n');
    files.push({ name: 'src/index.js', content: indexContent, type: 'text/javascript' });
    
    await downloadZip(files, 'design-system-npm-package.zip');
    exportStatus.value = 'success';
    setTimeout(() => { exportStatus.value = ''; }, 3000);
  } catch (error) {
    console.error('Export error:', error);
    exportStatus.value = '';
  }
};

const exportStatic = async () => {
  exportFormat.value = 'static';
  exportStatus.value = 'processing';
  
  try {
    const files = [];
    
    // index.html - build dynamically to avoid Vue parser issues
    const buildIndexHtml = () => {
      const lt = '<';
      const gt = '>';
      const slash = '/';
      const parts = [];
      parts.push('<!DOCTYPE html>');
      parts.push(lt + 'html lang="en"' + gt);
      parts.push(lt + 'head' + gt);
      parts.push('  ' + lt + 'meta charset="UTF-8"' + gt);
      parts.push('  ' + lt + 'meta name="viewport" content="width=device-width, initial-scale=1.0"' + gt);
      parts.push('  ' + lt + 'title' + gt + 'Design System' + lt + slash + 'title' + gt);
      parts.push('  ' + lt + 'link rel="stylesheet" href="styles.css"' + gt);
      parts.push(lt + slash + 'head' + gt);
      parts.push(lt + 'body' + gt);
      parts.push('  ' + lt + 'h1' + gt + 'Design System' + lt + slash + 'h1' + gt);
      parts.push('  ' + lt + 'div id="app"' + gt + lt + slash + 'div' + gt);
      parts.push('  ' + lt + 'script src="app.js"' + gt + lt + slash + 'script' + gt);
      parts.push(lt + slash + 'body' + gt);
      parts.push(lt + slash + 'html' + gt);
      return parts.join('\n');
    };
    const indexHtml = buildIndexHtml();
    files.push({ name: 'index.html', content: indexHtml, type: 'text/html' });
    
    // styles.css
    const styles = `body { font-family: sans-serif; margin: 2rem; }
.component { border: 1px solid #ccc; padding: 1rem; margin: 1rem 0; }`;
    files.push({ name: 'styles.css', content: styles, type: 'text/css' });
    
    // app.js
    const appJs = `// Design System Static Site
console.log('Design System loaded');`;
    files.push({ name: 'app.js', content: appJs, type: 'text/javascript' });
    
    await downloadZip(files, 'design-system-static-site.zip');
    exportStatus.value = 'success';
    setTimeout(() => { exportStatus.value = ''; }, 3000);
  } catch (error) {
    console.error('Export error:', error);
    exportStatus.value = '';
  }
};

const exportFigma = async () => {
  exportFormat.value = 'figma';
  exportStatus.value = 'processing';
  
  try {
    const files = [];
    
    // manifest.json
    const manifest = {
      name: 'Design System Sync',
      id: 'design-system-sync',
      api: '1.0.0',
      main: 'code.js',
      ui: 'ui.html'
    };
    files.push({ name: 'manifest.json', content: JSON.stringify(manifest, null, 2), type: 'application/json' });
    
    // code.js
    const codeJs = `// Figma Plugin Code
figma.showUI(__html__, { width: 400, height: 600 });

figma.ui.onmessage = (msg) => {
  if (msg.type === 'sync-tokens') {
    // Sync design tokens
    console.log('Syncing tokens:', msg.tokens);
  }
};`;
    files.push({ name: 'code.js', content: codeJs, type: 'text/javascript' });
    
    // ui.html - build dynamically to avoid Vue parser issues
    const buildUiHtml = () => {
      const lt = '<';
      const gt = '>';
      const slash = '/';
      const parts = [];
      parts.push('<!DOCTYPE html>');
      parts.push(lt + 'html' + gt);
      parts.push(lt + 'head' + gt);
      parts.push('  ' + lt + 'title' + gt + 'Design System Sync' + lt + slash + 'title' + gt);
      parts.push(lt + slash + 'head' + gt);
      parts.push(lt + 'body' + gt);
      parts.push('  ' + lt + 'h1' + gt + 'Design System Sync' + lt + slash + 'h1' + gt);
      parts.push('  ' + lt + 'button onclick="syncTokens()"' + gt + 'Sync Tokens' + lt + slash + 'button' + gt);
      parts.push('  ' + lt + 'script' + gt);
      parts.push('    function syncTokens() {');
      parts.push('      parent.postMessage({ pluginMessage: { type: \'sync-tokens\' } }, \'*\');');
      parts.push('    }');
      parts.push('  ' + lt + slash + 'script' + gt);
      parts.push(lt + slash + 'body' + gt);
      parts.push(lt + slash + 'html' + gt);
      return parts.join('\n');
    };
    const uiHtml = buildUiHtml();
    files.push({ name: 'ui.html', content: uiHtml, type: 'text/html' });
    
    await downloadZip(files, 'figma-design-system-plugin.zip');
    exportStatus.value = 'success';
    setTimeout(() => { exportStatus.value = ''; }, 3000);
  } catch (error) {
    console.error('Export error:', error);
    exportStatus.value = '';
  }
};

const exportPenPot = async () => {
  exportFormat.value = 'penpot';
  exportStatus.value = 'processing';
  
  try {
    const files = [];
    
    // PenPot format uses JSON for component libraries
    const penpotData = {
      version: '1.0',
      name: 'Design System',
      components: exportSettings.value.includeComponents ? mockComponents.map(comp => ({
        name: comp.name,
        description: comp.description,
        props: comp.props,
        code: comp.code
      })) : [],
      tokens: exportSettings.value.includeTokens ? mockTokens.map(token => ({
        name: token.name,
        value: token.value,
        type: token.type,
        category: token.category
      })) : []
    };
    
    files.push({ 
      name: 'design-system.penpot', 
      content: JSON.stringify(penpotData, null, 2), 
      type: 'application/json' 
    });
    
    // README for PenPot import
    const readme = `# PenPot Design System Import

## How to Import

1. Open PenPot
2. Go to Assets > Import
3. Select the design-system.penpot file
4. Your components and tokens will be imported

## Components

${mockComponents.map(c => `- ${c.name}: ${c.description}`).join('\n')}

## Tokens

${mockTokens.map(t => `- ${t.name}: ${t.value}`).join('\n')}
`;
    files.push({ name: 'README.md', content: readme, type: 'text/markdown' });
    
    await downloadZip(files, 'penpot-design-system.zip');
    exportStatus.value = 'success';
    setTimeout(() => { exportStatus.value = ''; }, 3000);
  } catch (error) {
    console.error('Export error:', error);
    exportStatus.value = '';
  }
};

const exportAdobeXD = async () => {
  exportFormat.value = 'adobe-xd';
  exportStatus.value = 'processing';
  
  try {
    const files = [];
    
    // Adobe XD uses a JSON format for design specifications
    // Format based on Adobe XD's design spec format
    const adobeXDData = {
      version: '1.0.0',
      name: 'Design System',
      metadata: {
        exportedAt: new Date().toISOString(),
        exportedBy: 'Design System Platform',
        format: 'adobe-xd-spec'
      },
      designTokens: exportSettings.value.includeTokens ? {
        colors: mockTokens
          .filter(t => t.type === 'color' || t.category === 'colors')
          .map(token => ({
            name: token.name.replace(/\./g, '_'),
            value: token.value,
            type: 'color',
            description: token.name
          })),
        spacing: mockTokens
          .filter(t => t.type === 'dimension' && t.category === 'spacing')
          .map(token => ({
            name: token.name.replace(/\./g, '_'),
            value: token.value,
            type: 'spacing',
            description: token.name
          })),
        typography: mockTokens
          .filter(t => t.category === 'typography')
          .map(token => ({
            name: token.name.replace(/\./g, '_'),
            value: token.value,
            type: token.type,
            description: token.name
          }))
      } : {},
      components: exportSettings.value.includeComponents ? mockComponents.map(comp => ({
        name: comp.name,
        description: comp.description,
        type: 'component',
        properties: comp.props.map(prop => ({
          name: prop.name,
          type: prop.type,
          defaultValue: prop.default || null,
          description: prop.description || ''
        })),
        specifications: {
          code: comp.code,
          framework: ['vue', 'react']
        }
      })) : [],
      documentation: exportSettings.value.includeDocs ? {
        overview: 'Design System exported from Design System Platform',
        components: mockComponents.map(c => ({
          name: c.name,
          description: c.description,
          usage: `Use the ${c.name} component for ${c.description.toLowerCase()}`
        }))
      } : {}
    };
    
    // Main specification file
    files.push({ 
      name: 'design-system-xd-spec.json', 
      content: JSON.stringify(adobeXDData, null, 2), 
      type: 'application/json' 
    });
    
    // Adobe XD plugin manifest (for potential plugin integration)
    const pluginManifest = {
      id: 'design-system-sync',
      name: 'Design System Sync',
      version: '1.0.0',
      description: 'Sync design tokens and components from Design System Platform',
      author: 'Design System Platform',
      entrypoints: {
        'plugin': './plugin.js'
      },
      permissions: ['read', 'write']
    };
    files.push({ 
      name: 'manifest.json', 
      content: JSON.stringify(pluginManifest, null, 2), 
      type: 'application/json' 
    });
    
    // README with import instructions
    const readme = `# Adobe XD Design System Import

## How to Use

### Option 1: Manual Import (Design Tokens)

1. Open Adobe XD
2. Go to **Plugins > Discover Plugins** and search for "Design Tokens" or "Design Specs"
3. Use a plugin that supports JSON token import
4. Import the \`design-system-xd-spec.json\` file

### Option 2: Component Specifications

The exported JSON contains component specifications that can be used to:
- Create component libraries in Adobe XD
- Reference design tokens for consistent styling
- Document component properties and usage

## File Structure

- \`design-system-xd-spec.json\` - Main specification file with tokens and components
- \`manifest.json\` - Plugin manifest (for future plugin development)
- \`README.md\` - This file

## Design Tokens

${exportSettings.value.includeTokens ? mockTokens.map(t => `- **${t.name}**: \`${t.value}\` (${t.type})`).join('\n') : 'No tokens included'}

## Components

${exportSettings.value.includeComponents ? mockComponents.map(c => `- **${c.name}**: ${c.description}`).join('\n') : 'No components included'}

## Notes

- Color values are in hex format
- Spacing values use CSS units (rem, px, etc.)
- Component specifications include props and code examples
- This export is compatible with Adobe XD's design spec format

For more information, visit the Design System Platform documentation.
`;
    files.push({ name: 'README.md', content: readme, type: 'text/markdown' });
    
    await downloadZip(files, 'adobe-xd-design-system.zip');
    exportStatus.value = 'success';
    setTimeout(() => { exportStatus.value = ''; }, 3000);
  } catch (error) {
    console.error('Export error:', error);
    exportStatus.value = '';
  }
};

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
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

