# Map data

TopoJSON boundaries used by Map Maker (`src/views/MapMaker.vue`). They are served
from here first; `src/utils/mapData.js` falls back to the jsDelivr CDN copies if a
local file cannot be loaded.

| File | Source | Version | Licence |
| --- | --- | --- | --- |
| `states-10m.json` | [us-atlas](https://github.com/topojson/us-atlas) — `https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json` | 3.0.1 | ISC |
| `countries-110m.json` | [world-atlas](https://github.com/topojson/world-atlas) — `https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json` | 2.0.2 | ISC |

Both packages are by Mike Bostock and published under the ISC licence. us-atlas is
derived from the U.S. Census Bureau's cartographic boundary files and world-atlas
from Natural Earth; both of those are public domain.

The files are byte-for-byte copies of the CDN files. To refresh them, download the
URLs above again.
