/**
 * Evaluates the simple maths Sass/Less leave in a declaration value once
 * variables are substituted (`4px * 2`, `10px + 6px`, `(30px / 2)`), and
 * reports what it can't evaluate (operators between incompatible dimensions,
 * Sass/Less colour and maths functions) so the converter can warn instead of
 * passing it through silently.
 *
 * Safe by design: strings, url(...) and CSS's own maths functions (calc, min,
 * max, clamp, var, env…) are never touched; `/` is only treated as division
 * inside parentheses, because outside them it is CSS syntax
 * (`font: 12px/1.5`, `grid-area: 1 / 2`); `-` needs spaces on both sides so
 * negative numbers and hyphenated words are left alone.
 */

const NUMBER = '-?(?:\\d+\\.?\\d*|\\.\\d+)';
const UNIT = '(?:[a-zA-Z]+|%)?';
// A number token: not glued to a word, # (hex colour) or . before it
const OPERAND = `(?<![\\w#.\\-])(${NUMBER})(${UNIT})(?![\\w.(-])`;

// Sass/Less functions the converter can't evaluate. Some share a name with a
// CSS filter function (saturate(150%)), so those only count when given a
// colour or more than one argument.
const PREPROCESSOR_FUNCTIONS = [
  'darken', 'lighten', 'mix', 'percentage', 'saturate', 'desaturate', 'fade', 'fadein', 'fadeout',
  'spin', 'tint', 'shade', 'adjust-hue', 'complement', 'transparentize', 'opacify', 'scale-color',
  'adjust-color', 'change-color', 'grayscale', 'invert', 'contrast', 'luma', 'luminance', 'unit',
  'unitless', 'map-get', 'nth', 'if', 'ceil', 'floor', 'e', 'escape', 'red', 'green', 'blue', 'alpha',
  'hue', 'lightness', 'saturation', 'quote', 'unquote', 'str-index', 'str-slice', 'to-upper-case',
  'to-lower-case', 'random', 'comparable', 'type-of', 'length', 'join', 'append', 'index',
];
const FILTER_NAMES = new Set(['saturate', 'grayscale', 'invert', 'contrast']);

const round = (n) => {
  const r = Math.round(n * 10000) / 10000;
  return Object.is(r, -0) ? 0 : r;
};

const fmt = (value, unit) => `${round(value)}${unit}`;

// Replace strings, url(...) and CSS maths functions with placeholders so
// nothing inside them is evaluated; restore() puts them back.
const protect = (text) => {
  const saved = [];
  const hold = (s) => {
    saved.push(s);
    return `\u0000${saved.length - 1}\u0000`;
  };
  let out = '';
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (ch === '"' || ch === "'") {
      let j = i + 1;
      while (j < text.length && text[j] !== ch) j += text[j] === '\\' ? 2 : 1;
      out += hold(text.slice(i, j + 1));
      i = j + 1;
      continue;
    }
    const fn = text.slice(i).match(/^(?:url|calc|min|max|clamp|var|env|attr|round|mod|rem|abs|sign|sin|cos|tan|asin|acos|atan|atan2|pow|sqrt|hypot|log|exp)\(/i);
    if (fn && !/[\w-]$/.test(out)) {
      let depth = 0;
      let j = i + fn[0].length - 1;
      for (; j < text.length; j++) {
        if (text[j] === '(') depth++;
        else if (text[j] === ')' && --depth === 0) break;
      }
      out += hold(text.slice(i, j + 1));
      i = j + 1;
      continue;
    }
    out += ch;
    i++;
  }
  // eslint-disable-next-line no-control-regex
  const restore = (s) => s.replace(/\u0000(\d+)\u0000/g, (m, n) => saved[Number(n)]);
  return { text: out, restore };
};

const combineUnits = (a, b) => {
  if (!a) return b;
  if (!b) return a;
  return a.toLowerCase() === b.toLowerCase() ? a : null;
};

// One pass of a binary operator; returns the new text and whether it changed.
const applyOperator = (text, opPattern, compute, problems) => {
  const re = new RegExp(`${OPERAND}${opPattern}${OPERAND}`);
  let changed = false;
  let out = text;
  let guard = 0;
  let m;
  while ((m = re.exec(out)) && guard++ < 100) {
    const [whole, n1, u1, op, n2, u2] = m;
    const result = compute(Number(n1), u1, op, Number(n2), u2);
    if (result === null) {
      problems.add(whole.trim());
      // Mark it so the same pair isn't retried; restored below
      out = out.slice(0, m.index) + whole.replace(op, `\u0001${op.trim()}\u0001`) + out.slice(m.index + whole.length);
      continue;
    }
    out = out.slice(0, m.index) + result + out.slice(m.index + whole.length);
    changed = true;
  }
  return { text: out, changed };
};

