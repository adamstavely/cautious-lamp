import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { feature } from 'topojson-client';
import { createRegionIndex, editDistance, matchRows, normalizeName } from '../src/utils/regionMatch.js';
import { canonicalCounty, describeAdmin1, describeCountry, describeCounties, describeState } from '../src/utils/mapAreas.js';
import { resolveFlows, resolvePoints } from '../src/utils/mapModel.js';

// The bundled map files, so matching is tested against the real names
const load = (file) => JSON.parse(readFileSync(path.resolve(__dirname, '../public/maps', file), 'utf8'));
const features = (file, object) => {
  const topo = load(file);
  return feature(topo, topo.objects[object]).features;
};

describe('normalizeName', () => {
  it('ignores case, accents and punctuation, and spells out abbreviations', () => {
    expect(normalizeName("Côte d'Ivoire")).toBe('cote d ivoire');
    expect(normalizeName('St. Louis')).toBe(normalizeName('Saint Louis'));
    expect(normalizeName('Dem. Rep. Congo')).toBe(normalizeName('Democratic Republic of the Congo'));
    expect(normalizeName('Bosnia and Herz.')).toBe(normalizeName('Bosnia & Herzegovina'));
    expect(normalizeName('N. Cyprus')).toBe('north cyprus');
    expect(normalizeName('Cook County,  IL')).toBe('cook county, il');
  });
});

describe('editDistance', () => {
  it('counts an adjacent swap as one edit', () => {
    expect(editDistance('texas', 'texsa')).toBe(1);
    expect(editDistance('ohio', 'iowa')).toBe(4);
    expect(editDistance('', 'abc')).toBe(3);
  });
});

describe('US states', () => {
  const states = features('states-10m.json', 'states');
  const index = createRegionIndex(states, describeState);
  const label = (name) => index.labels[index.lookup(name)?.index];

  it('match by name, postal code or FIPS code', () => {
    expect(label('california')).toBe('California');
    expect(label('CA')).toBe('California');
    expect(label('06')).toBe('California');
    expect(label('6')).toBe('California');
    expect(label('D.C.')).toBe(undefined);
    expect(label('DC')).toBe('District of Columbia');
  });

  it('do not match one state to another by containment', () => {
    // The old matcher's substring fallback coloured West Virginia for "Virginia"
    expect(label('Virginia')).toBe('Virginia');
    expect(index.lookup('Carolina')).toBe(null);
  });

  it('suggest close spellings for names that miss', () => {
    const { matched, unmatched } = matchRows(
      [{ region: 'Texas' }, { region: 'Calfornia' }, { region: 'Masachusets' }, { region: 'Atlantis' }, { region: 'Calfornia' }],
      index,
      (r) => r.region,
    );
    expect(matched.size).toBe(1);
    expect(unmatched).toEqual([
      { name: 'Calfornia', rowIndexes: [1, 4], ambiguous: false, suggestions: ['California'] },
      { name: 'Masachusets', rowIndexes: [2], ambiguous: false, suggestions: ['Massachusetts'] },
      { name: 'Atlantis', rowIndexes: [3], ambiguous: false, suggestions: [] },
    ]);
  });

  it('do not suggest a state because a postal code starts the name', () => {
    expect(index.suggest('Cook')).toEqual([]);
    expect(index.suggest('New Yrok').map((s) => s.label)).toEqual(['New York']);
  });

  it('report a region listed twice; the last row wins', () => {
    const { matched, duplicates } = matchRows([{ region: 'Ohio', v: 1 }, { region: 'OH', v: 2 }], index, (r) => r.region);
    expect(duplicates).toEqual([{ label: 'Ohio', rowIndexes: [0, 1] }]);
    expect([...matched.values()][0].row.v).toBe(2);
  });
});

describe('world countries', () => {
  const world = features('countries-110m.json', 'countries');
  const index = createRegionIndex(world, describeCountry(load('countries.json')));
  const label = (name) => index.labels[index.lookup(name)?.index];

  it('match common names, ISO codes and the numeric id', () => {
    expect(label('United States')).toBe('United States of America');
    expect(label('USA')).toBe('United States of America');
    expect(label('840')).toBe('United States of America');
    expect(label('DRC')).toBe(undefined);
    expect(label('Democratic Republic of the Congo')).toBe('Dem. Rep. Congo');
    expect(label("Cote d'Ivoire")).toBe("Côte d'Ivoire");
    expect(label('GB')).toBe('United Kingdom');
    expect(label('Bosnia and Herzegovina')).toBe('Bosnia and Herz.');
  });

  it('suggest the country for a near miss', () => {
    expect(index.suggest('Brasil').map((s) => s.label)).toContain('Brazil');
    expect(index.suggest('Phillipines').map((s) => s.label)).toEqual(['Philippines']);
  });
});

