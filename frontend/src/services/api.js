/**
 * API Service - Centralized API client with authentication
 *
 * The review section's clients (review, workflow, upload, version, comment,
 * password, admin, teams) follow docs/REVIEW_API.md. When VITE_USE_MOCKS=true
 * they call the browser-only demo backend in mockData.js instead of the
 * network; otherwise they always use the real API and let errors reach the UI.
 */

import axios from 'axios';
import { getCurrentUser, isMockMode, mockAPI } from '../mockData.js';

// Backend origin. Empty means same origin; the Vite dev server proxies /api.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** Resolve a path the backend returned (e.g. an upload or signed file URL) against the backend origin. */
export const resolveBackendUrl = (pathOrUrl) => {
  if (!pathOrUrl) return pathOrUrl;
  return new URL(pathOrUrl, API_BASE_URL || window.location.origin).toString();
};


/** The admin key for /admin routes, entered by the admin and kept in this browser. */
export const getAdminApiKey = () => localStorage.getItem('adminApiKey') || '';
export const setAdminApiKey = (key) => {
  if (key) localStorage.setItem('adminApiKey', key);
  else localStorage.removeItem('adminApiKey');
};

// Request interceptor to add authentication headers
apiClient.interceptors.request.use(
  (config) => {
    const user = getCurrentUser();
    if (user) {
      // Self-asserted acting user (display information, not authorization).
      // Free text is URL-encoded (headers are ASCII-only); the server decodes it.
      if (user.email) config.headers['x-user-email'] = user.email;
      if (user.name) config.headers['x-user-name'] = encodeURIComponent(user.name);
    }
    // Admin routes use the admin key; everything else uses the API key
    const key = config.useAdminKey
      ? getAdminApiKey()
      : localStorage.getItem('apiKey') || import.meta.env.VITE_API_KEY || '';
    if (key) {
      config.headers['authorization'] = `Bearer ${key}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

/**
 * Check if API is available
 */
export const checkApiHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/health`, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
    });
    return response.ok;
  } catch (error) {
    console.log('API health check failed:', error);
    return false;
  }
};

/* -------------------------------------------------------------------------- */
/* Review helpers                                                             */
/* -------------------------------------------------------------------------- */

/** HTTP status of a failed API call (undefined for network errors). */
export const errorStatus = (error) => error?.response?.status;

/** True when the server says the review needs a password (401 { passwordRequired: true }). */
export const isPasswordRequired = (error) =>
  errorStatus(error) === 401 && !!error?.response?.data?.passwordRequired;

/** True when an admin call failed because the admin key is missing or was rejected. */
export const isAdminKeyError = (error) => error?.code === 'ADMIN_KEY_MISSING' || errorStatus(error) === 401;

/** A message for the user from a failed API call. */
export const apiErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  const status = errorStatus(error);
  const serverMessage = error?.response?.data?.message;
  const detail = Array.isArray(serverMessage) ? serverMessage.join(', ') : serverMessage;
  if (error?.code === 'ADMIN_KEY_MISSING') return 'Enter the admin API key to manage reviews.';
  if (!error?.response) return `${fallback} The review service could not be reached.`;
  switch (status) {
    case 401:
      if (error.response.data?.passwordRequired) return 'This review is password protected.';
      return 'The API key was rejected. Check the key configured for this app.';
    case 403:
      return detail || 'This review has not been shared with you.';
    case 404:
      return detail || 'Not found. It may have been deleted.';
    case 409:
      return detail || 'That change is no longer allowed. Reload to see the latest state.';
    case 410:
      return 'This review link has expired.';
    case 503:
      return 'The review service is temporarily unavailable. Please try again shortly.';
    default:
      return detail ? `${fallback} ${detail}` : fallback;
  }
};

// Review passwords entered this session, kept per review so every call can send them.
const PASSWORD_KEY = (reviewId) => `reviewPassword:${reviewId}`;
export const reviewPasswords = {
  get: (reviewId) => {
    try {
      return sessionStorage.getItem(PASSWORD_KEY(reviewId)) || null;
    } catch {
      return null;
    }
  },
  set: (reviewId, password) => {
    try {
      if (password) sessionStorage.setItem(PASSWORD_KEY(reviewId), password);
      else sessionStorage.removeItem(PASSWORD_KEY(reviewId));
    } catch {
      // sessionStorage unavailable (private mode); the password just isn't remembered
    }
  },
  clear: (reviewId) => reviewPasswords.set(reviewId, null),
};

