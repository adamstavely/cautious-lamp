// Mock data and API simulation for testing without backend

// Save reviews to localStorage
const saveReviewsToStorage = (reviews) => {
  try {
    localStorage.setItem('mockReviews', JSON.stringify(reviews));
  } catch (error) {
    console.error('Failed to save reviews to storage:', error);
  }
};

// Load persisted reviews from localStorage and merge with defaults
const initializeMockReviews = (defaultReviews) => {
  try {
    const persisted = localStorage.getItem('mockReviews');
    if (persisted) {
      const parsed = JSON.parse(persisted);
      // Merge persisted data with defaults, keeping defaults for new reviews
      const merged = defaultReviews.map(defaultReview => {
        const persistedReview = parsed.find(r => r.id === defaultReview.id);
        if (persistedReview) {
          // Merge: keep defaults but override with persisted workflow state and history
          return {
            ...defaultReview,
            workflowState: persistedReview.workflowState,
            workflowHistory: persistedReview.workflowHistory || defaultReview.workflowHistory,
            completed: persistedReview.completed !== undefined ? persistedReview.completed : defaultReview.completed,
            password: persistedReview.password !== undefined ? persistedReview.password : defaultReview.password,
            expiresAt: persistedReview.expiresAt || defaultReview.expiresAt,
            extended: persistedReview.extended !== undefined ? persistedReview.extended : defaultReview.extended,
            sharingMode: persistedReview.sharingMode || defaultReview.sharingMode,
            approvedEmails: persistedReview.approvedEmails || defaultReview.approvedEmails || [],
            versions: persistedReview.versions || defaultReview.versions,
            comments: persistedReview.comments || defaultReview.comments
          };
        }
        return defaultReview;
      });
      // Add any persisted reviews that don't exist in defaults (newly created reviews)
      parsed.forEach(persistedReview => {
        if (!merged.find(r => r.id === persistedReview.id)) {
          merged.push(persistedReview);
        }
      });
      return merged;
    }
  } catch (error) {
    console.error('Failed to load persisted reviews:', error);
  }
  return defaultReviews;
};

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

// Initialize mockReviews with persisted data if available
let mockReviews = initializeMockReviews(defaultMockReviews);

let mockAdminLinks = [
  {
    id: 'admin-1',
    filename: 'Website Design v2.pdf',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    extended: false,
    hasPassword: false,
    designer: 'Sarah Johnson'
  },
  {
    id: 'admin-2', 
    filename: 'Mobile App Wireframes.sketch',
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    extended: false,
    hasPassword: true,
    designer: 'Mike Chen'
  },
  {
    id: 'admin-3',
    filename: 'Brand Guidelines.ai', 
    expiresAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Expired
    extended: true,
    hasPassword: true,
    designer: 'Alex Rodriguez'
  }
];

export { mockReviews };

