// On a US map you can show one Census region or division, or one state with
// its counties (Map Maker "Focus", or a state clicked on the map).
import { readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, it, vi } from 'vitest';
import { US_DIVISIONS, US_REGIONS, US_STATES, parseUsFocus, usFocusOptions } from '../src/utils/mapAreas.js';

// The real map files from public/maps, read from disk instead of fetched
vi.mock('../src/utils/mapData.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    loadMapFile: async (url) => JSON.parse(readFileSync(join(__dirname, '../public', new URL(url, 'http://x').pathname), 'utf8')),
  };
});
const { buildGeography } = await import('../src/components/maps/useGeography.js');

describe('Census regions and divisions', () => {
  it('cover the 50 states and DC exactly once, and no territories', () => {
    const inDivisions = Object.values(US_DIVISIONS).flatMap((d) => d.states);
    const statesAndDc = US_STATES.filter(([fips]) => Number(fips) <= 56).map(([fips]) => fips);
    expect([...inDivisions].sort()).toEqual([...statesAndDc].sort());
    expect(new Set(inDivisions).size).toBe(51);
    expect(Object.values(US_REGIONS).flatMap((r) => r.states).sort()).toEqual([...statesAndDc].sort());
  });

  it('read focus ids and refuse anything else', () => {
    expect(parseUsFocus('region:west')).toMatchObject({ label: 'West region', states: expect.arrayContaining(['02', '06', '15']) });
    expect(parseUsFocus('division:new-england').states).toHaveLength(6);
    expect(parseUsFocus('state:06')).toMatchObject({ label: 'California', states: ['06'] });
    for (const bad of ['state:99', 'region:mars', '840', '', null]) expect(parseUsFocus(bad)).toBeNull();
  });

  it('offer all of the US, 4 regions, 9 divisions and 51 states', () => {
    const [all, regions, divisions, states] = usFocusOptions();
    expect(all).toEqual({ value: '', label: 'All of the United States' });
    expect([regions.options.length, divisions.options.length, states.options.length]).toEqual([4, 9, 51]);
  });
});

describe('focused US geography', () => {
  it('shows a region\'s states, the rest faintly, and opens a state from it', async () => {
    const geo = await buildGeography({ area: 'us-states', country: 'region:northeast', includeRemote: false });
    expect(geo.features).toHaveLength(9);
    expect(geo.context.length).toBeGreaterThan(40);
    expect(geo.countryName).toBe('Northeast region');
    expect(geo.drillable(geo.features[0])).toMatch(/^state:\d{2}$/);
  });

  it('shows one state\'s counties on a projection centred on it, and knows US names outside it', async () => {
    const geo = await buildGeography({ area: 'us-states', country: 'state:08', includeRemote: false });
    expect(geo.features).toHaveLength(64); // Colorado's counties
    expect(geo.features.every((f) => String(f.id).startsWith('08'))).toBe(true);
    expect(geo.projection.type).toBe('conicEqualArea');
    expect(geo.index.lookup('Denver, CO')).toMatchObject({ index: expect.any(Number) });
    expect(geo.index.lookup('Cook, IL')).toBeNull();
    // Cook County is elsewhere in the US, so the report lists it as outside this view, not unknown
    expect(geo.outsideIndex.lookup('Cook, IL')).toMatchObject({ index: expect.any(Number) });
    expect(geo.outsideIndex.lookup('Atlantis, ZZ')).toBeNull();
  });

  it('shows a region\'s counties with state lines on a counties map', async () => {
    const geo = await buildGeography({ area: 'us-counties', country: 'division:pacific', includeRemote: false });
    expect(geo.features.every((f) => ['02', '06', '15', '41', '53'].includes(String(f.id).slice(0, 2)))).toBe(true);
    expect(geo.overlay).toBeTruthy();
    // Alaska and Hawaii with the mainland: Albers USA keeps them in their insets
    expect(geo.projection.type).toBe('albersUsa');
  });

  it('lets a state be opened from the whole-US map and offers the focus choices there', async () => {
    const geo = await buildGeography({ area: 'us-states', country: null, includeRemote: false });
    const texas = geo.features.find((f) => f.id === '48');
    expect(geo.drillable(texas)).toBe('state:48');
    expect(geo.focusOptions).toHaveLength(4);
  });
});
