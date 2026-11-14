/**
 * Delimited text (CSV, TSV, semicolon or pipe separated) in and out, for
 * pasted and uploaded data. Pure functions, no DOM.
 */

const DELIMITERS = ['\t', ',', ';', '|'];

/**
 * Pick the delimiter that splits the first lines most consistently: the one
 * that gives the same number of fields (more than one) on most lines. Quoted
 * fields are skipped, so "Washington, D.C." does not count as a comma.
 * @param {string} text
 * @returns {string} one of tab, comma, semicolon or pipe (comma when unsure)
 */
export function detectDelimiter(text) {
  const lines = String(text || '').split(/\r?\n/).filter((l) => l.trim()).slice(0, 10);
  // Tabs never appear inside numbers, so a tab on every line wins outright
  // ("Texas<tab>1,234" is two fields, not three)
  if (lines.length && lines.every((l) => l.includes('\t'))) return '\t';
  let best = ',';
  let bestScore = 0;
  for (const delimiter of DELIMITERS) {
    const counts = lines.map((line) => {
      let n = 0;
      let quoted = false;
      for (const ch of line) {
        if (ch === '"') quoted = !quoted;
        else if (ch === delimiter && !quoted) n++;
      }
      return n;
    });
    if (!counts.length || counts[0] === 0) continue;
    // Lines that agree with the header's field count, weighted by fields per line
    const agreeing = counts.filter((n) => n === counts[0]).length;
    const score = agreeing * 10 + counts[0];
    if (score > bestScore) {
      best = delimiter;
      bestScore = score;
    }
  }
  return best;
}

/**
 * Split delimited text into rows of fields. Handles quoted fields ("a, b"),
 * doubled quotes inside them ("say ""hi"""), newlines inside quotes, CRLF line
 * ends and a leading byte-order mark. Blank lines are dropped; each row keeps
 * the 1-based line it started on, for error messages.
 * @param {string} text
 * @param {{ delimiter?: string }} [options] delimiter is detected when omitted
 * @returns {{ delimiter: string, rows: Array<{ line: number, fields: string[] }> }}
 */
export function parseDelimited(text, { delimiter } = {}) {
  const source = String(text || '').replace(/^﻿/, '');
  const sep = delimiter || detectDelimiter(source);
  const rows = [];
  let fields = [];
  let field = '';
  let quoted = false;
  let line = 1;
  let rowLine = 1;

  const endField = () => {
    fields.push(field);
    field = '';
  };
  const endRow = () => {
    endField();
    if (fields.some((f) => f.trim() !== '')) rows.push({ line: rowLine, fields: fields.map((f) => f.trim()) });
    fields = [];
  };

  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    if (quoted) {
      if (ch === '"') {
        if (source[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        if (ch === '\n') line++;
        field += ch;
      }
    } else if (ch === '"' && field.trim() === '') {
      // A quote opens a quoted field only at its start (after any spaces)
      field = '';
      quoted = true;
    } else if (ch === sep) {
      endField();
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && source[i + 1] === '\n') i++;
      endRow();
      line++;
      rowLine = line;
    } else {
      field += ch;
    }
  }
  if (field !== '' || fields.length) endRow();
  return { delimiter: sep, rows };
}

/**
 * Read a number the way people type it in a spreadsheet: thousands separators
 * (1,234,567 · 1 234 567 · 1.234.567,8), currency and percent signs,
 * accounting negatives (1,234) and a decimal comma (12,5). Returns NaN for
 * anything else, including an empty cell.
 * @param {unknown} raw
 * @returns {number}
 */
export function parseNumber(raw) {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : NaN;
  if (typeof raw !== 'string') return NaN;
  let s = raw.trim().replace(/[\s  ']/g, '').replace(/^[$€£¥₹]|[$€£¥₹%]$/g, '');
  let sign = 1;
  if (/^\(.*\)$/.test(s)) {
    sign = -1;
    s = s.slice(1, -1);
  }
  s = s.replace(/^[$€£¥₹]/, '');
  if (s === '') return NaN;
  if (/^[+-]?\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) s = s.replace(/,/g, ''); // 1,234,567.8
  else if (/^[+-]?\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) s = s.replace(/\./g, '').replace(',', '.'); // 1.234.567,8
  else if (/^[+-]?\d*,\d+$/.test(s)) s = s.replace(',', '.'); // 12,5
  if (!/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(s)) return NaN;
  const value = Number(s) * sign;
  return Number.isFinite(value) ? value : NaN;
}

/** Normalise a header for matching: case, spaces and punctuation don't matter. */
export const headerKey = (header) => String(header || '').toLowerCase().replace(/[^a-z0-9]/g, '');

// Cells a spreadsheet would run as a formula, unless they are plain numbers
const FORMULA = /^[=+\-@\t\r]/;

const csvCell = (value) => {
  if (value === null || value === undefined || (typeof value === 'number' && !Number.isFinite(value))) return '';
  let text = String(value);
  if (typeof value !== 'number' && FORMULA.test(text) && Number.isNaN(parseNumber(text))) text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/**
 * Write rows as CSV (RFC 4180 quoting). Text that would start a spreadsheet
 * formula is prefixed with an apostrophe.
 * @param {string[]} headers column names, also the keys read from each row
 * @param {Array<Record<string, unknown>>} rows
 * @returns {string}
 */
export function toCSV(headers, rows) {
  const lines = [headers.map(csvCell).join(',')];
  for (const row of rows) lines.push(headers.map((h) => csvCell(row?.[h])).join(','));
  return `${lines.join('\n')}\n`;
}
