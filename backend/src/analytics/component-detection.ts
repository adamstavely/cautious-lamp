/** What detection needs to know about a design-system component */
export interface DetectableComponent {
  id: string;
  name: string;
}

/** The scanned code (a governance ScanInput) */
export interface DetectionInput {
  html: string;
  javascript: string;
}

export interface DetectedComponent {
  componentId: string;
  componentName: string;
  usageCount: number;
}

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** "DataTable" or "Data Table" -> "data-table" */
const kebab = (name: string) =>
  name
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();

/** "Data Table" -> "DataTable" */
const pascal = (name: string) => name.replace(/[\s_-]+(\w)/g, (_, c: string) => c.toUpperCase()).replace(/^\w/, (c) => c.toUpperCase());

const count = (text: string, pattern: RegExp) => (text.match(pattern) ?? []).length;

/** Markup without its inline scripts: a scan's JavaScript already holds them when none was sent separately */
const withoutScripts = (html: string) => html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');

/**
 * Package prefixes whose imports count as design-system components:
 * COMPONENT_IMPORT_PACKAGES, comma-separated (e.g. `@acme/ui/,@acme/components`),
 * default `@designsystem/`. A prefix ending in `/` matches packages under it;
 * otherwise it matches that package and its subpaths.
 */
export function componentImportPrefixes(env: NodeJS.ProcessEnv = process.env): string[] {
  const prefixes = (env.COMPONENT_IMPORT_PACKAGES ?? '@designsystem/')
    .split(',')
    .map((prefix) => prefix.trim())
    .filter(Boolean);
  return prefixes.length ? prefixes : ['@designsystem/'];
}

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Names imported from a design-system package (see componentImportPrefixes) */
function designSystemImports(javascript: string, prefixes: string[]): Set<string> {
  const names = new Set<string>();
  const packages = prefixes.map((prefix) => (prefix.endsWith('/') ? `${escapeRegExp(prefix)}` : `${escapeRegExp(prefix)}(?:/|(?=['"]))`)).join('|');
  const statement = new RegExp(`import\\s+([^;'"]*?)\\s+from\\s+['"](?:${packages})([^'"]*)['"]`, 'g');
  for (const [, clause, path] of javascript.matchAll(statement)) {
    const named = /\{([^}]*)\}/.exec(clause)?.[1] ?? '';
    for (const part of named.split(',')) {
      const imported = part.trim().split(/\s+as\s+/)[0]?.trim();
      if (imported) names.add(imported);
    }
    const defaultName = clause.replace(/\{[^}]*\}/, '').replace(/,/g, ' ').trim().split(/\s+/)[0];
    if (defaultName && !defaultName.startsWith('*')) names.add(defaultName);
    // `import X from '@designsystem/components/data-table'`: the path names the component too
    const last = path.split('/').filter(Boolean).pop();
    if (last) names.add(pascal(last));
  }
  return names;
}

/**
 * The design-system components a scan's code uses: tags in the markup or
 * JSX (`<DataTable`, or `<data-table` for multi-word names, since a one-word
 * kebab name like `button` is a native element), and names imported from a
 * design-system package (componentImportPrefixes). Matching is case-sensitive for PascalCase tags so
 * `<button>` never counts as the Button component. Rendered pages (URL scans)
 * rarely show which components produced them, so they usually find none.
 */
export function detectComponents(inputs: DetectionInput[], components: DetectableComponent[]): DetectedComponent[] {
  const imported = new Set<string>();
  const prefixes = componentImportPrefixes();
  for (const input of inputs) designSystemImports(input.javascript, prefixes).forEach((name) => imported.add(name));

  const sources = inputs.flatMap((input) => [withoutScripts(input.html), input.javascript]);
  const detected: DetectedComponent[] = [];
  for (const component of components) {
    const name = pascal(component.name.trim());
    if (!/^[A-Za-z][\w$]*$/.test(name)) continue;
    const kebabName = kebab(component.name);
    const tag = new RegExp(`<${escape(name)}(?=[\\s/>])`, 'g');
    const kebabTag = kebabName.includes('-') ? new RegExp(`<${escape(kebabName)}(?=[\\s/>])`, 'gi') : null;
    let uses = 0;
    for (const code of sources) {
      uses += count(code, tag);
      if (kebabTag) uses += count(code, kebabTag);
    }
    if (uses === 0 && imported.has(name)) uses = 1;
    if (uses > 0) detected.push({ componentId: component.id, componentName: component.name, usageCount: uses });
  }
  return detected;
}
