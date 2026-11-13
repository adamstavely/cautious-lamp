import { ConflictException } from '@nestjs/common';
import { ReviewDoc, WORKFLOW_STATES, WorkflowState } from './review.types';
import { WorkflowAction, applyWorkflowAction } from './workflow';

function doc(workflowState: WorkflowState, bypassClientReview = false): ReviewDoc {
  return { workflowState, bypassClientReview, workflowHistory: [] } as unknown as ReviewDoc;
}

/** [from, action, to, bypassClientReview required (undefined: either)] */
const valid: Array<[WorkflowState, WorkflowAction, WorkflowState, boolean?]> = [
  ['draft', { type: 'move-to-client-review' }, 'client_review', false],
  ['draft', { type: 'move-to-art-director-review' }, 'art_director_review', true],
  ['client_review', { type: 'approve', stage: 'client_review' }, 'client_approved'],
  ['client_approved', { type: 'move-to-art-director-review' }, 'art_director_review'],
  ['art_director_review', { type: 'approve', stage: 'art_director_review' }, 'creative_director_review'],
  ['creative_director_review', { type: 'approve', stage: 'creative_director_review' }, 'approved'],
  ['client_review', { type: 'reject', stage: 'client_review' }, 'draft'],
  ['art_director_review', { type: 'reject', stage: 'art_director_review' }, 'draft'],
  ['creative_director_review', { type: 'reject', stage: 'creative_director_review' }, 'draft'],
  ['draft', { type: 'resubmit', targetStage: 'client_review' }, 'client_review'],
  ['draft', { type: 'resubmit', targetStage: 'art_director_review' }, 'art_director_review'],
  ['draft', { type: 'resubmit', targetStage: 'creative_director_review' }, 'creative_director_review'],
];

describe('applyWorkflowAction', () => {
  // Rest args: some rows omit the last element, and Jest would take a 4th parameter for `done`
  it.each(valid)('%s + %o → %s', (...row) => {
    const [from, action, to, bypass] = row;
    const review = doc(from, bypass ?? false);
    applyWorkflowAction(review, action, 'Pat');
    expect(review.workflowState).toBe(to);
    expect(review.workflowHistory.length).toBeGreaterThan(0);
    expect(review.workflowHistory[0].user).toBe('Pat');
  });

  it('rejects every other transition with 409', () => {
    const actions: WorkflowAction[] = [
      { type: 'move-to-client-review' },
      { type: 'move-to-art-director-review' },
      ...WORKFLOW_STATES.map((stage) => ({ type: 'approve', stage }) as WorkflowAction),
      ...WORKFLOW_STATES.map((stage) => ({ type: 'reject', stage }) as WorkflowAction),
      ...WORKFLOW_STATES.map((targetStage) => ({ type: 'resubmit', targetStage }) as WorkflowAction),
    ];
    let rejected = 0;
    for (const from of WORKFLOW_STATES) {
      for (const bypass of [false, true]) {
        for (const action of actions) {
          const isValid = valid.some(
            ([f, a, , needs]) =>
              f === from && JSON.stringify(a) === JSON.stringify(action) && (needs === undefined || needs === bypass),
          );
          const review = doc(from, bypass);
          if (isValid) {
            expect(() => applyWorkflowAction(review, action, 'Pat')).not.toThrow();
          } else {
            expect(() => applyWorkflowAction(review, action, 'Pat')).toThrow(ConflictException);
            expect(review.workflowState).toBe(from);
            expect(review.workflowHistory).toEqual([]);
            rejected++;
          }
        }
      }
    }
    expect(rejected).toBeGreaterThan(100);
  });

  it('records the reason on rejection', () => {
    const review = doc('art_director_review');
    applyWorkflowAction(review, { type: 'reject', stage: 'art_director_review', reason: 'Kerning' }, 'AD');
    expect(review.workflowHistory).toEqual([
      expect.objectContaining({ stage: 'draft', action: 'rejected', user: 'AD', reason: 'Kerning' }),
    ]);
  });
});
