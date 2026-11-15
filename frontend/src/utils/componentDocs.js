import { babelParse, parse } from 'vue/compiler-sfc';

/**
 * Component documentation from real sources: a Vue single-file component
 * parsed with Vue's own compiler (props, emits and slots from defineProps,
 * defineEmits, defineSlots, the Options API and the template's <slot>s), and
 * the design system's component records (`/api/v1/components`).
 *
 * A doc is `{ name, description, props, emits, slots, examples, accessibility }`.
 */

const cleanComment = (text) =>
  text
    .split('\n')
    .map((line) => line.replace(/^\s*\*+\s?/, '').trim())
    .filter((line) => line && !line.startsWith('@'))
    .join(' ')
    .trim();

const jsdoc = (node) => {
  const comments = node?.leadingComments ?? [];
  const block = [...comments].reverse().find((c) => c.type === 'CommentBlock' && c.value.startsWith('*'));
  if (block) return cleanComment(block.value.slice(1));
  const line = comments.filter((c) => c.type === 'CommentLine').map((c) => c.value.trim());
  return line.join(' ');
};

const keyName = (prop) => {
  if (!prop?.key) return null;
  if (prop.key.type === 'Identifier') return prop.key.name;
  if (prop.key.type === 'StringLiteral') return prop.key.value;
  return null;
};

const isCall = (node, name) => node?.type === 'CallExpression' && node.callee?.type === 'Identifier' && node.callee.name === name;

/** Every node in a Babel AST, depth first */
function* nodes(node) {
  if (!node || typeof node.type !== 'string') return;
  yield node;
  for (const [key, value] of Object.entries(node)) {
    if (key === 'leadingComments' || key === 'trailingComments' || key === 'innerComments' || key === 'loc') continue;
    if (Array.isArray(value)) for (const child of value) yield* nodes(child);
    else if (value && typeof value.type === 'string') yield* nodes(value);
  }
}

function propsFromObject(object, text) {
  return object.properties
    .filter((p) => p.type === 'ObjectProperty' || p.type === 'ObjectMethod')
    .map((p) => {
      const name = keyName(p);
      const prop = { name, type: 'any', required: false, default: null, description: jsdoc(p) };
      const value = p.value;
      if (!value) return prop;
      if (value.type === 'Identifier') prop.type = value.name;
      else if (value.type === 'ArrayExpression') prop.type = value.elements.map((e) => text(e)).join(' | ');
      else if (value.type === 'ObjectExpression') {
        for (const field of value.properties) {
          const fieldName = keyName(field);
          if (fieldName === 'type') prop.type = field.value.type === 'ArrayExpression' ? field.value.elements.map((e) => text(e)).join(' | ') : text(field.value);
          if (fieldName === 'required') prop.required = field.value.type === 'BooleanLiteral' ? field.value.value : text(field.value) === 'true';
          if (fieldName === 'default') prop.default = field.type === 'ObjectMethod' ? text(field).replace(/^default\s*/, '') : text(field.value);
        }
      } else prop.type = text(value);
      return prop;
    })
    .filter((p) => p.name);
}

function propsFromTypeLiteral(members, text) {
  return members
    .filter((m) => m.type === 'TSPropertySignature')
    .map((m) => ({
      name: keyName(m),
      type: m.typeAnnotation ? text(m.typeAnnotation.typeAnnotation) : 'any',
      required: !m.optional,
      default: null,
      description: jsdoc(m),
    }))
    .filter((p) => p.name);
}

function emitsFromArgument(arg, text) {
  if (!arg) return [];
  if (arg.type === 'ArrayExpression') return arg.elements.filter((e) => e?.type === 'StringLiteral').map((e) => ({ name: e.value, payload: '', description: jsdoc(e) }));
  if (arg.type === 'ObjectExpression') return arg.properties.map((p) => ({ name: keyName(p), payload: '', description: jsdoc(p) })).filter((e) => e.name);
  return [];
}

function emitsFromType(typeNode, text) {
  if (!typeNode) return [];
  const members = typeNode.type === 'TSTypeLiteral' ? typeNode.members : [];
  const emits = [];
  for (const m of members) {
    // (e: 'change', value: string): void
    if (m.type === 'TSCallSignatureDeclaration') {
      const [event, ...rest] = m.parameters ?? [];
      const literal = event?.typeAnnotation?.typeAnnotation;
      const names = literal?.type === 'TSLiteralType' ? [literal.literal.value] : literal?.type === 'TSUnionType' ? literal.types.map((t) => t.literal?.value).filter(Boolean) : [];
      const payload = rest.map((p) => text(p)).join(', ');
      names.forEach((name) => emits.push({ name, payload, description: jsdoc(m) }));
    }
    // change: [value: string]
    if (m.type === 'TSPropertySignature') emits.push({ name: keyName(m), payload: m.typeAnnotation ? text(m.typeAnnotation.typeAnnotation) : '', description: jsdoc(m) });
  }
  return emits.filter((e) => e.name);
}

