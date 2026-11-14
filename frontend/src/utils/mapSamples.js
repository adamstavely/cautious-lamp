/**
 * Sample data for Map Maker, chosen to fit the map on screen: real figures
 * where we have them (US state populations, country and city populations),
 * and made-up but stable values for every region elsewhere (a continent's
 * countries, a country's provinces, US counties), so every map type has
 * something to show on every area.
 */

// 2020 US Census resident population
const US_STATE_POPULATION = [
  ['California', 39538223], ['Texas', 29145505], ['Florida', 21538187], ['New York', 20201249], ['Pennsylvania', 13002700],
  ['Illinois', 12812508], ['Ohio', 11799448], ['Georgia', 10711908], ['North Carolina', 10439388], ['Michigan', 10077331],
  ['New Jersey', 9288994], ['Virginia', 8631393], ['Washington', 7705281], ['Arizona', 7151502], ['Massachusetts', 7029917],
  ['Tennessee', 6910840], ['Indiana', 6785528], ['Maryland', 6177224], ['Missouri', 6154913], ['Wisconsin', 5893718],
  ['Colorado', 5773714], ['Minnesota', 5706494], ['South Carolina', 5118425], ['Alabama', 5024279], ['Louisiana', 4657757],
  ['Kentucky', 4505836], ['Oregon', 4237256], ['Oklahoma', 3959353], ['Connecticut', 3605944], ['Utah', 3271616],
  ['Iowa', 3190369], ['Nevada', 3104614], ['Arkansas', 3011524], ['Mississippi', 2961279], ['Kansas', 2937880],
  ['New Mexico', 2117522], ['Nebraska', 1961504], ['Idaho', 1839106], ['West Virginia', 1793716], ['Hawaii', 1455271],
  ['New Hampshire', 1377529], ['Maine', 1362359], ['Rhode Island', 1097379], ['Montana', 1084225], ['Delaware', 989948],
  ['South Dakota', 886667], ['North Dakota', 779094], ['Alaska', 733391], ['District of Columbia', 689545], ['Vermont', 643077],
  ['Wyoming', 576851],
];

// Population in millions, 2023 estimates (rounded)
const COUNTRY_POPULATION = [
  ['India', 1429], ['China', 1410], ['United States', 335], ['Indonesia', 278], ['Pakistan', 240], ['Nigeria', 224],
  ['Brazil', 216], ['Bangladesh', 173], ['Russia', 144], ['Mexico', 128], ['Ethiopia', 127], ['Japan', 124],
  ['Philippines', 117], ['Egypt', 113], ['Democratic Republic of the Congo', 102], ['Vietnam', 99], ['Iran', 89],
  ['Turkey', 85], ['Germany', 84], ['Thailand', 72], ['United Kingdom', 68], ['France', 68], ['Tanzania', 67],
  ['South Africa', 60], ['Italy', 59], ['Kenya', 55], ['Myanmar', 54], ['Colombia', 52], ['South Korea', 52],
  ['Spain', 48], ['Sudan', 48], ['Uganda', 48], ['Argentina', 46], ['Algeria', 45], ['Iraq', 45], ['Canada', 40],
  ['Poland', 37], ['Morocco', 37], ['Ukraine', 37], ['Saudi Arabia', 36], ['Peru', 34], ['Australia', 26],
  ['Chile', 19.6], ['Kazakhstan', 19.6], ['Netherlands', 17.9], ['Sweden', 10.5], ['Portugal', 10.4], ['Greece', 10.4],
  ['Norway', 5.5], ['New Zealand', 5.2], ['Ireland', 5.1], ['Mongolia', 3.4], ['Botswana', 2.7], ['Iceland', 0.4],
];

// Largest US cities (2020 Census, rounded), by time zone
const US_CITIES = [
  ['New York', 40.71, -74.01, 8804000, 'Eastern'], ['Los Angeles', 34.05, -118.24, 3899000, 'Pacific'],
  ['Chicago', 41.88, -87.63, 2746000, 'Central'], ['Houston', 29.76, -95.37, 2305000, 'Central'],
  ['Philadelphia', 39.95, -75.17, 1604000, 'Eastern'], ['San Antonio', 29.42, -98.49, 1434000, 'Central'],
  ['San Diego', 32.72, -117.16, 1386000, 'Pacific'], ['Dallas', 32.78, -96.8, 1304000, 'Central'],
  ['San Jose', 37.34, -121.89, 1014000, 'Pacific'], ['Austin', 30.27, -97.74, 962000, 'Central'],
  ['Jacksonville', 30.33, -81.66, 950000, 'Eastern'], ['Columbus', 39.96, -83, 906000, 'Eastern'],
  ['Charlotte', 35.23, -80.84, 875000, 'Eastern'], ['Seattle', 47.61, -122.33, 737000, 'Pacific'],
  ['Nashville', 36.16, -86.78, 689000, 'Central'], ['Boston', 42.36, -71.06, 676000, 'Eastern'],
  ['Portland', 45.52, -122.68, 652000, 'Pacific'], ['Atlanta', 33.75, -84.39, 499000, 'Eastern'],
  ['Minneapolis', 44.98, -93.27, 430000, 'Central'], ['Miami', 25.76, -80.19, 442000, 'Eastern'],
];

