import { Permission } from '../rbac/rbac.service';
import { ActingUser, REVIEW_STAGES, ReviewAction, ReviewDoc, Team, WorkflowState } from './review.types';

/**
 * Who may see and change a review: one policy for every route and for the
 * list (docs/REVIEW_API.md, "Access").
 *
 * - **Review admins** (`review:admin`) may do anything.
 * - The **owner** (the designer: their verified email is `designerEmail`) and
 *   **members of the review's team** see it whatever its sharing and password.
 * - Anyone else signed in sees it only when sharing allows them (`anyone`, or
 *   their email is in `approvedEmails`) and they send the password, if it has one.
 * - Sharing and the password: the owner and review admins only.
 * - Versions, extending, completing and moving or resubmitting the workflow:
 *   the owner, team members other than clients, and review admins.
 * - Approving or rejecting: the role for the current stage (STAGE_ROLES), from
 *   the caller's RBAC roles or their team role, plus `review:approve` /
 *   `review:reject`; or a review admin.
 *
 * Identity is only ever a signed-in user's email. An API key has none, so
 * without `review:admin` it is an outsider (x-user-email is a display label).
 */

/** The role that approves or rejects at each review stage */
export const STAGE_ROLES: Record<(typeof REVIEW_STAGES)[number], string> = {
  client_review: 'client',
  art_director_review: 'art_director',
  creative_director_review: 'creative_director',
};

export interface ReviewAccess {
  admin: boolean;
  owner: boolean;
  /** The caller's role in the review's team ("Art Director" → art_director), or null if not a member */
  teamRole: string | null;
  /** Owner, team member or admin: no sharing or password check */
  privileged: boolean;
  /** May change sharing and the password */
  canManage: boolean;
  /** May add versions, extend, complete and move or resubmit the workflow */
  canContribute: boolean;
  /** RBAC roles plus the team role */
  roles: ReadonlySet<string>;
}

/** Team roles are free text ("Art Director"); RBAC role ids are snake_case */
export function normalizeRole(role: string): string {
  return (role ?? '').trim().toLowerCase().replace(/[\s-]+/g, '_');
}

export function isExpired(doc: Pick<ReviewDoc, 'expiresAt'>, now = Date.now()): boolean {
  return new Date(doc.expiresAt).getTime() <= now;
}

const lower = (value: string | null | undefined) => (value ?? '').trim().toLowerCase();

export function reviewAccess(doc: ReviewDoc, user: ActingUser, team: Team | null): ReviewAccess {
  const email = lower(user.email);
  const admin = !!user.permissions?.has(Permission.REVIEW_ADMIN);
  const owner = !!email && email === lower(doc.designerEmail);
  const member =
    email && team && team.id === doc.teamId ? (team.members ?? []).find((m) => lower(m.email) === email) : undefined;
  const teamRole = member ? normalizeRole(member.role) : null;
  const roles = new Set<string>([...(user.roles ?? []), ...(teamRole ? [teamRole] : [])]);
  return {
    admin,
    owner,
    teamRole,
    privileged: admin || owner || !!member,
    canManage: admin || owner,
    canContribute: admin || owner || (!!member && teamRole !== STAGE_ROLES.client_review),
    roles,
  };
}

/** Sharing alone: `anyone`, or the caller's verified email is the designer's or approved */
export function sharingAllows(doc: ReviewDoc, user: ActingUser): boolean {
  if (doc.sharingMode !== 'approved_emails') return true;
  const email = lower(user.email);
  return !!email && (email === lower(doc.designerEmail) || (doc.approvedEmails ?? []).some((e) => lower(e) === email));
}

/** Whether the caller may approve (or reject) a review at `stage` */
export function canDecide(access: ReviewAccess, user: ActingUser, stage: WorkflowState, decision: 'approve' | 'reject'): boolean {
  if (access.admin) return true;
  const role = STAGE_ROLES[stage as keyof typeof STAGE_ROLES];
  if (!role || !access.roles.has(role)) return false;
  return !!user.permissions?.has(decision === 'approve' ? Permission.REVIEW_APPROVE : Permission.REVIEW_REJECT);
}

/** What the caller may do with the review in its current state */
export function allowedActions(doc: ReviewDoc, access: ReviewAccess, user: ActingUser): ReviewAction[] {
  if (isExpired(doc)) return [];
  const actions: ReviewAction[] = [];
  const state = doc.workflowState;
  if ((REVIEW_STAGES as readonly string[]).includes(state)) {
    if (canDecide(access, user, state, 'approve')) actions.push('approve');
    if (canDecide(access, user, state, 'reject')) actions.push('reject');
  }
  if (access.canContribute) {
    if (state === 'draft' && !doc.bypassClientReview) actions.push('move-to-client-review');
    if (state === 'client_approved' || (state === 'draft' && doc.bypassClientReview)) {
      actions.push('move-to-art-director-review');
    }
    if (state === 'draft') actions.push('resubmit');
    actions.push('upload-version', 'extend', 'complete');
  }
  if (access.canManage) actions.push('manage-sharing', 'manage-password');
  return actions;
}