// Mock API functions
export const mockAPI = {
  // Upload simulation
  upload: async (filename, password, bypassClientReview = false, sharingMode = 'anyone', approvedEmails = []) => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate upload delay
    
    // Determine initial workflow state
    let initialWorkflowState = 'draft';
    let workflowHistory = [
      { stage: 'draft', action: 'uploaded', user: 'Designer', timestamp: new Date().toISOString() }
    ];
    
    if (bypassClientReview) {
      // Skip client review, go directly to art director review
      initialWorkflowState = 'art_director_review';
      workflowHistory = [
        { stage: 'draft', action: 'uploaded', user: 'Designer', timestamp: new Date().toISOString() },
        { stage: 'art_director_review', action: 'bypassed_client_review', user: 'Designer', timestamp: new Date().toISOString() }
      ];
    }
    
    const newReview = {
      id: `review-${Date.now()}`,
      filename: filename,
      password: password || null,
      designer: 'Designer', // In real app, this would come from auth
      designerEmail: 'designer@example.com', // In real app, this would come from auth
      teamId: null, // Will be set when associated with a team
      workflowState: initialWorkflowState,
      workflowHistory: workflowHistory,
      sharingMode: sharingMode, // 'anyone' or 'restricted'
      approvedEmails: approvedEmails, // Array of email addresses
      versions: [
        { 
          id: 'v1', 
          label: 'Version 1', 
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' 
        }
      ],
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      extended: false,
      comments: []
    };
    
    mockReviews.push(newReview);
    mockAdminLinks.push({
      id: `admin-${newReview.id}`,
      filename: newReview.filename,
      expiresAt: newReview.expiresAt,
      extended: newReview.extended,
      hasPassword: !!newReview.password,
      designer: newReview.designer,
      workflowState: newReview.workflowState
    });
    
    // Save to localStorage
    saveReviewsToStorage(mockReviews);
    
    return { uploadUrl: 'mock://upload', reviewId: newReview.id };
  },

  // Create review from external URL
  createReviewFromUrl: async (url, password, bypassClientReview = false, sharingMode = 'anyone', approvedEmails = []) => {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
    
    // Extract filename from URL or use a default
    const urlParts = url.split('/');
    const filename = urlParts[urlParts.length - 1] || 'External Design Link';
    
    // Determine initial workflow state
    let initialWorkflowState = 'draft';
    let workflowHistory = [
      { stage: 'draft', action: 'created_from_url', user: 'Designer', timestamp: new Date().toISOString() }
    ];
    
    if (bypassClientReview) {
      // Skip client review, go directly to art director review
      initialWorkflowState = 'art_director_review';
      workflowHistory = [
        { stage: 'draft', action: 'created_from_url', user: 'Designer', timestamp: new Date().toISOString() },
        { stage: 'art_director_review', action: 'bypassed_client_review', user: 'Designer', timestamp: new Date().toISOString() }
      ];
    }
    
    const newReview = {
      id: `review-${Date.now()}`,
      filename: filename,
      password: password || null,
      designer: 'Designer', // In real app, this would come from auth
      designerEmail: 'designer@example.com', // In real app, this would come from auth
      teamId: null, // Will be set when associated with a team
      workflowState: initialWorkflowState,
      workflowHistory: workflowHistory,
      sharingMode: sharingMode, // 'anyone' or 'restricted'
      approvedEmails: approvedEmails, // Array of email addresses
      versions: [
        { 
          id: 'v1', 
          label: 'External Link', 
          url: url // Use the provided URL directly
        }
      ],
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      extended: false,
      comments: []
    };
    
    mockReviews.push(newReview);
    mockAdminLinks.push({
      id: `admin-${newReview.id}`,
      filename: newReview.filename,
      expiresAt: newReview.expiresAt,
      extended: newReview.extended,
      hasPassword: !!newReview.password,
      designer: newReview.designer,
      workflowState: newReview.workflowState
    });
    
    // Save to localStorage
    saveReviewsToStorage(mockReviews);
    
    return { reviewId: newReview.id };
  },

  // Get review data
  getReview: async (reviewId, password = null) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const review = mockReviews.find(r => r.id === reviewId);
    if (!review) {
      throw new Error('Review not found');
    }
    
    if (review.password && review.password !== password) {
      const error = new Error('Unauthorized');
      error.response = { status: 401 };
      throw error;
    }
    
    // Return a deep copy to ensure reactivity works properly
    return JSON.parse(JSON.stringify(review));
  },

  // Get version URL
  getVersion: async (reviewId, versionId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const review = mockReviews.find(r => r.id === reviewId);
    if (!review) {
      throw new Error('Review not found');
    }
    
    const version = review.versions.find(v => v.id === versionId);
    if (!version) {
      throw new Error('Version not found');
    }
    
    return { url: version.url };
  },

  // Admin functions
  getAdminLinks: async (showExpired = false) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let links = showExpired ? mockAdminLinks : mockAdminLinks.filter(link => {
      const now = new Date();
      return new Date(link.expiresAt) > now;
    });
    
    // Ensure password info and designer info are synced from reviews
    return links.map(link => {
      const review = mockReviews.find(r => r.filename === link.filename);
      return {
        ...link,
        hasPassword: review ? !!review.password : link.hasPassword || false,
        designer: review ? review.designer : link.designer || 'Unknown'
      };
    });
  },

  extendLink: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const link = mockAdminLinks.find(l => l.id === id);
    if (link) {
      link.extended = true;
      link.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      
      // Find corresponding review and add history entry
      const review = mockReviews.find(r => r.filename === link.filename);
      if (review) {
        if (!review.workflowHistory) {
          review.workflowHistory = [];
        }
        review.workflowHistory.push({
          stage: review.workflowState || 'draft',
          action: 'extended',
          user: 'Admin', // In real app, this would come from auth
          timestamp: new Date().toISOString(),
          days: 7
        });
      }
    }
  },

  overrideLink: async (id, days) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const link = mockAdminLinks.find(l => l.id === id);
    if (link) {
      link.expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
      
      // Find corresponding review and add history entry
      const review = mockReviews.find(r => r.filename === link.filename);
      if (review) {
        if (!review.workflowHistory) {
          review.workflowHistory = [];
        }
        review.workflowHistory.push({
          stage: review.workflowState || 'draft',
          action: 'extended',
          user: 'Admin', // In real app, this would come from auth
          timestamp: new Date().toISOString(),
          days: 7
        });
      }
    }
  },

  deleteLink: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const linkIndex = mockAdminLinks.findIndex(l => l.id === id);
    if (linkIndex !== -1) {
      mockAdminLinks.splice(linkIndex, 1);
    }
  },

  batchDelete: async (ids) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    mockAdminLinks = mockAdminLinks.filter(link => !ids.includes(link.id));
  },

  resetPassword: async (id, newPassword) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find the corresponding review by admin link ID
    const adminLink = mockAdminLinks.find(l => l.id === id);
    if (adminLink) {
      const review = mockReviews.find(r => r.filename === adminLink.filename);
      if (review) {
        const hadPassword = !!review.password;
        const hasPassword = !!newPassword;
        
        // Add history entry before changing password (to track the change)
        if (review.password !== newPassword) {
          if (!review.workflowHistory) {
            review.workflowHistory = [];
          }
          review.workflowHistory.push({
            stage: review.workflowState || 'draft',
            action: hasPassword ? 'password_set' : 'password_removed',
            user: 'Admin', // In real app, this would come from auth
            timestamp: new Date().toISOString()
          });
        }
        
        review.password = newPassword || null;
        adminLink.hasPassword = !!newPassword;
      }
    }
  },

  // Comment functions
  getComments: async (reviewId, versionId = null) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const review = mockReviews.find(r => r.id === reviewId);
    if (!review || !review.comments) {
      return [];
    }
    
    // Return all comments for the review
    // Comments are tagged with version but shown for all versions
    return review.comments || [];
  },

  addComment: async (reviewId, comment) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const review = mockReviews.find(r => r.id === reviewId);
    if (review) {
      if (!review.comments) {
        review.comments = [];
      }
      // Ensure comment has all required fields
      const newComment = {
        ...comment,
        id: comment.id || `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: comment.timestamp || new Date().toISOString(),
        resolved: comment.resolved !== undefined ? comment.resolved : false,
        replies: comment.replies || [],
        reactions: comment.reactions || []
      };
      review.comments.push(newComment);
      return newComment;
    }
    
    return comment;
  },

  addReply: async (reviewId, commentId, reply) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const review = mockReviews.find(r => r.id === reviewId);
    if (review && review.comments) {
      const comment = review.comments.find(c => c.id === commentId);
      if (comment) {
        if (!comment.replies) {
          comment.replies = [];
        }
        comment.replies.push(reply);
      }
    }
    
    return reply;
  },

  updateComment: async (reviewId, commentId, updates) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const review = mockReviews.find(r => r.id === reviewId);
    if (review && review.comments) {
      const comment = review.comments.find(c => c.id === commentId);
      if (comment) {
        Object.assign(comment, updates);
      }
    }
  },

  toggleEmojiReaction: async (reviewId, commentId, emoji) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const review = mockReviews.find(r => r.id === reviewId);
    if (review && review.comments) {
      const comment = review.comments.find(c => c.id === commentId);
      if (comment) {
        if (!comment.reactions) {
          comment.reactions = [];
        }
        
        const currentUser = 'Current User'; // In real app, this would come from auth
        // Find existing reaction by this user with this emoji
        const existingIndex = comment.reactions.findIndex(r => 
          (r.user === currentUser || r.userEmail === currentUser) && 
          (r.emoji || '👍') === emoji
        );
        
        if (existingIndex >= 0) {
          // Remove reaction (unreact) - toggle off this specific emoji
          comment.reactions.splice(existingIndex, 1);
        } else {
          // Add new emoji reaction (users can have multiple emoji reactions)
          comment.reactions.push({
            user: currentUser,
            emoji: emoji,
            timestamp: new Date().toISOString()
          });
        }
      }
    }
  },

  toggleEmojiReactionOnReply: async (reviewId, commentId, replyId, emoji) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const review = mockReviews.find(r => r.id === reviewId);
    if (review && review.comments) {
      const comment = review.comments.find(c => c.id === commentId);
      if (comment && comment.replies) {
        const reply = comment.replies.find(r => r.id === replyId);
        if (reply) {
          if (!reply.reactions) {
            reply.reactions = [];
          }
          
          const currentUser = 'Current User'; // In real app, this would come from auth
          // Find existing reaction by this user with this emoji
          const existingIndex = reply.reactions.findIndex(r => 
            (r.user === currentUser || r.userEmail === currentUser) && 
            (r.emoji || '👍') === emoji
          );
          
          if (existingIndex >= 0) {
            // Remove reaction (unreact) - toggle off this specific emoji
            reply.reactions.splice(existingIndex, 1);
          } else {
            // Add new emoji reaction (users can have multiple emoji reactions)
            reply.reactions.push({
              user: currentUser,
              emoji: emoji,
              timestamp: new Date().toISOString()
            });
          }
        }
      }
    }
  },

  // Workflow approval methods
  moveToClientReview: async (reviewId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const review = mockReviews.find(r => r.id === reviewId);
    if (review) {
      review.workflowState = 'client_review';
      review.workflowHistory.push({
        stage: 'client_review',
        action: 'moved_to_review',
        user: review.designer || 'Designer',
        timestamp: new Date().toISOString()
      });
      
      // Update admin link
      const adminLink = mockAdminLinks.find(l => l.id === `admin-${reviewId}`);
      if (adminLink) {
        adminLink.workflowState = 'client_review';
      }
      
      // Save to localStorage
      saveReviewsToStorage(mockReviews);
    }
  },

  approveWorkflowStage: async (reviewId, stage, user) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const review = mockReviews.find(r => r.id === reviewId);
    if (!review) {
      throw new Error('Review not found');
    }
    
    // Define the workflow progression
    const workflowFlow = {
      'client_review': 'client_approved', // Client approves -> moves to client_approved only
      'art_director_review': 'art_director_approved', // Art director approves -> moves to art_director_approved, then auto to creative_director_review
      'creative_director_review': 'approved' // Creative director approves -> final approval
    };
    
    // Check if current state matches the stage being approved
    if (review.workflowState === stage) {
      const nextStage = workflowFlow[stage];
      if (nextStage) {
        // Add approval history entry first
        if (!review.workflowHistory) {
          review.workflowHistory = [];
        }
        review.workflowHistory.push({
          stage: nextStage,
          action: 'approved',
          user: user?.name || user || 'Current User',
          timestamp: new Date().toISOString()
        });
        
        // Update workflow state
        review.workflowState = nextStage;
        
        // Auto-advance only for art_director_approved -> creative_director_review
        if (nextStage === 'art_director_approved') {
          // Add a small delay to ensure state is updated
          await new Promise(resolve => setTimeout(resolve, 50));
          review.workflowState = 'creative_director_review';
          review.workflowHistory.push({
            stage: 'creative_director_review',
            action: 'moved_to_review',
            user: 'System',
            timestamp: new Date().toISOString()
          });
        }
        
        // Update admin link if it exists
        const adminLink = mockAdminLinks.find(l => l.id === `admin-${reviewId}`);
        if (adminLink) {
          adminLink.workflowState = review.workflowState;
        }
        
        // Save to localStorage
        saveReviewsToStorage(mockReviews);
        
        return JSON.parse(JSON.stringify(review)); // Return updated review
      }
    }
    
    throw new Error('Invalid workflow stage for approval');
  },

  rejectWorkflowStage: async (reviewId, stage, user, reason) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const review = mockReviews.find(r => r.id === reviewId);
    if (!review) return;
    
    // Handle rejection based on stage
    if (stage === 'art_director_review') {
      // Art Director rejection -> AD Changes Requested
      review.workflowState = 'ad_changes_requested';
      review.workflowHistory.push({
        stage: 'ad_changes_requested',
        action: 'rejected',
        user: user || 'Art Director',
        reason: reason || '',
        timestamp: new Date().toISOString()
      });
    } else if (stage === 'creative_director_review') {
      // Creative Director rejection -> CD Changes Requested
      review.workflowState = 'cd_changes_requested';
      review.workflowHistory.push({
        stage: 'cd_changes_requested',
        action: 'rejected',
        user: user || 'Creative Director',
        reason: reason || '',
        timestamp: new Date().toISOString()
      });
    } else {
      // Client rejection -> back to client review
      review.workflowState = 'client_review';
      review.workflowHistory.push({
        stage: 'client_review',
        action: 'rejected',
        user: user || 'Current User',
        reason: reason || '',
        timestamp: new Date().toISOString()
      });
    }
    
    // Update admin link
    const adminLink = mockAdminLinks.find(l => l.id === `admin-${reviewId}`);
    if (adminLink) {
      adminLink.workflowState = review.workflowState;
    }
    
    // Save to localStorage
    saveReviewsToStorage(mockReviews);
    
    return JSON.parse(JSON.stringify(review));
  },
  
  // Move from changes requested back to review
  // Move from client approved to art director review (designer requests)
  moveToArtDirectorReview: async (reviewId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const review = mockReviews.find(r => r.id === reviewId);
    if (review && review.workflowState === 'client_approved') {
      review.workflowState = 'art_director_review';
      review.workflowHistory.push({
        stage: 'art_director_review',
        action: 'moved_to_review',
        user: review.designer || 'Designer',
        timestamp: new Date().toISOString()
      });
      
      // Update admin link
      const adminLink = mockAdminLinks.find(l => l.id === `admin-${reviewId}`);
      if (adminLink) {
        adminLink.workflowState = 'art_director_review';
      }
      
      // Save to localStorage
      saveReviewsToStorage(mockReviews);
    }
  },

  resubmitForReview: async (reviewId, targetStage) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const review = mockReviews.find(r => r.id === reviewId);
    if (!review) return;
    
    if (review.workflowState === 'ad_changes_requested') {
      review.workflowState = 'art_director_review';
      review.workflowHistory.push({
        stage: 'art_director_review',
        action: 'resubmitted',
        user: review.designer || 'Designer',
        timestamp: new Date().toISOString()
      });
    } else if (review.workflowState === 'cd_changes_requested') {
      review.workflowState = 'creative_director_review';
      review.workflowHistory.push({
        stage: 'creative_director_review',
        action: 'resubmitted',
        user: review.designer || 'Designer',
        timestamp: new Date().toISOString()
      });
    }
    
    // Update admin link
    const adminLink = mockAdminLinks.find(l => l.id === `admin-${reviewId}`);
    if (adminLink) {
      adminLink.workflowState = review.workflowState;
    }
    
    // Save to localStorage
    saveReviewsToStorage(mockReviews);
    
    return JSON.parse(JSON.stringify(review));
  },

  // Version upload functions
  uploadVersion: async (reviewId, filename, label, notes, type) => {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate upload time
    
    const review = mockReviews.find(r => r.id === reviewId);
    if (!review) {
      throw new Error('Review not found');
    }
    
    // Generate new version ID
    const versionNumber = review.versions.length + 1;
    const newVersion = {
      id: `v${versionNumber}`,
      label: label,
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', // Mock URL
      filename: filename,
      notes: notes,
      type: type,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Designer' // In real app, this would come from auth
    };
    
    review.versions.push(newVersion);
    
    // Add history entry for version upload
    if (!review.workflowHistory) {
      review.workflowHistory = [];
    }
    review.workflowHistory.push({
      stage: review.workflowState || 'draft',
      action: 'version_uploaded',
      user: review.designer || 'Designer',
      versionLabel: label,
      timestamp: new Date().toISOString()
    });
    
    // Save to localStorage
    saveReviewsToStorage(mockReviews);
    
    return newVersion;
  },

  // Mark review as completed and deactivate the link
  markReviewCompleted: async (reviewId, user) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const review = mockReviews.find(r => r.id === reviewId);
    if (!review) {
      throw new Error('Review not found');
    }
    
    // Mark as completed
    review.completed = true;
    
    // Deactivate the review link by setting expiresAt to current time (making it expired)
    review.expiresAt = new Date().toISOString();
    
    // Add history entry
    if (!review.workflowHistory) {
      review.workflowHistory = [];
    }
    review.workflowHistory.push({
      stage: review.workflowState || 'approved',
      action: 'completed',
      user: user?.name || user || 'Designer',
      timestamp: new Date().toISOString()
    });
    
    // Update corresponding admin link to expire it
    const adminLink = mockAdminLinks.find(l => l.id === `admin-${reviewId}`);
    if (adminLink) {
      adminLink.expiresAt = new Date().toISOString(); // Set to current time to expire it
    }
    
    // Save to localStorage
    saveReviewsToStorage(mockReviews);
    
    return JSON.parse(JSON.stringify(review));
  }
};

// Mock user context (in real app, this would come from auth)
export const getCurrentUser = () => {
  return {
    name: localStorage.getItem('currentDesigner') || 'Sarah Johnson',
    email: localStorage.getItem('currentUserEmail') || 'sarah@example.com',
    role: localStorage.getItem('userRole') || 'designer', // 'designer', 'art_director', 'creative_director'
    teamId: localStorage.getItem('currentUserTeamId') || 'team-1' // For art directors
  };
};

// Get filtered reviews based on user role
export const getFilteredReviews = (userRole, userEmail, userTeamId) => {
  if (userRole === 'creative_director') {
    // Creative Director sees all reviews across all teams
    return mockReviews;
  } else if (userRole === 'art_director') {
    // Art Director sees all reviews in their team
    return mockReviews.filter(review => review.teamId === userTeamId);
  } else if (userRole === 'designer') {
    // Designer sees only their own reviews
    return mockReviews.filter(review => review.designerEmail === userEmail || review.designer === localStorage.getItem('currentDesigner'));
  }
  // Default: return all (for clients/admins)
  return mockReviews;
};

// Mock teams data
let mockTeams = [
  {
    id: 'team-1',
    name: 'Design Team Alpha',
    description: 'Main design team for client projects',
    members: [
      { email: 'sarah@example.com', name: 'Sarah Johnson', role: 'Designer' },
      { email: 'mike@example.com', name: 'Mike Chen', role: 'Designer' }
    ],
    reviews: []
  },
  {
    id: 'team-2',
    name: 'Brand Guidelines Team',
    description: 'Team responsible for brand consistency',
    members: [
      { email: 'alex@example.com', name: 'Alex Rodriguez', role: 'Designer' }
    ],
    reviews: []
  }
];

// Teams API methods
export const teamsAPI = {
  getTeams: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockTeams;
  },

  createTeam: async (name, description = '') => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newTeam = {
      id: `team-${Date.now()}`,
      name: name,
      description: description,
      members: [],
      reviews: []
    };
    mockTeams.push(newTeam);
    return newTeam;
  },

  updateTeam: async (teamId, updates) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    const team = mockTeams.find(t => t.id === teamId);
    if (!team) {
      throw new Error('Team not found');
    }
    Object.assign(team, updates);
    return team;
  },

  deleteTeam: async (teamId) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockTeams.findIndex(t => t.id === teamId);
    if (index === -1) {
      throw new Error('Team not found');
    }
    mockTeams.splice(index, 1);
  },

  addTeamMember: async (teamId, member) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    const team = mockTeams.find(t => t.id === teamId);
    if (!team) {
      throw new Error('Team not found');
    }
    if (team.members.find(m => m.email === member.email)) {
      throw new Error('Member already exists');
    }
    // Ensure role is set, default to 'Designer' if not provided
    const memberWithRole = {
      ...member,
      role: member.role || 'Designer'
    };
    team.members.push(memberWithRole);
    return team;
  },

  removeTeamMember: async (teamId, email) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const team = mockTeams.find(t => t.id === teamId);
    if (!team) {
      throw new Error('Team not found');
    }
    const index = team.members.findIndex(m => m.email === email);
    if (index === -1) {
      throw new Error('Member not found');
    }
    team.members.splice(index, 1);
    return team;
  }
};

// Add teams methods to mockAPI
mockAPI.getTeams = teamsAPI.getTeams;
mockAPI.createTeam = teamsAPI.createTeam;
mockAPI.updateTeam = teamsAPI.updateTeam;
mockAPI.deleteTeam = teamsAPI.deleteTeam;
mockAPI.addTeamMember = teamsAPI.addTeamMember;
mockAPI.removeTeamMember = teamsAPI.removeTeamMember;

// Check if we're in mock mode (when API is not available)
export const isMockMode = async () => {
  // Force mock mode if explicitly set
  if (localStorage.getItem('forceMockMode') === 'true') {
    return true;
  }
  
  // Check if user wants to use real API or if not set, auto-detect
  const useRealAPI = localStorage.getItem('useRealAPI') === 'true' || localStorage.getItem('useRealAPI') === null;
  
  if (useRealAPI) {
    // Try to ping API health endpoint
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
      });
      if (response.ok) {
        return false; // API is available
      }
    } catch (error) {
      // CORS error or network error - use mock mode
      console.log('API not available or CORS error, using mock mode');
      return true;
    }
  }
  
  // Default to mock mode if explicitly disabled
  return true;
};
