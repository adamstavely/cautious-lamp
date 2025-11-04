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

    // Find problematic colors
    const problematicColors = analysis
      .map((a, index) => ({
        color: colors[index],
        analysis: a,
        fixes: this.colorTheoryService.suggestFixes(a),
      }))
      .filter((item) => item.analysis.isTooDark || item.analysis.isTooBright || item.analysis.isTooVibrant);

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
}

