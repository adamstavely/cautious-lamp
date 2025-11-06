/**
 * Service to sync WebViewer annotations with backend comments
 * This implements Option 1: Keep WebViewer's native annotation system
 * but sync annotations with the backend comment API
 */

/**
 * Convert a comment from backend format to WebViewer annotation
 */
export const commentToAnnotation = (comment, instance) => {
  const { Annotations } = instance.Core;
  const annotation = new Annotations.TextAnnotation();
  
  // Set position and page
  annotation.PageNumber = comment.pageNumber || 1;
  annotation.X = comment.x || 100;
  annotation.Y = comment.y || 100;
  
  // Set content
  annotation.setContents(comment.text || '');
  annotation.Author = comment.author || 'Unknown';
  
  // Store custom data in annotation for our metadata
  annotation.customData = {
    commentId: comment.id,
    resolved: comment.resolved || false,
    version: comment.version || null,
    timestamp: comment.timestamp || new Date().toISOString(),
    reactions: comment.reactions || [],
    replies: comment.replies || []
  };
  
  // Set color based on resolved status
  if (comment.resolved) {
    annotation.StrokeColor = new Annotations.Color(76, 175, 80); // Green
  } else {
    annotation.StrokeColor = new Annotations.Color(33, 150, 243); // Blue
  }
  
  return annotation;
};

/**
 * Convert a WebViewer annotation back to comment format
 */
export const annotationToComment = (annotation) => {
  const customData = annotation.customData || {};
  return {
    id: customData.commentId || annotation.Id,
    text: annotation.getContents() || '',
    author: annotation.Author || 'Unknown',
    timestamp: customData.timestamp || new Date().toISOString(),
    version: customData.version || null,
    resolved: customData.resolved || false,
    reactions: customData.reactions || [],
    replies: customData.replies || [],
    pageNumber: annotation.PageNumber,
    x: annotation.X,
    y: annotation.Y
  };
};

/**
 * Load comments from backend and add them as annotations to WebViewer
 */
export const loadCommentsAsAnnotations = async (reviewId, annotationManager, instance, mockAPI = null) => {
  try {
    let comments = [];
    
    if (mockAPI) {
      comments = await mockAPI.getComments(reviewId);
    } else {
      const response = await fetch(`/review/${reviewId}/comments`);
      comments = await response.json();
    }
    
    // Clear existing annotations
    const existingAnnotations = annotationManager.getAnnotationsList();
    annotationManager.deleteAnnotations(existingAnnotations);
    
    // Convert comments to annotations and add them
    const annotations = comments.map(comment => commentToAnnotation(comment, instance));
    annotations.forEach(annotation => {
      annotationManager.addAnnotation(annotation);
    });
    
    // Draw annotations
    annotationManager.drawAnnotationsFromList(annotations);
    
    return annotations;
  } catch (error) {
    console.error('Failed to load comments as annotations:', error);
    return [];
  }
};

/**
 * Save an annotation to backend as a comment
 */
export const saveAnnotationToBackend = async (annotation, reviewId, mockAPI = null) => {
  try {
    const comment = annotationToComment(annotation);
    
    if (mockAPI) {
      return await mockAPI.addComment(reviewId, comment);
    } else {
      const response = await fetch(`/review/${reviewId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(comment)
      });
      return await response.json();
    }
  } catch (error) {
    console.error('Failed to save annotation to backend:', error);
    throw error;
  }
};

/**
 * Update an annotation in backend
 */
export const updateAnnotationInBackend = async (annotation, reviewId, mockAPI = null) => {
  try {
    const comment = annotationToComment(annotation);
    
    if (mockAPI) {
      return await mockAPI.updateComment(reviewId, comment.id, comment);
    } else {
      const response = await fetch(`/review/${reviewId}/comments/${comment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(comment)
      });
      return await response.json();
    }
  } catch (error) {
    console.error('Failed to update annotation in backend:', error);
    throw error;
  }
};

/**
 * Delete an annotation from backend
 */
export const deleteAnnotationFromBackend = async (annotation, reviewId, mockAPI = null) => {
  try {
    const comment = annotationToComment(annotation);
    
    if (mockAPI) {
      // Note: mockAPI may not have deleteComment, handle gracefully
      console.log('Delete comment:', comment.id);
      return;
    } else {
      await fetch(`/review/${reviewId}/comments/${comment.id}`, {
        method: 'DELETE'
      });
    }
  } catch (error) {
    console.error('Failed to delete annotation from backend:', error);
    throw error;
  }
};

/**
 * Update annotation custom data
 */
export const updateAnnotationCustomData = (annotation, updates) => {
  if (!annotation.customData) {
    annotation.customData = {};
  }
  Object.assign(annotation.customData, updates);
  return annotation;
};

