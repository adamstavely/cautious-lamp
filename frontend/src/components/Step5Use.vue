<template>
  <div>
    <InlineNotice :notice="notice" class="mb-6" @dismiss="clearNotice" />

    <!-- Palette Info - Remove title since it's in header -->
    <p v-if="palette.updatedAt" class="mb-6 pb-6 border-b border-line-faint text-sm text-ink-muted">
      Last updated: {{ formatDate(palette.updatedAt) }}
    </p>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Left Column: Color Swatches & Usage Examples -->
      <div class="lg:col-span-2 space-y-8">
        <!-- Color Swatches -->
        <section>
          <h3 class="text-xl font-semibold text-ink-strong mb-6 flex items-center gap-2">
            <span class="material-symbols-outlined text-xl text-accent-text" aria-hidden="true">palette</span>
            Color swatches
          </h3>
          <ul class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <li v-for="(color, index) in palette.colors" :key="index" class="flex flex-col">
              <UiColorSample class="w-full h-24 rounded-tile shadow-control mb-2 flex items-center justify-center" :color="color.hex" :text-color="getTextColor(color.hex)">
                <span class="font-code text-xs font-semibold">{{ color.hex }}</span>
              </UiColorSample>
              <span class="text-xs text-ink-secondary text-center capitalize">{{ getRoleLabel(color.role) }}</span>
            </li>
          </ul>
        </section>

        <!-- Usage Examples -->
        <section>
          <h3 class="text-lg font-semibold text-ink-strong mb-4 flex items-center gap-2">
            <span class="material-symbols-outlined text-xl text-accent-text" aria-hidden="true">preview</span>
            Usage examples
          </h3>
          <p class="text-sm text-ink-secondary mb-4">
            See how your palette looks in real UI components. Preview buttons, cards, and headers using your colors.
          </p>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Button Examples -->
            <div>
              <h4 class="text-sm font-medium text-ink mb-3">Buttons</h4>
              <div class="space-y-2">
                <UiColorSample
                  v-for="(color, index) in (palette?.colors || []).slice(0, 3)"
                  :key="`btn-${color.hex}-${index}`"
                  tag="button"
                  class="w-full px-4 py-2 rounded-control font-medium text-sm transition-opacity hover:opacity-90"
                  :color="color.hex"
                  :text-color="DEMO_TEXT"
                >
                  {{ color.name || 'Button' }}
                </UiColorSample>
              </div>
            </div>

            <!-- Card Examples -->
            <div>
              <h4 class="text-sm font-medium text-ink mb-3">Cards</h4>
              <div class="space-y-2">
                <div
                  v-for="(color, index) in (palette?.colors || []).slice(0, 2)"
                  :key="`card-${color.hex}-${index}`"
                  class="rounded-tile border border-line-faint bg-surface-raised overflow-hidden"
                >
                  <UiColorSample class="h-1" :color="color.hex" />
                  <div class="p-4">
                    <div class="font-semibold text-ink-strong mb-1">Card Title</div>
                    <div class="text-sm text-ink-secondary">Card content using {{ color.name || color.hex }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Header Examples -->
            <div>
              <h4 class="text-sm font-medium text-ink mb-3">Headers</h4>
              <div class="space-y-2">
                <UiColorSample
                  v-for="(color, index) in (palette?.colors || []).slice(0, 2)"
                  :key="`header-${color.hex}-${index}`"
                  class="p-4 rounded-tile"
                  :color="color.hex"
                  :text-color="DEMO_TEXT"
                >
                  <div class="font-bold text-lg mb-1">Header</div>
                  <div class="text-sm opacity-90">Using {{ color.name || color.hex }}</div>
                </UiColorSample>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Right Column: Export Options Sidebar -->
      <div class="lg:col-span-1">
        <section class="sticky top-8">
          <h3 class="text-2xl font-bold text-ink-strong mb-6 flex items-center gap-2">
            <span class="material-symbols-outlined text-xl text-accent-text" aria-hidden="true">download</span>
            Export options
          </h3>
          <ul class="space-y-3">
            <li v-for="option in exportOptions" :key="option.title">
              <button type="button" class="export-option group" @click="option.run">
                <span class="flex-1 text-left">
                  <span class="block font-semibold text-ink-strong mb-1">{{ option.title }}</span>
                  <span class="block text-sm text-ink-secondary">{{ option.body }}</span>
                </span>
                <span class="material-symbols-outlined text-xl text-ink-muted group-hover:text-accent-text transition-colors" aria-hidden="true">{{ option.icon }}</span>
              </button>
            </li>
          </ul>
        </section>
      </div>
    </div>

    <!-- Navigation -->
    <div class="flex justify-between mt-8 pt-8 border-t border-line-faint">
      <UiButton icon="arrow_back" @click="$emit('back')">Back</UiButton>
      <UiButton variant="primary" icon="check" @click="complete">Save and complete</UiButton>
    </div>
  </div>
</template>

<script setup>
import apiClient from '../services/api.js';
import jsPDF from 'jspdf';
import InlineNotice from './InlineNotice.vue';
import { UiButton } from './ui';
import UiColorSample from './ui/UiColorSample.vue';
import { useNotice } from '../composables/useNotice.js';

const { notice, showNotice, clearNotice } = useNotice();

const props = defineProps({
  palette: {
    type: Object,
    required: true,
  },
  generatedData: {
    type: Object,
    default: () => ({
      variants: [],
      colorScales: [],
      darkModeColors: [],
      semanticSuggestions: {},
    }),
  },
});

const emit = defineEmits(['back', 'export', 'update-palette']);

// Helper function to determine text color based on background
const getTextColor = (hex) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#000000';

  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

const getRoleLabel = (role) => {
  if (!role) return 'Unassigned';
  const labels = {
    'hero': 'Hero',
    'accent': 'Accent',
    'neutral-light': 'Light Neutral',
    'neutral-dark': 'Dark Neutral',
  };
  return labels[role] || role;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

// Export functions
const exportPDF = async () => {
  // Fetch contrast results from backend
  let contrastResults = [];
  try {
    const response = await apiClient.post(`${import.meta.env.VITE_API_BASE_URL ?? ''}/api/palettes/analyze`, {
      colors: props.palette.colors.map((c) => ({ hex: c.hex })),
    });
    contrastResults = response.data.contrastResults || [];
  } catch (error) {
    console.error('Error fetching contrast results:', error);
  }

  // Calculate palette metrics
  const metrics = calculatePaletteMetrics();

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const swatchSize = 30;
  const swatchGap = 10;
  let yPos = margin;

  // Title
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(props.palette.name || 'Color Palette', pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Subtitle
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 20;

  // Helper function to add a color swatch
  const addColorSwatch = (color, role, x, y) => {
    const rgb = hexToRgb(color.hex);
    if (rgb) {
      // Draw color swatch rectangle
      doc.setFillColor(rgb.r, rgb.g, rgb.b);
      doc.rect(x, y, swatchSize, swatchSize, 'F');
      doc.setDrawColor(200, 200, 200);
      doc.rect(x, y, swatchSize, swatchSize, 'S');
    }

    // Add hex code below swatch
    doc.setFontSize(9);
    doc.setFont('courier', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(color.hex, x + swatchSize / 2, y + swatchSize + 5, { align: 'center' });

    // Add role label
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(getRoleLabel(role), x + swatchSize / 2, y + swatchSize + 10, { align: 'center' });
  };

  // Helper function to check if we need a new page and update yPos
  const checkNewPage = (requiredHeight) => {
    if (yPos + requiredHeight > pageHeight - margin - 10) {
      doc.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  // Organize colors by role
  const heroColors = props.palette.colors.filter(c => c.role === 'hero');
  const accentColors = props.palette.colors.filter(c => c.role === 'accent');
  const neutralColors = props.palette.colors.filter(c => c.role === 'neutral-light' || c.role === 'neutral-dark');

  // Helper function to add a color group
  const addColorGroup = (title, colors, startY) => {
    if (colors.length === 0) return startY;

    yPos = startY;
    checkNewPage(60);
    
    // Group title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(title, margin, yPos);
    yPos += 12;

    // Calculate layout
    const cols = Math.min(5, Math.floor((pageWidth - margin * 2) / (swatchSize + swatchGap)));
    let xPos = margin;
    let currentRowStartY = yPos;

    colors.forEach((color, index) => {
      // Check if we need a new row
      if (index > 0 && index % cols === 0) {
        yPos = currentRowStartY + swatchSize + 20; // Account for swatch + text below
        currentRowStartY = yPos;
        xPos = margin;
      }

      // Check if we need a new page before adding this color
      if (checkNewPage(swatchSize + 20)) {
        // Redraw title on new page
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(title, margin, yPos);
        yPos += 12;
        currentRowStartY = yPos;
        xPos = margin;
      }

      addColorSwatch(color, color.role, xPos, currentRowStartY);
      xPos += swatchSize + swatchGap;
    });

    // Return the final Y position after all colors
    return currentRowStartY + swatchSize + 25;
  };

  // Add Hero Colors section
  if (heroColors.length > 0) {
    yPos = addColorGroup('Hero Colors', heroColors, yPos);
  }

  // Add Accent Colors section
  if (accentColors.length > 0) {
    yPos = addColorGroup('Accent Colors', accentColors, yPos);
  }

  // Add Neutrals section
  if (neutralColors.length > 0) {
    yPos = addColorGroup('Neutrals', neutralColors, yPos);
  }

  // Add Palette Metrics section
  checkNewPage(90);
  yPos += 10;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Palette Metrics', margin, yPos);
  yPos += 15;

  // Helper function to add a metric bar
  const addMetricBar = (label, value) => {
    checkNewPage(20);
    
    // Label
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(label, margin, yPos);
    
    // Value
    const valueText = `${value}%`;
    doc.text(valueText, pageWidth - margin, yPos, { align: 'right' });
    
    // Bar background
    const barWidth = pageWidth - margin * 2;
    const barHeight = 6;
    const barY = yPos + 4;
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, barY, barWidth, barHeight, 'F');
    
    // Bar fill
    const fillWidth = (barWidth * value) / 100;
    doc.setFillColor(79, 70, 229); // indigo-600
    doc.rect(margin, barY, fillWidth, barHeight, 'F');
    
    yPos += 18;
  };

  addMetricBar('Cool-Warm', metrics.coolWarm);
  addMetricBar('Muted-Vibrant', metrics.mutedVibrant);
  addMetricBar('Dark-Light', metrics.darkLight);
  addMetricBar('Mono-Diverse', metrics.monoDiverse);

  // Add Contrast Testing section
  if (contrastResults.length > 0) {
    checkNewPage(100);
    yPos += 10;
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Contrast Testing Results', margin, yPos);
    yPos += 15;

    // Summary stats
    const totalPairs = contrastResults.length;
    const passingAA = contrastResults.filter((r) => r.passesAA).length;
    const passingAAA = contrastResults.filter((r) => r.passesAAA).length;
    const failing = contrastResults.filter((r) => !r.passesAA).length;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Pairs: ${totalPairs}`, margin, yPos);
    doc.text(`Pass AA: ${passingAA}`, margin + 55, yPos);
    doc.text(`Pass AAA: ${passingAAA}`, margin + 110, yPos);
    doc.text(`Failing: ${failing}`, margin + 165, yPos);
    yPos += 18;

    // Table header
    checkNewPage(15);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    const colWidths = [55, 55, 25, 20, 20];
    const tableStartX = margin;

    doc.text('Color 1', tableStartX, yPos);
    doc.text('Color 2', tableStartX + colWidths[0], yPos);
    doc.text('Ratio', tableStartX + colWidths[0] + colWidths[1], yPos);
    doc.text('AA', tableStartX + colWidths[0] + colWidths[1] + colWidths[2], yPos);
    doc.text('AAA', tableStartX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], yPos);
    yPos += 10;

    // Table rows
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    contrastResults.forEach((result, index) => {
      checkNewPage(12);
      
      if (yPos === margin && index > 0) {
        // Redraw header on new page
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Color 1', tableStartX, yPos);
        doc.text('Color 2', tableStartX + colWidths[0], yPos);
        doc.text('Ratio', tableStartX + colWidths[0] + colWidths[1], yPos);
        doc.text('AA', tableStartX + colWidths[0] + colWidths[1] + colWidths[2], yPos);
        doc.text('AAA', tableStartX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], yPos);
        yPos += 10;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
      }

      // Color swatches - smaller to fit better
      const rgb1 = hexToRgb(result.color1);
      const rgb2 = hexToRgb(result.color2);
      if (rgb1) {
        doc.setFillColor(rgb1.r, rgb1.g, rgb1.b);
        doc.rect(tableStartX, yPos - 5, 10, 5, 'F');
      }
      doc.setFont('courier', 'normal');
      doc.setFontSize(7);
      doc.text(result.color1, tableStartX + 12, yPos);

      if (rgb2) {
        doc.setFillColor(rgb2.r, rgb2.g, rgb2.b);
        doc.rect(tableStartX + colWidths[0], yPos - 5, 10, 5, 'F');
      }
      doc.text(result.color2, tableStartX + colWidths[0] + 12, yPos);

      // Ratio
      doc.setFontSize(8);
      doc.text(result.ratio.toFixed(2) + ':1', tableStartX + colWidths[0] + colWidths[1], yPos);

      // AA
      doc.setFont('helvetica', 'bold');
      if (result.passesAA) {
        doc.setTextColor(0, 150, 0);
      } else {
        doc.setTextColor(200, 0, 0);
      }
      doc.text(result.passesAA ? '✓' : '✗', tableStartX + colWidths[0] + colWidths[1] + colWidths[2], yPos);

      // AAA
      if (result.passesAAA) {
        doc.setTextColor(0, 150, 0);
      } else {
        doc.setTextColor(200, 0, 0);
      }
      doc.text(result.passesAAA ? '✓' : '✗', tableStartX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], yPos);

      doc.setTextColor(0, 0, 0);
      yPos += 10;
    });
  }

  // Add footer on all pages
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text(`Palette Builder - Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

  // Save the PDF
  doc.save(`${props.palette.name || 'palette'}.pdf`);
};

// Brand Guidelines PDF Generator
const exportBrandGuidelines = async () => {
  // Fetch contrast results from backend
  let contrastResults = [];
  try {
    const response = await apiClient.post(`${import.meta.env.VITE_API_BASE_URL ?? ''}/api/palettes/analyze`, {
      colors: props.palette.colors.map((c) => ({ hex: c.hex })),
    });
    contrastResults = response.data.contrastResults || [];
  } catch (error) {
    console.error('Error fetching contrast results:', error);
  }

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;

  // Title Page
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('Brand Guidelines', pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  doc.setFontSize(18);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(props.palette.name || 'Color Palette', pageWidth / 2, yPos, { align: 'center' });
  yPos += 20;

  doc.setFontSize(12);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, yPos, { align: 'center' });
  doc.addPage();

  // Color Palette Section
  yPos = margin;
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Color Palette', margin, yPos);
  yPos += 15;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  const paletteDesc = 'These colors form the foundation of your brand identity. Use them consistently across all brand materials.';
  doc.text(doc.splitTextToSize(paletteDesc, pageWidth - margin * 2), margin, yPos);
  yPos += 15;

  // Color swatches
  const swatchSize = 25;
  const swatchGap = 10;
  const cols = 5;
  let xPos = margin;
  let rowStartY = yPos;

  props.palette.colors.forEach((color, index) => {
    if (index > 0 && index % cols === 0) {
      yPos = rowStartY + swatchSize + 20;
      rowStartY = yPos;
      xPos = margin;
    }

    if (yPos + swatchSize + 25 > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
      rowStartY = yPos;
      xPos = margin;
    }

    const rgb = hexToRgb(color.hex);
    if (rgb) {
      doc.setFillColor(rgb.r, rgb.g, rgb.b);
      doc.rect(xPos, yPos, swatchSize, swatchSize, 'F');
      doc.setDrawColor(200, 200, 200);
      doc.rect(xPos, yPos, swatchSize, swatchSize, 'S');
    }

    doc.setFontSize(8);
    doc.setFont('courier', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(color.hex, xPos + swatchSize / 2, yPos + swatchSize + 5, { align: 'center' });

    if (color.name) {
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(color.name, xPos + swatchSize / 2, yPos + swatchSize + 9, { align: 'center' });
    }

    xPos += swatchSize + swatchGap;
  });

  // Add Semantic Colors Section if available
  const semanticColors = Object.values(props.generatedData.semanticSuggestions || {});
  if (semanticColors.length > 0) {
    doc.addPage();
    yPos = margin;
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Semantic Colors', margin, yPos);
    yPos += 15;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    const semanticDesc = 'These colors are designed for specific semantic purposes (success, error, warning, info) and harmonize with your palette.';
    doc.text(doc.splitTextToSize(semanticDesc, pageWidth - margin * 2), margin, yPos);
    yPos += 15;

    xPos = margin;
    rowStartY = yPos;
    semanticColors.forEach((color, index) => {
      if (index > 0 && index % cols === 0) {
        yPos = rowStartY + swatchSize + 20;
        rowStartY = yPos;
        xPos = margin;
      }

      if (yPos + swatchSize + 25 > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
        rowStartY = yPos;
        xPos = margin;
      }

      const rgb = hexToRgb(color.hex);
      if (rgb) {
        doc.setFillColor(rgb.r, rgb.g, rgb.b);
        doc.rect(xPos, yPos, swatchSize, swatchSize, 'F');
        doc.setDrawColor(200, 200, 200);
        doc.rect(xPos, yPos, swatchSize, swatchSize, 'S');
      }

      doc.setFontSize(8);
      doc.setFont('courier', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(color.hex, xPos + swatchSize / 2, yPos + swatchSize + 5, { align: 'center' });

      if (color.name) {
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(color.name, xPos + swatchSize / 2, yPos + swatchSize + 9, { align: 'center' });
      }

      xPos += swatchSize + swatchGap;
    });
  }

  // Add Color Variants Section if available
  if (props.generatedData.variants && props.generatedData.variants.length > 0) {
    doc.addPage();
    yPos = margin;
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Color Variants', margin, yPos);
    yPos += 15;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    const variantsDesc = 'These are tints and shades generated from your palette colors for additional design flexibility.';
    doc.text(doc.splitTextToSize(variantsDesc, pageWidth - margin * 2), margin, yPos);
    yPos += 15;

    xPos = margin;
    rowStartY = yPos;
    props.generatedData.variants.forEach((variant, index) => {
      if (index > 0 && index % cols === 0) {
        yPos = rowStartY + swatchSize + 20;
        rowStartY = yPos;
        xPos = margin;
      }

      if (yPos + swatchSize + 25 > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
        rowStartY = yPos;
        xPos = margin;
      }

      const rgb = hexToRgb(variant.hex);
      if (rgb) {
        doc.setFillColor(rgb.r, rgb.g, rgb.b);
        doc.rect(xPos, yPos, swatchSize, swatchSize, 'F');
        doc.setDrawColor(200, 200, 200);
        doc.rect(xPos, yPos, swatchSize, swatchSize, 'S');
      }

      doc.setFontSize(8);
      doc.setFont('courier', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(variant.hex, xPos + swatchSize / 2, yPos + swatchSize + 5, { align: 'center' });

      if (variant.type) {
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(variant.type, xPos + swatchSize / 2, yPos + swatchSize + 9, { align: 'center' });
      }

      xPos += swatchSize + swatchGap;
    });
  }

  // Add Color Scales Section if available
  if (props.generatedData.colorScales && props.generatedData.colorScales.length > 0) {
    props.generatedData.colorScales.forEach((scale, scaleIndex) => {
      doc.addPage();
      yPos = margin;
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(`Color Scale: ${scale.baseColor.name || scale.baseColor.hex}`, margin, yPos);
      yPos += 15;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      const scaleDesc = 'A complete color scale from lightest (50) to darkest (900), similar to Tailwind CSS.';
      doc.text(doc.splitTextToSize(scaleDesc, pageWidth - margin * 2), margin, yPos);
      yPos += 20;

      // Display scales in a row
      const scaleSwatchSize = 15;
      const scaleGap = 5;
      xPos = margin;
      scale.shades.forEach((shade) => {
        if (xPos + scaleSwatchSize > pageWidth - margin) {
          yPos += scaleSwatchSize + 25;
          xPos = margin;
        }

        if (yPos + scaleSwatchSize + 25 > pageHeight - margin) {
          doc.addPage();
          yPos = margin;
          xPos = margin;
        }

        const rgb = hexToRgb(shade.hex);
        if (rgb) {
          doc.setFillColor(rgb.r, rgb.g, rgb.b);
          doc.rect(xPos, yPos, scaleSwatchSize, scaleSwatchSize, 'F');
          doc.setDrawColor(200, 200, 200);
          doc.rect(xPos, yPos, scaleSwatchSize, scaleSwatchSize, 'S');
        }

        doc.setFontSize(7);
        doc.setFont('courier', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(shade.weight.toString(), xPos + scaleSwatchSize / 2, yPos + scaleSwatchSize + 4, { align: 'center' });

        xPos += scaleSwatchSize + scaleGap;
      });
    });
  }

  // Add Dark Mode Colors Section if available
  if (props.generatedData.darkModeColors && props.generatedData.darkModeColors.length > 0) {
    doc.addPage();
    yPos = margin;
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Dark Mode Colors', margin, yPos);
    yPos += 15;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    const darkModeDesc = 'These colors are optimized for dark backgrounds and maintain harmony with your palette.';
    doc.text(doc.splitTextToSize(darkModeDesc, pageWidth - margin * 2), margin, yPos);
    yPos += 15;

    xPos = margin;
    rowStartY = yPos;
    props.generatedData.darkModeColors.forEach((color, index) => {
      if (index > 0 && index % cols === 0) {
        yPos = rowStartY + swatchSize + 20;
        rowStartY = yPos;
        xPos = margin;
      }

      if (yPos + swatchSize + 25 > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
        rowStartY = yPos;
        xPos = margin;
      }

      const rgb = hexToRgb(color.hex);
      if (rgb) {
        doc.setFillColor(rgb.r, rgb.g, rgb.b);
        doc.rect(xPos, yPos, swatchSize, swatchSize, 'F');
        doc.setDrawColor(200, 200, 200);
        doc.rect(xPos, yPos, swatchSize, swatchSize, 'S');
      }

      doc.setFontSize(8);
      doc.setFont('courier', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(color.hex, xPos + swatchSize / 2, yPos + swatchSize + 5, { align: 'center' });

      if (color.name) {
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(color.name, xPos + swatchSize / 2, yPos + swatchSize + 9, { align: 'center' });
      }

      xPos += swatchSize + swatchGap;
    });
  }

  doc.addPage();

  // Usage Rules Section
  yPos = margin;
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Usage Rules', margin, yPos);
  yPos += 15;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  const rules = [
    {
      title: 'Do\'s',
      items: [
        'Use colors consistently across all brand materials',
        'Maintain proper contrast ratios for accessibility (WCAG AA minimum)',
        'Use hero colors for primary actions and important elements',
        'Use accent colors sparingly to draw attention',
        'Test color combinations for readability before finalizing',
        'Use neutral colors for backgrounds and text when appropriate',
      ],
    },
    {
      title: 'Don\'ts',
      items: [
        'Don\'t use colors in ways that reduce readability',
        'Don\'t mix color roles (e.g., using accent colors as backgrounds)',
        'Don\'t modify colors without updating the palette',
        'Don\'t use colors that don\'t meet WCAG AA contrast standards',
        'Don\'t use too many colors at once - stick to your palette',
        'Don\'t use colors that clash with your brand identity',
      ],
    },
  ];

  rules.forEach((rule, ruleIndex) => {
    if (yPos + 60 > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(rule.title, margin, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    rule.items.forEach((item) => {
      if (yPos + 10 > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(`• ${item}`, margin + 5, yPos);
      yPos += 7;
    });
    yPos += 5;
  });

  doc.addPage();

  // Logo Placement Guidelines
  yPos = margin;
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Logo Placement Guidelines', margin, yPos);
  yPos += 15;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  const logoGuidelines = [
    'Maintain clear space around your logo - minimum 2x the logo height',
    'Place logos on backgrounds with sufficient contrast',
    'Use your brand colors for logo placement backgrounds when possible',
    'Avoid placing logos on busy or cluttered backgrounds',
    'Ensure logo is readable on both light and dark backgrounds',
    'When using colored backgrounds, ensure logo meets contrast requirements',
  ];

  logoGuidelines.forEach((guideline) => {
    if (yPos + 10 > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
    }
    doc.text(`• ${guideline}`, margin, yPos);
    yPos += 8;
  });

  doc.addPage();

  // Typography Pairing Suggestions
  yPos = margin;
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Typography Pairing Suggestions', margin, yPos);
  yPos += 15;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  const typographyIntro = 'These font pairings work well with your color palette. Choose fonts that complement your brand personality.';
  doc.text(doc.splitTextToSize(typographyIntro, pageWidth - margin * 2), margin, yPos);
  yPos += 15;

  // Get primary colors for typography suggestions
  const heroColors = props.palette.colors.filter(c => c.role === 'hero');
  const primaryColor = heroColors.length > 0 ? heroColors[0] : props.palette.colors[0];

  const typographyPairings = [
    {
      heading: 'Modern & Clean',
      body: 'Inter / Roboto',
      description: 'Perfect for tech brands and modern websites',
      use: 'Body text on light backgrounds using dark neutrals',
    },
    {
      heading: 'Classic & Professional',
      body: 'Merriweather / Open Sans',
      description: 'Ideal for corporate and professional brands',
      use: 'Headings and body text with your hero colors',
    },
    {
      heading: 'Bold & Playful',
      body: 'Montserrat / Lato',
      description: 'Great for creative and energetic brands',
      use: 'Accent colors work well with bold typography',
    },
    {
      heading: 'Elegant & Refined',
      body: 'Playfair Display / Source Sans Pro',
      description: 'Perfect for luxury and premium brands',
      use: 'Use with neutral backgrounds and hero color accents',
    },
  ];

  typographyPairings.forEach((pairing, index) => {
    if (yPos + 40 > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
    }

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(pairing.heading, margin, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(`Fonts: ${pairing.body}`, margin + 5, yPos);
    yPos += 6;

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(doc.splitTextToSize(pairing.description, pageWidth - margin * 2 - 10), margin + 5, yPos);
    yPos += 8;

    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`Best use: ${pairing.use}`, margin + 5, yPos);
    yPos += 12;
  });

  // Add footer on all pages
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text(`Brand Guidelines - ${props.palette.name || 'Color Palette'} - Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

  // Save the PDF
  doc.save(`${props.palette.name || 'brand'}-guidelines.pdf`);
};

// Calculate palette metrics
const calculatePaletteMetrics = () => {
  if (!props.palette.colors || props.palette.colors.length === 0) {
    return {
      coolWarm: 50,
      mutedVibrant: 50,
      darkLight: 50,
      monoDiverse: 50,
    };
  }

  const colors = props.palette.colors.map((c) => c.hex);
  
  // Calculate HSL values for all colors
  const hslValues = colors.map((hex) => {
    const rgb = hexToRgb(hex);
    return rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;
  }).filter(hsl => hsl !== null);

  if (hslValues.length === 0) {
    return {
      coolWarm: 50,
      mutedVibrant: 50,
      darkLight: 50,
      monoDiverse: 50,
    };
  }

  // Calculate average saturation and lightness (straightforward)
  const avgSaturation = hslValues.reduce((sum, hsl) => sum + hsl.s, 0) / hslValues.length;
  const avgLightness = hslValues.reduce((sum, hsl) => sum + hsl.l, 0) / hslValues.length;

  // Calculate average hue using circular mean (convert to Cartesian, average, convert back)
  // This properly handles the circular nature of hue (0° = 360°)
  const hueRadians = hslValues.map(hsl => (hsl.h * Math.PI) / 180);
  const avgSin = hueRadians.reduce((sum, h) => sum + Math.sin(h), 0) / hueRadians.length;
  const avgCos = hueRadians.reduce((sum, h) => sum + Math.cos(h), 0) / hueRadians.length;
  let avgHueRad = Math.atan2(avgSin, avgCos);
  if (avgHueRad < 0) avgHueRad += 2 * Math.PI;
  const avgHue = (avgHueRad * 180) / Math.PI;

  // Cool-Warm: Map hue to 0-100 scale where 0 = cool (blue), 100 = warm (red/orange)
  // Warm colors: 0-60° (red, orange, yellow)
  // Cool colors: 180-240° (cyan, blue)
  // The mapping should be: red (0°) = 100, yellow (60°) = 100, green (120°) = 50, cyan (180°) = 0, blue (240°) = 0, magenta (300°) = 50, back to red (360°)
  let coolWarm;
  if (avgHue <= 60) {
    // Warm: 0-60° maps to 100
    coolWarm = 100;
  } else if (avgHue <= 120) {
    // Warm to neutral: 60-120° maps from 100 to 50
    coolWarm = 100 - ((avgHue - 60) / 60) * 50;
  } else if (avgHue <= 240) {
    // Neutral to cool: 120-240° maps from 50 to 0
    coolWarm = 50 - ((avgHue - 120) / 120) * 50;
  } else {
    // Cool to warm: 240-360° maps from 0 to 100
    coolWarm = ((avgHue - 240) / 120) * 100;
  }
  coolWarm = Math.max(0, Math.min(100, coolWarm));

  // Muted-Vibrant: Based on saturation (0-100 scale)
  const mutedVibrant = Math.max(0, Math.min(100, avgSaturation));

  // Dark-Light: Based on lightness (0-100 scale)
  const darkLight = Math.max(0, Math.min(100, avgLightness));

  // Mono-Diverse: Based on hue variance (circular variance)
  // Calculate circular variance by finding the average distance from mean hue
  const hueVariances = hslValues.map((hsl) => {
    const hueRad = (hsl.h * Math.PI) / 180;
    const avgHueRad = (avgHue * Math.PI) / 180;
    // Calculate circular distance (min distance around the circle)
    let diff = Math.abs(hueRad - avgHueRad);
    if (diff > Math.PI) diff = 2 * Math.PI - diff;
    return diff;
  });
  const avgHueVarianceRad = hueVariances.reduce((a, b) => a + b, 0) / hueVariances.length;
  // Convert to degrees and normalize to 0-100 scale
  // Maximum variance would be 180° (half circle), so divide by 180
  const avgHueVarianceDeg = (avgHueVarianceRad * 180) / Math.PI;
  const monoDiverse = Math.min(100, (avgHueVarianceDeg / 180) * 100);

  return {
    coolWarm: Math.round(coolWarm),
    mutedVibrant: Math.round(mutedVibrant),
    darkLight: Math.round(darkLight),
    monoDiverse: Math.round(monoDiverse),
  };
};

// Convert RGB to HSL
const rgbToHsl = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: h * 360,
    s: s * 100,
    l: l * 100,
  };
};

const exportSVG = () => {
  const svg = generateSVG();
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${props.palette.name || 'palette'}.svg`;
  link.click();
};

const generateSVG = () => {
  const colors = props.palette.colors.map((c, i) => ({
    hex: c.hex,
    role: c.role || 'unassigned',
    index: i,
  }));

  const swatchSize = 80;
  const swatchGap = 20;
  const cols = Math.ceil(Math.sqrt(colors.length));
  const rows = Math.ceil(colors.length / cols);
  const width = cols * (swatchSize + swatchGap) + swatchGap;
  const height = rows * (swatchSize + swatchGap + 30) + swatchGap + 50;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <text x="${width / 2}" y="30" text-anchor="middle" font-family="Arial" font-size="24" font-weight="bold">${props.palette.name || 'Color Palette'}</text>`;

  colors.forEach((color, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = swatchGap + col * (swatchSize + swatchGap);
    const y = 60 + row * (swatchSize + swatchGap + 30);

    svg += `
    <rect x="${x}" y="${y}" width="${swatchSize}" height="${swatchSize}" fill="${color.hex}" stroke="#333" stroke-width="2"/>
    <text x="${x + swatchSize / 2}" y="${y + swatchSize + 15}" text-anchor="middle" font-family="monospace" font-size="10">${color.hex}</text>
    <text x="${x + swatchSize / 2}" y="${y + swatchSize + 27}" text-anchor="middle" font-family="Arial" font-size="9">${getRoleLabel(color.role)}</text>`;
  });

  svg += '</svg>';
  return svg;
};

const exportPNG = async () => {
  const svg = generateSVG();
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    
    canvas.toBlob((blob) => {
      const pngUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = pngUrl;
      link.download = `${props.palette.name || 'palette'}.png`;
      link.click();
    });
  };
  img.src = url;
};

const copyColors = async () => {
  const colorsList = props.palette.colors.map((c) => c.hex).join('\n');
  try {
    await navigator.clipboard.writeText(colorsList);
    showNotice('Colors copied to clipboard!', 'success');
  } catch (error) {
    console.error('Failed to copy:', error);
    showNotice('Failed to copy colors. Please try again.', 'error');
  }
};

const exportJSON = () => {
  const dataStr = JSON.stringify(props.palette, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${props.palette.name || 'palette'}.json`;
  link.click();
};

const exportCSS = () => {
  const heroColors = props.palette.colors.filter(c => c.role === 'hero');
  const accentColors = props.palette.colors.filter(c => c.role === 'accent');
  const neutralColors = props.palette.colors.filter(c => c.role === 'neutral-light' || c.role === 'neutral-dark');
  
  let css = ':root {\n';
  heroColors.forEach((color, index) => {
    css += `  --color-hero${index > 0 ? `-${index + 1}` : ''}: ${color.hex};\n`;
  });
  accentColors.forEach((color, index) => {
    css += `  --color-accent-${index + 1}: ${color.hex};\n`;
  });
  neutralColors.forEach((color, index) => {
    const type = color.role === 'neutral-dark' ? 'dark' : 'light';
    css += `  --color-neutral-${type}-${index + 1}: ${color.hex};\n`;
  });
  css += '}\n';
  
  const dataBlob = new Blob([css], { type: 'text/css' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${props.palette.name || 'palette'}.css`;
  link.click();
};

const exportSCSS = () => {
  const heroColors = props.palette.colors.filter(c => c.role === 'hero');
  const accentColors = props.palette.colors.filter(c => c.role === 'accent');
  const neutralColors = props.palette.colors.filter(c => c.role === 'neutral-light' || c.role === 'neutral-dark');
  
  let scss = '';
  heroColors.forEach((color, index) => {
    scss += `$color-hero${index > 0 ? `-${index + 1}` : ''}: ${color.hex};\n`;
  });
  accentColors.forEach((color, index) => {
    scss += `$color-accent-${index + 1}: ${color.hex};\n`;
  });
  neutralColors.forEach((color, index) => {
    const type = color.role === 'neutral-dark' ? 'dark' : 'light';
    scss += `$color-neutral-${type}-${index + 1}: ${color.hex};\n`;
  });
  
  const dataBlob = new Blob([scss], { type: 'text/scss' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${props.palette.name || 'palette'}.scss`;
  link.click();
};

const exportStyleDictionary = () => {
  const heroColors = props.palette.colors.filter(c => c.role === 'hero');
  const accentColors = props.palette.colors.filter(c => c.role === 'accent');
  const neutralColors = props.palette.colors.filter(c => c.role === 'neutral-light' || c.role === 'neutral-dark');
  
  // Build Style Dictionary format
  // Style Dictionary uses nested objects with "value" properties
  const tokens = {
    color: {},
  };

  // Add hero/primary colors
  if (heroColors.length > 0) {
    tokens.color.base = {};
    heroColors.forEach((color, index) => {
      const key = index === 0 ? 'primary' : `primary-${index + 1}`;
      tokens.color.base[key] = {
        value: color.hex.toUpperCase(),
      };
    });
  }

  // Add accent colors
  if (accentColors.length > 0) {
    tokens.color.accent = {};
    accentColors.forEach((color, index) => {
      tokens.color.accent[`color-${index + 1}`] = {
        value: color.hex.toUpperCase(),
      };
    });
  }

  // Add neutral colors
  if (neutralColors.length > 0) {
    tokens.color.neutral = {};
    neutralColors.forEach((color, index) => {
      const type = color.role === 'neutral-dark' ? 'dark' : 'light';
      const key = `${type}-${index + 1}`;
      tokens.color.neutral[key] = {
        value: color.hex.toUpperCase(),
      };
    });
  }

  // If no colors are categorized, add all colors under base
  if (heroColors.length === 0 && accentColors.length === 0 && neutralColors.length === 0) {
    tokens.color.base = {};
    props.palette.colors.forEach((color, index) => {
      tokens.color.base[`color-${index + 1}`] = {
        value: color.hex.toUpperCase(),
      };
    });
  }

  const json = JSON.stringify(tokens, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${props.palette.name || 'palette'}-tokens.json`;
  link.click();
  URL.revokeObjectURL(url);
};

const exportAdobeASE = () => {
  // Adobe ASE file format implementation
  const colors = props.palette.colors;
  
  if (colors.length === 0) {
    showNotice('No colors to export', 'warning');
    return;
  }

  // Helper function to write UTF-16BE string
  const writeUTF16BEString = (str) => {
    const buffer = new ArrayBuffer(str.length * 2 + 2); // +2 for null terminator
    const view = new DataView(buffer);
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      view.setUint16(i * 2, code, false); // false = big-endian
    }
    // Null terminator
    view.setUint16(str.length * 2, 0, false);
    return buffer;
  };

  // Convert hex to normalized RGB (0.0-1.0)
  const hexToNormalizedRGB = (hex) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return { r: 0, g: 0, b: 0 };
    return {
      r: rgb.r / 255.0,
      g: rgb.g / 255.0,
      b: rgb.b / 255.0,
    };
  };

  // Build the ASE file
  const chunks = [];

  // Create color chunks
  colors.forEach((color) => {
    const colorName = `${getRoleLabel(color.role)} - ${color.hex}`;
    const nameBuffer = writeUTF16BEString(colorName);
    const normalizedRGB = hexToNormalizedRGB(color.hex);

    // Calculate chunk length
    // Name length (2) + name (UTF-16BE with null terminator) + color space (4) + RGB values (3 * 4) + color type (2)
    const chunkLength = 2 + nameBuffer.byteLength + 4 + 12 + 2;

    // Build chunk data
    const chunkData = new ArrayBuffer(chunkLength);
    const chunkView = new DataView(chunkData);
    let offset = 0;

    // Name length (2 bytes)
    chunkView.setUint16(offset, (nameBuffer.byteLength - 2) / 2, false); // Length in characters (excluding null terminator)
    offset += 2;

    // Name (UTF-16BE)
    const nameArray = new Uint8Array(nameBuffer);
    const chunkArray = new Uint8Array(chunkData);
    chunkArray.set(nameArray, offset);
    offset += nameBuffer.byteLength;

    // Color space: "RGB " (4 bytes ASCII)
    chunkView.setUint8(offset, 0x52); // 'R'
    chunkView.setUint8(offset + 1, 0x47); // 'G'
    chunkView.setUint8(offset + 2, 0x42); // 'B'
    chunkView.setUint8(offset + 3, 0x20); // ' '
    offset += 4;

    // RGB values (3 * 4 bytes floats)
    chunkView.setFloat32(offset, normalizedRGB.r, false);
    offset += 4;
    chunkView.setFloat32(offset, normalizedRGB.g, false);
    offset += 4;
    chunkView.setFloat32(offset, normalizedRGB.b, false);
    offset += 4;

    // Color type (2 bytes): 0x0000 = Global color, 0x0001 = Spot color
    chunkView.setUint16(offset, 0x0000, false);

    chunks.push({
      type: 0x00010000, // Color entry
      length: chunkLength,
      data: chunkData,
    });
  });

  // Build the complete ASE file
  const headerSize = 12; // Signature (4) + Version (4) + Chunk count (4)
  let fileSize = headerSize;
  chunks.forEach((chunk) => {
    fileSize += 8 + chunk.length; // Type (4) + Length (4) + chunk data
  });

  const fileBuffer = new ArrayBuffer(fileSize);
  const fileView = new DataView(fileBuffer);
  let fileOffset = 0;

  // Write header
  // Signature: "ASEF"
  fileView.setUint8(fileOffset, 0x41); // 'A'
  fileView.setUint8(fileOffset + 1, 0x53); // 'S'
  fileView.setUint8(fileOffset + 2, 0x45); // 'E'
  fileView.setUint8(fileOffset + 3, 0x46); // 'F'
  fileOffset += 4;

  // Version: 0x00010000 (version 1.0)
  fileView.setUint32(fileOffset, 0x00010000, false);
  fileOffset += 4;

  // Chunk count
  fileView.setUint32(fileOffset, chunks.length, false);
  fileOffset += 4;

  // Write chunks
  chunks.forEach((chunk) => {
    // Chunk type
    fileView.setUint32(fileOffset, chunk.type, false);
    fileOffset += 4;

    // Chunk length
    fileView.setUint32(fileOffset, chunk.length, false);
    fileOffset += 4;

    // Chunk data
    const chunkArray = new Uint8Array(chunk.data);
    const fileArray = new Uint8Array(fileBuffer);
    fileArray.set(chunkArray, fileOffset);
    fileOffset += chunk.length;
  });

  // Create blob and download
  const blob = new Blob([fileBuffer], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${props.palette.name || 'palette'}.ase`;
  link.click();
  URL.revokeObjectURL(url);
};

const complete = async () => {
  try {
    console.log('Complete button clicked');
    await savePalette();
    console.log('Palette saved, emitting export event');
    emit('export', props.palette);
  } catch (error) {
    console.error('Error in complete function:', error);
    showNotice('Error completing palette. Please try again.', 'error');
  }
};

const savePalette = async () => {
  try {
    console.log('Saving palette:', props.palette);
    
    if (!props.palette.colors || props.palette.colors.length === 0) {
      showNotice('Please add colors to your palette before saving.', 'error');
      throw new Error('No colors in palette');
    }
    
    const paletteData = {
      name: props.palette.name || 'My Color Palette',
      colors: props.palette.colors.map((c) => ({
        hex: c.hex,
        name: c.name || '',
        role: c.role || null,
      })),
    };

    console.log('Palette data to save:', paletteData);

    let response;
    if (props.palette.id) {
      // Update existing palette
      console.log('Updating existing palette:', props.palette.id);
      response = await apiClient.put(`${import.meta.env.VITE_API_BASE_URL ?? ''}/api/palettes/${props.palette.id}`, paletteData);
    } else {
      // Create new palette
      console.log('Creating new palette');
      response = await apiClient.post(`${import.meta.env.VITE_API_BASE_URL ?? ''}/api/palettes`, paletteData);
    }

    console.log('Save response:', response.data);

    // Update the palette with the response data (includes id and updatedAt)
    const updatedPalette = {
      ...props.palette,
      id: response.data.id,
      name: response.data.name,
      updatedAt: response.data.updatedAt,
      createdAt: response.data.createdAt,
    };
    
    console.log('Updated palette:', updatedPalette);
    emit('update-palette', updatedPalette);
    // The palette builder confirms the save when it receives `export`
    
    return updatedPalette;
  } catch (error) {
    console.error('Error saving palette:', error);
    showNotice(`Error saving palette: ${error.message || 'Please try again.'}`, 'error');
    throw error;
  }
};

// Text on the demo buttons and headers (the palette's colours are the fills)
const DEMO_TEXT = '#FFFFFF';

const exportOptions = [
  { title: 'PDF Report', body: 'Complete palette report with swatches, roles, and pairings', icon: 'download', run: () => exportPDF() },
  { title: 'Brand Guidelines PDF', body: 'Complete brand guidelines with usage rules, logo placement, and typography', icon: 'download', run: () => exportBrandGuidelines() },
  { title: 'SVG Export', body: 'Scalable vector graphic with palette details', icon: 'download', run: () => exportSVG() },
  { title: 'PNG Preview', body: 'Visual palette preview image', icon: 'download', run: () => exportPNG() },
  { title: 'Copy Colors', body: 'All hex codes in a list', icon: 'content_copy', run: () => copyColors() },
  { title: 'JSON Export', body: 'Complete palette data in JSON format', icon: 'download', run: () => exportJSON() },
  { title: 'CSS Variables', body: 'CSS custom properties for web projects', icon: 'download', run: () => exportCSS() },
  { title: 'SCSS Variables', body: 'SCSS variables for Sass/SCSS projects', icon: 'download', run: () => exportSCSS() },
  { title: 'Style Dictionary', body: 'Design tokens for Style Dictionary', icon: 'download', run: () => exportStyleDictionary() },
  { title: 'Adobe ASE', body: 'Adobe Swatch Exchange for Creative Suite', icon: 'download', run: () => exportAdobeASE() },
];
</script>

<style scoped>
.export-option {
  @apply w-full flex items-center justify-between gap-3 p-4 rounded-tile border border-line-faint bg-surface-raised transition-colors hover:bg-fill-hover hover:border-accent-border focus-visible:outline focus-visible:outline-2 outline-focus;
}
</style>
