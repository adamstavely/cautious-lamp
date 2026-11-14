<template>
  <PageShell>
    <PageHero
      :back="{ to: '/tools', label: 'Tools' }"
      title="CSS converter"
      lead="Convert between CSS and the LESS, SASS and SCSS preprocessor formats, both ways, with nesting and variable support."
      spot="tools/css-converter"
      size="tool"
    />

    <PageSection title="Convert">
      <div class="space-y-6">
        <UiSegmented v-model="selectedMode" :options="conversionModes" label="Conversion mode" @update:model-value="convertCss" />

        <InlineNotice :notice="notice" @dismiss="clearNotice" />

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UiPanel title="Input">
            <template #actions>
              <UiButton size="sm" variant="ghost" icon="swap_horiz" label="Swap" title="Swap input and output" @click="swapInputs" />
              <UiButton size="sm" variant="ghost" label="Clear" @click="clearInput" />
              <UiButton size="sm" variant="ghost" icon="content_copy" icon-only :label="`Copy ${inputLabel}`" @click="copyToClipboard(cssInput)" />
            </template>
            <UiTextarea
              v-model="cssInput"
              :label="inputLabel"
              rows="18"
              mono
              placeholder="Enter your CSS code here..."
              @update:model-value="convertCss"
            />
          </UiPanel>

          <UiPanel title="Output">
            <UiCodeBlock v-if="convertedOutput" :code="convertedOutput" :label="outputLabel" />
            <p v-else class="text-sm text-ink-muted">Converted code will appear here.</p>
          </UiPanel>
        </div>
      </div>
    </PageSection>

    <PageSection title="About CSS preprocessors" divided>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm leading-relaxed text-ink-secondary">
        <div class="space-y-2">
          <h3 class="text-base font-semibold text-ink-strong">LESS</h3>
          <p>
            LESS (Leaner Style Sheets) is a CSS preprocessor that extends CSS with features like variables, mixins, functions, and nested rules. LESS uses curly braces <UiCode>{}</UiCode> for nesting, similar to CSS.
          </p>
          <p><strong class="text-ink">Features:</strong> Variables (<UiCode>@variable</UiCode>), mixins, functions, nested selectors, and operations.</p>
        </div>
        <div class="space-y-2">
          <h3 class="text-base font-semibold text-ink-strong">SASS</h3>
          <p>
            SASS (Syntactically Awesome Style Sheets) is a CSS preprocessor that uses indentation-based syntax (no curly braces or semicolons). SASS files use the <UiCode>.sass</UiCode> extension.
          </p>
          <p><strong class="text-ink">Features:</strong> Variables (<UiCode>$variable</UiCode>), mixins, functions, nested selectors (indentation-based), and operations.</p>
        </div>
        <div class="space-y-2">
          <h3 class="text-base font-semibold text-ink-strong">SCSS</h3>
          <p>
            SCSS (Sassy CSS) is the newer syntax for SASS that uses curly braces and semicolons, making it more similar to CSS. SCSS files use the <UiCode>.scss</UiCode> extension.
          </p>
          <p>
            <strong class="text-ink">Features:</strong> Variables (<UiCode>$variable</UiCode>), mixins, functions, nested selectors (with braces), and operations. SCSS is a superset of CSS, so any valid CSS is also valid SCSS.
          </p>
        </div>
        <div class="space-y-2">
          <h3 class="text-base font-semibold text-ink-strong">Conversion notes</h3>
          <ul class="list-disc list-inside space-y-1">
            <li>This converter performs basic structural conversion and nesting detection.</li>
            <li>For complex conversions, manual review and adjustment may be required.</li>
            <li>Variable extraction and mixin conversion require manual implementation.</li>
            <li>Nested selectors are automatically detected and converted to the appropriate syntax.</li>
          </ul>
        </div>
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { computed, ref } from 'vue';
import InlineNotice from '../components/InlineNotice.vue';
import { useNotice } from '../composables/useNotice.js';
import { PageHero, PageSection, PageShell, UiButton, UiCode, UiCodeBlock, UiPanel, UiSegmented, UiTextarea } from '../components/ui';

const { notice, showNotice, clearNotice } = useNotice();

