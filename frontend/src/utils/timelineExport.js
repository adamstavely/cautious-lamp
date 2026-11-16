/**
 * The code TimelineGenerator exports (React, Vue, SVG). This is output, not
 * the app's styling: the classes, colours and stylesheet belong to the
 * generated component, so it lives outside the view and its style checks.
 *
 * The React and Vue components render the same markup as the preview
 * (components/timeline/TimelineRender.vue) with the same stylesheet
 * (timelineTheme.js), and need nothing but React or Vue: no CSS framework,
 * no icon font. Icons are inlined Lucide icons. User text goes through
 * scriptSafeJson (code) or escapeXml (SVG).
 */
import { scriptSafeJson } from './scriptSafeJson.js';
import {
  DATE_FORMATS, DEFAULT_ACCENT, TIMELINE_CSS, TIMELINE_ICONS, TIMELINE_STYLE_VALUES, formatDate, readableOn, safeColor, spacingPx, timelineItems,
} from './timelineTheme.js';

const escapeXml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

/** The events as the exported component's data: no editor-only fields */
function exportedEvents(events) {
  return events.map((e) => ({
    date: e.date || '',
    title: e.title || '',
    ...(e.description ? { description: e.description } : {}),
    ...(e.icon && TIMELINE_ICONS[e.icon] ? { icon: e.icon } : {}),
    ...(e.color ? { color: safeColor(e.color) } : {}),
    ...(e.side === 'left' || e.side === 'right' ? { side: e.side } : {}),
  }));
}

/** Only the icons these events use, as Lucide [tag, attributes] nodes */
function usedIcons(events) {
  return Object.fromEntries([...new Set(events.map((e) => e.icon).filter((name) => TIMELINE_ICONS[name]))].map((name) => [name, TIMELINE_ICONS[name].node]));
}

function settings(config) {
  return {
    title: config.title || 'Timeline',
    summary: config.summary || '',
    keyInsight: config.keyInsight || '',
    showHeader: config.showHeader !== false,
    layout: TIMELINE_STYLE_VALUES.includes(config.style) ? config.style : 'vertical',
    cards: !!config.cards,
    theme: ['auto', 'light', 'dark'].includes(config.theme) ? config.theme : 'auto',
    accentColor: safeColor(config.timelineColor),
    dateFormat: DATE_FORMATS[config.dateFormat] ? config.dateFormat : 'medium',
    spacing: spacingPx(config),
    sortByDate: config.sortByDate !== false,
  };
}

// ---------- React ----------