describe('US counties', () => {
  const counties = features('counties-10m.json', 'counties');
  const index = createRegionIndex(counties, describeCounties(counties), { canonical: canonicalCounty });
  const label = (name) => index.labels[index.lookup(name)?.index];

  it('label every county uniquely, naming independent cities as such', () => {
    expect(new Set(index.labels).size).toBe(counties.length);
    expect(label('Richmond city, VA')).toBe('Richmond city, VA');
    expect(label('Richmond County, VA')).toBe('Richmond, VA');
    expect(label('Baltimore city, Maryland')).toBe('Baltimore city, MD');
  });

  it('match "County, ST" in its many spellings, and FIPS codes', () => {
    expect(label('Cook County, IL')).toBe('Cook, IL');
    expect(label('Cook, Illinois')).toBe('Cook, IL');
    expect(label('17031')).toBe('Cook, IL');
    expect(label('Autauga County, Alabama')).toBe('Autauga, AL');
    // A FIPS code that lost its leading zero in a spreadsheet
    expect(label('1001')).toBe('Autauga, AL');
    expect(label('Orleans Parish, LA')).toBe('Orleans, LA');
  });

  it('treat a bare county name used in several states as ambiguous, listing them', () => {
    expect(index.lookup('Cook')).toHaveProperty('candidates');
    const { unmatched } = matchRows([{ region: 'Cook County' }], index, (r) => r.region);
    expect(unmatched[0].ambiguous).toBe(true);
    expect(unmatched[0].suggestions).toEqual(expect.arrayContaining(['Cook, IL', 'Cook, GA', 'Cook, MN']));
  });
});

describe('admin-1 regions', () => {
  const canada = features('admin1/124.json', 'regions');
  const index = createRegionIndex(canada, describeAdmin1);
  const label = (name) => index.labels[index.lookup(name)?.index];

  it('match names, ISO 3166-2 codes with and without the country, and postal codes', () => {
    expect(label('Ontario')).toBe('Ontario');
    expect(label('CA-QC')).toBe('Québec');
    expect(label('Quebec')).toBe('Québec');
    expect(label('BC')).toBe('British Columbia');
    expect(index.suggest('Albertaa').map((s) => s.label)).toEqual(['Alberta']);
  });
});

describe('resolvePoints and resolveFlows', () => {
  const states = features('states-10m.json', 'states');
  const index = createRegionIndex(states, describeState);
  const centre = () => [-100, 40];

  it('place rows by coordinates, or by region name at the region centre', () => {
    const rows = [
      { name: 'Austin', lat: 30.27, lng: -97.74, value: 5, category: 'City' },
      { name: 'Texas', lat: null, lng: null, value: 10 },
      { name: 'Texsa', lat: null, lng: null, value: 1 },
      { name: 'Zero', lat: 1, lng: 1, value: 0 },
    ];
    const { points, unmatched, noValue } = resolvePoints(rows, index, states, centre, { needsValue: true });
    expect(points.map((p) => [p.label, p.lng, p.lat])).toEqual([['Austin', -97.74, 30.27], ['Texas', -100, 40]]);
    expect(unmatched).toEqual([{ name: 'Texsa', rowIndexes: [2], ambiguous: false, suggestions: ['Texas'] }]);
    expect(noValue).toEqual([{ name: 'Zero', rowIndex: 3 }]);
  });

  it('join flows to places and report unknown ids', () => {
    const places = [{ id: 'A', name: 'Alpha', lat: 1, lng: 1 }, { id: 'B', name: '', lat: 2, lng: 2 }, { id: 'C', lat: null, lng: null }];
    const flows = [{ from: 'A', to: 'B', value: 5 }, { from: 'A', to: 'C', value: 1 }, { from: 'B', to: 'A', value: 'x' }];
    const result = resolveFlows(places, flows);
    expect(result.places.map((p) => p.label)).toEqual(['Alpha', 'B']);
    expect(result.flows).toEqual([{ from: 'A', to: 'B', value: 5, rowIndex: 0 }]);
    expect(result.unknown).toEqual([{ id: 'C', rowIndexes: [1] }]);
    expect(result.invalid).toEqual([2]);
  });
});
