# Map data

Boundaries and lookup tables used by Map Maker (`src/views/MapMaker.vue`, with the
map components in `src/components/maps/`). Everything is served from here;
`src/utils/mapData.js` falls back to the jsDelivr copies of the us-atlas and
world-atlas files if a local one cannot be loaded.

| File | What | Source | Licence |
| --- | --- | --- | --- |
| `states-10m.json` | US states (TopoJSON, object `states`) | [us-atlas](https://github.com/topojson/us-atlas) 3.0.1, `https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json` | ISC |
| `counties-10m.json` | US counties (objects `counties`, `states`, `nation`); ids are five-digit FIPS codes | us-atlas 3.0.1, `https://cdn.jsdelivr.net/npm/us-atlas@3.0.1/counties-10m.json` | ISC |
| `countries-110m.json` | World countries (object `countries`); ids are ISO 3166-1 numeric codes | [world-atlas](https://github.com/topojson/world-atlas) 2.0.2, `https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json` | ISC |
| `countries.json` | Per country id: name, other names, ISO alpha-2/3, continent, number of admin-1 regions | Natural Earth 5.1.2 `ne_110m_admin_0_countries` | Public domain |
| `admin1/<id>.json` | First-level regions (states, provinces, departments…) of one country, object `regions`; `<id>` is the country's world-atlas id (124 = Canada, 356 = India) | Natural Earth 5.1.2 `ne_10m_admin_1_states_provinces` | Public domain |

us-atlas and world-atlas are by Mike Bostock (ISC). us-atlas is derived from the
U.S. Census Bureau's cartographic boundary files and world-atlas from Natural
Earth; Natural Earth data is public domain. The us-atlas and world-atlas files
are byte-for-byte copies.

## Building the generated files

`counties-10m.json`, `countries.json` and `admin1/` come from
`scripts/build-map-data.mjs`:

```sh
cd frontend
node scripts/build-map-data.mjs                  # downloads the sources to a temp folder
node scripts/build-map-data.mjs --sources <dir>  # or keeps them in <dir>
```

The script downloads the pinned Natural Earth GeoJSON from
[nvkelso/natural-earth-vector](https://github.com/nvkelso/natural-earth-vector)
(tag v5.1.2) and the us-atlas counties, then for each country in world-atlas:

- keeps only the fields matching needs: `name`, `code` (ISO 3166-2), `postal`,
  `type` and `alt` (other names, `|`-separated);
- simplifies it on its own with [mapshaper](https://github.com/mbloch/mapshaper)
  (a dev dependency) to a 900×900 px resolution, keeping shared borders and
  every region, and quantizes it as TopoJSON;
- adds a `fit` member: the centre of the country's main landmass, points to fit
  the projection to, and the regions that are entirely `remote` (more than
  800 km from the mainland, like Guadeloupe for France or the Canaries for
  Spain). The map fits the mainland and lists remote regions, with a "Fit
  remote regions" option to include them.

Countries with fewer than two regions get no file. The United States opens to
`states-10m.json` instead of its Natural Earth file, so US data matches the
same names on every US map.

Sizes (v5.1.2): 169 admin-1 files, 3.9 MB in all (largest: United Kingdom 129 KB,
Canada 100 KB); `countries.json` 21 KB; `counties-10m.json` 842 KB.
