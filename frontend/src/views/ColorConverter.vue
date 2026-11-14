<template>
  <PageShell>
    <PageHero
      :back="{ to: '/tools', label: 'Tools' }"
      title="Color converter"
      lead="Convert colors between color spaces and formats: HEX, RGB, HSL, HSV, LAB, LCH, OKLAB, OKLCH, CMYK, XYZ and more."
      spot="tools/color-converter"
      size="tool"
    />

    <PageSection>
      <div class="grid lg:grid-cols-3 gap-6 items-start">
        <div class="flex flex-col gap-6">
          <UiPanel title="Convert color">
            <UiInput
              id="color-input"
              v-model="inputColor"
              label="Color"
              hint="Hex, RGB, HSL, LAB, LCH, OKLAB, OKLCH or a color name"
              :error="inputError"
              :placeholder="colorPlaceholder"
              mono
            />
            <button type="button" class="picker-button" aria-label="Open color picker" title="Pick color" @click="openColorPicker($event)">
              <span class="color-preview" role="img" :aria-label="`Color preview: ${currentColor}`"></span>
              <span class="picker-button-label">
                <span class="material-symbols-outlined text-base" aria-hidden="true">colorize</span>
                Pick color
              </span>
            </button>
          </UiPanel>

          <UiPanel title="Have a lot to convert?" description="Use the bulk converter to convert all your colors in the formats you need.">
            <UiButton icon="format_list_bulleted" @click="showBulkModal = true">Convert bulk</UiButton>
          </UiPanel>
        </div>

        <div class="lg:col-span-2 flex flex-col gap-4">
          <InlineNotice v-if="!showBulkModal" :notice="notice" @dismiss="clearNotice" />
          <UiPanel flush>
            <UiTable :caption="`Conversions of ${currentColor}`">
              <thead>
                <tr>
                  <th scope="col">Color space</th>
                  <th scope="col">Channels</th>
                  <th scope="col">String format</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(conversion, index) in conversions" :key="index">
                  <td class="font-medium whitespace-nowrap">{{ conversion.name }}</td>
                  <td class="font-code text-xs text-ink-secondary">{{ conversion.channels }}</td>
                  <td>
                    <div class="flex items-center gap-1">
                      <code class="font-code text-xs px-2 py-1 rounded-control bg-fill text-ink">{{ conversion.string }}</code>
                      <UiButton
                        icon-only
                        icon="content_copy"
                        size="sm"
                        variant="ghost"
                        :label="`Copy ${conversion.name} value: ${conversion.string}`"
                        @click="copyToClipboard(conversion.string)"
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </UiTable>
          </UiPanel>
        </div>
      </div>
    </PageSection>

    <ColorPicker
      :show="showColorPicker"
      :initial-color="currentColor"
      :position="pickerPosition"
      @update:show="showColorPicker = $event"
      @apply="handleColorPickerApply"
      @cancel="showColorPicker = false"
    />

    <UiDialog v-model:open="showBulkModal" title="Bulk color converter" size="lg">
      <UiTextarea
        id="bulk-color-input"
        v-model="bulkInput"
        label="Colors"
        hint="Separate colors with commas, newlines or spaces. One color per line is easiest to read."
        :rows="10"
        :placeholder="bulkPlaceholder"
        mono
      />
      <div class="flex flex-wrap gap-2">
        <UiButton variant="primary" @click="convertBulk">Convert</UiButton>
        <UiButton @click="clearBulk">Clear</UiButton>
      </div>
      <InlineNotice :notice="notice" @dismiss="clearNotice" />
      <UiCodeBlock v-if="bulkResults.length > 0" :code="bulkResults" label="Results" @copied="onBulkCopied" @copy-failed="onBulkCopyFailed" />
    </UiDialog>
  </PageShell>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import ColorPicker from '../components/ColorPicker.vue';
import InlineNotice from '../components/InlineNotice.vue';
import chroma from 'chroma-js';
import { Hsluv } from 'hsluv';
import { useNotice } from '../composables/useNotice.js';
import { PageHero, PageSection, PageShell, UiButton, UiCodeBlock, UiDialog, UiInput, UiPanel, UiTable, UiTextarea } from '../components/ui';

