import { describe, expect, it } from 'vitest';
import { detectDelimiter, parseDelimited, parseNumber, toCSV } from '../src/utils/csv.js';
import { importTable, mapColumns, SCHEMAS } from '../src/utils/mapImport.js';

describe('parseDelimited', () => {
  it('handles quoted fields, doubled quotes, embedded newlines and CRLF', () => {
    const text = '﻿name,value\r\n"Washington, D.C.",689545\r\n"Say ""hi""",1\n"two\nlines",2\n\n';
    const { delimiter, rows } = parseDelimited(text);
    expect(delimiter).toBe(',');
    expect(rows.map((r) => r.fields)).toEqual([
      ['name', 'value'],
      ['Washington, D.C.', '689545'],
      ['Say "hi"', '1'],
      ['two\nlines', '2'],
    ]);
    // Line numbers point at where each row starts
    expect(rows.map((r) => r.line)).toEqual([1, 2, 3, 4]);
  });

  it('detects tabs, semicolons and pipes, ignoring delimiters inside quotes', () => {
    expect(detectDelimiter('region\tvalue\nTexas\t1,234')).toBe('\t');
    expect(detectDelimiter('region;value\nTexas;1,5')).toBe(';');
    expect(detectDelimiter('a|b\n1|2')).toBe('|');
    expect(detectDelimiter('"a,b";c\n"d,e";f')).toBe(';');
  });
});

describe('parseNumber', () => {
  it.each([
    ['1,234,567', 1234567],
    ['1 234 567', 1234567],
    ['1.234.567,8', 1234567.8],
    ['12,5', 12.5],
    ['$1,200.50', 1200.5],
    ['45%', 45],
    ['(1,000)', -1000],
    ['-3.2e2', -320],
    ['  42 ', 42],
  ])('reads %s', (raw, expected) => {
    expect(parseNumber(raw)).toBe(expected);
  });

  it.each(['', 'abc', '12abc', '1,2,3', '--5'])('rejects %j', (raw) => {
    expect(Number.isNaN(parseNumber(raw))).toBe(true);
  });
});

describe('toCSV', () => {
  it('quotes where needed and defuses spreadsheet formulas, but not negative numbers', () => {
    const csv = toCSV(['name', 'value'], [
      { name: 'Washington, D.C.', value: 1 },
      { name: '=HYPERLINK("x")', value: -5 },
      { name: '-12', value: null },
    ]);
    expect(csv).toBe('name,value\n"Washington, D.C.",1\n"\'=HYPERLINK(""x"")",-5\n-12,\n');
  });

  it('round-trips through the parser', () => {
    const rows = [{ region: 'Côte d\'Ivoire', value: 28.2 }, { region: 'Bosnia "and" Herz.', value: 3.2 }];
    const back = importTable(toCSV(['region', 'value'], rows), 'choropleth');
    expect(back.rows).toEqual(rows);
  });
});

describe('importTable', () => {
  it('accepts common header names in any case', () => {
    expect(mapColumns(['STATE', 'Population'], SCHEMAS.choropleth)).toEqual({ region: 0, value: 1 });
    expect(mapColumns(['Origin', 'Destination', 'Count'], SCHEMAS.flows)).toEqual({ from: 0, to: 1, value: 2 });
    expect(mapColumns(['City', 'Latitude', 'Long', 'Pop.', 'Type'], SCHEMAS.points)).toEqual({ name: 0, lat: 1, lng: 2, value: 3, category: 4 });
  });

  it('prefers an exact field name over an alias', () => {
    // "id" is the id even though "name" could also be read as one
    expect(mapColumns(['name', 'id', 'lat', 'lon'], SCHEMAS.places)).toEqual({ id: 1, name: 0, lat: 2, lng: 3 });
  });

  it('reads data without a header row in schema order', () => {
    const result = importTable('California\t39,538,223\nTexas\t29,145,505', 'choropleth');
    expect(result.headerless).toBe(true);
    expect(result.rows).toEqual([{ region: 'California', value: 39538223 }, { region: 'Texas', value: 29145505 }]);
  });

  it('skips rows with bad numbers and says why, with the line number', () => {
    const result = importTable('region,value\nTexas,12\nOhio,n/a\nUtah,\n,5', 'choropleth');
    expect(result.rows).toEqual([{ region: 'Texas', value: 12 }]);
    expect(result.skipped).toEqual([
      { line: 3, reason: 'value "n/a" is not a number', text: 'Ohio, n/a' },
      { line: 4, reason: 'no value', text: 'Utah, ' },
      { line: 5, reason: 'no region', text: ', 5' },
    ]);
  });

  it('reports a missing required column instead of importing', () => {
    const result = importTable('from,value\nA,1', 'flows');
    expect(result.missing).toEqual(['to']);
    expect(result.rows).toEqual([]);
  });

  it('lets places use a name or an id, and checks coordinates', () => {
    const result = importTable('city,lat,lng\nParis,48.86,2.35\nNowhere,95,0\nHalf,10,', 'places');
    expect(result.rows).toEqual([{ id: 'Paris', name: 'Paris', lat: 48.86, lng: 2.35 }]);
    expect(result.skipped.map((s) => s.reason)).toEqual(['latitude 95 is outside -90 to 90', 'no lng']);
  });

  it('allows points without coordinates or value, but not half a coordinate pair', () => {
    const result = importTable('name,lat,lng,value\nTexas,,,10\nAustin,30.27,-97.74,\nOdd,30,,1', 'points');
    expect(result.rows).toEqual([
      { name: 'Texas', lat: null, lng: null, value: 10 },
      { name: 'Austin', lat: 30.27, lng: -97.74, value: null },
    ]);
    expect(result.skipped[0].reason).toBe('needs both latitude and longitude');
  });
});
