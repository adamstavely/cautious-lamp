<template>
  <PageShell>
    <PageHero
      :back="{ to: '/tools', label: 'Tools' }"
      title="Compare colors"
      lead="Compare two colors to check contrast, difference and colorblind safety."
      spot="tools/color-contrast-checker"
      size="tool"
    />

    <PageSection>
      <div class="grid lg:grid-cols-3 gap-6 items-start">
        <div class="flex flex-col gap-6">
          <UiPanel v-for="field in colorFields" :key="field.type" :title="field.label">
            <UiInput
              v-model="colorRefs[field.type].value"
              :label="`${field.label} value`"
              :placeholder="field.placeholder"
              :required="field.required"
              mono
            />
            <button type="button" class="picker-button" :aria-label="`Pick ${field.type} color`" title="Pick color" @click="openColorPicker(field.type, $event)">
              <span class="block h-32"><UiSwatch :color="colorRefs[field.type].value" size="fill" :label="`${field.label}: ${colorRefs[field.type].value}`" /></span>
              <span class="picker-button-label">
                <span class="material-symbols-outlined text-base" aria-hidden="true">colorize</span>
                Pick color
              </span>
            </button>
            <div v-if="field.type === 'foreground'" class="hue-range">
              <UiRange
                :model-value="Math.round(Number(foregroundHue) || 0)"
                label="Foreground hue"
                unit="°"
                :min="0"
                :max="360"
                @update:model-value="updateForegroundFromSlider"
              />
            </div>
          </UiPanel>

          <UiPanel title="Supported formats" flush>
            <UiTable caption="Supported color formats" compact>
              <thead>
                <tr>
                  <th scope="col">Color space</th>
                  <th scope="col">Opaque</th>
                  <th scope="col">Alpha</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="format in supportedFormats" :key="format.space">
                  <td class="font-medium">{{ format.space }}</td>
                  <td class="font-code text-xs text-ink-secondary">{{ format.opaque }}</td>
                  <td class="font-code text-xs text-ink-secondary">{{ format.alpha }}</td>
                </tr>
              </tbody>
            </UiTable>
          </UiPanel>
        </div>

        <div class="lg:col-span-2 flex flex-col gap-6">
          <UiPanel title="Contrast">
            <div class="flex items-center gap-4" role="status">
              <span class="pair-preview" aria-hidden="true"><span class="pair-preview-fg"></span></span>
              <div>
                <p class="text-4xl font-semibold tracking-tight text-ink-strong">{{ contrastRatio.toFixed(2) }}</p>
                <p class="text-sm text-ink-secondary">Contrast ratio</p>
              </div>
            </div>
          </UiPanel>

          <UiPanel flush>
            <UiTable caption="WCAG contrast criteria">
              <thead>
                <tr>
                  <th scope="col">WCAG criteria</th>
                  <th scope="col">AA score</th>
                  <th scope="col">AA minimum</th>
                  <th scope="col">AAA score</th>
                  <th scope="col">AAA minimum</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(criterion, index) in wcagCriteria" :key="index">
                  <td>{{ criterion.label }}</td>
                  <td><UiChip :tone="criterion.aaPass ? 'success' : 'danger'">{{ criterion.aaPass ? 'Pass' : 'Fail' }}</UiChip></td>
                  <td class="font-code">{{ criterion.aaMinimum }}</td>
                  <td><UiChip :tone="criterion.aaaPass ? 'success' : 'danger'">{{ criterion.aaaPass ? 'Pass' : 'Fail' }}</UiChip></td>
                  <td class="font-code">{{ criterion.aaaMinimum }}</td>
                </tr>
              </tbody>
            </UiTable>
          </UiPanel>

          <UiPanel title="Color blindness simulation" flush>
            <UiTable caption="Color difference under simulated color vision deficiencies">
              <thead>
                <tr>
                  <th scope="col">Preview</th>
                  <th scope="col">Vision type</th>
                  <th scope="col">Status</th>
                  <th scope="col">Color difference</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(vision, index) in visionTypes" :key="index">
                  <td>
                    <span class="flex">
                      <UiSwatch :color="vision.fgColor" :label="`${vision.name} foreground: ${vision.fgColor}`" />
                      <UiSwatch :color="vision.bgColor" :label="`${vision.name} background: ${vision.bgColor}`" />
                    </span>
                  </td>
                  <td class="font-medium">{{ vision.name }}</td>
                  <td><UiChip :tone="vision.safe ? 'success' : 'danger'">{{ vision.safe ? 'Safe' : 'Unsafe' }}</UiChip></td>
                  <td>
                    <div class="flex items-center gap-3 min-w-40">
                      <span class="font-code text-sm">{{ vision.deltaE.toFixed(2) }}</span>
                      <UiMeter
                        :value="vision.deltaE"
                        :max="100"
                        :tone="vision.safe ? 'success' : 'danger'"
                        :label="`${vision.name} color difference`"
                        :value-text="`ΔE ${vision.deltaE.toFixed(2)}, ${vision.safe ? 'safe' : 'unsafe'}`"
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </UiTable>
            <template #footer>
              <div class="flex flex-col gap-3 py-2 text-sm leading-relaxed text-ink-secondary">
                <h3 class="font-semibold text-ink-strong">How this works</h3>
                <p>
                  Ratings are calculated by first converting the colors to their simulated counterparts. The simulated values approximate the
                  colors that would be seen by fully deficient vision of each particular type. The simulated colors are then compared using
                  the DeltaE 2000 color difference formula. A color difference value of 11 or more is considered passing; anything lower is
                  too similar to distinguish.
                </p>
                <p>The color difference meters visualize the DeltaE value to give reference to how different the colors would appear for each color vision deficiency.</p>
              </div>
            </template>
          </UiPanel>
        </div>
      </div>
    </PageSection>

    <ColorPicker
      :show="showColorPicker"
      :initial-color="pickerColor"
      :position="pickerPosition"
      @update:show="showColorPicker = $event"
      @apply="handleColorPickerApply"
      @cancel="showColorPicker = false"
    />
  </PageShell>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import ColorPicker from '../components/ColorPicker.vue';