// Conversion modes
const conversionModes = [
  { label: 'CSS → LESS', value: 'css-to-less' },
  { label: 'LESS → CSS', value: 'less-to-css' },
  { label: 'CSS → SASS', value: 'css-to-sass' },
  { label: 'SASS → CSS', value: 'sass-to-css' },
  { label: 'CSS → SCSS', value: 'css-to-scss' },
  { label: 'SCSS → CSS', value: 'scss-to-css' }
];
const selectedMode = ref('css-to-less');

const inputLabel = computed(() => {
  const mode = selectedMode.value;
  const format = mode.startsWith('css-to') ? 'CSS' : mode.includes('less') ? 'LESS' : mode.includes('sass') && !mode.includes('scss') ? 'SASS' : 'SCSS';
  return `${format} input`;
});
const outputLabel = computed(() => {
  const mode = selectedMode.value;
  const format = mode.startsWith('css-to') ? (mode === 'css-to-less' ? 'LESS' : mode === 'css-to-sass' ? 'SASS' : 'SCSS') : 'CSS';
  return `${format} output`;
});

// Input and output
const cssInput = ref('');
const convertedOutput = ref('');

// ---------------------------------------------------------------------------
// Parsing. A small tokenizer that understands strings, comments, parentheses
// and #{}/@{} interpolation, and builds a tree of rules, at-rules and
// declarations. It is not a full Sass/Less implementation; unsupported
// features are reported as warnings instead of producing silently broken CSS.
// ---------------------------------------------------------------------------

// Split on a separator that is not inside (), [], {} or quotes.
const splitTopLevel = (text, separator) => {
  const parts = [];
  let depth = 0;
  let quote = null;
  let current = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quote) {
      current += ch;
      if (ch === '\\') {
        current += text[i + 1] ?? '';
        i++;
      } else if (ch === quote) {
        quote = null;
      }
      continue;
    }
    if (ch === '"' || ch === "'") quote = ch;
    else if (ch === '(' || ch === '[' || ch === '{') depth++;
    else if (ch === ')' || ch === ']' || ch === '}') depth = Math.max(0, depth - 1);
    if (ch === separator && depth === 0) {
      parts.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  parts.push(current);
  return parts;
};

const collapse = (text) => text.replace(/\s*\n\s*/g, ' ').trim();

