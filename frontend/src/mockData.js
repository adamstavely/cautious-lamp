// Browser-only demo backend for the review section.
//
// Used only when VITE_USE_MOCKS=true. It implements the same operations and
// response shapes as the real API (docs/REVIEW_API.md), so the review UI has a
// single code path: services/api.js calls `mockAPI` instead of the network
// when mock mode is on. Errors are thrown in the same shape axios uses
// (`error.response.status`, `error.response.data`), so the UI handles both alike.

const STORAGE_KEY = 'mockReviews.v2';
const DAY = 24 * 60 * 60 * 1000;
const DEMO_PDF = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

/**
 * Mock mode is on only when the build says so. Synchronous; `await isMockMode()`
 * still works for callers that treat it as async.
 */
export const isMockMode = () => import.meta.env.VITE_USE_MOCKS === 'true';

/** Async wrapper kept for callers that expect a promise. */
export const isMockModeAsync = async () => isMockMode();

// Mock user context (until real accounts exist, the acting user is self-asserted)
export const getCurrentUser = () => ({
  name: localStorage.getItem('currentDesigner') || 'Sarah Johnson',
  email: localStorage.getItem('currentUserEmail') || 'sarah@example.com',
  role: localStorage.getItem('userRole') || 'designer', // 'designer', 'client', 'art_director', 'creative_director'
  teamId: localStorage.getItem('currentUserTeamId') || 'team-1',
});

