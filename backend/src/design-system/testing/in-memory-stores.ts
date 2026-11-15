import { InMemoryStore } from '../../reviews/testing/in-memory-store';
import {
  BANNER_STORE,
  BUDGET_STORE,
  COMPONENT_STORE,
  ComponentIssue,
  DESIGN_SYSTEM_META_STORE,
  DesignSystemMetaDoc,
  ISSUE_STORE,
  InfoBanner,
  PerformanceBudget,
  ROADMAP_STORE,
  RoadmapItem,
  StoredComponent,
  StoredToken,
  TOKEN_STORE,
} from '../design-system-stores';
import { DesignSystemService } from '../design-system.service';

/** In-memory stand-ins for the design system's Elasticsearch indices */
export function createDesignSystemStores() {
  return {
    components: new InMemoryStore<StoredComponent>(),
    tokens: new InMemoryStore<StoredToken>(),
    meta: new InMemoryStore<DesignSystemMetaDoc>(),
    roadmap: new InMemoryStore<RoadmapItem>(),
    banners: new InMemoryStore<InfoBanner>(),
    budgets: new InMemoryStore<PerformanceBudget>(),
    issues: new InMemoryStore<ComponentIssue>(),
  };
}

export type DesignSystemStores = ReturnType<typeof createDesignSystemStores>;

/** Nest providers for every design system store, backed by `stores` (fresh ones by default) */
export function designSystemStoreProviders(stores: DesignSystemStores = createDesignSystemStores()) {
  return [
    { provide: COMPONENT_STORE, useValue: stores.components },
    { provide: TOKEN_STORE, useValue: stores.tokens },
    { provide: DESIGN_SYSTEM_META_STORE, useValue: stores.meta },
    { provide: ROADMAP_STORE, useValue: stores.roadmap },
    { provide: BANNER_STORE, useValue: stores.banners },
    { provide: BUDGET_STORE, useValue: stores.budgets },
    { provide: ISSUE_STORE, useValue: stores.issues },
  ];
}

/** A loaded DesignSystemService over in-memory stores, as on a started server */
export async function createDesignSystemService(stores: DesignSystemStores = createDesignSystemStores()): Promise<DesignSystemService> {
  const service = new DesignSystemService(stores.components, stores.tokens, stores.meta, stores.roadmap, stores.banners, stores.budgets);
  await service.onModuleInit();
  return service;
}
