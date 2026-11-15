// Framework-free pieces of the Breakpoint Overlay, kept here so they can be
// tested without mounting the component.

export const DEFAULT_HOTKEY = 'alt+shift+o';
export const DEFAULT_DEBOUNCE_MS = 150;

/** Tailwind's default breakpoints, used when none are given */
export function defaultBreakpoints() {
  return [
    { id: 'sm', label: 'Small', minWidth: 640 },
    { id: 'md', label: 'Medium', minWidth: 768 },
    { id: 'lg', label: 'Large', minWidth: 1024 },
    { id: 'xl', label: 'Extra Large', minWidth: 1280 },
    { id: '2xl', label: '2X Large', minWidth: 1536 },
  ];
}

/** Min-width only: width >= minWidth. Max-width only: width <= maxWidth. Both: within the range */
export function isBreakpointActive(breakpoint, width) {
  const { minWidth, maxWidth } = breakpoint;
  if (minWidth !== undefined && maxWidth !== undefined) return width >= minWidth && width <= maxWidth;
  if (minWidth !== undefined) return width >= minWidth;
  if (maxWidth !== undefined) return width <= maxWidth;
  return false;
}

export function formatBreakpointRange(breakpoint) {
  const { minWidth, maxWidth } = breakpoint;
  if (minWidth !== undefined && maxWidth !== undefined) return `${minWidth}px - ${maxWidth}px`;
  if (minWidth !== undefined) return `≥ ${minWidth}px`;
  if (maxWidth !== undefined) return `≤ ${maxWidth}px`;
  return 'All sizes';
}

/** The CSS media query a breakpoint stands for, e.g. `@media (min-width: 768px)` */
export function mediaQueryFor(breakpoint) {
  const parts = [];
  if (breakpoint.minWidth !== undefined) parts.push(`(min-width: ${breakpoint.minWidth}px)`);
  if (breakpoint.maxWidth !== undefined) parts.push(`(max-width: ${breakpoint.maxWidth}px)`);
  return parts.length ? `@media ${parts.join(' and ')}` : '@media all';
}

/** `alt+shift+o` → `{ modifiers: { alt, ctrl, shift, meta }, key: 'o' }`; null for an empty hotkey (disabled) */
export function parseHotkey(hotkey) {
  if (!hotkey || !hotkey.trim()) return null;
  const modifiers = { alt: false, ctrl: false, shift: false, meta: false };
  let key = '';
  for (const part of hotkey.toLowerCase().split('+').map((s) => s.trim())) {
    if (part === 'alt') modifiers.alt = true;
    else if (part === 'ctrl' || part === 'control') modifiers.ctrl = true;
    else if (part === 'shift') modifiers.shift = true;
    else if (part === 'meta' || part === 'cmd' || part === 'command') modifiers.meta = true;
    else key = part;
  }
  return { modifiers, key };
}

/**
 * Whether a keydown matches the parsed hotkey. Modifiers must match exactly. The key is compared
 * with `event.key` and, for letters and digits, `event.code` (Alt+Shift+O types "Ø" on a Mac, but
 * its code is still KeyO).
 */
export function matchesHotkey(event, parsed) {
  if (!parsed || !parsed.key) return false;
  const { modifiers, key } = parsed;
  const modifiersMatch =
    event.altKey === modifiers.alt &&
    event.ctrlKey === modifiers.ctrl &&
    event.shiftKey === modifiers.shift &&
    event.metaKey === modifiers.meta;
  if (!modifiersMatch) return false;
  const code = String(event.code || '').toLowerCase();
  return String(event.key || '').toLowerCase() === key || code === `key${key}` || code === `digit${key}`;
}

/** Typing in a field never toggles the overlay */
export function isEditableTarget(target) {
  if (!target) return false;
  const tagName = target.tagName?.toLowerCase();
  return tagName === 'input' || tagName === 'textarea' || tagName === 'select' || target.isContentEditable === true || target.contentEditable === 'true';
}

/**
 * Options for `initBreakpointOverlay` from the `data-*` attributes of an auto-init script tag.
 * An attribute that is present is used as given, so `data-hotkey=""` disables the shortcut.
 */
export function autoInitOptions(script) {
  const options = {};
  const breakpoints = script.getAttribute('data-breakpoints');
  if (breakpoints) {
    try {
      options.breakpoints = JSON.parse(breakpoints);
    } catch (e) {
      console.warn('Failed to parse data-breakpoints attribute:', e);
    }
  }
  if (script.hasAttribute('data-hotkey')) options.hotkey = script.getAttribute('data-hotkey');
  const debounce = Number.parseInt(script.getAttribute('data-debounce-ms') ?? '', 10);
  if (Number.isFinite(debounce) && debounce >= 0) options.debounceMs = debounce;
  return options;
}
