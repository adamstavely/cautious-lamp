/**
 * Transformer to convert dembrandt extraction output to DTCG-compliant format
 */

export interface DembrandtOutput {
  url: string;
  extractedAt: string;
  logo?: {
    source: string;
    url: string;
    width: number;
    height: number;
  };
  colors?: {
    semantic?: Record<string, string>;
    palette?: Array<{
      color: string;
      confidence: string;
      count: number;
      sources?: string[];
    }>;
    cssVariables?: Record<string, string>;
  };
  typography?: {
    styles?: Array<{
      fontFamily: string;
      fontSize: string;
      fontWeight: string;
      lineHeight?: string;
      letterSpacing?: string;
    }>;
    sources?: {
      googleFonts?: string[];
      adobeFonts?: boolean;
      customFonts?: string[];
    };
    cssVariables?: Record<string, string>;
  };
  spacing?: {
    scaleType?: string;
    commonValues?: Array<{
      px: string;
      rem?: string;
      count: number;
    }>;
    cssVariables?: Record<string, string>;
  };
  borderRadius?: {
    values?: Array<{
      value: string;
      count: number;
      confidence: string;
    }>;
    cssVariables?: Record<string, string>;
  };
  shadows?: Array<{
    shadow: string;
    count: number;
    confidence: string;
  }>;
  shadowCssVariables?: Record<string, string>;
  favicons?: Array<{
    url: string;
    sizes?: string;
    type?: string;
  }>;
  borders?: {
    widths?: Array<{
      value: string;
      count: number;
      confidence: string;
    }>;
    styles?: Array<{
      value: string;
      count: number;
    }>;
    colors?: Array<{
      color: string;
      count: number;
      confidence: string;
    }>;
  };
  components?: {
    buttons?: Array<Record<string, any>>;
    inputs?: Array<Record<string, any>>;
    links?: Array<{
      styles: Record<string, any>;
      hover?: Record<string, any>;
    }>;
  };
  breakpoints?: Array<{
    px: string;
  }>;
  iconSystem?: Array<{
    name: string;
    type: string;
  }>;
  frameworks?: Array<{
    name: string;
    confidence: string;
    evidence?: string;
  }>;
}

export interface DTCGToken {
  $type: string;
  $value: string | number;
  $description?: string;
}

export interface DTCGFormat {
  [key: string]: DTCGToken | DTCGFormat;
}

/**
 * Transform dembrandt output to DTCG-compliant format
 */