import chroma from 'chroma-js';
import { PageHero, PageSection, PageShell, UiChip, UiInput, UiPanel, UiRange, UiSwatch, UiTable } from '../components/ui';
import UiMeter from '../components/ui/UiMeter.vue';

const foregroundColor = ref('#7AC600');
const backgroundColor = ref('#0E55A8');
const showColorPicker = ref(false);
const pickerColor = ref('#000000');
const pickerPosition = ref({ left: 0, top: 0 });
const currentPickerType = ref('foreground');
const foregroundHue = ref(83);

// The two colour inputs, each with its own picker
const colorFields = [
  { type: 'foreground', label: 'Foreground color', placeholder: '#7AC600', required: true },
  { type: 'background', label: 'Background color', placeholder: '#0E55A8', required: false },
];
const colorRefs = { foreground: foregroundColor, background: backgroundColor };

// The formats the inputs accept
const supportedFormats = [
  { space: 'HEX', opaque: '#FFFFFF', alpha: '#FFFFFFFF' },
  { space: 'RGB', opaque: 'rgb(255, 255, 255)', alpha: 'rgba(255, 255, 255, 1)' },
  { space: 'HSL', opaque: 'hsl(360, 100%, 50%)', alpha: 'hsla(360, 100%, 50%, 1)' },
];

// The hue slider's track shows the hue spectrum (data, not a design colour)
const hueTrack = 'linear-gradient(to right, hsl(0, 100%, 50%), hsl(60, 100%, 50%), hsl(120, 100%, 50%), hsl(180, 100%, 50%), hsl(240, 100%, 50%), hsl(300, 100%, 50%), hsl(360, 100%, 50%))';

