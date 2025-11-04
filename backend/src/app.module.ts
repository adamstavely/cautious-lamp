import { Module } from '@nestjs/common';
import { ColorPaletteModule } from './color-palette/color-palette.module';
import { ElasticsearchModule } from '@nestjs/elasticsearch';

@Module({
  imports: [
    ElasticsearchModule.register({
      node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
    }),
    ColorPaletteModule,
  ],
})
export class AppModule {}

