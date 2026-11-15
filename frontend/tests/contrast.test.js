import { describe, expect, it } from 'vitest';
import { contrastRatio, isHexColor, normalizeHex, readableOn, wcagLevel } from '../src/utils/contrast.js';

describe('contrast', () => {
  it('accepts #rgb and #rrggbb only', () => {
    expect(isHexColor('#fff')).toBe(true);
    expect(isHexColor('#2f5ea8')).toBe(true);
    expect(isHexColor('2f5ea8')).toBe(false);
    expect(isHexColor('#12345')).toBe(false);
    expect(isHexColor('red')).toBe(false);
    expect(normalizeHex('#ABC')).toBe('#aabbcc');
  });

  it('matches the WCAG ratios', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 5);
    // #767676 on white is the classic 4.54:1
    expect(contrastRatio('#767676', '#ffffff')).toBeCloseTo(4.54, 2);
    expect(contrastRatio('#fff', 'nope')).toBeNull();
  });

  it('grades and picks readable text', () => {
    expect(wcagLevel(7.1)).toBe('AAA');
    expect(wcagLevel(4.5)).toBe('AA');
    expect(wcagLevel(3)).toBe('Fail');
    expect(readableOn('#4f46e5')).toBe('#ffffff');
    expect(readableOn('#fde68a')).toBe('#000000');
  });
});
