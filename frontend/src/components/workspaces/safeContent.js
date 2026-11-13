import DOMPurify from 'dompurify';
import { marked } from 'marked';

/**
 * Workspace items hold user-supplied markup (icon SVG, guideline Markdown/HTML)
 * and URLs. The server validates shapes but does not sanitize, so everything
 * is made safe here before it reaches the DOM (docs/WORKSPACES.md).
 */

/** The URL if it is http(s), otherwise null (never javascript:, data:, …) */
export const safeHttpUrl = (value) => {
  if (typeof value !== 'string' || !value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
};

/**
 * A data: URI for an icon's SVG, for use in <img src>. It is sanitized with
 * DOMPurify's SVG profile first; as an image, any script left would not run anyway.
 */
export const svgDataUri = (svg) => {
  if (typeof svg !== 'string' || !svg.trim()) return null;
  const clean = DOMPurify.sanitize(svg, { USE_PROFILES: { svg: true, svgFilters: true } });
  if (!clean || !/<svg[\s>]/i.test(clean)) return null;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(clean)}`;
};

/** Guideline content (Markdown, HTML allowed) as sanitized HTML for v-html */
export const renderMarkdown = (source) => {
  if (typeof source !== 'string' || !source.trim()) return '';
  const html = marked.parse(source, { async: false });
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['style', 'form', 'input', 'button', 'iframe', 'object', 'embed'],
    FORBID_ATTR: ['style'],
  });
};
