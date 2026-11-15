import { Inject, Injectable, Logger } from '@nestjs/common';
import { ApplicationDoc } from '../applications/application.types';
import { ApplicationsService } from '../applications/applications.service';
import { AuthPrincipal } from '../auth/principal';
import { Component, DesignSystemService } from '../design-system/design-system.service';
import type { ApplicationScanUsage, ComponentUsageRecorder } from '../governance/sources';
import { DocumentStore, DuplicateDocumentError } from '../reviews/document-store';
import { detectComponents } from './component-detection';
import { COMPONENT_USAGE_STORE, UsageComponentDoc, UsageDoc, UsageScanDoc } from './component-usage.types';
import { ApplicationComponentUsage, UsageState, applicationsUsing, totalUses, usageState } from './usage-model';

export type Timeframe = '7d' | '30d' | '90d' | 'all';

/** Whether any usage has been recorded for the caller's applications, and how much */
export interface UsageSummary {
  usageDataAvailable: boolean;
  /** The caller's applications */
  totalApplications: number;
  /** Of those, the ones a governance scan has recorded usage for */
  scannedApplications: number;
  /** Latest of those scans (ISO), null before any */
  lastScanAt: string | null;
}

export interface ComponentPopularity {
  componentId: string;
  componentName: string;
  status: string;
  totalUsage: number;
  applicationCount: number;
  /** % of scanned applications using it */
  adoptionRate: number;
  /** Change since the start of the timeframe; null for "all" or when nothing was recorded before it */
  trend: 'up' | 'down' | 'stable' | null;
  trendChange: number | null;
}

export interface ApplicationAdoption {
  applicationId: string;
  applicationName: string;
  /** False until a governance scan of the application has recorded usage; the figures are then null */
  scanned: boolean;
  totalComponents: number | null;
  /** Production components it uses */
  designSystemComponents: number | null;
  /** % of production components it uses */
  adoptionRate: number | null;
  lastScanned?: string;
}

export interface UsageTrend {
  date: string;
  totalUsage: number;
  uniqueComponents: number;
  uniqueApplications: number;
}

export interface DesignDebtMetrics {
  usageDataAvailable: boolean;
  deprecatedComponentsInUse: number | null;
  deprecatedInUse: Array<{ componentId: string; componentName: string; usage: number; applicationCount: number }>;
  /** % of recorded component uses that are of deprecated components; null without usage data */
  technicalDebtScore: number | null;
  recommendations: string[];
}

export interface CrossApplicationComparison {
  applicationId: string;
  applicationName: string;
  scanned: boolean;
  componentsUsed: string[];
  uniqueComponents: number | null;
  /** Production components every compared, scanned application uses */
  sharedComponents: string[];
  adoptionRate: number | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_TREND_DAYS = 365;
const round1 = (n: number) => Math.round(n * 10) / 10;
const startOfUtcDay = (at: Date) => new Date(Date.UTC(at.getUTCFullYear(), at.getUTCMonth(), at.getUTCDate()));

/**
 * Component analytics, computed from the usage governance application scans
 * record (ScansService calls recordApplicationScan after storing each
 * application scan). Usage lives in Elasticsearch (COMPONENT_USAGE_STORE),
 * one document per scan and per component it found, so popularity,
 * adoption, trends and comparisons all come from stored scans. Nothing is
 * estimated: before any scan, reports say there is no usage data.
 *
 * Routes pass the caller's visible components (ComponentAccessService) and
 * applications (applicationsVisibleTo), so other workspaces' components and
 * applications appear in no list, count or denominator. Internal callers that
 * pass neither see everything.
 */
@Injectable()
export class AnalyticsService implements ComponentUsageRecorder {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    private readonly designSystemService: DesignSystemService,
    private readonly applications: ApplicationsService,
    @Inject(COMPONENT_USAGE_STORE) private readonly store: DocumentStore<UsageDoc>,
  ) {}

  /**
   * The applications whose usage a principal may see in analytics
   * (docs/WORKSPACES.md, "Analytics"): those without a workspace and those in
   * the caller's workspaces; all of them for `admin:users` and
   * `admin:governance` holders.
   */
  async applicationsVisibleTo(principal: AuthPrincipal): Promise<ApplicationDoc[]> {
    return this.applications.listFor(principal);
  }

