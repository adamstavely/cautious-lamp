import { UsageComponentDoc, UsageDoc, UsageScanDoc } from './component-usage.types';

/** One component's current usage in one application */
export interface ApplicationComponentUsage {
  componentId: string;
  componentName: string;
  applicationId: string;
  applicationName: string;
  usageCount: number;
  /** The scan targets (files or URLs) it was found in */
  targets: string[];
  /** First scan that found it in this application */
  firstSeen: string;
  /** Latest scan that found it */
  lastSeen: string;
}

/** Usage as the stored scans describe it at one moment */
export interface UsageState {
  /** Applications with at least one recorded scan, with their latest scan time */
  scannedApplications: Map<string, { applicationName: string; lastScan: string }>;
  /** componentId -> usage per application */
  byComponent: Map<string, ApplicationComponentUsage[]>;
}

/**
 * The usage the stored scans describe as of `asOf` (default: now), limited to
 * `applicationIds` when given. An application's usage is what the latest scan
 * of each of its targets found: a component that a later scan of the same
 * file no longer finds stops counting.
 */
export function usageState(docs: UsageDoc[], options: { asOf?: Date; applicationIds?: ReadonlySet<string> } = {}): UsageState {
  const asOf = options.asOf?.getTime() ?? Infinity;
  const included = docs.filter(
    (doc) => new Date(doc.createdAt).getTime() <= asOf && (!options.applicationIds || options.applicationIds.has(doc.applicationId)),
  );

  const latestScan = new Map<string, UsageScanDoc>();
  const scannedApplications = new Map<string, { applicationName: string; lastScan: string }>();
  const firstSeen = new Map<string, string>();
  for (const doc of included) {
    if (doc.kind === 'scan') {
      const key = `${doc.applicationId}\u0000${doc.target}`;
      const current = latestScan.get(key);
      if (!current || doc.createdAt > current.createdAt || (doc.createdAt === current.createdAt && doc.scanId > current.scanId)) latestScan.set(key, doc);
      const app = scannedApplications.get(doc.applicationId);
      if (!app || doc.createdAt > app.lastScan) scannedApplications.set(doc.applicationId, { applicationName: doc.applicationName, lastScan: doc.createdAt });
    } else {
      const key = `${doc.applicationId}\u0000${doc.componentId}`;
      const seen = firstSeen.get(key);
      if (!seen || doc.createdAt < seen) firstSeen.set(key, doc.createdAt);
    }
  }

  const currentScans = new Set([...latestScan.values()].map((scan) => scan.scanId));
  const perAppComponent = new Map<string, ApplicationComponentUsage>();
  for (const doc of included) {
    if (doc.kind !== 'component' || !currentScans.has(doc.scanId)) continue;
    const key = `${doc.applicationId}\u0000${doc.componentId}`;
    const existing = perAppComponent.get(key);
    if (existing) {
      existing.usageCount += doc.usageCount;
      if (!existing.targets.includes(doc.target)) existing.targets.push(doc.target);
      if (doc.createdAt > existing.lastSeen) existing.lastSeen = doc.createdAt;
    } else {
      perAppComponent.set(key, fromDoc(doc, firstSeen.get(key) ?? doc.createdAt));
    }
  }

  const byComponent = new Map<string, ApplicationComponentUsage[]>();
  for (const usage of perAppComponent.values()) {
    if (!byComponent.has(usage.componentId)) byComponent.set(usage.componentId, []);
    byComponent.get(usage.componentId)!.push(usage);
  }
  return { scannedApplications, byComponent };
}

function fromDoc(doc: UsageComponentDoc, firstSeen: string): ApplicationComponentUsage {
  return {
    componentId: doc.componentId,
    componentName: doc.componentName,
    applicationId: doc.applicationId,
    applicationName: doc.applicationName,
    usageCount: doc.usageCount,
    targets: [doc.target],
    firstSeen,
    lastSeen: doc.createdAt,
  };
}

/** Total uses of a component across the applications in a state */
export const totalUses = (state: UsageState, componentId: string) =>
  (state.byComponent.get(componentId) ?? []).reduce((sum, usage) => sum + usage.usageCount, 0);

/** Applications in a state that use at least one of `componentIds` */
export function applicationsUsing(state: UsageState, componentIds: ReadonlySet<string>): Set<string> {
  const apps = new Set<string>();
  for (const [componentId, usages] of state.byComponent) {
    if (componentIds.has(componentId)) usages.forEach((usage) => apps.add(usage.applicationId));
  }
  return apps;
}
