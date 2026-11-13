import { Actor } from '../workspaces/workspace.types';

export const APPLICATIONS_INDEX = 'design-system-applications';
export const APPLICATION_STORE = Symbol('APPLICATION_STORE');

export const SCAN_SCHEDULES = ['manual', 'daily', 'weekly', 'on-commit'] as const;
export type ScanSchedule = (typeof SCAN_SCHEDULES)[number];
export const CAPABILITY_NAMES = ['governance', 'visualRegression', 'sessionReplay'] as const;
export type CapabilityName = (typeof CAPABILITY_NAMES)[number];
export const ENVIRONMENTS = ['development', 'staging', 'production'] as const;

export interface ApplicationCapabilities {
  governance: {
    enabled: boolean;
    /** Empty means every enabled rule */
    /** Governance rule ids (GET /governance/rules); empty means every enabled rule */
    rules: string[];
    scanSchedule: ScanSchedule;
    lastScan?: string;
  };
  visualRegression: {
    enabled: boolean;
    /** Our visual-regression project, created by the server */
    projectId?: string;
    argosProjectId?: string;
    argosBaseUrl?: string;
    argosBranch?: string;
    lastRun?: string;
  };
  sessionReplay: {
    enabled: boolean;
    /** Our session-replay project, created by the server */
    projectId?: string;
    openreplayProjectKey?: string;
    openreplayBaseUrl?: string;
    privacySettings?: {
      maskAllInputs?: boolean;
      maskAllText?: boolean;
      respectDoNotTrack?: boolean;
    };
  };
}

export interface ApplicationMetadata {
  environment?: (typeof ENVIRONMENTS)[number];
  framework?: string;
  language?: string;
  tags?: string[];
}

/** As stored in design-system-applications and returned by the API */
export interface ApplicationDoc {
  id: string;
  name: string;
  description: string;
  repository?: string;
  version?: string;
  /** Design system version the application uses (semver) */
  designSystemVersion?: string;
  applicationUrl?: string;
  /** Team that owns the visual-regression and session-replay projects */
  teamId?: string;
  /** Owning workspace; its admins can change the application */
  workspaceId: string | null;
  registeredAt: string;
  updatedAt: string;
  lastScanned?: string;
  registeredBy: Actor;
  updatedBy: Actor;
  capabilities: ApplicationCapabilities;
  metadata: ApplicationMetadata;
}

const keyword = { type: 'keyword' };
const date = { type: 'date' };

export const APPLICATION_PROPERTIES = {
  id: keyword,
  name: { type: 'keyword', fields: { text: { type: 'text' } } },
  workspaceId: keyword,
  teamId: keyword,
  designSystemVersion: keyword,
  registeredAt: date,
  updatedAt: date,
  // EsDocumentStore sorts lists by createdAt; applications sort by registeredAt in the service
  createdAt: date,
};
