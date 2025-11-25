import { Injectable, Logger } from '@nestjs/common';
import { chromium, Browser, Page } from 'playwright';
import { transformToDTCG, DembrandtOutput } from './dembrandt-to-dtcg.transformer';

export interface ExtractionOptions {
  darkMode?: boolean;
  mobile?: boolean;
  slow?: boolean;
}

@Injectable()
export class DesignExtractionService {
  private readonly logger = new Logger(DesignExtractionService.name);

  /**
   * Extract design tokens from a URL using Playwright
   */
  async extractDesignTokens(
    url: string,
    options: ExtractionOptions = {},
  ): Promise<DembrandtOutput> {
    // Validate URL
    if (!url || typeof url !== 'string') {
      throw new Error('URL is required and must be a string');
    }
    
    // Ensure URL has protocol
    const normalizedUrl = this.normalizeUrl(url);
    
    // Validate normalized URL
    try {
      new URL(normalizedUrl);
    } catch (e) {
      throw new Error(`Invalid URL: ${url}`);
    }

    let browser: Browser | null = null;
    try {
      // Launch browser
      browser = await chromium.launch({
        headless: true,
      });

      const context = await browser.newContext({
        viewport: options.mobile
          ? { width: 375, height: 667 }
          : { width: 1920, height: 1080 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        colorScheme: options.darkMode ? 'dark' : 'light',
      });

      const page = await context.newPage();

      // Navigate to URL first
      this.logger.log(`Navigating to ${normalizedUrl}`);
      await page.goto(normalizedUrl, {
        waitUntil: 'networkidle',
        timeout: options.slow ? 60000 : 30000,
      });

      // Wait for page to stabilize
      await page.waitForTimeout(options.slow ? 12000 : 8000);

      // Inject helper functions into the page context
      await page.evaluate(() => {
        (window as any).rgbToHex = function(rgb: string) {
          if (!rgb || typeof rgb !== 'string') return null;
          if (rgb.startsWith('#')) return rgb;
          const match = rgb.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
          if (!match) return null;
          const r = parseInt(match[1]);
          const g = parseInt(match[2]);
          const b = parseInt(match[3]);
          return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
          }).join('');
        };

        (window as any).isColorValue = function(value: string) {
          if (!value || typeof value !== 'string') return false;
          const trimmed = value.trim();
          
          // Must be a direct color value, not a CSS variable reference
          if (trimmed.startsWith('var(') || trimmed.startsWith('calc(') || trimmed.startsWith('url(')) {
            return false;
          }
          
          // Check for valid color formats
          if (trimmed.startsWith('#')) {
            // Hex color: #RGB, #RRGGBB, #RRGGBBAA
            const hexMatch = trimmed.match(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/);
            return hexMatch !== null;
          }
          
          if (trimmed.startsWith('rgb') || trimmed.startsWith('rgba')) {
            // RGB/RGBA color
            const rgbMatch = trimmed.match(/^rgba?\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+/);
            return rgbMatch !== null;
          }
          
          if (trimmed.startsWith('hsl') || trimmed.startsWith('hsla')) {
            // HSL/HSLA color
            const hslMatch = trimmed.match(/^hsla?\s*\(\s*\d+/);
            return hslMatch !== null;
          }
          
          // Named colors (basic set)
          const namedColors = ['transparent', 'currentcolor', 'inherit', 'initial', 'unset'];
          if (namedColors.includes(trimmed.toLowerCase())) {
            return false; // Don't include these
          }
          
          return false;
        };

        (window as any).pxToRem = function(px: string) {
          if (!px || typeof px !== 'string') return px;
          const num = parseFloat(px.replace('px', ''));
          if (isNaN(num)) return px;
          const baseFontSize = 16;
          return (num / baseFontSize).toFixed(2) + 'rem';
        };

        (window as any).detectScaleType = function(values: any[]) {
          if (!Array.isArray(values)) return 'unknown';
          const nums = values.map(v => parseFloat(String(v).replace('px', ''))).filter(n => !isNaN(n));
          if (nums.length === 0) return 'unknown';
          const mod4 = nums.filter(n => n % 4 === 0).length;
          const mod8 = nums.filter(n => n % 8 === 0).length;
          if (mod8 / nums.length > 0.7) return '8px';
          if (mod4 / nums.length > 0.7) return '4px';
          return 'mixed';
        };
      });

      // Extract design tokens
      const extractedData = await this.extractTokens(page);

      // Add metadata
      extractedData.url = normalizedUrl;
      extractedData.extractedAt = new Date().toISOString();

      return extractedData;
    } catch (error) {
      this.logger.error(`Error extracting design tokens: ${error.message}`, error.stack);
      throw new Error(`Failed to extract design tokens: ${error.message}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Extract tokens from a page using Playwright
   */
  private async extractTokens(page: Page): Promise<DembrandtOutput> {
    const data: DembrandtOutput = {
      url: '',
      extractedAt: '',
    };

    // Extract colors
    data.colors = await this.extractColors(page);

    // Extract typography
    data.typography = await this.extractTypography(page);

    // Extract spacing
    data.spacing = await this.extractSpacing(page);

    // Extract border radius
    data.borderRadius = await this.extractBorderRadius(page);

    // Extract shadows
    data.shadows = await this.extractShadows(page);

    // Extract logo
    data.logo = await this.extractLogo(page);

    // Extract favicons
    data.favicons = await this.extractFavicons(page);

    // Extract borders
    data.borders = await this.extractBorders(page);

    // Extract buttons
    if (!data.components) data.components = {};
    data.components.buttons = await this.extractButtons(page);

    // Extract inputs
    data.components.inputs = await this.extractInputs(page);

    // Extract links
    data.components.links = await this.extractLinks(page);

    // Extract breakpoints
    data.breakpoints = await this.extractBreakpoints(page);

    // Extract icons
    data.iconSystem = await this.extractIcons(page);

    // Extract frameworks
    data.frameworks = await this.extractFrameworks(page);

    // Extract and categorize CSS variables
    const cssVars = await this.extractCSSVariables(page);
    if (cssVars) {
      // Distribute CSS variables to appropriate sections
      if (cssVars.colors && Object.keys(cssVars.colors).length > 0) {
        if (!data.colors) data.colors = {};
        data.colors.cssVariables = cssVars.colors;
        
        // Detect semantic colors from CSS variable names
        Object.entries(cssVars.colors).forEach(([prop, value]) => {
          const propLower = prop.toLowerCase();
          if (!data.colors.semantic) data.colors.semantic = {};
          
          if (propLower.includes('primary')) {
            data.colors.semantic.primary = value;
          } else if (propLower.includes('secondary')) {
            data.colors.semantic.secondary = value;
          } else if (propLower.includes('accent')) {
            data.colors.semantic.accent = value;
          } else if (propLower.includes('success') || propLower.includes('green')) {
            data.colors.semantic.success = value;
          } else if (propLower.includes('error') || propLower.includes('danger') || propLower.includes('red')) {
            data.colors.semantic.error = value;
          } else if (propLower.includes('warning') || propLower.includes('yellow')) {
            data.colors.semantic.warning = value;
          } else if (propLower.includes('info') || propLower.includes('blue')) {
            data.colors.semantic.info = value;
          }
        });
      }
      if (cssVars.typography && Object.keys(cssVars.typography).length > 0) {
        if (!data.typography) data.typography = {};
        data.typography.cssVariables = cssVars.typography;
      }
      if (cssVars.spacing && Object.keys(cssVars.spacing).length > 0) {
        if (!data.spacing) data.spacing = {};
        data.spacing.cssVariables = cssVars.spacing;
      }
      if (cssVars.radius && Object.keys(cssVars.radius).length > 0) {
        if (!data.borderRadius) data.borderRadius = {};
        data.borderRadius.cssVariables = cssVars.radius;
      }
      if (cssVars.shadow && Object.keys(cssVars.shadow).length > 0) {
        data.shadowCssVariables = cssVars.shadow;
      }
    }

    return data;
  }

  /**
   * Extract colors from the page
   */
  private async extractColors(page: Page): Promise<DembrandtOutput['colors']> {
    const colors = await page.evaluate(() => {
      const colorMap = new Map<string, { count: number; sources: string[] }>();

      // Extract from computed styles - sample elements more efficiently
      const sampleSize = Math.min(500, document.querySelectorAll('*').length);
      const elements = Array.from(document.querySelectorAll('*')).slice(0, sampleSize);
      
      elements.forEach((el) => {
        const computed = window.getComputedStyle(el);
        const bgColor = computed.backgroundColor;
        const textColor = computed.color;
        const borderColor = computed.borderColor;
        const outlineColor = computed.outlineColor;

        [bgColor, textColor, borderColor, outlineColor].forEach((color) => {
          if (color && color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent' && color !== 'currentcolor') {
            const rgb = (window as any).rgbToHex(color);
            if (rgb) {
              // Normalize hex color (uppercase, ensure 6 digits)
              const normalized = rgb.toUpperCase().padEnd(7, '0');
              const existing = colorMap.get(normalized) || { count: 0, sources: [] };
              existing.count++;
              if (!existing.sources.includes('computed')) {
                existing.sources.push('computed');
              }
              colorMap.set(normalized, existing);
            }
          }
        });
      });

      // Note: CSS variables are now extracted and categorized separately in extractCSSVariables
      // Semantic colors will be detected from CSS variables after extraction

      // Extract colors from inline styles and style tags
      document.querySelectorAll('[style]').forEach((el) => {
        const style = el.getAttribute('style');
        if (style) {
          const colorMatches = style.match(/(?:color|background|border)[-:]?\s*([#\w(),\s.]+)/gi);
          if (colorMatches) {
            colorMatches.forEach((match) => {
              const colorValue = match.split(/[:;]/)[1]?.trim();
              if (colorValue && (window as any).isColorValue(colorValue)) {
                const rgb = (window as any).rgbToHex(colorValue);
                if (rgb) {
                  const existing = colorMap.get(rgb) || { count: 0, sources: [] };
                  existing.count++;
                  if (!existing.sources.includes('inline')) {
                    existing.sources.push('inline');
                  }
                  colorMap.set(rgb, existing);
                }
              }
            });
          }
        }
      });

      // Convert to array format - deduplicate and normalize
      const seenColors = new Set<string>();
      const palette = Array.from(colorMap.entries())
        .map(([color, data]) => {
          // Normalize color to avoid duplicates
          const normalized = color.toUpperCase();
          if (seenColors.has(normalized)) {
            return null; // Skip duplicate
          }
          seenColors.add(normalized);
          
          const isCommon = normalized === '#000000' || normalized === '#FFFFFF';
          return {
            color: normalized,
            confidence: isCommon 
              ? (data.count > 50 ? 'high' : data.count > 20 ? 'medium' : 'low')
              : (data.count > 10 ? 'high' : data.count > 3 ? 'medium' : 'low'),
            count: data.count,
            sources: data.sources,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)
        .sort((a, b) => {
          // Sort by confidence first, then by count
          const confidenceOrder = { high: 3, medium: 2, low: 1 };
          if (confidenceOrder[a.confidence] !== confidenceOrder[b.confidence]) {
            return confidenceOrder[b.confidence] - confidenceOrder[a.confidence];
          }
          return b.count - a.count;
        })
        .slice(0, 100); // Top 100 colors

      return {
        palette,
        // Note: semantic colors are detected from CSS variables in extractTokens
      };
    });

    return colors;
  }

  /**
   * Extract typography from the page
   */
  private async extractTypography(
    page: Page,
  ): Promise<DembrandtOutput['typography']> {
    const typography = await page.evaluate(() => {
      const styles = new Set<string>();
      const fontFamilies = new Set<string>();
      const googleFonts: string[] = [];
      const customFonts: string[] = [];
      const adobeFonts: string[] = [];

      // Extract from all text elements - sample more efficiently
      const textElements = document.querySelectorAll(
        'p, h1, h2, h3, h4, h5, h6, span, div, a, button, label, li, td, th, input, textarea',
      );
      
      const sampleSize = Math.min(200, textElements.length);
      const sampledElements = Array.from(textElements).slice(0, sampleSize);

      sampledElements.forEach((el) => {
        const computed = window.getComputedStyle(el);
        const fontFamily = computed.fontFamily.split(',')[0].replace(/['"]/g, '').trim();
        const fontSize = computed.fontSize;
        const fontWeight = computed.fontWeight;
        const lineHeight = computed.lineHeight;
        const letterSpacing = computed.letterSpacing;
        const textTransform = computed.textTransform;

        if (fontFamily && fontFamily !== 'initial' && fontFamily !== 'inherit') {
          fontFamilies.add(fontFamily);
        }
        if (fontSize && fontSize !== 'initial' && fontSize !== 'inherit') {
          styles.add(
            JSON.stringify({
              fontFamily,
              fontSize,
              fontWeight: fontWeight || '400',
              lineHeight: lineHeight || 'normal',
              letterSpacing: letterSpacing || 'normal',
              textTransform: textTransform || 'none',
            }),
          );
        }
      });

      // Check for Google Fonts
      const linkElements = document.querySelectorAll('link[href*="fonts.googleapis.com"], link[href*="fonts.gstatic.com"]');
      linkElements.forEach((link) => {
        const href = link.getAttribute('href');
        if (href) {
          const matches = href.match(/family=([^:&]+)/g);
          if (matches) {
            matches.forEach((match) => {
              const fontName = decodeURIComponent(match.replace('family=', '')).replace(/\+/g, ' ').split(':')[0];
              if (fontName && !googleFonts.includes(fontName)) {
                googleFonts.push(fontName);
              }
            });
          }
        }
      });

      // Check for Adobe Fonts
      const adobeLinks = document.querySelectorAll('link[href*="use.typekit.net"], link[href*="adobe.com"]');
      adobeLinks.forEach((link) => {
        const href = link.getAttribute('href');
        if (href && href.includes('typekit')) {
          adobeFonts.push('Adobe Fonts');
        }
      });

      // Check for font-face declarations
      const styleSheets = Array.from(document.styleSheets);
      styleSheets.forEach((sheet) => {
        try {
          const rules = Array.from(sheet.cssRules || []);
          rules.forEach((rule) => {
            if (rule instanceof CSSFontFaceRule) {
              const fontFamily = rule.style.fontFamily;
              if (fontFamily) {
                const cleanFamily = fontFamily.replace(/['"]/g, '').trim();
                if (cleanFamily && !fontFamilies.has(cleanFamily)) {
                  fontFamilies.add(cleanFamily);
                }
              }
            }
          });
        } catch (e) {
          // Cross-origin stylesheets may throw errors
        }
      });

      // Identify custom fonts (not system fonts, not Google, not Adobe)
      const systemFonts = ['Arial', 'Helvetica', 'Times', 'Courier', 'serif', 'sans-serif', 'monospace', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans'];
      fontFamilies.forEach((font) => {
        if (
          !googleFonts.includes(font) &&
          !systemFonts.includes(font) &&
          !customFonts.includes(font)
        ) {
          customFonts.push(font);
        }
      });

      return {
        styles: Array.from(styles).map((s) => JSON.parse(s)),
        sources: {
          googleFonts,
          adobeFonts: adobeFonts.length > 0,
          customFonts,
        },
      };
    });

    return typography;
  }

  /**
   * Extract spacing values from the page
   */
  private async extractSpacing(page: Page): Promise<DembrandtOutput['spacing']> {
    const spacing = await page.evaluate(() => {
      const spacingMap = new Map<string, number>();
      const gapMap = new Map<string, number>();

      // Sample elements more efficiently
      const sampleSize = Math.min(300, document.querySelectorAll('*').length);
      const elements = Array.from(document.querySelectorAll('*')).slice(0, sampleSize);

      elements.forEach((el) => {
        const computed = window.getComputedStyle(el);
        const margins = [
          computed.marginTop,
          computed.marginRight,
          computed.marginBottom,
          computed.marginLeft,
        ];
        const paddings = [
          computed.paddingTop,
          computed.paddingRight,
          computed.paddingBottom,
          computed.paddingLeft,
        ];
        const gap = computed.gap;

        [...margins, ...paddings].forEach((value) => {
          if (value && value !== '0px' && value !== '0' && value !== 'auto' && value !== 'none') {
            // Normalize the value
            const normalized = value.trim();
            const count = spacingMap.get(normalized) || 0;
            spacingMap.set(normalized, count + 1);
          }
        });

        if (gap && gap !== '0px' && gap !== 'normal') {
          const count = gapMap.get(gap) || 0;
          gapMap.set(gap, count + 1);
        }
      });

      // Combine spacing and gap values
      gapMap.forEach((count, value) => {
        const existing = spacingMap.get(value) || 0;
        spacingMap.set(value, existing + count);
      });

      const commonValues = Array.from(spacingMap.entries())
        .map(([px, count]) => ({
          px,
          rem: (window as any).pxToRem(px),
          count,
        }))
        .filter((item) => {
          // Filter out very large spacing values (likely layout, not tokens)
          const pxNum = parseFloat(item.px.replace('px', ''));
          return !isNaN(pxNum) && pxNum <= 128;
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 30); // Top 30 spacing values

      // Detect scale type (4px or 8px grid)
      const scaleType = (window as any).detectScaleType(commonValues.map((v) => v.px));

      return {
        scaleType,
        commonValues,
      };
    });

    return spacing;
  }

  /**
   * Extract border radius values
   */
  private async extractBorderRadius(
    page: Page,
  ): Promise<DembrandtOutput['borderRadius']> {
    const borderRadius = await page.evaluate(() => {
      const radiusMap = new Map<string, number>();

      // Sample elements more efficiently
      const sampleSize = Math.min(200, document.querySelectorAll('*').length);
      const elements = Array.from(document.querySelectorAll('*')).slice(0, sampleSize);

      elements.forEach((el) => {
        const computed = window.getComputedStyle(el);
        const radius = computed.borderRadius;
        if (radius && radius !== '0px' && radius !== '0') {
          // Handle multiple values (top-left, top-right, etc.)
          // Also handle shorthand like "4px 8px" or "4px / 8px"
          const values = radius.split(/[\s/]+/).filter(v => v && v !== '0px' && v !== '0');
          values.forEach((value) => {
            const normalized = value.trim();
            if (normalized) {
              const count = radiusMap.get(normalized) || 0;
              radiusMap.set(normalized, count + 1);
            }
          });
        }
      });

      const values = Array.from(radiusMap.entries())
        .map(([value, count]) => ({
          value,
          count,
          confidence: count > 5 ? 'high' : count > 2 ? 'medium' : 'low',
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20); // Top 20 radius values

      return { values };
    });

    return borderRadius;
  }

  /**
   * Extract shadow values
   */
  private async extractShadows(page: Page): Promise<DembrandtOutput['shadows']> {
    const shadows = await page.evaluate(() => {
      const shadowMap = new Map<string, number>();

      // Sample elements more efficiently
      const sampleSize = Math.min(200, document.querySelectorAll('*').length);
      const elements = Array.from(document.querySelectorAll('*')).slice(0, sampleSize);

      elements.forEach((el) => {
        const computed = window.getComputedStyle(el);
        const boxShadow = computed.boxShadow;
        const textShadow = computed.textShadow;
        
        if (boxShadow && boxShadow !== 'none' && boxShadow !== 'initial') {
          // Handle multiple shadows separated by commas
          const shadowValues = boxShadow.split(',').map((s) => s.trim());
          shadowValues.forEach((shadow) => {
            if (shadow && shadow !== 'none' && shadow !== 'initial') {
              // Normalize shadow (remove extra spaces)
              const normalized = shadow.replace(/\s+/g, ' ').trim();
              const count = shadowMap.get(normalized) || 0;
              shadowMap.set(normalized, count + 1);
            }
          });
        }
        
        if (textShadow && textShadow !== 'none' && textShadow !== 'initial') {
          const normalized = textShadow.replace(/\s+/g, ' ').trim();
          const count = shadowMap.get(normalized) || 0;
          shadowMap.set(normalized, count + 1);
        }
      });

      return Array.from(shadowMap.entries())
        .map(([shadow, count]) => ({
          shadow,
          count,
          confidence: count > 5 ? 'high' : count > 2 ? 'medium' : 'low',
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 15); // Top 15 shadow values
    });

    return shadows;
  }

  /**
   * Extract and categorize CSS variables
   */
  private async extractCSSVariables(
    page: Page,
  ): Promise<{
    colors?: Record<string, string>;
    typography?: Record<string, string>;
    spacing?: Record<string, string>;
    radius?: Record<string, string>;
    shadow?: Record<string, string>;
  }> {
    const categorized = await page.evaluate(() => {
      const colors: Record<string, string> = {};
      const typography: Record<string, string> = {};
      const spacing: Record<string, string> = {};
      const radius: Record<string, string> = {};
      const shadow: Record<string, string> = {};

      const rootStyles = getComputedStyle(document.documentElement);
      const allCssVars: Record<string, string> = {};

      // Get all CSS custom properties from stylesheets
      const styleSheets = Array.from(document.styleSheets);
      styleSheets.forEach((sheet) => {
        try {
          const rules = Array.from(sheet.cssRules || []);
          rules.forEach((rule) => {
            if (rule instanceof CSSStyleRule) {
              rule.style && Array.from(rule.style).forEach((prop) => {
                if (prop.startsWith('--')) {
                  const value = rule.style.getPropertyValue(prop);
                  if (value) {
                    allCssVars[prop] = value.trim();
                  }
                }
              });
            }
          });
        } catch (e) {
          // Cross-origin stylesheets may throw errors
        }
      });

      // Also check root computed styles
      for (let i = 0; i < rootStyles.length; i++) {
        const prop = rootStyles[i];
        if (prop.startsWith('--')) {
          const value = rootStyles.getPropertyValue(prop);
          if (value) {
            allCssVars[prop] = value.trim();
          }
        }
      }

      // Categorize CSS variables
      Object.entries(allCssVars).forEach(([prop, value]) => {
        const propLower = prop.toLowerCase();
        const trimmedValue = value.trim();

        // Helper to check if value is a dimension (px, rem, em)
        const isDimension = (val: string): boolean => {
          return /^\d+(\.\d+)?(px|rem|em|ch|ex|vh|vw|vmin|vmax|%)$/.test(val.trim());
        };

        // Helper to check if value looks like a shadow
        const isShadow = (val: string): boolean => {
          const shadowPattern = /^(\d+(\.\d+)?(px|rem|em)\s+){2,}/;
          return shadowPattern.test(val) || val.includes('rgba') || val.includes('rgb');
        };

        // Color variables
        const colorVarPatterns = [
          'color', 'bg', 'background', 'text', 'border', 'fill', 'stroke',
          'primary', 'secondary', 'accent', 'success', 'error', 'warning',
          'info', 'danger', 'red', 'green', 'blue', 'yellow', 'orange',
          'purple', 'pink', 'gray', 'grey', 'black', 'white', 'theme'
        ];
        const isColorRelated = colorVarPatterns.some(pattern => propLower.includes(pattern));
        if (isColorRelated && (window as any).isColorValue(trimmedValue)) {
          // Resolve CSS variable references if needed
          let resolvedValue = trimmedValue;
          if (trimmedValue.startsWith('var(')) {
            const varMatch = trimmedValue.match(/var\(--([^)]+)\)/);
            if (varMatch) {
              const varName = '--' + varMatch[1];
              const resolved = rootStyles.getPropertyValue(varName);
              if (resolved && (window as any).isColorValue(resolved.trim())) {
                resolvedValue = resolved.trim();
              } else {
                return; // Skip if can't resolve to a color
              }
            } else {
              return; // Skip if not a valid var() reference
            }
          }
          colors[prop] = resolvedValue;
          return;
        }

        // Typography variables
        const typographyVarPatterns = [
          'font', 'family', 'size', 'weight', 'line-height', 'letter-spacing',
          'text-transform', 'text-decoration', 'font-style', 'font-variant'
        ];
        const isTypographyRelated = typographyVarPatterns.some(pattern => propLower.includes(pattern));
        if (isTypographyRelated) {
          // Check if value looks like typography (font family names, font sizes, weights, etc.)
          if (
            /^["']?[A-Za-z\s]+["']?(\s*,\s*["']?[A-Za-z\s]+["']?)*$/.test(trimmedValue) || // Font family
            isDimension(trimmedValue) || // Font size
            /^(normal|bold|bolder|lighter|\d{3})$/.test(trimmedValue) || // Font weight
            /^(normal|\d+(\.\d+)?|inherit|initial|unset)$/.test(trimmedValue) // Line height
          ) {
            typography[prop] = trimmedValue;
            return;
          }
        }

        // Spacing variables
        const spacingVarPatterns = [
          'spacing', 'margin', 'padding', 'gap', 'inset', 'offset',
          'top', 'right', 'bottom', 'left', 'x', 'y'
        ];
        const isSpacingRelated = spacingVarPatterns.some(pattern => propLower.includes(pattern));
        if (isSpacingRelated && isDimension(trimmedValue)) {
          spacing[prop] = trimmedValue;
          return;
        }

        // Radius variables
        const radiusVarPatterns = ['radius', 'rounded', 'border-radius', 'corner'];
        const isRadiusRelated = radiusVarPatterns.some(pattern => propLower.includes(pattern));
        if (isRadiusRelated && isDimension(trimmedValue)) {
          radius[prop] = trimmedValue;
          return;
        }

        // Shadow variables
        const shadowVarPatterns = ['shadow', 'box-shadow', 'drop-shadow', 'text-shadow'];
        const isShadowRelated = shadowVarPatterns.some(pattern => propLower.includes(pattern));
        if (isShadowRelated && isShadow(trimmedValue)) {
          shadow[prop] = trimmedValue;
          return;
        }
      });

      return {
        colors: Object.keys(colors).length > 0 ? colors : undefined,
        typography: Object.keys(typography).length > 0 ? typography : undefined,
        spacing: Object.keys(spacing).length > 0 ? spacing : undefined,
        radius: Object.keys(radius).length > 0 ? radius : undefined,
        shadow: Object.keys(shadow).length > 0 ? shadow : undefined,
      };
    });

    return categorized;
  }

  /**
   * Extract logo from the page
   */
  private async extractLogo(page: Page): Promise<DembrandtOutput['logo']> {
    const logo = await page.evaluate(() => {
      // Common logo selectors
      const logoSelectors = [
        'img[class*="logo"]',
        'img[id*="logo"]',
        'img[alt*="logo" i]',
        'svg[class*="logo"]',
        'svg[id*="logo"]',
        'header img',
        'nav img',
        '.logo img',
        '#logo img',
      ];

      let logoElement: HTMLImageElement | SVGElement | null = null;

      // Try to find logo using selectors
      for (const selector of logoSelectors) {
        const element = document.querySelector(selector);
        if (element && (element instanceof HTMLImageElement || element instanceof SVGElement)) {
          logoElement = element;
          break;
        }
      }

      // If not found, look for largest image in header/nav
      if (!logoElement) {
        const header = document.querySelector('header, nav, [role="banner"]');
        if (header) {
          const images = Array.from(header.querySelectorAll('img, svg'));
          if (images.length > 0) {
            // Find largest image
            let largest = images[0] as HTMLImageElement | SVGElement;
            let largestSize = 0;
            images.forEach((img) => {
              const width = (img as HTMLImageElement).naturalWidth || (img as SVGElement).clientWidth || 0;
              const height = (img as HTMLImageElement).naturalHeight || (img as SVGElement).clientHeight || 0;
              const size = width * height;
              if (size > largestSize) {
                largestSize = size;
                largest = img as HTMLImageElement | SVGElement;
              }
            });
            logoElement = largest;
          }
        }
      }

      if (!logoElement) return null;

      if (logoElement instanceof HTMLImageElement) {
        const src = logoElement.src || logoElement.getAttribute('src') || '';
        const width = logoElement.naturalWidth || logoElement.width || 0;
        const height = logoElement.naturalHeight || logoElement.height || 0;
        
        if (src) {
          return {
            source: 'img',
            url: src,
            width,
            height,
          };
        }
      } else if (logoElement instanceof SVGElement) {
        const svgString = new XMLSerializer().serializeToString(logoElement);
        const width = logoElement.clientWidth || parseInt(logoElement.getAttribute('width') || '0', 10);
        const height = logoElement.clientHeight || parseInt(logoElement.getAttribute('height') || '0', 10);
        
        // Create data URL for SVG
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(svgBlob);
        
        return {
          source: 'svg',
          url,
          width,
          height,
        };
      }

      return null;
    });

    return logo || undefined;
  }

  /**
   * Extract favicons from the page
   */
  private async extractFavicons(page: Page): Promise<DembrandtOutput['favicons']> {
    const favicons = await page.evaluate(() => {
      const faviconLinks: Array<{ url: string; sizes?: string; type?: string }> = [];
      const linkElements = document.querySelectorAll('link[rel*="icon"], link[rel*="apple-touch-icon"]');

      linkElements.forEach((link) => {
        const href = link.getAttribute('href');
        if (href) {
          const sizes = link.getAttribute('sizes') || undefined;
          const type = link.getAttribute('type') || undefined;
          const rel = link.getAttribute('rel') || '';
          
          // Resolve relative URLs
          let url = href;
          if (href.startsWith('/')) {
            url = window.location.origin + href;
          } else if (!href.startsWith('http')) {
            url = new URL(href, window.location.href).href;
          }

          faviconLinks.push({
            url,
            sizes,
            type,
          });
        }
      });

      // Also check for default favicon.ico
      const defaultFavicon = `${window.location.origin}/favicon.ico`;
      if (!faviconLinks.some(f => f.url.includes('favicon.ico'))) {
        faviconLinks.push({
          url: defaultFavicon,
        });
      }

      return faviconLinks;
    });

    return favicons.length > 0 ? favicons : undefined;
  }

  /**
   * Extract borders from the page
   */
  private async extractBorders(page: Page): Promise<DembrandtOutput['borders']> {
    const borders = await page.evaluate(() => {
      const widthMap = new Map<string, number>();
      const styleMap = new Map<string, number>();
      const colorMap = new Map<string, number>();

      // Sample elements for border extraction
      const sampleSize = Math.min(500, document.querySelectorAll('*').length);
      const elements = Array.from(document.querySelectorAll('*')).slice(0, sampleSize);

      elements.forEach((el) => {
        const computed = window.getComputedStyle(el);
        const borderWidth = computed.borderWidth;
        const borderStyle = computed.borderStyle;
        const borderColor = computed.borderColor;

        // Extract border width
        if (borderWidth && borderWidth !== '0px' && borderWidth !== 'medium' && borderWidth !== 'thin' && borderWidth !== 'thick') {
          widthMap.set(borderWidth, (widthMap.get(borderWidth) || 0) + 1);
        }

        // Extract border style
        if (borderStyle && borderStyle !== 'none' && borderStyle !== 'initial' && borderStyle !== 'inherit') {
          styleMap.set(borderStyle, (styleMap.get(borderStyle) || 0) + 1);
        }

        // Extract border color
        if (borderColor && borderColor !== 'rgba(0, 0, 0, 0)' && borderColor !== 'transparent' && borderColor !== 'currentcolor') {
          const rgb = (window as any).rgbToHex(borderColor);
          if (rgb) {
            colorMap.set(rgb, (colorMap.get(rgb) || 0) + 1);
          }
        }
      });

      // Convert to arrays with confidence
      const widths = Array.from(widthMap.entries())
        .map(([value, count]) => ({
          value,
          count,
          confidence: count > 10 ? 'high' : count > 3 ? 'medium' : 'low',
        }))
        .sort((a, b) => b.count - a.count);

      const styles = Array.from(styleMap.entries())
        .map(([value, count]) => ({
          value,
          count,
        }))
        .sort((a, b) => b.count - a.count);

      const colors = Array.from(colorMap.entries())
        .map(([color, count]) => ({
          color,
          count,
          confidence: count > 10 ? 'high' : count > 3 ? 'medium' : 'low',
        }))
        .sort((a, b) => b.count - a.count);

      return {
        widths: widths.length > 0 ? widths : undefined,
        styles: styles.length > 0 ? styles : undefined,
        colors: colors.length > 0 ? colors : undefined,
      };
    });

    return borders;
  }

  /**
   * Extract button component styles
   */
  private async extractButtons(page: Page): Promise<Array<Record<string, any>> | undefined> {
    const buttons = await page.evaluate(() => {
      const buttonElements = document.querySelectorAll('button, [role="button"], .btn, [class*="button"]');
      const buttonStyles: Array<Record<string, any>> = [];

      buttonElements.forEach((btn) => {
        const computed = window.getComputedStyle(btn);
        const styles: Record<string, any> = {
          backgroundColor: computed.backgroundColor,
          color: computed.color,
          padding: computed.padding,
          border: computed.border,
          borderRadius: computed.borderRadius,
          fontSize: computed.fontSize,
          fontWeight: computed.fontWeight,
          fontFamily: computed.fontFamily,
          textTransform: computed.textTransform,
          cursor: computed.cursor,
        };

        // Only add if button has visible styles
        if (computed.display !== 'none' && computed.visibility !== 'hidden') {
          buttonStyles.push(styles);
        }
      });

      // Deduplicate similar button styles
      const uniqueButtons: Array<Record<string, any>> = [];
      buttonStyles.forEach((style) => {
        const styleKey = JSON.stringify(style);
        if (!uniqueButtons.some(b => JSON.stringify(b) === styleKey)) {
          uniqueButtons.push(style);
        }
      });

      return uniqueButtons.slice(0, 20); // Limit to top 20 unique button styles
    });

    return buttons && buttons.length > 0 ? buttons : undefined;
  }

  /**
   * Extract input component styles
   */
  private async extractInputs(page: Page): Promise<Array<Record<string, any>> | undefined> {
    const inputs = await page.evaluate(() => {
      const inputElements = document.querySelectorAll('input, textarea, select');
      const inputStyles: Array<Record<string, any>> = [];

      inputElements.forEach((input) => {
        const computed = window.getComputedStyle(input);
        const styles: Record<string, any> = {
          backgroundColor: computed.backgroundColor,
          color: computed.color,
          padding: computed.padding,
          border: computed.border,
          borderRadius: computed.borderRadius,
          fontSize: computed.fontSize,
          fontFamily: computed.fontFamily,
          width: computed.width,
          height: computed.height,
        };

        // Only add if input has visible styles
        if (computed.display !== 'none' && computed.visibility !== 'hidden') {
          inputStyles.push(styles);
        }
      });

      // Deduplicate similar input styles
      const uniqueInputs: Array<Record<string, any>> = [];
      inputStyles.forEach((style) => {
        const styleKey = JSON.stringify(style);
        if (!uniqueInputs.some(i => JSON.stringify(i) === styleKey)) {
          uniqueInputs.push(style);
        }
      });

      return uniqueInputs.slice(0, 20); // Limit to top 20 unique input styles
    });

    return inputs && inputs.length > 0 ? inputs : undefined;
  }

  /**
   * Extract link styles with hover states
   */
  private async extractLinks(page: Page): Promise<Array<{ styles: Record<string, any>; hover?: Record<string, any> }> | undefined> {
    const links = await page.evaluate(() => {
      const linkElements = document.querySelectorAll('a[href]');
      const linkStyles: Array<{ styles: Record<string, any>; hover?: Record<string, any> }> = [];

      linkElements.forEach((link) => {
        const computed = window.getComputedStyle(link);
        const styles: Record<string, any> = {
          color: computed.color,
          textDecoration: computed.textDecoration,
          fontSize: computed.fontSize,
          fontWeight: computed.fontWeight,
          fontFamily: computed.fontFamily,
        };

        // Try to get hover styles from stylesheets
        let hoverStyles: Record<string, any> | undefined;
        try {
          const styleSheets = Array.from(document.styleSheets);
          for (const sheet of styleSheets) {
            try {
              const rules = Array.from(sheet.cssRules || []);
              for (const rule of rules) {
                if (rule instanceof CSSStyleRule) {
                  if (rule.selectorText && rule.selectorText.includes(':hover')) {
                    // Check if this rule applies to this link
                    const matches = link.matches(rule.selectorText.replace(':hover', ''));
                    if (matches) {
                      hoverStyles = {
                        color: rule.style.color || styles.color,
                        textDecoration: rule.style.textDecoration || styles.textDecoration,
                      };
                      break;
                    }
                  }
                }
              }
            } catch (e) {
              // Cross-origin stylesheets may throw errors
            }
          }
        } catch (e) {
          // Ignore errors
        }

        if (computed.display !== 'none' && computed.visibility !== 'hidden') {
          linkStyles.push({
            styles,
            hover: hoverStyles,
          });
        }
      });

      // Deduplicate similar link styles
      const uniqueLinks: Array<{ styles: Record<string, any>; hover?: Record<string, any> }> = [];
      linkStyles.forEach((link) => {
        const styleKey = JSON.stringify(link.styles);
        if (!uniqueLinks.some(l => JSON.stringify(l.styles) === styleKey)) {
          uniqueLinks.push(link);
        }
      });

      return uniqueLinks.slice(0, 20); // Limit to top 20 unique link styles
    });

    return links && links.length > 0 ? links : undefined;
  }

  /**
   * Extract breakpoints from media queries
   */
  private async extractBreakpoints(page: Page): Promise<DembrandtOutput['breakpoints']> {
    const breakpoints = await page.evaluate(() => {
      const breakpointSet = new Set<string>();

      const styleSheets = Array.from(document.styleSheets);
      styleSheets.forEach((sheet) => {
        try {
          const rules = Array.from(sheet.cssRules || []);
          rules.forEach((rule) => {
            if (rule instanceof CSSMediaRule) {
              const mediaText = rule.media.mediaText;
              // Extract min-width and max-width values
              const minWidthMatch = mediaText.match(/min-width:\s*(\d+)px/);
              const maxWidthMatch = mediaText.match(/max-width:\s*(\d+)px/);
              
              if (minWidthMatch) {
                breakpointSet.add(minWidthMatch[1]);
              }
              if (maxWidthMatch) {
                breakpointSet.add(maxWidthMatch[1]);
              }
            }
          });
        } catch (e) {
          // Cross-origin stylesheets may throw errors
        }
      });

      return Array.from(breakpointSet)
        .map(px => ({ px: `${px}px` }))
        .sort((a, b) => parseInt(a.px) - parseInt(b.px));
    });

    return breakpoints && breakpoints.length > 0 ? breakpoints : undefined;
  }

  /**
   * Extract icon system detection
   */
  private async extractIcons(page: Page): Promise<DembrandtOutput['iconSystem']> {
    const icons = await page.evaluate(() => {
      const iconSystems: Array<{ name: string; type: string }> = [];

      // Check for Font Awesome
      const fontAwesomeElements = document.querySelectorAll('[class*="fa-"], [class*="fas"], [class*="far"], [class*="fab"]');
      if (fontAwesomeElements.length > 0) {
        iconSystems.push({ name: 'Font Awesome', type: 'icon-font' });
      }

      // Check for Material Icons
      const materialIcons = document.querySelectorAll('[class*="material-icons"], [class*="mdi-"]');
      if (materialIcons.length > 0) {
        iconSystems.push({ name: 'Material Icons', type: 'icon-font' });
      }

      // Check for SVG icons
      const svgIcons = document.querySelectorAll('svg[class*="icon"], svg[data-icon], [class*="icon"] svg');
      if (svgIcons.length > 0) {
        iconSystems.push({ name: 'SVG Icons', type: 'svg' });
      }

      // Check for icon fonts in stylesheets
      const styleSheets = Array.from(document.styleSheets);
      styleSheets.forEach((sheet) => {
        try {
          const rules = Array.from(sheet.cssRules || []);
          rules.forEach((rule) => {
            if (rule instanceof CSSFontFaceRule) {
              const fontFamily = rule.style.fontFamily.toLowerCase();
              if (fontFamily.includes('icon') || fontFamily.includes('awesome') || fontFamily.includes('material')) {
                iconSystems.push({ name: 'Icon Font', type: 'icon-font' });
              }
            }
          });
        } catch (e) {
          // Cross-origin stylesheets may throw errors
        }
      });

      // Deduplicate
      const uniqueIcons: Array<{ name: string; type: string }> = [];
      iconSystems.forEach((icon) => {
        if (!uniqueIcons.some(i => i.name === icon.name)) {
          uniqueIcons.push(icon);
        }
      });

      return uniqueIcons;
    });

    return icons && icons.length > 0 ? icons : undefined;
  }

  /**
   * Extract CSS framework detection
   */
  private async extractFrameworks(page: Page): Promise<DembrandtOutput['frameworks']> {
    const frameworks = await page.evaluate(() => {
      const detectedFrameworks: Array<{ name: string; confidence: string; evidence?: string }> = [];

      // Check for Tailwind CSS
      const tailwindClasses = document.querySelectorAll('[class*="bg-"], [class*="text-"], [class*="p-"], [class*="m-"]');
      if (tailwindClasses.length > 10) {
        detectedFrameworks.push({
          name: 'Tailwind CSS',
          confidence: 'high',
          evidence: 'Utility classes detected',
        });
      }

      // Check for Bootstrap
      const bootstrapClasses = document.querySelectorAll('.container, .row, .col, .btn, .navbar');
      const bootstrapLinks = document.querySelectorAll('link[href*="bootstrap"], script[src*="bootstrap"]');
      if (bootstrapClasses.length > 5 || bootstrapLinks.length > 0) {
        detectedFrameworks.push({
          name: 'Bootstrap',
          confidence: bootstrapLinks.length > 0 ? 'high' : 'medium',
          evidence: bootstrapLinks.length > 0 ? 'Bootstrap CDN detected' : 'Bootstrap classes detected',
        });
      }

      // Check for Material-UI
      const muiClasses = document.querySelectorAll('[class*="Mui"], [class*="makeStyles"]');
      const muiScripts = document.querySelectorAll('script[src*="material-ui"], script[src*="mui"]');
      if (muiClasses.length > 5 || muiScripts.length > 0) {
        detectedFrameworks.push({
          name: 'Material-UI',
          confidence: muiScripts.length > 0 ? 'high' : 'medium',
          evidence: muiScripts.length > 0 ? 'Material-UI scripts detected' : 'Material-UI classes detected',
        });
      }

      // Check for Chakra UI
      const chakraClasses = document.querySelectorAll('[class*="chakra"], [data-chakra]');
      const chakraScripts = document.querySelectorAll('script[src*="chakra"]');
      if (chakraClasses.length > 5 || chakraScripts.length > 0) {
        detectedFrameworks.push({
          name: 'Chakra UI',
          confidence: chakraScripts.length > 0 ? 'high' : 'medium',
          evidence: chakraScripts.length > 0 ? 'Chakra UI scripts detected' : 'Chakra UI classes detected',
        });
      }

      // Check for CSS variables that indicate frameworks
      const rootStyles = getComputedStyle(document.documentElement);
      const cssVars: string[] = [];
      for (let i = 0; i < rootStyles.length; i++) {
        const prop = rootStyles[i];
        if (prop.startsWith('--')) {
          cssVars.push(prop);
        }
      }

      // Check for framework-specific CSS variables
      if (cssVars.some(v => v.includes('chakra'))) {
        detectedFrameworks.push({
          name: 'Chakra UI',
          confidence: 'high',
          evidence: 'Chakra CSS variables detected',
        });
      }

      return detectedFrameworks;
    });

    return frameworks && frameworks.length > 0 ? frameworks : undefined;
  }

  /**
   * Normalize URL to include protocol
   */
  private normalizeUrl(url: string): string {
    if (!url || typeof url !== 'string') {
      throw new Error('URL must be a non-empty string');
    }
    
    // Remove any whitespace
    const trimmed = url.trim();
    
    // Check if it's already a valid URL with protocol
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    
    // Add https:// if no protocol
    return `https://${trimmed}`;
  }

  /**
   * Transform extracted data to DTCG format
   */
  async extractAndTransform(
    url: string,
    options: ExtractionOptions = {},
  ): Promise<{ raw: DembrandtOutput; dtcg: any }> {
    const raw = await this.extractDesignTokens(url, options);
    const dtcg = transformToDTCG(raw);
    return { raw, dtcg };
  }
}