const { notice, showNotice, clearNotice } = useNotice();
const inputColor = ref('#7AC600');
const currentColor = ref('#7AC600');
const showColorPicker = ref(false);
const pickerPosition = ref({ left: 0, top: 0 });
const showBulkModal = ref(false);
const bulkInput = ref('');
const bulkResults = ref('');
const colorPlaceholder = '#7AC600';
const bulkPlaceholder = '#7AC600\n#FF5733\nrgb(122, 198, 0)';

const conversions = ref([]);
const inputError = ref('');

// ---------------------------------------------------------------------------
// Colour maths (sRGB, CSS Color 4 matrices; OKLab per Björn Ottosson)
// ---------------------------------------------------------------------------

// Fixed-precision number without "-0".
const fmt = (value, digits = 2) => {
  const n = Number.isFinite(value) ? value : 0;
  const s = n.toFixed(digits);
  return Number(s) === 0 ? (0).toFixed(digits) : s;
};

// sRGB channel (0-255) to linear light (0-1).
const srgbToLinear = (v) => {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};

const mul3 = (m, v) => m.map((row) => row[0] * v[0] + row[1] * v[1] + row[2] * v[2]);

const LIN_SRGB_TO_XYZ_D65 = [
  [0.41239079926595934, 0.357584339383878, 0.1804807884018343],
  [0.21263900587151027, 0.715168678767756, 0.07219231536073371],
  [0.01933081871559182, 0.11919477979462598, 0.9505321522496607],
];

// Bradford chromatic adaptation D65 -> D50 (CSS lab()/lch() are D50).
const XYZ_D65_TO_D50 = [
  [1.0479298208405488, 0.022946793341019088, -0.05019222954313557],
  [0.029627815688159344, 0.990434484573249, -0.01707382502938514],
  [-0.009243058152591178, 0.015055144896577895, 0.7521316354461029],
];
const D50_WHITE = [0.3457 / 0.3585, 1, (1 - 0.3457 - 0.3585) / 0.3585];

// XYZ (D65), Y of white = 1.
const rgbToXyzD65 = (rgb) => mul3(LIN_SRGB_TO_XYZ_D65, rgb.map(srgbToLinear));

// CIE Lab relative to D50, as used by CSS lab().
const rgbToLabD50 = (rgb) => {
  const xyz = mul3(XYZ_D65_TO_D50, rgbToXyzD65(rgb));
  const epsilon = 216 / 24389;
  const kappa = 24389 / 27;
  const f = xyz.map((v, i) => {
    const x = v / D50_WHITE[i];
    return x > epsilon ? Math.cbrt(x) : (kappa * x + 16) / 116;
  });
  return [116 * f[1] - 16, 500 * (f[0] - f[1]), 200 * (f[1] - f[2])];
};

// OKLab: linear sRGB -> LMS -> cube root -> Lab. L is 0-1; a/b roughly ±0.4.
const rgbToOklab = (rgb) => {
  const [r, g, b] = rgb.map(srgbToLinear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s,
  ];
};

