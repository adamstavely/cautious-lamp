import { Injectable } from '@nestjs/common';

export interface ColorRGB {
  r: number;
  g: number;
  b: number;
}

export interface ColorHSL {
  h: number;
  s: number;
  l: number;
}

export interface ColorAnalysis {
  hex: string;
  rgb: ColorRGB;
  hsl: ColorHSL;
  isTooDark: boolean;
  isTooBright: boolean;
  isTooVibrant: boolean;
  luminance: number;
}

export interface ContrastResult {
  color1: string;
  color2: string;
  ratio: number;
  passesAA: boolean;
  passesAAA: boolean;
  passesAALarge: boolean;
  passesAAALarge: boolean;
}

export interface HarmonySuggestion {
  hex: string;
  type: 'light-neutral' | 'dark-neutral' | 'complementary' | 'analogous' | 'triadic';
  reason: string;
}

@Injectable()
export class ColorTheoryService {
  /**
   * Convert hex to RGB
   */
  hexToRgb(hex: string): ColorRGB {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  }

  /**
   * Convert RGB to hex
   */
  rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Convert RGB to HSL
   */
  rgbToHsl(r: number, g: number, b: number): ColorHSL {
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
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  }

  /**
   * Convert HSL to RGB
   */
  hslToRgb(h: number, s: number, l: number): ColorRGB {
    h /= 360;
    s /= 100;
    l /= 100;

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;

      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  }

