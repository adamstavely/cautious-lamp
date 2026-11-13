import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ColorPaletteService } from './color-palette.service';
import { CreatePaletteDto } from './dto/create-palette.dto';
import { AnalyzePaletteDto } from './dto/analyze-palette.dto';

@Controller('api/palettes')
export class ColorPaletteController {
  constructor(private readonly colorPaletteService: ColorPaletteService) {}

  @Post()
  async create(@Body() createPaletteDto: CreatePaletteDto) {
    return this.colorPaletteService.createPalette(createPaletteDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updatePaletteDto: CreatePaletteDto) {
    return this.colorPaletteService.updatePalette(id, updatePaletteDto);
  }

  @Get()
  async findAll(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.colorPaletteService.getAllPalettes(Number(page) || 1, Number(pageSize) || 50);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.colorPaletteService.getPalette(id);
  }

  @Post('analyze')
  async analyze(@Body() analyzePaletteDto: AnalyzePaletteDto) {
    return this.colorPaletteService.analyzePalette(analyzePaletteDto);
  }

  @Post('suggestions')
  async getSuggestions(@Body() body: { colors: string[]; regenerateType?: string }) {
    return this.colorPaletteService.getSuggestions(body.colors, body.regenerateType);
  }

  @Post('contrast-fix')
  async suggestContrastFix(@Body() body: { color1: string; color2: string; targetRatio?: number }) {
    return this.colorPaletteService.suggestContrastFix(body.color1, body.color2, body.targetRatio);
  }

  @Post('strategic-colors')
  async suggestStrategicColors(@Body() body: { colors: string[]; contrastResults: any[]; maxSuggestions?: number }) {
    return this.colorPaletteService.suggestStrategicColors(body.colors, body.contrastResults, body.maxSuggestions);
  }
}

