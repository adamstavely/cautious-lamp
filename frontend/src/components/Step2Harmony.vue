<template>
  <div>
    <InlineNotice :notice="notice" class="mb-6" @dismiss="clearNotice" />

    <div class="flex flex-col lg:flex-row gap-6 mb-8">
      <!-- Main Content Area -->
      <div class="flex-1 min-w-0">
        <p class="text-ink-secondary mb-6">Review color relationships, harmony patterns, and palette metrics.</p>

        <!-- Your Brand Colors -->
        <section aria-labelledby="brand-colors-heading">
          <h3 id="brand-colors-heading" class="text-lg font-semibold text-ink-strong mb-4">Your brand colors</h3>
          <ul class="flex flex-wrap gap-6">
            <li v-for="(color, index) in palette.colors" :key="index" class="flex flex-col items-center">
              <UiColorSample class="w-16 h-16 rounded-pill border-2 shadow-control mb-2" :color="color.hex" />
              <span class="font-code text-xs text-ink mb-1">{{ color.hex }}</span>
              <div class="flex items-center gap-1">
                <UiButton variant="ghost" size="sm" icon="content_copy" icon-only :label="`Copy hex code ${color.hex}`" @click="copyToClipboard(color.hex)" />
                <UiButton variant="ghost" size="sm" icon="delete" icon-only :label="`Delete color ${color.hex}`" @click="removeColor(index)" />
              </div>
            </li>
          </ul>
        </section>
      </div>

      <!-- Insights Sidebar -->
      <aside class="w-full lg:w-96 shrink-0 rounded-card border border-line-faint bg-surface-sunken p-6 space-y-8" aria-label="Insights">
        <!-- Harmony Check Section -->
        <section>
          <div class="flex items-center justify-between mb-3">
            <h4 class="flex items-center gap-2 text-sm font-semibold text-ink-strong">
              <span class="material-symbols-outlined text-xl text-accent-text" aria-hidden="true">palette</span>
              Harmony check
            </h4>
            <UiButton variant="ghost" size="sm" :aria-expanded="!harmonyCheckCollapsed" @click="toggleHarmonyCheckCollapse">
              {{ harmonyCheckCollapsed ? 'Expand' : 'Collapse' }}
            </UiButton>
          </div>
          <p class="text-xs text-ink-secondary mb-4">Scan for colors that don't fit your palette's harmony</p>

          <div v-if="!harmonyCheckCollapsed">
            <UiSpinner v-if="loading" label="Analyzing…" />

            <div v-else-if="analysis && analysis.problematicColors && analysis.problematicColors.length > 0">
              <UiCallout tone="warning" class="mb-4" role="status">
                {{ analysis.problematicColors.length }} color{{ analysis.problematicColors.length > 1 ? 's' : '' }} could be balanced
                <template #actions>
                  <UiButton variant="primary" size="sm" @click="applyAllFixes">Apply all fixes</UiButton>
                </template>
              </UiCallout>

              <ul class="space-y-4">
                <li v-for="(item, index) in analysis.problematicColors" :key="index" class="rounded-tile border border-line-faint bg-surface-raised p-4">
                  <div class="flex items-center gap-4 mb-3">
                    <div class="flex-1">
                      <p class="text-xs text-ink-secondary mb-2">Current</p>
                      <UiColorSample class="w-full h-12 rounded-control shadow-control mb-1" :color="item.color" />
                      <p class="font-code text-xs text-ink">{{ item.color }}</p>
                    </div>
                    <div class="flex-1">
                      <p class="text-xs text-ink-secondary mb-2">Suggested</p>
                      <UiColorSample class="w-full h-12 rounded-control shadow-control mb-1" :color="item.fixes[0] || item.color" />
                      <p class="font-code text-xs text-ink">{{ item.fixes[0] || item.color }}</p>
                    </div>
                  </div>

                  <p class="text-sm font-medium text-ink-strong mb-1">{{ getIssueDescription(item) }}</p>
                  <p class="text-xs text-ink-secondary mb-3">{{ getActionSuggestion(item) }}</p>

                  <p class="flex items-center gap-1 text-xs text-success mb-3">
                    <span class="material-symbols-outlined text-base" aria-hidden="true">check_circle</span>
                    Contrast-safe
                  </p>

                  <div class="flex gap-2">
                    <UiButton size="sm" icon="close" class="flex-1 justify-center" @click="dismissIssue(index)">Dismiss</UiButton>
                    <UiButton variant="primary" size="sm" class="flex-1 justify-center" @click="applyFix(item.color, item.fixes[0])">Apply</UiButton>
                  </div>
                </li>
              </ul>

              <UiButton size="sm" icon="refresh" :loading="loading" class="w-full justify-center mt-4" @click.stop="analyzePalette">
                {{ loading ? 'Running check...' : 'Run check again' }}
              </UiButton>
            </div>

            <div v-else-if="analysis && (!analysis.problematicColors || analysis.problematicColors.length === 0)">
              <UiCallout tone="success" role="status">All colors are balanced!</UiCallout>
              <UiButton size="sm" icon="refresh" :loading="loading" class="w-full justify-center mt-3" @click.stop="analyzePalette">
                {{ loading ? 'Running check...' : 'Run check again' }}
              </UiButton>
            </div>
          </div>
        </section>

        <!-- Harmony Diagram Section -->
        <section>
          <h4 class="flex items-center gap-2 text-sm font-semibold text-ink-strong mb-4">
            <span class="material-symbols-outlined text-xl text-accent-text" aria-hidden="true">hub</span>
            Harmony diagram
          </h4>
          <div class="relative w-full aspect-square">
            <canvas
              ref="harmonyCanvas"
              class="w-full h-full rounded-tile border border-line-faint"
              role="img"
              aria-label="Diagram of the palette's colors, joined where they are analogous, complementary or triadic"
            ></canvas>
          </div>
          <p class="text-xs text-ink-muted mt-2">Visual representation of color relationships in your palette.</p>
        </section>

        <!-- Palette Metrics Section -->
        <section>
          <h4 class="flex items-center gap-2 text-sm font-semibold text-ink-strong mb-4">
            <span class="material-symbols-outlined text-xl text-accent-text" aria-hidden="true">bar_chart</span>
            Palette metrics
          </h4>
          <div class="space-y-4 mb-4">
            <div v-for="bar in metricBars" :key="bar.key" role="meter" :aria-label="`${bar.low} to ${bar.high}`" :aria-valuenow="bar.value" aria-valuemin="0" aria-valuemax="100">
              <div class="flex justify-between mb-2 text-xs text-ink-secondary" aria-hidden="true">
                <span>{{ bar.low }}</span>
                <span>{{ bar.high }}</span>
              </div>
              <UiColorSample class="relative h-2 rounded-pill" :color="bar.gradient">
                <span class="metric-marker" :class="`metric-marker-${bar.key}`"></span>
              </UiColorSample>
            </div>
          </div>
          <p class="text-xs text-ink-muted">
            These metrics show your palette's overall character and can guide you toward colors that balance or enhance certain qualities. Neutral colors are excluded from this analysis.
          </p>
        </section>
      </aside>
    </div>

    <!-- Navigation -->
    <div class="flex justify-between pt-8 border-t border-line-faint">
      <UiButton icon="arrow_back" @click="$emit('back')">Back</UiButton>
      <UiButton variant="primary" trailing-icon="arrow_forward" @click="$emit('next')">Next: Contrast testing</UiButton>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue';
