import { RuleTester } from 'eslint';
import { builtInRules } from '../src/rules';

// ESLint 8 (installed) RuleTester takes eslintrc-style options; the installed
// @types/eslint describe v9's flat RuleTester, so it is typed loosely here.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ruleTester: any = new (RuleTester as any)({
  parserOptions: { ecmaVersion: 2022, sourceType: 'module', ecmaFeatures: { jsx: true } }
});
const tsParser = require.resolve('@typescript-eslint/parser');

describe('hardcoded-design-tokens', () => {
  ruleTester.run('hardcoded-design-tokens', builtInRules['hardcoded-design-tokens'], {
    valid: [
      '',
      'const color = tokens.color.primary;',
      "const a = 'hello'; const n = 42; const r = /#fff/; const b = null; const t = true;",
      "const url = 'https://example.com/page#abc';",
      "const entity = '&#123;';",
      "const id = '#not-a-color';",
      "import x from '#fff';",
      "const o = { '#ffffff': 1 };",
      'const t = `plain ${x} text`;',
      'const t = tag``;',
      { code: "const c: string = 'token';", parser: tsParser }
    ],
    invalid: [
      {
        code: "const color = '#3b82f6';",
        errors: [{ messageId: 'hardcodedColor', data: { value: '#3b82f6' } }]
      },
      { code: "const c = '#FFF';", errors: [{ messageId: 'hardcodedColor', data: { value: '#FFF' } }] },
      { code: "const c = '#ffffff80';", errors: [{ messageId: 'hardcodedColor' }] },
      {
        code: "const border = '1px solid #ff0000';",
        errors: [{ messageId: 'hardcodedColor', data: { value: '#ff0000' } }]
      },
      {
        code: "const c = 'rgba(0, 0, 0, 0.5)';",
        errors: [{ messageId: 'hardcodedColor', data: { value: 'rgba(0, 0, 0, 0.5)' } }]
      },
      {
        code: 'const css = `color: #abcdef; background: ${bg}; border-color: #123456;`;',
        errors: [
          { messageId: 'hardcodedColor', data: { value: '#abcdef' } },
          { messageId: 'hardcodedColor', data: { value: '#123456' } }
        ]
      },
      {
        code: 'const Button = styled.button`color: #fff;`;',
        errors: [{ messageId: 'hardcodedColor', data: { value: '#fff' } }]
      },
      {
        code: 'const el = <div style={{ color: "#3b82f6" }} data-c="#000" />;',
        errors: [{ messageId: 'hardcodedColor' }, { messageId: 'hardcodedColor' }]
      },
      {
        code: "const c: string = '#3b82f6' as const;",
        parser: tsParser,
        errors: [{ messageId: 'hardcodedColor' }]
      }
    ]
  });
});

describe('component-naming', () => {
  ruleTester.run('component-naming', builtInRules['component-naming'], {
    valid: [
      '',
      'const Button = () => null;',
      'function UserCard() { return null; }',
      'class DataTable {}',
      'const HTTPClient = 1;',
      // Not components: lowercase, private, $-prefixed, ALL_CAPS constants.
      'const _private = 1;',
      'const $el = document.body;',
      'const camelCase = 1;',
      'const snake_case = 1;',
      'const MAX_SIZE = 10;',
      'const API_V2 = "x";',
      'const X = 1;',
      // References to badly-named identifiers are not declarations.
      'foo(Some_Thing); Bad_Name.call();',
      "import { Third_Party } from 'lib';",
      'const { Foo_Bar } = obj;',
      'const fn = function () {};',
      { code: 'type Props_Type = {}; interface Foo_Bar {}', parser: tsParser }
    ],
    invalid: [
      {
        code: 'const My_Component = () => null;',
        errors: [{ messageId: 'invalidNaming', data: { name: 'My_Component' } }]
      },
      { code: 'function User_Card() {}', errors: [{ messageId: 'invalidNaming', data: { name: 'User_Card' } }] },
      { code: 'class Data_Table {}', errors: [{ messageId: 'invalidNaming' }] },
      { code: 'const C = class Bad_Class {};', errors: [{ messageId: 'invalidNaming', data: { name: 'Bad_Class' } }] },
      { code: 'const Foo$ = 1;', errors: [{ messageId: 'invalidNaming', data: { name: 'Foo$' } }] },
      { code: 'const API_Url = "x";', errors: [{ messageId: 'invalidNaming', data: { name: 'API_Url' } }] }
    ]
  });
});

