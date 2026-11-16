// The app's base size: 90% of the browser's default, so everything in rem
// (type, spacing, layout widths) reads as it did at 90% browser zoom, while a
// larger default text size chosen in the browser still applies.
import { describe, expect, it } from 'vitest';
import { readSource } from './helpers/appRoutes.js';

describe('root size', () => {
  it('comes from a relative token, never a fixed pixel size', () => {
    expect(readSource('src/styles/tokens.css')).toMatch(/--app-root-font-size: 90%;/);
    expect(readSource('src/style.css')).toMatch(/html \{\s*font-size: var\(--app-root-font-size\);/);
  });
});
