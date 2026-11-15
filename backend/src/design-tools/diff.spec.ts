import type { Token } from '../design-system/design-system.service';
import { compareComponents } from './component-diff';
import { DesignToolToken } from './design-tool.types';
import { diffTokens } from './token-diff';
import { sameValue, tokenNameFor } from './token-mapping';

const design = (name: string, value: string, type = 'color', category = 'colors'): DesignToolToken => ({
  id: `id:${name}`,
  designName: name,
  name,
  value,
  kind: 'color',
  type,
  category,
  source: 'variable',
});
const code = (name: string, value: string, type = 'color', category = 'colors'): Token => ({ name, value, type, category });

describe('Token names and values', () => {
  it('follows the design system naming', () => {
    expect(tokenNameFor('color', 'Colors/Primary/500')).toBe('color.primary.500');
    expect(tokenNameFor('color', 'Brand Blue')).toBe('color.brand-blue');
    expect(tokenNameFor('radius', 'border/radius/sm')).toBe('border.radius.sm');
    expect(tokenNameFor('spacing', 'Space/2XL')).toBe('spacing.2xl');
    expect(tokenNameFor('fontSize', 'Font size/Body')).toBe('typography.fontSize.body');
  });

  it('compares values loosely', () => {
    expect(sameValue('1rem', '16px')).toBe(true);
    expect(sameValue('#FFF', '#ffffff')).toBe(true);
    expect(sameValue('#4f46e5ff', '#4f46e5')).toBe(true);
    expect(sameValue('0', '0px')).toBe(true);
    expect(sameValue('0.25rem', '6px')).toBe(false);
  });
});

describe('Token diff', () => {
  it('finds added and changed tokens on a first sync, and leaves matching ones alone', () => {
    const diff = diffTokens(
      [design('color.primary', '#4f46e5'), design('color.brand', '#ff8000'), design('spacing.md', '16px', 'dimension', 'spacing'), design('color.secondary', '#000000')],
      [code('color.primary', '#4F46E5'), code('spacing.md', '1rem', 'dimension', 'spacing'), code('color.secondary', '#6366f1'), code('color.error', '#ef4444')],
      {},
    );
    expect(diff.items.map((i) => [i.kind, i.id, i.defaultChoice])).toEqual([
      ['changed', 'color.secondary', 'take-design'],
      ['added', 'color.brand', 'take-design'],
    ]);
    expect(diff.unchanged).toBe(2);
    expect(diff.matched).toEqual({ 'color.primary': { design: '#4f46e5', code: '#4F46E5' }, 'spacing.md': { design: '16px', code: '1rem' } });
    // Tokens only in code were never synced from this file: not "removed"
    expect(diff.items.some((i) => i.id === 'color.error')).toBe(false);
  });

  it('uses the baseline to tell design changes, code changes, conflicts and removals apart', () => {
    const agreed = (value: string) => ({ design: value, code: value });
    const baseline = {
      'color.a': agreed('#111111'),
      'color.b': agreed('#222222'),
      'color.c': agreed('#333333'),
      'color.gone': agreed('#444444'),
      'color.deleted-in-code': agreed('#555555'),
      // Code kept its own value last time: only a new design value is news
      'color.kept': { design: '#666666', code: '#606060' },
    };
    const diff = diffTokens(
      [design('color.a', '#aaaaaa'), design('color.b', '#222222'), design('color.c', '#cccccc'), design('color.deleted-in-code', '#555555'), design('color.kept', '#666666')],
      [code('color.a', '#111111'), code('color.b', '#bbbbbb'), code('color.c', '#c0c0c0'), code('color.gone', '#444444'), code('color.kept', '#606060')],
      baseline,
    );
    const byId = Object.fromEntries(diff.items.map((i) => [i.id, i]));
    expect(byId['color.a']).toMatchObject({ kind: 'changed', defaultChoice: 'take-design', baselineValue: '#111111' });
    // Only code moved: code wins, nothing proposed
    expect(byId['color.b']).toBeUndefined();
    expect(byId['color.c']).toMatchObject({ kind: 'conflict', defaultChoice: 'skip' });
    expect(byId['color.gone']).toMatchObject({ kind: 'removed', defaultChoice: 'skip', codeValue: '#444444' });
    expect(byId['color.deleted-in-code']).toMatchObject({ kind: 'conflict', reason: expect.stringMatching(/Deleted in code/) });
    expect(byId['color.kept']).toBeUndefined();
  });

  it('treats type mismatches and overwritten references as conflicts', () => {
    const diff = diffTokens(
      [design('color.button', '#4f46e5'), design('spacing.md', '#ffffff')],
      [code('color.button', '{color.primary}'), code('spacing.md', '1rem', 'dimension', 'spacing')],
      {},
    );
    expect(diff.items.map((i) => [i.id, i.kind])).toEqual([
      ['color.button', 'conflict'],
      ['spacing.md', 'conflict'],
    ]);
  });

  it('warns when two design tokens map to the same name', () => {
    const diff = diffTokens([design('color.x', '#000000'), { ...design('color.x', '#ffffff'), designName: 'Other/X' }], [], {});
    expect(diff.items).toHaveLength(1);
    expect(diff.warnings[0]).toMatch(/both map to color\.x/);
  });
});

describe('Component compare', () => {
  const designComponents = [
    { id: '1:0', name: 'Button', variants: ['Size=Small'], kind: 'component-set' as const },
    { id: '2:1', name: 'Text Field', path: 'Forms', variants: [], kind: 'component' as const },
    { id: '3:1', name: 'Toast', variants: [], kind: 'component' as const },
    { id: '4:1', name: 'Dialog', variants: [], kind: 'component' as const },
    { id: '5:1', name: 'Selectt', variants: [], kind: 'component' as const },
  ];
  const codeComponents = [
    { id: 'button', name: 'Button' },
    { id: 'input', name: 'Input' },
    { id: 'modal', name: 'Modal' },
    { id: 'select', name: 'Select' },
    { id: 'card', name: 'Card' },
  ];

  it('matches by name, link and previous match, and reports what is missing or renamed', () => {
    const report = compareComponents(designComponents, codeComponents, { input: '2:1' }, { '4:1': { componentId: 'modal', designName: 'Modal' } });
    const find = (kind: string, id: string) => report.items.find((i) => i.kind === kind && (i.designId === id || i.componentId === id));
    expect(find('matched', '1:0')).toMatchObject({ componentId: 'button', variants: ['Size=Small'] });
    expect(find('renamed', '2:1')).toMatchObject({ componentId: 'input', linked: true });
    expect(find('renamed', '4:1')).toMatchObject({ componentId: 'modal', note: expect.stringMatching(/from "Modal" to "Dialog"/) });
    expect(find('renamed', '5:1')).toMatchObject({ componentId: 'select', note: expect.stringMatching(/Possibly/) });
    expect(find('missing-in-code', '3:1')).toBeTruthy();
    expect(find('missing-in-design', 'card')).toBeTruthy();
    expect(report.counts).toEqual({ matched: 1, renamed: 3, 'missing-in-code': 1, 'missing-in-design': 1 });
    expect(report.matches['4:1']).toEqual({ componentId: 'modal', designName: 'Dialog' });
  });
});