// Rectangular (L, a, b) to polar (L, C, h). Below `epsilon` chroma the colour
// is treated as achromatic and the hue reported as 0 rather than noise.
const toPolar = ([L, a, b], epsilon) => {
  const c = Math.sqrt(a * a + b * b);
  let h = c < epsilon ? 0 : (Math.atan2(b, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return [L, c, h];
};

// Hue that is NaN for greys (chroma.js) shown as 0.
const hue = (h) => (Number.isFinite(h) ? h : 0);

const toHsluv = (hex) => {
  const conv = new Hsluv();
  conv.hex = hex.slice(0, 7);
  conv.hexToHsluv();
  return [hue(conv.hsluv_h), conv.hsluv_s, conv.hsluv_l];
};

// A small table of Pantone coated colours with Pantone's published sRGB
// equivalents. The nearest entry (by OKLab distance) is only a rough guide:
// Pantone is a printed ink system and has no exact sRGB conversion.
const PANTONE_SAMPLES = [
  ['Yellow C', '#FEDD00'], ['109 C', '#FFD100'], ['123 C', '#FFC72C'], ['7406 C', '#F1C400'],
  ['1375 C', '#FF9E1B'], ['151 C', '#FF8200'], ['1505 C', '#FF6900'], ['Orange 021 C', '#FE5000'],
  ['Red 032 C', '#EF3340'], ['485 C', '#DA291C'], ['1795 C', '#D22630'], ['186 C', '#C8102E'],
  ['199 C', '#D50032'], ['200 C', '#BA0C2F'], ['7421 C', '#651D32'], ['219 C', '#DA1884'],
  ['Rhodamine Red C', '#E10098'], ['254 C', '#84329B'], ['Violet C', '#440099'], ['2685 C', '#330072'],
  ['Reflex Blue C', '#001489'], ['286 C', '#0033A0'], ['293 C', '#003DA5'], ['300 C', '#005EB8'],
  ['285 C', '#0072CE'], ['3005 C', '#0077C8'], ['Process Blue C', '#0085CA'], ['299 C', '#00A3E0'],
  ['311 C', '#05C3DE'], ['320 C', '#009CA6'], ['3275 C', '#00B2A9'], ['Green C', '#00AB84'],
  ['347 C', '#009A44'], ['355 C', '#009639'], ['354 C', '#00B140'], ['368 C', '#78BE20'],
  ['376 C', '#84BD00'], ['382 C', '#C4D600'], ['534 C', '#1B365D'], ['289 C', '#0C2340'],
  ['7546 C', '#253746'], ['432 C', '#333F48'], ['469 C', '#693F23'], ['4625 C', '#4F2C1D'],
  ['7527 C', '#D6D2C4'], ['Cool Gray 1 C', '#D9D9D6'], ['Cool Gray 5 C', '#B1B3B3'],
  ['Cool Gray 9 C', '#75787B'], ['Cool Gray 11 C', '#53565A'], ['Black C', '#2D2926'],
].map(([name, hex]) => ({ name, hex, oklab: rgbToOklab(chroma(hex).rgb()) }));

const nearestPantone = (rgb) => {
  const target = rgbToOklab(rgb);
  let best = PANTONE_SAMPLES[0];
  let bestDistance = Infinity;
  for (const sample of PANTONE_SAMPLES) {
    const d = Math.hypot(
      sample.oklab[0] - target[0],
      sample.oklab[1] - target[1],
      sample.oklab[2] - target[2],
    );
    if (d < bestDistance) {
      bestDistance = d;
      best = sample;
    }
  }
  return { ...best, distance: bestDistance };
};

// CSS alpha suffix for the space-separated colour functions.
const alphaSuffix = (alpha) => (alpha < 1 ? ` / ${fmt(alpha, 3).replace(/\.?0+$/, '')}` : '');

const hslString = (hsl, alpha) => {
  const [h, s, l] = [hue(hsl[0]), hsl[1] * 100, hsl[2] * 100];
  return alpha < 1
    ? `hsla(${fmt(h)}, ${fmt(s)}%, ${fmt(l)}%, ${fmt(alpha, 3).replace(/\.?0+$/, '')})`
    : `hsl(${fmt(h)}, ${fmt(s)}%, ${fmt(l)}%)`;
};

const rgbString = (rgb, alpha) => (alpha < 1
  ? `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${fmt(alpha, 3).replace(/\.?0+$/, '')})`
  : `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`);

const convertColor = () => {
  const raw = inputColor.value.trim();
  if (!raw) {
    inputError.value = '';
    conversions.value = [];
    return;
  }
  let color;
  try {
    color = chroma(raw);
  } catch (error) {
    inputError.value = 'Not a recognised colour. Try a hex value, a CSS colour function (rgb, hsl, lab, lch, oklab, oklch) or a colour name.';
    conversions.value = [];
    return;
  }
  inputError.value = '';
  currentColor.value = color.hex();

  const alpha = color.alpha();
  const rgb = color.rgb();
  const hsl = color.hsl();
  const hsv = color.hsv();
  const cmyk = color.cmyk();
  const xyz = rgbToXyzD65(rgb);
  const lab = rgbToLabD50(rgb);
  const lch = toPolar(lab, 0.0015);
  const okLab = rgbToOklab(rgb);
  const okLch = toPolar(okLab, 0.00004);
  const hsluv = toHsluv(color.hex('rgb'));
  const pantone = nearestPantone(rgb);
  const a = alphaSuffix(alpha);

  conversions.value = [
    {
      name: 'HEX',
      channels: alpha < 1 ? `Alpha: ${fmt(alpha, 3)}` : '',
      string: color.hex().toLowerCase()
    },
    {
      name: 'RGB',
      channels: `R: ${rgb[0]}, G: ${rgb[1]}, B: ${rgb[2]}`,
      string: rgbString(rgb, alpha)
    },
    {
      name: 'HSL',
      channels: `H: ${fmt(hue(hsl[0]))}, S: ${fmt(hsl[1] * 100)}, L: ${fmt(hsl[2] * 100)}`,
      string: hslString(hsl, alpha)
    },
    {
      name: 'HSV',
      channels: `H: ${fmt(hue(hsv[0]))}, S: ${fmt(hsv[1] * 100)}, V: ${fmt(hsv[2] * 100)}`,
      string: `hsv(${fmt(hue(hsv[0]))}, ${fmt(hsv[1] * 100)}%, ${fmt(hsv[2] * 100)}%)`
    },
    {
      name: 'LAB (CIE, D50)',
      channels: `L: ${fmt(lab[0])}, A: ${fmt(lab[1])}, B: ${fmt(lab[2])}`,
      string: `lab(${fmt(lab[0])}% ${fmt(lab[1])} ${fmt(lab[2])}${a})`
    },
    {
      name: 'LCH (CIE, D50)',
      channels: `L: ${fmt(lch[0])}, C: ${fmt(lch[1])}, H: ${fmt(lch[2])}`,
      string: `lch(${fmt(lch[0])}% ${fmt(lch[1])} ${fmt(lch[2])}${a})`
    },
    {
      name: 'OKLAB',
      channels: `L: ${fmt(okLab[0], 4)}, A: ${fmt(okLab[1], 4)}, B: ${fmt(okLab[2], 4)}`,
      string: `oklab(${fmt(okLab[0] * 100)}% ${fmt(okLab[1], 4)} ${fmt(okLab[2], 4)}${a})`
    },
    {
      name: 'OKLCH',
      channels: `L: ${fmt(okLch[0], 4)}, C: ${fmt(okLch[1], 4)}, H: ${fmt(okLch[2])}`,
      string: `oklch(${fmt(okLch[0] * 100)}% ${fmt(okLch[1], 4)} ${fmt(okLch[2])}${a})`
    },
    {
      name: 'HSLuv',
      channels: `H: ${fmt(hsluv[0])}, S: ${fmt(hsluv[1])}, L: ${fmt(hsluv[2])}`,
      string: `hsluv(${fmt(hsluv[0])}, ${fmt(hsluv[1])}%, ${fmt(hsluv[2])}%)`
    },
    {
      name: 'CMYK (naive)',
      channels: `C: ${fmt(cmyk[0] * 100)}, M: ${fmt(cmyk[1] * 100)}, Y: ${fmt(cmyk[2] * 100)}, K: ${fmt(cmyk[3] * 100)}`,
      string: `device-cmyk(${fmt(cmyk[0] * 100)}% ${fmt(cmyk[1] * 100)}% ${fmt(cmyk[2] * 100)}% ${fmt(cmyk[3] * 100)}%)`
    },
    {
      name: 'XYZ (D65)',
      channels: `X: ${fmt(xyz[0] * 100)}, Y: ${fmt(xyz[1] * 100)}, Z: ${fmt(xyz[2] * 100)}`,
      string: `color(xyz-d65 ${fmt(xyz[0], 4)} ${fmt(xyz[1], 4)} ${fmt(xyz[2], 4)}${a})`
    },
    {
      name: 'Pantone (nearest, approximate)',
      channels: `Closest of ${PANTONE_SAMPLES.length} common coated colours (${pantone.hex}); ΔEok ${fmt(pantone.distance * 100, 1)}`,
      string: `PANTONE ${pantone.name}`
    }
  ];
};

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    showNotice('Copied to clipboard.', 'success');
  } catch (error) {
    console.error('Failed to copy:', error);
    showNotice('Could not copy to the clipboard.', 'error');
  }
};

