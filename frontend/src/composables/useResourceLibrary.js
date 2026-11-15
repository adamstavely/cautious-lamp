import { computed, ref, unref } from 'vue';
import apiClient, { apiErrorMessage } from '../services/api.js';
import { atLeast } from '../components/workspaces/ui.js';

/**
 * One kind of workspace item across every workspace the user can read, for
 * the library pages (journey maps, flags, seals, …): `GET /api/v1/resources/:kind`
 * (docs/WORKSPACES.md, "The library"), plus the user's workspaces for names
 * and roles. Writes go through the owning workspace's item routes, so the
 * server checks the editor role there.
 *
 * Errors are kept in `error` (a message) and re-thrown from the write helpers
 * as Errors with a readable message, so callers can keep a form open.
 */
export function useResourceLibrary(kind) {
  const items = ref([]);
  const workspaces = ref([]);
  const loading = ref(false);
  const loaded = ref(false);
  const error = ref(null);
  let requestSeq = 0;

  const itemBase = (workspaceId) =>
    `/api/v1/workspaces/${encodeURIComponent(workspaceId)}/resources/${encodeURIComponent(unref(kind))}`;

  const load = async () => {
    const seq = ++requestSeq;
    loading.value = true;
    error.value = null;
    try {
      const [library, mine] = await Promise.all([
        apiClient.get(`/api/v1/resources/${encodeURIComponent(unref(kind))}`),
        // Names and roles only; without them items still show, just read-only
        apiClient.get('/api/v1/workspaces').catch(() => ({ data: [] })),
      ]);
      if (seq !== requestSeq) return;
      items.value = Array.isArray(library.data) ? library.data : [];
      workspaces.value = Array.isArray(mine.data) ? mine.data : [];
      loaded.value = true;
    } catch (err) {
      if (seq !== requestSeq) return;
      items.value = [];
      error.value = apiErrorMessage(err, 'Could not load the library.');
    } finally {
      if (seq === requestSeq) loading.value = false;
    }
  };

  /** Workspaces the user can add items to (editor or above) */
  const editableWorkspaces = computed(() => workspaces.value.filter((ws) => atLeast(ws.effectiveRole, 'editor')));

  /** Whether the user can change or delete the item: editor or above in the workspace that owns it */
  const canEdit = (item) => editableWorkspaces.value.some((ws) => ws.id === item.workspaceId);

  const workspaceName = (id) => workspaces.value.find((ws) => ws.id === id)?.name ?? null;

  const write = async (request, fallback) => {
    try {
      return await request();
    } catch (err) {
      throw new Error(apiErrorMessage(err, fallback));
    }
  };

  const create = async (workspaceId, body) => {
    const created = await write(() => apiClient.post(itemBase(workspaceId), body).then((r) => r.data), 'Could not add the item.');
    items.value = [created, ...items.value];
    return created;
  };

  const update = async (item, patch) => {
    const updated = await write(
      () => apiClient.patch(`${itemBase(item.workspaceId)}/${encodeURIComponent(item.id)}`, patch).then((r) => r.data),
      'Could not save the item.',
    );
    items.value = items.value.map((existing) => (existing.id === item.id ? updated : existing));
    return updated;
  };

  const remove = async (item) => {
    await write(() => apiClient.delete(`${itemBase(item.workspaceId)}/${encodeURIComponent(item.id)}`), 'Could not delete the item.');
    items.value = items.value.filter((existing) => existing.id !== item.id);
  };

  return { items, workspaces, editableWorkspaces, loading, loaded, error, load, canEdit, workspaceName, create, update, remove };
}