  /**
   * Records which design-system components an application scan's code uses.
   * Every scan is recorded, including one that found none, so a component
   * removed from the code stops counting. Idempotent per scan.
   */
  async recordApplicationScan(scan: ApplicationScanUsage): Promise<void> {
    const components = (await this.allComponents()).map((c) => ({ id: c.id, name: c.name }));
    const detected = detectComponents(scan.inputs, components);
    const base = {
      scanId: scan.scanId,
      applicationId: scan.applicationId,
      applicationName: scan.applicationName,
      target: scan.target,
      createdAt: scan.scannedAt,
    };
    const docs: UsageDoc[] = [
      ...detected.map(
        (d): UsageComponentDoc => ({
          ...base,
          id: `${scan.scanId}:${d.componentId}`,
          kind: 'component',
          componentId: d.componentId,
          componentName: d.componentName,
          usageCount: d.usageCount,
        }),
      ),
      // The scan document last: a reader that sees it sees every component it found
      { ...base, id: scan.scanId, kind: 'scan', componentCount: detected.length } as UsageScanDoc,
    ];
    for (const doc of docs) {
      try {
        await this.store.create(doc);
      } catch (error) {
        if (!(error instanceof DuplicateDocumentError)) throw error;
      }
    }
    this.logger.debug(`Recorded ${detected.length} component(s) used by application ${scan.applicationId} (scan ${scan.scanId})`);
  }

  /** Current usage of the given applications (all of them for internal callers) */
  async currentUsage(applications?: Array<Pick<ApplicationDoc, 'id'>>): Promise<UsageState> {
    return usageState(await this.load(applications), { applicationIds: this.idsOf(applications) });
  }

  /** Whether usage has been recorded for the caller's applications */
  async getSummary(applications?: ApplicationDoc[]): Promise<UsageSummary> {
    const apps = applications ?? (await this.applications.list());
    const state = await this.currentUsage(apps);
    const lastScans = [...state.scannedApplications.values()].map((app) => app.lastScan).sort();
    return {
      usageDataAvailable: state.scannedApplications.size > 0,
      totalApplications: apps.length,
      scannedApplications: state.scannedApplications.size,
      lastScanAt: lastScans[lastScans.length - 1] ?? null,
    };
  }

  /**
   * Components by recorded usage. Empty before any scan of the caller's
   * applications; afterwards every visible component, unused ones at 0.
   */
  async getComponentPopularity(timeframe: Timeframe = 'all', components?: Component[], applications?: ApplicationDoc[]): Promise<ComponentPopularity[]> {
    const docs = await this.load(applications);
    const ids = this.idsOf(applications);
    const now = usageState(docs, { applicationIds: ids });
    if (now.scannedApplications.size === 0) return [];
    const cutoff = this.cutoff(timeframe);
    const before = cutoff ? usageState(docs, { applicationIds: ids, asOf: cutoff }) : null;

    return (components ?? (await this.allComponents()))
      .map((component) => {
        const usages = (now.byComponent.get(component.id) ?? []).filter((u) => !cutoff || new Date(u.lastSeen) >= cutoff);
        const totalUsage = usages.reduce((sum, u) => sum + u.usageCount, 0);
        const previous = before ? totalUses(before, component.id) : null;
        let trend: ComponentPopularity['trend'] = null;
        let trendChange: number | null = null;
        if (previous !== null && previous > 0) {
          trendChange = round1(((totalUses(now, component.id) - previous) / previous) * 100);
          trend = trendChange > 5 ? 'up' : trendChange < -5 ? 'down' : 'stable';
        }
        return {
          componentId: component.id,
          componentName: component.name,
          status: component.status,
          totalUsage,
          applicationCount: usages.length,
          adoptionRate: round1((usages.length / now.scannedApplications.size) * 100),
          trend,
          trendChange,
        };
      })
      .sort((a, b) => b.totalUsage - a.totalUsage || a.componentName.localeCompare(b.componentName));
  }