function generateReact(config, events) {
  const s = settings(config);
  return `import React from 'react';

export type TimelineLayout = 'vertical' | 'alternating' | 'horizontal' | 'rail' | 'milestones' | 'compact';
export type TimelineDateFormat = ${Object.keys(DATE_FORMATS).map((f) => `'${f}'`).join(' | ')};

export interface TimelineEvent {
  /** YYYY-MM-DD */
  date: string;
  title: string;
  description?: string;
  /** A Lucide icon name from ICONS below */
  icon?: string;
  /** The marker colour, #rrggbb; the accent colour when left out */
  color?: string;
  /** Alternating layout: which side of the line (default: alternate) */
  side?: 'auto' | 'left' | 'right';
}

export interface TimelineProps {
  events?: TimelineEvent[];
  title?: string;
  summary?: string;
  keyInsight?: string;
  /** false: the title and summary are read by screen readers but not shown */
  showHeader?: boolean;
  layout?: TimelineLayout;
  cards?: boolean;
  /** auto follows the reader's light or dark setting */
  theme?: 'auto' | 'light' | 'dark';
  accentColor?: string;
  dateFormat?: TimelineDateFormat;
  /** Space between events, in pixels */
  spacing?: number;
  /** false: keep the events in the order given */
  sortByDate?: boolean;
  /** Must be unique on the page */
  headingId?: string;
}

type IconNode = Array<[string, Record<string, string>]>;
type Item = TimelineEvent & { side: 'left' | 'right'; state: 'done' | 'upcoming'; toUpcoming: boolean };

/** Lucide icons (ISC licence, lucide.dev); add others in the same [tag, attributes] form */
const ICONS: Record<string, IconNode> = ${scriptSafeJson(usedIcons(events), 2)};

const DATE_FORMATS: Record<TimelineDateFormat, Intl.DateTimeFormatOptions> = ${JSON.stringify(DATE_FORMATS, null, 2)};

const CSS = ${scriptSafeJson(TIMELINE_CSS)};

const DEFAULT_EVENTS: TimelineEvent[] = ${scriptSafeJson(exportedEvents(events), 2)};

// YYYY-MM-DD is parsed as a local date (new Date('2024-01-01') would be UTC)
const parseDate = (value: string): Date | null => {
  const match = /^(\\d{4})-(\\d{2})-(\\d{2})$/.exec(value || '');
  const date = match ? new Date(+match[1], +match[2] - 1, +match[3]) : new Date(value);
  return value && !Number.isNaN(date.getTime()) ? date : null;
};
const pad = (n: number) => String(n).padStart(2, '0');
const dayKey = (date: Date) => \`\${date.getFullYear()}-\${pad(date.getMonth() + 1)}-\${pad(date.getDate())}\`;
const formatDate = (value: string, format: TimelineDateFormat) => {
  const date = parseDate(value);
  return date ? date.toLocaleDateString('en-US', DATE_FORMATS[format] || DATE_FORMATS.medium) : '';
};
const safeColor = (value: string | undefined, fallback: string) => (/^#[0-9a-fA-F]{6}$/.test(value || '') ? (value as string) : fallback);
const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
/** White or near-black icons, whichever reads better on the marker */
const readableOn = (hex: string) => (contrast(hex, '#ffffff') >= contrast(hex, '#111827') ? '#ffffff' : '#111827');

const timelineItems = (events: TimelineEvent[], sortByDate: boolean): Item[] => {
  const list = sortByDate
    ? events
        .map((event, index) => ({ event, index, time: parseDate(event.date)?.getTime() ?? Infinity }))
        .sort((a, b) => a.time - b.time || a.index - b.index)
        .map(({ event }) => event)
    : [...events];
  const today = dayKey(new Date());
  const items = list.map((event, index) => {
    const date = parseDate(event.date);
    const side: 'left' | 'right' = event.side === 'left' || event.side === 'right' ? event.side : index % 2 ? 'right' : 'left';
    const state: 'done' | 'upcoming' = date && dayKey(date) <= today ? 'done' : 'upcoming';
    return { ...event, side, state };
  });
  return items.map((item, index) => ({ ...item, toUpcoming: items[index + 1]?.state === 'upcoming' }));
};

export function Timeline({
  events = DEFAULT_EVENTS,
  title = ${scriptSafeJson(s.title)},
  summary = ${scriptSafeJson(s.summary)},
  keyInsight = ${scriptSafeJson(s.keyInsight)},
  showHeader = ${s.showHeader},
  layout = ${scriptSafeJson(s.layout)},
  cards = ${s.cards},
  theme = ${scriptSafeJson(s.theme)},
  accentColor = ${scriptSafeJson(s.accentColor)},
  dateFormat = ${scriptSafeJson(s.dateFormat)},
  spacing = ${s.spacing},
  sortByDate = ${s.sortByDate},
  headingId = 'timeline-heading',
}: TimelineProps) {
  const accent = safeColor(accentColor, ${scriptSafeJson(DEFAULT_ACCENT)});
  const items = timelineItems(events, sortByDate);
  const rootClass = ['tl', \`tl--\${layout}\`, \`tl--\${theme}\`, cards ? 'tl--cards' : ''].filter(Boolean).join(' ');
  const itemClass = (item: Item) =>
    [
      'tl-item',
      layout === 'alternating' ? \`tl-item--\${item.side}\` : '',
      layout === 'milestones' ? \`tl-item--\${item.state}\` : '',
      layout === 'milestones' && item.toUpcoming ? 'tl-item--to-upcoming' : '',
    ]
      .filter(Boolean)
      .join(' ');

  return (
    <>
      <style>{CSS}</style>
      <section className={rootClass} style={{ '--tl-accent': accent, '--tl-gap': \`\${spacing}px\` } as React.CSSProperties} aria-labelledby={headingId}>
        <header className={showHeader ? 'tl-header' : 'tl-header tl-sr'}>
          <h2 id={headingId} className="tl-heading">{title || 'Timeline'}</h2>
          {summary && <p className="tl-summary">{summary}</p>}
        </header>
        <ol className="tl-list">
          {items.map((item, index) => {
            const color = safeColor(item.color, accent);
            const date = formatDate(item.date, dateFormat);
            return (
              <li key={index} className={itemClass(item)} style={{ '--tl-color': color, '--tl-on-color': readableOn(color) } as React.CSSProperties}>
                <span className="tl-marker" aria-hidden="true">
                  {item.icon && ICONS[item.icon] && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      {ICONS[item.icon].map(([tag, attrs], i) => React.createElement(tag, { key: i, ...attrs }))}
                    </svg>
                  )}
                </span>
                <div className="tl-body">
                  {date && <time className="tl-date" dateTime={item.date}>{date}</time>}
                  <div className="tl-text">
                    <h3 className="tl-title">
                      {layout === 'milestones' && <span className="tl-sr">{item.state === 'done' ? 'Completed: ' : 'Upcoming: '}</span>}
                      {item.title || 'Untitled event'}
                    </h3>
                    {item.description && <p className="tl-desc">{item.description}</p>}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
        {keyInsight && (
          <p className="tl-insight">
            <strong>Key insight:</strong> {keyInsight}
          </p>
        )}
      </section>
    </>
  );
}

export default Timeline;
`;
}