const defaultMockReviews = [
  {
    id: 'review-1',
    filename: 'Website Design v2.pdf',
    password: null,
    designer: 'Sarah Johnson',
    designerEmail: 'sarah@example.com', // Add email for team matching
    teamId: 'team-1', // Associate with team
    completed: false,
    workflowState: 'art_director_review', // draft, client_review, client_approved, art_director_review, art_director_approved, creative_director_review, approved
    workflowHistory: [
      // Initial upload
      { stage: 'draft', action: 'uploaded', user: 'Sarah Johnson', timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() },
      // Password set
      { stage: 'draft', action: 'password_set', user: 'Sarah Johnson', timestamp: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString() },
      // Moved to client review
      { stage: 'client_review', action: 'moved_to_review', user: 'Sarah Johnson', timestamp: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString() },
      // Rejected by client
      { stage: 'client_review', action: 'rejected', user: 'Client', timestamp: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString(), reason: 'Needs more color variation' },
      // Resubmitted
      { stage: 'draft', action: 'resubmitted', user: 'Sarah Johnson', timestamp: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString() },
      // Version uploaded
      { stage: 'draft', action: 'version_uploaded', user: 'Sarah Johnson', timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), versionLabel: 'Version 2' },
      // Moved to client review again
      { stage: 'client_review', action: 'moved_to_review', user: 'Sarah Johnson', timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() },
      // Approved by client
      { stage: 'client_approved', action: 'approved', user: 'Client', timestamp: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString() },
      // Moved to art director review
      { stage: 'art_director_review', action: 'moved_to_review', user: 'Sarah Johnson', timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString() },
      // Approved by art director
      { stage: 'art_director_approved', action: 'approved', user: 'Art Director', timestamp: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString() },
      // Moved to creative director review
      { stage: 'creative_director_review', action: 'moved_to_review', user: 'System', timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
      // Version uploaded during review
      { stage: 'creative_director_review', action: 'version_uploaded', user: 'Sarah Johnson', timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(), versionLabel: 'Version 3' },
      // Expiration extended
      { stage: 'creative_director_review', action: 'extended', user: 'Sarah Johnson', timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), days: 30 },
      // Password removed
      { stage: 'creative_director_review', action: 'password_removed', user: 'Sarah Johnson', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
      // Password set again
      { stage: 'creative_director_review', action: 'password_set', user: 'Sarah Johnson', timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() },
      // Sharing changed
      { stage: 'creative_director_review', action: 'sharing_changed', user: 'Sarah Johnson', timestamp: new Date(Date.now() - 5.5 * 24 * 60 * 60 * 1000).toISOString() },
      // Approved by creative director
      { stage: 'approved', action: 'approved', user: 'Creative Director', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
      // Marked as completed
      { stage: 'approved', action: 'completed', user: 'Sarah Johnson', timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() }
    ],
    versions: [
      { id: 'v1', label: 'Version 1 - Initial Design', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
      { id: 'v2', label: 'Version 2 - Updated Layout', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
      { id: 'v3', label: 'Version 3 - Final Design', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }
    ],
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    extended: false,
    comments: [
      {
        id: 'comment-1',
        text: 'The header looks great! I love the new typography.',
        type: 'approval',
        author: 'Sarah Johnson',
        authorRole: 'designer',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        version: 'v3',
        resolved: false,
        reactions: [
          { user: 'Mike Chen', emoji: '👍', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
        ],
        replies: [
          {
            id: 'reply-1',
            text: 'Thanks! We spent a lot of time getting the font pairing just right.',
            author: 'Design Team',
            authorRole: 'designer',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]
      },
      {
        id: 'comment-2',
        text: 'Could we make the navigation menu more prominent? It feels a bit hidden.',
        type: 'suggestion',
        author: 'Mike Chen',
        authorRole: 'designer',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        version: 'v2',
        resolved: false,
        reactions: [],
        replies: []
      }
    ]
  },
  {
    id: 'review-2',
    filename: 'Mobile App Wireframes.sketch',
    password: 'design123',
    designer: 'Mike Chen',
    designerEmail: 'mike@example.com', // Add email for team matching
    teamId: 'team-1', // Associate with team
    completed: false,
    workflowState: 'client_approved',
    workflowHistory: [
      { stage: 'draft', action: 'uploaded', user: 'Mike Chen', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
      { stage: 'client_review', action: 'moved_to_review', user: 'Mike Chen', timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() },
      { stage: 'client_approved', action: 'approved', user: 'Client', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
    ],
    versions: [
      { id: 'v1', label: 'Initial Wireframes', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
      { id: 'v2', label: 'Updated User Flow', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }
    ],
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    extended: false,
    comments: [
      {
        id: 'comment-3',
        text: 'The login flow is confusing. Users might get lost here.',
        type: 'bug',
        author: 'Alex Rodriguez',
        authorRole: 'designer',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        version: 'v1',
        resolved: true,
        reactions: [
          { user: 'Mike Chen', emoji: '👍', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
          { user: 'Sarah Johnson', emoji: '❤️', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() }
        ],
        replies: [
          {
            id: 'reply-2',
            text: 'Good catch! We\'ve simplified this in v2.',
            author: 'Design Team',
            authorRole: 'designer',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
          }
        ]
      }
    ]
  },
  {
    id: 'review-3',
    filename: 'Brand Guidelines.ai',
    password: 'brand2024',
    designer: 'Alex Rodriguez',
    designerEmail: 'alex@example.com', // Add email for team matching
    teamId: 'team-2', // Associate with team
    completed: false,
    workflowState: 'approved',
    workflowHistory: [
      { stage: 'draft', action: 'uploaded', user: 'Alex Rodriguez', timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
      { stage: 'client_review', action: 'moved_to_review', user: 'Alex Rodriguez', timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString() },
      { stage: 'client_approved', action: 'approved', user: 'Client', timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() },
      { stage: 'art_director_review', action: 'moved_to_review', user: 'System', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
      { stage: 'art_director_approved', action: 'approved', user: 'Art Director', timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() },
      { stage: 'creative_director_review', action: 'moved_to_review', user: 'System', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
      { stage: 'approved', action: 'approved', user: 'Creative Director', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
    ],
    versions: [
      { id: 'v1', label: 'Logo Concepts', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
      { id: 'v2', label: 'Color Palette', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
      { id: 'v3', label: 'Typography Guide', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
      { id: 'v4', label: 'Final Guidelines', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }
    ],
    expiresAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Expired
    extended: true,
    comments: [
      {
        id: 'comment-4',
        text: 'Perfect! This is exactly what we were looking for. Approved for final production.',
        type: 'approval',
        author: 'Jennifer Walsh',
        authorRole: 'creative_director',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        version: 'v4',
        resolved: true,
        reactions: [
          { user: 'Alex Rodriguez', emoji: '✅', timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
          { user: 'Mike Chen', emoji: '👍', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
          { user: 'Sarah Johnson', emoji: '🎉', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
        ],
        replies: []
      }
    ]
  }
];


// ---------------------------------------------------------------------------
// Normalising the seed data to the contract shapes
// ---------------------------------------------------------------------------

const nameToEmail = (name) => {
  const known = {
    'Sarah Johnson': 'sarah@example.com',
    'Mike Chen': 'mike@example.com',
    'Alex Rodriguez': 'alex@example.com',
    'Jennifer Walsh': 'jennifer@example.com',
  };
  return known[name] || `${String(name || 'user').toLowerCase().replace(/[^a-z0-9]+/g, '.')}@example.com`;
};

/** Legacy `[{ user, emoji }]` reactions to the contract's `{ [emoji]: [email] }`. */
const normalizeReactions = (reactions) => {
  if (!reactions) return {};
  if (!Array.isArray(reactions)) return { ...reactions };
  const map = {};
  reactions.forEach((r) => {
    const emoji = r.emoji || '👍';
    const email = r.userEmail || nameToEmail(r.user);
    map[emoji] = map[emoji] || [];
    if (!map[emoji].includes(email)) map[emoji].push(email);
  });
  return map;
};

const LEGACY_STATES = { ad_changes_requested: 'draft', cd_changes_requested: 'draft', art_director_approved: 'creative_director_review' };

const normalizeReview = (review) => {
  const createdAt = review.createdAt || review.workflowHistory?.[0]?.timestamp || new Date().toISOString();
  return {
    sourceType: 'upload',
    teamId: null,
    completed: false,
    bypassClientReview: false,
    sharingMode: 'anyone',
    approvedEmails: [],
    extended: false,
    ...review,
    // Only the private `password` field is kept in the mock store; responses get `hasPassword`.
    password: review.password || null,
    workflowState: LEGACY_STATES[review.workflowState] || review.workflowState || 'draft',
    sharingMode: review.sharingMode === 'restricted' ? 'approved_emails' : (review.sharingMode || 'anyone'),
    designerEmail: review.designerEmail || nameToEmail(review.designer),
    workflowHistory: review.workflowHistory || [],
    versions: (review.versions || []).map((v) => ({
      type: 'file',
      notes: '',
      filename: review.filename,
      contentType: 'application/pdf',
      size: null,
      uploadedAt: createdAt,
      uploadedBy: review.designer || 'Designer',
      ...v,
    })),
    comments: (review.comments || []).map((c) => ({
      authorEmail: c.authorEmail || nameToEmail(c.author),
      ...c,
      reactions: normalizeReactions(c.reactions),
      replies: (c.replies || []).map((r) => ({
        authorEmail: r.authorEmail || nameToEmail(r.author),
        ...r,
        reactions: normalizeReactions(r.reactions),
      })),
    })),
    createdAt,
    updatedAt: review.updatedAt || createdAt,
  };
};

const loadReviews = () => {
  try {
    const persisted = localStorage.getItem(STORAGE_KEY);
    if (persisted) return JSON.parse(persisted).map(normalizeReview);
  } catch (error) {
    console.error('Failed to load demo reviews:', error);
  }
  return defaultMockReviews.map(normalizeReview);
};

const mockReviews = loadReviews();

const save = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockReviews));
  } catch (error) {
    console.error('Failed to save demo reviews:', error);
  }
};

export { mockReviews };

// Get filtered reviews based on user role (demo-mode scoping; the server scopes real lists)
export const getFilteredReviews = (userRole, userEmail, userTeamId) => {
  if (userRole === 'creative_director') return mockReviews;
  if (userRole === 'art_director') return mockReviews.filter((r) => r.teamId === userTeamId);
  if (userRole === 'designer') return mockReviews.filter((r) => r.designerEmail === userEmail);
  return mockReviews;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));
const clone = (value) => JSON.parse(JSON.stringify(value));
const newId = (prefix) => `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
const now = () => new Date().toISOString();

const httpError = (status, message, extra = {}) => {
  const error = new Error(message);
  error.response = { status, data: { statusCode: status, message, ...extra } };
  return error;
};

const isExpired = (review) => review.expiresAt && new Date(review.expiresAt) < new Date();

const toReview = (review) => {
  const { password, ...rest } = clone(review);
  return { ...rest, hasPassword: !!password };
};

const toSummary = (review) => {
  const { comments, workflowHistory, ...rest } = toReview(review);
  // Same rule as the API: the last workflow action (ignoring uploads and extensions) was a rejection
  const last = [...(workflowHistory || [])]
    .reverse()
    .find((entry) => !['version_uploaded', 'extended', 'reactivated'].includes(entry.action));
  return { ...rest, changesRequested: last?.action === 'rejected' };
};

const actingUser = () => getCurrentUser();

const history = (review, action, extra = {}) => {
  review.workflowHistory.push({
    stage: review.workflowState,
    action,
    user: actingUser().name,
    timestamp: now(),
    ...extra,
  });
  review.updatedAt = now();
};

const findReview = (id, { allowExpired = false, password, checkPassword = false } = {}) => {
  const review = mockReviews.find((r) => r.id === id);
  if (!review) throw httpError(404, 'Review not found');
  if (!allowExpired && isExpired(review)) {
    throw review.completed
      ? httpError(410, 'This review has been completed', { reason: 'completed' })
      : httpError(410, 'This review link has expired', { reason: 'expired' });
  }
  if (checkPassword && review.password && review.password !== password) {
    throw httpError(401, 'Password required', { passwordRequired: true });
  }
  return review;
};

const findComment = (review, commentId) => {
  const comment = review.comments.find((c) => c.id === commentId);
  if (!comment) throw httpError(404, 'Comment not found');
  return comment;
};

const toggleReaction = (target, emoji) => {
  const email = actingUser().email;
  target.reactions = normalizeReactions(target.reactions);
  const list = target.reactions[emoji] || [];
  if (list.includes(email)) {
    target.reactions[emoji] = list.filter((e) => e !== email);
    if (!target.reactions[emoji].length) delete target.reactions[emoji];
  } else {
    target.reactions[emoji] = [...list, email];
  }
};

const transition = (review, from, to, action, extra) => {
  const allowed = Array.isArray(from) ? from : [from];
  if (!allowed.includes(review.workflowState)) {
    throw httpError(409, `Cannot ${action.replace(/_/g, ' ')} from ${review.workflowState}`);
  }
  review.workflowState = to;
  history(review, action, extra);
};

const createReview = ({ filename, password, bypassClientReview = false, sharingMode = 'anyone', approvedEmails = [], teamId = null, sourceType, url }) => {
  const user = actingUser();
  const review = normalizeReview({
    id: newId('rev'),
    filename,
    sourceType,
    url: sourceType === 'url' ? url : undefined,
    password: password || null,
    designer: user.name,
    designerEmail: user.email,
    teamId,
    bypassClientReview,
    sharingMode,
    approvedEmails,
    versions: [],
    comments: [],
    workflowState: 'draft',
    workflowHistory: [{ stage: 'draft', action: sourceType === 'url' ? 'created_from_url' : 'uploaded', user: user.name, timestamp: now() }],
    expiresAt: new Date(Date.now() + 30 * DAY).toISOString(),
    createdAt: now(),
  });
  mockReviews.push(review);
  return review;
};

const addVersion = (review, { filename, label, notes = '', type = 'file', contentType = 'application/pdf', size = null }) => {
  const version = {
    id: `v${review.versions.length + 1}`,
    label: label || `Version ${review.versions.length + 1}`,
    notes,
    type,
    filename,
    contentType,
    size,
    uploadedAt: now(),
    uploadedBy: actingUser().name,
    url: DEMO_PDF, // demo only: every uploaded file previews as the same sample PDF
  };
  review.versions.push(version);
  return version;
};

const pendingUploads = new Map();

// ---------------------------------------------------------------------------
// Mock teams
// ---------------------------------------------------------------------------

const mockTeams = [
  {
    id: 'team-1',
    name: 'Design Team Alpha',
    description: 'Main design team for client projects',
    members: [
      { email: 'sarah@example.com', name: 'Sarah Johnson', role: 'Designer' },
      { email: 'mike@example.com', name: 'Mike Chen', role: 'Designer' },
    ],
    createdAt: new Date(Date.now() - 60 * DAY).toISOString(),
    updatedAt: new Date(Date.now() - 60 * DAY).toISOString(),
  },
  {
    id: 'team-2',
    name: 'Brand Guidelines Team',
    description: 'Team responsible for brand consistency',
    members: [{ email: 'alex@example.com', name: 'Alex Rodriguez', role: 'Designer' }],
    createdAt: new Date(Date.now() - 45 * DAY).toISOString(),
    updatedAt: new Date(Date.now() - 45 * DAY).toISOString(),
  },
];

const findTeam = (teamId) => {
  const team = mockTeams.find((t) => t.id === teamId);
  if (!team) throw httpError(404, 'Team not found');
  return team;
};

// ---------------------------------------------------------------------------
// Mock API: one method per contract route (see docs/REVIEW_API.md)
// ---------------------------------------------------------------------------

export const mockAPI = {
  // Reviews
  async listReviews({ workflowState, q, showExpired = false } = {}) {
    await delay();
    const query = (q || '').trim().toLowerCase();
    const reviews = mockReviews
      .filter((r) => showExpired || !isExpired(r))
      .filter((r) => !workflowState || r.workflowState === workflowState)
      .filter((r) => !query || r.filename.toLowerCase().includes(query) || (r.designer || '').toLowerCase().includes(query))
      .map(toSummary);
    return { reviews, total: reviews.length };
  },

  async getReview(reviewId, password = null) {
    await delay();
    return toReview(findReview(reviewId, { password, checkPassword: true }));
  },

  async getVersionUrl(reviewId, versionId, password = null) {
    await delay(150);
    const review = findReview(reviewId, { password, checkPassword: true });
    const version = review.versions.find((v) => v.id === versionId);
    if (!version) throw httpError(404, 'Version not found');
    return version.url || DEMO_PDF;
  },

  async completeReview(reviewId) {
    await delay();
    const review = findReview(reviewId);
    review.completed = true;
    // Completing expires the link immediately, as on the server
    review.expiresAt = now();
    history(review, 'completed');
    save();
    return toReview(review);
  },

  async updateSharing(reviewId, sharingMode, approvedEmails = []) {
    await delay();
    const review = findReview(reviewId);
    review.sharingMode = sharingMode;
    review.approvedEmails = sharingMode === 'approved_emails' ? approvedEmails : [];
    history(review, 'sharing_changed');
    save();
    return toReview(review);
  },

  async updatePassword(reviewId, password) {
    await delay();
    const review = findReview(reviewId);
    review.password = password || null;
    history(review, password ? 'password_set' : 'password_removed');
    save();
    return { hasPassword: !!review.password };
  },

  async extendExpiration(reviewId, days = 30) {
    await delay();
    if (!(days >= 1 && days <= 90)) throw httpError(400, 'days must be between 1 and 90');
    const review = findReview(reviewId);
    const base = Math.max(Date.now(), new Date(review.expiresAt).getTime());
    review.expiresAt = new Date(base + days * DAY).toISOString();
    review.extended = true;
    history(review, 'extended', { days });
    save();
    return toReview(review);
  },

  // Creating reviews
  async createUpload({ filename, password, bypassClientReview, sharingMode, approvedEmails, teamId } = {}) {
    await delay();
    if (!filename) throw httpError(400, 'filename is required');
    const review = createReview({ filename, password, bypassClientReview, sharingMode, approvedEmails, teamId, sourceType: 'upload' });
    const token = newId('tok');
    pendingUploads.set(token, review.id);
    save();
    return { reviewId: review.id, uploadUrl: `mock://upload/${review.id}/${token}` };
  },

  async putUpload(uploadUrl, file) {
    await delay(600);
    const token = uploadUrl.split('/').pop();
    const reviewId = pendingUploads.get(token);
    if (!reviewId) throw httpError(403, 'Upload link is invalid or already used');
    pendingUploads.delete(token);
    const review = findReview(reviewId);
    const version = addVersion(review, { filename: file?.name || review.filename, label: 'Version 1', contentType: file?.type, size: file?.size });
    save();
    return { success: true, versionId: version.id };
  },

  async createFromUrl({ url, filename, password, bypassClientReview, sharingMode, approvedEmails, teamId } = {}) {
    await delay();
    if (!/^https?:\/\//i.test(url || '')) throw httpError(400, 'url must be an http(s) URL');
    const name = filename || url.split('/').filter(Boolean).pop() || 'External Design Link';
    const review = createReview({ filename: name, password, bypassClientReview, sharingMode, approvedEmails, teamId, sourceType: 'url', url });
    save();
    return { reviewId: review.id, review: toReview(review) };
  },

  // Versions
  async uploadVersion(reviewId, file, label, notes, type) {
    await delay(800);
    const review = findReview(reviewId);
    const version = addVersion(review, { filename: file?.name, label, notes, type, contentType: file?.type, size: file?.size });
    history(review, 'version_uploaded', { versionLabel: version.label });
    save();
    return clone(version);
  },

  // Workflow
  async moveToClientReview(reviewId) {
    await delay();
    const review = findReview(reviewId);
    if (review.bypassClientReview) throw httpError(409, 'This review bypasses client review');
    transition(review, 'draft', 'client_review', 'moved_to_review');
    save();
    return toReview(review);
  },

  async moveToArtDirectorReview(reviewId) {
    await delay();
    const review = findReview(reviewId);
    const from = review.bypassClientReview ? ['client_approved', 'draft'] : 'client_approved';
    transition(review, from, 'art_director_review', 'moved_to_review');
    save();
    return toReview(review);
  },

  async approve(reviewId, stage) {
    await delay();
    const review = findReview(reviewId);
    const next = { client_review: 'client_approved', art_director_review: 'creative_director_review', creative_director_review: 'approved' };
    if (stage !== review.workflowState || !next[stage]) throw httpError(409, `Cannot approve from ${review.workflowState}`);
    transition(review, stage, next[stage], 'approved');
    save();
    return toReview(review);
  },

  async reject(reviewId, stage, reason = null) {
    await delay();
    const review = findReview(reviewId);
    const reviewStages = ['client_review', 'art_director_review', 'creative_director_review'];
    if (stage !== review.workflowState || !reviewStages.includes(stage)) throw httpError(409, `Cannot reject from ${review.workflowState}`);
    // Back to draft, recorded as the server does
    transition(review, stage, 'draft', 'rejected', { reason: reason || '' });
    save();
    return toReview(review);
  },

  async resubmit(reviewId, targetStage) {
    await delay();
    const review = findReview(reviewId);
    const targets = ['client_review', 'art_director_review', 'creative_director_review'];
    if (!targets.includes(targetStage)) throw httpError(400, 'Invalid targetStage');
    transition(review, 'draft', targetStage, 'resubmitted');
    save();
    return toReview(review);
  },

  // Comments
  async getComments(reviewId, versionId = null) {
    await delay(150);
    const review = findReview(reviewId);
    return clone(review.comments.filter((c) => !versionId || c.version === versionId));
  },

  async addComment(reviewId, { text, version, type, resolved = false, annotationId, annotationData } = {}) {
    await delay(200);
    const review = findReview(reviewId);
    const user = actingUser();
    const comment = {
      id: newId('cmt'),
      text,
      author: user.name,
      authorEmail: user.email,
      version,
      type,
      resolved,
      ...(annotationId ? { annotationId } : {}),
      ...(annotationData ? { annotationData } : {}),
      replies: [],
      reactions: {},
      timestamp: now(),
    };
    review.comments.push(comment);
    save();
    return clone(comment);
  },

  async updateComment(reviewId, commentId, updates = {}) {
    await delay(150);
    const comment = findComment(findReview(reviewId), commentId);
    ['text', 'resolved', 'annotationData'].forEach((key) => {
      if (updates[key] !== undefined) comment[key] = updates[key];
    });
    save();
    return clone(comment);
  },

  async deleteComment(reviewId, commentId) {
    await delay(150);
    const review = findReview(reviewId);
    findComment(review, commentId);
    review.comments = review.comments.filter((c) => c.id !== commentId);
    save();
  },

  async addReply(reviewId, commentId, text) {
    await delay(200);
    const comment = findComment(findReview(reviewId), commentId);
    const user = actingUser();
    const reply = { id: newId('rpl'), text, author: user.name, authorEmail: user.email, timestamp: now(), reactions: {} };
    comment.replies.push(reply);
    save();
    return clone(reply);
  },

  async toggleReaction(reviewId, commentId, emoji) {
    await delay(100);
    const comment = findComment(findReview(reviewId), commentId);
    toggleReaction(comment, emoji);
    save();
    return clone(comment);
  },

  async toggleReplyReaction(reviewId, commentId, replyId, emoji) {
    await delay(100);
    const comment = findComment(findReview(reviewId), commentId);
    const reply = comment.replies.find((r) => r.id === replyId);
    if (!reply) throw httpError(404, 'Reply not found');
    toggleReaction(reply, emoji);
    save();
    return clone(comment);
  },

  // Admin (no admin key needed in demo mode)
  async adminListReviews(showExpired = false) {
    await delay();
    return mockReviews.filter((r) => showExpired || !isExpired(r)).map(toSummary);
  },

  async adminExtend(reviewId, days = 7) {
    await delay();
    if (!(days >= 1 && days <= 365)) throw httpError(400, 'days must be between 1 and 365');
    const review = findReview(reviewId, { allowExpired: true });
    const base = Math.max(Date.now(), new Date(review.expiresAt).getTime());
    review.expiresAt = new Date(base + days * DAY).toISOString();
    review.extended = true;
    history(review, 'extended', { days });
    save();
    return toReview(review);
  },

  async adminReactivate(reviewId) {
    await delay();
    const review = findReview(reviewId, { allowExpired: true });
    review.expiresAt = new Date(Date.now() + 30 * DAY).toISOString();
    review.completed = false;
    history(review, 'reactivated');
    save();
    return toReview(review);
  },

  async adminResetPassword(reviewId, password) {
    await delay();
    const review = findReview(reviewId, { allowExpired: true });
    review.password = password || null;
    history(review, password ? 'password_set' : 'password_removed');
    save();
    return { hasPassword: !!review.password };
  },

  async adminDelete(reviewId) {
    await delay();
    const index = mockReviews.findIndex((r) => r.id === reviewId);
    if (index === -1) throw httpError(404, 'Review not found');
    mockReviews.splice(index, 1);
    save();
  },

  async adminBatchDelete(ids = []) {
    await delay();
    let deleted = 0;
    ids.forEach((id) => {
      const index = mockReviews.findIndex((r) => r.id === id);
      if (index !== -1) {
        mockReviews.splice(index, 1);
        deleted += 1;
      }
    });
    save();
    return { deleted };
  },

  // Teams
  async getTeams() {
    await delay();
    return clone(mockTeams);
  },

  async getTeam(teamId) {
    await delay();
    return clone(findTeam(teamId));
  },

  async createTeam(name, description = '') {
    await delay();
    const team = { id: newId('team'), name, description: description || '', members: [], createdAt: now(), updatedAt: now() };
    mockTeams.push(team);
    return clone(team);
  },

  async updateTeam(teamId, updates = {}) {
    await delay();
    const team = findTeam(teamId);
    if (updates.name !== undefined) team.name = updates.name;
    if (updates.description !== undefined) team.description = updates.description;
    team.updatedAt = now();
    return clone(team);
  },

  async deleteTeam(teamId) {
    await delay();
    const index = mockTeams.findIndex((t) => t.id === teamId);
    if (index === -1) throw httpError(404, 'Team not found');
    mockTeams.splice(index, 1);
  },

  async addMember(teamId, email, name, role) {
    await delay();
    const team = findTeam(teamId);
    if (team.members.some((m) => m.email.toLowerCase() === email.toLowerCase())) {
      throw httpError(409, 'That person is already a member of this team');
    }
    team.members.push({ email, name, role: role || 'Designer' });
    team.updatedAt = now();
    return clone(team);
  },

  async updateMemberRole(teamId, email, role) {
    await delay();
    const team = findTeam(teamId);
    const member = team.members.find((m) => m.email === email);
    if (!member) throw httpError(404, 'Member not found');
    member.role = role;
    team.updatedAt = now();
    return clone(team);
  },

  async removeMember(teamId, email) {
    await delay();
    const team = findTeam(teamId);
    const index = team.members.findIndex((m) => m.email === email);
    if (index === -1) throw httpError(404, 'Member not found');
    team.members.splice(index, 1);
    team.updatedAt = now();
    return clone(team);
  },
};
