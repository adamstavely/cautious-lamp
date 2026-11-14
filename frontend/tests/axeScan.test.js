// R22: the generators' "Run Accessibility Check" passed axe options naming
// rules that don't exist in axe-core, so axe.run rejected every scan.
import axe from 'axe-core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AXE_SCAN_OPTIONS } from '../src/utils/axeScan.js';

const FRAGMENTS = {
  chart: `<div class="rounded-lg shadow-sm border"><figure role="figure" aria-label="Sales"><canvas role="img" aria-label="Sales chart"></canvas><figcaption>Sales</figcaption></figure><table><thead><tr><th scope="col">Label</th><th scope="col">Value</th></tr></thead><tbody><tr><td>A</td><td>1</td></tr></tbody></table><button></button></div>`,
  table: `<div><input type="text" placeholder="Filter Name..."><table><thead><tr><th><input type="checkbox"></th><th>Name</th></tr></thead><tbody><tr><td><input type="checkbox"></td><td>John</td></tr></tbody></table></div>`,
  timeline: `<div><svg role="img"><circle r="3"/></svg><ol><li><div>2024-01-01</div><div>Launch</div></li></ol></div>`,
};

// The options the generators used before the fix.
const OLD_OPTIONS = {
  runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'] },
  rules: {
    'color-contrast': { enabled: true },
    'aria-label': { enabled: true },
    'aria-labelledby': { enabled: true },
    keyboard: { enabled: true },
    'focusable-content': { enabled: true },
    'focus-order-semantics': { enabled: true },
  },
};

const mountFragment = (html) => {
  document.body.innerHTML = `<main>${html}</main>`;
  return document.querySelector('main > *');
};

const ranRuleIds = (results) =>
  [...results.passes, ...results.violations, ...results.incomplete, ...results.inapplicable].map((r) => r.id);

beforeEach(() => {
  // jsdom has no canvas; axe copes with null, without jsdom's "not implemented" noise.
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('AXE_SCAN_OPTIONS', () => {
  it('only names rules that exist in the installed axe-core', () => {
    const known = new Set(axe.getRules().map((r) => r.ruleId));
    const unknown = Object.keys(AXE_SCAN_OPTIONS.rules).filter((id) => !known.has(id));
    expect(unknown).toEqual([]);
  });

  it('only names tags that some installed rule carries', () => {
    const tags = new Set(axe.getRules().flatMap((r) => r.tags));
    expect(AXE_SCAN_OPTIONS.runOnly.values.filter((t) => !tags.has(t))).toEqual([]);
  });

  it('the pre-fix options are rejected by axe (the failure this guards against)', async () => {
    await expect(axe.run(mountFragment(FRAGMENTS.table), OLD_OPTIONS)).rejects.toThrow(/unknown rule/i);
  });

  for (const [name, html] of Object.entries(FRAGMENTS)) {
    it(`scans a ${name} fragment without throwing`, async () => {
      const results = await axe.run(mountFragment(html), AXE_SCAN_OPTIONS);
      const ran = ranRuleIds(results);
      expect(ran.length).toBeGreaterThan(0);
      // Enabled explicitly (experimental, outside the tags) ...
      expect(ran).toContain('focus-order-semantics');
      // ... and page-level rules are off for a preview fragment.
      expect(ran).not.toContain('region');
      expect(ran).not.toContain('document-title');
    });
  }
});
