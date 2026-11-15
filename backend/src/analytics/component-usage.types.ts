/**
 * Component usage recorded by governance application scans, one document per
 * scan (`kind: 'scan'`) plus one per component the scan found (`kind:
 * 'component'`). Every figure analytics reports is computed from these.
 */

export const COMPONENT_USAGE_INDEX = 'design-system-component-usage';
export const COMPONENT_USAGE_STORE = Symbol('COMPONENT_USAGE_STORE');

interface UsageDocBase {
  id: string;
  /** The governance scan that recorded it */
  scanId: string;
  applicationId: string;
  applicationName: string;
  /**
   * What the scan looked at: `codebase:<file>` or `url:<url>`. An
   * application's current usage is the latest scan of each target, so
   * scanning one file doesn't erase what another file's scan found.
   */
  target: string;
  /** When the scan ran (ISO) */
  createdAt: string;
}

/** One application scan, whether or not it found any components */
export interface UsageScanDoc extends UsageDocBase {
  kind: 'scan';
  componentCount: number;
}

/** One design-system component found by one scan */
export interface UsageComponentDoc extends UsageDocBase {
  kind: 'component';
  componentId: string;
  componentName: string;
  /** Times the component appears in the scanned code (at least 1 when it is only imported) */
  usageCount: number;
}

export type UsageDoc = UsageScanDoc | UsageComponentDoc;

const keyword = { type: 'keyword' };

export const COMPONENT_USAGE_PROPERTIES = {
  id: keyword,
  kind: keyword,
  scanId: keyword,
  applicationId: keyword,
  target: keyword,
  componentId: keyword,
  usageCount: { type: 'integer' },
  createdAt: { type: 'date' },
};
