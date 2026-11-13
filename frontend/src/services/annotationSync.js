/**
 * Sync WebViewer annotations with review comments.
 *
 * A comment drawn on the document carries `annotationId` (the WebViewer
 * annotation Id) and `annotationData` ({ format: 'xfdf', xfdf }) so it can be
 * redrawn later. Plain comments (no annotationData) live only in the sidebar.
 *
 * Only changes the user makes are sent to the backend. Annotations we import
 * or remove while (re)loading are flagged `imported`, and the change handler
 * ignores those, so loading never rewrites comments on the server.
 */

import { commentAPI } from './api.js';

export const ANNOTATION_COMMENT_TYPE = 'annotation';

/** Serialise one annotation as XFDF for `annotationData`. */
const exportAnnotationData = async (annotationManager, annotation) => ({
  format: 'xfdf',
  xfdf: await annotationManager.exportAnnotations({ annotationList: [annotation], links: false, widgets: false }),
});

const annotationText = (annotation) => {
  const contents = (annotation.getContents?.() || '').trim();
  return contents || `Annotation on page ${annotation.PageNumber || 1}`;
};

/**
 * Create the sync for one viewer. `getContext()` returns the current
 * { reviewId, versionId } so the sync always writes to what is on screen.
 * `onChange({ action, error })` is called after each user change is saved (or fails).
 */
export const createAnnotationSync = ({ annotationManager, getContext, onChange }) => {
  // annotation Id -> comment id, for the annotations on screen
  const commentIds = new Map();
  // annotation Id -> promise of the in-flight create, so a quick edit waits for it
  const pendingCreates = new Map();
  let loadToken = 0;

  /** Replace the annotations on screen with the comments' saved annotations. */
  const load = async () => {
    const { reviewId, versionId } = getContext();
    if (!reviewId) return [];
    const token = ++loadToken;
    const comments = await commentAPI.getComments(reviewId, versionId || null);
    if (token !== loadToken) return comments; // a newer load started

    const existing = annotationManager.getAnnotationsList();
    if (existing.length) {
      annotationManager.deleteAnnotations(existing, { imported: true, force: true });
    }
    commentIds.clear();

    for (const comment of comments) {
      const xfdf = comment.annotationData?.xfdf;
      if (!xfdf || (versionId && comment.version !== versionId)) continue;
      try {
        // Imported annotations fire annotationChanged with info.imported, which we skip.
        const annotations = await annotationManager.importAnnotations(xfdf);
        (annotations || []).forEach((annotation) => commentIds.set(annotation.Id, comment.id));
      } catch (error) {
        console.warn(`Could not draw the annotation for comment ${comment.id}:`, error);
      }
      if (token !== loadToken) return comments;
    }
    return comments;
  };

  const create = async (annotation) => {
    const { reviewId, versionId } = getContext();
    const saved = await commentAPI.addComment(reviewId, {
      text: annotationText(annotation),
      version: versionId,
      type: ANNOTATION_COMMENT_TYPE,
      annotationId: annotation.Id,
      annotationData: await exportAnnotationData(annotationManager, annotation),
    });
    commentIds.set(annotation.Id, saved.id);
    return saved;
  };

  const commentIdFor = async (annotation) => {
    await pendingCreates.get(annotation.Id)?.catch(() => {});
    return commentIds.get(annotation.Id);
  };

  /** WebViewer 'annotationChanged' handler: (annotations, action, info). */
  const handleChange = async (annotations, action, info = {}) => {
    // Skip anything we caused while loading.
    if (info?.imported) return;
    const { reviewId } = getContext();
    if (!reviewId) return;

    for (const annotation of annotations) {
      try {
        if (action === 'add') {
          const promise = create(annotation);
          pendingCreates.set(annotation.Id, promise);
          try {
            await promise;
          } finally {
            pendingCreates.delete(annotation.Id);
          }
        } else if (action === 'modify') {
          const commentId = await commentIdFor(annotation);
          if (!commentId) continue;
          await commentAPI.updateComment(reviewId, commentId, {
            text: annotationText(annotation),
            annotationData: await exportAnnotationData(annotationManager, annotation),
          });
        } else if (action === 'delete') {
          const commentId = await commentIdFor(annotation);
          if (!commentId) continue;
          await commentAPI.deleteComment(reviewId, commentId);
          commentIds.delete(annotation.Id);
        } else {
          continue;
        }
        onChange?.({ action, error: null });
      } catch (error) {
        console.error(`Failed to sync annotation (${action}):`, error);
        onChange?.({ action, error });
      }
    }
  };

  const dispose = () => {
    loadToken += 1;
    commentIds.clear();
    pendingCreates.clear();
  };

  return { load, handleChange, dispose };
};
