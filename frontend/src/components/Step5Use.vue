<template>
  <div>
    <!-- Palette Info - Remove title since it's in header -->
    <div v-if="palette.updatedAt" class="mb-6 pb-6 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-500">
            Last updated: {{ formatDate(palette.updatedAt) }}
          </p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <!-- Your Palette Section -->
      <div>
        <h3 class="text-xl font-semibold text-gray-900 mb-6">Color Swatches</h3>
        <div class="grid grid-cols-4 gap-4">
          <div
            v-for="(color, index) in palette.colors"
            :key="index"
            class="flex flex-col"
          >
            <div
              class="w-full h-24 rounded-lg shadow-md mb-2 flex items-center justify-center"
              :style="{ backgroundColor: color.hex }"
            >
              <div class="font-mono text-xs font-semibold" :style="getTextColor(color.hex)">
                {{ color.hex }}
              </div>
            </div>
            <div class="text-xs text-gray-600 text-center capitalize">
              {{ getRoleLabel(color.role) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Export Options Section -->
      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Export Options</h2>
        <div class="space-y-3">
          <!-- PDF Report -->
          <button
            @click="exportPDF"
            class="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-indigo-300 transition-all group"
          >
            <div class="flex-1 text-left">
              <div class="font-semibold text-gray-900 mb-1">PDF Report</div>
              <div class="text-sm text-gray-600">Complete palette report with swatches, roles, and pairings</div>
            </div>
            <svg class="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>

          <!-- SVG Export -->
          <button
            @click="exportSVG"
            class="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-indigo-300 transition-all group"
          >
            <div class="flex-1 text-left">
              <div class="font-semibold text-gray-900 mb-1">SVG Export</div>
              <div class="text-sm text-gray-600">Scalable vector graphic with palette details</div>
            </div>
            <svg class="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>

          <!-- PNG Preview -->
          <button
            @click="exportPNG"
            class="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-indigo-300 transition-all group"
          >
            <div class="flex-1 text-left">
              <div class="font-semibold text-gray-900 mb-1">PNG Preview</div>
              <div class="text-sm text-gray-600">Visual palette preview image</div>
            </div>
            <svg class="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>

          <!-- Copy Colors -->
          <button
            @click="copyColors"
            class="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-indigo-300 transition-all group"
          >
            <div class="flex-1 text-left">
              <div class="font-semibold text-gray-900 mb-1">Copy Colors</div>
              <div class="text-sm text-gray-600">All hex codes in a list</div>
            </div>
            <svg class="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>

          <!-- JSON Export -->
          <button
            @click="exportJSON"
            class="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-indigo-300 transition-all group"
          >
            <div class="flex-1 text-left">
              <div class="font-semibold text-gray-900 mb-1">JSON Export</div>
              <div class="text-sm text-gray-600">Complete palette data in JSON format</div>
            </div>
            <svg class="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>

          <!-- CSS Variables -->
          <button
            @click="exportCSS"
            class="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-indigo-300 transition-all group"
          >
            <div class="flex-1 text-left">
              <div class="font-semibold text-gray-900 mb-1">CSS Variables</div>
              <div class="text-sm text-gray-600">CSS custom properties for web projects</div>
            </div>
            <svg class="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>

          <!-- SCSS Variables -->
          <button
            @click="exportSCSS"
            class="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-indigo-300 transition-all group"
          >
            <div class="flex-1 text-left">
              <div class="font-semibold text-gray-900 mb-1">SCSS Variables</div>
              <div class="text-sm text-gray-600">SCSS variables for Sass/SCSS projects</div>
            </div>
            <svg class="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>

          <!-- Style Dictionary -->
          <button
            @click="exportStyleDictionary"
            class="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-indigo-300 transition-all group"
          >
            <div class="flex-1 text-left">
              <div class="font-semibold text-gray-900 mb-1">Style Dictionary</div>
              <div class="text-sm text-gray-600">Design tokens for Style Dictionary</div>
            </div>
            <svg class="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>

          <!-- Adobe ASE -->
          <button
            @click="exportAdobeASE"
            class="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-indigo-300 transition-all group"
          >
            <div class="flex-1 text-left">
              <div class="font-semibold text-gray-900 mb-1">Adobe ASE</div>
              <div class="text-sm text-gray-600">Adobe Swatch Exchange for Creative Suite</div>
            </div>
            <svg class="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <div class="flex justify-between pt-8 border-t border-gray-200">
      <button
        @click="$emit('back')"
        class="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
      >
        ← Back
      </button>
      <button
        @click="complete"
        class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Save & Complete
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import axios from 'axios';
import jsPDF from 'jspdf';

const props = defineProps({
  palette: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['back', 'export', 'update-palette']);

// Helper function to determine text color based on background
const getTextColor = (hex) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return { color: '#000000' };
  
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return {
    color: luminance > 0.5 ? '#000000' : '#FFFFFF',
    textShadow: luminance > 0.5 ? 'none' : '0 1px 2px rgba(0,0,0,0.2)',
  };
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
    const response = await axios.post('http://localhost:3000/api/palettes/analyze', {
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
    alert('Colors copied to clipboard!');
  } catch (error) {
    console.error('Failed to copy:', error);
    alert('Failed to copy colors. Please try again.');
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
    alert('No colors to export');
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
  await savePalette();
  emit('export', props.palette);
};

const savePalette = async () => {
  try {
    const paletteData = {
      name: props.palette.name || 'My Color Palette',
      colors: props.palette.colors.map((c) => ({
        hex: c.hex,
        name: c.name || '',
        role: c.role || null,
      })),
    };

    let response;
    if (props.palette.id) {
      // Update existing palette
      response = await axios.put(`http://localhost:3000/api/palettes/${props.palette.id}`, paletteData);
    } else {
      // Create new palette
      response = await axios.post('http://localhost:3000/api/palettes', paletteData);
    }

    // Update the palette with the response data (includes id and updatedAt)
    const updatedPalette = {
      ...props.palette,
      id: response.data.id,
      name: response.data.name,
      updatedAt: response.data.updatedAt,
      createdAt: response.data.createdAt,
    };
    
    emit('update-palette', updatedPalette);
    alert('Palette saved successfully!');
  } catch (error) {
    console.error('Error saving palette:', error);
    alert('Error saving palette. Please try again.');
  }
};
</script>