// Calculate relative luminance
const getLuminance = (rgb) => {
  const [r, g, b] = rgb.map(val => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

// Composite a colour with alpha over another (straight alpha, sRGB).
const composite = (top, bottomRgb) => {
  const a = top.alpha();
  const rgb = top.rgb();
  if (a >= 1) return rgb;
  return rgb.map((v, i) => v * a + bottomRgb[i] * (1 - a));
};

// The colours as actually seen: a translucent background sits on white, and a
// translucent foreground on that background. Supports the alpha formats the
// page lists (#RRGGBBAA, rgba(), hsla()).
const resolvePair = () => {
  const bgRgb = composite(chroma(backgroundColor.value), [255, 255, 255]);
  const fgRgb = composite(chroma(foregroundColor.value), bgRgb);
  return { fgRgb, bgRgb };
};

// Calculate contrast ratio
const contrastRatio = computed(() => {
  try {
    const { fgRgb, bgRgb } = resolvePair();
    
    const fgLum = getLuminance(fgRgb);
    const bgLum = getLuminance(bgRgb);
    
    const lighter = Math.max(fgLum, bgLum);
    const darker = Math.min(fgLum, bgLum);
    
    return (lighter + 0.05) / (darker + 0.05);
  } catch (error) {
    return 1;
  }
});

// WCAG Criteria
const wcagCriteria = computed(() => {
  const ratio = contrastRatio.value;
  
  return [
    {
      label: 'Normal text (under 24px, or under 18.66px / 14pt bold)',
      aaMinimum: '4.5',
      aaPass: ratio >= 4.5,
      aaaMinimum: '7',
      aaaPass: ratio >= 7
    },
    {
      label: 'Large text (24px / 18pt and up, or 18.66px / 14pt bold and up)',
      aaMinimum: '3',
      aaPass: ratio >= 3,
      aaaMinimum: '4.5',
      aaaPass: ratio >= 4.5
    },
    {
      label: 'UI Components & graphics',
      aaMinimum: '3',
      aaPass: ratio >= 3,
      aaaMinimum: '3',
      aaaPass: ratio >= 3
    }
  ];
});

// Colorblind simulation matrices
const colorblindMatrices = {
  deuteranopia: [
    [0.625, 0.375, 0],
    [0.7, 0.3, 0],
    [0, 0.3, 0.7]
  ],
  protanopia: [
    [0.567, 0.433, 0],
    [0.558, 0.442, 0],
    [0, 0.242, 0.758]
  ],
  tritanopia: [
    [0.95, 0.05, 0],
    [0, 0.433, 0.567],
    [0, 0.475, 0.525]
  ],
  achromatopsia: [
    [0.299, 0.587, 0.114],
    [0.299, 0.587, 0.114],
    [0.299, 0.587, 0.114]
  ]
};

// Simulate colorblind vision
const simulateColorblind = (rgb, type) => {
  const matrix = colorblindMatrices[type];
  if (!matrix) return rgb;
  
  return [
    Math.round(rgb[0] * matrix[0][0] + rgb[1] * matrix[0][1] + rgb[2] * matrix[0][2]),
    Math.round(rgb[0] * matrix[1][0] + rgb[1] * matrix[1][1] + rgb[2] * matrix[1][2]),
    Math.round(rgb[0] * matrix[2][0] + rgb[1] * matrix[2][1] + rgb[2] * matrix[2][2])
  ];
};

// Calculate Delta E (CIE76)
const calculateDeltaE = (rgb1, rgb2) => {
  // Convert RGB to LAB
  const lab1 = rgbToLab(rgb1);
  const lab2 = rgbToLab(rgb2);
  
  // Calculate Delta E
  const deltaL = lab1[0] - lab2[0];
  const deltaA = lab1[1] - lab2[1];
  const deltaB = lab1[2] - lab2[2];
  
  return Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB);
};

// Convert RGB to LAB
const rgbToLab = (rgb) => {
  // Convert RGB to XYZ
  let r = rgb[0] / 255;
  let g = rgb[1] / 255;
  let b = rgb[2] / 255;
  
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
  
  r *= 100;
  g *= 100;
  b *= 100;
  
  // Observer = 2°, Illuminant = D65
  let x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 95.047;
  let y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 100.000;
  let z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 108.883;
  
  x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x + 16/116);
  y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y + 16/116);
  z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z + 16/116);
  
  return [
    (116 * y) - 16,
    500 * (x - y),
    200 * (y - z)
  ];
};

