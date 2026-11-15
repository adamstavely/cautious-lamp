import { detectComponents } from './component-detection';

const components = [
  { id: 'button', name: 'Button' },
  { id: 'data-table', name: 'DataTable' },
  { id: 'date-picker', name: 'Date Picker' },
  { id: 'card', name: 'Card' },
];

const input = (html: string, javascript = '') => ({ html, javascript });

describe('detectComponents', () => {
  it('counts PascalCase tags in markup and JSX, case-sensitively', () => {
    const found = detectComponents(
      [input('<Button>Save</Button><Button variant="ghost"/><button>native</button>', 'return <DataTable rows={rows} />;')],
      components,
    );
    expect(found).toEqual([
      { componentId: 'button', componentName: 'Button', usageCount: 2 },
      { componentId: 'data-table', componentName: 'DataTable', usageCount: 1 },
    ]);
  });

  it('counts kebab-case tags only for multi-word names, so native elements never match', () => {
    const found = detectComponents([input('<data-table></data-table><date-picker value="x"></date-picker><button></button><card></card>')], components);
    expect(found.map((d) => [d.componentId, d.usageCount])).toEqual([
      ['data-table', 1],
      ['date-picker', 1],
    ]);
  });

  it('counts a component imported from a design-system package once when no tag is found', () => {
    const found = detectComponents(
      [input('', "import { Card, Button as DsButton } from '@designsystem/components';\nimport DatePicker from '@designsystem/components/date-picker';")],
      components,
    );
    expect(found.map((d) => [d.componentId, d.usageCount]).sort()).toEqual([
      ['button', 1],
      ['card', 1],
      ['date-picker', 1],
    ]);
  });

  it('ignores imports from other packages and tags that only start with a name', () => {
    expect(detectComponents([input('<ButtonGroup></ButtonGroup><Cards/>', "import { Button } from 'other-lib';")], components)).toEqual([]);
  });

  it("doesn't count an inline script twice when the scan's JavaScript came from it", () => {
    const html = '<div id="app"></div><script>render(<Card title="x" />)</script>';
    expect(detectComponents([input(html, 'render(<Card title="x" />)')], components)).toEqual([{ componentId: 'card', componentName: 'Card', usageCount: 1 }]);
  });
});