const openColorPicker = (event) => {
  if (event) {
    event.stopPropagation();
    const rect = (event.currentTarget || event.target).getBoundingClientRect();
    
    const pickerWidth = 300;
    const pickerHeight = 550;
    const padding = 16;
    
    // Calculate position relative to viewport (for fixed positioning)
    let left = rect.right + padding;
    let top = rect.top;
    
    // Check if picker would go off right edge
    if (left + pickerWidth > window.innerWidth) {
      left = rect.left - pickerWidth - padding;
    }
    
    // Check if picker would go off left edge
    if (left < padding) {
      left = padding;
    }
    
    // Check if picker would go off bottom edge
    if (top + pickerHeight > window.innerHeight - padding) {
      top = window.innerHeight - pickerHeight - padding;
    }
    
    // Check if picker would go off top edge
    if (top < padding) {
      top = padding;
    }
    
    // Ensure picker stays within viewport bounds
    left = Math.max(padding, Math.min(left, window.innerWidth - pickerWidth - padding));
    top = Math.max(padding, Math.min(top, window.innerHeight - pickerHeight - padding));
    
    pickerPosition.value = { left, top };
  }
  showColorPicker.value = true;
};

const handleColorPickerApply = (color) => {
  inputColor.value = color;
  convertColor();
  showColorPicker.value = false;
};