export function transformToDTCG(data: DembrandtOutput): DTCGFormat {
  const dtcg: DTCGFormat = {};
  
  // Track colors we've already added to avoid duplicates across categories
  const addedColors = new Set<string>();

  // Transform colors
  if (data.colors) {
    dtcg.color = {};

    // Add semantic colors
    if (data.colors.semantic) {
      dtcg.color.semantic = {};
      for (const [key, value] of Object.entries(data.colors.semantic)) {
        const normalizedColor = normalizeColorValue(value);
        if (normalizedColor && !addedColors.has(normalizedColor)) {
          addedColors.add(normalizedColor);
          setNestedValue(dtcg.color.semantic, key, {
            $type: 'color',
            $value: normalizedColor,
            $description: `Semantic color: ${key}`,
          });
        }
      }
    }

    // Add palette colors (include medium and high confidence)
    if (data.colors.palette) {
      (dtcg.color as any).palette = {};
      const validColors = data.colors.palette.filter(
        (c) => c.confidence === 'high' || c.confidence === 'medium',
      );
      
      // First, deduplicate exact color matches
      const uniqueColors = new Map<string, { color: string; count: number; sources: string[] }>();
      validColors.forEach((item) => {
        const normalizedColor = item.color.toLowerCase().trim();
        const existing = uniqueColors.get(normalizedColor);
        if (existing) {
          // Merge counts and sources
          existing.count += item.count;
          item.sources?.forEach((src) => {
            if (!existing.sources.includes(src)) {
              existing.sources.push(src);
            }
          });
        } else {
          uniqueColors.set(normalizedColor, {
            color: item.color,
            count: item.count,
            sources: item.sources || [],
          });
        }
      });
      
      // Group by base color name
      const colorGroups: Record<string, Array<{ color: string; count: number }>> = {};
      Array.from(uniqueColors.values()).forEach((item) => {
        const baseName = getColorName(item.color);
        if (!colorGroups[baseName]) {
          colorGroups[baseName] = [];
        }
        colorGroups[baseName].push({ color: item.color, count: item.count });
      });

      // Create numbered scale (50, 100, 200, etc.) or use count-based naming
      for (const [baseName, colors] of Object.entries(colorGroups)) {
        // Sort by usage count
        colors.sort((a, b) => b.count - a.count);
        
        // Filter out colors already added in semantic
        const uniqueColors = colors.filter((item) => {
          const normalized = normalizeColorValue(item.color);
          if (addedColors.has(normalized)) {
            return false; // Skip if already added
          }
          addedColors.add(normalized);
          return true;
        });
        
        if (uniqueColors.length === 0) continue; // Skip if all colors were duplicates
        
        if (uniqueColors.length === 1) {
          setNestedValue((dtcg.color as any).palette, baseName, {
            $type: 'color',
            $value: uniqueColors[0].color,
            $description: `Extracted color: ${baseName} (${uniqueColors[0].color})`,
          });
        } else {
          // Use standard scale: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
          const scaleValues = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
          uniqueColors.forEach((item, index) => {
            const scaleValue = scaleValues[Math.min(index, scaleValues.length - 1)];
            setNestedValue((dtcg.color as any).palette, `${baseName}.${scaleValue}`, {
              $type: 'color',
              $value: item.color,
              $description: `Extracted color: ${baseName} ${scaleValue} (${item.color})`,
            });
          });
        }
      }
    }

    // Add CSS variables (only if not already in palette or semantic)
    if (data.colors.cssVariables) {
      (dtcg.color as any).cssVariables = {};
      for (const [key, value] of Object.entries(data.colors.cssVariables)) {
        const normalizedColor = normalizeColorValue(value);
        // Only add if it's a unique color not already in palette or semantic
        if (normalizedColor && !addedColors.has(normalizedColor)) {
          addedColors.add(normalizedColor);
          const cleanKey = key.replace('--', '').replace(/-/g, '.');
          setNestedValue((dtcg.color as any).cssVariables, cleanKey, {
            $type: 'color',
            $value: normalizedColor,
            $description: `CSS variable: ${key}`,
          });
        }
      }
    }
  }

  // Transform typography
  if (data.typography) {
    dtcg.typography = {};

    // Font families
    if (data.typography.sources?.googleFonts) {
      (dtcg.typography as any).fontFamily = {};
      data.typography.sources.googleFonts.forEach((font, index) => {
        const fontKey = index === 0 ? 'primary' : `secondary${index > 1 ? index : ''}`;
        setNestedValue((dtcg.typography as any).fontFamily, fontKey, {
          $type: 'fontFamily',
          $value: `${font}, sans-serif`,
          $description: `Font family: ${font}`,
        });
      });
    }

    if (data.typography.sources?.customFonts) {
      data.typography.sources.customFonts.forEach((font, index) => {
        const fontKey = `custom${index > 0 ? index + 1 : ''}`;
        if (!(dtcg.typography as any).fontFamily) {
          (dtcg.typography as any).fontFamily = {};
        }
        setNestedValue((dtcg.typography as any).fontFamily, fontKey, {
          $type: 'fontFamily',
          $value: font,
          $description: `Custom font: ${font}`,
        });
      });
    }

    // Font sizes
    if (data.typography.styles && data.typography.styles.length > 0) {
      (dtcg.typography as any).fontSize = {};
      const sizeMap = new Map<string, { value: string; count: number }>();
      
      data.typography.styles.forEach((style) => {
        if (style.fontSize && style.fontSize !== 'initial' && style.fontSize !== 'inherit') {
          const existing = sizeMap.get(style.fontSize) || { value: style.fontSize, count: 0 };
          existing.count++;
          sizeMap.set(style.fontSize, existing);
        }
      });
      
      // Sort by frequency and create tokens
      Array.from(sizeMap.entries())
        .sort((a, b) => b[1].count - a[1].count)
        .forEach(([size, data]) => {
          const sizeKey = getSizeKey(size);
          // Avoid overwriting - use count-based suffix if needed
          let finalKey = sizeKey;
          let counter = 1;
          while ((dtcg.typography as any).fontSize[finalKey]) {
            finalKey = `${sizeKey}${counter}`;
            counter++;
          }
          setNestedValue((dtcg.typography as any).fontSize, finalKey, {
            $type: 'dimension',
            $value: data.value,
            $description: `Font size: ${data.value} (used ${data.count} times)`,
          });
        });
    }

    // Font weights
    if (data.typography.styles && data.typography.styles.length > 0) {
      (dtcg.typography as any).fontWeight = {};
      const weightMap = new Map<string, { value: string; count: number }>();
      
      data.typography.styles.forEach((style) => {
        if (style.fontWeight && style.fontWeight !== 'initial' && style.fontWeight !== 'inherit') {
          const existing = weightMap.get(style.fontWeight) || { value: style.fontWeight, count: 0 };
          existing.count++;
          weightMap.set(style.fontWeight, existing);
        }
      });
      
      Array.from(weightMap.entries())
        .sort((a, b) => b[1].count - a[1].count)
        .forEach(([weight, data]) => {
          const weightKey = getWeightKey(data.value);
          let finalKey = weightKey;
          let counter = 1;
          while ((dtcg.typography as any).fontWeight[finalKey]) {
            finalKey = `${weightKey}${counter}`;
            counter++;
          }
          setNestedValue((dtcg.typography as any).fontWeight, finalKey, {
            $type: 'fontWeight',
            $value: data.value,
            $description: `Font weight: ${data.value} (used ${data.count} times)`,
          });
        });
    }

    // Line heights
    if (data.typography.styles && data.typography.styles.length > 0) {
      (dtcg.typography as any).lineHeight = {};
      const lineHeightMap = new Map<string, { value: string; count: number }>();
      
      data.typography.styles.forEach((style) => {
        if (style.lineHeight && style.lineHeight !== 'initial' && style.lineHeight !== 'inherit' && style.lineHeight !== 'normal') {
          const existing = lineHeightMap.get(style.lineHeight) || { value: style.lineHeight, count: 0 };
          existing.count++;
          lineHeightMap.set(style.lineHeight, existing);
        }
      });
      
      Array.from(lineHeightMap.entries())
        .sort((a, b) => b[1].count - a[1].count)
        .forEach(([lineHeight, data]) => {
          const lineHeightKey = getLineHeightKey(data.value);
          let finalKey = lineHeightKey;
          let counter = 1;
          while ((dtcg.typography as any).lineHeight[finalKey]) {
            finalKey = `${lineHeightKey}${counter}`;
            counter++;
          }
          setNestedValue((dtcg.typography as any).lineHeight, finalKey, {
            $type: 'lineHeight',
            $value: data.value,
            $description: `Line height: ${data.value} (used ${data.count} times)`,
          });
        });
    }

    // Add typography CSS variables
    if (data.typography.cssVariables) {
      if (!(dtcg.typography as any).cssVariables) {
        (dtcg.typography as any).cssVariables = {};
      }
      for (const [key, value] of Object.entries(data.typography.cssVariables)) {
        const cleanKey = key.replace('--', '').replace(/-/g, '.');
        // Determine the type based on the variable name
        let tokenType = 'string';
        let tokenValue = value;
        
        if (key.toLowerCase().includes('font-family') || key.toLowerCase().includes('family')) {
          tokenType = 'fontFamily';
        } else if (key.toLowerCase().includes('font-size') || key.toLowerCase().includes('size')) {
          tokenType = 'dimension';
        } else if (key.toLowerCase().includes('font-weight') || key.toLowerCase().includes('weight')) {
          tokenType = 'fontWeight';
        } else if (key.toLowerCase().includes('line-height') || key.toLowerCase().includes('lineheight')) {
          tokenType = 'lineHeight';
        } else if (key.toLowerCase().includes('letter-spacing') || key.toLowerCase().includes('letterspacing')) {
          tokenType = 'dimension';
        } else if (key.toLowerCase().includes('text-transform')) {
          tokenType = 'textTransform';
        }
        
        setNestedValue((dtcg.typography as any).cssVariables, cleanKey, {
          $type: tokenType,
          $value: tokenValue,
          $description: `CSS variable: ${key}`,
        });
      }
    }
  }

  // Transform spacing
  if (data.spacing?.commonValues) {
    dtcg.spacing = {};
    data.spacing.commonValues.forEach((spacing) => {
      const spacingKey = getSpacingKey(spacing.px);
      setNestedValue(dtcg.spacing, spacingKey, {
        $type: 'dimension',
        $value: spacing.px,
        $description: `Spacing: ${spacing.px} (used ${spacing.count} times)`,
      });
    });

    // Add spacing CSS variables
    if (data.spacing.cssVariables) {
      if (!dtcg.spacing) {
        dtcg.spacing = {};
      }
      if (!(dtcg.spacing as any).cssVariables) {
        (dtcg.spacing as any).cssVariables = {};
      }
      for (const [key, value] of Object.entries(data.spacing.cssVariables)) {
        const cleanKey = key.replace('--', '').replace(/-/g, '.');
        setNestedValue((dtcg.spacing as any).cssVariables, cleanKey, {
          $type: 'dimension',
          $value: value,
          $description: `CSS variable: ${key}`,
        });
      }
    }
  }

  // Transform border radius
  if (data.borderRadius?.values) {
    dtcg.radius = {};
    data.borderRadius.values
      .filter((r) => r.confidence === 'high')
      .forEach((radius) => {
        const radiusKey = getRadiusKey(radius.value);
        setNestedValue(dtcg.radius, radiusKey, {
          $type: 'dimension',
          $value: radius.value,
          $description: `Border radius: ${radius.value}`,
        });
      });

    // Add radius CSS variables
    if (data.borderRadius.cssVariables) {
      if (!dtcg.radius) {
        dtcg.radius = {};
      }
      if (!(dtcg.radius as any).cssVariables) {
        (dtcg.radius as any).cssVariables = {};
      }
      for (const [key, value] of Object.entries(data.borderRadius.cssVariables)) {
        const cleanKey = key.replace('--', '').replace(/-/g, '.');
        setNestedValue((dtcg.radius as any).cssVariables, cleanKey, {
          $type: 'dimension',
          $value: value,
          $description: `CSS variable: ${key}`,
        });
      }
    }
  }

  // Transform shadows
  if (data.shadows) {
    dtcg.shadow = {};
    data.shadows
      .filter((s) => s.confidence === 'high')
      .forEach((shadow, index) => {
        const shadowKey = getShadowKey(index, shadow.shadow);
        setNestedValue(dtcg.shadow, shadowKey, {
          $type: 'shadow',
          $value: shadow.shadow,
          $description: `Shadow: ${shadow.shadow}`,
        });
      });

    // Add shadow CSS variables
    if (data.shadowCssVariables) {
      if (!dtcg.shadow) {
        dtcg.shadow = {};
      }
      if (!(dtcg.shadow as any).cssVariables) {
        (dtcg.shadow as any).cssVariables = {};
      }
      for (const [key, value] of Object.entries(data.shadowCssVariables)) {
        const cleanKey = key.replace('--', '').replace(/-/g, '.');
        setNestedValue((dtcg.shadow as any).cssVariables, cleanKey, {
          $type: 'shadow',
          $value: value,
          $description: `CSS variable: ${key}`,
        });
      }
    }
  }

  // Transform logo
  if (data.logo) {
    dtcg.logo = {
      url: {
        $type: 'string',
        $value: data.logo.url,
        $description: `Logo URL (${data.logo.source})`,
      },
      width: {
        $type: 'dimension',
        $value: `${data.logo.width}px`,
        $description: 'Logo width',
      },
      height: {
        $type: 'dimension',
        $value: `${data.logo.height}px`,
        $description: 'Logo height',
      },
    };
  }

  // Transform favicons
  if (data.favicons && data.favicons.length > 0) {
    dtcg.favicons = {};
    data.favicons.forEach((favicon, index) => {
      const key = `favicon${index > 0 ? index + 1 : ''}`;
      dtcg.favicons[key] = {
        url: {
          $type: 'string',
          $value: favicon.url,
          $description: `Favicon URL${favicon.sizes ? ` (${favicon.sizes})` : ''}${favicon.type ? ` - ${favicon.type}` : ''}`,
        },
      };
      if (favicon.sizes) {
        dtcg.favicons[key].sizes = {
          $type: 'string',
          $value: favicon.sizes,
        };
      }
      if (favicon.type) {
        dtcg.favicons[key].type = {
          $type: 'string',
          $value: favicon.type,
        };
      }
    });
  }

  // Transform borders
  if (data.borders) {
    dtcg.border = {};
    
    if (data.borders.widths && data.borders.widths.length > 0) {
      (dtcg.border as any).width = {};
      data.borders.widths
        .filter((w) => w.confidence === 'high' || w.confidence === 'medium')
        .forEach((width) => {
          const widthKey = width.value.replace('px', '');
          setNestedValue((dtcg.border as any).width, widthKey, {
            $type: 'dimension',
            $value: width.value,
            $description: `Border width: ${width.value} (used ${width.count} times)`,
          });
        });
    }

    if (data.borders.styles && data.borders.styles.length > 0) {
      (dtcg.border as any).style = {};
      data.borders.styles.forEach((style) => {
        const styleKey = style.value.replace(/-/g, '');
        setNestedValue((dtcg.border as any).style, styleKey, {
          $type: 'string',
          $value: style.value,
          $description: `Border style: ${style.value} (used ${style.count} times)`,
        });
      });
    }

    if (data.borders.colors && data.borders.colors.length > 0) {
      (dtcg.border as any).color = {};
      data.borders.colors
        .filter((c) => c.confidence === 'high' || c.confidence === 'medium')
        .forEach((color) => {
          const normalizedColor = normalizeColorValue(color.color);
          if (normalizedColor && !addedColors.has(normalizedColor)) {
            addedColors.add(normalizedColor);
            const colorKey = getColorName(color.color);
            setNestedValue((dtcg.border as any).color, colorKey, {
              $type: 'color',
              $value: normalizedColor,
              $description: `Border color: ${normalizedColor} (used ${color.count} times)`,
            });
          }
        });
    }
  }

  // Transform buttons
  if (data.components?.buttons && data.components.buttons.length > 0) {
    if (!dtcg.components) dtcg.components = {};
    (dtcg.components as any).buttons = {};
    data.components.buttons.forEach((button, index) => {
      const buttonKey = `variant${index > 0 ? index + 1 : ''}`;
      (dtcg.components as any).buttons[buttonKey] = {};
      Object.entries(button).forEach(([prop, value]) => {
        if (value && typeof value === 'string') {
          let tokenType = 'string';
          if (prop.includes('Color') || prop === 'backgroundColor') {
            const normalized = normalizeColorValue(value);
            if (normalized) {
              tokenType = 'color';
              value = normalized;
            }
          } else if (prop.includes('Size') || prop.includes('Width') || prop.includes('Height') || prop.includes('Radius') || prop.includes('Padding')) {
            tokenType = 'dimension';
          } else if (prop.includes('Weight')) {
            tokenType = 'fontWeight';
          } else if (prop.includes('Family')) {
            tokenType = 'fontFamily';
          }
          setNestedValue((dtcg.components as any).buttons[buttonKey], prop, {
            $type: tokenType,
            $value: value,
            $description: `Button ${prop}`,
          });
        }
      });
    });
  }

  // Transform inputs
  if (data.components?.inputs && data.components.inputs.length > 0) {
    if (!dtcg.components) dtcg.components = {};
    (dtcg.components as any).inputs = {};
    data.components.inputs.forEach((input, index) => {
      const inputKey = `variant${index > 0 ? index + 1 : ''}`;
      (dtcg.components as any).inputs[inputKey] = {};
      Object.entries(input).forEach(([prop, value]) => {
        if (value && typeof value === 'string') {
          let tokenType = 'string';
          if (prop.includes('Color') || prop === 'backgroundColor') {
            const normalized = normalizeColorValue(value);
            if (normalized) {
              tokenType = 'color';
              value = normalized;
            }
          } else if (prop.includes('Size') || prop.includes('Width') || prop.includes('Height') || prop.includes('Radius') || prop.includes('Padding')) {
            tokenType = 'dimension';
          } else if (prop.includes('Weight')) {
            tokenType = 'fontWeight';
          } else if (prop.includes('Family')) {
            tokenType = 'fontFamily';
          }
          setNestedValue((dtcg.components as any).inputs[inputKey], prop, {
            $type: tokenType,
            $value: value,
            $description: `Input ${prop}`,
          });
        }
      });
    });
  }

  // Transform links
  if (data.components?.links && data.components.links.length > 0) {
    if (!dtcg.components) dtcg.components = {};
    (dtcg.components as any).links = {};
    data.components.links.forEach((link, index) => {
      const linkKey = `variant${index > 0 ? index + 1 : ''}`;
      (dtcg.components as any).links[linkKey] = {
        base: {},
        hover: {},
      };
      
      // Base styles
      Object.entries(link.styles).forEach(([prop, value]) => {
        if (value && typeof value === 'string') {
          let tokenType = 'string';
          if (prop === 'color') {
            const normalized = normalizeColorValue(value);
            if (normalized) {
              tokenType = 'color';
              value = normalized;
            }
          } else if (prop.includes('Size')) {
            tokenType = 'dimension';
          } else if (prop.includes('Weight')) {
            tokenType = 'fontWeight';
          } else if (prop.includes('Family')) {
            tokenType = 'fontFamily';
          }
          setNestedValue((dtcg.components as any).links[linkKey].base, prop, {
            $type: tokenType,
            $value: value,
            $description: `Link ${prop}`,
          });
        }
      });

      // Hover styles
      if (link.hover) {
        Object.entries(link.hover).forEach(([prop, value]) => {
          if (value && typeof value === 'string') {
            let tokenType = 'string';
            if (prop === 'color') {
              const normalized = normalizeColorValue(value);
              if (normalized) {
                tokenType = 'color';
                value = normalized;
              }
            }
            setNestedValue((dtcg.components as any).links[linkKey].hover, prop, {
              $type: tokenType,
              $value: value,
              $description: `Link hover ${prop}`,
            });
          }
        });
      }
    });
  }

  // Transform breakpoints
  if (data.breakpoints && data.breakpoints.length > 0) {
    dtcg.breakpoints = {};
    data.breakpoints.forEach((bp, index) => {
      const bpKey = `bp${index + 1}`;
      setNestedValue(dtcg.breakpoints, bpKey, {
        $type: 'dimension',
        $value: bp.px,
        $description: `Breakpoint: ${bp.px}`,
      });
    });
  }

  // Transform icons
  if (data.iconSystem && data.iconSystem.length > 0) {
    dtcg.icons = {};
    data.iconSystem.forEach((icon, index) => {
      const iconKey = icon.name.toLowerCase().replace(/\s+/g, '');
      setNestedValue(dtcg.icons, iconKey, {
        $type: 'string',
        $value: icon.type,
        $description: `Icon system: ${icon.name}`,
      });
    });
  }

  // Transform frameworks
  if (data.frameworks && data.frameworks.length > 0) {
    dtcg.frameworks = {};
    data.frameworks.forEach((framework) => {
      const frameworkKey = framework.name.toLowerCase().replace(/\s+/g, '').replace(/-/g, '');
      dtcg.frameworks[frameworkKey] = {
        name: {
          $type: 'string',
          $value: framework.name,
        },
        confidence: {
          $type: 'string',
          $value: framework.confidence,
        },
      };
      if (framework.evidence) {
        dtcg.frameworks[frameworkKey].evidence = {
          $type: 'string',
          $value: framework.evidence,
        };
      }
    });
  }

  return dtcg;
}