/** Headers for a review-scoped request: the session's review password (URL-encoded), if any. */
const reviewHeaders = (reviewId, password = reviewPasswords.get(reviewId)) =>
  password ? { 'x-review-password': encodeURIComponent(password) } : {};

const reviewPath = (reviewId) => `/api/v1/review/${encodeURIComponent(reviewId)}`;

/**
 * Review API methods
 */
export const reviewAPI = {
  // List reviews visible to the caller (server-scoped). Returns { reviews, total }.
  listReviews: async ({ workflowState, q, showExpired } = {}) => {
    if (isMockMode()) return mockAPI.listReviews({ workflowState, q, showExpired });
    const params = {};
    if (workflowState) params.workflowState = workflowState;
    if (q) params.q = q;
    if (showExpired) params.showExpired = 'true';
    const response = await apiClient.get('/api/v1/reviews', { params });
    return response.data;
  },

  // Get review by ID. The password defaults to the one entered this session.
  getReview: async (reviewId, password = reviewPasswords.get(reviewId)) => {
    if (isMockMode()) return mockAPI.getReview(reviewId, password);
    const response = await apiClient.get(reviewPath(reviewId), { headers: reviewHeaders(reviewId, password) });
    return response.data;
  },

  // Get a signed URL for a version's file (valid 10 minutes), resolved against the backend origin
  getVersion: async (reviewId, versionId, password = reviewPasswords.get(reviewId)) => {
    if (isMockMode()) return mockAPI.getVersionUrl(reviewId, versionId, password);
    const response = await apiClient.get(`${reviewPath(reviewId)}/version/${encodeURIComponent(versionId)}`, {
      headers: reviewHeaders(reviewId, password),
    });
    return resolveBackendUrl(response.data.url);
  },

  // Mark review as complete
  completeReview: async (reviewId) => {
    if (isMockMode()) return mockAPI.completeReview(reviewId);
    const response = await apiClient.post(`${reviewPath(reviewId)}/complete`, null, { headers: reviewHeaders(reviewId) });
    return response.data;
  },

  // Update sharing settings. sharingMode: 'anyone' | 'approved_emails'
  updateSharing: async (reviewId, sharingMode, approvedEmails) => {
    if (isMockMode()) return mockAPI.updateSharing(reviewId, sharingMode, approvedEmails);
    const response = await apiClient.post(
      `${reviewPath(reviewId)}/sharing`,
      { sharingMode, approvedEmails },
      { headers: reviewHeaders(reviewId) }
    );
    return response.data;
  },
};

/**
 * Workflow API methods. All return the updated review; invalid transitions are 409.
 */
export const workflowAPI = {
  // Approve workflow stage
  approve: async (reviewId, stage) => {
    if (isMockMode()) return mockAPI.approve(reviewId, stage);
    const response = await apiClient.post(`${reviewPath(reviewId)}/workflow/approve`, { stage }, { headers: reviewHeaders(reviewId) });
    return response.data;
  },

  // Reject workflow stage (sends the review back to draft)
  reject: async (reviewId, stage, reason = null) => {
    if (isMockMode()) return mockAPI.reject(reviewId, stage, reason);
    const body = reason ? { stage, reason } : { stage };
    const response = await apiClient.post(`${reviewPath(reviewId)}/workflow/reject`, body, { headers: reviewHeaders(reviewId) });
    return response.data;
  },

  // Move to client review (or straight to art director review when bypassClientReview)
  moveToClientReview: async (reviewId) => {
    if (isMockMode()) return mockAPI.moveToClientReview(reviewId);
    const response = await apiClient.post(`${reviewPath(reviewId)}/workflow/move-to-client-review`, null, { headers: reviewHeaders(reviewId) });
    return response.data;
  },

  // Move to art director review
  moveToArtDirectorReview: async (reviewId) => {
    if (isMockMode()) return mockAPI.moveToArtDirectorReview(reviewId);
    const response = await apiClient.post(`${reviewPath(reviewId)}/workflow/move-to-art-director-review`, null, { headers: reviewHeaders(reviewId) });
    return response.data;
  },

  // Resubmit from draft to the given review stage
  resubmit: async (reviewId, targetStage) => {
    if (isMockMode()) return mockAPI.resubmit(reviewId, targetStage);
    const response = await apiClient.post(`${reviewPath(reviewId)}/workflow/resubmit`, { targetStage }, { headers: reviewHeaders(reviewId) });
    return response.data;
  },
};

