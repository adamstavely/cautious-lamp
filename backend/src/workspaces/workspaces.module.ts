import { Module } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { AnalyticsModule } from '../analytics/analytics.module';
import { AnalyticsService } from '../analytics/analytics.service';
import { ApplicationsModule } from '../applications/applications.module';
import { EsIndexService } from '../common/elasticsearch/es-index.service';
import { DesignSystemModule } from '../design-system/design-system.module';
import { DesignSystemService } from '../design-system/design-system.service';
import { WORKSPACE_COMPONENT_SOURCE, WorkspaceComponent, WorkspaceComponentSource } from './component-source';
import { EsQueryableStore } from './queryable-store';
import { WorkspaceCoreModule } from './workspace-core.module';
import { WorkspaceResourcesService } from './workspace-resources.service';
import { WORKSPACE_RESOURCES_INDEX, WORKSPACE_RESOURCE_PROPERTIES, WORKSPACE_RESOURCE_STORE } from './workspace.types';
import { WorkspacesController } from './workspaces.controller';
import { WorkspacesService } from './workspaces.service';

/** Components from DesignSystemService and usage from AnalyticsService (both in memory) */
export function designSystemComponentSource(
  designSystem: DesignSystemService,
  analytics: AnalyticsService,
): WorkspaceComponentSource {
  return {
    listComponents: () => designSystem.getAllComponents() as unknown as WorkspaceComponent[],
    getComponent: (id) => designSystem.getComponentById(id) as unknown as WorkspaceComponent | undefined,
    usage: (id) => analytics.getComponentUsage(id).map((r) => ({ applicationId: r.applicationId, usageCount: r.usageCount })),
    setSharing: (id, sharing) => {
      const component = designSystem.getComponentById(id);
      if (!component) return undefined;
      component.isGlobal = sharing.isGlobal;
      component.sharedWith = sharing.isGlobal ? undefined : sharing.sharedWith;
      return component as unknown as WorkspaceComponent;
    },
  };
}

/** Team workspaces, their members, items, components and analytics (docs/WORKSPACES.md) */
@Module({
  imports: [WorkspaceCoreModule, ApplicationsModule, DesignSystemModule, AnalyticsModule],
  controllers: [WorkspacesController],
  providers: [
    WorkspacesService,
    WorkspaceResourcesService,
    {
      provide: WORKSPACE_RESOURCE_STORE,
      inject: [ElasticsearchService, EsIndexService],
      useFactory: (es: ElasticsearchService, esIndex: EsIndexService) =>
        new EsQueryableStore(es, esIndex, WORKSPACE_RESOURCES_INDEX, WORKSPACE_RESOURCE_PROPERTIES),
    },
    {
      provide: WORKSPACE_COMPONENT_SOURCE,
      inject: [DesignSystemService, AnalyticsService],
      useFactory: designSystemComponentSource,
    },
  ],
  exports: [WorkspacesService],
})
export class WorkspacesModule {}
