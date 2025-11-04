import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ColorTheoryService } from './color-theory.service';
import { CreatePaletteDto } from './dto/create-palette.dto';
import { AnalyzePaletteDto } from './dto/analyze-palette.dto';

@Injectable()
export class ColorPaletteService {
  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly colorTheoryService: ColorTheoryService,
  ) {}

  async createPalette(dto: CreatePaletteDto) {
    const palette = {
      name: dto.name,
      colors: dto.colors,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await this.elasticsearchService.index({
      index: 'color-palettes',
      document: palette,
    });

    return {
      id: result._id,
      ...palette,
    };
  }

  async updatePalette(id: string, dto: CreatePaletteDto) {
    // Get existing palette to preserve createdAt
    const existing = await this.elasticsearchService.get({
      index: 'color-palettes',
      id,
    });

    const palette = {
      name: dto.name,
      colors: dto.colors,
      createdAt: (existing._source as any).createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.elasticsearchService.update({
      index: 'color-palettes',
      id,
      doc: palette,
    });

    const result = await this.elasticsearchService.get({
      index: 'color-palettes',
      id,
    });

    return {
      id: result._id,
      ...(result._source as any),
    };
  }

  async getPalette(id: string) {
    const result = await this.elasticsearchService.get({
      index: 'color-palettes',
      id,
    });

    return {
      id: result._id,
      ...(result._source as any),
    };
  }

  async getAllPalettes() {
    const result = await this.elasticsearchService.search({
      index: 'color-palettes',
      body: {
        query: {
          match_all: {},
        },
        sort: [{ createdAt: { order: 'desc' } }],
      },
    });

    return result.hits.hits.map((hit: any) => ({
      id: hit._id,
      ...hit._source,
    }));
  }

  async analyzePalette(dto: AnalyzePaletteDto) {
    const colors = dto.colors.map((c) => c.hex);
    const analysis = this.colorTheoryService.analyzePalette(colors);
    const contrastResults = this.colorTheoryService.testContrast(colors);
    const suggestions = this.colorTheoryService.generateSuggestions(colors);

    // Detect palette type to identify intentional extreme colors
    const lightCount = analysis.filter((a) => a.luminance > 0.7).length;
    const darkCount = analysis.filter((a) => a.luminance < 0.2).length;
    const paletteType =
      lightCount > colors.length * 0.6
        ? 'light'
        : darkCount > colors.length * 0.6
        ? 'dark'
        : 'mixed';
    
    // Consider a palette "light-dominant" if it has >= 50% light colors OR lightCount >= 3
    // This helps identify palettes that are essentially light but fall just below the 60% threshold
    const isLightDominant = lightCount >= Math.max(3, colors.length * 0.5);
    
    console.log(`[Service] Palette analysis: ${colors.length} colors, ${lightCount} light, ${darkCount} dark, type=${paletteType}, lightDominant=${isLightDominant}`);

    // Find problematic colors with palette context for better fixes
    // EXCLUDE intentional dark colors in light-dominant palettes (they're needed for contrast)
    const problematicColors = analysis
      .map((a, index) => {
        const item = {
          color: colors[index],
          analysis: a,
          fixes: this.colorTheoryService.suggestFixes(a, analysis),
        };
        
        // Debug: Log every color being checked
        const isIntentionalDark = isLightDominant && a.luminance < 0.2 && darkCount <= 2;
        console.log(`[Service] Checking ${item.color}: luminance=${a.luminance.toFixed(3)}, isIntentionalDark=${isIntentionalDark}, isTooDark=${a.isTooDark}, isTooBright=${a.isTooBright}, isTooVibrant=${a.isTooVibrant}`);
        
        return item;
      })
      .filter((item) => {
        // Never flag intentional dark colors in light-dominant palettes
        const isIntentionalDark = isLightDominant && item.analysis.luminance < 0.2 && darkCount <= 2;
        if (isIntentionalDark) {
          console.log(`[Service] Excluding ${item.color} from problematic colors - intentional dark in light-dominant palette (luminance: ${item.analysis.luminance.toFixed(3)}, darkCount: ${darkCount}, isLightDominant: ${isLightDominant})`);
          return false;
        }
        
        // Also check: if the analysis says isTooDark=false but the color is dark and in a light-dominant palette, exclude it anyway
        // This is a safety check in case the analysis logic didn't catch it
        if (isLightDominant && item.analysis.luminance < 0.2 && darkCount <= 2) {
          console.log(`[Service] Safety check: Excluding ${item.color} - dark color in light-dominant palette`);
          return false;
        }
        
        const hasIssues = item.analysis.isTooDark || item.analysis.isTooBright || item.analysis.isTooVibrant;
        if (hasIssues) {
          console.log(`[Service] Flagging ${item.color} as problematic: isTooDark=${item.analysis.isTooDark}, isTooBright=${item.analysis.isTooBright}, isTooVibrant=${item.analysis.isTooVibrant}`);
        }
        return hasIssues;
      });
    
    console.log(`[Service] Final problematic colors count: ${problematicColors.length}`);
    if (problematicColors.length > 0) {
      problematicColors.forEach(pc => {
        console.log(`[Service] Problematic color: ${pc.color} - isTooDark=${pc.analysis.isTooDark}, isTooBright=${pc.analysis.isTooBright}, isTooVibrant=${pc.analysis.isTooVibrant}`);
      });
    }

    return {
      analysis,
      contrastResults,
      suggestions,
      problematicColors,
      hasClearMainColor: this.colorTheoryService.hasClearMainColor(colors),
    };
  }

  async getSuggestions(colors: string[], regenerateType?: string) {
    return this.colorTheoryService.generateSuggestions(colors, regenerateType);
  }

  async suggestContrastFix(color1: string, color2: string, targetRatio?: number) {
    return this.colorTheoryService.suggestContrastFix(color1, color2, targetRatio);
  }

  async suggestStrategicColors(colors: string[], contrastResults: any[], maxSuggestions?: number) {
    return this.colorTheoryService.suggestStrategicColors(colors, contrastResults, maxSuggestions);
  }
}