// ---------- Vue ----------

function generateVue(config, events) {
  const s = settings(config);
  const lt = String.fromCharCode(60);
  const tag = (name) => `${lt}${name}>`;
  return `${tag('template')}
  ${lt}section :class="rootClass" :style="{ '--tl-accent': accent, '--tl-gap': spacing + 'px' }" :aria-labelledby="headingId">
    ${lt}header :class="showHeader ? 'tl-header' : 'tl-header tl-sr'">
      ${lt}h2 :id="headingId" class="tl-heading">{{ title || 'Timeline' }}${lt}/h2>
      ${lt}p v-if="summary" class="tl-summary">{{ summary }}${lt}/p>
    ${lt}/header>
    ${lt}ol class="tl-list">
      ${lt}li v-for="(item, index) in items" :key="index" :class="itemClass(item)" :style="itemVars(item)">
        ${lt}span class="tl-marker" aria-hidden="true">
          ${lt}svg v-if="ICONS[item.icon]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${lt}component :is="part[0]" v-for="(part, i) in ICONS[item.icon]" :key="i" v-bind="part[1]" />${lt}/svg>
        ${lt}/span>
        ${lt}div class="tl-body">
          ${lt}time v-if="formatDate(item.date)" class="tl-date" :datetime="item.date">{{ formatDate(item.date) }}${lt}/time>
          ${lt}div class="tl-text">
            ${lt}h3 class="tl-title">${lt}span v-if="layout === 'milestones'" class="tl-sr">{{ item.state === 'done' ? 'Completed: ' : 'Upcoming: ' }}${lt}/span>{{ item.title || 'Untitled event' }}${lt}/h3>
            ${lt}p v-if="item.description" class="tl-desc">{{ item.description }}${lt}/p>
          ${lt}/div>
        ${lt}/div>
      ${lt}/li>
    ${lt}/ol>
    ${lt}p v-if="keyInsight" class="tl-insight">${lt}strong>Key insight:${lt}/strong> {{ keyInsight }}${lt}/p>
  ${lt}/section>
${lt}/template>

${tag('script setup')}
import { computed } from 'vue';

const props = defineProps({
  /** [{ date: 'YYYY-MM-DD', title, description?, icon? (a name in ICONS), color? (#rrggbb), side? ('auto' | 'left' | 'right') }] */
  events: { type: Array, default: () => ${scriptSafeJson(exportedEvents(events), 4)} },
  title: { type: String, default: ${scriptSafeJson(s.title)} },
  summary: { type: String, default: ${scriptSafeJson(s.summary)} },
  keyInsight: { type: String, default: ${scriptSafeJson(s.keyInsight)} },
  /** false: the title and summary are read by screen readers but not shown */
  showHeader: { type: Boolean, default: ${s.showHeader} },
  /** vertical, alternating, horizontal, rail, milestones or compact */
  layout: { type: String, default: ${scriptSafeJson(s.layout)} },
  cards: { type: Boolean, default: ${s.cards} },
  /** auto follows the reader's light or dark setting */
  theme: { type: String, default: ${scriptSafeJson(s.theme)} },
  accentColor: { type: String, default: ${scriptSafeJson(s.accentColor)} },
  dateFormat: { type: String, default: ${scriptSafeJson(s.dateFormat)} },
  /** Space between events, in pixels */
  spacing: { type: Number, default: ${s.spacing} },
  /** false: keep the events in the order given */
  sortByDate: { type: Boolean, default: ${s.sortByDate} },
  /** Must be unique on the page */
  headingId: { type: String, default: 'timeline-heading' },
});

/** Lucide icons (ISC licence, lucide.dev); add others in the same [tag, attributes] form */
const ICONS = ${scriptSafeJson(usedIcons(events), 2)};

const DATE_FORMATS = ${JSON.stringify(DATE_FORMATS, null, 2)};

// YYYY-MM-DD is parsed as a local date (new Date('2024-01-01') would be UTC)
const parseDate = (value) => {
  const match = /^(\\d{4})-(\\d{2})-(\\d{2})$/.exec(value || '');
  const date = match ? new Date(+match[1], +match[2] - 1, +match[3]) : new Date(value);
  return value && !Number.isNaN(date.getTime()) ? date : null;
};
const pad = (n) => String(n).padStart(2, '0');
const dayKey = (date) => \`\${date.getFullYear()}-\${pad(date.getMonth() + 1)}-\${pad(date.getDate())}\`;
const formatDate = (value) => {
  const date = parseDate(value);
  return date ? date.toLocaleDateString('en-US', DATE_FORMATS[props.dateFormat] || DATE_FORMATS.medium) : '';
};
const safeColor = (value, fallback) => (/^#[0-9a-fA-F]{6}$/.test(value || '') ? value : fallback);
const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
/** White or near-black icons, whichever reads better on the marker */
const readableOn = (hex) => (contrast(hex, '#ffffff') >= contrast(hex, '#111827') ? '#ffffff' : '#111827');

const accent = computed(() => safeColor(props.accentColor, ${scriptSafeJson(DEFAULT_ACCENT)}));
const rootClass = computed(() => ['tl', \`tl--\${props.layout}\`, \`tl--\${props.theme}\`, props.cards ? 'tl--cards' : ''].filter(Boolean).join(' '));

const items = computed(() => {
  const list = props.sortByDate
    ? props.events
        .map((event, index) => ({ event, index, time: parseDate(event.date)?.getTime() ?? Infinity }))
        .sort((a, b) => a.time - b.time || a.index - b.index)
        .map(({ event }) => event)
    : [...props.events];
  const today = dayKey(new Date());
  const withState = list.map((event, index) => {
    const date = parseDate(event.date);
    return {
      ...event,
      side: event.side === 'left' || event.side === 'right' ? event.side : index % 2 ? 'right' : 'left',
      state: date && dayKey(date) <= today ? 'done' : 'upcoming',
    };
  });
  return withState.map((item, index) => ({ ...item, toUpcoming: withState[index + 1]?.state === 'upcoming' }));
});

const itemClass = (item) =>
  [
    'tl-item',
    props.layout === 'alternating' ? \`tl-item--\${item.side}\` : '',
    props.layout === 'milestones' ? \`tl-item--\${item.state}\` : '',
    props.layout === 'milestones' && item.toUpcoming ? 'tl-item--to-upcoming' : '',
  ]
    .filter(Boolean)
    .join(' ');

const itemVars = (item) => {
  const color = safeColor(item.color, accent.value);
  return { '--tl-color': color, '--tl-on-color': readableOn(color) };
};
${lt}/script>

${tag('style')}
${TIMELINE_CSS}
${lt}/style>
`;
}

