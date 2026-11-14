/**
 * The code TimelineGenerator exports (React, Vue, SVG). This is output, not
 * the app's styling: the classes and colours in it belong to the generated
 * component, so it lives outside the view and its style checks.
 */
import { scriptSafeJson } from './scriptSafeJson.js';

const escapeXml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const safeColor = (color, fallback = '#6366f1') =>
  /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(String(color || '').trim()) ? String(color).trim() : fallback;

const spacingPx = (config) => {
  const n = Number(config.spacing);
  return Number.isFinite(n) && n >= 0 ? n : 80;
};

const generateSvg = (eventsData, config, formatDate) => {
  const lineColor = safeColor(config.timelineColor);
  const title = config.title || 'Timeline';
  const summary = config.summary || 'Timeline visualization';
  const count = eventsData.length;
  const font = 'font-family="system-ui, -apple-system, sans-serif"';
  const parts = [];
  let width;
  let height;

  if (config.style === 'horizontal') {
    const step = 180;
    width = Math.max(600, count * step);
    height = 200;
    const lineY = 50;
    parts.push(`  <line x1="0" y1="${lineY}" x2="${width}" y2="${lineY}" stroke="${lineColor}" stroke-width="4" />`);
    eventsData.forEach((event, index) => {
      const x = Math.round(step / 2 + index * ((width - step) / Math.max(1, count - 1)));
      const cx = count === 1 ? width / 2 : x;
      parts.push(`  <circle cx="${cx}" cy="${lineY}" r="14" fill="${safeColor(event.color, lineColor)}" />`);
      parts.push(`  <text x="${cx}" y="${lineY + 40}" text-anchor="middle" font-size="12" fill="#4b5563" ${font}>${escapeXml(formatDate(event.date))}</text>`);
      parts.push(`  <text x="${cx}" y="${lineY + 60}" text-anchor="middle" font-size="14" font-weight="600" fill="#111827" ${font}>${escapeXml(event.title)}</text>`);
      if (event.description) {
        parts.push(`  <text x="${cx}" y="${lineY + 80}" text-anchor="middle" font-size="12" fill="#374151" ${font}>${escapeXml(event.description)}</text>`);
      }
    });
  } else {
    const zigzag = config.style === 'zigzag';
    const rowHeight = Math.max(80, spacingPx(config));
    width = zigzag ? 800 : 600;
    height = Math.max(120, count * rowHeight + 40);
    const lineX = zigzag ? width / 2 : 40;
    const firstY = 40;
    const lastY = firstY + (count - 1) * rowHeight;
    parts.push(`  <line x1="${lineX}" y1="${firstY}" x2="${lineX}" y2="${Math.max(firstY, lastY)}" stroke="${lineColor}" stroke-width="4" />`);
    eventsData.forEach((event, index) => {
      const y = firstY + index * rowHeight;
      const onLeft = zigzag && event.position !== 'right';
      const textX = zigzag ? (onLeft ? lineX - 32 : lineX + 32) : lineX + 32;
      const anchor = onLeft ? 'end' : 'start';
      parts.push(`  <circle cx="${lineX}" cy="${y}" r="16" fill="${safeColor(event.color, lineColor)}" />`);
      parts.push(`  <text x="${textX}" y="${y - 6}" text-anchor="${anchor}" font-size="12" fill="#4b5563" ${font}>${escapeXml(formatDate(event.date))}</text>`);
      parts.push(`  <text x="${textX}" y="${y + 12}" text-anchor="${anchor}" font-size="16" font-weight="600" fill="#111827" ${font}>${escapeXml(event.title)}</text>`);
      if (event.description) {
        parts.push(`  <text x="${textX}" y="${y + 30}" text-anchor="${anchor}" font-size="13" fill="#374151" ${font}>${escapeXml(event.description)}</text>`);
      }
    });
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="timeline-title timeline-desc">
  <title id="timeline-title">${escapeXml(title)}</title>
  <desc id="timeline-desc">${escapeXml(summary)}</desc>
${parts.join('\n')}
</svg>`;
};

export function generateTimelineCode(format, config, sortedEvents, formatDate) {
  const eventsData = sortedEvents.map(e => ({
    date: e.date,
    title: e.title || 'Event',
    description: e.description || '',
    icon: e.icon || '',
    color: e.color || config.timelineColor,
    position: e.position === 'right' ? 'right' : 'left'
  }));
  const style = scriptSafeJson(config.style);
  const timelineColor = scriptSafeJson(config.timelineColor);
  const dateFormat = scriptSafeJson(config.dateFormat);
  const spacing = spacingPx(config);
  
  if (format === 'react') {
    return `import React from 'react';

export interface TimelineEvent {
  date: string;
  title: string;
  description?: string;
  icon?: string;
  color?: string;
  position?: 'left' | 'right';
}

export interface TimelineProps {
  events: TimelineEvent[];
  style?: 'vertical' | 'horizontal' | 'zigzag';
  timelineColor?: string;
  dateFormat?: 'short' | 'medium' | 'long' | 'full';
  spacing?: number;
}

const DATE_FORMATS: Record<string, Intl.DateTimeFormatOptions> = {
  short: { month: 'numeric', day: 'numeric', year: 'numeric' },
  medium: { month: 'short', day: 'numeric', year: 'numeric' },
  long: { month: 'long', day: 'numeric', year: 'numeric' },
  full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
};

const iconMap: Record<string, string> = {
  event: 'event',
  star: 'star',
  check_circle: 'check_circle',
  flag: 'flag',
  location_on: 'location_on'
};

// YYYY-MM-DD is parsed as local time (new Date('2024-01-01') would be UTC).
const parseDate = (dateString: string) => {
  const match = /^(\\d{4})-(\\d{2})-(\\d{2})$/.exec(dateString || '');
  const date = match ? new Date(+match[1], +match[2] - 1, +match[3]) : new Date(dateString);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const Timeline: React.FC<TimelineProps> = ({
  events = ${scriptSafeJson(eventsData, 2)},
  style = ${style},
  timelineColor = ${timelineColor},
  dateFormat = ${dateFormat},
  spacing = ${spacing}
}) => {
  const formatDate = (dateString: string) => {
    const date = parseDate(dateString);
    return date ? date.toLocaleDateString('en-US', DATE_FORMATS[dateFormat] || DATE_FORMATS.medium) : dateString;
  };

  const sortedEvents = [...events].sort(
    (a, b) => (parseDate(a.date)?.getTime() ?? Infinity) - (parseDate(b.date)?.getTime() ?? Infinity)
  );

  const marker = (event: TimelineEvent, size: number) => (
    <div
      className="rounded-full flex items-center justify-center text-white flex-shrink-0"
      style={{ width: size, height: size, backgroundColor: event.color || timelineColor }}
      aria-hidden="true"
    >
      {event.icon && <span className="material-symbols-outlined text-sm">{iconMap[event.icon] || 'event'}</span>}
    </div>
  );

  const content = (event: TimelineEvent, align: 'left' | 'right' | 'center' = 'left') => (
    <div style={{ textAlign: align }}>
      <div className="text-sm text-gray-600 mb-1">{formatDate(event.date)}</div>
      <div className="font-semibold text-lg mb-1">{event.title}</div>
      {event.description && <div className="text-sm text-gray-700">{event.description}</div>}
    </div>
  );

  if (style === 'horizontal') {
    return (
      <div className="relative py-8">
        <div className="absolute left-0 right-0 h-1" style={{ top: 'calc(2rem + 14px)', backgroundColor: timelineColor }} aria-hidden="true" />
        <ol className="relative flex justify-between gap-4 list-none p-0 m-0">
          {sortedEvents.map((event, index) => (
            <li key={index} className="flex flex-col items-center gap-2" style={{ flex: '1 1 0' }}>
              {marker(event, 32)}
              {content(event, 'center')}
            </li>
          ))}
        </ol>
      </div>
    );
  }

  if (style === 'zigzag') {
    return (
      <div className="relative py-8">
        <div className="absolute top-0 bottom-0 w-1" style={{ left: '50%', transform: 'translateX(-50%)', backgroundColor: timelineColor }} aria-hidden="true" />
        <ol className="relative list-none p-0 m-0">
        {sortedEvents.map((event, index) => {
          const onRight = event.position === 'right';
          return (
            <li
              key={index}
              className="relative flex items-start gap-4"
              style={{ marginBottom: index < sortedEvents.length - 1 ? \`\${spacing}px\` : 0 }}
            >
              <div style={{ flex: 1 }}>{!onRight && content(event, 'right')}</div>
              {marker(event, 48)}
              <div style={{ flex: 1 }}>{onRight && content(event, 'left')}</div>
            </li>
          );
        })}
        </ol>
      </div>
    );
  }

  return (
    <ol className="list-none p-0 m-0">
      {sortedEvents.map((event, index) => (
        <li key={index} className="flex gap-4" style={{ marginBottom: index < sortedEvents.length - 1 ? \`\${spacing}px\` : 0 }}>
          <div className="flex flex-col items-center">
            {marker(event, 48)}
            {index < sortedEvents.length - 1 && (
              <div className="flex-1 w-0.5 my-2" style={{ backgroundColor: timelineColor }} aria-hidden="true"></div>
            )}
          </div>
          <div className="flex-1 pb-4">{content(event)}</div>
        </li>
      ))}
    </ol>
  );
};`;
  } else if (format === 'vue') {
    const templateTag = String.fromCharCode(60) + 'template' + String.fromCharCode(62);
    const templateCloseTag = String.fromCharCode(60) + '/' + 'template' + String.fromCharCode(62);
    const scriptSetupTag = String.fromCharCode(60) + 'script setup' + String.fromCharCode(62);
    const scriptClose = String.fromCharCode(60) + '/' + 'script' + String.fromCharCode(62);
    
    return templateTag + `
  <!-- Vertical -->
  <ol v-if="style === 'vertical'" class="list-none p-0 m-0">
    <li
      v-for="(event, index) in sortedEvents"
      :key="index"
      class="flex gap-4"
      :style="{ marginBottom: index < sortedEvents.length - 1 ? spacing + 'px' : 0 }"
    >
      <div class="flex flex-col items-center">
        <div
          class="rounded-full flex items-center justify-center text-white flex-shrink-0"
          :style="{ width: '48px', height: '48px', backgroundColor: event.color || timelineColor }"
          aria-hidden="true"
        >
          <span v-if="event.icon" class="material-symbols-outlined text-sm">{{ event.icon }}</span>
        </div>
        <div
          v-if="index < sortedEvents.length - 1"
          class="flex-1 w-0.5 my-2"
          :style="{ backgroundColor: timelineColor }"
          aria-hidden="true"
        ></div>
      </div>
      <div class="flex-1 pb-4">
        <div class="text-sm text-gray-600 mb-1">{{ formatDate(event.date) }}</div>
        <div class="font-semibold text-lg mb-1">{{ event.title }}</div>
        <div v-if="event.description" class="text-sm text-gray-700">{{ event.description }}</div>
      </div>
    </li>
  </ol>

  <!-- Horizontal -->
  <div v-else-if="style === 'horizontal'" class="relative py-8">
    <div
      class="absolute left-0 right-0 h-1"
      :style="{ top: 'calc(2rem + 14px)', backgroundColor: timelineColor }"
      aria-hidden="true"
    ></div>
    <ol class="relative flex justify-between gap-4 list-none p-0 m-0">
    <li
      v-for="(event, index) in sortedEvents"
      :key="index"
      class="relative flex flex-col items-center gap-2 text-center"
      style="flex: 1 1 0"
    >
      <div
        class="rounded-full flex items-center justify-center text-white"
        :style="{ width: '32px', height: '32px', backgroundColor: event.color || timelineColor }"
        aria-hidden="true"
      >
        <span v-if="event.icon" class="material-symbols-outlined text-xs">{{ event.icon }}</span>
      </div>
      <div class="text-xs text-gray-600">{{ formatDate(event.date) }}</div>
      <div class="font-semibold text-sm">{{ event.title }}</div>
      <div v-if="event.description" class="text-xs text-gray-700">{{ event.description }}</div>
    </li>
    </ol>
  </div>

  <!-- Zigzag -->
  <div v-else class="relative py-8">
    <div
      class="absolute top-0 bottom-0 w-1"
      :style="{ left: '50%', transform: 'translateX(-50%)', backgroundColor: timelineColor }"
      aria-hidden="true"
    ></div>
    <ol class="relative list-none p-0 m-0">
    <li
      v-for="(event, index) in sortedEvents"
      :key="index"
      class="relative flex items-start gap-4"
      :style="{ marginBottom: index < sortedEvents.length - 1 ? spacing + 'px' : 0 }"
    >
      <div class="flex-1 text-right">
        <template v-if="event.position !== 'right'">
          <div class="text-sm text-gray-600 mb-1">{{ formatDate(event.date) }}</div>
          <div class="font-semibold mb-1">{{ event.title }}</div>
          <div v-if="event.description" class="text-sm text-gray-700">{{ event.description }}</div>
        </template>
      </div>
      <div
        class="rounded-full flex items-center justify-center text-white flex-shrink-0"
        :style="{ width: '48px', height: '48px', backgroundColor: event.color || timelineColor }"
        aria-hidden="true"
      >
        <span v-if="event.icon" class="material-symbols-outlined text-sm">{{ event.icon }}</span>
      </div>
      <div class="flex-1">
        <template v-if="event.position === 'right'">
          <div class="text-sm text-gray-600 mb-1">{{ formatDate(event.date) }}</div>
          <div class="font-semibold mb-1">{{ event.title }}</div>
          <div v-if="event.description" class="text-sm text-gray-700">{{ event.description }}</div>
        </template>
      </div>
    </li>
    </ol>
  </div>
` + templateCloseTag + `

` + scriptSetupTag + `
import { computed } from 'vue';

const props = defineProps({
  events: {
    type: Array,
    default: () => ${scriptSafeJson(eventsData, 4)}
  },
  style: {
    type: String,
    default: ${style}
  },
  timelineColor: {
    type: String,
    default: ${timelineColor}
  },
  dateFormat: {
    type: String,
    default: ${dateFormat}
  },
  spacing: {
    type: Number,
    default: ${spacing}
  }
});

const DATE_FORMATS = {
  short: { month: 'numeric', day: 'numeric', year: 'numeric' },
  medium: { month: 'short', day: 'numeric', year: 'numeric' },
  long: { month: 'long', day: 'numeric', year: 'numeric' },
  full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
};

// YYYY-MM-DD is parsed as local time (new Date('2024-01-01') would be UTC).
const parseDate = (dateString) => {
  const match = /^(\\d{4})-(\\d{2})-(\\d{2})$/.exec(dateString || '');
  const date = match ? new Date(+match[1], +match[2] - 1, +match[3]) : new Date(dateString);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (dateString) => {
  const date = parseDate(dateString);
  return date ? date.toLocaleDateString('en-US', DATE_FORMATS[props.dateFormat] || DATE_FORMATS.medium) : dateString;
};

const sortedEvents = computed(() =>
  [...props.events].sort(
    (a, b) => (parseDate(a.date)?.getTime() ?? Infinity) - (parseDate(b.date)?.getTime() ?? Infinity)
  )
);
` + scriptClose;
  } else {
    // SVG export (static, self-contained; text is XML-escaped)
    return generateSvg(eventsData, config, formatDate);
  }
}
