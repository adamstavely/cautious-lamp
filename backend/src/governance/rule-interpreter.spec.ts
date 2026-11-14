import { BUILTIN_RULES } from './builtin-rules';
import { GovernanceRule, LIMITS, RuleDefinition, ScanInput } from './governance.types';
import { RegexRunner } from './regex-safety';
import { cssDeclarations, evaluateRule, runRules } from './rule-interpreter';
import { normalizeRuleDefinition } from './rule-validation';

const runner = new RegexRunner(500);
afterAll(() => runner.close());

const ctx = { runner, tokens: [{ name: 'brand-primary', value: '#0055FF', category: 'colors' }] };

function rule(definition: Partial<RuleDefinition>): GovernanceRule {
  const normalized = normalizeRuleDefinition({
    name: 'Test rule',
    description: '',
    category: 'custom',
    severity: 'warning',
    enabled: true,
    message: 'Violation',
    target: 'html',
    type: 'regex-absent',
    ...definition,
  } as RuleDefinition);
  return { ...normalized, id: 'r1', builtIn: false, version: 3, createdAt: '', updatedAt: '', createdBy: '', updatedBy: '' };
}

const input = (parts: Partial<ScanInput>): ScanInput => ({ html: '', css: '', javascript: '', ...parts });

describe('rule interpreter', () => {
  it('regex-present passes when the pattern is found, fails when not, skips empty targets', async () => {
    const r = rule({ type: 'regex-present', target: 'javascript', pattern: `from\\s+['"]@designsystem/` });
    expect((await evaluateRule(r, input({ javascript: `import { Button } from '@designsystem/vue'` }), ctx)).outcome).toBe('pass');
    const missing = await evaluateRule(r, input({ javascript: `import x from 'lodash'` }), ctx);
    expect(missing).toMatchObject({ outcome: 'fail', violations: [{ message: 'Violation' }] });
    expect((await evaluateRule(r, input({}), ctx)).outcome).toBe('skipped');
  });

  it('regex-absent reports each match with its line', async () => {
    const r = rule({ type: 'regex-absent', target: 'css', pattern: '!important' });
    const result = await evaluateRule(r, input({ css: 'a { color: red; }\nb { color: blue !important; }\nc { x: y !important }' }), ctx);
    expect(result.outcome).toBe('fail');
    expect(result.violations.map((v) => v.line)).toEqual([2, 3]);
  });

  it('selector-attribute flags elements missing every listed attribute, and values not matching the pattern', async () => {
    const alt = rule({ type: 'selector-attribute', selector: 'img', attribute: 'alt' });
    const html = '<img src="a.png" alt="A">\n<img src="b.png">\n<p>x</p>';
    const result = await evaluateRule(alt, input({ html }), ctx);
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0]).toMatchObject({ line: 2, element: '<img src="b.png">' });

    const anyOf = rule({ type: 'selector-attribute', selector: 'input', attribute: 'aria-describedby|title' });
    expect((await evaluateRule(anyOf, input({ html: '<input title="t"><input aria-describedby="h">' }), ctx)).outcome).toBe('pass');

    const target = rule({ type: 'selector-attribute', selector: 'a[target]', attribute: 'rel', pattern: 'noopener' });
    const links = '<a target="_blank" rel="noopener">ok</a><a target="_blank" rel="nofollow">bad</a><a target="_blank">bad</a>';
    expect((await evaluateRule(target, input({ html: links }), ctx)).violations).toHaveLength(2);
  });

  it('selector-count checks min and max', async () => {
    const one = rule({ type: 'selector-count', selector: 'h1', min: 1, max: 1 });
    expect((await evaluateRule(one, input({ html: '<h1>a</h1>' }), ctx)).outcome).toBe('pass');
    const none = await evaluateRule(one, input({ html: '<p>a</p>' }), ctx);
    expect(none.violations[0].message).toMatch(/found 0 "h1", expected at least 1/);
    expect((await evaluateRule(one, input({ html: '<h1>a</h1><h1>b</h1>' }), ctx)).violations[0].message).toMatch(/at most 1/);
  });

  it('token-usage accepts var(), token values and allowed values, and flags literals', async () => {
    const colors = rule({ type: 'token-usage', target: 'css', properties: ['color', 'border*'], allowedValues: ['white'], message: 'Hardcoded' });
    const css = [
      '.a { color: var(--brand); }',
      '.b { color: #0055ff; }',
      '.c { color: white !important; }',
      '.d { color: #123456; }',
      '/* .e { color: #999 } */',
      '@media (min-width: 640px) { .f { border-color: rgb(1, 2, 3); } }',
      '.g { background: red; }',
    ].join('\n');
    const result = await evaluateRule(colors, input({ css }), ctx);
    expect(result.violations.map((v) => [v.line, v.message])).toEqual([
      [4, 'Hardcoded (color: #123456)'],
      [6, 'Hardcoded (border-color: rgb(1, 2, 3))'],
    ]);
  });

  it('parses CSS declarations inside nested blocks with offsets', () => {
    const css = '@media (x) {\n  .a { margin: 0 auto; padding : 4px }\n}';
    expect(cssDeclarations(css).map((d) => [d.property, d.value, css.slice(d.index, d.index + d.property.length)])).toEqual([
      ['margin', '0 auto', 'margin'],
      ['padding', '4px', 'padding'],
    ]);
  });

  it('builtin heading-order, form-labels and component-naming', async () => {
    const headings = rule({ type: 'builtin', builtin: 'heading-order' });
    expect((await evaluateRule(headings, input({ html: '<h1>a</h1><h3>b</h3>' }), ctx)).violations[0].message).toMatch(/h1 to h3/);
    expect((await evaluateRule(headings, input({ html: '<h1>a</h1><h2>b</h2><h1>c</h1>' }), ctx)).outcome).toBe('pass');

    const labels = rule({ type: 'builtin', builtin: 'form-labels' });
    const form = '<label for="e">Email</label><input id="e"><label>Name <input></label><input aria-label="x"><input placeholder="Only a placeholder"><input type="hidden">';
    const result = await evaluateRule(labels, input({ html: form }), ctx);
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0].element).toContain('placeholder');

    const naming = rule({ type: 'builtin', builtin: 'component-naming' });
    expect((await evaluateRule(naming, input({ component: 'PrimaryButton' }), ctx)).outcome).toBe('pass');
    expect((await evaluateRule(naming, input({ component: 'primary-button' }), ctx)).outcome).toBe('fail');
    expect((await evaluateRule(naming, input({ html: '<p></p>' }), ctx)).outcome).toBe('skipped');
  });

  it('builtin axe finds known violations in HTML without running its scripts', async () => {
    const axe = rule({ type: 'builtin', builtin: 'axe', severity: 'error' });
    const html = '<!doctype html><html lang="en"><head><title>t</title></head><body><main><img src="x.png"><button></button><script>globalThis.__ran = true</script></main></body></html>';
    const result = await evaluateRule(axe, input({ html }), ctx);
    expect(result.outcome).toBe('fail');
    const messages = result.violations.map((v) => v.message).join('\n');
    expect(messages).toMatch(/image-alt/);
    expect(messages).toMatch(/button-name/);
    expect((globalThis as any).__ran).toBeUndefined();
  }, 30000);

  it('a regex that runs too long becomes an error result, not a pass', async () => {
    const slow = new RegexRunner(50);
    try {
      // Bypass validation to simulate a pattern that slipped past the static checks
      const bad = { ...rule({ type: 'regex-absent', pattern: 'a' }), pattern: '^(a+)+$' };
      const result = await evaluateRule(bad, input({ html: 'a'.repeat(40) + '!' }), { ...ctx, runner: slow });
      expect(result).toMatchObject({ outcome: 'error', reason: expect.stringMatching(/longer than 50ms/) });
    } finally {
      await slow.close();
    }
  });

  it('runRules: counts equal checks by status, records versions, and reports skipped rules', async () => {
    const rules = [
      rule({ type: 'selector-attribute', selector: 'img', attribute: 'alt', severity: 'error', name: 'Alt' }),
      { ...rule({ type: 'regex-absent', pattern: 'TODO', severity: 'info', name: 'Todo' }), id: 'r2' },
      { ...rule({ type: 'token-usage', target: 'css', properties: ['color'], name: 'Colors' }), id: 'r3' },
      { ...rule({ type: 'regex-absent', pattern: 'blink', name: 'Blink' }), id: 'r4' },
    ];
    const result = await runRules(rules, [input({ html: '<img src="a"><img src="b"><!-- TODO -->' })], ctx, { application: 'App' });
    expect(result.summary).toEqual({ passed: 1, warnings: 0, errors: 2, info: 1, total: 4 });
    expect(result.checks.filter((c) => c.status === 'info')).toHaveLength(1);
    expect(result.ruleResults.map((r) => [r.ruleId, r.outcome, r.version])).toEqual([
      ['r1', 'fail', 3],
      ['r2', 'fail', 3],
      ['r3', 'skipped', 3],
      ['r4', 'pass', 3],
    ]);
    expect(result.checks.every((c) => c.application === 'App')).toBe(true);
  });

  it('selector-attribute checks every match, not just the first 1,000 (1,001 elements)', async () => {
    const ok = Array.from({ length: 1000 }, (_, i) => `<img src="${i}.png" alt="Photo ${i}">`).join('');
    const missingAlt = await evaluateRule(rule({ type: 'selector-attribute', selector: 'img', attribute: 'alt' }), input({ html: `${ok}<img src="last.png">` }), ctx);
    expect(missingAlt.outcome).toBe('fail');
    expect(missingAlt.violations).toHaveLength(1);
    expect(missingAlt.violations[0].element).toContain('last.png');

    const badValue = await evaluateRule(
      rule({ type: 'selector-attribute', selector: 'img', attribute: 'alt', pattern: '^Photo' }),
      input({ html: `${ok}<img src="last.png" alt="image">` }),
      ctx,
    );
    expect(badValue.outcome).toBe('fail');
    expect(badValue.violations[0].element).toContain('last.png');

    const allGood = await evaluateRule(rule({ type: 'selector-attribute', selector: 'img', attribute: 'alt', pattern: '^Photo' }), input({ html: ok }), ctx);
    expect(allGood.outcome).toBe('pass');
  });

  it('selector-attribute is incomplete, never a pass, when more values match than it tests', async () => {
    const count = LIMITS.selectorPatternValues + 1;
    const html = Array.from({ length: count }, (_, i) => `<a href="/p${i}">x</a>`).join('');
    const r = rule({ type: 'selector-attribute', selector: 'a', attribute: 'href', pattern: '^/' });
    const evaluation = await evaluateRule(r, input({ html }), ctx);
    expect(evaluation.outcome).toBe('incomplete');
    expect(evaluation.reason).toMatch(new RegExp(`first ${LIMITS.selectorPatternValues} of ${count}`));

    const result = await runRules([r], [input({ html })], ctx);
    expect(result.ruleResults[0]).toMatchObject({ outcome: 'incomplete', violations: 0 });
    expect(result.summary).toMatchObject({ passed: 0, warnings: 1 });
    expect(result.checks[0]).toMatchObject({ id: 'r1:incomplete', status: 'warning' });
  }, 30000);

  it('every built-in rule is valid', () => {
    for (const { id, ...definition } of BUILTIN_RULES) {
      expect(() => normalizeRuleDefinition(definition)).not.toThrow();
      expect(id).toMatch(/^[a-z0-9-]+$/);
    }
  });
});
