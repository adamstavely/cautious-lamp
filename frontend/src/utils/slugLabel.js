/** Labels for URL slugs, for breadcrumbs */

// Title-case a URL slug, keeping short joining words lower case ("voice-and-tone" → "Voice and Tone")
export const MINOR_WORDS = new Set(['a', 'an', 'and', 'as', 'at', 'by', 'for', 'in', 'of', 'on', 'or', 'the', 'to', 'vs', 'with']);
export const ACRONYMS = new Set(['ai', 'api', 'apca', 'cli', 'css', 'faq', 'hcd', 'html', 'ico', 'jaws', 'mcp', 'nasa', 'npm', 'png', 'px', 'sdk', 'seo', 'svg', 'sus', 'tlx', 'tui', 'ui', 'usg', 'ux']);
export const slugLabel = (slug) =>
  slug
    .split('-')
    .map((word, i) =>
      ACRONYMS.has(word) ? word.toUpperCase() : i > 0 && MINOR_WORDS.has(word) ? word : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(' ');
