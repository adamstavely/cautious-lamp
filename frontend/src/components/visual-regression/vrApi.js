// Shared by the visual regression pages
export const VR_API_PATH = '/api/v1/visual-regression';

/** The server's message (e.g. Argos refusing a token) or a readable fallback */
export const vrErrorMessage = (error, fallback) => {
  const status = error?.response?.status;
  if (status === 401) return 'You are not signed in, or your API key was rejected.';
  const message = error?.response?.data?.message;
  if (Array.isArray(message)) return message.join(' ');
  if (typeof message === 'string' && message) return message;
  if (!error?.response) return 'Could not reach the server. Check your connection and try again.';
  return fallback;
};

export const formatDateTime = (value) => {
  if (!value) return 'Never';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Never' : date.toLocaleString();
};

// A notice for the projects list to show once after leaving a project page
// (e.g. "Project deleted"); taken, it is cleared, so a revisit doesn't repeat it
let pendingListNotice = null;
export const setListNotice = (message, type = 'success') => {
  pendingListNotice = { message, type };
};
export const takeListNotice = () => {
  const taken = pendingListNotice;
  pendingListNotice = null;
  return taken;
};
