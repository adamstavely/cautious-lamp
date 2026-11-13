// Pure detection helpers shared by the built-in rules and the API rule converter.
// Everything here is defensive: AST nodes from different parsers (espree,
// @typescript-eslint/parser, vue-eslint-parser's <script> block) may lack
// optional fields, so nothing assumes a property exists.

/* eslint-disable @typescript-eslint/no-explicit-any */

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------

const HEX_WHOLE = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
// A hex color inside a longer string ("1px solid #fff"). The lookbehind keeps
// URL fragments ("page#abc") and HTML entities ("&#123;") out.
const HEX_EMBEDDED = /(?<![\w&#/])#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})(?![\w-])/gi;
const COLOR_FN = /\b(?:rgba?|hsla?)\(\s*-?[\d.]+(?:deg|%)?\s*[,\s]\s*-?[\d.]+%?[^)]*\)/gi;

/** Every hardcoded color (hex, rgb(), rgba(), hsl(), hsla()) in `text`, in order. */
export function findColors(text: unknown): string[] {
  if (typeof text !== 'string' || text.length === 0) return [];
  const trimmed = text.trim();
  if (HEX_WHOLE.test(trimmed)) return [trimmed];
  const found: Array<{ index: number; value: string }> = [];
  for (const re of [HEX_EMBEDDED, COLOR_FN]) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      found.push({ index: m.index, value: m[0] });
    }
  }
  return found.sort((a, b) => a.index - b.index).map(f => f.value);
}

// ---------------------------------------------------------------------------
// Context: which CSS-ish property is a value assigned to?
// ---------------------------------------------------------------------------

/** Wrappers a value can sit inside while still "belonging" to its property. */
const TRANSPARENT_PARENTS = new Set([
  'TemplateLiteral',
  'ConditionalExpression',
  'LogicalExpression',
  'TSAsExpression',
  'TSSatisfiesExpression',
  'TSNonNullExpression',
  'ParenthesizedExpression',
  'JSXExpressionContainer'
]);

function keyName(key: any): string | undefined {
  if (!key) return undefined;
  if (key.type === 'Identifier' || key.type === 'JSXIdentifier') return key.name;
  if (key.type === 'Literal' && (typeof key.value === 'string' || typeof key.value === 'number')) {
    return String(key.value);
  }
  if (key.type === 'JSXNamespacedName') return keyName(key.name);
  return undefined;
}

/**
 * The (normalized: lowercase, no `-`/`_`) property or variable name a value is
 * assigned to, e.g. `fontsize` for `{ fontSize: '16px' }`, `style.fontSize = '16px'`,
 * `<Box fontSize="16px" />` or `const fontSize = '16px'`. Undefined when the
 * value has no such context (a bare call argument, an array element, ...).
 */
export function getPropertyName(node: any): string | undefined {
  let child = node;
  let parent = node?.parent;
  while (parent && TRANSPARENT_PARENTS.has(parent.type)) {
    child = parent;
    parent = parent.parent;
  }
  if (!parent) return undefined;
  let name: string | undefined;
  switch (parent.type) {
    case 'Property':
      if (parent.value === child && !parent.computed) name = keyName(parent.key);
      break;
    case 'PropertyDefinition':
      if (parent.value === child && !parent.computed) name = keyName(parent.key);
      break;
    case 'JSXAttribute':
      name = keyName(parent.name);
      break;
    case 'AssignmentExpression':
      if (parent.right === child && parent.left?.type === 'MemberExpression') {
        const prop = parent.left.property;
        name = parent.left.computed && prop?.type !== 'Literal' ? undefined : keyName(prop);
      } else if (parent.right === child) {
        name = keyName(parent.left);
      }
      break;
    case 'VariableDeclarator':
      if (parent.init === child) name = keyName(parent.id);
      break;
    default:
      break;
  }
  return name === undefined ? undefined : normalizeName(name);
}

export function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[-_]/g, '');
}

/** True for string literals that are not values: object keys, import/export sources. */
export function isNonValueLiteral(node: any): boolean {
  const parent = node?.parent;
  if (!parent) return false;
  if ((parent.type === 'Property' || parent.type === 'PropertyDefinition') && parent.key === node && !parent.computed) {
    return true;
  }
  if (
    (parent.type === 'ImportDeclaration' ||
      parent.type === 'ExportNamedDeclaration' ||
      parent.type === 'ExportAllDeclaration' ||
      parent.type === 'ImportExpression') &&
    parent.source === node
  ) {
    return true;
  }
  if (parent.type === 'TSLiteralType' || parent.type === 'TSExternalModuleReference') return true;
  return false;
}

