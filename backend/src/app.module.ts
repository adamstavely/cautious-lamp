import { Module } from '@nestjs/common';
import { ColorPaletteModule } from './color-palette/color-palette.module';
import { DesignSystemModule } from './design-system/design-system.module';
import { ElasticsearchModule } from '@nestjs/elasticsearch';

@Module({
  imports: [
    ElasticsearchModule.register({
      node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
    }),
    ColorPaletteModule,
    DesignSystemModule,
  ],
})
export class AppModule {}

