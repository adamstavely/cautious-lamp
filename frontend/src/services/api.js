/**
 * API Service - Centralized API client with authentication
 */

import axios from 'axios';
import { getCurrentUser } from '../mockData.js';

// Get API base URL from environment or default to localhost:3000
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add authentication headers
apiClient.interceptors.request.use(
  (config) => {
    const user = getCurrentUser();
    if (user) {
      // Add authentication headers
      config.headers['x-user-email'] = user.email;
      config.headers['x-user-id'] = user.id || user.email;
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
    const response = await fetch(`${API_BASE_URL}/health`, {
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

/**
 * Review API methods
 */
export const reviewAPI = {
  // Get review by ID
  getReview: async (reviewId, password = null) => {
    const params = password ? { password } : {};
    const response = await apiClient.get(`/review/${reviewId}`, { params });
    return response.data;
  },

  // Get version URL
  getVersion: async (reviewId, versionId) => {
    const response = await apiClient.get(`/review/${reviewId}/version/${versionId}`);
    return response.data.url;
  },

  // Mark review as complete
  completeReview: async (reviewId) => {
    const response = await apiClient.post(`/review/${reviewId}/complete`);
    return response.data;
  },

  // Update sharing settings
  updateSharing: async (reviewId, sharingMode, approvedEmails) => {
    const response = await apiClient.post(`/review/${reviewId}/sharing`, {
      sharingMode,
      approvedEmails,
    });
    return response.data;
  },
};

/**
 * Workflow API methods
 */
export const workflowAPI = {
  // Approve workflow stage
  approve: async (reviewId, stage) => {
    const response = await apiClient.post(`/review/${reviewId}/workflow/approve`, { stage });
    return response.data;
  },

  // Reject workflow stage
  reject: async (reviewId, stage, reason = null) => {
    const response = await apiClient.post(`/review/${reviewId}/workflow/reject`, {
      stage,
      reason,
    });
    return response.data;
  },

  // Move to client review
  moveToClientReview: async (reviewId) => {
    const response = await apiClient.post(`/review/${reviewId}/workflow/move-to-client-review`);
    return response.data;
  },

  // Move to art director review
  moveToArtDirectorReview: async (reviewId) => {
    const response = await apiClient.post(`/review/${reviewId}/workflow/move-to-art-director-review`);
    return response.data;
  },

  // Resubmit for review
  resubmit: async (reviewId, targetStage) => {
    const response = await apiClient.post(`/review/${reviewId}/workflow/resubmit`, {
      targetStage,
    });
    return response.data;
  },
};

/**
 * Upload API methods
 */
export const uploadAPI = {
  // Create review from file upload
  createFromUpload: async (filename, password, bypassClientReview, sharingMode, approvedEmails) => {
    const response = await apiClient.post('/upload', {
      filename,
      password,
      bypassClientReview,
      sharingMode,
      approvedEmails,
    });
    return response.data;
  },

  // Upload file to presigned URL
  uploadFile: async (uploadUrl, file) => {
    // If uploadUrl is a full URL, use it directly; otherwise prepend base URL
    const fullUrl = uploadUrl.startsWith('http') ? uploadUrl : `${API_BASE_URL}${uploadUrl}`;
    const response = await fetch(fullUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`File upload failed: ${errorText}`);
    }
    // Some upload endpoints might return JSON, others might not
    try {
      return await response.json();
    } catch {
      return { success: true };
    }
  },

  // Create review from URL
  createFromUrl: async (url, password, bypassClientReview, sharingMode, approvedEmails) => {
    const response = await apiClient.post('/review/create-from-url', {
      url,
      password,
      bypassClientReview,
      sharingMode,
      approvedEmails,
    });
    return response.data;
  },
};

/**
 * Version API methods
 */
export const versionAPI = {
  // Upload new version
  uploadVersion: async (reviewId, file, label, notes, type) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('label', label);
    if (notes) formData.append('notes', notes);
    if (type) formData.append('type', type);

    const response = await apiClient.post(`/review/${reviewId}/versions`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

/**
 * Comment API methods
 */
export const commentAPI = {
  // Get comments
  getComments: async (reviewId, versionId = null) => {
    const params = versionId ? { versionId } : {};
    const response = await apiClient.get(`/review/${reviewId}/comments`, { params });
    return response.data;
  },

  // Add comment
  addComment: async (reviewId, text, version, type, resolved = false) => {
    const user = getCurrentUser();
    const response = await apiClient.post(`/review/${reviewId}/comments`, {
      text,
      version,
      type,
      resolved,
    });
    return response.data;
  },

  // Update comment
  updateComment: async (reviewId, commentId, updates) => {
    const response = await apiClient.patch(`/review/${reviewId}/comments/${commentId}`, updates);
    return response.data;
  },

  // Add reply
  addReply: async (reviewId, commentId, text) => {
    const response = await apiClient.post(`/review/${reviewId}/comments/${commentId}/replies`, {
      text,
    });
    return response.data;
  },

  // Toggle reaction on comment
  toggleReaction: async (reviewId, commentId, emoji) => {
    const response = await apiClient.post(`/review/${reviewId}/comments/${commentId}/reactions`, {
      emoji,
    });
    return response.data;
  },

  // Toggle reaction on reply
  toggleReplyReaction: async (reviewId, commentId, replyId, emoji) => {
    const response = await apiClient.post(
      `/review/${reviewId}/comments/${commentId}/replies/${replyId}/reactions`,
      { emoji }
    );
    return response.data;
  },
};

/**
 * Password & Expiration API methods
 */
export const passwordAPI = {
  // Update password
  updatePassword: async (reviewId, password) => {
    const response = await apiClient.post(`/review/${reviewId}/password`, { password });
    return response.data;
  },

  // Extend expiration
  extendExpiration: async (reviewId, days = 30) => {
    const response = await apiClient.post(`/review/${reviewId}/extend`, { days });
    return response.data;
  },
};

/**
 * Admin API methods
 */
export const adminAPI = {
  // Get all reviews
  getReviews: async (showExpired = false) => {
    const params = showExpired ? { showExpired: 'true' } : {};
    const response = await apiClient.get('/admin/reviews', { params });
    return response.data;
  },

  // Extend review expiration
  extendReview: async (reviewId, days = 7) => {
    const response = await apiClient.post(`/admin/reviews/${reviewId}/extend`, null, {
      params: { days },
    });
    return response.data;
  },

  // Reactivate expired review
  reactivateReview: async (reviewId) => {
    const response = await apiClient.post(`/admin/reviews/${reviewId}/reactivate`);
    return response.data;
  },

  // Delete review
  deleteReview: async (reviewId) => {
    const response = await apiClient.delete(`/admin/reviews/${reviewId}`);
    return response.status === 204;
  },
};

/**
 * Teams API methods
 */
export const teamsAPI = {
  // Get all teams
  getTeams: async () => {
    const response = await apiClient.get('/teams');
    return response.data;
  },

  // Get team by ID
  getTeam: async (teamId) => {
    const response = await apiClient.get(`/teams/${teamId}`);
    return response.data;
  },

  // Create team
  createTeam: async (name, description = null) => {
    const response = await apiClient.post('/teams', { name, description });
    return response.data;
  },

  // Update team
  updateTeam: async (teamId, updates) => {
    const response = await apiClient.patch(`/teams/${teamId}`, updates);
    return response.data;
  },

  // Delete team
  deleteTeam: async (teamId) => {
    const response = await apiClient.delete(`/teams/${teamId}`);
    return response.status === 204;
  },

  // Add team member
  addMember: async (teamId, email, name, role) => {
    const response = await apiClient.post(`/teams/${teamId}/members`, {
      email,
      name,
      role,
    });
    return response.data;
  },

  // Update member role
  updateMemberRole: async (teamId, email, role) => {
    const response = await apiClient.patch(`/teams/${teamId}/members/${email}`, { role });
    return response.data;
  },

  // Remove team member
  removeMember: async (teamId, email) => {
    const response = await apiClient.delete(`/teams/${teamId}/members/${email}`);
    return response.data;
  },
};

// Export default apiClient for custom requests
export default apiClient;

