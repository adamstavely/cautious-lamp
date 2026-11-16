/**
 * Small re-indenting formatters for the HTML viewer's CSS and JS tabs.
 *
 * They only add line breaks after `{`, `;` and around `}` and re-indent by
 * brace depth. String literals ('…', "…", `…${…}…`), comments, regex
 * literals (JS) and url(…) (CSS) are copied untouched, and a `;` inside
 * (…) or […] (a for loop, a data URL) never starts a new line, so the
 * formatted code means exactly what the input meant.
 */

const INDENT = '  ';

// Index just past the string literal that starts at `start` (quote char at start).
const skipString = (src, start) => {
  const quote = src[start];
  let i = start + 1;
  while (i < src.length) {
    const ch = src[i];
    if (ch === '\\') i += 2;
    else if (ch === quote) return i + 1;
    else if (ch === '\n' && quote !== '`') return i; // unterminated: stop at the line end
    else i++;
  }
  return src.length;
};

// Index just past a JS template literal starting at `start`, including ${…} parts.
const skipTemplate = (src, start) => {
  let i = start + 1;
  while (i < src.length) {
    const ch = src[i];
    if (ch === '\\') i += 2;
    else if (ch === '`') return i + 1;
    else if (ch === '$' && src[i + 1] === '{') i = skipJsBlock(src, i + 2);
    else i++;
  }
  return src.length;
};

// Index just past the `}` that closes a ${ expression (src[start] is the first char inside).
const skipJsBlock = (src, start) => {
  let depth = 1;
  let i = start;
  while (i < src.length) {
    const ch = src[i];
    if (ch === '"' || ch === "'") i = skipString(src, i);
    else if (ch === '`') i = skipTemplate(src, i);
    else if (ch === '/' && src[i + 1] === '*') i = skipBlockComment(src, i);
    else if (ch === '/' && src[i + 1] === '/') i = skipLineComment(src, i);
    else {
      if (ch === '{') depth++;
      if (ch === '}') {
        depth--;
        if (depth === 0) return i + 1;
      }
      i++;
    }
  }
  return src.length;
};

const skipBlockComment = (src, start) => {
  const end = src.indexOf('*/', start + 2);
  return end === -1 ? src.length : end + 2;
};

const skipLineComment = (src, start) => {
  const end = src.indexOf('\n', start);
  return end === -1 ? src.length : end;
};

// Index just past a regex literal starting at `start` (the opening /).
const skipRegex = (src, start) => {
  let i = start + 1;
  let inClass = false;
  while (i < src.length) {
    const ch = src[i];
    if (ch === '\\') i += 2;
    else if (ch === '\n') return i;
    else if (ch === '[') { inClass = true; i++; }
    else if (ch === ']') { inClass = false; i++; }
    else if (ch === '/' && !inClass) {
      i++;
      while (i < src.length && /[a-z]/i.test(src[i])) i++; // flags
      return i;
    } else i++;
  }
  return src.length;
};

const REGEX_KEYWORDS = /(?:^|[^\w$])(?:return|typeof|instanceof|in|of|new|delete|void|throw|case|do|else|yield|await)$/;

