import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode } from '@nestjs/common';
import { AuthPrincipal, Principal } from '../auth/principal';
import { ColorPaletteService } from './color-palette.service';
import { CreatePaletteDto, UpdatePaletteDto } from './dto/create-palette.dto';
import { AnalyzePaletteDto } from './dto/analyze-palette.dto';
import { ContrastFixDto, StrategicColorsDto, SuggestionsDto } from './dto/palette-tools.dto';

/**
 * Saved palettes and the palette tools. Any signed-in caller reads palettes;
 * only a palette's owner, editors of its workspace or an admin:users holder
 * change or delete it (`canEdit` on each palette says whether the caller may).
 */
@Controller('api/palettes')
export class ColorPaletteController {
  constructor(private readonly colorPaletteService: ColorPaletteService) {}

  @Post()
  async create(@Principal() principal: AuthPrincipal, @Body() createPaletteDto: CreatePaletteDto) {
    return this.colorPaletteService.createPalette(principal, createPaletteDto);
  }

  @Put(':id')
  async update(@Principal() principal: AuthPrincipal, @Param('id') id: string, @Body() updatePaletteDto: UpdatePaletteDto) {
    return this.colorPaletteService.updatePalette(principal, id, updatePaletteDto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Principal() principal: AuthPrincipal, @Param('id') id: string) {
    await this.colorPaletteService.deletePalette(principal, id);
  }

  @Get()
  async findAll(@Principal() principal: AuthPrincipal, @Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.colorPaletteService.getAllPalettes(principal, Number(page) || 1, Number(pageSize) || 50);
  }

  @Get(':id')
  async findOne(@Principal() principal: AuthPrincipal, @Param('id') id: string) {
    return this.colorPaletteService.getPalette(principal, id);
  }

  @Post('analyze')
  async analyze(@Body() analyzePaletteDto: AnalyzePaletteDto) {
    return this.colorPaletteService.analyzePalette(analyzePaletteDto);
  }

  @Post('suggestions')
  async getSuggestions(@Body() body: SuggestionsDto) {
    return this.colorPaletteService.getSuggestions(body.colors, body.regenerateType);
  }

  @Post('contrast-fix')
  async suggestContrastFix(@Body() body: ContrastFixDto) {
    return this.colorPaletteService.suggestContrastFix(body.color1, body.color2, body.targetRatio);
  }

  @Post('strategic-colors')
  async suggestStrategicColors(@Body() body: StrategicColorsDto) {
    return this.colorPaletteService.suggestStrategicColors(body.colors, body.contrastResults as any[], body.maxSuggestions);
  }
}