/**
 * Normalize color value to avoid duplicates
 */
function normalizeColorValue(color: string): string | null {
  if (!color) return null;
  
  // Convert rgb/rgba to hex if needed
  if (color.startsWith('rgb')) {
    const match = color.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (match) {
      const r = parseInt(match[1]);
      const g = parseInt(match[2]);
      const b = parseInt(match[3]);
      const hex = '#' + [r, g, b].map(x => {
        const h = x.toString(16);
        return h.length === 1 ? '0' + h : h;
      }).join('');
      return hex.toUpperCase();
    }
  }
  
  // Normalize hex colors
  if (color.startsWith('#')) {
    // Remove any whitespace and ensure uppercase
    return color.trim().toUpperCase();
  }
  
  return color.trim();
}

/**
 * Helper to set nested values using dot notation
 */
function setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  current[keys[keys.length - 1]] = value;
}

/**
 * Get a color name from hex value
 */
function getColorName(hex: string): string {
  if (!hex || !hex.startsWith('#')) return 'base';
  
  // Remove # and convert to RGB
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  if (isNaN(r) || isNaN(g) || isNaN(b)) return 'base';
  
  // Calculate hue
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  
  let hue = 0;
  if (delta !== 0) {
    if (max === r) {
      hue = ((g - b) / delta) % 6;
    } else if (max === g) {
      hue = (b - r) / delta + 2;
    } else {
      hue = (r - g) / delta + 4;
    }
  }
  hue = Math.round(hue * 60);
  if (hue < 0) hue += 360;
  
  // Calculate saturation and lightness
  const lightness = (max + min) / 2 / 255;
  const saturation = delta === 0 ? 0 : delta / (255 - Math.abs(2 * (max + min) / 2 - 255));
  
  // Classify color
  if (saturation < 0.1) {
    // Grayscale
    if (lightness > 0.9) return 'white';
    if (lightness < 0.1) return 'black';
    return 'gray';
  }
  
  // Colorful
  if (hue >= 0 && hue < 30) return 'red';
  if (hue >= 30 && hue < 60) return 'orange';
  if (hue >= 60 && hue < 120) return 'yellow';
  if (hue >= 120 && hue < 180) return 'green';
  if (hue >= 180 && hue < 240) return 'cyan';
  if (hue >= 240 && hue < 300) return 'blue';
  if (hue >= 300 && hue < 360) return 'purple';
  
  return 'base';
}