// ---------------------------------------------------------------------------
// Typography and spacing
// ---------------------------------------------------------------------------

const TYPOGRAPHY_NAME = /^(fontsize|lineheight|letterspacing|wordspacing)$|fontsize$|lineheight$/;
const SIZE_VALUE = /^-?(?:\d+\.?\d*|\.\d+)(px|rem|em|pt)$/;

export function isTypographyName(name: string | undefined): boolean {
  return name !== undefined && TYPOGRAPHY_NAME.test(name);
}

/** A hardcoded font size / line height value for a typography property, if any. */
export function getTypographyValue(value: unknown, propertyName: string | undefined): string | undefined {
  if (!isTypographyName(propertyName)) return undefined;
  if (typeof value === 'string') {
    const v = value.trim();
    return SIZE_VALUE.test(v) && parseFloat(v) !== 0 ? v : undefined;
  }
  // React-style numeric font sizes: { fontSize: 16 } (unitless line heights are fine).
  if (typeof value === 'number' && propertyName === 'fontsize' && value > 0) return String(value);
  return undefined;
}

const PX_TOKEN = /^-?(?:\d+\.?\d*|\.\d+)px$/;
// Names whose px values are not spacing: sizes, borders, typography, effects.
const NON_SPACING_NAME =
  /font|lineheight|letterspacing|wordspacing|textindent|width|height|size|border|radius|outline|shadow|blur|stroke|zindex|opacity|breakpoint|media|translate|transform|duration|delay/;

export function isNonSpacingName(name: string | undefined): boolean {
  return name !== undefined && NON_SPACING_NAME.test(name);
}

/**
 * True when `value` is a px spacing value ("16px", "-8px", "8px 16px") that is
 * not entirely zero, and its context is not a known non-spacing property.
 */
export function isHardcodedSpacing(value: unknown, propertyName: string | undefined): boolean {
  if (typeof value !== 'string') return false;
  const parts = value.trim().split(/\s+/);
  if (parts.length === 0 || parts.length > 4 || parts[0] === '') return false;
  if (!parts.every(p => PX_TOKEN.test(p))) return false;
  if (parts.every(p => parseFloat(p) === 0)) return false;
  return !isNonSpacingName(propertyName);
}

// ---------------------------------------------------------------------------
// Component naming
// ---------------------------------------------------------------------------

const PASCAL_CASE = /^[A-Z][a-zA-Z0-9]*$/;
const CONSTANT_CASE = /^[A-Z0-9_]+$/;

/**
 * True when `name` looks like a component (starts with an uppercase letter,
 * and is not an ALL_CAPS constant) but is not PascalCase. `_private`, `$el`,
 * `camelCase` and `MAX_SIZE` are not components and never violate.
 */
export function isInvalidComponentName(name: unknown): name is string {
  if (typeof name !== 'string' || !/^[A-Z]/.test(name)) return false;
  if (CONSTANT_CASE.test(name)) return false;
  return !PASCAL_CASE.test(name);
}

/** The declared identifier of a component-ish declaration, if it has one. */
export function getDeclaredIdentifier(node: any): any | undefined {
  if (!node) return undefined;
  if (node.type === 'VariableDeclarator') return node.id?.type === 'Identifier' ? node.id : undefined;
  return node.id?.type === 'Identifier' ? node.id : undefined;
}

export const COMPONENT_DECLARATION_SELECTOR =
  'VariableDeclarator, FunctionDeclaration, FunctionExpression, ClassDeclaration, ClassExpression';

// ---------------------------------------------------------------------------
// Accessibility (JSX)
// ---------------------------------------------------------------------------

const INTERACTIVE_TAGS = new Set(['button', 'input', 'select', 'textarea']);

function jsxAttrName(attr: any): string | undefined {
  const n = attr?.name;
  if (!n) return undefined;
  if (n.type === 'JSXIdentifier') return n.name;
  if (n.type === 'JSXNamespacedName') return `${n.namespace?.name}:${n.name?.name}`;
  return undefined;
}

