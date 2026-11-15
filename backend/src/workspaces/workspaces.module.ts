import { Module } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { AnalyticsModule } from '../analytics/analytics.module';
import { AnalyticsService } from '../analytics/analytics.service';
import { ApplicationsModule } from '../applications/applications.module';
import { EsIndexService } from '../common/elasticsearch/es-index.service';
import { DesignSystemModule } from '../design-system/design-system.module';
import { DesignSystemService } from '../design-system/design-system.service';
import { NotificationsCoreModule } from '../notifications/notifications-core.module';
import { WORKSPACE_COMPONENT_SOURCE, WorkspaceComponent, WorkspaceComponentSource } from './component-source';
import { EsQueryableStore } from './queryable-store';
import { WorkspaceCoreModule } from './workspace-core.module';
import { WorkspaceResourcesService } from './workspace-resources.service';
import { WORKSPACE_RESOURCES_INDEX, WORKSPACE_RESOURCE_PROPERTIES, WORKSPACE_RESOURCE_STORE } from './workspace.types';
import { WorkspacesController } from './workspaces.controller';
import { WorkspacesService } from './workspaces.service';

/** Components from DesignSystemService and usage from AnalyticsService */
export function designSystemComponentSource(
  designSystem: DesignSystemService,
  analytics: AnalyticsService,
): WorkspaceComponentSource {
  return {
    listComponents: () => designSystem.getAllComponents() as unknown as WorkspaceComponent[],
    getComponent: (id) => designSystem.getComponentById(id) as unknown as WorkspaceComponent | undefined,
    usage: async (applicationIds) => {
      const state = await analytics.currentUsage([...applicationIds].map((id) => ({ id })));
      return new Map(
        [...state.byComponent].map(([componentId, usages]) => [componentId, usages.map((u) => ({ applicationId: u.applicationId, usageCount: u.usageCount }))]),
      );
    },
    setSharing: async (id, sharing) => {
      if (!designSystem.getComponentById(id)) return undefined;
      return (await designSystem.setComponentSharing(id, sharing)) as unknown as WorkspaceComponent;
    },
  };
}

/** Team workspaces, their members, items, components and analytics (docs/WORKSPACES.md) */
@Module({
  imports: [WorkspaceCoreModule, ApplicationsModule, DesignSystemModule, AnalyticsModule, NotificationsCoreModule],
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