// Large cities and capitals: name, ISO alpha-3, lat, lng, urban population (millions, rounded), capital
const WORLD_CITIES = [
  ['Tokyo', 'JPN', 35.68, 139.69, 37.2, true], ['Delhi', 'IND', 28.61, 77.21, 32.9, true], ['Shanghai', 'CHN', 31.23, 121.47, 29.2, false],
  ['Dhaka', 'BGD', 23.81, 90.41, 23.2, true], ['São Paulo', 'BRA', -23.55, -46.63, 22.6, false], ['Mexico City', 'MEX', 19.43, -99.13, 22.1, true],
  ['Cairo', 'EGY', 30.04, 31.24, 21.8, true], ['Beijing', 'CHN', 39.9, 116.4, 21.3, true], ['Mumbai', 'IND', 19.08, 72.88, 21.3, false],
  ['Osaka', 'JPN', 34.69, 135.5, 19, false], ['New York', 'USA', 40.71, -74.01, 18.9, false], ['Karachi', 'PAK', 24.86, 67.01, 17.2, false],
  ['Kinshasa', 'COD', -4.32, 15.31, 16.3, true], ['Lagos', 'NGA', 6.52, 3.38, 15.9, false], ['Istanbul', 'TUR', 41.01, 28.98, 15.8, false],
  ['Buenos Aires', 'ARG', -34.6, -58.38, 15.4, true], ['Kolkata', 'IND', 22.57, 88.36, 15.3, false], ['Manila', 'PHL', 14.6, 120.98, 14.7, true],
  ['Rio de Janeiro', 'BRA', -22.91, -43.17, 13.7, false], ['Bengaluru', 'IND', 12.97, 77.59, 13.6, false], ['Moscow', 'RUS', 55.76, 37.62, 12.7, true],
  ['Bogotá', 'COL', 4.71, -74.07, 11.5, true], ['Chennai', 'IND', 13.08, 80.27, 11.5, false], ['Paris', 'FRA', 48.86, 2.35, 11.2, true],
  ['Jakarta', 'IDN', -6.21, 106.85, 11.2, true], ['Lima', 'PER', -12.05, -77.04, 11.2, true], ['Hyderabad', 'IND', 17.39, 78.49, 10.8, false],
  ['Seoul', 'KOR', 37.57, 126.98, 10, true], ['London', 'GBR', 51.51, -0.13, 9.6, true], ['Santiago', 'CHL', -33.45, -70.67, 6.9, true],
  ['Madrid', 'ESP', 40.42, -3.7, 6.8, true], ['Toronto', 'CAN', 43.65, -79.38, 6.4, false], ['Johannesburg', 'ZAF', -26.2, 28.05, 6.2, false],
  ['Addis Ababa', 'ETH', 9.03, 38.74, 5.5, true], ['Nairobi', 'KEN', -1.29, 36.82, 5.3, true], ['Sydney', 'AUS', -33.87, 151.21, 5.1, false],
  ['Melbourne', 'AUS', -37.81, 144.96, 5, false], ['Montreal', 'CAN', 45.5, -73.57, 4.3, false], ['Rome', 'ITA', 41.9, 12.5, 4.3, true],
  ['Berlin', 'DEU', 52.52, 13.4, 3.6, true], ['Vancouver', 'CAN', 49.28, -123.12, 2.6, false], ['Brisbane', 'AUS', -27.47, 153.03, 2.5, false],
  ['Perth', 'AUS', -31.95, 115.86, 2.1, false], ['Calgary', 'CAN', 51.05, -114.07, 1.5, false], ['Auckland', 'NZL', -36.85, 174.76, 1.7, false],
  ['Ottawa', 'CAN', 45.42, -75.7, 1.4, true], ['Canberra', 'AUS', -35.28, 149.13, 0.46, true], ['Wellington', 'NZL', -41.29, 174.78, 0.42, true],
  ['Christchurch', 'NZL', -43.53, 172.64, 0.38, false],
];