/**
 * Get a size key from pixel value
 */
function getSizeKey(size: string): string {
  const px = parseInt(size.replace('px', ''));
  if (px <= 12) return 'xs';
  if (px <= 14) return 'sm';
  if (px <= 16) return 'base';
  if (px <= 18) return 'md';
  if (px <= 20) return 'lg';
  if (px <= 24) return 'xl';
  if (px <= 32) return '2xl';
  if (px <= 40) return '3xl';
  return '4xl';
}

/**
 * Get a weight key from font weight value
 */
function getWeightKey(weight: string): string {
  const num = parseInt(weight);
  if (num <= 300) return 'light';
  if (num <= 400) return 'normal';
  if (num <= 500) return 'medium';
  if (num <= 600) return 'semibold';
  if (num <= 700) return 'bold';
  return 'extrabold';
}

/**
 * Get a line height key from value
 */
function getLineHeightKey(lineHeight: string): string {
  const num = parseFloat(lineHeight);
  if (num <= 1.2) return 'tight';
  if (num <= 1.4) return 'snug';
  if (num <= 1.5) return 'normal';
  if (num <= 1.6) return 'relaxed';
  return 'loose';
}

/**
 * Get a spacing key from pixel value
 */
function getSpacingKey(px: string): string {
  const num = parseInt(px.replace('px', ''));
  if (num <= 4) return 'xs';
  if (num <= 8) return 'sm';
  if (num <= 12) return 'md';
  if (num <= 16) return 'base';
  if (num <= 24) return 'lg';
  if (num <= 32) return 'xl';
  if (num <= 48) return '2xl';
  if (num <= 64) return '3xl';
  return '4xl';
}

/**
 * Get a radius key from value
 */
function getRadiusKey(value: string): string {
  const num = parseInt(value.replace('px', ''));
  if (num <= 2) return 'sm';
  if (num <= 4) return 'base';
  if (num <= 8) return 'md';
  if (num <= 12) return 'lg';
  if (num <= 16) return 'xl';
  if (num === 9999 || num > 50) return 'full';
  return '2xl';
}

/**
 * Get a shadow key from index and shadow value
 */
function getShadowKey(index: number, shadow: string): string {
  const keys = ['sm', 'base', 'md', 'lg', 'xl', '2xl'];
  return keys[index] || `custom${index}`;
}

