import { Module } from '@nestjs/common';
import { ColorPaletteController } from './color-palette.controller';
import { ColorPaletteService } from './color-palette.service';
import { ColorTheoryService } from './color-theory.service';

@Module({
  controllers: [ColorPaletteController],
  providers: [ColorPaletteService, ColorTheoryService],
})
export class ColorPaletteModule {}