describe('accessibility-attributes', () => {
  ruleTester.run('accessibility-attributes', builtInRules['accessibility-attributes'], {
    valid: [
      '',
      'const x = 1;',
      '<button>Save</button>',
      '<button>{label}</button>',
      '<button><Icon /></button>',
      '<button><img src="x.png" alt="Close" /></button>',
      '<button><span>Close</span></button>',
      '<button aria-label="Close" />',
      '<button aria-labelledby="title-id" />',
      '<button title="Close" />',
      '<button {...props} />',
      '<button aria-hidden="true" tabIndex={-1} />',
      '<Button />',
      '<Input />',
      '<ui.button />',
      '<svg:button />',
      '<div />',
      '<input id="email" />',
      '<input aria-label="Email" />',
      '<input type="hidden" name="csrf" />',
      '<input type="submit" />',
      '<input type="button" value="Go" />',
      '<input type="image" alt="Search" src="s.png" />',
      '<label>Name <input /></label>',
      '<label>Pick <div><select><option>a</option></select></div></label>',
      '<textarea aria-label={t("notes")} />',
      '<select aria-labelledby="lbl"><option>a</option></select>',
      { code: 'const el = <button aria-label="x" />;', parser: tsParser }
    ],
    invalid: [
      { code: '<button />', errors: [{ messageId: 'missingAriaLabel' }] },
      { code: '<button></button>', errors: [{ messageId: 'missingAriaLabel' }] },
      { code: '<button>   </button>', errors: [{ messageId: 'missingAriaLabel' }] },
      { code: '<button><svg /></button>', errors: [{ messageId: 'missingAriaLabel' }] },
      { code: '<button aria-label="" />', errors: [{ messageId: 'missingAriaLabel' }] },
      { code: '<button aria-label />', errors: [{ messageId: 'missingAriaLabel' }] },
      { code: '<input />', errors: [{ messageId: 'missingAriaLabel' }] },
      { code: '<input placeholder="Email" />', errors: [{ messageId: 'missingAriaLabel' }] },
      { code: '<input type="button" />', errors: [{ messageId: 'missingAriaLabel' }] },
      { code: '<select><option>a</option></select>', errors: [{ messageId: 'missingAriaLabel' }] },
      { code: '<textarea />', errors: [{ messageId: 'missingAriaLabel' }] },
      {
        code: 'const C = () => <form><input /><button /></form>;',
        parser: tsParser,
        errors: [{ messageId: 'missingAriaLabel' }, { messageId: 'missingAriaLabel' }]
      }
    ]
  });
});

describe('spacing-consistency', () => {
  ruleTester.run('spacing-consistency', builtInRules['spacing-consistency'], {
    valid: [
      '',
      'const spacing = tokens.spacing.md;',
      "const zero = '0px';",
      "const m = '0px 0px';",
      "const s = '16 px';",
      "const s = '16em';",
      "const width = '200px';",
      "const style = { width: '100px', height: '20px', borderRadius: '4px', fontSize: '16px' };",
      "el.style.borderWidth = '2px';",
      "const o = { '16px': true };",
      "import x from '16px';",
      'const n = 16;'
    ],
    invalid: [
      {
        code: "const spacing = '16px';",
        errors: [{ messageId: 'inconsistentSpacing', data: { value: '16px' } }]
      },
      { code: "const s = { margin: '8px 16px' };", errors: [{ messageId: 'inconsistentSpacing' }] },
      { code: "const s = { marginTop: '-4px' };", errors: [{ messageId: 'inconsistentSpacing' }] },
      { code: "el.style.padding = '12px';", errors: [{ messageId: 'inconsistentSpacing' }] },
      { code: "el.style['padding-left'] = '12px';", errors: [{ messageId: 'inconsistentSpacing' }] },
      { code: "setGap('24px');", errors: [{ messageId: 'inconsistentSpacing' }] },
      { code: "const s = { gap: cond ? '4px' : '8px' };", errors: 2 },
      { code: '<Box padding="16px" />', errors: [{ messageId: 'inconsistentSpacing' }] }
    ]
  });
});

describe('typography-scale', () => {
  ruleTester.run('typography-scale', builtInRules['typography-scale'], {
    valid: [
      '',
      'const fontSize = tokens.font.md;',
      "const s = { fontSize: 'inherit' };",
      "const s = { fontSize: '0px' };",
      'const s = { lineHeight: 1.5 };',
      "const s = { margin: '16px' };",
      "const size = '1.5rem';",
      "const o = { fontSize: true };"
    ],
    invalid: [
      {
        code: "const s = { fontSize: '16px' };",
        errors: [{ messageId: 'invalidTypography', data: { value: '16px' } }]
      },
      { code: "const s = { 'font-size': '1.25rem' };", errors: [{ messageId: 'invalidTypography' }] },
      { code: "const s = { lineHeight: '24px' };", errors: [{ messageId: 'invalidTypography' }] },
      { code: "const s = { letterSpacing: '.5em' };", errors: [{ messageId: 'invalidTypography' }] },
      { code: 'const s = { fontSize: 16 };', errors: [{ messageId: 'invalidTypography', data: { value: '16' } }] },
      { code: "el.style.fontSize = '12pt';", errors: [{ messageId: 'invalidTypography' }] },
      { code: "const headingFontSize = '32px';", errors: [{ messageId: 'invalidTypography' }] },
      { code: '<Text fontSize="14px" />', errors: [{ messageId: 'invalidTypography' }] },
      { code: '<Text fontSize={14} />', errors: [{ messageId: 'invalidTypography' }] }
    ]
  });
});
