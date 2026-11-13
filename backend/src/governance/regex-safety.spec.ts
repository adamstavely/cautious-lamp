import { RegexRunner, RegexTimeoutError, UnsafePatternError, assertSafePattern } from './regex-safety';

describe('assertSafePattern', () => {
  it.each([
    ['from\\s+[\'"]@designsystem/', ''],
    ['!important', ''],
    ['tabindex\\s*=\\s*["\']?[1-9]', 'i'],
    ['@media[^{]*-width\\s*:\\s*(?!(?:640|768)px)\\d+px', 'i'],
    ['(?:https?)?://example\\.com', ''],
    ['(?<year>\\d{4})-\\d{2}', ''],
    ['[(+*]+x', ''],
  ])('accepts %s', (pattern, flags) => {
    expect(() => assertSafePattern(pattern, flags)).not.toThrow();
  });

  it.each([
    ['(a+)+$', 'nested quantifier'],
    ['(a*)*b', 'nested quantifier'],
    ['(\\w+\\s?)+$', 'nested quantifier'],
    ['(a|aa)+$', 'quantified alternation'],
    ['(?:x|y){2,}', 'quantified alternation'],
    ['((ab)+c)*', 'nested group quantifier'],
    ['(a)\\1', 'backreference'],
    ['(?<n>a)\\k<n>', 'named backreference'],
    ['(?<=a)b', 'lookbehind'],
    ['[unclosed', 'syntax error'],
  ])('rejects %s (%s)', (pattern) => {
    expect(() => assertSafePattern(pattern)).toThrow(UnsafePatternError);
  });

  it('rejects oversized patterns, empty patterns and unknown flags', () => {
    expect(() => assertSafePattern('a'.repeat(301))).toThrow(/longer than 300/);
    expect(() => assertSafePattern('')).toThrow(UnsafePatternError);
    expect(() => assertSafePattern('a', 'g')).toThrow(/not allowed/);
    expect(() => assertSafePattern('a', 'ii')).toThrow(/Repeated/);
  });

  it('allows a bounded group repeat that cannot backtrack catastrophically', () => {
    expect(() => assertSafePattern('(?:ab)?c')).not.toThrow();
    expect(() => assertSafePattern('(ab){2}')).not.toThrow();
  });
});

describe('RegexRunner', () => {
  const runner = new RegexRunner(300);
  afterAll(() => runner.close());

  it('returns matches with offsets', async () => {
    expect(await runner.matchAll('b+', '', 'abba cab')).toEqual([
      { index: 1, match: 'bb' },
      { index: 7, match: 'b' },
    ]);
    expect(await runner.testEach('^\\d+$', '', ['12', 'x'])).toEqual([true, false]);
  });

  it('stops a catastrophic pattern at the time budget and keeps working', async () => {
    const started = Date.now();
    // This shape is rejected by assertSafePattern; the runner is the backstop
    await expect(runner.matchAll('^(a+)+$', '', 'a'.repeat(40) + '!')).rejects.toBeInstanceOf(RegexTimeoutError);
    expect(Date.now() - started).toBeLessThan(3000);
    expect(await runner.matchAll('a', '', 'aa')).toHaveLength(2);
  });

  it('caps the number of matches', async () => {
    expect(await runner.matchAll('a', '', 'a'.repeat(500), 10)).toHaveLength(10);
  });
});
