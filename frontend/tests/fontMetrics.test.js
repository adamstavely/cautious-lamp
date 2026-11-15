// Font metrics are measured, never guessed: @font-face rules from the font's
// stylesheet, sizes from Resource Timing (or Content-Length), load time from
// document.fonts.load(), and null (shown as Unknown) when nothing can be measured.
import { describe, expect, it } from 'vitest';
import { formatBytes, loadedFaceUrls, measureFont, normalizeUnicodeRange, parseFontFaceCss } from '../src/utils/fontMetrics.js';

const CSS = `/* latin */
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(https://fonts.gstatic.com/s/inter/a.woff2) format('woff2');
  unicode-range: U+0000-00FF;
}
@font-face {
  font-family: 'Inter';
  font-weight: 700;
  font-display: swap;
  src: url(https://fonts.gstatic.com/s/inter/b.woff2) format('woff2');
}`;

const response = (body, { ok = true, headers = {} } = {}) => ({ ok, status: ok ? 200 : 404, text: async () => body, headers: { get: (name) => headers[name.toLowerCase()] ?? null } });

describe('parseFontFaceCss', () => {
  it('reads each @font-face rule', () => {
    const faces = parseFontFaceCss(CSS);
    expect(faces).toHaveLength(2);
    expect(faces[0]).toMatchObject({ family: 'Inter', weight: '400', display: 'swap', src: [{ url: 'https://fonts.gstatic.com/s/inter/a.woff2', format: 'woff2' }] });
  });
});

describe('loadedFaceUrls', () => {
  it('finds the files of the faces the browser loaded, comparing unicode ranges as the browser writes them', () => {
    expect(normalizeUnicodeRange('U+0000-00FF, U+0131')).toBe('U+0-FF,U+131');
    const faces = parseFontFaceCss(CSS);
    const fontSet = [
      { family: '"Inter"', weight: '400', style: 'normal', unicodeRange: 'U+0-FF', status: 'loaded' },
      { family: 'Inter', weight: '700', style: 'normal', unicodeRange: 'U+0-10FFFF', status: 'unloaded' },
    ];
    expect(loadedFaceUrls(faces, fontSet, 'Inter')).toEqual(['https://fonts.gstatic.com/s/inter/a.woff2']);
  });
});

describe('measureFont', () => {
  const font = { name: 'Inter', url: 'https://fonts.googleapis.com/css2?family=Inter' };

  it('adds up the downloaded files and times document.fonts.load()', async () => {
    let now = 1000;
    const result = await measureFont(font, {
      fetch: async () => response(CSS),
      performance: {
        now: () => (now += 42),
        getEntriesByType: () => [
          { name: 'https://fonts.gstatic.com/s/inter/a.woff2', encodedBodySize: 20000, transferSize: 20300, startTime: 10, responseEnd: 60 },
          { name: 'https://fonts.gstatic.com/s/inter/b.woff2', encodedBodySize: 22000, transferSize: 22300, startTime: 12, responseEnd: 80 },
          { name: 'https://example.com/other.woff2', encodedBodySize: 99999, startTime: 0, responseEnd: 1 },
        ],
      },
      fonts: Object.assign([], { load: async () => [{}] }),
    });
    expect(result).toMatchObject({ bytes: 42000, files: 2, loadTime: 42, loadSource: 'document.fonts.load()', formats: ['WOFF2'], display: 'swap', error: null });
    expect(result.recommendations).toEqual([]);
  });

  it('uses Resource Timing for load time when the font was already loaded', async () => {
    const result = await measureFont(font, {
      fetch: async () => response(CSS),
      performance: { now: () => 0, getEntriesByType: () => [{ name: 'https://fonts.gstatic.com/s/inter/a.woff2', encodedBodySize: 1000, startTime: 10, responseEnd: 35 }] },
      fonts: Object.assign([{ family: 'Inter', status: 'loaded' }], { load: async () => [] }),
    });
    expect(result).toMatchObject({ bytes: 1000, loadTime: 25, loadSource: 'Resource Timing' });
  });

  it('asks the server for a single file’s size, and leaves unknowns null', async () => {
    const direct = await measureFont(
      { name: 'Brand', url: 'https://cdn.example.com/brand.ttf' },
      { fetch: async () => response('', { headers: { 'content-length': '150000' } }), performance: { now: () => 0, getEntriesByType: () => [] } },
    );
    expect(direct).toMatchObject({ bytes: 150000, sizeSource: 'Content-Length', loadTime: null, formats: ['TrueType'] });
    expect(direct.recommendations).toEqual([
      'No font-display is set: add "swap" so text shows while the font loads.',
      'No WOFF2 file: WOFF2 is the smallest widely supported format.',
      'Over 100 KB downloaded: subset the font or load fewer weights.',
    ]);

    // Resource Timing full: the loaded faces' files are asked for their size
    const sizes = { 'https://fonts.gstatic.com/s/inter/a.woff2': '30000', 'https://fonts.gstatic.com/s/inter/b.woff2': '31000' };
    const fallback = await measureFont(font, {
      fetch: async (url, options) => (options?.method === 'HEAD' ? response('', { headers: { 'content-length': sizes[url] } }) : response(CSS)),
      performance: { now: () => 0, getEntriesByType: () => [] },
      fonts: Object.assign(
        [
          { family: 'Inter', weight: '400', style: 'normal', unicodeRange: 'U+0-FF', status: 'loaded' },
          { family: 'Inter', weight: 'bold', style: 'normal', unicodeRange: 'U+0-10FFFF', status: 'loaded' },
        ],
        { load: async () => [] },
      ),
    });
    expect(fallback).toMatchObject({ bytes: 61000, files: 2, sizeSource: 'Content-Length' });

    const unreadable = await measureFont(font, { fetch: async () => response('', { ok: false }), performance: { now: () => 0, getEntriesByType: () => [] } });
    expect(unreadable.bytes).toBeNull();
    expect(unreadable.loadTime).toBeNull();
    expect(unreadable.error).toMatch(/Couldn't read the font's stylesheet/);
    expect(formatBytes(unreadable.bytes)).toBe('Unknown');
  });
});