import apiClient from '../services/api.js';
import InlineNotice from './InlineNotice.vue';
import { UiButton, UiCallout, UiSpinner } from './ui';
import UiColorSample from './ui/UiColorSample.vue';
import { useNotice } from '../composables/useNotice.js';

const { notice, showNotice, clearNotice } = useNotice();

const props = defineProps({
  palette: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['update-palette', 'back', 'next']);

const loading = ref(false);
const analysis = ref(null);
const harmonyCheckCollapsed = ref(false);
const dismissedIssues = ref([]);
const recentlyFixed = ref(new Set()); // Track colors that were recently fixed to prevent loops
const harmonyCanvas = ref(null);

const metrics = computed(() => {
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
});

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

const analyzePalette = async () => {
  if (props.palette.colors.length === 0) {
    console.warn('Cannot analyze: palette is empty');
    return;
  }

  console.log('Running harmony check for palette:', props.palette.colors.map((c) => c.hex));
  loading.value = true;
  try {
    const response = await apiClient.post(`${import.meta.env.VITE_API_BASE_URL ?? ''}/api/palettes/analyze`, {
      colors: props.palette.colors.map((c) => ({ hex: c.hex })),
    });
    
    console.log('Harmony check response:', response.data);
    console.log('Problematic colors found:', response.data.problematicColors?.length || 0);
    
    // Filter out colors that were recently fixed to prevent loops
    if (recentlyFixed.value.size > 0) {
      response.data.problematicColors = response.data.problematicColors?.filter(
        (item) => !recentlyFixed.value.has(item.color)
      ) || [];
      
      // Clear recently fixed after a delay to allow natural changes
      setTimeout(() => {
        recentlyFixed.value.clear();
      }, 2000);
    }
    
    analysis.value = response.data;
    dismissedIssues.value = [];
  } catch (error) {
    console.error('Error analyzing palette:', error);
    showNotice('Error analyzing palette. Please try again.', 'error');
  } finally {
    loading.value = false;
  }
};

const applyFix = (oldColor, newColor) => {
  // Mark this color as recently fixed to prevent re-flagging
  recentlyFixed.value.add(oldColor);
  recentlyFixed.value.add(newColor);
  
  const newPalette = {
    ...props.palette,
    colors: props.palette.colors.map((c) =>
      c.hex === oldColor ? { ...c, hex: newColor } : c
    ),
  };
  emit('update-palette', newPalette);
  
  // Use setTimeout to debounce the analysis and let the fix settle
  setTimeout(() => {
    analyzePalette();
  }, 100);
};

const applyAllFixes = () => {
  if (!analysis.value || !analysis.value.problematicColors) return;

  let newPalette = { ...props.palette };
  analysis.value.problematicColors.forEach((item) => {
    if (item.fixes && item.fixes.length > 0) {
      // Mark colors as recently fixed to prevent re-flagging
      recentlyFixed.value.add(item.color);
      recentlyFixed.value.add(item.fixes[0]);
      
      newPalette.colors = newPalette.colors.map((c) =>
        c.hex === item.color ? { ...c, hex: item.fixes[0] } : c
      );
    }
  });
  emit('update-palette', newPalette);
  
  // Use setTimeout to debounce the analysis and let fixes settle
  setTimeout(() => {
    analyzePalette();
  }, 100);
};

const dismissIssue = (index) => {
  if (!analysis.value || !analysis.value.problematicColors) return;
  const color = analysis.value.problematicColors[index].color;
  dismissedIssues.value.push(color);
  // Filter out dismissed issues
  analysis.value.problematicColors = analysis.value.problematicColors.filter(
    (_, i) => i !== index
  );
};

const getIssueDescription = (item) => {
  if (item.analysis.isTooDark) return 'Too dark compared to palette';
  if (item.analysis.isTooBright) return 'Too bright compared to palette';
  if (item.analysis.isTooVibrant) return 'Too vibrant compared to palette';
  return 'Color harmony issue';
};

const getActionSuggestion = (item) => {
  if (item.analysis.isTooDark) return 'Adjust brightness to harmonize with the palette';
  if (item.analysis.isTooBright) return 'Reduce brightness to harmonize with the palette';
  if (item.analysis.isTooVibrant) return 'Reduce saturation to harmonize with the palette';
  return 'Adjust color to harmonize with the palette';
};

const toggleHarmonyCheckCollapse = () => {
  harmonyCheckCollapsed.value = !harmonyCheckCollapsed.value;
};

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    showNotice(`Copied ${text}`, 'success');
  } catch (error) {
    console.error('Failed to copy:', error);
    showNotice('Could not copy to the clipboard.', 'error');
  }
};

