import { Module } from '@nestjs/common';
import { WorkspaceCoreModule } from '../workspaces/workspace-core.module';
import { ColorPaletteController } from './color-palette.controller';
import { ColorPaletteService } from './color-palette.service';
import { ColorTheoryService } from './color-theory.service';

@Module({
  imports: [WorkspaceCoreModule],
  controllers: [ColorPaletteController],
  providers: [ColorPaletteService, ColorTheoryService],
})
export class ColorPaletteModule {}