function slotsFromType(typeNode, text) {
  if (typeNode?.type !== 'TSTypeLiteral') return [];
  return typeNode.members
    .map((m) => {
      const params = m.type === 'TSMethodSignature' ? m.parameters : m.typeAnnotation?.typeAnnotation?.parameters;
      return { name: keyName(m), props: (params ?? []).map((p) => text(p.typeAnnotation?.typeAnnotation ?? p)), description: jsdoc(m) };
    })
    .filter((s) => s.name);
}

/** <slot> elements in a template AST, with their names and the props they pass */
function slotsFromTemplate(ast) {
  const slots = [];
  const visit = (node) => {
    if (!node) return;
    if (node.type === 1 && node.tag === 'slot') {
      let name = 'default';
      const props = [];
      for (const attr of node.props ?? []) {
        if (attr.type === 6) {
          if (attr.name === 'name') name = attr.value?.content ?? 'default';
          else props.push(attr.name);
        } else if (attr.type === 7 && attr.name === 'bind') {
          const arg = attr.arg?.content;
          if (arg === 'name') name = `[${attr.exp?.content ?? 'dynamic'}]`;
          else if (arg) props.push(arg);
        }
      }
      slots.push({ name, props, description: '' });
    }
    (node.children ?? []).forEach(visit);
    (node.branches ?? []).forEach(visit);
  };
  visit(ast);
  return slots;
}

const mergeByName = (...lists) => {
  const merged = new Map();
  for (const list of lists) {
    for (const item of list) {
      const existing = merged.get(item.name);
      if (!existing) merged.set(item.name, { ...item });
      else for (const [key, value] of Object.entries(item)) if (value && (!existing[key] || (Array.isArray(existing[key]) && !existing[key].length))) existing[key] = value;
    }
  }
  return [...merged.values()];
};

/**
 * Parses a Vue SFC. Returns the doc and any `errors` (a source that isn't a
 * valid SFC returns errors and an empty doc rather than throwing).
 */