const makeStatement = (text) => {
  const clean = collapse(text);
  const lessVar = clean.match(/^@([\w-]+)\s*:\s*([\s\S]*)$/);
  if (lessVar) return { type: 'decl', prop: `@${lessVar[1]}`, value: lessVar[2].trim() };
  if (clean.startsWith('@')) {
    const m = clean.match(/^@([\w-]+)\s*([\s\S]*)$/);
    return { type: 'at', name: m ? m[1] : clean.slice(1), params: m ? m[2].trim() : '', children: null };
  }
  // Less mixin call: .mixin; .mixin(); #ns.mixin(args) !important;
  if (/^[.#][\w-]+(?:[.>\s]*[.#][\w-]+)*\s*(\([\s\S]*\))?\s*(!important)?$/.test(clean) && !/:\s/.test(clean)) {
    return { type: 'call', text: clean };
  }
  const colon = clean.indexOf(':');
  if (colon > 0) {
    return { type: 'decl', prop: clean.slice(0, colon).trim(), value: clean.slice(colon + 1).trim() };
  }
  return { type: 'raw', text: clean };
};

const parseBraces = (src, { lineComments = false } = {}) => {
  const root = { type: 'root', children: [] };
  const stack = [root];
  const top = () => stack[stack.length - 1];
  let buf = '';
  let paren = 0;
  let line = 1;

  const flush = () => {
    const text = buf.trim();
    buf = '';
    if (text) top().children.push(makeStatement(text));
  };

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    const next = src[i + 1];
    if (ch === '\n') line++;

    if (ch === '"' || ch === "'") {
      let j = i + 1;
      while (j < src.length && src[j] !== ch && src[j] !== '\n') {
        if (src[j] === '\\') j++;
        j++;
      }
      buf += src.slice(i, j + 1);
      i = j;
      continue;
    }
    if (ch === '/' && next === '*') {
      const end = src.indexOf('*/', i + 2);
      const stop = end === -1 ? src.length : end + 2;
      const text = src.slice(i, stop);
      line += (text.match(/\n/g) || []).length;
      if (!buf.trim()) top().children.push({ type: 'comment', text });
      i = stop - 1;
      continue;
    }
    // `//` comments (Sass/Less only, and not inside url(...) etc.)
    if (lineComments && ch === '/' && next === '/' && paren === 0) {
      const end = src.indexOf('\n', i);
      i = (end === -1 ? src.length : end) - 1;
      continue;
    }
    // #{...} and @{...} interpolation belongs to the surrounding text
    if (ch === '{' && (src[i - 1] === '#' || src[i - 1] === '@')) {
      const end = src.indexOf('}', i);
      if (end === -1) throw new Error(`Unclosed interpolation on line ${line}`);
      buf += src.slice(i, end + 1);
      i = end;
      continue;
    }
    if (ch === '(') paren++;
    if (ch === ')') paren = Math.max(0, paren - 1);

    if (paren === 0 && ch === '{') {
      const prelude = collapse(buf);
      buf = '';
      let node;
      if (prelude.startsWith('@') && !prelude.startsWith('@{')) {
        const m = prelude.match(/^@([\w-]+)\s*([\s\S]*)$/);
        node = { type: 'at', name: m ? m[1] : prelude.slice(1), params: m ? m[2].trim() : '', children: [] };
      } else {
        node = { type: 'rule', selector: prelude, children: [] };
      }
      top().children.push(node);
      stack.push(node);
      continue;
    }
    if (paren === 0 && ch === '}') {
      flush();
      if (stack.length === 1) throw new Error(`Unexpected "}" on line ${line}`);
      stack.pop();
      continue;
    }
    if (paren === 0 && ch === ';') {
      flush();
      continue;
    }
    buf += ch;
  }
  flush();
  if (stack.length > 1) throw new Error('Missing closing "}"');
  return root.children;
};

// Indented Sass -> SCSS-style braces, so it can share the SCSS compiler.
const sassToBraces = (src) => {
  const items = [];
  let commentIndent = -1;
  src.replace(/\r\n?/g, '\n').split('\n').forEach((raw) => {
    if (!raw.trim()) return;
    const indent = raw.match(/^[ \t]*/)[0].replace(/\t/g, '  ').length;
    const text = raw.trim();
    if (commentIndent >= 0) {
      if (indent > commentIndent) return; // continuation of a comment block
      commentIndent = -1;
    }
    if (text.startsWith('//') || text.startsWith('/*')) {
      commentIndent = indent;
      return;
    }
    items.push({ indent, text });
  });

  let out = '';
  const open = [];
  items.forEach((item, index) => {
    while (open.length && item.indent <= open[open.length - 1]) {
      open.pop();
      out += '}\n';
    }
    let text = item.text.replace(/;$/, '');
    if (text.startsWith('=')) text = `@mixin ${text.slice(1).trim()}`;
    else if (text.startsWith('+') && !/^\+\s/.test(text)) text = `@include ${text.slice(1).trim()}`;
    const next = items[index + 1];
    if (next && next.indent > item.indent) {
      out += `${text} {\n`;
      open.push(item.indent);
    } else {
      out += `${text};\n`;
    }
  });
  while (open.length) {
    open.pop();
    out += '}\n';
  }
  return out;
};

// ---------------------------------------------------------------------------
// Printing
// ---------------------------------------------------------------------------

const formatSelector = (selector, pad) =>
  splitTopLevel(selector, ',').map((s) => collapse(s)).filter(Boolean).join(`,\n${pad}`);

const atPrelude = (node) => `@${node.name}${node.params ? ` ${node.params}` : ''}`;

