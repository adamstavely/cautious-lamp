/**
 * Release notes built from the design-system changelog (`/api/v1/changelog/entries`).
 * Changes recorded with a version are grouped by that version, newest release
 * first (by its latest change); changes without a version are left out, since
 * they belong to no release.
 */

const TYPE_LABELS = {
  component: 'Component',
  token: 'Token',
  pattern: 'Pattern',
  workspace: 'Workspace',
  application: 'Application',
  system: 'System',
};

/** One line per change, e.g. "Component Button: added loading state" */
export function describeEntry(entry) {
  const label = `${TYPE_LABELS[entry.type] ?? 'Item'} ${entry.entityName}`;
  const details = (entry.changes ?? []).map((change) => change.description).filter(Boolean);
  if (details.length) return `${label}: ${details.join('; ')}`;
  const verbs = { created: 'added', updated: 'updated', deprecated: 'deprecated', deleted: 'removed', 'status-changed': 'status changed' };
  return `${label} ${verbs[entry.action] ?? entry.action}`;
}

/** Which release-notes group an entry belongs to; breaking changes first */
function groupOf(entry) {
  if (entry.breaking) return 'breaking';
  if (entry.action === 'created') return 'features';
  if (entry.action === 'deprecated' || entry.action === 'deleted') return 'deprecations';
  return 'improvements';
}

export function buildReleaseNotes(entries = []) {
  const releases = new Map();
  for (const entry of entries) {
    if (!entry?.version) continue;
    let release = releases.get(entry.version);
    if (!release) {
      release = { version: entry.version, date: entry.createdAt, breaking: [], features: [], improvements: [], deprecations: [], count: 0 };
      releases.set(entry.version, release);
    }
    if (entry.createdAt > release.date) release.date = entry.createdAt;
    release[groupOf(entry)].push({ id: entry.id, text: describeEntry(entry), link: entry.link });
    release.count += 1;
  }
  return [...releases.values()].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}