export function parseVueComponent(source, filename = 'Component.vue') {
  const fallbackName = filename.replace(/^.*\//, '').replace(/\.\w+$/, '');
  const doc = { name: fallbackName, description: '', props: [], emits: [], slots: [], examples: [], accessibility: null, errors: [] };
  const { descriptor, errors } = parse(source, { filename });
  if (errors.length) {
    doc.errors = errors.map((e) => e.message ?? String(e));
    return doc;
  }

  const emitsFromTemplate = [];
  if (descriptor.template?.ast) {
    doc.slots = slotsFromTemplate(descriptor.template.ast);
    for (const m of descriptor.template.content.matchAll(/\$emit\(\s*['"]([\w:-]+)['"]/g)) emitsFromTemplate.push({ name: m[1], payload: '', description: '' });
  }

  const scriptProps = [];
  const scriptEmits = [];
  const typedSlots = [];
  const defaults = {};
  for (const block of [descriptor.script, descriptor.scriptSetup].filter(Boolean)) {
    const lang = block.lang ?? 'js';
    let program;
    try {
      program = babelParse(block.content, {
        sourceType: 'module',
        plugins: [...(lang.startsWith('ts') ? ['typescript'] : []), ...(lang.endsWith('x') ? ['jsx'] : [])],
      }).program;
    } catch (error) {
      doc.errors.push(`Could not parse the ${block.setup ? '<script setup>' : '<script>'} block: ${error.message}`);
      continue;
    }
    const text = (node) => block.content.slice(node.start, node.end);

    // A /** comment */ at the top of the script describes the component
    if (!doc.description && program.body[0]) doc.description = jsdoc(program.body[0]);

    for (const node of nodes(program)) {
      if (isCall(node, 'defineProps')) {
        const [arg] = node.arguments;
        const typeArg = node.typeParameters?.params?.[0];
        if (arg?.type === 'ObjectExpression') scriptProps.push(...propsFromObject(arg, text));
        else if (arg?.type === 'ArrayExpression') scriptProps.push(...arg.elements.filter((e) => e?.type === 'StringLiteral').map((e) => ({ name: e.value, type: 'any', required: false, default: null, description: '' })));
        else if (typeArg?.type === 'TSTypeLiteral') scriptProps.push(...propsFromTypeLiteral(typeArg.members, text));
      }
      if (isCall(node, 'withDefaults') && node.arguments[1]?.type === 'ObjectExpression') {
        for (const p of node.arguments[1].properties) if (keyName(p)) defaults[keyName(p)] = p.type === 'ObjectMethod' ? text(p) : text(p.value);
      }
      if (isCall(node, 'defineEmits')) {
        scriptEmits.push(...emitsFromArgument(node.arguments[0], text), ...emitsFromType(node.typeParameters?.params?.[0], text));
      }
      if (isCall(node, 'defineSlots')) typedSlots.push(...slotsFromType(node.typeParameters?.params?.[0], text));
      if (isCall(node, 'defineOptions') && node.arguments[0]?.type === 'ObjectExpression') {
        const nameProp = node.arguments[0].properties.find((p) => keyName(p) === 'name');
        if (nameProp?.value?.type === 'StringLiteral') doc.name = nameProp.value.value;
      }
      // Options API: export default { name, props, emits } (or defineComponent({ … }))
      if (node.type === 'ExportDefaultDeclaration') {
        const decl = node.declaration;
        const options = decl.type === 'ObjectExpression' ? decl : isCall(decl, 'defineComponent') ? decl.arguments[0] : null;
        if (options?.type === 'ObjectExpression') {
          for (const p of options.properties) {
            const key = keyName(p);
            if (key === 'name' && p.value?.type === 'StringLiteral') doc.name = p.value.value;
            if (key === 'props' && p.value?.type === 'ObjectExpression') scriptProps.push(...propsFromObject(p.value, text));
            if (key === 'props' && p.value?.type === 'ArrayExpression') scriptProps.push(...p.value.elements.filter((e) => e?.type === 'StringLiteral').map((e) => ({ name: e.value, type: 'any', required: false, default: null, description: '' })));
            if (key === 'emits') scriptEmits.push(...emitsFromArgument(p.value, text));
          }
        }
      }
      // emit('name') / this.$emit('name') in script code
      if (node.type === 'CallExpression' && node.arguments[0]?.type === 'StringLiteral') {
        const callee = node.callee;
        const name = callee.type === 'Identifier' ? callee.name : callee.type === 'MemberExpression' ? callee.property?.name : null;
        if (name === '$emit') emitsFromTemplate.push({ name: node.arguments[0].value, payload: '', description: '' });
      }
    }
  }

  doc.props = scriptProps.map((p) => (defaults[p.name] !== undefined ? { ...p, default: defaults[p.name] } : p));
  doc.emits = mergeByName(scriptEmits, emitsFromTemplate);
  doc.slots = mergeByName(typedSlots, doc.slots);
  return doc;
}

/**
 * A doc from a design-system component record. Its own props (with their
 * descriptions) come first; emits and slots come from its Vue source.
 */
export function docFromComponent(component) {
  const parsed = component.code?.vue ? parseVueComponent(component.code.vue, `${component.name}.vue`) : null;
  const recordProps = (component.props ?? []).map((p) => ({
    name: p.name,
    type: p.options?.length ? p.options.map((o) => `'${o}'`).join(' | ') : p.type ?? 'any',
    required: !!p.required,
    default: p.default === undefined ? null : JSON.stringify(p.default),
    description: p.description ?? '',
  }));
  return {
    name: component.name,
    description: component.description ?? parsed?.description ?? '',
    props: mergeByName(recordProps, parsed?.props ?? []),
    emits: parsed?.emits ?? [],
    slots: parsed?.slots ?? [],
    examples: component.examples ?? [],
    accessibility: component.accessibility ?? null,
    status: component.status ?? null,
    errors: parsed?.errors ?? [],
  };
}

const cell = (value) => String(value ?? '').replace(/\|/g, '\\|').replace(/\s*\n\s*/g, ' ').trim();

/** Markdown for a doc. `options`: includeProps, includeEvents, includeSlots, includeExamples, includeAccessibility */
export function componentMarkdown(doc, options = {}) {
  const on = (key) => options[key] !== false;
  const out = [`# ${doc.name}`, ''];
  if (doc.description) out.push(doc.description, '');
  if (doc.status) out.push(`Status: ${doc.status}`, '');

  if (on('includeProps')) {
    out.push('## Props', '');
    if (doc.props.length) {
      out.push('| Name | Type | Default | Required | Description |', '|------|------|---------|----------|-------------|');
      for (const p of doc.props) {
        out.push(`| \`${cell(p.name)}\` | \`${cell(p.type)}\` | ${p.default !== null && p.default !== undefined ? `\`${cell(p.default)}\`` : '-'} | ${p.required ? 'Yes' : 'No'} | ${cell(p.description)} |`);
      }
    } else out.push('This component has no props.');
    out.push('');
  }
  if (on('includeEvents')) {
    out.push('## Events', '');
    if (doc.emits.length) {
      out.push('| Name | Payload | Description |', '|------|---------|-------------|');
      for (const e of doc.emits) out.push(`| \`${cell(e.name)}\` | ${e.payload ? `\`${cell(e.payload)}\`` : '-'} | ${cell(e.description)} |`);
    } else out.push('This component emits no events.');
    out.push('');
  }
  if (on('includeSlots')) {
    out.push('## Slots', '');
    if (doc.slots.length) {
      out.push('| Name | Slot props | Description |', '|------|------------|-------------|');
      for (const s of doc.slots) out.push(`| \`${cell(s.name)}\` | ${s.props.length ? s.props.map((p) => `\`${cell(p)}\``).join(', ') : '-'} | ${cell(s.description)} |`);
    } else out.push('This component has no slots.');
    out.push('');
  }
  if (on('includeExamples') && doc.examples.length) {
    out.push('## Examples', '');
    for (const example of doc.examples) out.push('```vue', example, '```', '');
  }
  if (on('includeAccessibility') && doc.accessibility) {
    out.push('## Accessibility', '');
    if (doc.accessibility.wcag) out.push(`- WCAG level: ${doc.accessibility.wcag}`);
    if (doc.accessibility.notes) out.push(`- ${doc.accessibility.notes}`);
    out.push('');
  }
  return out.join('\n');
}