// Split on commas / whitespace / newlines, but not inside parentheses, so
// "rgb(122, 198, 0)" stays one colour.
const splitColorList = (text) => {
  const colors = [];
  let current = '';
  let depth = 0;
  for (const ch of text) {
    if (ch === '(') depth++;
    if (ch === ')') depth = Math.max(0, depth - 1);
    if (depth === 0 && /[,\s]/.test(ch)) {
      if (current.trim()) colors.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) colors.push(current.trim());
  return colors;
};

const convertBulk = () => {
  const colors = splitColorList(bulkInput.value);
  
  const results = [];
  
  colors.forEach(colorInput => {
    try {
      const color = chroma(colorInput);
      const rgb = color.rgb();
      const hsl = color.hsl();
      const hex = color.hex().toLowerCase();
      
      results.push(`${colorInput}:`);
      results.push(`  HEX: ${hex}`);
      const alpha = color.alpha();
      const okLch = toPolar(rgbToOklab(rgb), 0.00004);
      results.push(`  RGB: ${rgbString(rgb, alpha)}`);
      results.push(`  HSL: ${hslString(hsl, alpha)}`);
      results.push(`  OKLCH: oklch(${fmt(okLch[0] * 100)}% ${fmt(okLch[1], 4)} ${fmt(okLch[2])}${alphaSuffix(alpha)})`);
      results.push('');
    } catch (error) {
      results.push(`${colorInput}: Invalid color`);
      results.push('');
    }
  });
  
  bulkResults.value = results.join('\n');
};

const clearBulk = () => {
  bulkInput.value = '';
  bulkResults.value = '';
};

// The results code block copies; report it as the old button did.
const onBulkCopied = () => showNotice('Copied to clipboard.', 'success');
const onBulkCopyFailed = () => showNotice('Could not copy to the clipboard.', 'error');

watch(inputColor, () => {
  convertColor();
});

onMounted(() => {
  convertColor();
});
</script>

<style scoped>
.picker-button {
  @apply flex flex-col w-full overflow-hidden rounded-tile border border-line-control bg-surface-control text-left transition-colors hover:border-accent-border;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 outline-focus;
}
.color-preview {
  @apply block w-full h-32;
  background: v-bind(currentColor);
}
.picker-button-label {
  @apply flex items-center gap-1.5 px-4 py-2 border-t border-line text-sm font-medium text-ink-secondary;
}
</style>