// A `/` starts a regex when the code before it can't end an expression.
const regexAllowed = (before) => {
  const trimmed = before.replace(/\s+$/, '');
  if (!trimmed) return true;
  if (REGEX_KEYWORDS.test(trimmed)) return true;
  return /[(,=:[!&|?{};+\-*%<>~^]$/.test(trimmed);
};

/**
 * Shared engine. `opts.lang` is 'css' or 'js'.
 */
const reindent = (code, lang) => {
  const src = String(code ?? '').replace(/\r\n?/g, '\n');
  const isJs = lang === 'js';
  const lines = [];
  let line = '';
  let depth = 0;
  // Open brackets: 'brace' for {, 'paren' for ( and [
  const stack = [];

  const emit = () => {
    const text = line.trim();
    line = '';
    if (text) lines.push(INDENT.repeat(Math.max(0, depth)) + text);
  };
  // Emit only when the current line holds something (no blank line from a structural break)
  const breakLine = () => {
    if (line.trim()) emit();
    else line = '';
  };
  const inParens = () => stack.length > 0 && stack[stack.length - 1] === 'paren';
  // After a structural break, keep a trailing comment on the same line
  const commentFollows = (i) => isJs && /^[ \t]*\/[/*]/.test(src.slice(i, i + 3 + (src.slice(i).match(/^[ \t]*/)[0].length)));
  // Text right after a `}` that must stay on the same line
  const staysWithBrace = (i) => {
    const rest = src.slice(i).replace(/^[ \t]*/, '');
    if (/^[)\],;.?:]/.test(rest)) return true;
    return isJs && /^(?:else|catch|finally|while)\b/.test(rest);
  };

  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    const next = src[i + 1];

    // Opaque spans: copied verbatim
    if (ch === '"' || ch === "'") {
      const end = skipString(src, i);
      line += src.slice(i, end);
      i = end;
      continue;
    }
    if (isJs && ch === '`') {
      const end = skipTemplate(src, i);
      line += src.slice(i, end);
      i = end;
      continue;
    }
    if (ch === '/' && next === '*') {
      const end = skipBlockComment(src, i);
      const comment = src.slice(i, end);
      // Multi-line comments keep their own lines (re-indented from the first)
      const parts = comment.split('\n');
      line += parts[0];
      for (let p = 1; p < parts.length; p++) {
        emit();
        line = parts[p].trim().startsWith('*') ? ` ${parts[p].trim()}` : parts[p].trim();
      }
      i = end;
      continue;
    }
    if (isJs && ch === '/' && next === '/') {
      const end = skipLineComment(src, i);
      line += src.slice(i, end);
      i = end;
      continue;
    }
    if (isJs && ch === '/' && regexAllowed(line)) {
      const end = skipRegex(src, i);
      line += src.slice(i, end);
      i = end;
      continue;
    }
    if (!isJs && /^url\(/i.test(src.slice(i, i + 4)) && !/[\w-]$/.test(line)) {
      // Unquoted url(...) can hold ; { } ' and " (data URLs); copy to the closing )
      let j = i + 4;
      while (j < src.length && /\s/.test(src[j])) j++;
      if (src[j] !== '"' && src[j] !== "'") {
        const close = src.indexOf(')', j);
        const end = close === -1 ? src.length : close + 1;
        line += src.slice(i, end);
        i = end;
        continue;
      }
    }

    if (ch === '\n') {
      if (isJs) {
        // Newlines are significant in JS (automatic semicolons): keep them,
        // and keep one blank line where the source had one
        if (line.trim()) emit();
        else if (/\n[ \t]*$/.test(src.slice(0, i)) && lines.length && lines[lines.length - 1] !== '') lines.push('');
        line = '';
      } else if (line && !/\s$/.test(line)) {
        line += ' ';
      }
      i++;
      continue;
    }
    if (ch === ' ' || ch === '\t') {
      if (!line.trim()) { i++; continue; } // indentation is recomputed
      if (!isJs && /\s$/.test(line)) { i++; continue; }
      line += ch;
      i++;
      continue;
    }

    if (ch === '(' || ch === '[') {
      stack.push('paren');
      line += ch;
      i++;
      continue;
    }
    if (ch === ')' || ch === ']') {
      if (inParens()) stack.pop();
      line += ch;
      i++;
      continue;
    }
    if (ch === '{') {
      // Empty block stays as {}
      const after = src.slice(i + 1).match(/^\s*\}/);
      if (after) {
        line = `${line.replace(/\s+$/, '')}${line.trim() ? ' ' : ''}{}`;
        i += 1 + after[0].length;
        if (!staysWithBrace(i) && !commentFollows(i)) breakLine();
        continue;
      }
      line = `${line.replace(/\s+$/, '')}${line.trim() ? ' ' : ''}{`;
      stack.push('brace');
      i++;
      if (!commentFollows(i)) breakLine();
      depth++;
      continue;
    }
    if (ch === '}') {
      breakLine();
      if (stack.length && stack[stack.length - 1] === 'brace') stack.pop();
      depth = Math.max(0, depth - 1);
      line = '}';
      i++;
      if (!staysWithBrace(i) && !commentFollows(i)) {
        breakLine();
        // A blank line between top-level CSS rules
        if (!isJs && depth === 0) lines.push('');
      }
      continue;
    }
    if (ch === ';' && !inParens()) {
      line += ';';
      i++;
      if (!commentFollows(i)) breakLine();
      continue;
    }
    line += ch;
    i++;
  }
  emit();

  // Collapse blank-line runs and trim blank lines at the ends
  const out = [];
  lines.forEach((l) => {
    if (l === '' && (out.length === 0 || out[out.length - 1] === '')) return;
    out.push(l.replace(/\s+$/, ''));
  });
  while (out.length && out[out.length - 1] === '') out.pop();
  return out.join('\n');
};

export const formatCss = (code) => reindent(code, 'css');
export const formatJs = (code) => reindent(code, 'js');

/** Simple tag-per-line HTML indenter (the viewer's original behaviour). */
export const formatHtml = (code) => {
  const formatted = String(code ?? '')
    .replace(/>\s+</g, '><')
    .replace(/></g, '>\n<');
  let indent = 0;
  return formatted
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('</')) indent = Math.max(0, indent - 1);
      const result = INDENT.repeat(indent) + trimmed;
      if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>')) indent++;
      return result;
    })
    .join('\n');
};
