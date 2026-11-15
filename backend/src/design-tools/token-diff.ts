import type { Token } from '../design-system/design-system.service';
import { DesignToolToken } from './design-tool.types';
import { compatibleTypes, isReference, sameValue } from './token-mapping';

export type TokenDiffKind = 'added' | 'changed' | 'removed' | 'conflict';
/** Per item: write the design value, keep the code value (and stop proposing this design value), or leave it for later */
export type SyncChoice = 'take-design' | 'keep-code' | 'skip';
export const SYNC_CHOICES: readonly SyncChoice[] = ['take-design', 'keep-code', 'skip'];

/**
 * What both sides held when they last agreed on a token: the design value,
 * and the code value kept or written ('' when code chose to keep it deleted)
 */
export interface BaselineEntry {
  design: string;
  code: string;
}

export interface TokenDiffItem {
  /** The design-system token name; unique within a diff */
  id: string;
  kind: TokenDiffKind;
  designId?: string;
  designName?: string;
  designValue?: string;
  codeValue?: string;
  /** The design value at the last applied sync */
  baselineValue?: string;
  type: string;
  category: string;
  description?: string;
  /** Why it is a conflict, or what changed */
  reason: string;
  /** What applying does when the person doesn't choose: never destructive */
  defaultChoice: SyncChoice;
}

export interface TokenDiff {
  items: TokenDiffItem[];
  /** Design tokens that already match code, by name, for the baseline */
  matched: Record<string, BaselineEntry>;
  unchanged: number;
  warnings: string[];
}

/**
 * Compares the tokens read from a design file with the design system's.
 * `baseline` holds the values each token had on both sides when this
 * connection last applied (the design value, and the code value written or
 * kept), so a three-way compare can tell who changed:
 *
 * - added: in the design file, not in code
 * - changed: the design value moved and code didn't (or there's no baseline yet)
 * - conflict: both moved since the baseline, the types disagree, code holds a
 *   reference the design value would overwrite, or code deleted a synced token
 * - removed: synced before, gone from the design file, still in code
 *
 * Changes made only in code are left alone. Removals and conflicts default
 * to "skip", so nothing destructive happens unless someone chooses it.
 */
export function diffTokens(design: DesignToolToken[], code: Token[], baseline: Record<string, BaselineEntry>): TokenDiff {
  const warnings: string[] = [];
  const byName = new Map<string, DesignToolToken>();
  for (const token of design) {
    const first = byName.get(token.name);
    if (first) {
      warnings.push(`"${token.designName}" and "${first.designName}" both map to ${token.name}; "${first.designName}" was used`);
      continue;
    }
    byName.set(token.name, token);
  }
  const codeByName = new Map(code.map((t) => [t.name, t]));
  const items: TokenDiffItem[] = [];
  const matched: Record<string, BaselineEntry> = {};
  let unchanged = 0;

  for (const token of byName.values()) {
    const current = codeByName.get(token.name);
    const base = baseline[token.name];
    const item = (kind: TokenDiffKind, reason: string, defaultChoice: SyncChoice): TokenDiffItem => ({
      id: token.name,
      kind,
      designId: token.id,
      designName: token.designName,
      designValue: token.value,
      ...(current ? { codeValue: current.value } : {}),
      ...(base !== undefined ? { baselineValue: base.design } : {}),
      type: token.type,
      category: token.category,
      ...(token.description ? { description: token.description } : {}),
      reason,
      defaultChoice,
    });

    if (!current) {
      // Deleted in code, and someone chose to keep it deleted for this design value
      if (base?.code === '' && sameValue(token.value, base.design)) {
        unchanged++;
        continue;
      }
      if (base !== undefined) items.push(item('conflict', 'Deleted in code since the last sync, still in the design file', 'skip'));
      else items.push(item('added', 'New in the design file', 'take-design'));
      continue;
    }
    if (!compatibleTypes(current.type, token.type)) {
      items.push(item('conflict', `Type differs: ${current.type} in code, ${token.type} in the design file`, 'skip'));
      continue;
    }
    if (sameValue(current.value, token.value)) {
      matched[token.name] = { design: token.value, code: current.value };
      unchanged++;
      continue;
    }
    if (base !== undefined) {
      const designMoved = !sameValue(token.value, base.design);
      const codeMoved = !sameValue(current.value, base.code);
      if (!designMoved) {
        // Only code changed since the last sync: code wins, nothing to propose
        unchanged++;
        continue;
      }
      if (codeMoved) {
        items.push(item('conflict', `Changed on both sides since the last sync (design was ${base.design}, code was ${base.code})`, 'skip'));
        continue;
      }
      items.push(item('changed', `Changed in the design file since the last sync (was ${base.design})`, 'take-design'));
      continue;
    }
    if (isReference(current.value) && !isReference(token.value)) {
      items.push(item('conflict', `Code refers to ${current.value}; taking the design value would replace the reference`, 'skip'));
      continue;
    }
    items.push(item('changed', 'Differs from code (first sync of this token)', 'take-design'));
  }

  for (const [name, base] of Object.entries(baseline)) {
    if (byName.has(name)) continue;
    const current = codeByName.get(name);
    if (!current) continue;
    items.push({
      id: name,
      kind: 'removed',
      codeValue: current.value,
      baselineValue: base.design,
      type: current.type,
      category: current.category,
      reason: 'Removed from the design file since the last sync',
      defaultChoice: 'skip',
    });
  }

  const order: Record<TokenDiffKind, number> = { conflict: 0, changed: 1, added: 2, removed: 3 };
  items.sort((a, b) => order[a.kind] - order[b.kind] || a.id.localeCompare(b.id));
  return { items, matched, unchanged, warnings };
}

/** The choices that make sense for an item: an added token has no code value to keep */
export function allowedChoices(kind: TokenDiffKind): SyncChoice[] {
  return kind === 'added' ? ['take-design', 'skip'] : ['take-design', 'keep-code', 'skip'];
}
