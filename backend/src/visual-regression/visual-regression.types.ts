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

/**
 * A run accepted as what later builds are compared against. Baselines are
 * versions: recording one makes it current and keeps the earlier ones, and a
 * rollback makes an earlier one current again. The current baseline's commit
 * is the `--reference-commit` of the project's CI upload (see ci-setup.ts).
 */
export interface Baseline {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  runId: string;
  /** From the run's Argos build */
  argosBuildNumber?: number;
  commitSha?: string;
  branch?: string;
  createdAt: string;
  createdBy: string;
}

/** Changes of the current baseline, oldest first */
export interface BaselineEvent {
  baselineId: string;
  action: 'created' | 'rolled-back';
  /** The baseline that was current before */
  previousBaselineId?: string;
  at: string;
  by: string;
}

export type NotificationType = 'email' | 'slack' | 'teams' | 'webhook';

/**
 * Where a project's build results are sent (VisualRegressionNotifier). The
 * URL and secret are encrypted at rest and never returned.
 */
export interface NotificationEntry {
  type: NotificationType;
  enabled: boolean;
  /** Email: who gets it */
  recipients?: string[];
  /** Slack, Teams and webhook: the incoming-webhook URL (encrypted) */
  url?: string;
  /** Webhook: signs each delivery with HMAC-SHA256 (encrypted) */
  secret?: string;
  savedAt?: string;
  /** Saved before delivery existed and never read; re-save the channel to use it */
  config?: NotificationConfig;
}

/** A project's notification channel as the API returns it: no URL, no secret */
export interface NotificationChannelView {
  type: NotificationType;
  enabled: boolean;
  /** Has what it needs to send: recipients for email, a URL otherwise */
  configured: boolean;
  recipients?: string[];
  hasSecret?: boolean;
  savedAt?: string;
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
  /** Whether build notifications can be accepted (the secret itself is never returned) */
  hasWebhookSecret?: boolean;
  /** The baseline builds are compared against; none means the project's branch */
  currentBaselineId?: string;
}

/** As stored in design-system-visual-regression-projects */
export interface ProjectDoc extends Project {
  /** Encrypted at rest */
  argosToken?: string;
  /** Encrypted at rest; signs Argos webhooks */
  webhookSecret?: string;
  baselines: Baseline[];
  baselineHistory?: BaselineEvent[];
  notifications: NotificationEntry[];
}

export type RunStatus = 'pending' | 'running' | 'completed' | 'failed';

/**
 * One Argos build. Runs aren't started here: CI uploads screenshots to Argos
 * and the build is read back (on listing runs, or when CI posts a build notification).
 */
export interface TestRun {
  id: string;
  projectId: string;
  argosBuildId?: string;
  argosBuildNumber?: number;
  /** Argos's own status, e.g. changes-detected, accepted, rejected */
  argosStatus?: string;
  /** The build's page in Argos */
  argosUrl?: string;
  status: RunStatus;
  commitSha?: string;
  branch?: string;
  triggeredBy: string;
  /** When the test suite started (from the build's test report), else when the build was first seen here */
  startedAt?: string;
  completedAt?: string;
  /** The test suite's duration, from the build's test report */
  durationMs?: number;
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
  /** When build notifications were sent for this run; they go out once */
  notifiedAt?: string;
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
