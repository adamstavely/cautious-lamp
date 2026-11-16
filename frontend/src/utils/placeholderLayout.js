/**
 * Word widths for the SVG placeholder text generator: exactly `words` word
 * blocks on each of `lines` lines. Word widths are random, so lines vary in
 * length like real text; a line that would be wider than `maxWidth` has its
 * words scaled down to fit, so the word count is never cut short.
 */
const MIN_WORD_WIDTH = 4;

export const layoutPlaceholderLines = ({ words, lines, maxWidth = 600, wordSpacing = 8, random = Math.random }) => {
  const wordCount = Math.max(1, Math.round(words));
  const lineCount = Math.max(1, Math.round(lines));
  const gaps = (wordCount - 1) * wordSpacing;
  return Array.from({ length: lineCount }, () => {
    // Random word widths between 30 and 100px, to simulate text
    const widths = Array.from({ length: wordCount }, () => Math.round(random() * 70 + 30));
    const total = widths.reduce((sum, w) => sum + w, 0);
    if (total + gaps <= maxWidth) return widths;
    const room = maxWidth - gaps;
    return widths.map((w) => Math.max(MIN_WORD_WIDTH, Math.floor((w / total) * room)));
  });
};

/** Total drawn width of one line of word widths. */
export const lineWidth = (widths, wordSpacing = 8) =>
  widths.reduce((sum, w) => sum + w, 0) + Math.max(0, widths.length - 1) * wordSpacing;
