import { Controller, Get, Post, Body, Param } from '@nestjs/common';
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

  @Get()
  async findAll() {
    return this.colorPaletteService.getAllPalettes();
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
}

