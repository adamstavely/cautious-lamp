/**
 * Font file size and load time, measured in the browser. Nothing here is
 * estimated: a value that can't be measured comes back as null and the page
 * shows "Unknown".
 *
 *  - The font's @font-face rules come from its stylesheet (Google Fonts CSS
 *    allows cross-origin reads) or, for a direct font URL, the URL itself.
 *  - Size: the bytes the browser downloaded for those files, from Resource
 *    Timing (Google's font host sends Timing-Allow-Origin, so sizes are
 *    visible). When Resource Timing has no entry (its buffer holds 250 by
 *    default), the files of the faces document.fonts reports as loaded are
 *    asked for their Content-Length with a HEAD request.
 *  - Load time: how long document.fonts.load() took when this page loaded
 *    the font, or else the Resource Timing duration of its files.
 */

const FORMAT_BY_EXTENSION = { woff2: 'WOFF2', woff: 'WOFF', ttf: 'TrueType', otf: 'OpenType', eot: 'EOT', svg: 'SVG' };

/** @font-face rules from a stylesheet: family, weight, style, display and src URLs with formats */
export function parseFontFaceCss(css) {
  const faces = [];
  for (const block of String(css ?? '').matchAll(/@font-face\s*\{([^}]*)\}/gi)) {
    const body = block[1];
    const read = (prop) => new RegExp(`(?:^|;|\\s)${prop}\\s*:\\s*([^;]+)`, 'i').exec(body)?.[1]?.trim() ?? null;
    const src = [];
    for (const m of (read('src') ?? '').matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)(?:\s*format\(\s*['"]?([^'")]+)['"]?\s*\))?/gi)) {
      src.push({ url: m[1], format: m[2] ? m[2].toLowerCase() : null });
    }
    faces.push({
      family: (read('font-family') ?? '').replace(/^['"]|['"]$/g, ''),
      weight: read('font-weight'),
      style: read('font-style'),
      display: read('font-display'),
      unicodeRange: read('unicode-range'),
      src,
    });
  }
  return faces;
}

