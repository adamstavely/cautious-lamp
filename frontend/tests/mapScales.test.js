import { describe, expect, it } from 'vitest';
import chroma from 'chroma-js';
import {
  assignCategories, buildColorScale, classIndex, computeThresholds, divergingColors, niceFloor,
  parseBreaks, quantile, radiusScale, sampleRamp, sizeLegendValues,
} from '../src/utils/mapScales.js';

const SEQ = ['#e3eefe', '#bcd6fe', '#93baf8', '#6b9ce9', '#497dd1', '#2f5ea8', '#19407d'];
const DIV = ['#1851a6', '#5c86c9', '#a7bfe5', '#eae9e7', '#e2b0a9', '#c16a61', '#972622'];

describe('thresholds', () => {
  const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  it('equal interval splits the range into equal widths', () => {
    expect(computeThresholds(values, { method: 'equal', classes: 3 })).toEqual([4, 7]);
    expect(computeThresholds([5, 5, 5], { method: 'equal', classes: 5 })).toEqual([]);
  });

  it('quantile puts about the same count in each class, dropping repeats', () => {
    expect(computeThresholds(values, { method: 'quantile', classes: 5 })).toEqual([2.8, 4.6, 6.4, 8.2]);
    expect(quantile([1, 2, 3, 4], 0.5)).toBe(2.5);
    // Tied values cannot be split; fewer classes come back
    expect(computeThresholds([1, 1, 1, 1, 1, 1, 9, 9], { method: 'quantile', classes: 4 })).toEqual([3]);
  });

  it('custom breaks are used as given, sorted and unique', () => {
    expect(computeThresholds(values, { method: 'custom', breaks: [5, 2, 5, 8] })).toEqual([2, 5, 8]);
  });

  it('clamps the class count to 3–7', () => {
    expect(computeThresholds(values, { method: 'equal', classes: 2 })).toHaveLength(2);
    expect(computeThresholds(values, { method: 'equal', classes: 12 })).toHaveLength(6);
  });

  it('diverging equal intervals are symmetric around the midpoint', () => {
    expect(computeThresholds([-2, 10], { method: 'equal', classes: 4, midpoint: 0 })).toEqual([-5, 0, 5]);
    expect(computeThresholds([-2, 9], { method: 'equal', classes: 3, midpoint: 0 })).toEqual([-3, 3]);
  });

  it('classIndex puts a value equal to a threshold in the upper class', () => {
    expect(classIndex(1, [4, 7])).toBe(0);
    expect(classIndex(4, [4, 7])).toBe(1);
    expect(classIndex(10, [4, 7])).toBe(2);
  });
});

describe('ramps', () => {
  it('returns the token steps exactly when the counts match', () => {
    expect(sampleRamp(SEQ, 7)).toEqual(SEQ);
  });

  it('interpolates evenly and keeps lightness monotone', () => {
    const five = sampleRamp(SEQ, 5);
    expect(five[0]).toBe(SEQ[0]);
    expect(five[4]).toBe(SEQ[6]);
    const lightness = five.map((c) => chroma(c).oklch()[0]);
    lightness.slice(1).forEach((l, i) => expect(l).toBeLessThan(lightness[i]));
  });

  it('diverging: neutral for the class holding the midpoint, darker away from it on each side', () => {
    const classes = [{ from: -9, to: -3 }, { from: -3, to: 3 }, { from: 3, to: 9 }];
    const colors = divergingColors(classes, 0, DIV);
    expect(colors[1]).toBe(DIV[3]);
    expect(colors[0]).toBe(DIV[0]);
    expect(colors[2]).toBe(DIV[6]);
  });

  it('diverging: the shorter side keeps the same steps as the longer one', () => {
    // One class below the midpoint, three above
    const classes = [{ from: -3, to: 0 }, { from: 0, to: 3 }, { from: 3, to: 6 }, { from: 6, to: 9 }];
    const colors = divergingColors(classes, 0, DIV);
    expect(colors[0]).toBe(DIV[2]);
    expect(colors.slice(1)).toEqual([DIV[4], DIV[5], DIV[6]]);
  });
});

describe('buildColorScale', () => {
  it('colours each value by its class and counts the classes', () => {
    const scale = buildColorScale([1, 2, 3, 10], { method: 'equal', classes: 3, ramp: SEQ });
    expect(scale.thresholds).toEqual([4, 7]);
    expect(scale.classes.map((c) => c.count)).toEqual([3, 0, 1]);
    expect(scale.colorFor(1)).toBe(SEQ[0]);
    expect(scale.colorFor(10)).toBe(SEQ[6]);
    expect(scale.classes[0]).toMatchObject({ from: 1, to: 4 });
    expect(scale.classes[2]).toMatchObject({ from: 7, to: 10 });
  });

  it('diverging equal intervals span the mirrored extent', () => {
    const scale = buildColorScale([-2, 10], { method: 'equal', classes: 4, diverging: true, midpoint: 0, ramp: DIV });
    expect(scale.classes.map((c) => [c.from, c.to])).toEqual([[-10, -5], [-5, 0], [0, 5], [5, 10]]);
    expect(scale.colorFor(-2)).not.toBe(scale.colorFor(2));
  });

  it('custom breaks past the data leave open end classes', () => {
    const scale = buildColorScale([10, 20], { method: 'custom', breaks: [0, 5, 50], ramp: SEQ });
    expect(scale.classes[0]).toMatchObject({ from: 10, to: 0, count: 0 });
    expect(scale.classes[3]).toMatchObject({ from: 50, to: 20, count: 0 });
  });

  it('returns null without values', () => {
    expect(buildColorScale([], { method: 'equal', classes: 5, ramp: SEQ })).toBe(null);
  });
});

describe('parseBreaks', () => {
  it('reads numbers separated by commas and spaces, semicolons or lines', () => {
    expect(parseBreaks('10, 25, 50')).toEqual({ breaks: [10, 25, 50], invalid: [] });
    expect(parseBreaks('50;10\n1,000')).toEqual({ breaks: [10, 50, 1000], invalid: [] });
    expect(parseBreaks('10,20,30')).toEqual({ breaks: [10, 20, 30], invalid: [] });
    expect(parseBreaks('10, lots')).toEqual({ breaks: [10], invalid: ['lots'] });
  });
});

describe('proportional symbols', () => {
  it('scales area, not radius, with the value', () => {
    const r = radiusScale(100, 40);
    expect(r(100)).toBe(40);
    expect(r(25)).toBe(20);
    expect(r(0)).toBe(0);
    expect(r(-5)).toBe(0);
  });

  it('picks round legend values below the maximum', () => {
    expect(niceFloor(39538223)).toBe(20000000);
    expect(sizeLegendValues(39538223)).toEqual([20000000, 5000000, 1000000]);
    expect(sizeLegendValues(0)).toEqual([]);
  });
});

describe('assignCategories', () => {
  it('gives slots in order of first appearance and folds the rest into Other', () => {
    const result = assignCategories(['b', 'a', 'b', '', 'c', 'd', 'e', 'd'], 3);
    expect(result.categories).toEqual([
      { name: 'b', slot: 0, count: 2 },
      { name: 'a', slot: 1, count: 1 },
      { name: 'c', slot: 2, count: 1 },
    ]);
    expect(result.other).toEqual({ names: ['d', 'e'], count: 3 });
    expect(result.slotOf('a')).toBe(1);
    expect(result.slotOf('e')).toBe(-1);
    expect(result.slotOf('')).toBe(-1);
  });
});