  /** One component's usage per application */
  async getComponentUsageAnalytics(componentId: string, timeframe: Timeframe = 'all', applications?: ApplicationDoc[]) {
    const state = await this.currentUsage(applications);
    const cutoff = this.cutoff(timeframe);
    const usages = (state.byComponent.get(componentId) ?? []).filter((u) => !cutoff || new Date(u.lastSeen) >= cutoff);
    const component = await this.designSystemService.getComponentById(componentId);
    return {
      componentId,
      componentName: component?.name ?? usages[0]?.componentName ?? componentId,
      usageDataAvailable: state.scannedApplications.size > 0,
      totalUsage: usages.reduce((sum, u) => sum + u.usageCount, 0),
      applicationCount: usages.length,
      applications: usages.map((u) => ({
        applicationId: u.applicationId,
        applicationName: u.applicationName,
        usageCount: u.usageCount,
        files: u.targets,
        firstSeen: u.firstSeen,
        lastSeen: u.lastSeen,
      })),
    };
  }

  /** Each application's use of the production components; null figures for applications not scanned yet */
  async getApplicationAdoption(components?: Component[], applications?: ApplicationDoc[]): Promise<ApplicationAdoption[]> {
    const apps = applications ?? (await this.applications.list());
    const visible = components ?? (await this.allComponents());
    const state = await this.currentUsage(apps);
    const used = this.componentsByApplication(state, visible);
    const production = new Set(visible.filter((c) => c.status === 'production').map((c) => c.id));

    return apps.map((app) => {
      const scan = state.scannedApplications.get(app.id);
      if (!scan) return { applicationId: app.id, applicationName: app.name, scanned: false, totalComponents: null, designSystemComponents: null, adoptionRate: null };
      const ids = used.get(app.id) ?? new Set<string>();
      const productionUsed = [...ids].filter((id) => production.has(id)).length;
      return {
        applicationId: app.id,
        applicationName: app.name,
        scanned: true,
        totalComponents: ids.size,
        designSystemComponents: productionUsed,
        adoptionRate: production.size ? round1((productionUsed / production.size) * 100) : null,
        lastScanned: scan.lastScan,
      };
    });
  }

  /**
   * Usage at the end of each UTC day of the last `days` days, from the
   * first day a scan was recorded. Empty before any scan.
   */
  async getUsageTrends(days = 30, components?: Component[], applications?: ApplicationDoc[]): Promise<UsageTrend[]> {
    const span = Number.isFinite(days) && days > 0 ? Math.min(Math.floor(days), MAX_TREND_DAYS) : 30;
    const docs = await this.load(applications);
    const ids = this.idsOf(applications);
    const scans = docs.filter((doc) => doc.kind === 'scan').map((doc) => doc.createdAt).sort();
    if (scans.length === 0) return [];
    const visible = new Set((components ?? (await this.allComponents())).map((c) => c.id));

    const today = startOfUtcDay(new Date());
    const first = startOfUtcDay(new Date(scans[0]));
    const from = new Date(Math.max(first.getTime(), today.getTime() - (span - 1) * DAY_MS));
    const trends: UsageTrend[] = [];
    for (let day = from.getTime(); day <= today.getTime(); day += DAY_MS) {
      const state = usageState(docs, { applicationIds: ids, asOf: new Date(day + DAY_MS - 1) });
      let totalUsage = 0;
      let uniqueComponents = 0;
      for (const [componentId, usages] of state.byComponent) {
        if (!visible.has(componentId)) continue;
        uniqueComponents++;
        totalUsage += usages.reduce((sum, u) => sum + u.usageCount, 0);
      }
      trends.push({
        date: new Date(day).toISOString().slice(0, 10),
        totalUsage,
        uniqueComponents,
        uniqueApplications: applicationsUsing(state, visible).size,
      });
    }
    return trends;
  }