const removeColor = (index) => {
  const newPalette = {
    ...props.palette,
    colors: props.palette.colors.filter((_, i) => i !== index),
  };
  emit('update-palette', newPalette);
  analyzePalette();
};

const drawHarmonyDiagram = () => {
  const canvas = harmonyCanvas.value;
  if (!canvas || !canvas.parentElement) return;
  
  const size = canvas.parentElement.clientWidth;
  canvas.width = size;
  canvas.height = size;
  
  const ctx = canvas.getContext('2d');
  
  // Clear canvas with white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);
  
  if (!props.palette || !props.palette.colors || props.palette.colors.length === 0) return;
  
  // Filter valid colors and calculate HSL values
  const nodes = [];
  props.palette.colors.forEach((color) => {
    const rgb = hexToRgb(color.hex);
    if (!rgb) return;
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    nodes.push({ color, hsl, rgb });
  });
  
  if (nodes.length === 0) return;
  
  // Simple force-directed layout initialization
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 60;
  
  // Initialize positions in a circle, then adjust based on relationships
  const positions = nodes.map((node, index) => {
    const angle = (index / nodes.length) * 2 * Math.PI - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius * 0.6;
    const y = centerY + Math.sin(angle) * radius * 0.6;
    return { x, y, ...node };
  });
  
  // Calculate connections (edges) between harmoniously related colors
  const edges = [];
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const node1 = positions[i];
      const node2 = positions[j];
      
      // Calculate hue difference (circular)
      const hueDiff = Math.abs(node1.hsl.h - node2.hsl.h);
      const normalizedHueDiff = Math.min(hueDiff, 360 - hueDiff);
      
      // Connect colors that are harmoniously related
      const isAnalogous = normalizedHueDiff < 30;
      const isComplementary = normalizedHueDiff > 150 && normalizedHueDiff < 210;
      const isTriadic = (normalizedHueDiff > 110 && normalizedHueDiff < 130) || 
                       (normalizedHueDiff > 230 && normalizedHueDiff < 250);
      
      if (isAnalogous || isComplementary || isTriadic) {
        let type = 'analogous';
        let color = '#3b82f6'; // Blue
        if (isComplementary) {
          type = 'complementary';
          color = '#10b981'; // Green
        } else if (isTriadic) {
          type = 'triadic';
          color = '#f59e0b'; // Orange
        }
        
        edges.push({
          from: i,
          to: j,
          type,
          color,
          strength: 1 - (normalizedHueDiff / 180) // Stronger for closer hues
        });
      }
    }
  }
  
  // Simple force-directed layout simulation
  // Attract connected nodes, repel all nodes
  const iterations = 50;
  const k = Math.sqrt((size * size) / nodes.length); // Optimal distance
  const repulsionStrength = k * 0.5;
  const attractionStrength = k * 0.1;
  
  for (let iter = 0; iter < iterations; iter++) {
    const forces = positions.map(() => ({ x: 0, y: 0 }));
    
    // Repulsion: push all nodes apart
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const dx = positions[j].x - positions[i].x;
        const dy = positions[j].y - positions[i].y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        
        const force = repulsionStrength / distance;
        const fx = (dx / distance) * force;
        const fy = (dy / distance) * force;
        
        forces[i].x -= fx;
        forces[i].y -= fy;
        forces[j].x += fx;
        forces[j].y += fy;
      }
    }
    
    // Attraction: pull connected nodes together
    edges.forEach(edge => {
      const from = positions[edge.from];
      const to = positions[edge.to];
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const distance = Math.sqrt(dx * dx + dy * dy) || 1;
      
      const force = attractionStrength * edge.strength * distance / k;
      const fx = (dx / distance) * force;
      const fy = (dy / distance) * force;
      
      forces[edge.from].x += fx;
      forces[edge.from].y += fy;
      forces[edge.to].x -= fx;
      forces[edge.to].y -= fy;
    });
    
    // Apply forces with damping
    const damping = 0.1;
    positions.forEach((pos, i) => {
      pos.x += forces[i].x * damping;
      pos.y += forces[i].y * damping;
      
      // Keep within bounds
      const distFromCenter = Math.sqrt(
        Math.pow(pos.x - centerX, 2) + Math.pow(pos.y - centerY, 2)
      );
      if (distFromCenter > radius) {
        const angle = Math.atan2(pos.y - centerY, pos.x - centerX);
        pos.x = centerX + Math.cos(angle) * radius;
        pos.y = centerY + Math.sin(angle) * radius;
      }
    });
  }
  
  // Draw edges (connections) first, behind nodes
  edges.forEach(edge => {
    const from = positions[edge.from];
    const to = positions[edge.to];
    
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.strokeStyle = edge.color;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.6;
    ctx.stroke();
    ctx.globalAlpha = 1.0;
  });
  
  // Draw nodes (color circles)
  const circleRadius = 18;
  positions.forEach((pos) => {
    // Draw color circle
    ctx.fillStyle = pos.color.hex;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, circleRadius, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw white border for contrast
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Draw outer border
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.stroke();
  });
  
  // Draw labels above circles
  const labelSpacing = circleRadius + 12;
  positions.forEach((pos) => {
    const labelText = pos.color.name || pos.color.hex;
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    
    // Measure text
    const metrics = ctx.measureText(labelText);
    const textWidth = metrics.width;
    const textHeight = 16;
    const padding = 5;
    const borderRadius = 4;
    
    const labelY = pos.y - labelSpacing;
    const labelX = pos.x;
    const rectX = labelX - textWidth / 2 - padding;
    const rectY = labelY - textHeight - padding;
    const rectWidth = textWidth + padding * 2;
    const rectHeight = textHeight + padding * 2;
    
    // Draw rounded rectangle background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    ctx.moveTo(rectX + borderRadius, rectY);
    ctx.lineTo(rectX + rectWidth - borderRadius, rectY);
    ctx.quadraticCurveTo(rectX + rectWidth, rectY, rectX + rectWidth, rectY + borderRadius);
    ctx.lineTo(rectX + rectWidth, rectY + rectHeight - borderRadius);
    ctx.quadraticCurveTo(rectX + rectWidth, rectY + rectHeight, rectX + rectWidth - borderRadius, rectY + rectHeight);
    ctx.lineTo(rectX + borderRadius, rectY + rectHeight);
    ctx.quadraticCurveTo(rectX, rectY + rectHeight, rectX, rectY + rectHeight - borderRadius);
    ctx.lineTo(rectX, rectY + borderRadius);
    ctx.quadraticCurveTo(rectX, rectY, rectX + borderRadius, rectY);
    ctx.closePath();
    ctx.fill();
    
    // Draw border around label
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw text
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(labelText, labelX, labelY);
  });
};

