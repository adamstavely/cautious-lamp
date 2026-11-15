import { ref } from 'vue';
import apiClient, { apiErrorMessage } from '../services/api.js';
import { compareVersions } from '../utils/semver.js';

/** How each recorded action reads in a version's changelog */
const CHANGE_TYPES = { created: 'added', updated: 'changed', deprecated: 'deprecated', deleted: 'removed', 'status-changed': 'changed' };
const ACTION_WORDS = { created: 'Added', updated: 'Updated', deprecated: 'Deprecated', deleted: 'Removed', 'status-changed': 'Status changed' };

/** The lines a changelog entry adds to its version: one per recorded change, or one for the action */
const changesOf = (entry) => {
  const type = entry.breaking ? 'breaking' : CHANGE_TYPES[entry.action] || 'changed';
  const described = (entry.changes || []).filter((change) => change.description || change.field);
  if (!described.length) return [{ type, description: `${ACTION_WORDS[entry.action] || 'Changed'} ${entry.entityName}` }];
  return described.map((change) => ({ type, description: change.description || `${change.field} changed` }));
};

/**
 * A component's version history from its changelog entries
 * (GET /api/v1/changelog/components/:id): entries recorded with a version are
 * grouped into that version, newest version first; the newest is "Current".
 * Entries without a version are returned apart, newest first.
 */
export function versionsFromChangelog(entries = []) {
  const byVersion = new Map();
  const unversioned = [];
  for (const entry of entries) {
    if (!entry.version) {
      unversioned.push({ id: entry.id, createdAt: entry.createdAt, author: entry.author, breaking: !!entry.breaking, changes: changesOf(entry) });
      continue;
    }
    const group = byVersion.get(entry.version) ?? { version: entry.version, entries: [] };
    group.entries.push(entry);
    byVersion.set(entry.version, group);
  }

  const versions = [...byVersion.values()]
    .map(({ version, entries: inVersion }) => {
      const times = inVersion.map((e) => e.createdAt).sort();
      const changelog = [...inVersion].sort((a, b) => a.createdAt.localeCompare(b.createdAt)).flatMap(changesOf);
      return {
        version,
        releasedAt: times[0],
        lastUpdated: times.length > 1 && times[times.length - 1] !== times[0] ? times[times.length - 1] : null,
        breaking: inVersion.some((e) => e.breaking),
        description: `${changelog.length} ${changelog.length === 1 ? 'change' : 'changes'}${inVersion[0].author ? `, recorded by ${[...new Set(inVersion.map((e) => e.author).filter(Boolean))].join(', ')}` : ''}`,
        changelog,
      };
    })
    .sort((a, b) => compareVersions(b.version, a.version) || b.releasedAt.localeCompare(a.releasedAt))
    .map((version, index) => ({ ...version, status: index === 0 ? 'Current' : 'Earlier' }));

  unversioned.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return { versions, unversioned };
}

/** A component's recorded version history, loaded from the design-system changelog */
export function useComponentChangelog(componentId) {
  const versions = ref([]);
  const unversioned = ref([]);
  const loading = ref(false);
  const loaded = ref(false);
  const error = ref('');

  const load = async () => {
    if (!componentId) return;
    loading.value = true;
    error.value = '';
    try {
      const { data } = await apiClient.get(`/api/v1/changelog/components/${encodeURIComponent(componentId)}`);
      const history = versionsFromChangelog(Array.isArray(data) ? data : []);
      versions.value = history.versions;
      unversioned.value = history.unversioned;
      loaded.value = true;
    } catch (err) {
      error.value = apiErrorMessage(err, "The component's changelog couldn't be loaded.");
    } finally {
      loading.value = false;
    }
  };

  load();
  return { versions, unversioned, loading, loaded, error, load };
}