/** Display name of a font file's format, from format() or the file extension */
export function fontFormat(source) {
  if (source.format) return FORMAT_BY_EXTENSION[source.format.replace(/^truetype$/, 'ttf').replace(/^opentype$/, 'otf').replace(/^embedded-opentype$/, 'eot')] ?? source.format;
  const ext = /\.([a-z0-9]+)(?:[?#]|$)/i.exec(source.url)?.[1]?.toLowerCase();
  return FORMAT_BY_EXTENSION[ext] ?? null;
}

/** Bytes and duration of the downloads of these URLs, from Resource Timing entries */
export function measureFromEntries(urls, entries) {
  const wanted = new Set(urls);
  const matched = entries.filter((entry) => wanted.has(entry.name));
  const sized = matched.filter((entry) => entry.encodedBodySize > 0 || entry.transferSize > 0);
  return {
    files: matched.length,
    bytes: sized.length ? sized.reduce((sum, entry) => sum + (entry.encodedBodySize || entry.transferSize), 0) : null,
    duration: matched.length ? Math.max(...matched.map((e) => e.responseEnd)) - Math.min(...matched.map((e) => e.startTime)) : null,
  };
}

/** unicode-range as the browser reports it: "U+0000-00FF, U+0131" -> "U+0-FF,U+131" */
export const normalizeUnicodeRange = (range) =>
  String(range ?? 'U+0-10FFFF')
    .toUpperCase()
    .replace(/\s+/g, '')
    .replace(/[0-9A-F?]+/g, (hex) => (hex.includes('?') ? hex : parseInt(hex, 16).toString(16).toUpperCase()))
    .replace(/^U\+0-10FFFF$/, '');

const normalizeWeight = (weight) => ({ normal: '400', bold: '700' })[String(weight ?? '400').trim()] ?? String(weight ?? '400').trim();

/** Source URLs of the @font-face rules whose faces the browser has loaded (a variable font's weights share one file) */
export function loadedFaceUrls(faces, fontSet, family) {
  const loaded = [...(fontSet ?? [])].filter((face) => face.family?.replace(/['"]/g, '') === family && face.status === 'loaded');
  const urls = faces
    .filter((face) =>
      loaded.some(
        (l) =>
          normalizeWeight(l.weight) === normalizeWeight(face.weight) &&
          (l.style ?? 'normal') === (face.style ?? 'normal') &&
          normalizeUnicodeRange(l.unicodeRange) === normalizeUnicodeRange(face.unicodeRange),
      ),
    )
    .map((face) => face.src[0]?.url)
    .filter(Boolean);
  return [...new Set(urls)];
}

const isStylesheet = (url) => /fonts\.googleapis\.com\/css|\.css(?:[?#]|$)/i.test(url);

/** Advice that follows from what was measured */
export function fontRecommendations({ bytes, display, formats }) {
  const advice = [];
  if (display && display !== 'swap' && display !== 'optional') advice.push(`font-display is "${display}": "swap" shows fallback text while the font loads.`);
  if (!display) advice.push('No font-display is set: add "swap" so text shows while the font loads.');
  if (formats.length && !formats.includes('WOFF2')) advice.push('No WOFF2 file: WOFF2 is the smallest widely supported format.');
  if (bytes !== null && bytes > 100 * 1024) advice.push('Over 100 KB downloaded: subset the font or load fewer weights.');
  return advice;
}

/**
 * Measures one font. `font` is `{ name, url, weights? }` where url is a stylesheet
 * (Google Fonts CSS) or a font file. `env` is for tests: { fetch, performance, fonts }.
 */
export async function measureFont(font, env = {}) {
  const fetchFn = env.fetch ?? globalThis.fetch?.bind(globalThis);
  const perf = env.performance ?? globalThis.performance;
  const fontSet = env.fonts ?? globalThis.document?.fonts;
  const result = { bytes: null, files: 0, loadTime: null, formats: [], display: null, sizeSource: null, loadSource: null, error: null };
  if (!font?.url) return { ...result, error: 'This font has no URL to measure.' };

  // 1. What files make up the font
  let faces = [];
  if (isStylesheet(font.url)) {
    try {
      const response = await fetchFn(font.url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      faces = parseFontFaceCss(await response.text()).filter((face) => !face.family || face.family.toLowerCase() === font.name.toLowerCase());
    } catch (error) {
      result.error = `Couldn't read the font's stylesheet (${error.message}).`;
    }
  } else {
    faces = [{ family: font.name, display: null, src: [{ url: font.url, format: null }] }];
  }
  const sources = faces.flatMap((face) => face.src);
  result.formats = [...new Set(sources.map(fontFormat).filter(Boolean))];
  result.display = faces.find((face) => face.display)?.display ?? null;

  // 2. Load time: time document.fonts.load() if the font isn't loaded yet
  if (fontSet?.load && perf?.now) {
    try {
      const alreadyLoaded = [...fontSet].some((face) => face.family?.replace(/['"]/g, '') === font.name && face.status === 'loaded');
      if (!alreadyLoaded) {
        // Every weight the font comes in, as the page shows them all
        const weights = font.weights?.length ? font.weights : ['400'];
        const start = perf.now();
        const loaded = (await Promise.all(weights.map((weight) => fontSet.load(`${weight} 1em "${font.name}"`)))).flat();
        if (loaded.length) {
          result.loadTime = Math.round(perf.now() - start);
          result.loadSource = 'document.fonts.load()';
        }
      }
    } catch {
      // Measured below from Resource Timing, or left unknown
    }
  }

  // 3. Size (and load time, if still unknown) from the downloads the browser made
  const urls = [...new Set(sources.map((s) => s.url))];
  const entries = perf?.getEntriesByType ? perf.getEntriesByType('resource') : [];
  const fromEntries = measureFromEntries(urls, entries);
  result.files = fromEntries.files;
  if (fromEntries.bytes !== null) {
    result.bytes = fromEntries.bytes;
    result.sizeSource = 'Resource Timing';
  }
  if (result.loadTime === null && fromEntries.duration !== null) {
    result.loadTime = Math.round(fromEntries.duration);
    result.loadSource = 'Resource Timing';
  }

  // 4. No Resource Timing entry: ask the server for the size of the files in use
  if (result.bytes === null && fetchFn) {
    const inUse = urls.length === 1 ? urls : loadedFaceUrls(faces, fontSet, font.name).slice(0, 20);
    const lengths = await Promise.all(
      inUse.map(async (url) => {
        try {
          const response = await fetchFn(url, { method: 'HEAD' });
          const length = Number(response.headers.get('content-length'));
          return response.ok && length > 0 ? length : null;
        } catch {
          return null;
        }
      }),
    );
    // All or nothing: a partial sum would understate the size
    if (inUse.length && lengths.every((length) => length !== null)) {
      result.bytes = lengths.reduce((sum, length) => sum + length, 0);
      result.files = inUse.length;
      result.sizeSource = 'Content-Length';
    }
  }

  return { ...result, recommendations: fontRecommendations(result) };
}

/** Resolves once the <link> useFontLoader added for this stylesheet has loaded (or failed) */
export function whenStylesheetLoaded(url, doc = globalThis.document) {
  return new Promise((resolve) => {
    const link = [...(doc?.querySelectorAll('link[data-font-url]') ?? [])].find((el) => el.getAttribute('data-font-url') === url);
    if (!link || link.sheet) return resolve();
    link.addEventListener('load', resolve, { once: true });
    link.addEventListener('error', resolve, { once: true });
  });
}

export const formatBytes = (bytes) => {
  if (bytes === null || bytes === undefined) return 'Unknown';
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
};

export const formatMs = (ms) => (ms === null || ms === undefined ? 'Unknown' : `${ms} ms`);
