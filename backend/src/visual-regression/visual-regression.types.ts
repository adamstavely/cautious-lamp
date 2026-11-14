import { NotificationConfig } from '../common/types/common.types';
import { ProjectOwnership } from './project-access';

export const VR_PROJECTS_INDEX = 'design-system-visual-regression-projects';
export const VR_RUNS_INDEX = 'design-system-visual-regression-runs';
export const VR_PROJECT_STORE = Symbol('VR_PROJECT_STORE');
export const VR_RUN_STORE = Symbol('VR_RUN_STORE');

export interface ProjectConfig {
  testDirectories?: string[];
  viewports?: string[];
  browsers?: string[];
  ignorePatterns?: string[];
  screenshotOptions?: {
    fullPage?: boolean;
    waitForSelector?: string;
    waitForTimeout?: number;
  };
}

export interface Baseline {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  runId: string;
  createdAt: string;
  createdBy: string;
}

export type NotificationType = 'email' | 'slack' | 'teams' | 'webhook';

export interface NotificationEntry {
  type: NotificationType;
  config: NotificationConfig;
  enabled: boolean;
}

/** A project as returned by the API: no Argos token or webhook secret */
export interface Project extends ProjectOwnership {
  id: string;
  /** Free-form label kept for display; access comes from `workspaceId` (see ProjectOwnership) */
  teamId: string;
  name: string;
  description?: string;
  argosProjectId: string;
  argosBaseUrl?: string;
  argosBranch: string;
  config: ProjectConfig;
  createdAt: string;
  updatedAt: string;
}

/** As stored in design-system-visual-regression-projects */
export interface ProjectDoc extends Project {
  /** Encrypted at rest */
  argosToken?: string;
  /** Encrypted at rest; signs Argos webhooks */
  webhookSecret?: string;
  baselines: Baseline[];
  notifications: NotificationEntry[];
}

export type RunStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface TestRun {
  id: string;
  projectId: string;
  argosBuildId?: string;
  status: RunStatus;
  commitSha?: string;
  branch?: string;
  triggeredBy: string;
  startedAt?: string;
  completedAt?: string;
  resultsSummary?: {
    total: number;
    passed: number;
    failed: number;
    new: number;
    removed: number;
  };
}

export interface TestResult {
  id: string;
  runId: string;
  /** The Argos screenshot this result came from */
  argosScreenshotId?: string;
  testName: string;
  status: 'passed' | 'failed' | 'new' | 'removed';
  diffImageUrl?: string;
  baselineImageUrl?: string;
  currentImageUrl?: string;
  diffPercentage?: number;
  approved: boolean;
  approvedBy?: string;
  approvedAt?: string;
}

/** As stored in design-system-visual-regression-runs: the run with its results */
export interface TestRunDoc extends TestRun {
  results: TestResult[];
  /** Denormalized from results for term queries */
  resultIds: string[];
  /** For the store's default sort */
  createdAt: string;
}

const keyword = { type: 'keyword' };
const date = { type: 'date' };

export const VR_PROJECT_PROPERTIES = {
  id: keyword,
  name: { type: 'keyword', fields: { text: { type: 'text' } } },
  teamId: keyword,
  workspaceId: keyword,
  applicationId: keyword,
  createdBy: { properties: { type: keyword, id: keyword } },
  argosProjectId: keyword,
  createdAt: date,
  updatedAt: date,
};

export const VR_RUN_PROPERTIES = {
  id: keyword,
  projectId: keyword,
  argosBuildId: keyword,
  resultIds: keyword,
  status: keyword,
  startedAt: date,
  completedAt: date,
  createdAt: date,
};
