/**
 * The timeline the Timeline generator makes: its layouts, icons, date
 * handling, colour checks and stylesheet. The preview (TimelineRender.vue)
 * and every export (timelineExport.js) render the same markup with this CSS,
 * so what you see is what you export.
 *
 * This is output, not the app's styling: the colours below belong to the
 * generated timeline, which carries its own light and dark palettes, so the
 * file lives outside the style checks (like timelineExport.js).
 *
 * Markup, for every layout:
 *   section.tl.tl--{layout}.tl--{theme}[.tl--cards]
 *     header.tl-header > h2.tl-heading + p.tl-summary
 *     ol.tl-list > li.tl-item[.tl-item--left|right][.tl-item--done|upcoming][.tl-item--to-upcoming]
 *       span.tl-marker (aria-hidden, Lucide icon)
 *       div.tl-body > time.tl-date + div.tl-text > h3.tl-title + p.tl-desc
 *     p.tl-insight
 */
import {
  Award, Briefcase, CalendarCheck, CircleCheck, Code, Flag, GraduationCap, Heart, Lightbulb, MapPin, Megaphone, Package, Rocket, Star, Target, Users, Zap,
} from 'lucide';

export const TIMELINE_STYLES = [
  { value: 'vertical', label: 'Vertical', icon: 'fold-vertical', description: 'A line down the side, events beside it' },
  { value: 'alternating', label: 'Alternating', icon: 'chart-gantt', description: 'Events either side of a centre line' },
  { value: 'horizontal', label: 'Horizontal', icon: 'minus', description: 'Events along a line, left to right' },
  { value: 'rail', label: 'Date rail', icon: 'calendar', description: 'Dates in their own column, like a changelog' },
  { value: 'milestones', label: 'Milestones', icon: 'flag', description: 'Steps along a line, done and upcoming' },
  { value: 'compact', label: 'Compact', icon: 'list', description: 'Small dots and tight rows for long lists' },
];
export const TIMELINE_STYLE_VALUES = TIMELINE_STYLES.map((s) => s.value);

/** Lucide icons a marker can show, as Lucide's own [tag, attributes] nodes (ISC licence) */
export const TIMELINE_ICONS = {
  'calendar-check': { label: 'Event', node: CalendarCheck },
  star: { label: 'Star', node: Star },
  'circle-check': { label: 'Check', node: CircleCheck },
  flag: { label: 'Flag', node: Flag },
  'map-pin': { label: 'Location', node: MapPin },
  rocket: { label: 'Launch', node: Rocket },
  award: { label: 'Award', node: Award },
  users: { label: 'People', node: Users },
  code: { label: 'Code', node: Code },
  megaphone: { label: 'Announcement', node: Megaphone },
  lightbulb: { label: 'Idea', node: Lightbulb },
  package: { label: 'Release', node: Package },
  target: { label: 'Goal', node: Target },
  zap: { label: 'Change', node: Zap },
  heart: { label: 'Heart', node: Heart },
  'graduation-cap': { label: 'Learning', node: GraduationCap },
  briefcase: { label: 'Work', node: Briefcase },
};

export const DATE_FORMATS = {
  year: { year: 'numeric' },
  month: { month: 'long', year: 'numeric' },
  short: { month: 'numeric', day: 'numeric', year: 'numeric' },
  medium: { month: 'short', day: 'numeric', year: 'numeric' },
  long: { month: 'long', day: 'numeric', year: 'numeric' },
  full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
};

export const DEFAULT_ACCENT = '#2563eb';

/** The background each theme draws behind the timeline, for the contrast checks */
export const THEME_BACKGROUNDS = { light: '#ffffff', dark: '#111827' };
/** Icon colours on a marker: whichever reads better on the marker colour */
const ON_LIGHT = '#111827';
const ON_DARK = '#ffffff';

// ---------- Dates ----------

/**
 * <input type="date"> values are YYYY-MM-DD, and new Date('YYYY-MM-DD') parses
 * as UTC midnight (the previous day west of UTC), so parse them as local dates.
 */
export function parseDate(value) {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const date = match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value, format) {
  const date = parseDate(value);
  if (!date) return '';
  return date.toLocaleDateString('en-US', DATE_FORMATS[format] || DATE_FORMATS.medium);
}