  /** Applications side by side; ids the caller can't see are ignored */
  async getCrossApplicationComparison(applicationIds?: string[], components?: Component[], applications?: ApplicationDoc[]): Promise<CrossApplicationComparison[]> {
    const all = applications ?? (await this.applications.list());
    const compared = applicationIds ? all.filter((app) => applicationIds.includes(app.id)) : all;
    const visible = components ?? (await this.allComponents());
    const state = await this.currentUsage(compared);
    const used = this.componentsByApplication(state, visible);
    const production = visible.filter((c) => c.status === 'production');
    const scanned = compared.filter((app) => state.scannedApplications.has(app.id));
    const shared = scanned.length
      ? production.filter((c) => scanned.every((app) => used.get(app.id)?.has(c.id))).map((c) => c.name)
      : [];

    return compared.map((app) => {
      if (!state.scannedApplications.has(app.id)) {
        return { applicationId: app.id, applicationName: app.name, scanned: false, componentsUsed: [], uniqueComponents: null, sharedComponents: [], adoptionRate: null };
      }
      const ids = [...(used.get(app.id) ?? [])];
      const productionUsed = ids.filter((id) => production.some((c) => c.id === id)).length;
      return {
        applicationId: app.id,
        applicationName: app.name,
        scanned: true,
        componentsUsed: ids,
        uniqueComponents: ids.length,
        sharedComponents: shared,
        adoptionRate: production.length ? round1((productionUsed / production.length) * 100) : null,
      };
    });
  }

  /** Deprecated components still in use, from recorded usage */
  async getDesignDebtMetrics(components?: Component[], applications?: ApplicationDoc[]): Promise<DesignDebtMetrics> {
    const visible = components ?? (await this.allComponents());
    const state = await this.currentUsage(applications);
    if (state.scannedApplications.size === 0) {
      return { usageDataAvailable: false, deprecatedComponentsInUse: null, deprecatedInUse: [], technicalDebtScore: null, recommendations: [] };
    }
    const visibleIds = new Set(visible.map((c) => c.id));
    const allUses = [...state.byComponent.entries()]
      .filter(([id]) => visibleIds.has(id))
      .reduce((sum, [, usages]) => sum + usages.reduce((s, u) => s + u.usageCount, 0), 0);
    const deprecatedInUse = visible
      .filter((c) => c.status === 'deprecated' && state.byComponent.has(c.id))
      .map((c) => ({ componentId: c.id, componentName: c.name, usage: totalUses(state, c.id), applicationCount: state.byComponent.get(c.id)!.length }))
      .sort((a, b) => b.usage - a.usage);
    const deprecatedUses = deprecatedInUse.reduce((sum, d) => sum + d.usage, 0);
    const recommendations = deprecatedInUse.length
      ? [`Replace ${deprecatedInUse.length} deprecated component${deprecatedInUse.length === 1 ? '' : 's'} still in use`]
      : [];
    return {
      usageDataAvailable: true,
      deprecatedComponentsInUse: deprecatedInUse.length,
      deprecatedInUse,
      technicalDebtScore: allUses ? round1((deprecatedUses / allUses) * 100) : 0,
      recommendations,
    };
  }

  // ---------- Internals ----------

  private async allComponents(): Promise<Component[]> {
    // Awaited so this keeps working if the design system's reads become asynchronous
    return (await this.designSystemService.getAllComponents()) ?? [];
  }

  /** Usage documents, limited to `applications` when given */
  private async load(applications?: Array<Pick<ApplicationDoc, 'id'>>): Promise<UsageDoc[]> {
    const docs = await this.store.list();
    const ids = this.idsOf(applications);
    return ids ? docs.filter((doc) => ids.has(doc.applicationId)) : docs;
  }

  private idsOf(applications?: Array<Pick<ApplicationDoc, 'id'>>): ReadonlySet<string> | undefined {
    return applications ? new Set(applications.map((app) => app.id)) : undefined;
  }

  /** The visible components each application uses */
  private componentsByApplication(state: UsageState, components: Component[]): Map<string, Set<string>> {
    const visible = new Set(components.map((c) => c.id));
    const used = new Map<string, Set<string>>();
    for (const [componentId, usages] of state.byComponent) {
      if (!visible.has(componentId)) continue;
      for (const usage of usages as ApplicationComponentUsage[]) {
        if (!used.has(usage.applicationId)) used.set(usage.applicationId, new Set());
        used.get(usage.applicationId)!.add(componentId);
      }
    }
    return used;
  }

  private cutoff(timeframe: Timeframe): Date | null {
    if (timeframe === 'all') return null;
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    return new Date(Date.now() - days * DAY_MS);
  }
}