  /**
   * Calculate relative luminance (WCAG)
   */
  calculateLuminance(rgb: ColorRGB): number {
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((val) => {
      val = val / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  /**
   * Calculate contrast ratio between two colors
   */
  calculateContrast(color1: ColorRGB, color2: ColorRGB): number {
    const lum1 = this.calculateLuminance(color1);
    const lum2 = this.calculateLuminance(color2);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Analyze a single color
   */
  analyzeColor(hex: string): ColorAnalysis {
    const rgb = this.hexToRgb(hex);
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    const luminance = this.calculateLuminance(rgb);

    return {
      hex,
      rgb,
      hsl,
      isTooDark: luminance < 0.15,
      isTooBright: luminance > 0.85,
      isTooVibrant: hsl.s > 85,
      luminance,
    };
  }

  /**
   * Analyze palette for harmony issues
   */
  analyzePalette(colors: string[]): ColorAnalysis[] {
    return colors.map((hex) => this.analyzeColor(hex));
  }

  /**
   * Test contrast between all color pairs
   */
  testContrast(colors: string[]): ContrastResult[] {
    const results: ContrastResult[] = [];
    const rgbColors = colors.map((hex) => this.hexToRgb(hex));

    for (let i = 0; i < colors.length; i++) {
      for (let j = i + 1; j < colors.length; j++) {
        const ratio = this.calculateContrast(rgbColors[i], rgbColors[j]);
        results.push({
          color1: colors[i],
          color2: colors[j],
          ratio: Math.round(ratio * 100) / 100,
          passesAA: ratio >= 4.5,
          passesAAA: ratio >= 7,
          passesAALarge: ratio >= 3,
          passesAAALarge: ratio >= 4.5,
        });
      }
    }

    return results;
  }

  /**
   * Generate smart color suggestions
   */
  generateSuggestions(colors: string[], regenerateType?: string): HarmonySuggestion[] {
    const suggestions: HarmonySuggestion[] = [];
    const analyses = colors.map((hex) => this.analyzeColor(hex));

    // Generate random variation for regeneration
    const variation = Math.random() * 20 - 10; // -10 to +10 degrees for hue variation
    const satVariation = Math.random() * 20 - 10; // -10 to +10 for saturation variation
    const lightVariation = Math.random() * 10 - 5; // -5 to +5 for lightness variation

    // Check if we have light neutrals
    const hasLightNeutral = analyses.some(
      (a) => a.hsl.s < 20 && a.hsl.l > 70,
    );
    if (!hasLightNeutral && (!regenerateType || regenerateType === 'light-neutral')) {
      const baseLightness = 92;
      const lightness = Math.max(85, Math.min(98, baseLightness + lightVariation));
      const rgb = this.hslToRgb(0, 0, lightness);
      suggestions.push({
        hex: this.rgbToHex(rgb.r, rgb.g, rgb.b),
        type: 'light-neutral',
        reason: 'Add a light neutral for backgrounds and subtle elements',
      });
    }

    // Check if we have dark neutrals
    const hasDarkNeutral = analyses.some(
      (a) => a.hsl.s < 20 && a.hsl.l < 30,
    );
    if (!hasDarkNeutral && (!regenerateType || regenerateType === 'dark-neutral')) {
      const baseLightness = 15;
      const lightness = Math.max(5, Math.min(25, baseLightness + lightVariation));
      const rgb = this.hslToRgb(0, 0, lightness);
      suggestions.push({
        hex: this.rgbToHex(rgb.r, rgb.g, rgb.b),
        type: 'dark-neutral',
        reason: 'Add a dark neutral for text and dark elements',
      });
    }

    // Generate complementary colors
    if (colors.length > 0 && (!regenerateType || regenerateType === 'complementary')) {
      const mainColor = analyses[0];
      const complementaryHue = (mainColor.hsl.h + 180 + variation) % 360;
      const saturation = Math.max(40, Math.min(80, 60 + satVariation));
      const lightness = Math.max(40, Math.min(60, 50 + lightVariation));
      const complementaryRgb = this.hslToRgb(complementaryHue, saturation, lightness);
      suggestions.push({
        hex: this.rgbToHex(complementaryRgb.r, complementaryRgb.g, complementaryRgb.b),
        type: 'complementary',
        reason: 'Complementary color for contrast and visual interest',
      });
    }

    // Generate analogous colors
    if (colors.length > 0 && (!regenerateType || regenerateType === 'analogous')) {
      const mainColor = analyses[0];
      const analogousHue1 = (mainColor.hsl.h + 30 + variation) % 360;
      const saturation = Math.max(40, Math.min(80, 60 + satVariation));
      const lightness = Math.max(40, Math.min(60, 50 + lightVariation));
      const rgb1 = this.hslToRgb(analogousHue1, saturation, lightness);
      suggestions.push({
        hex: this.rgbToHex(rgb1.r, rgb1.g, rgb1.b),
        type: 'analogous',
        reason: 'Analogous color for harmony',
      });
    }

    // Generate triadic colors
    if (colors.length > 0 && colors.length < 3 && (!regenerateType || regenerateType === 'triadic')) {
      const mainColor = analyses[0];
      const triadicHue1 = (mainColor.hsl.h + 120 + variation) % 360;
      const saturation = Math.max(40, Math.min(80, 60 + satVariation));
      const lightness = Math.max(40, Math.min(60, 50 + lightVariation));
      const rgb1 = this.hslToRgb(triadicHue1, saturation, lightness);
      suggestions.push({
        hex: this.rgbToHex(rgb1.r, rgb1.g, rgb1.b),
        type: 'triadic',
        reason: 'Triadic color for balanced palette',
      });
    }

    // If regenerating a specific type, return only that suggestion
    if (regenerateType) {
      return suggestions.filter(s => s.type === regenerateType);
    }

    return suggestions.slice(0, 5); // Limit to 5 suggestions
  }

  /**
   * Suggest fixes for problematic colors
   */
  suggestFixes(analysis: ColorAnalysis): string[] {
    const fixes: string[] = [];
    const hsl = analysis.hsl;

    if (analysis.isTooDark) {
      const lighterRgb = this.hslToRgb(hsl.h, hsl.s, Math.min(95, hsl.l + 20));
      fixes.push(this.rgbToHex(lighterRgb.r, lighterRgb.g, lighterRgb.b));
    }

    if (analysis.isTooBright) {
      const darkerRgb = this.hslToRgb(hsl.h, hsl.s, Math.max(5, hsl.l - 20));
      fixes.push(this.rgbToHex(darkerRgb.r, darkerRgb.g, darkerRgb.b));
    }

    if (analysis.isTooVibrant) {
      const lessVibrantRgb = this.hslToRgb(hsl.h, Math.max(10, hsl.s - 20), hsl.l);
      fixes.push(this.rgbToHex(lessVibrantRgb.r, lessVibrantRgb.g, lessVibrantRgb.b));
    }

    return fixes;
  }

  /**
   * Determine if palette has a clear main color
   */
  hasClearMainColor(colors: string[]): boolean {
    if (colors.length === 0) return false;

    const analyses = colors.map((hex) => this.analyzeColor(hex));
    const vibrantColors = analyses.filter((a) => a.hsl.s > 50);

    return vibrantColors.length >= 1;
  }
}

