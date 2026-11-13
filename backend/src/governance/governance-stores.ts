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