// ---------- SVG ----------

const PALETTES = {
  light: { bg: '#ffffff', text: '#111827', muted: '#4b5563', surface: '#f9fafb', border: '#e5e7eb' },
  dark: { bg: '#111827', text: '#f9fafb', muted: '#d1d5db', surface: '#1f2937', border: '#374151' },
};
const FONT = 'font-family="system-ui, -apple-system, Segoe UI, sans-serif"';

/** Breaks text into at most `maxLines` lines of about `maxChars` characters, ending with … when cut */
function wrap(text, maxChars, maxLines = 4) {
  const words = String(text ?? '').split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length <= maxChars || !line) {
      line = next.length > maxChars ? `${next.slice(0, maxChars - 1)}…` : next;
    } else {
      lines.push(line);
      line = word.length > maxChars ? `${word.slice(0, maxChars - 1)}…` : word;
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = `${kept[maxLines - 1].replace(/…$/, '').slice(0, maxChars - 1)}…`;
    return kept;
  }
  return lines;
}

function textBlock(lines, x, y, { size, weight = 400, fill, anchor = 'start', lineHeight }) {
  if (!lines.length) return '';
  const spans = lines.map((line, i) => `<tspan x="${x}" dy="${i ? lineHeight : 0}">${escapeXml(line)}</tspan>`).join('');
  return `  <text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" ${FONT}>${spans}</text>`;
}

