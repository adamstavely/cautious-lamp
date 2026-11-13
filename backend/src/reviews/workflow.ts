import { ConflictException } from '@nestjs/common';
import { REVIEW_STAGES, ReviewDoc, WorkflowHistoryEntry, WorkflowState } from './review.types';

export type WorkflowAction =
  | { type: 'move-to-client-review' }
  | { type: 'move-to-art-director-review' }
  | { type: 'approve'; stage: WorkflowState }
  | { type: 'reject'; stage: WorkflowState; reason?: string }
  | { type: 'resubmit'; targetStage: WorkflowState };

const APPROVALS: Partial<Record<WorkflowState, WorkflowState>> = {
  client_review: 'client_approved',
  art_director_review: 'art_director_approved',
  creative_director_review: 'approved',
};

function invalid(from: WorkflowState, what: string): never {
  throw new ConflictException(`Can't ${what} a review in ${from}`);
}

/**
 * The review state machine. Mutates `doc` (state and history) or throws a
 * 409 for a transition that isn't allowed from the current state.
 *
 * - draft → client_review (or → art_director_review when bypassClientReview)
 * - client_review → approve → client_approved, then move → art_director_review
 * - art_director_review → approve → creative_director_review → approve → approved
 * - reject at any review stage → draft
 * - resubmit from draft → targetStage
 */
export function applyWorkflowAction(doc: ReviewDoc, action: WorkflowAction, user: string, now = new Date()): void {
  const from = doc.workflowState;
  const timestamp = now.toISOString();
  const history = (entry: Omit<WorkflowHistoryEntry, 'timestamp'>) => {
    doc.workflowHistory.push({ ...entry, timestamp });
  };

  switch (action.type) {
    case 'move-to-client-review': {
      if (from !== 'draft' || doc.bypassClientReview) invalid(from, 'move to client review');
      doc.workflowState = 'client_review';
      history({ stage: 'client_review', action: 'moved_to_review', user });
      break;
    }
    case 'move-to-art-director-review': {
      const allowed = from === 'client_approved' || (from === 'draft' && doc.bypassClientReview);
      if (!allowed) invalid(from, 'move to art director review');
      doc.workflowState = 'art_director_review';
      history({ stage: 'art_director_review', action: 'moved_to_review', user });
      break;
    }
    case 'approve': {
      const next = APPROVALS[from];
      if (action.stage !== from || !next) invalid(from, `approve ${action.stage}`);
      doc.workflowState = next;
      history({ stage: next, action: 'approved', user });
      if (next === 'art_director_approved') {
        doc.workflowState = 'creative_director_review';
        history({ stage: 'creative_director_review', action: 'moved_to_review', user: 'System' });
      }
      break;
    }
    case 'reject': {
      if (action.stage !== from || !(REVIEW_STAGES as readonly string[]).includes(from)) {
        invalid(from, `reject ${action.stage}`);
      }
      doc.workflowState = 'draft';
      history({ stage: 'draft', action: 'rejected', user, reason: action.reason ?? '' });
      break;
    }
    case 'resubmit': {
      if (from !== 'draft') invalid(from, 'resubmit');
      if (!(REVIEW_STAGES as readonly string[]).includes(action.targetStage)) {
        invalid(from, `resubmit to ${action.targetStage}`);
      }
      doc.workflowState = action.targetStage;
      history({ stage: action.targetStage, action: 'resubmitted', user });
      break;
    }
  }
}