// CSS/SCSS/Less (brace syntax), keeping the source structure
const printBraces = (nodes, depth = 0) => {
  const pad = '  '.repeat(depth);
  return nodes
    .map((node) => {
      switch (node.type) {
        case 'comment':
          return pad + node.text.trim();
        case 'decl':
          return `${pad}${node.prop}: ${node.value};`;
        case 'rule':
        case 'at': {
          const head = node.type === 'rule' ? formatSelector(node.selector, pad) : atPrelude(node);
          if (!node.children) return `${pad}${head};`;
          const body = printBraces(node.children, depth + 1);
          return body ? `${pad}${head} {\n${body}\n${pad}}` : `${pad}${head} {\n${pad}}`;
        }
        default:
          return `${pad}${node.text};`;
      }
    })
    .join(depth === 0 ? '\n\n' : '\n');
};

// Indented Sass syntax
const printSass = (nodes, depth = 0) => {
  const pad = '  '.repeat(depth);
  const lines = [];
  nodes.forEach((node) => {
    switch (node.type) {
      case 'comment':
        node.text
          .replace(/^\/\*+|\*+\/$/g, '')
          .split('\n')
          .map((l) => l.replace(/^\s*\*?\s?/, '').trimEnd())
          .filter(Boolean)
          .forEach((l) => lines.push(`${pad}// ${l}`));
        break;
      case 'decl':
        lines.push(`${pad}${node.prop}: ${node.value}`);
        break;
      case 'rule':
        // Sass needs the whole selector list on one line
        lines.push(pad + splitTopLevel(node.selector, ',').map((s) => collapse(s)).filter(Boolean).join(', '));
        lines.push(printSass(node.children, depth + 1));
        break;
      case 'at':
        lines.push(pad + atPrelude(node));
        if (node.children) lines.push(printSass(node.children, depth + 1));
        break;
      default:
        lines.push(pad + node.text);
    }
    if (depth === 0) lines.push('');
  });
  return lines.filter((l, i) => l !== '' || depth === 0 || i < lines.length - 1).join('\n').replace(/\n{3,}/g, '\n\n').trimEnd();
};

// Plain CSS output of the compiler (rules are already flat)
const printCss = (nodes, depth = 0) => {
  const pad = '  '.repeat(depth);
  return nodes
    .map((node) => {
      if (node.type === 'comment') return pad + node.text.trim();
      if (node.type === 'statement') return `${pad}${atPrelude(node)};`;
      if (node.type === 'rule') {
        if (!node.decls.length) return null;
        const body = node.decls.map((d) => `${pad}  ${d.prop}: ${d.value};`).join('\n');
        return `${pad}${formatSelector(node.selector, pad)} {\n${body}\n${pad}}`;
      }
      // block at-rule
      const parts = [
        ...node.decls.map((d) => `${pad}  ${d.prop}: ${d.value};`),
        printCss(node.children, depth + 1),
      ].filter(Boolean);
      if (!parts.length) return null;
      return `${pad}${atPrelude(node)} {\n${parts.join('\n')}\n${pad}}`;
    })
    .filter(Boolean)
    .join(depth === 0 ? '\n\n' : '\n');
};

// ---------------------------------------------------------------------------
// SCSS / Less -> CSS: variables, nesting (with &), @media bubbling and simple
// mixins. Functions, operations and control flow are not evaluated.
// ---------------------------------------------------------------------------

// At-rules whose bodies are declarations or keyframe selectors, never nested under a parent selector
const DECLARATION_AT_RULES = new Set(['font-face', 'page', 'counter-style', 'property', 'font-feature-values', 'viewport']);
const KEYFRAMES = /^(-[a-z]+-)?keyframes$/;
const CONDITIONAL_AT_RULES = new Set(['media', 'supports', 'container', 'layer', 'document', 'scope']);
const CONTROL_DIRECTIVES = new Set(['if', 'else', 'each', 'for', 'while', 'function', 'return']);