// Vision types with simulated colors
const visionTypes = computed(() => {
  try {
    const { fgRgb, bgRgb } = resolvePair();
    
    const types = [
      { name: 'Normal vision', type: null },
      { name: 'Deuteranopia', type: 'deuteranopia' },
      { name: 'Protanopia', type: 'protanopia' },
      { name: 'Tritanopia', type: 'tritanopia' },
      { name: 'Achromatopsia', type: 'achromatopsia' }
    ];
    
    return types.map(type => {
      const simFgRgb = type.type ? simulateColorblind(fgRgb, type.type) : fgRgb;
      const simBgRgb = type.type ? simulateColorblind(bgRgb, type.type) : bgRgb;
      
      const deltaE = calculateDeltaE(simFgRgb, simBgRgb);
      const safe = deltaE >= 11;
      
      return {
        name: type.name,
        fgColor: chroma(simFgRgb).hex(),
        bgColor: chroma(simBgRgb).hex(),
        deltaE,
        safe
      };
    });
  } catch (error) {
    return [];
  }
});

const updateContrast = () => {
  // Trigger reactivity
  contrastRatio.value;
  wcagCriteria.value;
  visionTypes.value;
};

const updateForegroundFromSlider = (hue) => {
  foregroundHue.value = hue;
  try {
    const color = chroma.hsl(hue, 1, 0.5);
    foregroundColor.value = color.hex();
    updateContrast();
  } catch (error) {
    // Ignore errors
  }
};

const openColorPicker = (type, event) => {
  if (event) {
    event.stopPropagation();
    const rect = (event.currentTarget || event.target).getBoundingClientRect();
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    const pickerWidth = 300;
    const pickerHeight = 550;
    const padding = 16;
    
    let left = rect.right + scrollLeft + padding;
    let top = rect.top + scrollTop;
    
    if (left + pickerWidth > window.innerWidth + scrollLeft) {
      left = rect.left + scrollLeft - pickerWidth - padding;
    }
    
    if (top + pickerHeight > window.innerHeight + scrollTop) {
      top = rect.top + scrollTop - pickerHeight - padding;
    }
    
    left = Math.max(padding, Math.min(left, window.innerWidth + scrollLeft - pickerWidth - padding));
    top = Math.max(padding, Math.min(top, window.innerHeight + scrollTop - pickerHeight - padding));
    
    pickerPosition.value = { left, top };
  }
  
  currentPickerType.value = type;
  pickerColor.value = type === 'foreground' ? foregroundColor.value : backgroundColor.value;
  showColorPicker.value = true;
};

const handleColorPickerApply = (color) => {
  if (currentPickerType.value === 'foreground') {
    foregroundColor.value = color;
  } else {
    backgroundColor.value = color;
  }
  updateContrast();
  showColorPicker.value = false;
};

watch([foregroundColor, backgroundColor], () => {
  updateContrast();
  try {
    const hsl = chroma(foregroundColor.value).hsl();
    if (!isNaN(hsl[0])) {
      foregroundHue.value = hsl[0];
    }
  } catch (error) {
    // Ignore errors
  }
});

onMounted(() => {
  updateContrast();
});
</script>

<style scoped>
.picker-button {
  @apply flex flex-col w-full overflow-hidden rounded-tile border border-line-control bg-surface-control p-1 text-left transition-colors hover:border-accent-border;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 outline-focus;
}
.picker-button-label {
  @apply flex items-center gap-1.5 px-3 pt-2 pb-1 text-sm font-medium text-ink-secondary;
}
.pair-preview {
  @apply relative block w-16 h-16 shrink-0 rounded-control border border-line;
  background: v-bind(backgroundColor);
}
.pair-preview-fg {
  @apply absolute inset-2 rounded-control;
  background: v-bind(foregroundColor);
}
.hue-range :deep(input[type='range']) {
  background: v-bind(hueTrack);
}
</style>
