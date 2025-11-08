import { Module } from '@nestjs/common';
import { ColorPaletteModule } from './color-palette/color-palette.module';
import { DesignSystemModule } from './design-system/design-system.module';
import { AuditModule } from './audit/audit.module';
import { RbacModule } from './rbac/rbac.module';
import { FeatureFlagsModule } from './feature-flags/feature-flags.module';
import { ElasticsearchModule } from '@nestjs/elasticsearch';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      useFactory: () => {
        const node = process.env.ELASTICSEARCH_NODE || 'http://localhost:9200';
        return {
          node,
          // Make connection optional - don't fail if Elasticsearch isn't available
          maxRetries: 0,
          requestTimeout: 1000,
        };
      },
    }),
    ColorPaletteModule,
    DesignSystemModule,
    AuditModule,
    RbacModule,
    FeatureFlagsModule,
  ],
})
export class AppModule {}

