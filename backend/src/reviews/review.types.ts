/** Workflow states a review moves through (see docs/REVIEW_API.md) */
export const WORKFLOW_STATES = [
  'draft',
  'client_review',
  'client_approved',
  'art_director_review',
  'art_director_approved',
  'creative_director_review',
  'approved',
] as const;
export type WorkflowState = (typeof WORKFLOW_STATES)[number];

/** States in which a reviewer can approve or reject */
export const REVIEW_STAGES = ['client_review', 'art_director_review', 'creative_director_review'] as const;

export const SHARING_MODES = ['anyone', 'approved_emails'] as const;
export type SharingMode = (typeof SHARING_MODES)[number];

/** Accepted file types and the magic bytes check for each */
export const ALLOWED_FILE_TYPES: Record<string, string> = {
  'application/pdf': 'PDF',
  'image/png': 'PNG',
  'image/jpeg': 'JPEG',
  'image/gif': 'GIF',
  'image/webp': 'WebP',
  'image/svg+xml': 'SVG',
};
export const MAX_FILE_BYTES = 50 * 1024 * 1024;

export const DEFAULT_EXPIRY_DAYS = 30;
export const DAY_MS = 24 * 60 * 60 * 1000;

export interface WorkflowHistoryEntry {
  stage: string;
  action: string;
  user: string;
  timestamp: string;
  reason?: string;
  versionLabel?: string;
  days?: number;
}

export interface ReviewVersion {
  id: string;
  label: string;
  notes: string;
  type: string;
  filename: string;
  contentType: string | null;
  size: number | null;
  uploadedAt: string;
  uploadedBy: string;
  /** External link, url reviews only */
  url?: string;
}

/** A version as stored: `storageId` names the file on disk and never comes from the client */
export interface StoredVersion extends ReviewVersion {
  storageId?: string;
}

export type Reactions = Record<string, string[]>;

export interface Reply {
  id: string;
  text: string;
  author: string;
  authorEmail: string | null;
  timestamp: string;
  reactions: Reactions;
}

export interface Comment {
  id: string;
  text: string;
  author: string;
  authorEmail: string | null;
  version: string | null;
  type: string;
  resolved: boolean;
  annotationId?: string;
  annotationData?: Record<string, unknown>;
  replies: Reply[];
  reactions: Reactions;
  timestamp: string;
}

/** Public review shape */
export interface Review {
  id: string;
  filename: string;
  sourceType: 'upload' | 'url';
  url?: string;
  hasPassword: boolean;
  designer: string;
  designerEmail: string | null;
  teamId: string | null;
  completed: boolean;
  workflowState: WorkflowState;
  workflowHistory: WorkflowHistoryEntry[];
  bypassClientReview: boolean;
  sharingMode: SharingMode;
  approvedEmails: string[];
  versions: ReviewVersion[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  extended: boolean;
  /** What the caller may do now; see REVIEW_ACTIONS */
  allowedActions: ReviewAction[];
}

export type ReviewSummary = Omit<Review, 'comments' | 'workflowHistory'> & {
  /** The last workflow action was a rejection, so the designer has changes to make */
  changesRequested: boolean;
};

/** Review as stored in Elasticsearch. Internal fields never leave the service. */
export interface ReviewDoc extends Omit<Review, 'hasPassword' | 'versions' | 'allowedActions'> {
  passwordHash: string | null;
  versions: StoredVersion[];
  /** Pending one-time upload token (sha256 of the token), cleared once used */
  uploadToken: { hash: string; expiresAt: string } | null;
}

export interface TeamMember {
  email: string;
  name: string;
  role: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  members: TeamMember[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Who is acting (see request-context.ts). Only `email` is identity, and only a
 * signed-in user has one: an API key's `x-user-email` / `x-user-name` are
 * display labels and never satisfy an access check (docs/AUTH.md).
 */
export interface ActingUser {
  /** The signed-in user's verified email, lowercased; null for API keys */
  email: string | null;
  /** Display name recorded on comments and history */
  name: string | null;
  /** RBAC roles (signed-in users only) */
  roles?: readonly string[];
  /** The principal's permissions; `review:admin` makes it a review admin */
  permissions?: ReadonlySet<string>;
}

/**
 * Actions the caller may take on a review right now (`allowedActions` on
 * reviews and summaries). The server enforces the same rules on each route.
 */
export const REVIEW_ACTIONS = [
  'approve',
  'reject',
  'move-to-client-review',
  'move-to-art-director-review',
  'resubmit',
  'upload-version',
  'extend',
  'complete',
  'manage-sharing',
  'manage-password',
] as const;
export type ReviewAction = (typeof REVIEW_ACTIONS)[number];

export function actorLabel(user: ActingUser, fallback = 'Unknown'): string {
  return user.name || user.email || fallback;
}
