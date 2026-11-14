// Workflow stage names and their chip tones, shared by the review pages
export const WORKFLOW_LABELS = {
  draft: 'Draft',
  client_review: 'Client Review',
  client_approved: 'Client Approved',
  art_director_review: 'Art Director Review',
  art_director_approved: 'Art Director Approved',
  ad_changes_requested: 'AD Changes Requested',
  creative_director_review: 'Creative Director Review',
  cd_changes_requested: 'CD Changes Requested',
  approved: 'Approved & Released',
};

// UiChip tones: in review (info), approved along the way (accent), changes requested (warning), released (success)
const WORKFLOW_TONES = {
  draft: 'neutral',
  client_review: 'info',
  client_approved: 'accent',
  art_director_review: 'info',
  art_director_approved: 'accent',
  ad_changes_requested: 'warning',
  creative_director_review: 'info',
  cd_changes_requested: 'warning',
  approved: 'success',
};

export const workflowLabel = (state) => WORKFLOW_LABELS[state] || state;
export const workflowTone = (state) => WORKFLOW_TONES[state] || 'neutral';
