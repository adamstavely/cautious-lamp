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
    const analyses = colors.map((hex) => this.analyzeColor(hex));
    
    // Need at least 2 colors for relative comparison
    if (colors.length < 2) {
      return analyses.map((analysis) => ({
        ...analysis,
        // Only check absolute thresholds for single colors
        isTooDark: analysis.luminance < 0.15,
        isTooBright: analysis.luminance > 0.85,
        isTooVibrant: analysis.hsl.s > 85,
      }));
    }
    
    // Detect palette type and distribution
    const lightCount = analyses.filter((a) => a.luminance > 0.7).length;
    const darkCount = analyses.filter((a) => a.luminance < 0.2).length;
    const lightThreshold = colors.length * 0.6;
    const darkThreshold = colors.length * 0.6;
    
    const paletteType =
      lightCount > lightThreshold
        ? 'light'
        : darkCount > darkThreshold
        ? 'dark'
        : 'mixed';
    
    // Check if palette has balanced distribution (intentional light/dark extremes)
    const hasBalancedDistribution =
      lightCount >= 3 && darkCount >= 1 && darkCount <= 2;
    
    // Calculate palette averages for relative comparison
    const avgLuminance = analyses.reduce((sum, a) => sum + a.luminance, 0) / analyses.length;
    const avgSaturation = analyses.reduce((sum, a) => sum + a.hsl.s, 0) / analyses.length;
    const avgLightness = analyses.reduce((sum, a) => sum + a.hsl.l, 0) / analyses.length;
    
    // Calculate standard deviations for relative comparison
    const luminanceVariance = analyses.reduce((sum, a) => sum + Math.pow(a.luminance - avgLuminance, 2), 0) / analyses.length;
    const saturationVariance = analyses.reduce((sum, a) => sum + Math.pow(a.hsl.s - avgSaturation, 2), 0) / analyses.length;
    const lightnessVariance = analyses.reduce((sum, a) => sum + Math.pow(a.hsl.l - avgLightness, 2), 0) / analyses.length;
    
    const luminanceStdDev = Math.sqrt(luminanceVariance);
    const saturationStdDev = Math.sqrt(saturationVariance);
    const lightnessStdDev = Math.sqrt(lightnessVariance);
    
    // Mark colors as problematic relative to palette, not just absolute values
    return analyses.map((analysis) => {
      // FIRST: Check if this is an intentional extreme color that should NEVER be flagged
      // Dark colors in light/mixed palettes (with mostly light colors) are needed for contrast
      // Consider a palette "light-dominant" if it has >= 50% light colors OR lightCount >= 3
      const isLightDominant = lightCount >= Math.max(3, colors.length * 0.5);
      const isIntentionalDark = isLightDominant && analysis.luminance < 0.2 && darkCount <= 2;
      const isIntentionalLight = paletteType === 'dark' && analysis.luminance > 0.7 && lightCount <= 2;
      const isVeryLightInLightPalette = isLightDominant && analysis.luminance > 0.9;
      
      // Base absolute checks
      let isTooDarkAbsolute = analysis.luminance < 0.15;
      let isTooBrightAbsolute = analysis.luminance > 0.85;
      
      // Adjust thresholds based on palette type
      const maxLuminance = paletteType === 'light' ? 0.95 : 0.85;
      const minLuminance = paletteType === 'dark' ? 0.05 : 0.15;
      
      // NEVER flag intentional extreme colors
      if (isIntentionalDark) {
        isTooDarkAbsolute = false; // Dark colors in light palettes are intentional
      }
      if (isIntentionalLight) {
        isTooBrightAbsolute = false; // Light colors in dark palettes are intentional
      }
      if (isVeryLightInLightPalette) {
        isTooBrightAbsolute = false; // Very light colors in light palettes are intentional
      }
      
      // Override absolute checks for balanced palettes (additional safety)
      if (hasBalancedDistribution) {
        // In balanced palettes, allow extremes (they're intentional)
        if (analysis.luminance < 0.2 && darkCount <= 2) {
          isTooDarkAbsolute = false; // Allow 1-2 dark colors in light/mixed palettes
        }
        if (analysis.luminance > 0.9 && lightCount >= 3) {
          isTooBrightAbsolute = false; // Allow very light colors in balanced palettes
        }
      }
      
      // Also explicitly allow dark colors in light-dominant palettes (regardless of balanced distribution)
      if (isLightDominant && analysis.luminance < 0.2 && darkCount <= 2) {
        isTooDarkAbsolute = false;
      }
      
      // Also explicitly allow very light colors in light-dominant palettes
      if (isLightDominant && analysis.luminance > 0.9) {
        isTooBrightAbsolute = false;
      }
      
      // Check saturation WITH lightness context
      // High saturation is only problematic if lightness is mid-range
      // High saturation + high lightness = pastel (OK)
      // High saturation + low lightness = dark vibrant (OK)
      // High saturation + mid lightness = jarring (problematic)
      let isTooVibrantAbsolute = false;
      if (analysis.hsl.s > 85) {
        const lightness = analysis.hsl.l;
        // Only flag if in mid-range lightness (40-70%) where high saturation is jarring
        // Pastels (high saturation + high lightness) are fine
        // Dark vibrant colors (high saturation + low lightness) are fine
        isTooVibrantAbsolute = lightness >= 40 && lightness <= 70;
      }
      
      // Relative to palette: flag if significantly different from average
      // Be more conservative with thresholds to avoid false positives and loops
      const luminanceDiff = Math.abs(analysis.luminance - avgLuminance);
      const saturationDiff = Math.abs(analysis.hsl.s - avgSaturation);
      
      // Only flag as problematic if BOTH conditions are met:
      // 1. The difference is meaningful (absolute threshold)
      // 2. The color is a clear outlier (std dev threshold)
      // This prevents flagging colors that are only slightly different
      let isTooDarkRelative = analysis.luminance < avgLuminance 
        && luminanceStdDev > 0.05  // Only if there's meaningful variance in palette
        && analysis.luminance < avgLuminance - (luminanceStdDev * 1.5)
        && luminanceDiff > 0.2;  // Must be at least 0.2 difference
      
      let isTooBrightRelative = analysis.luminance > avgLuminance 
        && luminanceStdDev > 0.05  // Only if there's meaningful variance in palette
        && analysis.luminance > avgLuminance + (luminanceStdDev * 1.5)
        && luminanceDiff > 0.2;  // Must be at least 0.2 difference
      
      let isTooVibrantRelative = analysis.hsl.s > avgSaturation 
        && saturationStdDev > 5  // Only if there's meaningful variance in palette
        && analysis.hsl.s > avgSaturation + (saturationStdDev * 1.5)
        && saturationDiff > 30  // Must be at least 30% saturation difference
        && analysis.hsl.l >= 40 && analysis.hsl.l <= 70; // Only flag if in mid-range lightness (same as absolute check)
      
      // ALWAYS skip relative checks for intentional extreme colors (these are never problematic)
      if (isIntentionalDark) {
        isTooDarkRelative = false;
        console.log(`[Harmony] Skipping relative dark check for ${analysis.hex} - intentional dark in light palette (luminance: ${analysis.luminance.toFixed(3)}, darkCount: ${darkCount})`);
      }
      if (isIntentionalLight) {
        isTooBrightRelative = false;
      }
      if (isVeryLightInLightPalette) {
        isTooBrightRelative = false;
      }
      
      // Additional safety: Skip relative checks for intentional extremes in balanced palettes
      if (hasBalancedDistribution) {
        const hasIntentionalDarkInBalanced = isLightDominant && darkCount <= 2;
        const hasIntentionalLightInBalanced = paletteType === 'dark' && lightCount <= 2;
        
        if (hasIntentionalDarkInBalanced && analysis.luminance < 0.2) {
          isTooDarkRelative = false;
        }
        if (hasIntentionalLightInBalanced && analysis.luminance > 0.7) {
          isTooBrightRelative = false;
        }
      }
      
      // Also explicitly skip relative checks for dark colors in light-dominant palettes
      if (isLightDominant && analysis.luminance < 0.2 && darkCount <= 2) {
        isTooDarkRelative = false;
        console.log(`[Harmony] Skipping relative dark check for ${analysis.hex} - intentional dark in light-dominant palette (luminance: ${analysis.luminance.toFixed(3)}, darkCount: ${darkCount}, lightCount: ${lightCount})`);
      }
      
      // Also explicitly skip relative checks for very light colors in light-dominant palettes
      if (isLightDominant && analysis.luminance > 0.9) {
        isTooBrightRelative = false;
      }
      
      // Combine absolute and relative checks
      // IMPORTANT: If this is an intentional extreme color, NEVER flag it as problematic
      const finalIsTooDark = isIntentionalDark ? false : (isTooDarkAbsolute || isTooDarkRelative);
      const finalIsTooBright = (isIntentionalLight || isVeryLightInLightPalette) ? false : (isTooBrightAbsolute || isTooBrightRelative);
      
      return {
        ...analysis,
        isTooDark: finalIsTooDark,
        isTooBright: finalIsTooBright,
        isTooVibrant: isTooVibrantAbsolute || isTooVibrantRelative,
      };
    });
  }

  /**
   * Test contrast between all color pairs
   * Uses permutations (both directions) rather than combinations
   * Tests A on B AND B on A as separate pairs
   * This ensures every color (including dark neutrals) is tested as text on all other colors
   */
  testContrast(colors: string[]): ContrastResult[] {
    const results: ContrastResult[] = [];
    
    // Filter out any invalid colors and ensure we have valid colors
    const validColors = colors.filter((hex) => hex && typeof hex === 'string' && hex.trim().length > 0);
    
    if (validColors.length < 2) {
      return results; // Need at least 2 colors to test contrast
    }
    
    const rgbColors = validColors.map((hex) => this.hexToRgb(hex));

    // Test all palette color permutations (both directions)
    // This includes dark neutral as text on all other colors
    // For n colors, this generates n × (n-1) pairs (permutations, not combinations)
    let pairCount = 0;
    for (let i = 0; i < validColors.length; i++) {
      for (let j = 0; j < validColors.length; j++) {
        // Skip self-pairs (color on itself)
        if (i !== j) {
          const ratio = this.calculateContrast(rgbColors[i], rgbColors[j]);
          results.push({
            color1: validColors[i], // Text color
            color2: validColors[j], // Background color
            ratio: Math.round(ratio * 100) / 100,
            passesAA: ratio >= 4.5,
            passesAAA: ratio >= 7,
            passesAALarge: ratio >= 3,
            passesAAALarge: ratio >= 4.5,
          });
          pairCount++;
        }
      }
    }

    // Debug logging to verify permutation count
    console.log(`[testContrast] Generated ${pairCount} pairs from ${validColors.length} colors (expected: ${validColors.length} × ${validColors.length - 1} = ${validColors.length * (validColors.length - 1)})`);

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
      (a) => (a.hsl.s < 30 && a.hsl.l < 30) || (a.luminance < 0.2 && a.hsl.s < 35),
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
   * Takes palette context to suggest colors that harmonize better
   */
  suggestFixes(analysis: ColorAnalysis, paletteAnalyses?: ColorAnalysis[]): string[] {
    const fixes: string[] = [];
    const hsl = analysis.hsl;

    // If we have palette context, calculate averages to harmonize with
    let targetLightness = hsl.l;
    let targetSaturation = hsl.s;
    
    if (paletteAnalyses && paletteAnalyses.length > 1) {
      // Exclude the current color from averages to get better context
      const otherAnalyses = paletteAnalyses.filter(a => a.hex !== analysis.hex);
      const avgLightness = otherAnalyses.length > 0 
        ? otherAnalyses.reduce((sum, a) => sum + a.hsl.l, 0) / otherAnalyses.length
        : paletteAnalyses.reduce((sum, a) => sum + a.hsl.l, 0) / paletteAnalyses.length;
      const avgSaturation = otherAnalyses.length > 0
        ? otherAnalyses.reduce((sum, a) => sum + a.hsl.s, 0) / otherAnalyses.length
        : paletteAnalyses.reduce((sum, a) => sum + a.hsl.s, 0) / paletteAnalyses.length;
      
      // Adjust towards palette average, but preserve hue
      // Move colors significantly enough to resolve the issue and prevent re-flagging
      if (analysis.isTooDark) {
        // Move towards average but ensure it's lighter
        // If average is very low, move more aggressively
        const targetBase = Math.max(avgLightness, hsl.l + 20);
        targetLightness = Math.min(95, targetBase);
      } else if (analysis.isTooBright) {
        // Move towards average but ensure it's darker
        // If average is very high, move more aggressively
        const targetBase = Math.min(avgLightness, hsl.l - 20);
        targetLightness = Math.max(5, targetBase);
      } else if (analysis.isTooVibrant) {
        // Only adjust saturation if too vibrant, keep lightness as is
        targetLightness = hsl.l;
      } else {
        // If not explicitly too dark/bright, don't change lightness
        targetLightness = hsl.l;
      }
      
      if (analysis.isTooVibrant) {
        // Move saturation towards average but ensure it's significantly less vibrant
        // Reduce by at least 20% or move to average, whichever is lower
        const reductionTarget = Math.max(avgSaturation - 5, hsl.s - 25);
        targetSaturation = Math.max(10, reductionTarget);
      } else {
        // Preserve saturation if not too vibrant
        targetSaturation = hsl.s;
      }
    } else {
      // Fallback to absolute adjustments
      if (analysis.isTooDark) {
        targetLightness = Math.min(95, hsl.l + 25);
      } else if (analysis.isTooBright) {
        targetLightness = Math.max(5, hsl.l - 25);
      }
      
      if (analysis.isTooVibrant) {
        targetSaturation = Math.max(10, hsl.s - 25);
      }
    }

    // Generate fixes - prioritize combined fix if multiple issues
    if ((analysis.isTooDark || analysis.isTooBright) && analysis.isTooVibrant) {
      // Combined fix for multiple issues
      const combinedRgb = this.hslToRgb(hsl.h, targetSaturation, targetLightness);
      fixes.push(this.rgbToHex(combinedRgb.r, combinedRgb.g, combinedRgb.b));
    } else {
      // Individual fixes
      if (analysis.isTooDark || analysis.isTooBright) {
        const adjustedRgb = this.hslToRgb(hsl.h, hsl.s, targetLightness);
        fixes.push(this.rgbToHex(adjustedRgb.r, adjustedRgb.g, adjustedRgb.b));
      }

      if (analysis.isTooVibrant) {
        const adjustedRgb = this.hslToRgb(hsl.h, targetSaturation, hsl.l);
        fixes.push(this.rgbToHex(adjustedRgb.r, adjustedRgb.g, adjustedRgb.b));
      }
    }

    return fixes.length > 0 ? fixes : [];
  }

  /**
   * Suggest contrast improvements for a failing pair
   */
  suggestContrastFix(
    color1: string,
    color2: string,
    targetRatio: number = 4.5
  ): { color1Fix?: string; color2Fix?: string; description: string } {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);
    const lum1 = this.calculateLuminance(rgb1);
    const lum2 = this.calculateLuminance(rgb2);
    const currentRatio = this.calculateContrast(rgb1, rgb2);

    if (currentRatio >= targetRatio) {
      return { description: 'Contrast already meets requirements' };
    }

    // Determine which color is lighter/darker
    const lighter = lum1 > lum2 ? rgb1 : rgb2;
    const darker = lum1 > lum2 ? rgb2 : rgb1;
    const lighterHex = lum1 > lum2 ? color1 : color2;
    const darkerHex = lum1 > lum2 ? color2 : color1;

    // Calculate required luminance for target ratio
    // Contrast = (L1 + 0.05) / (L2 + 0.05)
    // To get L1 from ratio: L1 = (ratio * (L2 + 0.05)) - 0.05
    // To get L2 from ratio: L2 = ((L1 + 0.05) / ratio) - 0.05

    const lighterLum = this.calculateLuminance(lighter);
    const darkerLum = this.calculateLuminance(darker);

    // Option 1: Make darker color darker
    // Calculate target luminance: contrast = (L1 + 0.05) / (L2 + 0.05)
    // Solving for L2: L2 = ((L1 + 0.05) / contrast) - 0.05
    const targetLumDarker = ((lighterLum + 0.05) / targetRatio) - 0.05;
    const darkerHsl = this.rgbToHsl(darker.r, darker.g, darker.b);
    
    // Only try darkening if target is valid (non-negative and less than current)
    let darkerFix = null;
    if (targetLumDarker >= 0 && targetLumDarker < darkerLum) {
      darkerFix = this.adjustLuminanceToTarget(darkerHsl, targetLumDarker);
      // Verify the fix actually improves contrast
      if (darkerFix) {
        const fixRgb = this.hslToRgb(darkerFix.h, darkerFix.s, darkerFix.l);
        const newLum = this.calculateLuminance(fixRgb);
        const newRatio = this.calculateContrast(lighter, fixRgb);
        if (newRatio < targetRatio * 0.99) { // Allow 1% tolerance for floating point
          darkerFix = null; // Fix didn't achieve target
        }
      }
    }

    // Option 2: Make lighter color lighter
    // Calculate target luminance: contrast = (L1 + 0.05) / (L2 + 0.05)
    // Solving for L1: L1 = contrast * (L2 + 0.05) - 0.05
    const targetLumLighter = targetRatio * (darkerLum + 0.05) - 0.05;
    const lighterHsl = this.rgbToHsl(lighter.r, lighter.g, lighter.b);
    
    // Only try lightening if target is valid (<= 1 and greater than current)
    let lighterFix = null;
    if (targetLumLighter <= 1 && targetLumLighter > lighterLum) {
      lighterFix = this.adjustLuminanceToTarget(lighterHsl, targetLumLighter);
      // Verify the fix actually improves contrast
      if (lighterFix) {
        const fixRgb = this.hslToRgb(lighterFix.h, lighterFix.s, lighterFix.l);
        const newLum = this.calculateLuminance(fixRgb);
        const newRatio = this.calculateContrast(fixRgb, darker);
        if (newRatio < targetRatio * 0.99) { // Allow 1% tolerance for floating point
          lighterFix = null; // Fix didn't achieve target
        }
      }
    }

    // Prefer darkening the darker color (less visually impactful)
    if (darkerFix && darkerFix.luminance >= 0) {
      const fixRgb = this.hslToRgb(darkerFix.h, darkerFix.s, darkerFix.l);
      const fixHex = this.rgbToHex(fixRgb.r, fixRgb.g, fixRgb.b);
      
      if (lum1 > lum2) {
        return {
          color2Fix: fixHex,
          description: `Darken ${darkerHex} to improve contrast to ${targetRatio}:1`,
        };
      } else {
        return {
          color1Fix: fixHex,
          description: `Darken ${darkerHex} to improve contrast to ${targetRatio}:1`,
        };
      }
    } else if (lighterFix && lighterFix.luminance <= 1) {
      const fixRgb = this.hslToRgb(lighterFix.h, lighterFix.s, lighterFix.l);
      const fixHex = this.rgbToHex(fixRgb.r, fixRgb.g, fixRgb.b);
      
      if (lum1 > lum2) {
        return {
          color1Fix: fixHex,
          description: `Lighten ${lighterHex} to improve contrast to ${targetRatio}:1`,
        };
      } else {
        return {
          color2Fix: fixHex,
          description: `Lighten ${lighterHex} to improve contrast to ${targetRatio}:1`,
        };
      }
    }

    return { description: 'Unable to suggest fix' };
  }

  /**
   * Adjust HSL color to reach target luminance
   */
  private adjustLuminanceToTarget(
    hsl: { h: number; s: number; l: number },
    targetLum: number
  ): { h: number; s: number; l: number; luminance: number } | null {
    // Try adjusting lightness while preserving hue and saturation
    const currentLum = this.calculateLuminance(this.hslToRgb(hsl.h, hsl.s, hsl.l));
    const needsDarkening = targetLum < currentLum;
    
    let bestL = hsl.l;
    let bestDiff = Infinity;
    let bestLum = currentLum;

    // Search for best lightness - iterate through all possible lightness values
    for (let l = 0; l <= 100; l += 0.5) {
      const rgb = this.hslToRgb(hsl.h, hsl.s, l);
      const lum = this.calculateLuminance(rgb);
      const diff = Math.abs(lum - targetLum);

      // Check if this gets us closer to target
      if (diff < bestDiff) {
        bestDiff = diff;
        bestL = l;
        bestLum = lum;
      }

      // If we're darkening and luminance is now below target, we're close enough
      if (needsDarkening && lum <= targetLum && diff < 0.01) {
        break;
      }
      
      // If we're lightening and luminance is now above target, we're close enough
      if (!needsDarkening && lum >= targetLum && diff < 0.01) {
        break;
      }
    }

    // Ensure we can actually reach the target (check if result is reasonable)
    if (bestDiff > 0.1 && Math.abs(bestLum - targetLum) > 0.1) {
      return null; // Can't reach target reasonably
    }

    return {
      h: hsl.h,
      s: hsl.s,
      l: Math.round(bestL * 100) / 100, // Round to 2 decimal places
      luminance: bestLum,
    };
  }

  /**
   * Suggest strategic colors that fix multiple failing contrast pairs
   * Returns both replacement suggestions (to fix existing colors) and addition suggestions
   */
  suggestStrategicColors(
    colors: string[],
    contrastResults: ContrastResult[],
    maxSuggestions: number = 5
  ): Array<{
    hex: string;
    replaceColor?: string; // If set, this is a replacement suggestion
    type: 'light-neutral' | 'dark-neutral' | 'strategic' | 'replacement';
    pairsFixed: number;
    pairsFixedDetails: Array<{ color1: string; color2: string; ratio: number }>;
    description: string;
  }> {
    const failingPairs = contrastResults.filter((r) => !r.passesAA);
    if (failingPairs.length === 0) {
      return [];
    }

    const suggestions: Array<{
      hex: string;
      replaceColor?: string;
      type: 'light-neutral' | 'dark-neutral' | 'strategic' | 'replacement';
      pairsFixed: number;
      pairsFixedDetails: Array<{ color1: string; color2: string; ratio: number }>;
      description: string;
    }> = [];

    const existingColors = colors.map((c) => c.toLowerCase());
    const analyses = colors.map((hex) => this.analyzeColor(hex));

    // First, find colors that could be replaced to fix multiple pairs
    const replacementSuggestions = this.findReplacementSuggestions(colors, failingPairs, contrastResults);
    suggestions.push(...replacementSuggestions);

    // Check what neutrals we have
    const hasLightNeutral = analyses.some((a) => a.hsl.s < 20 && a.hsl.l > 70);
    const hasDarkNeutral = analyses.some((a) => (a.hsl.s < 30 && a.hsl.l < 30) || (a.luminance < 0.2 && a.hsl.s < 35));

    // Suggest light neutral if missing (but only if it would fix multiple pairs)
    if (!hasLightNeutral && suggestions.length < maxSuggestions) {
      const lightNeutral = this.findBestNeutral(colors, failingPairs, 'light', 85, 95);
      if (lightNeutral && lightNeutral.pairsFixed >= 2) {
        suggestions.push(lightNeutral);
      }
    }

    // Suggest dark neutral if missing (but only if it would fix multiple pairs)
    if (!hasDarkNeutral && suggestions.length < maxSuggestions) {
      const darkNeutral = this.findBestNeutral(colors, failingPairs, 'dark', 5, 25);
      if (darkNeutral && darkNeutral.pairsFixed >= 2) {
        suggestions.push(darkNeutral);
      }
    }

    // Only add strategic colors if we have room and they fix multiple pairs
    if (suggestions.length < maxSuggestions) {
      const strategicColors = this.findStrategicColors(colors, failingPairs, existingColors);
      const highValueStrategic = strategicColors.filter((s) => s.pairsFixed >= 2);
      suggestions.push(...highValueStrategic.slice(0, maxSuggestions - suggestions.length));
    }

    // Sort by pairs fixed (descending) - replacements first, then additions
    suggestions.sort((a, b) => {
      // Prioritize replacements (they don't increase palette size)
      if (a.replaceColor && !b.replaceColor) return -1;
      if (!a.replaceColor && b.replaceColor) return 1;
      return b.pairsFixed - a.pairsFixed;
    });

    return suggestions.slice(0, maxSuggestions);
  }

  /**
   * Find which colors should be replaced to fix the most contrast issues
   */
  private findReplacementSuggestions(
    colors: string[],
    failingPairs: ContrastResult[],
    allResults: ContrastResult[]
  ): Array<{
    hex: string;
    replaceColor: string;
    type: 'replacement';
    pairsFixed: number;
    pairsFixedDetails: Array<{ color1: string; color2: string; ratio: number }>;
    description: string;
  }> {
    const suggestions: Array<{
      hex: string;
      replaceColor: string;
      type: 'replacement';
      pairsFixed: number;
      pairsFixedDetails: Array<{ color1: string; color2: string; ratio: number }>;
      description: string;
    }> = [];

    // Count how many failures each color is involved in
    const colorFailureCounts: Record<string, number> = {};
    failingPairs.forEach((pair) => {
      colorFailureCounts[pair.color1] = (colorFailureCounts[pair.color1] || 0) + 1;
      colorFailureCounts[pair.color2] = (colorFailureCounts[pair.color2] || 0) + 1;
    });

    // Find colors involved in the most failures
    const problematicColors = Object.entries(colorFailureCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3) // Try replacing top 3 problematic colors
      .map(([color]) => color);

    for (const colorToReplace of problematicColors) {
      const rgbOriginal = this.hexToRgb(colorToReplace);
      const hslOriginal = this.rgbToHsl(rgbOriginal.r, rgbOriginal.g, rgbOriginal.b);
      
      // Find pairs involving this color
      const pairsWithThisColor = failingPairs.filter(
        (p) => p.color1 === colorToReplace || p.color2 === colorToReplace
      );

      // Try different adjustments to this color
      const adjustments = [
        { lightness: hslOriginal.l + 15, saturation: hslOriginal.s }, // Lighter
        { lightness: hslOriginal.l - 15, saturation: hslOriginal.s }, // Darker
        { lightness: hslOriginal.l, saturation: Math.max(0, hslOriginal.s - 20) }, // Less saturated
        { lightness: hslOriginal.l + 10, saturation: Math.max(0, hslOriginal.s - 10) }, // Lighter + less saturated
        { lightness: hslOriginal.l - 10, saturation: Math.max(0, hslOriginal.s - 10) }, // Darker + less saturated
      ];

      let bestReplacement: {
        hex: string;
        pairsFixed: number;
        pairsFixedDetails: Array<{ color1: string; color2: string; ratio: number }>;
      } | null = null;

      for (const adj of adjustments) {
        const rgbNew = this.hslToRgb(hslOriginal.h, Math.max(0, Math.min(100, adj.saturation)), Math.max(0, Math.min(100, adj.lightness)));
        const hexNew = this.rgbToHex(rgbNew.r, rgbNew.g, rgbNew.b);

        if (hexNew.toLowerCase() === colorToReplace.toLowerCase()) {
          continue; // Skip if it's the same color
        }

        const pairsFixed: Array<{ color1: string; color2: string; ratio: number }> = [];

        // Check how many pairs would be fixed by replacing this color
        for (const pair of pairsWithThisColor) {
          const otherColor = pair.color1 === colorToReplace ? pair.color2 : pair.color1;
          const rgbOther = this.hexToRgb(otherColor);
          const ratio = this.calculateContrast(rgbNew, rgbOther);

          if (ratio >= 4.5) {
            pairsFixed.push({
              color1: hexNew,
              color2: otherColor,
              ratio: ratio,
            });
          }
        }

        // Also check if replacement fixes pairs with other colors
        const otherColors = colors.filter((c) => c !== colorToReplace);
        for (const otherColor of otherColors) {
          const rgbOther = this.hexToRgb(otherColor);
          const ratio = this.calculateContrast(rgbNew, rgbOther);
          
          // Check if this pair was failing before
          const wasFailing = failingPairs.some(
            (p) => (p.color1 === colorToReplace && p.color2 === otherColor) ||
                   (p.color1 === otherColor && p.color2 === colorToReplace)
          );

          if (wasFailing && ratio >= 4.5) {
            pairsFixed.push({
              color1: hexNew,
              color2: otherColor,
              ratio: ratio,
            });
          }
        }

        const uniquePairsFixed = new Set(
          pairsFixed.map((p) => `${p.color1}-${p.color2}`)
        ).size;

        if (!bestReplacement || uniquePairsFixed > bestReplacement.pairsFixed) {
          bestReplacement = {
            hex: hexNew,
            pairsFixed: uniquePairsFixed,
            pairsFixedDetails: pairsFixed.slice(0, 10),
          };
        }
      }

      if (bestReplacement && bestReplacement.pairsFixed > 0) {
        suggestions.push({
          hex: bestReplacement.hex,
          replaceColor: colorToReplace,
          type: 'replacement',
          pairsFixed: bestReplacement.pairsFixed,
          pairsFixedDetails: bestReplacement.pairsFixedDetails,
          description: `Replace ${colorToReplace} to fix ${bestReplacement.pairsFixed} contrast issue${bestReplacement.pairsFixed !== 1 ? 's' : ''}`,
        });
      }
    }

    return suggestions;
  }

  /**
   * Find the best neutral color that fixes the most pairs
   */
  private findBestNeutral(
    existingColors: string[],
    failingPairs: ContrastResult[],
    type: 'light' | 'dark',
    minLightness: number,
    maxLightness: number
  ): {
    hex: string;
    type: 'light-neutral' | 'dark-neutral';
    pairsFixed: number;
    pairsFixedDetails: Array<{ color1: string; color2: string; ratio: number }>;
    description: string;
  } | null {
    let bestColor: string | null = null;
    let bestPairsFixed = 0;
    let bestPairsFixedDetails: Array<{ color1: string; color2: string; ratio: number }> = [];

    // Try different lightness levels
    for (let lightness = minLightness; lightness <= maxLightness; lightness += 5) {
      const rgb = this.hslToRgb(0, 0, lightness); // Neutral = no hue, no saturation
      const hex = this.rgbToHex(rgb.r, rgb.g, rgb.b);
      
      if (existingColors.includes(hex.toLowerCase())) {
        continue; // Skip if already exists
      }

      const rgbColor = this.hexToRgb(hex);
      const pairsFixed: Array<{ color1: string; color2: string; ratio: number }> = [];

      // Check how many failing pairs this color would fix
      for (const pair of failingPairs) {
        const rgb1 = this.hexToRgb(pair.color1);
        const rgb2 = this.hexToRgb(pair.color2);

        // Check if this neutral works with color1
        const ratio1 = this.calculateContrast(rgbColor, rgb1);
        if (ratio1 >= 4.5) {
          pairsFixed.push({ color1: hex, color2: pair.color1, ratio: ratio1 });
        }

        // Check if this neutral works with color2
        const ratio2 = this.calculateContrast(rgbColor, rgb2);
        if (ratio2 >= 4.5) {
          pairsFixed.push({ color1: hex, color2: pair.color2, ratio: ratio2 });
        }

        // Also check if this neutral replaces one of the colors in the failing pair
        const ratio3 = this.calculateContrast(rgbColor, rgb1);
        const ratio4 = this.calculateContrast(rgbColor, rgb2);
        if (ratio3 >= 4.5 && ratio4 >= 4.5) {
          // This neutral creates a passing pair with both colors
          pairsFixed.push({ color1: pair.color1, color2: pair.color2, ratio: Math.min(ratio3, ratio4) });
        }
      }

      // Count unique pairs fixed (avoid double counting)
      const uniquePairsFixed = new Set(
        pairsFixed.map((p) => `${p.color1}-${p.color2}`)
      ).size;

      if (uniquePairsFixed > bestPairsFixed) {
        bestPairsFixed = uniquePairsFixed;
        bestColor = hex;
        bestPairsFixedDetails = pairsFixed.slice(0, 10); // Limit details
      }
    }

    if (!bestColor || bestPairsFixed === 0) {
      return null;
    }

    return {
      hex: bestColor,
      type: type === 'light' ? 'light-neutral' : 'dark-neutral',
      pairsFixed: bestPairsFixed,
      pairsFixedDetails: bestPairsFixedDetails,
      description: `${type === 'light' ? 'Light' : 'Dark'} neutral that fixes ${bestPairsFixed} contrast issue${bestPairsFixed !== 1 ? 's' : ''}`,
    };
  }

  /**
   * Find strategic colors that work well with many existing colors
   */
  private findStrategicColors(
    existingColors: string[],
    failingPairs: ContrastResult[],
    existingColorsLower: string[]
  ): Array<{
    hex: string;
    type: 'strategic';
    pairsFixed: number;
    pairsFixedDetails: Array<{ color1: string; color2: string; ratio: number }>;
    description: string;
  }> {
    const suggestions: Array<{
      hex: string;
      type: 'strategic';
      pairsFixed: number;
      pairsFixedDetails: Array<{ color1: string; color2: string; ratio: number }>;
      description: string;
    }> = [];

    const analyses = existingColors.map((hex) => this.analyzeColor(hex));
    const avgHue = analyses.reduce((sum, a) => sum + a.hsl.h, 0) / analyses.length;
    const avgSaturation = analyses.reduce((sum, a) => sum + a.hsl.s, 0) / analyses.length;

    // Try mid-tone colors that work with many colors
    // Test different lightness levels
    for (let lightness = 30; lightness <= 70; lightness += 15) {
      // Try colors with similar hue but different saturation
      const rgb = this.hslToRgb(avgHue, Math.min(avgSaturation + 20, 80), lightness);
      const hex = this.rgbToHex(rgb.r, rgb.g, rgb.b);

      if (existingColorsLower.includes(hex.toLowerCase())) {
        continue;
      }

      const rgbColor = this.hexToRgb(hex);
      const pairsFixed: Array<{ color1: string; color2: string; ratio: number }> = [];

      // Check how many failing pairs this color would help fix
      for (const pair of failingPairs) {
        const rgb1 = this.hexToRgb(pair.color1);
        const rgb2 = this.hexToRgb(pair.color2);

        // Check if this color works with both colors in the failing pair
        const ratio1 = this.calculateContrast(rgbColor, rgb1);
        const ratio2 = this.calculateContrast(rgbColor, rgb2);

        if (ratio1 >= 4.5 && ratio2 >= 4.5) {
          pairsFixed.push({
            color1: pair.color1,
            color2: pair.color2,
            ratio: Math.min(ratio1, ratio2),
          });
        }
      }

      if (pairsFixed.length > 0) {
        suggestions.push({
          hex,
          type: 'strategic',
          pairsFixed: pairsFixed.length,
          pairsFixedDetails: pairsFixed.slice(0, 10),
          description: `Strategic color that fixes ${pairsFixed.length} contrast issue${pairsFixed.length !== 1 ? 's' : ''}`,
        });
      }
    }

    return suggestions;
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


