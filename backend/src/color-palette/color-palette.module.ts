import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ColorPaletteController } from './color-palette.controller';
import { ColorPaletteService } from './color-palette.service';
import { ColorTheoryService } from './color-theory.service';

@Module({
  imports: [
    ElasticsearchModule.register({
      node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
    }),
  ],
  controllers: [ColorPaletteController],
  providers: [ColorPaletteService, ColorTheoryService],
})
export class ColorPaletteModule {}

