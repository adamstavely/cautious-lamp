/**
 * Reading uploaded .svg files into icons for the icon library. Each file must
 * be an SVG document (root <svg>) of at most 100KB, the size the server
 * accepts for an `icons` item (backend/src/workspaces/resource-kinds.ts).
 * The markup is stored as given; it is sanitized when shown (safeContent.js).
 */

export const MAX_SVG_BYTES = 100 * 1024;

/** "Arrow Right.svg" → "arrow-right" */
export const iconNameFromFile = (fileName) =>
  String(fileName || '')
    .replace(/\.svg$/i, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
    .slice(0, 200) || 'icon';

/** Whether the text is an SVG document: parses as XML and its root element is <svg> */
export const parseSvgText = (text) => {
  if (typeof text !== 'string' || !text.trim()) return { ok: false, reason: 'The file is empty.' };
  const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
  if (doc.getElementsByTagName('parsererror').length > 0) return { ok: false, reason: "The file isn't valid SVG markup." };
  if (doc.documentElement?.localName !== 'svg') return { ok: false, reason: "The file isn't an SVG image." };
  return { ok: true, svg: text.trim() };
};

const readText = (file) =>
  typeof file.text === 'function'
    ? file.text()
    : new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
      });

/**
 * Reads the chosen files. Returns the icons that can be uploaded
 * ({ name, svg, fileName }) and the files that can't, with a reason.
 */
export async function readSvgFiles(files) {
  const icons = [];
  const rejected = [];
  for (const file of files) {
    const fileName = file.name;
    if (!/\.svg$/i.test(fileName) && file.type !== 'image/svg+xml') {
      rejected.push({ fileName, reason: 'Only .svg files can be uploaded.' });
      continue;
    }
    if (file.size > MAX_SVG_BYTES) {
      rejected.push({ fileName, reason: 'The file is larger than 100KB.' });
      continue;
    }
    let text;
    try {
      text = await readText(file);
    } catch {
      rejected.push({ fileName, reason: "The file couldn't be read." });
      continue;
    }
    const parsed = parseSvgText(text);
    if (!parsed.ok) rejected.push({ fileName, reason: parsed.reason });
    else icons.push({ name: iconNameFromFile(fileName), svg: parsed.svg, fileName });
  }
  return { icons, rejected };
}
