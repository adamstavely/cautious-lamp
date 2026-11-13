import { ref, unref } from 'vue';
import apiClient, { apiErrorMessage } from '../services/api.js';

/**
 * One kind of workspace item (fonts, tokens, guidelines, …) through the
 * generic API `/api/v1/workspaces/:id/resources/:kind` (docs/WORKSPACES.md).
 * Nothing loads until `load()` is called, so a page only fetches the kind it shows.
 *
 * `workspaceId` and `kind` may be refs. Errors are kept in `error` (a message)
 * and re-thrown from the write helpers so callers can keep a form open.
 */
export function useWorkspaceResource(workspaceId, kind) {
  const items = ref([]);
  const loading = ref(false);
  const loaded = ref(false);
  const error = ref(null);
  let requestSeq = 0;

  const base = () => `/api/v1/workspaces/${encodeURIComponent(unref(workspaceId))}/resources/${encodeURIComponent(unref(kind))}`;

  const load = async () => {
    const seq = ++requestSeq;
    loading.value = true;
    error.value = null;
    try {
      const response = await apiClient.get(base());
      // Ignore a response for a workspace or kind we have since moved away from
      if (seq !== requestSeq) return;
      items.value = Array.isArray(response.data) ? response.data : [];
      loaded.value = true;
    } catch (err) {
      if (seq !== requestSeq) return;
      items.value = [];
      error.value = apiErrorMessage(err, `Could not load ${unref(kind)}.`);
    } finally {
      if (seq === requestSeq) loading.value = false;
    }
  };

  const write = async (request, fallback) => {
    try {
      return await request();
    } catch (err) {
      throw new Error(apiErrorMessage(err, fallback));
    }
  };

  const create = async (body) => {
    const created = await write(() => apiClient.post(base(), body).then((r) => r.data), 'Could not add the item.');
    items.value = [created, ...items.value];
    return created;
  };

  const update = async (id, patch) => {
    const updated = await write(() => apiClient.patch(`${base()}/${encodeURIComponent(id)}`, patch).then((r) => r.data), 'Could not save the item.');
    items.value = items.value.map((item) => (item.id === id ? updated : item));
    return updated;
  };

  const remove = async (id) => {
    await write(() => apiClient.delete(`${base()}/${encodeURIComponent(id)}`), 'Could not delete the item.');
    items.value = items.value.filter((item) => item.id !== id);
  };

  /** Replaces who the item is shared with: { workspaceIds: [...], isGlobal } */
  const setSharing = async (id, sharing) => {
    const updated = await write(
      () => apiClient.put(`${base()}/${encodeURIComponent(id)}/sharing`, sharing).then((r) => r.data),
      'Could not change sharing.',
    );
    items.value = items.value.map((item) => (item.id === id ? updated : item));
    return updated;
  };

  const reset = () => {
    requestSeq++;
    items.value = [];
    loaded.value = false;
    loading.value = false;
    error.value = null;
  };

  return { items, loading, loaded, error, load, create, update, remove, setSharing, reset };
}