/** null = attribute absent; '' = present but empty/valueless; otherwise its static value or '<expr>'. */
function jsxAttrValue(attributes: any[], name: string): string | null {
  const attr = attributes.find(a => a?.type === 'JSXAttribute' && jsxAttrName(a) === name);
  if (!attr) return null;
  const v = attr.value;
  if (v == null) return '';
  if (v.type === 'Literal') return v.value == null ? '' : String(v.value).trim();
  if (v.type === 'JSXExpressionContainer') {
    const e = v.expression;
    if (!e || e.type === 'JSXEmptyExpression') return '';
    if (e.type === 'Literal') return e.value == null ? '' : String(e.value).trim();
    if (e.type === 'TemplateLiteral' && (e.expressions?.length ?? 0) === 0) {
      return String(e.quasis?.[0]?.value?.cooked ?? '').trim();
    }
    return '<expr>';
  }
  return '<expr>';
}

function hasNonEmptyAttr(attributes: any[], name: string): boolean {
  const v = jsxAttrValue(attributes, name);
  return v !== null && v !== '';
}

function isComponentName(nameNode: any): boolean {
  if (!nameNode) return false;
  if (nameNode.type === 'JSXMemberExpression') return true;
  return nameNode.type === 'JSXIdentifier' && /^[A-Z]/.test(nameNode.name ?? '');
}

/** Whether JSX children could give an element an accessible name. */
function childrenProvideName(children: any[] | undefined): boolean {
  for (const child of children ?? []) {
    if (!child) continue;
    if (child.type === 'JSXText' && String(child.value ?? '').trim() !== '') return true;
    if (child.type === 'JSXExpressionContainer' && child.expression?.type !== 'JSXEmptyExpression') return true;
    if (child.type === 'JSXFragment' && childrenProvideName(child.children)) return true;
    if (child.type === 'JSXElement') {
      const opening = child.openingElement;
      if (isComponentName(opening?.name)) return true; // may render text; can't know
      const attrs = opening?.attributes ?? [];
      if (attrs.some((a: any) => a?.type === 'JSXSpreadAttribute')) return true;
      if (hasNonEmptyAttr(attrs, 'aria-label') || hasNonEmptyAttr(attrs, 'alt')) return true;
      if (childrenProvideName(child.children)) return true;
    }
  }
  return false;
}

function isInsideLabel(node: any): boolean {
  let cur = node?.parent?.parent; // skip the element's own JSXElement
  while (cur) {
    if (cur.type === 'JSXElement') {
      const n = cur.openingElement?.name;
      if (n?.type === 'JSXIdentifier' && n.name === 'label') return true;
    }
    cur = cur.parent;
  }
  return false;
}

/**
 * Returns true when a JSX opening element for a native interactive control
 * (button/input/select/textarea) has no accessible name. Components
 * (`<Button>`), member/namespaced names and elements with spread props are
 * never reported, since their final attributes can't be known statically.
 */
export function isMissingAccessibleName(node: any): boolean {
  const nameNode = node?.name;
  if (nameNode?.type !== 'JSXIdentifier' || !INTERACTIVE_TAGS.has(nameNode.name)) return false;
  const tag: string = nameNode.name;
  const attrs: any[] = Array.isArray(node.attributes) ? node.attributes : [];
  if (attrs.some(a => a?.type === 'JSXSpreadAttribute')) return false;
  if (jsxAttrValue(attrs, 'aria-hidden') === 'true') return false;
  if (['aria-label', 'aria-labelledby', 'title'].some(a => hasNonEmptyAttr(attrs, a))) return false;

  if (tag === 'button') {
    return !childrenProvideName(node.parent?.children);
  }
  if (tag === 'input') {
    const type = (jsxAttrValue(attrs, 'type') ?? 'text').toLowerCase();
    if (type === 'hidden') return false;
    if (type === 'submit' || type === 'reset') return false; // browser-provided label
    if (type === 'button' && hasNonEmptyAttr(attrs, 'value')) return false;
    if (type === 'image' && hasNonEmptyAttr(attrs, 'alt')) return false;
  }
  // An id lets a <label htmlFor> elsewhere name the control; a wrapping <label> names it directly.
  if (hasNonEmptyAttr(attrs, 'id')) return false;
  return !isInsideLabel(node);
}