/**
 * Upload API methods
 */
export const uploadAPI = {
  // Create a review for a file. Returns { reviewId, uploadUrl }.
  createFromUpload: async ({ filename, password, bypassClientReview, sharingMode, approvedEmails, teamId } = {}) => {
    const body = { filename, password: password || undefined, bypassClientReview, sharingMode, approvedEmails, teamId: teamId || undefined };
    if (isMockMode()) return mockAPI.createUpload(body);
    const response = await apiClient.post('/api/v1/upload', body);
    return response.data;
  },

  // PUT the raw file to the one-time upload URL. No API key: the URL's token authorizes it.
  uploadFile: async (uploadUrl, file) => {
    if (isMockMode()) return mockAPI.putUpload(uploadUrl, file);
    const response = await fetch(resolveBackendUrl(uploadUrl), {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const error = new Error(data?.message || `File upload failed (${response.status})`);
      error.response = { status: response.status, data: data || {} };
      throw error;
    }
    return data || { success: true };
  },

  // Create a review and upload its file in one go. Returns { reviewId, versionId }.
  uploadReview: async (file, options = {}) => {
    const { reviewId, uploadUrl } = await uploadAPI.createFromUpload({ ...options, filename: file.name });
    const result = await uploadAPI.uploadFile(uploadUrl, file);
    return { reviewId, versionId: result?.versionId };
  },

  // Create review from URL. Returns { reviewId, review }.
  createFromUrl: async ({ url, filename, password, bypassClientReview, sharingMode, approvedEmails, teamId } = {}) => {
    const body = {
      url,
      filename: filename || undefined,
      password: password || undefined,
      bypassClientReview,
      sharingMode,
      approvedEmails,
      teamId: teamId || undefined,
    };
    if (isMockMode()) return mockAPI.createFromUrl(body);
    const response = await apiClient.post('/api/v1/review/create-from-url', body);
    return response.data;
  },
};

/**
 * Design Extraction API methods
 */
export const designExtractionAPI = {
  // Extract design tokens from URL
  extract: async (url, options = {}) => {
    const response = await apiClient.post('/api/v1/design-extraction/extract', {
      url,
      options,
    });
    return response.data;
  },
};

/**
 * Version API methods
 */
export const versionAPI = {
  // Upload new version (multipart). Returns the new version.
  uploadVersion: async (reviewId, file, label, notes, type) => {
    if (isMockMode()) return mockAPI.uploadVersion(reviewId, file, label, notes, type);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('label', label);
    if (notes) formData.append('notes', notes);
    if (type) formData.append('type', type);

    // Must not stay application/json (axios would serialise the FormData);
    // in the browser axios then drops it so the multipart boundary is set.
    const response = await apiClient.post(`${reviewPath(reviewId)}/versions`, formData, {
      headers: { ...reviewHeaders(reviewId), 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

/**
 * Comment API methods
 */
export const commentAPI = {
  // Get comments, optionally for one version
  getComments: async (reviewId, versionId = null) => {
    if (isMockMode()) return mockAPI.getComments(reviewId, versionId);
    const params = versionId ? { versionId } : {};
    const response = await apiClient.get(`${reviewPath(reviewId)}/comments`, { params, headers: reviewHeaders(reviewId) });
    return response.data;
  },

  // Add comment: { text, version, type, resolved?, annotationId?, annotationData? }
  addComment: async (reviewId, comment) => {
    const { text, version, type, resolved = false, annotationId, annotationData } = comment;
    const body = { text, version, type, resolved };
    if (annotationId) body.annotationId = annotationId;
    if (annotationData) body.annotationData = annotationData;
    if (isMockMode()) return mockAPI.addComment(reviewId, body);
    const response = await apiClient.post(`${reviewPath(reviewId)}/comments`, body, { headers: reviewHeaders(reviewId) });
    return response.data;
  },

  // Update comment: { text?, resolved?, annotationData? }
  updateComment: async (reviewId, commentId, updates) => {
    const body = {};
    ['text', 'resolved', 'annotationData'].forEach((key) => {
      if (updates[key] !== undefined) body[key] = updates[key];
    });
    if (isMockMode()) return mockAPI.updateComment(reviewId, commentId, body);
    const response = await apiClient.patch(`${reviewPath(reviewId)}/comments/${encodeURIComponent(commentId)}`, body, {
      headers: reviewHeaders(reviewId),
    });
    return response.data;
  },

  // Delete comment
  deleteComment: async (reviewId, commentId) => {
    if (isMockMode()) return mockAPI.deleteComment(reviewId, commentId);
    await apiClient.delete(`${reviewPath(reviewId)}/comments/${encodeURIComponent(commentId)}`, { headers: reviewHeaders(reviewId) });
  },

  // Add reply
  addReply: async (reviewId, commentId, text) => {
    if (isMockMode()) return mockAPI.addReply(reviewId, commentId, text);
    const response = await apiClient.post(
      `${reviewPath(reviewId)}/comments/${encodeURIComponent(commentId)}/replies`,
      { text },
      { headers: reviewHeaders(reviewId) }
    );
    return response.data;
  },

  // Toggle the acting user's reaction on a comment
  toggleReaction: async (reviewId, commentId, emoji) => {
    if (isMockMode()) return mockAPI.toggleReaction(reviewId, commentId, emoji);
    const response = await apiClient.post(
      `${reviewPath(reviewId)}/comments/${encodeURIComponent(commentId)}/reactions`,
      { emoji },
      { headers: reviewHeaders(reviewId) }
    );
    return response.data;
  },

  // Toggle the acting user's reaction on a reply
  toggleReplyReaction: async (reviewId, commentId, replyId, emoji) => {
    if (isMockMode()) return mockAPI.toggleReplyReaction(reviewId, commentId, replyId, emoji);
    const response = await apiClient.post(
      `${reviewPath(reviewId)}/comments/${encodeURIComponent(commentId)}/replies/${encodeURIComponent(replyId)}/reactions`,
      { emoji },
      { headers: reviewHeaders(reviewId) }
    );
    return response.data;
  },
};

/**
 * Password & Expiration API methods
 */
export const passwordAPI = {
  // Set or clear (empty) the review password. Returns { hasPassword }.
  updatePassword: async (reviewId, password) => {
    const result = isMockMode()
      ? await mockAPI.updatePassword(reviewId, password || '')
      : (await apiClient.post(`${reviewPath(reviewId)}/password`, { password: password || '' }, { headers: reviewHeaders(reviewId) })).data;
    // Keep this session able to open the review with its new password.
    reviewPasswords.set(reviewId, password || null);
    return result;
  },

  // Extend expiration (1-90 days). Returns the review.
  extendExpiration: async (reviewId, days = 30) => {
    if (isMockMode()) return mockAPI.extendExpiration(reviewId, days);
    const response = await apiClient.post(`${reviewPath(reviewId)}/extend`, { days }, { headers: reviewHeaders(reviewId) });
    return response.data;
  },
};

/**
 * Admin API methods. These use the admin key (localStorage.adminApiKey), not the API key.
 */
const adminConfig = (config = {}) => {
  if (!getAdminApiKey()) {
    const error = new Error('Admin API key is not set');
    error.code = 'ADMIN_KEY_MISSING';
    throw error;
  }
  return { ...config, useAdminKey: true };
};

const adminPath = (reviewId) => `/api/v1/admin/reviews/${encodeURIComponent(reviewId)}`;

export const adminAPI = {
  // Get all reviews (ReviewSummary[])
  getReviews: async (showExpired = false) => {
    if (isMockMode()) return mockAPI.adminListReviews(showExpired);
    const params = showExpired ? { showExpired: 'true' } : {};
    const response = await apiClient.get('/api/v1/admin/reviews', adminConfig({ params }));
    return response.data;
  },

  // Extend review expiration by `days` (1-365)
  extendReview: async (reviewId, days = 7) => {
    if (isMockMode()) return mockAPI.adminExtend(reviewId, days);
    const response = await apiClient.post(`${adminPath(reviewId)}/extend`, null, adminConfig({ params: { days } }));
    return response.data;
  },

  // Reactivate expired review
  reactivateReview: async (reviewId) => {
    if (isMockMode()) return mockAPI.adminReactivate(reviewId);
    const response = await apiClient.post(`${adminPath(reviewId)}/reactivate`, null, adminConfig());
    return response.data;
  },

  // Set or clear (empty) a review's password. Returns { hasPassword }.
  resetPassword: async (reviewId, password) => {
    if (isMockMode()) return mockAPI.adminResetPassword(reviewId, password || '');
    const response = await apiClient.post(`${adminPath(reviewId)}/reset-password`, { password: password || '' }, adminConfig());
    return response.data;
  },

  // Delete review (and its stored files)
  deleteReview: async (reviewId) => {
    if (isMockMode()) {
      await mockAPI.adminDelete(reviewId);
      return true;
    }
    const response = await apiClient.delete(adminPath(reviewId), adminConfig());
    return response.status === 204 || response.status === 200;
  },

  // Delete several reviews. Returns { deleted }.
  batchDelete: async (ids) => {
    if (isMockMode()) return mockAPI.adminBatchDelete(ids);
    const response = await apiClient.post('/api/v1/admin/reviews/batch-delete', { ids }, adminConfig());
    return response.data;
  },
};

/**
 * Teams API methods
 */
const teamPath = (teamId) => `/api/v1/teams/${encodeURIComponent(teamId)}`;

export const teamsAPI = {
  // Get all teams
  getTeams: async () => {
    if (isMockMode()) return mockAPI.getTeams();
    const response = await apiClient.get('/api/v1/teams');
    return response.data;
  },

  // Get team by ID
  getTeam: async (teamId) => {
    if (isMockMode()) return mockAPI.getTeam(teamId);
    const response = await apiClient.get(teamPath(teamId));
    return response.data;
  },

  // Create team
  createTeam: async (name, description = null) => {
    if (isMockMode()) return mockAPI.createTeam(name, description);
    const body = description ? { name, description } : { name };
    const response = await apiClient.post('/api/v1/teams', body);
    return response.data;
  },

  // Update team: { name?, description? }
  updateTeam: async (teamId, updates) => {
    if (isMockMode()) return mockAPI.updateTeam(teamId, updates);
    const response = await apiClient.patch(teamPath(teamId), updates);
    return response.data;
  },

  // Delete team
  deleteTeam: async (teamId) => {
    if (isMockMode()) {
      await mockAPI.deleteTeam(teamId);
      return true;
    }
    const response = await apiClient.delete(teamPath(teamId));
    return response.status === 204 || response.status === 200;
  },

  // Add team member. Returns the team.
  addMember: async (teamId, email, name, role) => {
    if (isMockMode()) return mockAPI.addMember(teamId, email, name, role);
    const response = await apiClient.post(`${teamPath(teamId)}/members`, { email, name, role });
    return response.data;
  },

  // Update member role. Returns the team.
  updateMemberRole: async (teamId, email, role) => {
    if (isMockMode()) return mockAPI.updateMemberRole(teamId, email, role);
    const response = await apiClient.patch(`${teamPath(teamId)}/members/${encodeURIComponent(email)}`, { role });
    return response.data;
  },

  // Remove team member. Returns the team.
  removeMember: async (teamId, email) => {
    if (isMockMode()) return mockAPI.removeMember(teamId, email);
    const response = await apiClient.delete(`${teamPath(teamId)}/members/${encodeURIComponent(email)}`);
    return response.data;
  },
};

// Export default apiClient for custom requests
export default apiClient;