function iconGroup(name, cx, cy, size, stroke) {
  const node = TIMELINE_ICONS[name]?.node;
  if (!node) return '';
  const parts = node.map(([tag, attrs]) => `<${tag} ${Object.entries(attrs).map(([k, v]) => `${k}="${escapeXml(v)}"`).join(' ')}/>`).join('');
  const s = size / 24;
  return `  <g transform="translate(${cx - size / 2} ${cy - size / 2}) scale(${s})" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${parts}</g>`;
}

function generateSvg(config, events) {
  const s = settings(config);
  const p = PALETTES[s.theme === 'dark' ? 'dark' : 'light'];
  const items = timelineItems(events, { sortByDate: s.sortByDate });
  const layout = s.layout;
  const row = layout === 'horizontal' || layout === 'milestones';
  const pad = 32;
  const gap = s.spacing;
  const body = [];
  let y = pad;
  let width = row ? Math.max(640, items.length * 180 + pad * 2) : layout === 'alternating' ? 880 : layout === 'rail' ? 760 : 680;

  if (s.showHeader) {
    const titleLines = wrap(s.title, Math.floor((width - pad * 2) / 11), 2);
    body.push(textBlock(titleLines, pad, y + 20, { size: 22, weight: 700, fill: p.text, lineHeight: 28 }));
    y += 20 + (titleLines.length - 1) * 28 + 12;
    if (s.summary) {
      const lines = wrap(s.summary, Math.floor((width - pad * 2) / 8), 3);
      body.push(textBlock(lines, pad, y + 14, { size: 15, fill: p.muted, lineHeight: 21 }));
      y += 14 + (lines.length - 1) * 21 + 8;
    }
    y += 20;
  }

  const markerFor = (item, cx, cy, r) => {
    const color = safeColor(item.color, s.accentColor);
    const upcoming = layout === 'milestones' && item.state === 'upcoming';
    const out = [`  <circle cx="${cx}" cy="${cy}" r="${r + 4}" fill="${p.bg}" />`];
    out.push(upcoming
      ? `  <circle cx="${cx}" cy="${cy}" r="${r - 1}" fill="${p.bg}" stroke="${color}" stroke-width="2" />`
      : `  <circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" />`);
    if (layout !== 'compact' && item.icon) out.push(iconGroup(item.icon, cx, cy, r, upcoming ? color : readableOn(color)));
    return out.join('\n');
  };
  const dateText = (item) => formatDate(item.date, s.dateFormat);
  const titleText = (item) => item.title || 'Untitled event';

  if (row) {
    const r = 18;
    const col = (width - pad * 2) / Math.max(1, items.length);
    const cy = y + r + 4;
    const lines = [];
    const markers = [];
    let bottom = cy + r;
    items.forEach((item, index) => {
      const cx = Math.round(pad + col * index + col / 2);
      if (index < items.length - 1) {
        const dashed = layout === 'milestones' && item.toUpcoming ? ' stroke-dasharray="6 6"' : '';
        lines.push(`  <line x1="${cx}" y1="${cy}" x2="${Math.round(cx + col)}" y2="${cy}" stroke="${s.accentColor}" stroke-width="2"${dashed} />`);
      }
      markers.push(markerFor(item, cx, cy, r));
      const chars = Math.max(10, Math.floor((col - 16) / 7.5));
      const tLines = wrap(titleText(item), chars, 2);
      const xLines = wrap(item.description, chars, 3);
      let ty = cy + r + 26;
      const textParts = [];
      if (dateText(item)) {
        textParts.push(textBlock([dateText(item)], cx, ty, { size: 12, weight: 600, fill: p.muted, anchor: 'middle', lineHeight: 16 }));
        ty += 20;
      }
      textParts.push(textBlock(tLines, cx, ty, { size: 14, weight: 650, fill: p.text, anchor: 'middle', lineHeight: 19 }));
      ty += (tLines.length - 1) * 19 + 20;
      if (xLines.length) {
        textParts.push(textBlock(xLines, cx, ty, { size: 12, fill: p.muted, anchor: 'middle', lineHeight: 17 }));
        ty += (xLines.length - 1) * 17 + 8;
      }
      if (s.cards) {
        const top = cy + r + 10;
        markers.push(`  <rect x="${Math.round(cx - col / 2 + 6)}" y="${top}" width="${Math.round(col - 12)}" height="${Math.round(ty - top + 4)}" rx="12" fill="${p.surface}" stroke="${p.border}" />`);
      }
      markers.push(...textParts);
      bottom = Math.max(bottom, ty + 8);
    });
    body.push(...lines, ...markers);
    y = bottom + 8;
  } else {
    const r = layout === 'compact' ? 7 : 20;
    const offset = layout === 'compact' ? 4 : 0;
    const lineX = layout === 'alternating' ? width / 2 : layout === 'rail' ? pad + 120 + 16 + r : pad + r;
    const textWidth = layout === 'alternating' ? width / 2 - r - pad - 24 : width - lineX - r - 24 - pad;
    const chars = Math.max(16, Math.floor(textWidth / 7.8));
    const rows = [];
    items.forEach((item) => {
      const left = layout === 'alternating' && item.side === 'left';
      const anchor = left ? 'end' : 'start';
      const tx = left ? lineX - r - 24 : lineX + r + 24;
      const cardPad = s.cards ? 14 : 0;
      const textX = left ? tx - cardPad : tx + cardPad;
      const tLines = wrap(titleText(item), chars, 2);
      const xLines = wrap(item.description, Math.floor(chars * 1.1), 4);
      let ty = y + cardPad + (layout === 'compact' ? 0 : 6);
      const out = [];
      if (layout !== 'rail' && dateText(item)) {
        out.push(textBlock([dateText(item)], textX, ty + 12, { size: 13, weight: 600, fill: p.muted, anchor, lineHeight: 17 }));
        ty += 20;
      }
      out.push(textBlock(tLines, textX, ty + 14, { size: layout === 'compact' ? 15 : 16, weight: 650, fill: p.text, anchor, lineHeight: 21 }));
      ty += 14 + (tLines.length - 1) * 21 + 6;
      if (xLines.length) {
        out.push(textBlock(xLines, textX, ty + 14, { size: 14, fill: p.muted, anchor, lineHeight: 20 }));
        ty += 14 + (xLines.length - 1) * 20 + 4;
      }
      ty += cardPad;
      if (s.cards) {
        const cardW = Math.round(textWidth);
        out.unshift(`  <rect x="${left ? Math.round(tx - cardW) : tx}" y="${y}" width="${cardW}" height="${Math.round(ty - y)}" rx="12" fill="${p.surface}" stroke="${p.border}" />`);
      }
      if (layout === 'rail' && dateText(item)) {
        out.push(textBlock([dateText(item)], pad + 120, y + r + 4, { size: 13, weight: 600, fill: p.muted, anchor: 'end', lineHeight: 17 }));
      }
      rows.push({ item, cy: y + r + offset, out });
      y += Math.max(r * 2 + offset, ty - y) + gap;
    });
    y -= gap;
    rows.forEach((rowInfo, index) => {
      if (index < rows.length - 1) {
        body.push(`  <line x1="${lineX}" y1="${rowInfo.cy}" x2="${lineX}" y2="${rows[index + 1].cy}" stroke="${s.accentColor}" stroke-width="2" />`);
      }
    });
    rows.forEach((rowInfo) => {
      body.push(markerFor(rowInfo.item, lineX, rowInfo.cy, r));
      body.push(...rowInfo.out);
    });
    y += 24;
  }

  if (s.keyInsight) {
    const lines = wrap(`Key insight: ${s.keyInsight}`, Math.floor((width - pad * 2 - 32) / 7.8), 4);
    const h = 24 + lines.length * 20;
    body.push(`  <rect x="${pad}" y="${y}" width="${width - pad * 2}" height="${h}" rx="8" fill="${p.surface}" />`);
    body.push(`  <rect x="${pad}" y="${y}" width="4" height="${h}" fill="${s.accentColor}" />`);
    body.push(textBlock(lines, pad + 20, y + 26, { size: 15, fill: p.text, lineHeight: 20 }));
    y += h + 8;
  }

  const height = Math.round(y + pad);
  width = Math.round(width);
  const description = [
    s.summary,
    ...items.map((item) => [dateText(item), titleText(item), item.description].filter(Boolean).join(': ')),
    s.keyInsight ? `Key insight: ${s.keyInsight}` : '',
  ].filter(Boolean).join('. ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="timeline-title timeline-desc">
  <title id="timeline-title">${escapeXml(s.title)}</title>
  <desc id="timeline-desc">${escapeXml(description)}</desc>
  <rect width="${width}" height="${height}" rx="16" fill="${p.bg}" />
${body.filter(Boolean).join('\n')}
</svg>`;
}

/** The timeline as a React component (TSX), a Vue single-file component, or a static SVG */
export function generateTimelineCode(format, config, events) {
  if (format === 'react') return generateReact(config, events);
  if (format === 'vue') return generateVue(config, events);
  return generateSvg(config, events);
}