/** A stable pseudo-random number from a string (FNV-1a), 0 ≤ n < 1. */
export function hashUnit(text) {
  let hash = 0x811c9dc5;
  for (const ch of String(text)) {
    hash ^= ch.codePointAt(0);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0) / 2 ** 32;
}

const madeUp = (name) => Math.round(5 + hashUnit(name) * 95);

// The real data, if enough of it is on this map; otherwise a made-up value for every region
function regionRows(geo, real, minimum = 5) {
  const onMap = real.filter(([name]) => geo.index.lookup(name)?.index !== undefined);
  if (onMap.length >= Math.min(minimum, geo.features.length)) return { rows: onMap.map(([region, value]) => ({ region, value })), real: true };
  return { rows: geo.index.labels.map((region) => ({ region, value: madeUp(region) })), real: false };
}

/**
 * Choropleth sample: { region, value } rows.
 * @param {object} geo from useGeography
 * @returns {{ rows: object[], title: string }}
 */
export function choroplethSample(geo) {
  if (geo.kind === 'us-states') {
    const { rows, real } = regionRows(geo, US_STATE_POPULATION);
    return { rows, title: real ? 'Population, 2020 Census' : 'Sample values' };
  }
  if (geo.kind === 'world' || geo.kind === 'continent') {
    const { rows, real } = regionRows(geo, COUNTRY_POPULATION);
    return { rows, title: real ? 'Population, millions (2023)' : 'Sample values' };
  }
  return { rows: geo.index.labels.map((region) => ({ region, value: madeUp(region) })), title: 'Sample values' };
}

// Cities on this map: US areas get US cities; world areas cities in the countries shown
function citiesFor(geo) {
  if (geo.kind === 'us-states' || geo.kind === 'us-counties') {
    return US_CITIES.map(([name, lat, lng, value, category]) => ({ name, lat, lng, value, category }));
  }
  const codes = geo.kind === 'country'
    ? new Set([geo.countryA3])
    : new Set(geo.features.map((f) => geo.countries?.[f.id]?.a3).filter(Boolean));
  return WORLD_CITIES
    .filter(([, a3]) => codes.has(a3))
    .map(([name, , lat, lng, value, capital]) => ({ name, lat, lng, value: Math.round(value * 1e6), category: capital ? 'Capital' : 'Other city' }));
}

/**
 * Bubble and dot map sample: { name, lat, lng, value, category } rows. With
 * too few known cities on the map, regions placed at their centres instead.
 * @param {object} geo from useGeography
 */
export function pointsSample(geo) {
  const cities = citiesFor(geo);
  if (cities.length >= 3) {
    const usCities = geo.kind === 'us-states' || geo.kind === 'us-counties';
    return { rows: cities, title: usCities ? 'City population, 2020 Census' : 'Urban population (2023)' };
  }
  return {
    rows: geo.index.labels.slice(0, 40).map((name) => ({ name, lat: null, lng: null, value: madeUp(name) * 1000, category: '' })),
    title: 'Sample values',
  };
}

/**
 * Flow map sample: the largest place sends to the next few; for a country
 * without known cities, between region centres.
 * @param {object} geo from useGeography
 * @param {(feature) => [number, number]} centerOf a feature's [lng, lat]
 * @returns {{ places: object[], flows: object[], title: string }}
 */
export function flowSample(geo, centerOf) {
  let places = citiesFor(geo)
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)
    .map((c) => ({ id: c.name, name: c.name, lat: c.lat, lng: c.lng }));
  if (places.length < 3 && centerOf) {
    places = geo.features.slice(0, 6).map((f, i) => {
      const [lng, lat] = centerOf(f);
      const name = geo.index.labels[i];
      return { id: name, name, lat: Math.round(lat * 100) / 100, lng: Math.round(lng * 100) / 100 };
    });
  }
  const [hub, ...rest] = places;
  const flows = hub ? rest.map((p, i) => ({ from: hub.id, to: p.id, value: Math.round(100 + madeUp(p.id) * 10 - i * 50) })) : [];
  if (rest.length > 2) flows.push({ from: rest[0].id, to: rest[1].id, value: Math.round(madeUp(rest[1].id) * 5) });
  return { places, flows, title: 'Sample flows' };
}
