import { computed, ref } from 'vue';
import apiClient from '../services/api.js';

/**
 * The signed-in person's notifications (GET /api/v1/notifications), shared by
 * the top-nav bell and the notifications page so marking one read in either
 * updates both. The server only ever returns and changes the caller's own.
 */
const notifications = ref([]);
const loaded = ref(false);
const loading = ref(false);
const error = ref(null);

const unreadCount = computed(() => notifications.value.filter((n) => !n.read).length);

let pending = null;

/** Fetches the notifications; concurrent calls share one request */
const load = () => {
  if (pending) return pending;
  loading.value = true;
  pending = apiClient
    .get('/api/v1/notifications')
    .then((res) => {
      notifications.value = Array.isArray(res.data) ? res.data : [];
      error.value = null;
      loaded.value = true;
    })
    .catch((err) => {
      error.value = err;
    })
    .finally(() => {
      loading.value = false;
      pending = null;
    });
  return pending;
};

const replace = (updated) => {
  notifications.value = notifications.value.map((n) => (n.id === updated.id ? { ...n, ...updated } : n));
};

/** Marks one read on the server, then locally. Errors reach the caller. */
const markRead = async (id) => {
  const res = await apiClient.put(`/api/v1/notifications/${encodeURIComponent(id)}/read`);
  replace(res.data && res.data.id ? res.data : { id, read: true });
};

const markAllRead = async () => {
  await apiClient.put('/api/v1/notifications/read-all');
  notifications.value = notifications.value.map((n) => ({ ...n, read: true }));
};

const remove = async (id) => {
  await apiClient.delete(`/api/v1/notifications/${encodeURIComponent(id)}`);
  notifications.value = notifications.value.filter((n) => n.id !== id);
};

/** For tests: forget everything loaded */
export const resetNotifications = () => {
  notifications.value = [];
  loaded.value = false;
  loading.value = false;
  error.value = null;
  pending = null;
};

export function useNotifications() {
  return { notifications, unreadCount, loaded, loading, error, load, markRead, markAllRead, remove };
}

/** "Just now", "5m ago", "3h ago", "2d ago", or the date */
export function formatRelativeTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';
  const diffMins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
