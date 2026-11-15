import { toStyleDictionary } from './style-dictionary';
import { WorkspaceResource } from './workspace.types';

const token = (name: string, value: string, extra: Record<string, unknown> = {}) =>
  ({ name, value, type: 'color', ...extra }) as unknown as WorkspaceResource;

describe('toStyleDictionary', () => {
  it('nests tokens by the parts of their names', () => {
    expect(toStyleDictionary([token('color.brand.primary', '#33f', { description: 'Main' }), token('radius', '4px', { type: 'dimension' })])).toEqual({
      color: { brand: { primary: { value: '#33f', type: 'color', comment: 'Main' } } },
      radius: { value: '4px', type: 'dimension' },
    });
  });

  it('puts a token whose name is also a group under DEFAULT, whichever comes first', () => {
    const expected = { color: { primary: { DEFAULT: { value: '#33f', type: 'color' }, hover: { value: '#22e', type: 'color' } } } };
    expect(toStyleDictionary([token('color.primary', '#33f'), token('color.primary.hover', '#22e')])).toEqual(expected);
    expect(toStyleDictionary([token('color.primary.hover', '#22e'), token('color.primary', '#33f')])).toEqual(expected);
  });

  it('keeps the first of two tokens with the same name', () => {
    expect(toStyleDictionary([token('color.primary', '#33f'), token('color.primary', '#000')])).toEqual({ color: { primary: { value: '#33f', type: 'color' } } });
  });

  it('keeps names like __proto__ as plain keys', () => {
    const tree = toStyleDictionary([token('__proto__.polluted', 'yes'), token('constructor', 'x')]);
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    expect(JSON.parse(JSON.stringify(tree))).toEqual({ ['__proto__']: { polluted: { value: 'yes', type: 'color' } }, constructor: { value: 'x', type: 'color' } });
  });
});
