/**
 * Helpers shared by the workspace and application pages. Styling comes from
 * the tokens and src/components/ui; these only map data to a UiChip/UiStat tone.
 */

/** UiChip tone for a workspace role */
export const roleTone = (role) => ({ owner: 'accent', admin: 'info', editor: 'success' })[role] ?? 'neutral';

/** UiStat tone for a 0–100 health score (neutral when there is none) */
export const healthTone = (score) => {
  if (score === null || score === undefined) return 'neutral';
  if (score >= 80) return 'success';
  if (score >= 60) return 'warning';
  return 'danger';
};

const RANK = { owner: 4, admin: 3, editor: 2, viewer: 1 };

/** Whether a workspace's effectiveRole (from the API) is at least `role` */
export const atLeast = (effectiveRole, role) => (RANK[effectiveRole] ?? 0) >= RANK[role];

export const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '');
