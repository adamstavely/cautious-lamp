/**
 * A chat message as plain text for <tc-embed-widget>, which renders text only
 * (never HTML), keeping line breaks. The assistant writes light markdown, so
 * its bold, italic and code markers are dropped rather than shown.
 */
export function plainChatText(content) {
  return String(content ?? '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/(^|[^*\w])\*([^*\n]+?)\*(?=[^*\w]|$)/g, '$1$2')
    .replace(/`([^`\n]+?)`/g, '$1');
}

/**
 * Eero's reply as one message: the answer, then the components and tokens it
 * relates to (the widget has no links, so they're named for the person to find).
 */
export function eeroReplyText({ response, relatedComponents = [], relatedTokens = [] } = {}) {
  const lines = [plainChatText(response)];
  if (relatedComponents.length) lines.push(`Related components: ${relatedComponents.join(', ')}`);
  if (relatedTokens.length) lines.push(`Related tokens: ${relatedTokens.join(', ')}`);
  return lines.filter(Boolean).join('\n\n');
}