const compilePreprocessor = (tree, syntax) => {
  const warnings = new Set();
  const output = [];
  const mixins = new Map();
  const lessClassRules = new Map();
  const varSigil = syntax === 'less' ? '@' : '$';

  const isVarName = (prop) => prop.startsWith(varSigil) && prop.length > 1;

  const substitute = (text, vars) => {
    if (!text) return text;
    let result = text;
    // Interpolation: #{$x} (SCSS) / @{x} (Less)
    result = syntax === 'less'
      ? result.replace(/@\{([\w-]+)\}/g, (m, name) => (vars.has(name) ? vars.get(name) : m))
      : result.replace(/#\{\s*\$([\w-]+)\s*\}/g, (m, name) => (vars.has(name) ? vars.get(name) : m));
    const pattern = syntax === 'less' ? /@([\w-]+)/g : /\$([\w-]+)/g;
    result = result.replace(pattern, (m, name) => {
      if (vars.has(name)) return vars.get(name);
      warnings.add(`Undefined variable ${m}`);
      return m;
    });
    if (syntax === 'less') result = result.replace(/~"([^"]*)"|~'([^']*)'/g, (m, a, b) => a ?? b);
    return result;
  };

  const interpolateSelector = (selector, vars) =>
    syntax === 'less'
      ? selector.replace(/@\{([\w-]+)\}/g, (m, name) => (vars.has(name) ? vars.get(name) : m))
      : selector.replace(/#\{\s*\$([\w-]+)\s*\}/g, (m, name) => (vars.has(name) ? vars.get(name) : m));

  const defineVar = (node, vars) => {
    const value = node.value.replace(/\s*!(default|global)\s*$/i, '');
    const name = node.prop.slice(1);
    if (/!default\s*$/i.test(node.value) && vars.has(name)) return;
    vars.set(name, substitute(value, vars));
  };

  const combineSelectors = (parents, selector) => {
    const children = splitTopLevel(selector, ',').map((s) => collapse(s)).filter(Boolean);
    if (!parents.length) return children.map((c) => c.replace(/^&\s*/, '').replace(/&/g, ''));
    return parents.flatMap((p) => children.map((c) => (c.includes('&') ? c.replace(/&/g, p) : `${p} ${c}`)));
  };

  // "name(a, b)" -> { name, args: ['a', 'b'] }
  const parseSignature = (text) => {
    const m = text.match(/^([^\s(]+)\s*(?:\(([\s\S]*)\))?/);
    if (!m) return { name: text.trim(), args: [] };
    const argText = (m[2] ?? '').trim();
    const sep = syntax === 'less' && argText.includes(';') ? ';' : ',';
    return { name: m[1], args: argText ? splitTopLevel(argText, sep).map((a) => a.trim()).filter(Boolean) : [] };
  };

  const defineMixin = (signature, children) => {
    const { name, args } = parseSignature(signature);
    const params = args.map((arg) => {
      const [param, ...rest] = arg.split(':');
      return { name: param.trim().replace(/^[$@]/, ''), def: rest.length ? rest.join(':').trim() : undefined };
    });
    mixins.set(name, { params, children });
  };

  const LESS_MIXIN_DEF = /^([.#][\w-]+)\s*\(([\s\S]*)\)\s*(when\s[\s\S]*)?$/;

  // Hoist mixin definitions and (Less: lazily evaluated) variables of a block
  const prepass = (nodes, vars) => {
    nodes.forEach((node) => {
      if (node.type === 'at' && node.name === 'mixin' && node.children) {
        defineMixin(node.params, node.children);
      } else if (syntax === 'less' && node.type === 'rule') {
        const def = node.selector.match(LESS_MIXIN_DEF);
        if (def) {
          if (def[3]) warnings.add('Less mixin guards (when ...) are ignored');
          defineMixin(`${def[1]}(${def[2]})`, node.children);
        } else if (/^[.#][\w-]+$/.test(node.selector.trim())) {
          lessClassRules.set(node.selector.trim(), node.children);
        }
      } else if (syntax === 'less' && node.type === 'decl' && isVarName(node.prop)) {
        defineVar(node, vars);
      }
    });
  };

  const includeMixin = (signature, ctx, depth) => {
    const { name, args } = parseSignature(signature.replace(/\s*!important\s*$/, ''));
    const mixin = mixins.get(name);
    if (!mixin) {
      const classRule = syntax === 'less' ? lessClassRules.get(name) : null;
      if (classRule) {
        walk(classRule, { ...ctx, vars: new Map(ctx.vars) }, depth + 1);
      } else {
        warnings.add(`Unknown mixin ${name}`);
      }
      return;
    }
    const vars = new Map(ctx.vars);
    const positional = [];
    args.forEach((arg) => {
      const keyword = arg.match(/^[$@]([\w-]+)\s*:\s*([\s\S]+)$/);
      if (keyword) vars.set(keyword[1], substitute(keyword[2], ctx.vars));
      else positional.push(substitute(arg, ctx.vars));
    });
    mixin.params.forEach((param, i) => {
      if (i < positional.length) vars.set(param.name, positional[i]);
      else if (!vars.has(param.name) || !args.some((a) => a.startsWith(`${varSigil}${param.name}`))) {
        if (param.def !== undefined) vars.set(param.name, substitute(param.def, vars));
        else if (!args.some((a) => a.startsWith(`${varSigil}${param.name}`))) warnings.add(`Missing argument ${varSigil}${param.name} for mixin ${name}`);
      }
    });
    walk(mixin.children, { ...ctx, vars }, depth + 1);
  };

  // ctx: { selectors, vars, container, rule() -> current output rule or decl target }
  const walk = (nodes, ctx, depth = 0) => {
    if (depth > 50) {
      warnings.add('Mixins nested too deeply (recursive mixin?)');
      return;
    }
    prepass(nodes, ctx.vars);
    nodes.forEach((node) => {
      switch (node.type) {
        case 'comment':
          if (!ctx.selectors.length && ctx.container === output) output.push({ type: 'comment', text: node.text });
          break;
        case 'decl': {
          if (isVarName(node.prop)) {
            if (syntax !== 'less') defineVar(node, ctx.vars);
            break;
          }
          const target = ctx.rule();
          if (!target) {
            warnings.add(`Declaration "${node.prop}" outside of a rule was dropped`);
            break;
          }
          target.decls.push({ prop: interpolateSelector(node.prop, ctx.vars), value: substitute(node.value, ctx.vars) });
          break;
        }
        case 'rule': {
          if (syntax === 'less' && LESS_MIXIN_DEF.test(node.selector)) break; // mixin definition
          const selector = interpolateSelector(node.selector, ctx.vars);
          if (/^%/.test(selector.trim())) {
            warnings.add('Placeholder selectors (%name) and @extend are not supported');
            break;
          }
          const selectors = combineSelectors(ctx.selectors, selector);
          const rule = { type: 'rule', selector: selectors.join(', '), decls: [] };
          ctx.container.push(rule); // reserve its place before nested rules
          walk(node.children, { ...ctx, selectors, vars: new Map(ctx.vars), rule: () => rule }, depth);
          break;
        }
        case 'at':
          handleAtRule(node, ctx, depth);
          break;
        case 'call':
          if (syntax === 'less') includeMixin(node.text, ctx, depth);
          else warnings.add(`Could not understand "${node.text}"`);
          break;
        default:
          warnings.add(`Could not understand "${node.text}"`);
      }
    });
  };

  const handleAtRule = (node, ctx, depth) => {
    const name = node.name.toLowerCase();

    if (CONTROL_DIRECTIVES.has(name)) {
      warnings.add(`@${name} is not supported and was skipped`);
      return;
    }
    if (name === 'mixin') return; // hoisted in prepass
    if (name === 'include') {
      if (node.children) warnings.add('@include content blocks are ignored');
      includeMixin(node.params, ctx, depth);
      return;
    }
    if (name === 'extend') {
      warnings.add('@extend is not supported and was skipped');
      return;
    }
    if (name === 'use' || name === 'forward') {
      warnings.add(`@${name} was skipped (modules can't be resolved here)`);
      return;
    }
    if (name === 'debug' || name === 'warn' || name === 'error') return;
    const params = substitute(node.params, ctx.vars);
    if (name === 'import' && syntax === 'less' && /\(\s*reference\s*\)/.test(params)) return;

    if (!node.children) {
      // @import, @charset, @namespace, ...
      if (ctx.selectors.length) warnings.add(`@${name} inside a rule was dropped`);
      else ctx.container.push({ type: 'statement', name: node.name, params });
      return;
    }

    if (name === 'at-root') {
      walk(node.children, { ...ctx, selectors: [], container: output, rule: () => null, vars: new Map(ctx.vars) }, depth);
      return;
    }

    const block = { type: 'at', name: node.name, params, decls: [], children: [] };
    ctx.container.push(block);

    if (DECLARATION_AT_RULES.has(name) || KEYFRAMES.test(name)) {
      // Keyframe selectors and @font-face declarations are not nested under parents
      walk(node.children, { ...ctx, selectors: [], container: block.children, vars: new Map(ctx.vars), rule: () => block }, depth);
      return;
    }

    // @media/@supports/... inside a rule: repeat the parent selector inside the block
    let nestedRule = null;
    walk(node.children, {
      ...ctx,
      container: block.children,
      vars: new Map(ctx.vars),
      rule: () => {
        if (!ctx.selectors.length) return null;
        if (!nestedRule) {
          nestedRule = { type: 'rule', selector: ctx.selectors.join(', '), decls: [] };
          block.children.unshift(nestedRule);
        }
        return nestedRule;
      },
    }, depth);
    if (!CONDITIONAL_AT_RULES.has(name)) warnings.add(`@${name} was copied without checking`);
  };

  walk(tree, { selectors: [], vars: new Map(), container: output, rule: () => null });
  return { css: printCss(output), warnings: [...warnings] };
};

// CSS is valid LESS and SCSS, so those directions only reformat it.
const convertToLess = (css) => printBraces(parseBraces(css));
const convertToScss = (css) => printBraces(parseBraces(css));
const convertToSass = (css) => printSass(parseBraces(css));

const convertFromLess = (less) => compilePreprocessor(parseBraces(less, { lineComments: true }), 'less');
const convertFromScss = (scss) => compilePreprocessor(parseBraces(scss, { lineComments: true }), 'scss');
const convertFromSass = (sass) =>
  compilePreprocessor(parseBraces(sassToBraces(sass), { lineComments: true }), 'scss');

// Main conversion function
const convertCss = () => {
  if (!cssInput.value.trim()) {
    convertedOutput.value = '';
    clearNotice();
    return;
  }

  try {
    let result;
    switch (selectedMode.value) {
      case 'css-to-less':
        result = convertToLess(cssInput.value);
        break;
      case 'less-to-css':
        result = convertFromLess(cssInput.value);
        break;
      case 'css-to-sass':
        result = convertToSass(cssInput.value);
        break;
      case 'sass-to-css':
        result = convertFromSass(cssInput.value);
        break;
      case 'css-to-scss':
        result = convertToScss(cssInput.value);
        break;
      case 'scss-to-css':
        result = convertFromScss(cssInput.value);
        break;
      default:
        result = '';
    }
    const output = typeof result === 'string' ? result : result.css;
    const warnings = typeof result === 'string' ? [] : result.warnings;
    convertedOutput.value = output;
    if (warnings.length) {
      const shown = warnings.slice(0, 3).join('; ');
      showNotice(`${shown}${warnings.length > 3 ? ` (+${warnings.length - 3} more)` : ''}.`, 'warning');
    } else {
      clearNotice();
    }
  } catch (error) {
    // Keep the last good output; explain what's wrong with the input
    showNotice(`Could not convert: ${error.message}.`, 'error');
  }
};

const clearInput = () => {
  cssInput.value = '';
  convertedOutput.value = '';
};

const swapInputs = () => {
  // Swap the input and output
  const temp = cssInput.value;
  cssInput.value = convertedOutput.value;
  convertedOutput.value = temp;
  
  // Toggle the conversion direction
  switch (selectedMode.value) {
    case 'css-to-less':
      selectedMode.value = 'less-to-css';
      break;
    case 'less-to-css':
      selectedMode.value = 'css-to-less';
      break;
    case 'css-to-sass':
      selectedMode.value = 'sass-to-css';
      break;
    case 'sass-to-css':
      selectedMode.value = 'css-to-sass';
      break;
    case 'css-to-scss':
      selectedMode.value = 'scss-to-css';
      break;
    case 'scss-to-css':
      selectedMode.value = 'css-to-scss';
      break;
  }
  
  // Convert with swapped inputs
  convertCss();
};


const copyToClipboard = async (text) => {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    showNotice('Copied to clipboard.', 'success');
  } catch (error) {
    console.error('Failed to copy:', error);
    showNotice('Could not copy to the clipboard.', 'error');
  }
};
</script>