const multiply = (n1, u1, op, n2, u2) => {
  if (op.trim() === '*') {
    if (u1 && u2) return null; // px * px isn't a CSS length
    return fmt(n1 * n2, u1 || u2);
  }
  // division (only reached inside parentheses)
  if (n2 === 0) return null;
  if (u1 && u2) return u1.toLowerCase() === u2.toLowerCase() ? fmt(n1 / n2, '') : null;
  if (!u1 && u2) return null; // 2 / 1px
  return fmt(n1 / n2, u1);
};

const add = (n1, u1, op, n2, u2) => {
  const unit = combineUnits(u1, u2);
  if (unit === null) return null;
  return fmt(op.trim() === '+' ? n1 + n2 : n1 - n2, unit);
};

const reduce = (text, allowDivision, problems) => {
  let out = text;
  for (let pass = 0; pass < 50; pass++) {
    const mul = applyOperator(out, allowDivision ? '(\\s*[*/]\\s*)' : '(\\s*\\*\\s*)', multiply, problems);
    out = mul.text;
    if (mul.changed) continue;
    // + may be unspaced; - must have spaces on both sides
    const sum = applyOperator(out, '(\\s*\\+\\s*|\\s+-\\s+)', add, problems);
    out = sum.text;
    if (!sum.changed) break;
  }
  return out;
};

const PURE_EXPRESSION = new RegExp(`^\\s*${NUMBER}${UNIT}\\s*$`);

/**
 * @returns {{ value: string, warnings: string[] }}
 */
export const evaluateValue = (input) => {
  const warnings = [];
  if (!input || typeof input !== 'string') return { value: input, warnings };
  const { text, restore } = protect(input);
  const problems = new Set();

  // Parenthesised groups (not function calls), innermost first; / is division here
  let out = text;
  for (let pass = 0; pass < 50; pass++) {
    const group = /(^|[^\w-])\(([^()]*)\)/.exec(out);
    if (!group) break;
    const inner = reduce(group[2], true, problems);
    const start = group.index + group[1].length;
    const replacement = PURE_EXPRESSION.test(inner) ? inner.trim() : `\u0002${inner}\u0003`;
    out = out.slice(0, start) + replacement + out.slice(start + group[2].length + 2);
  }
  out = out.replace(/\u0002/g, '(').replace(/\u0003/g, ')');
  out = reduce(out, false, problems);
  // eslint-disable-next-line no-control-regex
  out = out.replace(/\u0001([^\u0001]*)\u0001/g, (m, op) => (op === '-' || op === '+' ? ` ${op} ` : ` ${op} `)).replace(/ {2,}/g, ' ');

  problems.forEach((p) => {
    warnings.push(`Could not evaluate "${p.replace(/\u0001/g, '')}" (incompatible units)`);
  });

  // Functions Sass/Less would have evaluated
  const restored = restore(out);
  const fnRe = /(^|[^\w.-])((?:math|color|map|list|string|meta)\.[\w-]+|[a-zA-Z][\w-]*)\(/g;
  let m;
  const seen = new Set();
  while ((m = fnRe.exec(restored))) {
    const name = m[2];
    const lower = name.toLowerCase();
    const namespaced = /^(?:math|color|map|list|string|meta)\./.test(lower);
    let flagged = namespaced || PREPROCESSOR_FUNCTIONS.includes(lower);
    const argStart = m.index + m[0].length;
    const args = splitArgs(restored, argStart);
    if (flagged && FILTER_NAMES.has(lower)) {
      // CSS filter function: one non-colour argument
      flagged = args.length > 1 || looksLikeColour(args[0] ?? '');
    }
    if (!flagged && (lower === 'rgba' || lower === 'rgb' || lower === 'hsla' || lower === 'hsl')) {
      // Sass rgba($colour, $alpha): a colour as the first of two arguments isn't CSS
      flagged = args.length === 2 && looksLikeColour(args[0]);
    }
    if (flagged && !seen.has(lower)) {
      seen.add(lower);
      warnings.push(`${name}() is a Sass/Less function and was not evaluated`);
    }
  }

  // Remaining operators between dimensions (e.g. a function result times 2)
  const leftover = new RegExp(`${OPERAND}\\s*\\*\\s*${OPERAND}|${OPERAND}\\s+[+-]\\s+${OPERAND}`);
  const bare = protect(restored).text;
  if (!problems.size && leftover.test(bare)) warnings.push(`Could not evaluate the maths in "${input.trim()}"`);

  return { value: restored, warnings };
};

const looksLikeColour = (arg) => /^\s*(?:#[0-9a-f]{3,8}|[a-z]+|(?:rgb|hsl)a?\(.*\))\s*$/i.test(arg) && !/^\s*(?:none|inherit|initial|unset)\s*$/i.test(arg);

// Top-level comma-separated arguments of the call whose ( ends just before `start`
const splitArgs = (text, start) => {
  const args = [];
  let depth = 0;
  let current = '';
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (ch === '(') depth++;
    if (ch === ')') {
      if (depth === 0) break;
      depth--;
    }
    if (ch === ',' && depth === 0) {
      args.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) args.push(current.trim());
  return args;
};
