/** Elasticsearch indices and injection tokens for governance storage (EsDocumentStore from the reviews module) */

export const RULES_INDEX = 'design-system-governance-rules';
export const SCANS_INDEX = 'design-system-governance-scans';
export const META_INDEX = 'design-system-governance-meta';

export const RULE_STORE = Symbol('GOVERNANCE_RULE_STORE');
export const SCAN_STORE = Symbol('GOVERNANCE_SCAN_STORE');
export const META_STORE = Symbol('GOVERNANCE_META_STORE');

/** Marker documents in the meta index (e.g. "built-in rules were seeded") */
export interface MetaDoc {
  id: string;
  createdAt: string;
  value?: string;
  /**
   * Scheduled-scan occurrences (`scheduled-scan:<applicationId>`, value =
   * the period): claimed (running until leaseUntil), retry (failed, next
   * attempt at retryAt), completed, or dead-letter (failed every attempt).
   * Markers written before states existed have only lastStatus.
   */
  state?: 'claimed' | 'retry' | 'completed' | 'dead-letter';
  attempts?: number;
  /** The claiming run; a run whose lease was taken over can't complete the occurrence */
  token?: string;
  leaseUntil?: string;
  retryAt?: string;
  lastStatus?: 'running' | 'success' | 'failed';
  lastError?: string;
  lastScanId?: string;
  /** Periods given up after the last attempt, newest first (at most 10) */
  deadLetters?: Array<{ period: string; attempts: number; error: string; at: string }>;
  updatedAt?: string;
}

const keyword = { type: 'keyword' };
const date = { type: 'date' };

export const RULE_PROPERTIES = {
  id: keyword,
  name: { type: 'keyword', fields: { text: { type: 'text' } } },
  category: keyword,
  severity: keyword,
  type: keyword,
  target: keyword,
  enabled: { type: 'boolean' },
  builtIn: { type: 'boolean' },
  version: { type: 'integer' },
  createdAt: date,
  updatedAt: date,
};

export const SCAN_PROPERTIES = {
  id: keyword,
  scope: keyword,
  source: keyword,
  applicationId: keyword,
  createdAt: date,
};

export const META_PROPERTIES = {
  id: keyword,
  createdAt: date,
};
