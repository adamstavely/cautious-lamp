/**
 * Files the token editors (Token studio, AI tokens) export: DTCG JSON, CSS
 * custom properties, an iOS property list and Android resources, all from a
 * DTCG document (see tokensToDtcg in styleDictionary.js).
 */

const isToken = (node) => node && typeof node === 'object' && node.$value !== undefined;

/** [path parts, token] for every token in a DTCG document */
function entries(dtcg, path = []) {
  return Object.entries(dtcg ?? {}).flatMap(([key, node]) => {
    if (key.startsWith('$')) return [];
    if (isToken(node)) return [[[...path, key], node]];
    return node && typeof node === 'object' ? entries(node, [...path, key]) : [];
  });
}

const hexToRgbFractions = (hex) => {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return hex;
  return [1, 3, 5].map((i) => (parseInt(hex.slice(i, i + 2), 16) / 255).toFixed(3)).join(' ');
};

// Android colours are #AARRGGBB
const hexToAndroid = (hex) => (/^#[0-9a-f]{6}$/i.test(hex) ? `#FF${hex.slice(1).toUpperCase()}` : hex);

const xmlEscape = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function toCss(dtcg) {
  const lines = entries(dtcg).map(([path, token]) => `  --${path.join('-')}: ${token.$value};`);
  return `:root {\n${lines.join('\n')}\n}`;
}

export function toIosPlist(dtcg) {
  const lines = entries(dtcg).map(([path, token]) => {
    const value = token.$type === 'color' ? hexToRgbFractions(token.$value) : token.$value;
    return `  <key>${path.join('_')}</key>\n  <string>${xmlEscape(value)}</string>`;
  });
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">',
    '<plist version="1.0">',
    '<dict>',
    ...lines,
    '</dict>',
    '</plist>',
  ].join('\n');
}

export function toAndroidXml(dtcg) {
  const lines = entries(dtcg).map(([path, token]) => {
    const name = path.join('_').replace(/[.-]/g, '_');
    if (token.$type === 'color') return `  <color name="${name}">${xmlEscape(hexToAndroid(token.$value))}</color>`;
    if (token.$type === 'dimension') return `  <dimen name="${name}">${xmlEscape(String(token.$value).replace('px', 'dp'))}</dimen>`;
    return `  <string name="${name}">${xmlEscape(token.$value)}</string>`;
  });
  return ['<?xml version="1.0" encoding="utf-8"?>', '<resources>', ...lines, '</resources>'].join('\n');
}

const FORMATS = {
  json: { extension: 'json', mime: 'application/json', render: (dtcg) => JSON.stringify(dtcg, null, 2) },
  css: { extension: 'css', mime: 'text/css', render: toCss },
  ios: { extension: 'plist', mime: 'application/xml', render: toIosPlist },
  android: { extension: 'xml', mime: 'application/xml', render: toAndroidXml },
};

export const EXPORT_FORMATS = [
  { value: 'json', label: 'JSON (DTCG)', icon: 'code' },
  { value: 'css', label: 'CSS variables', icon: 'file-code' },
  { value: 'ios', label: 'iOS', icon: 'smartphone' },
  { value: 'android', label: 'Android', icon: 'smartphone' },
];

/** { content, filename, mime } for a DTCG document in one of EXPORT_FORMATS */
export function exportTokenFile(dtcg, format, basename = 'tokens') {
  const spec = FORMATS[format] ?? FORMATS.json;
  return { content: spec.render(dtcg), filename: `${basename}.${spec.extension}`, mime: spec.mime };
}

/** Saves text as a file in the browser */
export function downloadText({ content, filename, mime }) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