const redrawOnResize = () => {
  setTimeout(() => {
    drawHarmonyDiagram();
  }, 100);
};

onMounted(() => {
  analyzePalette();
  setTimeout(() => {
    drawHarmonyDiagram();
  }, 100);

  // Redraw on window resize
  window.addEventListener('resize', redrawOnResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', redrawOnResize);
});

// The four metric scales: each bar shows the colour dimension it measures
const metricBars = computed(() => [
  { key: 'coolWarm', low: 'Cool', high: 'Warm', value: metrics.value.coolWarm, gradient: 'linear-gradient(to right, hsl(213 94% 68%), hsl(270 95% 75%), hsl(27 96% 61%))' },
  { key: 'mutedVibrant', low: 'Muted', high: 'Vibrant', value: metrics.value.mutedVibrant, gradient: 'linear-gradient(to right, hsl(269 97% 85%), hsl(329 86% 70%), hsl(333 71% 51%))' },
  { key: 'darkLight', low: 'Dark', high: 'Light', value: metrics.value.darkLight, gradient: 'linear-gradient(to right, hsl(215 28% 17%), hsl(218 11% 65%), hsl(220 13% 91%))' },
  { key: 'monoDiverse', low: 'Mono', high: 'Diverse', value: metrics.value.monoDiverse, gradient: 'linear-gradient(to right, hsl(212 96% 78%), hsl(217 91% 60%), hsl(226 71% 40%))' },
]);
const markerLeft = computed(() => ({
  coolWarm: `${metrics.value.coolWarm}%`,
  mutedVibrant: `${metrics.value.mutedVibrant}%`,
  darkLight: `${metrics.value.darkLight}%`,
  monoDiverse: `${metrics.value.monoDiverse}%`,
}));

// Debounce the watcher to prevent rapid re-analysis
let analyzeTimeout = null;
watch(() => props.palette.colors, () => {
  // Skip if colors were recently fixed (already handled in applyFix)
  if (recentlyFixed.value.size > 0) return;
  
  if (analyzeTimeout) clearTimeout(analyzeTimeout);
  analyzeTimeout = setTimeout(() => {
    analyzePalette();
    drawHarmonyDiagram();
  }, 500);
}, { deep: true });
</script>

<style scoped>
.metric-marker {
  @apply absolute top-0 h-2 w-1 -translate-x-1/2 rounded-pill bg-surface border-2 border-ink-strong;
}
.metric-marker-coolWarm {
  left: v-bind('markerLeft.coolWarm');
}
.metric-marker-mutedVibrant {
  left: v-bind('markerLeft.mutedVibrant');
}
.metric-marker-darkLight {
  left: v-bind('markerLeft.darkLight');
}
.metric-marker-monoDiverse {
  left: v-bind('markerLeft.monoDiverse');
}
</style>
