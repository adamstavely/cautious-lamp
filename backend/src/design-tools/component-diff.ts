import { DesignToolComponent } from './design-tool.types';

export type ComponentReportKind = 'matched' | 'renamed' | 'missing-in-code' | 'missing-in-design';

export interface ComponentReportItem {
  kind: ComponentReportKind;
  componentId?: string;
  componentName?: string;
  designId?: string;
  designName?: string;
  designPath?: string;
  designUrl?: string;
  description?: string;
  variants?: string[];
  /** Matched through a link someone set, rather than by name */
  linked?: boolean;
  note?: string;
}

/** A design node matched to a code component on an earlier compare, to spot renames */
export interface PreviousMatch {
  componentId: string;
  designName: string;
}

export interface ComponentReport {
  items: ComponentReportItem[];
  counts: Record<ComponentReportKind, number>;
  /** This compare's matches, keyed by design node id, for the next one */
  matches: Record<string, PreviousMatch>;
}

/** "Text Field", "text-field" and "TextField" are the same component */
export function componentKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function editDistance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const saved = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = saved;
    }
  }
  return row[b.length];
}

/**
 * Matches a design file's components (component sets count once, with their
 * variants) to the library's code components, in order: links people set,
 * the same design node as last time (a new name there is a rename), then the
 * same name. What's left is missing on one side; a close pair of leftover
 * names is reported as a possible rename instead.
 */
export function compareComponents(
  design: DesignToolComponent[],
  code: Array<{ id: string; name: string }>,
  links: Record<string, string>,
  previous: Record<string, PreviousMatch>,
): ComponentReport {
  const items: ComponentReportItem[] = [];
  const matches: Record<string, PreviousMatch> = {};
  const designById = new Map(design.map((d) => [d.id, d]));
  const codeById = new Map(code.map((c) => [c.id, c]));
  const usedDesign = new Set<string>();
  const usedCode = new Set<string>();

  const pair = (kind: ComponentReportKind, d: DesignToolComponent, c: { id: string; name: string }, extra: Partial<ComponentReportItem> = {}) => {
    usedDesign.add(d.id);
    usedCode.add(c.id);
    matches[d.id] = { componentId: c.id, designName: d.name };
    items.push({ kind, ...designFields(d), componentId: c.id, componentName: c.name, ...extra });
  };

  for (const [componentId, designId] of Object.entries(links)) {
    const d = designById.get(designId);
    const c = codeById.get(componentId);
    if (!d || !c || usedDesign.has(d.id) || usedCode.has(c.id)) continue;
    const same = componentKey(d.name) === componentKey(c.name);
    pair(same ? 'matched' : 'renamed', d, c, { linked: true, ...(same ? {} : { note: `Linked, but named "${d.name}" in the design file and "${c.name}" in code` }) });
  }

  for (const [designId, match] of Object.entries(previous)) {
    const d = designById.get(designId);
    const c = codeById.get(match.componentId);
    if (!d || !c || usedDesign.has(d.id) || usedCode.has(c.id)) continue;
    const same = componentKey(d.name) === componentKey(c.name);
    pair(same ? 'matched' : 'renamed', d, c, same ? {} : { note: `Renamed in the design file from "${match.designName}" to "${d.name}"; code still calls it "${c.name}"` });
  }

  const codeByKey = new Map<string, { id: string; name: string }>();
  for (const c of code) if (!usedCode.has(c.id) && !codeByKey.has(componentKey(c.name))) codeByKey.set(componentKey(c.name), c);
  for (const d of design) {
    if (usedDesign.has(d.id)) continue;
    const c = codeByKey.get(componentKey(d.name));
    if (c && !usedCode.has(c.id)) pair('matched', d, c);
  }

  const designLeft = design.filter((d) => !usedDesign.has(d.id));
  const codeLeft = code.filter((c) => !usedCode.has(c.id));
  for (const d of designLeft) {
    const key = componentKey(d.name);
    const close = key.length >= 4 ? codeLeft.find((c) => !usedCode.has(c.id) && editDistance(key, componentKey(c.name)) <= 2) : undefined;
    if (close) {
      usedDesign.add(d.id);
      usedCode.add(close.id);
      items.push({ kind: 'renamed', ...designFields(d), componentId: close.id, componentName: close.name, note: `Possibly the same component: "${d.name}" in the design file, "${close.name}" in code` });
      continue;
    }
    usedDesign.add(d.id);
    items.push({ kind: 'missing-in-code', ...designFields(d) });
  }
  for (const c of codeLeft) {
    if (usedCode.has(c.id)) continue;
    items.push({ kind: 'missing-in-design', componentId: c.id, componentName: c.name });
  }

  const counts = { matched: 0, renamed: 0, 'missing-in-code': 0, 'missing-in-design': 0 } as Record<ComponentReportKind, number>;
  for (const item of items) counts[item.kind]++;
  const order: Record<ComponentReportKind, number> = { renamed: 0, 'missing-in-code': 1, 'missing-in-design': 2, matched: 3 };
  items.sort((a, b) => order[a.kind] - order[b.kind] || (a.designName ?? a.componentName ?? '').localeCompare(b.designName ?? b.componentName ?? ''));
  return { items, counts, matches };
}

function designFields(d: DesignToolComponent): Partial<ComponentReportItem> {
  return {
    designId: d.id,
    designName: d.name,
    ...(d.path ? { designPath: d.path } : {}),
    ...(d.url ? { designUrl: d.url } : {}),
    ...(d.description ? { description: d.description } : {}),
    ...(d.variants.length ? { variants: d.variants } : {}),
  };
}