/** Today's date as YYYY-MM-DD in local time (toISOString() is UTC) */
export function localDateString(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// ---------- Colour ----------

export function safeColor(value, fallback = DEFAULT_ACCENT) {
  const color = String(value ?? '').trim();
  if (/^#[0-9a-fA-F]{6}$/.test(color)) return color.toLowerCase();
  if (/^#[0-9a-fA-F]{3}$/.test(color)) return `#${[...color.slice(1)].map((c) => c + c).join('')}`.toLowerCase();
  return fallback;
}

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(safeColor(hex).slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two colours, 1 to 21 */
export function contrastRatio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** The icon colour for a marker: white or near-black, whichever contrasts more */
export function readableOn(hex) {
  return contrastRatio(hex, ON_DARK) >= contrastRatio(hex, ON_LIGHT) ? ON_DARK : ON_LIGHT;
}

// ---------- Items and classes ----------

/**
 * The events in display order (by date unless `sortByDate` is false, undated
 * ones last), each with its side for the alternating layout (`auto`
 * alternates) and whether it has happened yet for the milestones layout.
 */
export function timelineItems(events, { sortByDate = true } = {}, today = new Date()) {
  let list = [...events];
  if (sortByDate) {
    list = list
      .map((event, index) => ({ event, index, time: parseDate(event.date)?.getTime() }))
      .sort((a, b) => (a.time ?? Infinity) - (b.time ?? Infinity) || a.index - b.index)
      .map(({ event }) => event);
  }
  const todayKey = localDateString(today);
  const items = list.map((event, index) => {
    const date = parseDate(event.date);
    return {
      ...event,
      side: event.side === 'left' || event.side === 'right' ? event.side : index % 2 ? 'right' : 'left',
      state: date && localDateString(date) <= todayKey ? 'done' : 'upcoming',
    };
  });
  return items.map((item, index) => ({ ...item, toUpcoming: items[index + 1]?.state === 'upcoming' }));
}

export function rootClass(style, theme, cards) {
  return ['tl', `tl--${TIMELINE_STYLE_VALUES.includes(style) ? style : 'vertical'}`, `tl--${theme}`, cards ? 'tl--cards' : ''].filter(Boolean).join(' ');
}

export function itemClass(item, style) {
  return [
    'tl-item',
    style === 'alternating' ? `tl-item--${item.side}` : '',
    style === 'milestones' ? `tl-item--${item.state}` : '',
    style === 'milestones' && item.toUpcoming ? 'tl-item--to-upcoming' : '',
  ].filter(Boolean).join(' ');
}

// ---------- Stylesheet ----------

const LIGHT = '--tl-bg:#ffffff;--tl-text:#111827;--tl-muted:#4b5563;--tl-surface:#f9fafb;--tl-border:#e5e7eb';
const DARK = '--tl-bg:#111827;--tl-text:#f9fafb;--tl-muted:#d1d5db;--tl-surface:#1f2937;--tl-border:#374151';
const ROW = (sel) => ['horizontal', 'milestones'].map((l) => `.tl--${l} ${sel}`).join(',');

/**
 * The timeline's stylesheet. Self-contained: no framework, no icon font, and
 * it resets the margins it relies on so a host page's styles don't leak in.
 * Below 36rem of its own width (a container query), the horizontal,
 * milestones, alternating and date-rail layouts become one readable column.
 */
export const TIMELINE_CSS = `
.tl{--tl-accent:${DEFAULT_ACCENT};--tl-line:var(--tl-accent);--tl-gap:32px;--tl-hgap:24px;--tl-marker:40px;--tl-offset:0px;--tl-rail:7.5rem;${LIGHT};
container-type:inline-size;box-sizing:border-box;margin:0;padding:clamp(14px,4vw,24px);border-radius:16px;background:var(--tl-bg);color:var(--tl-text);font-family:inherit;line-height:1.5}
.tl *,.tl *::before,.tl *::after{box-sizing:border-box}
.tl--dark{${DARK}}
@media (prefers-color-scheme:dark){.tl--auto{${DARK}}}
.tl-header{margin:0 0 24px}
.tl-heading{margin:0;font-size:1.25rem;font-weight:700;line-height:1.3;color:var(--tl-text)}
.tl-summary{margin:6px 0 0;font-size:.9375rem;color:var(--tl-muted)}
.tl-list{list-style:none;margin:0;padding:0}
.tl-item{--tl-color:var(--tl-accent);--tl-on-color:#ffffff;position:relative;display:grid;grid-template-columns:var(--tl-marker) minmax(0,1fr);column-gap:16px;align-items:start;margin:0;padding:0}
.tl-item+.tl-item{margin-top:var(--tl-gap)}
.tl-item:not(:last-child)::before{content:"";position:absolute;top:calc(var(--tl-marker) + var(--tl-offset));left:calc(var(--tl-marker) / 2 - 1px);width:2px;height:calc(100% - var(--tl-marker) + var(--tl-gap));background:var(--tl-line)}
.tl-marker{position:relative;z-index:1;display:grid;place-items:center;width:var(--tl-marker);height:var(--tl-marker);margin-top:var(--tl-offset);border-radius:50%;background:var(--tl-color);color:var(--tl-on-color);box-shadow:0 0 0 4px var(--tl-bg)}
.tl-marker svg{display:block;width:50%;height:50%}
.tl-body{min-width:0}
.tl:not(.tl--cards) .tl-body{padding-top:calc(var(--tl-marker) / 2 - .75rem)}
.tl-date{display:block;margin:0 0 2px;font-size:.8125rem;font-weight:600;letter-spacing:.01em;color:var(--tl-muted)}
.tl-title{margin:0;font-size:1rem;font-weight:650;line-height:1.35;color:var(--tl-text)}
.tl-desc{margin:4px 0 0;font-size:.875rem;color:var(--tl-muted)}
.tl-insight{margin:24px 0 0;padding:12px 16px;border-left:4px solid var(--tl-accent);border-radius:8px;background:var(--tl-surface);font-size:.9375rem;color:var(--tl-text)}
.tl-insight strong{font-weight:700}
.tl-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.tl--cards .tl-body,.tl--rail.tl--cards .tl-text{padding:12px 16px;border:1px solid var(--tl-border);border-radius:12px;background:var(--tl-surface)}

.tl--compact{--tl-marker:14px;--tl-offset:4px}
.tl--compact .tl-marker{box-shadow:0 0 0 3px var(--tl-bg)}
.tl--compact .tl-marker svg{display:none}
.tl--compact:not(.tl--cards) .tl-body{padding-top:0}
.tl--compact .tl-title{font-size:.9375rem}

.tl--alternating .tl-item{grid-template-columns:minmax(0,1fr) var(--tl-marker) minmax(0,1fr)}
.tl--alternating .tl-marker{grid-column:2;grid-row:1}
.tl--alternating .tl-item--left .tl-body{grid-column:1;grid-row:1;text-align:right}
.tl--alternating .tl-item--right .tl-body{grid-column:3;grid-row:1}
.tl--alternating .tl-item:not(:last-child)::before{left:calc(50% - 1px)}

.tl--rail .tl-item{grid-template-columns:var(--tl-rail) var(--tl-marker) minmax(0,1fr)}
.tl--rail .tl-marker{grid-column:2;grid-row:1}
.tl--rail .tl-body{display:contents}
.tl--rail .tl-date{grid-column:1;grid-row:1;margin:0;text-align:right;padding-top:calc(var(--tl-marker) / 2 - .65rem)}
.tl--rail .tl-text{grid-column:3;grid-row:1;min-width:0;padding-top:calc(var(--tl-marker) / 2 - .75rem)}
.tl--rail .tl-item:not(:last-child)::before{left:calc(var(--tl-rail) + 16px + var(--tl-marker) / 2 - 1px)}

.tl--horizontal,.tl--milestones{--tl-marker:36px}
${ROW('.tl-list')}{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(8rem,1fr);column-gap:var(--tl-hgap);overflow-x:auto;padding:4px 4px 8px}
${ROW('.tl-item')}{display:flex;flex-direction:column;align-items:center;row-gap:12px;text-align:center}
${ROW('.tl-item+.tl-item')}{margin-top:0}
${ROW('.tl-item:not(:last-child)::before')}{top:calc(var(--tl-marker) / 2 - 1px);left:calc(50% + var(--tl-marker) / 2);width:calc(100% - var(--tl-marker) + var(--tl-hgap));height:2px}
${ROW('.tl-body')}{width:100%;flex:1 1 auto}
.tl--horizontal:not(.tl--cards) .tl-body,.tl--milestones:not(.tl--cards) .tl-body{padding-top:0}
.tl--milestones .tl-item--upcoming .tl-marker{background:var(--tl-bg);color:var(--tl-color);box-shadow:inset 0 0 0 2px var(--tl-color),0 0 0 4px var(--tl-bg)}
.tl--milestones .tl-item--to-upcoming:not(:last-child)::before{background:repeating-linear-gradient(90deg,var(--tl-line) 0 6px,transparent 6px 12px)}

@container (max-width:36rem){
.tl:not(.tl--compact) .tl-list{--tl-marker:32px}
.tl-item{column-gap:12px}
.tl-header{margin-bottom:16px}
.tl-heading{font-size:1.125rem}
.tl--cards .tl-body,.tl--rail.tl--cards .tl-body{padding:10px 12px}
${ROW('.tl-list')}{display:block;overflow:visible;padding:0}
${ROW('.tl-item')},.tl--alternating .tl-item,.tl--rail .tl-item{display:grid;grid-template-columns:var(--tl-marker) minmax(0,1fr);align-items:start;text-align:left}
${ROW('.tl-item+.tl-item')}{margin-top:var(--tl-gap)}
${ROW('.tl-item:not(:last-child)::before')},.tl--alternating .tl-item:not(:last-child)::before,.tl--rail .tl-item:not(:last-child)::before{top:var(--tl-marker);left:calc(var(--tl-marker) / 2 - 1px);width:2px;height:calc(100% - var(--tl-marker) + var(--tl-gap))}
.tl--milestones .tl-item--to-upcoming:not(:last-child)::before{background:repeating-linear-gradient(180deg,var(--tl-line) 0 6px,transparent 6px 12px)}
.tl--horizontal:not(.tl--cards) .tl-body,.tl--milestones:not(.tl--cards) .tl-body{padding-top:calc(var(--tl-marker) / 2 - .75rem)}
.tl--alternating .tl-marker,.tl--rail .tl-marker{grid-column:1}
.tl--alternating .tl-item--left .tl-body,.tl--alternating .tl-item--right .tl-body{grid-column:2;text-align:left}
.tl--rail .tl-body{display:block;grid-column:2;grid-row:1}
.tl--rail .tl-date{margin:0 0 2px;padding-top:calc(var(--tl-marker) / 2 - .75rem);text-align:left}
.tl--rail .tl-text{padding-top:0}
.tl--rail.tl--cards .tl-text{padding:0;border:0;background:none}
}
`.trim();

/** CSS custom properties for one timeline: the accent, the gap between events, and each event's marker colours */
export function timelineVars(config) {
  const accent = safeColor(config.timelineColor);
  return { '--tl-accent': accent, '--tl-gap': `${spacingPx(config)}px` };
}

export function itemVars(item, config) {
  const color = safeColor(item.color, safeColor(config.timelineColor));
  return { '--tl-color': color, '--tl-on-color': readableOn(color) };
}

export function spacingPx(config) {
  const n = Number(config.spacing);
  return Number.isFinite(n) && n >= 0 && n <= 400 ? Math.round(n) : 32;
}

// ---------- Starting point ----------

export function defaultTimelineConfig() {
  return {
    title: 'Product launch',
    summary: 'From kickoff to general availability over three months.',
    keyInsight: '',
    showHeader: true,
    style: 'vertical',
    cards: true,
    theme: 'auto',
    timelineColor: DEFAULT_ACCENT,
    dateFormat: 'medium',
    spacing: 32,
    sortByDate: true,
  };
}

/** A small example timeline around today, so the milestones layout shows done and upcoming steps */
export function exampleEvents(today = new Date()) {
  const day = (offset) => localDateString(new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset));
  return [
    { date: day(-42), title: 'Kickoff', description: 'Goals agreed and the team formed.', icon: 'flag', color: '', side: 'auto' },
    { date: day(-14), title: 'Research complete', description: 'Twelve interviews and a survey of 400 customers.', icon: 'lightbulb', color: '', side: 'auto' },
    { date: day(14), title: 'Beta release', description: 'Open to the early-access group.', icon: 'package', color: '#8b5cf6', side: 'auto' },
    { date: day(45), title: 'Launch', description: 'Available to everyone.', icon: 'rocket', color: '#059669', side: 'auto' },
  ];
}

/** Settings and events as saved: anything missing or malformed falls back to the defaults */
export function restoreTimeline(saved) {
  const config = { ...defaultTimelineConfig() };
  const source = saved && typeof saved === 'object' ? saved : {};
  const savedConfig = source.config && typeof source.config === 'object' ? source.config : {};
  for (const [key, fallback] of Object.entries(config)) {
    if (typeof savedConfig[key] === typeof fallback) config[key] = savedConfig[key];
  }
  if (!TIMELINE_STYLE_VALUES.includes(config.style)) config.style = 'vertical';
  if (!['auto', 'light', 'dark'].includes(config.theme)) config.theme = 'auto';
  if (!DATE_FORMATS[config.dateFormat]) config.dateFormat = 'medium';
  const text = (value) => (typeof value === 'string' ? value : '');
  const events = Array.isArray(source.events)
    ? source.events.filter((e) => e && typeof e === 'object').slice(0, 200).map((e) => ({
      date: text(e.date),
      title: text(e.title),
      description: text(e.description),
      icon: TIMELINE_ICONS[e.icon] ? e.icon : '',
      color: e.color ? safeColor(e.color) : '',
      side: ['left', 'right'].includes(e.side) ? e.side : 'auto',
      collapsed: e.collapsed === true,
    }))
    : [];
  return { config, events: events.length ? events : exampleEvents() };
}
