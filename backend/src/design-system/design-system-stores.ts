import { ElasticsearchService } from '@nestjs/elasticsearch';
import { EsIndexService } from '../common/elasticsearch/es-index.service';
import { EsDocumentStore } from '../reviews/document-store';
import type { Component, Token } from './design-system.service';

/** Elasticsearch indices and injection tokens for design system storage (EsDocumentStore from the reviews module) */

export const COMPONENTS_INDEX = 'design-system-components';
export const TOKENS_INDEX = 'design-system-tokens';
export const ROADMAP_INDEX = 'design-system-roadmap';
export const BANNERS_INDEX = 'design-system-banners';
export const BUDGETS_INDEX = 'design-system-performance-budgets';
export const ISSUES_INDEX = 'design-system-issues';
export const DESIGN_SYSTEM_META_INDEX = 'design-system-meta';

export const COMPONENT_STORE = Symbol('DESIGN_SYSTEM_COMPONENT_STORE');
export const TOKEN_STORE = Symbol('DESIGN_SYSTEM_TOKEN_STORE');
export const ROADMAP_STORE = Symbol('DESIGN_SYSTEM_ROADMAP_STORE');
export const BANNER_STORE = Symbol('DESIGN_SYSTEM_BANNER_STORE');
export const BUDGET_STORE = Symbol('DESIGN_SYSTEM_BUDGET_STORE');
export const ISSUE_STORE = Symbol('DESIGN_SYSTEM_ISSUE_STORE');
export const DESIGN_SYSTEM_META_STORE = Symbol('DESIGN_SYSTEM_META_STORE');

/**
 * A component as stored: the component plus its place in the list (seeded
 * components keep their original order, new ones go after them) and when it
 * was stored. Both are dropped before a component leaves the service.
 */
export type StoredComponent = Component & { position: number; createdAt: string };

/** A token as stored; its name is its id */
export type StoredToken = Token & { id: string; position: number; createdAt: string };

export type RoadmapCategory = 'feature' | 'improvement' | 'bug-fix' | 'deprecation' | 'integration';
export type RoadmapPriority = 'high' | 'medium' | 'low';
export type RoadmapStatus = 'planned' | 'in-progress' | 'completed' | 'cancelled';

export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  category: RoadmapCategory;
  priority: RoadmapPriority;
  status: RoadmapStatus;
  targetDate?: string;
  createdAt: string;
  updatedAt: string;
  votes?: number;
}

export type BannerType = 'info' | 'warning' | 'error' | 'success';

export interface InfoBanner {
  id: string;
  title: string;
  message: string;
  type: BannerType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface PerformanceBudget {
  id: string;
  name: string;
  metric: string;
  threshold: number;
  unit: string;
  alertThreshold?: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IssueStatus = 'open' | 'investigating' | 'in-progress' | 'resolved' | 'closed';

export interface ComponentIssue {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: IssueSeverity;
  reportedBy: string;
  createdAt: string;
  updatedAt: string;
  status: IssueStatus;
  assignedTo?: string;
  componentId?: string;
  comments: Array<{ id: string; author: string; content: string; createdAt: string }>;
}

/** Marker documents in the meta index (e.g. "the starting components were seeded") */
export interface DesignSystemMetaDoc {
  id: string;
  createdAt: string;
}

const keyword = { type: 'keyword' };
const text = { type: 'keyword', fields: { text: { type: 'text' } } };
const date = { type: 'date' };
const integer = { type: 'integer' };
const bool = { type: 'boolean' };

/** Props, code, variants and the rest stay in `_source` only (the index has `dynamic: false`) */
export const COMPONENT_PROPERTIES = {
  id: keyword,
  name: text,
  status: keyword,
  workspaceId: keyword,
  sharedWith: keyword,
  isGlobal: bool,
  dependencies: keyword,
  position: integer,
  createdAt: date,
  updatedAt: date,
};

export const TOKEN_PROPERTIES = {
  id: keyword,
  name: text,
  type: keyword,
  category: keyword,
  tags: keyword,
  position: integer,
  createdAt: date,
};

export const ROADMAP_PROPERTIES = {
  id: keyword,
  title: text,
  category: keyword,
  priority: keyword,
  status: keyword,
  targetDate: keyword,
  createdAt: date,
  updatedAt: date,
};

export const BANNER_PROPERTIES = {
  id: keyword,
  title: text,
  type: keyword,
  isActive: bool,
  createdAt: date,
  updatedAt: date,
  expiresAt: date,
};

export const BUDGET_PROPERTIES = {
  id: keyword,
  name: text,
  metric: keyword,
  enabled: bool,
  createdAt: date,
  updatedAt: date,
};

export const ISSUE_PROPERTIES = {
  id: keyword,
  title: text,
  category: keyword,
  severity: keyword,
  status: keyword,
  componentId: keyword,
  reportedBy: keyword,
  assignedTo: keyword,
  createdAt: date,
  updatedAt: date,
};

export const DESIGN_SYSTEM_META_PROPERTIES = {
  id: keyword,
  createdAt: date,
};

const esStore = (index: string, properties: Record<string, unknown>) => ({
  inject: [ElasticsearchService, EsIndexService],
  useFactory: (es: ElasticsearchService, esIndex: EsIndexService) => new EsDocumentStore(es, esIndex, index, properties),
});

/** The design system module's Elasticsearch stores */
export const DESIGN_SYSTEM_STORE_PROVIDERS = [
  { provide: COMPONENT_STORE, ...esStore(COMPONENTS_INDEX, COMPONENT_PROPERTIES) },
  { provide: TOKEN_STORE, ...esStore(TOKENS_INDEX, TOKEN_PROPERTIES) },
  { provide: ROADMAP_STORE, ...esStore(ROADMAP_INDEX, ROADMAP_PROPERTIES) },
  { provide: BANNER_STORE, ...esStore(BANNERS_INDEX, BANNER_PROPERTIES) },
  { provide: BUDGET_STORE, ...esStore(BUDGETS_INDEX, BUDGET_PROPERTIES) },
  { provide: ISSUE_STORE, ...esStore(ISSUES_INDEX, ISSUE_PROPERTIES) },
  { provide: DESIGN_SYSTEM_META_STORE, ...esStore(DESIGN_SYSTEM_META_INDEX, DESIGN_SYSTEM_META_PROPERTIES) },
];
